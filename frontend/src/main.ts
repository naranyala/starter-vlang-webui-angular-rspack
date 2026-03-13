import 'zone.js';
import '@angular/compiler';
import './winbox-loader';
import { ErrorHandler } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { errorInterceptor, setupGlobalErrorInterception } from './core/error-interceptor';
import { GlobalErrorHandler } from './core/global-error.handler';
import { GlobalErrorService } from './core/global-error.service';
import { environment } from './environments/environment';
import { EventBusViewModel } from './viewmodels/event-bus.viewmodel';
import {
  backend,
  clearLogHistory,
  configureLogging,
  getLogger,
  getLogHistory,
} from './viewmodels/logger.viewmodel';
import { AppComponent } from './views/app.component';

const eventBus = new EventBusViewModel<Record<string, unknown>>();
eventBus.init('app', 300);

configureLogging(environment.logging);
backend.enableBackendSink();
const logger = getLogger('bootstrap');

const debugApiWindow = window as unknown as {
  __FRONTEND_LOGS__?: { getHistory: typeof getLogHistory; clear: typeof clearLogHistory };
  __FRONTEND_EVENT_BUS__?: EventBusViewModel<Record<string, unknown>>;
  __ERROR_INTERCEPTOR__?: typeof errorInterceptor;
};
debugApiWindow.__FRONTEND_LOGS__ = { getHistory: getLogHistory, clear: clearLogHistory };
debugApiWindow.__FRONTEND_EVENT_BUS__ = eventBus;
debugApiWindow.__ERROR_INTERCEPTOR__ = errorInterceptor;

const globalFlag = '__frontendGlobalErrorHooks';
const globalWindow = window as unknown as { [key: string]: unknown };

// Enhanced error display function
function displayError(message: string, details?: string): void {
  const errorHtml = `
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:#1a1a2e;color:#fff;padding:40px;font-family:system-ui,sans-serif;overflow:auto;">
      <div style="max-width:800px;margin:0 auto;">
        <h1 style="color:#e94560;margin-bottom:20px;">⚠️ Application Error</h1>
        <div style="background:#16213e;padding:20px;border-radius:8px;margin-bottom:20px;">
          <p style="font-size:18px;margin:0 0 10px 0;">${message}</p>
          ${details ? `<pre style="background:#0f0f23;padding:15px;border-radius:4px;overflow:auto;font-size:12px;color:#e94560;">${details}</pre>` : ''}
        </div>
        <div style="color:#888;">
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
        </div>
        <button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#e94560;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px;">
          🔄 Reload Application
        </button>
      </div>
    </div>
  `;
  document.body.innerHTML = errorHtml;
}

try {
  logger.info('Starting Angular bootstrap', { production: environment.production });

  // Verify required dependencies
  if (typeof Zone === 'undefined') {
    throw new Error('Zone.js is not loaded. Please check your build configuration.');
  }

  // Setup global error interception for all unhandled errors
  setupGlobalErrorInterception();

  bootstrapApplication(AppComponent, {
    providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }],
  })
    .then(appRef => {
      logger.info('Angular bootstrap completed successfully');
      
      if (!globalWindow[globalFlag]) {
        // Global error handler
        window.addEventListener('error', event => {
          event.preventDefault();
          const errorService = appRef.injector.get(GlobalErrorService);
          const error = event.error ?? event.message ?? 'Unknown error';
          logger.error('Global error caught', { error: String(error) });
          errorService.report(error, { source: 'window' });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', event => {
          event.preventDefault();
          const errorService = appRef.injector.get(GlobalErrorService);
          const reason = event.reason ?? 'Unknown rejection';
          logger.error('Unhandled promise rejection', { reason: String(reason) });
          errorService.report(reason, {
            source: 'promise',
            title: 'Unhandled Promise Rejection',
          });
        });

        globalWindow[globalFlag] = true;
      }
      
      // Publish app ready event
      eventBus.publish('app:ready', { timestamp: Date.now() });
      
      // Verify component rendered
      setTimeout(() => {
        const appElement = document.querySelector('app-root');
        if (!appElement || !appElement.innerHTML.trim()) {
          logger.warn('App component may not have rendered correctly');
        }
      }, 1000);
    })
    .catch(err => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      logger.error('Angular bootstrap failed', { error: errorMessage, stack: errorStack });
      displayError(
        'Failed to initialize the application',
        `${errorMessage}${errorStack ? '\n\nStack:\n' + errorStack : ''}`
      );
    });
} catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;
  logger.error('Bootstrap threw synchronously', { error: errorMessage, stack: errorStack });
  displayError(
    'Application failed to start',
    `${errorMessage}${errorStack ? '\n\nStack:\n' + errorStack : ''}`
  );
}
