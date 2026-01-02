/**
 * Stub ToastProvider for renderer context
 * The renderer doesn't need toast notifications, so this provides a no-op implementation
 * This allows editable components to be imported without errors during SSR build
 */

import React from "react";

interface ToastContextValue {
  addToast: (_toast: unknown) => string;
  removeToast: (_id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const value: ToastContextValue = {
    addToast: () => {
      // No-op in renderer context
      return "";
    },
    removeToast: () => {
      // No-op in renderer context
    },
    clearToasts: () => {
      // No-op in renderer context
    },
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Return no-op implementation if context is not available
    return {
      addToast: () => "",
      removeToast: () => {},
      clearToasts: () => {},
    };
  }
  return context;
}

