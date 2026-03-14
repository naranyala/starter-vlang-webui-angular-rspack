# Architecture Audit Report

**Project:** vlang-webui-angular-rspack  
**Audit Date:** 2026-03-14  
**Scope:** System Architecture, Design Patterns, Component Design

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Angular)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Angular   │  │   WinBox    │  │    Service Layer        │  │
│  │  Components │  │   Windows   │  │    (DI Injected)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                    │                  │
│         │          WebSocket              EventBus               │
│         │                │                    │                  │
│         └────────────────┼────────────────────┘                  │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           │ WebUI Bridge (JavaScript ↔ V)
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                         Backend (V Language)                      │
│                          │                                        │
│  ┌─────────────┐  ┌──────┴───────┐  ┌─────────────────────────┐  │
│  │   WebUI     │  │   DI         │  │    Service Layer        │  │
│  │   Server    │  │   Container  │  │    (Injected Services)  │  │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘  │
│                          │                                        │
│                   Linux Sysfs / Procfs                            │
└───────────────────────────────────────────────────────────────────┘
```

---

## Architecture Issues

### ARC-001: Tight Coupling to WebUI Library

**Severity:** High  
**Impact:** Difficult to test, replace, or upgrade window management

**Current State:**
```v
// Direct WebUI calls in main.v
import vwebui as ui

mut w := ui.new_window()
w.bind('getSystemInfo', fn (e &ui.Event) string { ... })
w.show('index.html')!
```

**Issues:**
- No abstraction layer for window management
- Cannot mock WebUI for testing
- Vendor lock-in to WebUI library
- Hard to add alternative UI frameworks

**Recommendation:**
```v
// Create window management interface
pub interface IWindowManager {
    mut:
        bind(event string, handler fn (&Event) string)
        show(page string) !
        wait()
}

// Implementation wraps WebUI
pub struct WebUIWindowManager {
    window ui.Window
}

// Tests can use MockWindowManager
```

---

### ARC-002: No API Versioning

**Severity:** Medium  
**Impact:** Breaking changes break clients silently

**Current State:**
```v
// No versioning in API handlers
w.bind('getSystemInfo', fn (e &ui.Event) string { ... })
w.bind('getProcessInfo', fn (e &ui.Event) string { ... })
```

**Issues:**
- Frontend-backend contract not versioned
- Breaking changes require coordinated deployment
- No backward compatibility support
- Cannot support multiple client versions

**Recommendation:**
```v
// Versioned API handlers
w.bind('api:v1:getSystemInfo', fn (e &ui.Event) string { ... })
w.bind('api:v2:getSystemInfo', fn (e &ui.Event) string { ... })  // New version

// Or URL-based versioning
w.bind('getSystemInfo', fn (e &ui.Event) string {
    version := e.data.get('api_version') or { 'v1' }
    return handle_system_info(version)
})
```

---

### ARC-003: Singleton Overuse in DI

**Severity:** Medium  
**Impact:** State leakage, testing difficulties, memory growth

**Current State:**
```v
// All services registered as singleton
sr.register_logger_service('info')
sr.register_cache_service(1000)
sr.register_validation_service()
sr.register_metrics_service()
sr.register_health_check_service()
sr.register_auth_service(3600)
```

**Issues:**
- Stateful services (Auth, Cache) live forever
- Test isolation requires manual cleanup
- Memory grows unbounded for caches/metrics
- No request-scoped state management

**Recommendation:**
```v
// Use appropriate lifecycles
sr.register_logger_service('info')     // Singleton - stateless
sr.register_cache_service(1000)        // Singleton - shared cache OK
sr.register_validation_service()       // Transient - stateless, no shared state
sr.register_auth_service(3600)         // Scoped - per-request/session

// For metrics, use scoped or add cleanup
container.register_scoped('metrics', fn () voidptr {
    return new_metrics_service()
})
```

---

### ARC-004: Missing Circuit Breaker Pattern

**Severity:** Medium  
**Impact:** Cascading failures, no graceful degradation

**Current State:**
```v
// Direct service calls without protection
w.bind('getSystemInfo', fn (e &ui.Event) string {
    info := system.get_system_info()  // Can hang indefinitely
    return json.encode(info)
})
```

**Issues:**
- No failure isolation
- Slow dependencies block all requests
- No graceful degradation
- No automatic recovery

**Recommendation:**
```v
pub struct CircuitBreaker {
    failure_threshold int
    success_threshold int
    timeout_ms int
    state CircuitState
    failures int
    last_failure_time u64
}

pub fn (mut cb CircuitBreaker) execute[T](fn () T) !T {
    if cb.state == .open {
        if time.now().unix() - cb.last_failure_time < cb.timeout_ms {
            return error('Circuit is open')
        }
        cb.state = .half_open
    }

    result := fn() or {
        cb.failures++
        if cb.failures >= cb.failure_threshold {
            cb.state = .open
        }
        return error
    }

    cb.successes++
    if cb.successes >= cb.success_threshold {
        cb.state = .closed
        cb.failures = 0
    }

    return result
}
```

---

### ARC-005: Event Bus Without Backpressure

**Severity:** Medium  
**Impact:** Memory growth, potential crashes under load

**Current State:**
```typescript
// frontend/src/viewmodels/event-bus.viewmodel.ts
private subscribers = new Map<string, Set<EventHandler>>();

publish<T extends Record<string, unknown>>(
    event: string,
    payload: T,
    options?: { replayLast?: boolean }
): void {
    const handlers = this.subscribers.get(event) || new Set();
    for (const handler of handlers) {
        handler(payload);  // Synchronous, no backpressure
    }
}
```

**Issues:**
- No limit on event queue size
- Slow handlers block publishers
- No event prioritization
- No dead letter queue for failed handlers

**Recommendation:**
```typescript
interface EventBusOptions {
    maxQueueSize: number;
    maxHandlersPerEvent: number;
    handlerTimeout: number;
}

publish<T>(event: string, payload: T, options?: PublishOptions): Result<void> {
    // Check queue size
    if (this.eventQueue.length >= this.maxQueueSize) {
        this.dropPolicy.handle(this.eventQueue);
    }

    // Async handler execution with timeout
    for (const handler of handlers) {
        this.executeWithTimeout(handler, payload, options?.timeout);
    }
}
```

---

### ARC-006: No Request/Response Correlation

**Severity:** Low  
**Impact:** Difficult debugging, no distributed tracing

**Current State:**
```v
// No correlation IDs
w.bind('getSystemInfo', fn (e &ui.Event) string {
    info := system.get_system_info()
    return json.encode(info)  // No request ID
})
```

**Recommendation:**
```v
pub struct RequestContext {
    correlation_id string
    user_id string
    session_id string
    start_time u64
}

// Thread through all operations
w.bind('getSystemInfo', fn (e &ui.Event) string {
    ctx := extract_context(e)
    logger.info('Fetching system info', { 'correlation_id': ctx.correlation_id })
    info := system.get_system_info()
    return json.encode(info)
})
```

---

### ARC-007: Missing Observability Layer

**Severity:** Medium  
**Impact:** No visibility into production issues

**Current State:**
```v
// Metrics collected but not exported
pub fn (s &MetricsService) get_all_metrics() map[string]MetricData {
    // Internal only
}

// No tracing
// No structured logging
// No health endpoint
```

**Recommendation:**
```v
// Add observability stack
pub interface IObservability {
    mut:
        trace(span Span)
        metric(name string, value f64)
        log(entry LogEntry)
}

// Export to Prometheus, Jaeger, etc.
pub struct PrometheusExporter {
    // ...
}

pub struct JaegerTracer {
    // ...
}
```

---

### ARC-008: No Graceful Shutdown

**Severity:** Medium  
**Impact:** Data loss, orphaned resources on shutdown

**Current State:**
```v
ui.wait()  // Blocks until window closed
event_bus.publish('app:stopped', 'Application closed', 'main')
event_bus.print_debug()
// No cleanup of services
```

**Recommendation:**
```v
// Add signal handling
import os

fn setup_signal_handler(mut container di.Container) {
    // Handle SIGINT, SIGTERM
    signal_handler := fn (sig int) {
        logger.info('Shutdown signal received')

        // Graceful shutdown
        container.dispose()  // Dispose all services
        event_bus.shutdown()
        cache.flush()

        os.exit(0)
    }

    os.signal(signal_handler)
}
```

---

### ARC-009: Frontend State Management Complexity

**Severity:** Medium  
**Impact:** Difficult to reason about state, potential race conditions

**Current State:**
```typescript
// Multiple state management approaches
searchQuery = signal('');           // Signals
private stats = signal<HttpStats>({}); // Signals
private pendingRequests = new Map();   // Maps
private existingBoxes: WinBoxInstance[] = []; // Arrays
```

**Issues:**
- Mixed state patterns
- No single source of truth
- Potential for stale state
- Complex state synchronization

**Recommendation:**
```typescript
// Use consistent state management pattern
@Injectable({ providedIn: 'root' })
export class AppState {
    private readonly state = signal<AppStateModel>({
        windows: [],
        searchQuery: '',
        connectionStatus: 'disconnected',
    });

    readonly windows = computed(() => this.state().windows);
    readonly searchQuery = computed(() => this.state().searchQuery);

    updateWindows(windows: WindowEntry[]): void {
        this.state.update(s => ({ ...s, windows }));
    }
}
```

---

### ARC-010: No Caching Strategy

**Severity:** Low  
**Impact:** Redundant computations, potential performance issues

**Current State:**
```v
// Cache exists but no eviction strategy
pub fn (s &CacheService) cleanup_expired() int {
    // Manual cleanup only
}
```

**Recommendation:**
```v
// Implement LRU eviction
pub struct CacheService {
    cache map[string]CacheEntry
    access_order []string  // For LRU
    max_size int
}

pub fn (s &CacheService) set(key string, value string, ttl_seconds int) bool {
    if s.cache.len >= s.max_size {
        s.evict_lru()
    }
    // ...
}

fn (mut s CacheService) evict_lru() {
    if s.access_order.len > 0 {
        oldest := s.access_order[0]
        s.delete(oldest)
    }
}
```

---

## Component Design Issues

### ARC-011: God Component - AppComponent

**Severity:** Medium  
**Location:** `frontend/src/views/app.component.ts`

**Issues:**
- 500+ lines of code
- Manages windows, panels, WebSocket, events
- Multiple responsibilities

**Recommendation:** Split into:
- `WindowManagerComponent`
- `PanelComponent`
- `ConnectionStatusComponent`

---

### ARC-012: Service Facade Anti-Pattern

**Severity:** Low  
**Location:** `frontend/src/core/app-services.facade.ts`

**Issue:** Facade knows about all services, becomes bottleneck.

**Recommendation:** Use service-specific facades or direct injection.

---

### ARC-013: Missing Repository Pattern

**Severity:** Medium  
**Impact:** Data access logic scattered

**Recommendation:**
```v
pub interface IUserRepository {
    get_by_id(id string) !User
    get_all() ![]User
    save(user User) !void
    delete(id string) !void
}
```

---

### ARC-014: No Command/Query Separation

**Severity:** Low  
**Impact:** Unclear intent, harder to optimize

**Recommendation:**
```v
// Commands (write operations)
pub fn (s &UserService) create_user(cmd CreateUserCommand) !User

// Queries (read operations)
pub fn (s &UserService) get_user(qry GetUserQuery) !User
```

---

## Architecture Recommendations Priority

| Priority | Recommendation | Effort | Impact |
|----------|----------------|--------|--------|
| P0 | Add WebUI abstraction | Medium | High |
| P0 | Implement graceful shutdown | Low | High |
| P1 | Add circuit breakers | High | High |
| P1 | Fix singleton overuse | Low | Medium |
| P2 | Add API versioning | Medium | Medium |
| P2 | Implement observability | High | Medium |
| P3 | Add request correlation | Medium | Low |
| P3 | Split AppComponent | High | Medium |

---

## Architecture Decision Records (ADRs) Needed

1. **ADR-001:** WebUI vs Alternative Window Management
2. **ADR-002:** State Management Strategy (Signals vs RxJS vs NgRx)
3. **ADR-003:** API Design (RPC vs REST vs GraphQL)
4. **ADR-004:** Data Persistence Strategy
5. **ADR-005:** Observability Stack Selection

---

*Generated: 2026-03-14*
