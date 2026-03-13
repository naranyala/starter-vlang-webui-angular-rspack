module events

import time

// Event handler function type
pub type EventHandler = fn (&Event)

// Event data structure
pub struct Event {
pub mut:
	name      string
	data      string
	timestamp u64
	source    string
}

// Event Bus for pub/sub messaging
pub struct EventBus {
pub mut:
	handlers map[string][]EventHandler
}

// Create a new event bus
pub fn new_event_bus() EventBus {
	return EventBus{
		handlers: map[string][]EventHandler{}
	}
}

// Subscribe to an event
pub fn (mut eb EventBus) subscribe(name string, handler EventHandler) {
	mut handlers := eb.handlers[name]
	handlers << handler
	eb.handlers[name] = handlers
}

// Publish an event
pub fn (eb EventBus) publish(name string, data string, source string) {
	handlers := eb.handlers[name]
	
	t := time.now()
	event := Event{
		name: name
		data: data
		timestamp: u64(t.unix())
		source: source
	}
	
	for handler in handlers {
		go fn (e Event, h EventHandler) {
			h(&e)
		}(event, handler)
	}
}

// Get subscriber count
pub fn (eb EventBus) subscriber_count(name string) int {
	handlers := eb.handlers[name]
	return handlers.len
}

// Print debug info
pub fn (eb EventBus) print_debug() {
	println('')
	println('Event Bus Debug Info:')
	println('  Total event types: ${eb.handlers.len}')
	for name, handlers in eb.handlers {
		println('    - ${name}: ${handlers.len} subscribers')
	}
	println('')
}
