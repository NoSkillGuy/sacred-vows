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

import { getConsoleProtectionScript } from "./console-protection";
import { getDevToolsDetectionScript } from "./devtools-detection";
import { getRightClickProtectionScript } from "./right-click-protection";
import { getLegalHTMLComment } from "./legal-warnings";
import { getCopyrightFooterHTML } from "../components/Legal/CopyrightFooter";
import { getIntegrityCheckScript } from "./integrity-checks";
import { getWatermarkScript } from "./watermarking";

/**
 * Generate decoy HTML comments to confuse scrapers
 */
function generateDecoyComments(): string {
  return `<!--
  This is a standard wedding invitation template.
  Template ID: INV-TPL-${Math.random().toString(36).substring(7)}
  Version: 2.1.3
  Last Updated: ${new Date().toISOString()}

  Standard template variables:
  - coupleName: string
  - weddingDate: Date
  - venue: object
  - theme: object

  Template engine: standard-html-v2
  Render mode: static
-->
<!--
  Additional template metadata:
  - framework: vanilla-js
  - styling: inline-css
  - assets: cdn-hosted
  - analytics: disabled
-->`;
}

/**
 * Generate complete protection bundle for injection into published HTML
 * @param isProduction - Whether to enable full protection (default: true)
 * @param userId - Optional user ID for watermarking
 * @param invitationId - Optional invitation ID for watermarking
 * @returns Object containing HTML comment, protection script, copyright footer, and decoy comments
 */
export function generateProtectionBundle(
  isProduction = true,
  userId?: string,
  invitationId?: string
) {
  const htmlComment = getLegalHTMLComment();
  const decoyComments = generateDecoyComments();

  const protectionScript = isProduction
    ? `
${getConsoleProtectionScript()}

${getDevToolsDetectionScript(isProduction)}

${getRightClickProtectionScript(isProduction)}

${getIntegrityCheckScript()}

${getWatermarkScript(userId, invitationId)}
`.trim()
    : "";
  const copyrightFooter = getCopyrightFooterHTML();

  return {
    htmlComment,
    decoyComments,
    protectionScript,
    copyrightFooter,
  };
}

/**
 * Generate complete protection script tag for injection into HTML head
 */
export function getProtectionScriptTag(isProduction = true): string {
  const bundle = generateProtectionBundle(isProduction);
  if (!bundle.protectionScript) {
    return "";
  }

  return `<script>
${bundle.protectionScript}
</script>`;
}
