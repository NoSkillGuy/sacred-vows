package auth

import (
	"context"
	"fmt"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/infrastructure/auth"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"github.com/sacred-vows/api-go/pkg/errors"
	"golang.org/x/oauth2"
	googleoauth2 "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

type GoogleOAuthUseCase struct {
	userRepo       repository.UserRepository
	oauthConfig    *oauth2.Config
	googleOAuthSvc *auth.GoogleOAuthService
}

func NewGoogleOAuthUseCase(userRepo repository.UserRepository, oauthConfig *oauth2.Config) *GoogleOAuthUseCase {
	return &GoogleOAuthUseCase{
		userRepo:    userRepo,
		oauthConfig: oauthConfig,
	}
}

func NewGoogleOAuthUseCaseWithService(userRepo repository.UserRepository, oauthConfig *oauth2.Config, googleOAuthSvc *auth.GoogleOAuthService) *GoogleOAuthUseCase {
	return &GoogleOAuthUseCase{
		userRepo:       userRepo,
		oauthConfig:    oauthConfig,
		googleOAuthSvc: googleOAuthSvc,
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
	oauth2Service, err := googleoauth2.NewService(ctx, option.WithTokenSource(uc.oauthConfig.TokenSource(ctx, token)))
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
	if uc.googleOAuthSvc == nil {
		return nil, errors.Wrap(errors.ErrInternalServerError.Code, "Google OAuth service not configured", fmt.Errorf("service is nil"))
	}

	// Verify ID token
	userInfo, err := uc.googleOAuthSvc.VerifyIDToken(ctx, input.Credential)
	if err != nil {
		return nil, errors.Wrap(errors.ErrUnauthorized.Code, "Invalid Google credential", err)
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
	} else {
		// Update existing user with Google info if needed
		if userInfo.Name != "" && (user.Name == nil || *user.Name == "") {
			name := userInfo.Name
			user.Name = &name
			if err := uc.userRepo.Update(ctx, user); err != nil {
				// Log error but don't fail the request
				// User already exists, so we can continue
			}
		}
	}

	return &GoogleVerifyOutput{
		User: toUserDTO(user),
	}, nil
}
