import { useState } from 'react';

/**
 * MinimalRSVP - Ultra-minimal centered RSVP form
 * Thin underline inputs, text-only submit button
 */
function MinimalRSVP({ translations, currentLang, config = {} }) {
  const [formData, setFormData] = useState({
    name: '',
    attendance: '',
    guests: '1',
    message: '',
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement RSVP submission
    // RSVP submission will be handled by parent component or service
  };
  
  return (
    <section className="ee-section ee-rsvp-section">
      <div className="ee-rsvp-container">
        <h2 className="ee-section-heading">RSVP</h2>
        <div className="ee-divider" />
        
        <form className="ee-rsvp-form" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="ee-form-field">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="ee-input"
            />
          </div>
          
          {/* Attendance */}
          <div className="ee-form-field">
            <select
              value={formData.attendance}
              onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
              required
              className="ee-input"
            >
              <option value="">Will you attend?</option>
              <option value="yes">Yes, I'll be there</option>
              <option value="no">Regretfully, I cannot attend</option>
            </select>
          </div>
          
          {/* Guest Count */}
          {formData.attendance === 'yes' && (
            <div className="ee-form-field">
              <input
                type="number"
                min="1"
                placeholder="Number of guests"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="ee-input"
              />
            </div>
          )}
          
          {/* Message */}
          <div className="ee-form-field">
            <textarea
              placeholder="Message (optional)"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows="3"
              className="ee-input ee-textarea"
            />
          </div>
          
          {/* Submit */}
          <button type="submit" className="ee-submit-button">
            Submit Response
          </button>
        </form>
      </div>
    </section>
  );
}

export default MinimalRSVP;

