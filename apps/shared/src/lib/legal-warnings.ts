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

  rightClick: `⚠️ COPYRIGHT PROTECTION NOTICE ⚠️

This website and all its content, including but not limited to layouts, designs, images, text, graphics, code, and styling, are the exclusive property of Sacred Vows and are protected by United States and international copyright laws, trademark laws, and other intellectual property laws.

UNAUTHORIZED COPYING, REPRODUCTION, DISTRIBUTION, MODIFICATION, OR USE OF ANY CONTENT FROM THIS WEBSITE IS STRICTLY PROHIBITED AND CONSTITUTES COPYRIGHT INFRINGEMENT.

Violators may be subject to:
• Civil liability for damages, including statutory damages up to $150,000 per work infringed
• Criminal prosecution under 17 U.S.C. § 506 and 18 U.S.C. § 2319
• Injunctive relief and attorney's fees
• Seizure and destruction of infringing materials

This content is proprietary and confidential. Any unauthorized access, copying, or use may result in severe legal consequences, including both civil and criminal penalties.

For licensing inquiries, contact: legal@sacredvows.com`,

  copyright: `© 2024 Sacred Vows. All Rights Reserved.

This website and all its contents are protected by copyright law. Unauthorized copying, reproduction, distribution, modification, or use of any content is strictly prohibited and may result in severe civil and criminal penalties under United States and international copyright laws.

For licensing inquiries: legal@sacredvows.com`,
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
  return "© 2024 Sacred Vows. All Rights Reserved. This website and all its contents are protected by copyright law. Unauthorized copying, reproduction, distribution, or use is strictly prohibited and may result in severe civil and criminal penalties. For licensing inquiries: legal@sacredvows.com";
}
