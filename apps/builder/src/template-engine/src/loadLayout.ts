/**
 * Layout Loader
 * Loads layout configuration and components dynamically
 */

import type { LayoutManifest } from "@shared/types/layout";
import type { UniversalWeddingData } from "@shared/types/wedding-data";

interface LayoutConfig {
  id: string;
  name: string;
  version: string;
  [key: string]: unknown;
}

interface LoadedLayout {
  config: LayoutConfig;
  manifest: LayoutManifest;
}

/**
 * Loads a layout definition (config + manifest) by ID
 * @param layoutId - Layout identifier
 * @returns Promise with layout files
 */
export async function loadLayout(layoutId: string): Promise<LoadedLayout> {
  try {
    // In production, this would fetch from API or load from file system
    const layoutMap: Record<
      string,
      {
        config: () => Promise<{ default?: LayoutConfig; [key: string]: unknown }>;
        manifest: () => Promise<{ default?: LayoutManifest; [key: string]: unknown }>;
      }
    > = {
      "classic-scroll": {
        config: () => import("../../../layouts/classic-scroll/config.json"),
        manifest: () => import("../../../layouts/classic-scroll/manifest.json"),
      },
      "heritage-red": {
        config: () => import("../../../layouts/heritage-red/config.json"),
        manifest: () => import("../../../layouts/heritage-red/manifest.json"),
      },
    };

    const layoutLoader = layoutMap[layoutId];
    if (!layoutLoader) {
      throw new Error(`Layout ${layoutId} not found`);
    }

    const [config, manifest] = await Promise.all([layoutLoader.config(), layoutLoader.manifest()]);

    return {
      config: (config.default || config) as LayoutConfig,
      manifest: (manifest.default || manifest) as LayoutManifest,
    };
  } catch (error) {
    console.error(`Error loading layout ${layoutId}:`, error);
    throw error;
  }
}

/**
 * Merges user data with layout defaults
 * @param layoutConfig - Layout configuration
 * @param userData - User-provided data
 * @returns Merged configuration
 */
export function mergeLayoutData(
  layoutConfig: Record<string, unknown>,
  userData: Record<string, unknown>
): Record<string, unknown> {
  // Deep merge layout defaults with user data
  const merged = {
    ...layoutConfig,
    ...userData,
  };

  // Deep merge nested objects
  if (layoutConfig.couple && userData.couple) {
    const layoutCouple = layoutConfig.couple as Record<string, unknown>;
    const userCouple = userData.couple as Record<string, unknown>;
    merged.couple = {
      bride: {
        ...((layoutCouple.bride as Record<string, unknown>) || {}),
        ...((userCouple.bride as Record<string, unknown>) || {}),
      },
      groom: {
        ...((layoutCouple.groom as Record<string, unknown>) || {}),
        ...((userCouple.groom as Record<string, unknown>) || {}),
      },
    };
  }

  if (layoutConfig.wedding && userData.wedding) {
    const layoutWedding = layoutConfig.wedding as Record<string, unknown>;
    const userWedding = userData.wedding as Record<string, unknown>;
    merged.wedding = {
      ...layoutWedding,
      ...userWedding,
      venue: {
        ...((layoutWedding.venue as Record<string, unknown>) || {}),
        ...((userWedding.venue as Record<string, unknown>) || {}),
      },
    };
  }

  if (layoutConfig.events && userData.events) {
    const layoutEvents = layoutConfig.events as Record<string, unknown>;
    const userEvents = userData.events as Record<string, unknown>;
    merged.events = {
      day1: {
        ...((layoutEvents.day1 as Record<string, unknown>) || {}),
        ...((userEvents.day1 as Record<string, unknown>) || {}),
        events:
          (userEvents.day1 as Record<string, unknown>)?.events ||
          (layoutEvents.day1 as Record<string, unknown>)?.events ||
          [],
      },
      day2: {
        ...((layoutEvents.day2 as Record<string, unknown>) || {}),
        ...((userEvents.day2 as Record<string, unknown>) || {}),
        events:
          (userEvents.day2 as Record<string, unknown>)?.events ||
          (layoutEvents.day2 as Record<string, unknown>)?.events ||
          [],
      },
    };
  }

  if (layoutConfig.gallery && userData.gallery) {
    const userGallery = userData.gallery as Record<string, unknown>;
    const layoutGallery = layoutConfig.gallery as Record<string, unknown>;
    merged.gallery = {
      images: userGallery.images || layoutGallery.images || [],
    };
  }

  if (layoutConfig.rsvp && userData.rsvp) {
    const layoutRsvp = layoutConfig.rsvp as Record<string, unknown>;
    const userRsvp = userData.rsvp as Record<string, unknown>;
    merged.rsvp = {
      ...layoutRsvp,
      contacts: userRsvp.contacts || layoutRsvp.contacts || [],
    };
  }

  return merged;
}

/**
 * Validates layout configuration
 * @param config - Configuration to validate
 * @returns True if valid
 */
export function validateLayoutConfig(config: Record<string, unknown>): boolean {
  const requiredFields = ["id", "name", "version"];
  return requiredFields.every((field) => config[field] !== undefined);
}
