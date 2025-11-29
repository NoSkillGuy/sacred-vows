import { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';

function RSVPForm() {
  const { currentInvitation, updateNestedData } = useBuilderStore();
  const rsvp = currentInvitation.data.rsvp || {};
  const contacts = rsvp.contacts || [];
  const whatsappNumber = rsvp.whatsappNumber || '';
  const maxDate = rsvp.maxDate || '';

  const addContact = () => {
    const newContact = {
      badge: 'RSVP',
      name: '',
    };
    updateNestedData('rsvp', {
      contacts: [...contacts, newContact],
      whatsappNumber,
      maxDate,
    });
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    updateNestedData('rsvp', {
      contacts: newContacts,
      whatsappNumber,
      maxDate,
    });
  };

  const removeContact = (index) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    updateNestedData('rsvp', {
      contacts: newContacts,
      whatsappNumber,
      maxDate,
    });
  };

  const updateRSVPConfig = (field, value) => {
    updateNestedData('rsvp', {
      contacts,
      [field]: value,
    });
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">RSVP Configuration</h3>
      
      <div className="form-group">
        <label className="form-label">WhatsApp Number</label>
        <input
          type="text"
          className="form-input"
          value={whatsappNumber}
          onChange={(e) => updateRSVPConfig('whatsappNumber', e.target.value)}
          placeholder="918527476555"
        />
        <small className="form-help-text">Include country code without +</small>
      </div>

      <div className="form-group">
        <label className="form-label">Max RSVP Date</label>
        <input
          type="date"
          className="form-input"
          value={maxDate}
          onChange={(e) => updateRSVPConfig('maxDate', e.target.value)}
        />
      </div>

      <div className="form-subsection">
        <h4 className="form-subsection-title">Contacts</h4>
        
        {contacts.map((contact, index) => (
          <div key={index} className="contact-item-form" style={{ marginBottom: '16px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <div className="form-group">
              <label className="form-label">Badge/Role</label>
              <select
                className="form-select"
                value={contact.badge || 'RSVP'}
                onChange={(e) => updateContact(index, 'badge', e.target.value)}
              >
                <option value="RSVP">RSVP</option>
                <option value="Host">Host</option>
                <option value="Coordinator">Coordinator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={contact.name || ''}
                onChange={(e) => updateContact(index, 'name', e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => removeContact(index)}
            >
              Remove Contact
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-primary"
          onClick={addContact}
        >
          Add Contact
        </button>
      </div>
    </div>
  );
}

export default RSVPForm;

