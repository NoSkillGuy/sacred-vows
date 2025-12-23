import EditableText from '../shared/EditableText';
import EditableImage from '../shared/EditableImage';
import { getDefaultAssetUrl } from '../../../../services/defaultAssetService';

/**
 * EditableGallerySection - WYSIWYG editable version of Gallery section
 */
function EditableGallerySection({ translations, currentLang, config = {}, onUpdate }) {
  const gallery = config.gallery || {};
  const galleryImages = gallery.images || [
    { src: getDefaultAssetUrl('couple1', 'couple', '21.jpeg'), alt: 'Couple photo 1' },
    { src: getDefaultAssetUrl('couple1', 'family', '22.jpeg'), alt: 'Couple photo 2 (portrait)' },
    { src: getDefaultAssetUrl('couple1', 'couple', '23.jpeg'), alt: 'Friends and candid moment' },
    { src: getDefaultAssetUrl('couple1', 'couple', '24.jpeg'), alt: 'Traditional attire' },
    { src: getDefaultAssetUrl('couple1', 'couple', '25.jpeg'), alt: 'Favourite memory together' },
    { src: getDefaultAssetUrl('couple1', 'couple', '26.jpeg'), alt: 'Special capture' }
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


