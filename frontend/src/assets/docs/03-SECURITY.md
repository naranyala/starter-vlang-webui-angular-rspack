# Data Security for CRUD Operations

Security best practices for DuckDB and SQLite CRUD integrations.

---

## Table of Contents

1. [Overview](#overview)
2. [Input Validation](#input-validation)
3. [SQL Injection Prevention](#sql-injection-prevention)
4. [Data Integrity](#data-integrity)
5. [File Security](#file-security)
6. [Error Handling](#error-handling)

---

## Overview

Security for CRUD operations focuses on:

| Aspect | Purpose | Implementation |
|--------|---------|----------------|
| Input Validation | Prevent invalid data | Validation functions |
| SQL Injection Prevention | Prevent SQL attacks | Parameterized queries |
| Data Integrity | Ensure data consistency | Constraints, transactions |
| File Security | Protect data files | Permissions, backups |
| Error Handling | Prevent information leakage | Safe error messages |

---

## Input Validation

### Validation Principles

1. **Validate on Input** - Check data before it reaches the database
2. **Validate Types** - Ensure correct data types
3. **Validate Ranges** - Check numeric ranges
4. **Validate Formats** - Verify string formats (email, etc.)
5. **Sanitize Output** - Clean data before displaying

### User Input Validation

```v
pub fn validate_user_input(name string, email string, age int) ! {
    mut errors := []string{}

    // Name validation
    if name.len == 0 {
        errors << 'Name is required'
    }
    if name.len > 100 {
        errors << 'Name must be less than 100 characters'
    }

    // Email validation
    if !email.contains('@') || !email.contains('.') {
        errors << 'Invalid email format'
    }
    if email.len > 255 {
        errors << 'Email must be less than 255 characters'
    }

    // Age validation
    if age < 1 || age > 150 {
        errors << 'Age must be between 1 and 150'
    }

    if errors.len > 0 {
        return error(errors.join(', '))
    }
}
```

### Product Input Validation

```v
pub fn validate_product_input(name string, price f64, stock int) ! {
    // Name validation
    if name.len == 0 {
        return error('Product name is required')
    }
    if name.len > 200 {
        return error('Product name must be less than 200 characters')
    }

    // Price validation
    if price <= 0 {
        return error('Price must be positive')
    }
    if price > 1000000 {
        return error('Price exceeds maximum allowed')
    }

    // Stock validation
    if stock < 0 {
        return error('Stock cannot be negative')
    }
    if stock > 1000000 {
        return error('Stock exceeds maximum allowed')
    }
}
```

### Order Input Validation

```v
pub fn validate_order_input(user_id int, total f64, status string) ! {
    // User ID validation
    if user_id <= 0 {
        return error('Invalid user ID')
    }

    // Total validation
    if total < 0 {
        return error('Total cannot be negative')
    }

    // Status validation (allowlist)
    valid_statuses := ['pending', 'completed', 'shipped', 'cancelled']
    if status !in valid_statuses {
        return error('Invalid order status')
    }
}
```

### Sanitization Functions

```v
// Remove null bytes and dangerous characters
pub fn sanitize_string(input string) string {
    mut result := input.replace('\x00', '')
    result = result.replace('<', '&lt;')
    result = result.replace('>', '&gt;')
    return result
}

// Validate integer range
pub fn validate_int_range(value int, min int, max int) bool {
    return value >= min && value <= max
}

// Validate string length
pub fn validate_string_length(s string, min int, max int) bool {
    return s.len >= min && s.len <= max
}
```

---

## SQL Injection Prevention

### Use Parameterized Queries

**Good - Parameterized:**
```v
// Safe: Using parameterized query
db.exec(`INSERT INTO users (name, email, age) VALUES (?, ?, ?)`,
    [name, email, age.str()]) or { return err }

// Safe: Using parameterized query
rows := db.query(`SELECT * FROM users WHERE id = ?`, [id.str()]) or {
    return error('User not found')
}
```

**Bad - String Interpolation:**
```v
// DANGEROUS: SQL injection vulnerability
db.exec(`INSERT INTO users (name, email) VALUES ('${name}', '${email}')`)

// DANGEROUS: SQL injection vulnerability
db.exec(`DELETE FROM users WHERE id = ${id}`)
```

### Prepared Statement Pattern

```v
pub fn (mut s SqliteService) create_user(name string, email string, age int) !User {
    // Parameters are passed separately from SQL
    params := [name, email, age.str()]
    
    s.db.exec(`INSERT INTO users (name, email, age) VALUES (?, ?, ?)`, params) or {
        if err.msg.contains('UNIQUE constraint failed') {
            return error('Email already exists')
        }
        return err
    }

    user_id := s.db.last_insert_id()
    return s.get_user_by_id(user_id)
}
```

### Query Builder Pattern

```v
pub fn (s SqliteService) search_users(query string, age_min int, age_max int) []User {
    mut users := []User{}
    
    // Build query with placeholders
    sql := `SELECT * FROM users WHERE age BETWEEN ? AND ?`
    params := [age_min.str(), age_max.str()]
    
    // Add search filter safely
    if query.len > 0 {
        sql += ` AND (name LIKE ? OR email LIKE ?)`
        search_param := '%${query}%'
        params << search_param
        params << search_param
    }
    
    sql += ` ORDER BY id DESC`
    
    rows := s.db.query(sql, params) or { return users }
    
    for rows.next() {
        users << User{
            id: rows.int('id')
            name: rows.text('name') or { '' }
            email: rows.text('email') or { '' }
            age: rows.int('age')
        }
    }
    
    return users
}
```

---

## Data Integrity

### Database Constraints (SQLite)

```sql
-- NOT NULL constraint
name TEXT NOT NULL

-- UNIQUE constraint
email TEXT UNIQUE NOT NULL

-- CHECK constraints
age INTEGER CHECK(age >= 1 AND age <= 150)
price REAL CHECK(price > 0)
stock INTEGER CHECK(stock >= 0)

-- Foreign key constraint
user_id INTEGER REFERENCES users(id)

-- Default values
status TEXT DEFAULT 'pending'
created_at TEXT DEFAULT CURRENT_TIMESTAMP
```

### Transaction Management

```v
pub fn (mut s SqliteService) create_order_with_items(user_id int, items []OrderItem) !Order {
    // Start transaction
    s.db.exec('BEGIN TRANSACTION') or { return err }

    defer {
        if err != nil {
            s.db.exec('ROLLBACK') or { println('Rollback failed') }
        }
    }

    // Create order
    s.db.exec(`INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)`,
        [user_id.str(), '0.0', 'pending']) or { return err }

    order_id := s.db.last_insert_id()

    // Create order items
    for item in items {
        s.db.exec(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
            [order_id.str(), item.product_id.str(), item.quantity.str(), item.price.str()]) or {
            return err
        }
    }

    // Commit transaction
    s.db.exec('COMMIT') or { return err }

    return s.get_order_by_id(order_id)
}
```

### Validation at Multiple Layers

```v
// Layer 1: API Handler
pub fn handle_create_user(e &ui.Event) string {
    name := e.data['name'] or { return error_response('Name required') }
    email := e.data['email'] or { return error_response('Email required') }
    age := int(e.data['age']?) or { return error_response('Age required') }

    // Layer 2: Service validation
    user := storage.create_user(name, email, age) or {
        return error_response(err.msg)
    }

    // Layer 3: Database constraints (automatic)
    return success_response(json.encode(user))
}
```

---

## File Security

### SQLite File Permissions

```bash
# Set restrictive permissions on SQLite database
chmod 640 data/app.db
chown app:app data/app.db

# Set permissions on data directory
chmod 750 data/
chown app:app data/
```

### JSON File Protection (DuckDB)

```v
pub fn (s DuckDBService) save_to_file() ! {
    // Create secure temporary file first
    temp_path := '${s.db_path}.tmp'
    
    data := {
        'users': s.users
        'products': s.products
        'orders': s.orders
    }
    
    json_data := json.encode(data)
    
    // Write to temp file
    os.write_file(temp_path, json_data) or { return err }
    
    // Atomic rename (prevents partial writes)
    os.rename(temp_path, s.db_path) or { return err }
}
```

### Backup Strategy

```v
pub fn create_backup(db_path string) ! {
    timestamp := time.now().format('2006-01-02_15-04-05')
    backup_path := 'backups/db_${timestamp}.db'
    
    // Create backup directory
    os.mkdir('backups') or { /* ignore if exists */ }
    
    // Copy database file
    os.cp(db_path, backup_path) or { return err }
    
    println('Backup created: ${backup_path}')
}
```

### Environment-Based Configuration

```bash
# Development
DB_PATH=data/dev.db
APP_DEBUG=true

# Production
DB_PATH=/var/lib/app/production.db
APP_DEBUG=false
LOG_LEVEL=error
```

---

## Error Handling

### Safe Error Messages

```v
// Good: Generic error to user
pub fn create_user(name string, email string) !User {
    db.exec(`INSERT INTO users (...) VALUES (...)`) or {
        // Log detailed error internally
        logger.error('Database error: ${err.msg}')
        // Return generic error to user
        return error('Failed to create user')
    }
}

// Bad: Exposing internal details
return error('SQLite error: UNIQUE constraint failed on users.email')
```

### Error Response Format

```v
pub fn error_response(message string) string {
    return json.encode({
        'success': false
        'error': message
        'code': 'ERROR'
    })
}

pub fn success_response(data string) string {
    return json.encode({
        'success': true
        'data': data
    })
}
```

### Logging Errors

```v
pub fn handle_api_call(e &ui.Event) string {
    method := e.method
    
    // Log request
    logger.info('API call: ${method}')
    
    result := process_request(e) or {
        // Log error with context
        logger.error('API error: method=${method}, error=${err.msg}')
        return error_response(err.msg)
    }
    
    // Log success
    logger.info('API success: ${method}')
    return success_response(result)
}
```

### Graceful Degradation (DuckDB)

```v
pub fn (mut s DuckDBService) create_user(name string, email string, age int) !User {
    user := User{
        id: s.next_user_id++
        name: name
        email: email
        age: age
        created_at: time.now().str()
    }

    s.users << user

    // Persist to file, but don't fail if it fails
    s.save_to_file() or {
        // Log warning but continue - data is in memory
        logger.warn('Failed to persist user to file, data in memory only')
    }

    return user
}
```

---

## Security Checklist

### Input Validation

- [ ] All user inputs validated
- [ ] String lengths checked
- [ ] Numeric ranges validated
- [ ] Email formats verified
- [ ] Allowlists used for enums (status, etc.)

### SQL Injection Prevention

- [ ] All queries use parameterized statements
- [ ] No string interpolation in SQL
- [ ] Search queries use LIKE with escaping

### Data Integrity

- [ ] Database constraints defined
- [ ] Transactions used for related writes
- [ ] Foreign keys enforced
- [ ] Default values set

### File Security

- [ ] Database files have restricted permissions
- [ ] Backup strategy implemented
- [ ] Atomic writes for JSON persistence

### Error Handling

- [ ] Internal errors not exposed to users
- [ ] Errors logged with context
- [ ] Graceful degradation implemented

---

*Last Updated: 2026-03-30*
