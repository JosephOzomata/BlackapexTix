import { forwardRef, useId } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../utils/cn";

export const Checkbox = forwardRef(function Checkbox(
  {
    label,
    description,
    error,
    className,
    containerClassName,
    indeterminate = false,
    id,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `cb_${autoId}`;

  return (
    <div className={cn("flex items-start gap-2.5", containerClassName)}>
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "peer h-5 w-5 rounded border border-border bg-input cursor-pointer appearance-none transition-colors",
            "checked:bg-primary checked:border-primary indeterminate:bg-primary indeterminate:border-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-danger",
            className
          )}
          {...rest}
        />
        <Check
          size={14}
          className="pointer-events-none absolute left-0.5 top-0.5 text-white opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
          strokeWidth={3}
          aria-hidden
        />
        {indeterminate && (
          <Minus
            size={14}
            className="pointer-events-none absolute left-0.5 top-0.5 text-white"
            strokeWidth={3}
            aria-hidden
          />
        )}
      </span>
      {(label || description) && (
        <label htmlFor={inputId} className="flex-1 cursor-pointer select-none">
          {label && <span className="block text-sm text-foreground">{label}</span>}
          {description && (
            <span className="block text-xs text-muted-foreground mt-0.5">{description}</span>
          )}
          {error && (
            <span role="alert" className="block text-xs text-danger mt-1">
              {error}
            </span>
          )}
        </label>
      )}
    </div>
  );
});

export default Checkbox;