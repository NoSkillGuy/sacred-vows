import EditableText from "../shared/EditableText";

/**
 * EditableFathersLetterSection - WYSIWYG editable version of Father's Letter section
 */
function EditableFathersLetterSection({ translations, currentLang, config = {}, onUpdate }) {
  const storedName = localStorage.getItem("wedding-guest-name");
  const storedTitle = localStorage.getItem("wedding-guest-title") || "";
  const fallbackName =
    currentLang === "hi"
      ? "परिवार सदस्य और आदरणीय अतिथि"
      : currentLang === "te"
        ? "కుటుంబ సభ్యుడు మరియు గౌరవనీయ అతిథి"
        : "family member and respected guest";

  let displayName = (storedName && storedName.trim()) || fallbackName;
  if (storedName && storedName.trim() && storedTitle.trim()) {
    displayName = `${storedTitle.trim()} ${storedName.trim()}`;
  }

  // Get custom translations - handle nested paths
  const getTranslation = (key) => {
    let customValue = null;
    if (config?.customTranslations) {
      const keys = key.split(".");
      let current = config.customTranslations;
      for (const k of keys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          current = null;
          break;
        }
      }
      customValue = current || null;
    }
    return customValue || translations[key] || "";
  };

  const bodyText = (getTranslation("father.body") || "").replace("{name}", displayName);

  return (
    <section id="fathers-letter">
      <div className="section-header">
        <EditableText
          value={getTranslation("father.eyebrow") || "From Priya's Father"}
          onUpdate={onUpdate}
          path="customTranslations.father.eyebrow"
          className="section-eyebrow"
          tag="div"
        />
        <EditableText
          value={getTranslation("father.title") || "A Few Words From the Heart"}
          onUpdate={onUpdate}
          path="customTranslations.father.title"
          className="section-title"
          tag="div"
        />
      </div>

      <div className="card">
        <div className="card-inner">
          <EditableText
            value={
              bodyText ||
              `Dear ${displayName},\n\nIt is with immense joy and gratitude that I extend this invitation to you...`
            }
            onUpdate={onUpdate}
            path="customTranslations.father.body"
            className="muted"
            tag="p"
            multiline={true}
            style={{ whiteSpace: "pre-line" }}
          />
        </div>
      </div>
    </section>
  );
}

export default EditableFathersLetterSection;
