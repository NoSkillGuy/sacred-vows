import { useState, ReactElement, MouseEvent } from "react";
import "./ImageGallery.css";

interface Image {
  src?: string;
  url?: string;
  alt?: string;
  [key: string]: unknown;
}

interface ImageGalleryProps {
  images?: Image[];
  onSelect?: (image: Image) => void;
  onRemove?: (index: number) => void;
}

function ImageGallery({ images = [], onSelect, onRemove }: ImageGalleryProps): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (image: Image, index: number): void => {
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
              className={`gallery-item ${selectedIndex === index ? "selected" : ""}`}
              onClick={() => handleSelect(image, index)}
            >
              <img
                src={image.src || image.url}
                alt={image.alt || `Image ${index + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {onRemove && (
                <button
                  className="gallery-remove"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
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
