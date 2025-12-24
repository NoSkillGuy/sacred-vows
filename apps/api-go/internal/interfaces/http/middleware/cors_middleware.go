package middleware

import (
	"github.com/gin-gonic/gin"
)

// CORS creates a CORS middleware handler
// When credentials are included, we must specify the exact origin (not *)
func CORS(frontendURL string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Determine allowed origin
		allowedOrigin := ""
		if origin != "" {
			// Check if origin matches frontend URL or is a localhost development origin
			if origin == frontendURL {
				allowedOrigin = origin
			} else if isLocalhostOrigin(origin) {
				// Allow localhost with any port for development
				allowedOrigin = origin
			}
		} else {
			// Same-origin request (no Origin header) - use frontend URL
			allowedOrigin = frontendURL
		}

		if allowedOrigin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, traceparent, tracestate, X-Request-ID, x-request-id")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// isLocalhostOrigin checks if the origin is a localhost development origin
func isLocalhostOrigin(origin string) bool {
	// Allow localhost with any port for development
	return origin == "http://localhost:5173" ||
		origin == "http://localhost:5174" ||
		origin == "http://localhost:3000" ||
		origin == "http://127.0.0.1:5173" ||
		origin == "http://127.0.0.1:5174" ||
		origin == "http://127.0.0.1:3000"
}
