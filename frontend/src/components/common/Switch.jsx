import { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";

const SIZES = {
  sm: { track: "h-5 w-9", thumb: "h-4 w-4", shift: "translate-x-4" },
  md: { track: "h-6 w-11", thumb: "h-5 w-5", shift: "translate-x-5" },
};

export const Switch = forwardRef(function Switch(
  { label, description, size = "md", className, containerClassName, id, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `sw_${autoId}`;
  const s = SIZES[size];

  return (
    <div className={cn("flex items-center justify-between gap-3", containerClassName)}>
      {(label || description) && (
        <label htmlFor={inputId} className="flex-1 cursor-pointer select-none">
          {label && <span className="block text-sm font-medium text-foreground">{label}</span>}
          {description && (
            <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>
          )}
        </label>
      )}
      <label
        className={cn(
          "relative inline-flex shrink-0 items-center rounded-full cursor-pointer transition-colors",
          s.track,
          "bg-border peer-checked:bg-primary has-[:checked]:bg-primary",
          className
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          className="sr-only peer"
          {...rest}
        />
        <span
          className={cn(
            "absolute left-0.5 rounded-full bg-white shadow transition-transform",
            s.thumb,
            "peer-checked:translate-x-full"
          )}
          style={{ transform: "translateX(0)" }}
          aria-hidden
        />
      </label>
    </div>
  );
});

export default Switch;