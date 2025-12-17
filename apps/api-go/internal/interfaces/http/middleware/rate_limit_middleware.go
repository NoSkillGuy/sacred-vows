package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type tokenBucket struct {
	mu       sync.Mutex
	capacity float64
	tokens   float64
	rate     float64 // tokens per second
	last     time.Time
}

func newTokenBucket(capacity int, refillPerSecond float64) *tokenBucket {
	now := time.Now()
	return &tokenBucket{
		capacity: float64(capacity),
		tokens:   float64(capacity),
		rate:     refillPerSecond,
		last:     now,
	}
}

func (b *tokenBucket) allow(cost float64) bool {
	b.mu.Lock()
	defer b.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(b.last).Seconds()
	b.last = now

	b.tokens = min(b.capacity, b.tokens+(elapsed*b.rate))
	if b.tokens >= cost {
		b.tokens -= cost
		return true
	}
	return false
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

var (
	bucketsMu sync.Mutex
	buckets   = map[string]*tokenBucket{}
)

func getClientIP(c *gin.Context) string {
	ip := c.ClientIP()
	// gin may include IPv6 zone; normalize
	if host, _, err := net.SplitHostPort(ip); err == nil {
		return host
	}
	return ip
}

// RateLimit provides a simple in-memory token bucket rate limiter.
// Example: RateLimit(10, 1) allows bursts of 10 and refills at 1 req/sec per IP.
func RateLimit(burst int, refillPerSecond float64) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := getClientIP(c)
		bucketsMu.Lock()
		b, ok := buckets[key]
		if !ok {
			b = newTokenBucket(burst, refillPerSecond)
			buckets[key] = b
		}
		bucketsMu.Unlock()

		if !b.allow(1) {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded"})
			c.Abort()
			return
		}
		c.Next()
	}
}


