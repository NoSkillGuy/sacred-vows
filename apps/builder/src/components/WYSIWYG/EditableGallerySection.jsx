import EditableText from './EditableText';
import EditableImage from './EditableImage';

/**
 * EditableGallerySection - WYSIWYG editable version of Gallery section
 */
function EditableGallerySection({ translations, currentLang, config = {}, onUpdate }) {
  const gallery = config.gallery || {};
  const galleryImages = gallery.images || [
    { src: '/assets/photos/couple/2.jpeg', alt: 'Couple photo 1' },
    { src: '/assets/photos/family/3.jpeg', alt: 'Couple photo 2' },
    { src: '/assets/photos/couple/7.jpeg', alt: 'Friends and candid moment' },
    { src: '/assets/photos/couple/3.jpeg', alt: 'Traditional attire' },
    { src: '/assets/photos/couple/1.jpeg', alt: 'Favourite memory together' },
    { src: '/assets/photos/couple/8.jpeg', alt: 'Special capture' }
  ];

  // Get custom translations - handle nested paths
  const getTranslation = (key) => {
    let customValue = null;
    if (config?.customTranslations) {
      const keys = key.split('.');
      let current = config.customTranslations;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          current = null;
          break;
        }
      }
      customValue = current || null;
    }
    return customValue || translations[key] || '';
  };

  return (
    <section id="gallery">
      <div className="section-header">
        <EditableText
          value={getTranslation('gallery.eyebrow') || 'Photo Story'}
          onUpdate={onUpdate}
          path="customTranslations.gallery.eyebrow"
          className="section-eyebrow"
          tag="div"
        />
        <EditableText
          value={getTranslation('gallery.title') || 'Our Journey in Moments'}
          onUpdate={onUpdate}
          path="customTranslations.gallery.title"
          className="section-title"
          tag="div"
        />
        <EditableText
          value={getTranslation('gallery.subtitle') || 'A few glimpses from the memories and moments that bring us here today.'}
          onUpdate={onUpdate}
          path="customTranslations.gallery.subtitle"
          className="section-subtitle"
          tag="div"
          multiline={true}
        />
      </div>

      <div className="card">
        <div className="card-inner">
          <div className="gallery-grid">
            {galleryImages.map((img, index) => (
              <div key={index} className="gallery-item">
                <div className="gallery-inner tall">
                  <EditableImage
                    src={img.src}
                    alt={img.alt}
                    onUpdate={onUpdate}
                    path={`gallery.images.${index}.src`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditableGallerySection;

