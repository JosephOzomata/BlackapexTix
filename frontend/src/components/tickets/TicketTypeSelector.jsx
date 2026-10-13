import { motion } from "framer-motion";
import { TicketTypeCard } from "./TicketTypeCard";
import { Ticket, AlertCircle } from "lucide-react";

/**
 * Renders all ticket categories for an event, wiring quantities back
 * to the caller. All availability/state handling lives in the card.
 */
export function TicketTypeSelector({
  ticketTypes = [],
  selections = {},   // { [ticketTypeId]: quantity }
  onAdd,
  onRemove,
  disabled = false,
}) {
  if (!ticketTypes.length) {
    return (
      <div className="rounded-2xl border border-[var(--event-border)] bg-[var(--event-surface)] p-8 text-center">
        <AlertCircle size={26} className="mx-auto text-[var(--event-muted)]" />
        <p className="mt-3 text-sm text-[var(--event-muted)]">
          Ticket categories haven't been published for this event yet.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Ticket categories" className="space-y-3">
      <header className="flex items-center gap-2 mb-1">
        <Ticket size={18} className="text-[var(--event-primary)]" />
        <h2 className="text-lg font-bold text-[var(--event-foreground)]">
          Choose your tickets
        </h2>
      </header>

      <motion.div layout className="space-y-3">
        {ticketTypes.map((t) => (
          <TicketTypeCard
            key={t.id}
            ticketType={t}
            selectedQuantity={selections[t.id] ?? 0}
            disabled={disabled}
            onAdd={() => onAdd?.(t)}
            onRemove={() => onRemove?.(t)}
          />
        ))}
      </motion.div>
    </section>
  );
}

export default TicketTypeSelector;