package firestore

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/sacred-vows/api-go/internal/domain"
	"github.com/sacred-vows/api-go/internal/interfaces/repository"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type userRepository struct {
	client *Client
}

// NewUserRepository creates a new Firestore user repository
func NewUserRepository(client *Client) repository.UserRepository {
	return &userRepository{client: client}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	_, err := r.client.Collection("users").Doc(user.ID).Set(ctx, map[string]interface{}{
		"id":         user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"password":   user.Password,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	})
	return err
}

func (r *userRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	doc, err := r.client.Collection("users").Doc(id).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return nil, nil
		}
		return nil, err
	}
	return r.docToUser(doc)
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	iter := r.client.Collection("users").Where("email", "==", email).Limit(1).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		return nil, err
	}
	if len(docs) == 0 {
		return nil, nil
	}
	return r.docToUser(docs[0])
}

func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	user.UpdatedAt = time.Now()
	_, err := r.client.Collection("users").Doc(user.ID).Update(ctx, []firestore.Update{
		{Path: "email", Value: user.Email},
		{Path: "name", Value: user.Name},
		{Path: "password", Value: user.Password},
		{Path: "updated_at", Value: user.UpdatedAt},
	})
	return err
}

func (r *userRepository) Delete(ctx context.Context, id string) error {
	_, err := r.client.Collection("users").Doc(id).Delete(ctx)
	return err
}

func (r *userRepository) docToUser(doc *firestore.DocumentSnapshot) (*domain.User, error) {
	data := doc.Data()
	user := &domain.User{
		ID:        doc.Ref.ID,
		Email:     getString(data, "email"),
		Name:      getStringPtr(data, "name"),
		Password:  getString(data, "password"),
		CreatedAt: getTime(data, "created_at"),
		UpdatedAt: getTime(data, "updated_at"),
	}
	return user, nil
}
