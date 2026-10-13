import { OrderSummary } from "../../components/payment/OrderSummary";
import { AttendeeForm } from "../../components/tickets/AttendeeForm";
import { useCartStore } from "../../stores/cartStore";

export function OrderReview({ onAttendeesChange }) {
  const lines = useCartStore((s) => s.lines);
  const totals = useCartStore((s) => s.getTotals());
  const setAttendees = useCartStore((s) => s.setAttendees);

  const summaryLines = Object.values(lines).map((l) => ({
    name: l.name,
    quantity: l.quantity,
    price: l.price,
    admits: l.admits,
  }));

  const groupLines = Object.values(lines).filter((l) => (l.admits ?? 1) > 1);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        {groupLines.map((l) => (
          <div key={l.ticketTypeId} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              {l.name}
            </h3>
            <AttendeeForm
              ticketTypeName={l.name}
              count={l.quantity * (l.admits ?? 1)}
              value={l.attendees ?? []}
              onChange={(next) => {
                setAttendees(l.ticketTypeId, next);
                onAttendeesChange?.(l.ticketTypeId, next);
              }}
            />
          </div>
        ))}

        {groupLines.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              No attendee details required — single-entry tickets will be issued
              to the purchaser's account.
            </p>
          </div>
        )}
      </div>

      <OrderSummary
        lines={summaryLines}
        subtotal={totals.subtotal}
        fees={totals.fees}
        total={totals.total}
        currency={totals.currency}
      />
    </div>
  );
}

export default OrderReview;