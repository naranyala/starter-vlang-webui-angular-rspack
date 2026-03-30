# DuckDB & SQLite CRUD Integration Documentation

Production-ready guides for implementing CRUD operations with DuckDB and SQLite storage backends.

---

## Documentation Overview

### Core CRUD Integration Guides

| Document | Description |
|----------|-------------|
| [Getting Started](00-GETTING_STARTED.md) | Quick setup for DuckDB/SQLite CRUD |
| [Architecture](01-ARCHITECTURE.md) | Data layer architecture |
| [SQLite Integration](01-CRUD-DEMOS.md#sqlite-integration) | Production SQLite setup |
| [DuckDB Integration](01-CRUD-DEMOS.md#duckdb-integration) | Production DuckDB setup |
| [API Reference](02-API_REFERENCE.md) | CRUD API endpoints |
| [Data Security](03-SECURITY.md) | Security for CRUD operations |
| [Development](04-DEVELOPMENT.md) | CRUD development workflows |
| [Deployment](05-DEPLOYMENT.md) | Deploying with SQLite/DuckDB |

---

## Quick Start

### 1. Choose Your Storage Backend

**SQLite** - For production applications:
- File-based relational database
- ACID-compliant transactions
- Best for: Production workloads, concurrent writes

**DuckDB (JSON)** - For demos and prototyping:
- In-memory with JSON persistence
- Simple setup, no dependencies
- Best for: Prototyping, demos, single-user apps

### 2. Setup Your Backend

**SQLite:**
```bash
v install sqlite
# Configure in .env
DB_TYPE=sqlite
DB_PATH=data/app.db
```

**DuckDB:**
```bash
# Configure in .env
DB_TYPE=duckdb
DB_PATH=data/duckdb_demo.json
DB_DEMO_MODE=true
```

### 3. Run CRUD Operations

```typescript
// Frontend service calls
const users = await api.call<User[]>('getUsers');
await api.call('createUser', { name: 'John', email: 'john@example.com', age: 28 });
await api.call('updateUser', { id: 1, name: 'John Updated' });
await api.call('deleteUser', { id: 1 });
```

---

## For Different Roles

### Backend Developers

Start here:
1. [Architecture - Data Layer](01-ARCHITECTURE.md#data-layer)
2. [SQLite Integration](01-CRUD-DEMOS.md#sqlite-integration)
3. [API Reference](02-API_REFERENCE.md)

### Frontend Developers

Start here:
1. [Getting Started](00-GETTING_STARTED.md)
2. [API Reference](02-API_REFERENCE.md)
3. [Development - Frontend Patterns](04-DEVELOPMENT.md#frontend-patterns)

### DevOps

Start here:
1. [Deployment](05-DEPLOYMENT.md)
2. [Data Security](03-SECURITY.md)
3. [Configuration](00-GETTING_STARTED.md#configuration)

---

## CRUD Operations Reference

### Users

| Operation | Endpoint | Parameters |
|-----------|----------|------------|
| List | `getUsers` | None |
| Get | `getUserById` | `id` |
| Create | `createUser` | `name`, `email`, `age` |
| Update | `updateUser` | `id`, `name`, `email`, `age` |
| Delete | `deleteUser` | `id` |

### Products

| Operation | Endpoint | Parameters |
|-----------|----------|------------|
| List | `getProducts` | None |
| Create | `createProduct` | `name`, `description`, `price`, `stock`, `category` |
| Update | `updateProduct` | `id`, `name`, `description`, `price`, `stock`, `category` |
| Delete | `deleteProduct` | `id` |

### Orders

| Operation | Endpoint | Parameters |
|-----------|----------|------------|
| List | `getOrders` | None |
| Create | `createOrder` | `user_id`, `user_name`, `items`, `total`, `status` |
| Update | `updateOrder` | `id`, `status` |
| Delete | `deleteOrder` | `id` |

---

## Support

For issues or questions:

1. Check [Troubleshooting](00-GETTING_STARTED.md#troubleshooting)
2. Review [Data Security](03-SECURITY.md)
3. Open a GitHub issue

---

*Last Updated: 2026-03-30*
