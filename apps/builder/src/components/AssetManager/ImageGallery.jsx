import { useState } from 'react';
import './ImageGallery.css';

function ImageGallery({ images = [], onSelect, onRemove }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleSelect = (image, index) => {
    setSelectedIndex(index);
    if (onSelect) {
      onSelect(image);
    }
  };

  return (
    <div className="image-gallery">
      {images.length === 0 ? (
        <div className="gallery-empty">
          <p>No images uploaded yet</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {images.map((image, index) => (
            <div
              key={index}
              className={`gallery-item ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => handleSelect(image, index)}
            >
              <img
                src={image.src || image.url}
                alt={image.alt || `Image ${index + 1}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {onRemove && (
                <button
                  className="gallery-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  title="Remove image"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;

