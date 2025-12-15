/**
 * EditorialGallery - Masonry or single-column layout
 * 8-12 large images, no captions, lazy loading
 */
function EditorialGallery({ translations, currentLang, config = {} }) {
  const gallery = config.gallery || {};
  const galleryConfig = config.galleryConfig || {};
  const layout = galleryConfig.layout || 'masonry'; // 'masonry' | 'single-column'
  const maxImages = galleryConfig.maxImages || 12;
  
  const galleryImages = (gallery.images || []).slice(0, maxImages);
  
  if (!galleryImages.length) return null;
  
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

