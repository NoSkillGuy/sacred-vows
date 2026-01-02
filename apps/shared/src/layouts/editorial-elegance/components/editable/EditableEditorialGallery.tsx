import EditableImage from "../shared/EditableImage";

/**
 * EditableEditorialGallery - WYSIWYG editable Gallery
 */
function EditableEditorialGallery({ _translations, _currentLang, config = {}, onUpdate }) {
  const gallery = config.gallery || {};
  const galleryConfig = config.galleryConfig || {};
  const layout = galleryConfig.layout || "masonry";
  const maxImages = galleryConfig.maxImages || 12;

  const galleryImages = (gallery.images || []).slice(0, maxImages);

  if (!galleryImages.length) return null;

  return (
    <section className="ee-section ee-gallery-section">
      <div className={`ee-gallery-container ee-gallery-${layout}`}>
        {galleryImages.map((img, index) => (
          <div key={index} className="ee-gallery-item">
            <EditableImage
              src={img.src}
              alt={img.alt || `Gallery image ${index + 1}`}
              className="ee-gallery-image"
              onUpdate={onUpdate}
              path={`gallery.images.${index}.src`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default EditableEditorialGallery;
