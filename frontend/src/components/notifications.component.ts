/**
 * Notification Container Component
 * Displays toast notifications
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../core/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notif of notificationService.notifications(); track notif.id) {
        <div class="notification" [class]="'notification-' + notif.type">
          <span class="notification-icon">{{ getIcon(notif.type) }}</span>
          <span class="notification-message">{{ notif.message }}</span>
          <button class="notification-close" (click)="dismiss(notif.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: rgba(15, 23, 42, 0.98);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .notification-error {
      border-color: rgba(239, 68, 68, 0.3);
    }

    .notification-warning {
      border-color: rgba(245, 158, 11, 0.3);
    }

    .notification-info {
      border-color: rgba(59, 130, 246, 0.3);
    }

    .notification-icon {
      font-size: 1.25rem;
    }

    .notification-message {
      flex: 1;
      color: #e2e8f0;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .notification-close {
      padding: 4px;
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .notification-close:hover {
      background: rgba(148, 163, 184, 0.1);
      color: #fff;
    }
  `]
})
export class NotificationsComponent {
  readonly notificationService = inject(NotificationService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
