module errors

import time

// ============================================================================
// Error Creation Functions
// ============================================================================

// new creates a basic error with code and message
pub fn new(code ErrorCode, message string) ErrorValue {
	return ErrorValue{
		code: code
		message: message
		timestamp: u64(time.now().unix())
		source: 'backend'
		severity: get_severity(code)
		context: map[string]string{}
	}
}

// with_details creates an error with additional details
pub fn with_details(code ErrorCode, message string, details string) ErrorValue {
	mut err := new(code, message)
	err.details = details
	return err
}

// with_field creates an error associated with a specific field
pub fn with_field(code ErrorCode, message string, field string) ErrorValue {
	mut err := new(code, message)
	err.field = field
	return err
}

// with_context creates an error with context map
pub fn with_context(code ErrorCode, message string, context map[string]string) ErrorValue {
	mut err := new(code, message)
	err.context = context.clone()
	return err
}

// with_source creates an error with source information
pub fn with_source(code ErrorCode, message string, source string) ErrorValue {
	mut err := new(code, message)
	err.source = source
	return err
}

// ============================================================================
// Specific Error Constructors
// ============================================================================

// db_error creates a database error
pub fn db_error(operation string, message string) ErrorValue {
	mut err := new(.db_query_failed, 'Database ${operation} failed: ${message}')
	err.context['operation'] = operation
	err.severity = .error
	return err
}

// validation_error creates a validation error for a field
pub fn validation_error(field string, message string) ErrorValue {
	mut err := with_field(.validation_failed, message, field)
	err.severity = .warning
	return err
}

// not_found_error creates a resource not found error
pub fn not_found_error(resource string, id string) ErrorValue {
	mut err := new(.resource_not_found, '${resource} not found: ${id}')
	err.context['resource'] = resource
	err.context['id'] = id
	return err
}

// already_exists_error creates a duplicate resource error
pub fn already_exists_error(resource string, field string, value string) ErrorValue {
	mut err := new(.db_already_exists, '${resource} with ${field}="${value}" already exists')
	err.context['resource'] = resource
	err.context['field'] = field
	err.context['value'] = value
	return err
}

// internal_error creates an internal system error
pub fn internal_error(message string) ErrorValue {
	mut err := new(.internal_error, message)
	err.severity = .critical
	return err
}

// timeout_error creates a timeout error
pub fn timeout_error(operation string, timeout_ms int) ErrorValue {
	mut err := new(.timeout_error, 'Operation "${operation}" timed out after ${timeout_ms}ms')
	err.context['operation'] = operation
	err.context['timeout_ms'] = timeout_ms.str()
	err.retryable = true
	return err
}

// permission_error creates a permission denied error
pub fn permission_error(resource string, action string) ErrorValue {
	mut err := new(.permission_denied, 'Permission denied: ${action} on ${resource}')
	err.context['resource'] = resource
	err.context['action'] = action
	return err
}

// config_error creates a configuration error
pub fn config_error(message string) ErrorValue {
	mut err := new(.config_invalid, 'Configuration error: ${message}')
	err.severity = .critical
	return err
}

// network_error creates a network error
pub fn network_error(message string) ErrorValue {
	mut err := new(.network_error, message)
	err.retryable = true
	return err
}

// serialization_error creates a serialization error
pub fn serialization_error(message string) ErrorValue {
	return new(.serialization_failed, 'Serialization failed: ${message}')
}

// deserialization_error creates a deserialization error
pub fn deserialization_error(message string) ErrorValue {
	return new(.deserialization_failed, 'Deserialization failed: ${message}')
}

// ============================================================================
// Error Conversion
// ============================================================================

// from_string creates an error from a string message
pub fn from_string(message string) ErrorValue {
	return new(.unknown, message)
}

// from_panic creates an error from a panic message
pub fn from_panic(panic_msg string) ErrorValue {
	mut err := new(.internal_error, 'Panic: ${panic_msg}')
	err.severity = .fatal
	return err
}

// ============================================================================
// Error Response Helpers
// ============================================================================

// to_json converts error to JSON string
pub fn to_json(err ErrorValue) string {
	return json.encode(err) or { '{}' }
}

// to_response creates a standard API error response
pub fn to_response(err ErrorValue) string {
	response := {
		'success': false
		'error': to_json(err)
	}
	return json.encode(response) or { '{"success":false}' }
}

// ok_json creates a success response with data
pub fn ok_json(data string) string {
	response := {
		'success': true
		'data': data
		'error': 0
	}
	return json.encode(response) or { '{"success":true}' }
}

// err_json creates an error response
pub fn err_json(err ErrorValue) string {
	return to_response(err)
}

// ============================================================================
// Error Analysis
// ============================================================================

// get_error_summary returns a brief summary of the error
pub fn get_error_summary(err ErrorValue) string {
	return '[${err.code.str()}] ${err.message}'
}

// get_full_error_report returns a detailed error report
pub fn get_full_error_report(err ErrorValue) string {
	mut report := '=== Error Report ===\n'
	report += 'Code: ${err.code.str()}\n'
	report += 'Message: ${err.message}\n'
	if err.details != '' {
		report += 'Details: ${err.details}\n'
	}
	if err.field != '' {
		report += 'Field: ${err.field}\n'
	}
	report += 'Severity: ${err.severity.str()}\n'
	report += 'Source: ${err.source}\n'
	report += 'Timestamp: ${err.timestamp}\n'
	
	if err.context.len > 0 {
		report += 'Context:\n'
		for key, value in err.context {
			report += '  ${key}: ${value}\n'
		}
	}
	
	return report
}
