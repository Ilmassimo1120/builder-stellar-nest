import React, { createContext, useContext, useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case "success":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case "info":
      return <Info className="w-4 h-4 text-blue-600" />;
  }
};

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case "success":
      return "border-green-200 bg-green-50";
    case "error":
      return "border-red-200 bg-red-50";
    case "warning":
      return "border-yellow-200 bg-yellow-50";
    case "info":
      return "border-blue-200 bg-blue-50";
  }
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  React.useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <Alert className={cn("relative pr-12", getToastStyles(toast.type))}>
      <div className="flex items-start gap-2">
        {getToastIcon(toast.type)}
        <div className="flex-1">
          {toast.title && <h4 className="font-medium mb-1">{toast.title}</h4>}
          <AlertDescription>{toast.message}</AlertDescription>
          {toast.action && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto mt-2"
              onClick={toast.action.onClick}
            >
              {toast.action.label}
            </Button>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={() => onRemove(toast.id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </Alert>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // Default 5 seconds
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, removeToast, clearAllToasts }}
    >
      {children}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

// Convenience hooks for different toast types
export const useSuccessToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (message: string, options?: Partial<Toast>) => {
      showToast({ type: "success", message, ...options });
    },
    [showToast],
  );
};

export const useErrorToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (message: string, options?: Partial<Toast>) => {
      showToast({ type: "error", message, ...options });
    },
    [showToast],
  );
};

export const useWarningToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (message: string, options?: Partial<Toast>) => {
      showToast({ type: "warning", message, ...options });
    },
    [showToast],
  );
};

export const useInfoToast = () => {
  const { showToast } = useToast();
  return useCallback(
    (message: string, options?: Partial<Toast>) => {
      showToast({ type: "info", message, ...options });
    },
    [showToast],
  );
};
