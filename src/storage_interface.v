module main

// ============================================================================
// Storage Service Interface
// Provides abstraction for data storage implementations
// ============================================================================

// StorageService interface for data persistence
// Allows swapping between different storage backends (JSON, SQLite, etc.)
pub interface StorageService {
	// User operations
	get_all_users() []User
	get_user_by_id(id int) ?User
	create_user(name string, email string, age int) !User
	update_user(id int, name string, email string, age int) !User
	delete_user(id int) !
	get_user_stats() UserStats

	// Product operations
	get_all_products() []Product
	get_product_by_id(id int) ?Product
	create_product(name string, description string, price f64, stock int, category string) !Product
	update_product(id int, name string, description string, price f64, stock int, category string) !Product
	delete_product(id int) !

	// Order operations
	get_all_orders() []Order
	get_order_by_id(id int) ?Order
	create_order(user_id int, user_name string, items []OrderItem, total f64, status string) !Order
	update_order(id int, status string) !Order
	delete_order(id int) !

	// Statistics
	get_stats() map[string]int
}
