/**
 * Copyright (c) 2024 Sacred Vows. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 */

import { LEGAL_WARNINGS } from "./legal-warnings";

/**
 * Generate copyright footer HTML as string for injection into templates
 */
export function getCopyrightFooterHTML(): string {
  return `
<footer style="position: relative; width: 100%; padding: 15px 20px; text-align: center; background-color: rgba(0, 0, 0, 0.05); border-top: 1px solid rgba(0, 0, 0, 0.1); font-size: 11px; color: #666; font-family: Arial, sans-serif; line-height: 1.5; z-index: 1;">
  <p style="margin: 0; padding: 0;">${LEGAL_WARNINGS.copyright}</p>
  <p style="margin: 5px 0 0 0; padding: 0; font-size: 10px; color: #999;">Unauthorized copying, reproduction, or distribution is strictly prohibited and may result in legal action.</p>
</footer>
`.trim();
}

