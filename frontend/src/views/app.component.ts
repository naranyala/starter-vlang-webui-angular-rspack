import { CommonModule } from '@angular/common';
import { Component, computed, inject, type OnDestroy, type OnInit, signal } from '@angular/core';
import { type WinBoxInstance, WinBoxService } from '../core/winbox.service';
import { type BottomPanelTab, type Card, TECH_CARDS, type WindowEntry } from '../models';
import { EventBusViewModel } from '../viewmodels/event-bus.viewmodel';
import { getLogger } from '../viewmodels/logger.viewmodel';
import { WindowStateViewModel } from '../viewmodels/window-state.viewmodel';
import { AuthComponent } from './auth/auth.component';
import { SqliteCrudComponent } from './sqlite/sqlite.component';

// Import styles with null guards
const styles: string = (require('./app.component.css?raw') as string) || '';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AuthComponent, SqliteCrudComponent],
  template: require('./app.component.html?raw') as string,
  styles: [styles],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly winboxService = inject(WinBoxService);
  private readonly logger = getLogger('app.component');
  private readonly eventBus: EventBusViewModel<Record<string, unknown>>;
  private readonly windowState: WindowStateViewModel;

  topCollapsed = signal(false);
  bottomCollapsed = signal(true);
  activeCard = signal<1 | 2>(1);
  windowEntries = signal<WindowEntry[]>([]);

  bottomPanelTabs: BottomPanelTab[] = [
    { id: 'info', label: 'Info', icon: 'ℹ', content: 'Application info' },
  ];

  private existingBoxes: WinBoxInstance[] = [];
  private authWindowId = 'auth-window-1';
  private sqliteWindowId = 'sqlite-window-2';
  private resizeHandler: (() => void) | null = null;

  cards: Card[] = TECH_CARDS;

  hasFocusedWindow = computed(() => {
    return this.windowEntries().some(entry => entry.focused);
  });

  constructor() {
    const debugWindow = window as unknown as {
      __FRONTEND_EVENT_BUS__?: EventBusViewModel<Record<string, unknown>>;
    };
    this.eventBus =
      debugWindow.__FRONTEND_EVENT_BUS__ ?? new EventBusViewModel<Record<string, unknown>>();
    this.windowState = new WindowStateViewModel();
  }

  setActiveCard(card: 1 | 2): void {
    this.activeCard.set(card);
  }

  toggleTop(): void {
    this.topCollapsed.set(!this.topCollapsed());
    this.eventBus.publish('ui:top-panel:toggled', { collapsed: this.topCollapsed() });
    setTimeout(() => this.resizeAllWindows(), 320);
  }

  toggleBottom(): void {
    this.bottomCollapsed.set(!this.bottomCollapsed());
    this.eventBus.publish('ui:bottom-panel:toggled', { collapsed: this.bottomCollapsed() });
    setTimeout(() => this.resizeAllWindows(), 320);
  }

  closeAllWindows(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.logger.info('Closing all windows');
    this.closeAllBoxes();
    this.eventBus.publish('windows:all-closed', { timestamp: Date.now() });
  }

  ngOnInit(): void {
    this.windowState.init();
    this.closeAllBoxes();

    // Verify WinBox is available
    const winboxAvailable = this.winboxService.isAvailable() || !!(window as any).WinBox;

    if (typeof document !== 'undefined') {
      (window as any).__WINBOX_DEBUG = {
        serviceHasIt: this.winboxService.isAvailable(),
        windowHasIt: !!(window as any).WinBox,
        winboxConstructor: (window as any).WinBox || null,
        checked: new Date().toISOString(),
      };

      if (!winboxAvailable) {
        this.logger.error('WinBox is NOT available! window.WinBox =', (window as any).WinBox);
        const debugDiv = document.createElement('div');
        debugDiv.style.cssText =
          'position:fixed;top:0;left:0;background:red;color:white;padding:10px;z-index:99999;font-family:monospace;';
        debugDiv.innerHTML = `Warning: WinBox NOT loaded! window.WinBox = ${(window as any).WinBox}`;
        document.body.appendChild(debugDiv);
      } else {
        this.logger.info('WinBox is available', {
          serviceHasIt: this.winboxService.isAvailable(),
          windowHasIt: !!(window as any).WinBox,
        });
      }
    }

    // Listen for window resize events
    if (typeof window !== 'undefined') {
      this.resizeHandler = () => this.resizeAllWindows();
      window.addEventListener('resize', this.resizeHandler);
    }

    this.logger.info('App component initialized');
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined' && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  closeAllBoxes(): void {
    this.logger.info('Closing all WinBox windows', { count: this.existingBoxes.length });

    const boxesToClose = [...this.existingBoxes];

    for (const box of boxesToClose) {
      if (box) {
        try {
          if (box.min) {
            box.restore();
          }
          box.focus();
          box.close(true);
        } catch (error) {
          this.logger.error('Error closing window via API', { id: box.__windowId, error });
        }
      }
    }

    setTimeout(() => {
      const winboxElements = document.querySelectorAll('.winbox');
      this.logger.debug('Found WinBox DOM elements to remove', { count: winboxElements.length });

      winboxElements.forEach((el) => {
        try {
          el.remove();
          this.logger.debug('Removed WinBox DOM element', { id: el.id });
        } catch (error) {
          this.logger.error('Error removing WinBox DOM element', { error });
        }
      });

      const winboxBodyElements = document.querySelectorAll('.winbox-body');
      winboxBodyElements.forEach((el) => {
        try {
          el.remove();
        } catch {
          // Ignore errors
        }
      });

      this.existingBoxes = [];
      this.windowEntries.set([]);
      this.logger.info('All windows closed and DOM cleaned up', {
        remainingBoxes: this.existingBoxes.length,
        remainingEntries: this.windowEntries().length
      });
    }, 50);
  }

  openAuthWindow(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.logger.info('Opening auth window');
    this.createWindow(this.authWindowId, '🔐 Authentication', 'auth');
  }

  openSqliteWindow(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.logger.info('Opening SQLite window');
    this.createWindow(this.sqliteWindowId, '🗄️ SQLite CRUD', 'sqlite');
  }

  private createWindow(windowId: string, title: string, type: 'auth' | 'sqlite'): void {
    const WinBoxConstructor = (window as any).WinBox;

    if (!WinBoxConstructor) {
      this.logger.error('WinBox not found on window object!');
      this.showWinBoxError('WinBox library not loaded');
      return;
    }

    // Check for existing window
    const existingBox = this.existingBoxes.find(box => box?.__windowId === windowId);
    if (existingBox) {
      this.logger.info('Focusing existing window', { windowId });
      if (existingBox.min) existingBox.restore();
      existingBox.focus();
      this.applyMaximizedState(existingBox);
      this.markWindowFocused(windowId, title);
      return;
    }

    try {
      this.logger.info('Creating WinBox instance...', { windowId, type });

      const viewport = this.getAvailableViewport();
      const windowWidth = Math.min(500, viewport.width);
      const windowHeight = type === 'auth' ? Math.min(700, viewport.height) : Math.min(650, viewport.height);
      const x = viewport.left + (viewport.width - windowWidth) / 2;
      const y = viewport.top + (viewport.height - windowHeight) / 2;

      // Create the window
      const box = new WinBoxConstructor({
        id: windowId,
        title: title,
        background: type === 'auth' 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
        width: `${windowWidth}px`,
        height: `${windowHeight}px`,
        x: `${x}px`,
        y: `${y}px`,
        minwidth: 400,
        minheight: type === 'auth' ? 500 : 450,
        maxwidth: 600,
        maxheight: 800,
        html: `<div id="${type}-root-${windowId}" style="height: 100%; width: 100%;"></div>`,
      });

      if (!box) {
        this.logger.error('WinBox constructor returned null');
        this.showWinBoxError('Failed to create window');
        return;
      }

      this.logger.info('WinBox window created successfully', { windowId });

      // Store reference
      box.__windowId = windowId;
      box.__cardTitle = title;
      this.existingBoxes.push(box);

      // Add event handlers
      box.onfocus = () => this.markWindowFocused(windowId, title);
      box.onblur = () => this.windowState.sendStateChange(windowId, 'blurred', title);
      box.onminimize = () => this.markWindowMinimized(windowId, title);
      box.onmaximize = () => {
        (box as any).__isMaximized = true;
        this.applyMaximizedState(box);
        this.windowState.sendStateChange(windowId, 'maximized', title);
      };
      box.onrestore = () => {
        (box as any).__isMaximized = false;
        this.windowState.sendStateChange(windowId, 'restored', title);
      };
      box.onclose = () => {
        this.logger.debug('WinBox onclose triggered', { id: windowId });

        const index = this.existingBoxes.indexOf(box);
        if (index > -1) {
          this.existingBoxes.splice(index, 1);
        }

        this.eventBus.publish('window:closed', { id: windowId, title });
        this.windowState.sendStateChange(windowId, 'closed', title);
        this.windowEntries.update(entries => entries.filter(entry => entry.id !== windowId));

        this.logger.debug('Window close cleanup complete', { id: windowId });
        return true;
      };

      // Update UI state
      this.windowEntries.update(entries => [
        ...entries.map(e => ({ ...e, focused: false })),
        {
          id: windowId,
          title: title,
          minimized: false,
          focused: true,
        },
      ]);
      this.eventBus.publish('window:opened', { id: windowId, title });
      this.windowState.sendStateChange(windowId, 'focused', title);

      // Apply maximized state
      setTimeout(() => {
        this.applyMaximizedState(box);
      }, 50);
    } catch (error) {
      this.logger.error('Error creating WinBox window', { error, windowId });
      this.showWinBoxError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private showWinBoxError(message: string): void {
    if (typeof document !== 'undefined') {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText =
        'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#dc3545;color:white;padding:20px;border-radius:8px;z-index:99999;font-family:sans-serif;max-width:400px;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
      errorDiv.innerHTML = `
        <strong style="font-size:18px;display:block;margin-bottom:10px;">Window Error</strong>
        <div style="margin-bottom:15px;line-height:1.5;">${message}</div>
        <div style="font-size:12px;opacity:0.8;">
          <strong>Debug info:</strong><br>
          window.WinBox = ${(window as any).WinBox ? 'Loaded' : 'Not loaded'}<br>
          Check browser console for details
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 8000);
    }
  }

  private getAvailableViewport(): { left: number; top: number; width: number; height: number } {
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 600;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 800;

    let topOffset = 0;
    if (this.topCollapsed()) {
      topOffset = 40;
    } else {
      topOffset = 40 + 40;
    }

    let bottomOffset = 0;
    if (this.bottomCollapsed()) {
      bottomOffset = 40;
    } else {
      bottomOffset = 40 + 60;
    }

    const topPadding = 4;
    const bottomPadding = 4;

    const availableHeight = windowHeight - topOffset - bottomOffset - topPadding - bottomPadding;
    const availableWidth = windowWidth - 20;

    return {
      left: 10,
      top: topOffset + topPadding,
      width: availableWidth,
      height: Math.max(200, availableHeight),
    };
  }

  private applyMaximizedState(box: WinBoxInstance): void {
    setTimeout(() => {
      try {
        const viewport = this.getAvailableViewport();
        const isSqlite = box.__cardTitle?.includes('SQLite');
        const windowWidth = Math.min(500, viewport.width);
        const windowHeight = isSqlite ? Math.min(650, viewport.height) : Math.min(700, viewport.height);
        const x = viewport.left + (viewport.width - windowWidth) / 2;
        const y = viewport.top + (viewport.height - windowHeight) / 2;
        
        box.move(`${x}px`, `${y}px`);
        box.resize(`${windowWidth}px`, `${windowHeight}px`);
      } catch {
        // Ignore resize errors
      }
    }, 10);
  }

  activateWindow(windowId: string, event: Event): void {
    event.stopPropagation();
    const box = this.existingBoxes.find(box => box?.__windowId === windowId);
    if (!box) {
      this.windowEntries.update(entries => entries.filter(entry => entry.id !== windowId));
      return;
    }
    if (box.min) box.restore();
    box.focus();
    if ((box as any).__isMaximized) {
      this.applyMaximizedState(box);
    }
    this.eventBus.publish('window:focused', { id: windowId });
  }

  private markWindowFocused(windowId: string, title: string): void {
    this.eventBus.publish('window:focused', { id: windowId });
    this.windowEntries.update(entries =>
      entries.map(entry => ({
        ...entry,
        focused: entry.id === windowId,
        minimized: entry.id === windowId ? false : entry.minimized,
      }))
    );
    this.windowState.sendStateChange(windowId, 'focused', title);
  }

  private markWindowMinimized(windowId: string, title: string): void {
    this.eventBus.publish('window:minimized', { id: windowId });
    this.windowEntries.update(entries =>
      entries.map(entry =>
        entry.id === windowId ? { ...entry, minimized: true, focused: false } : entry
      )
    );
    this.windowState.sendStateChange(windowId, 'minimized', title);
  }

  private resizeAllWindows(): void {
    const viewport = this.getAvailableViewport();
    this.existingBoxes.forEach((box: any) => {
      if (box && !box.min) {
        try {
          const isSqlite = box.__cardTitle?.includes('SQLite');
          const windowWidth = Math.min(500, viewport.width);
          const windowHeight = isSqlite ? Math.min(650, viewport.height) : Math.min(700, viewport.height);
          const x = viewport.left + (viewport.width - windowWidth) / 2;
          const y = viewport.top + (viewport.height - windowHeight) / 2;
          
          box.move(`${x}px`, `${y}px`);
          box.resize(`${windowWidth}px`, `${windowHeight}px`);
        } catch {
          // Ignore resize errors
        }
      }
    });
  }
}
