import { useEffect, useRef, useState, cloneElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";

export function Popover({
  trigger,
  children,
  align = "center",
  sideOffset = 8,
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
    const onKey = (e) => e.key === "Escape" && setOpen(false);
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
    "aria-expanded": open,
  });

  return (
    <div ref={wrapRef} className={cn("relative inline-block", className)}>
      {triggerEl}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            style={{
              top: `calc(100% + ${sideOffset}px)`,
              ...(align === "end"
                ? { right: 0 }
                : align === "start"
                ? { left: 0 }
                : { left: "50%", transform: "translateX(-50%)" }),
            }}
            className={cn(
              "absolute z-50 rounded-lg border border-border bg-card-elevated shadow-xl",
              panelClassName
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Popover;