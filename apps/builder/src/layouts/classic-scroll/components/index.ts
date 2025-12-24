/**
 * Classic Scroll Layout Components
 *
 * Exports all components for the classic-scroll layout organized by type:
 * - view: View-only components for rendering the invitation
 * - editable: WYSIWYG editable components for the builder
 * - shared: Shared components (modals, utilities, etc.)
 */

import type { ComponentType } from "react";

// Import view components
import Header from "./view/Header";
import Hero from "./view/Hero";
import Couple from "./view/Couple";
import FathersLetter from "./view/FathersLetter";
import Gallery from "./view/Gallery";
import Events from "./view/Events";
import Venue from "./view/Venue";
import RSVP from "./view/RSVP";
import Footer from "./view/Footer";
import Blessings from "./view/Blessings";
import ConfettiLayer from "./view/ConfettiLayer";
import CelebrateButton from "./view/CelebrateButton";

// Import editable components
import EditableHero from "./editable/EditableHero";
import EditableHeroSection from "./editable/EditableHeroSection";
import EditableCoupleSection from "./editable/EditableCoupleSection";
import EditableFathersLetterSection from "./editable/EditableFathersLetterSection";
import EditableGallerySection from "./editable/EditableGallerySection";
import EditableEventsSection from "./editable/EditableEventsSection";
import EditableVenueSection from "./editable/EditableVenueSection";
import EditableRSVPSection from "./editable/EditableRSVPSection";
import EditableFooter from "./editable/EditableFooter";

// Import shared components
import EditableText from "./shared/EditableText";
import EditableImage from "./shared/EditableImage";
import EditableWrapper from "./shared/EditableWrapper";
import RSVPModal from "./shared/RSVPModal";
import LanguageModal from "./shared/LanguageModal";
import GuestNameModal from "./shared/GuestNameModal";

// View components mapped by section ID
export const viewComponents: Record<string, ComponentType<Record<string, unknown>>> = {
  header: Header,
  hero: Hero,
  couple: Couple,
  "fathers-letter": FathersLetter,
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
export const editableComponents: Record<string, ComponentType<Record<string, unknown>>> = {
  hero: EditableHeroSection,
  couple: EditableCoupleSection,
  "fathers-letter": EditableFathersLetterSection,
  gallery: EditableGallerySection,
  events: EditableEventsSection,
  venue: EditableVenueSection,
  rsvp: EditableRSVPSection,
  footer: EditableFooter,
};

// Shared components
export const sharedComponents: Record<string, ComponentType<Record<string, unknown>>> = {
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
