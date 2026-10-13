import { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";

export const Radio = forwardRef(function Radio(
  { label, description, className, containerClassName, id, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `rd_${autoId}`;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex items-start gap-3 cursor-pointer select-none rounded-lg p-3 border border-border hover:border-border-strong transition-colors",
        "has-[:checked]:border-primary has-[:checked]:bg-primary/5",
        containerClassName
      )}
    >
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className={cn(
            "peer h-5 w-5 appearance-none rounded-full border border-border bg-input transition-colors",
            "checked:border-primary checked:border-[6px]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...rest}
        />
      </span>
      <span className="flex-1">
        {label && <span className="block text-sm font-medium text-foreground">{label}</span>}
        {description && (
          <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>
        )}
      </span>
    </label>
  );
});

export default Radio;