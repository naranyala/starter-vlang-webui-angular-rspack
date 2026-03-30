# Deploying with SQLite & DuckDB

Deployment guide for production-ready DuckDB and SQLite CRUD integrations.

---

## Table of Contents

1. [Production Build](#production-build)
2. [SQLite Deployment](#sqlite-deployment)
3. [DuckDB Deployment](#duckdb-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Migration](#database-migration)
6. [Backup & Recovery](#backup--recovery)

---

## Production Build

### Build Command

```bash
./run.sh build
```

### Build Output

```
build/
└── desktop-dashboard    # Backend binary
frontend/
└── dist/
    └── browser/         # Frontend assets
        ├── index.html
        ├── *.js
        └── *.css
```

### Build Verification

```bash
# Check binary exists
ls -la build/desktop-dashboard

# Check frontend assets
ls -la frontend/dist/browser/

# Test binary
./build/desktop-dashboard --help
```

---

## SQLite Deployment

### Pre-Deployment Checklist

- [ ] SQLite module installed (`v install sqlite`)
- [ ] Database schema defined
- [ ] Migrations prepared
- [ ] Backup strategy configured
- [ ] File permissions set

### Deployment Steps

#### 1. Prepare Database

```bash
# Create data directory
mkdir -p /var/lib/app/data

# Set permissions
chown app:app /var/lib/app/data
chmod 750 /var/lib/app/data
```

#### 2. Configure Environment

```bash
# /etc/app/.env
APP_ENV=production
APP_DEBUG=false

# SQLite Configuration
DB_TYPE=sqlite
DB_PATH=/var/lib/app/data/app.db

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# Logging
LOG_LEVEL=error
LOG_TO_FILE=true
LOG_FILE_PATH=/var/log/app/app.log
```

#### 3. Initialize Database

```v
// In main.v or initialization code
pub fn init_database(db_path string) ! {
    db := sqlite.open(db_path) or { return err }

    // Create tables
    create_tables(db) or {
        db.close()
        return err
    }

    // Run migrations
    run_migrations(db) or {
        db.close()
        return err
    }

    db.close()
}
```

#### 4. Set File Permissions

```bash
# After database is created
chmod 640 /var/lib/app/data/app.db
chown app:app /var/lib/app/data/app.db
```

### SQLite Production Considerations

**Journal Mode:**
```sql
-- Use WAL mode for better concurrency
PRAGMA journal_mode = WAL;

-- Set synchronous mode
PRAGMA synchronous = NORMAL;

-- Enable foreign keys
PRAGMA foreign_keys = ON;
```

**Connection Pooling:**
```v
// For high-traffic applications, consider connection pooling
pub struct ConnectionPool {
pub mut:
    db_path string
    connections []sqlite.DB
    mutex sync.Mutex
}
```

---

## DuckDB Deployment

### Pre-Deployment Checklist

- [ ] JSON file path configured
- [ ] Write permissions set
- [ ] Backup mechanism configured
- [ ] Memory limits considered

### Deployment Steps

#### 1. Prepare Data Directory

```bash
# Create data directory
mkdir -p /var/lib/app/data

# Set permissions
chown app:app /var/lib/app/data
chmod 750 /var/lib/app/data
```

#### 2. Configure Environment

```bash
# /etc/app/.env
APP_ENV=production
APP_DEBUG=false

# DuckDB Configuration
DB_TYPE=duckdb
DB_PATH=/var/lib/app/data/duckdb.json
DB_DEMO_MODE=false

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# Logging
LOG_LEVEL=error
LOG_TO_FILE=true
LOG_FILE_PATH=/var/log/app/app.log
```

#### 3. Initialize with Seed Data (Optional)

```v
pub fn initialize_duckdb(db_path string) ! {
    mut s := new_duckdb_service(db_path) or { return err }

    // Add seed data if empty
    if s.users.len == 0 {
        s.create_user('Admin', 'admin@example.com', 30) or { return err }
    }

    return s
}
```

### DuckDB Production Considerations

**Atomic Writes:**
```v
pub fn (s DuckDBService) save_to_file() ! {
    // Write to temp file first
    temp_path := '${s.db_path}.tmp'

    json_data := json.encode(s.get_data())
    os.write_file(temp_path, json_data) or { return err }

    // Atomic rename
    os.rename(temp_path, s.db_path) or { return err }
}
```

**Memory Management:**
```v
// Limit in-memory data for large datasets
pub const MAX_RECORDS = 10000

pub fn (s DuckDBService) get_all_users() []User {
    if s.users.len > MAX_RECORDS {
        // Return paginated results
        return s.users[s.users.len - MAX_RECORDS .. s.users.len]
    }
    return s.users.clone()
}
```

---

## Environment Configuration

### Production Environment Variables

| Variable | Production Value | Description |
|----------|------------------|-------------|
| APP_ENV | production | Environment name |
| APP_DEBUG | false | Disable debug mode |
| SERVER_HOST | 0.0.0.0 | Bind to all interfaces |
| SERVER_PORT | 8080 | Server port |
| DB_PATH | /var/lib/app/data/app.db | Database file path |
| LOG_LEVEL | error | Error logging only |
| LOG_TO_FILE | true | Enable file logging |

### Environment File Locations

| Environment | Location |
|-------------|----------|
| Development | `./.env` |
| Production | `/etc/app/.env` |
| Docker | Container env vars |

### Loading Environment

```v
// In main.v
mut config := load_env()

// Override with file if exists
if os.exists('.env') {
    env_data := os.read_file('.env') or { '' }
    parse_env(env_data, mut config)
}

// Production: Load from /etc/app/.env
if os.exists('/etc/app/.env') {
    env_data := os.read_file('/etc/app/.env') or { '' }
    parse_env(env_data, mut config)
}
```

---

## Database Migration

### SQLite Migrations

```v
// migrations/001_initial.v
pub fn migration_001(db sqlite.DB) ! {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            age INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `) or { return err }
}

// migrations/002_add_products.v
pub fn migration_002(db sqlite.DB) ! {
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `) or { return err }
}

// Run migrations
pub fn run_migrations(db sqlite.DB) ! {
    // Track applied migrations
    db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            applied_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `) or { return err }

    // Run pending migrations
    migrations := [
        Migration{name: '001_initial', fn: migration_001}
        Migration{name: '002_add_products', fn: migration_002}
    ]

    for m in migrations {
        // Check if already applied
        rows := db.query(`SELECT COUNT(*) as count FROM migrations WHERE name = ?`, [m.name]) or { continue }
        if rows.next() && rows.int('count') > 0 {
            continue
        }

        // Apply migration
        m.fn(db) or {
            println('Migration failed: ${m.name}')
            return err
        }

        // Record migration
        db.exec(`INSERT INTO migrations (name) VALUES (?)`, [m.name]) or { continue }
        println('Applied migration: ${m.name}')
    }
}
```

### DuckDB Data Migration

```v
// Migrate from JSON v1 to v2
pub fn migrate_duckdb_v1_to_v2(db_path string) ! {
    old_data := os.read_file(db_path) or { return err }
    mut data := json.decode(map[string]json.Any, old_data) or { return err }

    // Add new fields
    if data['next_order_id'] == none {
        data['next_order_id'] = 1
    }

    // Save migrated data
    new_json := json.encode(data)
    os.write_file(db_path, new_json) or { return err }

    println('Migration complete: v1 -> v2')
}
```

---

## Backup & Recovery

### SQLite Backup

```bash
#!/bin/bash
# backup-sqlite.sh

DB_PATH="/var/lib/app/data/app.db"
BACKUP_DIR="/var/backups/app"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
sqlite3 $DB_PATH ".backup '${BACKUP_DIR}/app_${TIMESTAMP}.db'"

# Keep only last 7 backups
ls -t $BACKUP_DIR/app_*.db | tail -n +8 | xargs -r rm

echo "Backup created: ${BACKUP_DIR}/app_${TIMESTAMP}.db"
```

### DuckDB Backup

```v
pub fn create_backup(db_path string) ! {
    timestamp := time.now().format('20060102_150405')
    backup_path := 'backups/duckdb_${timestamp}.json'

    // Create backup directory
    os.mkdir('backups') or { /* ignore if exists */ }

    // Copy JSON file
    os.cp(db_path, backup_path) or { return err }

    println('Backup created: ${backup_path}')
}

// Scheduled backup (daily)
pub fn schedule_daily_backup() {
    // Use cron or system timer
    // Example cron: 0 2 * * * /path/to/backup-script
}
```

### Recovery Procedure

**SQLite Recovery:**
```bash
# Stop application
systemctl stop app

# Restore from backup
cp /var/backups/app/app_20260330_020000.db /var/lib/app/data/app.db

# Set permissions
chown app:app /var/lib/app/data/app.db
chmod 640 /var/lib/app/data/app.db

# Start application
systemctl start app
```

**DuckDB Recovery:**
```bash
# Stop application
systemctl stop app

# Restore from backup
cp /var/backups/app/duckdb_20260330_020000.json /var/lib/app/data/duckdb.json

# Set permissions
chown app:app /var/lib/app/data/duckdb.json
chmod 640 /var/lib/app/data/duckdb.json

# Start application
systemctl start app
```

---

## Systemd Service

### Create Service File

```ini
# /etc/systemd/system/app.service
[Unit]
Description=Desktop Dashboard CRUD Application
After=network.target

[Service]
Type=simple
User=app
Group=app
WorkingDirectory=/opt/app
ExecStart=/opt/app/build/desktop-dashboard
Restart=always
RestartSec=5
Environment=APP_ENV=production
EnvironmentFile=/etc/app/.env

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=app

# Security
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/var/lib/app/data /var/log/app

[Install]
WantedBy=multi-user.target
```

### Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable app

# Start service
sudo systemctl start app

# Check status
sudo systemctl status app

# View logs
sudo journalctl -u app -f
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Code reviewed and tested
- [ ] All tests passing
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Database schema ready
- [ ] Backup strategy configured

### Deployment

- [ ] Application stopped
- [ ] Database backed up
- [ ] New binary deployed
- [ ] Frontend assets deployed
- [ ] Permissions set correctly
- [ ] Environment file updated

### Post-Deployment

- [ ] Application started
- [ ] Health check passed
- [ ] CRUD operations verified
- [ ] Logs checked for errors
- [ ] Performance monitored
- [ ] Backup verified

---

*Last Updated: 2026-03-30*
