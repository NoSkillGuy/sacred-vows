package handlers

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/usecase/publish"
	"github.com/sacred-vows/api-go/pkg/logger"
	"go.uber.org/zap"
)

type PublishHandler struct {
	validateUC      *publish.ValidateSubdomainUseCase
	publishUC       *publish.PublishInvitationUseCase
	listVersionsUC  *publish.ListPublishedVersionsUseCase
	rollbackUC      *publish.RollbackPublishedSiteUseCase
	baseDomain      string
	subdomainSuffix string // Optional suffix (e.g., "-dev") to append to subdomain in URL
	serverPort      string
}

func NewPublishHandler(
	validateUC *publish.ValidateSubdomainUseCase,
	publishUC *publish.PublishInvitationUseCase,
	listVersionsUC *publish.ListPublishedVersionsUseCase,
	rollbackUC *publish.RollbackPublishedSiteUseCase,
	baseDomain string,
	subdomainSuffix string,
	serverPort string,
) *PublishHandler {
	return &PublishHandler{
		validateUC:      validateUC,
		publishUC:       publishUC,
		listVersionsUC:  listVersionsUC,
		rollbackUC:      rollbackUC,
		baseDomain:      baseDomain,
		subdomainSuffix: subdomainSuffix,
		serverPort:      serverPort,
	}
}

type validateSubdomainRequest struct {
	InvitationID string `json:"invitationId"`
	Subdomain    string `json:"subdomain"`
}

type validateSubdomainResponse struct {
	Available           bool   `json:"available"`
	NormalizedSubdomain string `json:"normalizedSubdomain"`
	Reason              string `json:"reason,omitempty"`
}

// ValidateSubdomain godoc
// @Summary Validate subdomain availability for publishing
// @Tags publish
// @Accept json
// @Produce json
// @Param request body validateSubdomainRequest true "Validate request"
// @Success 200 {object} validateSubdomainResponse
// @Failure 400 {object} ErrorResponse
// @Router /publish/validate [post]
func (h *PublishHandler) ValidateSubdomain(c *gin.Context) {
	var req validateSubdomainRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid request"})
		return
	}

	normalized, available, reason, err := h.validateUC.Execute(c.Request.Context(), req.Subdomain)
	if err != nil && available {
		available = false
	}

	c.JSON(http.StatusOK, validateSubdomainResponse{
		Available:           available,
		NormalizedSubdomain: normalized,
		Reason:              reason,
	})
}

type publishRequest struct {
	InvitationID string `json:"invitationId"`
	Subdomain    string `json:"subdomain"`
}

type publishResponse struct {
	URL       string `json:"url"`
	Subdomain string `json:"subdomain"`
	Version   int    `json:"version"`
}

// Publish godoc
// @Summary Publish an invitation to a subdomain
// @Tags publish
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body publishRequest true "Publish request"
// @Success 200 {object} publishResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Router /publish [post]
func (h *PublishHandler) Publish(c *gin.Context) {
	var req publishRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid request"})
		return
	}

	userIDAny, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "authentication required"})
		return
	}
	userID, _ := userIDAny.(string)

	subdomain, version, _, err := h.publishUC.Execute(c.Request.Context(), req.InvitationID, userID, req.Subdomain)
	if err != nil {
		logger.GetLogger().Warn("publish failed",
			zap.String("userId", userID),
			zap.String("invitationId", req.InvitationID),
			zap.String("subdomain", req.Subdomain),
			zap.Error(err),
		)
		// Keep error mapping simple for now
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}
	logger.GetLogger().Info("publish succeeded",
		zap.String("userId", userID),
		zap.String("invitationId", req.InvitationID),
		zap.String("subdomain", subdomain),
		zap.Int("version", version),
	)

	url := ""
	if h.baseDomain != "" {
		// Apply subdomain suffix if configured (e.g., "-dev" for dev environment)
		urlSubdomain := subdomain
		suffix := h.subdomainSuffix

		// Fallback: if baseDomain is "sacredvows.io" and suffix is empty,
		// detect dev environment from request host (safety net in case config loading fails)
		if suffix == "" && h.baseDomain == "sacredvows.io" {
			// Check request host - strip port if present
			host := c.Request.Host
			if i := strings.Index(host, ":"); i >= 0 {
				host = host[:i]
			}
			if host != "" && strings.Contains(host, "dev.sacredvows.io") {
				suffix = "-dev"
				logger.GetLogger().Warn("using fallback: detected dev environment from request host (config may not be loaded correctly)",
					zap.String("host", host),
					zap.String("subdomain", subdomain),
					zap.String("appEnv", os.Getenv("APP_ENV")),
					zap.String("configuredSuffix", h.subdomainSuffix),
				)
			} else {
				logger.GetLogger().Warn("subdomain suffix is empty for sacredvows.io domain",
					zap.String("host", host),
					zap.String("appEnv", os.Getenv("APP_ENV")),
					zap.String("subdomain", subdomain),
					zap.String("configuredSuffix", h.subdomainSuffix),
				)
			}
		}

		if suffix != "" {
			urlSubdomain = subdomain + suffix
		}

		// Local dev convenience: *.localhost resolves to 127.0.0.1 but defaults to port 80 in browsers.
		// Our API commonly runs on :3000, so include the port and use http for localhost.
		if h.baseDomain == "localhost" {
			port := h.serverPort
			if port != "" && port != "80" {
				url = "http://" + urlSubdomain + "." + h.baseDomain + ":" + port
			} else {
				url = "http://" + urlSubdomain + "." + h.baseDomain
			}
		} else {
			url = "https://" + urlSubdomain + "." + h.baseDomain
		}
	}

	c.JSON(http.StatusOK, publishResponse{
		URL:       url,
		Subdomain: subdomain,
		Version:   version,
	})
}

type listVersionsResponse struct {
	Versions []publish.VersionInfo `json:"versions"`
}

// ListVersions godoc
// @Summary List available versions for a published site
// @Tags publish
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param subdomain query string true "Subdomain"
// @Success 200 {object} listVersionsResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Router /published/versions [get]
func (h *PublishHandler) ListVersions(c *gin.Context) {
	subdomain := c.Query("subdomain")
	if subdomain == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "subdomain is required"})
		return
	}

	userIDAny, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "authentication required"})
		return
	}
	userID, _ := userIDAny.(string)

	versions, err := h.listVersionsUC.Execute(c.Request.Context(), subdomain, userID)
	if err != nil {
		logger.GetLogger().Warn("list versions failed",
			zap.String("userId", userID),
			zap.String("subdomain", subdomain),
			zap.Error(err),
		)
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, listVersionsResponse{
		Versions: versions,
	})
}

type rollbackRequest struct {
	Subdomain string `json:"subdomain"`
	Version   int    `json:"version"`
}

type rollbackResponse struct {
	Message string `json:"message"`
}

// Rollback godoc
// @Summary Rollback a published site to a previous version
// @Tags publish
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body rollbackRequest true "Rollback request"
// @Success 200 {object} rollbackResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Router /published/rollback [post]
func (h *PublishHandler) Rollback(c *gin.Context) {
	var req rollbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: "invalid request"})
		return
	}

	userIDAny, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Error: "authentication required"})
		return
	}
	userID, _ := userIDAny.(string)

	if err := h.rollbackUC.Execute(c.Request.Context(), req.Subdomain, req.Version, userID); err != nil {
		logger.GetLogger().Warn("rollback failed",
			zap.String("userId", userID),
			zap.String("subdomain", req.Subdomain),
			zap.Int("version", req.Version),
			zap.Error(err),
		)
		c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	logger.GetLogger().Info("rollback succeeded",
		zap.String("userId", userID),
		zap.String("subdomain", req.Subdomain),
		zap.Int("version", req.Version),
	)

	c.JSON(http.StatusOK, rollbackResponse{
		Message: "Rollback successful",
	})
}
