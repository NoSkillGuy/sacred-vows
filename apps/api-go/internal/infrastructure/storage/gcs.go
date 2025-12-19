package storage

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"google.golang.org/api/iam/v1"
	"google.golang.org/api/option"
)

type GCSStorage struct {
	client       *storage.Client
	bucketName   string
	maxFileSize  int64
	allowedTypes []string
}

func NewGCSStorage(ctx context.Context, bucketName, publicBaseURL string, maxFileSize int64, allowedTypes []string) (*GCSStorage, error) {
	// Use default credentials (works with Cloud Run service account)
	// publicBaseURL parameter is ignored - we use signed URLs for private access
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCS client: %w", err)
	}

	return &GCSStorage{
		client:       client,
		bucketName:   bucketName,
		maxFileSize:  maxFileSize,
		allowedTypes: allowedTypes,
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
	writer.CacheControl = "private, max-age=31536000" // 1 year cache, but private (not publicly accessible)

	// Ensure object is private (no public access)
	// With uniform_bucket_level_access=true, objects are private by default
	// We don't set ACL, which means the object inherits bucket-level permissions (private)

	if _, err := io.Copy(writer, reader); err != nil {
		writer.Close()
		return nil, fmt.Errorf("failed to write to GCS: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("failed to close GCS writer: %w", err)
	}

	// Return the object key (filename) as the path, not a public URL
	// Signed URLs will be generated when assets are retrieved
	return &UploadedFile{
		Filename:     filename,
		OriginalName: originalName,
		Size:         size,
		MimeType:     mimeType,
		Path:         filename, // Store object key, not a public URL
	}, nil
}

func (s *GCSStorage) DeleteFile(filename string) error {
	ctx := context.Background()
	bucket := s.client.Bucket(s.bucketName)
	obj := bucket.Object(filename)
	return obj.Delete(ctx)
}

func (s *GCSStorage) GenerateSignedURL(ctx context.Context, objectName string, method string, expiresIn time.Duration) (string, error) {
	// Generate signed URL for private GCS object access
	// Uses the service account credentials from the storage client
	// For Cloud Run, we use the default credentials which include the service account

	// Get the service account email from GCP metadata service
	// This works on Cloud Run where metadata service is available
	httpClient := &http.Client{
		Timeout: 5 * time.Second,
	}
	req, err := http.NewRequest("GET", "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email", nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Metadata-Flavor", "Google")

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to get service account email: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to get service account email: status %d", resp.StatusCode)
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read service account email: %w", err)
	}
	serviceAccountEmail := strings.TrimSpace(string(bodyBytes))

	// Create IAM service client with default credentials
	iamService, err := iam.NewService(ctx, option.WithScopes(iam.CloudPlatformScope))
	if err != nil {
		return "", fmt.Errorf("failed to create IAM service: %w", err)
	}

	// Use storage.SignedURL with GoogleSignBytes that uses IAM SignBlob
	opts := &storage.SignedURLOptions{
		Method:         method,
		Expires:        time.Now().Add(expiresIn),
		GoogleAccessID: serviceAccountEmail,
		SignBytes: func(b []byte) ([]byte, error) {
			// Use IAM SignBlob API to sign the bytes
			name := fmt.Sprintf("projects/-/serviceAccounts/%s", serviceAccountEmail)
			signBlobCall := iamService.Projects.ServiceAccounts.SignBlob(name, &iam.SignBlobRequest{
				BytesToSign: base64.StdEncoding.EncodeToString(b),
			})

			signBlobResp, err := signBlobCall.Do()
			if err != nil {
				return nil, fmt.Errorf("failed to sign blob: %w", err)
			}

			// Decode the base64 signature
			signature, err := base64.StdEncoding.DecodeString(signBlobResp.Signature)
			if err != nil {
				return nil, fmt.Errorf("failed to decode signature: %w", err)
			}

			return signature, nil
		},
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
