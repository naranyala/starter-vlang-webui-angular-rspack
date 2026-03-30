module models

/**
 * User Model
 * Represents a user entity in the system
 */
pub struct User {
pub mut:
	id          int    `json:"id"`
	name        string `json:"name"`
	email       string `json:"email"`
	age         int    `json:"age"`
	created_at  string `json:"created_at"`
}

/**
 * Product Model
 * Represents a product entity in the system
 */
pub struct Product {
pub mut:
	id          int     `json:"id"`
	name        string  `json:"name"`
	description string  `json:"description"`
	price       f64     `json:"price"`
	stock       int     `json:"stock"`
	category    string  `json:"category"`
	created_at  string  `json:"created_at"`
}

/**
 * OrderItem Model
 * Represents an item within an order
 */
pub struct OrderItem {
pub mut:
	product_id   int    `json:"product_id"`
	product_name string `json:"product_name"`
	quantity     int    `json:"quantity"`
	price        f64    `json:"price"`
}

/**
 * Order Model
 * Represents an order entity in the system
 */
pub struct Order {
pub mut:
	id         int         `json:"id"`
	user_id    int         `json:"user_id"`
	user_name  string      `json:"user_name"`
	items      []OrderItem `json:"items"`
	total      f64         `json:"total"`
	status     string      `json:"status"`
	created_at string      `json:"created_at"`
}

/**
 * UserStats Model
 * Statistics about users
 */
pub struct UserStats {
pub mut:
	total_users     int `json:"total_users"`
	today_count     int `json:"today_count"`
	unique_domains  int `json:"unique_domains"`
}

/**
 * ProductStats Model
 * Statistics about products
 */
pub struct ProductStats {
pub mut:
	total_products  int   `json:"total_products"`
	total_value     f64   `json:"total_value"`
	low_stock_count int   `json:"low_stock_count"`
}

/**
 * OrderStats Model
 * Statistics about orders
 */
pub struct OrderStats {
pub mut:
	total_orders    int   `json:"total_orders"`
	pending_orders  int   `json:"pending_orders"`
	total_revenue   f64   `json:"total_revenue"`
}
