package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/infrastructure/storage"
	"github.com/sacred-vows/api-go/internal/usecase/invitation"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/sacred-vows/api-go/pkg/logger"
	"go.uber.org/zap"
)

// JSONData represents JSON data as a string for Swagger compatibility
// It can be converted to/from json.RawMessage
type JSONData string

// UnmarshalJSON implements json.Unmarshaler to handle both JSON strings and JSON objects
func (j *JSONData) UnmarshalJSON(data []byte) error {
	// Handle null
	if len(data) == 4 && string(data) == "null" {
		*j = JSONData("{}")
		return nil
	}
	// Try to unmarshal as a string first
	var str string
	if err := json.Unmarshal(data, &str); err == nil {
		*j = JSONData(str)
		return nil
	}
	// If not a string, treat it as raw JSON and convert to string
	*j = JSONData(data)
	return nil
}

// MarshalJSON implements json.Marshaler
func (j JSONData) MarshalJSON() ([]byte, error) {
	// Return as a JSON string
	return json.Marshal(string(j))
}

// ToRawMessage converts JSONData to json.RawMessage
func (j JSONData) ToRawMessage() json.RawMessage {
	return json.RawMessage(j)
}

// JSONDataFromRawMessage creates JSONData from json.RawMessage
func JSONDataFromRawMessage(raw json.RawMessage) JSONData {
	return JSONData(raw)
}

// toHandlerInvitationDTO converts use case InvitationDTO to handler InvitationDTO
func toHandlerInvitationDTO(dto *invitation.InvitationDTO) *InvitationDTO {
	if dto == nil {
		return nil
	}
	createdAt := dto.CreatedAt.Format(time.RFC3339)
	updatedAt := dto.UpdatedAt.Format(time.RFC3339)
	return &InvitationDTO{
		ID:        dto.ID,
		LayoutID:  dto.LayoutID,
		Data:      JSONDataFromRawMessage(dto.Data),
		Title:     dto.Title,
		Status:    dto.Status,
		UserID:    dto.UserID,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}
}

// toHandlerInvitationPreviewDTO converts use case InvitationPreviewDTO to handler InvitationPreviewDTO
func toHandlerInvitationPreviewDTO(dto *invitation.InvitationPreviewDTO) *InvitationPreviewDTO {
	if dto == nil {
		return nil
	}
	return &InvitationPreviewDTO{
		ID:       dto.ID,
		LayoutID: dto.LayoutID,
		Data:     JSONDataFromRawMessage(dto.Data),
	}
}

type InvitationHandler struct {
	createUC     *invitation.CreateInvitationUseCase
	getByIDUC    *invitation.GetInvitationByIDUseCase
	getAllUC     *invitation.GetAllInvitationsUseCase
	getPreviewUC *invitation.GetInvitationPreviewUseCase
	updateUC     *invitation.UpdateInvitationUseCase
	deleteUC     *invitation.DeleteInvitationUseCase
	migrateUC    *invitation.MigrateInvitationsUseCase
	fileStorage  storage.Storage // For deleting assets from storage
}

func NewInvitationHandler(
	createUC *invitation.CreateInvitationUseCase,
	getByIDUC *invitation.GetInvitationByIDUseCase,
	getAllUC *invitation.GetAllInvitationsUseCase,
	getPreviewUC *invitation.GetInvitationPreviewUseCase,
	updateUC *invitation.UpdateInvitationUseCase,
	deleteUC *invitation.DeleteInvitationUseCase,
	migrateUC *invitation.MigrateInvitationsUseCase,
	fileStorage storage.Storage,
) *InvitationHandler {
	return &InvitationHandler{
		createUC:     createUC,
		getByIDUC:    getByIDUC,
		getAllUC:     getAllUC,
		getPreviewUC: getPreviewUC,
		updateUC:     updateUC,
		deleteUC:     deleteUC,
		migrateUC:    migrateUC,
		fileStorage:  fileStorage,
	}
}

type CreateInvitationRequest struct {
	LayoutID string   `json:"layoutId" example:"classic-scroll" binding:"required"`
	Data     JSONData `json:"data" swagtype:"string" example:"{\"bride\":\"Jane\",\"groom\":\"John\"}" binding:"required"`
	Title    string   `json:"title" example:"Our Wedding"`
}

type UpdateInvitationRequest struct {
	Data     *JSONData `json:"data" swagtype:"string" example:"{\"bride\":\"Jane\",\"groom\":\"John\"}"`
	LayoutID *string   `json:"layoutId" example:"classic-scroll"`
	Title    *string   `json:"title" example:"Our Wedding"`
	Status   *string   `json:"status" example:"published"`
}

type InvitationDTO struct {
	ID        string   `json:"id" example:"1234567890"`
	LayoutID  string   `json:"layoutId" example:"classic-scroll"`
	Data      JSONData `json:"data" swagtype:"string" example:"{\"bride\":\"Jane\",\"groom\":\"John\"}"`
	Title     *string  `json:"title,omitempty" example:"Our Wedding"`
	Status    *string  `json:"status,omitempty" example:"published"`
	UserID    string   `json:"userId" example:"user123"`
	CreatedAt string   `json:"createdAt" example:"2024-01-01T00:00:00Z"`
	UpdatedAt string   `json:"updatedAt" example:"2024-01-01T00:00:00Z"`
}

type InvitationPreviewDTO struct {
	ID       string   `json:"id" example:"1234567890"`
	LayoutID string   `json:"layoutId" example:"classic-scroll"`
	Data     JSONData `json:"data" swagtype:"string" example:"{\"bride\":\"Jane\",\"groom\":\"John\"}"`
}

type InvitationResponse struct {
	Invitation *InvitationDTO `json:"invitation"`
}

type InvitationsResponse struct {
	Invitations []InvitationDTO `json:"invitations"`
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
	authHeader := c.GetHeader("Authorization")
	userID, exists := c.Get("userID")

	// If Authorization header is present but userID is not set, token validation failed
	// This means user tried to authenticate but token is invalid - return error
	if authHeader != "" && (!exists || userID == nil) {
		logger.GetLogger().Warn("GetAll invitations: Invalid token provided",
			zap.String("authHeader", authHeader[:min(30, len(authHeader))]),
		)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return
	}

	// Only use anonymous if no Authorization header was provided
	if !exists || userID == nil {
		userID = "anonymous"
	}

	// Log for debugging
	logger.GetLogger().Info("GetAll invitations",
		zap.String("userID", userID.(string)),
		zap.Bool("fromContext", exists),
		zap.Bool("hasAuthHeader", authHeader != ""),
	)

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

	// Convert use case DTOs to handler DTOs
	handlerInvitations := make([]InvitationDTO, len(output.Invitations))
	for i, inv := range output.Invitations {
		handlerInvitations[i] = *toHandlerInvitationDTO(inv)
	}
	c.JSON(http.StatusOK, gin.H{"invitations": handlerInvitations})
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

	// GetPreview returns InvitationPreviewDTO, convert it
	previewDTO := toHandlerInvitationPreviewDTO(output.Invitation)
	// Convert to full DTO for response (Swagger expects InvitationResponse)
	fullDTO := &InvitationDTO{
		ID:       previewDTO.ID,
		LayoutID: previewDTO.LayoutID,
		Data:     previewDTO.Data,
	}
	c.JSON(http.StatusOK, gin.H{"invitation": fullDTO})
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

	c.JSON(http.StatusOK, gin.H{"invitation": toHandlerInvitationDTO(output.Invitation)})
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
		logger.GetLogger().Warn("Create invitation: Invalid request",
			zap.Error(err),
		)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	authHeader := c.GetHeader("Authorization")
	userID, exists := c.Get("userID")

	// If Authorization header is present but userID is not set, token validation failed
	if authHeader != "" && (!exists || userID == nil) {
		logger.GetLogger().Warn("Create invitation: Invalid token provided")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return
	}

	// Only use anonymous if no Authorization header was provided
	if !exists || userID == nil {
		userID = "anonymous"
	}

	logger.GetLogger().Info("Create invitation",
		zap.String("userID", userID.(string)),
		zap.Bool("hasAuthHeader", authHeader != ""),
	)

	var titlePtr *string
	if req.Title != "" {
		titlePtr = &req.Title
	}

	output, err := h.createUC.Execute(c.Request.Context(), invitation.CreateInvitationInput{
		LayoutID: req.LayoutID,
		Data:     req.Data.ToRawMessage(),
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

	c.JSON(http.StatusCreated, gin.H{"invitation": toHandlerInvitationDTO(output.Invitation)})
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

	authHeader := c.GetHeader("Authorization")
	userID, exists := c.Get("userID")

	// If Authorization header is present but userID is not set, token validation failed
	if authHeader != "" && (!exists || userID == nil) {
		logger.GetLogger().Warn("Update invitation: Invalid token provided", zap.String("invitationID", id))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return
	}

	// Only use anonymous if no Authorization header was provided
	if !exists || userID == nil {
		userID = "anonymous"
	}

	logger.GetLogger().Info("Update invitation",
		zap.String("invitationID", id),
		zap.String("userID", userID.(string)),
		zap.Bool("hasAuthHeader", authHeader != ""),
	)

	var dataPtr *json.RawMessage
	if req.Data != nil {
		raw := (*req.Data).ToRawMessage()
		dataPtr = &raw
	}

	output, err := h.updateUC.Execute(c.Request.Context(), invitation.UpdateInvitationInput{
		ID:       id,
		LayoutID: req.LayoutID,
		Data:     dataPtr,
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

	c.JSON(http.StatusOK, gin.H{"invitation": toHandlerInvitationDTO(output.Invitation)})
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

	authHeader := c.GetHeader("Authorization")
	userID, exists := c.Get("userID")

	// If Authorization header is present but userID is not set, token validation failed
	if authHeader != "" && (!exists || userID == nil) {
		logger.GetLogger().Warn("Delete invitation: Invalid token provided", zap.String("invitationID", id))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return
	}

	logger.GetLogger().Info("Delete invitation",
		zap.String("invitationID", id),
		zap.String("userID", func() string {
			if exists && userID != nil {
				return userID.(string)
			}
			return "anonymous"
		}()),
		zap.Bool("hasAuthHeader", authHeader != ""),
	)

	output, err := h.deleteUC.Execute(c.Request.Context(), id)
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Invitation not found"})
		return
	}

	// Delete assets from storage
	if h.fileStorage != nil && len(output.DeletedAssets) > 0 {
		for _, deletedAsset := range output.DeletedAssets {
			// Delete from storage using filename
			if err := h.fileStorage.DeleteFile(deletedAsset.Filename); err != nil {
				// Log error but don't fail - asset is already deleted from DB
				logger.GetLogger().Warn("Failed to delete asset from storage",
					zap.String("filename", deletedAsset.Filename),
					zap.Error(err))
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Invitation deleted",
		"deletedAssets": len(output.DeletedAssets),
	})
}

type MigrateInvitationsRequest struct {
	FromUserID string `json:"fromUserID" binding:"required" example:"anonymous"`
	ToUserID   string `json:"toUserID" binding:"required" example:"user123"`
}

type MigrateInvitationsResponse struct {
	MigratedCount int `json:"migratedCount" example:"5"`
}

// MigrateInvitations migrates invitations from one user ID to another
// @Summary      Migrate invitations
// @Description  Migrate invitations from one user ID to another. Useful for migrating anonymous invitations to a user account.
// @Tags         invitations
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      MigrateInvitationsRequest  true  "Migration request"
// @Success      200      {object}  MigrateInvitationsResponse  "Migration successful"
// @Failure      400      {object}  ErrorResponse              "Invalid request"
// @Failure      500      {object}  ErrorResponse              "Internal server error"
// @Router       /invitations/migrate [post]
func (h *InvitationHandler) MigrateInvitations(c *gin.Context) {
	var req MigrateInvitationsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Get authenticated user ID
	userID, exists := c.Get("userID")
	if !exists || userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	// Ensure user can only migrate to their own account
	if req.ToUserID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Can only migrate invitations to your own account"})
		return
	}

	output, err := h.migrateUC.Execute(c.Request.Context(), invitation.MigrateInvitationsInput{
		FromUserID: req.FromUserID,
		ToUserID:   req.ToUserID,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to migrate invitations"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"migratedCount": output.MigratedCount,
	})
}
