# Code Quality Audit Report

**Project:** vlang-webui-angular-rspack  
**Audit Date:** 2026-03-14  
**Scope:** Backend (V) and Frontend (Angular/TypeScript)

---

## Summary

| Category | Issues | Severity |
|----------|--------|----------|
| Error Handling | 8 | Medium |
| Code Organization | 6 | Medium |
| Testing | 5 | Medium |
| Documentation | 4 | Low |
| Performance | 4 | Medium |
| Maintainability | 5 | Medium |

---

## Error Handling Issues

### CQ-001: Inconsistent Error Handling Patterns

**Location:** Throughout codebase

**Issue:** The codebase mixes multiple error handling patterns:
- Backend: "Errors as values" with Result types (good)
- Frontend: Mix of Result types and try/catch
- Some services silently swallow errors

**Example:**
```typescript
// Frontend - Good: Uses Result type
async get<T>(url: string): Promise<Result<T>> {
    // ...
    return ok(body);
}

// Frontend - Inconsistent: Silent catch
catch {
    // Item not found or parse error - SILENT
}
```

**Recommendation:** Standardize on Result types throughout; log all errors.

---

### CQ-002: Silent Error Swallowing

**Location:** `src/services/core_services.v`, `frontend/src/core/storage.service.ts`

```v
// V - Silent failure
pub fn (s &CacheService) cleanup_expired() int {
    now := u64(time.now().unix())
    mut removed := 0

    for key, entry in s.cache {
        if entry.expires_at > 0 && now > entry.expires_at {
            delete s.cache, key  // No error if delete fails
            removed++
        }
    }
    return removed
}
```

```typescript
// TypeScript - Silent failure
try {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // ...
    }
} catch {
    // localStorage not available - SILENT
}
```

**Recommendation:** Log errors even if not propagated; use error telemetry.

---

### CQ-003: Missing Error Context

**Location:** Multiple service files

```v
// Generic error without context
return error('Failed to fetch user')
```

**Recommendation:** Always include context:
```v
return error.with_context(.user_not_found, 'Failed to fetch user', {
    'user_id': user_id.str()
    'operation': 'profile_lookup'
})
```

---

### CQ-004: Error Type Leakage

**Location:** `frontend/src/core/error-interceptor.ts`

Backend error codes leak to frontend without transformation:
```typescript
private mapStatusCodeToErrorCode(status: number): ErrorCode {
    switch (status) {
        case 400: return ErrorCode.InvalidInput;
        case 500: return ErrorCode.InternalError;
        // Internal error codes exposed
    }
}
```

**Recommendation:** Map to user-friendly error messages; log technical details internally.

---

### CQ-005: No Error Recovery Strategies

**Location:** Throughout

Errors are logged but no recovery is attempted:
```v
if user_result.is_err() {
    error.log_error(user_result.error)
    return error.to_response(user_result.error)  // Just returns
}
```

**Recommendation:** Implement retry logic for transient errors; circuit breakers.

---

### CQ-006: Unhandled Promise Rejections Risk

**Location:** `frontend/src/core/error-interceptor.ts`

```typescript
window.addEventListener('unhandledrejection', event => {
    event.preventDefault();  // Prevents console spam but...
    errorInterceptor.handleError(event.reason, {...});
});
```

**Recommendation:** Ensure all promises are properly handled; add global handler.

---

### CQ-007: Error History Memory Growth

**Location:** `frontend/src/core/error-interceptor.ts`

```typescript
private readonly maxHistory = 50;  // Arbitrary limit
this.errorHistory.push({ error, context });
if (this.errorHistory.length > this.maxHistory) {
    this.errorHistory.shift();
}
```

**Recommendation:** Use circular buffer; consider memory implications.

---

### CQ-008: Inconsistent Error Response Format

**Location:** Backend handlers

```v
// Some return JSON with error field
return '{"success":false,"data":null,"error":${err_json}}'

// Others might return different format
```

**Recommendation:** Standardize error response format across all endpoints.

---

## Code Organization Issues

### CQ-009: God Files

**Location:** `src/services/additional_services.v` (700+ lines)

Single file contains:
- LoggerService
- ValidationService
- MetricsService
- HealthCheckService
- AuthService

**Recommendation:** Split into separate files per service.

---

### CQ-010: Circular Dependency Risk

**Location:** Service registry pattern

```v
// Services depend on interfaces
// Interfaces depend on structs from services
// Registry depends on both
```

**Recommendation:** Clear dependency hierarchy; dependency inversion.

---

### CQ-011: Inconsistent Naming Conventions

**Location:** Throughout

```v
// Mixed naming
pub fn new_config_service() &ConfigService
pub fn newCacheService() &CacheService  // Not present but pattern exists
pub fn http_get(url string)  // Snake case
pub fn (s &HttpClientService) setBaseUrl(url string)  // Camel case
```

**Recommendation:** Standardize on V convention (snake_case for functions).

---

### CQ-012: Magic Numbers

**Location:** Multiple files

```v
// src/main.v
if processes.len > 100 {
    processes = processes[..].clone()[..100]  // Why 100?
}

// frontend/src/views/app.component.ts
setTimeout(() => this.resizeAllWindows(), 320);  // Why 320ms?

// src/services/core_services.v
max_size: 1000  // Why 1000?
token_expiry_sec: 3600  // Documented but why?
```

**Recommendation:** Use named constants with documentation:
```v
const (
    max_processes_display = 100  // Limit for UI performance
    resize_debounce_ms = 320     // CSS transition + buffer
    default_cache_max_entries = 1000
    default_token_expiry_seconds = 3600  // 1 hour
)
```

---

### CQ-013: Long Methods

**Location:** `frontend/src/views/app.component.ts`

```typescript
// Method is 100+ lines
private createWinBoxWindow(windowId: string, card: Card): void {
    // Creates window
    // Sets up event handlers
    // Updates state
    // Handles errors
    // Manages DOM
}
```

**Recommendation:** Split into smaller, testable methods.

---

### CQ-014: Feature Envy

**Location:** `frontend/src/core/app-services.facade.ts`

Facade knows too much about individual services:
```typescript
getStorageStats(): { count: number; estimatedSize: number } {
    const stats = this.storage.getStats();
    return {
        count: stats.count,
        estimatedSize: stats.estimatedSize,
    };
}

getHttpStats(): { total: number; success: number; failed: number; avgLatency: number } {
    const stats = this.http.getStats();
    return {
        total: stats.totalRequests,
        success: stats.successfulRequests,
        // ...
    };
}
```

**Recommendation:** Delegate stats retrieval to services; facade should coordinate, not transform.

---

## Testing Issues

### CQ-015: No Integration Tests

**Issue:** Only unit tests exist; no tests verify component interaction.

**Recommendation:** Add integration tests for:
- API endpoint to service layer
- Frontend to backend communication
- DI container with real services

---

### CQ-016: Test Assertions Use println

**Location:** `src/di_test.v`, `src/services_test.v`

```v
fn test_new_container() {
    println('Testing: test_new_container')
    // ...
    println('  ✓ PASSED: test_new_container')
}
```

**Recommendation:** Use V's test framework properly:
```v
fn test_new_container() {
    c := new_container()
    assert c.descriptors.len == 0
}
```

---

### CQ-017: Missing Edge Case Tests

**Issue:** Tests cover happy path but not:
- Empty inputs
- Maximum values
- Concurrent access
- Error conditions

**Recommendation:** Add property-based testing; fuzzing for inputs.

---

### CQ-018: No Performance Tests

**Issue:** No benchmarks for:
- Cache operations
- DI resolution
- Event bus throughput

**Recommendation:** Add benchmark tests for critical paths.

---

### CQ-019: Test Data Hardcoded

**Location:** `src/services_test.v`

```v
service.register_user('testuser', 'password123', 'test @example.com')
```

**Recommendation:** Use test data factories; random data generation.

---

## Documentation Issues

### CQ-020: Documentation Drift

**Issue:** README claims features not fully implemented:
- "SQLite wrapper" - skeleton only
- "HTTP client" - returns 501 Not Implemented
- "Authentication service" - insecure implementation

**Recommendation:** Mark features as [BETA] or [SKELETON]; update docs.

---

### CQ-021: Missing API Documentation

**Issue:** API reference doesn't match actual handlers.

**Recommendation:** Generate API docs from code; keep in sync.

---

### CQ-022: Undocumented Parameters

**Location:** Multiple service methods

```v
pub fn (s &CacheService) set(key string, value string, ttl_seconds int) bool
// No documentation for what ttl_seconds = 0 means
// No documentation for max value
```

**Recommendation:** Add doc comments for all public APIs.

---

### CQ-023: Missing Examples

**Issue:** Documentation has examples but they may be outdated.

**Recommendation:** Test documentation examples in CI.

---

## Performance Issues

### CQ-024: Inefficient Cache Cleanup

**Location:** `src/services/core_services.v`

```v
pub fn (s &CacheService) cleanup_expired() int {
    now := u64(time.now().unix())
    mut removed := 0

    for key, entry in s.cache {  // O(n) every cleanup
        if entry.expires_at > 0 && now > entry.expires_at {
            delete s.cache, key
            removed++
        }
    }
    return removed
}
```

**Recommendation:** Use priority queue for expiration; lazy cleanup.

---

### CQ-025: Unnecessary Cloning

**Location:** Multiple files

```v
processes = processes[..].clone()[..100]  // Clone then slice
```

**Recommendation:** Slice first, then clone if needed.

---

### CQ-026: Memory Leaks in Event Bus

**Location:** `frontend/src/viewmodels/event-bus.viewmodel.ts`

```typescript
private subscribers = new Map<string, Set<EventHandler>>();
// No cleanup for removed components
```

**Recommendation:** Implement subscription disposal; weak references.

---

### CQ-027: Synchronous Operations in Hot Path

**Location:** `frontend/src/core/storage.service.ts`

```typescript
get<T>(key: string): T | null {
    // Synchronous JSON.parse on every access
    return JSON.parse(item) as StorageEntry<T>;
}
```

**Recommendation:** Add caching layer; async parsing for large data.

---

## Maintainability Issues

### CQ-028: Tight Coupling to WebUI

**Issue:** Direct WebUI calls throughout; no abstraction.

**Recommendation:** Create window management interface; mockable for tests.

---

### CQ-029: Singleton Overuse

**Location:** DI registrations

```v
// Everything is singleton
sr.register_logger_service('info')
sr.register_cache_service(1000)
sr.register_validation_service()
// Even stateful services
```

**Recommendation:** Use transient/scoped for stateful services.

---

### CQ-030: No Circuit Breaker Pattern

**Issue:** Failed services don't fail fast.

**Recommendation:** Implement circuit breaker for external dependencies.

---

### CQ-031: Missing Health Check Implementation

**Location:** `src/services/additional_services.v`

```v
// Only dummy check registered
s.register_check('system', fn () HealthStatus {
    return HealthStatus{
        is_healthy: true  // Always healthy
        // ...
    }
})
```

**Recommendation:** Implement real health checks for dependencies.

---

### CQ-032: No Metrics Export

**Location:** `src/services/additional_services.v`

```v
pub fn (s &MetricsService) get_all_metrics() map[string]MetricData {
    // Collects but no export mechanism
}
```

**Recommendation:** Add Prometheus/OpenTelemetry export.

---

## Recommendations Priority Matrix

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| P0 | Standardize error handling | Medium | High |
| P0 | Split god files | Low | High |
| P1 | Add integration tests | High | High |
| P1 | Fix magic numbers | Low | Medium |
| P2 | Improve documentation | Medium | Medium |
| P2 | Optimize cache cleanup | Medium | Medium |
| P3 | Add circuit breakers | High | Medium |
| P3 | Implement metrics export | Medium | Low |

---

*Generated: 2026-03-14*
