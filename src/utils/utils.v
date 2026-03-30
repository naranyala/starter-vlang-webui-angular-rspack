module utils

import json

/**
 * JSON Utilities
 */

/**
 * Parse JSON string to map
 */
pub fn parse_json(json_str string) !map[string]json.Any {
	return json.decode(map[string]json.Any, json_str) or {
		return error('Invalid JSON: ${err.msg}')
	}
}

/**
 * Get value from JSON map with default
 */
pub fn json_get_string(data map[string]json.Any, key string, default string := '') string {
	val := data[key] or { return default }
	return val.string()
}

pub fn json_get_int(data map[string]json.Any, key string, default int := 0) int {
	val := data[key] or { return default }
	return int(val)
}

pub fn json_get_float(data map[string]json.Any, key string, default f64 := 0.0) f64 {
	val := data[key] or { return default }
	return f64(val)
}

pub fn json_get_bool(data map[string]json.Any, key string, default bool := false) bool {
	val := data[key] or { return default }
	return bool(val)
}

/**
 * String Utilities
 */

/**
 * Generate UUID-like string
 */
pub fn generate_id() string {
	timestamp := time.now().unix_nano()
	random := u64(timestamp % 1000000)
	return '${timestamp}_hex_${random}'
}

/**
 * Format currency
 */
pub fn format_currency(amount f64, currency string := '$') string {
	sign := if amount < 0 { '-' } else { '' }
	abs_amount := if amount < 0 { -amount } else { amount }
	return '${sign}${currency}${abs_amount:,.2f}'
}

/**
 * Format date
 */
pub fn format_date(date_str string, format string := 'MM/DD/YYYY') string {
	if date_str.len == 0 {
		return ''
	}

	// Parse ISO date
	parts := date_str.split('T')[0].split('-')
	if parts.len < 3 {
		return date_str
	}

	year := parts[0]
	month := parts[1]
	day := parts[2]

	return match format {
		'MM/DD/YYYY' { '${month}/${day}/${year}' }
		'DD/MM/YYYY' { '${day}/${month}/${year}' }
		'YYYY-MM-DD' { '${year}-${month}-${day}' }
		'MMM DD, YYYY' { '${get_month_name(int(month))} ${day}, ${year}' }
		else { date_str }
	}
}

fn get_month_name(month int) string {
	return match month {
		1 { 'Jan' }
		2 { 'Feb' }
		3 { 'Mar' }
		4 { 'Apr' }
		5 { 'May' }
		6 { 'Jun' }
		7 { 'Jul' }
		8 { 'Aug' }
		9 { 'Sep' }
		10 { 'Oct' }
		11 { 'Nov' }
		12 { 'Dec' }
		else { 'Unknown' }
	}
}

/**
 * Truncate string
 */
pub fn truncate(s string, max_len int, suffix string := '...') string {
	if s.len <= max_len {
		return s
	}
	return s[..max_len - suffix.len] + suffix
}

/**
 * Slugify string
 */
pub fn slugify(s string) string {
	mut result := s.to_lower()
	result = result.replace(' ', '-')
	result = result.replace('_', '-')
	result = result.replace('--', '-')
	return result
}

/**
 * Math Utilities
 */

/**
 * Clamp value between min and max
 */
pub fn clamp(value f64, min f64, max f64) f64 {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

/**
 * Round to decimal places
 */
pub fn round(value f64, decimals int) f64 {
	multiplier := f64(1)
	for _ in 0 .. decimals {
		multiplier *= 10
	}
	return f64(int(value * multiplier + 0.5)) / multiplier
}

/**
 * Percentage calculation
 */
pub fn percentage(part f64, total f64) f64 {
	if total == 0 {
		return 0
	}
	return (part / total) * 100
}

/**
 * Collection Utilities
 */

/**
 * Get first item from array or default
 */
pub fn first[T](items []T, default T) T {
	if items.len == 0 {
		return default
	}
	return items[0]
}

/**
 * Get last item from array or default
 */
pub fn last[T](items []T, default T) T {
	if items.len == 0 {
		return default
	}
	return items[items.len - 1]
}

/**
 * Chunk array into smaller arrays
 */
pub fn chunk[T](items []T, size int) [][]T {
	mut result := [][]T{}
	if items.len == 0 || size <= 0 {
		return result
	}

	mut i := 0
	for i < items.len {
		end := i + size
		if end > items.len {
			end = items.len
		}
		result << items[i..end]
		i = end
	}

	return result
}

/**
 * Unique items from array
 */
pub fn unique[T](items []T) []T {
	mut seen := map[T]bool{}
	mut result := []T{}

	for item in items {
		if item !in seen {
			seen[item] = true
			result << item
		}
	}

	return result
}

/**
 * Group by key
 */
pub fn group_by[T, K](items []T, key_fn fn (T) K) map[K][]T {
	mut result := map[K][]T{}

	for item in items {
		key := key_fn(item)
		if key !in result {
			result[key] = []T{}
		}
		result[key] << item
	}

	return result
}

/**
 * File Utilities
 */

/**
 * Ensure directory exists
 */
pub fn ensure_dir(path string) ! {
	if !os.exists(path) {
		os.mkdir_all(path) or { return err }
	}
}

/**
 * Read file with default
 */
pub fn read_file_with_default(path string, default string) string {
	if !os.exists(path) {
		return default
	}
	return os.read_file(path) or { default }
}

/**
 * Write JSON file atomically
 */
pub fn write_json_atomic(path string, data json.Any) ! {
	temp_path := '${path}.tmp'
	json_data := json.encode(data)
	os.write_file(temp_path, json_data) or { return err }
	os.rename(temp_path, path) or { return err }
}

/**
 * Environment Utilities
 */

/**
 * Get environment variable with default
 */
pub fn get_env(key string, default string := '') string {
	return os.env(key) or { default }
}

/**
 * Get environment variable as int
 */
pub fn get_env_int(key string, default int := 0) int {
	val := os.env(key) or { return default }
	return val.int()
}

/**
 * Get environment variable as bool
 */
pub fn get_env_bool(key string, default bool := false) bool {
	val := os.env(key) or { return default }
	return val.to_lower() in ['true', '1', 'yes', 'on']
}
