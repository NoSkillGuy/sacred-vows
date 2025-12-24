package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestLoginUseCase_Execute(t *testing.T) {
	tests := []struct {
		name      string
		mockSetup func() *MockUserRepository
		input     LoginInput
		wantErr   bool
		validate  func(*testing.T, *LoginOutput)
	}{
		{
			name: "valid credentials returns user",
			mockSetup: func() *MockUserRepository {
				email := "test@example.com"
				password := "ValidPass123"
				hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
				user := &domain.User{
					ID:       "user-123",
					Email:    email,
					Password: string(hashedPassword),
					Name:     stringPtr("Test User"),
				}
				return &MockUserRepository{
					FindByEmailFn: func(ctx context.Context, emailAddr string) (*domain.User, error) {
						if emailAddr == email {
							return user, nil
						}
						return nil, nil
					},
				}
			},
			input: LoginInput{
				Email:    "test@example.com",
				Password: "ValidPass123",
			},
			wantErr: false,
			validate: func(t *testing.T, output *LoginOutput) {
				require.NotNil(t, output, "Output should not be nil")
				require.NotNil(t, output.User, "User should not be nil")
				assert.Equal(t, "user-123", output.User.ID, "User ID should match")
				assert.Equal(t, "test@example.com", output.User.Email, "User email should match")
			},
		},
		{
			name: "user not found returns error",
			mockSetup: func() *MockUserRepository {
				return &MockUserRepository{
					FindByEmailFn: func(ctx context.Context, emailAddr string) (*domain.User, error) {
						return nil, nil
					},
				}
			},
			input: LoginInput{
				Email:    "notfound@example.com",
				Password: "ValidPass123",
			},
			wantErr: true,
			validate: func(t *testing.T, output *LoginOutput) {
				assert.Nil(t, output, "Output should be nil on error")
			},
		},
		{
			name: "invalid password returns error",
			mockSetup: func() *MockUserRepository {
				email := "test@example.com"
				correctPassword := "ValidPass123"
				hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(correctPassword), bcrypt.DefaultCost)
				user := &domain.User{
					ID:       "user-123",
					Email:    email,
					Password: string(hashedPassword),
				}
				return &MockUserRepository{
					FindByEmailFn: func(ctx context.Context, emailAddr string) (*domain.User, error) {
						if emailAddr == email {
							return user, nil
						}
						return nil, nil
					},
				}
			},
			input: LoginInput{
				Email:    "test@example.com",
				Password: "WrongPass123",
			},
			wantErr: true,
			validate: func(t *testing.T, output *LoginOutput) {
				assert.Nil(t, output, "Output should be nil on error")
			},
		},
		{
			name: "repository error returns error",
			mockSetup: func() *MockUserRepository {
				repoError := errors.New("repository error")
				return &MockUserRepository{
					FindByEmailFn: func(ctx context.Context, emailAddr string) (*domain.User, error) {
						return nil, repoError
					},
				}
			},
			input: LoginInput{
				Email:    "test@example.com",
				Password: "ValidPass123",
			},
			wantErr: true,
			validate: func(t *testing.T, output *LoginOutput) {
				assert.Nil(t, output, "Output should be nil on error")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Arrange
			mockRepo := tt.mockSetup()
			useCase := NewLoginUseCase(mockRepo)

			// Act
			output, err := useCase.Execute(context.Background(), tt.input)

			// Assert
			if tt.wantErr {
				require.Error(t, err, "Expected error but got none")
			} else {
				require.NoError(t, err, "Expected no error but got one")
			}
			if tt.validate != nil {
				tt.validate(t, output)
			}
		})
	}
}

func stringPtr(s string) *string {
	return &s
}
