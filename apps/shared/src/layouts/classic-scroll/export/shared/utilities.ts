/**
 * Shared utility functions for classic-scroll layout export
 *
 * These utilities are used by both the export templates and can be reused
 * by React components to ensure consistency.
 */

/**
 * Get translation helper - matches React component pattern
 * Handles custom translations from config and falls back to default translations
 */
export function getTranslation(
  key: string,
  config: Record<string, unknown>,
  translations: Record<string, unknown>
): string {
  let customValue: unknown = null;
  if (config?.customTranslations) {
    const keys = key.split(".");
    let current: unknown = config.customTranslations;
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = (current as Record<string, unknown>)[k];
      } else {
        current = null;
        break;
      }
    }
    customValue = current;
  }
  return (customValue as string) || (translations[key] as string) || "";
}

/**
 * Escape HTML entities to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Format date helper
 * Formats dates in Indian locale format (e.g., "22 January 2026")
 */
export function formatDate(dateStr: string | Date | undefined): string {
  if (!dateStr || dateStr === "Date TBD" || dateStr === "") {
    return "";
  }
  try {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
