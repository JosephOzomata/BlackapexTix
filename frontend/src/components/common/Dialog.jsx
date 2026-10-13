import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { IconButton } from "./IconButton";
import { useTrap } from "../../hooks/useFocusTrap";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)]",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
  closeOnOverlay = true,
}) {
  const containerRef = useTrap({ active: open, onEscape: onClose });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "dialog-title" : undefined}
          aria-describedby={description ? "dialog-desc" : undefined}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeOnOverlay ? onClose : undefined}
            aria-hidden
          />
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative w-full rounded-2xl border border-border bg-card shadow-2xl",
              "max-h-[calc(100dvh-2rem)] overflow-y-auto",
              SIZES[size],
              className
            )}
          >
            {(title || description || onClose) && (
              <header className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-3">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2 id="dialog-title" className="text-lg font-semibold text-foreground">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="dialog-desc" className="text-sm text-muted-foreground mt-1 text-pretty">
                      {description}
                    </p>
                  )}
                </div>
                {onClose && (
                  <IconButton label="Close dialog" size="icon-sm" onClick={onClose}>
                    <X size={16} />
                  </IconButton>
                )}
              </header>
            )}
            <div className="px-5 sm:px-6 pb-5 sm:pb-6">{children}</div>
            {footer && (
              <footer className="px-5 sm:px-6 py-4 border-t border-border bg-card-elevated/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Dialog;