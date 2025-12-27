/**
 * Editorial Elegance Layout Manifest
 *
 * Defines the structure, sections, themes, and metadata for the editorial-elegance layout.
 * A luxury magazine-style layout inspired by Vogue/Harper's Bazaar editorials.
 */

import type { LayoutManifest } from "@shared/types/layout";
import { getLayoutPreviewUrl } from "../../services/defaultAssetService";

export const editorialEleganceManifest: LayoutManifest = {
  id: "editorial-elegance",
  name: "Editorial Elegance",
  version: "1.0.0",

  metadata: {
    name: "Editorial Elegance",
    description:
      "Luxury magazine-style layout with minimal design, typography-led aesthetics, and editorial photography. Perfect for couples who appreciate subtle luxury and modern design.",
    previewImage: getLayoutPreviewUrl("editorial-elegance", "preview.jpg"),
    tags: ["luxury", "minimal", "editorial", "modern", "premium", "magazine"],
    author: "Sacred Vows",
    version: "1.0.0",
  },

  sections: [
    {
      id: "hero",
      name: "Editorial Cover",
      required: true,
      order: 0,
    },
    {
      id: "countdown",
      name: "Save the Date",
      required: false,
      order: 1,
    },
    {
      id: "quote",
      name: "Editorial Quote",
      required: false,
      order: 2,
    },
    {
      id: "editorial-intro",
      name: "Editorial Intro",
      required: false,
      order: 3,
    },
    {
      id: "couple",
      name: "The Couple",
      required: false,
      order: 4,
    },
    {
      id: "story",
      name: "Love Story",
      required: false,
      order: 5,
    },
    {
      id: "events",
      name: "Event Schedule",
      required: false,
      order: 6,
    },
    {
      id: "wedding-party",
      name: "Wedding Party",
      required: false,
      order: 7,
    },
    {
      id: "location",
      name: "Location",
      required: false,
      order: 8,
    },
    {
      id: "travel",
      name: "Travel & Stay",
      required: false,
      order: 9,
    },
    {
      id: "things-to-do",
      name: "Things to Do",
      required: false,
      order: 10,
    },
    {
      id: "gallery",
      name: "Gallery",
      required: false,
      order: 11,
    },
    {
      id: "dress-code",
      name: "Dress Code",
      required: false,
      order: 12,
    },
    {
      id: "registry",
      name: "Registry",
      required: false,
      order: 13,
    },
    {
      id: "guest-notes",
      name: "Guest Notes",
      required: false,
      order: 14,
    },
    {
      id: "rsvp",
      name: "RSVP",
      required: false,
      order: 15,
    },
    {
      id: "faq",
      name: "FAQ",
      required: false,
      order: 16,
    },
    {
      id: "contact",
      name: "Contact",
      required: false,
      order: 17,
    },
    {
      id: "footer",
      name: "Footer",
      required: true,
      order: 18,
    },
  ],

  themes: [
    {
      id: "default",
      name: "Editorial Classic",
      isDefault: true,
      colors: {
        primary: "#C6A15B",
        secondary: "#6B6B6B",
        background: {
          page: "#FAF9F7",
        },
        text: {
          primary: "#1C1C1C",
          muted: "#6B6B6B",
        },
        accent: "#C6A15B",
      },
      fonts: {
        heading: "Playfair Display",
        body: "Inter",
        script: "Playfair Display",
      },
    },
  ],

  defaultSectionOrder: [
    "hero",
    "countdown",
    "quote",
    "editorial-intro",
    "couple",
    "story",
    "events",
    "wedding-party",
    "location",
    "travel",
    "things-to-do",
    "gallery",
    "dress-code",
    "registry",
    "guest-notes",
    "rsvp",
    "faq",
    "contact",
    "footer",
  ],
};
