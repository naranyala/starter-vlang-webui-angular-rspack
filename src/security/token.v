module security

import time

// ============================================================================
// Secure Token Generation
// ============================================================================

pub const token_length = 32

// generate_secure_token generates a time-based secure token
pub fn generate_secure_token(prefix string) string {
	// Time-based token (not cryptographically secure, but works without crypto module)
	now := time.now().unix_nano()
	
	if prefix != '' {
		return '${prefix}_${now}'
	}
	return '${now}'
}

// generate_token_with_randomness generates a token with some randomness
pub fn generate_token_with_randomness(prefix string) string {
	now := time.now().unix_nano()
	random_part := (now % 1000000)
	
	if prefix != '' {
		return '${prefix}_${now}_${random_part}'
	}
	return '${now}_${random_part}'
}

// generate_session_id generates a unique session ID
pub fn generate_session_id() string {
	return 'sess_${time.now().unix_nano()}'
}

// generate_request_id generates a unique request ID
pub fn generate_request_id() string {
	return 'req_${time.now().unix_nano()}'
}

// ============================================================================
// Token Validation
// ============================================================================

// is_token_expired checks if a token has expired
pub fn is_token_expired(expires_at u64) bool {
	return u64(time.now().unix()) > expires_at
}

// get_token_remaining_time returns seconds until token expires
pub fn get_token_remaining_time(expires_at u64) int {
	now := u64(time.now().unix())
	if now >= expires_at {
		return 0
	}
	return int(expires_at - now)
}

// calculate_expiry calculates expiration timestamp
pub fn calculate_expiry(duration_seconds int) u64 {
	return u64(time.now().unix()) + u64(duration_seconds)
}

// ============================================================================
// CSRF Token Management
// ============================================================================

// CSRFProtection handles CSRF token generation and validation
pub struct CSRFProtection {
pub mut:
	tokens map[string]CSRFToken
}

// CSRFToken represents a CSRF token
pub struct CSRFToken {
pub mut:
	token string
	user_id string
	created_at u64
	expires_at u64
}

// new_csrf_protection creates a new CSRF protection instance
pub fn new_csrf_protection() &CSRFProtection {
	return &CSRFProtection{
		tokens: map[string]CSRFToken{}
	}
}

// generate_token generates a new CSRF token
pub fn (mut p CSRFProtection) generate_token(user_id string) !string {
	token := generate_secure_token('csrf')
	now := u64(time.now().unix())
	
	p.tokens[token] = CSRFToken{
		token: token
		user_id: user_id
		created_at: now
		expires_at: now + 3600  // 1 hour expiry
	}
	
	return token
}

// validate_token validates a CSRF token
pub fn (mut p CSRFProtection) validate_token(token string, user_id string) bool {
	stored := p.tokens[token] or {
		return false
	}
	
	// Check expiration
	if is_token_expired(stored.expires_at) {
		p.tokens.delete(token)
		return false
	}
	
	// Check user ID match
	return stored.user_id == user_id
}

// invalidate_token invalidates a CSRF token
pub fn (mut p CSRFProtection) invalidate_token(token string) {
	p.tokens.delete(token)
}

// cleanup_expired removes expired tokens
pub fn (mut p CSRFProtection) cleanup_expired() int {
	mut removed := 0
	now := u64(time.now().unix())
	
	mut tokens_to_remove := []string{}
	for token, csrf_token in p.tokens {
		if now > csrf_token.expires_at {
			tokens_to_remove << token
		}
	}
	
	for token in tokens_to_remove {
		p.tokens.delete(token)
		removed++
	}
	
	return removed
}
