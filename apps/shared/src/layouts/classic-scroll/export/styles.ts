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
 * Classic Scroll Layout Export Styles
 *
 * Generates CSS for exporting the classic-scroll layout.
 * This ensures styles in the export match the builder preview.
 */

import type { InvitationData } from "../../../types/wedding-data";

// Import the actual CSS content
import mainCSS from "../styles/main.css?inline";
import editableTextCSS from "../styles/EditableText.css?inline";
import editableImageCSS from "../styles/EditableImage.css?inline";

/**
 * Generate CSS for the invitation export
 * @param invitation - Invitation data with layoutConfig
 * @returns Promise with CSS content
 */
export async function generateCSS(invitation: InvitationData): Promise<string> {
  // Return the actual layout CSS files concatenated together
  // The main.css already includes all the necessary styles for the published site
  return `${mainCSS}\n\n${editableTextCSS}\n\n${editableImageCSS}`;
}

export default generateCSS;
