/**
 * Classic Scroll Layout Export Styles
 * 
 * Generates CSS for exporting the classic-scroll layout.
 * This ensures styles in the export match the builder preview.
 */

/**
 * Generate CSS for the invitation export
 * @param {Object} invitation - Invitation data with layoutConfig
 * @returns {Promise<string>} CSS content
 */
export async function generateCSS(invitation) {
  const { layoutConfig, data } = invitation;
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

  // Base CSS that will be expanded with the actual layout styles
  const baseCSS = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: "${fonts.body || 'Poppins'}", system-ui, sans-serif;
      background: ${colors.background || '#fff8f0'};
      color: ${colors.text || '#2f2933'};
      -webkit-font-smoothing: antialiased;
      line-height: 1.6;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: "${fonts.heading || 'Playfair Display'}", serif;
      font-weight: 600;
    }

    .script-font {
      font-family: "${fonts.script || 'Great Vibes'}", cursive;
    }

    img {
      max-width: 100%;
      display: block;
    }

    a {
      color: ${colors.primary || '#d4af37'};
      text-decoration: none;
    }

    button {
      font-family: "${fonts.body || 'Poppins'}", system-ui, sans-serif;
      background: ${colors.primary || '#d4af37'};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    button:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }

    /* Additional layout-specific styles will be included here */
  `;

  return baseCSS;
}

export default generateCSS;

