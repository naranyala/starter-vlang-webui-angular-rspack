module main

// ============================================================================
// Validation Pipeline
// Provides composable validation for request data
// ============================================================================

// ValidationError represents a single validation error
pub struct ValidationError {
pub mut:
	field   string
	message string
}

// ValidationResult holds validation outcome
pub struct ValidationResult {
pub mut:
	is_valid bool
	errors   []ValidationError
}

// first_error returns the first validation error message
pub fn (r ValidationResult) first_error() string {
	if r.errors.len == 0 {
		return ''
	}
	return r.errors[0].message
}

// error_messages returns all error messages joined
pub fn (r ValidationResult) error_messages() string {
	if r.errors.len == 0 {
		return ''
	}
	mut msgs := []string{}
	for err in r.errors {
		msgs << err.message
	}
	return msgs.join(', ')
}

// Validator provides validation API
pub struct Validator {
pub mut:
	errors []ValidationError
}

// new_validator creates a new Validator instance
pub fn new_validator() &Validator {
	return &Validator{
		errors: []ValidationError{}
	}
}

// add_error adds a validation error
fn (mut v Validator) add_error(field string, message string) {
	v.errors << ValidationError{
		field: field
		message: message
	}
}

// required validates that a string is not empty
pub fn (mut v Validator) required(field string, value string) {
	if value.trim_space().len == 0 {
		v.add_error(field, '${field} is required')
	}
}

// email validates email format
pub fn (mut v Validator) email(field string, value string) {
	if value.len > 0 && !value.contains('@') {
		v.add_error(field, 'Invalid email format')
	}
}

// min_length validates minimum string length
pub fn (mut v Validator) min_length(field string, value string, min int) {
	if value.len > 0 && value.len < min {
		v.add_error(field, '${field} must be at least ${min} characters')
	}
}

// max_length validates maximum string length
pub fn (mut v Validator) max_length(field string, value string, max int) {
	if value.len > max {
		v.add_error(field, '${field} must be at most ${max} characters')
	}
}

// int_range validates integer is within range
pub fn (mut v Validator) int_range(field string, value int, min int, max int) {
	if value < min || value > max {
		v.add_error(field, '${field} must be between ${min} and ${max}')
	}
}

// positive validates that a number is positive
pub fn (mut v Validator) positive(field string, value f64) {
	if value <= 0 {
		v.add_error(field, '${field} must be positive')
	}
}

// non_negative validates that a number is non-negative
pub fn (mut v Validator) non_negative(field string, value f64) {
	if value < 0 {
		v.add_error(field, '${field} cannot be negative')
	}
}

// result returns the validation result
pub fn (v Validator) result() ValidationResult {
	return ValidationResult{
		is_valid: v.errors.len == 0
		errors: v.errors.clone()
	}
}

// is_valid returns true if validation passed
pub fn (v Validator) is_valid() bool {
	return v.errors.len == 0
}

// ============================================================================
// Pre-built Validators for Common Types
// ============================================================================

// validate_user_request validates a user create/update request
pub fn validate_user_request(name string, email string, age int) ValidationResult {
	mut v := new_validator()
	v.required('name', name)
	v.email('email', email)
	v.int_range('age', age, 1, 150)
	return v.result()
}

// validate_product_request validates a product create/update request
pub fn validate_product_request(name string, price f64, stock int) ValidationResult {
	mut v := new_validator()
	v.required('name', name)
	v.positive('price', price)
	v.non_negative('stock', stock)
	return v.result()
}

// validate_order_request validates an order create request
pub fn validate_order_request(user_id int, user_name string, total f64) ValidationResult {
	mut v := new_validator()
	if user_id <= 0 {
		v.add_error('user_id', 'Invalid user ID')
	}
	v.required('user_name', user_name)
	v.positive('total', total)
	return v.result()
}
