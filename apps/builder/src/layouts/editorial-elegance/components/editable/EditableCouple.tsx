import EditableText from "../shared/EditableText";
import EditableImage from "../shared/EditableImage";
import { getDefaultAssetUrl } from "../../../../services/defaultAssetService";

/**
 * EditableCouple - WYSIWYG editable Couple section
 */
function EditableCouple({ _translations, _currentLang, config = {}, onUpdate }) {
  const couple = config.couple || {};
  const bride = couple.bride || {
    name: "Bride",
    image: getDefaultAssetUrl("couple2", "bride", "1.jpeg"),
  };
  const groom = couple.groom || {
    name: "Groom",
    image: getDefaultAssetUrl("couple2", "groom", "1.jpeg"),
  };

  // Get parent names - always show the fields, even if empty
  const brideParents = bride.parents || {};
  const groomParents = groom.parents || {};

  const brideMother = brideParents.mother || "";
  const brideFather = brideParents.father || "";
  const groomMother = groomParents.mother || "";
  const groomFather = groomParents.father || "";

  return (
    <section className="ee-section ee-couple-section">
      {/* Section Heading */}
      <div className="ee-section-header">
        <h2 className="ee-section-heading">The Couple</h2>
        <div className="ee-divider" />
      </div>

      {/* Couple Grid */}
      <div className="ee-couple-grid">
        {/* Bride */}
        <div className="ee-couple-member">
          <div className="ee-couple-image-wrapper">
            <EditableImage
              src={bride.image}
              alt={bride.name}
              className="ee-couple-image"
              onUpdate={onUpdate}
              path="couple.bride.image"
            />
          </div>
          <p className="ee-meta-text ee-couple-label">THE BRIDE</p>
          <EditableText
            value={bride.name}
            onUpdate={onUpdate}
            path="couple.bride.name"
            className="ee-couple-name"
            tag="h3"
          />
          <div className="ee-couple-parents">
            <p className="ee-couple-parents-label">Daughter of</p>
            <EditableText
              value={brideMother}
              onUpdate={onUpdate}
              path="couple.bride.parents.mother"
              className="ee-couple-parent-name"
              tag="p"
              placeholder="Mrs. Geeta Singh"
            />
            <EditableText
              value={brideFather}
              onUpdate={onUpdate}
              path="couple.bride.parents.father"
              className="ee-couple-parent-name"
              tag="p"
              placeholder="Mr. Sanjay Singh"
            />
          </div>
        </div>

        {/* Groom */}
        <div className="ee-couple-member">
          <div className="ee-couple-image-wrapper">
            <EditableImage
              src={groom.image}
              alt={groom.name}
              className="ee-couple-image"
              onUpdate={onUpdate}
              path="couple.groom.image"
            />
          </div>
          <p className="ee-meta-text ee-couple-label">THE GROOM</p>
          <EditableText
            value={groom.name}
            onUpdate={onUpdate}
            path="couple.groom.name"
            className="ee-couple-name"
            tag="h3"
          />
          <div className="ee-couple-parents">
            <p className="ee-couple-parents-label">Son of</p>
            <EditableText
              value={groomMother}
              onUpdate={onUpdate}
              path="couple.groom.parents.mother"
              className="ee-couple-parent-name"
              tag="p"
              placeholder="Mrs. Rayapudi Lakshmi"
            />
            <EditableText
              value={groomFather}
              onUpdate={onUpdate}
              path="couple.groom.parents.father"
              className="ee-couple-parent-name"
              tag="p"
              placeholder="Mr. Rayapudi Sathi Raju"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditableCouple;
