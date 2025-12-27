import EditableText from "../shared/EditableText";

/**
 * EditableLoveStory - WYSIWYG editing for story content, chapters, pull quotes
 */
function EditableLoveStory({ _translations, _currentLang, config = {}, onUpdate }) {
  const story = config.story || {};
  const mainText = story.text || "";
  const chapters = story.chapters || [];
  const pullQuotes = story.pullQuotes || [];

  const handleAddChapter = () => {
    const newChapters = [...chapters, { title: "", text: "" }];
    if (onUpdate) {
      onUpdate("story.chapters", newChapters);
    }
  };

  const handleUpdateChapter = (index, field, value) => {
    const updated = [...chapters];
    updated[index] = { ...updated[index], [field]: value };
    if (onUpdate) {
      onUpdate("story.chapters", updated);
    }
  };

  const handleAddPullQuote = () => {
    const newQuotes = [...pullQuotes, { text: "", attribution: "" }];
    if (onUpdate) {
      onUpdate("story.pullQuotes", newQuotes);
    }
  };

  const handleUpdatePullQuote = (index, field, value) => {
    const updated = [...pullQuotes];
    updated[index] = { ...updated[index], [field]: value };
    if (onUpdate) {
      onUpdate("story.pullQuotes", updated);
    }
  };

  return (
    <section className="ee-section ee-story-section">
      <div className="ee-story-container">
        <h2 className="ee-section-heading">Our Story</h2>
        <div className="ee-divider" />

        {/* Main Story Text with Drop Cap */}
        <div className="ee-story-main">
          <EditableText
            value={mainText}
            onUpdate={onUpdate}
            path="story.text"
            className="ee-story-text ee-drop-cap"
            tag="p"
            multiline={true}
          />
        </div>

        {/* Timeline Chapters */}
        <div className="ee-story-chapters">
          {chapters.map((chapter, index) => (
            <div key={index} className="ee-story-chapter">
              <EditableText
                value={chapter.title || ""}
                onUpdate={(path, value) => handleUpdateChapter(index, "title", value)}
                className="ee-story-chapter-title"
                tag="h3"
              />
              <EditableText
                value={chapter.text || ""}
                onUpdate={(path, value) => handleUpdateChapter(index, "text", value)}
                className="ee-story-chapter-text"
                tag="p"
                multiline={true}
              />
            </div>
          ))}
          <button onClick={handleAddChapter} className="ee-add-button">
            + Add Chapter
          </button>
        </div>

        {/* Pull Quotes */}
        <div className="ee-story-pull-quotes">
          {pullQuotes.map((quote, index) => (
            <blockquote key={index} className="ee-pull-quote">
              <EditableText
                value={quote.text || ""}
                onUpdate={(path, value) => handleUpdatePullQuote(index, "text", value)}
                className="ee-pull-quote-text"
                tag="span"
                multiline={true}
              />
              <EditableText
                value={quote.attribution || ""}
                onUpdate={(path, value) => handleUpdatePullQuote(index, "attribution", value)}
                className="ee-pull-quote-attribution"
                tag="cite"
              />
            </blockquote>
          ))}
          <button onClick={handleAddPullQuote} className="ee-add-button">
            + Add Pull Quote
          </button>
        </div>
      </div>
    </section>
  );
}

export default EditableLoveStory;
