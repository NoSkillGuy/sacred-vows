/**
 * Editorial Elegance Layout Default Data
 * Provides default values for all sections using couple2 assets and real wedding details
 */

import { getLayoutAssetUrl } from "../../services/defaultAssetService";

const LAYOUT_ID = "editorial-elegance";

export interface EditorialEleganceDefaults {
  couple: {
    bride: {
      name: string;
      image: string;
    };
    groom: {
      name: string;
      image: string;
    };
  };
  wedding: {
    dates: string[];
    venue: {
      name: string;
      address: string;
      city: string;
      state: string;
      mapsUrl: string;
      mapsEmbedUrl: string;
    };
  };
  hero: {
    mainImage: string;
    alignment: string;
    mediaType: string;
  };
  editorialIntro: {
    text: string;
    image: string;
    alignment: string;
  };
  events: {
    events: Array<{
      label: string;
      date: string;
      time: string;
      venue: string;
    }>;
  };
  weddingParty: {
    bride: {
      name: string;
      image: string;
      bio: string;
    };
    groom: {
      name: string;
      image: string;
      bio: string;
    };
    members: unknown[];
    showBios: boolean;
    filter: string;
  };
  gallery: {
    images: Array<{
      src: string;
      alt: string;
      category: string;
    }>;
  };
  galleryConfig: {
    layout: string;
    maxImages: number;
  };
  music: {
    file: string;
    volume: number;
  };
}

export const editorialEleganceDefaults: EditorialEleganceDefaults = {
  couple: {
    bride: {
      name: "Pooja Singh",
      image: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/bride/1.jpeg"),
    },
    groom: {
      name: "Siva Praveen",
      image: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/groom/1.jpeg"),
    },
  },
  wedding: {
    dates: ["2021-05-13", "2021-05-14", "2021-05-15"],
    venue: {
      name: "Halcyon Hotel Residences",
      address: "P.B. 4708, Drafadilla, 9, 5th Main Rd, BDA Layout, 4th Block, Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      mapsUrl: "https://maps.app.goo.gl/GgjVoMrJE1nEMK4F6",
      mapsEmbedUrl: "https://www.google.com/maps?q=12.935688,77.631266&hl=en&z=17&output=embed",
    },
  },
  hero: {
    mainImage: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/couple/1.jpeg"),
    alignment: "center",
    mediaType: "image",
  },
  editorialIntro: {
    text: "Two paths, one story.\nRooted in tradition, bound by love,\nwe invite you to celebrate the beginning of forever.",
    image: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/couple/2.jpeg"),
    alignment: "right",
  },
  events: {
    events: [
      {
        label: "Haldi",
        date: "2021-05-13",
        time: "9:00 AM",
        venue: "Halcyon Hotel Residences",
      },
      {
        label: "Tilak",
        date: "2021-05-13",
        time: "10:00 AM",
        venue: "Halcyon Hotel Residences",
      },
      {
        label: "Chumavan",
        date: "2021-05-13",
        time: "11:00 AM",
        venue: "Halcyon Hotel Residences",
      },
      {
        label: "Satyanarayan Pujan",
        date: "2021-05-13",
        time: "5:00 PM",
        venue: "Halcyon Hotel Residences",
      },
      {
        label: "Mehendi",
        date: "2021-05-14",
        time: "9:00 AM",
        venue: "Halcyon Hotel Residences",
      },
      {
        label: "Jaimala",
        date: "2021-05-14",
        time: "6:00 PM",
        venue: "Halcyon Hotel Residences",
      },
      {
        label: "Dinner",
        date: "2021-05-14",
        time: "7:30 PM",
        venue: "Halcyon Hotel Residences",
      },
      {
        label: "Marriage",
        date: "2021-05-15",
        time: "12:00 AM",
        venue: "Halcyon Hotel Residences",
      },
    ],
  },
  weddingParty: {
    bride: {
      name: "Pooja Singh",
      image: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/bride/1.jpeg"),
      bio: "",
    },
    groom: {
      name: "Siva Praveen",
      image: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/groom/1.jpeg"),
      bio: "",
    },
    members: [],
    showBios: false,
    filter: "bw",
  },
  gallery: {
    images: [
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/couple/1.jpeg"),
        alt: "Couple photo 1",
        category: "couple",
      },
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/couple/2.jpeg"),
        alt: "Couple photo 2",
        category: "couple",
      },
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/couple/3.jpeg"),
        alt: "Couple photo 3",
        category: "couple",
      },
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/couple/4.jpeg"),
        alt: "Couple photo 4",
        category: "couple",
      },
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/couple/5.jpeg"),
        alt: "Couple photo 5",
        category: "couple",
      },
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/couple/6.jpeg"),
        alt: "Couple photo 6",
        category: "couple",
      },
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/groom/1.jpeg"),
        alt: "Groom photo 1",
        category: "groom",
      },
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/groom/2.jpeg"),
        alt: "Groom photo 2",
        category: "groom",
      },
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/groom/3.jpeg"),
        alt: "Groom photo 3",
        category: "groom",
      },
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/groom/4.jpeg"),
        alt: "Groom photo 4",
        category: "groom",
      },
      {
        src: getLayoutAssetUrl(LAYOUT_ID, "/assets/photos/couple2/groom/5.jpeg"),
        alt: "Groom photo 5",
        category: "groom",
      },
    ],
  },
  galleryConfig: {
    layout: "masonry",
    maxImages: 12,
  },
  music: {
    file: getLayoutAssetUrl(LAYOUT_ID, "/assets/music/1.mp3"),
    volume: 0.5,
  },
};

/**
 * Merge defaults with existing data, preserving user's customizations
 * @param existingData - Existing invitation data
 * @returns Merged data with defaults applied
 */
export function mergeWithDefaults(
  existingData: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    couple: {
      ...editorialEleganceDefaults.couple,
      ...(existingData.couple as Record<string, unknown>),
      bride: {
        ...editorialEleganceDefaults.couple.bride,
        ...((existingData.couple as Record<string, unknown>)?.bride as Record<string, unknown>),
      },
      groom: {
        ...editorialEleganceDefaults.couple.groom,
        ...((existingData.couple as Record<string, unknown>)?.groom as Record<string, unknown>),
      },
    },
    wedding: {
      ...editorialEleganceDefaults.wedding,
      ...(existingData.wedding as Record<string, unknown>),
      venue: {
        ...editorialEleganceDefaults.wedding.venue,
        ...((existingData.wedding as Record<string, unknown>)?.venue as Record<string, unknown>),
      },
    },
    hero: {
      ...editorialEleganceDefaults.hero,
      ...(existingData.hero as Record<string, unknown>),
    },
    editorialIntro: {
      ...editorialEleganceDefaults.editorialIntro,
      ...(existingData.editorialIntro as Record<string, unknown>),
    },
    events: {
      ...editorialEleganceDefaults.events,
      ...(existingData.events as Record<string, unknown>),
      events:
        (existingData.events as Record<string, unknown>)?.events &&
        Array.isArray((existingData.events as Record<string, unknown>).events) &&
        ((existingData.events as Record<string, unknown>).events as unknown[]).length
          ? ((existingData.events as Record<string, unknown>).events as unknown[])
          : editorialEleganceDefaults.events.events,
    },
    weddingParty: {
      ...editorialEleganceDefaults.weddingParty,
      ...(existingData.weddingParty as Record<string, unknown>),
      bride: {
        ...editorialEleganceDefaults.weddingParty.bride,
        ...((existingData.weddingParty as Record<string, unknown>)?.bride as Record<
          string,
          unknown
        >),
      },
      groom: {
        ...editorialEleganceDefaults.weddingParty.groom,
        ...((existingData.weddingParty as Record<string, unknown>)?.groom as Record<
          string,
          unknown
        >),
      },
    },
    gallery: {
      ...editorialEleganceDefaults.gallery,
      ...(existingData.gallery as Record<string, unknown>),
      images:
        (existingData.gallery as Record<string, unknown>)?.images &&
        Array.isArray((existingData.gallery as Record<string, unknown>).images) &&
        ((existingData.gallery as Record<string, unknown>).images as unknown[]).length
          ? ((existingData.gallery as Record<string, unknown>).images as unknown[])
          : editorialEleganceDefaults.gallery.images,
    },
    galleryConfig: {
      ...editorialEleganceDefaults.galleryConfig,
      ...(existingData.galleryConfig as Record<string, unknown>),
    },
    music: {
      ...editorialEleganceDefaults.music,
      ...(existingData.music as Record<string, unknown>),
    },
    // Preserve other data
    ...Object.keys(existingData).reduce(
      (acc, key) => {
        if (
          ![
            "couple",
            "wedding",
            "hero",
            "editorialIntro",
            "events",
            "weddingParty",
            "gallery",
            "galleryConfig",
            "music",
          ].includes(key)
        ) {
          acc[key] = existingData[key];
        }
        return acc;
      },
      {} as Record<string, unknown>
    ),
  };
}
