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
 * Watermarking system for tracking layout usage
 * Phase 2: Enhanced Protection
 */

/**
 * Generate invisible watermark data
 * Embeds user/session identifiers in rendered output
 */
export function generateWatermark(userId?: string, invitationId?: string): string {
  const timestamp = Date.now();
  const data = {
    u: userId || "anonymous",
    i: invitationId || "unknown",
    t: timestamp,
    v: "1.0",
  };

  // Encode as base64 for embedding
  const encoded = btoa(JSON.stringify(data));
  return encoded;
}

/**
 * Embed watermark in HTML as invisible data attribute
 */
export function embedWatermarkInHTML(html: string, watermark: string): string {
  // Embed watermark in body tag
  const watermarkAttr = `data-watermark="${watermark}"`;

  // Add to body tag if it exists
  if (html.includes("<body")) {
    html = html.replace(/<body([^>]*)>/, `<body$1 ${watermarkAttr}>`);
  } else {
    // Add body tag with watermark if it doesn't exist
    html = html.replace("</html>", `<body ${watermarkAttr}></body></html>`);
  }

  // Also embed in a hidden div for redundancy
  const hiddenDiv = `<div style="display:none;position:absolute;left:-9999px;" data-wm="${watermark}"></div>`;

  if (html.includes("</body>")) {
    html = html.replace("</body>", `${hiddenDiv}</body>`);
  }

  return html;
}

/**
 * Embed watermark in CSS as invisible content
 */
export function embedWatermarkInCSS(css: string, watermark: string): string {
  // Add watermark as invisible CSS comment and pseudo-element content
  const watermarkComment = `/* wm:${watermark} */\n`;
  const watermarkRule = `
  body::before {
    content: "${watermark}";
    display: none;
    position: absolute;
    left: -9999px;
  }
  `;

  return watermarkComment + css + watermarkRule;
}

/**
 * Generate watermark script for injection
 */
export function getWatermarkScript(userId?: string, invitationId?: string): string {
  const watermark = generateWatermark(userId, invitationId);

  return `
(function() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var watermark = ${JSON.stringify(watermark)};

  // Embed watermark in body
  if (document.body) {
    document.body.setAttribute('data-watermark', watermark);

    // Add hidden div
    var hiddenDiv = document.createElement('div');
    hiddenDiv.style.cssText = 'display:none;position:absolute;left:-9999px;';
    hiddenDiv.setAttribute('data-wm', watermark);
    document.body.appendChild(hiddenDiv);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.body) {
        document.body.setAttribute('data-watermark', watermark);
        var hiddenDiv = document.createElement('div');
        hiddenDiv.style.cssText = 'display:none;position:absolute;left:-9999px;';
        hiddenDiv.setAttribute('data-wm', watermark);
        document.body.appendChild(hiddenDiv);
      }
    });
  }
})();
`.trim();
}

/**
 * Extract watermark from HTML (for verification)
 */
export function extractWatermarkFromHTML(html: string): string | null {
  // Try to extract from body data attribute
  const bodyMatch = html.match(/<body[^>]*data-watermark="([^"]+)"/);
  if (bodyMatch) {
    return bodyMatch[1];
  }

  // Try to extract from hidden div
  const divMatch = html.match(/data-wm="([^"]+)"/);
  if (divMatch) {
    return divMatch[1];
  }

  return null;
}
