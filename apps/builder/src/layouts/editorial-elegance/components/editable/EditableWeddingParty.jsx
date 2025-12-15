import EditableText from '../shared/EditableText';
import EditableImage from '../shared/EditableImage';

/**
 * EditableWeddingParty - WYSIWYG editable Wedding Party
 */
function EditableWeddingParty({ translations, currentLang, config = {}, onUpdate }) {
  const weddingParty = config.weddingParty || {};
  const bride = weddingParty.bride || config.couple?.bride;
  const groom = weddingParty.groom || config.couple?.groom;
  const members = weddingParty.members || [];
  const showBios = weddingParty.showBios || false;
  const filter = weddingParty.filter || 'none';
  
  if (!bride && !groom) return null;
  
  const allMembers = [
    bride && { ...bride, title: 'THE BRIDE', path: 'couple.bride' },
    groom && { ...groom, title: 'THE GROOM', path: 'couple.groom' },
    ...members.map((m, i) => ({ ...m, path: `weddingParty.members.${i}` })),
  ].filter(Boolean);
  
  return (
    <section className="ee-section ee-wedding-party-section">
      <div className="ee-section-header">
        <h2 className="ee-section-heading">Wedding Party</h2>
        <div className="ee-divider" />
      </div>
      
      <div className="ee-party-grid">
        {allMembers.map((member, index) => (
          <div key={index} className="ee-party-member">
            <div className={`ee-party-image-wrapper ee-filter-${filter}`}>
              <EditableImage
                src={member.image}
                alt={member.name}
                className="ee-party-image"
                onUpdate={onUpdate}
                path={`${member.path}.image`}
              />
            </div>
            <p className="ee-meta-text ee-party-title">{member.title}</p>
            <EditableText
              value={member.name}
              onUpdate={onUpdate}
              path={`${member.path}.name`}
              className="ee-party-name"
              tag="h3"
            />
            {showBios && member.bio && (
              <EditableText
                value={member.bio}
                onUpdate={onUpdate}
                path={`${member.path}.bio`}
                className="ee-party-bio"
                tag="p"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default EditableWeddingParty;

