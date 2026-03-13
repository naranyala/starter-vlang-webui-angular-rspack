module services

import time
import json

// Logger Service
pub struct LoggerService {
pub mut:
	service_name string
	min_level    string
}

pub fn new_logger_service() &LoggerService {
	return &LoggerService{
		service_name: 'logger'
		min_level: 'info'
	}
}

pub fn (s &LoggerService) log(level string, message string) {
	t := time.now()
	timestamp := '${t.hour:02}:${t.minute:02}:${t.second:02}'
	println('[${timestamp}] [${level.to_upper()}] [${s.service_name}] ${message}')
}

pub fn (s &LoggerService) info(message string) {
	if s.min_level == 'debug' || s.min_level == 'info' {
		s.log('info', message)
	}
}

pub fn (s &LoggerService) warn(message string) {
	if s.min_level == 'debug' || s.min_level == 'info' || s.min_level == 'warn' {
		s.log('warn', message)
	}
}

pub fn (s &LoggerService) error(message string) {
	s.log('error', message)
}

// System Info Service
pub struct SystemInfoService {
pub mut:
	hostname    string
	os_info     string
	arch        string
	cpu_count   string
	initialized bool
}

pub fn new_system_info_service() &SystemInfoService {
	return &SystemInfoService{
		hostname: 'localhost'
		os_info: 'linux'
		arch: 'x64'
		cpu_count: '4'
		initialized: true
	}
}

pub fn (s &SystemInfoService) init() {
	// Already initialized in constructor
}

pub fn (s &SystemInfoService) to_json() string {
	data := {
		'hostname': s.hostname
		'os': s.os_info
		'arch': s.arch
		'cpu_count': s.cpu_count
	}
	return json.encode(data)
}
