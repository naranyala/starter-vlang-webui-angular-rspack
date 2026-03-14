import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getLogger } from '../../viewmodels/logger.viewmodel';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-container">
        <!-- Header -->
        <div class="auth-header">
          <div class="auth-logo">
            <span class="logo-icon">A</span>
          </div>
          <h1 class="auth-title">Angular Demo</h1>
          <p class="auth-subtitle">Secure Authentication Portal</p>
        </div>

        <!-- Tab Switcher -->
        <div class="auth-tabs">
          <button
            type="button"
            class="auth-tab"
            [class.active]="isLoginMode()"
            (click)="switchToLogin()">
            <span class="tab-icon">🔑</span>
            <span class="tab-label">Login</span>
          </button>
          <button
            type="button"
            class="auth-tab"
            [class.active]="!isLoginMode()"
            (click)="switchToRegister()">
            <span class="tab-icon">📝</span>
            <span class="tab-label">Register</span>
          </button>
        </div>

        <!-- Login Form -->
        @if (isLoginMode()) {
          <form class="auth-form" (ngSubmit)="handleLogin()">
            <div class="form-group">
              <label class="form-label" for="login-username">
                <span class="label-icon">👤</span>
                Username
              </label>
              <input
                type="text"
                id="login-username"
                class="form-input"
                placeholder="Enter your username"
                [(ngModel)]="loginUsername"
                required
                autocomplete="username" />
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">
                <span class="label-icon">🔒</span>
                Password
              </label>
              <div class="password-input-wrapper">
                <input
                  [type]="showLoginPassword() ? 'text' : 'password'"
                  id="login-password"
                  class="form-input"
                  placeholder="Enter your password"
                  [(ngModel)]="loginPassword"
                  required
                  autocomplete="current-password" />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="toggleLoginPassword()"
                  title="{{ showLoginPassword() ? 'Hide' : 'Show' }} password">
                  {{ showLoginPassword() ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="rememberMe" />
                <span>Remember me</span>
              </label>
              <a href="#" class="forgot-link" (click)="forgotPassword($event)">Forgot password?</a>
            </div>

            @if (loginError()) {
              <div class="form-error">
                <span class="error-icon">⚠️</span>
                {{ loginError() }}
              </div>
            }

            <button type="submit" class="btn-primary" [disabled]="loginLoading()">
              @if (loginLoading()) {
                <span class="spinner"></span>
                <span>Signing in...</span>
              } @else {
                <span>Sign In</span>
                <span class="btn-arrow">→</span>
              }
            </button>
          </form>
        }

        <!-- Register Form -->
        @if (!isLoginMode()) {
          <form class="auth-form" (ngSubmit)="handleRegister()">
            <div class="form-group">
              <label class="form-label" for="register-username">
                <span class="label-icon">👤</span>
                Username
              </label>
              <input
                type="text"
                id="register-username"
                class="form-input"
                placeholder="Choose a username"
                [(ngModel)]="registerUsername"
                required
                autocomplete="username" />
            </div>

            <div class="form-group">
              <label class="form-label" for="register-email">
                <span class="label-icon">📧</span>
                Email
              </label>
              <input
                type="email"
                id="register-email"
                class="form-input"
                placeholder="Enter your email"
                [(ngModel)]="registerEmail"
                required
                autocomplete="email" />
            </div>

            <div class="form-group">
              <label class="form-label" for="register-password">
                <span class="label-icon">🔒</span>
                Password
              </label>
              <div class="password-input-wrapper">
                <input
                  [type]="showRegisterPassword() ? 'text' : 'password'"
                  id="register-password"
                  class="form-input"
                  placeholder="Create a strong password"
                  [(ngModel)]="registerPassword"
                  required
                  autocomplete="new-password" />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="toggleRegisterPassword()"
                  title="{{ showRegisterPassword() ? 'Hide' : 'Show' }} password">
                  {{ showRegisterPassword() ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              @if (passwordStrength()) {
                <div class="password-strength strength-{{ passwordStrength() }}">
                  <div class="strength-bar strength-{{ passwordStrength() }}"></div>
                  <span class="strength-label">{{ passwordStrengthLabel() }}</span>
                </div>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="register-confirm">
                <span class="label-icon">🔒</span>
                Confirm Password
              </label>
              <input
                type="password"
                id="register-confirm"
                class="form-input"
                placeholder="Confirm your password"
                [(ngModel)]="registerConfirmPassword"
                required
                autocomplete="new-password" />
              @if (passwordMismatch()) {
                <span class="field-error">⚠️ Passwords do not match</span>
              }
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="agreeTerms" required />
                <span>I agree to the <a href="#" (click)="showTerms($event)">Terms of Service</a></span>
              </label>
            </div>

            @if (registerError()) {
              <div class="form-error">
                <span class="error-icon">⚠️</span>
                {{ registerError() }}
              </div>
            }

            @if (registerSuccess()) {
              <div class="form-success">
                <span class="success-icon">✅</span>
                {{ registerSuccess() }}
              </div>
            }

            <button type="submit" class="btn-primary" [disabled]="registerLoading() || passwordMismatch()">
              @if (registerLoading()) {
                <span class="spinner"></span>
                <span>Creating account...</span>
              } @else {
                <span>Create Account</span>
                <span class="btn-arrow">→</span>
              }
            </button>
          </form>
        }

        <!-- Footer -->
        <div class="auth-footer">
          <p class="footer-text">
            Protected by secure authentication
          </p>
          <div class="footer-links">
            <a href="#" (click)="showPrivacy($event)">Privacy Policy</a>
            <span class="footer-separator">•</span>
            <a href="#" (click)="showTerms($event)">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      padding: 20px;
      box-sizing: border-box;
    }

    .auth-container {
      width: 100%;
      max-width: 420px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 40px 30px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .auth-logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }

    .logo-icon {
      font-size: 36px;
      font-weight: bold;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .auth-title {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 8px 0;
    }

    .auth-subtitle {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .auth-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      background: #f0f0f5;
      padding: 5px;
      border-radius: 12px;
    }

    .auth-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: #666;
      transition: all 0.3s ease;
    }

    .auth-tab.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .auth-tab:hover:not(.active) {
      background: #e0e0e8;
    }

    .tab-icon {
      font-size: 16px;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .label-icon {
      font-size: 14px;
    }

    .form-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e0e0e8;
      border-radius: 12px;
      font-size: 15px;
      transition: all 0.3s ease;
      box-sizing: border-box;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .form-input::placeholder {
      color: #aaa;
    }

    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .password-toggle:hover {
      opacity: 1;
    }

    .password-strength {
      margin-top: 8px;
    }

    .strength-bar {
      height: 4px;
      border-radius: 2px;
      transition: all 0.3s ease;
      margin-bottom: 4px;
    }

    .strength-bar.weak {
      width: 33%;
      background: #ef4444;
    }

    .strength-bar.medium {
      width: 66%;
      background: #f59e0b;
    }

    .strength-bar.strong {
      width: 100%;
      background: #10b981;
    }

    .strength-label {
      font-size: 12px;
      color: #666;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #666;
    }

    .checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .forgot-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      color: #dc2626;
      font-size: 14px;
    }

    .form-success {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      color: #16a34a;
      font-size: 14px;
    }

    .field-error {
      font-size: 12px;
      color: #dc2626;
      margin-top: 4px;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-arrow {
      font-size: 18px;
      transition: transform 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) .btn-arrow {
      transform: translateX(4px);
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      margin-top: 30px;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e0e0e8;
    }

    .footer-text {
      font-size: 12px;
      color: #999;
      margin: 0 0 12px 0;
    }

    .footer-links {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 12px;
    }

    .footer-links a {
      color: #667eea;
      text-decoration: none;
    }

    .footer-links a:hover {
      text-decoration: underline;
    }

    .footer-separator {
      color: #ccc;
    }
  `],
})
export class AuthComponent {
  private readonly logger = getLogger('auth.component');

  // Mode
  isLoginMode = signal(true);

  // Login state
  loginUsername = signal('');
  loginPassword = signal('');
  rememberMe = signal(false);
  showLoginPassword = signal(false);
  loginLoading = signal(false);
  loginError = signal<string | null>(null);

  // Register state
  registerUsername = signal('');
  registerEmail = signal('');
  registerPassword = signal('');
  registerConfirmPassword = signal('');
  agreeTerms = signal(false);
  showRegisterPassword = signal(false);
  registerLoading = signal(false);
  registerError = signal<string | null>(null);
  registerSuccess = signal<string | null>(null);

  // Computed
  passwordStrength = computed(() => {
    const password = this.registerPassword();
    if (!password) return null;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  });

  passwordStrengthLabel = computed(() => {
    const strength = this.passwordStrength();
    if (strength === 'weak') return 'Weak password';
    if (strength === 'medium') return 'Medium strength';
    if (strength === 'strong') return 'Strong password';
    return '';
  });

  passwordMismatch = computed(() => {
    const password = this.registerPassword();
    const confirm = this.registerConfirmPassword();
    return password && confirm && password !== confirm;
  });

  switchToLogin(): void {
    this.isLoginMode.set(true);
    this.loginError.set(null);
    this.registerError.set(null);
    this.registerSuccess.set(null);
  }

  switchToRegister(): void {
    this.isLoginMode.set(false);
    this.loginError.set(null);
    this.registerError.set(null);
    this.registerSuccess.set(null);
  }

  toggleLoginPassword(): void {
    this.showLoginPassword.update(v => !v);
  }

  toggleRegisterPassword(): void {
    this.showRegisterPassword.update(v => !v);
  }

  handleLogin(): void {
    this.loginLoading.set(true);
    this.loginError.set(null);

    this.logger.info('Login attempt', {
      username: this.loginUsername(),
      rememberMe: this.rememberMe(),
    });

    // Simulate API call
    setTimeout(() => {
      this.loginLoading.set(false);
      // For demo, always succeed
      this.logger.info('Login successful');
    }, 1500);
  }

  handleRegister(): void {
    if (this.passwordMismatch()) {
      this.registerError.set('Passwords do not match');
      return;
    }

    if (!this.agreeTerms()) {
      this.registerError.set('You must agree to the Terms of Service');
      return;
    }

    this.registerLoading.set(true);
    this.registerError.set(null);
    this.registerSuccess.set(null);

    this.logger.info('Registration attempt', {
      username: this.registerUsername(),
      email: this.registerEmail(),
    });

    // Simulate API call
    setTimeout(() => {
      this.registerLoading.set(false);
      this.registerSuccess.set('Account created successfully! Redirecting to login...');
      this.logger.info('Registration successful');

      // Switch to login after success
      setTimeout(() => {
        this.switchToLogin();
        this.registerSuccess.set(null);
      }, 2000);
    }, 1500);
  }

  forgotPassword(event: Event): void {
    event.preventDefault();
    this.logger.info('Forgot password clicked');
    alert('Password reset functionality would be implemented here.');
  }

  showTerms(event: Event): void {
    event.preventDefault();
    this.logger.info('Terms of Service clicked');
    alert('Terms of Service would be displayed here.');
  }

  showPrivacy(event: Event): void {
    event.preventDefault();
    this.logger.info('Privacy Policy clicked');
    alert('Privacy Policy would be displayed here.');
  }
}
