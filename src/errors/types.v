module errors

import time

// ============================================================================
// Error Codes - Structured error codes for the application
// ============================================================================

// ErrorCode represents structured error codes
pub enum ErrorCode {
	// Database errors (1000-1999)
	db_connection_failed      = 1001
	db_query_failed           = 1002
	db_constraint_violation   = 1003
	db_not_found              = 1004
	db_already_exists         = 1005
	db_transaction_failed     = 1006

	// Configuration errors (2000-2999)
	config_not_found          = 2001
	config_invalid            = 2002
	config_missing_field      = 2003
	config_parse_error        = 2004

	// Data format errors (3000-3999)
	serialization_failed      = 3001
	deserialization_failed    = 3002
	invalid_format            = 3003
	encoding_error            = 3004
	decoding_error            = 3005

	// Validation errors (4000-4999)
	validation_failed         = 4001
	missing_required_field    = 4002
	invalid_field_value       = 4003
	field_too_short           = 4004
	field_too_long            = 4005
	invalid_email             = 4006
	invalid_phone             = 4007

	// Resource errors (5000-5999)
	resource_not_found        = 5001
	user_not_found            = 5002
	entity_not_found          = 5003
	file_not_found            = 5004
	directory_not_found       = 5005

	// System errors (6000-6999)
	internal_error            = 6001
	timeout_error             = 6002
	permission_denied         = 6003
	rate_limit_exceeded       = 6004
	service_unavailable       = 6005
	unsupported_operation     = 6006

	// Network errors (7000-7999)
	network_error             = 7001
	connection_refused        = 7002
	dns_resolution_failed     = 7003
	ssl_error                 = 7004

	// Plugin/Extension errors (8000-8999)
	plugin_error              = 8001
	plugin_not_found          = 8002
	plugin_load_failed        = 8003

	// Unknown error
	unknown                   = 9999
}

// ErrorSeverity indicates the severity level of an error
pub enum ErrorSeverity {
	info
	warning
	error
	critical
	fatal
}

// ErrorValue represents a structured error with full context
pub struct ErrorValue {
pub mut:
	code             ErrorCode
	message          string
	details          string
	field            string
	cause            string
	timestamp        u64
	source           string
	source_file      string
	source_line      int
	context          map[string]string
	stack_trace      []string
	severity         ErrorSeverity
	retryable        bool
	recovery_suggestion string
}

// ============================================================================
// Error Category Helpers
// ============================================================================

// get_error_category returns a human-readable category for an error
pub fn get_error_category(err ErrorValue) string {
	match err.code {
		.db_connection_failed, .db_query_failed, .db_constraint_violation,
		.db_not_found, .db_already_exists, .db_transaction_failed {
			return 'Database Error'
		}
		.config_not_found, .config_invalid, .config_missing_field, .config_parse_error {
			return 'Configuration Error'
		}
		.validation_failed, .missing_required_field, .invalid_field_value,
		.field_too_short, .field_too_long, .invalid_email, .invalid_phone {
			return 'Validation Error'
		}
		.resource_not_found, .user_not_found, .entity_not_found,
		.file_not_found, .directory_not_found {
			return 'Not Found Error'
		}
		.internal_error, .timeout_error, .permission_denied,
		.rate_limit_exceeded, .service_unavailable, .unsupported_operation {
			return 'System Error'
		}
		.network_error, .connection_refused, .dns_resolution_failed, .ssl_error {
			return 'Network Error'
		}
		else {
			return 'Unknown Error'
		}
	}
}

// is_critical returns true for critical/fatal errors
pub fn is_critical(err ErrorValue) bool {
	return err.severity == .critical || err.severity == .fatal ||
		err.code == .internal_error || err.code == .db_connection_failed ||
		err.code == .service_unavailable
}

// is_warning returns true for warning-level errors
pub fn is_warning(err ErrorValue) bool {
	return err.severity == .warning || err.severity == .info ||
		err.code == .validation_failed || err.code == .config_not_found
}

// is_retryable returns true for errors that might succeed on retry
pub fn is_retryable(err ErrorValue) bool {
	return err.retryable || err.code == .network_error ||
		err.code == .timeout_error || err.code == .service_unavailable
}

// get_severity returns the severity level for an error code
pub fn get_severity(code ErrorCode) ErrorSeverity {
	match code {
		.internal_error, .db_connection_failed, .service_unavailable {
			return .critical
		}
		.timeout_error, .network_error, .permission_denied {
			return .error
		}
		.validation_failed, .config_not_found, .resource_not_found {
			return .warning
		}
		else {
			return .error
		}
	}
}
