import { useState } from "react";
import { useBuilderStore } from "../../store/builderStore";
import "./GalleryModal.css";
import ImageDeletionNotice from "../AssetManager/ImageDeletionNotice";
import { getDefaultAssetUrl } from "../../services/defaultAssetService";

// Generate default images using service (lazy loaded when modal opens)
const getDefaultImages = () => [
  {
    category: "couple",
    images: [
      getDefaultAssetUrl("couple1", "couple", "1.jpeg"),
      getDefaultAssetUrl("couple1", "couple", "2.jpeg"),
      getDefaultAssetUrl("couple1", "couple", "3.jpeg"),
      getDefaultAssetUrl("couple1", "couple", "4.jpeg"),
      getDefaultAssetUrl("couple1", "couple", "5.jpeg"),
      getDefaultAssetUrl("couple1", "couple", "6.jpeg"),
      getDefaultAssetUrl("couple1", "couple", "7.jpeg"),
      getDefaultAssetUrl("couple1", "couple", "8.jpeg"),
    ],
  },
  {
    category: "bride",
    images: [
      getDefaultAssetUrl("couple1", "bride", "1.jpeg"),
      getDefaultAssetUrl("couple1", "bride", "2.jpeg"),
      getDefaultAssetUrl("couple1", "bride", "3.jpeg"),
    ],
  },
  {
    category: "groom",
    images: [
      getDefaultAssetUrl("couple1", "groom", "1.jpeg"),
      getDefaultAssetUrl("couple1", "groom", "2.jpeg"),
    ],
  },
  {
    category: "family",
    images: [
      getDefaultAssetUrl("couple1", "family", "1.jpeg"),
      getDefaultAssetUrl("couple1", "family", "2.jpeg"),
      getDefaultAssetUrl("couple1", "family", "3.jpeg"),
    ],
  },
];

function GalleryModal({ isOpen, onClose }) {
  const { currentInvitation, updateNestedData } = useBuilderStore();
  const gallery = currentInvitation.data.gallery || {};
  const [activeTab, setActiveTab] = useState("manage");
  const [selectedCategory, setSelectedCategory] = useState("couple");
  const [defaultImages] = useState(() => getDefaultImages());

  // Get gallery images from store
  const galleryImages = gallery.images || [];

  const addImage = (imageSrc, category = "couple") => {
    const newImage = {
      src: imageSrc,
      alt: `${category} photo`,
      category: category,
    };
    updateNestedData("gallery", {
      images: [...galleryImages, newImage],
    });
  };

  const removeImage = (index) => {
    const newImages = galleryImages.filter((_, i) => i !== index);
    updateNestedData("gallery", {
      images: newImages,
    });
  };

  const updateImageCategory = (index, category) => {
    const newImages = [...galleryImages];
    newImages[index] = { ...newImages[index], category };
    updateNestedData("gallery", {
      images: newImages,
    });
  };

  const moveImage = (index, direction) => {
    const newImages = [...galleryImages];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newImages.length) return;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    updateNestedData("gallery", {
      images: newImages,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="gallery-modal-overlay" onClick={onClose}>
      <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-modal-header">
          <h3>🖼️ Gallery Manager</h3>
          <button className="gallery-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="gallery-modal-tabs">
          <button
            className={`tab-btn ${activeTab === "manage" ? "active" : ""}`}
            onClick={() => setActiveTab("manage")}
          >
            Current Gallery ({galleryImages.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            Add Photos
          </button>
        </div>

        <div className="gallery-modal-body">
          {activeTab === "manage" ? (
            <div className="gallery-manage">
              {galleryImages.length === 0 ? (
                <div className="gallery-empty">
                  <span className="empty-icon">📷</span>
                  <p>No images in gallery yet</p>
                  <button className="btn btn-primary" onClick={() => setActiveTab("add")}>
                    Add Photos
                  </button>
                </div>
              ) : (
                <div className="gallery-list">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="gallery-list-item">
                      <div className="gallery-item-preview">
                        <img
                          src={image.src}
                          alt={image.alt || `Gallery image ${index + 1}`}
                          onError={(e) => {
                            e.target.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f5f5f5" width="100" height="100"/%3E%3Ctext x="50%" y="50%" fill="%23999" text-anchor="middle" dy=".3em"%3E?%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <div className="gallery-item-info">
                        <select
                          className="category-select"
                          value={image.category || "couple"}
                          onChange={(e) => updateImageCategory(index, e.target.value)}
                        >
                          <option value="couple">Couple</option>
                          <option value="bride">Bride</option>
                          <option value="groom">Groom</option>
                          <option value="family">Family</option>
                        </select>
                      </div>
                      <div className="gallery-item-actions">
                        <button
                          className="action-btn"
                          onClick={() => moveImage(index, "up")}
                          disabled={index === 0}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => moveImage(index, "down")}
                          disabled={index === galleryImages.length - 1}
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          className="action-btn remove"
                          onClick={() => removeImage(index)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="gallery-add">
              <ImageDeletionNotice variant="compact" />
              <div className="category-filter">
                {["couple", "bride", "groom", "family"].map((cat) => (
                  <button
                    key={cat}
                    className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              <div className="available-images">
                {defaultImages
                  .find((c) => c.category === selectedCategory)
                  ?.images.map((imgSrc, index) => {
                    const isAdded = galleryImages.some((img) => img.src === imgSrc);
                    return (
                      <div
                        key={index}
                        className={`available-image ${isAdded ? "added" : ""}`}
                        onClick={() => !isAdded && addImage(imgSrc, selectedCategory)}
                      >
                        <img src={imgSrc} alt={`${selectedCategory} ${index + 1}`} />
                        {isAdded ? (
                          <span className="added-badge">✓ Added</span>
                        ) : (
                          <span className="add-badge">+ Add</span>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="custom-url-section">
                <h4>Or add custom image URL</h4>
                <CustomUrlInput onAdd={(url) => addImage(url, selectedCategory)} />
              </div>
            </div>
          )}
        </div>

        <div className="gallery-modal-footer">
          <div className="footer-info-section">
            <span className="footer-info">
              {galleryImages.length} image{galleryImages.length !== 1 ? "s" : ""} in gallery
            </span>
            {galleryImages.length > 0 && <ImageDeletionNotice variant="compact" />}
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomUrlInput({ onAdd }) {
  const [url, setUrl] = useState("");

  const handleAdd = () => {
    if (url.trim()) {
      onAdd(url.trim());
      setUrl("");
    }
  };

  return (
    <div className="custom-url-input">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/image.jpg"
        onKeyPress={(e) => e.key === "Enter" && handleAdd()}
      />
      <button className="btn btn-secondary" onClick={handleAdd} disabled={!url.trim()}>
        Add
      </button>
    </div>
  );
}

export default GalleryModal;
