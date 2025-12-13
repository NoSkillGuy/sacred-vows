package auth

import (
	"context"
	"fmt"

	"github.com/sacred-vows/api-go/internal/infrastructure/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/idtoken"
)

type GoogleOAuthService struct {
	config      *oauth2.Config
	frontendURL string
}

func NewGoogleOAuthService(cfg *config.GoogleConfig) *GoogleOAuthService {
	oauthConfig := &oauth2.Config{
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		RedirectURL:  cfg.RedirectURI,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		},
		Endpoint: google.Endpoint,
	}

	return &GoogleOAuthService{
		config:      oauthConfig,
		frontendURL: cfg.FrontendURL,
	}
}

func (s *GoogleOAuthService) GetOAuthConfig() *oauth2.Config {
	return s.config
}

func (s *GoogleOAuthService) GetAuthURL() string {
	return s.config.AuthCodeURL("state", oauth2.AccessTypeOffline, oauth2.ApprovalForce)
}

func (s *GoogleOAuthService) ExchangeCode(ctx context.Context, code string) (*oauth2.Token, error) {
	return s.config.Exchange(ctx, code)
}

func (s *GoogleOAuthService) GetUserInfo(ctx context.Context, token *oauth2.Token) (*GoogleUserInfo, error) {
	// Use the token to get user info
	// This is a simplified version - in production, use google.golang.org/api/oauth2/v2
	return nil, fmt.Errorf("not implemented - use oauth2/v2 service")
}

type GoogleUserInfo struct {
	Email string
	Name  string
	ID    string
}

// VerifyIDToken verifies a Google ID token
func (s *GoogleOAuthService) GetFrontendURL() string {
	return s.frontendURL
}

func (s *GoogleOAuthService) VerifyIDToken(ctx context.Context, idToken string) (*GoogleUserInfo, error) {
	payload, err := idtoken.Validate(ctx, idToken, s.config.ClientID)
	if err != nil {
		return nil, err
	}

	email, _ := payload.Claims["email"].(string)
	name, _ := payload.Claims["name"].(string)
	sub, _ := payload.Claims["sub"].(string)

	return &GoogleUserInfo{
		Email: email,
		Name:  name,
		ID:    sub,
	}, nil
}
