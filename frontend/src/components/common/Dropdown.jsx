import { useEffect, useRef, useState, cloneElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";

/**
 * Minimal, accessible dropdown. Renders a floating panel anchored to
 * the trigger. Closes on outside click, Escape, or item activation.
 */
export function Dropdown({
  trigger,
  children,
  align = "end",
  sideOffset = 6,
  className,
  panelClassName,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerEl = cloneElement(trigger, {
    onClick: (e) => {
      trigger.props?.onClick?.(e);
      setOpen((v) => !v);
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
  });

  return (
    <div ref={wrapRef} className={cn("relative inline-block", className)}>
      {triggerEl}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{
              top: `calc(100% + ${sideOffset}px)`,
              [align === "end" ? "right" : "left"]: 0,
            }}
            className={cn(
              "absolute z-50 min-w-[220px] rounded-lg border border-border bg-card-elevated shadow-xl overflow-hidden",
              "backdrop-blur-md",
              panelClassName
            )}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({
  icon,
  children,
  danger,
  disabled,
  onClick,
  as: As = "button",
  ...rest
}) {
  return (
    <As
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors",
        "hover:bg-card disabled:opacity-50 disabled:cursor-not-allowed",
        danger ? "text-danger hover:bg-danger/10" : "text-foreground"
      )}
      {...rest}
    >
      {icon && <span className="shrink-0 text-muted-foreground" aria-hidden>{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </As>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}

export function DropdownLabel({ children }) {
  return (
    <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-subtle font-semibold">
      {children}
    </div>
  );
}

export default Dropdown;