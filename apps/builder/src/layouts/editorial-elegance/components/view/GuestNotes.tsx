/**
 * GuestNotes - Polaroid-style guest messages, minimal moderation
 * Intimate, handwritten, and human
 */
function GuestNotes({ _translations, _currentLang, config = {} }) {
  const guestNotes = config.guestNotes || {};
  const messages = guestNotes.messages || [];

  if (messages.length === 0) {
    return null;
  }

  return (
    <section className="ee-section ee-guest-notes-section">
      <div className="ee-guest-notes-container">
        <h2 className="ee-section-heading">Messages from Our Guests</h2>
        <div className="ee-divider" />

        <div className="ee-guest-notes-grid">
          {messages.map((message, index) => (
            <div key={index} className="ee-guest-note-card">
              <p className="ee-guest-note-text">{message.text || ""}</p>
              {message.author && <p className="ee-guest-note-author">— {message.author}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GuestNotes;
