# Production-Ready SQLite & DuckDB CRUD Integration

Complete guide for implementing CRUD operations with SQLite and DuckDB storage backends.

---

## Table of Contents

1. [Overview](#overview)
2. [SQLite Integration](#sqlite-integration)
3. [DuckDB Integration](#duckdb-integration)
4. [Common CRUD Patterns](#common-crud-patterns)
5. [Testing Checklist](#testing-checklist)
6. [Best Practices](#best-practices)

---

## Overview

This guide provides production-ready implementations for CRUD (Create, Read, Update, Delete) operations using SQLite and DuckDB storage backends.

### Backend Comparison

| Feature | SQLite | DuckDB (JSON) |
|---------|--------|---------------|
| Storage Type | File-based SQLite database | In-memory with JSON persistence |
| Setup Complexity | Medium (requires module) | Simple (no dependencies) |
| Performance | Fast (disk-based, cached) | Very Fast (memory-based) |
| Persistence | Automatic (transaction-based) | Manual (save on each write) |
| Concurrency | Multiple readers, single writer | Single-user only |
| ACID Compliance | Yes | No |
| Best For | Production workloads | Demos, prototyping, single-user |

---

## SQLite Integration

### Setup

#### 1. Install SQLite Module

```bash
v install sqlite
```

#### 2. Configure Environment

```bash
# .env
DB_TYPE=sqlite
DB_PATH=data/app.db
DB_DEMO_MODE=false
```

#### 3. Initialize Database Schema

```v
module main

import sqlite

pub fn create_tables(db sqlite.DB) ! {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            age INTEGER NOT NULL CHECK(age >= 1 AND age <= 150),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `) or { return err }

    // Products table
    db.exec(`
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
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            user_name TEXT NOT NULL,
            total REAL NOT NULL CHECK(total >= 0),
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'shipped', 'cancelled')),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `) or { return err }

    // Order items table
    db.exec(`
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
```

### CRUD Operations

#### User Operations

**CREATE:**
```v
pub fn (mut s SqliteService) create_user(name string, email string, age int) !User {
    // Validate input
    if name.len == 0 {
        return error('Name is required')
    }
    if !email.contains('@') {
        return error('Invalid email format')
    }
    if age < 1 || age > 150 {
        return error('Age must be between 1 and 150')
    }

    // Insert record
    s.db.exec(`INSERT INTO users (name, email, age) VALUES (?, ?, ?)`,
        [name, email, age.str()]) or {
        if err.msg.contains('UNIQUE constraint failed') {
            return error('Email already exists')
        }
        return err
    }

    // Get created user
    user_id := s.db.last_insert_id()
    return s.get_user_by_id(user_id) or { return error('User created but not found') }
}
```

**READ (All):**
```v
pub fn (s SqliteService) get_all_users() []User {
    mut users := []User{}

    rows := s.db.query(`SELECT * FROM users ORDER BY id DESC`) or {
        println('Query error: ${err}')
        return users
    }

    for rows.next() {
        users << User{
            id: rows.int('id')
            name: rows.text('name') or { '' }
            email: rows.text('email') or { '' }
            age: rows.int('age')
            created_at: rows.text('created_at') or { '' }
        }
    }

    return users
}
```

**READ (By ID):**
```v
pub fn (s SqliteService) get_user_by_id(id int) !User {
    rows := s.db.query(`SELECT * FROM users WHERE id = ?`, [id.str()]) or {
        return error('User not found')
    }

    if !rows.next() {
        return error('User not found')
    }

    user := User{
        id: rows.int('id')
        name: rows.text('name') or { '' }
        email: rows.text('email') or { '' }
        age: rows.int('age')
        created_at: rows.text('created_at') or { '' }
    }

    return user
}
```

**UPDATE:**
```v
pub fn (mut s SqliteService) update_user(id int, name string, email string, age int) !User {
    // Validate input
    if name.len == 0 {
        return error('Name is required')
    }
    if !email.contains('@') {
        return error('Invalid email format')
    }
    if age < 1 || age > 150 {
        return error('Age must be between 1 and 150')
    }

    // Update record
    s.db.exec(`UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?`,
        [name, email, age.str(), id.str()]) or {
        if err.msg.contains('UNIQUE constraint failed') {
            return error('Email already exists')
        }
        return err
    }

    // Check if user exists
    if s.db.rows_affected() == 0 {
        return error('User not found')
    }

    return s.get_user_by_id(id) or { return error('User updated but not found') }
}
```

**DELETE:**
```v
pub fn (mut s SqliteService) delete_user(id int) ! {
    s.db.exec(`DELETE FROM users WHERE id = ?`, [id.str()]) or { return err }

    if s.db.rows_affected() == 0 {
        return error('User not found')
    }
}
```

#### Product Operations

**CREATE:**
```v
pub fn (mut s SqliteService) create_product(name string, description string, price f64, stock int, category string) !Product {
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
    return s.get_product_by_id(product_id) or { return error('Product created but not found') }
}
```

**READ:**
```v
pub fn (s SqliteService) get_all_products() []Product {
    mut products := []Product{}

    rows := s.db.query(`SELECT * FROM products ORDER BY id DESC`) or {
        return products
    }

    for rows.next() {
        products << Product{
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
```

**UPDATE:**
```v
pub fn (mut s SqliteService) update_product(id int, name string, description string, price f64, stock int, category string) !Product {
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

    return s.get_product_by_id(id) or { return error('Product updated but not found') }
}
```

**DELETE:**
```v
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
```

#### Order Operations

**CREATE:**
```v
pub fn (mut s SqliteService) create_order(user_id int, user_name string, items []OrderItem, total f64, status string) !Order {
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

    return s.get_order_by_id(order_id) or { return error('Order created but not found') }
}
```

**READ:**
```v
pub fn (s SqliteService) get_all_orders() []Order {
    mut orders := []Order{}

    rows := s.db.query(`SELECT * FROM orders ORDER BY id DESC`) or {
        return orders
    }

    for rows.next() {
        mut order := Order{
            id: rows.int('id')
            user_id: rows.int('user_id')
            user_name: rows.text('user_name') or { '' }
            total: rows.float('total')
            status: rows.text('status') or { 'pending' }
            created_at: rows.text('created_at') or { '' }
            items: []OrderItem{}
        }

        // Load order items
        item_rows := s.db.query(`SELECT * FROM order_items WHERE order_id = ?`, [order.id.str()]) or { continue }
        for item_rows.next() {
            order.items << OrderItem{
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
```

**UPDATE:**
```v
pub fn (mut s SqliteService) update_order(id int, status string) !Order {
    if status !in ['pending', 'completed', 'shipped', 'cancelled'] {
        return error('Invalid order status')
    }

    s.db.exec(`UPDATE orders SET status = ? WHERE id = ?`, [status, id.str()]) or { return err }

    if s.db.rows_affected() == 0 {
        return error('Order not found')
    }

    return s.get_order_by_id(id) or { return error('Order updated but not found') }
}
```

**DELETE:**
```v
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
```

---

## DuckDB Integration

### Setup

#### 1. Configure Environment

```bash
# .env
DB_TYPE=duckdb
DB_PATH=data/duckdb_demo.json
DB_DEMO_MODE=true
```

#### 2. Initialize Service

```v
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
```

### CRUD Operations

#### User Operations

**CREATE:**
```v
pub fn (mut s DuckDBService) create_user(name string, email string, age int) !User {
    // Validate input
    if name.len == 0 {
        return error('Name is required')
    }
    if !email.contains('@') {
        return error('Invalid email format')
    }
    if age < 1 || age > 150 {
        return error('Age must be between 1 and 150')
    }

    // Check for duplicate email
    for user in s.users {
        if user.email == email {
            return error('Email already exists')
        }
    }

    // Create user
    user := User{
        id: s.next_user_id++
        name: name
        email: email
        age: age
        created_at: time.now().str()
    }

    s.users << user

    // Persist to file
    s.save_to_file() or { println('Warning: Could not save user to file') }

    return user
}
```

**READ (All):**
```v
pub fn (s DuckDBService) get_all_users() []User {
    mut users := s.users.clone()
    users.reverse()  // Show newest first
    return users
}
```

**READ (By ID):**
```v
pub fn (s DuckDBService) get_user_by_id(id int) !User {
    for user in s.users {
        if user.id == id {
            return user.clone()
        }
    }
    return error('User not found')
}
```

**UPDATE:**
```v
pub fn (mut s DuckDBService) update_user(id int, name string, email string, age int) !User {
    // Validate input
    if name.len == 0 {
        return error('Name is required')
    }
    if !email.contains('@') {
        return error('Invalid email format')
    }
    if age < 1 || age > 150 {
        return error('Age must be between 1 and 150')
    }

    // Find and update user
    for i, user in s.users {
        if user.id == id {
            // Check for duplicate email (excluding current user)
            for other in s.users {
                if other.email == email && other.id != id {
                    return error('Email already exists')
                }
            }

            s.users[i].name = name
            s.users[i].email = email
            s.users[i].age = age

            s.save_to_file() or { println('Warning: Could not save updated user') }

            return s.users[i]
        }
    }

    return error('User not found')
}
```

**DELETE:**
```v
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
    s.save_to_file() or { println('Warning: Could not save deleted user') }
}
```

#### Product Operations

**CREATE:**
```v
pub fn (mut s DuckDBService) create_product(name string, description string, price f64, stock int, category string) !Product {
    if name.len == 0 {
        return error('Product name is required')
    }
    if price <= 0 {
        return error('Price must be positive')
    }
    if stock < 0 {
        return error('Stock cannot be negative')
    }

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
    s.save_to_file() or { println('Warning: Could not save product') }

    return product
}
```

**READ:**
```v
pub fn (s DuckDBService) get_all_products() []Product {
    mut products := s.products.clone()
    products.reverse()
    return products
}
```

**UPDATE:**
```v
pub fn (mut s DuckDBService) update_product(id int, name string, description string, price f64, stock int, category string) !Product {
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

            s.save_to_file() or { println('Warning: Could not save updated product') }

            return s.products[i]
        }
    }

    return error('Product not found')
}
```

**DELETE:**
```v
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
    s.save_to_file() or { println('Warning: Could not save deleted product') }
}
```

#### Order Operations

**CREATE:**
```v
pub fn (mut s DuckDBService) create_order(user_id int, user_name string, items []OrderItem, total f64, status string) !Order {
    if user_id <= 0 {
        return error('Invalid user ID')
    }
    if total < 0 {
        return error('Total cannot be negative')
    }
    if status !in ['pending', 'completed', 'shipped', 'cancelled'] {
        return error('Invalid order status')
    }

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
    s.save_to_file() or { println('Warning: Could not save order') }

    return order
}
```

**READ:**
```v
pub fn (s DuckDBService) get_all_orders() []Order {
    mut orders := s.orders.clone()
    orders.reverse()
    return orders
}
```

**UPDATE:**
```v
pub fn (mut s DuckDBService) update_order(id int, status string) !Order {
    if status !in ['pending', 'completed', 'shipped', 'cancelled'] {
        return error('Invalid order status')
    }

    for i, order in s.orders {
        if order.id == id {
            s.orders[i].status = status
            s.save_to_file() or { println('Warning: Could not save updated order') }
            return s.orders[i]
        }
    }

    return error('Order not found')
}
```

**DELETE:**
```v
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
    s.save_to_file() or { println('Warning: Could not save deleted order') }
}
```

### File Persistence

```v
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

pub fn (mut s DuckDBService) load_from_file() ! {
    json_data := os.read_file(s.db_path) or { return err }
    data := json.decode(map[string]json.Any, json_data) or { return err }

    s.users = decode_users(data['users']?)
    s.products = decode_products(data['products']?)
    s.orders = decode_orders(data['orders']?)
    s.next_user_id = int(data['next_user_id']?)
    s.next_product_id = int(data['next_product_id']?)
    s.next_order_id = int(data['next_order_id']?)
}
```

---

## Common CRUD Patterns

### Validation Pattern

```v
pub fn validate_user_input(name string, email string, age int) ! {
    mut errors := []string{}

    if name.len == 0 {
        errors << 'Name is required'
    }
    if !email.contains('@') || !email.contains('.') {
        errors << 'Invalid email format'
    }
    if age < 1 || age > 150 {
        errors << 'Age must be between 1 and 150'
    }

    if errors.len > 0 {
        return error(errors.join(', '))
    }
}
```

### Error Handling Pattern

```v
pub fn create_user_safe(name string, email string, age int) ApiResponse {
    user := s.create_user(name, email, age) or {
        return ApiResponse{
            success: false
            error: err.msg
            code: 'VALIDATION_ERROR'
        }
    }

    return ApiResponse{
        success: true
        data: json.encode(user)
        message: 'User created successfully'
    }
}
```

### Transaction Pattern (SQLite)

```v
pub fn create_order_with_items(user_id int, items []OrderItem) !Order {
    s.db.exec('BEGIN TRANSACTION') or { return err }

    // Create order
    s.db.exec(`INSERT INTO orders (...) VALUES (...)`) or {
        s.db.exec('ROLLBACK')
        return err
    }

    order_id := s.db.last_insert_id()

    // Create items
    for item in items {
        s.db.exec(`INSERT INTO order_items (...) VALUES (...)`) or {
            s.db.exec('ROLLBACK')
            return err
        }
    }

    s.db.exec('COMMIT') or { return err }

    return s.get_order_by_id(order_id)
}
```

---

## Testing Checklist

### Backend Tests

#### User CRUD

- [ ] CREATE: Create valid user
- [ ] CREATE: Reject user with missing name
- [ ] CREATE: Reject user with invalid email
- [ ] CREATE: Reject user with invalid age
- [ ] CREATE: Reject duplicate email
- [ ] READ: Get all users (sorted by newest)
- [ ] READ: Get user by ID (exists)
- [ ] READ: Get user by ID (not found)
- [ ] UPDATE: Update existing user
- [ ] UPDATE: Reject update with invalid data
- [ ] UPDATE: Reject update for non-existent user
- [ ] DELETE: Delete existing user
- [ ] DELETE: Reject delete for non-existent user

#### Product CRUD

- [ ] CREATE: Create valid product
- [ ] CREATE: Reject product with missing name
- [ ] CREATE: Reject product with negative price
- [ ] CREATE: Reject product with negative stock
- [ ] READ: Get all products
- [ ] READ: Get product by ID
- [ ] UPDATE: Update existing product
- [ ] DELETE: Delete product without orders
- [ ] DELETE: Reject delete product with orders

#### Order CRUD

- [ ] CREATE: Create valid order
- [ ] CREATE: Reject order with invalid user
- [ ] CREATE: Reject order with negative total
- [ ] READ: Get all orders with items
- [ ] READ: Get order by ID
- [ ] UPDATE: Update order status
- [ ] UPDATE: Reject invalid status
- [ ] DELETE: Delete existing order
- [ ] DELETE: Verify cascade delete of items

### Frontend Tests

- [ ] DataTable renders correctly
- [ ] Search/filter functionality works
- [ ] Pagination works correctly
- [ ] Create modal opens and closes
- [ ] Create form validates input
- [ ] Edit modal populates with data
- [ ] Edit form validates input
- [ ] Delete confirmation dialog appears
- [ ] Delete removes item from list
- [ ] Loading states display correctly
- [ ] Error messages display correctly

### Integration Tests

- [ ] Application starts successfully
- [ ] Dashboard loads with data
- [ ] Users table displays correctly
- [ ] Create user succeeds and persists
- [ ] Update user persists after refresh
- [ ] Delete user removes from database
- [ ] Search returns correct results
- [ ] Data persists after application restart

---

## Best Practices

### SQLite Best Practices

1. **Use Prepared Statements**
   ```v
   // Good: Parameterized query
   db.exec(`INSERT INTO users (name, email) VALUES (?, ?)`, [name, email])

   // Bad: String interpolation (SQL injection risk)
   db.exec(`INSERT INTO users (name, email) VALUES ('${name}', '${email}')`)
   ```

2. **Handle Constraints Gracefully**
   ```v
   db.exec(`INSERT INTO users (...) VALUES (...)`) or {
       if err.msg.contains('UNIQUE constraint failed') {
           return error('Email already exists')
       }
       return err
   }
   ```

3. **Use Transactions for Related Writes**
   ```v
   db.exec('BEGIN TRANSACTION')
   // ... multiple operations
   db.exec('COMMIT')  // or 'ROLLBACK' on error
   ```

4. **Index Frequently Queried Columns**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_orders_user_id ON orders(user_id);
   ```

### DuckDB Best Practices

1. **Save After Every Write**
   ```v
   s.users << user
   s.save_to_file() or { println('Warning: Could not save') }
   ```

2. **Clone Data When Returning**
   ```v
   pub fn get_all_users() []User {
       return s.users.clone()  // Prevent external modification
   }
   ```

3. **Validate Before Modifying State**
   ```v
   // Validate first
   if !valid { return error('Invalid input') }

   // Then modify state
   s.users << user
   ```

4. **Handle File Errors Gracefully**
   ```v
   s.save_to_file() or {
       println('Warning: Persistence failed, data in memory only')
       // Continue - data is still in memory
   }
   ```

### General CRUD Best Practices

1. **Consistent Error Messages**
   ```v
   return error('User not found')      // Clear and specific
   return error('Invalid email format') // Actionable
   ```

2. **Return Full Objects After Create/Update**
   ```v
   user := create_user(...)
   return user  // Not just the ID
   ```

3. **Use Soft Deletes for Audit Trails**
   ```v
   // Instead of DELETE, add deleted_at column
   UPDATE users SET deleted_at = NOW() WHERE id = ?
   ```

4. **Log Important Operations**
   ```v
   logger.info('User created: id=${user.id}, email=${user.email}')
   ```

---

*Last Updated: 2026-03-30*
