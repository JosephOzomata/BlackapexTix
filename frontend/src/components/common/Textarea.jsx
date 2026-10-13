import { forwardRef, useId, useEffect, useRef } from "react";
import { cn } from "../../utils/cn";

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    rows = 4,
    className,
    containerClassName,
    autoResize = false,
    maxLength,
    showCount = false,
    value,
    required,
    id,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const textareaId = id ?? `ta_${autoId}`;
  const internalRef = useRef(null);
  const finalRef = ref ?? internalRef;

  useEffect(() => {
    if (!autoResize) return;
    const el = finalRef?.current ?? internalRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, autoResize, finalRef]);

  const describedBy = error
    ? `${textareaId}-err`
    : hint
    ? `${textareaId}-hint`
    : undefined;

  const count = typeof value === "string" ? value.length : 0;

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={finalRef}
        id={textareaId}
        rows={rows}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        className={cn(
          "w-full rounded-md bg-input text-input-foreground placeholder:text-subtle border",
          "px-3.5 py-2.5 text-sm transition-colors resize-y",
          "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-danger focus:ring-danger/30 focus:border-danger"
            : "border-border hover:border-border-strong",
          autoResize && "resize-none overflow-hidden",
          className
        )}
        {...rest}
      />
      <div className="flex items-center justify-between mt-1.5 gap-3">
        {error ? (
          <p id={`${textareaId}-err`} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${textareaId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : (
          <span />
        )}
        {showCount && maxLength && (
          <span className="text-xs text-subtle tabular-nums">
            {count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

export default Textarea;