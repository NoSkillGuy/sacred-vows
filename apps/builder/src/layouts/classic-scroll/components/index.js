/**
 * Classic Scroll Layout Components
 * 
 * Exports all components for the classic-scroll layout organized by type:
 * - view: View-only components for rendering the invitation
 * - editable: WYSIWYG editable components for the builder
 * - shared: Shared components (modals, utilities, etc.)
 */

// Import view components
import Header from './view/Header.jsx';
import Hero from './view/Hero.jsx';
import Couple from './view/Couple.jsx';
import FathersLetter from './view/FathersLetter.jsx';
import Gallery from './view/Gallery.jsx';
import Events from './view/Events.jsx';
import Venue from './view/Venue.jsx';
import RSVP from './view/RSVP.jsx';
import Footer from './view/Footer.jsx';
import Blessings from './view/Blessings.jsx';
import ConfettiLayer from './view/ConfettiLayer.jsx';
import CelebrateButton from './view/CelebrateButton.jsx';

// Import editable components
import EditableHero from './editable/EditableHero.jsx';
import EditableHeroSection from './editable/EditableHeroSection.jsx';
import EditableCoupleSection from './editable/EditableCoupleSection.jsx';
import EditableFathersLetterSection from './editable/EditableFathersLetterSection.jsx';
import EditableGallerySection from './editable/EditableGallerySection.jsx';
import EditableEventsSection from './editable/EditableEventsSection.jsx';
import EditableVenueSection from './editable/EditableVenueSection.jsx';
import EditableRSVPSection from './editable/EditableRSVPSection.jsx';
import EditableFooter from './editable/EditableFooter.jsx';

// Import shared components
import EditableText from './shared/EditableText.jsx';
import EditableImage from './shared/EditableImage.jsx';
import EditableWrapper from './shared/EditableWrapper.jsx';
import RSVPModal from './shared/RSVPModal.jsx';
import LanguageModal from './shared/LanguageModal.jsx';
import GuestNameModal from './shared/GuestNameModal.jsx';

// View components mapped by section ID
export const viewComponents = {
  header: Header,
  hero: Hero,
  couple: Couple,
  'fathers-letter': FathersLetter,
  gallery: Gallery,
  events: Events,
  venue: Venue,
  rsvp: RSVP,
  footer: Footer,
  blessings: Blessings,
  confetti: ConfettiLayer,
  celebrate: CelebrateButton,
};

// Editable components mapped by section ID
export const editableComponents = {
  hero: EditableHeroSection,
  couple: EditableCoupleSection,
  'fathers-letter': EditableFathersLetterSection,
  gallery: EditableGallerySection,
  events: EditableEventsSection,
  venue: EditableVenueSection,
  rsvp: EditableRSVPSection,
  footer: EditableFooter,
};

// Shared components
export const sharedComponents = {
  EditableText,
  EditableImage,
  EditableWrapper,
  RSVPModal,
  LanguageModal,
  GuestNameModal,
  Blessings,
  ConfettiLayer,
  CelebrateButton,
  Header,
};

// Default export
export default {
  view: viewComponents,
  editable: editableComponents,
  shared: sharedComponents,
};

