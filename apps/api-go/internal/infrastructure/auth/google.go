package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/sacred-vows/api-go/internal/infrastructure/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/idtoken"
)

type GoogleOAuthService struct {
	config      *oauth2.Config
	frontendURL string
	stateStore  *oauthStateStore
}

var (
	// Global state store instance (10 minute expiration)
	globalStateStore = newOAuthStateStore(10 * time.Minute)
)

// NewGoogleOAuthService creates a new GoogleOAuthService with the default state store.
// For testing, use NewGoogleOAuthServiceWithStateStore to inject a custom state store.
func NewGoogleOAuthService(cfg *config.GoogleConfig) *GoogleOAuthService {
	return NewGoogleOAuthServiceWithStateStore(cfg, globalStateStore)
}

// NewGoogleOAuthServiceWithStateStore creates a new GoogleOAuthService with a custom state store.
// This allows for better testability by injecting a state store with different timeout values
// or a mock state store for integration tests.
func NewGoogleOAuthServiceWithStateStore(cfg *config.GoogleConfig, stateStore *oauthStateStore) *GoogleOAuthService {
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
		stateStore:  stateStore,
	}
}

func (s *GoogleOAuthService) GetOAuthConfig() *oauth2.Config {
	return s.config
}

// GetAuthURL generates a secure OAuth authorization URL with a cryptographically random state parameter
// to prevent CSRF attacks. The state is stored and will be verified on callback.
func (s *GoogleOAuthService) GetAuthURL() (string, error) {
	state, err := s.stateStore.generateState()
	if err != nil {
		return "", fmt.Errorf("failed to generate OAuth state: %w", err)
	}
	return s.config.AuthCodeURL(state, oauth2.AccessTypeOffline, oauth2.ApprovalForce), nil
}

// VerifyState verifies that the OAuth state parameter is valid and not expired
func (s *GoogleOAuthService) VerifyState(state string) bool {
	return s.stateStore.verifyState(state)
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
