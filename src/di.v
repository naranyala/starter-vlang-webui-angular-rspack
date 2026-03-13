module di

// Simple DI Container
pub struct Container {
pub mut:
	data map[string]voidptr
}

pub fn new_container() Container {
	return Container{
		data: map[string]voidptr{}
	}
}

pub fn (mut c Container) set(name string, value voidptr) {
	c.data[name] = value
}

pub fn (c Container) get(name string) ?voidptr {
	unsafe {
		data := c.data[name]
		return data
	}
}

pub fn (c Container) has(name string) bool {
	unsafe {
		data := c.data[name]
		return data != 0
	}
}
