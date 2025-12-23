package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sacred-vows/api-go/pkg/logger"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

const (
	// RequestIDHeader is the HTTP header name for request ID
	RequestIDHeader = "X-Request-ID"
	// RequestIDKey is the key used to store request ID in Gin context
	RequestIDKey = "request_id"
)

// RequestIDMiddleware generates or extracts request ID and adds it to context, traces, and logs
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract or generate request ID
		requestID := c.GetHeader(RequestIDHeader)
		if requestID == "" {
			// Generate new UUID if not present
			requestID = uuid.New().String()
		}

		// Store in Gin context
		c.Set(RequestIDKey, requestID)

		// Add to response headers for client correlation
		c.Header(RequestIDHeader, requestID)

		// Add to trace attributes if span exists
		span := trace.SpanFromContext(c.Request.Context())
		if span.IsRecording() {
			span.SetAttributes(attribute.String("http.request_id", requestID))
		}

		// Add to logger context
		logger := logger.GetLogger().With(zap.String("request_id", requestID))
		c.Set("logger", logger)

		c.Next()
	}
}

// GetRequestID extracts request ID from Gin context
func GetRequestID(c *gin.Context) string {
	if id, exists := c.Get(RequestIDKey); exists {
		if str, ok := id.(string); ok {
			return str
		}
	}
	return ""
}

