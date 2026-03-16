module security

import time

// ============================================================================
// Password Hashing Utilities
// ============================================================================

// hash_password creates a secure hash of a password
pub fn hash_password(password string) string {
	// Generate salt from timestamp
	salt := '${time.now().unix_nano()}_${password.len}'
	
	// Generate hash
	hash := pbkdf2_simple(password, salt, 10000)
	
	return '\$${salt}\$${hash}'
}

// verify_password checks if a password matches a hash
pub fn verify_password(password string, hash_string string) bool {
	parts := hash_string.split('\$')
	if parts.len != 3 {
		return false
	}
	
	salt := parts[1]
	stored_hash := parts[2]
	computed_hash := pbkdf2_simple(password, salt, 10000)
	
	return secure_compare(computed_hash, stored_hash)
}

// pbkdf2_simple implements a simplified PBKDF2-like hashing
fn pbkdf2_simple(password string, salt string, iterations int) string {
	mut data := '${password}${salt}'
	mut final_hash := u64(0)
	
	for i in 0 .. iterations {
		final_hash = u64(0)
		for b in data {
			final_hash = final_hash * 31 + u64(b)
		}
		data = '${data}${final_hash}'
		_ = i
	}
	
	return '${final_hash}'
}

// secure_compare compares two strings in constant time
fn secure_compare(a string, b string) bool {
	if a.len != b.len {
		return false
	}
	mut result := 0
	for i := 0; i < a.len; i++ {
		result |= int(a[i]) ^ int(b[i])
	}
	return result == 0
}

// ============================================================================
// Password Validation
// ============================================================================

// validate_password_strength checks if password meets requirements
pub fn validate_password_strength(password string) ! {
	if password.len < 8 {
		return error('Password must be at least 8 characters')
	}
	
	has_upper := false
	has_lower := false
	has_digit := false
	has_special := false
	
	for c in password {
		if c.is_upper() {
			has_upper = true
		}
		if c.is_lower() {
			has_lower = true
		}
		if c.is_digit() {
			has_digit = true
		}
		if !c.is_letter() && !c.is_digit() {
			has_special = true
		}
	}
	
	if !has_upper {
		return error('Password must contain at least one uppercase letter')
	}
	if !has_lower {
		return error('Password must contain at least one lowercase letter')
	}
	if !has_digit {
		return error('Password must contain at least one number')
	}
	if !has_special {
		return error('Password must contain at least one special character')
	}
}

// is_password_valid checks password validity without error messages
pub fn is_password_valid(password string) bool {
	if password.len < 8 {
		return false
	}
	
	mut has_upper := false
	mut has_lower := false
	mut has_digit := false
	
	for c in password {
		if c.is_upper() {
			has_upper = true
		}
		if c.is_lower() {
			has_lower = true
		}
		if c.is_digit() {
			has_digit = true
		}
	}
	
	return has_upper && has_lower && has_digit
}
