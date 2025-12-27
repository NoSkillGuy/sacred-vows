/**
 * Editorial Elegance Components Export
 * Aggregates all view, editable, and shared components
 */

import type { ComponentType } from "react";

// View Components
import EditorialHeader from "./view/EditorialHeader";
import EditorialHero from "./view/EditorialHero";
import EditorialIntro from "./view/EditorialIntro";
import Countdown from "./view/Countdown";
import EditorialQuote from "./view/EditorialQuote";
import LoveStory from "./view/LoveStory";
import EventCards from "./view/EventCards";
import WeddingParty from "./view/WeddingParty";
import Location from "./view/Location";
import Travel from "./view/Travel";
import ThingsToDo from "./view/ThingsToDo";
import EditorialGallery from "./view/EditorialGallery";
import DressCode from "./view/DressCode";
import Registry from "./view/Registry";
import GuestNotes from "./view/GuestNotes";
import MinimalRSVP from "./view/MinimalRSVP";
import FAQ from "./view/FAQ";
import Contact from "./view/Contact";
import EditorialFooter from "./view/EditorialFooter";
import ScrollAnimationsInit from "./view/ScrollAnimationsInit";

// Editable Components
import EditableEditorialHero from "./editable/EditableEditorialHero";
import EditableEditorialIntro from "./editable/EditableEditorialIntro";
import EditableCountdown from "./editable/EditableCountdown";
import EditableEditorialQuote from "./editable/EditableEditorialQuote";
import EditableLoveStory from "./editable/EditableLoveStory";
import EditableEventCards from "./editable/EditableEventCards";
import EditableWeddingParty from "./editable/EditableWeddingParty";
import EditableLocation from "./editable/EditableLocation";
import EditableTravel from "./editable/EditableTravel";
import EditableThingsToDo from "./editable/EditableThingsToDo";
import EditableEditorialGallery from "./editable/EditableEditorialGallery";
import EditableDressCode from "./editable/EditableDressCode";
import EditableRegistry from "./editable/EditableRegistry";
import EditableGuestNotes from "./editable/EditableGuestNotes";
import EditableMinimalRSVP from "./editable/EditableMinimalRSVP";
import EditableFAQ from "./editable/EditableFAQ";
import EditableContact from "./editable/EditableContact";
import EditableEditorialFooter from "./editable/EditableEditorialFooter";

// Shared Components
import EditableText from "./shared/EditableText";
import EditableImage from "./shared/EditableImage";

/**
 * IMPORTANT: Keys in these maps MUST match section IDs from the manifest.
 * Preview and editor look up components by section.id (e.g. 'hero', 'editorial-intro').
 */
export const view: Record<string, ComponentType<Record<string, unknown>>> = {
  hero: EditorialHero,
  countdown: Countdown,
  quote: EditorialQuote,
  "editorial-intro": EditorialIntro,
  story: LoveStory,
  events: EventCards,
  "wedding-party": WeddingParty,
  location: Location,
  travel: Travel,
  "things-to-do": ThingsToDo,
  gallery: EditorialGallery,
  "dress-code": DressCode,
  registry: Registry,
  "guest-notes": GuestNotes,
  rsvp: MinimalRSVP,
  faq: FAQ,
  contact: Contact,
  footer: EditorialFooter,
};

export const editable: Record<string, ComponentType<Record<string, unknown>>> = {
  hero: EditableEditorialHero,
  countdown: EditableCountdown,
  quote: EditableEditorialQuote,
  "editorial-intro": EditableEditorialIntro,
  story: EditableLoveStory,
  events: EditableEventCards,
  "wedding-party": EditableWeddingParty,
  location: EditableLocation,
  travel: EditableTravel,
  "things-to-do": EditableThingsToDo,
  gallery: EditableEditorialGallery,
  "dress-code": EditableDressCode,
  registry: EditableRegistry,
  "guest-notes": EditableGuestNotes,
  rsvp: EditableMinimalRSVP,
  faq: EditableFAQ,
  contact: EditableContact,
  footer: EditableEditorialFooter,
};

export const shared: Record<string, ComponentType<Record<string, unknown>>> = {
  Header: EditorialHeader,
  ScrollAnimationsInit,
  EditableText,
  EditableImage,
};
