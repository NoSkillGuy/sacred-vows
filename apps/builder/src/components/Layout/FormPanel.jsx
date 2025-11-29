import { lazy, Suspense } from 'react';
import './FormPanel.css';

// Lazy load form components
const CoupleForm = lazy(() => import('../Forms/CoupleForm'));
const WeddingDetailsForm = lazy(() => import('../Forms/WeddingDetailsForm'));
const EventsForm = lazy(() => import('../Forms/EventsForm'));
const GalleryForm = lazy(() => import('../Forms/GalleryForm'));
const VenueForm = lazy(() => import('../Forms/VenueForm'));
const RSVPForm = lazy(() => import('../Forms/RSVPForm'));
const ThemeForm = lazy(() => import('../Forms/ThemeForm'));
const TranslationsForm = lazy(() => import('../Forms/TranslationsForm'));

const formComponents = {
  couple: CoupleForm,
  wedding: WeddingDetailsForm,
  events: EventsForm,
  gallery: GalleryForm,
  venue: VenueForm,
  rsvp: RSVPForm,
  theme: ThemeForm,
  translations: TranslationsForm,
};

function FormPanel({ activeSection }) {
  const FormComponent = formComponents[activeSection];

  return (
    <div className="form-panel">
      <div className="form-panel-content">
        <Suspense fallback={<div className="form-loading">Loading form...</div>}>
          {FormComponent ? (
            <FormComponent />
          ) : (
            <div className="form-empty">Select a section to edit</div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default FormPanel;

