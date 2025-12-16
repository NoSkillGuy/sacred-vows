import EditableText from '../shared/EditableText';
import EditableImage from '../shared/EditableImage';

/**
 * EditableCoupleSection - WYSIWYG editable version of Couple section
 */
function EditableCoupleSection({ translations, currentLang, config = {}, onUpdate }) {
  const couple = config.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  
  const brideName = bride.name || 'Capt (Dr) Priya Singh';
  const brideMother = bride.parents?.mother || 'Mrs. Geeta Singh';
  const brideFather = bride.parents?.father || 'Mr. Sanjay Kumar Singh';
  const brideImage = bride.image || '/assets/photos/couple1/bride/1.jpeg';
  
  const groomName = groom.name || 'Dr Saurabh Singh';
  const groomMother = groom.parents?.mother || 'Mrs. Vibha Singh';
  const groomFather = groom.parents?.father || 'Mr. Ashok Kumar Singh';
  const groomImage = groom.image || '/assets/photos/couple1/groom/1.jpeg';

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

  const togetherText = getTranslation('couple.together') || 
    `Together, ${brideName} and ${groomName} look forward to beginning this beautiful journey with your blessings and presence.`;

  return (
    <section id="couple">
      <div className="section-header">
        <EditableText
          value={getTranslation('couple.eyebrow') || 'Couple & Families'}
          onUpdate={onUpdate}
          path="customTranslations.couple.eyebrow"
          className="section-eyebrow"
          tag="div"
        />
        <EditableText
          value={getTranslation('couple.title') || 'In Honoured Union'}
          onUpdate={onUpdate}
          path="customTranslations.couple.title"
          className="section-title"
          tag="div"
        />
        <EditableText
          value={getTranslation('couple.subtitle') || 'With immense joy, the families invite you to join them in celebrating the union of their children.'}
          onUpdate={onUpdate}
          path="customTranslations.couple.subtitle"
          className="section-subtitle"
          tag="div"
          multiline={true}
        />
      </div>

      <div className="card">
        <div className="card-inner">
          <EditableText
            value={togetherText}
            onUpdate={onUpdate}
            path="customTranslations.couple.together"
            className="muted"
            tag="p"
            multiline={true}
            style={{ marginBottom: '20px', textAlign: 'center' }}
          />
          
          <div className="couple-grid">
            {/* Bride Section */}
            <div>
              <EditableText
                value={getTranslation('couple.bride') || 'The Bride'}
                onUpdate={onUpdate}
                path="customTranslations.couple.bride"
                className="headline"
                tag="h3"
              />
              <p className="muted">
                <EditableText
                  value={brideName}
                  onUpdate={onUpdate}
                  path="couple.bride.name"
                  tag="strong"
                />
                <br />
                <span className="relation-label">{getTranslation('couple.daughter') || 'Daughter of'}</span>{' '}
                <EditableText
                  value={brideMother}
                  onUpdate={onUpdate}
                  path="couple.bride.parents.mother"
                  tag="strong"
                />
                {' & '}
                <EditableText
                  value={brideFather}
                  onUpdate={onUpdate}
                  path="couple.bride.parents.father"
                  tag="strong"
                />.
              </p>

              <div className="person-block">
                <div className="person-role">{getTranslation('couple.mother') || 'Mother'}</div>
                <EditableText
                  value={brideMother}
                  onUpdate={onUpdate}
                  path="couple.bride.parents.mother"
                  className="person-name"
                  tag="div"
                />
              </div>
              <div className="person-block">
                <div className="person-role">{getTranslation('couple.father') || 'Father'}</div>
                <EditableText
                  value={brideFather}
                  onUpdate={onUpdate}
                  path="couple.bride.parents.father"
                  className="person-name"
                  tag="div"
                />
              </div>

              <div className="portrait-frame">
                <div className="portrait-inner">
                  <EditableImage
                    src={brideImage}
                    alt={`Bride - ${brideName}`}
                    onUpdate={onUpdate}
                    path="couple.bride.image"
                  />
                </div>
              </div>
            </div>

            {/* Groom Section */}
            <div>
              <EditableText
                value={getTranslation('couple.groom') || 'The Groom'}
                onUpdate={onUpdate}
                path="customTranslations.couple.groom"
                className="headline"
                tag="h3"
              />
              <p className="muted">
                <EditableText
                  value={groomName}
                  onUpdate={onUpdate}
                  path="couple.groom.name"
                  tag="strong"
                />
                <br />
                <span className="relation-label">{getTranslation('couple.son') || 'Son of'}</span>{' '}
                <EditableText
                  value={groomMother}
                  onUpdate={onUpdate}
                  path="couple.groom.parents.mother"
                  tag="strong"
                />
                {' & '}
                <EditableText
                  value={groomFather}
                  onUpdate={onUpdate}
                  path="couple.groom.parents.father"
                  tag="strong"
                />.
              </p>

              <div className="person-block">
                <div className="person-role">{getTranslation('couple.mother') || 'Mother'}</div>
                <EditableText
                  value={groomMother}
                  onUpdate={onUpdate}
                  path="couple.groom.parents.mother"
                  className="person-name"
                  tag="div"
                />
              </div>
              <div className="person-block">
                <div className="person-role">{getTranslation('couple.father') || 'Father'}</div>
                <EditableText
                  value={groomFather}
                  onUpdate={onUpdate}
                  path="couple.groom.parents.father"
                  className="person-name"
                  tag="div"
                />
              </div>

              <div className="portrait-frame">
                <div className="portrait-inner">
                  <EditableImage
                    src={groomImage}
                    alt={`Groom - ${groomName}`}
                    onUpdate={onUpdate}
                    path="couple.groom.image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditableCoupleSection;


