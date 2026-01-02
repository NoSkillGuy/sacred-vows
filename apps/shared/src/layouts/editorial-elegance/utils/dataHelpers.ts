/**
 * Data Helper Utilities
 * Centralized functions for parsing and normalizing invitation data
 */

/**
 * Parse invitation data from various formats (string, array, object) to a normalized object
 * @param data - Data in any format (string, array, object, null, undefined)
 * @param fallback - Fallback object to use if data is invalid (default: {})
 * @returns Normalized data object
 */
export function parseInvitationData(
  data: unknown,
  fallback: Record<string, unknown> = {}
): Record<string, unknown> {
  // Handle string data (JSON)
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      // Ensure parsed result is an object
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
      return fallback;
    } catch (e) {
      console.warn("Failed to parse data as JSON:", e);
      return fallback;
    }
  }

  // Handle array or invalid types
  if (Array.isArray(data) || !data || typeof data !== "object") {
    return fallback;
  }

  // Return object as-is
  return data as Record<string, unknown>;
}

/**
 * Ensure data is a valid object, converting from string/array if needed
 * @param data - Data to ensure is an object
 * @param fallback - Fallback object if data is invalid
 * @returns Valid object
 */
export function ensureDataIsObject(
  data: unknown,
  fallback: Record<string, unknown> = {}
): Record<string, unknown> {
  return parseInvitationData(data, fallback);
}

/**
 * Calculate section enabled state from manifest section definition
 * @param manifestSection - Section definition from manifest
 * @returns True if section should be enabled
 */
export function calculateSectionEnabled(manifestSection: {
  enabled?: boolean;
  defaultEnabled?: boolean;
}): boolean {
  return (
    manifestSection.enabled !== false &&
    (manifestSection.enabled === true || manifestSection.defaultEnabled !== false)
  );
}
