package repository

import (
	"context"
)

// EmailUsageRepository defines the interface for email usage tracking operations
type EmailUsageRepository interface {
	// IncrementUsage atomically increments the usage count for a vendor on a specific date and month
	IncrementUsage(ctx context.Context, vendor, date, month string) error

	// GetDailyCount returns the current daily count for a vendor on a specific date
	GetDailyCount(ctx context.Context, vendor, date string) (int, error)

	// GetMonthlyCount returns the current monthly count for a vendor in a specific month
	GetMonthlyCount(ctx context.Context, vendor, month string) (int, error)

	// ResetDailyCount resets the daily count (for cleanup/maintenance)
	ResetDailyCount(ctx context.Context, vendor, date string) error
}
