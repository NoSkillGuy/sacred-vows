import EditableText from '../shared/EditableText';
import EditableImage from '../shared/EditableImage';

/**
 * EditableEditorialIntro - WYSIWYG editable Editorial Intro
 */
function EditableEditorialIntro({ translations, currentLang, config = {}, onUpdate }) {
  const editorialIntro = config.editorialIntro || {};
  const introText = editorialIntro.text || 
    'Two paths, one story.\nRooted in tradition, bound by love,\nwe invite you to celebrate the beginning of forever.';
  const introImage = editorialIntro.image || '/assets/couple-portrait.jpg';
  const alignment = editorialIntro.alignment || 'right';
  
  return (
    <section className="ee-section ee-editorial-intro-section">
      <div className={`ee-intro-container ee-intro-${alignment}`}>
        <div className="ee-intro-text">
          <EditableText
            value={introText}
            onUpdate={onUpdate}
            path="editorialIntro.text"
            className="ee-editorial-intro"
            tag="p"
            multiline={true}
          />
        </div>
        
        <div className="ee-intro-image-container">
          {introImage && (
            <EditableImage
              src={introImage}
              alt="Couple portrait"
              className="ee-intro-image"
              onUpdate={onUpdate}
              path="editorialIntro.image"
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default EditableEditorialIntro;

