/**
 * Authentication Service
 * Handles user authentication, sessions, and CSRF tokens
 */

import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';

export interface Session {
  token: string;
  user_id: number;
  username: string;
  role: 'user' | 'admin' | 'moderator';
  created_at: number;
  expires_at: number;
  ip_address: string;
  user_agent: string;
}

export interface AuthStats {
  total_users: number;
  active_users: number;
  active_sessions: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionKey = 'auth_session';
  private readonly csrfTokenKey = 'auth_csrf_token';

  private readonly sessionDuration = 24 * 60 * 60 * 1000; // 24 hours

  currentUser = signal<Session | null>(null);
  isAuthenticated = signal(false);
  csrfToken = signal<string | null>(null);
  isLoading = signal(false);

  constructor(
    private readonly api: ApiService,
    private readonly logger: LoggerService,
    private readonly notification: NotificationService
  ) {
    this.loadSession();
  }

  /**
   * Load session from localStorage
   */
  private loadSession(): void {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      const csrfData = localStorage.getItem(this.csrfTokenKey);

      if (sessionData) {
        const session = JSON.parse(sessionData) as Session;
        
        // Check if session is expired
        if (Date.now() < session.expires_at) {
          this.currentUser.set(session);
          this.isAuthenticated.set(true);
          this.logger.info('Session restored', { username: session.username });
        } else {
          this.clearSession();
        }
      }

      if (csrfData) {
        this.csrfToken.set(csrfData);
      }
    } catch (error) {
      this.logger.error('Failed to load session', error);
      this.clearSession();
    }
  }

  /**
   * Save session to localStorage
   */
  private saveSession(session: Session, csrfToken: string): void {
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      localStorage.setItem(this.csrfTokenKey, csrfToken);
      this.currentUser.set(session);
      this.isAuthenticated.set(true);
      this.csrfToken.set(csrfToken);
    } catch (error) {
      this.logger.error('Failed to save session', error);
    }
  }

  /**
   * Clear session from localStorage
   */
  private clearSession(): void {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.csrfTokenKey);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.csrfToken.set(null);
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<Session> {
    this.isLoading.set(true);
    try {
      const response = await this.api.call<Session & { message?: string }>('auth.login', {
        username,
        password
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const session = response.data;

      // Get CSRF token after successful login
      const csrfResponse = await this.api.call<string>('auth.getCSRFToken', {
        sessionToken: session.token
      });

      const csrfToken = csrfResponse.data || '';

      // Save session
      this.saveSession(session, csrfToken);

      this.logger.info('Login successful', { username, userId: session.user_id });
      this.notification.success(`Welcome back, ${session.username}!`);

      return session;
    } catch (error: any) {
      this.logger.error('Login failed', error);
      this.notification.error(error.message || 'Login failed');
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    this.isLoading.set(true);
    try {
      const session = this.currentUser();
      
      if (session) {
        await this.api.call('auth.logout', { token: session.token });
        this.logger.info('Logout successful', { username: session.username });
      }

      this.clearSession();
      this.notification.success('Logged out successfully');
    } catch (error: any) {
      this.logger.error('Logout failed', error);
      // Still clear session even if API call fails
      this.clearSession();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Register new user
   */
  async register(username: string, email: string, password: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.api.call('auth.register', {
        username,
        email,
        password
      });

      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }

      this.notification.success('Registration successful! Please login.');
    } catch (error: any) {
      this.logger.error('Registration failed', error);
      this.notification.error(error.message || 'Registration failed');
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<boolean> {
    const session = this.currentUser();
    
    if (!session) {
      return false;
    }

    try {
      const response = await this.api.call<Session>('auth.validateSession', {
        token: session.token
      });

      if (response.success && response.data) {
        // Update session
        this.currentUser.set(response.data);
        localStorage.setItem(this.sessionKey, JSON.stringify(response.data));
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Session validation failed', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Get current CSRF token
   */
  getCSRFToken(): string | null {
    return this.csrfToken();
  }

  /**
   * Get current username
   */
  getUsername(): string {
    return this.currentUser()?.username || '';
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  /**
   * Get auth statistics
   */
  async getStats(): Promise<AuthStats> {
    try {
      const response = await this.api.call<AuthStats>('auth.getStats');
      return response.data || { total_users: 0, active_users: 0, active_sessions: 0 };
    } catch (error) {
      this.logger.error('Failed to get auth stats', error);
      return { total_users: 0, active_users: 0, active_sessions: 0 };
    }
  }

  /**
   * Auto-logout if session is about to expire
   */
  checkSessionExpiry(): void {
    const session = this.currentUser();
    
    if (!session) {
      return;
    }

    const timeUntilExpiry = session.expires_at - Date.now();
    const warningThreshold = 5 * 60 * 1000; // 5 minutes

    if (timeUntilExpiry > 0 && timeUntilExpiry < warningThreshold) {
      this.notification.warning('Your session is about to expire');
    }

    if (timeUntilExpiry <= 0) {
      this.notification.info('Session expired. Please login again.');
      this.clearSession();
    }
  }
}
