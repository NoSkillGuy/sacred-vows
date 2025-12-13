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
	InvitationID string  `json:"invitationId" binding:"required"`
	Referrer     *string `json:"referrer"`
	UserAgent    *string `json:"userAgent"`
}

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
