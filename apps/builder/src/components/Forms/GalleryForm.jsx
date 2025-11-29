import { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';

function GalleryForm() {
  const { currentInvitation, updateNestedData } = useBuilderStore();
  const gallery = currentInvitation.data.gallery || {};
  const images = gallery.images || [];

  const addImage = () => {
    const newImage = {
      src: '',
      alt: '',
      category: 'couple',
    };
    updateNestedData('gallery', {
      images: [...images, newImage],
    });
  };

  const updateImage = (index, field, value) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    updateNestedData('gallery', {
      images: newImages,
    });
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    updateNestedData('gallery', {
      images: newImages,
    });
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">Gallery</h3>
      
      {images.map((image, index) => (
        <div key={index} className="gallery-item-form" style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="text"
              className="form-input"
              value={image.src || ''}
              onChange={(e) => updateImage(index, 'src', e.target.value)}
              placeholder="/assets/photos/couple/1.jpeg"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alt Text</label>
            <input
              type="text"
              className="form-input"
              value={image.alt || ''}
              onChange={(e) => updateImage(index, 'alt', e.target.value)}
              placeholder="Description of the image"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={image.category || 'couple'}
              onChange={(e) => updateImage(index, 'category', e.target.value)}
            >
              <option value="couple">Couple</option>
              <option value="bride">Bride</option>
              <option value="groom">Groom</option>
              <option value="family">Family</option>
            </select>
          </div>

          {image.src && (
            <div className="form-group">
              <img
                src={image.src}
                alt={image.alt || 'Preview'}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', marginTop: '8px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => removeImage(index)}
          >
            Remove Image
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-primary"
        onClick={addImage}
      >
        Add Image
      </button>
    </div>
  );
}

export default GalleryForm;

