import { useState, useRef } from 'react';
import './EditableImage.css';
import ImageDeletionNotice from '../../../../components/AssetManager/ImageDeletionNotice';

/**
 * EditableImage - WYSIWYG image editing component
 * Allows direct image replacement in the preview
 */
function EditableImage({ 
  src, 
  alt, 
  onUpdate, 
  path, 
  className = '',
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      // Create a local URL for immediate preview
      const localUrl = URL.createObjectURL(file);
      
      // In production, upload to server and get URL
      // For now, use local URL or data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        onUpdate(path, dataUrl);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`editable-image ${isHovered ? 'hovered' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      data-editable="true"
      data-path={path}
      style={{ position: 'relative', width: '100%', height: '100%', display: 'block' }}
    >
      <img 
        src={src} 
        alt={alt} 
        {...props}
        className={isUploading ? 'uploading' : ''}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {isHovered && (
        <div className="editable-image-overlay">
          <div className="editable-image-overlay-content">
            <span className="editable-image-icon">📷</span>
            <span className="editable-image-text">Click to change image</span>
            <ImageDeletionNotice variant="inline" />
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default EditableImage;

