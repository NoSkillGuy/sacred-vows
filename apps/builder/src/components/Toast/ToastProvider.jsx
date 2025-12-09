import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

const ToastContext = createContext(null);
const DEFAULT_DURATION = 5600;
const MAX_TOASTS = 3;

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => setToasts([]), []);

  const addToast = useCallback((toastInput) => {
    const id = toastInput.id || generateId();
    const toast = {
      id,
      title: toastInput.title || 'Notification',
      description: toastInput.description || toastInput.message || '',
      duration: typeof toastInput.duration === 'number' ? toastInput.duration : DEFAULT_DURATION,
      tone: toastInput.tone || 'info',
      icon: toastInput.icon || 'heart',
      ariaLive: toastInput.ariaLive || 'polite',
      tooltip: toastInput.tooltip,
    };

    setToasts((prev) => {
      const next = [...prev, toast];
      return next.slice(-MAX_TOASTS);
    });

    return id;
  }, []);

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
      clearToasts,
    }),
    [addToast, removeToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <ToastContainer toasts={toasts} onDismiss={removeToast} />,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { title, description, duration, icon, tone, ariaLive, tooltip } = toast;

  useEffect(() => {
    if (!duration) return undefined;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className={`toast toast-${tone}`}
      role="status"
      aria-live={ariaLive || 'polite'}
      title={tooltip || description || title}
    >
      <div className="toast-icon" aria-hidden="true">
        {icon === 'heart' ? <HeartIcon /> : <BellIcon />}
      </div>

      <div className="toast-body">
        <div className="toast-title">{title}</div>
        {description ? <p className="toast-description">{description}</p> : null}
      </div>

      <button
        type="button"
        className="toast-close"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        ×
      </button>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z" />
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z" />
    </svg>
  );
}
