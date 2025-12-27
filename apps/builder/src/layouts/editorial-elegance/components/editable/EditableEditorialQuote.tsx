import { useEffect } from "react";
import EditableText from "../shared/EditableText";

/**
 * EditableEditorialQuote - Editable quote text
 */
function EditableEditorialQuote({ _translations, _currentLang, config = {}, onUpdate }) {
  const quote = config.quote || {};
  const text = quote.text || "Together is our favorite place to be";

  // Get attribution, defaulting to groom's name if not set or if it's "Rumi"
  const couple = config.couple || {};
  const groomName = couple.groom?.name || "";
  let attribution = quote.attribution || "";

  // Replace "Rumi" or "RUMI" with groom's name
  if (!attribution || attribution.toLowerCase() === "rumi" || attribution === "RUMI") {
    attribution = groomName;
  }

  // Update stored data if attribution is "Rumi" or "RUMI"
  useEffect(() => {
    const currentAttribution = quote.attribution || "";
    if (
      currentAttribution &&
      (currentAttribution.toLowerCase() === "rumi" || currentAttribution === "RUMI")
    ) {
      if (groomName && currentAttribution !== groomName) {
        onUpdate("quote.attribution", groomName);
      }
    }
  }, [quote.attribution, groomName, onUpdate]);

  return (
    <section className="ee-section ee-quote-section">
      <div className="ee-quote-container">
        <EditableText
          value={text}
          onUpdate={onUpdate}
          path="quote.text"
          className="ee-quote-text"
          tag="blockquote"
          multiline={true}
        />
        <EditableText
          value={attribution}
          onUpdate={onUpdate}
          path="quote.attribution"
          className="ee-quote-attribution"
          tag="cite"
          placeholder={groomName || "Attribution"}
        />
      </div>
    </section>
  );
}

export default EditableEditorialQuote;
