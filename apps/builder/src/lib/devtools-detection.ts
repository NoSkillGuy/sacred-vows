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
 * Track DevTools detection attempts with timestamps
 */
const devToolsAttempts: number[] = [];
const ATTEMPT_THRESHOLD = 5;
const TIME_WINDOW_MS = 5000; // 5 seconds

/**
 * Record a DevTools detection attempt and check if warning should be shown
 * @returns true if warning should be shown (5 detections in 5 seconds)
 */
function recordDevToolsAttempt(): boolean {
  const now = Date.now();

  // Remove attempts older than the time window
  while (devToolsAttempts.length > 0 && now - devToolsAttempts[0] > TIME_WINDOW_MS) {
    devToolsAttempts.shift();
  }

  // Add current attempt
  devToolsAttempts.push(now);

  // Show warning if threshold is reached
  return devToolsAttempts.length >= ATTEMPT_THRESHOLD;
}

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
 * Detect DevTools using console detection
 */
function detectByConsole(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  let devtools = false;
  const element = new Image();
  Object.defineProperty(element, "id", {
    get: function () {
      devtools = true;
      return "devtools-detector";
    },
  });

  // Trigger console access detection
  try {
    console.log(element);
    console.clear();
  } catch (e) {
    // Ignore console errors
  }

  return devtools;
}

/**
 * Comprehensive DevTools detection using multiple methods
 */
function detectDevTools(): boolean {
  return detectByWindowSize() || detectByConsole();
}

/**
 * Start DevTools detection
 */
export function startDevToolsDetection(isProduction = true): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!isProduction) {
    return;
  }

  // Check immediately
  if (detectDevTools()) {
    if (recordDevToolsAttempt()) {
      showDevToolsWarning();
    }
  }

  // Check periodically using multiple detection methods
  detectionInterval = window.setInterval(() => {
    if (detectDevTools()) {
      // Only show warning after multiple detections
      if (recordDevToolsAttempt()) {
        showDevToolsWarning();
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
  devToolsAttempts.length = 0;
}

/**
 * Show DevTools warning modal
 */
export function showDevToolsWarning(): void {
  if (typeof document === "undefined") {
    return;
  }

  // Check if modal already exists
  const existing = document.getElementById("devtools-warning-overlay");
  if (existing) {
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
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    text-align: left;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;

  const title = document.createElement("h2");
  title.textContent = "⚠️ UNAUTHORIZED ACCESS DETECTED";
  title.style.cssText = "color: #ff0000; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;";

  const message = document.createElement("div");
  message.textContent = LEGAL_WARNINGS.devtools;
  message.style.cssText =
    "color: #333; line-height: 1.8; margin: 0 0 20px 0; font-size: 13px; white-space: pre-line;";

  const copyright = document.createElement("div");
  copyright.textContent = LEGAL_WARNINGS.copyright;
  copyright.style.cssText =
    "color: #666; font-size: 11px; margin: 20px 0 0 0; padding-top: 15px; border-top: 1px solid #eee; white-space: pre-line;";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = "text-align: center; margin-top: 20px;";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.cssText = `
    padding: 10px 30px;
    background: #d4af37;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  closeBtn.onclick = () => {
    overlay.remove();
  };

  buttonContainer.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(copyright);
  modal.appendChild(buttonContainer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Monitor if DevTools is closed and auto-remove modal only when closed
  const checkInterval = window.setInterval(() => {
    if (!detectDevTools()) {
      // DevTools is closed, remove the modal
      if (overlay.parentNode) {
        overlay.remove();
      }
      clearInterval(checkInterval);
    }
  }, 500);
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

  // Track DevTools detection attempts with timestamps
  const devToolsAttempts = [];
  const ATTEMPT_THRESHOLD = 5;
  const TIME_WINDOW_MS = 5000; // 5 seconds

  function recordDevToolsAttempt() {
    const now = Date.now();

    // Remove attempts older than the time window
    while (devToolsAttempts.length > 0 && now - devToolsAttempts[0] > TIME_WINDOW_MS) {
      devToolsAttempts.shift();
    }

    // Add current attempt
    devToolsAttempts.push(now);

    // Show warning if threshold is reached
    return devToolsAttempts.length >= ATTEMPT_THRESHOLD;
  }

  function detectByWindowSize() {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    return widthThreshold || heightThreshold;
  }

  function detectByConsole() {
    let devtools = false;
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        devtools = true;
        return 'devtools-detector';
      }
    });
    console.log(element);
    console.clear();
    return devtools;
  }

  function detectDevTools() {
    return detectByWindowSize() || detectByConsole();
  }

  function showWarning() {
    const existing = document.getElementById('devtools-warning-overlay');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.id = 'devtools-warning-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); z-index: 999999; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background: white; padding: 30px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto; text-align: left; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);';

    const title = document.createElement('h2');
    title.textContent = '⚠️ UNAUTHORIZED ACCESS DETECTED';
    title.style.cssText = 'color: #ff0000; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;';

    const message = document.createElement('div');
    message.textContent = warning;
    message.style.cssText = 'color: #333; line-height: 1.8; margin: 0 0 20px 0; font-size: 13px; white-space: pre-line;';

    const copyrightEl = document.createElement('div');
    copyrightEl.textContent = copyright;
    copyrightEl.style.cssText = 'color: #666; font-size: 11px; margin: 20px 0 0 0; padding-top: 15px; border-top: 1px solid #eee; white-space: pre-line;';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'text-align: center; margin-top: 20px;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = 'padding: 10px 30px; background: #d4af37; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;';
    closeBtn.onclick = function() { overlay.remove(); };

    buttonContainer.appendChild(closeBtn);
    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(copyrightEl);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Monitor if DevTools is closed and auto-remove modal only when closed
    const checkInterval = setInterval(function() {
      if (!detectDevTools()) {
        // DevTools is closed, remove the modal
        if (overlay.parentNode) {
          overlay.remove();
        }
        clearInterval(checkInterval);
      }
    }, 500);
  }

  // Check immediately
  if (detectDevTools()) {
    if (recordDevToolsAttempt()) {
      showWarning();
    }
  }

  // Check periodically
  setInterval(function() {
    if (detectDevTools()) {
      if (recordDevToolsAttempt()) {
        showWarning();
      }
    }
  }, 500);
})();
`.trim();
}
