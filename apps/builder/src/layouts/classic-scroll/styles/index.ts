/**
 * Classic Scroll Layout Styles
 *
 * Imports and applies all styles for the classic-scroll layout.
 */

// Import all layout styles
import "./main.css";
import "./EditableText.css";
import "./EditableImage.css";

/**
 * Apply layout styles dynamically
 * This function is called when the layout is activated
 */
export function applyStyles(): void {
  // Styles are already imported above
  // This function exists for consistency and future dynamic loading
  console.log("Classic Scroll layout styles applied");
}

/**
 * Get CSS string for export
 * @returns Promise with CSS content
 */
export async function getStylesForExport(): Promise<string> {
  // Read the CSS files and return as string
  // This will be used during export generation
  try {
    const [mainCSS, editableTextCSS, editableImageCSS] = await Promise.all([
      fetch(new URL("./main.css", import.meta.url)).then((r) => r.text()),
      fetch(new URL("./EditableText.css", import.meta.url)).then((r) => r.text()),
      fetch(new URL("./EditableImage.css", import.meta.url)).then((r) => r.text()),
    ]);

    return `${mainCSS}\n\n${editableTextCSS}\n\n${editableImageCSS}`;
  } catch (error) {
    console.error("Failed to load styles for export:", error);
    return "";
  }
}

export default {
  apply: applyStyles,
  getForExport: getStylesForExport,
};
