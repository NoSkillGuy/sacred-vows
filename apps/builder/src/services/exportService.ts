/**
 * Copyright (c) 2024 Sacred Vows. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file and its contents are proprietary to Sacred Vows and protected by
 * copyright law. Unauthorized copying, reproduction, distribution, or use of
 * this file, via any medium, is strictly prohibited and may result in severe
 * civil and criminal penalties.
 *
 * For licensing inquiries, contact: legal@sacredvows.com
 */

import JSZip from "jszip";
import { getLayout, getLayoutExport } from "../layouts/registry";
import type { InvitationData } from "@shared/types/wedding-data";
// Import layouts to ensure they're registered
import "../layouts/classic-scroll";
import "../layouts/editorial-elegance";

/**
 * Client-side export service
 * Generates static HTML site from invitation data using layout-specific export templates
 */

/**
 * Generate complete HTML for the invitation using layout-specific template
 * @param invitation - Complete invitation object with layoutId, data, and layoutConfig
 * @param translations - Translation data
 * @returns Generated HTML
 */
export async function generateInvitationHTML(
  invitation: InvitationData,
  translations?: Record<string, unknown> | null
): Promise<string> {
  const layoutId = invitation.layoutId || "classic-scroll";

  try {
    // Get layout-specific export functions from registry
    const layout = getLayout(layoutId);
    if (!layout) {
      throw new Error(`Layout "${layoutId}" not found in registry`);
    }

    const layoutExport = getLayoutExport(layoutId);
    if (!layoutExport.generateHTML) {
      throw new Error(`Layout "${layoutId}" does not provide generateHTML export function`);
    }

    // Use layout-specific HTML generation
    const html = await layoutExport.generateHTML(invitation, translations);
    return html;
  } catch (error) {
    console.error("Failed to generate HTML:", error);
    // Fallback to basic HTML
    return generateFallbackHTML(invitation);
  }
}

/**
 * Fallback HTML generation if layout-specific generation fails
 */
function generateFallbackHTML(invitation: InvitationData): string {
  const { data } = invitation;
  const couple = data?.couple || { bride: {}, groom: {} };
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const wedding = data?.wedding || {};
  const venue = wedding?.venue || {};

  const brideName = bride.name || "Bride";
  const groomName = groom.name || "Groom";
  const weddingDate = wedding.dates?.join(" & ") || "Date TBD";
  const venueName = venue.name || "Venue TBD";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brideName} & ${groomName} - Wedding Invitation</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 40px; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>${brideName} & ${groomName}</h1>
  <p>${weddingDate}</p>
  <p>${venueName}</p>
  <p style="margin-top: 40px; color: #999; font-size: 12px;">
    Wedding Invitation - Created with Sacred Vows
  </p>
</body>
</html>`;
}

/**
 * Export invitation as downloadable ZIP file
 */
export async function exportInvitationAsZip(
  invitationData: InvitationData,
  translations?: Record<string, unknown> | null
): Promise<Blob> {
  const zip = new JSZip();
  const manifest = `{
  "name": "Priya & Saurabh Wedding Invitation",
  "short_name": "Priya & Saurabh Wedding Invite",
  "description": "Royal wedding invitation of Capt (Dr) Priya Singh & Dr Saurabh Singh",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#fff8f0",
  "theme_color": "#d4af37",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "assets/photos/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "assets/photos/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    { "name": "RSVP", "short_name": "RSVP", "description": "Quick RSVP", "url": "/#rsvp", "icons": [{ "src": "assets/photos/icons/icon-192.png", "sizes": "96x96", "type": "image/png" }] },
    { "name": "Program", "short_name": "Program", "description": "View program details", "url": "/#events", "icons": [{ "src": "assets/photos/icons/icon-192.png", "sizes": "96x96", "type": "image/png" }] }
  ]
}`;

  const png1x1 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
  const jpeg1x1 =
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhISEhIVFRUVFRUVFRUVFRUVFRUWFxUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGi0lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAKgBLAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBAwQCB//EADwQAAEDAgQDBgQEBQQCAwAAAAEAAhEDIQQSMUEFUWFxBhMicYGRoQcjQrHB0fAHFSNSYuEzgpKiFf/EABoBAQADAQEBAAAAAAAAAAAAAAABAgMEBQb/xAAuEQACAgECBAMIAwEBAAAAAAAAAQIRAxIhMUETIlFhBRQycaGxwTNScpHB0f/aAAwDAQACEQMRAD8A9xREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQf/2Q==";

  // Generate HTML
  const html = await generateInvitationHTML(invitationData, translations);
  zip.file("index.html", html);
  zip.file("manifest.json", manifest);
  zip.file("assets/photos/icons/icon-192.png", png1x1, { base64: true });
  zip.file("assets/photos/icons/icon-512.png", png1x1, { base64: true });
  zip.file("assets/photos/icons/logo.jpeg", jpeg1x1, { base64: true });

  // Add placeholder files (in production, these would be actual bundled files)
  zip.file("styles.css", "/* Styles will be included in production */");
  zip.file("app.js", "// JavaScript will be included in production");
  zip.file(
    "README.txt",
    `Wedding Invitation Export
Generated: ${new Date().toISOString()}

To deploy:
1. Extract this ZIP file
2. Upload all files to your web hosting
3. Access via your domain

For quick deployment:
- Vercel: Drag & drop this folder to vercel.com
- Netlify: Drag & drop this folder to netlify.com
- GitHub Pages: Upload to a GitHub repository and enable Pages

Note: This is a basic export. Full functionality requires the complete build.
`
  );

  // Generate and download ZIP
  const blob = await zip.generateAsync({ type: "blob" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wedding-invitation-${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return blob;
}

/**
 * Export invitation data as JSON (for backup/import)
 * @param invitation - Complete invitation object
 */
export function exportInvitationAsJSON(invitation: InvitationData): void {
  // Export the full invitation object including layoutId and layoutConfig
  const exportData = {
    layoutId: invitation.layoutId || "classic-scroll",
    data: invitation.data,
    layoutConfig: invitation.layoutConfig,
    exportedAt: new Date().toISOString(),
    version: "1.0.0",
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = window.URL.createObjectURL(dataBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wedding-invitation-backup-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
