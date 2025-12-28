interface ContactProps {
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
}

/**
 * Contact - Premium "wedding concierge" contact section
 * Feels premium, not utilitarian
 */
function Contact({ _translations, _currentLang, config = {} }: ContactProps) {
  const contact = config.contact || {};
  const title = contact.title || "Reach out to our wedding concierge";
  const contacts = contact.contacts || [];
  const email = contact.email || "";
  const phone = contact.phone || "";

  return (
    <section className="ee-section ee-contact-section">
      <div className="ee-contact-container">
        <h2 className="ee-section-heading">Contact</h2>
        <div className="ee-divider" />

        {/* Title */}
        {title && <p className="ee-contact-intro">{title}</p>}

        {/* Contact List */}
        {contacts.length > 0 && (
          <div className="ee-contact-list">
            {contacts.map((contactItem, index) => (
              <div key={index} className="ee-contact-item">
                {contactItem.name && <h3 className="ee-contact-name">{contactItem.name}</h3>}
                {contactItem.role && <p className="ee-contact-role">{contactItem.role}</p>}
                {contactItem.email && (
                  <a href={`mailto:${contactItem.email}`} className="ee-link">
                    {contactItem.email}
                  </a>
                )}
                {contactItem.phone && (
                  <a href={`tel:${contactItem.phone}`} className="ee-link">
                    {contactItem.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Direct Contact Info */}
        {(email || phone) && (
          <div className="ee-contact-direct">
            {email && (
              <a href={`mailto:${email}`} className="ee-link">
                {email}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="ee-link">
                {phone}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Contact;
