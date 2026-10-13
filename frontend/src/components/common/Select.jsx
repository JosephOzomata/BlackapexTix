import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

const SIZES = {
  sm: "h-9 pl-3 pr-9 text-sm",
  md: "h-11 pl-3.5 pr-9 text-sm",
  lg: "h-12 pl-4 pr-10 text-base",
};

export const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    options = [],
    placeholder,
    size = "md",
    className,
    containerClassName,
    required,
    id,
    children,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const selectId = id ?? `sel_${autoId}`;
  const describedBy = error ? `${selectId}-err` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(
            "w-full appearance-none rounded-md bg-input text-input-foreground border",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
            "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
            error
              ? "border-danger focus:ring-danger/30 focus:border-danger"
              : "border-border hover:border-border-strong",
            SIZES[size],
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.length
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden
        />
      </div>
      {error ? (
        <p id={`${selectId}-err`} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Select;