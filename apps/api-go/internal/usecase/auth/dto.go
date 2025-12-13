package auth

import (
	"github.com/sacred-vows/api-go/internal/domain"
)

// UserDTO represents a user data transfer object
type UserDTO struct {
	ID    string  `json:"id"`
	Email string  `json:"email"`
	Name  *string `json:"name,omitempty"`
}

func toUserDTO(user *domain.User) *UserDTO {
	return &UserDTO{
		ID:    user.ID,
		Email: user.Email,
		Name:  user.Name,
	}
}
