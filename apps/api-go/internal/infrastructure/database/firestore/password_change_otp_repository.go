package firestore

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
)

type passwordChangeOTPRepository struct {
	client *Client
}

// NewPasswordChangeOTPRepository creates a new Firestore password change OTP repository
func NewPasswordChangeOTPRepository(client *Client) repository.PasswordChangeOTPRepository {
	return &passwordChangeOTPRepository{client: client}
}

func (r *passwordChangeOTPRepository) Create(ctx context.Context, otp *domain.PasswordChangeOTP) error {
	otp.CreatedAt = time.Now()

	data := map[string]interface{}{
		"id":            otp.ID,
		"user_id":       otp.UserID,
		"email":         otp.Email,
		"otp_hash":      otp.OTPHash,
		"expires_at":    otp.ExpiresAt,
		"attempt_count": otp.AttemptCount,
		"used":          otp.Used,
		"created_at":    otp.CreatedAt,
	}

	_, err := r.client.Collection("password_change_otps").Doc(otp.ID).Set(ctx, data)
	return err
}

func (r *passwordChangeOTPRepository) FindByUserID(ctx context.Context, userID string) (*domain.PasswordChangeOTP, error) {
	// Find the most recent non-used, non-expired OTP for the user
	iter := r.client.Collection("password_change_otps").
		Where("user_id", "==", userID).
		Where("used", "==", false).
		OrderBy("created_at", firestore.Desc).
		Limit(1).
		Documents(ctx)

	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}
	if len(docs) == 0 {
		return nil, nil
	}

	otp, err := r.docToPasswordChangeOTP(docs[0])
	if err != nil {
		return nil, err
	}

	// Check if expired
	if otp.IsExpired() {
		return nil, nil
	}

	return otp, nil
}

func (r *passwordChangeOTPRepository) FindByOTPHash(ctx context.Context, hash string) (*domain.PasswordChangeOTP, error) {
	iter := r.client.Collection("password_change_otps").Where("otp_hash", "==", hash).Limit(1).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}
	if len(docs) == 0 {
		return nil, nil
	}
	return r.docToPasswordChangeOTP(docs[0])
}

func (r *passwordChangeOTPRepository) InvalidateByUserID(ctx context.Context, userID string) error {
	// Find all non-used OTPs for the user
	iter := r.client.Collection("password_change_otps").
		Where("user_id", "==", userID).
		Where("used", "==", false).
		Documents(ctx)

	docs, err := iter.GetAll()
	if err != nil {
		return err
	}

	if len(docs) == 0 {
		return nil
	}

	// Mark all as used (invalidate them)
	batch := r.client.Batch()
	for _, doc := range docs {
		batch.Update(doc.Ref, []firestore.Update{
			{Path: "used", Value: true},
		})
	}

	_, err = batch.Commit(ctx)
	return err
}

func (r *passwordChangeOTPRepository) IncrementAttempts(ctx context.Context, otpID string) error {
	// Get current attempt count
	doc, err := r.client.Collection("password_change_otps").Doc(otpID).Get(ctx)
	if err != nil {
		return err
	}

	data := doc.Data()
	currentCount := getInt(data, "attempt_count")

	_, err = r.client.Collection("password_change_otps").Doc(otpID).Update(ctx, []firestore.Update{
		{Path: "attempt_count", Value: currentCount + 1},
	})
	return err
}

func (r *passwordChangeOTPRepository) MarkAsUsed(ctx context.Context, otpID string) error {
	_, err := r.client.Collection("password_change_otps").Doc(otpID).Update(ctx, []firestore.Update{
		{Path: "used", Value: true},
	})
	return err
}

func (r *passwordChangeOTPRepository) docToPasswordChangeOTP(doc *firestore.DocumentSnapshot) (*domain.PasswordChangeOTP, error) {
	data := doc.Data()
	otp := &domain.PasswordChangeOTP{
		ID:           doc.Ref.ID,
		UserID:       getString(data, "user_id"),
		Email:        getString(data, "email"),
		OTPHash:      getString(data, "otp_hash"),
		ExpiresAt:    getTime(data, "expires_at"),
		AttemptCount: getInt(data, "attempt_count"),
		Used:         getBool(data, "used"),
		CreatedAt:    getTime(data, "created_at"),
	}

	return otp, nil
}
