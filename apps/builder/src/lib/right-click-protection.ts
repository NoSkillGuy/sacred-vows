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

/**
 * Track blocked attempts with timestamps
 */
const blockedAttempts: number[] = [];
const ATTEMPT_THRESHOLD = 5;
const TIME_WINDOW_MS = 5000; // 5 seconds

/**
 * Record a blocked attempt and check if warning should be shown
 * @returns true if warning should be shown (5 attempts in 5 seconds)
 */
function recordBlockedAttempt(): boolean {
  const now = Date.now();

  // Remove attempts older than the time window
  while (blockedAttempts.length > 0 && now - blockedAttempts[0] > TIME_WINDOW_MS) {
    blockedAttempts.shift();
  }

  // Add current attempt
  blockedAttempts.push(now);

  // Show warning if threshold is reached
  return blockedAttempts.length >= ATTEMPT_THRESHOLD;
}

/**
 * Show right-click warning modal
 */
function showRightClickWarning(): void {
  if (typeof document === "undefined") {
    return;
  }

  // Check if modal already exists
  const existing = document.getElementById("rightclick-warning-overlay");
  if (existing) {
    return;
  }

  // Create modal overlay
  const overlay = document.createElement("div");
  overlay.id = "rightclick-warning-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 999998;
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

  const message = document.createElement("div");
  message.textContent = LEGAL_WARNINGS.rightClick;
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
  modal.appendChild(message);
  modal.appendChild(copyright);
  modal.appendChild(buttonContainer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.remove();
    }
  }, 5000);
}

/**
 * Check if element should allow right-click (e.g., form inputs, textareas)
 */
function shouldAllowRightClick(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  const isEditable =
    tagName === "input" ||
    tagName === "textarea" ||
    target.isContentEditable ||
    target.getAttribute("contenteditable") === "true";

  return isEditable;
}

/**
 * Enable right-click protection
 */
export function enableRightClickProtection(isProduction = true): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (!isProduction) {
    return;
  }

  // Prevent context menu
  document.addEventListener(
    "contextmenu",
    (e) => {
      if (!shouldAllowRightClick(e.target)) {
        e.preventDefault();
        // Only show warning after multiple attempts
        if (recordBlockedAttempt()) {
          showRightClickWarning();
        }
        return false;
      }
    },
    false
  );

  // Prevent text selection (optional, can be aggressive)
  // Only prevent on images and non-editable elements
  document.addEventListener(
    "selectstart",
    (e) => {
      if (!shouldAllowRightClick(e.target)) {
        const target = e.target as HTMLElement;
        if (target.tagName === "IMG" || target.tagName === "PICTURE") {
          e.preventDefault();
          return false;
        }
      }
    },
    false
  );

  // Prevent drag start on images
  document.addEventListener(
    "dragstart",
    (e) => {
      if (!shouldAllowRightClick(e.target)) {
        const target = e.target as HTMLElement;
        if (target.tagName === "IMG" || target.tagName === "PICTURE") {
          e.preventDefault();
          // Only show warning after multiple attempts
          if (recordBlockedAttempt()) {
            showRightClickWarning();
          }
          return false;
        }
      }
    },
    false
  );

  // Prevent common keyboard shortcuts
  document.addEventListener(
    "keydown",
    (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (view source)
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        if (!shouldAllowRightClick(e.target)) {
          e.preventDefault();
          // Only show warning after multiple attempts
          if (recordBlockedAttempt()) {
            showRightClickWarning();
          }
          return false;
        }
      }
    },
    false
  );
}

/**
 * Generate right-click protection script as string for injection into HTML
 */
export function getRightClickProtectionScript(isProduction = true): string {
  if (!isProduction) {
    return "";
  }

  return `
(function() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const warning = ${JSON.stringify(LEGAL_WARNINGS.rightClick)};
  const copyright = ${JSON.stringify(LEGAL_WARNINGS.copyright)};

  // Track blocked attempts with timestamps
  const blockedAttempts = [];
  const ATTEMPT_THRESHOLD = 5;
  const TIME_WINDOW_MS = 5000; // 5 seconds

  function recordBlockedAttempt() {
    const now = Date.now();

    // Remove attempts older than the time window
    while (blockedAttempts.length > 0 && now - blockedAttempts[0] > TIME_WINDOW_MS) {
      blockedAttempts.shift();
    }

    // Add current attempt
    blockedAttempts.push(now);

    // Show warning if threshold is reached
    return blockedAttempts.length >= ATTEMPT_THRESHOLD;
  }

  function shouldAllowRightClick(target) {
    if (!target || !target.tagName) return false;
    const tagName = target.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' ||
           target.isContentEditable || target.getAttribute('contenteditable') === 'true';
  }

  function showWarning() {
    const existing = document.getElementById('rightclick-warning-overlay');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.id = 'rightclick-warning-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 999998; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;';

    const modal = document.createElement('div');
    modal.style.cssText = 'background: white; padding: 30px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto; text-align: left; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);';

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
    modal.appendChild(message);
    modal.appendChild(copyrightEl);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(function() {
      if (overlay.parentNode) overlay.remove();
    }, 5000);
  }

  document.addEventListener('contextmenu', function(e) {
    if (!shouldAllowRightClick(e.target)) {
      e.preventDefault();
      // Only show warning after multiple attempts
      if (recordBlockedAttempt()) {
        showWarning();
      }
      return false;
    }
  }, false);

  document.addEventListener('selectstart', function(e) {
    if (!shouldAllowRightClick(e.target)) {
      const target = e.target;
      if (target.tagName === 'IMG' || target.tagName === 'PICTURE') {
        e.preventDefault();
        return false;
      }
    }
  }, false);

  document.addEventListener('dragstart', function(e) {
    if (!shouldAllowRightClick(e.target)) {
      const target = e.target;
      if (target.tagName === 'IMG' || target.tagName === 'PICTURE') {
        e.preventDefault();
        // Only show warning after multiple attempts
        if (recordBlockedAttempt()) {
          showWarning();
        }
        return false;
      }
    }
  }, false);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'U')) {
      if (!shouldAllowRightClick(e.target)) {
        e.preventDefault();
        // Only show warning after multiple attempts
        if (recordBlockedAttempt()) {
          showWarning();
        }
        return false;
      }
    }
  }, false);
})();
`.trim();
}
