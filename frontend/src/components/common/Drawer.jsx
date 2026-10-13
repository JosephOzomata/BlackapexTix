import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { IconButton } from "./IconButton";
import { useTrap } from "../../hooks/useFocusTrap";

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  footer,
  className,
  size = "md", // sm | md | lg | full
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

  const widthClass = {
    sm: "w-[min(92vw,380px)]",
    md: "w-[min(92vw,480px)]",
    lg: "w-[min(94vw,640px)]",
    full: "w-screen",
  }[size];

  const x0 = side === "right" ? "100%" : side === "left" ? "-100%" : "0%";
  const y0 = side === "bottom" ? "100%" : side === "top" ? "-100%" : "0%";

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-modal-backdrop bg-black/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? "Drawer"}
            initial={{ x: x0, y: y0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: x0, y: y0 }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            className={cn(
              "fixed z-modal bg-card border-border shadow-2xl flex flex-col safe-top safe-bottom",
              side === "right" && "top-0 right-0 bottom-0 border-l",
              side === "left" && "top-0 left-0 bottom-0 border-r",
              side === "bottom" && "left-0 right-0 bottom-0 border-t max-h-[92dvh] rounded-t-2xl",
              side === "top" && "left-0 right-0 top-0 border-b max-h-[92dvh] rounded-b-2xl",
              widthClass,
              className
            )}
          >
            {(title || onClose) && (
              <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
                {title && <h2 className="text-base font-semibold">{title}</h2>}
                {onClose && (
                  <IconButton label="Close drawer" size="icon-sm" onClick={onClose}>
                    <X size={16} />
                  </IconButton>
                )}
              </header>
            )}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && (
              <footer className="border-t border-border p-4 bg-card-elevated/50">{footer}</footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Drawer;