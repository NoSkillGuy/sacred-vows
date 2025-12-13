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
	Name    string  `json:"name" binding:"required" example:"John Doe"`
	Date    string  `json:"date" binding:"required" example:"2024-06-15"`
	Email   *string `json:"email" example:"john@example.com"`
	Phone   *string `json:"phone" example:"+1234567890"`
	Message *string `json:"message" example:"Looking forward to it!"`
}

type RSVPDTO struct {
	ID           string  `json:"id" example:"1234567890"`
	InvitationID string  `json:"invitationId" example:"inv123"`
	Name         string  `json:"name" example:"John Doe"`
	Date         string  `json:"date" example:"2024-06-15"`
	Email        *string `json:"email,omitempty" example:"john@example.com"`
	Phone        *string `json:"phone,omitempty" example:"+1234567890"`
	Message      *string `json:"message,omitempty" example:"Looking forward to it!"`
	SubmittedAt  string  `json:"submittedAt" example:"2024-01-01T00:00:00Z"`
}

type RSVPResponse struct {
	RSVP *RSVPDTO `json:"rsvp"`
}

type RSVPsResponse struct {
	Responses []RSVPDTO `json:"responses"`
	Count     int       `json:"count" example:"5"`
}

// Submit submits an RSVP response
// @Summary      Submit RSVP
// @Description  Submit an RSVP response for a wedding invitation. No authentication required.
// @Tags         rsvp
// @Accept       json
// @Produce      json
// @Param        invitationId  path      string              true  "Invitation ID"
// @Param        request       body      SubmitRSVPRequest   true  "RSVP data"
// @Success      201           {object}  RSVPResponse        "RSVP submitted successfully"
// @Failure      400           {object}  ErrorResponse       "Invalid request"
// @Failure      404           {object}  ErrorResponse       "Invitation not found"
// @Failure      500           {object}  ErrorResponse       "Internal server error"
// @Router       /rsvp/{invitationId} [post]
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

// GetByInvitation retrieves all RSVP responses for an invitation
// @Summary      Get RSVP responses
// @Description  Get all RSVP responses for a specific invitation. No authentication required.
// @Tags         rsvp
// @Accept       json
// @Produce      json
// @Param        invitationId  path      string          true  "Invitation ID"
// @Success      200           {object}  RSVPsResponse   "List of RSVP responses"
// @Failure      404           {object}  ErrorResponse   "Invitation not found"
// @Failure      500           {object}  ErrorResponse   "Internal server error"
// @Router       /rsvp/{invitationId} [get]
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
