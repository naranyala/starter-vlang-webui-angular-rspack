/**
 * Card Component
 * Reusable card container with consistent styling
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.card-compact]="compact" [class.card-elevated]="elevated">
      @if (title || headerTemplate) {
        <div class="card-header">
          <ng-content select="[card-header]"></ng-content>
          @if (!headerTemplate && title) {
            <h3 class="card-title">{{ title }}</h3>
          }
          @if (headerTemplate) {
            <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
          }
        </div>
      }
      <div class="card-content">
        <ng-content></ng-content>
      </div>
      @if (footerTemplate || actions) {
        <div class="card-footer">
          <ng-content select="[card-footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .card-elevated {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .card-elevated:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }

    .card-compact {
      padding: 0;
    }

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(15, 23, 42, 0.3);
    }

    .card-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #fff;
    }

    .card-content {
      padding: 20px;
    }

    .card-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(15, 23, 42, 0.2);
    }
  `]
})
export class CardComponent {
  @Input() title = '';
  @Input() compact = false;
  @Input() elevated = false;
  @Input() headerTemplate: any = null;
  @Input() footerTemplate: any = null;
}

/**
 * Stat Card Component
 * Display statistics with icon and value
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [class]="'stat-' + variant">
      <div class="stat-icon">{{ icon }}</div>
      <div class="stat-content">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .stat-icon {
      font-size: 40px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .stat-primary .stat-icon { background: rgba(59, 130, 246, 0.2); }
    .stat-success .stat-icon { background: rgba(16, 185, 129, 0.2); }
    .stat-warning .stat-icon { background: rgba(245, 158, 11, 0.2); }
    .stat-info .stat-icon { background: rgba(6, 182, 212, 0.2); }
    .stat-danger .stat-icon { background: rgba(239, 68, 68, 0.2); }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
    }

    .stat-label {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `]
})
export class StatCardComponent {
  @Input() icon = '📊';
  @Input() value: string | number = 0;
  @Input() label = '';
  @Input() variant: 'primary' | 'success' | 'warning' | 'info' | 'danger' = 'primary';
}

/**
 * Badge Component
 * Display status or category badges
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="'badge-' + variant" [class.badge-pill]="pill">
      {{ label }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .badge-pill {
      border-radius: 12px;
      padding: 4px 12px;
    }

    .badge-primary { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .badge-warning { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .badge-info { background: rgba(6, 182, 212, 0.2); color: #06b6d4; }
    .badge-danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .badge-neutral { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }
  `]
})
export class BadgeComponent {
  @Input() label = '';
  @Input() variant: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'neutral' = 'neutral';
  @Input() pill = false;
}

/**
 * Button Component
 * Reusable button with variants
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="btn"
      [class]="'btn-' + variant"
      [class.btn-sm]="size === 'sm'"
      [class.btn-lg]="size === 'lg'"
      [class.btn-icon]="iconOnly"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)"
    >
      @if (loading) {
        <span class="btn-loading">⏳</span>
      } @else if (icon) {
        <span class="btn-icon-content">{{ icon }}</span>
      }
      <span class="btn-label"><ng-content></ng-content></span>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.85rem;
    }

    .btn-lg {
      padding: 14px 24px;
      font-size: 1rem;
    }

    .btn-icon {
      width: 40px;
      height: 40px;
      padding: 0;
      border-radius: 50%;
    }

    .btn-primary {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
    }

    .btn-secondary {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(59, 130, 246, 0.3);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #fff;
    }

    .btn-ghost {
      background: transparent;
      color: #94a3b8;
    }

    .btn-ghost:hover:not(:disabled) {
      background: rgba(148, 163, 184, 0.1);
      color: #fff;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() icon = '';
  @Input() iconOnly = false;
  @Input() disabled = false;
  @Input() loading = false;
  onClick = new EventEmitter<MouseEvent>();
}

/**
 * Empty State Component
 * Display when no data is available
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-icon">{{ icon }}</div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      @if (actionText) {
        <button class="empty-action" (click)="action.emit()">
          {{ actionText }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .empty-title {
      margin: 0 0 8px;
      font-size: 1.25rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .empty-description {
      margin: 0 0 24px;
      font-size: 0.95rem;
      color: #94a3b8;
      max-width: 400px;
    }

    .empty-action {
      padding: 12px 24px;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .empty-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'No Data';
  @Input() description = '';
  @Input() actionText = '';
  action = new EventEmitter<void>();
}
