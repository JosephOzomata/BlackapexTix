import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export function Tabs({ value, onChange, items = [], className, variant = "underline" }) {
  return (
    <div role="tablist" className={cn("flex items-center gap-1 overflow-x-auto no-scrollbar", className)}>
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange?.(it.value)}
            className={cn(
              "relative shrink-0 px-3.5 py-2 text-sm font-medium rounded-md transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              variant === "pill" && active && "bg-card-elevated",
              it.disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={it.disabled}
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              {it.icon}
              {it.label}
              {typeof it.count === "number" && (
                <span className="text-[10px] font-bold bg-card-elevated rounded-full px-1.5 py-0.5">
                  {it.count}
                </span>
              )}
            </span>
            {variant === "underline" && active && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;