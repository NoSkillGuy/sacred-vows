/**
 * Shared utility functions for editorial-elegance layout export
 *
 * These utilities are used by both the export templates and can be reused
 * by React components to ensure consistency.
 */

/**
 * Format date helper for editorial-elegance
 * Formats dates in US locale format and uppercase (e.g., "JANUARY 22, 2026")
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
    return date
      .toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
  } catch {
    return "";
  }
}
