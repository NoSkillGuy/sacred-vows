package email

import (
	"bytes"
	"context"
	"fmt"
	"html/template"

	"github.com/mailgun/mailgun-go/v4"
	"github.com/sacred-vows/api-go/internal/infrastructure/config"
	emailInterface "github.com/sacred-vows/api-go/internal/interfaces/email"
)

type mailgunService struct {
	client              *mailgun.MailgunImpl
	fromEmail           string
	fromName            string
	passwordResetTmpl   *template.Template
	passwordChangeOTPTmpl *template.Template
}

// NewMailgunService creates a new Mailgun email service implementation
func NewMailgunService(cfg config.EmailVendorConfig) (emailInterface.EmailService, error) {
	if cfg.APIKey == "" {
		return nil, fmt.Errorf("Mailgun API key is required")
	}

	domain := cfg.Domain
	if domain == "" {
		return nil, fmt.Errorf("Mailgun domain is required")
	}

	if cfg.FromAddress == "" {
		return nil, fmt.Errorf("Mailgun from address is required (set EMAIL_FROM_ADDRESS)")
	}

	mg := mailgun.NewMailgun(domain, cfg.APIKey)

	// Load password reset email template
	passwordResetTemplatePath := getTemplatePath("password_reset.html")
	passwordResetTmpl, err := template.ParseFiles(passwordResetTemplatePath)
	if err != nil {
		return nil, fmt.Errorf("failed to load password reset email template: %w", err)
	}

	// Load password change OTP email template
	passwordChangeOTPTemplatePath := getTemplatePath("password_change_otp.html")
	passwordChangeOTPTmpl, err := template.ParseFiles(passwordChangeOTPTemplatePath)
	if err != nil {
		return nil, fmt.Errorf("failed to load password change OTP email template: %w", err)
	}

	return &mailgunService{
		client:              mg,
		fromEmail:           cfg.FromAddress,
		fromName:            cfg.FromName,
		passwordResetTmpl:   passwordResetTmpl,
		passwordChangeOTPTmpl: passwordChangeOTPTmpl,
	}, nil
}

func (s *mailgunService) SendPasswordResetEmail(ctx context.Context, toEmail string, resetLink string) error {
	// Prepare template data
	templateData := struct {
		ResetLink string
		Email     string
	}{
		ResetLink: resetLink,
		Email:     toEmail,
	}

	// Render HTML template
	var htmlBody bytes.Buffer
	if err := s.passwordResetTmpl.Execute(&htmlBody, templateData); err != nil {
		return fmt.Errorf("failed to render email template: %w", err)
	}

	// Create message
	message := s.client.NewMessage(
		fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail),
		"Reset your Sacred Vows password",
		"", // text part - empty, we're using HTML
		toEmail,
	)
	message.SetHtml(htmlBody.String())

	// Send email via Mailgun API
	_, _, err := s.client.Send(ctx, message)
	if err != nil {
		return fmt.Errorf("failed to send email via Mailgun: %w", err)
	}

	return nil
}

func (s *mailgunService) SendPasswordChangeOTPEmail(ctx context.Context, toEmail string, otp string) error {
	// Prepare template data
	templateData := struct {
		OTP   string
		Email string
	}{
		OTP:   otp,
		Email: toEmail,
	}

	// Render HTML template
	var htmlBody bytes.Buffer
	if err := s.passwordChangeOTPTmpl.Execute(&htmlBody, templateData); err != nil {
		return fmt.Errorf("failed to render email template: %w", err)
	}

	// Create message
	message := s.client.NewMessage(
		fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail),
		"Your password update code (valid for 5 minutes)",
		"", // text part - empty, we're using HTML
		toEmail,
	)
	message.SetHtml(htmlBody.String())

	// Send email via Mailgun API
	_, _, err := s.client.Send(ctx, message)
	if err != nil {
		return fmt.Errorf("failed to send email via Mailgun: %w", err)
	}

	return nil
}

