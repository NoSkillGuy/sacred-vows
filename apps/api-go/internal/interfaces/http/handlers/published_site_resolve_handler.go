package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type PublishedSiteResolveHandler struct {
	publishedRepo repository.PublishedSiteRepository
	baseDomain    string
}

func NewPublishedSiteResolveHandler(publishedRepo repository.PublishedSiteRepository, baseDomain string) *PublishedSiteResolveHandler {
	return &PublishedSiteResolveHandler{publishedRepo: publishedRepo, baseDomain: baseDomain}
}

func (h *PublishedSiteResolveHandler) Handle(c *gin.Context) {
	if h.baseDomain == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "publishing not configured"})
		return
	}

	// Only handle non-API paths (avoid breaking /api, /health, /swagger, /published)
	path := c.Request.URL.Path
	if strings.HasPrefix(path, "/api") || strings.HasPrefix(path, "/swagger") || strings.HasPrefix(path, "/published") || path == "/health" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
		return
	}

	host := c.Request.Host
	// strip port if present
	if i := strings.Index(host, ":"); i >= 0 {
		host = host[:i]
	}

	suffix := "." + h.baseDomain
	if !strings.HasSuffix(host, suffix) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
		return
	}
	subdomain := strings.TrimSuffix(host, suffix)
	if subdomain == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
		return
	}

	site, err := h.publishedRepo.FindBySubdomain(c.Request.Context(), subdomain)
	if err != nil || site == nil || !site.Published || site.CurrentVersion <= 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}

	// Redirect to the published artifact index.html for current version.
	key := "sites/" + subdomain + "/v" + itoa(site.CurrentVersion) + "/index.html"
	c.Redirect(http.StatusFound, "/published/"+key)
}

func itoa(v int) string {
	// tiny helper to avoid importing strconv in this small file
	if v == 0 {
		return "0"
	}
	neg := v < 0
	if neg {
		v = -v
	}
	var b [32]byte
	i := len(b)
	for v > 0 {
		i--
		b[i] = byte('0' + (v % 10))
		v /= 10
	}
	if neg {
		i--
		b[i] = '-'
	}
	return string(b[i:])
}
