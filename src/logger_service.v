module main

import time

// LogLevel represents the severity of a log message
pub enum LogLevel {
	debug
	info
	warn
	error
}

// LoggerService - Handles application logging
pub struct LoggerService {
pub mut:
	min_level      LogLevel
	log_to_console bool
	log_to_file    bool
	log_file_path  string
}

// new_logger_service creates a new LoggerService instance
pub fn new_logger_service() &LoggerService {
	return &LoggerService{
		min_level: LogLevel.info
		log_to_console: true
		log_to_file: false
		log_file_path: ''
	}
}

// init initializes the logger service
pub fn (s LoggerService) init() bool {
	return true
}

// set_level sets the minimum log level
pub fn (mut s LoggerService) set_level(level LogLevel) {
	s.min_level = level
}

// should_log checks if a message at the given level should be logged
fn (s LoggerService) should_log(level LogLevel) bool {
	return int(level) >= int(s.min_level)
}

// format_message formats a log message with timestamp and level
fn (s LoggerService) format_message(level LogLevel, msg string) string {
	t := time.now()
	timestamp := '${t.hour:02}:${t.minute:02}:${t.second:02}'
	mut level_str := 'INFO'
	if level == .debug {
		level_str = 'DEBUG'
	} else if level == .warn {
		level_str = 'WARN'
	} else if level == .error {
		level_str = 'ERROR'
	}
	return '[${timestamp}] ${level_str}: ${msg}'
}

// log logs a message at the specified level
pub fn (s LoggerService) log(level LogLevel, msg string) {
	if !s.should_log(level) {
		return
	}
	formatted := s.format_message(level, msg)
	if s.log_to_console {
		println(formatted)
	}
}

// debug logs a debug message
pub fn (s LoggerService) debug(msg string) {
	s.log(LogLevel.debug, msg)
}

// info logs an info message
pub fn (s LoggerService) info(msg string) {
	s.log(LogLevel.info, msg)
}

// warn logs a warning message
pub fn (s LoggerService) warn(msg string) {
	s.log(LogLevel.warn, msg)
}

// error logs an error message
pub fn (s LoggerService) error(msg string) {
	s.log(LogLevel.error, msg)
}
