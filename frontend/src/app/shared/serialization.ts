/**
 * Serialization/Deserialization Utilities
 * 
 * Provides type-safe serialization for backend communication
 */

// ============================================================================
// Type Guards for Runtime Validation
// ============================================================================

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  user_name: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface UserStats {
  total_users: number;
  today_count: number;
  unique_domains: number;
}

// Type guard for User
export function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'email' in data &&
    'age' in data &&
    typeof (data as User).id === 'number' &&
    typeof (data as User).name === 'string' &&
    typeof (data as User).email === 'string' &&
    typeof (data as User).age === 'number'
  );
}

// Type guard for Product
export function isProduct(data: unknown): data is Product {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'price' in data &&
    typeof (data as Product).id === 'number' &&
    typeof (data as Product).name === 'string' &&
    typeof (data as Product).price === 'number'
  );
}

// Type guard for Order
export function isOrder(data: unknown): data is Order {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'user_id' in data &&
    'total' in data &&
    typeof (data as Order).id === 'number' &&
    typeof (data as Order).total === 'number'
  );
}

// Type guard for array
export function isArray<T>(data: unknown, guard: (item: unknown) => item is T): data is T[] {
  return Array.isArray(data) && data.every(guard);
}

// ============================================================================
// Request Builder
// Centralized request serialization
// ============================================================================

export class RequestBuilder {
  /**
   * Create a serialized request for the backend
   */
  static create<T extends Record<string, unknown>>(data: T): string {
    return JSON.stringify(data);
  }

  /**
   * Create user creation request
   */
  static createUser(name: string, email: string, age: number): string {
    return this.create({ name, email, age });
  }

  /**
   * Create user update request
   */
  static updateUser(id: number, name: string, email: string, age: number): string {
    return this.create({ id, name, email, age });
  }

  /**
   * Create delete request
   */
  static delete(id: number): string {
    return this.create({ id });
  }

  /**
   * Create product creation request
   */
  static createProduct(
    name: string,
    description: string,
    price: number,
    stock: number,
    category: string
  ): string {
    return this.create({ name, description, price, stock, category });
  }

  /**
   * Create product update request
   */
  static updateProduct(
    id: number,
    name: string,
    description: string,
    price: number,
    stock: number,
    category: string
  ): string {
    return this.create({ id, name, description, price, stock, category });
  }

  /**
   * Create order request
   */
  static createOrder(
    userId: number,
    userName: string,
    total: number,
    status: string = 'pending'
  ): string {
    return this.create({ user_id: userId, user_name: userName, total, status });
  }

  /**
   * Create order update request
   */
  static updateOrder(id: number, status: string): string {
    return this.create({ id, status });
  }
}

// ============================================================================
// Response Transformer
// Transform snake_case to camelCase if needed
// ============================================================================

/**
 * Transform snake_case keys to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Transform object keys from snake_case to camelCase
 */
export function transformKeys<T>(obj: unknown, transform: (key: string) => string): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transform)) as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[transform(key)] = transformKeys(value, transform);
    }
    return result as T;
  }

  return obj as T;
}

/**
 * Transform response from snake_case to camelCase
 * Note: Our backend already uses snake_case consistently, so this is optional
 */
export function toCamelCase<T>(obj: unknown): T {
  return transformKeys<T>(obj, snakeToCamel);
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate required string
 */
export function isValidString(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate number range
 */
export function isValidNumberRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0;
}
