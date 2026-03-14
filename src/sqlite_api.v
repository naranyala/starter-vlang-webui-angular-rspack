module sqlite_api

import vwebui as ui
import json
import time
import os

fn vlog(msg string) {
	println('[SQLite] ${msg}')
}

// User represents a user in the database
pub struct User {
pub mut:
	id          int
	name        string
	email       string
	age         int
	created_at  string
}

// CreateUserRequest represents the request body for creating a user
pub struct CreateUserRequest {
pub mut:
	name  string
	email string
	age   int
}

// UpdateUserRequest represents the request body for updating a user
pub struct UpdateUserRequest {
pub mut:
	id    int
	name  string
	email string
	age   int
}

// UserStats holds user statistics
pub struct UserStats {
pub mut:
	total_users   int
	today_count   int
	unique_domains int
}

// Database file format
pub struct UserDatabase {
pub mut:
	users  []User
	next_id int
}

// UserAPI handles file-based CRUD operations for users
@[heap]
pub struct UserAPI {
pub mut:
	initialized bool
	db_path     string
	db          UserDatabase
}

// new_user_api creates a new UserAPI instance with file-based storage
pub fn new_user_api(db_path string) !&UserAPI {
	mut api := &UserAPI{
		initialized: false
		db_path: db_path
		db: UserDatabase{
			users: []User{}
			next_id: 1
		}
	}

	// Load existing data or create new database
	if os.exists(db_path) {
		api.load_database() or {
			// If load fails, start with demo data
			api.insert_demo_data()
		}
	} else {
		// Create new database with demo data
		api.insert_demo_data()
		api.save_database() or {}
	}

	api.initialized = true
	println('Database initialized: ${db_path}')
	return api
}

// load_database loads data from JSON file
fn (mut api UserAPI) load_database() ! {
	data := os.read_file(api.db_path) or {
		return error('Cannot read database file')
	}

	mut db := json.decode(UserDatabase, data) or {
		return error('Cannot parse database file')
	}

	api.db = db
	println('Database loaded: ${api.db.users.len} users')
}

// save_database saves data to JSON file
fn (api UserAPI) save_database() ! {
	data := json.encode(api.db)
	os.write_file(api.db_path, data) or {
		return error('Cannot write database file')
	}
}

// insert_demo_data inserts sample users
fn (mut api UserAPI) insert_demo_data() {
	demo_users := [
		User{
			id: api.db.next_id
			name: 'John Doe'
			email: 'john@example.com'
			age: 28
			created_at: time.now().str()
		},
		User{
			id: api.db.next_id + 1
			name: 'Jane Smith'
			email: 'jane@gmail.com'
			age: 34
			created_at: time.now().str()
		},
		User{
			id: api.db.next_id + 2
			name: 'Bob Wilson'
			email: 'bob@company.org'
			age: 45
			created_at: time.now().str()
		},
	]

	api.db.next_id += 3
	for user in demo_users {
		api.db.users << user
	}
}

// get_all_users retrieves all users
pub fn (api UserAPI) get_all_users() []User {
	mut users := api.db.users.clone()
	users.reverse()
	return users
}

// create_user_from_req creates a new user from request
pub fn (mut api UserAPI) create_user_from_req(req CreateUserRequest) !User {
	// Validate input
	if req.name.trim_space().len == 0 {
		return error('Name is required')
	}
	if req.email.trim_space().len == 0 || !req.email.contains('@') {
		return error('Valid email is required')
	}
	if req.age < 1 || req.age > 150 {
		return error('Age must be between 1 and 150')
	}

	// Check for duplicate email
	for user in api.db.users {
		if user.email == req.email {
			return error('Email already exists')
		}
	}

	user := User{
		id: api.db.next_id
		name: req.name
		email: req.email
		age: req.age
		created_at: time.now().str()
	}

	api.db.next_id++
	api.db.users << user
	
	// Persist to file
	api.save_database() or {}

	return user
}

// get_user_by_id retrieves a single user by ID
pub fn (api UserAPI) get_user_by_id(id int) !User {
	for user in api.db.users {
		if user.id == id {
			return user
		}
	}
	return error('User not found')
}

// update_user_from_req updates an existing user
pub fn (mut api UserAPI) update_user_from_req(req UpdateUserRequest) !User {
	if req.id <= 0 {
		return error('Invalid user ID')
	}
	if req.name.trim_space().len == 0 {
		return error('Name is required')
	}
	if req.email.trim_space().len == 0 || !req.email.contains('@') {
		return error('Valid email is required')
	}

	// Find and update user
	for mut user in api.db.users {
		if user.id == req.id {
			// Check for duplicate email (excluding current user)
			for u in api.db.users {
				if u.email == req.email && u.id != req.id {
					return error('Email already exists')
				}
			}

			user.name = req.name
			user.email = req.email
			user.age = req.age
			
			// Persist to file
			api.save_database() or {}
			
			return user
		}
	}

	return error('User not found')
}

// delete_user_by_id deletes a user by ID
pub fn (mut api UserAPI) delete_user_by_id(id int) ! {
	if id <= 0 {
		return error('Invalid user ID')
	}

	mut found := false
	mut new_users := []User{}
	
	for user in api.db.users {
		if user.id == id {
			found = true
		} else {
			new_users << user
		}
	}

	if !found {
		return error('User not found')
	}

	api.db.users = new_users
	
	// Persist to file
	api.save_database() or {}
}

// get_stats returns user statistics
pub fn (api UserAPI) get_stats() UserStats {
	mut stats := UserStats{}
	mut domains := map[string]bool{}
	today := time.now().str()[..10]

	for user in api.db.users {
		stats.total_users++

		if user.created_at.starts_with(today) {
			stats.today_count++
		}

		parts := user.email.split('@')
		if parts.len > 1 {
			domains[parts[1]] = true
		}
	}

	stats.unique_domains = domains.len
	return stats
}

// close closes the database (no-op for file-based)
pub fn (mut api UserAPI) close() {
	// Ensure data is saved
	api.save_database() or {}
	println('Database closed: ${api.db_path}')
}

// ============================================================================
// WebUI API Handlers
// ============================================================================

pub fn register_user_api_handlers(mut w ui.Window, mut api &UserAPI) {
	// GET /users - Get all users
	w.bind('getUsers', fn [api] (e &ui.Event) string {
		users := api.get_all_users()
		data := json.encode(users)
		return '{"success":true,"data":${data}}'
	})

	// POST /createUser - Create a new user
	w.bind('createUser', fn [mut api] (e &ui.Event) string {
		vlog('Creating new user...')
		
		mut req := CreateUserRequest{}
		req.name = 'Demo User'
		req.email = 'demo@example.com'
		req.age = 25

		user_result := api.create_user_from_req(req) or {
			return '{"success":false,"error":"${err.msg}"}'
		}

		data_resp := json.encode(user_result)
		return '{"success":true,"data":${data_resp}}'
	})

	// PUT /updateUser - Update an existing user
	w.bind('updateUser', fn [mut api] (e &ui.Event) string {
		vlog('Updating user...')
		
		mut req := UpdateUserRequest{}
		req.id = 1
		req.name = 'Updated User'
		req.email = 'updated@example.com'
		req.age = 30

		user_result := api.update_user_from_req(req) or {
			return '{"success":false,"error":"${err.msg}"}'
		}

		data_resp := json.encode(user_result)
		return '{"success":true,"data":${data_resp}}'
	})

	// DELETE /deleteUser - Delete a user
	w.bind('deleteUser', fn [mut api] (e &ui.Event) string {
		vlog('Deleting user...')

		id := 1

		api.delete_user_by_id(id) or {
			return '{"success":false,"error":"${err.msg}"}'
		}

		return '{"success":true,"message":"User deleted"}'
	})

	// GET /getUserStats - Get user statistics
	w.bind('getUserStats', fn [api] (e &ui.Event) string {
		stats := api.get_stats()
		data := json.encode(stats)
		return '{"success":true,"data":${data}}'
	})
}
