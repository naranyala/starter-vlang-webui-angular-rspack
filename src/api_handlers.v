module main

import vwebui as ui
import json
import window_manager

// register_api_handlers registers all API handlers with the window manager
pub fn register_api_handlers(mut window_mgr &window_manager.WebUIWindowManager, mut storage &JsonStorageService) {
	register_user_handlers(mut window_mgr, mut storage)
	register_product_handlers(mut window_mgr, mut storage)
	register_order_handlers(mut window_mgr, mut storage)
}

// ============================================================================
// User API Handlers
// ============================================================================

fn register_user_handlers(mut window_mgr &window_manager.WebUIWindowManager, mut storage &JsonStorageService) {
	window_mgr.bind('getUsers', fn [storage] (e &ui.Event) string {
		users := storage.get_all_users()
		return ok(json.encode(users))
	})

	window_mgr.bind('createUser', fn [mut storage] (e &ui.Event) string {
		mut req := CreateUserRequest{}
		json.decode(CreateUserRequest, e.element) or {
			return bad_request('Invalid request format')
		}

		// Use validation pipeline
		result := validate_user_request(req.name, req.email, req.age)
		if !result.is_valid {
			return validation_error(result.first_error())
		}

		user := storage.create_user(req.name, req.email, req.age) or {
			return bad_request('${err}')
		}
		return created(json.encode(user))
	})

	window_mgr.bind('updateUser', fn [mut storage] (e &ui.Event) string {
		mut req := UpdateUserRequest{}
		json.decode(UpdateUserRequest, e.element) or {
			return bad_request('Invalid request format')
		}

		if req.id <= 0 {
			return bad_request('Invalid user ID')
		}

		// Use validation pipeline
		result := validate_user_request(req.name, req.email, req.age)
		if !result.is_valid {
			return validation_error(result.first_error())
		}

		user := storage.update_user(req.id, req.name, req.email, req.age) or {
			return bad_request('${err}')
		}
		return ok(json.encode(user))
	})

	window_mgr.bind('deleteUser', fn [mut storage] (e &ui.Event) string {
		mut req := DeleteUserRequest{}
		json.decode(DeleteUserRequest, e.element) or {
			return bad_request('Invalid request format')
		}

		if req.id <= 0 {
			return bad_request('Invalid user ID')
		}

		storage.delete_user(req.id) or {
			return bad_request('${err}')
		}
		return message_response('User deleted')
	})

	window_mgr.bind('getUserStats', fn [storage] (e &ui.Event) string {
		stats := storage.get_user_stats()
		return ok(json.encode(stats))
	})
}

// ============================================================================
// Product API Handlers
// ============================================================================

fn register_product_handlers(mut window_mgr &window_manager.WebUIWindowManager, mut storage &JsonStorageService) {
	window_mgr.bind('getProducts', fn [storage] (e &ui.Event) string {
		products := storage.get_all_products()
		return ok(json.encode(products))
	})

	window_mgr.bind('createProduct', fn [mut storage] (e &ui.Event) string {
		mut req := CreateProductRequest{}
		json.decode(CreateProductRequest, e.element) or {
			return bad_request('Invalid request format')
		}

		// Use validation pipeline
		result := validate_product_request(req.name, req.price, req.stock)
		if !result.is_valid {
			return validation_error(result.first_error())
		}

		product := storage.create_product(req.name, req.description, req.price, req.stock, req.category) or {
			return bad_request('${err}')
		}
		return created(json.encode(product))
	})

	window_mgr.bind('updateProduct', fn [mut storage] (e &ui.Event) string {
		mut req := UpdateProductRequest{}
		json.decode(UpdateProductRequest, e.element) or {
			return bad_request('Invalid request format')
		}

		if req.id <= 0 {
			return bad_request('Invalid product ID')
		}

		// Use validation pipeline
		result := validate_product_request(req.name, req.price, req.stock)
		if !result.is_valid {
			return validation_error(result.first_error())
		}

		product := storage.update_product(req.id, req.name, req.description, req.price, req.stock, req.category) or {
			return bad_request('${err}')
		}
		return ok(json.encode(product))
	})

	window_mgr.bind('deleteProduct', fn [mut storage] (e &ui.Event) string {
		mut req := DeleteProductRequest{}
		json.decode(DeleteProductRequest, e.element) or {
			return bad_request('Invalid request format')
		}

		if req.id <= 0 {
			return bad_request('Invalid product ID')
		}

		storage.delete_product(req.id) or {
			return bad_request('${err}')
		}
		return message_response('Product deleted')
	})
}

// ============================================================================
// Order API Handlers
// ============================================================================

fn register_order_handlers(mut window_mgr &window_manager.WebUIWindowManager, mut storage &JsonStorageService) {
	window_mgr.bind('getOrders', fn [storage] (e &ui.Event) string {
		orders := storage.get_all_orders()
		return ok(json.encode(orders))
	})

	window_mgr.bind('createOrder', fn [mut storage] (e &ui.Event) string {
		mut req := CreateOrderRequest{}
		json.decode(CreateOrderRequest, e.element) or {
			return bad_request('Invalid request format')
		}

		// Use validation pipeline
		result := validate_order_request(req.user_id, req.user_name, req.total)
		if !result.is_valid {
			return validation_error(result.first_error())
		}

		items := []OrderItem{}
		order := storage.create_order(req.user_id, req.user_name, items, req.total, req.status) or {
			return bad_request('${err}')
		}
		return created(json.encode(order))
	})

	window_mgr.bind('updateOrder', fn [mut storage] (e &ui.Event) string {
		mut req := UpdateOrderRequest{}
		json.decode(UpdateOrderRequest, e.element) or {
			return bad_request('Invalid request format')
		}

		if req.id <= 0 {
			return bad_request('Invalid order ID')
		}
		if req.status.trim_space().len == 0 {
			return bad_request('Status is required')
		}

		order := storage.update_order(req.id, req.status) or {
			return bad_request('${err}')
		}
		return ok(json.encode(order))
	})

	window_mgr.bind('deleteOrder', fn [mut storage] (e &ui.Event) string {
		mut req := DeleteOrderRequest{}
		json.decode(DeleteOrderRequest, e.element) or {
			return bad_request('Invalid request format')
		}

		if req.id <= 0 {
			return bad_request('Invalid order ID')
		}

		storage.delete_order(req.id) or {
			return bad_request('${err}')
		}
		return message_response('Order deleted')
	})
}

// ============================================================================
// Request DTOs (Data Transfer Objects)
// ============================================================================

// User requests
pub struct CreateUserRequest {
pub:
	name  string
	email string
	age   int
}

pub struct UpdateUserRequest {
pub:
	id    int
	name  string
	email string
	age   int
}

pub struct DeleteUserRequest {
pub:
	id int
}

// Product requests
pub struct CreateProductRequest {
pub:
	name        string
	description string
	price       f64
	stock       int
	category    string
}

pub struct UpdateProductRequest {
pub:
	id          int
	name        string
	description string
	price       f64
	stock       int
	category    string
}

pub struct DeleteProductRequest {
pub:
	id int
}

// Order requests
pub struct CreateOrderRequest {
pub:
	user_id   int
	user_name string
	total     f64
	status    string
}

pub struct UpdateOrderRequest {
pub:
	id     int
	status string
}

pub struct DeleteOrderRequest {
pub:
	id int
}
