module main

import os
import time
import json

// ============================================================================
// Data Models
// ============================================================================

// User represents a user entity
pub struct User {
pub mut:
	id          int
	name        string
	email       string
	age         int
	created_at  string
}

// Product represents a product entity
pub struct Product {
pub mut:
	id          int
	name        string
	description string
	price       f64
	stock       int
	category    string
	created_at  string
}

// Order represents an order entity
pub struct Order {
pub mut:
	id          int
	user_id     int
	user_name   string
	items       []OrderItem
	total       f64
	status      string
	created_at  string
}

// OrderItem represents an item in an order
pub struct OrderItem {
pub mut:
	product_id   int
	product_name string
	quantity    int
	price       f64
}

// UserStats represents user statistics
pub struct UserStats {
pub mut:
	total_users    int
	today_count    int
	unique_domains int
}

// JsonStorage represents the complete storage structure
pub struct JsonStorage {
pub mut:
	users       []User
	products    []Product
	orders      []Order
	next_user_id    int
	next_product_id int
	next_order_id   int
}

// ============================================================================
// JsonStorageService - JSON file-based storage with CRUD operations
// ============================================================================

pub struct JsonStorageService {
pub mut:
	initialized bool
	db_path     string
	storage     JsonStorage
}

// new_json_storage_service creates a new JsonStorageService instance
pub fn new_json_storage_service(db_path string) !&JsonStorageService {
	mut s := &JsonStorageService{
		initialized: false
		db_path: db_path
		storage: JsonStorage{
			users: []
			products: []
			orders: []
			next_user_id: 1
			next_product_id: 1
			next_order_id: 1
		}
	}

	// Load existing data or initialize with demo data
	if os.exists(db_path) {
		data := os.read_file(db_path) or {
			s.insert_demo_data()
			s.initialized = true
			return s
		}
		mut storage := json.decode(JsonStorage, data) or {
			s.insert_demo_data()
			s.initialized = true
			return s
		}
		s.storage = storage
	} else {
		s.insert_demo_data()
	}
	
	s.initialized = true
	return s
}

// init initializes the storage service
pub fn (s JsonStorageService) init() bool {
	return s.initialized
}

// save persists the current state to the JSON file
pub fn (s JsonStorageService) save() ! {
	json_data := json.encode(s.storage)
	os.write_file(s.db_path, json_data) or {
		return error('Failed to write to file')
	}
}

// insert_demo_data populates the storage with sample data
fn (mut s JsonStorageService) insert_demo_data() {
	// Demo Users
	s.storage.users = [
		User{id: s.storage.next_user_id++, name: 'John Doe', email: 'john@example.com', age: 28, created_at: time.now().str()},
		User{id: s.storage.next_user_id++, name: 'Jane Smith', email: 'jane@gmail.com', age: 34, created_at: time.now().str()},
		User{id: s.storage.next_user_id++, name: 'Bob Wilson', email: 'bob@company.org', age: 45, created_at: time.now().str()},
		User{id: s.storage.next_user_id++, name: 'Alice Brown', email: 'alice@tech.io', age: 29, created_at: time.now().str()},
		User{id: s.storage.next_user_id++, name: 'Charlie Davis', email: 'charlie@web.com', age: 38, created_at: time.now().str()},
	]

	// Demo Products
	s.storage.products = [
		Product{id: s.storage.next_product_id++, name: 'Laptop Pro', description: 'High-performance laptop for professionals', price: 1299.99, stock: 50, category: 'Electronics', created_at: time.now().str()},
		Product{id: s.storage.next_product_id++, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 49.99, stock: 200, category: 'Electronics', created_at: time.now().str()},
		Product{id: s.storage.next_product_id++, name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI', price: 79.99, stock: 150, category: 'Accessories', created_at: time.now().str()},
		Product{id: s.storage.next_product_id++, name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with Cherry MX switches', price: 159.99, stock: 75, category: 'Electronics', created_at: time.now().str()},
		Product{id: s.storage.next_product_id++, name: 'Monitor 27"', description: '4K UHD monitor with HDR support', price: 449.99, stock: 30, category: 'Electronics', created_at: time.now().str()},
		Product{id: s.storage.next_product_id++, name: 'Desk Chair', description: 'Ergonomic office chair with lumbar support', price: 299.99, stock: 40, category: 'Furniture', created_at: time.now().str()},
		Product{id: s.storage.next_product_id++, name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness', price: 39.99, stock: 100, category: 'Furniture', created_at: time.now().str()},
		Product{id: s.storage.next_product_id++, name: 'Webcam HD', description: '1080p webcam with microphone', price: 89.99, stock: 80, category: 'Electronics', created_at: time.now().str()},
	]

	// Demo Orders
	s.storage.orders = [
		Order{id: s.storage.next_order_id++, user_id: 1, user_name: 'John Doe', items: [OrderItem{product_id: 1, product_name: 'Laptop Pro', quantity: 1, price: 1299.99}], total: 1299.99, status: 'completed', created_at: time.now().str()},
		Order{id: s.storage.next_order_id++, user_id: 2, user_name: 'Jane Smith', items: [OrderItem{product_id: 2, product_name: 'Wireless Mouse', quantity: 2, price: 49.99}, OrderItem{product_id: 3, product_name: 'USB-C Hub', quantity: 1, price: 79.99}], total: 179.97, status: 'pending', created_at: time.now().str()},
		Order{id: s.storage.next_order_id++, user_id: 3, user_name: 'Bob Wilson', items: [OrderItem{product_id: 4, product_name: 'Mechanical Keyboard', quantity: 1, price: 159.99}], total: 159.99, status: 'completed', created_at: time.now().str()},
		Order{id: s.storage.next_order_id++, user_id: 1, user_name: 'John Doe', items: [OrderItem{product_id: 5, product_name: 'Monitor 27"', quantity: 1, price: 449.99}, OrderItem{product_id: 6, product_name: 'Desk Chair', quantity: 1, price: 299.99}], total: 749.98, status: 'shipped', created_at: time.now().str()},
		Order{id: s.storage.next_order_id++, user_id: 4, user_name: 'Alice Brown', items: [OrderItem{product_id: 7, product_name: 'Desk Lamp', quantity: 2, price: 39.99}, OrderItem{product_id: 8, product_name: 'Webcam HD', quantity: 1, price: 89.99}], total: 169.97, status: 'pending', created_at: time.now().str()},
	]

	s.save() or {
		println('Warning: Could not save demo data to file')
	}
}

// ============================================================================
// User CRUD Operations
// ============================================================================

// get_all_users returns all users in reverse order
pub fn (s JsonStorageService) get_all_users() []User {
	mut users := s.storage.users.clone()
	users.reverse()
	return users
}

// get_user_by_id returns a user by ID
pub fn (s JsonStorageService) get_user_by_id(id int) ?User {
	for user in s.storage.users {
		if user.id == id {
			return user
		}
	}
	return none
}

// create_user creates a new user
pub fn (mut s JsonStorageService) create_user(name string, email string, age int) !User {
	if !email.contains('@') {
		return error('Invalid email')
	}
	user := User{
		id: s.storage.next_user_id++
		name: name
		email: email
		age: age
		created_at: time.now().str()
	}
	s.storage.users << user
	s.save() or {
		println('Warning: Could not save user to file')
	}
	return user
}

// update_user updates an existing user
pub fn (mut s JsonStorageService) update_user(id int, name string, email string, age int) !User {
	for i, user in s.storage.users {
		if user.id == id {
			s.storage.users[i].name = name
			s.storage.users[i].email = email
			s.storage.users[i].age = age
			s.save() or {
				println('Warning: Could not save updated user to file')
			}
			return s.storage.users[i]
		}
	}
	return error('User not found')
}

// delete_user deletes a user by ID
pub fn (mut s JsonStorageService) delete_user(id int) ! {
	mut found := false
	mut new_users := []User{}
	for user in s.storage.users {
		if user.id == id {
			found = true
			continue
		}
		new_users << user
	}
	if !found {
		return error('User not found')
	}
	s.storage.users = new_users
	s.save() or {
		println('Warning: Could not save deleted user to file')
	}
}

// get_user_stats returns user statistics
pub fn (s JsonStorageService) get_user_stats() UserStats {
	mut domains := map[string]int{}
	for user in s.storage.users {
		parts := user.email.split('@')
		if parts.len > 1 {
			domains[parts[1]] = 1
		}
	}
	return UserStats{
		total_users: s.storage.users.len
		today_count: 0
		unique_domains: domains.len
	}
}

// ============================================================================
// Product CRUD Operations
// ============================================================================

// get_all_products returns all products in reverse order
pub fn (s JsonStorageService) get_all_products() []Product {
	mut products := s.storage.products.clone()
	products.reverse()
	return products
}

// get_product_by_id returns a product by ID
pub fn (s JsonStorageService) get_product_by_id(id int) ?Product {
	for product in s.storage.products {
		if product.id == id {
			return product
		}
	}
	return none
}

// create_product creates a new product
pub fn (mut s JsonStorageService) create_product(name string, description string, price f64, stock int, category string) !Product {
	product := Product{
		id: s.storage.next_product_id++
		name: name
		description: description
		price: price
		stock: stock
		category: category
		created_at: time.now().str()
	}
	s.storage.products << product
	s.save() or {
		println('Warning: Could not save product to file')
	}
	return product
}

// update_product updates an existing product
pub fn (mut s JsonStorageService) update_product(id int, name string, description string, price f64, stock int, category string) !Product {
	for i, product in s.storage.products {
		if product.id == id {
			s.storage.products[i].name = name
			s.storage.products[i].description = description
			s.storage.products[i].price = price
			s.storage.products[i].stock = stock
			s.storage.products[i].category = category
			s.save() or {
				println('Warning: Could not save updated product to file')
			}
			return s.storage.products[i]
		}
	}
	return error('Product not found')
}

// delete_product deletes a product by ID
pub fn (mut s JsonStorageService) delete_product(id int) ! {
	mut found := false
	mut new_products := []Product{}
	for product in s.storage.products {
		if product.id == id {
			found = true
			continue
		}
		new_products << product
	}
	if !found {
		return error('Product not found')
	}
	s.storage.products = new_products
	s.save() or {
		println('Warning: Could not save deleted product to file')
	}
}

// ============================================================================
// Order CRUD Operations
// ============================================================================

// get_all_orders returns all orders in reverse order
pub fn (s JsonStorageService) get_all_orders() []Order {
	mut orders := s.storage.orders.clone()
	orders.reverse()
	return orders
}

// get_order_by_id returns an order by ID
pub fn (s JsonStorageService) get_order_by_id(id int) ?Order {
	for order in s.storage.orders {
		if order.id == id {
			return order
		}
	}
	return none
}

// create_order creates a new order
pub fn (mut s JsonStorageService) create_order(user_id int, user_name string, items []OrderItem, total f64, status string) !Order {
	order := Order{
		id: s.storage.next_order_id++
		user_id: user_id
		user_name: user_name
		items: items.clone()
		total: total
		status: status
		created_at: time.now().str()
	}
	s.storage.orders << order
	s.save() or {
		println('Warning: Could not save order to file')
	}
	return order
}

// update_order updates an existing order
pub fn (mut s JsonStorageService) update_order(id int, status string) !Order {
	for i, order in s.storage.orders {
		if order.id == id {
			s.storage.orders[i].status = status
			s.save() or {
				println('Warning: Could not save updated order to file')
			}
			return s.storage.orders[i]
		}
	}
	return error('Order not found')
}

// delete_order deletes an order by ID
pub fn (mut s JsonStorageService) delete_order(id int) ! {
	mut found := false
	mut new_orders := []Order{}
	for order in s.storage.orders {
		if order.id == id {
			found = true
			continue
		}
		new_orders << order
	}
	if !found {
		return error('Order not found')
	}
	s.storage.orders = new_orders
	s.save() or {
		println('Warning: Could not save deleted order to file')
	}
}

// get_order_stats returns order statistics
pub fn (s JsonStorageService) get_order_stats() map[string]int {
	mut stats := map[string]int{}
	stats['total_orders'] = s.storage.orders.len
	stats['pending_orders'] = 0
	for order in s.storage.orders {
		if order.status == 'pending' {
			stats['pending_orders']++
		}
	}
	return stats
}

// ============================================================================
// General Statistics
// ============================================================================

// get_stats returns overall storage statistics
pub fn (s JsonStorageService) get_stats() map[string]int {
	mut stats := map[string]int{}
	stats['total_users'] = s.storage.users.len
	stats['total_products'] = s.storage.products.len
	stats['total_orders'] = s.storage.orders.len
	
	mut pending := 0
	for order in s.storage.orders {
		if order.status == 'pending' {
			pending++
		}
	}
	stats['pending_orders'] = pending

	return stats
}
