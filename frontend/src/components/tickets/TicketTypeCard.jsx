import { motion } from "framer-motion";
import { Check, Clock, AlertTriangle } from "lucide-react";
import { cn } from "../../utils/cn";
import { formatPrice } from "../../utils/currency";

/**
 * Single ticket category card. Handles all sale states
 * (not-started, on-sale, sold-out, ended) without hiding the card,
 * so customers can see the full lineup.
 */
export function TicketTypeCard({
  ticketType,
  selectedQuantity = 0,
  onAdd,
  onRemove,
  disabled = false,
}) {
  if (!ticketType) return null;

  const {
    name, description, price, currency, remaining, admits,
    benefits = [], saleState, minPerOrder, maxPerOrder, quantityTotal,
  } = ticketType;

  const soldOut = saleState === "SOLD_OUT" || remaining === 0;
  const notStarted = saleState === "NOT_STARTED";
  const ended = saleState === "ENDED";
  const unavailable = soldOut || notStarted || ended || disabled;
  const low = !unavailable && remaining > 0 && remaining <= Math.max(5, quantityTotal * 0.1);
  const isSelected = selectedQuantity > 0;

  const reason = soldOut
    ? "Sold out"
    : notStarted
    ? "Sales haven't started"
    : ended
    ? "Sales have ended"
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={cn(
        "relative rounded-2xl border bg-[var(--event-surface)] overflow-hidden transition-colors",
        isSelected
          ? "border-[var(--event-primary)] ring-2 ring-[var(--event-primary)]/20"
          : "border-[var(--event-border)] hover:border-[var(--event-primary)]/50",
        unavailable && "opacity-70"
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[var(--event-foreground)]">
                {name}
              </h3>
              {admits > 1 && (
                <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-[var(--event-primary)]/15 text-[var(--event-primary)] px-2 py-0.5">
                  Admits {admits}
                </span>
              )}
              {low && (
                <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-[var(--color-warning)]/15 text-[var(--color-warning)] px-2 py-0.5 inline-flex items-center gap-1">
                  <Clock size={10} /> {remaining} left
                </span>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm text-[var(--event-muted)] text-pretty">
                {description}
              </p>
            )}
            {benefits.length > 0 && (
              <ul className="mt-3 space-y-1">
                {benefits.slice(0, 4).map((b, i) => (
                  <li
                    key={i}
                    className="text-xs text-[var(--event-muted)] flex items-start gap-1.5"
                  >
                    <Check size={12} className="text-[var(--event-accent)] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="text-right shrink-0">
            <div className="text-lg sm:text-xl font-extrabold text-[var(--event-foreground)] tabular-nums">
              {formatPrice(price, currency)}
            </div>
            {admits > 1 && price > 0 && (
              <div className="text-[11px] text-[var(--event-muted)] mt-0.5">
                {formatPrice(Math.round(price / admits), currency)} / person
              </div>
            )}
          </div>
        </div>

        {/* Footer: qty controls or state message */}
        <div className="mt-4 pt-4 border-t border-[var(--event-border)] flex items-center justify-between gap-3">
          {reason ? (
            <div className="flex items-center gap-2 text-xs text-[var(--event-muted)]">
              <AlertTriangle size={14} /> {reason}
            </div>
          ) : (
            <p className="text-xs text-[var(--event-muted)]">
              {minPerOrder === maxPerOrder
                ? `Exactly ${minPerOrder} per order`
                : `Min ${minPerOrder} · Max ${maxPerOrder} per order`}
            </p>
          )}

          <TicketQtyControls
            quantity={selectedQuantity}
            max={Math.min(maxPerOrder, remaining)}
            min={0}
            disabled={unavailable}
            onAdd={() => onAdd?.()}
            onRemove={() => onRemove?.()}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default TicketTypeCard;