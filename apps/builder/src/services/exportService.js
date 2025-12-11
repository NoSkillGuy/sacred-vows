import JSZip from 'jszip';

/**
 * Client-side export service
 * Generates static HTML site from invitation data
 */

/**
 * Generate complete HTML for the invitation
 */
export function generateInvitationHTML(invitationData, translations) {
  const couple = invitationData.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const wedding = invitationData.wedding || {};
  const venue = invitationData.venue || {};
  
  const brideName = bride.name || 'Bride';
  const groomName = groom.name || 'Groom';
  const weddingDate = wedding.dates?.join(' & ') || 'Date TBD';
  const venueName = venue.name || 'Venue TBD';
  const venueAddress = venue.address || 'Address TBD';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Wedding invitation for ${brideName} & ${groomName}" />
  
  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="#d4af37" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="${brideName} & ${groomName} Wedding Invite" />
  <meta name="mobile-web-app-capable" content="yes" />

  <!-- Manifest -->
  <link rel="manifest" href="./manifest.json" />
  
  <!-- Apple Touch Icons -->
  <link rel="apple-touch-icon" href="./assets/photos/icons/logo.jpeg" />
  <link rel="icon" type="image/jpeg" href="./assets/photos/icons/logo.jpeg" />

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600&family=Great+Vibes&display=swap" rel="stylesheet" />
  
  <title>${brideName} & ${groomName} - Wedding Invitation</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div id="root">
    <!-- Invitation content will be rendered by React -->
    <div style="padding: 40px; text-align: center; font-family: 'Poppins', sans-serif;">
      <h1 style="font-family: 'Playfair Display', serif; color: #7c2831; margin-bottom: 20px;">
        ${brideName} & ${groomName}
      </h1>
      <p style="font-size: 18px; color: #6c5b5b; margin-bottom: 10px;">${weddingDate}</p>
      <p style="font-size: 16px; color: #6c5b5b;">${venueName}</p>
      <p style="font-size: 14px; color: #999; margin-top: 20px;">${venueAddress}</p>
      <p style="margin-top: 40px; color: #999; font-size: 12px;">
        This is a static export. The full interactive version requires JavaScript.
      </p>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`;
}

/**
 * Export invitation as downloadable ZIP file
 */
export async function exportInvitationAsZip(invitationData, translations) {
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

  const png1x1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
  const jpeg1x1 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhISEhIVFRUVFRUVFRUVFRUVFRUWFxUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGi0lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAKgBLAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYBAwQCB//EADwQAAEDAgQDBgQEBQQCAwAAAAEAAhEDIQQSMUEFUWFxBhMicYGRoQcjQrHB0fAHFSNSYuEzgpKiFf/EABoBAQADAQEBAAAAAAAAAAAAAAABAgMEBQb/xAAuEQACAgECBAMIAwEBAAAAAAAAAQIRAxIhMUETIlFhBRQycaGxwTNScpHB0f/aAAwDAQACEQMRAD8A9xREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQf/2Q==';
  
  // Generate HTML
  const html = generateInvitationHTML(invitationData, translations);
  zip.file('index.html', html);
  zip.file('manifest.json', manifest);
  zip.file('assets/photos/icons/icon-192.png', png1x1, { base64: true });
  zip.file('assets/photos/icons/icon-512.png', png1x1, { base64: true });
  zip.file('assets/photos/icons/logo.jpeg', jpeg1x1, { base64: true });
  
  // Add placeholder files (in production, these would be actual bundled files)
  zip.file('styles.css', '/* Styles will be included in production */');
  zip.file('app.js', '// JavaScript will be included in production');
  zip.file('README.txt', `Wedding Invitation Export
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
`);
  
  // Generate and download ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
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
 */
export function exportInvitationAsJSON(invitationData) {
  const dataStr = JSON.stringify(invitationData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = window.URL.createObjectURL(dataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wedding-invitation-data-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

