package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/usecase/analytics"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type AnalyticsHandler struct {
	trackViewUC       *analytics.TrackViewUseCase
	getByInvitationUC *analytics.GetAnalyticsByInvitationUseCase
}

func NewAnalyticsHandler(
	trackViewUC *analytics.TrackViewUseCase,
	getByInvitationUC *analytics.GetAnalyticsByInvitationUseCase,
) *AnalyticsHandler {
	return &AnalyticsHandler{
		trackViewUC:       trackViewUC,
		getByInvitationUC: getByInvitationUC,
	}
}

type TrackViewRequest struct {
	InvitationID string  `json:"invitationId" binding:"required" example:"inv123"`
	Referrer     *string `json:"referrer" example:"https://example.com"`
	UserAgent    *string `json:"userAgent" example:"Mozilla/5.0..."`
}

type AnalyticsDTO struct {
	ID           string  `json:"id" example:"1234567890"`
	InvitationID string  `json:"invitationId" example:"inv123"`
	Type         string  `json:"type" example:"view"`
	Referrer     *string `json:"referrer,omitempty" example:"https://example.com"`
	UserAgent    *string `json:"userAgent,omitempty" example:"Mozilla/5.0..."`
	IPAddress    *string `json:"ipAddress,omitempty" example:"192.168.1.1"`
	Timestamp    string  `json:"timestamp" example:"2024-01-01T00:00:00Z"`
}

type TrackViewResponse struct {
	Success bool `json:"success" example:"true"`
}

type AnalyticsResponse struct {
	InvitationID string         `json:"invitationId" example:"inv123"`
	Views        int            `json:"views" example:"100"`
	RSVPs        int            `json:"rsvps" example:"25"`
	Analytics    []AnalyticsDTO `json:"analytics"`
}

// TrackView tracks an invitation view
// @Summary      Track view
// @Description  Track a view event for an invitation. IP address is automatically extracted from the request.
// @Tags         analytics
// @Accept       json
// @Produce      json
// @Param        request  body      TrackViewRequest     true  "View tracking data"
// @Success      200      {object}  TrackViewResponse    "View tracked successfully"
// @Failure      400      {object}  ErrorResponse       "Invalid request"
// @Failure      500      {object}  ErrorResponse       "Internal server error"
// @Router       /analytics/view [post]
func (h *AnalyticsHandler) TrackView(c *gin.Context) {
	var req TrackViewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invitation ID is required"})
		return
	}

	ipAddress := c.ClientIP()
	if err := h.trackViewUC.Execute(c.Request.Context(), analytics.TrackViewInput{
		InvitationID: req.InvitationID,
		Referrer:     req.Referrer,
		UserAgent:    req.UserAgent,
		IPAddress:    &ipAddress,
	}); err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track view"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetByInvitation retrieves analytics for an invitation
// @Summary      Get analytics
// @Description  Get analytics data (views, RSVPs, and detailed events) for a specific invitation.
// @Tags         analytics
// @Accept       json
// @Produce      json
// @Param        invitationId  path      string              true  "Invitation ID"
// @Success      200           {object}  AnalyticsResponse   "Analytics data"
// @Failure      404           {object}  ErrorResponse       "Invitation not found"
// @Failure      500           {object}  ErrorResponse       "Internal server error"
// @Router       /analytics/{invitationId} [get]
func (h *AnalyticsHandler) GetByInvitation(c *gin.Context) {
	invitationID := c.Param("invitationId")
	output, err := h.getByInvitationUC.Execute(c.Request.Context(), invitationID)
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get analytics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"invitationId": output.InvitationID,
		"views":        output.Views,
		"rsvps":        output.RSVPs,
		"analytics":    output.Analytics,
	})
}
