import EditableText from "../shared/EditableText";

interface EditableGuestNotesProps {
  _translations?: unknown;
  _currentLang?: string;
  config?: {
    guestNotes?: {
      messages?: Array<{
        text?: string;
        author?: string;
      }>;
    };
  };
  onUpdate?: (path: string, value: unknown) => void;
}

/**
 * EditableGuestNotes - Guest message moderation interface
 */
function EditableGuestNotes({
  _translations,
  _currentLang,
  config = {},
  onUpdate,
}: EditableGuestNotesProps) {
  const guestNotes = config.guestNotes || {};
  const messages = guestNotes.messages || [];

  const handleAddMessage = () => {
    const newMessages = [...messages, { text: "", author: "" }];
    if (onUpdate) {
      onUpdate("guestNotes.messages", newMessages);
    }
  };

  const handleUpdateMessage = (index: number, field: string, value: string) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], [field]: value };
    if (onUpdate) {
      onUpdate("guestNotes.messages", updated);
    }
  };

  const handleDeleteMessage = (index: number) => {
    const updated = messages.filter((_, i) => i !== index);
    if (onUpdate) {
      onUpdate("guestNotes.messages", updated);
    }
  };

  return (
    <section className="ee-section ee-guest-notes-section">
      <div className="ee-guest-notes-container">
        <h2 className="ee-section-heading">Messages from Our Guests</h2>
        <div className="ee-divider" />

        <div className="ee-guest-notes-grid">
          {messages.map((message, index) => (
            <div key={index} className="ee-guest-note-card">
              <EditableText
                value={message.text || ""}
                onUpdate={(path, value) => handleUpdateMessage(index, "text", value)}
                className="ee-guest-note-text"
                tag="p"
                multiline={true}
              />
              <EditableText
                value={message.author || ""}
                onUpdate={(path, value) => handleUpdateMessage(index, "author", value)}
                className="ee-guest-note-author"
                tag="p"
              />
              <button
                onClick={() => handleDeleteMessage(index)}
                className="ee-delete-button"
                type="button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button onClick={handleAddMessage} className="ee-add-button" type="button">
          + Add Guest Message
        </button>
      </div>
    </section>
  );
}

export default EditableGuestNotes;
