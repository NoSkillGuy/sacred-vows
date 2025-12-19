package firestore

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type emailUsageRepository struct {
	client *Client
}

// NewEmailUsageRepository creates a new Firestore email usage repository
func NewEmailUsageRepository(client *Client) repository.EmailUsageRepository {
	return &emailUsageRepository{client: client}
}

// IncrementUsage atomically increments the usage count for a vendor on a specific date and month
func (r *emailUsageRepository) IncrementUsage(ctx context.Context, vendor, date, month string) error {
	// Use Firestore transaction for atomic increment
	err := r.client.client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// Increment daily count
		dailyDocID := fmt.Sprintf("%s_%s", vendor, date)
		dailyRef := r.client.Collection("email_usage_daily").Doc(dailyDocID)
		
		// Get current daily count or create new
		dailyDoc, err := tx.Get(dailyRef)
		var dailyCount int
		if err != nil {
			// Document doesn't exist, start at 0
			dailyCount = 0
		} else {
			data := dailyDoc.Data()
			dailyCount = getInt(data, "count")
		}
		
		// Increment and update
		dailyCount++
		tx.Set(dailyRef, map[string]interface{}{
			"vendor":    vendor,
			"date":      date,
			"count":     dailyCount,
			"updated_at": time.Now(),
		}, firestore.MergeAll)

		// Increment monthly count
		monthlyDocID := fmt.Sprintf("%s_%s", vendor, month)
		monthlyRef := r.client.Collection("email_usage_monthly").Doc(monthlyDocID)
		
		// Get current monthly count or create new
		monthlyDoc, err := tx.Get(monthlyRef)
		var monthlyCount int
		if err != nil {
			// Document doesn't exist, start at 0
			monthlyCount = 0
		} else {
			data := monthlyDoc.Data()
			monthlyCount = getInt(data, "count")
		}
		
		// Increment and update
		monthlyCount++
		tx.Set(monthlyRef, map[string]interface{}{
			"vendor":    vendor,
			"month":     month,
			"count":     monthlyCount,
			"updated_at": time.Now(),
		}, firestore.MergeAll)

		return nil
	})

	return err
}

// GetDailyCount returns the current daily count for a vendor on a specific date
func (r *emailUsageRepository) GetDailyCount(ctx context.Context, vendor, date string) (int, error) {
	docID := fmt.Sprintf("%s_%s", vendor, date)
	doc, err := r.client.Collection("email_usage_daily").Doc(docID).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return 0, nil // Document doesn't exist, return 0
		}
		return 0, err
	}

	data := doc.Data()
	return getInt(data, "count"), nil
}

// GetMonthlyCount returns the current monthly count for a vendor in a specific month
func (r *emailUsageRepository) GetMonthlyCount(ctx context.Context, vendor, month string) (int, error) {
	docID := fmt.Sprintf("%s_%s", vendor, month)
	doc, err := r.client.Collection("email_usage_monthly").Doc(docID).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return 0, nil // Document doesn't exist, return 0
		}
		return 0, err
	}

	data := doc.Data()
	return getInt(data, "count"), nil
}

// ResetDailyCount resets the daily count (for cleanup/maintenance)
func (r *emailUsageRepository) ResetDailyCount(ctx context.Context, vendor, date string) error {
	docID := fmt.Sprintf("%s_%s", vendor, date)
	_, err := r.client.Collection("email_usage_daily").Doc(docID).Delete(ctx)
	return err
}

