module main

import os
import time
import json

// ============================================================================
// Minimal Services for V 0.5.1 Compatibility
// ============================================================================

// ConfigService
pub struct ConfigService {
pub mut:
	config      map[string]string
	env_prefix  string
	initialized bool
}

pub fn new_config_service() &ConfigService {
	return &ConfigService{
		config: map[string]string{}
		env_prefix: 'APP_'
	}
}

pub fn (mut s ConfigService) init() bool {
	s.load_from_env()
	s.initialized = true
	return true
}

pub fn (s ConfigService) get_string(key string, default string) string {
	return s.config[key] or { default }
}

pub fn (mut s ConfigService) set(key string, value string) {
	s.config[key] = value
}

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

// LoggerService
pub struct LoggerService {
pub mut:
	min_level      string
	log_to_console bool
}

pub fn new_logger_service() &LoggerService {
	return &LoggerService{
		min_level: 'info'
		log_to_console: true
	}
}

pub fn (s LoggerService) init() bool { return true }
pub fn (s LoggerService) info(msg string) { if s.log_to_console { println(msg) } }
pub fn (s LoggerService) error(msg string) { if s.log_to_console { println('ERROR: ' + msg) } }

// CacheService
pub struct CacheService {
pub mut:
	cache       map[string]CacheEntry
	initialized bool
}

pub struct CacheEntry {
pub mut:
	value      string
	expires_at u64
}

pub fn new_cache_service() &CacheService {
	return &CacheService{
		cache: map[string]CacheEntry{}
	}
}

pub fn (mut s CacheService) init() bool { s.initialized = true; return true }
pub fn (mut s CacheService) dispose() { s.cache = map[string]CacheEntry{} }

// ValidationService (simplified)
pub struct ValidationService {
pub mut:
	initialized bool
}

pub fn new_validation_service() &ValidationService {
	return &ValidationService{}
}

pub fn (mut s ValidationService) init() bool { s.initialized = true; return true }
pub fn (s ValidationService) dispose() {}

// ============================================================================
// SQLite Service (File-based JSON storage)
// ============================================================================

pub struct User {
pub mut:
	id          int
	name        string
	email       string
	age         int
	created_at  string
}

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

pub struct OrderItem {
pub mut:
	product_id  int
	product_name string
	quantity    int
	price       f64
}

pub struct UserStats {
pub mut:
	total_users    int
	today_count    int
	unique_domains int
}

pub struct SqliteService {
pub mut:
	initialized bool
	db_path     string
	db          UserDatabase
}

pub struct UserDatabase {
pub mut:
	users     []User
	next_id   int
}

pub fn new_sqlite_service(db_path string) !&SqliteService {
	mut s := &SqliteService{
		initialized: false
		db_path: db_path
		db: UserDatabase{ users: [], next_id: 1 }
	}
	if os.exists(db_path) {
		data := os.read_file(db_path) or {
			s.insert_demo_data()
			s.initialized = true
			return s
		}
		mut db := json.decode(UserDatabase, data) or {
			s.insert_demo_data()
			s.initialized = true
			return s
		}
		s.db = db
	} else {
		s.insert_demo_data()
	}
	s.initialized = true
	return s
}

pub fn (s SqliteService) init() bool { return s.initialized }
pub fn (s SqliteService) dispose() {}

fn (mut s SqliteService) insert_demo_data() {
	s.db.users = [
		User{id: s.db.next_id, name: 'John Doe', email: 'john@example.com', age: 28, created_at: time.now().str()},
		User{id: s.db.next_id+1, name: 'Jane Smith', email: 'jane@gmail.com', age: 34, created_at: time.now().str()},
		User{id: s.db.next_id+2, name: 'Bob Wilson', email: 'bob@company.org', age: 45, created_at: time.now().str()},
	]
	s.db.next_id += 3
	s.save_to_file() or {
		println('Warning: Could not save demo data to file')
	}
}

// Save database to JSON file
pub fn (s SqliteService) save_to_file() ! {
	json_data := json.encode(s.db)
	os.write_file(s.db_path, json_data) or {
		return error('Failed to write to file')
	}
}

pub fn (s SqliteService) get_all_users() []User {
	mut users := s.db.users.clone()
	users.reverse()
	return users
}

pub fn (mut s SqliteService) create_user(name string, email string, age int) !User {
	if !email.contains('@') {
		return error('Invalid email')
	}
	user := User{
		id: s.db.next_id
		name: name
		email: email
		age: age
		created_at: time.now().str()
	}
	s.db.next_id++
	s.db.users << user
	s.save_to_file() or {
		println('Warning: Could not save user to file')
	}
	return user
}

pub fn (mut s SqliteService) update_user(id int, name string, email string, age int) !User {
	for i, user in s.db.users {
		if user.id == id {
			s.db.users[i].name = name
			s.db.users[i].email = email
			s.db.users[i].age = age
			s.save_to_file() or {
				println('Warning: Could not save updated user to file')
			}
			return s.db.users[i]
		}
	}
	return error('User not found')
}

pub fn (mut s SqliteService) delete_user(id int) ! {
	mut found := false
	mut new_users := []User{}
	for user in s.db.users {
		if user.id == id {
			found = true
			continue
		}
		new_users << user
	}
	if !found {
		return error('User not found')
	}
	s.db.users = new_users
	s.save_to_file() or {
		println('Warning: Could not save deleted user to file')
	}
}

pub fn (s SqliteService) get_stats() UserStats {
	return UserStats{
		total_users: s.db.users.len
		today_count: 0
		unique_domains: 1
	}
}

// ============================================================================
// DuckDB Service (In-memory with JSON persistence for demo)
// ============================================================================

pub struct DuckDBService {
pub mut:
	initialized bool
	db_path     string
	users       []User
	products    []Product
	orders      []Order
	next_user_id   int
	next_product_id int
	next_order_id   int
}

pub fn new_duckdb_service(db_path string) !&DuckDBService {
	mut s := &DuckDBService{
		initialized: false
		db_path: db_path
		users: []
		products: []
		orders: []
		next_user_id: 1
		next_product_id: 1
		next_order_id: 1
	}
	
	// Always start with demo data for simplicity
	s.insert_demo_data()
	s.initialized = true
	return s
}

pub fn (s DuckDBService) init() bool { return s.initialized }
pub fn (s DuckDBService) dispose() {}

// Save to JSON file
pub fn (s DuckDBService) save_to_file() ! {
	db_data := {
		'users': json.encode(s.users)
		'products': json.encode(s.products)
		'orders': json.encode(s.orders)
	}
	json_data := json.encode(db_data)
	os.write_file(s.db_path, json_data) or {
		return error('Failed to write to file')
	}
}

fn (mut s DuckDBService) insert_demo_data() {
	// Demo Users
	s.users = [
		User{id: s.next_user_id++, name: 'John Doe', email: 'john@example.com', age: 28, created_at: time.now().str()},
		User{id: s.next_user_id++, name: 'Jane Smith', email: 'jane@gmail.com', age: 34, created_at: time.now().str()},
		User{id: s.next_user_id++, name: 'Bob Wilson', email: 'bob@company.org', age: 45, created_at: time.now().str()},
		User{id: s.next_user_id++, name: 'Alice Brown', email: 'alice@tech.io', age: 29, created_at: time.now().str()},
		User{id: s.next_user_id++, name: 'Charlie Davis', email: 'charlie@web.com', age: 38, created_at: time.now().str()},
	]
	
	// Demo Products
	s.products = [
		Product{id: s.next_product_id++, name: 'Laptop Pro', description: 'High-performance laptop for professionals', price: 1299.99, stock: 50, category: 'Electronics', created_at: time.now().str()},
		Product{id: s.next_product_id++, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 49.99, stock: 200, category: 'Electronics', created_at: time.now().str()},
		Product{id: s.next_product_id++, name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI', price: 79.99, stock: 150, category: 'Accessories', created_at: time.now().str()},
		Product{id: s.next_product_id++, name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with Cherry MX switches', price: 159.99, stock: 75, category: 'Electronics', created_at: time.now().str()},
		Product{id: s.next_product_id++, name: 'Monitor 27"', description: '4K UHD monitor with HDR support', price: 449.99, stock: 30, category: 'Electronics', created_at: time.now().str()},
		Product{id: s.next_product_id++, name: 'Desk Chair', description: 'Ergonomic office chair with lumbar support', price: 299.99, stock: 40, category: 'Furniture', created_at: time.now().str()},
		Product{id: s.next_product_id++, name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness', price: 39.99, stock: 100, category: 'Furniture', created_at: time.now().str()},
		Product{id: s.next_product_id++, name: 'Webcam HD', description: '1080p webcam with microphone', price: 89.99, stock: 80, category: 'Electronics', created_at: time.now().str()},
	]
	
	// Demo Orders
	s.orders = [
		Order{id: s.next_order_id++, user_id: 1, user_name: 'John Doe', items: [OrderItem{product_id: 1, product_name: 'Laptop Pro', quantity: 1, price: 1299.99}], total: 1299.99, status: 'completed', created_at: time.now().str()},
		Order{id: s.next_order_id++, user_id: 2, user_name: 'Jane Smith', items: [OrderItem{product_id: 2, product_name: 'Wireless Mouse', quantity: 2, price: 49.99}, OrderItem{product_id: 3, product_name: 'USB-C Hub', quantity: 1, price: 79.99}], total: 179.97, status: 'pending', created_at: time.now().str()},
		Order{id: s.next_order_id++, user_id: 3, user_name: 'Bob Wilson', items: [OrderItem{product_id: 4, product_name: 'Mechanical Keyboard', quantity: 1, price: 159.99}], total: 159.99, status: 'completed', created_at: time.now().str()},
		Order{id: s.next_order_id++, user_id: 1, user_name: 'John Doe', items: [OrderItem{product_id: 5, product_name: 'Monitor 27"', quantity: 1, price: 449.99}, OrderItem{product_id: 6, product_name: 'Desk Chair', quantity: 1, price: 299.99}], total: 749.98, status: 'shipped', created_at: time.now().str()},
		Order{id: s.next_order_id++, user_id: 4, user_name: 'Alice Brown', items: [OrderItem{product_id: 7, product_name: 'Desk Lamp', quantity: 2, price: 39.99}, OrderItem{product_id: 8, product_name: 'Webcam HD', quantity: 1, price: 89.99}], total: 169.97, status: 'pending', created_at: time.now().str()},
	]
	
	s.save_to_file() or {
		println('Warning: Could not save demo data to file')
	}
}

// User CRUD
pub fn (s DuckDBService) get_all_users() []User {
	return s.users.clone()
}

pub fn (mut s DuckDBService) create_user(name string, email string, age int) !User {
	if !email.contains('@') {
		return error('Invalid email')
	}
	user := User{
		id: s.next_user_id++
		name: name
		email: email
		age: age
		created_at: time.now().str()
	}
	s.users << user
	s.save_to_file() or {
		println('Warning: Could not save user to file')
	}
	return user
}

pub fn (mut s DuckDBService) update_user(id int, name string, email string, age int) !User {
	for i, user in s.users {
		if user.id == id {
			s.users[i].name = name
			s.users[i].email = email
			s.users[i].age = age
			s.save_to_file() or {
				println('Warning: Could not save updated user to file')
			}
			return s.users[i]
		}
	}
	return error('User not found')
}

pub fn (mut s DuckDBService) delete_user(id int) ! {
	mut found := false
	mut new_users := []User{}
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
	s.save_to_file() or {
		println('Warning: Could not save deleted user to file')
	}
}

// Product CRUD
pub fn (s DuckDBService) get_all_products() []Product {
	return s.products.clone()
}

pub fn (mut s DuckDBService) create_product(name string, description string, price f64, stock int, category string) !Product {
	product := Product{
		id: s.next_product_id++
		name: name
		description: description
		price: price
		stock: stock
		category: category
		created_at: time.now().str()
	}
	s.products << product
	s.save_to_file() or {
		println('Warning: Could not save product to file')
	}
	return product
}

pub fn (mut s DuckDBService) update_product(id int, name string, description string, price f64, stock int, category string) !Product {
	for i, product in s.products {
		if product.id == id {
			s.products[i].name = name
			s.products[i].description = description
			s.products[i].price = price
			s.products[i].stock = stock
			s.products[i].category = category
			s.save_to_file() or {
				println('Warning: Could not save updated product to file')
			}
			return s.products[i]
		}
	}
	return error('Product not found')
}

pub fn (mut s DuckDBService) delete_product(id int) ! {
	mut found := false
	mut new_products := []Product{}
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
	s.save_to_file() or {
		println('Warning: Could not save deleted product to file')
	}
}

// Order CRUD
pub fn (s DuckDBService) get_all_orders() []Order {
	return s.orders.clone()
}

pub fn (mut s DuckDBService) create_order(user_id int, user_name string, items []OrderItem, total f64, status string) !Order {
	order := Order{
		id: s.next_order_id++
		user_id: user_id
		user_name: user_name
		items: items.clone()
		total: total
		status: status
		created_at: time.now().str()
	}
	s.orders << order
	s.save_to_file() or {
		println('Warning: Could not save order to file')
	}
	return order
}

pub fn (mut s DuckDBService) update_order(id int, status string) !Order {
	for i, order in s.orders {
		if order.id == id {
			s.orders[i].status = status
			s.save_to_file() or {
				println('Warning: Could not save updated order to file')
			}
			return s.orders[i]
		}
	}
	return error('Order not found')
}

pub fn (mut s DuckDBService) delete_order(id int) ! {
	mut found := false
	mut new_orders := []Order{}
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
	s.save_to_file() or {
		println('Warning: Could not save deleted order to file')
	}
}

// Stats
pub fn (s DuckDBService) get_stats() map[string]int {
	mut stats := map[string]int{}
	stats['total_users'] = s.users.len
	stats['total_products'] = s.products.len
	stats['total_orders'] = s.orders.len
	stats['pending_orders'] = 0
	for order in s.orders {
		if order.status == 'pending' {
			stats['pending_orders']++
		}
	}
	return stats
}
