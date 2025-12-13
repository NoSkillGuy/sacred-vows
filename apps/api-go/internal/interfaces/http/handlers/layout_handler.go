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

// GetAll retrieves all available layouts
// @Summary      List layouts
// @Description  Get all available layouts with optional filtering by category and featured status.
// @Tags         layouts
// @Accept       json
// @Produce      json
// @Param        category  query     string  false  "Filter by category (e.g., 'elegant', 'modern')"
// @Param        featured  query     string  false  "Filter featured layouts (true/false)"
// @Success      200       {object}  map[string]interface{}  "Layouts and categories"
// @Failure      500       {object}  ErrorResponse           "Internal server error"
// @Router       /layouts [get]
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

// GetManifests retrieves all layout manifests
// @Summary      Get all manifests
// @Description  Get manifests for all available layouts.
// @Tags         layouts
// @Accept       json
// @Produce      json
// @Success      200  {object}  map[string]interface{}  "All layout manifests"
// @Failure      500  {object}  ErrorResponse           "Internal server error"
// @Router       /layouts/manifests [get]
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

// GetManifest retrieves a specific layout manifest
// @Summary      Get layout manifest
// @Description  Get the manifest for a specific layout by ID.
// @Tags         layouts
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Layout ID"
// @Success      200  {object}  map[string]interface{}  "Layout manifest"
// @Failure      404  {object}  ErrorResponse           "Layout not found"
// @Failure      500  {object}  ErrorResponse           "Internal server error"
// @Router       /layouts/{id}/manifest [get]
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

// GetByID retrieves a layout by ID
// @Summary      Get layout by ID
// @Description  Get a specific layout by its ID.
// @Tags         layouts
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Layout ID"
// @Success      200  {object}  map[string]interface{}  "Layout details"
// @Failure      404  {object}  ErrorResponse           "Layout not found"
// @Failure      500  {object}  ErrorResponse           "Internal server error"
// @Router       /layouts/{id} [get]
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
