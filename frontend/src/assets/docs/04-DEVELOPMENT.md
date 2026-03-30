# CRUD Development Workflows

Developer guide for implementing and testing DuckDB and SQLite CRUD operations.

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Code Style](#code-style)
3. [Adding New CRUD Operations](#adding-new-crud-operations)
4. [Testing](#testing)
5. [Debugging](#debugging)
6. [Common Patterns](#common-patterns)

---

## Development Setup

### Prerequisites

```bash
# Install V Language
git clone https://github.com/vlang/v
cd v && make
sudo ln -s $(pwd)/v /usr/local/bin/v

# Install Bun (frontend)
curl -fsSL https://bun.sh/install | bash

# Install SQLite module (for SQLite backend)
v install sqlite
```

### Project Setup

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

### Hot Reload

```bash
# Backend with live reload
v -live run src/

# Frontend with HMR
cd frontend && bun run dev
```

---

## Code Style

### V Backend

**Naming Conventions:**
```v
// Functions: snake_case
pub fn new_storage_service() &StorageService {}
pub fn get_all_users() []User {}
pub fn create_user(name string, email string) !User {}

// Structs: PascalCase
pub struct StorageService {}
pub struct User {}

// Constants: UPPER_SNAKE_CASE
pub const MAX_USERS = 1000
```

**Error Handling:**
```v
// Use or {} blocks for error handling
user := storage.get_user_by_id(id) or {
    return error('User not found')
}

// Propagate errors with !
pub fn get_user(id int) !User {
    return storage.get_user_by_id(id)
}

// Handle specific errors
db.exec(`INSERT INTO users (...) VALUES (...)`) or {
    if err.msg.contains('UNIQUE constraint failed') {
        return error('Email already exists')
    }
    return err
}
```

**Comments:**
```v
// Single line comment

// Multi-line comments
// use multiple //
// for consistency
```

### TypeScript Frontend

**Dependency Injection:**
```typescript
// Use inject() function (modern Angular)
private readonly logger = inject(LoggerService);
private readonly api = inject(ApiService);

// Avoid constructor injection
// ❌ OLD
constructor(private logger: LoggerService) {}

// ✅ NEW
private readonly logger = inject(LoggerService);
constructor() {}
```

**State Management with Signals:**
```typescript
// Use signals for reactive state
users = signal<User[]>([]);
isLoading = signal(false);
error = signal<string | null>(null);

// Use computed for derived state
stats = computed(() => ({
  totalUsers: this.users().length,
  hasUsers: this.users().length > 0
}));

// Use effects for side effects
effect(() => {
  this.logger.info('Users changed:', this.users());
});
```

**Type Safety:**
```typescript
// ✅ GOOD: Proper types
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// ❌ BAD: Avoid any
const data: any = getData();
```

---

## Adding New CRUD Operations

### Step 1: Define the Data Model

**Backend (src/json_storage_service.v):**
```v
pub struct Customer {
pub mut:
    id           int
    name         string
    email        string
    phone        string
    created_at   string
}
```

**Frontend (frontend/src/models/duckdb.models.ts):**
```typescript
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}
```

### Step 2: Implement Backend Service

```v
pub fn (mut s DuckDBService) create_customer(name string, email string, phone string) !Customer {
    // Validate input
    if name.len == 0 {
        return error('Name is required')
    }
    if !email.contains('@') {
        return error('Invalid email format')
    }

    customer := Customer{
        id: s.next_customer_id++
        name: name
        email: email
        phone: phone
        created_at: time.now().str()
    }

    s.customers << customer
    s.save_to_file() or { println('Warning: Could not save customer') }

    return customer
}

pub fn (s DuckDBService) get_all_customers() []Customer {
    mut customers := s.customers.clone()
    customers.reverse()
    return customers
}

pub fn (mut s DuckDBService) update_customer(id int, name string, email string, phone string) !Customer {
    for i, customer in s.customers {
        if customer.id == id {
            s.customers[i].name = name
            s.customers[i].email = email
            s.customers[i].phone = phone
            s.save_to_file() or { println('Warning: Could not save') }
            return s.customers[i]
        }
    }
    return error('Customer not found')
}

pub fn (mut s DuckDBService) delete_customer(id int) ! {
    mut found := false
    mut new_customers := []Customer{}

    for customer in s.customers {
        if customer.id == id {
            found = true
            continue
        }
        new_customers << customer
    }

    if !found {
        return error('Customer not found')
    }

    s.customers = new_customers
    s.save_to_file() or { println('Warning: Could not save') }
}
```

### Step 3: Register API Handlers

**Backend (src/api_handlers.v):**
```v
// Get all customers
window_mgr.bind('getCustomers', fn [storage] (e &ui.Event) string {
    customers := storage.get_all_customers()
    return ok(json.encode(customers))
})

// Get customer by ID
window_mgr.bind('getCustomerById', fn [storage] (e &ui.Event) string {
    id := int(e.data['id']?) or { return error('Invalid ID') }
    customer := storage.get_customer_by_id(id) or {
        return error('Customer not found')
    }
    return ok(json.encode(customer))
})

// Create customer
window_mgr.bind('createCustomer', fn [storage] (e &ui.Event) string {
    name := e.data['name'] or { return error('Name required') }
    email := e.data['email'] or { return error('Email required') }
    phone := e.data['phone'] or { '' }

    customer := storage.create_customer(name, email, phone) or {
        return error(err.msg)
    }
    return ok(json.encode(customer))
})

// Update customer
window_mgr.bind('updateCustomer', fn [storage] (e &ui.Event) string {
    id := int(e.data['id']?) or { return error('Invalid ID') }
    name := e.data['name'] or { return error('Name required') }
    email := e.data['email'] or { return error('Email required') }
    phone := e.data['phone'] or { '' }

    customer := storage.update_customer(id, name, email, phone) or {
        return error(err.msg)
    }
    return ok(json.encode(customer))
})

// Delete customer
window_mgr.bind('deleteCustomer', fn [storage] (e &ui.Event) string {
    id := int(e.data['id']?) or { return error('Invalid ID') }
    storage.delete_customer(id) or {
        return error(err.msg)
    }
    return ok('Customer deleted')
})
```

### Step 4: Create Frontend Service

**Frontend (frontend/src/core/api.service.ts):**
```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  async getCustomers(): Promise<Customer[]> {
    const response = await this.call<Customer[]>('getCustomers');
    return response.data;
  }

  async getCustomerById(id: number): Promise<Customer> {
    const response = await this.call<Customer>('getCustomerById', { id });
    return response.data;
  }

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await this.call<Customer>('createCustomer', data);
    return response.data;
  }

  async updateCustomer(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const response = await this.call<Customer>('updateCustomer', { id, ...data });
    return response.data;
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.call('deleteCustomer', { id });
  }
}
```

### Step 5: Create Frontend Component

**Frontend (frontend/src/views/customers/customers.component.ts):**
```typescript
@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  standalone: true
})
export class CustomersComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly logger = inject(LoggerService);

  customers = signal<Customer[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  async ngOnInit() {
    await this.loadCustomers();
  }

  async loadCustomers() {
    this.isLoading.set(true);
    try {
      const customers = await this.api.getCustomers();
      this.customers.set(customers);
    } catch (err) {
      this.error.set('Failed to load customers');
      this.logger.error('Load customers error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDeleteCustomer(id: number) {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }
    try {
      await this.api.deleteCustomer(id);
      this.customers.set(this.customers().filter(c => c.id !== id));
    } catch (err) {
      this.error.set('Failed to delete customer');
    }
  }
}
```

---

## Testing

### Backend Unit Tests

```v
fn test_create_user() {
    mut s := new_test_service()

    user := s.create_user('John', 'john@example.com', 28) or {
        println('FAIL: ${err}')
        return
    }

    assert user.id > 0
    assert user.name == 'John'
    assert user.email == 'john@example.com'
    println('PASS: test_create_user')
}

fn test_create_user_invalid_email() {
    mut s := new_test_service()

    user := s.create_user('John', 'invalid', 28)
    if user is none {
        println('PASS: test_create_user_invalid_email')
        return
    }
    println('FAIL: Should have rejected invalid email')
}

fn test_get_all_users() {
    mut s := new_test_service()

    s.create_user('John', 'john@example.com', 28) or { return }
    s.create_user('Jane', 'jane@example.com', 34) or { return }

    users := s.get_all_users()
    assert users.len == 2
    println('PASS: test_get_all_users')
}

fn test_update_user() {
    mut s := new_test_service()

    user := s.create_user('John', 'john@example.com', 28) or { return }
    updated := s.update_user(user.id, 'John Updated', 'john.updated@example.com', 29) or {
        println('FAIL: ${err}')
        return
    }

    assert updated.name == 'John Updated'
    println('PASS: test_update_user')
}

fn test_delete_user() {
    mut s := new_test_service()

    user := s.create_user('John', 'john@example.com', 28) or { return }
    s.delete_user(user.id) or {
        println('FAIL: ${err}')
        return
    }

    users := s.get_all_users()
    assert users.len == 0
    println('PASS: test_delete_user')
}

fn new_test_service() &DuckDBService {
    return new_duckdb_service('data/test.json') or {
        panic('Failed to create test service')
    }
}
```

### Frontend Tests

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;

  beforeEach(() => {
    api = new ApiService();
  });

  it('should get all users', async () => {
    const users = await api.getUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should create a user', async () => {
    const user = await api.createUser({
      name: 'Test User',
      email: 'test@example.com',
      age: 25
    });
    expect(user.id).toBeDefined();
    expect(user.name).toBe('Test User');
  });

  it('should update a user', async () => {
    const created = await api.createUser({
      name: 'Test User',
      email: 'test@example.com',
      age: 25
    });

    const updated = await api.updateUser(created.id, {
      name: 'Updated User',
      email: 'updated@example.com',
      age: 26
    });

    expect(updated.name).toBe('Updated User');
  });

  it('should delete a user', async () => {
    const created = await api.createUser({
      name: 'Test User',
      email: 'test@example.com',
      age: 25
    });

    await api.deleteUser(created.id);

    const users = await api.getUsers();
    expect(users.find(u => u.id === created.id)).toBeUndefined();
  });
});
```

### Run Tests

```bash
# All tests
./run.sh test

# Backend only
v test src/

# Frontend only
cd frontend && bun test

# E2E tests
cd frontend && bunx playwright test
```

---

## Debugging

### Backend Debugging

```v
// Use println for debugging
println('Debug: user=${user}')

// Use logger service
logger.info('User created', user)
logger.error('Database error', err)

// Use conditional debugging
if APP_DEBUG {
    println('Debug mode: ${variable}')
}
```

### Frontend Debugging

```typescript
// Use LoggerService
private readonly logger = inject(LoggerService);

this.logger.info('Component initialized');
this.logger.error('API error', error);

// Use browser DevTools
console.log('Debug:', data);  // Only in development
```

### Inspect Database

**SQLite:**
```bash
# Open SQLite database
sqlite3 data/app.db

# List tables
.tables

# View data
SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM orders;
```

**DuckDB (JSON):**
```bash
# View JSON data
cat data/duckdb_demo.json

# Pretty print
python -m json.tool data/duckdb_demo.json
```

---

## Common Patterns

### Repository Pattern

```v
pub interface Repository[T] {
pub abstract:
    get_all() []T
    get_by_id(id int) !T
    create(data T) !T
    update(id int, data T) !T
    delete(id int) !
}

pub struct UserRepository {
pub mut:
    db sqlite.DB
}

pub fn (mut r UserRepository) get_all() []User {
    // Implementation
}

pub fn (mut r UserRepository) create(user User) !User {
    // Implementation
}
```

### Service Layer Pattern

```v
pub struct UserService {
pub mut:
    repo UserRepository
    validator Validator
    logger Logger
}

pub fn (mut s UserService) create_user(name string, email string, age int) !User {
    // Validate
    s.validator.validate_user(name, email, age) or { return err }

    // Create
    user := s.repo.create(User{
        name: name
        email: email
        age: age
    }) or { return err }

    // Log
    s.logger.info('User created: id=${user.id}')

    return user
}
```

### DTO Pattern

```typescript
// Create DTO
export interface CreateUserDto {
  name: string;
  email: string;
  age: number;
}

// Update DTO (all fields optional)
export interface UpdateUserDto {
  name?: string;
  email?: string;
  age?: number;
}

// Response DTO
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

*Last Updated: 2026-03-30*
