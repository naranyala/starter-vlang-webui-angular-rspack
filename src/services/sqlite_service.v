module services

import models
import sqlite

/**
 * SQLite Service
 * Production-ready SQLite implementation of StorageService
 */
pub struct SqliteService {
pub mut:
	db          sqlite.DB
	db_path     string
	initialized bool
}

/**
 * Create new SQLite service
 */
pub fn new_sqlite_service(db_path string) !&SqliteService {
	db := sqlite.open(db_path) or {
		return error('Failed to open database: ${err.msg}')
	}

	mut s := &SqliteService{
		db: db
		db_path: db_path
		initialized: false
	}

	s.create_tables() or {
		db.close()
		return err
	}

	s.initialized = true
	return s
}

/**
 * Create database tables
 */
pub fn (mut s SqliteService) create_tables() ! {
	// Users table
	s.db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			age INTEGER NOT NULL CHECK(age >= 1 AND age <= 150),
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`) or { return err }

	// Products table
	s.db.exec(`
		CREATE TABLE IF NOT EXISTS products (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			price REAL NOT NULL CHECK(price > 0),
			stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
			category TEXT,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`) or { return err }

	// Orders table
	s.db.exec(`
		CREATE TABLE IF NOT EXISTS orders (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			user_name TEXT NOT NULL,
			total REAL NOT NULL CHECK(total >= 0),
			status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'shipped', 'cancelled')),
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`) or { return err }

	// Order items table
	s.db.exec(`
		CREATE TABLE IF NOT EXISTS order_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			order_id INTEGER NOT NULL,
			product_id INTEGER NOT NULL,
			product_name TEXT NOT NULL,
			quantity INTEGER NOT NULL CHECK(quantity > 0),
			price REAL NOT NULL CHECK(price >= 0),
			FOREIGN KEY (order_id) REFERENCES orders(id),
			FOREIGN KEY (product_id) REFERENCES products(id)
		)
	`) or { return err }
}

/**
 * Close database connection
 */
pub fn (mut s SqliteService) close() {
	s.db.close()
}

/**
 * Initialize database (tables already created in constructor)
 */
pub fn (mut s SqliteService) initialize() ! {
	// Tables are created in new_sqlite_service()
	// This method is for interface compatibility
	return
}

/**
 * Health check - verify database connection
 */
pub fn (s SqliteService) health_check() bool {
	// Try a simple query to verify connection
	_ := s.db.query(`SELECT 1`) or {
		return false
	}
	return true
}

// ============================================================================
// User Repository Implementation
// ============================================================================

pub fn (mut s SqliteService) create_user(name string, email string, age int) !models.User {
	// Validate
	if name.len == 0 {
		return error('Name is required')
	}
	if !email.contains('@') {
		return error('Invalid email format')
	}
	if age < 1 || age > 150 {
		return error('Age must be between 1 and 150')
	}

	// Insert
	s.db.exec(`INSERT INTO users (name, email, age) VALUES (?, ?, ?)`,
		[name, email, age.str()]) or {
		if err.msg.contains('UNIQUE constraint failed') {
			return error('Email already exists')
		}
		return err
	}

	user_id := s.db.last_insert_id()
	return s.get_user_by_id(user_id)
}

pub fn (s SqliteService) get_all_users() []models.User {
	mut users := []models.User{}

	rows := s.db.query(`SELECT * FROM users ORDER BY id DESC`) or {
		return users
	}

	for rows.next() {
		users << models.User{
			id: rows.int('id')
			name: rows.text('name') or { '' }
			email: rows.text('email') or { '' }
			age: rows.int('age')
			created_at: rows.text('created_at') or { '' }
		}
	}

	return users
}

pub fn (s SqliteService) get_user_by_id(id int) !models.User {
	rows := s.db.query(`SELECT * FROM users WHERE id = ?`, [id.str()]) or {
		return error('User not found')
	}

	if !rows.next() {
		return error('User not found')
	}

	return models.User{
		id: rows.int('id')
		name: rows.text('name') or { '' }
		email: rows.text('email') or { '' }
		age: rows.int('age')
		created_at: rows.text('created_at') or { '' }
	}
}

pub fn (mut s SqliteService) update_user(id int, name string, email string, age int) !models.User {
	if name.len == 0 {
		return error('Name is required')
	}
	if !email.contains('@') {
		return error('Invalid email format')
	}
	if age < 1 || age > 150 {
		return error('Age must be between 1 and 150')
	}

	s.db.exec(`UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?`,
		[name, email, age.str(), id.str()]) or {
		if err.msg.contains('UNIQUE constraint failed') {
			return error('Email already exists')
		}
		return err
	}

	if s.db.rows_affected() == 0 {
		return error('User not found')
	}

	return s.get_user_by_id(id)
}

pub fn (mut s SqliteService) delete_user(id int) ! {
	s.db.exec(`DELETE FROM users WHERE id = ?`, [id.str()]) or { return err }

	if s.db.rows_affected() == 0 {
		return error('User not found')
	}
}

pub fn (s SqliteService) get_user_stats() models.UserStats {
	mut stats := models.UserStats{}

	// Total users
	rows := s.db.query(`SELECT COUNT(*) as count FROM users`) or { return stats }
	if rows.next() {
		stats.total_users = rows.int('count')
	}

	// Today count
	rows = s.db.query(`SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE('now')`) or { return stats }
	if rows.next() {
		stats.today_count = rows.int('count')
	}

	// Unique domains
	rows = s.db.query(`SELECT COUNT(DISTINCT SUBSTR(email, INSTR(email, '@') + 1)) as count FROM users`) or { return stats }
	if rows.next() {
		stats.unique_domains = rows.int('count')
	}

	return stats
}

// ============================================================================
// Product Repository Implementation
// ============================================================================

pub fn (mut s SqliteService) create_product(name string, description string, price f64, stock int, category string) !models.Product {
	if name.len == 0 {
		return error('Product name is required')
	}
	if price <= 0 {
		return error('Price must be positive')
	}
	if stock < 0 {
		return error('Stock cannot be negative')
	}

	s.db.exec(`INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)`,
		[name, description, price.str(), stock.str(), category]) or { return err }

	product_id := s.db.last_insert_id()
	return s.get_product_by_id(product_id)
}

pub fn (s SqliteService) get_all_products() []models.Product {
	mut products := []models.Product{}

	rows := s.db.query(`SELECT * FROM products ORDER BY id DESC`) or {
		return products
	}

	for rows.next() {
		products << models.Product{
			id: rows.int('id')
			name: rows.text('name') or { '' }
			description: rows.text('description') or { '' }
			price: rows.float('price')
			stock: rows.int('stock')
			category: rows.text('category') or { '' }
			created_at: rows.text('created_at') or { '' }
		}
	}

	return products
}

pub fn (s SqliteService) get_product_by_id(id int) !models.Product {
	rows := s.db.query(`SELECT * FROM products WHERE id = ?`, [id.str()]) or {
		return error('Product not found')
	}

	if !rows.next() {
		return error('Product not found')
	}

	return models.Product{
		id: rows.int('id')
		name: rows.text('name') or { '' }
		description: rows.text('description') or { '' }
		price: rows.float('price')
		stock: rows.int('stock')
		category: rows.text('category') or { '' }
		created_at: rows.text('created_at') or { '' }
	}
}

pub fn (mut s SqliteService) update_product(id int, name string, description string, price f64, stock int, category string) !models.Product {
	if name.len == 0 {
		return error('Product name is required')
	}
	if price <= 0 {
		return error('Price must be positive')
	}
	if stock < 0 {
		return error('Stock cannot be negative')
	}

	s.db.exec(`UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ? WHERE id = ?`,
		[name, description, price.str(), stock.str(), category, id.str()]) or { return err }

	if s.db.rows_affected() == 0 {
		return error('Product not found')
	}

	return s.get_product_by_id(id)
}

pub fn (mut s SqliteService) delete_product(id int) ! {
	// Check for existing orders
	rows := s.db.query(`SELECT COUNT(*) as count FROM order_items WHERE product_id = ?`, [id.str()]) or { return err }
	if rows.next() && rows.int('count') > 0 {
		return error('Cannot delete product with existing orders')
	}

	s.db.exec(`DELETE FROM products WHERE id = ?`, [id.str()]) or { return err }

	if s.db.rows_affected() == 0 {
		return error('Product not found')
	}
}

pub fn (s SqliteService) get_product_stats() models.ProductStats {
	mut stats := models.ProductStats{}

	// Total products
	rows := s.db.query(`SELECT COUNT(*) as count FROM products`) or { return stats }
	if rows.next() {
		stats.total_products = rows.int('count')
	}

	// Total value
	rows = s.db.query(`SELECT SUM(price * stock) as total FROM products`) or { return stats }
	if rows.next() {
		stats.total_value = rows.float('total')
	}

	// Low stock count
	rows = s.db.query(`SELECT COUNT(*) as count FROM products WHERE stock < 10`) or { return stats }
	if rows.next() {
		stats.low_stock_count = rows.int('count')
	}

	return stats
}

// ============================================================================
// Order Repository Implementation
// ============================================================================

pub fn (mut s SqliteService) create_order(user_id int, user_name string, items []models.OrderItem, total f64, status string) !models.Order {
	if user_id <= 0 {
		return error('Invalid user ID')
	}
	if total < 0 {
		return error('Total cannot be negative')
	}

	// Start transaction
	s.db.exec('BEGIN TRANSACTION') or { return err }

	// Create order
	s.db.exec(`INSERT INTO orders (user_id, user_name, total, status) VALUES (?, ?, ?, ?)`,
		[user_id.str(), user_name, total.str(), status]) or {
		s.db.exec('ROLLBACK')
		return err
	}

	order_id := s.db.last_insert_id()

	// Create order items
	for item in items {
		s.db.exec(`INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)`,
			[order_id.str(), item.product_id.str(), item.product_name, item.quantity.str(), item.price.str()]) or {
			s.db.exec('ROLLBACK')
			return err
		}
	}

	s.db.exec('COMMIT') or { return err }

	return s.get_order_by_id(order_id)
}

pub fn (s SqliteService) get_all_orders() []models.Order {
	mut orders := []models.Order{}

	rows := s.db.query(`SELECT * FROM orders ORDER BY id DESC`) or {
		return orders
	}

	for rows.next() {
		mut order := models.Order{
			id: rows.int('id')
			user_id: rows.int('user_id')
			user_name: rows.text('user_name') or { '' }
			total: rows.float('total')
			status: rows.text('status') or { 'pending' }
			created_at: rows.text('created_at') or { '' }
			items: []models.OrderItem{}
		}

		// Load order items
		item_rows := s.db.query(`SELECT * FROM order_items WHERE order_id = ?`, [order.id.str()]) or { continue }
		for item_rows.next() {
			order.items << models.OrderItem{
				product_id: item_rows.int('product_id')
				product_name: item_rows.text('product_name') or { '' }
				quantity: item_rows.int('quantity')
				price: item_rows.float('price')
			}
		}

		orders << order
	}

	return orders
}

pub fn (s SqliteService) get_order_by_id(id int) !models.Order {
	rows := s.db.query(`SELECT * FROM orders WHERE id = ?`, [id.str()]) or {
		return error('Order not found')
	}

	if !rows.next() {
		return error('Order not found')
	}

	mut order := models.Order{
		id: rows.int('id')
		user_id: rows.int('user_id')
		user_name: rows.text('user_name') or { '' }
		total: rows.float('total')
		status: rows.text('status') or { 'pending' }
		created_at: rows.text('created_at') or { '' }
		items: []models.OrderItem{}
	}

	// Load order items
	item_rows := s.db.query(`SELECT * FROM order_items WHERE order_id = ?`, [order.id.str()]) or { return order }
	for item_rows.next() {
		order.items << models.OrderItem{
			product_id: item_rows.int('product_id')
			product_name: item_rows.text('product_name') or { '' }
			quantity: item_rows.int('quantity')
			price: item_rows.float('price')
		}
	}

	return order
}

pub fn (mut s SqliteService) update_order(id int, status string) !models.Order {
	valid_statuses := ['pending', 'completed', 'shipped', 'cancelled']
	if status !in valid_statuses {
		return error('Invalid order status')
	}

	s.db.exec(`UPDATE orders SET status = ? WHERE id = ?`, [status, id.str()]) or { return err }

	if s.db.rows_affected() == 0 {
		return error('Order not found')
	}

	return s.get_order_by_id(id)
}

pub fn (mut s SqliteService) delete_order(id int) ! {
	s.db.exec('BEGIN TRANSACTION') or { return err }

	// Delete order items first
	s.db.exec(`DELETE FROM order_items WHERE order_id = ?`, [id.str()]) or {
		s.db.exec('ROLLBACK')
		return err
	}

	// Delete order
	s.db.exec(`DELETE FROM orders WHERE id = ?`, [id.str()]) or {
		s.db.exec('ROLLBACK')
		return err
	}

	if s.db.rows_affected() == 0 {
		s.db.exec('ROLLBACK')
		return error('Order not found')
	}

	s.db.exec('COMMIT')
}

pub fn (s SqliteService) get_order_stats() models.OrderStats {
	mut stats := models.OrderStats{}

	// Total orders
	rows := s.db.query(`SELECT COUNT(*) as count FROM orders`) or { return stats }
	if rows.next() {
		stats.total_orders = rows.int('count')
	}

	// Pending orders
	rows = s.db.query(`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`) or { return stats }
	if rows.next() {
		stats.pending_orders = rows.int('count')
	}

	// Total revenue
	rows = s.db.query(`SELECT SUM(total) as total FROM orders`) or { return stats }
	if rows.next() {
		stats.total_revenue = rows.float('total')
	}

	return stats
}
