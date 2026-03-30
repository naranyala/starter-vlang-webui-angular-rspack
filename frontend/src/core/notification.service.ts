/**
 * Notification Service
 * Provides toast notifications for user feedback
 */

import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly defaultDuration = 4000;

  notifications = signal<Notification[]>([]);

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show a notification
   */
  show(type: Notification['type'], message: string, duration: number = this.defaultDuration): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration
    };

    this.notifications.update(notifs => [...notifs, notification]);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, duration);
    }
  }

  /**
   * Show success notification
   */
  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  /**
   * Show error notification
   */
  error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  /**
   * Show info notification
   */
  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  /**
   * Show warning notification
   */
  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  /**
   * Dismiss a notification
   */
  dismiss(id: string): void {
    this.notifications.update(notifs => notifs.filter(n => n.id !== id));
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notifications.set([]);
  }
}
