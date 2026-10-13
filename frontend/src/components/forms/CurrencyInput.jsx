import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { getCurrencyConfig } from "../../utils/currency";

/**
 * Numeric input for prices. Accepts and returns a **major-unit number**
 * (e.g. naira). The caller converts to minor units when submitting.
 *
 * Never use this in a component that submits directly to the backend
 * without converting back — the backend expects kobo/cents.
 */
export const CurrencyInput = forwardRef(function CurrencyInput(
  {
    value,
    onChange,
    currency = "NGN",
    label,
    error,
    hint,
    containerClassName,
    className,
    size = "md",
    ...rest
  },
  ref
) {
  const cfg = getCurrencyConfig(currency);
  const s = size === "lg" ? "h-12 text-base" : "h-11 text-sm";

  const handle = (e) => {
    const raw = e.target.value.replace(/[^\d.]/g, "");
    if (raw === "") return onChange?.("");
    if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
    onChange?.(raw);
  };

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
          {cfg.symbol}
        </span>
        <input
          ref={ref}
          inputMode="decimal"
          autoComplete="off"
          value={value ?? ""}
          onChange={handle}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "w-full pl-8 pr-3 rounded-md bg-input text-input-foreground border",
            "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring tabular-nums",
            error ? "border-danger" : "border-border hover:border-border-strong",
            s,
            className
          )}
          {...rest}
        />
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
});

export default CurrencyInput;