module errors

// ============================================================================
// Error Collection and Aggregation
// ============================================================================

// ErrorCollection holds multiple errors
pub struct ErrorCollection {
pub mut:
	errors []ErrorValue
	max_errors int
}

// new_error_collection creates a new error collection
pub fn new_error_collection(max_errors int) &ErrorCollection {
	return &ErrorCollection{
		errors: []ErrorValue{}
		max_errors: max_errors
	}
}

// add adds an error to the collection
pub fn (mut c ErrorCollection) add(err ErrorValue) {
	if c.errors.len < c.max_errors {
		c.errors << err
	}
}

// has_errors returns true if collection has errors
pub fn (c ErrorCollection) has_errors() bool {
	return c.errors.len > 0
}

// count returns the number of errors
pub fn (c ErrorCollection) count() int {
	return c.errors.len
}

// get_errors returns all errors
pub fn (c ErrorCollection) get_errors() []ErrorValue {
	return c.errors.clone()
}

// get_first returns the first error or none
pub fn (c ErrorCollection) get_first() ?ErrorValue {
	if c.errors.len == 0 {
		return none
	}
	return c.errors[0]
}

// clear clears all errors
pub fn (mut c ErrorCollection) clear() {
	c.errors = []ErrorValue{}
}

// ============================================================================
// Error Filtering
// ============================================================================

// filter_by_severity filters errors by severity
pub fn filter_by_severity(errors []ErrorValue, severity ErrorSeverity) []ErrorValue {
	mut filtered := []ErrorValue{}
	for err in errors {
		if err.severity == severity {
			filtered << err
		}
	}
	return filtered
}

// filter_by_code filters errors by error code
pub fn filter_by_code(errors []ErrorValue, code ErrorCode) []ErrorValue {
	mut filtered := []ErrorValue{}
	for err in errors {
		if err.code == code {
			filtered << err
		}
	}
	return filtered
}

// filter_retryable filters retryable errors
pub fn filter_retryable(errors []ErrorValue) []ErrorValue {
	mut filtered := []ErrorValue{}
	for err in errors {
		if err.retryable {
			filtered << err
		}
	}
	return filtered
}

// ============================================================================
// Error Statistics
// ============================================================================

// ErrorStats holds error statistics
pub struct ErrorStats {
pub mut:
	total int
	by_severity map[ErrorSeverity]int
	by_code map[ErrorCode]int
	by_source map[string]int
	retryable_count int
	critical_count int
}

// get_error_stats calculates statistics for a list of errors
pub fn get_error_stats(errors []ErrorValue) ErrorStats {
	mut stats := ErrorStats{
		total: errors.len
		by_severity: map[ErrorSeverity]int{}
		by_code: map[ErrorCode]int{}
		by_source: map[string]int{}
		retryable_count: 0
		critical_count: 0
	}
	
	for err in errors {
		// Count by severity
		count := stats.by_severity[err.severity] or { 0 }
		stats.by_severity[err.severity] = count + 1
		
		// Count by code
		count = stats.by_code[err.code] or { 0 }
		stats.by_code[err.code] = count + 1
		
		// Count by source
		count = stats.by_source[err.source] or { 0 }
		stats.by_source[err.source] = count + 1
		
		// Count retryable
		if err.retryable {
			stats.retryable_count++
		}
		
		// Count critical
		if is_critical(err) {
			stats.critical_count++
		}
	}
	
	return stats
}

// ============================================================================
// Error Recovery
// ============================================================================

// RecoveryAction represents a recovery action
pub struct RecoveryAction {
pub mut:
	name string
	fn fn () bool
	priority int
}

// RecoveryResult holds the result of recovery attempt
pub struct RecoveryResult {
pub mut:
	success bool
	actions_taken []string
	remaining_errors []ErrorValue
}

// attempt_recovery tries to recover from errors
pub fn attempt_recovery(errors []ErrorValue, actions []RecoveryAction) RecoveryResult {
	mut result := RecoveryResult{
		success: true
		actions_taken: []string{}
		remaining_errors: []ErrorValue{}
	}
	
	// Sort actions by priority
	mut sorted_actions := actions.clone()
	for i := 0; i < sorted_actions.len - 1; i++ {
		for j := i + 1; j < sorted_actions.len; j++ {
			if sorted_actions[i].priority > sorted_actions[j].priority {
				tmp := sorted_actions[i]
				sorted_actions[i] = sorted_actions[j]
				sorted_actions[j] = tmp
			}
		}
	}
	
	// Try each recovery action
	for action in sorted_actions {
		if action.fn() {
			result.actions_taken << action.name
		}
	}
	
	// Collect remaining errors
	for err in errors {
		if !err.retryable || !result.actions_taken.contains('retry') {
			result.remaining_errors << err
		}
	}
	
	result.success = result.remaining_errors.len == 0
	return result
}

// ============================================================================
// Error Logging Helpers
// ============================================================================

// log_error prints error to console
pub fn log_error(err ErrorValue) {
	level_str := match err.severity {
		.info { 'INFO' }
		.warning { 'WARN' }
		.error { 'ERROR' }
		.critical { 'CRITICAL' }
		.fatal { 'FATAL' }
	}
	
	println('[${level_str}] ${err.code.str()}: ${err.message}')
	if err.details != '' {
		println('  Details: ${err.details}')
	}
	if err.field != '' {
		println('  Field: ${err.field}')
	}
}

// log_errors prints multiple errors
pub fn log_errors(errors []ErrorValue) {
	println('=== Error Summary ===')
	println('Total errors: ${errors.len}')
	
	stats := get_error_stats(errors)
	println('Critical: ${stats.critical_count}')
	println('Retryable: ${stats.retryable_count}')
	
	for err in errors {
		log_error(err)
	}
}
