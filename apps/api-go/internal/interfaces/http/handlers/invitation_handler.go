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
	LayoutID string          `json:"layoutId"`
	Data     json.RawMessage `json:"data"`
	Title    string          `json:"title"`
}

type UpdateInvitationRequest struct {
	Data     *json.RawMessage `json:"data"`
	LayoutID *string          `json:"layoutId"`
	Title    *string          `json:"title"`
	Status   *string          `json:"status"`
}

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
