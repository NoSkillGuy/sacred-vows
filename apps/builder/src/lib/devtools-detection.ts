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

import { LEGAL_WARNINGS } from "./legal-warnings";

type DevToolsCallback = () => void;

let devToolsDetected = false;
let detectionInterval: number | null = null;
let onDevToolsOpen: DevToolsCallback | null = null;

/**
 * Detect DevTools using window size method
 */
function detectByWindowSize(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  return widthThreshold || heightThreshold;
}

/**
 * Detect DevTools using debugger statement method
 */
function detectByDebugger(): boolean {
  let detected = false;
  const start = performance.now();

  // Use debugger to detect if DevTools is open
  // When DevTools is open, execution pauses, causing a delay
  debugger; // eslint-disable-line no-debugger

  const end = performance.now();
  const elapsed = end - start;

  // If execution took more than 100ms, DevTools is likely open
  // (normal execution should be < 1ms)
  if (elapsed > 100) {
    detected = true;
  }

  return detected;
}

/**
 * Detect DevTools using console method
 */
function detectByConsole(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  let detected = false;
  const element = new Image();

  Object.defineProperty(element, "id", {
    get: function () {
      detected = true;
      return "";
    },
  });

  // This will trigger the getter if DevTools is open
  console.log(element);
  console.clear();

  return detected;
}

/**
 * Start DevTools detection
 */
export function startDevToolsDetection(callback: DevToolsCallback, isProduction = true): void {
  if (typeof window === "undefined" || !isProduction) {
    return;
  }

  if (devToolsDetected) {
    return;
  }

  onDevToolsOpen = callback;

  // Check immediately
  if (detectByWindowSize() || detectByDebugger()) {
    devToolsDetected = true;
    callback();
    return;
  }

  // Check periodically using window size method (most reliable)
  detectionInterval = window.setInterval(() => {
    if (detectByWindowSize()) {
      devToolsDetected = true;
      if (detectionInterval !== null) {
        clearInterval(detectionInterval);
        detectionInterval = null;
      }
      if (onDevToolsOpen) {
        onDevToolsOpen();
      }
    }
  }, 500);
}

/**
 * Stop DevTools detection
 */
export function stopDevToolsDetection(): void {
  if (detectionInterval !== null) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
  onDevToolsOpen = null;
  devToolsDetected = false;
}

/**
 * Show DevTools warning modal
 */
export function showDevToolsWarning(): void {
  if (typeof document === "undefined") {
    return;
  }

  // Create modal overlay
  const overlay = document.createElement("div");
  overlay.id = "devtools-warning-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial, sans-serif;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 8px;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;

  const title = document.createElement("h2");
  title.textContent = "⚠️ Unauthorized Access Detected";
  title.style.cssText = "color: #ff0000; margin: 0 0 20px 0;";

  const message = document.createElement("p");
  message.textContent = LEGAL_WARNINGS.devtools;
  message.style.cssText = "color: #333; line-height: 1.6; margin: 0 0 20px 0;";

  const copyright = document.createElement("p");
  copyright.textContent = LEGAL_WARNINGS.copyright;
  copyright.style.cssText = "color: #666; font-size: 12px; margin: 20px 0 0 0;";

  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(copyright);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/**
 * Generate DevTools detection script as string for injection into HTML
 */
export function getDevToolsDetectionScript(isProduction = true): string {
  if (!isProduction) {
    return "";
  }

  return `
(function() {
  if (typeof window === 'undefined') return;

  const warning = ${JSON.stringify(LEGAL_WARNINGS.devtools)};
  const copyright = ${JSON.stringify(LEGAL_WARNINGS.copyright)};
  let detected = false;
  let interval = null;

  function detectDevTools() {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    return widthThreshold || heightThreshold;
  }

  function showWarning() {
    if (detected) return;
    detected = true;

    const overlay = document.createElement('div');
    overlay.id = 'devtools-warning-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background: white; padding: 30px; border-radius: 8px; max-width: 500px; text-align: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);';

    const title = document.createElement('h2');
    title.textContent = '⚠️ Unauthorized Access Detected';
    title.style.cssText = 'color: #ff0000; margin: 0 0 20px 0;';

    const message = document.createElement('p');
    message.textContent = warning;
    message.style.cssText = 'color: #333; line-height: 1.6; margin: 0 0 20px 0;';

    const copyrightEl = document.createElement('p');
    copyrightEl.textContent = copyright;
    copyrightEl.style.cssText = 'color: #666; font-size: 12px; margin: 20px 0 0 0;';

    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(copyrightEl);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  if (detectDevTools()) {
    showWarning();
  }

  interval = setInterval(function() {
    if (detectDevTools() && !detected) {
      showWarning();
      if (interval) clearInterval(interval);
    }
  }, 500);
})();
`.trim();
}
