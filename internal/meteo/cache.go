package meteo

import (
	"sync"
	"time"
)

type cacheEntry struct {
	value     Reading
	expiresAt time.Time
}

type Cache struct {
	mu   sync.RWMutex
	data map[string]cacheEntry
	ttl  time.Duration
}

func NewCache(ttl time.Duration) *Cache {
	return &Cache{
		data: make(map[string]cacheEntry),
		ttl:  ttl,
	}
}

func (c *Cache) Get(city string) (Reading, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	e, ok := c.data[city]
	if !ok || time.Now().After(e.expiresAt) {
		return Reading{}, false
	}
	return e.value, true
}

func (c *Cache) Set(city string, r Reading) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.data[city] = cacheEntry{
		value:     r,
		expiresAt: time.Now().Add(c.ttl),
	}
}
