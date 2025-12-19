package storage

import (
	"context"
	"errors"
	"fmt"
	"io"
	"mime"
	"strings"
	"time"

	"cloud.google.com/go/storage"
)

type GCSStorage struct {
	client        *storage.Client
	bucketName    string
	publicBaseURL string
	maxFileSize   int64
	allowedTypes  []string
}

func NewGCSStorage(ctx context.Context, bucketName, publicBaseURL string, maxFileSize int64, allowedTypes []string) (*GCSStorage, error) {
	// Use default credentials (works with Cloud Run service account)
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCS client: %w", err)
	}

	return &GCSStorage{
		client:        client,
		bucketName:    bucketName,
		publicBaseURL: publicBaseURL,
		maxFileSize:   maxFileSize,
		allowedTypes:  allowedTypes,
	}, nil
}

func (s *GCSStorage) SaveFile(filename string, originalName string, mimeType string, size int64, reader io.Reader) (*UploadedFile, error) {
	// Validate file size
	if size > s.maxFileSize {
		return nil, errors.New("file size exceeds limit")
	}

	// Validate file type
	if !s.isAllowedType(mimeType) {
		return nil, errors.New("file type not allowed")
	}

	ctx := context.Background()
	bucket := s.client.Bucket(s.bucketName)
	obj := bucket.Object(filename)

	writer := obj.NewWriter(ctx)
	writer.ContentType = mimeType
	writer.CacheControl = "public, max-age=31536000" // 1 year cache

	if _, err := io.Copy(writer, reader); err != nil {
		writer.Close()
		return nil, fmt.Errorf("failed to write to GCS: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("failed to close GCS writer: %w", err)
	}

	url := s.publicBaseURL + "/" + filename
	if s.publicBaseURL == "" {
		url = fmt.Sprintf("https://storage.googleapis.com/%s/%s", s.bucketName, filename)
	}

	return &UploadedFile{
		Filename:     filename,
		OriginalName: originalName,
		Size:         size,
		MimeType:     mimeType,
		Path:         url, // Store public URL as path
	}, nil
}

func (s *GCSStorage) DeleteFile(filename string) error {
	ctx := context.Background()
	bucket := s.client.Bucket(s.bucketName)
	obj := bucket.Object(filename)
	return obj.Delete(ctx)
}

func (s *GCSStorage) GenerateSignedURL(ctx context.Context, objectName string, method string, expiresIn time.Duration) (string, error) {
	opts := &storage.SignedURLOptions{
		Method:  method,
		Expires: time.Now().Add(expiresIn),
	}

	url, err := storage.SignedURL(s.bucketName, objectName, opts)
	if err != nil {
		return "", fmt.Errorf("failed to generate signed URL: %w", err)
	}

	return url, nil
}

func (s *GCSStorage) isAllowedType(mimeType string) bool {
	for _, allowedType := range s.allowedTypes {
		if mimeType == allowedType {
			return true
		}
		// Check for wildcard types like image/*
		if strings.HasSuffix(allowedType, "/*") {
			baseType := strings.TrimSuffix(allowedType, "/*")
			parsedType, _, _ := mime.ParseMediaType(mimeType)
			if strings.HasPrefix(parsedType, baseType+"/") {
				return true
			}
		}
	}
	return false
}

func (s *GCSStorage) ValidateFile(mimeType string, size int64) error {
	if size > s.maxFileSize {
		return errors.New("file size exceeds limit")
	}

	if !s.isAllowedType(mimeType) {
		return errors.New("file type not allowed")
	}

	return nil
}

func (s *GCSStorage) Close() error {
	return s.client.Close()
}
