package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sacred-vows/api-go/internal/usecase/publish"
	"github.com/sacred-vows/api-go/pkg/logger"
	"go.uber.org/zap"
)

type PublishHandler struct {
	validateUC *publish.ValidateSubdomainUseCase
	publishUC  *publish.PublishInvitationUseCase
	baseDomain string
	serverPort string
}

func NewPublishHandler(
	validateUC *publish.ValidateSubdomainUseCase,
	publishUC *publish.PublishInvitationUseCase,
	baseDomain string,
	serverPort string,
) *PublishHandler {
	return &PublishHandler{validateUC: validateUC, publishUC: publishUC, baseDomain: baseDomain, serverPort: serverPort}
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
		// Local dev convenience: *.localhost resolves to 127.0.0.1 but defaults to port 80 in browsers.
		// Our API commonly runs on :3000, so include the port and use http for localhost.
		if h.baseDomain == "localhost" {
			port := h.serverPort
			if port != "" && port != "80" {
				url = "http://" + subdomain + "." + h.baseDomain + ":" + port
			} else {
				url = "http://" + subdomain + "." + h.baseDomain
			}
		} else {
			url = "https://" + subdomain + "." + h.baseDomain
		}
	}

	c.JSON(http.StatusOK, publishResponse{
		URL:       url,
		Subdomain: subdomain,
		Version:   version,
	})
}
