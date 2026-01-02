/**
 * Shared data extraction functions for classic-scroll layout
 *
 * These functions extract common data patterns from invitation config,
 * ensuring consistency between React components and export templates.
 */

/**
 * Extract header/branding data from config
 */
export function extractHeaderData(config: Record<string, unknown>): {
  branding: Record<string, unknown>;
  music: Record<string, unknown>;
  monogram: string;
  logo: string | undefined;
  title: string;
  subtitle: string;
  musicFile: string | undefined;
} {
  const branding = (config.branding as Record<string, unknown>) || {};
  const music = (config.music as Record<string, unknown>) || {};
  const monogram = (branding.monogram as string) || "";
  const logo = branding.logo as string | undefined;
  const title = (branding.title as string) || "";
  const subtitle = (branding.subtitle as string) || "";
  const musicFile = music.file as string | undefined;

  return {
    branding,
    music,
    monogram,
    logo,
    title,
    subtitle,
    musicFile,
  };
}

/**
 * Extract hero section data from config
 */
export function extractHeroData(config: Record<string, unknown>): {
  wedding: Record<string, unknown>;
  hero: Record<string, unknown>;
  couple: Record<string, unknown>;
  bride: Record<string, unknown>;
  groom: Record<string, unknown>;
  brideName: string;
  groomName: string;
  heroImage: string | undefined;
  countdownTarget: string | undefined;
  dates: string[];
  venue: Record<string, unknown>;
  fullAddress: string | undefined;
} {
  const wedding = (config.wedding as Record<string, unknown>) || {};
  const hero = (config.hero as Record<string, unknown>) || {};
  const couple = (config.couple as Record<string, unknown>) || {};
  const bride = (couple.bride as Record<string, unknown>) || {};
  const groom = (couple.groom as Record<string, unknown>) || {};

  const brideName = (bride.name as string) || "";
  const groomName = (groom.name as string) || "";
  const heroImage = hero.mainImage as string | undefined;
  const countdownTarget = wedding.countdownTarget as string | undefined;
  const dates = (wedding.dates as string[]) || [];
  const venue = (wedding.venue as Record<string, unknown>) || {};
  const fullAddress = venue.fullAddress as string | undefined;

  return {
    wedding,
    hero,
    couple,
    bride,
    groom,
    brideName,
    groomName,
    heroImage,
    countdownTarget,
    dates,
    venue,
    fullAddress,
  };
}

/**
 * Extract couple section data from config
 */
export function extractCoupleData(config: Record<string, unknown>): {
  couple: Record<string, unknown>;
  bride: Record<string, unknown>;
  groom: Record<string, unknown>;
  brideName: string;
  brideMother: string;
  brideFather: string;
  brideImage: string;
  groomName: string;
  groomMother: string;
  groomFather: string;
  groomImage: string;
} {
  const couple = (config.couple as Record<string, unknown>) || {};
  const bride = (couple.bride as Record<string, unknown>) || {};
  const groom = (couple.groom as Record<string, unknown>) || {};

  const brideName = (bride.name as string) || "Bride";
  const brideMother = ((bride.parents as Record<string, unknown>)?.mother as string) || "";
  const brideFather = ((bride.parents as Record<string, unknown>)?.father as string) || "";
  const brideImage = (bride.image as string) || "";

  const groomName = (groom.name as string) || "Groom";
  const groomMother = ((groom.parents as Record<string, unknown>)?.mother as string) || "";
  const groomFather = ((groom.parents as Record<string, unknown>)?.father as string) || "";
  const groomImage = (groom.image as string) || "";

  return {
    couple,
    bride,
    groom,
    brideName,
    brideMother,
    brideFather,
    brideImage,
    groomName,
    groomMother,
    groomFather,
    groomImage,
  };
}

/**
 * Extract gallery data from config
 */
export function extractGalleryData(config: Record<string, unknown>): {
  gallery: Record<string, unknown>;
  galleryImages: Array<Record<string, unknown>>;
} {
  const gallery = (config.gallery as Record<string, unknown>) || {};
  const galleryImages = (gallery.images as Array<Record<string, unknown>>) || [];

  return {
    gallery,
    galleryImages,
  };
}

/**
 * Extract events data from config
 */
export function extractEventsData(config: Record<string, unknown>): {
  events: Record<string, unknown>;
  day1Config: Record<string, unknown>;
  day2Config: Record<string, unknown>;
  day1Events: Array<Record<string, unknown>>;
  day2Events: Array<Record<string, unknown>>;
  day1Date: string;
  day2Date: string;
} {
  const events = (config.events as Record<string, unknown>) || {};
  const day1Config = (events.day1 as Record<string, unknown>) || {};
  const day2Config = (events.day2 as Record<string, unknown>) || {};

  const day1Events = (day1Config.events as Array<Record<string, unknown>>) || [];
  const day2Events = (day2Config.events as Array<Record<string, unknown>>) || [];
  const day1Date = (day1Config.date as string) || "Thursday · 22 January 2026";
  const day2Date = (day2Config.date as string) || "Friday · 23 January 2026";

  return {
    events,
    day1Config,
    day2Config,
    day1Events,
    day2Events,
    day1Date,
    day2Date,
  };
}

/**
 * Extract venue data from config
 */
export function extractVenueData(config: Record<string, unknown>): {
  wedding: Record<string, unknown>;
  venue: Record<string, unknown>;
  venueName: string;
  venueAddress: string;
  venueTags: string[];
  mapsUrl: string | undefined;
  mapsEmbedUrl: string | undefined;
} {
  const wedding = (config.wedding as Record<string, unknown>) || {};
  const venue = (wedding.venue as Record<string, unknown>) || {};

  const venueName = (venue.name as string) || "Royal Lotus View Resotel";
  const venueAddress = (venue.address as string) || "";
  const venueTags = (venue.tags as string[]) || [];
  const mapsUrl = (venue.mapsUrl as string) || undefined;
  const mapsEmbedUrl = (venue.mapsEmbedUrl as string) || undefined;

  return {
    wedding,
    venue,
    venueName,
    venueAddress,
    venueTags,
    mapsUrl,
    mapsEmbedUrl,
  };
}

/**
 * Extract RSVP data from config
 */
export function extractRSVPData(config: Record<string, unknown>): {
  rsvp: Record<string, unknown>;
  contacts: Array<Record<string, unknown>>;
  couple: Record<string, unknown>;
  wedding: Record<string, unknown>;
  brideName: string;
  groomName: string;
  dates: string[];
  venue: Record<string, unknown>;
  venueName: string;
  venueCity: string;
} {
  const rsvp = (config.rsvp as Record<string, unknown>) || {};
  const contacts = (rsvp.contacts as Array<Record<string, unknown>>) || [];
  const couple = (config.couple as Record<string, unknown>) || {};
  const wedding = (config.wedding as Record<string, unknown>) || {};

  const brideName = ((couple.bride as Record<string, unknown>)?.name as string) || "";
  const groomName = ((couple.groom as Record<string, unknown>)?.name as string) || "";
  const dates = (wedding.dates as string[]) || [];
  const venue = (wedding.venue as Record<string, unknown>) || {};
  const venueName = (venue.name as string) || "";
  const venueCity = (venue.city as string) || "";

  return {
    rsvp,
    contacts,
    couple,
    wedding,
    brideName,
    groomName,
    dates,
    venue,
    venueName,
    venueCity,
  };
}

