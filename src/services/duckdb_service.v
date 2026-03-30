module services

import models
import json

/**
 * DuckDB Service (JSON-based)
 * In-memory storage with JSON file persistence
 * Suitable for demos and prototyping
 */
pub struct DuckDBService {
pub mut:
	db_path         string
	users           []models.User
	products        []models.Product
	orders          []models.Order
	next_user_id    int
	next_product_id int
	next_order_id   int
	initialized     bool
}

/**
 * Create new DuckDB service
 */
pub fn new_duckdb_service(db_path string) !&DuckDBService {
	mut s := &DuckDBService{
		db_path: db_path
		next_user_id: 1
		next_product_id: 1
		next_order_id: 1
		initialized: false
	}

	// Load existing data or create demo data
	if os.exists(db_path) {
		s.load_from_file() or {
			println('Failed to load data, creating demo data')
			s.insert_demo_data()
		}
	} else {
		s.insert_demo_data()
	}

	s.initialized = true
	return s
}

/**
 * Insert demo data for testing
 */
pub fn (mut s DuckDBService) insert_demo_data() {
	// Demo users
	s.users = [
		models.User{
			id: s.next_user_id++
			name: 'John Doe'
			email: 'john@example.com'
			age: 28
			created_at: time.now().str()
		},
		models.User{
			id: s.next_user_id++
			name: 'Jane Smith'
			email: 'jane@example.com'
			age: 34
			created_at: time.now().str()
		},
		models.User{
			id: s.next_user_id++
			name: 'Bob Wilson'
			email: 'bob@example.com'
			age: 45
			created_at: time.now().str()
		},
	]

	// Demo products
	s.products = [
		models.Product{
			id: s.next_product_id++
			name: 'Laptop Pro'
			description: 'High-performance laptop'
			price: 1299.99
			stock: 50
			category: 'Electronics'
			created_at: time.now().str()
		},
		models.Product{
			id: s.next_product_id++
			name: 'Wireless Mouse'
			description: 'Ergonomic wireless mouse'
			price: 49.99
			stock: 100
			category: 'Electronics'
			created_at: time.now().str()
		},
		models.Product{
			id: s.next_product_id++
			name: 'USB-C Hub'
			description: '7-in-1 USB-C hub'
			price: 79.99
			stock: 75
			category: 'Electronics'
			created_at: time.now().str()
		},
	]

	// Demo orders
	s.orders = [
		models.Order{
			id: s.next_order_id++
			user_id: 1
			user_name: 'John Doe'
			items: [
				models.OrderItem{
					product_id: 1
					product_name: 'Laptop Pro'
					quantity: 1
					price: 1299.99
				},
			]
			total: 1299.99
			status: 'completed'
			created_at: time.now().str()
		},
	]

	s.save_to_file() or { println('Warning: Could not save demo data') }
}

/**
 * Save data to JSON file
 */
pub fn (s DuckDBService) save_to_file() ! {
	data := {
		'users': s.users
		'products': s.products
		'orders': s.orders
		'next_user_id': s.next_user_id
		'next_product_id': s.next_product_id
		'next_order_id': s.next_order_id
	}

	json_data := json.encode(data)
	os.write_file(s.db_path, json_data) or { return err }
}

/**
 * Load data from JSON file
 */
pub fn (mut s DuckDBService) load_from_file() ! {
	json_data := os.read_file(s.db_path) or { return err }
	data := json.decode(map[string]json.Any, json_data) or { return err }

	s.users = decode_users(data['users']!)
	s.products = decode_products(data['products']!)
	s.orders = decode_orders(data['orders']!)
	s.next_user_id = int(data['next_user_id']!)
	s.next_product_id = int(data['next_product_id']!)
	s.next_order_id = int(data['next_order_id']!)
}

// Helper decode functions
fn decode_users(data json.Any) []models.User {
	mut users := []models.User{}
	if arr, ok := data.as_array(); ok {
		for item in arr {
			if obj, ok := item.as_map(); ok {
				users << models.User{
					id: int(obj['id']?)
					name: obj['name']?
					email: obj['email']?
					age: int(obj['age']?)
					created_at: obj['created_at']?
				}
			}
		}
	}
	return users
}

fn decode_products(data json.Any) []models.Product {
	mut products := []models.Product{}
	if arr, ok := data.as_array(); ok {
		for item in arr {
			if obj, ok := item.as_map(); ok {
				products << models.Product{
					id: int(obj['id']?)
					name: obj['name']?
					description: obj['description']?
					price: f64(obj['price']?)
					stock: int(obj['stock']?)
					category: obj['category']?
					created_at: obj['created_at']?
				}
			}
		}
	}
	return products
}

fn decode_orders(data json.Any) []models.Order {
	mut orders := []models.Order{}
	if arr, ok := data.as_array(); ok {
		for item in arr {
			if obj, ok := item.as_map(); ok {
				mut order := models.Order{
					id: int(obj['id']?)
					user_id: int(obj['user_id']?)
					user_name: obj['user_name']?
					total: f64(obj['total']?)
					status: obj['status']?
					created_at: obj['created_at']?
					items: []models.OrderItem{}
				}

				if items_data, ok := obj['items'].as_array(); ok {
					for it in items_data {
						if iobj, ok := it.as_map(); ok {
							order.items << models.OrderItem{
								product_id: int(iobj['product_id']?)
								product_name: iobj['product_name']?
								quantity: int(iobj['quantity']?)
								price: f64(iobj['price']?)
							}
						}
					}
				}

				orders << order
			}
		}
	}
	return orders
}

/**
 * Initialize database (data already loaded in constructor)
 */
pub fn (mut s DuckDBService) initialize() ! {
	// Data is loaded in new_duckdb_service()
	// This method is for interface compatibility
	return
}

/**
 * Health check - verify data is accessible
 */
pub fn (s DuckDBService) health_check() bool {
	// Check if we can access data
	return s.initialized
}

// ============================================================================
// User Repository Implementation
// ============================================================================

pub fn (mut s DuckDBService) create_user(name string, email string, age int) !models.User {
	if name.len == 0 {
		return error('Name is required')
	}
	if !email.contains('@') {
		return error('Invalid email format')
	}
	if age < 1 || age > 150 {
		return error('Age must be between 1 and 150')
	}

	// Check duplicate email
	for user in s.users {
		if user.email == email {
			return error('Email already exists')
		}
	}

	user := models.User{
		id: s.next_user_id++
		name: name
		email: email
		age: age
		created_at: time.now().str()
	}

	s.users << user
	s.save_to_file() or { println('Warning: Could not save user') }

	return user
}

pub fn (s DuckDBService) get_all_users() []models.User {
	mut users := s.users.clone()
	users.reverse()
	return users
}

pub fn (s DuckDBService) get_user_by_id(id int) !models.User {
	for user in s.users {
		if user.id == id {
			return user.clone()
		}
	}
	return error('User not found')
}

pub fn (mut s DuckDBService) update_user(id int, name string, email string, age int) !models.User {
	if name.len == 0 {
		return error('Name is required')
	}
	if !email.contains('@') {
		return error('Invalid email format')
	}
	if age < 1 || age > 150 {
		return error('Age must be between 1 and 150')
	}

	for i, user in s.users {
		if user.id == id {
			// Check duplicate email (excluding current user)
			for other in s.users {
				if other.email == email && other.id != id {
					return error('Email already exists')
				}
			}

			s.users[i].name = name
			s.users[i].email = email
			s.users[i].age = age
			s.save_to_file() or { println('Warning: Could not save') }
			return s.users[i]
		}
	}

	return error('User not found')
}

pub fn (mut s DuckDBService) delete_user(id int) ! {
	mut found := false
	mut new_users := []models.User{}

	for user in s.users {
		if user.id == id {
			found = true
			continue
		}
		new_users << user
	}

	if !found {
		return error('User not found')
	}

	s.users = new_users
	s.save_to_file() or { println('Warning: Could not save') }
}

pub fn (s DuckDBService) get_user_stats() models.UserStats {
	mut stats := models.UserStats{
		total_users: s.users.len
	}

	// Today count
	today := time.now().format('2006-01-02')
	for user in s.users {
		if user.created_at.starts_with(today) {
			stats.today_count++
		}
	}

	// Unique domains
	mut domains := map[string]bool{}
	for user in s.users {
		parts := user.email.split('@')
		if parts.len > 1 {
			domains[parts[1]] = true
		}
	}
	stats.unique_domains = domains.len

	return stats
}

// ============================================================================
// Product Repository Implementation
// ============================================================================

pub fn (mut s DuckDBService) create_product(name string, description string, price f64, stock int, category string) !models.Product {
	if name.len == 0 {
		return error('Product name is required')
	}
	if price <= 0 {
		return error('Price must be positive')
	}
	if stock < 0 {
		return error('Stock cannot be negative')
	}

	product := models.Product{
		id: s.next_product_id++
		name: name
		description: description
		price: price
		stock: stock
		category: category
		created_at: time.now().str()
	}

	s.products << product
	s.save_to_file() or { println('Warning: Could not save product') }

	return product
}

pub fn (s DuckDBService) get_all_products() []models.Product {
	mut products := s.products.clone()
	products.reverse()
	return products
}

pub fn (s DuckDBService) get_product_by_id(id int) !models.Product {
	for product in s.products {
		if product.id == id {
			return product.clone()
		}
	}
	return error('Product not found')
}

pub fn (mut s DuckDBService) update_product(id int, name string, description string, price f64, stock int, category string) !models.Product {
	if name.len == 0 {
		return error('Product name is required')
	}
	if price <= 0 {
		return error('Price must be positive')
	}
	if stock < 0 {
		return error('Stock cannot be negative')
	}

	for i, product in s.products {
		if product.id == id {
			s.products[i].name = name
			s.products[i].description = description
			s.products[i].price = price
			s.products[i].stock = stock
			s.products[i].category = category
			s.save_to_file() or { println('Warning: Could not save') }
			return s.products[i]
		}
	}

	return error('Product not found')
}

pub fn (mut s DuckDBService) delete_product(id int) ! {
	// Check for existing orders
	for order in s.orders {
		for item in order.items {
			if item.product_id == id {
				return error('Cannot delete product with existing orders')
			}
		}
	}

	mut found := false
	mut new_products := []models.Product{}

	for product in s.products {
		if product.id == id {
			found = true
			continue
		}
		new_products << product
	}

	if !found {
		return error('Product not found')
	}

	s.products = new_products
	s.save_to_file() or { println('Warning: Could not save') }
}

pub fn (s DuckDBService) get_product_stats() models.ProductStats {
	mut stats := models.ProductStats{
		total_products: s.products.len
	}

	// Total value
	for product in s.products {
		stats.total_value += product.price * product.stock
	}

	// Low stock count
	for product in s.products {
		if product.stock < 10 {
			stats.low_stock_count++
		}
	}

	return stats
}

// ============================================================================
// Order Repository Implementation
// ============================================================================

pub fn (mut s DuckDBService) create_order(user_id int, user_name string, items []models.OrderItem, total f64, status string) !models.Order {
	if user_id <= 0 {
		return error('Invalid user ID')
	}
	if total < 0 {
		return error('Total cannot be negative')
	}

	order := models.Order{
		id: s.next_order_id++
		user_id: user_id
		user_name: user_name
		items: items.clone()
		total: total
		status: status
		created_at: time.now().str()
	}

	s.orders << order
	s.save_to_file() or { println('Warning: Could not save order') }

	return order
}

pub fn (s DuckDBService) get_all_orders() []models.Order {
	mut orders := s.orders.clone()
	orders.reverse()
	return orders
}

pub fn (s DuckDBService) get_order_by_id(id int) !models.Order {
	for order in s.orders {
		if order.id == id {
			return order.clone()
		}
	}
	return error('Order not found')
}

pub fn (mut s DuckDBService) update_order(id int, status string) !models.Order {
	valid_statuses := ['pending', 'completed', 'shipped', 'cancelled']
	if status !in valid_statuses {
		return error('Invalid order status')
	}

	for i, order in s.orders {
		if order.id == id {
			s.orders[i].status = status
			s.save_to_file() or { println('Warning: Could not save') }
			return s.orders[i]
		}
	}

	return error('Order not found')
}

pub fn (mut s DuckDBService) delete_order(id int) ! {
	mut found := false
	mut new_orders := []models.Order{}

	for order in s.orders {
		if order.id == id {
			found = true
			continue
		}
		new_orders << order
	}

	if !found {
		return error('Order not found')
	}

	s.orders = new_orders
	s.save_to_file() or { println('Warning: Could not save') }
}

pub fn (s DuckDBService) get_order_stats() models.OrderStats {
	mut stats := models.OrderStats{
		total_orders: s.orders.len
	}

	// Pending orders and revenue
	for order in s.orders {
		if order.status == 'pending' {
			stats.pending_orders++
		}
		stats.total_revenue += order.total
	}

	return stats
}
