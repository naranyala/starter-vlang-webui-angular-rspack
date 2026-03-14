# Prioritized Remediation Plan

**Project:** vlang-webui-angular-rspack  
**Created:** 2026-03-14  
**Review Cadence:** Weekly

---

## Executive Summary

This remediation plan addresses **45 identified issues** across security, code quality, and architecture. The plan is organized by priority and estimated effort.

### Effort Summary

| Priority | Count | Estimated Effort | Timeframe |
|----------|-------|------------------|-----------|
| P0 - Critical | 8 | 40 hours | Immediate (1 week) |
| P1 - High | 12 | 80 hours | Short-term (2-3 weeks) |
| P2 - Medium | 15 | 100 hours | Medium-term (1-2 months) |
| P3 - Low | 10 | 60 hours | Backlog (2-3 months) |

**Total Estimated Effort:** 280 hours (~7 weeks full-time)

---

## P0 - Critical (Immediate - Week 1)

### SEC-001: Implement Password Hashing

**Issue:** Plaintext password storage  
**Effort:** 4 hours  
**Files:** `src/services/additional_services.v`

**Tasks:**
- [ ] Add bcrypt library dependency
- [ ] Modify `UserInfo` struct to store `password_hash`
- [ ] Update `register_user()` to hash passwords
- [ ] Update `authenticate()` to verify hashes
- [ ] Add tests for password hashing
- [ ] Update documentation

**Acceptance Criteria:**
- Passwords never stored in plaintext
- Tests verify hashing works correctly
- Migration path for existing test data

---

### SEC-002: Secure Token Generation

**Issue:** Predictable token generation  
**Effort:** 4 hours  
**Files:** `src/services/additional_services.v`

**Tasks:**
- [ ] Import crypto.rand module
- [ ] Implement cryptographically secure token generation
- [ ] Add token length configuration (min 32 bytes)
- [ ] Update tests to verify token randomness
- [ ] Consider JWT implementation

**Acceptance Criteria:**
- Tokens pass randomness tests
- Token collision probability < 2^-128

---

### SEC-003: Add Input Validation Layer

**Issue:** No input validation on API handlers  
**Effort:** 8 hours  
**Files:** `src/main.v`, `src/services/interfaces.v`

**Tasks:**
- [ ] Create input validation middleware
- [ ] Add validation for all API handlers
- [ ] Implement request sanitization
- [ ] Add validation error responses
- [ ] Test with malicious inputs

**Acceptance Criteria:**
- All inputs validated before processing
- Invalid inputs return appropriate error codes
- No raw input reaches business logic

---

### SEC-004: Implement Rate Limiting

**Issue:** No rate limiting  
**Effort:** 8 hours  
**Files:** `src/main.v`, new file `src/rate_limiter.v`

**Tasks:**
- [ ] Create rate limiter service
- [ ] Implement sliding window algorithm
- [ ] Add per-endpoint rate limits
- [ ] Add per-IP rate limits
- [ ] Return 429 on rate limit exceeded
- [ ] Add rate limit headers

**Acceptance Criteria:**
- Configurable rate limits
- Rate limiting doesn't impact legitimate traffic
- Tests verify rate limiting works

---

### SEC-005: Fix Unsafe Pointer Usage

**Issue:** Unsafe type casting in DI  
**Effort:** 8 hours  
**Files:** `src/di.v`, `src/services/registry.v`

**Tasks:**
- [ ] Review all unsafe blocks
- [ ] Add runtime type checking
- [ ] Use V generics where possible
- [ ] Add type safety tests
- [ ] Document remaining unsafe requirements

**Acceptance Criteria:**
- Reduced unsafe blocks by 80%
- Type mismatches caught at runtime
- Documentation explains remaining unsafe usage

---

### SEC-006: Add CSRF Protection

**Issue:** No CSRF protection  
**Effort:** 4 hours  
**Files:** `src/main.v`, `frontend/src/core/http.service.ts`

**Tasks:**
- [ ] Generate CSRF tokens on session start
- [ ] Add token to all state-changing requests
- [ ] Validate tokens on backend
- [ ] Add SameSite cookie attributes
- [ ] Test CSRF protection

**Acceptance Criteria:**
- State-changing requests require valid CSRF token
- Invalid tokens rejected with 403

---

### ARC-001: Add WebUI Abstraction

**Issue:** Tight coupling to WebUI  
**Effort:** 8 hours  
**Files:** New file `src/window_manager.v`

**Tasks:**
- [ ] Define `IWindowManager` interface
- [ ] Create `WebUIWindowManager` implementation
- [ ] Update main.v to use abstraction
- [ ] Create `MockWindowManager` for tests
- [ ] Update tests to use mock

**Acceptance Criteria:**
- WebUI calls isolated to one file
- Tests run without WebUI
- Easy to swap window management library

---

### ARC-002: Implement Graceful Shutdown

**Issue:** No graceful shutdown  
**Effort:** 4 hours  
**Files:** `src/main.v`

**Tasks:**
- [ ] Add signal handler for SIGINT/SIGTERM
- [ ] Implement service shutdown sequence
- [ ] Flush caches on shutdown
- [ ] Close database connections
- [ ] Log shutdown progress

**Acceptance Criteria:**
- Clean shutdown on Ctrl+C
- No resource leaks
- Shutdown completes within 5 seconds

---

## P1 - High (Short-term - Weeks 2-3)

### SEC-007: Add SQL Injection Prevention

**Issue:** SQL injection vulnerability  
**Effort:** 8 hours  
**Files:** `src/services/core_services.v`

**Tasks:**
- [ ] Implement parameterized queries
- [ ] Add identifier validation
- [ ] Create query builder with safety
- [ ] Add SQL injection tests
- [ ] Document safe query patterns

---

### SEC-008: Fix Memory Management

**Issue:** Raw pointer memory leaks  
**Effort:** 8 hours  
**Files:** `src/di.v`

**Tasks:**
- [ ] Audit all pointer usage
- [ ] Implement proper ownership
- [ ] Add memory leak tests
- [ ] Use V's owned pointers where possible
- [ ] Document memory ownership

---

### SEC-009: Remove Hardcoded Credentials

**Issue:** Test credentials in code  
**Effort:** 2 hours  
**Files:** `src/services_test.v`

**Tasks:**
- [ ] Move test credentials to environment
- [ ] Use random test data
- [ ] Add .env.example for test config
- [ ] Update CI to use secure test data

---

### SEC-010: Sanitize Error Messages

**Issue:** Error details exposed  
**Effort:** 4 hours  
**Files:** `src/error.v`, `src/main.v`

**Tasks:**
- [ ] Create user-facing error messages
- [ ] Log technical details internally
- [ ] Add error code mapping
- [ ] Test error responses don't leak info

---

### CQ-001: Standardize Error Handling

**Issue:** Inconsistent error patterns  
**Effort:** 16 hours  
**Files:** Throughout

**Tasks:**
- [ ] Define error handling standard
- [ ] Update frontend to use Result types
- [ ] Remove silent error swallowing
- [ ] Add error telemetry
- [ ] Update documentation

---

### CQ-009: Split God Files

**Issue:** Large service files  
**Effort:** 8 hours  
**Files:** `src/services/additional_services.v`

**Tasks:**
- [ ] Split into separate files per service
- [ ] Update imports
- [ ] Verify tests still pass
- [ ] Update documentation

---

### CQ-015: Add Integration Tests

**Issue:** No integration tests  
**Effort:** 16 hours  
**Files:** New directory `src/integration_tests/`

**Tasks:**
- [ ] Set up integration test framework
- [ ] Add API integration tests
- [ ] Add frontend-backend tests
- [ ] Add database integration tests
- [ ] Run in CI pipeline

---

### CQ-016: Fix Test Assertions

**Issue:** Tests use println  
**Effort:** 4 hours  
**Files:** `src/di_test.v`, `src/services_test.v`

**Tasks:**
- [ ] Convert to V test framework
- [ ] Remove println assertions
- [ ] Add proper test names
- [ ] Run with `v test`

---

### ARC-003: Fix Singleton Overuse

**Issue:** Everything is singleton  
**Effort:** 4 hours  
**Files:** `src/services/registry.v`

**Tasks:**
- [ ] Audit service statefulness
- [ ] Change stateless to transient
- [ ] Add scoped for request services
- [ ] Test with different lifecycles

---

### ARC-004: Add Circuit Breakers

**Issue:** No failure isolation  
**Effort:** 12 hours  
**Files:** New file `src/circuit_breaker.v`

**Tasks:**
- [ ] Implement circuit breaker pattern
- [ ] Add to external service calls
- [ ] Configure thresholds
- [ ] Add circuit breaker metrics
- [ ] Test failure scenarios

---

### ARC-005: Add Event Bus Backpressure

**Issue:** No backpressure  
**Effort:** 8 hours  
**Files:** `src/events.v`, `frontend/src/viewmodels/event-bus.viewmodel.ts`

**Tasks:**
- [ ] Add queue size limits
- [ ] Implement drop policies
- [ ] Add handler timeouts
- [ ] Monitor queue depth

---

## P2 - Medium (Medium-term - Weeks 4-8)

| ID | Issue | Effort | Files |
|--------|----------|--------|----------|
| CQ-002 | Silent Error Swallowing | 4h | Multiple |
| CQ-003 | Missing Error Context | 4h | Multiple |
| CQ-010 | Circular Dependency Risk | 8h | Services |
| CQ-011 | Naming Conventions | 4h | Throughout |
| CQ-012 | Magic Numbers | 4h | Throughout |
| CQ-013 | Long Methods | 8h | app.component.ts |
| CQ-020 | Documentation Drift | 8h | README, docs/ |
| CQ-021 | Missing API Docs | 8h | docs/ |
| CQ-024 | Cache Cleanup Performance | 8h | core_services.v |
| CQ-025 | Unnecessary Cloning | 4h | Multiple |
| CQ-026 | Event Bus Memory Leaks | 8h | event-bus.viewmodel.ts |
| ARC-006 | Request Correlation | 8h | Throughout |
| ARC-007 | Observability Layer | 16h | New files |
| ARC-008 | Frontend State Management | 12h | views/ |
| ARC-010 | Caching Strategy | 8h | services/ |

---

## P3 - Low (Backlog - Weeks 9-12)

| ID | Issue | Effort | Files |
|--------|----------|--------|----------|
| CQ-004 | Error Type Leakage | 4h | http.service.ts |
| CQ-005 | Error Recovery | 8h | Multiple |
| CQ-006 | Unhandled Rejections | 4h | error-interceptor.ts |
| CQ-007 | Error History Growth | 2h | error-interceptor.ts |
| CQ-008 | Error Response Format | 4h | main.v |
| CQ-014 | Feature Envy | 4h | app-services.facade.ts |
| CQ-017 | Edge Case Tests | 16h | tests/ |
| CQ-018 | Performance Tests | 8h | benchmarks/ |
| CQ-019 | Test Data Factories | 4h | tests/ |
| CQ-022 | Undocumented Parameters | 8h | Throughout |
| CQ-023 | Missing Examples | 8h | docs/ |
| CQ-027 | Sync Operations | 8h | storage.service.ts |
| CQ-028 | WebUI Coupling | 8h | Already P0 |
| CQ-029 | Singleton Overuse | 4h | Already P1 |
| CQ-030 | Circuit Breaker | 12h | Already P1 |
| CQ-031 | Health Checks | 8h | additional_services.v |
| CQ-032 | Metrics Export | 8h | metrics_service.v |
| ARC-009 | State Complexity | 12h | views/ |
| ARC-011 | God Component | 16h | app.component.ts |
| ARC-012 | Service Facade | 4h | app-services.facade.ts |
| ARC-013 | Repository Pattern | 16h | New files |
| ARC-014 | CQRS | 16h | Throughout |

---

## Weekly Milestones

### Week 1: Critical Security
- [ ] SEC-001: Password hashing
- [ ] SEC-002: Secure tokens
- [ ] SEC-003: Input validation
- [ ] SEC-004: Rate limiting
- [ ] SEC-005: Unsafe pointers
- [ ] SEC-006: CSRF protection
- [ ] ARC-001: WebUI abstraction
- [ ] ARC-002: Graceful shutdown

### Week 2: Security + Quality
- [ ] SEC-007: SQL injection
- [ ] SEC-008: Memory management
- [ ] SEC-009: Test credentials
- [ ] SEC-010: Error messages
- [ ] CQ-001: Error handling (start)

### Week 3: Code Quality
- [ ] CQ-001: Error handling (complete)
- [ ] CQ-009: Split god files
- [ ] CQ-015: Integration tests (start)
- [ ] CQ-016: Test assertions
- [ ] ARC-003: Singleton lifecycle

### Week 4: Architecture
- [ ] CQ-015: Integration tests (complete)
- [ ] ARC-004: Circuit breakers
- [ ] ARC-005: Event bus backpressure
- [ ] CQ-002: Error swallowing

### Weeks 5-8: Medium Priority
- Complete P2 items based on priority
- Weekly review and reprioritization

### Weeks 9-12: Low Priority / Polish
- Complete P3 items
- Documentation updates
- Performance optimization

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Critical Security Issues | 5 | 0 | Week 1 |
| High Security Issues | 5 | 0 | Week 2 |
| Test Coverage | ~30% | 80% | Week 8 |
| Code Quality Grade | C | A | Week 12 |
| Security Audit Pass | Fail | Pass | Week 2 |
| Performance Budget | N/A | <100ms p99 | Week 8 |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking changes during refactor | Medium | High | Feature flags, gradual rollout |
| Test failures during changes | High | Medium | Fix tests as part of each PR |
| Performance regression | Medium | Medium | Add performance tests |
| Team bandwidth | Medium | High | Prioritize ruthlessly, defer P3 |

---

## Review Cadence

- **Daily:** Standup on P0 progress
- **Weekly:** Full review of completed items
- **Bi-weekly:** Reprioritize backlog
- **Monthly:** Executive summary to stakeholders

---

*Generated: 2026-03-14*
