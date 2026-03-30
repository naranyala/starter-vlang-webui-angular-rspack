/**
 * Login Component
 * User authentication form
 */

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-icon">🔐</div>
          <h1 class="login-title">Sign In</h1>
          <p class="login-subtitle">Enter your credentials to access the application</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="form-label" for="username">
              <span class="label-icon">👤</span>
              Username
            </label>
            <input
              id="username"
              type="text"
              class="form-input"
              [(ngModel)]="username"
              name="username"
              required
              placeholder="Enter your username"
              [disabled]="isLoading()"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">
              <span class="label-icon">🔑</span>
              Password
            </label>
            <input
              id="password"
              type="password"
              class="form-input"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="Enter your password"
              [disabled]="isLoading()"
            />
          </div>

          @if (error()) {
            <div class="error-message">
              <span class="error-icon">⚠️</span>
              {{ error() }}
            </div>
          }

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="isLoading() || !username || !password"
            >
              @if (isLoading()) {
                <span class="btn-spinner"></span>
              }
              {{ isLoading() ? 'Signing in...' : 'Sign In' }}
            </button>
          </div>
        </form>

        <div class="login-footer">
          <div class="demo-credentials">
            <p class="demo-title">Demo Credentials:</p>
            <div class="demo-info">
              <span class="demo-label">Admin:</span>
              <code>admin / admin123</code>
            </div>
            <div class="demo-info">
              <span class="demo-label">User:</span>
              <code>user / user123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: rgba(15, 23, 42, 0.98);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .login-title {
      margin: 0 0 8px;
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
    }

    .login-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: #94a3b8;
    }

    .login-form {
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
      gap: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      color: #e2e8f0;
    }

    .label-icon {
      font-size: 1rem;
    }

    .form-input {
      padding: 12px 14px;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 10px;
      background: rgba(30, 41, 59, 0.8);
      color: #fff;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.5);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 10px;
      color: #ef4444;
      font-size: 0.9rem;
    }

    .error-icon {
      font-size: 1rem;
    }

    .form-actions {
      margin-top: 8px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-block {
      width: 100%;
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }

    .demo-credentials {
      text-align: center;
    }

    .demo-title {
      margin: 0 0 12px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .demo-info {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .demo-label {
      color: #94a3b8;
      font-weight: 500;
    }

    .demo-info code {
      padding: 4px 10px;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 6px;
      color: #60a5fa;
      font-family: 'Fira Code', monospace;
      font-size: 0.85rem;
    }
  `]
})
export class LoginComponent {
  private readonly auth = inject(AuthService);

  username = signal('');
  password = signal('');
  error = signal('');
  isLoading = this.auth.isLoading;

  async onSubmit(): Promise<void> {
    this.error.set('');

    try {
      await this.auth.login(this.username(), this.password());
    } catch (err: any) {
      this.error.set(err.message || 'Invalid credentials');
    }
  }
}
