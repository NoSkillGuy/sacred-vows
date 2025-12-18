package handlers

import (
	"net/http"
	"path/filepath"
	"time"

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
	fileStorage storage.Storage
	gcsStorage  storage.SignedURLStorage // Optional, for signed URL generation
}

func NewAssetHandler(
	uploadUC *asset.UploadAssetUseCase,
	getAllUC *asset.GetAllAssetsUseCase,
	deleteUC *asset.DeleteAssetUseCase,
	fileStorage storage.Storage,
	gcsStorage storage.SignedURLStorage, // Optional, can be nil
) *AssetHandler {
	return &AssetHandler{
		uploadUC:    uploadUC,
		getAllUC:    getAllUC,
		deleteUC:    deleteUC,
		fileStorage: fileStorage,
		gcsStorage:  gcsStorage,
	}
}

type DeleteAssetRequest struct {
	URL string `json:"url" binding:"required" example:"/uploads/abc123.jpg"`
}

type AssetDTO struct {
	ID           string `json:"id" example:"1234567890"`
	URL          string `json:"url" example:"/uploads/abc123.jpg"`
	Filename     string `json:"filename" example:"abc123.jpg"`
	OriginalName string `json:"originalName" example:"photo.jpg"`
	Size         int64  `json:"size" example:"1024000"`
	MimeType     string `json:"mimetype" example:"image/jpeg"`
	UserID       string `json:"userId" example:"user123"`
	CreatedAt    string `json:"createdAt" example:"2024-01-01T00:00:00Z"`
}

type UploadAssetResponse struct {
	URL   string    `json:"url" example:"/uploads/abc123.jpg"`
	Asset *AssetDTO `json:"asset"`
}

type AssetsResponse struct {
	Assets []AssetDTO `json:"assets"`
}

// Upload uploads a new asset file
// @Summary      Upload asset
// @Description  Upload a new asset file (image). Supports optional authentication (anonymous users are supported).
// @Tags         assets
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        image  formData  file    true  "Image file to upload"
// @Success      200    {object}  UploadAssetResponse  "Asset uploaded successfully"
// @Failure      400    {object}  ErrorResponse       "Invalid file or request"
// @Failure      500    {object}  ErrorResponse       "Internal server error"
// @Router       /assets/upload [post]
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

// GetAll retrieves all assets for the current user
// @Summary      List assets
// @Description  Get all assets for the current user. Supports optional authentication (anonymous users are supported).
// @Tags         assets
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  AssetsResponse   "List of assets"
// @Failure      500  {object}  ErrorResponse   "Internal server error"
// @Router       /assets [get]
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

// Delete deletes an asset
// @Summary      Delete asset
// @Description  Delete an asset by URL. Supports optional authentication (anonymous users are supported).
// @Tags         assets
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      DeleteAssetRequest  true  "Asset URL to delete"
// @Success      200      {object}  MessageResponse     "Asset deleted"
// @Failure      400      {object}  ErrorResponse       "Invalid request"
// @Failure      404      {object}  ErrorResponse       "Asset not found"
// @Router       /assets/delete [delete]
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

type GenerateSignedURLRequest struct {
	Filename  string `json:"filename" binding:"required" example:"abc123.jpg"`
	MimeType  string `json:"mimeType" binding:"required" example:"image/jpeg"`
	Size      int64  `json:"size" binding:"required" example:"1024000"`
}

type GenerateSignedURLResponse struct {
	SignedURL string `json:"signedUrl" example:"https://storage.googleapis.com/..."`
	ObjectKey string `json:"objectKey" example:"abc123.jpg"`
	ExpiresIn int    `json:"expiresIn" example:"3600"`
}

// GenerateSignedURL generates a signed URL for direct upload to GCS
// @Summary      Generate signed URL for upload
// @Description  Generate a signed URL that allows direct upload to GCS. The client should use this URL to PUT the file directly to GCS.
// @Tags         assets
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      GenerateSignedURLRequest  true  "Upload request"
// @Success      200      {object}  GenerateSignedURLResponse  "Signed URL generated"
// @Failure      400      {object}  ErrorResponse             "Invalid request"
// @Failure      500      {object}  ErrorResponse             "Internal server error"
// @Router       /assets/upload-url [post]
func (h *AssetHandler) GenerateSignedURL(c *gin.Context) {
	if h.gcsStorage == nil {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "Signed URL generation not available"})
		return
	}

	var req GenerateSignedURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Validate file
	if err := h.fileStorage.ValidateFile(req.MimeType, req.Size); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate unique filename
	ext := filepath.Ext(req.Filename)
	uniqueFilename := ksuid.New().String() + ext

	// Generate signed URL (valid for 1 hour)
	expiresIn := 1 * time.Hour
	signedURL, err := h.gcsStorage.GenerateSignedURL(c.Request.Context(), uniqueFilename, "PUT", expiresIn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate signed URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"signedUrl": signedURL,
		"objectKey": uniqueFilename,
		"expiresIn": int(expiresIn.Seconds()),
	})
}
