package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/usecase/layout"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type LayoutHandler struct {
	getAllUC       *layout.GetAllLayoutsUseCase
	getByIDUC      *layout.GetLayoutByIDUseCase
	getManifestUC  *layout.GetLayoutManifestUseCase
	getManifestsUC *layout.GetManifestsUseCase
}

func NewLayoutHandler(
	getAllUC *layout.GetAllLayoutsUseCase,
	getByIDUC *layout.GetLayoutByIDUseCase,
	getManifestUC *layout.GetLayoutManifestUseCase,
	getManifestsUC *layout.GetManifestsUseCase,
) *LayoutHandler {
	return &LayoutHandler{
		getAllUC:       getAllUC,
		getByIDUC:      getByIDUC,
		getManifestUC:  getManifestUC,
		getManifestsUC: getManifestsUC,
	}
}

func (h *LayoutHandler) GetAll(c *gin.Context) {
	category := c.Query("category")
	featuredStr := c.Query("featured")

	var categoryPtr *string
	if category != "" {
		categoryPtr = &category
	}

	var featuredPtr *bool
	if featuredStr == "true" {
		featured := true
		featuredPtr = &featured
	}

	output, err := h.getAllUC.Execute(c.Request.Context(), layout.GetAllLayoutsInput{
		Category: categoryPtr,
		Featured: featuredPtr,
	})

	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		// Log the actual error for debugging
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get layouts",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"layouts":    output.Layouts,
		"categories": output.Categories,
	})
}

func (h *LayoutHandler) GetManifests(c *gin.Context) {
	output, err := h.getManifestsUC.Execute(c.Request.Context())
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get manifests"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"manifests": output.Manifests})
}

func (h *LayoutHandler) GetManifest(c *gin.Context) {
	id := c.Param("id")
	output, err := h.getManifestUC.Execute(c.Request.Context(), id)
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Layout not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"manifest": output.Manifest})
}

func (h *LayoutHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	output, err := h.getByIDUC.Execute(c.Request.Context(), id)
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Layout not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"layout": output.Layout})
}
