package storage

import (
	"bytes"
	"image"
	"image/jpeg"
	"image/png"
	"io"
)

// Note: WebP support requires golang.org/x/image/webp
// Resize support requires golang.org/x/image/draw
// These are optional - if not available, images will be processed without resizing/webp support

// ImageProcessor handles image resizing and compression
type ImageProcessor struct {
	maxWidth  int
	maxHeight int
	quality   int
}

// NewImageProcessor creates a new image processor
func NewImageProcessor(maxWidth, maxHeight, quality int) *ImageProcessor {
	return &ImageProcessor{
		maxWidth:  maxWidth,
		maxHeight: maxHeight,
		quality:   quality,
	}
}

// ProcessImage resizes and compresses an image
// Returns processed image data, new size, and error
func (p *ImageProcessor) ProcessImage(reader io.Reader, mimeType string, originalSize int64) (io.Reader, int64, error) {
	// Decode image
	var img image.Image
	var err error

	switch mimeType {
	case "image/jpeg", "image/jpg":
		img, err = jpeg.Decode(reader)
	case "image/png":
		img, err = png.Decode(reader)
	case "image/webp":
		// WebP decoding requires golang.org/x/image/webp
		// For now, return original if webp decoding fails
		return reader, originalSize, nil
	default:
		// For unsupported types, return original
		return reader, originalSize, nil
	}

	if err != nil {
		return nil, 0, err
	}

	// Resize if needed
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	if (p.maxWidth > 0 && width > p.maxWidth) || (p.maxHeight > 0 && height > p.maxHeight) {
		// Resize requires golang.org/x/image/draw
		// For now, skip resizing if dimensions exceed limits but library not available
		// TODO: Add resize support when golang.org/x/image/draw is available
		// For now, we'll just compress without resizing
	}

	// Encode image
	var buf bytes.Buffer
	switch mimeType {
	case "image/jpeg", "image/jpg":
		err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: p.quality})
	case "image/png":
		encoder := &png.Encoder{CompressionLevel: png.BestCompression}
		err = encoder.Encode(&buf, img)
	case "image/webp":
		// WebP encoding requires golang.org/x/image/webp
		// For now, return original
		// TODO: Add webp encoding support when library is available
		return reader, originalSize, nil
	default:
		return reader, originalSize, nil
	}

	if err != nil {
		return nil, 0, err
	}

	return bytes.NewReader(buf.Bytes()), int64(buf.Len()), nil
}

// calculateDimensions calculates new dimensions maintaining aspect ratio
func calculateDimensions(width, height, maxWidth, maxHeight int) (int, int) {
	if maxWidth <= 0 && maxHeight <= 0 {
		return width, height
	}

	aspectRatio := float64(width) / float64(height)

	var newWidth, newHeight int

	if maxWidth > 0 && maxHeight > 0 {
		// Both constraints - choose the one that results in smaller image
		widthRatio := float64(maxWidth) / float64(width)
		heightRatio := float64(maxHeight) / float64(height)
		ratio := widthRatio
		if heightRatio < widthRatio {
			ratio = heightRatio
		}
		newWidth = int(float64(width) * ratio)
		newHeight = int(float64(height) * ratio)
	} else if maxWidth > 0 {
		// Only width constraint
		newWidth = maxWidth
		newHeight = int(float64(maxWidth) / aspectRatio)
	} else {
		// Only height constraint
		newHeight = maxHeight
		newWidth = int(float64(maxHeight) * aspectRatio)
	}

	return newWidth, newHeight
}
