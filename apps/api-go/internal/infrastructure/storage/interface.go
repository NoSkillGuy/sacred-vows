package storage

import (
	"context"
	"io"
	"time"
)

// Storage defines the interface for file storage operations
type Storage interface {
	SaveFile(filename string, originalName string, mimeType string, size int64, reader io.Reader) (*UploadedFile, error)
	DeleteFile(filename string) error
	ValidateFile(mimeType string, size int64) error
}

// SignedURLStorage extends Storage with signed URL generation
type SignedURLStorage interface {
	Storage
	GenerateSignedURL(ctx context.Context, objectName string, method string, expiresIn time.Duration) (string, error)
}
