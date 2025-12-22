import { useState, useRef } from 'react';
import './ImageUploader.css';
import ImageDeletionNotice from './ImageDeletionNotice';
import { uploadImages } from '../../services/assetService';
import { useToast } from '../Toast/ToastProvider';

function ImageUploader({ onUpload, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [retrying, setRetrying] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return `File "${file.name}" exceeds ${maxSize / 1024 / 1024}MB limit`;
    }
    if (!allowedTypes.includes(file.type)) {
      return `File "${file.name}" is not a supported image type (JPG, PNG, GIF, WebP)`;
    }
    return null;
  };

  const handleFiles = async (files) => {
    // Validate all files first
    const validationErrors = {};
    const validFiles = [];
    
    files.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        validationErrors[index] = error;
        addToast({
          tone: 'error',
          title: 'Validation Error',
          description: error,
          icon: 'bell',
        });
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) {
      setUploadErrors(validationErrors);
      return;
    }

    setUploading(true);
    setUploadErrors({});
    setUploadProgress({});
    setRetrying({});

    try {
      const results = await uploadImages(validFiles, (fileIndex, progress) => {
        setUploadProgress(prev => ({ ...prev, [fileIndex]: progress }));
      });

      // Process results
      const errors = {};
      let successCount = 0;

      results.forEach((result, index) => {
        const originalIndex = files.indexOf(validFiles[index]);
        
        if (result.error) {
          errors[originalIndex] = result.error.message || 'Upload failed';
          addToast({
            tone: 'error',
            title: 'Upload Failed',
            description: `Failed to upload "${validFiles[index].name}": ${result.error.message}`,
            icon: 'bell',
          });
        } else if (result.url) {
          successCount++;
          if (onUploadComplete) {
            onUploadComplete(result.url, validFiles[index].name, result.asset);
          }
        }
      });

      setUploadErrors(errors);

      if (successCount > 0) {
        addToast({
          tone: 'info',
          title: 'Upload Complete',
          description: `Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`,
          icon: 'heart',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast({
        tone: 'error',
        title: 'Upload Error',
        description: error.message || 'Failed to upload images. Please try again.',
        icon: 'bell',
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        multiple
      />
      
      <div className="upload-area">
        {uploading ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <p>Uploading...</p>
            {Object.keys(uploadProgress).length > 0 && (
              <div className="upload-progress-list">
                {Object.entries(uploadProgress).map(([index, progress]) => (
                  <div key={index} className="upload-progress-item">
                    <div className="upload-progress-bar">
                      <div 
                        className="upload-progress-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="upload-progress-text">{Math.round(progress)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="upload-icon">📤</div>
            <p className="upload-text">
              Drag and drop image(s) here, or{' '}
              <button
                type="button"
                className="upload-link"
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </button>
            </p>
            <p className="upload-hint">Supports JPG, PNG, GIF, WebP (Max 10MB each)</p>
            {Object.keys(uploadErrors).length > 0 && (
              <div className="upload-errors">
                {Object.entries(uploadErrors).map(([index, error]) => (
                  <div key={index} className="upload-error">
                    {error}
                  </div>
                ))}
              </div>
            )}
            <ImageDeletionNotice />
          </>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;

