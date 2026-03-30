module middleware

import json

/**
 * Validation Middleware
 * Provides input validation functions
 */

/**
 * Validate required string
 */
pub fn required(value string, field_name string) ! {
	if value.len == 0 {
		return error('${field_name} is required')
	}
}

/**
 * Validate email format
 */
pub fn validate_email(email string) ! {
	if email.len == 0 {
		return error('Email is required')
	}
	if !email.contains('@') || !email.contains('.') {
		return error('Invalid email format')
	}
	if email.len > 255 {
		return error('Email must be less than 255 characters')
	}
}

/**
 * Validate string length
 */
pub fn validate_length(value string, min int, max int, field_name string) ! {
	if value.len < min {
		return error('${field_name} must be at least ${min} characters')
	}
	if value.len > max {
		return error('${field_name} must be less than ${max} characters')
	}
}

/**
 * Validate integer range
 */
pub fn validate_int_range(value int, min int, max int, field_name string) ! {
	if value < min || value > max {
		return error('${field_name} must be between ${min} and ${max}')
	}
}

/**
 * Validate positive number
 */
pub fn validate_positive(value f64, field_name string) ! {
	if value <= 0 {
		return error('${field_name} must be positive')
	}
}

/**
 * Validate non-negative number
 */
pub fn validate_non_negative(value int, field_name string) ! {
	if value < 0 {
		return error('${field_name} cannot be negative')
	}
}

/**
 * Validate value is in allowlist
 */
pub fn validate_in_allowlist[T](value T, allowlist []T, field_name string) ! {
	if value !in allowlist {
		return error('Invalid ${field_name}')
	}
}

/**
 * Sanitize string input
 * Removes dangerous characters
 */
pub fn sanitize_string(input string) string {
	mut result := input.replace('\x00', '')
	result = result.replace('<script>', '')
	result = result.replace('javascript:', '')
	return result
}

/**
 * Trim whitespace
 */
pub fn trim(value string) string {
	return value.trim_space()
}

/**
 * Validation errors collection
 */
pub struct ValidationErrors {
pub mut:
	errors []string
}

pub fn new_validation_errors() &ValidationErrors {
	return &ValidationErrors{
		errors: []string{}
	}
}

pub fn (mut ve ValidationErrors) add(error string) {
	ve.errors << error
}

pub fn (mut ve ValidationErrors) has_errors() bool {
	return ve.errors.len > 0
}

pub fn (ve ValidationErrors) to_string() string {
	if ve.errors.len == 0 {
		return ''
	}
	return ve.errors.join(', ')
}

/**
 * Rate Limit Middleware
 * Provides rate limiting functionality
 */
pub struct RateLimiter {
pub mut:
	requests_per_minute int
	requests_per_hour   int
	minute_requests     map[string][]u64
	hour_requests       map[string][]u64
}

pub fn new_rate_limiter(requests_per_minute int := 60, requests_per_hour int := 1000) &RateLimiter {
	return &RateLimiter{
		requests_per_minute: requests_per_minute
		requests_per_hour: requests_per_hour
		minute_requests: map[string][]u64{}
		hour_requests: map[string][]u64{}
	}
}

pub fn (mut rl RateLimiter) check_rate_limit(identifier string) bool {
	now := u64(time.now().unix())
	minute_ago := now - 60
	hour_ago := now - 3600

	// Clean old requests
	mut minute_requests := rl.minute_requests[identifier] or { []u64{} }
	mut hour_requests := rl.hour_requests[identifier] or { []u64{} }

	mut new_minute := []u64{}
	for ts in minute_requests {
		if ts > minute_ago {
			new_minute << ts
		}
	}
	rl.minute_requests[identifier] = new_minute

	mut new_hour := []u64{}
	for ts in hour_requests {
		if ts > hour_ago {
			new_hour << ts
		}
	}
	rl.hour_requests[identifier] = new_hour

	// Check limits
	if new_minute.len >= rl.requests_per_minute {
		return false
	}
	if new_hour.len >= rl.requests_per_hour {
		return false
	}

	// Record request
	rl.minute_requests[identifier] << now
	rl.hour_requests[identifier] << now

	return true
}

/**
 * Logger Middleware
 * Provides request logging
 */
pub struct LoggerMiddleware {
pub mut:
	log_file string
}

pub fn new_logger_middleware(log_file string := '') &LoggerMiddleware {
	return &LoggerMiddleware{
		log_file: log_file
	}
}

pub fn (mut lm LoggerMiddleware) log_request(method string, path string, status int) {
	timestamp := time.now().format('2006-01-02 15:04:05')
	log_entry := '[${timestamp}] ${method} ${path} - ${status}'

	println(log_entry)

	if lm.log_file.len > 0 {
		os.write_file(lm.log_file, log_entry + '\n') or {
			println('Failed to write log: ${err}')
		}
	}
}

pub fn (mut lm LoggerMiddleware) log_error(message string, err string) {
	timestamp := time.now().format('2006-01-02 15:04:05')
	log_entry := '[${timestamp}] ERROR: ${message} - ${err}'

	eprintln(log_entry)

	if lm.log_file.len > 0 {
		os.write_file(lm.log_file, log_entry + '\n') or {
			println('Failed to write log: ${err}')
		}
	}
}

/**
 * CORS Middleware
 * Provides CORS headers
 */
pub struct CORSMiddleware {
pub mut:
	allowed_origins []string
	allowed_methods []string
	allowed_headers []string
}

pub fn new_cors_middleware() &CORSMiddleware {
	return &CORSMiddleware{
		allowed_origins: ['*']
		allowed_methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
		allowed_headers: ['Content-Type', 'Authorization']
	}
}

pub fn (cm CORSMiddleware) get_headers() map[string]string {
	return {
		'Access-Control-Allow-Origin': cm.allowed_origins[0]
		'Access-Control-Allow-Methods': cm.allowed_methods.join(', ')
		'Access-Control-Allow-Headers': cm.allowed_headers.join(', ')
	}
}
