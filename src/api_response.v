module main



// ============================================================================
// API Response Helpers
// Simplified approach for V 0.5.1 compatibility
// ============================================================================

// Create success response with data
pub fn success_response(data_str string) string {
	return '{"success":true,"data":${data_str}}'
}

// Create error response
pub fn error_response(msg string) string {
	return '{"success":false,"error":"${msg}"}'
}

// Create success response with message (no data)
pub fn message_response(msg string) string {
	return '{"success":true,"message":"${msg}"}'
}

// ============================================================================
// Request DTOs (Data Transfer Objects)
// Type-safe request structures for validation
// ============================================================================

// User requests
pub struct CreateUserRequest {
pub:
	name  string
	email string
	age   int
}

pub struct UpdateUserRequest {
pub:
	id    int
	name  string
	email string
	age   int
}

pub struct DeleteUserRequest {
pub:
	id int
}

// Product requests
pub struct CreateProductRequest {
pub:
	name        string
	description string
	price       f64
	stock       int
	category    string
}

pub struct UpdateProductRequest {
pub:
	id          int
	name        string
	description string
	price       f64
	stock       int
	category    string
}

pub struct DeleteProductRequest {
pub:
	id int
}

// Order requests
pub struct CreateOrderRequest {
pub:
	user_id   int
	user_name string
	total     f64
	status    string
}

pub struct UpdateOrderRequest {
pub:
	id     int
	status string
}

pub struct DeleteOrderRequest {
pub:
	id int
}

// ============================================================================
// Request Parsing Helpers
// ============================================================================

// Validate email format
pub fn validate_email(email string) bool {
	return email.contains('@') && email.contains('.')
}
