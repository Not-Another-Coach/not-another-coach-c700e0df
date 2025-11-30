import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "info" | "warning" | "error";

interface InlineStatusBarProps {
  message: string;
  variant?: StatusVariant;
  isVisible: boolean;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
  className?: string;
}

const variantConfig: Record<
  StatusVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    className: "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800",
  },
  info: {
    icon: Info,
    className: "bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  },
  error: {
    icon: XCircle,
    className: "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800",
  },
};

export function InlineStatusBar({
  message,
  variant = "success",
  isVisible,
  onDismiss,
  autoDismiss = true,
  dismissDelay = 3000,
  className,
}: InlineStatusBarProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  React.useEffect(() => {
    if (isVisible && autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, dismissDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoDismiss, dismissDelay, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            exit={{ y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 border rounded-lg shadow-sm",
              config.className,
              className
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
