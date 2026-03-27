module main

import os
import time
import vwebui as ui
import window_manager
import json

const app_name = 'Desktop Dashboard'
const app_version = '1.0.0'

fn vlog(msg string) {
	t := time.now()
	timestamp := '${t.hour:02}:${t.minute:02}:${t.second:02}'
	println('[${timestamp}] ${msg}')
}

fn main() {
	vlog('========================================')
	vlog('Starting ${app_name} v${app_version}...')
	vlog('========================================')

	// Core services
	mut config := new_config_service()
	config.init()

	mut logger := new_logger_service()
	logger.init()

	mut cache := new_cache_service()
	cache.init()

	mut validation := new_validation_service()
	validation.init()

	// Database service (using DuckDB for full demo)
	mut db := new_duckdb_service('duckdb_demo.json') or {
		vlog('ERROR: Failed to initialize database')
		return
	}

	// DevTools service
	mut devtools := new_devtools_service()
	devtools.init()

	vlog('All services initialized')
	vlog('Database: DuckDB (demo mode with JSON persistence)')
	vlog('Demo data: Users=${db.users.len}, Products=${db.products.len}, Orders=${db.orders.len}')

	// Window Manager Setup
	mut window_mgr := window_manager.new_webui_window_manager()
	window_mgr.init() or {
		vlog('ERROR: Failed to initialize window manager')
		return
	}

	// Setup graceful shutdown
	mut lifecycle := window_manager.new_app_lifecycle()
	lifecycle.init(mut window_mgr) or {
		vlog('ERROR: Failed to initialize lifecycle')
		return
	}

	// Register cleanup handlers
	lifecycle.on_shutdown(fn [mut db, mut cache] () {
		vlog('Cleaning up services...')
		db.dispose()
		cache.dispose()
	})

	// Verify Frontend Build
	dist_path := 'frontend/dist/browser'
	if !os.is_dir(dist_path) {
		vlog('ERROR: Frontend dist not found at ${dist_path}')
		vlog('Please run: ./run.sh build')
		return
	}

	vlog('Frontend dist verified')

	// ============================================================================
	// API Handlers - User CRUD with Type-Safe Serialization
	// ============================================================================

	window_mgr.bind('getUsers', fn [db] (e &ui.Event) string {
		users := db.get_all_users()
		return success_response(json.encode(users))
	})

	window_mgr.bind('createUser', fn [mut db] (e &ui.Event) string {
		// Parse request with type safety
		mut req := CreateUserRequest{}
		json.decode(CreateUserRequest, e.element) or {
			return error_response('Invalid request format')
		}
		
		// Validate required fields
		if req.name.trim_space().len == 0 {
			return error_response('Name is required')
		}
		if !validate_email(req.email) {
			return error_response('Invalid email format')
		}
		if req.age < 1 || req.age > 150 {
			return error_response('Age must be between 1 and 150')
		}
		
		user := db.create_user(req.name, req.email, req.age) or {
			return error_response("${err}")
		}
		return success_response(json.encode(user))
	})

	window_mgr.bind('updateUser', fn [mut db] (e &ui.Event) string {
		// Parse request with type safety
		mut req := UpdateUserRequest{}
		json.decode(UpdateUserRequest, e.element) or {
			return error_response('Invalid request format')
		}
		
		// Validate
		if req.id <= 0 {
			return error_response('Invalid user ID')
		}
		if req.name.trim_space().len == 0 {
			return error_response('Name is required')
		}
		if !validate_email(req.email) {
			return error_response('Invalid email format')
		}
		if req.age < 1 || req.age > 150 {
			return error_response('Age must be between 1 and 150')
		}
		
		user := db.update_user(req.id, req.name, req.email, req.age) or {
			return error_response("${err}")
		}
		return success_response(json.encode(user))
	})

	window_mgr.bind('deleteUser', fn [mut db] (e &ui.Event) string {
		// Parse request
		mut req := DeleteUserRequest{}
		json.decode(DeleteUserRequest, e.element) or {
			return error_response('Invalid request format')
		}
		
		if req.id <= 0 {
			return error_response('Invalid user ID')
		}
		
		db.delete_user(req.id) or {
			return error_response("${err}")
		}
		return message_response('User deleted')
	})

	window_mgr.bind('getUserStats', fn [db] (e &ui.Event) string {
		stats := db.get_stats()
		return success_response(json.encode(stats))
	})

	// ============================================================================
	// Product API Handlers
	// ============================================================================

	window_mgr.bind('getProducts', fn [db] (e &ui.Event) string {
		products := db.get_all_products()
		return success_response(json.encode(products))
	})

	window_mgr.bind('createProduct', fn [mut db] (e &ui.Event) string {
		mut req := CreateProductRequest{}
		json.decode(CreateProductRequest, e.element) or {
			return error_response('Invalid request format')
		}
		
		// Validate
		if req.name.trim_space().len == 0 {
			return error_response('Product name is required')
		}
		if req.price <= 0 {
			return error_response('Price must be positive')
		}
		if req.stock < 0 {
			return error_response('Stock cannot be negative')
		}
		
		product := db.create_product(req.name, req.description, req.price, req.stock, req.category) or {
			return error_response("${err}")
		}
		return success_response(json.encode(product))
	})

	window_mgr.bind('updateProduct', fn [mut db] (e &ui.Event) string {
		mut req := UpdateProductRequest{}
		json.decode(UpdateProductRequest, e.element) or {
			return error_response('Invalid request format')
		}
		
		if req.id <= 0 {
			return error_response('Invalid product ID')
		}
		if req.name.trim_space().len == 0 {
			return error_response('Product name is required')
		}
		if req.price <= 0 {
			return error_response('Price must be positive')
		}
		if req.stock < 0 {
			return error_response('Stock cannot be negative')
		}
		
		product := db.update_product(req.id, req.name, req.description, req.price, req.stock, req.category) or {
			return error_response("${err}")
		}
		return success_response(json.encode(product))
	})

	window_mgr.bind('deleteProduct', fn [mut db] (e &ui.Event) string {
		mut req := DeleteProductRequest{}
		json.decode(DeleteProductRequest, e.element) or {
			return error_response('Invalid request format')
		}
		
		if req.id <= 0 {
			return error_response('Invalid product ID')
		}
		
		db.delete_product(req.id) or {
			return error_response("${err}")
		}
		return message_response('Product deleted')
	})

	window_mgr.bind('getOrders', fn [db] (e &ui.Event) string {
		orders := db.get_all_orders()
		return success_response(json.encode(orders))
	})

	window_mgr.bind('createOrder', fn [mut db] (e &ui.Event) string {
		mut req := CreateOrderRequest{}
		json.decode(CreateOrderRequest, e.element) or {
			return error_response('Invalid request format')
		}
		
		if req.user_id <= 0 {
			return error_response('Invalid user ID')
		}
		if req.user_name.trim_space().len == 0 {
			return error_response('User name is required')
		}
		if req.total <= 0 {
			return error_response('Order total must be positive')
		}
		
		items := []OrderItem{}
		order := db.create_order(req.user_id, req.user_name, items, req.total, req.status) or {
			return error_response("${err}")
		}
		return success_response(json.encode(order))
	})

	window_mgr.bind('updateOrder', fn [mut db] (e &ui.Event) string {
		mut req := UpdateOrderRequest{}
		json.decode(UpdateOrderRequest, e.element) or {
			return error_response('Invalid request format')
		}
		
		if req.id <= 0 {
			return error_response('Invalid order ID')
		}
		if req.status.trim_space().len == 0 {
			return error_response('Status is required')
		}
		
		order := db.update_order(req.id, req.status) or {
			return error_response("${err}")
		}
		return success_response(json.encode(order))
	})

	window_mgr.bind('deleteOrder', fn [mut db] (e &ui.Event) string {
		mut req := DeleteOrderRequest{}
		json.decode(DeleteOrderRequest, e.element) or {
			return error_response('Invalid request format')
		}
		
		if req.id <= 0 {
			return error_response('Invalid order ID')
		}
		
		db.delete_order(req.id) or {
			return error_response("${err}")
		}
		return message_response('Order deleted')
	})

	// ============================================================================
	// DevTools API Handlers
	// ============================================================================

	// Get comprehensive devtools statistics
	window_mgr.bind('devtools.getStats', fn [mut devtools] (e &ui.Event) string {
		devtools.increment_request_count()
		stats := devtools.get_stats()
		return '{"success":true,"data":${json.encode(stats)}}'
	})

	// Get recent logs
	window_mgr.bind('devtools.getLogs', fn [devtools] (e &ui.Event) string {
		logs := devtools.get_logs()
		return '{"success":true,"data":${json.encode(logs)}}'
	})

	// Get error reports
	window_mgr.bind('devtools.getErrors', fn [devtools] (e &ui.Event) string {
		errors := devtools.get_errors()
		return '{"success":true,"data":${json.encode(errors)}}'
	})

	// Get performance metrics
	window_mgr.bind('devtools.getMetrics', fn [devtools] (e &ui.Event) string {
		metrics := devtools.get_metrics()
		return '{"success":true,"data":${json.encode(metrics)}}'
	})

	// Get application uptime
	window_mgr.bind('devtools.getUptime', fn [devtools] (e &ui.Event) string {
		uptime := devtools.get_uptime()
		return '{"success":true,"data":{"uptime":${uptime}}}'
	})

	// Log a message from frontend
	window_mgr.bind('devtools.log', fn [mut devtools] (e &ui.Event) string {
		// Parse log data from event
		devtools.log('info', 'Frontend log', 'devtools')
		return '{"success":true}'
	})

	// Report an error from frontend
	window_mgr.bind('devtools.reportError', fn [mut devtools] (e &ui.Event) string {
		// Parse error data from event
		devtools.report_error('FRONTEND_ERROR', 'Error from frontend', 'devtools')
		return '{"success":true}'
	})

	// Record a performance metric from frontend
	window_mgr.bind('devtools.recordMetric', fn [mut devtools] (e &ui.Event) string {
		// Parse metric data from event
		devtools.record_metric('frontend_metric', 0.0, 'ms')
		return '{"success":true}'
	})

	// Clear logs
	window_mgr.bind('devtools.clearLogs', fn [mut devtools] (e &ui.Event) string {
		devtools.logs = []LogEntry{}
		return '{"success":true}'
	})

	// Clear errors
	window_mgr.bind('devtools.clearErrors', fn [mut devtools] (e &ui.Event) string {
		devtools.errors = []ErrorReport{}
		return '{"success":true}'
	})

	// Window configuration
	window_mgr.set_title(app_name)

	vlog('========================================')
	vlog('Application running')
	vlog('Press Ctrl+C to exit')
	vlog('========================================')

	// Run with graceful shutdown - this should block until window is closed
	lifecycle.run('index.html') or {
		vlog('ERROR: Application run failed: ${err}')
		vlog('Application will now exit')
	}

	vlog('Application closed')
}
