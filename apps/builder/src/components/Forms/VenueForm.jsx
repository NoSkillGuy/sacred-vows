import WeddingDetailsForm from './WeddingDetailsForm';

// Venue form is part of WeddingDetailsForm
// This is a wrapper for consistency
function VenueForm() {
  return (
    <div className="form-section">
      <h3 className="form-section-title">Venue Information</h3>
      <p className="form-help-text">Venue details are managed in the Wedding Details section.</p>
      <WeddingDetailsForm />
    </div>
  );
}

export default VenueForm;

