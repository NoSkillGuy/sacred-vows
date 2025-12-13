package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/usecase/template"
	"github.com/sacred-vows/api-go/pkg/errors"
)

type TemplateHandler struct {
	getAllUC       *template.GetAllTemplatesUseCase
	getByIDUC      *template.GetTemplateByIDUseCase
	getManifestUC  *template.GetTemplateManifestUseCase
	getManifestsUC *template.GetManifestsUseCase
}

func NewTemplateHandler(
	getAllUC *template.GetAllTemplatesUseCase,
	getByIDUC *template.GetTemplateByIDUseCase,
	getManifestUC *template.GetTemplateManifestUseCase,
	getManifestsUC *template.GetManifestsUseCase,
) *TemplateHandler {
	return &TemplateHandler{
		getAllUC:       getAllUC,
		getByIDUC:      getByIDUC,
		getManifestUC:  getManifestUC,
		getManifestsUC: getManifestsUC,
	}
}

func (h *TemplateHandler) GetAll(c *gin.Context) {
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

	output, err := h.getAllUC.Execute(c.Request.Context(), template.GetAllTemplatesInput{
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
			"error":   "Failed to get templates",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"templates":  output.Templates,
		"categories": output.Categories,
	})
}

func (h *TemplateHandler) GetManifests(c *gin.Context) {
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

func (h *TemplateHandler) GetManifest(c *gin.Context) {
	id := c.Param("id")
	output, err := h.getManifestUC.Execute(c.Request.Context(), id)
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"manifest": output.Manifest})
}

func (h *TemplateHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	output, err := h.getByIDUC.Execute(c.Request.Context(), id)
	if err != nil {
		appErr, ok := err.(*errors.AppError)
		if ok {
			c.JSON(appErr.Code, appErr.ToResponse())
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"template": output.Template})
}
