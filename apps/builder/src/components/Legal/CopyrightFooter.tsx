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

import React from "react";
import { LEGAL_WARNINGS } from "../../lib/legal-warnings";

interface CopyrightFooterProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Copyright footer component for published pages
 * Displays persistent copyright notice that cannot be easily removed
 */
export function CopyrightFooter({ className, style }: CopyrightFooterProps): JSX.Element {
  const defaultStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    padding: "15px 20px",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderTop: "1px solid rgba(0, 0, 0, 0.1)",
    fontSize: "11px",
    color: "#666",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.5",
    zIndex: 1,
    ...style,
  };

  return (
    <footer className={className} style={defaultStyle}>
      <p style={{ margin: "0", padding: "0" }}>{LEGAL_WARNINGS.copyright}</p>
      <p
        style={{
          margin: "5px 0 0 0",
          padding: "0",
          fontSize: "10px",
          color: "#999",
        }}
      >
        Unauthorized copying, reproduction, or distribution is strictly prohibited and may result in
        legal action.
      </p>
    </footer>
  );
}

/**
 * Generate copyright footer HTML as string for injection into templates
 */
export function getCopyrightFooterHTML(): string {
  return `
<footer style="position: relative; width: 100%; padding: 15px 20px; text-align: center; background-color: rgba(0, 0, 0, 0.05); border-top: 1px solid rgba(0, 0, 0, 0.1); font-size: 11px; color: #666; font-family: Arial, sans-serif; line-height: 1.5; z-index: 1;">
  <p style="margin: 0; padding: 0;">${LEGAL_WARNINGS.copyright}</p>
  <p style="margin: 5px 0 0 0; padding: 0; font-size: 10px; color: #999;">Unauthorized copying, reproduction, or distribution is strictly prohibited and may result in legal action.</p>
</footer>
`.trim();
}
