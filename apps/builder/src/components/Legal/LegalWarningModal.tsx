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

interface LegalWarningModalProps {
  title?: string;
  message: string;
  isDismissible?: boolean;
  onClose?: () => void;
}

/**
 * Legal warning modal component for displaying copyright protection notices
 */
export function LegalWarningModal({
  title = "⚠️ Copyright Warning",
  message,
  isDismissible = false,
  onClose,
}: LegalWarningModalProps): JSX.Element {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.9)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "8px",
          maxWidth: "500px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h2
          style={{
            color: "#ff0000",
            margin: "0 0 20px 0",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            color: "#333",
            lineHeight: "1.6",
            margin: "0 0 20px 0",
            fontSize: "14px",
          }}
        >
          {message}
        </p>
        <p
          style={{
            color: "#666",
            fontSize: "12px",
            margin: "20px 0 0 0",
          }}
        >
          {LEGAL_WARNINGS.copyright}
        </p>
        {isDismissible && onClose && (
          <button
            onClick={onClose}
            style={{
              marginTop: "20px",
              padding: "10px 25px",
              background: "#d4af37",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
