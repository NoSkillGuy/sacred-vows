/**
 * LoveStory - Two-column magazine layout with drop caps, pull quotes, timeline chapters
 * The feature article of the layout
 */
function LoveStory({ _translations, _currentLang, config = {} }) {
  const story = config.story || {};
  const chapters = story.chapters || [];
  const pullQuotes = story.pullQuotes || [];
  const mainText = story.text || "";

  return (
    <section className="ee-section ee-story-section">
      <div className="ee-story-container">
        <h2 className="ee-section-heading">Our Story</h2>
        <div className="ee-divider" />

        {/* Main Story Text with Drop Cap */}
        {mainText && (
          <div className="ee-story-main">
            <p className="ee-story-text ee-drop-cap">{mainText}</p>
          </div>
        )}

        {/* Timeline Chapters */}
        {chapters.length > 0 && (
          <div className="ee-story-chapters">
            {chapters.map((chapter, index) => (
              <div key={index} className="ee-story-chapter">
                <h3 className="ee-story-chapter-title">
                  {chapter.title || `Chapter ${index + 1}`}
                </h3>
                {chapter.text && <p className="ee-story-chapter-text">{chapter.text}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Pull Quotes */}
        {pullQuotes.length > 0 && (
          <div className="ee-story-pull-quotes">
            {pullQuotes.map((quote, index) => (
              <blockquote key={index} className="ee-pull-quote">
                {quote.text}
                {quote.attribution && (
                  <cite className="ee-pull-quote-attribution">— {quote.attribution}</cite>
                )}
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default LoveStory;
