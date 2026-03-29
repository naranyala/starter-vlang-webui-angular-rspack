module main

import time

// CacheEntry represents a cached item with expiration
pub struct CacheEntry {
pub mut:
	value      string
	expires_at u64
	created_at u64
}

// CacheService - In-memory caching with TTL support
pub struct CacheService {
pub mut:
	cache       map[string]CacheEntry
	initialized bool
	default_ttl u64
}

// new_cache_service creates a new CacheService instance
pub fn new_cache_service() &CacheService {
	return &CacheService{
		cache: map[string]CacheEntry{}
		default_ttl: 3600 // 1 hour default TTL
	}
}

// init initializes the cache service
pub fn (mut s CacheService) init() bool {
	s.initialized = true
	return true
}

// dispose clears all cached entries
pub fn (mut s CacheService) dispose() {
	s.cache = map[string]CacheEntry{}
}

// set stores a value in the cache with default TTL
pub fn (mut s CacheService) set(key string, value string) {
	s.set_with_ttl(key, value, s.default_ttl)
}

// set_with_ttl stores a value with custom TTL in seconds
pub fn (mut s CacheService) set_with_ttl(key string, value string, ttl_seconds u64) {
	now := time.now().unix()
	s.cache[key] = CacheEntry{
		value: value
		expires_at: u64(i64(now) + i64(ttl_seconds))
		created_at: u64(now)
	}
}

// get retrieves a value from the cache
pub fn (s CacheService) get(key string, default string) string {
	entry := s.cache[key] or { return default }
	if entry.expires_at > 0 && time.now().unix() > entry.expires_at {
		return default
	}
	return entry.value
}

// get_raw retrieves a cache entry without expiration check
pub fn (s CacheService) get_raw(key string) ?CacheEntry {
	return s.cache[key]
}

// delete removes a value from the cache
pub fn (mut s CacheService) delete(key string) {
	s.cache.delete(key)
}

// exists checks if a key exists and is not expired
pub fn (s CacheService) exists(key string) bool {
	entry := s.cache[key] or { return false }
	if entry.expires_at > 0 && time.now().unix() > entry.expires_at {
		return false
	}
	return true
}

// clear removes all cached entries
pub fn (mut s CacheService) clear() {
	s.cache = map[string]CacheEntry{}
}

// count returns the number of cached entries
pub fn (s CacheService) count() int {
	return s.cache.len
}

// cleanup_expired removes all expired entries
pub fn (mut s CacheService) cleanup_expired() {
	now := time.now().unix()
	mut keys_to_delete := []string{}
	for key, entry in s.cache {
		if entry.expires_at > 0 && now > entry.expires_at {
			keys_to_delete << key
		}
	}
	for key in keys_to_delete {
		s.cache.delete(key)
	}
}
