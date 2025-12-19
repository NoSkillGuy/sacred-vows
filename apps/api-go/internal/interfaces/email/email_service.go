package email

import "context"

// EmailService defines the interface for email operations
// This interface follows Clean Architecture principles, allowing different
// email providers (Mailjet, SendGrid, SMTP, etc.) to be swapped via configuration
type EmailService interface {
	// SendPasswordResetEmail sends a password reset email to the specified address
	// with the provided reset link
	SendPasswordResetEmail(ctx context.Context, toEmail string, resetLink string) error
}



