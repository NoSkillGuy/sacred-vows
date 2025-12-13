package storage

import (
	"errors"
	"fmt"
	"io"
	"mime"
	"os"
	"path/filepath"
	"strings"
)

type FileStorage struct {
	uploadPath   string
	maxFileSize  int64
	allowedTypes []string
}

func NewFileStorage(uploadPath string, maxFileSize int64, allowedTypes []string) (*FileStorage, error) {
	// Create upload directory if it doesn't exist
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	return &FileStorage{
		uploadPath:   uploadPath,
		maxFileSize:  maxFileSize,
		allowedTypes: allowedTypes,
	}, nil
}

type UploadedFile struct {
	Filename     string
	OriginalName string
	Size         int64
	MimeType     string
	Path         string
}

func (s *FileStorage) SaveFile(filename string, originalName string, mimeType string, size int64, reader io.Reader) (*UploadedFile, error) {
	// Validate file size
	if size > s.maxFileSize {
		return nil, errors.New("file size exceeds limit")
	}

	// Validate file type
	if !s.isAllowedType(mimeType) {
		return nil, errors.New("file type not allowed")
	}

	// Create full path
	fullPath := filepath.Join(s.uploadPath, filename)

	// Create file
	file, err := os.Create(fullPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	// Copy content
	written, err := io.Copy(file, reader)
	if err != nil {
		os.Remove(fullPath)
		return nil, fmt.Errorf("failed to write file: %w", err)
	}

	if written != size {
		os.Remove(fullPath)
		return nil, errors.New("file size mismatch")
	}

	return &UploadedFile{
		Filename:     filename,
		OriginalName: originalName,
		Size:         written,
		MimeType:     mimeType,
		Path:         fullPath,
	}, nil
}

func (s *FileStorage) DeleteFile(filename string) error {
	fullPath := filepath.Join(s.uploadPath, filename)
	return os.Remove(fullPath)
}

func (s *FileStorage) isAllowedType(mimeType string) bool {
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

func (s *FileStorage) ValidateFile(mimeType string, size int64) error {
	if size > s.maxFileSize {
		return errors.New("file size exceeds limit")
	}

	if !s.isAllowedType(mimeType) {
		return errors.New("file type not allowed")
	}

	return nil
}
