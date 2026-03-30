module services

import security
import time
import json

/**
 * User Role enumeration
 */
pub enum UserRole {
	user
	admin
	moderator
}

/**
 * User Account with authentication
 */
pub struct AppUser {
pub mut:
	id            int
	username      string
	email         string
	password_hash string
	role          UserRole
	created_at    string
	last_login    string
	is_active     bool
}

/**
 * Session represents an authenticated user session
 */
pub struct Session {
pub mut:
	token      string
	user_id    int
	username   string
	role       UserRole
	created_at u64
	expires_at u64
	ip_address string
	user_agent string
}

/**
 * Authentication Service
 * Manages user authentication and sessions
 */
pub struct AuthService {
pub mut:
	users    map[string]AppUser  // username -> user
	sessions map[string]Session  // session_token -> session
}

/**
 * Create new auth service
 */
pub fn new_auth_service() &AuthService {
	return &AuthService{
		users:    map[string]AppUser{}
		sessions: map[string]Session{}
	}
}

/**
 * Initialize with default admin user
 */
pub fn (mut s AuthService) init() ! {
	// Create default admin user
	// Password: admin123 (hashed)
	admin_password := security.hash_password('admin123') or {
		return error('Failed to hash admin password')
	}

	s.users['admin'] = AppUser{
		id:            1
		username:      'admin'
		email:         'admin@example.com'
		password_hash: admin_password
		role:          admin
		created_at:    time.now().str()
		last_login:    ''
		is_active:     true
	}

	// Create demo user
	// Password: user123 (hashed)
	user_password := security.hash_password('user123') or {
		return error('Failed to hash user password')
	}

	s.users['user'] = AppUser{
		id:            2
		username:      'user'
		email:         'user@example.com'
		password_hash: user_password
		role:          user
		created_at:    time.now().str()
		last_login:    ''
		is_active:     true
	}

	println('Auth service initialized with default users')
}

/**
 * Authenticate user with username and password
 */
pub fn (mut s AuthService) login(username string, password string, ip_address string, user_agent string) !Session {
	// Find user
	user := s.users[username] or {
		return error('Invalid username or password')
	}

	// Check if user is active
	if !user.is_active {
		return error('Account is disabled')
	}

	// Verify password
	if !security.verify_password(password, user.password_hash) {
		return error('Invalid username or password')
	}

	// Update last login
	s.users[username].last_login = time.now().str()

	// Generate session token
	session_token := security.generate_session_id()

	// Create session (expires in 24 hours)
	session := Session{
		token:      session_token
		user_id:    user.id
		username:   userusername
		role:       user.role
		created_at: u64(time.now().unix())
		expires_at: u64(time.now().unix()) + 86400  // 24 hours
		ip_address: ip_address
		user_agent: user_agent
	}

	s.sessions[session_token] = session

	return session
}

/**
 * Logout - invalidate session
 */
pub fn (mut s AuthService) logout(session_token string) ! {
	session := s.sessions[session_token] or {
		return error('Invalid session')
	}

	s.sessions.delete(session_token)
}

/**
 * Validate session token
 */
pub fn (mut s AuthService) validate_session(session_token string) !Session {
	session := s.sessions[session_token] or {
		return error('Invalid session')
	}

	// Check if session is expired
	if security.is_token_expired(session.expires_at) {
		s.sessions.delete(session_token)
		return error('Session expired')
	}

	// Check if user still exists and is active
	user := s.users[sessionusername] or {
		s.sessions.delete(session_token)
		return error('User not found')
	}

	if !user.is_active {
		s.sessions.delete(session_token)
		return error('Account is disabled')
	}

	return session
}

/**
 * Get user by username
 */
pub fn (s AuthService) get_user(username string) ?AppUser {
	return s.users[username]
}

/**
 * Register new user
 */
pub fn (mut s AuthService) register(username string, email string, password string) !AppUser {
	// Check if username already exists
	if username in s.users {
		return error('Username already exists')
	}

	// Validate username
	if username.len < 3 || username.len > 32 {
		return error('Username must be 3-32 characters')
	}

	// Validate email
	if !email.contains('@') || !email.contains('.') {
		return error('Invalid email format')
	}

	// Validate password strength
	if password.len < 6 {
		return error('Password must be at least 6 characters')
	}

	// Hash password
	password_hash := security.hash_password(password) or {
		return error('Failed to hash password')
	}

	// Create user
	user := AppUser{
		id:            s.get_next_user_id()
		username:      username
		email:        email
		password_hash: password_hash
		role:          UserRole.user
		created_at:    time.now().str()
		last_login:    ''
		is_active:     true
	}

	s.users[username] = user

	return user
}

/**
 * Change user password
 */
pub fn (mut s AuthService) change_password(username string, old_password string, new_password string) ! {
	user := s.users[username] or {
		return error('User not found')
	}

	// Verify old password
	if !security.verify_password(old_password, user.password_hash) {
		return error('Invalid current password')
	}

	// Validate new password
	if new_password.len < 6 {
		return error('New password must be at least 6 characters')
	}

	// Hash new password
	new_hash := security.hash_password(new_password) or {
		return error('Failed to hash password')
	}

	s.users[username].password_hash = new_hash
}

/**
 * Get next user ID
 */
fn (s AuthService) get_next_user_id() int {
	mut max_id := 0
	for _, user in s.users {
		if user.id > max_id {
			max_id = user.id
		}
	}
	return max_id + 1
}

/**
 * Cleanup expired sessions
 */
pub fn (mut s AuthService) cleanup_sessions() int {
	mut removed := 0
	mut tokens_to_remove := []string{}

	for token, session in s.sessions {
		if security.is_token_expired(session.expires_at) {
			tokens_to_remove << token
		}
	}

	for token in tokens_to_remove {
		s.sessions.delete(token)
		removed++
	}

	return removed
}

/**
 * Get session statistics
 */
pub fn (s AuthService) get_stats() map[string]int {
	mut active_sessions := 0
	mut active_users := 0

	for _, session in s.sessions {
		if !security.is_token_expired(session.expires_at) {
			active_sessions++
		}
	}

	for _, user in s.users {
		if user.is_active {
			active_users++
		}
	}

	return {
		'total_users': s.users.len
		'active_users': active_users
		'active_sessions': active_sessions
	}
}

/**
 * Check if user has role
 */
pub fn (s AuthService) user_has_role(username string, required_role UserRole) bool {
	user := s.users[username] or {
		return false
	}

	return user.role == required_role || (required_role == user && user.role != user)
}

/**
 * Check if user is admin
 */
pub fn (s AuthService) is_admin(username string) bool {
	user := s.users[username] or {
		return false
	}
	return user.role == admin
}
