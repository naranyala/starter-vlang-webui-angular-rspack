module main

import time

// ============================================================================
// Simplified Communication System
// Only webui_bridge RPC-style calls are used
// ============================================================================

// MessageType categorizes messages
pub enum MessageType {
	request
	response
	event
}

// Message is the structure for communications
pub struct Message {
pub mut:
	id          string
	msg_type    MessageType
	source      string
	destination string
	timestamp   u64
	data        string
}

// CommunicationService manages communication
pub struct CommunicationService {
pub mut:
	initialized    bool
	message_count  int
}

// new_communication_service creates a new CommunicationService
pub fn new_communication_service() &CommunicationService {
	return &CommunicationService{
		initialized: false
		message_count: 0
	}
}

// init initializes the communication service
pub fn (mut s CommunicationService) init() {
	s.initialized = true
}

// ============================================================================
// WebUI Bridge (RPC-style) - Only used channel
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
// Message Helpers
// ============================================================================

// create_message creates a new message with metadata
fn (mut s CommunicationService) create_message(msg_type string, destination string, data string) Message {
	return Message{
		id: s.generate_id()
		msg_type: s.parse_message_type(msg_type)
		source: 'backend'
		destination: destination
		timestamp: u64(time.now().unix())
		data: data
	}
}

// parse_message_type converts string to MessageType
fn (s CommunicationService) parse_message_type(msg_type string) MessageType {
	match msg_type {
		'request' { return .request }
		'response' { return .response }
		'event' { return .event }
		else { return .request }
	}
}

// generate_id creates a unique message ID
fn (s CommunicationService) generate_id() string {
	now := time.now()
	return 'msg_${now.unix()}_12345'
}

// ============================================================================
// Statistics
// ============================================================================

// CommunicationStats holds communication statistics
pub struct CommunicationStats {
pub mut:
	total_messages    int
}

// get_stats returns communication statistics
pub fn (s CommunicationService) get_stats() CommunicationStats {
	return CommunicationStats{
		total_messages: s.message_count
	}
}
