module services

import models

/**
 * Storage Repository Interface
 * Defines the contract for all storage implementations
 */
pub interface UserRepository {
pub mut:
	create_user(name string, email string, age int) !models.User
	get_all_users() []models.User
	get_user_by_id(id int) !models.User
	update_user(id int, name string, email string, age int) !models.User
	delete_user(id int) !
	get_user_stats() models.UserStats
}

/**
 * Product Repository Interface
 */
pub interface ProductRepository {
pub mut:
	create_product(name string, description string, price f64, stock int, category string) !models.Product
	get_all_products() []models.Product
	get_product_by_id(id int) !models.Product
	update_product(id int, name string, description string, price f64, stock int, category string) !models.Product
	delete_product(id int) !
	get_product_stats() models.ProductStats
}

/**
 * Order Repository Interface
 */
pub interface OrderRepository {
pub mut:
	create_order(user_id int, user_name string, items []models.OrderItem, total f64, status string) !models.Order
	get_all_orders() []models.Order
	get_order_by_id(id int) !models.Order
	update_order(id int, status string) !models.Order
	delete_order(id int) !
	get_order_stats() models.OrderStats
}

/**
 * Combined Storage Service Interface
 */
pub interface StorageService {
pub mut:
	UserRepository
	ProductRepository
	OrderRepository
	// Lifecycle methods
	close()
	initialize() !
	health_check() bool
}
