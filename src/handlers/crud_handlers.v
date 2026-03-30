module handlers

import services
import models
import middleware

/**
 * API Response structure
 */
pub struct ApiResponse {
	success bool        `json:"success"`
	data    ?string     `json:"data,omitempty"`
	error   ?string     `json:"error,omitempty"`
	message ?string     `json:"message,omitempty"`
}

/**
 * Success response helper
 */
pub fn success_response(data string, message string := '') string {
	mut resp := ApiResponse{
		success: true
		data: data
	}
	if message.len > 0 {
		resp.message = message
	}
	return resp.to_json()
}

/**
 * Error response helper
 */
pub fn error_response(message string) string {
	return ApiResponse{
		success: false
		error: message
	}.to_json()
}

/**
 * Authenticated response helper (includes user info)
 */
pub fn auth_response(data string, session services.Session) string {
	return ApiResponse{
		success: true
		data: data
		message: 'Authenticated as ${session.username}'
	}.to_json()
}

/**
 * Validation helper for handlers
 */
fn validate_user_input(name string, email string, age int) ! {
	// Name validation
	if name.len == 0 {
		return error('Name is required')
	}
	if name.len > 100 {
		return error('Name must be less than 100 characters')
	}
	
	// Sanitize name
	name = security.sanitize_input(name) or {
		return error('Invalid characters in name')
	}

	// Email validation
	if email.len == 0 {
		return error('Email is required')
	}
	if email.len > 255 {
		return error('Email must be less than 255 characters')
	}
	if !email.contains('@') || !email.contains('.') {
		return error('Invalid email format')
	}
	if email.contains('..') || email.starts_with('.') || email.ends_with('.') {
		return error('Invalid email format')
	}

	// Age validation
	if age < 1 || age > 150 {
		return error('Age must be between 1 and 150')
	}
}

/**
 * User Handlers with validation
 * CRUD operations for users
 */
pub struct UserHandler {
pub mut:
	storage services.StorageService
}

pub fn (mut h UserHandler) get_users() string {
	users := h.storage.get_all_users()
	return success_response(users.to_json())
}

pub fn (mut h UserHandler) get_user_by_id(id int) string {
	if id <= 0 {
		return error_response('Invalid user ID')
	}
	
	user := h.storage.get_user_by_id(id) or {
		return error_response(err.msg)
	}
	return success_response(user.to_json())
}

pub fn (mut h UserHandler) create_user(name string, email string, age int) string {
	// Validate input FIRST (before any processing)
	validate_user_input(name, email, age) or {
		return error_response(err.msg)
	}

	user := h.storage.create_user(name, email, age) or {
		return error_response(err.msg)
	}
	return success_response(user.to_json(), 'User created successfully')
}

pub fn (mut h UserHandler) update_user(id int, name string, email string, age int) string {
	if id <= 0 {
		return error_response('Invalid user ID')
	}

	// Validate input
	validate_user_input(name, email, age) or {
		return error_response(err.msg)
	}

	user := h.storage.update_user(id, name, email, age) or {
		return error_response(err.msg)
	}
	return success_response(user.to_json(), 'User updated successfully')
}

pub fn (mut h UserHandler) delete_user(id int) string {
	if id <= 0 {
		return error_response('Invalid user ID')
	}

	h.storage.delete_user(id) or {
		return error_response(err.msg)
	}
	return success_response('', 'User deleted successfully')
}

pub fn (mut h UserHandler) get_user_stats() string {
	stats := h.storage.get_user_stats()
	return success_response(stats.to_json())
}

/**
 * Validation helper for products
 */
fn validate_product_input(name string, description string, price f64, stock int, category string) ! {
	// Name validation
	if name.len == 0 {
		return error('Product name is required')
	}
	if name.len > 200 {
		return error('Product name must be less than 200 characters')
	}
	name = security.sanitize_input(name) or {
		return error('Invalid characters in product name')
	}

	// Description validation (optional)
	if description.len > 1000 {
		return error('Description must be less than 1000 characters')
	}

	// Price validation
	if price <= 0 {
		return error('Price must be positive')
	}
	if price > 1000000 {
		return error('Price exceeds maximum allowed')
	}

	// Stock validation
	if stock < 0 {
		return error('Stock cannot be negative')
	}
	if stock > 1000000 {
		return error('Stock exceeds maximum allowed')
	}

	// Category validation
	if category.len == 0 {
		return error('Category is required')
	}
	if category.len > 50 {
		return error('Category must be less than 50 characters')
	}
}

/**
 * Product Handlers with validation
 * CRUD operations for products
 */
pub struct ProductHandler {
pub mut:
	storage services.StorageService
}

pub fn (mut h ProductHandler) get_products() string {
	products := h.storage.get_all_products()
	return success_response(products.to_json())
}

pub fn (mut h ProductHandler) get_product_by_id(id int) string {
	if id <= 0 {
		return error_response('Invalid product ID')
	}
	
	product := h.storage.get_product_by_id(id) or {
		return error_response(err.msg)
	}
	return success_response(product.to_json())
}

pub fn (mut h ProductHandler) create_product(name string, description string, price f64, stock int, category string) string {
	validate_product_input(name, description, price, stock, category) or {
		return error_response(err.msg)
	}

	product := h.storage.create_product(name, description, price, stock, category) or {
		return error_response(err.msg)
	}
	return success_response(product.to_json(), 'Product created successfully')
}

pub fn (mut h ProductHandler) update_product(id int, name string, description string, price f64, stock int, category string) string {
	if id <= 0 {
		return error_response('Invalid product ID')
	}

	validate_product_input(name, description, price, stock, category) or {
		return error_response(err.msg)
	}

	product := h.storage.update_product(id, name, description, price, stock, category) or {
		return error_response(err.msg)
	}
	return success_response(product.to_json(), 'Product updated successfully')
}

pub fn (mut h ProductHandler) delete_product(id int) string {
	if id <= 0 {
		return error_response('Invalid product ID')
	}

	h.storage.delete_product(id) or {
		return error_response(err.msg)
	}
	return success_response('', 'Product deleted successfully')
}

pub fn (mut h ProductHandler) get_product_stats() string {
	stats := h.storage.get_product_stats()
	return success_response(stats.to_json())
}

/**
 * Validation helper for orders
 */
fn validate_order_input(user_id int, user_name string, total f64, status string, items []models.OrderItem) ! {
	// User validation
	if user_id <= 0 {
		return error('Invalid user ID')
	}

	// User name validation
	if user_name.len == 0 {
		return error('Customer name is required')
	}
	if user_name.len > 100 {
		return error('Customer name must be less than 100 characters')
	}
	user_name = security.sanitize_input(user_name) or {
		return error('Invalid characters in customer name')
	}

	// Total validation
	if total < 0 {
		return error('Total cannot be negative')
	}
	if total > 1000000 {
		return error('Total exceeds maximum allowed')
	}

	// Status validation
	valid_statuses := ['pending', 'completed', 'shipped', 'cancelled']
	if status !in valid_statuses {
		return error('Invalid order status. Allowed: ${valid_statuses.join(", ")}')
	}

	// Items validation (if provided)
	if items.len > 0 {
		for item in items {
			if item.quantity <= 0 {
				return error('Item quantity must be positive')
			}
			if item.price < 0 {
				return error('Item price cannot be negative')
			}
			if item.product_name.len == 0 {
				return error('Item product name is required')
			}
		}
	}
}

/**
 * Order Handlers with validation
 * CRUD operations for orders
 */
pub struct OrderHandler {
pub mut:
	storage services.StorageService
}

pub fn (mut h OrderHandler) get_orders() string {
	orders := h.storage.get_all_orders()
	return success_response(orders.to_json())
}

pub fn (mut h OrderHandler) get_order_by_id(id int) string {
	if id <= 0 {
		return error_response('Invalid order ID')
	}
	
	order := h.storage.get_order_by_id(id) or {
		return error_response(err.msg)
	}
	return success_response(order.to_json())
}

pub fn (mut h OrderHandler) create_order(user_id int, user_name string, items []models.OrderItem, total f64, status string) string {
	validate_order_input(user_id, user_name, total, status, items) or {
		return error_response(err.msg)
	}

	order := h.storage.create_order(user_id, user_name, items, total, status) or {
		return error_response(err.msg)
	}
	return success_response(order.to_json(), 'Order created successfully')
}

pub fn (mut h OrderHandler) update_order(id int, status string) string {
	if id <= 0 {
		return error_response('Invalid order ID')
	}

	// Validate status
	valid_statuses := ['pending', 'completed', 'shipped', 'cancelled']
	if status !in valid_statuses {
		return error_response('Invalid order status')
	}

	order := h.storage.update_order(id, status) or {
		return error_response(err.msg)
	}
	return success_response(order.to_json(), 'Order updated successfully')
}

pub fn (mut h OrderHandler) delete_order(id int) string {
	if id <= 0 {
		return error_response('Invalid order ID')
	}

	h.storage.delete_order(id) or {
		return error_response(err.msg)
	}
	return success_response('', 'Order deleted successfully')
}

pub fn (mut h OrderHandler) get_order_stats() string {
	stats := h.storage.get_order_stats()
	return success_response(stats.to_json())
}
