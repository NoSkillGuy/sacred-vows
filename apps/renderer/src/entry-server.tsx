/**
 * SSR Entry Point
 *
 * This file provides the render function that generates static HTML
 * from React components using React's renderToStaticMarkup.
 */

import { renderToStaticMarkup } from "react-dom/server";
import type { InvitationData } from "@shared/types/wedding-data";
import { InvitationPage } from "./InvitationPage";
import { getLayout } from "@shared/layouts";
// Import layouts to ensure they're registered
import "@shared/layouts/classic-scroll";
import "@shared/layouts/editorial-elegance";

/**
 * Allowed image domains for security (SSRF protection)
 */
const ALLOWED_IMAGE_DOMAINS = ['minio:9000', 'localhost:9000'];

/**
 * Maximum image size in bytes (5MB)
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Fetch timeout in milliseconds (5 seconds)
 */
const FETCH_TIMEOUT = 5000;

/**
 * Simple logger that can be configured
 */
const logger = {
  warn: (message: string, ...args: any[]) => {
    // In production, this could send to monitoring service
    // For now, only log in non-production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_LOGGING === 'true') {
      console.warn(message, ...args);
    }
  },
};

/**
 * Validate if an image URL is allowed (SSRF protection)
 */
function isValidImageUrl(url: string): boolean {
  try {
    // Handle relative URLs - skip validation for now (they're handled separately)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }

    const urlObj = new URL(url, 'http://localhost');
    return ALLOWED_IMAGE_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Fetch image with timeout and size limits
 */
async function fetchImageWithLimits(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check content-length header if available
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_SIZE) {
      throw new Error(`Image size (${contentLength} bytes) exceeds maximum (${MAX_IMAGE_SIZE} bytes)`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Image fetch timeout after ${FETCH_TIMEOUT}ms`);
    }
    throw error;
  }
}

/**
 * Read response body with size limit
 */
async function readResponseWithLimit(response: Response): Promise<ArrayBuffer> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.length;
      if (totalSize > MAX_IMAGE_SIZE) {
        throw new Error(`Image size (${totalSize} bytes) exceeds maximum (${MAX_IMAGE_SIZE} bytes)`);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  // Combine chunks into single buffer
  const buffer = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  return buffer.buffer;
}

export interface RenderOptions {
  invitation: InvitationData;
  translations?: Record<string, unknown>;
}

export interface RenderResult {
  html: string;
  css: string;
  manifest: {
    name: string;
    short_name: string;
    start_url: string;
    scope: string;
    display: string;
  };
  assets: Array<{
    keySuffix: string;
    contentType: string;
    bodyBase64: string;
  }>;
}

/**
 * Get layout export module based on layout ID (for CSS generation)
 */
async function getLayoutExport(layoutId: string) {
  switch (layoutId) {
    case "classic-scroll":
      return await import("@shared/layouts/classic-scroll/export/index");
    case "editorial-elegance":
      return await import("@shared/layouts/editorial-elegance/export/index");
    default:
      // Fallback to classic-scroll if unknown
      return await import("@shared/layouts/classic-scroll/export/index");
  }
}

/**
 * Bundle local assets by downloading images and converting to base64 or assets
 */
async function bundleAssets(html: string): Promise<{
  rewrittenHTML: string;
  assets: Array<{
    keySuffix: string;
    contentType: string;
    bodyBase64: string;
  }>;
}> {
  const assets: Array<{
    keySuffix: string;
    contentType: string;
    bodyBase64: string;
  }> = [];

  // Find all image URLs in the HTML
  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  let match;
  let rewrittenHTML = html;
  const processedUrls = new Set<string>();

  while ((match = imgRegex.exec(html)) !== null) {
    const imageUrl = match[1];

    // Skip data URLs and external URLs (keep Google Fonts, etc.)
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http://fonts') || imageUrl.startsWith('https://fonts')) {
      continue;
    }

    // Skip if already processed
    if (processedUrls.has(imageUrl)) {
      continue;
    }
    processedUrls.add(imageUrl);

    try {
      // Replace localhost with minio for Docker network access
      // Also handle URLs that already use minio:9000 or other hosts
      let fetchUrl = imageUrl;
      if (imageUrl.includes('localhost:9000')) {
        fetchUrl = imageUrl.replace('localhost:9000', 'minio:9000');
      } else if (imageUrl.includes('minio:9000')) {
        // Already using minio, use as-is
        fetchUrl = imageUrl;
      } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        // Relative URL - might need base URL, skip for now
        continue;
      }

      // Validate URL against allowlist (SSRF protection)
      if (!isValidImageUrl(fetchUrl)) {
        logger.warn(`Skipping disallowed image URL: ${imageUrl}`);
        continue;
      }

      // Download the image with timeout and size limits
      const response = await fetchImageWithLimits(fetchUrl);
      if (!response.ok) {
        logger.warn(`Failed to fetch image: ${imageUrl} (tried ${fetchUrl}, status: ${response.status})`);
        continue;
      }

      const buffer = await readResponseWithLimit(response);
      const base64 = Buffer.from(buffer).toString('base64');

      // Determine content type
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // Generate asset key from URL
      const urlObj = new URL(imageUrl, 'http://localhost');
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'image.jpg';
      const keySuffix = `assets/${filename}`;

      // Add to assets array
      assets.push({
        keySuffix,
        contentType,
        bodyBase64: base64,
      });

      // Rewrite HTML to use relative path
      rewrittenHTML = rewrittenHTML.replace(
        new RegExp(imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        `./${keySuffix}`
      );
    } catch (error) {
      logger.warn(`Error processing image ${imageUrl}:`, error);
    }
  }

  // Also process background images in style attributes
  const bgImgRegex = /style="[^"]*background-image:\s*url\(([^)]+)\)/g;
  while ((match = bgImgRegex.exec(html)) !== null) {
    const imageUrl = match[1].replace(/['"]/g, '');

    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http://fonts') || imageUrl.startsWith('https://fonts')) {
      continue;
    }

    if (processedUrls.has(imageUrl)) {
      continue;
    }
    processedUrls.add(imageUrl);

    try {
      // Replace localhost with minio for Docker network access
      // Also handle URLs that already use minio:9000 or other hosts
      let fetchUrl = imageUrl;
      if (imageUrl.includes('localhost:9000')) {
        fetchUrl = imageUrl.replace('localhost:9000', 'minio:9000');
      } else if (imageUrl.includes('minio:9000')) {
        // Already using minio, use as-is
        fetchUrl = imageUrl;
      } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        // Relative URL - might need base URL, skip for now
        continue;
      }

      // Validate URL against allowlist (SSRF protection)
      if (!isValidImageUrl(fetchUrl)) {
        logger.warn(`Skipping disallowed background image URL: ${imageUrl}`);
        continue;
      }

      // Download the image with timeout and size limits
      const response = await fetchImageWithLimits(fetchUrl);
      if (!response.ok) {
        logger.warn(`Failed to fetch background image: ${imageUrl} (tried ${fetchUrl}, status: ${response.status})`);
        continue;
      }

      const buffer = await readResponseWithLimit(response);
      const base64 = Buffer.from(buffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      const urlObj = new URL(imageUrl, 'http://localhost');
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'image.jpg';
      const keySuffix = `assets/${filename}`;

      assets.push({
        keySuffix,
        contentType,
        bodyBase64: base64,
      });

      rewrittenHTML = rewrittenHTML.replace(
        new RegExp(imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        `./${keySuffix}`
      );
    } catch (error) {
      logger.warn(`Error processing background image ${imageUrl}:`, error);
    }
  }

  return {
    rewrittenHTML,
    assets,
  };
}

/**
 * Render an invitation to static HTML/CSS using React SSR
 * This ensures the published site uses the exact same components as the builder preview
 */
export async function render(options: RenderOptions): Promise<RenderResult> {
  const { invitation, translations = {} } = options;

  const layoutId = invitation.layoutId || "classic-scroll";
  const layout = getLayout(layoutId);

  if (!layout) {
    throw new Error(`Layout "${layoutId}" not found`);
  }

  // Use React SSR to render the same components as the builder preview
  const element = <InvitationPage invitation={invitation} translations={translations} />;
  let bodyContent: string;
  try {
    bodyContent = renderToStaticMarkup(element);
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    throw new Error(`Failed to render invitation: ${errorDetails}${errorStack ? '\n' + errorStack : ''}`);
  }

  // Get layout export module for CSS generation
  const layoutExport = await getLayoutExport(layoutId);

  // Generate CSS using the same function (uses actual CSS files)
  const css = layoutExport?.generateCSS
    ? await layoutExport.generateCSS(invitation)
    : "";

  // Generate complete HTML with proper head section
  const { data } = invitation;
  const couple = data?.couple || {};
  const bride = couple.bride || {};
  const groom = couple.groom || {};
  const brideName = bride.name || "Bride";
  const groomName = groom.name || "Groom";
  const theme = invitation.layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

  // Generate font imports
  const fontImports = generateFontImports(fonts);

  // Generate theme variables
  const getBackgroundColor = (): string => {
    if (typeof colors.background === "string") return colors.background;
    if (colors.background && typeof colors.background === "object" && "page" in colors.background) {
      return (colors.background as { page?: string }).page || "#FAF9F7";
    }
    return "#FAF9F7";
  };

  const getTextColor = (): string => {
    if (typeof colors.text === "string") return colors.text;
    if (colors.text && typeof colors.text === "object" && "primary" in colors.text) {
      return (colors.text as { primary?: string }).primary || "#1C1C1C";
    }
    return "#1C1C1C";
  };

  const themeStyles = `
    :root {
      --ee-color-bg: ${getBackgroundColor()};
      --ee-color-text: ${getTextColor()};
      --ee-color-secondary: ${colors.secondary || "#6B6B6B"};
      --ee-color-accent: ${colors.primary || "#C6A15B"};
      --font-heading: ${fonts.heading || "Playfair Display"}, serif;
      --font-body: ${fonts.body || "Inter"}, sans-serif;
      --font-script: ${fonts.script || "Playfair Display"}, serif;
    }
  `;

  // Generate protection bundle
  const { generateProtectionBundle } = await import("@shared/lib/protection-bundle");
  const { getCopyrightMetaContent } = await import("@shared/lib/legal-warnings");
  const isProduction = true;
  const protection = generateProtectionBundle(isProduction);

  // Build complete HTML document
  const html = `<!DOCTYPE html>
${protection.htmlComment}
${protection.decoyComments}
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Wedding invitation for ${brideName} & ${groomName}" />
  <meta name="copyright" content="${getCopyrightMetaContent()}" />
  <title>${brideName} & ${groomName} - Wedding</title>

  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="${colors.primary || "#C6A15B"}" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="${brideName} & ${groomName} Wedding" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${fontImports}

  <!-- Inline Styles -->
  <style>
    ${themeStyles}
    ${css}
  </style>
  ${protection.protectionScript ? `<script data-protection="true" nonce="${protection.nonce}">${protection.protectionScript}</script>` : ""}
  <meta http-equiv="Content-Security-Policy" content="${protection.cspHeader}" />
</head>
<body class="${layoutId === "editorial-elegance" ? "editorial-elegance" : ""}" data-js-enabled="false">
${bodyContent}
${protection.copyrightFooter}
${layoutId === "editorial-elegance" ? `<script>
  // Mark that JavaScript is enabled
  document.body.setAttribute("data-js-enabled", "true");

  // Initialize scroll animations for published static site
  (function() {
    // First, remove visible class from all sections to reset for animations
    const allElements = document.querySelectorAll(".ee-section, .ee-event-card, .ee-gallery-item, .ee-editorial-intro-section");
    allElements.forEach(function(el) { el.classList.remove("ee-visible"); });

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Make everything visible immediately if reduced motion is preferred
      allElements.forEach(function(el) { el.classList.add("ee-visible"); });
      return;
    }

    // Use Intersection Observer for scroll animations
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -100px 0px",
      threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("ee-visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections and cards
    const sections = document.querySelectorAll(".ee-section");
    const eventCards = document.querySelectorAll(".ee-event-card");
    const galleryItems = document.querySelectorAll(".ee-gallery-item");

    [].slice.call(sections).concat([].slice.call(eventCards), [].slice.call(galleryItems)).forEach(function(el) {
      observer.observe(el);
    });

    // Make first section visible immediately (hero is always visible)
    if (sections.length > 0) {
      sections[0].classList.add("ee-visible");
    }
  })();
</script>` : ""}
</body>
</html>`;

  // Generate manifest
  const manifest = {
    name: "Sacred Vows Invitation",
    short_name: "Invitation",
    start_url: "/",
    scope: "/",
    display: "standalone",
  };

  // Bundle assets (if needed)
  const { rewrittenHTML, assets } = await bundleAssets(html);

  return {
    html: rewrittenHTML,
    css,
    manifest,
    assets,
  };
}

/**
 * Generate font import links
 */
function generateFontImports(fonts: { heading?: string; body?: string; script?: string }): string {
  const fontList = new Set<string>();

  if (fonts.heading) fontList.add(fonts.heading);
  if (fonts.body) fontList.add(fonts.body);
  if (fonts.script) fontList.add(fonts.script);

  const fontUrls = Array.from(fontList)
    .map((font) => {
      const fontName = font.replace(/\s+/g, "+");
      return `<link href="https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600&display=swap" rel="stylesheet" />`;
    })
    .join("\n  ");

  return fontUrls;
}

