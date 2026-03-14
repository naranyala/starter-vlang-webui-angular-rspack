# Desktop Dashboard

A system monitoring desktop application built with V language backend and Angular frontend, using WebUI for native window management.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Backend-Frontend Communication](#backend-frontend-communication)
- [Project Structure](#project-structure)
- [Commands](#commands)
- [Services](#services)
- [Documentation](#documentation)
- [Requirements](#requirements)
- [Troubleshooting](#troubleshooting)

---

## Overview

Desktop Dashboard provides real-time monitoring of system resources including CPU, memory, disk, network, and processes through a modern web-based interface wrapped in a native window.

**Key Features:**
- 🖥️ Real-time system monitoring (CPU, Memory, Disk, Network)
- 📊 Process management and statistics
- 🔐 Secure authentication service (password hashing, CSRF protection)
- 🗄️ SQLite/JSON persistent storage with full CRUD operations
- 💾 Caching with TTL support
- ⚡ Event-driven architecture with pub/sub
- 🎨 Modern Angular frontend with WinBox.js windows
- 🔒 Rate limiting and input validation
- 📡 Multiple communication protocols (WebUI Bridge, HTTP, Events)

---

## Quick Start

```bash
# Clone and enter the project directory
cd vlang-webui-angular-rspack

# Development mode - rebuilds frontend and runs app
./run.sh dev

# Or simply run (dev is default)
./run.sh
```

---

## Features

### Security Features

| Feature | Status | Description |
|---------|--------|-------------|
| Password Hashing | ✅ | PBKDF2-based secure password storage |
| Secure Tokens | ✅ | Cryptographically secure random tokens |
| Input Validation | ✅ | Server-side validation for all inputs |
| Rate Limiting | ✅ | Per-IP and per-user rate limiting |
| CSRF Protection | ✅ | Token-based CSRF protection |
| SQL Injection Prevention | ✅ | Parameterized queries, identifier validation |

### Backend Services

| Service | File | Description |
|---------|------|-------------|
| **ConfigService** | `services/core_services.v` | Configuration from env vars and files |
| **CacheService** | `services/core_services.v` | In-memory caching with TTL |
| **LoggerService** | `services/additional_services.v` | Enhanced logging with levels |
| **ValidationService** | `services/additional_services.v` | Input validation with rules |
| **MetricsService** | `services/additional_services.v` | Application metrics/telemetry |
| **HealthCheckService** | `services/additional_services.v` | Health monitoring |
| **AuthService** | `services/additional_services.v` | Token-based authentication |
| **UserAPI** | `sqlite_api.v` | SQLite/JSON CRUD operations |

### Frontend Services

| Service | File | Description |
|---------|------|-------------|
| **StorageService** | `core/storage.service.ts` | LocalStorage/SessionStorage with TTL |
| **HttpService** | `core/http.service.ts` | HTTP client with caching and retry |
| **NotificationService** | `core/notification.service.ts` | Toast notification system |
| **LoadingService** | `core/loading.service.ts` | Loading spinner management |
| **ThemeService** | `core/theme.service.ts` | Dark/light theme switching |
| **ClipboardService** | `core/clipboard.service.ts` | Clipboard operations |
| **RetryService** | `core/retry.service.ts` | Retry with exponential backoff |
| **NetworkMonitorService** | `core/network-monitor.service.ts` | Network connectivity monitoring |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Angular)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Angular   │  │   WinBox    │  │    Service Layer        │  │
│  │  Components │  │   Windows   │  │    (DI Injected)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                    │                  │
│         │          WebSocket              EventBus               │
│         │                │                    │                  │
│         └────────────────┼────────────────────┘                  │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           │ WebUI Bridge (JavaScript ↔ V)
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                         Backend (V Language)                      │
│                          │                                        │
│  ┌─────────────┐  ┌──────┴───────┐  ┌─────────────────────────┐  │
│  │   WebUI     │  │   DI         │  │    Service Layer        │  │
│  │   Server    │  │   Container  │  │    (Injected Services)  │  │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘  │
│                          │                                        │
│                   Linux Sysfs / Procfs                            │
└───────────────────────────────────────────────────────────────────┘
```

### Communication Protocols

The application uses **three communication approaches**:

1. **WebUI Bridge** (Primary) - RPC-style communication for desktop window management
2. **HTTP/Fetch** (Secondary) - RESTful communication for future web deployment
3. **Event Bus** (Pub/Sub) - Cross-component state synchronization

See [docs/05-COMMUNICATION.md](docs/05-COMMUNICATION.md) for detailed documentation.

---

## Backend-Frontend Communication

### WebUI Bridge Protocol

**Request Format:**
```json
{
    "fn": "functionName",
    "data": { "key": "value" }
}
```

**Response Format:**
```json
{
    "success": true,
    "data": { ... },
    "error": null
}
```

**Error Response:**
```json
{
    "success": false,
    "data": null,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Email is required",
        "field": "email"
    }
}
```

### Example Usage

**Backend Handler (V):**
```v
w.bind('getUsers', fn [api] (e &ui.Event) string {
    users := api.get_all_users()
    return '{"success":true,"data":${json.encode(users)}}'
})
```

**Frontend Call (TypeScript):**
```typescript
const result = await window.call('getUsers');
const response = JSON.parse(result);
if (response.success) {
    this.users.set(response.data);
}
```

---

## Project Structure

```
vlang-webui-angular-rspack/
├── src/                        # V backend source code
│   ├── main.v                  # Main application entry point
│   ├── di.v                    # Dependency Injection container
│   ├── error.v                 # Error handling with structured errors
│   ├── result.v                # Result type for errors as values
│   ├── events.v                # Event bus for pub/sub
│   ├── security.v              # Security utilities (hashing, tokens, rate limiting)
│   ├── middleware.v            # Request middleware (validation, rate limiting, CSRF)
│   ├── window_manager.v        # WebUI abstraction layer
│   ├── sqlite_api.v            # SQLite/JSON CRUD API
│   ├── services.v              # System information service
│   ├── services/
│   │   ├── interfaces.v        # Service interfaces (ILogger, IConfig, etc.)
│   │   ├── core_services.v     # Config, Cache, Database, HttpClient
│   │   ├── additional_services.v # Logger, Validation, Metrics, Health, Auth
│   │   └── registry.v          # Service registry with fluent API
│   ├── system.v                # System information (CPU, memory, OS)
│   ├── network.v               # Network interfaces and connection
│   └── process.v               # Process information and load
├── frontend/                   # Angular frontend application
│   ├── src/
│   │   ├── core/
│   │   │   ├── storage.service.ts       # Storage abstraction
│   │   │   ├── http.service.ts          # HTTP client
│   │   │   ├── notification.service.ts  # Toast notifications
│   │   │   ├── loading.service.ts       # Loading management
│   │   │   ├── theme.service.ts         # Theme switching
│   │   │   ├── clipboard.service.ts     # Clipboard operations
│   │   │   ├── retry.service.ts         # Retry logic
│   │   │   ├── network-monitor.service.ts # Network monitoring
│   │   │   └── app-services.facade.ts   # Service facade
│   │   ├── viewmodels/         # State management with signals
│   │   ├── models/             # Data models
│   │   ├── types/              # TypeScript types
│   │   └── views/
│   │       ├── auth/           # Authentication component
│   │       ├── sqlite/         # SQLite CRUD component
│   │       └── shared/         # Shared components
│   └── docs/
│       └── DI_EVALUATION.md    # Frontend DI evaluation
├── docs/                       # Documentation
│   ├── 00-README.md            # Documentation index
│   ├── 01-ARCHITECTURE.md      # System architecture
│   ├── 02-DEPENDENCY_INJECTION.md # DI systems
│   ├── 03-ERROR_HANDLING.md    # Error handling patterns
│   ├── 04-API_REFERENCE.md     # API documentation
│   └── 05-COMMUNICATION.md     # Backend-frontend communication
├── audit/                      # Security and code quality audit
│   ├── README.md               # Audit index
│   ├── closed/                 # Resolved findings
│   └── open/                   # Remaining findings
├── v.mod                       # V module configuration
├── run.sh                      # Build and run automation
├── build.config.sh             # Build configuration
└── SQLITE_SETUP.md             # Database setup guide
```

---

## Commands

| Command | Description |
|---------|-------------|
| `./run.sh` | Start development mode |
| `./run.sh dev` | Development mode (same as above) |
| `./run.sh build` | Full production build |
| `./run.sh build:fe` | Build frontend only |
| `./run.sh build:be` | Build backend only |
| `./run.sh run` | Run existing build |
| `./run.sh clean` | Remove build artifacts |
| `./run.sh help` | Display help |

### Frontend Commands

```bash
cd frontend

bun run dev          # Development server
bun run build:rspack # Production build
bun run watch        # Watch mode
bun run lint         # Lint code
bun run lint:fix     # Fix linting
bun test             # Run tests
```

### Backend Commands

```bash
# Build backend
v -cc gcc -o desktop-dashboard src/

# Run backend
v -cc gcc run src/

# Run tests
v test src/di_test.v
v test src/services_test.v
```

---

## Services

### Dependency Injection

The project features comprehensive dependency injection on both backend and frontend:

**Backend (V):**
```v
// Create container
mut container := di.new_container()

// Register services
container.register_singleton('logger', logger_instance)
container.register_singleton_fn('config', fn () voidptr {
    return new_config_service()
})

// Resolve services
logger := container.resolve('logger') or { panic('No logger') }
```

**Frontend (Angular):**
```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  // Automatically injected
}

// Usage via facade
constructor(private services: AppServices) {}
this.services.storage.set('key', 'value');
```

See [docs/02-DEPENDENCY_INJECTION.md](docs/02-DEPENDENCY_INJECTION.md) for detailed documentation.

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/00-README.md](docs/00-README.md) | Documentation index |
| [docs/01-ARCHITECTURE.md](docs/01-ARCHITECTURE.md) | System architecture and design patterns |
| [docs/02-DEPENDENCY_INJECTION.md](docs/02-DEPENDENCY_INJECTION.md) | DI systems for backend and frontend |
| [docs/03-ERROR_HANDLING.md](docs/03-ERROR_HANDLING.md) | Error handling patterns and guides |
| [docs/04-API_REFERENCE.md](docs/04-API_REFERENCE.md) | Complete API documentation |
| [docs/05-COMMUNICATION.md](docs/05-COMMUNICATION.md) | Backend-frontend communication protocols |
| [SQLITE_SETUP.md](SQLITE_SETUP.md) | Database setup and persistence guide |
| [audit/README.md](audit/README.md) | Security and code quality audit |

---

## Requirements

### System
- Linux (tested), macOS (partial), Windows (partial)
- 512MB RAM minimum
- 100MB disk space

### Development
- V Language 0.5.1+
- GCC
- Bun 1.0+
- Node.js 18+

### Runtime
- GTK3 (Linux)
- WebKit (Linux)
- Modern browser (Chrome, Edge, Firefox)

---

## Troubleshooting

### Frontend dist not found
```bash
./run.sh build:fe
```

### Backend build fails
```bash
v version
./run.sh build:be
```

### Window fails to open
```bash
ldd ./desktop-dashboard | grep -E 'gtk|webkit'
sudo apt-get install libgtk-3-dev libwebkit2gtk-4.0-dev
```

### Database issues
See [SQLITE_SETUP.md](SQLITE_SETUP.md) for database troubleshooting.

### Security audit findings
See [audit/README.md](audit/README.md) for current status and remediation.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests
5. Submit pull request

---

## License

MIT License

---

## Acknowledgments

- [WebUI Library](https://webui.me)
- [V Language](https://vlang.io)
- [Angular](https://angular.dev)
- [Rspack](https://rspack.rs)
- [WinBox.js](https://winbox.kodinger.com)

---

*Last Updated: 2026-03-14*
