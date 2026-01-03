import EditableText from "../shared/EditableText";

interface EditableContactProps {
  _translations?: unknown;
  _currentLang?: string;
  config?: {
    contact?: {
      title?: string;
      contacts?: Array<{
        name?: string;
        role?: string;
        email?: string;
        phone?: string;
      }>;
      email?: string;
      phone?: string;
    };
  };
  onUpdate?: (path: string, value: unknown) => void;
}

/**
 * EditableContact - Contact information editor
 */
function EditableContact({
  _translations,
  _currentLang,
  config = {},
  onUpdate,
}: EditableContactProps) {
  const contact = config.contact || {};
  const title = contact.title || "Reach out to our wedding concierge";
  const contacts = contact.contacts || [];
  const email = contact.email || "";
  const phone = contact.phone || "";

  const handleAddContact = () => {
    const newContacts = [...contacts, { name: "", role: "", email: "", phone: "" }];
    if (onUpdate) {
      onUpdate("contact.contacts", newContacts);
    }
  };

  const handleUpdateContact = (index: number, field: string, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    if (onUpdate) {
      onUpdate("contact.contacts", updated);
    }
  };

  return (
    <section className="ee-section ee-contact-section">
      <div className="ee-contact-container">
        <h2 className="ee-section-heading">Contact</h2>
        <div className="ee-divider" />

        {/* Title */}
        {title && (
          <EditableText
            value={title}
            onUpdate={onUpdate}
            path="contact.title"
            className="ee-contact-intro"
            tag="p"
            multiline={true}
          />
        )}

        {/* Contact List */}
        <div className="ee-contact-list">
          {contacts.map((contactItem, index) => (
            <div key={index} className="ee-contact-item">
              {contactItem.name && (
                <EditableText
                  value={contactItem.name}
                  onUpdate={(path, value) => handleUpdateContact(index, "name", value)}
                  className="ee-contact-name"
                  tag="h3"
                />
              )}
              {contactItem.role && (
                <EditableText
                  value={contactItem.role}
                  onUpdate={(path, value) => handleUpdateContact(index, "role", value)}
                  className="ee-contact-role"
                  tag="p"
                />
              )}
              {contactItem.email && (
                <EditableText
                  value={contactItem.email}
                  onUpdate={(path, value) => handleUpdateContact(index, "email", value)}
                  className="ee-contact-email"
                  tag="span"
                />
              )}
              {contactItem.phone && (
                <EditableText
                  value={contactItem.phone}
                  onUpdate={(path, value) => handleUpdateContact(index, "phone", value)}
                  className="ee-contact-phone"
                  tag="span"
                />
              )}
            </div>
          ))}
          <button onClick={handleAddContact} className="ee-add-button" type="button">
            + Add Contact
          </button>
        </div>

        {/* Direct Contact Info */}
        {(email || phone) && (
          <div className="ee-contact-direct">
            {email && (
              <EditableText
                value={email}
                onUpdate={onUpdate}
                path="contact.email"
                className="ee-contact-email"
                tag="span"
              />
            )}
            {phone && (
              <EditableText
                value={phone}
                onUpdate={onUpdate}
                path="contact.phone"
                className="ee-contact-phone"
                tag="span"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default EditableContact;
