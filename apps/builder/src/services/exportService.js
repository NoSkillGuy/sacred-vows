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
  
  // Generate HTML
  const html = generateInvitationHTML(invitationData, translations);
  zip.file('index.html', html);
  
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

