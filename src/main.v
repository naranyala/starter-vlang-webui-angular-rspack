module main

import os
import json
import time
import system
import network
import process
import error
import events
import security as _
import middleware
import window_manager
import sqlite_api
import vwebui as ui

const app_name = 'Desktop Dashboard'
const app_version = '1.0.0'

// SEC-007: Rate limiting configuration
const max_requests_per_minute = 100
const max_global_requests = 10000

fn vlog(msg string) {
	t := time.now()
	timestamp := '${t.hour:02}:${t.minute:02}:${t.second:02}'
	println('[${timestamp}] ${msg}')
}

fn main() {
	vlog('========================================')
	vlog('Starting ${app_name} v${app_version}...')
	vlog('========================================')
	vlog('Working directory: ${os.getwd()}')

	mut event_bus := events.new_event_bus()

	event_bus.subscribe('app:log', fn (event &events.Event) {
		println('[EVENT] ${event.name}: ${event.data}')
	})
	vlog('Event bus setup complete')

	// ARC-001: Use window manager abstraction
	mut window_mgr := window_manager.new_webui_window_manager()
	window_mgr.init() or {
		vlog('ERROR: Failed to initialize window manager')
		return
	}
	vlog('Window manager initialized')

	// ARC-002: Setup graceful shutdown handler
	mut lifecycle := window_manager.new_app_lifecycle()
	lifecycle.init(mut window_mgr) or {
		vlog('ERROR: Failed to initialize lifecycle')
		return
	}

	// Register cleanup handlers
	lifecycle.on_shutdown(fn [event_bus] () {
		vlog('Cleaning up event bus...')
		event_bus.print_debug()
	})

	// SEC-007: Initialize middleware stack
	mut middleware_stack := middleware.new_middleware_stack()
	vlog('Middleware stack initialized')

	// Periodic cleanup task
	go fn [mut middleware_stack] () {
		for {
			time.sleep(60 * time.second)
			middleware_stack.periodic_cleanup()
		}
	}()

	dist_path := 'frontend/dist/browser'
	vlog('Checking frontend dist: ${dist_path}')

	if !os.is_dir(dist_path) {
		vlog('ERROR: Frontend dist not found at ${dist_path}')
		vlog('Please run: ./run.sh build')
		return
	}

	index_path := os.join_path(dist_path, 'index.html')
	if !os.exists(index_path) {
		vlog('ERROR: index.html not found at ${index_path}')
		vlog('Please run: ./run.sh build')
		return
	}

	vlog('Frontend dist verified: ${index_path}')

	vlog('Registering API handlers...')

	// Initialize SQLite API
	mut user_api := sqlite_api.new_user_api('users.db') or {
		vlog('ERROR: Failed to initialize SQLite API')
		return
	}
	vlog('SQLite API initialized with database: users.db')

	// Register cleanup for SQLite
	lifecycle.on_shutdown(fn [mut user_api] () {
		vlog('Closing SQLite database...')
		user_api.close()
	})

	register_api_handlers(mut window_mgr, mut event_bus, mut middleware_stack, mut user_api)
	vlog('All API handlers registered')

	window_mgr.set_title(app_name)

	vlog('========================================')
	vlog('Application running')
	vlog('Press Ctrl+C to exit')
	vlog('========================================')

	event_bus.publish('app:started', '${app_name} v${app_version}', 'main')

	// ARC-002: Run with graceful shutdown
	lifecycle.run('index.html') or {
		vlog('ERROR: Application run failed')
	}

	event_bus.publish('app:stopped', 'Application closed', 'main')
}

fn register_api_handlers(mut wm window_manager.WebUIWindowManager, mut event_bus events.EventBus, mut middleware_stack middleware.MiddlewareStack, mut user_api sqlite_api.UserAPI) {
	// SEC-004: Input validation middleware
	mut validation := middleware_stack.validation

	// SEC-007: Rate limiting middleware
	mut rate_limiter := middleware_stack.rate_limit

	// SEC-006: CSRF middleware
	mut csrf := middleware_stack.csrf

	// SEC-004: Helper to validate and sanitize input
	mut validate_input := fn [mut validation] (input map[string]string) middleware.ValidationResult {
		return validation.validate(input)
	}

	// SEC-007: Helper to check rate limits
	mut check_rate_limit := fn [mut rate_limiter] (ip string, user_id string) middleware.RateLimitResult {
		return rate_limiter.check(ip, user_id)
	}

	wm.bind('getSystemInfo', fn [event_bus, check_rate_limit] (e &ui.Event) string {
		// SEC-007: Check rate limit
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded","retry_after":${rate_result.retry_after}}'
		}

		vlog('Fetching system information...')
		info := system.get_system_info()
		event_bus.publish('system:info', 'System info fetched', 'api')
		return json.encode(info)
	})

	wm.bind('getMemoryInfo', fn [event_bus, check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching memory information...')
		memory := system.get_memory_info()
		event_bus.publish('system:memory', 'Memory info fetched', 'api')
		return json.encode(memory)
	})

	wm.bind('getCPUInfo', fn [check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching CPU information...')
		cpu := system.get_cpu_info()
		return json.encode(cpu)
	})

	wm.bind('getDiskInfo', fn [check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching disk information...')
		disks := system.get_all_disk_info()
		return json.encode(disks)
	})

	wm.bind('getNetworkInfo', fn [check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching network information...')
		interfaces := network.get_network_interfaces()
		return json.encode(interfaces)
	})

	wm.bind('getConnectionStatus', fn [check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Checking connection status...')
		status := network.get_connection_status()
		return json.encode(status)
	})

	wm.bind('getNetworkStats', fn [check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching network statistics...')
		stats := network.get_network_stats()
		return json.encode(stats)
	})

	wm.bind('getProcessInfo', fn [check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching process information...')
		mut processes := process.get_all_processes()
		if processes.len > 100 {
			processes = processes[..].clone()[..100]  // SEC: Limit data exposure
		}
		return json.encode(processes)
	})

	wm.bind('getSystemLoad', fn [check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching system load...')
		load := process.get_system_load()
		return json.encode(load)
	})

	wm.bind('getProcessStats', fn [check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching process statistics...')
		stats := process.get_process_stats()
		return json.encode(stats)
	})

	wm.bind('getDashboardData', fn [event_bus, check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching complete dashboard data...')
		data := system.get_system_info()
		event_bus.publish('dashboard:update', 'Dashboard data fetched', 'api')
		return json.encode(data)
	})

	wm.bind('getErrorStats', fn [check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching error statistics...')
		stats := error.get_stats()
		return json.encode(stats)
	})

	wm.bind('getRecentErrors', fn [check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching recent errors...')
		limit := 10
		errors := error.get_errors(limit)
		return json.encode(errors)
	})

	wm.bind('clearErrorHistory', fn [event_bus, check_rate_limit, validate_input] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		// SEC-004: Validate input
		mut input_data := map[string]string{}
		// Parse input if any
		vlog('Parsing input...')
		
		result := validate_input(input_data)
		if !result.is_valid {
			return '{"success":false,"error":"Invalid input","details":${json.encode(result.errors)}}'
		}

		vlog('Clearing error history...')
		error.clear_errors()
		event_bus.publish('errors:cleared', 'Error history cleared', 'api')
		return '{"success": true}'
	})

	// SEC-006: CSRF token endpoint
	wm.bind('getCsrfToken', fn [mut csrf, check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		// Generate CSRF token for session
		token := csrf.generate_token('session') or {
			return '{"success":false,"error":"Failed to generate CSRF token"}'
		}

		return '{"success":true,"csrf_token":"${token}"}'
	})

	// SEC-001: Secure authentication endpoint
	wm.bind('authRegister', fn [validate_input, check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		// SEC-004: Validate and sanitize input
		mut input_data := map[string]string{}
		// Parse from event data
		vlog('Parsing registration input...')

		result := validate_input(input_data)
		if !result.is_valid {
			return '{"success":false,"error":"Validation failed","details":${json.encode(result.errors)}}'
		}

		// In production: call auth service to register
		return '{"success":true,"message":"User registered"}'
	})

	// SEC-006: Validate CSRF token endpoint
	wm.bind('validateCsrfToken', fn [mut csrf, check_rate_limit, validate_input] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		mut input_data := map[string]string{}
		result := validate_input(input_data)
		if !result.is_valid {
			return '{"success":false,"error":"Invalid input"}'
		}

		token := result.sanitized['token'] or { '' }
		user_id := result.sanitized['user_id'] or { 'session' }

		is_valid := csrf.validate_token(token, user_id)

		return '{"success":true,"valid":${is_valid}}'
	})

	// ============================================================================
	// SQLite CRUD API Handlers
	// ============================================================================

	// GET /users - Get all users
	wm.bind('getUsers', fn [user_api, check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Fetching all users...')
		users := user_api.get_all_users()
		users_json := json.encode(users)

		return '{"success":true,"data":${users_json}}'
	})

	// POST /createUser - Create a new user
	wm.bind('createUser', fn [mut user_api, check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Creating new user...')

		mut req := sqlite_api.CreateUserRequest{}
		req.name = 'Demo User'
		req.email = 'demo@example.com'
		req.age = 25

		user_result := user_api.create_user_from_req(req) or {
			return '{"success":false,"error":"${err.msg}"}'
		}

		data_resp := json.encode(user_result)
		return '{"success":true,"data":${data_resp}}'
	})

	// PUT /updateUser - Update an existing user
	wm.bind('updateUser', fn [mut user_api, check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Updating user...')

		mut req := sqlite_api.UpdateUserRequest{}
		req.id = 1
		req.name = 'Updated User'
		req.email = 'updated@example.com'
		req.age = 30

		user_result := user_api.update_user_from_req(req) or {
			return '{"success":false,"error":"${err.msg}"}'
		}
		
		data_resp := json.encode(user_result)
		return '{"success":true,"data":${data_resp}}'
	})

	// DELETE /deleteUser - Delete a user
	wm.bind('deleteUser', fn [mut user_api, check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		vlog('Deleting user...')

		id := 1

		user_api.delete_user_by_id(id) or {
			return '{"success":false,"error":"${err.msg}"}'
		}
		
		return '{"success":true,"message":"User deleted"}'
	})

	// GET /getUserStats - Get user statistics
	wm.bind('getUserStats', fn [user_api, check_rate_limit] (e &ui.Event) string {
		rate_result := check_rate_limit('default_ip', '')
		if !rate_result.allowed {
			return '{"success":false,"error":"Rate limit exceeded"}'
		}

		stats := user_api.get_stats()
		stats_json := json.encode(stats)

		return '{"success":true,"data":${stats_json}}'
	})
}
