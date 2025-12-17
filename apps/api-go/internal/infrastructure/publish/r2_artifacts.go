package publishinfra

import (
	"bytes"
	"context"
	"fmt"
	"net/url"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// R2ArtifactStorage stores artifacts in Cloudflare R2 via the S3-compatible API.
type R2ArtifactStorage struct {
	client     *s3.Client
	bucket     string
	publicBase string
}

type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicBase      string
}

func NewR2ArtifactStorage(ctx context.Context, cfg R2Config) (*R2ArtifactStorage, error) {
	if cfg.AccountID == "" || cfg.AccessKeyID == "" || cfg.SecretAccessKey == "" || cfg.Bucket == "" {
		return nil, fmt.Errorf("R2 config missing: require R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET")
	}

	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountID)
	_, err := url.Parse(endpoint)
	if err != nil {
		return nil, err
	}

	awsCfg, err := config.LoadDefaultConfig(
		ctx,
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		// R2 expects path-style.
		o.UsePathStyle = true
	})

	return &R2ArtifactStorage{
		client:     client,
		bucket:     cfg.Bucket,
		publicBase: cfg.PublicBase,
	}, nil
}

func (s *R2ArtifactStorage) Put(ctx context.Context, key string, contentType string, cacheControl string, body []byte) error {
	if err := validateArtifactKey(key); err != nil {
		return err
	}
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:       aws.String(s.bucket),
		Key:          aws.String(key),
		Body:         bytes.NewReader(body),
		ContentType:  aws.String(contentType),
		CacheControl: aws.String(cacheControl),
		ACL:          types.ObjectCannedACLPublicRead, // optional; many setups keep bucket private + serve via Worker
	})
	return err
}

func (s *R2ArtifactStorage) PublicURL(key string) string {
	if s.publicBase == "" {
		// In Worker-only mode, callers should not rely on object URLs.
		return ""
	}
	return fmt.Sprintf("%s/%s", s.publicBase, key)
}


