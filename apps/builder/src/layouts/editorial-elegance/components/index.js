/**
 * Editorial Elegance Components Export
 * Aggregates all view, editable, and shared components
 */

// View Components
import EditorialHeader from './view/EditorialHeader';
import EditorialHero from './view/EditorialHero';
import EditorialIntro from './view/EditorialIntro';
import EventCards from './view/EventCards';
import WeddingParty from './view/WeddingParty';
import Location from './view/Location';
import EditorialGallery from './view/EditorialGallery';
import MinimalRSVP from './view/MinimalRSVP';
import EditorialFooter from './view/EditorialFooter';
import ScrollAnimationsInit from './view/ScrollAnimationsInit';

// Editable Components
import EditableEditorialHero from './editable/EditableEditorialHero';
import EditableEditorialIntro from './editable/EditableEditorialIntro';
import EditableEventCards from './editable/EditableEventCards';
import EditableWeddingParty from './editable/EditableWeddingParty';
import EditableLocation from './editable/EditableLocation';
import EditableEditorialGallery from './editable/EditableEditorialGallery';
import EditableMinimalRSVP from './editable/EditableMinimalRSVP';
import EditableEditorialFooter from './editable/EditableEditorialFooter';

// Shared Components
import EditableText from './shared/EditableText';
import EditableImage from './shared/EditableImage';

/**
 * IMPORTANT: Keys in these maps MUST match section IDs from the manifest.
 * Preview and editor look up components by section.id (e.g. 'hero', 'editorial-intro').
 */
export const view = {
  hero: EditorialHero,
  'editorial-intro': EditorialIntro,
  events: EventCards,
  'wedding-party': WeddingParty,
  location: Location,
  gallery: EditorialGallery,
  rsvp: MinimalRSVP,
  footer: EditorialFooter,
};

export const editable = {
  hero: EditableEditorialHero,
  'editorial-intro': EditableEditorialIntro,
  events: EditableEventCards,
  'wedding-party': EditableWeddingParty,
  location: EditableLocation,
  gallery: EditableEditorialGallery,
  rsvp: EditableMinimalRSVP,
  footer: EditableEditorialFooter,
};

export const shared = {
  Header: EditorialHeader,
  ScrollAnimationsInit,
  EditableText,
  EditableImage,
};

