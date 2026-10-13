import { Receipt, Info } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { cn } from "../../utils/cn";

/**
 * Order breakdown. Fees are always disclosed up front — never hidden
 * until the payment screen.
 */
export function OrderSummary({
  lines = [],
  subtotal = 0,
  fees = 0,
  discount = 0,
  total = 0,
  currency = "NGN",
  className,
  feeLabel = "Service fee",
  showFeeNote = true,
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <header className="flex items-center gap-2 mb-4">
        <Receipt size={18} className="text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Order summary
        </h3>
      </header>

      <div className="space-y-2.5">
        {lines.map((l, i) => (
          <div key={i} className="flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <div className="text-foreground">
                {l.name} <span className="text-muted-foreground">× {l.quantity}</span>
              </div>
              {l.admits > 1 && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {l.quantity * l.admits} admissions
                </div>
              )}
            </div>
            <div className="text-foreground font-medium tabular-nums shrink-0">
              {formatCurrency(l.price * l.quantity, currency)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
        <Row label="Subtotal" value={formatCurrency(subtotal, currency)} />
        {discount > 0 && (
          <Row
            label="Discount"
            value={`− ${formatCurrency(discount, currency)}`}
            valueClassName="text-success"
          />
        )}
        <Row label={feeLabel} value={formatCurrency(fees, currency)} />
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">Total</span>
        <span className="text-lg font-extrabold text-foreground tabular-nums">
          {formatCurrency(total, currency)}
        </span>
      </div>

      {showFeeNote && fees > 0 && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-subtle">
          <Info size={12} className="shrink-0 mt-0.5" />
          A service fee is applied per ticket to cover processing.
        </p>
      )}
    </div>
  );
}

function Row({ label, value, valueClassName }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className={cn("tabular-nums", valueClassName)}>{value}</span>
    </div>
  );
}

export default OrderSummary;