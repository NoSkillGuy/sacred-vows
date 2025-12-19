package email

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/sacred-vows/api-go/internal/infrastructure/config"
	emailInterface "github.com/sacred-vows/api-go/internal/interfaces/email"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type multiVendorService struct {
	vendors        []vendorService
	usageRepo      repository.EmailUsageRepository
	currentIndex   int
	mu             sync.Mutex
	defaultFrom    string
	defaultFromName string
}

type vendorService struct {
	config  config.EmailVendorConfig
	service emailInterface.EmailService
}

// NewMultiVendorService creates a new multi-vendor email service with round-robin load balancing
func NewMultiVendorService(
	vendorConfigs []config.EmailVendorConfig,
	usageRepo repository.EmailUsageRepository,
	defaultFrom, defaultFromName string,
) (emailInterface.EmailService, error) {
	if len(vendorConfigs) == 0 {
		return nil, fmt.Errorf("at least one email vendor must be configured")
	}

	vendors := make([]vendorService, 0, len(vendorConfigs))
	for _, vc := range vendorConfigs {
		if !vc.Enabled {
			continue
		}

		var service emailInterface.EmailService
		var err error

		switch vc.Provider {
		case "mailjet":
			service, err = NewMailjetService(vc)
		case "mailgun":
			service, err = NewMailgunService(vc)
		default:
			return nil, fmt.Errorf("unsupported email provider: %s", vc.Provider)
		}

		if err != nil {
			return nil, fmt.Errorf("failed to initialize %s service: %w", vc.Provider, err)
		}

		vendors = append(vendors, vendorService{
			config:  vc,
			service: service,
		})
	}

	if len(vendors) == 0 {
		return nil, fmt.Errorf("no enabled email vendors configured")
	}

	return &multiVendorService{
		vendors:         vendors,
		usageRepo:       usageRepo,
		currentIndex:    0,
		defaultFrom:     defaultFrom,
		defaultFromName: defaultFromName,
	}, nil
}

func (s *multiVendorService) SendPasswordResetEmail(ctx context.Context, toEmail string, resetLink string) error {
	// Get current date and month for usage tracking
	now := time.Now()
	date := now.Format("2006-01-02")
	month := now.Format("2006-01")

	// Try each vendor in round-robin order until one succeeds
	attempts := 0
	maxAttempts := len(s.vendors)

	for attempts < maxAttempts {
		vendor := s.getNextVendor()

		// Check if vendor is within limits
		dailyCount, err := s.usageRepo.GetDailyCount(ctx, vendor.config.Provider, date)
		if err != nil {
			// Log error but continue to next vendor
			continue
		}

		monthlyCount, err := s.usageRepo.GetMonthlyCount(ctx, vendor.config.Provider, month)
		if err != nil {
			// Log error but continue to next vendor
			continue
		}

		// Check limits
		if vendor.config.DailyLimit > 0 && dailyCount >= vendor.config.DailyLimit {
			// Daily limit reached, try next vendor
			continue
		}

		if vendor.config.MonthlyLimit > 0 && monthlyCount >= vendor.config.MonthlyLimit {
			// Monthly limit reached, try next vendor
			continue
		}

		// Try to send email
		err = vendor.service.SendPasswordResetEmail(ctx, toEmail, resetLink)
		if err != nil {
			// Send failed, try next vendor
			continue
		}

		// Success! Increment usage counters
		if err := s.usageRepo.IncrementUsage(ctx, vendor.config.Provider, date, month); err != nil {
			// Log error but don't fail the request (email was sent successfully)
			// In production, you might want to log this error
		}

		return nil
	}

	// All vendors failed or are at limit
	return fmt.Errorf("all email vendors are unavailable or have reached their limits")
}

// getNextVendor returns the next vendor in round-robin order
func (s *multiVendorService) getNextVendor() vendorService {
	s.mu.Lock()
	defer s.mu.Unlock()

	vendor := s.vendors[s.currentIndex]
	s.currentIndex = (s.currentIndex + 1) % len(s.vendors)
	return vendor
}


