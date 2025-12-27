/**
 * EditorialQuote - Oversized typography, centered minimal pull quote
 * Magazine-style visual break in content
 */
function EditorialQuote({ _translations, _currentLang, config = {} }) {
  const quote = config.quote || {};
  const text = quote.text || "Together is our favorite place to be";
  const attribution = quote.attribution || "";

  return (
    <section className="ee-section ee-quote-section">
      <div className="ee-quote-container">
        <blockquote className="ee-quote-text">{text}</blockquote>
        {attribution && <cite className="ee-quote-attribution">— {attribution}</cite>}
      </div>
    </section>
  );
}

export default EditorialQuote;
