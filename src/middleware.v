module middleware

import security
import time

// ============================================================================
// Rate Limiting Middleware
// SEC-007: Rate limiting implementation
// ============================================================================

pub struct RateLimitMiddleware {
pub mut:
	limiter          &security.RateLimiter
	global_limiter   &security.RateLimiter
	ip_limiter       &security.RateLimiter
	user_limiter     &security.RateLimiter
}

pub fn new_rate_limit_middleware() &RateLimitMiddleware {
	return &RateLimitMiddleware{
		limiter: security.new_rate_limiter(100, 60)       // 100 req/min default
		global_limiter: security.new_rate_limiter(10000, 60)  // 10000 req/min global
		ip_limiter: security.new_rate_limiter(100, 60)    // 100 req/min per IP
		user_limiter: security.new_rate_limiter(1000, 60) // 1000 req/min per user
	}
}

pub struct RateLimitResult {
pub mut:
	allowed       bool
	remaining     int
	reset_at      u64
	retry_after   int
}

// Check rate limit for a request
pub fn (mut m RateLimitMiddleware) check(ip string, user_id string) RateLimitResult {
	now := u64(time.now().unix())

	// Check global limit first
	if !m.global_limiter.is_allowed('global') {
		return RateLimitResult{
			allowed: false
			remaining: 0
			reset_at: now + 60
			retry_after: 60
		}
	}

	// Check IP-based limit
	ip_remaining := m.ip_limiter.get_remaining_requests(ip)
	if !m.ip_limiter.is_allowed(ip) {
		return RateLimitResult{
			allowed: false
			remaining: 0
			reset_at: now + 60
			retry_after: 60
		}
	}

	// Check user-based limit if authenticated
	if user_id != '' {
		if !m.user_limiter.is_allowed(user_id) {
			return RateLimitResult{
				allowed: false
				remaining: 0
				reset_at: now + 60
				retry_after: 60
			}
		}
	}

	return RateLimitResult{
		allowed: true
		remaining: ip_remaining - 1
		reset_at: now + 60
		retry_after: 0
	}
}

// Cleanup expired rate limit entries
pub fn (mut m RateLimitMiddleware) cleanup() {
	m.limiter.cleanup()
	m.global_limiter.cleanup()
	m.ip_limiter.cleanup()
	m.user_limiter.cleanup()
}

// ============================================================================
// Input Validation Middleware
// SEC-004: Input validation implementation
// ============================================================================

pub struct ValidationMiddleware {
pub mut:
	max_body_size    int
	max_string_len   int
	allowed_html_tags []string
}

pub fn new_validation_middleware() &ValidationMiddleware {
	return &ValidationMiddleware{
		max_body_size: 1048576     // 1MB max body
		max_string_len: 10000      // 10KB max string
		allowed_html_tags: []string{}
	}
}

pub struct ValidationResult {
pub mut:
	is_valid   bool
	errors     []string
	sanitized  map[string]string
}

// Validate and sanitize input data
pub fn (m ValidationMiddleware) validate(input map[string]string) ValidationResult {
	mut result := ValidationResult{
		is_valid: true
		errors: []string{}
		sanitized: map[string]string{}
	}

	for key, value in input {
		// SEC-004: Validate key
		if key.len > 100 {
			result.is_valid = false
			result.errors << 'Key too long: ${key[..50]}'
			continue
		}

		// SEC-004: Validate value length
		if value.len > m.max_string_len {
			result.is_valid = false
			result.errors << 'Value too long for key: ${key}'
			continue
		}

		// SEC-004: Sanitize value
		sanitized := security.sanitize_input(value)
		result.sanitized[key] = sanitized
	}

	return result
}

// Validate email input
pub fn (m ValidationMiddleware) validate_email(email string) !string {
	if !security.validate_email(email) {
		return error('Invalid email address format')
	}
	return security.sanitize_input(email)
}

// Validate username input
pub fn (m ValidationMiddleware) validate_username(username string) !string {
	if !security.validate_username(username) {
		return error('Invalid username. Must be 3-32 characters, alphanumeric and underscore only')
	}
	return security.sanitize_input(username)
}

// Validate password (strength check only, don't sanitize)
pub fn (m ValidationMiddleware) validate_password(password string) string {
	if !security.validate_password_strength(password) {
		return 'Password does not meet strength requirements'
	}
	return password
}

// Validate integer input
pub fn (m ValidationMiddleware) validate_int(value string, min int, max int) int {
	mut int_val := value.int()
	if int_val == 0 {
		int_val = min
	}
	if int_val < min {
		return min
	}
	if int_val > max {
		return max
	}
	return int_val
}

// Validate pagination parameters
pub fn (m ValidationMiddleware) validate_pagination(page string, limit string) (int, int) {
	mut page_num := page.int()
	mut limit_num := limit.int()

	if page_num < 1 {
		page_num = 1
	}
	if limit_num < 1 || limit_num > 100 {
		limit_num = 20
	}

	return page_num, limit_num
}

// ============================================================================
// CSRF Middleware
// SEC-006: CSRF protection implementation
// ============================================================================

pub struct CSRFMiddleware {
pub mut:
	protection &security.CSRFProtection
}

pub fn new_csrf_middleware() &CSRFMiddleware {
	return &CSRFMiddleware{
		protection: security.new_csrf_protection()
	}
}

// Generate CSRF token for a user
pub fn (mut m CSRFMiddleware) generate_token(user_id string) !string {
	return m.protection.generate_token(user_id)
}

// Validate CSRF token from request
pub fn (mut m CSRFMiddleware) validate_token(token string, user_id string) bool {
	if token == '' {
		return false
	}
	return m.protection.validate_token(token, user_id)
}

// Invalidate CSRF token (on logout)
pub fn (mut m CSRFMiddleware) invalidate_token(token string) {
	m.protection.invalidate_token(token)
}

// Cleanup expired tokens
pub fn (mut m CSRFMiddleware) cleanup() {
	m.protection.cleanup()
}

// ============================================================================
// Request Logging Middleware
// ============================================================================

pub struct RequestLogger {
pub mut:
	enabled        bool
	log_headers    bool
	log_body       bool
	max_body_log   int
}

pub fn new_request_logger() &RequestLogger {
	return &RequestLogger{
		enabled: true
		log_headers: false
		log_body: false
		max_body_log: 200
	}
}

pub struct RequestLog {
pub mut:
	method      string
	path        string
	ip          string
	user_id     string
	timestamp   u64
	duration_ms int
	status_code int
}

pub fn (m RequestLogger) log(request RequestLog) {
	if !m.enabled {
		return
	}

	t := time.now()
	timestamp := '${t.hour:02}:${t.minute:02}:${t.second:02}'
	println('[${timestamp}] ${request.method} ${request.path} - ${request.status_code} (${request.duration_ms}ms)')
}

// ============================================================================
// Combined Middleware Stack
// ============================================================================

pub struct MiddlewareStack {
pub mut:
	rate_limit     &RateLimitMiddleware
	validation     &ValidationMiddleware
	csrf           &CSRFMiddleware
	logger         &RequestLogger
}

pub fn new_middleware_stack() &MiddlewareStack {
	return &MiddlewareStack{
		rate_limit: new_rate_limit_middleware()
		validation: new_validation_middleware()
		csrf: new_csrf_middleware()
		logger: new_request_logger()
	}
}

// Process request through all middleware
pub fn (mut stack MiddlewareStack) process(ip string, user_id string, csrf_token string) !MiddlewareResult {
	start_time := time.now().unix()

	// SEC-007: Check rate limits
	rate_result := stack.rate_limit.check(ip, user_id)
	if !rate_result.allowed {
		return MiddlewareResult{
			allowed: false
			status_code: 429
			error: 'Rate limit exceeded'
			retry_after: rate_result.retry_after
		}
	}

	// SEC-006: Validate CSRF token for state-changing operations
	if csrf_token != '' && user_id != '' {
		if !stack.csrf.validate_token(csrf_token, user_id) {
			return MiddlewareResult{
				allowed: false
				status_code: 403
				error: 'Invalid CSRF token'
			}
		}
	}

	duration := int(time.now().unix() - start_time)

	return MiddlewareResult{
		allowed: true
		status_code: 200
		duration_ms: duration
	}
}

pub struct MiddlewareResult {
pub mut:
	allowed     bool
	status_code int
	error       string
	retry_after int
	duration_ms int
}

// Cleanup all middleware resources
pub fn (mut stack MiddlewareStack) cleanup() {
	stack.rate_limit.cleanup()
	stack.csrf.cleanup()
}

// Periodic cleanup task (call every minute)
pub fn (mut stack MiddlewareStack) periodic_cleanup() {
	stack.cleanup()
}
