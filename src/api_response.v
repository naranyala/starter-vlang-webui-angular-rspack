module main

// ============================================================================
// API Response Helpers
// Simple JSON response construction
// ============================================================================

// success_response creates a success response with JSON data string
pub fn success_response(data string) string {
	return '{"success":true,"data":${data}}'
}

// error_response creates an error response
pub fn error_response(msg string) string {
	return '{"success":false,"error":"${msg}"}'
}

// message_response creates a message-only response
pub fn message_response(msg string) string {
	return '{"success":true,"message":"${msg}"}'
}

// ok creates a success response with JSON-encoded data
pub fn ok(data string) string {
	return '{"success":true,"data":${data}}'
}

// created creates a 201-style success response
pub fn created(data string) string {
	return '{"success":true,"data":${data},"message":"Resource created"}'
}

// bad_request creates an error response for invalid requests
pub fn bad_request(msg string) string {
	return '{"success":false,"error":"${msg}"}'
}

// not_found creates an error response for missing resources
pub fn not_found(resource string) string {
	return '{"success":false,"error":"${resource} not found"}'
}

// validation_error creates an error response for validation failures
pub fn validation_error(msg string) string {
	return '{"success":false,"error":"Validation failed: ${msg}"}'
}

// server_error creates an error response for internal errors
pub fn server_error() string {
	return '{"success":false,"error":"Internal server error"}'
}
