package publishinfra

import (
	"bytes"
	"context"
	"fmt"
	"net/url"
	"regexp"
	"sort"
	"strconv"

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

// ListVersions lists all version numbers for a given subdomain.
// It scans R2 for objects with prefix "sites/{subdomain}/v" and extracts version numbers.
func (s *R2ArtifactStorage) ListVersions(ctx context.Context, subdomain string) ([]int, error) {
	prefix := fmt.Sprintf("sites/%s/v", subdomain)
	versionMap := make(map[int]bool)

	// List all objects with the prefix
	paginator := s3.NewListObjectsV2Paginator(s.client, &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucket),
		Prefix: aws.String(prefix),
	})

	// Regex to extract version number from key like "sites/subdomain/v123/path"
	versionRegex := regexp.MustCompile(`^sites/[^/]+/v(\d+)/`)

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to list objects: %w", err)
		}

		for _, obj := range page.Contents {
			if obj.Key == nil {
				continue
			}
			matches := versionRegex.FindStringSubmatch(*obj.Key)
			if len(matches) >= 2 {
				if version, err := strconv.Atoi(matches[1]); err == nil {
					versionMap[version] = true
				}
			}
		}
	}

	// Convert map to sorted slice
	versions := make([]int, 0, len(versionMap))
	for v := range versionMap {
		versions = append(versions, v)
	}
	sort.Sort(sort.Reverse(sort.IntSlice(versions))) // Sort descending

	return versions, nil
}

// DeleteVersion deletes all artifacts for a specific version of a subdomain.
// It lists all objects with prefix "sites/{subdomain}/v{version}/" and deletes them in batches.
func (s *R2ArtifactStorage) DeleteVersion(ctx context.Context, subdomain string, version int) error {
	prefix := fmt.Sprintf("sites/%s/v%d/", subdomain, version)
	var objectsToDelete []types.ObjectIdentifier

	// List all objects with the version prefix
	paginator := s3.NewListObjectsV2Paginator(s.client, &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucket),
		Prefix: aws.String(prefix),
	})

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return fmt.Errorf("failed to list objects for deletion: %w", err)
		}

		for _, obj := range page.Contents {
			if obj.Key != nil {
				objectsToDelete = append(objectsToDelete, types.ObjectIdentifier{
					Key: obj.Key,
				})
			}
		}
	}

	if len(objectsToDelete) == 0 {
		return nil // Nothing to delete
	}

	// Delete objects in batches (S3/R2 supports up to 1000 objects per batch)
	const batchSize = 1000
	for i := 0; i < len(objectsToDelete); i += batchSize {
		end := i + batchSize
		if end > len(objectsToDelete) {
			end = len(objectsToDelete)
		}

		batch := objectsToDelete[i:end]
		_, err := s.client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
			Bucket: aws.String(s.bucket),
			Delete: &types.Delete{
				Objects: batch,
				Quiet:   aws.Bool(true),
			},
		})
		if err != nil {
			return fmt.Errorf("failed to delete objects batch: %w", err)
		}
	}

	return nil
}


