package auth

import (
	"context"
	"fmt"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"golang.org/x/oauth2"
	"google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

type GoogleOAuthUseCase struct {
	userRepo    repository.UserRepository
	oauthConfig *oauth2.Config
}

func NewGoogleOAuthUseCase(userRepo repository.UserRepository, oauthConfig *oauth2.Config) *GoogleOAuthUseCase {
	return &GoogleOAuthUseCase{
		userRepo:    userRepo,
		oauthConfig: oauthConfig,
	}
}

type GoogleOAuthInput struct {
	Code string
}

type GoogleOAuthOutput struct {
	Token string
	User  *UserDTO
}

func (uc *GoogleOAuthUseCase) Execute(ctx context.Context, input GoogleOAuthInput) (*GoogleOAuthOutput, error) {
	// Exchange code for token
	token, err := uc.oauthConfig.Exchange(ctx, input.Code)
	if err != nil {
		return nil, errors.Wrap(errors.ErrUnauthorized.Code, "Failed to exchange code for token", err)
	}

	// Get user info from Google
	oauth2Service, err := oauth2.NewService(ctx, option.WithTokenSource(uc.oauthConfig.TokenSource(ctx, token)))
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to create OAuth2 service", err)
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to get user info", err)
	}

	// Find or create user
	user, err := uc.userRepo.FindByEmail(ctx, userInfo.Email)
	if err != nil || user == nil {
		// Create new user
		user, err = domain.NewUser(userInfo.Email, "", nil) // No password for OAuth users
		if err != nil {
			return nil, errors.Wrap(errors.ErrBadRequest.Code, "Invalid user data", err)
		}

		if userInfo.Name != "" {
			name := userInfo.Name
			user.Name = &name
		}

		if err := uc.userRepo.Create(ctx, user); err != nil {
			return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Failed to create user", err)
		}
	}

	return &GoogleOAuthOutput{
		User: toUserDTO(user),
	}, nil
}

type GoogleVerifyInput struct {
	Credential string
}

type GoogleVerifyOutput struct {
	Token string
	User  *UserDTO
}

func (uc *GoogleOAuthUseCase) Verify(ctx context.Context, input GoogleVerifyInput) (*GoogleVerifyOutput, error) {
	// Verify ID token
	// This is a simplified version - in production, use google.golang.org/api/idtoken
	// For now, we'll need to implement proper ID token verification

	return nil, fmt.Errorf("ID token verification not yet implemented")
}
