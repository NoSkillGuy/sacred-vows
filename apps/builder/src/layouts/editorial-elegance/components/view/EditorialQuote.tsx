/**
 * EditorialQuote - Oversized typography, centered minimal pull quote
 * Magazine-style visual break in content
 */
function EditorialQuote({ _translations, _currentLang, config = {} }) {
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
