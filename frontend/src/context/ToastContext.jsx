import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = crypto.randomUUID();

      setToasts((current) => [
        ...current,
        {
          id,
          message,
          type,
        },
      ]);

      window.setTimeout(() => {
        removeToast(id);
      }, duration);

      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      success: (message) => showToast(message, "success"),
      error: (message) => showToast(message, "error"),
      info: (message) => showToast(message, "info"),
      warning: (message) => showToast(message, "warning"),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="fixed right-4 top-4 z-[100] flex w-[min(380px,calc(100%-2rem))] flex-col gap-3"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;

          return (
            <div
              key={toast.id}
              className="flex items-start gap-3 rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] bg-[var(--cc-surface-raised)] p-4 shadow-[var(--cc-shadow-md)]"
              role="status"
            >
              <Icon className="mt-0.5 size-5 shrink-0 text-[var(--cc-primary)]" />

              <p className="flex-1 text-sm text-[var(--cc-text)]">
                {toast.message}
              </p>

              <button
                type="button"
                className="focus-ring rounded-md text-[var(--cc-text-muted)]"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}