module main

import time

// ============================================================================
// Multi-Channel Communication System
// Provides multiple communication patterns between backend and frontend
// ============================================================================

// MessageChannel represents different communication channels
pub enum MessageChannel {
	webui_bridge      // Primary RPC-style calls
	event_bus         // Pub/Sub events
	shared_state      // Shared memory-like state
	message_queue     // Async message queue
	broadcast         // One-to-many broadcasts
}

// MessageType categorizes messages
pub enum MessageType {
	request
	response
	event
	broadcast
	state_update
	ack
}

// Message is the base structure for all communications
pub struct Message {
pub mut:
	id          string
	channel     MessageChannel
	msg_type    MessageType
	source      string
	destination string
	timestamp   u64
	data        string
	priority    int  // 0=low, 1=normal, 2=high, 3=critical
}

// MessageQueue holds pending messages
pub struct MessageQueue {
pub mut:
	messages      []Message
	max_size      int
	processed_count int
}

// EventBus holds event subscriptions
pub struct EventBus {
pub mut:
	subscriptions map[string][]fn (&Message)
	history       []Message
	max_history   int
}

// SharedState holds shared data between backend and frontend
pub struct SharedState {
pub mut:
	state       map[string]string
	version     u64
	last_update u64
}

// CommunicationService manages all communication channels
pub struct CommunicationService {
pub mut:
	initialized    bool
	message_queue  MessageQueue
	event_bus      EventBus
	shared_state   SharedState
	broadcast_count int
	message_count  int
}

// new_communication_service creates a new CommunicationService
pub fn new_communication_service() &CommunicationService {
	return &CommunicationService{
		initialized: false
		message_queue: MessageQueue{
			messages: []Message{}
			max_size: 1000
			processed_count: 0
		}
		event_bus: EventBus{
			subscriptions: map[string][]fn (&Message){}
			history: []Message{}
			max_history: 100
		}
		shared_state: SharedState{
			state: map[string]string{}
			version: 0
			last_update: 0
		}
		broadcast_count: 0
		message_count: 0
	}
}

// init initializes the communication service
pub fn (mut s CommunicationService) init() {
	s.initialized = true
	s.log('Communication service initialized')
}

// ============================================================================
// WebUI Bridge Channel (RPC-style)
// ============================================================================

// send_request sends a request and expects a response
pub fn (mut s CommunicationService) send_request(fn_name string, data string) string {
	msg := s.create_message('request', fn_name, data)
	s.message_count++
	return msg.data
}

// send_response sends a response to a request
pub fn (mut s CommunicationService) send_response(request_id string, data string) Message {
	msg := s.create_message('response', request_id, data)
	return msg
}

// ============================================================================
// Event Bus Channel (Pub/Sub)
// ============================================================================

// subscribe registers an event handler
pub fn (mut s CommunicationService) subscribe(event_name string, handler fn (&Message)) {
	mut handlers := s.event_bus.subscriptions[event_name] or { 
		s.event_bus.subscriptions[event_name] = [fn (_ &Message) {}]
		return
	}
	handlers << handler
	s.event_bus.subscriptions[event_name] = handlers
}

// unsubscribe removes an event handler
pub fn (mut s CommunicationService) unsubscribe(event_name string, handler_id int) {
	// Simplified - in production would track handler IDs
}

// publish emits an event to all subscribers
pub fn (mut s CommunicationService) publish(event_name string, data string, source string) {
	mut msg := s.create_message('event', event_name, data)
	msg.source = source
	
	handlers := s.event_bus.subscriptions[event_name] or { return }
	for handler in handlers {
		handler(&msg)
	}
	
	// Add to history
	s.event_bus.history << msg
	if s.event_bus.history.len > s.event_bus.max_history {
		s.event_bus.history = s.event_bus.history[s.event_bus.history.len - s.event_bus.max_history..]
	}
}

// get_event_history returns recent events
pub fn (s CommunicationService) get_event_history() []Message {
	return s.event_bus.history.clone()
}

// ============================================================================
// Shared State Channel (Memory-like)
// ============================================================================

// set_state updates shared state
pub fn (mut s CommunicationService) set_state(key string, value string) {
	s.shared_state.state[key] = value
	s.shared_state.version++
	s.shared_state.last_update = u64(time.now().unix())
}

// get_state retrieves shared state
pub fn (s CommunicationService) get_state(key string) string {
	return s.shared_state.state[key] or { '' }
}

// get_all_state returns all shared state
pub fn (s CommunicationService) get_all_state() map[string]string {
	return s.shared_state.state.clone()
}

// ============================================================================
// Message Queue Channel (Async)
// ============================================================================

// enqueue adds a message to the queue
pub fn (mut s CommunicationService) enqueue(msg_type string, destination string, priority int) {
	mut msg := s.create_message(msg_type, destination, '')
	msg.priority = priority
	
	if s.message_queue.messages.len >= s.message_queue.max_size {
		// Remove oldest message
		s.message_queue.messages = s.message_queue.messages[1..]
	}
	
	s.message_queue.messages << msg
}

// dequeue retrieves and removes the next message
pub fn (mut s CommunicationService) dequeue() ?Message {
	if s.message_queue.messages.len == 0 {
		return none
	}
	
	msg := s.message_queue.messages[0]
	s.message_queue.messages = s.message_queue.messages[1..]
	s.message_queue.processed_count++
	
	return msg
}

// peek looks at the next message without removing it
pub fn (s CommunicationService) peek() ?Message {
	if s.message_queue.messages.len == 0 {
		return none
	}
	return s.message_queue.messages[0]
}

// queue_length returns the number of messages in queue
pub fn (s CommunicationService) queue_length() int {
	return s.message_queue.messages.len
}

// ============================================================================
// Broadcast Channel (One-to-Many)
// ============================================================================

// broadcast sends a message to all connected clients
pub fn (mut s CommunicationService) broadcast(event_name string, data string) {
	_ = s.create_message('broadcast', event_name, data)
	s.broadcast_count++
	
	// In production, would send to all connected WebSocket clients
	// For now, publish to event bus as fallback
	s.publish(event_name, data, 'broadcast')
}

// get_broadcast_count returns total broadcasts sent
pub fn (s CommunicationService) get_broadcast_count() int {
	return s.broadcast_count
}

// ============================================================================
// Message Helpers
// ============================================================================

// create_message creates a new message with metadata
fn (mut s CommunicationService) create_message(msg_type string, destination string, data string) Message {
	return Message{
		id: s.generate_id()
		channel: .webui_bridge
		msg_type: s.parse_message_type(msg_type)
		source: 'backend'
		destination: destination
		timestamp: u64(time.now().unix())
		data: data
		priority: 1
	}
}

// parse_message_type converts string to MessageType
fn (s CommunicationService) parse_message_type(msg_type string) MessageType {
	match msg_type {
		'request' { return .request }
		'response' { return .response }
		'event' { return .event }
		'broadcast' { return .broadcast }
		'state_update' { return .state_update }
		'ack' { return .ack }
		else { return .request }
	}
}

// generate_id creates a unique message ID
fn (s CommunicationService) generate_id() string {
	now := time.now()
	return 'msg_${now.unix()}_12345'
}

// log logs a message (simplified)
fn (s CommunicationService) log(msg string) {
	println('[Communication] ${msg}')
}

// ============================================================================
// Statistics and Monitoring
// ============================================================================

// CommunicationStats holds communication statistics
pub struct CommunicationStats {
pub mut:
	total_messages    int
	messages_by_channel map[string]int
	messages_by_type  map[string]int
	queue_length      int
	broadcast_count   int
	active_subscriptions int
	state_version     u64
	last_activity     u64
}

// get_stats returns communication statistics
pub fn (s CommunicationService) get_stats() CommunicationStats {
	mut stats := CommunicationStats{
		total_messages: s.message_count
		messages_by_channel: map[string]int{}
		messages_by_type: map[string]int{}
		queue_length: s.queue_length()
		broadcast_count: s.broadcast_count
		active_subscriptions: 0
		state_version: s.shared_state.version
		last_activity: s.shared_state.last_update
	}
	
	// Count subscriptions
	for _, handlers in s.event_bus.subscriptions {
		stats.active_subscriptions += handlers.len
	}
	
	return stats
}

// reset resets all communication state
pub fn (mut s CommunicationService) reset() {
	s.message_queue.messages = []Message{}
	s.message_queue.processed_count = 0
	s.event_bus.history = []Message{}
	s.shared_state.state = map[string]string{}
	s.shared_state.version = 0
	s.broadcast_count = 0
	s.message_count = 0
}
