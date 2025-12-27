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
    countdownTarget: string;
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
  quote: {
    text: string;
    attribution: string;
  };
  story: {
    text: string;
    chapters: Array<{
      title: string;
      text: string;
    }>;
    pullQuotes: Array<{
      text: string;
      attribution: string;
    }>;
  };
  dressCode: {
    styleText: string;
    colors: Array<{
      value: string;
      label: string;
    }>;
    inspirationImages: Array<{
      src: string;
      alt: string;
    }>;
  };
  travel: {
    cityIntro: string;
    hotels: Array<{
      name: string;
      description: string;
      address: string;
      website: string;
    }>;
  };
  thingsToDo: {
    intro: string;
    activities: Array<{
      name: string;
      category: string;
      description: string;
      address: string;
    }>;
  };
  registry: {
    introText: string;
    links: Array<{
      label: string;
      url: string;
    }>;
  };
  guestNotes: {
    messages: Array<{
      text: string;
      author: string;
    }>;
  };
  faq: {
    questions: Array<{
      question: string;
      answer: string;
    }>;
  };
  contact: {
    title: string;
    contacts: Array<{
      name: string;
      role: string;
      email: string;
      phone: string;
    }>;
    email: string;
    phone: string;
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
    dates: ["2026-05-13", "2026-05-14", "2026-05-15"],
    countdownTarget: "2026-05-15T12:00:00+05:30",
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
  quote: {
    text: "In you, I found my home. In your smile, I found my joy. In your love, I found my heart.",
    attribution: "Siva Praveen", // Default to groom's name, can be edited to bride's name or custom
  },
  story: {
    text: "It all started with a missed train. Pooja was running late, her train pulling away as she reached the platform. Siva, already seated, noticed her through the window and stepped off at the next station to wait. When she finally arrived, he simply smiled and said, 'I think we were meant to miss that train together.'\n\nWhat began as a chance encounter has become a love story written in shared dreams and quiet moments. We've traveled together, collecting memories like treasures, and learned that home isn't a place—it's the person you choose to build your life with.",
    chapters: [
      {
        title: "How We Met",
        text: "March 2018. Bangalore Central Railway Station. Pooja's train had just left. As she stood there, phone in hand, a gentle voice asked if she needed help. Siva had seen her from his window seat and something made him get off. 'There's another train in an hour,' he said. 'Would you like to grab a coffee while we wait?' That coffee turned into a three-hour conversation. By the time her train arrived, they had exchanged numbers.",
      },
      {
        title: "The First Date",
        text: "Cubbon Park on a Sunday morning. Siva brought homemade idlis and filter coffee. Pooja brought her favorite book. They walked for hours, talking about everything. The conversation flowed so naturally it felt like they'd known each other for years. That day, they both knew this was different.",
      },
      {
        title: "The Proposal",
        text: "December 2020. Udaipur. A sunset boat ride on Lake Pichola. As the sun dipped below the horizon, Siva got down on one knee. 'Pooja, you are my home, my adventure, my everything. Will you marry me?' The answer was yes. Surrounded by the lights of the palace, they made a promise to spend forever together.",
      },
    ],
    pullQuotes: [
      {
        text: "I think we were meant to miss that train together.",
        attribution: "Siva",
      },
      {
        text: "Home isn't a place—it's the person you choose to build your life with.",
        attribution: "",
      },
    ],
  },
  dressCode: {
    styleText:
      "We'd love for you to join us in celebrating our special day! For the ceremonies, we're embracing traditional Indian festive wear—think rich silks, elegant saris, and classic sherwanis. For the evening reception, black tie or formal Indian attire works beautifully. We're keeping our color palette soft and elegant: champagne gold, ivory, and muted pastels. Please avoid wearing white or red, as these colors are reserved for the bride. Most importantly, come comfortable and ready to celebrate!",
    colors: [
      { value: "#C6A15B", label: "Champagne Gold" },
      { value: "#D4AF8C", label: "Blush" },
      { value: "#FAF9F7", label: "Ivory" },
      { value: "#E8D5C4", label: "Sand" },
      { value: "#6B6B6B", label: "Charcoal" },
    ],
    inspirationImages: [],
  },
  travel: {
    cityIntro:
      "Bengaluru, the Garden City, welcomes you with its perfect blend of tradition and modernity. Known for its pleasant weather, vibrant culture, and incredible food scene, the city offers something special for every visitor. Our wedding venue is located in Koramangala, one of the city's most vibrant neighborhoods, surrounded by excellent restaurants, cafes, and cultural attractions. Whether you're arriving from across India or from overseas, we've curated some wonderful accommodation options to make your stay comfortable and memorable.",
    hotels: [
      {
        name: "Halcyon Hotel Residences",
        description:
          "Our primary wedding venue and recommended stay. This luxury hotel offers spacious suites, excellent service, and is just steps away from all wedding events. Perfect for families and guests who want the convenience of staying on-site. The hotel features a beautiful pool, spa facilities, and multiple dining options.",
        address:
          "P.B. 4708, Drafadilla, 9, 5th Main Rd, BDA Layout, 4th Block, Koramangala, Bengaluru 560095",
        website: "https://maps.app.goo.gl/GgjVoMrJE1nEMK4F6",
      },
      {
        name: "The Oberoi Bengaluru",
        description:
          "For those seeking ultimate luxury, The Oberoi offers world-class amenities, exceptional service, and stunning city views. Located about 20 minutes from the venue, it's perfect for guests who want to explore the city while enjoying five-star comfort.",
        address: "37-39, Mahatma Gandhi Rd, Sampangi Rama Nagara, Bengaluru 560001",
        website: "https://www.oberoihotels.com/hotels-in-bangalore",
      },
      {
        name: "ITC Gardenia",
        description:
          "A beautiful property set in lush gardens, offering a peaceful retreat in the heart of the city. Known for its excellent restaurants and spa, it's ideal for guests who want a relaxing stay with easy access to wedding events.",
        address: "1, Residency Rd, Shanthala Nagar, Ashok Nagar, Bengaluru 560025",
        website: "https://www.itchotels.com/in/en/itcgardenia-bengaluru",
      },
    ],
  },
  thingsToDo: {
    intro:
      "While you're in Bengaluru, we've put together some of our favorite places to explore, eat, and experience the city's vibrant culture. From hidden cafes to historic temples, there's something for everyone.",
    activities: [
      {
        name: "Cubbon Park",
        category: "Nature & Relaxation",
        description:
          "A beautiful 300-acre park in the heart of the city, perfect for morning walks or peaceful afternoons. The park is home to several heritage buildings and offers a serene escape from the city bustle.",
        address: "Kasturba Rd, Ambedkar Veedhi, Sampangi Rama Nagara, Bengaluru 560001",
      },
      {
        name: "Vidhana Soudha",
        category: "Architecture & History",
        description:
          "The magnificent seat of the state legislature, this iconic building is a stunning example of Dravidian architecture. Best visited in the evening when it's beautifully lit.",
        address: "Dr. Ambedkar Veedhi, Sampangi Rama Nagara, Bengaluru 560001",
      },
      {
        name: "MTR (Mavalli Tiffin Room)",
        category: "Dining",
        description:
          "A legendary restaurant serving authentic South Indian breakfast since 1924. Don't miss their famous rava idli, dosas, and filter coffee. Be prepared for queues—it's worth the wait!",
        address: "14, Lalbagh Rd, Near Basavanagudi, Bengaluru 560004",
      },
      {
        name: "Toit Brewpub",
        category: "Dining & Nightlife",
        description:
          "One of Bengaluru's most beloved microbreweries, perfect for evening drinks and excellent food. The wood-fired pizzas and craft beers are exceptional.",
        address: "298, 100 Feet Rd, Indiranagar, Bengaluru 560038",
      },
      {
        name: "Lalbagh Botanical Gardens",
        category: "Nature & Gardens",
        description:
          "A 240-acre botanical garden established in the 18th century, featuring rare plants, a glass house, and beautiful walking paths. The flower show during Republic Day is spectacular.",
        address: "Mavalli, Bengaluru 560004",
      },
      {
        name: "Commercial Street",
        category: "Shopping",
        description:
          "A bustling shopping district perfect for picking up traditional textiles, jewelry, and souvenirs. Great for bargaining and finding unique finds.",
        address: "Commercial St, Shivajinagar, Bengaluru 560001",
      },
      {
        name: "ISKCON Temple",
        category: "Spiritual & Culture",
        description:
          "A beautiful, modern temple complex dedicated to Lord Krishna. The architecture is stunning, and the peaceful atmosphere makes it a wonderful place to visit.",
        address: "Hare Krishna Hill, Chord Rd, Rajajinagar, Bengaluru 560010",
      },
    ],
  },
  registry: {
    introText:
      "Your presence at our wedding is the greatest gift we could ask for. However, if you'd like to honor us with a gift, we've created registries to help you choose something meaningful. We're also saving for our honeymoon to the Maldives and would be grateful for contributions toward that dream.",
    links: [
      {
        label: "Amazon Wedding Registry",
        url: "https://www.amazon.in/wedding/registry",
      },
      {
        label: "Honeymoon Fund",
        url: "https://www.honeymoonwishes.com",
      },
    ],
  },
  guestNotes: {
    messages: [
      {
        text: "So excited to celebrate with you both! Can't wait to see you tie the knot. Wishing you a lifetime of happiness and adventures together!",
        author: "Priya & Rahul",
      },
      {
        text: "Congratulations on finding each other! Your love story is beautiful and inspiring. Here's to many years of laughter, love, and wonderful memories.",
        author: "Aunt Meera",
      },
      {
        text: "Pooja and Siva, you two are perfect together. Wishing you endless joy, countless adventures, and a love that grows stronger every day. Can't wait for the celebrations!",
        author: "Anjali & Vikram",
      },
      {
        text: "To the most beautiful couple! Your journey together has been amazing to witness. May your marriage be filled with love, laughter, and all the happiness in the world.",
        author: "Uncle Rajesh",
      },
    ],
  },
  faq: {
    questions: [
      {
        question: "What is the dress code for the wedding?",
        answer:
          "We're embracing traditional Indian festive wear for the ceremonies—rich silks, elegant saris, and classic sherwanis are perfect. For the evening reception, black tie or formal Indian attire works beautifully. We're keeping our color palette soft: champagne gold, ivory, and muted pastels. Please avoid wearing white or red, as these colors are reserved for the bride.",
      },
      {
        question: "What time should I arrive for the ceremonies?",
        answer:
          "Please arrive 30 minutes before each ceremony begins. This gives you time to find parking, get settled, and enjoy the pre-ceremony atmosphere. We'll send detailed timings closer to the date.",
      },
      {
        question: "Is parking available at the venue?",
        answer:
          "Yes! Complimentary valet parking is available at Halcyon Hotel Residences for all wedding events. If you're staying at the hotel, you can also leave your car there and walk to the event spaces.",
      },
      {
        question: "Will the ceremonies be conducted in English or Hindi?",
        answer:
          "The ceremonies will be conducted in a mix of Hindi, Sanskrit, and English. We'll have translations available for key parts, and our priest will explain the significance of each ritual.",
      },
      {
        question: "Are children welcome at the wedding?",
        answer:
          "Absolutely! We love children and they're very welcome at all events. We'll have a kids' corner at the reception with activities and games to keep the little ones entertained.",
      },
      {
        question: "What if I have dietary restrictions?",
        answer:
          "Please let us know about any dietary restrictions or allergies when you RSVP. We'll ensure there are delicious options available for everyone, including vegetarian, vegan, Jain, and gluten-free choices.",
      },
      {
        question: "Is there a gift registry?",
        answer:
          "Your presence is the greatest gift! However, if you'd like to honor us with a gift, we've created registries (links available on the Registry page). We're also saving for our honeymoon to the Maldives and would be grateful for contributions toward that dream.",
      },
      {
        question: "What's the weather like in Bengaluru in May?",
        answer:
          "May in Bengaluru is warm but pleasant, with temperatures typically ranging from 24°C to 35°C (75°F to 95°F). Evenings are usually cooler and comfortable. We recommend light, breathable fabrics and bringing a light shawl or jacket for evening events.",
      },
    ],
  },
  contact: {
    title:
      "Have questions or need assistance? Our wedding planning team is here to help make your experience seamless and enjoyable.",
    contacts: [
      {
        name: "Meera Sharma",
        role: "Wedding Coordinator",
        email: "meera@weddingplanners.in",
        phone: "+91 98765 43210",
      },
      {
        name: "Rohit Kapoor",
        role: "Event Manager",
        email: "rohit@halcyonhotels.com",
        phone: "+91 98765 43211",
      },
    ],
    email: "pooja.siva.wedding@gmail.com",
    phone: "+91 98765 43212",
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
      countdownTarget: (() => {
        const existingTarget = (existingData.wedding as Record<string, unknown>)
          ?.countdownTarget as string | undefined;
        if (existingTarget) {
          // Check if the existing date is in the past
          const existingDate = new Date(existingTarget);
          const now = new Date();
          if (!Number.isNaN(existingDate.getTime()) && existingDate > now) {
            // Existing date is valid and in the future, use it
            return existingTarget;
          }
        }
        // Use default if missing or in the past
        return editorialEleganceDefaults.wedding.countdownTarget;
      })(),
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
    quote: {
      ...editorialEleganceDefaults.quote,
      ...(existingData.quote as Record<string, unknown>),
      // If attribution is "Rumi" or "RUMI", replace with groom's name
      attribution: (() => {
        const existingAttribution = (existingData.quote as Record<string, unknown>)?.attribution as
          | string
          | undefined;
        const groomName =
          ((existingData.couple as Record<string, unknown>)?.groom?.name as string | undefined) ||
          editorialEleganceDefaults.couple.groom.name;
        if (
          existingAttribution &&
          (existingAttribution.toLowerCase() === "rumi" || existingAttribution === "RUMI")
        ) {
          return groomName;
        }
        return existingAttribution || groomName;
      })(),
    },
    story: {
      ...editorialEleganceDefaults.story,
      ...(existingData.story as Record<string, unknown>),
      chapters:
        (existingData.story as Record<string, unknown>)?.chapters &&
        Array.isArray((existingData.story as Record<string, unknown>).chapters) &&
        ((existingData.story as Record<string, unknown>).chapters as unknown[]).length
          ? ((existingData.story as Record<string, unknown>).chapters as unknown[])
          : editorialEleganceDefaults.story.chapters,
      pullQuotes:
        (existingData.story as Record<string, unknown>)?.pullQuotes &&
        Array.isArray((existingData.story as Record<string, unknown>).pullQuotes) &&
        ((existingData.story as Record<string, unknown>).pullQuotes as unknown[]).length
          ? ((existingData.story as Record<string, unknown>).pullQuotes as unknown[])
          : editorialEleganceDefaults.story.pullQuotes,
    },
    dressCode: {
      ...editorialEleganceDefaults.dressCode,
      ...(existingData.dressCode as Record<string, unknown>),
      colors:
        (existingData.dressCode as Record<string, unknown>)?.colors &&
        Array.isArray((existingData.dressCode as Record<string, unknown>).colors) &&
        ((existingData.dressCode as Record<string, unknown>).colors as unknown[]).length
          ? ((existingData.dressCode as Record<string, unknown>).colors as unknown[])
          : editorialEleganceDefaults.dressCode.colors,
      inspirationImages:
        (existingData.dressCode as Record<string, unknown>)?.inspirationImages &&
        Array.isArray((existingData.dressCode as Record<string, unknown>).inspirationImages) &&
        ((existingData.dressCode as Record<string, unknown>).inspirationImages as unknown[]).length
          ? ((existingData.dressCode as Record<string, unknown>).inspirationImages as unknown[])
          : editorialEleganceDefaults.dressCode.inspirationImages,
    },
    travel: {
      ...editorialEleganceDefaults.travel,
      ...(existingData.travel as Record<string, unknown>),
      hotels:
        (existingData.travel as Record<string, unknown>)?.hotels &&
        Array.isArray((existingData.travel as Record<string, unknown>).hotels) &&
        ((existingData.travel as Record<string, unknown>).hotels as unknown[]).length
          ? ((existingData.travel as Record<string, unknown>).hotels as unknown[])
          : editorialEleganceDefaults.travel.hotels,
    },
    thingsToDo: {
      ...editorialEleganceDefaults.thingsToDo,
      ...(existingData.thingsToDo as Record<string, unknown>),
      activities:
        (existingData.thingsToDo as Record<string, unknown>)?.activities &&
        Array.isArray((existingData.thingsToDo as Record<string, unknown>).activities) &&
        ((existingData.thingsToDo as Record<string, unknown>).activities as unknown[]).length
          ? ((existingData.thingsToDo as Record<string, unknown>).activities as unknown[])
          : editorialEleganceDefaults.thingsToDo.activities,
    },
    registry: {
      ...editorialEleganceDefaults.registry,
      ...(existingData.registry as Record<string, unknown>),
      links:
        (existingData.registry as Record<string, unknown>)?.links &&
        Array.isArray((existingData.registry as Record<string, unknown>).links) &&
        ((existingData.registry as Record<string, unknown>).links as unknown[]).length
          ? ((existingData.registry as Record<string, unknown>).links as unknown[])
          : editorialEleganceDefaults.registry.links,
    },
    guestNotes: {
      ...editorialEleganceDefaults.guestNotes,
      ...(existingData.guestNotes as Record<string, unknown>),
      messages:
        (existingData.guestNotes as Record<string, unknown>)?.messages &&
        Array.isArray((existingData.guestNotes as Record<string, unknown>).messages) &&
        ((existingData.guestNotes as Record<string, unknown>).messages as unknown[]).length
          ? ((existingData.guestNotes as Record<string, unknown>).messages as unknown[])
          : editorialEleganceDefaults.guestNotes.messages,
    },
    faq: {
      ...editorialEleganceDefaults.faq,
      ...(existingData.faq as Record<string, unknown>),
      questions:
        (existingData.faq as Record<string, unknown>)?.questions &&
        Array.isArray((existingData.faq as Record<string, unknown>).questions) &&
        ((existingData.faq as Record<string, unknown>).questions as unknown[]).length
          ? ((existingData.faq as Record<string, unknown>).questions as unknown[])
          : editorialEleganceDefaults.faq.questions,
    },
    contact: {
      ...editorialEleganceDefaults.contact,
      ...(existingData.contact as Record<string, unknown>),
      contacts:
        (existingData.contact as Record<string, unknown>)?.contacts &&
        Array.isArray((existingData.contact as Record<string, unknown>).contacts) &&
        ((existingData.contact as Record<string, unknown>).contacts as unknown[]).length
          ? ((existingData.contact as Record<string, unknown>).contacts as unknown[])
          : editorialEleganceDefaults.contact.contacts,
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
            "quote",
            "story",
            "dressCode",
            "travel",
            "thingsToDo",
            "registry",
            "guestNotes",
            "faq",
            "contact",
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
