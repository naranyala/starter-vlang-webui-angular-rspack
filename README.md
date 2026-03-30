# DuckDB and SQLite CRUD Application

A production-ready web application demonstrating CRUD (Create, Read, Update, Delete) operations with dual database backend support. Built with V language backend and Angular frontend, this application provides a complete solution for data management with either SQLite or DuckDB storage.

## Overview

This application showcases enterprise-grade database integration patterns with two distinct storage backends:

- **SQLite**: A self-contained, serverless, transactional SQL database engine suitable for production workloads
- **DuckDB**: An in-process analytical database optimized for fast queries with JSON persistence for demonstration purposes

The application provides identical CRUD functionality regardless of the chosen backend, allowing developers to evaluate both options for their specific use cases.

## Technology Stack

### Backend

- **Language**: V 0.5.1+
- **Database Drivers**: SQLite module, DuckDB JSON adapter
- **Security**: Password hashing, CSRF protection, rate limiting
- **Architecture**: Repository pattern with service layer abstraction

### Frontend

- **Framework**: Angular 21
- **Bundler**: Rspack
- **Package Manager**: Bun
- **Visualization**: Vega-Lite for data charts
- **State Management**: Angular Signals

## Database Options

### SQLite Backend

SQLite is recommended for production deployments requiring:

- ACID-compliant transactions
- Concurrent read and write operations
- Data persistence without configuration
- Foreign key constraints and referential integrity
- Standard SQL query support

**Configuration:**

```bash
DB_TYPE=sqlite
DB_PATH=data/app.db
```

**Characteristics:**

- File-based relational database
- Zero-configuration setup
- Supports multiple concurrent readers
- Single writer at a time
- Automatic crash recovery
- Suitable for applications up to terabytes of data

### DuckDB Backend

DuckDB with JSON persistence is suitable for:

- Development and prototyping
- Demonstrations and testing
- Single-user applications
- Analytical workloads
- Quick iteration without schema migrations

**Configuration:**

```bash
DB_TYPE=duckdb
DB_PATH=data/duckdb_demo.json
DB_DEMO_MODE=true
```

**Characteristics:**

- In-memory storage with JSON file persistence
- Fast analytical queries
- Simple setup without dependencies
- Automatic data serialization
- Suitable for datasets up to millions of records

## Features

### Data Management

- Complete CRUD operations for Users, Products, and Orders
- Input validation at both client and server layers
- Transaction support for related operations (SQLite)
- Data export and import functionality
- Statistics and aggregation queries

### User Interface

- Responsive dashboard with navigation menu
- Interactive data tables with sorting and filtering
- Modal-based forms for create and edit operations
- Real-time search and filtering
- Toast notifications for user feedback

### Data Visualization

- Bar charts for categorical comparison
- Line charts for time series trends
- Pie charts for part-to-whole relationships
- Scatter plots for correlation analysis
- Area charts for cumulative trends
- Heatmaps for matrix visualization

### Security

- Input sanitization and validation
- Rate limiting (60 requests per minute, 1000 per hour)
- CORS configuration
- Security headers (CSP, HSTS, X-Frame-Options)
- Audit logging for security events

## Quick Start

### Prerequisites

- V Language 0.5.1 or higher
- Bun 1.0 or higher
- GCC 9.0 or higher (for V compilation)
- GTK3 and WebKit (Linux only, for WebUI)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd starter-vlang-webui-angular-rspack
```

2. Install backend dependencies:

```bash
v install
```

3. Install frontend dependencies:

```bash
cd frontend
bun install
cd ..
```

4. Copy environment configuration:

```bash
cp .env.example .env
```

5. Configure your database preference in `.env`:

```bash
# For SQLite (Production)
DB_TYPE=sqlite
DB_PATH=data/app.db

# For DuckDB (Development/Demo)
DB_TYPE=duckdb
DB_PATH=data/duckdb_demo.json
```

6. Start development mode:

```bash
./run.sh dev
```

7. Access the application at `http://localhost:8080`

## Project Structure

```
starter-vlang-webui-angular-rspack/
├── src/                          # V Backend Source
│   ├── main.v                    # Application entry point
│   ├── handlers/                 # API request handlers
│   ├── services/                 # Business logic services
│   ├── models/                   # Data models
│   ├── middleware/               # Request middleware
│   └── security/                 # Security modules
│
├── frontend/                     # Angular Frontend
│   ├── src/
│   │   ├── features/             # Feature modules
│   │   ├── components/           # Shared components
│   │   ├── core/                 # Core services
│   │   └── models/               # TypeScript interfaces
│   └── package.json
│
├── data/                         # Database Files
│   ├── app.db                    # SQLite database
│   └── duckdb_demo.json          # DuckDB JSON data
│
├── docs/                         # Documentation
│   ├── INDEX.md                  # Documentation index
│   ├── 00-GETTING_STARTED.md     # Setup guide
│   ├── 01-CRUD-DEMOS.md          # CRUD implementation guides
│   └── reports/                  # Audit and test reports
│
├── scripts/                      # Utility Scripts
│   ├── sync-docs.sh              # Documentation sync
│   └── generate-docs-manifest.js # Menu generator
│
├── .env.example                  # Environment template
├── run.sh                        # Build and run script
└── README.md                     # This file
```

## Available Commands

| Command | Description |
|---------|-------------|
| `./run.sh` | Start development mode |
| `./run.sh build` | Build production version |
| `./run.sh test` | Run all tests |
| `./run.sh clean` | Clean build artifacts |
| `./run.sh help` | Show help message |

## Configuration Reference

### Application Settings

```bash
# Environment
APP_ENV=development
APP_DEBUG=true
APP_NAME="DuckDB SQLite CRUD App"

# Server
SERVER_HOST=localhost
SERVER_PORT=8080

# Database
DB_TYPE=duckdb
DB_PATH=data/duckdb_demo.json
DB_DEMO_MODE=true

# Security
SESSION_TIMEOUT=3600
CSRF_TIMEOUT=3600
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Logging
LOG_LEVEL=info
LOG_TO_CONSOLE=true
LOG_TO_FILE=false
```

## API Endpoints

### User Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | getUsers | Retrieve all users |
| GET | getUserById | Retrieve user by ID |
| POST | createUser | Create new user |
| PUT | updateUser | Update existing user |
| DELETE | deleteUser | Delete user |
| GET | getUserStats | Get user statistics |

### Product Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | getProducts | Retrieve all products |
| POST | createProduct | Create new product |
| PUT | updateProduct | Update existing product |
| DELETE | deleteProduct | Delete product |
| GET | getProductStats | Get product statistics |

### Order Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | getOrders | Retrieve all orders |
| POST | createOrder | Create new order |
| PUT | updateOrder | Update order status |
| DELETE | deleteOrder | Delete order |
| GET | getOrderStats | Get order statistics |

### Authentication Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | auth.login | Authenticate user |
| POST | auth.logout | End user session |
| POST | auth.getCSRFToken | Get CSRF token |

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
```

## Database Schema

### SQLite Tables

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age INTEGER NOT NULL CHECK(age >= 1 AND age <= 150),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL CHECK(price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
    category TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    total REAL NOT NULL CHECK(total >= 0),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'shipped', 'cancelled')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    price REAL NOT NULL CHECK(price >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Testing

### Run All Tests

```bash
./run.sh test
```

### Backend Tests

```bash
v test src/
```

### Frontend Tests

```bash
cd frontend
bun test
```

### Security Tests

```bash
v test src/security_test.v
cd frontend && bun test security.test.ts
```

## Deployment

### Production Build

```bash
./run.sh build
```

### Environment Variables for Production

```bash
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=error
LOG_TO_FILE=true
DB_PATH=/var/lib/app/data.db
```

### Docker Deployment

```bash
docker build -t duckdb-sqlite-crud .
docker run -p 8080:8080 -v app-data:/app/data duckdb-sqlite-crud
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [Getting Started](docs/00-GETTING_STARTED.md) | Installation and setup guide |
| [CRUD Demos](docs/01-CRUD-DEMOS.md) | SQLite and DuckDB implementation examples |
| [API Reference](docs/02-API_REFERENCE.md) | Complete API documentation |
| [Security](docs/03-SECURITY.md) | Security features and best practices |
| [Development](docs/04-DEVELOPMENT.md) | Developer guide |
| [Deployment](docs/05-DEPLOYMENT.md) | Production deployment guide |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: add new feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For issues, questions, or contributions:

1. Check the documentation in `docs/`
2. Review existing GitHub issues
3. Open a new GitHub issue
4. Use GitHub Discussions for questions

## Version Information

| Component | Version |
|-----------|---------|
| V Language | 0.5.1+ |
| Angular | 21.1.5 |
| Bun | 1.3.11 |
| Rspack | 1.7.6 |
| Vega | 6.2.0 |
| Vega-Lite | 6.4.2 |

---

Last Updated: 2026-03-31
