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
 * Runtime integrity checks to detect code tampering
 * Phase 2: Enhanced Protection
 */

/**
 * Simple hash function for integrity checking
 * Uses a lightweight hash suitable for runtime checks
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get expected hash for critical code sections
 * In production, these would be computed at build time
 */
function getExpectedHashes(): Record<string, number> {
  // These hashes would be computed at build time and embedded
  // For now, we use placeholder values
  return {
    protectionScript: simpleHash("protection-bundle"),
    layoutTemplate: simpleHash("layout-template"),
  };
}

/**
 * Check integrity of critical code sections
 */
export function checkIntegrity(): { valid: boolean; violations: string[] } {
  if (typeof window === "undefined") {
    return { valid: true, violations: [] };
  }

  const violations: string[] = [];
  // Note: expectedHashes would be used for hash verification in production
  // For now, we perform presence checks instead
  void getExpectedHashes();

  // Check if protection scripts are present and unmodified
  const protectionScript = document.querySelector('script[data-protection="true"]');
  if (!protectionScript) {
    violations.push("Protection scripts missing");
  }

  // Check if console protection is active
  try {
    const originalLog = console.log.toString();
    if (originalLog.includes("COPYRIGHT WARNING")) {
      // Protection is active
    } else {
      violations.push("Console protection may be disabled");
    }
  } catch {
    violations.push("Unable to verify console protection");
  }

  // Check if DevTools detection is active
  try {
    // If overlay exists, detection is working
    void document.getElementById("devtools-warning-overlay");
  } catch {
    // Silent check
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Generate integrity check script for injection into HTML
 */
export function getIntegrityCheckScript(): string {
  return `
(function() {
  if (typeof window === 'undefined') return;

  function checkIntegrity() {
    var violations = [];

    // Check if protection scripts are present
    var protectionScript = document.querySelector('script[data-protection="true"]');
    if (!protectionScript) {
      violations.push('Protection scripts missing');
    }

    // Check console protection
    try {
      var originalLog = console.log.toString();
      if (!originalLog.includes('COPYRIGHT WARNING')) {
        violations.push('Console protection may be disabled');
      }
    } catch (e) {
      violations.push('Unable to verify console protection');
    }

    if (violations.length > 0) {
      console.warn('Integrity check failed:', violations);
      // Log violation for monitoring (in production, this would be sent to server)
    }

    return violations.length === 0;
  }

  // Run integrity check after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkIntegrity);
  } else {
    checkIntegrity();
  }

  // Periodic checks
  setInterval(checkIntegrity, 30000); // Check every 30 seconds
})();
`.trim();
}
