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
 * Override console methods to display copyright warnings
 * This protection is active in production/published sites only
 */
export function protectConsole(): void {
  if (typeof window === "undefined") {
    return;
  }

  // Store original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;
  const originalDebug = console.debug;

  // Display warning immediately
  const warning = LEGAL_WARNINGS.console;
  originalLog("%c" + warning, "color: #ff0000; font-weight: bold; font-size: 14px;");

  // Override console.log
  console.log = function (...args: unknown[]) {
    originalLog("%c" + warning, "color: #ff0000; font-weight: bold; font-size: 12px;");
    originalLog(...args);
  };

  // Override console.warn
  console.warn = function (...args: unknown[]) {
    originalWarn("%c" + warning, "color: #ff6b00; font-weight: bold; font-size: 12px;");
    originalWarn(...args);
  };

  // Override console.error
  console.error = function (...args: unknown[]) {
    originalError("%c" + warning, "color: #ff0000; font-weight: bold; font-size: 12px;");
    originalError(...args);
  };

  // Override console.info
  console.info = function (...args: unknown[]) {
    originalInfo("%c" + warning, "color: #0066ff; font-weight: bold; font-size: 12px;");
    originalInfo(...args);
  };

  // Override console.debug
  console.debug = function (...args: unknown[]) {
    originalDebug("%c" + warning, "color: #666666; font-weight: bold; font-size: 12px;");
    originalDebug(...args);
  };

  // Prevent console clearing
  console.clear = function () {
    originalLog("%c" + warning, "color: #ff0000; font-weight: bold; font-size: 14px;");
    originalLog("Console clearing is disabled. Copyright protection active.");
  };
}

/**
 * Generate console protection script as string for injection into HTML
 */
export function getConsoleProtectionScript(): string {
  return `
(function() {
  if (typeof window === 'undefined') return;

  const warning = ${JSON.stringify(LEGAL_WARNINGS.console)};
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;
  const originalDebug = console.debug;

  originalLog('%c' + warning, 'color: #ff0000; font-weight: bold; font-size: 14px;');

  console.log = function() {
    originalLog('%c' + warning, 'color: #ff0000; font-weight: bold; font-size: 12px;');
    originalLog.apply(console, arguments);
  };

  console.warn = function() {
    originalWarn('%c' + warning, 'color: #ff6b00; font-weight: bold; font-size: 12px;');
    originalWarn.apply(console, arguments);
  };

  console.error = function() {
    originalError('%c' + warning, 'color: #ff0000; font-weight: bold; font-size: 12px;');
    originalError.apply(console, arguments);
  };

  console.info = function() {
    originalInfo('%c' + warning, 'color: #0066ff; font-weight: bold; font-size: 12px;');
    originalInfo.apply(console, arguments);
  };

  console.debug = function() {
    originalDebug('%c' + warning, 'color: #666666; font-weight: bold; font-size: 12px;');
    originalDebug.apply(console, arguments);
  };

  console.clear = function() {
    originalLog('%c' + warning, 'color: #ff0000; font-weight: bold; font-size: 14px;');
    originalLog('Console clearing is disabled. Copyright protection active.');
  };
})();
`.trim();
}
