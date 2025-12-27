import EditableText from "../shared/EditableText";

/**
 * EditableEditorialQuote - Editable quote text
 */
function EditableEditorialQuote({ _translations, _currentLang, config = {}, onUpdate }) {
  const quote = config.quote || {};
  const text = quote.text || "Together is our favorite place to be";
  const attribution = quote.attribution || "";

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
        />
      </div>
    </section>
  );
}

export default EditableEditorialQuote;
