# Getting Started with DuckDB & SQLite CRUD

Quick setup guide for implementing production-ready CRUD operations with DuckDB and SQLite storage backends.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Choose Your Storage Backend](#choose-your-storage-backend)
4. [Configuration](#configuration)
5. [Project Structure](#project-structure)
6. [Running CRUD Operations](#running-crud-operations)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| V Language | 0.5.1+ | Backend development |
| Bun | 1.0+ | Frontend package manager |
| GCC | 9.0+ | C compiler for V |
| GTK3 + WebKit | Latest | Window management (Linux) |

### Install SQLite Module (for SQLite backend)

```bash
v install sqlite
```

---

## Installation

### Quick Install

```bash
# Clone repository
git clone <repository-url>
cd starter-vlang-webui-angular-rspack

# Install dependencies
v install
cd frontend && bun install && cd ..

# Copy environment configuration
cp .env.example .env

# Start development
./run.sh dev
```

---

## Choose Your Storage Backend

### SQLite - Production Ready

**Best for:**
- Production applications
- Concurrent write operations
- ACID-compliant transactions
- Large datasets

**Setup:**
```bash
# Install SQLite module
v install sqlite

# Configure in .env
DB_TYPE=sqlite
DB_PATH=data/app.db
```

**Pros:**
- File-based relational database
- Zero configuration
- ACID transactions
- High performance for reads and writes

**Cons:**
- Requires SQLite module
- File locking on concurrent writes

---

### DuckDB (JSON) - Demo & Prototyping

**Best for:**
- Prototyping and demos
- Single-user applications
- Simple data models
- Quick setup without dependencies

**Setup:**
```bash
# Configure in .env
DB_TYPE=duckdb
DB_PATH=data/duckdb_demo.json
DB_DEMO_MODE=true
```

**Pros:**
- No external dependencies
- Simple JSON file persistence
- Fast in-memory operations
- Easy to inspect and debug

**Cons:**
- In-memory with manual persistence
- Not suitable for high-concurrency
- Limited transaction support

---

## Configuration

### Environment Setup

Copy and configure your environment:
```bash
cp .env.example .env
```

### SQLite Configuration

```bash
# Application
APP_ENV=development
APP_DEBUG=true

# Server
SERVER_HOST=localhost
SERVER_PORT=8080

# SQLite Database
DB_TYPE=sqlite
DB_PATH=data/app.db

# Logging
LOG_LEVEL=info
LOG_TO_CONSOLE=true
```

### DuckDB Configuration

```bash
# Application
APP_ENV=development
APP_DEBUG=true

# Server
SERVER_HOST=localhost
SERVER_PORT=8080

# DuckDB Database (JSON)
DB_TYPE=duckdb
DB_PATH=data/duckdb_demo.json
DB_DEMO_MODE=true

# Logging
LOG_LEVEL=info
LOG_TO_CONSOLE=true
```

### Configuration Reference

| Variable | SQLite | DuckDB | Description |
|----------|--------|--------|-------------|
| DB_TYPE | sqlite | duckdb | Storage backend type |
| DB_PATH | data/app.db | data/duckdb_demo.json | Database file path |
| DB_DEMO_MODE | false | true | Enable demo data seeding |

---

## Project Structure

```
starter-vlang-webui-angular-rspack/
├── src/                          # V Backend Source
│   ├── main.v                    # Application entry point
│   ├── api_handlers.v            # CRUD API handlers
│   ├── json_storage_service.v    # DuckDB JSON storage
│   ├── sqlite_service.v          # SQLite storage service
│   └── validator.v               # Input validation
│
├── frontend/                     # Angular Frontend
│   ├── src/
│   │   ├── views/                # CRUD components
│   │   ├── core/                 # API services
│   │   └── models/               # TypeScript interfaces
│   └── package.json
│
├── data/                         # Database Files
│   ├── app.db                    # SQLite database
│   └── duckdb_demo.json          # DuckDB JSON data
│
├── docs/                         # Documentation
│   ├── INDEX.md                  # Documentation index
│   ├── 01-CRUD-DEMOS.md          # CRUD implementation guides
│   └── 02-API_REFERENCE.md       # API documentation
│
├── .env                          # Environment configuration
├── .env.example                  # Environment template
└── run.sh                        # Build and run script
```

---

## Running CRUD Operations

### Start Development Server

```bash
./run.sh dev
```

Access the application at `http://localhost:8080`

### Test CRUD Operations

**Via Frontend UI:**

1. Navigate to **Users** section
2. Click **Create User** to add a new user
3. Click **Edit** on any user to update
4. Click **Delete** to remove a user

**Via API Calls:**

```typescript
// Get all users
const users = await api.call<User[]>('getUsers');

// Create user
const newUser = await api.call<User>('createUser', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 28
});

// Update user
const updated = await api.call<User>('updateUser', {
  id: newUser.id,
  name: 'John Updated',
  email: 'john.updated@example.com',
  age: 29
});

// Delete user
await api.call('deleteUser', { id: newUser.id });
```

### Verify Data Persistence

**SQLite:**
```bash
# Check SQLite database
sqlite3 data/app.db "SELECT * FROM users;"
```

**DuckDB (JSON):**
```bash
# View JSON data
cat data/duckdb_demo.json
```

---

## Troubleshooting

### SQLite Module Not Found

```bash
v install sqlite
```

### Database File Not Found

```bash
# Create data directory
mkdir -p data

# Run application to generate database
./run.sh dev
```

### Port Already in Use

```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Or change port in .env
SERVER_PORT=8081
```

### Frontend Build Fails

```bash
cd frontend
rm -rf node_modules
bun install
bun run build
```

### Permission Denied (SQLite)

```bash
# Fix permissions
chmod 644 data/app.db
chown $(whoami) data/app.db
```

### JSON File Corrupted (DuckDB)

```bash
# Remove corrupted file
rm data/duckdb_demo.json

# Restart application to regenerate
./run.sh dev
```

---

## Next Steps

1. [SQLite Integration Guide](01-CRUD-DEMOS.md#sqlite-integration)
2. [DuckDB Integration Guide](01-CRUD-DEMOS.md#duckdb-integration)
3. [API Reference](02-API_REFERENCE.md)
4. [Data Security](03-SECURITY.md)

---

*Last Updated: 2026-03-30*
