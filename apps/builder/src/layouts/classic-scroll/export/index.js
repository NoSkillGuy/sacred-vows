/**
 * Classic Scroll Layout Export
 * 
 * Export functionality for generating static HTML/CSS from classic-scroll layout
 */

import { generateHTML } from './template.js';
import { generateCSS } from './styles.js';

/**
 * Export the invitation as a complete static site
 * @param {Object} invitation - Invitation data
 * @param {Object} translations - Translation data
 * @returns {Promise<Object>} Export result with HTML, CSS, and assets
 */
export async function exportInvitation(invitation, translations) {
  const html = await generateHTML(invitation, translations);
  const css = await generateCSS(invitation);
  
  return {
    html,
    css,
    assets: [],
  };
}

export { generateHTML, generateCSS };

export default {
  generateHTML,
  generateCSS,
  exportInvitation,
};

