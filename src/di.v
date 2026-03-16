module di

import time

// ============================================================================
// Angular-Inspired Dependency Injection for V
// Mirrors Angular's DI workflow while staying idiomatic to V
// ============================================================================

// ServiceScope defines the lifecycle of a service
// Similar to Angular's providedIn: 'root' | 'platform' | 'any'
pub enum ServiceScope {
	singleton   // Like @Injectable({providedIn: 'root'}) - single instance
	transient   // New instance each time - like factory provider
	scoped      // One instance per scope - like @Injectable({providedIn: Any})
}

// ServiceProvider holds service configuration
// Similar to Angular's Provider interface
pub struct ServiceProvider {
pub mut:
	name          string
	scope         ServiceScope
	initialized   bool
	created_at    u64
}

// InjectionToken is a type-safe way to request dependencies
// Similar to Angular's InjectionToken<T>
pub struct InjectionToken[T] {
pub mut:
	name string
}

// Create a new injection token
// Usage: token := di.new_token[MyService]('myService')
pub fn new_token[T](name string) InjectionToken[T] {
	return InjectionToken[T]{
		name: name
	}
}

// Injector is the core DI container
// Similar to Angular's Injector class
pub struct Injector {
pub mut:
	parent           ?&Injector
	providers        map[string]ServiceProvider
	scopes           map[string]&Scope
	active_scope     &Scope
	is_destroyed     bool
}

// Scope represents a DI scope (like Angular's EnvironmentInjector)
pub struct Scope {
pub mut:
	id          string
	created_at  u64
	instances   map[string]voidptr
	is_destroyed bool
	parent      &Injector
}

// NewInjector creates a root injector
// Similar to Injector.create({providers: [...]})
pub fn new_injector() &Injector {
	mut injector := &Injector{
		parent: none
		providers: map[string]ServiceProvider{}
		scopes: map[string]&Scope{}
		active_scope: unsafe { voidptr(0) }
		is_destroyed: false
	}

	// Create root scope
	mut root_scope := &Scope{
		id: 'root'
		created_at: u64(time.now().unix())
		instances: map[string]voidptr{}
		is_destroyed: false
		parent: injector
	}
	injector.active_scope = root_scope
	injector.scopes['root'] = root_scope

	return injector
}

// CreateChildInjector creates a child injector
// Similar to injector.createChildInjector({providers: [...]})
pub fn (mut injector Injector) create_child_injector() &Injector {
	mut child := &Injector{
		parent: injector
		providers: map[string]ServiceProvider{}
		scopes: injector.scopes.clone()
		active_scope: injector.active_scope
		is_destroyed: false
	}

	return child
}

// CreateScope creates a new DI scope
// Similar to creating an EnvironmentInjector
pub fn (mut injector Injector) create_scope(scope_id string) &Scope {
	mut scope := &Scope{
		id: scope_id
		created_at: u64(time.now().unix())
		instances: map[string]voidptr{}
		is_destroyed: false
		parent: injector
	}

	injector.scopes[scope_id] = scope
	return scope
}

// UseScope sets the active scope
// Similar to running code within an EnvironmentInjector context
pub fn (mut injector Injector) use_scope(scope_id string) bool {
	scope := injector.scopes[scope_id] or {
		return false
	}
	injector.active_scope = scope
	return true
}

// ============================================================================
// Service Registration (Like Angular's providers array)
// ============================================================================

// RegisterSingleton registers a singleton service
// Similar to @Injectable({providedIn: 'root'})
pub fn (mut injector Injector) register_singleton[T](name string, mut instance T) {
	// Check if already registered
	if name in injector.providers {
		println('Warning: Service "${name}" already registered')
		return
	}

	injector.providers[name] = ServiceProvider{
		name: name
		scope: .singleton
		initialized: true
		created_at: u64(time.now().unix())
	}

	// Store instance in active scope using voidptr conversion
	if unsafe { injector.active_scope != 0 } {
		
	}
}

// RegisterSingletonFn registers a singleton with a factory function
// Note: In V, we call the factory immediately and store the result
pub fn (mut injector Injector) register_singleton_fn[T](name string, factory fn () T) {
	if name in injector.providers {
		println('Warning: Service "${name}" already registered')
		return
	}


	injector.providers[name] = ServiceProvider{
		name: name
		scope: .singleton
		initialized: true
		created_at: u64(time.now().unix())
	}

	// Store instance in active scope
	if unsafe { injector.active_scope != 0 } {
		unsafe {  }
		
	}
}

// RegisterTransient registers a transient service
// Note: In V, we create the instance immediately and store in scope
pub fn (mut injector Injector) register_transient[T](name string, mut instance T) {
	if name in injector.providers {
		println('Warning: Service "${name}" already registered')
		return
	}

	injector.providers[name] = ServiceProvider{
		name: name
		scope: .transient
		initialized: true
		created_at: u64(time.now().unix())
	}

	// Store instance in active scope
	if unsafe { injector.active_scope != 0 } {
		unsafe {  }
		
	}
}

// RegisterScoped registers a scoped service
pub fn (mut injector Injector) register_scoped[T](name string, mut instance T) {
	if name in injector.providers {
		println('Warning: Service "${name}" already registered')
		return
	}

	injector.providers[name] = ServiceProvider{
		name: name
		scope: .scoped
		initialized: true
		created_at: u64(time.now().unix())
	}

	// Store instance in active scope
	if unsafe { injector.active_scope != 0 } {
		unsafe {  }
		
	}
}

// ============================================================================
// Service Resolution (Like Angular's inject() function)
// ============================================================================

// Get retrieves a service instance
// Similar to Angular's inject(ServiceClass)
pub fn (mut injector Injector) get[T](name string) ?T {
	// Check if service is registered
	_ := injector.providers[name] or {
		return none
	}

	// Get from active scope
	if unsafe { injector.active_scope != 0 } {
		instance_ptr := injector.active_scope.instances[name]
		if instance_ptr != 0 {
			return unsafe { instance_ptr }
		}
	}

	// Not found in scope
	return none
}

// GetOrCreate retrieves a service, creating it if needed
// Similar to Angular's inject() with optional flag
pub fn (mut injector Injector) get_or_create[T](name string, factory fn () T) T {
	instance := injector.get[T](name) or {
		// Not registered, create on-demand
		new_instance := factory()
		injector.register_singleton(name, new_instance)
		return new_instance
	}
	return instance
}

// Has checks if a service is registered
// Similar to checking if a provider exists
pub fn (injector Injector) has(name string) bool {
	return name in injector.providers
}

// ============================================================================
// Scope Management
// ============================================================================

// GetScopeInstance gets a scoped instance
// Similar to getting a service from EnvironmentInjector
pub fn (mut scope Scope) get[T](name string) ?T {
	cached := scope.instances[name]
	if cached != 0 {
		return cached
	}

	// Not in scope cache, get from parent injector
	return scope.parent.get[T](name)
}

// SetInstance sets an instance in this scope
pub fn (mut scope Scope) set_instance[T](name string, instance T) {
	scope.instances[name] = instance
}

// DestroyScope destroys a scope and disposes its services
// Similar to destroying an EnvironmentInjector
pub fn (mut injector Injector) destroy_scope(scope_id string) bool {
	mut scope := injector.scopes[scope_id] or {
		return false
	}

	if scope.is_destroyed {
		return true
	}

	// Mark scope as destroyed
	scope.is_destroyed = true
	injector.scopes.delete(scope_id)

	if injector.active_scope.id == scope_id {
		root_scope := injector.scopes['root'] or { return false }
		injector.active_scope = root_scope
	}

	return true
}

// ============================================================================
// Destroy (Like Angular's ngOnDestroy for injectors)
// ============================================================================

// Destroy destroys the injector and disposes all services
// Similar to calling destroy on an EnvironmentInjector
pub fn (mut injector Injector) destroy() {
	if injector.is_destroyed {
		return
	}

	// Destroy all scopes first
	for scope_id, _ in injector.scopes {
		injector.destroy_scope(scope_id)
	}

	// Clear providers
	injector.providers = map[string]ServiceProvider{}
	injector.is_destroyed = true
}

// ============================================================================
// Helper Functions (Like Angular's inject() function)
// ============================================================================

// Inject is a convenience function for getting services
// Similar to Angular's inject(ServiceClass)
pub fn inject[T](injector &Injector, name string) ?T {
	return injector.get[T](name)
}

// InjectAll gets multiple services at once
// Similar to injecting multiple services in a constructor
pub fn inject_all[T](injector &Injector, names []string) []T {
	mut results := []T{}
	for name in names {
		instance := injector.get[T](name) or { continue }
		results << instance
	}
	return results
}

// ============================================================================
// Service Decorator Pattern (Like Angular's @Injectable())
// ============================================================================

// Injectable marks a service as injectable
// Similar to @Injectable({providedIn: 'root'})
// Usage: Call this in your service's init function
pub fn register_service[T](mut injector Injector, name string, instance T, scope ServiceScope) {
	match scope {
		.singleton {
			injector.register_singleton(name, instance)
		}
		.transient {
			injector.register_transient(name, fn () T {
				return instance
			})
		}
		.scoped {
			injector.register_scoped(name, fn () T {
				return instance
			})
		}
	}
}

// ============================================================================
// Provider Builder (Fluent API like Angular's Provider configuration)
// ============================================================================

// ProviderBuilder helps build providers fluently
pub struct ProviderBuilder {
pub mut:
	name   string
	scope  ServiceScope
}

// NewProvider creates a new provider builder
// Similar to starting a provider configuration
pub fn new_provider(name string) ProviderBuilder {
	return ProviderBuilder{
		name: name
		scope: .singleton  // Default to singleton like @Injectable({providedIn: 'root'})
	}
}

// InRoot sets the service as singleton (root-scoped)
// Similar to @Injectable({providedIn: 'root'})
pub fn (mut builder ProviderBuilder) in_root() ProviderBuilder {
	builder.scope = .singleton
	return builder
}

// InPlatform sets the service as platform-wide singleton
// Similar to @Injectable({providedIn: 'platform'})
pub fn (mut builder ProviderBuilder) in_platform() ProviderBuilder {
	builder.scope = .singleton
	return builder
}

// Transient sets the service as transient
// Similar to {provide: TOKEN, useClass: Service}
pub fn (mut builder ProviderBuilder) transient() ProviderBuilder {
	builder.scope = .transient
	return builder
}

// InScope sets the service as scoped
// Similar to @Injectable({providedIn: Any})
pub fn (mut builder ProviderBuilder) in_scope() ProviderBuilder {
	builder.scope = .scoped
	return builder
}

// Build registers the service with the injector
// Similar to adding to the providers array
// Note: For simplicity, directly registers as singleton
pub fn (builder ProviderBuilder) build(mut injector Injector, instance voidptr) {
	// Register as singleton with voidptr instance
	injector.providers[builder.name] = ServiceProvider{
		name: builder.name
		scope: builder.scope
		initialized: true
		created_at: u64(time.now().unix())
	}

	// Store instance in active scope
	if unsafe { injector.active_scope != 0 } {
		injector.active_scope.instances[builder.name] = instance
	}
}
