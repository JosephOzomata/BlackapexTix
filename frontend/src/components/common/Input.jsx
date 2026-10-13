import { forwardRef, useId } from "react";
import { cn } from "../../utils/cn";

const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-3.5 text-sm",
  lg: "h-12 px-4 text-base",
};

export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    size = "md",
    className,
    containerClassName,
    required,
    id,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? `in_${autoId}`;
  const describedBy = error
    ? `${inputId}-err`
    : hint
    ? `${inputId}-hint`
    : undefined;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(
            "w-full rounded-md bg-input text-input-foreground placeholder:text-subtle border",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-danger focus:ring-danger/30 focus:border-danger"
              : "border-border hover:border-border-strong",
            SIZES[size],
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          {...rest}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-err`} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;