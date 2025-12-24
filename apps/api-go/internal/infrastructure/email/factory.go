package email

import (
	"fmt"

	"github.com/sacred-vows/api-go/internal/infrastructure/config"
	emailInterface "github.com/sacred-vows/api-go/internal/interfaces/email"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

// NewEmailService creates an email service instance based on the provider configuration
// Always uses multi-vendor mode (supports single or multiple vendors)
func NewEmailService(cfg config.EmailConfig, usageRepo repository.EmailUsageRepository) (emailInterface.EmailService, error) {
	if len(cfg.Vendors) == 0 {
		return nil, fmt.Errorf("no email vendors configured. Please set EMAIL_VENDORS or EMAIL_VENDORS_JSON")
	}

	return NewMultiVendorService(cfg.Vendors, usageRepo, cfg.FromAddress, cfg.FromName)
}
