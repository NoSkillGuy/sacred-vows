package domain

import (
	"errors"
	"time"
)

var (
	ErrInvalidEmailUsageVendor = errors.New("email usage vendor is required")
	ErrInvalidEmailUsageDate   = errors.New("email usage date is required")
	ErrInvalidEmailUsageMonth  = errors.New("email usage month is required")
	ErrInvalidEmailUsageCount  = errors.New("email usage count must be non-negative")
)

// EmailUsage represents email usage tracking for a vendor
type EmailUsage struct {
	Vendor    string
	Date      string // YYYY-MM-DD format
	Month     string // YYYY-MM format
	Count     int
	UpdatedAt time.Time
}

// Validate validates email usage entity
func (eu *EmailUsage) Validate() error {
	if eu.Vendor == "" {
		return ErrInvalidEmailUsageVendor
	}
	if eu.Date == "" {
		return ErrInvalidEmailUsageDate
	}
	if eu.Month == "" {
		return ErrInvalidEmailUsageMonth
	}
	if eu.Count < 0 {
		return ErrInvalidEmailUsageCount
	}
	return nil
}

// Increment increments the usage count by 1
func (eu *EmailUsage) Increment() {
	eu.Count++
	eu.UpdatedAt = time.Now()
}

// IsWithinDailyLimit checks if the daily count is within the specified limit
func (eu *EmailUsage) IsWithinDailyLimit(limit int) bool {
	if limit <= 0 {
		return true // No limit
	}
	return eu.Count < limit
}

// IsWithinMonthlyLimit checks if the monthly count is within the specified limit
func (eu *EmailUsage) IsWithinMonthlyLimit(limit int) bool {
	if limit <= 0 {
		return true // No limit
	}
	return eu.Count < limit
}

// NewEmailUsage creates a new email usage entity
func NewEmailUsage(vendor, date, month string) (*EmailUsage, error) {
	usage := &EmailUsage{
		Vendor:    vendor,
		Date:      date,
		Month:     month,
		Count:     0,
		UpdatedAt: time.Now(),
	}

	if err := usage.Validate(); err != nil {
		return nil, err
	}

	return usage, nil
}
