/**
 * EditorialGallery - Masonry or single-column layout
 * 8-12 large images, no captions, lazy loading
 */
import { getDefaultAssetUrl } from "@shared/utils/assetService";

function EditorialGallery({ _translations, _currentLang, config = {} }) {
  const gallery = config.gallery || {};
  const galleryConfig = config.galleryConfig || {};
  const layout = galleryConfig.layout || "masonry"; // 'masonry' | 'single-column'
  const maxImages = galleryConfig.maxImages || 12;

  // Default gallery images from couple2 (fallback only, normally comes from defaults.js)
  const defaultImages = [
    {
      src: getDefaultAssetUrl("couple2", "couple", "1.jpeg"),
      alt: "Couple photo 1",
      category: "couple",
    },
    {
      src: getDefaultAssetUrl("couple2", "couple", "2.jpeg"),
      alt: "Couple photo 2",
      category: "couple",
    },
    {
      src: getDefaultAssetUrl("couple2", "couple", "3.jpeg"),
      alt: "Couple photo 3",
      category: "couple",
    },
    {
      src: getDefaultAssetUrl("couple2", "couple", "4.jpeg"),
      alt: "Couple photo 4",
      category: "couple",
    },
    {
      src: getDefaultAssetUrl("couple2", "couple", "5.jpeg"),
      alt: "Couple photo 5",
      category: "couple",
    },
    {
      src: getDefaultAssetUrl("couple2", "couple", "6.jpeg"),
      alt: "Couple photo 6",
      category: "couple",
    },
  ];

  const galleryImages = (
    gallery.images && gallery.images.length > 0 ? gallery.images : defaultImages
  ).slice(0, maxImages);

  return (
    <section className="ee-section ee-gallery-section">
      <div className={`ee-gallery-container ee-gallery-${layout}`}>
        {galleryImages.map((img, index) => (
          <div key={index} className="ee-gallery-item">
            <img
              src={img.src}
              alt={img.alt || `Gallery image ${index + 1}`}
              className="ee-gallery-image"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default EditorialGallery;
