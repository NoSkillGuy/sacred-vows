/**
 * Classic Scroll Layout Export Template
 * 
 * Generates HTML for exporting the classic-scroll layout invitation.
 * This ensures the exported invitation matches exactly what was built in the builder.
 */

import type { InvitationData } from '@shared/types/wedding-data';

/**
 * Generate complete HTML for the invitation export
 * @param invitation - Invitation data with layoutConfig and data
 * @param translations - Translation data
 * @returns Promise with complete HTML document
 */
export async function generateHTML(
  invitation: InvitationData,
  translations?: Record<string, unknown>
): Promise<string> {
  const { data, layoutConfig } = invitation;
  const couple = data?.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const wedding = data?.wedding || {};
  const venue = wedding?.venue || {};
  
  const brideName = bride.name || 'Bride';
  const groomName = groom.name || 'Groom';
  const weddingDate = wedding.dates?.join(' & ') || 'Date TBD';
  const venueName = venue.name || 'Venue TBD';
  const venueAddress = venue.address || 'Address TBD';
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};

  // Generate inline styles based on theme
  const themeStyles = `
    :root {
      --bg-page: ${colors.background?.page || colors.background || '#fff8f0'};
      --bg-card: ${colors.background?.card || colors.background?.section || '#fff7ee'};
      --border-gold: ${colors.primary || '#d4af37'};
      --accent-gold: ${colors.primary || '#d4af37'};
      --accent-rose: ${colors.accent || '#c27d88'};
      --text-main: ${colors.text?.primary || colors.text || '#2f2933'};
      --text-muted: ${colors.text?.muted || colors.text || '#6c5b5b'};
      --button-primary: ${colors.primary || '#7c2831'};
      --font-heading: ${theme.fonts?.heading || 'Playfair Display'};
      --font-body: ${theme.fonts?.body || 'Poppins'};
      --font-script: ${theme.fonts?.script || 'Great Vibes'};
    }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Wedding invitation for ${brideName} & ${groomName}" />
  
  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="${colors.primary || '#d4af37'}" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="${brideName} & ${groomName} Wedding" />
  <meta name="mobile-web-app-capable" content="yes" />

  <!-- Manifest -->
  <link rel="manifest" href="./manifest.json" />
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600&family=Great+Vibes&display=swap" rel="stylesheet" />
  
  <title>${brideName} & ${groomName} - Wedding Invitation</title>
  <link rel="stylesheet" href="styles.css" />
  <style>${themeStyles}</style>
</head>
<body>
  <div id="root">
    <!-- Invitation content will be rendered by the layout components -->
    <div style="padding: 40px; text-align: center; font-family: var(--font-body);">
      <h1 style="font-family: var(--font-heading); color: var(--text-main); margin-bottom: 20px;">
        ${brideName} & ${groomName}
      </h1>
      <p style="font-size: 18px; color: var(--text-muted); margin-bottom: 10px;">
        ${weddingDate}
      </p>
      <p style="font-size: 16px; color: var(--text-muted);">
        ${venueName}<br/>
        ${venueAddress}
      </p>
      <p style="margin-top: 40px; font-size: 14px; color: var(--text-muted);">
        This invitation was created with Sacred Vows Wedding Invitation Builder
      </p>
    </div>
  </div>
  
  <script src="app.js"></script>
</body>
</html>`;
}

export default generateHTML;

