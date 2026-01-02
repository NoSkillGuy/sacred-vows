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

/**
 * Classic Scroll Layout Export
 *
 * Export functionality for generating static HTML/CSS from classic-scroll layout
 */

import type { InvitationData } from "../../../types/wedding-data";
import { generateHTML } from "./template";
import { generateCSS } from "./styles";

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
