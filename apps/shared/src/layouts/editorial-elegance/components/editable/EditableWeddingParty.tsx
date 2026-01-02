import EditableText from "../shared/EditableText";
import EditableImage from "../shared/EditableImage";

/**
 * EditableWeddingParty - WYSIWYG editable Wedding Party
 * Party members only (bridesmaids, groomsmen, etc.)
 */
function EditableWeddingParty({ _translations, _currentLang, config = {}, onUpdate }) {
  const weddingParty = config.weddingParty || {};
  const members = weddingParty.members || [];
  const showBios = weddingParty.showBios || false;
  const filter = weddingParty.filter || "none";

  if (members.length === 0) return null;

  return (
    <section className="ee-section ee-wedding-party-section">
      <div className="ee-section-header">
        <h2 className="ee-section-heading">Wedding Party</h2>
        <div className="ee-divider" />
      </div>

      <div className="ee-party-grid">
        {members.map((member, index) => (
          <div key={index} className="ee-party-member">
            <div className={`ee-party-image-wrapper ee-filter-${filter}`}>
              <EditableImage
                src={member.image}
                alt={member.name}
                className="ee-party-image"
                onUpdate={onUpdate}
                path={`weddingParty.members.${index}.image`}
              />
            </div>
            {member.title && <p className="ee-meta-text ee-party-title">{member.title}</p>}
            <EditableText
              value={member.name}
              onUpdate={onUpdate}
              path={`weddingParty.members.${index}.name`}
              className="ee-party-name"
              tag="h3"
            />
            {showBios && member.bio && (
              <EditableText
                value={member.bio}
                onUpdate={onUpdate}
                path={`weddingParty.members.${index}.bio`}
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
