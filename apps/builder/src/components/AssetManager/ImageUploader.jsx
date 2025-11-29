import { useState, useRef } from 'react';
import './ImageUploader.css';

function ImageUploader({ onUpload, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      // In production, this would upload to Cloudinary/S3
      // For now, we'll create object URLs for preview
      const file = files[0];
      const objectUrl = URL.createObjectURL(file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, this would be the uploaded URL
      const uploadedUrl = objectUrl; // Replace with actual uploaded URL
      
      if (onUploadComplete) {
        onUploadComplete(uploadedUrl, file.name);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`image-uploader ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="file-input"
        disabled={uploading}
      />
      
      <div className="upload-area">
        {uploading ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <p>Uploading...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📤</div>
            <p className="upload-text">
              Drag and drop an image here, or{' '}
              <button
                type="button"
                className="upload-link"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </button>
            </p>
            <p className="upload-hint">Supports JPG, PNG, WebP (Max 10MB)</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;

