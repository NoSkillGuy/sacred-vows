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
 * Centralized legal warning messages for anti-piracy protection
 */

export const LEGAL_WARNINGS = {
  console: `⚠️ COPYRIGHT WARNING ⚠️
This website and all its layouts are proprietary to Sacred Vows.
Unauthorized copying, reproduction, or distribution is strictly prohibited
and may result in severe legal consequences including civil and criminal penalties.
Copyright © 2024 Sacred Vows. All Rights Reserved.`,

  devtools: `UNAUTHORIZED ACCESS DETECTED
Developer tools access is monitored. All layouts are protected by copyright law.
Unauthorized copying or reverse engineering is strictly prohibited.`,

  rightClick: `Copying is prohibited. All content is protected by copyright.
Unauthorized reproduction may result in legal action.`,

  copyright: `© 2024 Sacred Vows. All Rights Reserved. Unauthorized copying prohibited.`,
} as const;

/**
 * Get HTML comment with legal notice
 */
export function getLegalHTMLComment(): string {
  return `<!--
  Copyright (c) 2024 Sacred Vows. All Rights Reserved.

  PROPRIETARY AND CONFIDENTIAL

  This HTML and all its contents, including layouts, designs, styles, and code,
  are proprietary to Sacred Vows and protected by copyright law.
  Unauthorized copying, reproduction, distribution, or use of this content,
  via any medium, is strictly prohibited and may result in severe
  civil and criminal penalties.

  For licensing inquiries, contact: legal@sacredvows.com
-->`;
}

/**
 * Get meta tag content for copyright notice
 */
export function getCopyrightMetaContent(): string {
  return "© 2024 Sacred Vows. All Rights Reserved. Unauthorized copying prohibited.";
}
