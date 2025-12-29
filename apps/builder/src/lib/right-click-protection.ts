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
    padding: 25px;
    border-radius: 8px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;

  const message = document.createElement("p");
  message.textContent = LEGAL_WARNINGS.rightClick;
  message.style.cssText = "color: #333; line-height: 1.6; margin: 0 0 15px 0; font-size: 14px;";

  const copyright = document.createElement("p");
  copyright.textContent = LEGAL_WARNINGS.copyright;
  copyright.style.cssText = "color: #666; font-size: 11px; margin: 15px 0 0 0;";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.cssText = `
    margin-top: 15px;
    padding: 8px 20px;
    background: #d4af37;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  closeBtn.onclick = () => {
    overlay.remove();
  };

  modal.appendChild(message);
  modal.appendChild(copyright);
  modal.appendChild(closeBtn);
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
        showRightClickWarning();
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
          showRightClickWarning();
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
          showRightClickWarning();
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
    modal.style.cssText = 'background: white; padding: 25px; border-radius: 8px; max-width: 400px; text-align: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);';

    const message = document.createElement('p');
    message.textContent = warning;
    message.style.cssText = 'color: #333; line-height: 1.6; margin: 0 0 15px 0; font-size: 14px;';

    const copyrightEl = document.createElement('p');
    copyrightEl.textContent = copyright;
    copyrightEl.style.cssText = 'color: #666; font-size: 11px; margin: 15px 0 0 0;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = 'margin-top: 15px; padding: 8px 20px; background: #d4af37; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;';
    closeBtn.onclick = function() { overlay.remove(); };

    modal.appendChild(message);
    modal.appendChild(copyrightEl);
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(function() {
      if (overlay.parentNode) overlay.remove();
    }, 5000);
  }

  document.addEventListener('contextmenu', function(e) {
    if (!shouldAllowRightClick(e.target)) {
      e.preventDefault();
      showWarning();
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
        showWarning();
        return false;
      }
    }
  }, false);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'U')) {
      if (!shouldAllowRightClick(e.target)) {
        e.preventDefault();
        showWarning();
        return false;
      }
    }
  }, false);
})();
`.trim();
}
