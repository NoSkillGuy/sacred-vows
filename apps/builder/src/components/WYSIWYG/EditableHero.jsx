import Hero from '../Invitation/Hero';
import EditableText from './EditableText';
import EditableImage from './EditableImage';
import { useEditable } from './useEditable';

/**
 * EditableHero - WYSIWYG version of Hero component
 * Wraps Hero with editable text and image elements
 */
function EditableHero({ config, ...props }) {
  const { handleUpdate } = useEditable();
  const couple = config?.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const heroImage = config?.hero?.mainImage || '/assets/photos/couple/1.jpeg';

  // Create editable config by wrapping editable elements
  const editableConfig = {
    ...config,
    couple: {
      ...couple,
      bride: {
        ...bride,
        name: (
          <EditableText
            value={bride.name}
            onUpdate={handleUpdate}
            path="couple.bride.name"
            className="hero-name-editable"
            tag="span"
          />
        ),
      },
      groom: {
        ...groom,
        name: (
          <EditableText
            value={groom.name}
            onUpdate={handleUpdate}
            path="couple.groom.name"
            className="hero-name-editable"
            tag="span"
          />
        ),
      },
    },
    hero: {
      ...config?.hero,
      mainImage: heroImage, // Will be handled separately
    },
  };

  return (
    <div className="editable-hero-wrapper">
      <Hero config={editableConfig} {...props} />
      {/* Overlay editable image on top */}
      <div className="editable-hero-image-overlay">
        <EditableImage
          src={heroImage}
          alt={`${bride.name || 'Bride'} & ${groom.name || 'Groom'}`}
          onUpdate={handleUpdate}
          path="hero.mainImage"
          className="hero-main-image"
        />
      </div>
    </div>
  );
}

export default EditableHero;

