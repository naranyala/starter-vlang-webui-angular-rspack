# Data Layer Architecture

Architecture documentation for DuckDB and SQLite CRUD integrations.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Layer Architecture](#data-layer-architecture)
3. [Storage Backend Comparison](#storage-backend-comparison)
4. [Data Flow](#data-flow)
5. [Service Layer](#service-layer)

---

## System Overview

```
+------------------+         +------------------+
|   Angular        |         |   WebUI          |
|   Frontend       |<------->|   Bridge         |
|  (Port 8080)     |  HTTP   |                  |
+------------------+         +--------+---------+
                                      |
                              +-------v--------+
                              |   V Backend    |
                              |   (WebUI)      |
                              +-------+--------+
                                      |
                     +----------------+----------------+
                     |                                 |
             +-------v--------+               +--------v--------+
             | SQLite Service |               | DuckDB Service  |
             |   (File DB)    |               |   (JSON Store)  |
             +-------+--------+               +--------+--------+
                     |                                 |
             +-------v--------+               +--------v--------+
             |  app.db        |               |  duckdb_demo.json|
             |  (SQLite)      |               |  (JSON File)     |
             +----------------+               +-----------------+
```

---

## Data Layer Architecture

### Storage Abstraction

Both SQLite and DuckDB implementations follow a common service pattern:

```
+---------------------+
|   Storage Service   |
+---------------------+
| - CRUD Operations   |
| - Validation        |
| - Persistence       |
+---------------------+
          |
    +-----+-----+
    |           |
+---v---+   +---v---+
|SQLite |   |DuckDB |
|Service|   |Service|
+-------+   +-------+
```

### Interface Contract

Both services implement the same operations:

| Operation | SQLite | DuckDB |
|-----------|--------|--------|
| Create | `create_user()` | `create_user()` |
| Read | `get_all_users()` | `get_all_users()` |
| Update | `update_user()` | `update_user()` |
| Delete | `delete_user()` | `delete_user()` |

This allows switching between backends without changing API handlers or frontend code.

---

## Storage Backend Comparison

### SQLite Architecture

```
+-------------------+
|  SqliteService    |
+-------------------+
        |
        v
+-------------------+
|  SQLite Database  |
|  (app.db)         |
+-------------------+
|  Tables:          |
|  - users          |
|  - products       |
|  - orders         |
+-------------------+
```

**Characteristics:**
- File-based relational database
- ACID-compliant transactions
- Concurrent read access
- Write locking at database level
- Schema-based (requires table definitions)

**Best For:**
- Production applications
- Multiple concurrent users
- Complex queries with joins
- Data integrity requirements

---

### DuckDB (JSON) Architecture

```
+-------------------+
|  DuckDBService    |
+-------------------+
        |
        v
+-------------------+
|  In-Memory Store  |
|  (arrays/maps)    |
+-------------------+
        |
        v (periodic save)
+-------------------+
|  JSON File        |
|  (duckdb_demo.json)|
+-------------------+
|  Collections:     |
|  - users          |
|  - products       |
|  - orders         |
+-------------------+
```

**Characteristics:**
- In-memory data structures
- JSON file persistence on write
- No schema requirements
- Simple key-value and array operations
- Fast for single-user scenarios

**Best For:**
- Prototyping and demos
- Single-user applications
- Simple data models
- Quick iteration without migrations

---

## Data Flow

### CREATE Operation Flow

```
+----------+     +----------+     +----------+     +----------+
|  User    |     |  API     |     | Storage  |     | Database |
|  Input   |     | Handler  |     | Service  |     |          |
+----+-----+     +----+-----+     +----+-----+     +----+-----+
     |               |               |               |
     | 1. Submit     |               |               |
     |-------------->|               |               |
     |               |               |               |
     |               | 2. Validate   |               |
     |               |-------------->|               |
     |               |               |               |
     |               |               | 3. Insert     |
     |               |               |-------------->|
     |               |               |               |
     |               |               | 4. Return ID  |
     |               |               |<--------------|
     |               |               |               |
     |               | 5. Response   |               |
     |               |<--------------|               |
     |               |               |               |
     | 6. Confirm    |               |               |
     |<--------------|               |               |
     |               |               |               |
```

### READ Operation Flow

```
+----------+     +----------+     +----------+     +----------+
|  User    |     |  API     |     | Storage  |     | Database |
|  Request |     | Handler  |     | Service  |     |          |
+----+-----+     +----+-----+     +----+-----+     +----+-----+
     |               |               |               |
     | 1. Request    |               |               |
     |-------------->|               |               |
     |               |               |               |
     |               | 2. Query      |               |
     |               |-------------->|               |
     |               |               |               |
     |               |               | 3. SELECT     |
     |               |               |-------------->|
     |               |               |               |
     |               |               | 4. Return []  |
     |               |               |<--------------|
     |               |               |               |
     |               | 5. Render     |               |
     |               |<--------------|               |
     |               |               |               |
     | 6. Display    |               |               |
     |<--------------|               |               |
     |               |               |               |
```

### UPDATE Operation Flow

```
+----------+     +----------+     +----------+     +----------+
|  User    |     |  API     |     | Storage  |     | Database |
|  Input   |     | Handler  |     | Service  |     |          |
+----+-----+     +----+-----+     +----+-----+     +----+-----+
     |               |               |               |
     | 1. Edit       |               |               |
     |-------------->|               |               |
     |               |               |               |
     |               | 2. Validate   |               |
     |               |-------------->|               |
     |               |               |               |
     |               |               | 3. UPDATE     |
     |               |               |-------------->|
     |               |               | WHERE id=?    |
     |               |               |               |
     |               |               | 4. Return row |
     |               |               |<--------------|
     |               |               |               |
     |               | 5. Response   |               |
     |               |<--------------|               |
     |               |               |               |
     | 6. Confirm    |               |               |
     |<--------------|               |               |
     |               |               |               |
```

### DELETE Operation Flow

```
+----------+     +----------+     +----------+     +----------+
|  User    |     |  API     |     | Storage  |     | Database |
|  Confirm |     | Handler  |     | Service  |     |          |
+----+-----+     +----+-----+     +----+-----+     +----+-----+
     |               |               |               |
     | 1. Delete     |               |               |
     |-------------->|               |               |
     |               |               |               |
     |               | 2. Validate   |               |
     |               |-------------->|               |
     |               |               |               |
     |               |               | 3. DELETE     |
     |               |               |-------------->|
     |               |               | WHERE id=?    |
     |               |               |               |
     |               |               | 4. Success    |
     |               |               |<--------------|
     |               |               |               |
     |               | 5. Response   |               |
     |               |<--------------|               |
     |               |               |               |
     | 6. Confirm    |               |               |
     |<--------------|               |               |
     |               |               |               |
```

---

## Service Layer

### SQLite Service

```v
pub struct SqliteService {
pub mut:
    db           sqlite.DB
    db_path      string
    initialized  bool
}

pub fn new_sqlite_service(db_path string) !&SqliteService {
    db := sqlite.open(db_path) or { return err }
    create_tables(db)
    return &SqliteService{
        db: db
        db_path: db_path
        initialized: true
    }
}

// CRUD Operations
pub fn (mut s SqliteService) create_user(name string, email string, age int) !User
pub fn (s SqliteService) get_all_users() []User
pub fn (mut s SqliteService) update_user(id int, name string, email string, age int) !User
pub fn (mut s SqliteService) delete_user(id int) !
```

### DuckDB Service

```v
pub struct DuckDBService {
pub mut:
    db_path      string
    users        []User
    products     []Product
    orders       []Order
    next_user_id int
    initialized  bool
}

pub fn new_duckdb_service(db_path string) !&DuckDBService {
    mut s := &DuckDBService{
        db_path: db_path
        next_user_id: 1
        initialized: false
    }
    if os.exists(db_path) {
        s.load_from_file() or { s.insert_demo_data() }
    } else {
        s.insert_demo_data()
    }
    s.initialized = true
    return s
}

// CRUD Operations
pub fn (mut s DuckDBService) create_user(name string, email string, age int) !User
pub fn (s DuckDBService) get_all_users() []User
pub fn (mut s DuckDBService) update_user(id int, name string, email string, age int) !User
pub fn (mut s DuckDBService) delete_user(id int) !
```

### Service Comparison

| Aspect | SQLite Service | DuckDB Service |
|--------|----------------|----------------|
| Initialization | Open DB connection, create tables | Load JSON or create demo data |
| Create | SQL INSERT, return last_insert_id | Append to array, increment ID |
| Read | SQL SELECT with ORDER BY | Clone array, reverse for newest first |
| Update | SQL UPDATE WHERE id=? | Find by ID, update in array |
| Delete | SQL DELETE WHERE id=? | Filter array, save JSON |
| Persistence | Automatic (file-based) | Manual (save_to_file on each write) |

---

## Data Models

### User Model

```v
pub struct User {
pub mut:
    id           int
    name         string
    email        string
    age          int
    created_at   string
}
```

### Product Model

```v
pub struct Product {
pub mut:
    id           int
    name         string
    description  string
    price        f64
    stock        int
    category     string
    created_at   string
}
```

### Order Model

```v
pub struct Order {
pub mut:
    id           int
    user_id      int
    user_name    string
    items        []OrderItem
    total        f64
    status       string
    created_at   string
}

pub struct OrderItem {
pub mut:
    product_id   int
    product_name string
    quantity     int
    price        f64
}
```

---

*Last Updated: 2026-03-30*
