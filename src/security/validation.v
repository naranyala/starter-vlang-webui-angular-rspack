module security

// ============================================================================
// Input Sanitization
// ============================================================================

// sanitize_input removes potentially dangerous characters from input
pub fn sanitize_input(input string) !string {
	if input.len == 0 {
		return error('Empty input')
	}
	
	// Remove null bytes
	mut result := input.replace('\x00', '')
	
	// Remove script tags
	result = result.replace('<script>', '').replace('</script>', '')
	
	// Remove event handlers
	result = result.replace('onclick=', '').replace('onerror=', '').replace('onload=', '')
	
	// Remove javascript: protocol
	result = result.replace('javascript:', '')
	
	// Limit length
	if result.len > 10000 {
		result = result[..10000]
	}
	
	return result
}

// sanitize_html removes HTML tags from input
pub fn sanitize_html(input string) string {
	mut result := input
	mut in_tag := false
	mut output := ''
	
	for c in input {
		if c == '<' {
			in_tag = true
		} else if c == '>' {
			in_tag = false
		} else if !in_tag {
			output += c.str()
		}
	}
	
	return output
}

// sanitize_sql_identifier validates SQL identifier (table/column names)
pub fn sanitize_sql_identifier(identifier string) !string {
	if identifier.len == 0 {
		return error('Empty identifier')
	}
	
	// Check first character
	first := identifier[0]
	if !first.is_letter() && first != '_' {
		return error('Identifier must start with letter or underscore')
	}
	
	// Check all characters
	for c in identifier {
		if !c.is_letter() && !c.is_digit() && c != '_' {
			return error('Invalid character in identifier: ${c}')
		}
	}
	
	// Check for reserved words
	reserved := ['select', 'insert', 'update', 'delete', 'drop', 'create', 'alter', 'from', 'where']
	lower := identifier.to_lower()
	for reserved_word in reserved {
		if lower == reserved_word {
			return error('Reserved word cannot be used as identifier: ${reserved_word}')
		}
	}
	
	return identifier
}

// validate_identifier validates an identifier (alphanumeric + underscore)
pub fn validate_identifier(name string) !string {
	if name.len == 0 {
		return error('Empty name')
	}
	
	for c in name {
		if !c.is_letter() && !c.is_digit() && c != '_' {
			return error('Invalid character: ${c}')
		}
	}
	
	return name
}

// ============================================================================
// Input Validation
// ============================================================================

// validate_email checks if email is valid
pub fn validate_email(email string) bool {
	if email.len == 0 || email.len > 254 {
		return false
	}
	
	// Must contain @
	at_index := email.index('@') or { return false }
	
	// Must have something before @
	if at_index == 0 {
		return false
	}
	
	// Must have domain after @
	if at_index >= email.len - 1 {
		return false
	}
	
	// Domain must contain .
	domain := email[at_index + 1..]
	if !domain.contains('.') {
		return false
	}
	
	return true
}

// validate_phone checks if phone number is valid
pub fn validate_phone(phone string) bool {
	if phone.len < 10 || phone.len > 15 {
		return false
	}
	
	// Allow digits, spaces, dashes, parentheses, and plus
	for c in phone {
		if !c.is_digit() && c != ' ' && c != '-' && c != '(' && c != ')' && c != '+' {
			return false
		}
	}
	
	return true
}

// validate_url checks if URL is valid
pub fn validate_url(url string) bool {
	if url.len == 0 {
		return false
	}
	
	// Must start with http:// or https://
	if !url.starts_with('http://') && !url.starts_with('https://') {
		return false
	}
	
	// Must have domain
	if url.len < 10 {
		return false
	}
	
	return true
}

// validate_username checks if username is valid
pub fn validate_username(username string) bool {
	if username.len < 3 || username.len > 50 {
		return false
	}
	
	for c in username {
		if !c.is_letter() && !c.is_digit() && c != '_' && c != '.' {
			return false
		}
	}
	
	return true
}

// ============================================================================
// XSS Prevention
// ============================================================================

// escape_html escapes HTML special characters
pub fn escape_html(input string) string {
	mut result := input
	result = result.replace('&', '&amp;')
	result = result.replace('<', '&lt;')
	result = result.replace('>', '&gt;')
	result = result.replace('"', '&quot;')
	result = result.replace('\'', '&#x27;')
	return result
}

// escape_js escapes JavaScript special characters
pub fn escape_js(input string) string {
	mut result := input
	result = result.replace('\\', '\\\\')
	result = result.replace('"', '\\"')
	result = result.replace('\'', '\\\'')
	result = result.replace('\n', '\\n')
	result = result.replace('\r', '\\r')
	return result
}

// ============================================================================
// Rate Limiting
// ============================================================================

// RateLimiter implements a simple rate limiter
pub struct RateLimiter {
pub mut:
	requests map[string][]u64
	max_requests int
	window_seconds int
}

// new_rate_limiter creates a new rate limiter
pub fn new_rate_limiter(max_requests int, window_seconds int) &RateLimiter {
	return &RateLimiter{
		requests: map[string][]u64{}
		max_requests: max_requests
		window_seconds: window_seconds
	}
}

// check checks if request is allowed
pub fn (mut rl RateLimiter) check(key string) bool {
	now := u64(time.now().unix())
	window_start := now - u64(rl.window_seconds)
	
	// Get existing requests
	existing := rl.requests[key] or { []u64{} }
	
	// Filter to only recent requests
	mut recent := []u64{}
	for ts in existing {
		if ts > window_start {
			recent << ts
		}
	}
	
	// Check if over limit
	if recent.len >= rl.max_requests {
		rl.requests[key] = recent
		return false
	}
	
	// Add current request
	recent << now
	rl.requests[key] = recent
	return true
}

// cleanup removes old entries
pub fn (mut rl RateLimiter) cleanup() int {
	now := u64(time.now().unix())
	window_start := now - u64(rl.window_seconds)
	
	mut removed := 0
	for key, timestamps in rl.requests {
		mut recent := []u64{}
		for ts in timestamps {
			if ts > window_start {
				recent << ts
			} else {
				removed++
			}
		}
		rl.requests[key] = recent
	}
	
	return removed
}
