/**
 * Copyright (c) 2024 Sacred Vows. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 */

import { getConsoleProtectionScript } from "./console-protection";
import { getDevToolsDetectionScript } from "./devtools-detection";
import { getRightClickProtectionScript } from "./right-click-protection";
import { getLegalHTMLComment } from "./legal-warnings";
import { getCopyrightFooterHTML } from "./copyright-footer";
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
 * Generate a CSP nonce for inline scripts
 * Uses crypto API if available, otherwise falls back to random string
 */
export function generateCSPNonce(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/[+/=]/g, "")
      .substring(0, 16);
  }
  // Fallback for environments without crypto API
  return Math.random().toString(36).substring(2, 18);
}

/**
 * Generate Content Security Policy header with nonce
 * @param nonce - Nonce value for inline scripts
 * @returns CSP header value
 */
export function generateCSPHeader(nonce: string): string {
  return `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-src 'self' https://www.google.com https://maps.google.com;`;
}

/**
 * Generate complete protection bundle for injection into published HTML
 * @param isProduction - Whether to enable full protection (default: true)
 * @param userId - Optional user ID for watermarking
 * @param invitationId - Optional invitation ID for watermarking
 * @returns Object containing HTML comment, protection script, copyright footer, decoy comments, nonce, and CSP header
 */
export function generateProtectionBundle(
  isProduction = true,
  userId?: string,
  invitationId?: string
) {
  const htmlComment = getLegalHTMLComment();
  const decoyComments = generateDecoyComments();
  const nonce = generateCSPNonce();

  const protectionScript = isProduction
    ? `
${getConsoleProtectionScript()}

${/* Disabled devtools detection due to false positives */ ""}
${/* ${getDevToolsDetectionScript(isProduction)} */ ""}

${getRightClickProtectionScript(isProduction)}

${getIntegrityCheckScript()}

${getWatermarkScript(userId, invitationId)}
`.trim()
    : "";
  const copyrightFooter = getCopyrightFooterHTML();
  const cspHeader = generateCSPHeader(nonce);

  return {
    htmlComment,
    decoyComments,
    protectionScript,
    copyrightFooter,
    nonce,
    cspHeader,
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

