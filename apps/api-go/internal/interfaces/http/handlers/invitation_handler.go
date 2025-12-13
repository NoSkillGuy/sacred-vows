package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/usecase/invitation"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type InvitationHandler struct {
	createUC     *invitation.CreateInvitationUseCase
	getByIDUC    *invitation.GetInvitationByIDUseCase
	getAllUC     *invitation.GetAllInvitationsUseCase
	getPreviewUC *invitation.GetInvitationPreviewUseCase
	updateUC     *invitation.UpdateInvitationUseCase
	deleteUC     *invitation.DeleteInvitationUseCase
}

func NewInvitationHandler(
	createUC *invitation.CreateInvitationUseCase,
	getByIDUC *invitation.GetInvitationByIDUseCase,
	getAllUC *invitation.GetAllInvitationsUseCase,
	getPreviewUC *invitation.GetInvitationPreviewUseCase,
	updateUC *invitation.UpdateInvitationUseCase,
	deleteUC *invitation.DeleteInvitationUseCase,
) *InvitationHandler {
	return &InvitationHandler{
		createUC:     createUC,
		getByIDUC:    getByIDUC,
		getAllUC:     getAllUC,
		getPreviewUC: getPreviewUC,
		updateUC:     updateUC,
		deleteUC:     deleteUC,
	}
}

type CreateInvitationRequest struct {
	LayoutID string          `json:"layoutId" example:"royal-elegance" binding:"required"`
	Data     json.RawMessage `json:"data" example:"{\"bride\":\"Jane\",\"groom\":\"John\"}" binding:"required"`
	Title    string          `json:"title" example:"Our Wedding"`
}

type UpdateInvitationRequest struct {
	Data     *json.RawMessage `json:"data" example:"{\"bride\":\"Jane\",\"groom\":\"John\"}"`
	LayoutID *string          `json:"layoutId" example:"royal-elegance"`
	Title    *string          `json:"title" example:"Our Wedding"`
	Status   *string          `json:"status" example:"published"`
}

type InvitationDTO struct {
	ID        string          `json:"id" example:"1234567890"`
	LayoutID  string          `json:"layoutId" example:"royal-elegance"`
	Data      json.RawMessage `json:"data" example:"{\"bride\":\"Jane\",\"groom\":\"John\"}"`
	Title     *string         `json:"title,omitempty" example:"Our Wedding"`
	Status    *string         `json:"status,omitempty" example:"published"`
	UserID    string          `json:"userId" example:"user123"`
	CreatedAt string          `json:"createdAt" example:"2024-01-01T00:00:00Z"`
	UpdatedAt string          `json:"updatedAt" example:"2024-01-01T00:00:00Z"`
}

type InvitationPreviewDTO struct {
	ID       string          `json:"id" example:"1234567890"`
	LayoutID string          `json:"layoutId" example:"royal-elegance"`
	Data     json.RawMessage `json:"data" example:"{\"bride\":\"Jane\",\"groom\":\"John\"}"`
}

type InvitationResponse struct {
	Invitation *InvitationDTO `json:"invitation"`
}

type InvitationsResponse struct {
	Invitations []InvitationDTO `json:"invitations"`
}

type MessageResponse struct {
	Message string `json:"message" example:"Invitation deleted"`
}

// GetAll retrieves all invitations for the current user
// @Summary      List invitations
// @Description  Get all invitations for the current user. Supports optional authentication (anonymous users are supported).
// @Tags         invitations
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  InvitationsResponse  "List of invitations"
// @Failure      500  {object}  ErrorResponse        "Internal server error"
// @Router       /invitations [get]
func (h *InvitationHandler) GetAll(c *gin.Context) {
	userID, _ := c.Get("userID")
	if userID == nil {
		userID = "anonymous"
	}

	output, err := h.getAllUC.Execute(c.Request.Context(), userID.(string))
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get invitations"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"invitations": output.Invitations})
}

// GetPreview retrieves a public invitation preview
// @Summary      Get invitation preview
// @Description  Get a public preview of an invitation by ID. No authentication required.
// @Tags         invitations
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Invitation ID"
// @Success      200  {object}  InvitationResponse  "Invitation preview"
// @Failure      404  {object}  ErrorResponse       "Invitation not found"
// @Router       /invitations/{id}/preview [get]
func (h *InvitationHandler) GetPreview(c *gin.Context) {
	id := c.Param("id")
	output, err := h.getPreviewUC.Execute(c.Request.Context(), id)
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Invitation not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"invitation": output.Invitation})
}

// GetByID retrieves an invitation by ID
// @Summary      Get invitation by ID
// @Description  Get a specific invitation by its ID.
// @Tags         invitations
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Invitation ID"
// @Success      200  {object}  InvitationResponse  "Invitation details"
// @Failure      404  {object}  ErrorResponse      "Invitation not found"
// @Router       /invitations/{id} [get]
func (h *InvitationHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	output, err := h.getByIDUC.Execute(c.Request.Context(), id)
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Invitation not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"invitation": output.Invitation})
}

// Create creates a new invitation
// @Summary      Create invitation
// @Description  Create a new wedding invitation. Supports optional authentication (anonymous users are supported).
// @Tags         invitations
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      CreateInvitationRequest  true  "Invitation data"
// @Success      201      {object}  InvitationResponse       "Invitation created"
// @Failure      400      {object}  ErrorResponse           "Invalid request"
// @Failure      500      {object}  ErrorResponse           "Internal server error"
// @Router       /invitations [post]
func (h *InvitationHandler) Create(c *gin.Context) {
	var req CreateInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	userID, _ := c.Get("userID")
	if userID == nil {
		userID = "anonymous"
	}

	var titlePtr *string
	if req.Title != "" {
		titlePtr = &req.Title
	}

	output, err := h.createUC.Execute(c.Request.Context(), invitation.CreateInvitationInput{
		LayoutID: req.LayoutID,
		Data:     req.Data,
		Title:    titlePtr,
		UserID:   userID.(string),
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create invitation"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"invitation": output.Invitation})
}

// Update updates an existing invitation
// @Summary      Update invitation
// @Description  Update an existing invitation. Supports optional authentication (anonymous users are supported).
// @Tags         invitations
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                  true  "Invitation ID"
// @Param        request  body      UpdateInvitationRequest  true  "Updated invitation data"
// @Success      200      {object}  InvitationResponse       "Invitation updated"
// @Failure      400      {object}  ErrorResponse           "Invalid request"
// @Failure      404      {object}  ErrorResponse           "Invitation not found"
// @Failure      500      {object}  ErrorResponse           "Internal server error"
// @Router       /invitations/{id} [put]
func (h *InvitationHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req UpdateInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	output, err := h.updateUC.Execute(c.Request.Context(), invitation.UpdateInvitationInput{
		ID:       id,
		LayoutID: req.LayoutID,
		Data:     req.Data,
		Title:    req.Title,
		Status:   req.Status,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update invitation"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"invitation": output.Invitation})
}

// Delete deletes an invitation
// @Summary      Delete invitation
// @Description  Delete an invitation by ID. Supports optional authentication (anonymous users are supported).
// @Tags         invitations
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "Invitation ID"
// @Success      200  {object}  MessageResponse  "Invitation deleted"
// @Failure      404  {object}  ErrorResponse   "Invitation not found"
// @Router       /invitations/{id} [delete]
func (h *InvitationHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.deleteUC.Execute(c.Request.Context(), id); err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Invitation not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Invitation deleted"})
}
