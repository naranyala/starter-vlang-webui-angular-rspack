module main

// ValidationService - Provides basic input validation utilities
// Note: For fluent validation, use validator.v instead
pub struct ValidationService {
pub mut:
	initialized bool
}

// new_validation_service creates a new ValidationService instance
pub fn new_validation_service() &ValidationService {
	return &ValidationService{}
}

// init initializes the validation service
pub fn (mut s ValidationService) init() bool {
	s.initialized = true
	return true
}

// validate_email checks if a string is a valid email format
pub fn (s ValidationService) validate_email(email string) bool {
	return email.contains('@') && email.contains('.') && email.len > 5
}

// validate_required checks if a string is not empty
pub fn (s ValidationService) validate_required(value string) bool {
	return value.trim_space().len > 0
}

// validate_min_length checks if a string meets minimum length
pub fn (s ValidationService) validate_min_length(value string, min int) bool {
	return value.len >= min
}

// validate_max_length checks if a string doesn't exceed maximum length
pub fn (s ValidationService) validate_max_length(value string, max int) bool {
	return value.len <= max
}

// validate_int_range checks if an integer is within a range
pub fn (s ValidationService) validate_int_range(value int, min int, max int) bool {
	return value >= min && value <= max
}

// validate_positive checks if a number is positive
pub fn (s ValidationService) validate_positive(value f64) bool {
	return value > 0
}

// validate_non_negative checks if a number is non-negative
pub fn (s ValidationService) validate_non_negative(value f64) bool {
	return value >= 0
}
