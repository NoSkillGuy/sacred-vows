import { useState, useEffect } from 'react';

function RSVPModal({ isOpen, onClose, translations, currentLang }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('2026-01-21');

  useEffect(() => {
    if (isOpen) {
      const storedName = localStorage.getItem('wedding-guest-name');
      if (storedName) {
        setName(storedName);
      }
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !date) return;

    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString(
      currentLang === 'hi' ? 'hi-IN' : currentLang === 'te' ? 'te-IN' : 'en-IN',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );

    const messageTemplate = translations['rsvp.message'] || 
      'Hello! I would like to RSVP for the wedding of Capt Dr. Priya Singh and Dr. Saurabh Singh.\n\nName: {name}\nArrival Date: {date}\n\nI confirm my attendance for the celebrations on 22 & 23 January 2026 at Royal Lotus View Resotel, Bengaluru.';
    
    const message = encodeURIComponent(
      messageTemplate.replace('{name}', name.trim()).replace('{date}', formattedDate)
    );

    const phoneNumber = '918527476555';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="rsvp-modal active" onClick={onClose}>
      <div className="rsvp-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="rsvp-modal-close" onClick={onClose}>×</button>
        <div className="rsvp-modal-header">
          <div className="rsvp-modal-title">{translations['rsvp.modal.title'] || 'RSVP'}</div>
          <div className="rsvp-modal-subtitle">{translations['rsvp.modal.subtitle'] || 'Please confirm your attendance'}</div>
        </div>
        <form id="rsvpForm" onSubmit={handleSubmit}>
          <div className="rsvp-form-group">
            <label className="rsvp-form-label" htmlFor="rsvpName">
              {translations['rsvp.modal.name'] || 'Your Name *'}
            </label>
            <input
              type="text"
              id="rsvpName"
              className="rsvp-form-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="rsvp-form-group">
            <label className="rsvp-form-label" htmlFor="rsvpDate">
              {translations['rsvp.modal.date'] || 'When will you be arriving? *'}
            </label>
            <input
              type="date"
              id="rsvpDate"
              className="rsvp-form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              max="2026-01-24"
            />
          </div>
          <div className="rsvp-modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {translations['rsvp.modal.cancel'] || 'Cancel'}
            </button>
            <button type="submit" className="btn btn-primary">
              {translations['rsvp.modal.send'] || 'Send RSVP'}
              <span className="btn-icon">➚</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RSVPModal;

