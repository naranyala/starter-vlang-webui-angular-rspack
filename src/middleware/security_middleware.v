module middleware

import security
import services

/**
 * Auth Middleware
 * Validates session tokens and enforces authentication
 */
pub struct AuthMiddleware {
pub mut:
	auth_service &services.AuthService
}

/**
 * Create new auth middleware
 */
pub fn new_auth_middleware(auth_service &services.AuthService) &AuthMiddleware {
	return &AuthMiddleware{
		auth_service: auth_service
	}
}

/**
 * AuthResult contains authentication information
 */
pub struct AuthResult {
pub mut:
	is_authenticated bool
	session          ?services.Session
	error            ?string
}

/**
 * Validate session from token
 */
pub fn (mut m AuthMiddleware) validate_session(token string) AuthResult {
	if token.len == 0 {
		return AuthResult{
			is_authenticated: false
			error: 'Session token required'
		}
	}

	session := m.auth_service.validate_session(token) or {
		return AuthResult{
			is_authenticated: false
			error: err.msg
		}
	}

	return AuthResult{
		is_authenticated: true
		session:          session
	}
}

/**
 * Require authentication - returns error if not authenticated
 */
pub fn (mut m AuthMiddleware) require_auth(token string) !services.Session {
	result := m.validate_session(token)
	if !result.is_authenticated {
		return error(result.error or { 'Authentication required' })
	}
	return result.session!
}

/**
 * Require admin role
 */
pub fn (mut m AuthMiddleware) require_admin(token string) !services.Session {
	session := m.require_auth(token) or { return err }

	if session.role != .admin {
		return error('Admin access required')
	}

	return session
}

/**
 * CSRF Middleware
 * Validates CSRF tokens for state-changing operations
 */
pub struct CSRFMiddleware {
pub mut:
	csrf_protection security.CSRFProtection
}

/**
 * Create new CSRF middleware
 */
pub fn new_csrf_middleware() &CSRFMiddleware {
	return &CSRFMiddleware{
		csrf_protection: security.new_csrf_protection()
	}
}

/**
 * Generate CSRF token for user
 */
pub fn (mut m CSRFMiddleware) generate_token(user_id string) !string {
	return m.csrf_protection.generate_token(user_id)
}

/**
 * Validate CSRF token
 */
pub fn (mut m CSRFMiddleware) validate_token(token string, user_id string) ! {
	if token.len == 0 {
		return error('CSRF token required')
	}

	if !m.csrf_protection.validate_token(token, user_id) {
		return error('Invalid or expired CSRF token')
	}
}

/**
 * Cleanup expired CSRF tokens
 */
pub fn (mut m CSRFMiddleware) cleanup() int {
	return m.csrf_protection.cleanup_expired()
}

/**
 * Security Headers Middleware
 * Adds security headers to responses
 */
pub struct SecurityHeadersMiddleware {
pub mut:
	csp_policy        string
	hsts_max_age      int
	frame_options     string
	content_type_nosniff bool
}

/**
 * Create security headers with defaults
 */
pub fn new_security_headers_middleware() &SecurityHeadersMiddleware {
	return &SecurityHeadersMiddleware{
		csp_policy:        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
		hsts_max_age:      31536000  // 1 year
		frame_options:     'DENY'
		content_type_nosniff: true
	}
}

/**
 * Get security headers map
 */
pub fn (m SecurityHeadersMiddleware) get_headers() map[string]string {
	return {
		'Content-Security-Policy': m.csp_policy
		'Strict-Transport-Security': 'max-age=${m.hsts_max_age}; includeSubDomains'
		'X-Frame-Options': m.frame_options
		'X-Content-Type-Options': if m.content_type_nosniff { 'nosniff' } else { '' }
		'X-XSS-Protection': '1; mode=block'
		'Referrer-Policy': 'strict-origin-when-cross-origin'
		'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
	}
}

/**
 * Input Validation Middleware
 * Validates and sanitizes input before processing
 */
pub struct InputValidationMiddleware {
pub mut:
	max_input_length     int
	max_json_depth       int
	allowed_mime_types   []string
}

/**
 * Create input validation middleware
 */
pub fn new_input_validation_middleware() &InputValidationMiddleware {
	return &InputValidationMiddleware{
		max_input_length: 10000
		max_json_depth: 10
		allowed_mime_types: ['application/json', 'application/x-www-form-urlencoded']
	}
}

/**
 * Validate string input
 */
pub fn (m InputValidationMiddleware) validate_string(value string, field_name string) !string {
	if value.len == 0 {
		return error('${field_name} is required')
	}

	if value.len > m.max_input_length {
		return error('${field_name} exceeds maximum length of ${m.max_input_length}')
	}

	// Sanitize
	sanitized := security.sanitize_input(value) or {
		return error('Invalid characters in ${field_name}')
	}

	return sanitized
}

/**
 * Validate email
 */
pub fn (m InputValidationMiddleware) validate_email(email string) !string {
	if email.len == 0 {
		return error('Email is required')
	}

	if email.len > 255 {
		return error('Email must be less than 255 characters')
	}

	// Basic format check
	if !email.contains('@') || !email.contains('.') {
		return error('Invalid email format')
	}

	// Check for common injection patterns
	if email.contains('..') || email.starts_with('.') || email.ends_with('.') {
		return error('Invalid email format')
	}

	return email
}

/**
 * Validate integer range
 */
pub fn (m InputValidationMiddleware) validate_int(value int, min int, max int, field_name string) !int {
	if value < min || value > max {
		return error('${field_name} must be between ${min} and ${max}')
	}
	return value
}

/**
 * Validate positive number
 */
pub fn (m InputValidationMiddleware) validate_positive(value f64, field_name string) !f64 {
	if value <= 0 {
		return error('${field_name} must be positive')
	}
	return value
}

/**
 * Validate status against allowlist
 */
pub fn (m InputValidationMiddleware) validate_status(value string, allowed []string, field_name string) !string {
	if value !in allowed {
		return error('Invalid ${field_name}. Allowed values: ${allowed.join(", ")}')
	}
	return value
}

/**
 * Audit Logger Middleware
 * Logs security-relevant events
 */
pub struct AuditLogger {
pub mut:
	log_file     string
	log_auth     bool
	log_csrf     bool
	log_rate_limit bool
}

/**
 * Create audit logger
 */
pub fn new_audit_logger(log_file string := 'audit.log') &AuditLogger {
	return &AuditLogger{
		log_file:     log_file
		log_auth:     true
		log_csrf:     true
		log_rate_limit: true
	}
}

/**
 * Log authentication event
 */
pub fn (mut a AuditLogger) log_auth_event(event_type string, username string, ip string, success bool) {
	if !a.log_auth {
		return
	}

	timestamp := time.now().format('2006-01-02 15:04:05')
	status := if success { 'SUCCESS' } else { 'FAILURE' }
	log_entry := '[${timestamp}] AUTH ${status}: user=${username} ip=${ip} event=${event_type}'

	eprintln(log_entry)

	if a.log_file.len > 0 {
		os.write_file(a.log_file, log_entry + '\n') or {}
	}
}

/**
 * Log CSRF failure
 */
pub fn (mut a AuditLogger) log_csrf_failure(username string, ip string) {
	if !a.log_csrf {
		return
	}

	timestamp := time.now().format('2006-01-02 15:04:05')
	log_entry := '[${timestamp}] CSRF FAILURE: user=${username} ip=${ip}'

	eprintln(log_entry)

	if a.log_file.len > 0 {
		os.write_file(a.log_file, log_entry + '\n') or {}
	}
}

/**
 * Log rate limit exceeded
 */
pub fn (mut a AuditLogger) log_rate_limit(ip string, endpoint string) {
	if !a.log_rate_limit {
		return
	}

	timestamp := time.now().format('2006-01-02 15:04:05')
	log_entry := '[${timestamp}] RATE LIMIT: ip=${ip} endpoint=${endpoint}'

	eprintln(log_entry)

	if a.log_file.len > 0 {
		os.write_file(a.log_file, log_entry + '\n') or {}
	}
}

/**
 * Combined Security Context
 * Holds all security-related information for a request
 */
pub struct SecurityContext {
pub mut:
	session        ?services.Session
	csrf_validated bool
	ip_address     string
	user_agent     string
}

/**
 * Create new security context
 */
pub fn new_security_context() &SecurityContext {
	return &SecurityContext{
		session:        none
		csrf_validated: false
		ip_address:     ''
		user_agent:     ''
	}
}

/**
 * Check if user is authenticated
 */
pub fn (c SecurityContext) is_authenticated() bool {
	return c.session is services.Session
}

/**
 * Get username from session
 */
pub fn (c SecurityContext) username() string {
	if c.session is services.Session {
		return c.session!.username
	}
	return ''
}

/**
 * Check if user has role
 */
pub fn (c SecurityContext) has_role(required_role services.UserRole) bool {
	if c.session is services.Session {
		return c.session!.role == required_role
	}
	return false
}

/**
 * Check if user is admin
 */
pub fn (c SecurityContext) is_admin() bool {
	return c.has_role(.admin)
}
