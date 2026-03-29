module main

import os

// ConfigService - Manages application configuration
pub struct ConfigService {
pub mut:
	config      map[string]string
	env_prefix  string
	initialized bool
}

// new_config_service creates a new ConfigService instance
pub fn new_config_service() &ConfigService {
	return &ConfigService{
		config: map[string]string{}
		env_prefix: 'APP_'
	}
}

// init initializes the configuration by loading from environment
pub fn (mut s ConfigService) init() bool {
	s.load_from_env()
	s.initialized = true
	return true
}

// get_string retrieves a string value with optional default
pub fn (s ConfigService) get_string(key string, default string) string {
	return s.config[key] or { default }
}

// get_int retrieves an integer value with optional default
pub fn (s ConfigService) get_int(key string, default int) int {
	val := s.config[key] or { return default }
	return val.int()
}

// get_bool retrieves a boolean value with optional default
pub fn (s ConfigService) get_bool(key string, default bool) bool {
	val := s.config[key] or { return default }
	return val.to_lower() in ['true', '1', 'yes', 'on']
}

// set sets a configuration value
pub fn (mut s ConfigService) set(key string, value string) {
	s.config[key] = value
}

// load_from_env loads configuration from environment variables
pub fn (mut s ConfigService) load_from_env() bool {
	env_vars := os.environ()
	for _, env in env_vars {
		idx := env.index('=') or { continue }
		if idx > 0 {
			key := env[0..idx]
			value := env[idx+1..]
			if key.starts_with(s.env_prefix) {
				config_key := key[s.env_prefix.len..].to_lower()
				s.config[config_key] = value
			}
		}
	}
	return true
}
