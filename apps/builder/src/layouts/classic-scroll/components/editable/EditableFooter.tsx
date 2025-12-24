import EditableText from "../shared/EditableText";

/**
 * EditableFooter - WYSIWYG editable version of Footer
 */
function EditableFooter({ translations, currentLang, config = {}, onUpdate }) {
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

  return (
    <footer className="site-footer">
      <EditableText
        value={getTranslation("footer.compliments") || "With Best Compliments"}
        onUpdate={onUpdate}
        path="customTranslations.footer.compliments"
        className="footer-main"
        tag="div"
      />
      <EditableText
        value={
          getTranslation("footer.families") ||
          "From the families of Capt (Dr) Priya Singh & Dr Saurabh Singh"
        }
        onUpdate={onUpdate}
        path="customTranslations.footer.families"
        className="footer-line"
        tag="div"
      />
      <EditableText
        value={
          getTranslation("footer.flowers") ||
          "Awaiting eyes • Blooming hearts • Cherished invitations, timeless blessings"
        }
        onUpdate={onUpdate}
        path="customTranslations.footer.flowers"
        className="footer-flowers"
        tag="div"
      />
      <EditableText
        value={getTranslation("footer.waiting") || "We look forward to celebrating with you"}
        onUpdate={onUpdate}
        path="customTranslations.footer.waiting"
        className="footer-mini"
        tag="div"
      />
    </footer>
  );
}

export default EditableFooter;
