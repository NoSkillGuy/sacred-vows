/**
 * Classic Scroll Layout Export
 * 
 * Export functionality for generating static HTML/CSS from classic-scroll layout
 */

import type { InvitationData } from '@shared/types/wedding-data';
import { generateHTML } from './template';
import { generateCSS } from './styles';

/**
 * Export the invitation as a complete static site
 * @param invitation - Invitation data
 * @param translations - Translation data
 * @returns Promise with export result containing HTML, CSS, and assets
 */
export async function exportInvitation(
  invitation: InvitationData,
  translations?: Record<string, unknown>
): Promise<{ html: string; css: string; assets: unknown[] }> {
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

