package storage

import (
	"context"
	"errors"
	"fmt"
	"io"
	"mime"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// S3Storage implements Storage and SignedURLStorage using S3-compatible storage (MinIO, R2, etc.)
type S3Storage struct {
	client         *s3.Client
	presignClient  *s3.PresignClient // Separate client for presigned URLs with public endpoint
	bucketName     string
	maxFileSize    int64
	allowedTypes   []string
}

type S3Config struct {
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	Endpoint        string // Internal endpoint for API access (e.g., "http://minio:9000")
	PublicEndpoint  string // Public endpoint for presigned URLs (e.g., "http://localhost:9000")
	Region          string // Default: "auto" for R2, "us-east-1" for MinIO
}

// NewS3Storage creates a new S3-compatible storage instance
func NewS3Storage(ctx context.Context, cfg S3Config, maxFileSize int64, allowedTypes []string) (*S3Storage, error) {
	if cfg.AccessKeyID == "" || cfg.SecretAccessKey == "" || cfg.Bucket == "" {
		return nil, fmt.Errorf("S3 config missing: require access key, secret key, and bucket")
	}

	if cfg.Endpoint == "" {
		return nil, fmt.Errorf("S3 endpoint is required (e.g., http://minio:9000 for MinIO)")
	}

	region := cfg.Region
	if region == "" {
		region = "us-east-1" // Default for MinIO
	}

	awsCfg, err := config.LoadDefaultConfig(
		ctx,
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, "")),
		config.WithRegion(region),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(cfg.Endpoint)
		o.UsePathStyle = true // Required for MinIO
	})

	// Create a separate presign client with public endpoint for browser-accessible URLs
	// If PublicEndpoint is not set, use the internal endpoint
	publicEndpoint := cfg.PublicEndpoint
	if publicEndpoint == "" {
		publicEndpoint = cfg.Endpoint
	}

	presignClient := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(publicEndpoint)
		o.UsePathStyle = true // Required for MinIO
	})

	return &S3Storage{
		client:        client,
		presignClient: s3.NewPresignClient(presignClient),
		bucketName:    cfg.Bucket,
		maxFileSize:   maxFileSize,
		allowedTypes:  allowedTypes,
	}, nil
}

func (s *S3Storage) SaveFile(filename string, originalName string, mimeType string, size int64, reader io.Reader) (*UploadedFile, error) {
	// Validate file size
	if size > s.maxFileSize {
		return nil, errors.New("file size exceeds limit")
	}

	// Validate file type
	if !s.isAllowedType(mimeType) {
		return nil, errors.New("file type not allowed")
	}

	ctx := context.Background()

	// Ensure bucket exists (create if it doesn't)
	_, err := s.client.HeadBucket(ctx, &s3.HeadBucketInput{
		Bucket: aws.String(s.bucketName),
	})
	if err != nil {
		// Try to create bucket if it doesn't exist (MinIO allows this)
		_, createErr := s.client.CreateBucket(ctx, &s3.CreateBucketInput{
			Bucket: aws.String(s.bucketName),
		})
		if createErr != nil {
			return nil, fmt.Errorf("failed to access or create bucket: %w", err)
		}
	}

	// Upload file
	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(filename),
		Body:        reader,
		ContentType: aws.String(mimeType),
		// Don't set ACL - keep objects private
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload to S3: %w", err)
	}

	return &UploadedFile{
		Filename:     filename,
		OriginalName: originalName,
		Size:         size,
		MimeType:     mimeType,
		Path:         filename, // Store object key, not a public URL
	}, nil
}

func (s *S3Storage) DeleteFile(filename string) error {
	ctx := context.Background()
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(filename),
	})
	return err
}

func (s *S3Storage) GenerateSignedURL(ctx context.Context, objectName string, method string, expiresIn time.Duration) (string, error) {
	request, err := s.presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(objectName),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = expiresIn
	})

	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return request.URL, nil
}

func (s *S3Storage) isAllowedType(mimeType string) bool {
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

func (s *S3Storage) ValidateFile(mimeType string, size int64) error {
	if size > s.maxFileSize {
		return errors.New("file size exceeds limit")
	}

	if !s.isAllowedType(mimeType) {
		return errors.New("file type not allowed")
	}

	return nil
}

