package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthResponse struct {
	Status    string `json:"status" example:"ok"`
	Timestamp string `json:"timestamp" example:"2024-01-01T00:00:00Z"`
}

// HealthCheck returns the health status of the API
// @Summary      Health check
// @Description  Returns the health status and current timestamp of the API server. This endpoint can be used for monitoring and load balancer health checks.
// @Tags         health
// @Accept       json
// @Produce      json
// @Success      200  {object}  HealthResponse  "Server is healthy"
// @Router       /health [get]
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().Format(time.RFC3339),
	})
}
