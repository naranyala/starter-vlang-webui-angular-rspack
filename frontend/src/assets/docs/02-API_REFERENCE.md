# CRUD API Reference

Complete API documentation for DuckDB and SQLite CRUD operations.

---

## Table of Contents

1. [Overview](#overview)
2. [Request/Response Format](#requestresponse-format)
3. [User Endpoints](#user-endpoints)
4. [Product Endpoints](#product-endpoints)
5. [Order Endpoints](#order-endpoints)
6. [Error Codes](#error-codes)

---

## Overview

All CRUD endpoints follow a consistent request/response pattern through the WebUI bridge.

### Base URL

```
webui://localhost:8080/api
```

### Available Endpoints

| Entity | Create | Read (All) | Read (One) | Update | Delete |
|--------|--------|------------|------------|--------|--------|
| User | `createUser` | `getUsers` | `getUserById` | `updateUser` | `deleteUser` |
| Product | `createProduct` | `getProducts` | `getProductById` | `updateProduct` | `deleteProduct` |
| Order | `createOrder` | `getOrders` | `getOrderById` | `updateOrder` | `deleteOrder` |

---

## Request/Response Format

### Request Format

```typescript
interface ApiRequest {
  method: string;
  params?: Record<string, unknown>;
}
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Usage Example

```typescript
// Get all users
const users = await api.call<User[]>('getUsers');

// Create user
const user = await api.call<User>('createUser', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 28
});

// Update user
await api.call('updateUser', {
  id: user.id,
  name: 'John Updated',
  email: 'john.updated@example.com',
  age: 29
});

// Delete user
await api.call('deleteUser', { id: user.id });
```

---

## User Endpoints

### getUsers

Get all users, sorted by newest first.

**Method:** `getUsers`

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 28,
      "created_at": "2026-03-30T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "age": 34,
      "created_at": "2026-03-30T09:00:00Z"
    }
  ]
}
```

**Example:**
```typescript
const users = await api.call<User[]>('getUsers');
```

---

### getUserById

Get a single user by ID.

**Method:** `getUserById`

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | number | Yes | User ID |

**Request:**
```json
{
  "method": "getUserById",
  "params": { "id": 1 }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28,
    "created_at": "2026-03-30T10:00:00Z"
  }
}
```

**Example:**
```typescript
const user = await api.call<User>('getUserById', { id: 1 });
```

**Errors:**
| Code | Message |
|------|---------|
| NOT_FOUND | User not found |

---

### createUser

Create a new user.

**Method:** `createUser`

**Parameters:**
| Name | Type | Required | Validation |
|------|------|----------|------------|
| name | string | Yes | Min 1 character |
| email | string | Yes | Valid email format |
| age | number | Yes | 1-150 |

**Request:**
```json
{
  "method": "createUser",
  "params": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 34
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 34,
    "created_at": "2026-03-30T12:00:00Z"
  },
  "message": "User created successfully"
}
```

**Example:**
```typescript
const user = await api.call<User>('createUser', {
  name: 'Jane Smith',
  email: 'jane@example.com',
  age: 34
});
```

**Errors:**
| Code | Message |
|------|---------|
| VALIDATION_ERROR | Name is required |
| VALIDATION_ERROR | Invalid email format |
| VALIDATION_ERROR | Age must be between 1 and 150 |
| CONFLICT | Email already exists |

---

### updateUser

Update an existing user.

**Method:** `updateUser`

**Parameters:**
| Name | Type | Required | Validation |
|------|------|----------|------------|
| id | number | Yes | Must exist |
| name | string | Yes | Min 1 character |
| email | string | Yes | Valid email format |
| age | number | Yes | 1-150 |

**Request:**
```json
{
  "method": "updateUser",
  "params": {
    "id": 1,
    "name": "John Updated",
    "email": "john.updated@example.com",
    "age": 29
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john.updated@example.com",
    "age": 29,
    "created_at": "2026-03-30T10:00:00Z"
  }
}
```

**Example:**
```typescript
const user = await api.call<User>('updateUser', {
  id: 1,
  name: 'John Updated',
  email: 'john.updated@example.com',
  age: 29
});
```

**Errors:**
| Code | Message |
|------|---------|
| VALIDATION_ERROR | Name is required |
| VALIDATION_ERROR | Invalid email format |
| VALIDATION_ERROR | Age must be between 1 and 150 |
| NOT_FOUND | User not found |
| CONFLICT | Email already exists |

---

### deleteUser

Delete a user.

**Method:** `deleteUser`

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | number | Yes | User ID |

**Request:**
```json
{
  "method": "deleteUser",
  "params": { "id": 1 }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted"
}
```

**Example:**
```typescript
await api.call('deleteUser', { id: 1 });
```

**Errors:**
| Code | Message |
|------|---------|
| NOT_FOUND | User not found |

---

## Product Endpoints

### getProducts

Get all products, sorted by newest first.

**Method:** `getProducts`

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop Pro",
      "description": "High-performance laptop",
      "price": 1299.99,
      "stock": 50,
      "category": "Electronics",
      "created_at": "2026-03-30T10:00:00Z"
    }
  ]
}
```

**Example:**
```typescript
const products = await api.call<Product[]>('getProducts');
```

---

### getProductById

Get a single product by ID.

**Method:** `getProductById`

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | number | Yes | Product ID |

**Example:**
```typescript
const product = await api.call<Product>('getProductById', { id: 1 });
```

**Errors:**
| Code | Message |
|------|---------|
| NOT_FOUND | Product not found |

---

### createProduct

Create a new product.

**Method:** `createProduct`

**Parameters:**
| Name | Type | Required | Validation |
|------|------|----------|------------|
| name | string | Yes | Min 1 character |
| description | string | No | - |
| price | number | Yes | Must be positive |
| stock | number | Yes | Non-negative |
| category | string | No | - |

**Request:**
```json
{
  "method": "createProduct",
  "params": {
    "name": "New Product",
    "description": "Product description",
    "price": 99.99,
    "stock": 100,
    "category": "Electronics"
  }
}
```

**Example:**
```typescript
const product = await api.call<Product>('createProduct', {
  name: 'New Product',
  description: 'Product description',
  price: 99.99,
  stock: 100,
  category: 'Electronics'
});
```

**Errors:**
| Code | Message |
|------|---------|
| VALIDATION_ERROR | Product name is required |
| VALIDATION_ERROR | Price must be positive |
| VALIDATION_ERROR | Stock cannot be negative |

---

### updateProduct

Update an existing product.

**Method:** `updateProduct`

**Parameters:**
| Name | Type | Required |
|------|------|----------|
| id | number | Yes |
| name | string | Yes |
| description | string | No |
| price | number | Yes |
| stock | number | Yes |
| category | string | No |

**Example:**
```typescript
const product = await api.call<Product>('updateProduct', {
  id: 1,
  name: 'Updated Product',
  price: 89.99,
  stock: 50
});
```

**Errors:**
| Code | Message |
|------|---------|
| VALIDATION_ERROR | Product name is required |
| VALIDATION_ERROR | Price must be positive |
| VALIDATION_ERROR | Stock cannot be negative |
| NOT_FOUND | Product not found |

---

### deleteProduct

Delete a product.

**Method:** `deleteProduct`

**Parameters:**
| Name | Type | Required |
|------|------|----------|
| id | number | Yes |

**Example:**
```typescript
await api.call('deleteProduct', { id: 1 });
```

**Errors:**
| Code | Message |
|------|---------|
| NOT_FOUND | Product not found |
| CONFLICT | Cannot delete product with existing orders |

---

## Order Endpoints

### getOrders

Get all orders with items, sorted by newest first.

**Method:** `getOrders`

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "user_name": "John Doe",
      "items": [
        {
          "product_id": 1,
          "product_name": "Laptop Pro",
          "quantity": 1,
          "price": 1299.99
        }
      ],
      "total": 1299.99,
      "status": "completed",
      "created_at": "2026-03-30T10:00:00Z"
    }
  ]
}
```

**Example:**
```typescript
const orders = await api.call<Order[]>('getOrders');
```

---

### getOrderById

Get a single order by ID with items.

**Method:** `getOrderById`

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | number | Yes | Order ID |

**Example:**
```typescript
const order = await api.call<Order>('getOrderById', { id: 1 });
```

**Errors:**
| Code | Message |
|------|---------|
| NOT_FOUND | Order not found |

---

### createOrder

Create a new order with items.

**Method:** `createOrder`

**Parameters:**
| Name | Type | Required | Validation |
|------|------|----------|------------|
| user_id | number | Yes | Must be positive |
| user_name | string | Yes | Min 1 character |
| items | OrderItem[] | No | - |
| total | number | Yes | Non-negative |
| status | string | No | pending/completed/shipped/cancelled |

**OrderItem Format:**
```typescript
interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}
```

**Request:**
```json
{
  "method": "createOrder",
  "params": {
    "user_id": 1,
    "user_name": "John Doe",
    "items": [
      {
        "product_id": 1,
        "product_name": "Laptop Pro",
        "quantity": 1,
        "price": 1299.99
      }
    ],
    "total": 1299.99,
    "status": "pending"
  }
}
```

**Example:**
```typescript
const order = await api.call<Order>('createOrder', {
  user_id: 1,
  user_name: 'John Doe',
  items: [
    {
      product_id: 1,
      product_name: 'Laptop Pro',
      quantity: 1,
      price: 1299.99
    }
  ],
  total: 1299.99,
  status: 'pending'
});
```

**Errors:**
| Code | Message |
|------|---------|
| VALIDATION_ERROR | Invalid user ID |
| VALIDATION_ERROR | Total cannot be negative |
| VALIDATION_ERROR | Invalid order status |

---

### updateOrder

Update order status.

**Method:** `updateOrder`

**Parameters:**
| Name | Type | Required | Validation |
|------|------|----------|------------|
| id | number | Yes | Must exist |
| status | string | Yes | pending/completed/shipped/cancelled |

**Example:**
```typescript
const order = await api.call<Order>('updateOrder', {
  id: 1,
  status: 'completed'
});
```

**Errors:**
| Code | Message |
|------|---------|
| VALIDATION_ERROR | Invalid order status |
| NOT_FOUND | Order not found |

---

### deleteOrder

Delete an order and its items.

**Method:** `deleteOrder`

**Parameters:**
| Name | Type | Required |
|------|------|----------|
| id | number | Yes |

**Example:**
```typescript
await api.call('deleteOrder', { id: 1 });
```

**Errors:**
| Code | Message |
|------|---------|
| NOT_FOUND | Order not found |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input parameters |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict (duplicate, has dependencies) |
| INTERNAL_ERROR | 500 | Internal server error |

### Error Response Format

```json
{
  "success": false,
  "error": "Detailed error message",
  "code": "ERROR_CODE"
}
```

### Common Error Messages

**Validation Errors:**
- "Name is required"
- "Invalid email format"
- "Age must be between 1 and 150"
- "Product name is required"
- "Price must be positive"
- "Stock cannot be negative"
- "Invalid user ID"
- "Total cannot be negative"
- "Invalid order status"

**Not Found Errors:**
- "User not found"
- "Product not found"
- "Order not found"

**Conflict Errors:**
- "Email already exists"
- "Cannot delete product with existing orders"

---

## Data Models

### User

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  created_at: string;
}
```

### Product

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  created_at: string;
}
```

### Order

```typescript
interface Order {
  id: number;
  user_id: number;
  user_name: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'shipped' | 'cancelled';
  created_at: string;
}

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}
```

---

*Last Updated: 2026-03-30*
