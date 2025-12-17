package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type PublishedResolveAPIHandler struct {
	publishedRepo repository.PublishedSiteRepository
	baseDomain    string
}

func NewPublishedResolveAPIHandler(publishedRepo repository.PublishedSiteRepository, baseDomain string) *PublishedResolveAPIHandler {
	return &PublishedResolveAPIHandler{publishedRepo: publishedRepo, baseDomain: baseDomain}
}

type resolveResponse struct {
	Subdomain       string `json:"subdomain"`
	Published       bool   `json:"published"`
	CurrentVersion  int    `json:"currentVersion"`
}

// Resolve resolves a host or subdomain to the current published version.
// GET /api/published/resolve?host=<host> or ?subdomain=<subdomain>
func (h *PublishedResolveAPIHandler) Resolve(c *gin.Context) {
	subdomain := strings.TrimSpace(c.Query("subdomain"))
	host := strings.TrimSpace(c.Query("host"))

	if subdomain == "" && host != "" && h.baseDomain != "" {
		// strip port
		if i := strings.Index(host, ":"); i >= 0 {
			host = host[:i]
		}
		suffix := "." + h.baseDomain
		if strings.HasSuffix(host, suffix) {
			subdomain = strings.TrimSuffix(host, suffix)
		}
	}

	if subdomain == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "subdomain or host required"})
		return
	}

	site, err := h.publishedRepo.FindBySubdomain(c.Request.Context(), subdomain)
	if err != nil || site == nil {
		c.Header("Cache-Control", "public, max-age=30")
		c.JSON(http.StatusNotFound, ErrorResponse{Error: "not found"})
		return
	}

	// Short cache (edge can cache this mapping)
	c.Header("Cache-Control", "public, max-age=30")
	c.JSON(http.StatusOK, resolveResponse{
		Subdomain:      site.Subdomain,
		Published:      site.Published,
		CurrentVersion: site.CurrentVersion,
	})
}


