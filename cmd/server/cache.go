package main

import (
    "sync"
    "time"
)

type cacheEntry struct {
    value     Meteo
    expiresAt time.Time
}

type MeteoCache struct {
    mu   sync.RWMutex
    data map[string]cacheEntry
}

func NewMeteoCache() *MeteoCache {
    return &MeteoCache{
        data: make(map[string]cacheEntry),
    }
}

func (c *MeteoCache) Get(city string) (Meteo, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()

    e, ok := c.data[city]
    if !ok || time.Now().After(e.expiresAt) {
        return Meteo{}, false
    }
    return e.value, true
}

func (c *MeteoCache) Set(city string, m Meteo, ttl time.Duration) {
    c.mu.Lock()
    defer c.mu.Unlock()

    c.data[city] = cacheEntry{
        value:     m,
        expiresAt: time.Now().Add(ttl),
    }
}
