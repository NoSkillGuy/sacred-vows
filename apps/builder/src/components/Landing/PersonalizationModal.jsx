import { useState, useEffect } from 'react';
import './PersonalizationModal.css';

const STORAGE_KEY = 'landing-personalization-data';

function PersonalizationModal({ isOpen, onClose, onSave }) {
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [venue, setVenue] = useState('');

  const handleSkip = () => {
    onClose();
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    const data = {
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      weddingDate: weddingDate.trim(),
      venue: venue.trim(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (onSave) {
        onSave(data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save personalization data:', error);
      // Still close the modal even if save fails
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Load existing data if any
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setBrideName(data.brideName || '');
          setGroomName(data.groomName || '');
          setWeddingDate(data.weddingDate || '');
          setVenue(data.venue || '');
        }
      } catch (error) {
        console.error('Failed to load personalization data:', error);
      }

      // Handle ESC key to close modal
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="personalization-modal-overlay" 
      onClick={handleSkip}
      role="dialog"
      aria-modal="true"
      aria-labelledby="personalization-modal-title"
    >
      <div 
        className="personalization-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="personalization-modal-header">
          <h3 id="personalization-modal-title">Personalize Your Preview</h3>
          <button 
            className="personalization-modal-close" 
            onClick={handleSkip}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="personalization-modal-body">
          <p className="personalization-explanation">
            We'd love to personalize your preview! Share your details below to see them in the live preview card.
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="bride-name" className="form-label">
                Bride's Name
              </label>
              <input
                type="text"
                id="bride-name"
                className="form-input"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                placeholder="Enter bride's name"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="groom-name" className="form-label">
                Groom's Name
              </label>
              <input
                type="text"
                id="groom-name"
                className="form-input"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                placeholder="Enter groom's name"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="wedding-date" className="form-label">
                Wedding Date
              </label>
              <input
                type="date"
                id="wedding-date"
                className="form-input"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="venue" className="form-label">
                Venue / Place
              </label>
              <input
                type="text"
                id="venue"
                className="form-input"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter wedding venue or place"
              />
            </div>

            <div className="personalization-modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleSkip}
              >
                Skip
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Save & Preview
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PersonalizationModal;

