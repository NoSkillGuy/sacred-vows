import EditableText from "../shared/EditableText";

interface EditableRegistryProps {
  _translations?: unknown;
  _currentLang?: string;
  config?: {
    registry?: {
      introText?: string;
      links?: Array<{
        label?: string;
        url?: string;
      }>;
    };
  };
  onUpdate?: (path: string, value: unknown) => void;
}

/**
 * EditableRegistry - Registry links editor with soft copy
 */
function EditableRegistry({
  _translations,
  _currentLang,
  config = {},
  onUpdate,
}: EditableRegistryProps) {
  const registry = config.registry || {};
  const introText = registry.introText || "Your presence is our present";
  const links = registry.links || [];

  const handleAddLink = () => {
    const newLinks = [...links, { label: "", url: "" }];
    if (onUpdate) {
      onUpdate("registry.links", newLinks);
    }
  };

  const handleUpdateLink = (index: number, field: string, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    if (onUpdate) {
      onUpdate("registry.links", updated);
    }
  };

  return (
    <section className="ee-section ee-registry-section">
      <div className="ee-registry-container">
        <h2 className="ee-section-heading">Registry</h2>
        <div className="ee-divider" />

        {/* Soft Copy */}
        <EditableText
          value={introText}
          onUpdate={onUpdate}
          path="registry.introText"
          className="ee-registry-intro"
          tag="p"
          multiline={true}
        />

        {/* Minimal Links */}
        <div className="ee-registry-links">
          {links.map((link, index) => (
            <div key={index} className="ee-registry-link-item">
              <EditableText
                value={link.label || ""}
                onUpdate={(path, value) => handleUpdateLink(index, "label", value)}
                className="ee-registry-link-label"
                tag="span"
              />
              <EditableText
                value={link.url || ""}
                onUpdate={(path, value) => handleUpdateLink(index, "url", value)}
                className="ee-registry-link-url"
                tag="span"
              />
            </div>
          ))}
          <button onClick={handleAddLink} className="ee-add-button" type="button">
            + Add Registry Link
          </button>
        </div>
      </div>
    </section>
  );
}

export default EditableRegistry;
