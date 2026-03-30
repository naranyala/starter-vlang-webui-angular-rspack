/**
 * API Models
 * Type definitions for API requests and responses
 */

/**
 * User entity
 */
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  created_at: string;
}

/**
 * Product entity
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  created_at: string;
}

/**
 * Order item entity
 */
export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

/**
 * Order entity
 */
export interface Order {
  id: number;
  user_id: number;
  user_name: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  created_at: string;
}

export type OrderStatus = 'pending' | 'completed' | 'shipped' | 'cancelled';

/**
 * Statistics entities
 */
export interface UserStats {
  total_users: number;
  today_count: number;
  unique_domains: number;
}

export interface ProductStats {
  total_products: number;
  total_value: number;
  low_stock_count: number;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
}

/**
 * Form DTOs
 */
export interface CreateUserDto {
  name: string;
  email: string;
  age: number;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  age: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface UpdateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface CreateOrderDto {
  user_id: number;
  user_name: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

export interface UpdateOrderDto {
  status: OrderStatus;
}
