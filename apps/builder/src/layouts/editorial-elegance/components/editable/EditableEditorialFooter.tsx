import EditableText from "../shared/EditableText";

/**
 * EditableEditorialFooter - WYSIWYG editable Footer
 */
function EditableEditorialFooter({ translations, currentLang, config = {}, onUpdate }) {
  const couple = config.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};

  const brideName = bride.name || "Bride";
  const groomName = groom.name || "Groom";
  const year = new Date().getFullYear();

  return (
    <footer className="ee-section ee-footer-section">
      <div className="ee-footer-container" style={{ textAlign: "center" }}>
        <h3
          className="ee-section-heading"
          style={{ fontSize: "32px", marginBottom: "var(--ee-space-sm)" }}
        >
          <EditableText value={brideName} onUpdate={onUpdate} path="couple.bride.name" tag="span" />
          {" & "}
          <EditableText value={groomName} onUpdate={onUpdate} path="couple.groom.name" tag="span" />
        </h3>
        <p style={{ color: "var(--ee-color-secondary)", fontSize: "14px" }}>
          With love and gratitude
        </p>
        <div className="ee-divider" style={{ marginTop: "var(--ee-space-md)" }} />
        <p
          style={{
            color: "var(--ee-color-secondary)",
            fontSize: "12px",
            marginTop: "var(--ee-space-sm)",
          }}
        >
          © {year}
        </p>
      </div>
    </footer>
  );
}

export default EditableEditorialFooter;
