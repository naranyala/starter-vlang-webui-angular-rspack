module window_manager

import vwebui as ui
import time

// ============================================================================
// ARC-001: WebUI Abstraction Layer
// Provides interface for window management to enable testing and swapping
// ============================================================================

// IWindowManager interface for window operations
pub interface IWindowManager {
	mut:
		init() !
		bind(event string, handler fn (&ui.Event) string)
		show(page string) !
		wait()
		close()
		set_title(title string)
		get_size() (int, int)
		resize(width int, height int)
}

// WebUIWindowManager implements IWindowManager using WebUI
pub struct WebUIWindowManager {
pub mut:
	window          ui.Window
	initialized     bool
	title           string
	width           int
	height          int
	handlers        map[string]string
}

// new_webui_window_manager creates a new WebUI-based window manager
pub fn new_webui_window_manager() &WebUIWindowManager {
	mut window := ui.new_window()
	ui.set_root_folder('frontend/dist/browser')
	return &WebUIWindowManager{
		window: window
		initialized: false
		title: 'Desktop Dashboard'
		width: 1280
		height: 800
		handlers: map[string]string{}
	}
}

// Init initializes the window manager
pub fn (mut m WebUIWindowManager) init() ! {
	if m.initialized {
		return error('Already initialized')
	}
	m.initialized = true
}

// Bind registers an event handler
pub fn (mut m WebUIWindowManager) bind(event string, handler fn (&ui.Event) string) {
	m.window.bind(event, handler)
	m.handlers[event] = 'registered'
}

// Show displays a page
pub fn (m WebUIWindowManager) show(page string) ! {
	m.window.show(page)!
}

// Wait blocks until the window is closed
pub fn (m WebUIWindowManager) wait() {
	ui.wait()
}

// Close closes the window
pub fn (m WebUIWindowManager) close() {
	// WebUI doesn't have explicit close, handled by wait()
}

// SetTitle updates the window title
pub fn (mut m WebUIWindowManager) set_title(title string) {
	m.title = title
}

// GetSize returns the current window size
pub fn (m WebUIWindowManager) get_size() (int, int) {
	return m.width, m.height
}

// Resize changes the window size
pub fn (mut m WebUIWindowManager) resize(width int, height int) {
	m.width = width
	m.height = height
}

// ============================================================================
// MockWindowManager for testing
// ============================================================================

pub struct MockWindowManager {
pub mut:
	initialized     bool
	bound_events    map[string]bool
	shown_pages     []string
	wait_called     bool
	close_called    bool
	last_title      string
	last_width      int
	last_height     int
}

pub fn new_mock_window_manager() &MockWindowManager {
	return &MockWindowManager{
		initialized: false
		bound_events: map[string]bool{}
		shown_pages: []string{}
		wait_called: false
		close_called: false
		last_title: ''
		last_width: 0
		last_height: 0
	}
}

pub fn (mut m MockWindowManager) init() ! {
	if m.initialized {
		return error('Already initialized')
	}
	m.initialized = true
}

pub fn (mut m MockWindowManager) bind(event string, handler fn (&ui.Event) string) {
	m.bound_events[event] = true
}

pub fn (mut m MockWindowManager) show(page string) ! {
	m.shown_pages << page
}

pub fn (mut m MockWindowManager) wait() {
	m.wait_called = true
}

pub fn (mut m MockWindowManager) close() {
	m.close_called = true
}

pub fn (mut m MockWindowManager) set_title(title string) {
	m.last_title = title
}

pub fn (m MockWindowManager) get_size() (int, int) {
	return m.last_width, m.last_height
}

pub fn (mut m MockWindowManager) resize(width int, height int) {
	m.last_width = width
	m.last_height = height
}

// ============================================================================
// ARC-002: Graceful Shutdown Implementation
// ============================================================================

pub struct ShutdownHandler {
pub mut:
	handlers        []fn ()
	running         bool
	shutdown_requested bool
}

pub fn new_shutdown_handler() &ShutdownHandler {
	return &ShutdownHandler{
		handlers: []
		running: true
		shutdown_requested: false
	}
}

// Register a cleanup handler to be called on shutdown
pub fn (mut sh ShutdownHandler) register(handler fn ()) {
	sh.handlers << handler
}

// Request shutdown
pub fn (mut sh ShutdownHandler) request_shutdown() {
	sh.shutdown_requested = true
	sh.running = false
}

// Execute all shutdown handlers
pub fn (mut sh ShutdownHandler) execute_shutdown() {
	println('Executing shutdown handlers...')
	
	for handler in sh.handlers {
		handler()
	}
	
	println('Shutdown complete')
}

// Is_shutdown_requested checks if shutdown was requested
pub fn (sh ShutdownHandler) is_shutdown_requested() bool {
	return sh.shutdown_requested
}

// Is_running checks if the application is still running
pub fn (sh ShutdownHandler) is_running() bool {
	return sh.running
}

// ============================================================================
// Application Lifecycle Manager
// Combines window management with lifecycle handling
// ============================================================================

pub struct AppLifecycle {
pub mut:
	window_manager  &IWindowManager
	shutdown        &ShutdownHandler
	initialized     bool
	start_time      i64
}

pub fn new_app_lifecycle() &AppLifecycle {
	return &AppLifecycle{
		window_manager: unsafe { nil }
		shutdown: new_shutdown_handler()
		initialized: false
		start_time: 0
	}
}

// Initialize the application lifecycle
pub fn (mut al AppLifecycle) init(mut wm IWindowManager) ! {
	al.window_manager = wm
	al.start_time = time.now().unix()
	al.initialized = true
}

// Register a shutdown handler
pub fn (mut al AppLifecycle) on_shutdown(handler fn ()) {
	al.shutdown.register(handler)
}

// Run the application with graceful shutdown
pub fn (mut al AppLifecycle) run(initial_page string) ! {
	if !al.initialized {
		return error('Application not initialized')
	}

	println('Application starting...')
	al.window_manager.show(initial_page) or {}
	
	// Block until window is closed
	al.window_manager.wait()
	
	// Execute shutdown handlers
	al.shutdown.execute_shutdown()
	
	println('Application exited')
}

// Request application shutdown
pub fn (mut al AppLifecycle) shutdown() {
	al.shutdown.request_shutdown()
}

// Get uptime in seconds
pub fn (al AppLifecycle) get_uptime() i64 {
	return time.now().unix() - al.start_time
}

// Is_initialized checks if the application is initialized
pub fn (al AppLifecycle) is_initialized() bool {
	return al.initialized
}

// Is_running checks if the application is still running
pub fn (al AppLifecycle) is_running() bool {
	return al.shutdown.is_running()
}
