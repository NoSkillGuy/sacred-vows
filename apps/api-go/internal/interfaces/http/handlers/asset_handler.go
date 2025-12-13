package handlers

import (
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/infrastructure/storage"
	"github.com/sacred-vows/api-go/internal/usecase/asset"
	"github.com/sacred-vows/api-go/pkg/errors"
	"github.com/segmentio/ksuid"
)

type AssetHandler struct {
	uploadUC    *asset.UploadAssetUseCase
	getAllUC    *asset.GetAllAssetsUseCase
	deleteUC    *asset.DeleteAssetUseCase
	fileStorage *storage.FileStorage
}

func NewAssetHandler(
	uploadUC *asset.UploadAssetUseCase,
	getAllUC *asset.GetAllAssetsUseCase,
	deleteUC *asset.DeleteAssetUseCase,
	fileStorage *storage.FileStorage,
) *AssetHandler {
	return &AssetHandler{
		uploadUC:    uploadUC,
		getAllUC:    getAllUC,
		deleteUC:    deleteUC,
		fileStorage: fileStorage,
	}
}

type DeleteAssetRequest struct {
	URL string `json:"url" binding:"required"`
}

func (h *AssetHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// Open file
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to open file"})
		return
	}
	defer src.Close()

	// Validate file
	if err := h.fileStorage.ValidateFile(file.Header.Get("Content-Type"), file.Size); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	uniqueFilename := ksuid.New().String() + ext

	// Save file
	uploadedFile, err := h.fileStorage.SaveFile(uniqueFilename, file.Filename, file.Header.Get("Content-Type"), file.Size, src)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload failed"})
		return
	}

	userID, _ := c.Get("userID")
	if userID == nil {
		userID = "anonymous"
	}

	// Create asset record
	output, err := h.uploadUC.Execute(c.Request.Context(), asset.UploadAssetInput{
		Filename:     uploadedFile.Filename,
		OriginalName: uploadedFile.OriginalName,
		Size:         uploadedFile.Size,
		MimeType:     uploadedFile.MimeType,
		UserID:       userID.(string),
	})

	if err != nil {
		// Clean up file
		h.fileStorage.DeleteFile(uploadedFile.Filename)
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Upload failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":   output.URL,
		"asset": output.Asset,
	})
}

func (h *AssetHandler) GetAll(c *gin.Context) {
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get assets"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"assets": output.Assets})
}

func (h *AssetHandler) Delete(c *gin.Context) {
	var req DeleteAssetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL is required"})
		return
	}

	if err := h.deleteUC.Execute(c.Request.Context(), req.URL); err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Asset deleted"})
}
