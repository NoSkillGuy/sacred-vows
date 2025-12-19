package email

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"os"
	"path/filepath"

	"github.com/mailjet/mailjet-apiv3-go/v3"
	"github.com/sacred-vows/api-go/internal/infrastructure/config"
	emailInterface "github.com/sacred-vows/api-go/internal/interfaces/email"
)

type mailjetService struct {
	client    *mailjet.Client
	fromEmail string
	fromName  string
	template  *template.Template
}

// NewMailjetService creates a new Mailjet email service implementation
func NewMailjetService(cfg config.EmailVendorConfig) (emailInterface.EmailService, error) {
	if cfg.APIKey == "" || cfg.SecretKey == "" {
		return nil, fmt.Errorf("Mailjet API key and secret key are required")
	}

	if cfg.FromAddress == "" {
		return nil, fmt.Errorf("Mailjet from address is required (set EMAIL_FROM_ADDRESS)")
	}

	client := mailjet.NewMailjetClient(cfg.APIKey, cfg.SecretKey)

	// Load email template
	templatePath := getTemplatePath()
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		return nil, fmt.Errorf("failed to load email template: %w", err)
	}

	return &mailjetService{
		client:    client,
		fromEmail: cfg.FromAddress,
		fromName:  cfg.FromName,
		template:  tmpl,
	}, nil
}

func (s *mailjetService) SendPasswordResetEmail(ctx context.Context, toEmail string, resetLink string) error {
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
	if err := s.template.Execute(&htmlBody, templateData); err != nil {
		return fmt.Errorf("failed to render email template: %w", err)
	}

	// Build Mailjet message
	messagesInfo := []mailjet.InfoMessagesV31{
		{
			From: &mailjet.RecipientV31{
				Email: s.fromEmail,
				Name:  s.fromName,
			},
			To: &mailjet.RecipientsV31{
				mailjet.RecipientV31{
					Email: toEmail,
				},
			},
			Subject: "Reset your Sacred Vows password",
			HTMLPart: htmlBody.String(),
		},
	}

	messages := mailjet.MessagesV31{Info: messagesInfo}

	// Send email via Mailjet API
	_, err := s.client.SendMailV31(&messages)
	if err != nil {
		return fmt.Errorf("failed to send email via Mailjet: %w", err)
	}

	return nil
}

// getTemplatePath returns the path to the email template
// It tries multiple locations to find the template file
func getTemplatePath() string {
	// Try common paths relative to the executable
	candidates := []string{
		"./internal/infrastructure/email/templates/password_reset.html",
		"internal/infrastructure/email/templates/password_reset.html",
		filepath.Join(".", "internal", "infrastructure", "email", "templates", "password_reset.html"),
	}

	// Also try relative to current working directory
	if cwd, err := os.Getwd(); err == nil {
		candidates = append(candidates,
			filepath.Join(cwd, "internal", "infrastructure", "email", "templates", "password_reset.html"),
			filepath.Join(cwd, "apps", "api-go", "internal", "infrastructure", "email", "templates", "password_reset.html"),
		)
	}

	// Check if any candidate exists
	for _, path := range candidates {
		if _, err := os.Stat(path); err == nil {
			return path
		}
	}

	// If none found, return the first candidate (will fail with a clear error)
	return candidates[0]
}


