package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/usecase/rsvp"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type RSVPHandler struct {
	submitUC          *rsvp.SubmitRSVPUseCase
	getByInvitationUC *rsvp.GetRSVPByInvitationUseCase
}

func NewRSVPHandler(
	submitUC *rsvp.SubmitRSVPUseCase,
	getByInvitationUC *rsvp.GetRSVPByInvitationUseCase,
) *RSVPHandler {
	return &RSVPHandler{
		submitUC:          submitUC,
		getByInvitationUC: getByInvitationUC,
	}
}

type SubmitRSVPRequest struct {
	Name    string  `json:"name" binding:"required"`
	Date    string  `json:"date" binding:"required"`
	Email   *string `json:"email"`
	Phone   *string `json:"phone"`
	Message *string `json:"message"`
}

func (h *RSVPHandler) Submit(c *gin.Context) {
	invitationID := c.Param("invitationId")
	var req SubmitRSVPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name and date are required"})
		return
	}

	output, err := h.submitUC.Execute(c.Request.Context(), rsvp.SubmitRSVPInput{
		InvitationID: invitationID,
		Name:         req.Name,
		Date:         req.Date,
		Email:        req.Email,
		Phone:        req.Phone,
		Message:      req.Message,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit RSVP"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"rsvp": output.RSVP})
}

func (h *RSVPHandler) GetByInvitation(c *gin.Context) {
	invitationID := c.Param("invitationId")
	output, err := h.getByInvitationUC.Execute(c.Request.Context(), invitationID)
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get RSVP responses"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"responses": output.Responses,
		"count":     output.Count,
	})
}
