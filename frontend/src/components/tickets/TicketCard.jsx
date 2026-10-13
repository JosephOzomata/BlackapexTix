import { forwardRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, User, Ticket as TicketIcon } from "lucide-react";
import { TicketQRCode } from "./TicketQRCode";
import { TicketStatusBadge } from "./TicketStatusBadge";
import { formatDateTime } from "../../utils/dates";
import { cn } from "../../utils/cn";

/**
 * Ticket card used in My Tickets, detail view, and PNG export.
 * The forwarded ref points at the visual container so DownloadTicketButton
 * can rasterise exactly this markup.
 */
export const TicketCard = forwardRef(function TicketCard(
  { ticket, variant = "default", className },
  ref
) {
  if (!ticket) return null;

  const { event } = ticket;
  const primary = event?.media?.find((m) => m.isPrimary) ?? event?.media?.[0];
  const eventTheme = event?.theme;

  const styleVars = eventTheme
    ? {
        "--event-primary": eventTheme.primary,
        "--event-secondary": eventTheme.secondary,
        "--event-accent": eventTheme.accent,
        "--event-background": eventTheme.background,
        "--event-surface": eventTheme.surface,
        "--event-surface-elevated": eventTheme.surfaceElevated,
        "--event-foreground": eventTheme.foreground,
        "--event-muted": eventTheme.muted,
        "--event-border": eventTheme.border,
      }
    : {};

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={styleVars}
      className={cn(
        "event-theme rounded-2xl overflow-hidden border border-[var(--event-border)] bg-[var(--event-surface)] shadow-xl",
        className
      )}
    >
      {/* Header with flyer */}
      <div className="relative h-32 bg-[var(--event-background)] overflow-hidden">
        {primary?.url && (
          <img
            src={primary.url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--event-surface)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-[var(--event-accent)] font-bold">
              {ticket.ticketType?.name ?? "Ticket"}
            </p>
            <h3 className="text-base sm:text-lg font-bold text-[var(--event-foreground)] truncate">
              {event?.title ?? "Event"}
            </h3>
          </div>
          <TicketStatusBadge status={ticket.status} size="sm" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
        <div className="space-y-2.5 min-w-0">
          <Row icon={<User size={12} />} label="Attendee" value={ticket.attendeeName} />
          <Row icon={<Calendar size={12} />} label="Date" value={event ? formatDateTime(event.startAt, "EEE, d MMM yyyy · h:mm a") : "—"} />
          <Row
            icon={<MapPin size={12} />}
            label="Venue"
            value={event ? `${event.venue ?? ""}${event.city ? `, ${event.city}` : ""}` : "—"}
          />
          <Row
            icon={<TicketIcon size={12} />}
            label="Reference"
            value={ticket.reference}
            mono
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <TicketQRCode token={ticket.verificationToken} size={variant === "compact" ? 140 : 176} />
          <p className="text-[10px] text-[var(--event-muted)] text-center max-w-[176px]">
            Present this QR at entry. Each attendee has their own unique code.
          </p>
        </div>
      </div>
    </motion.div>
  );
});

function Row({ icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-[var(--event-muted)] shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-[var(--event-muted)] font-semibold">
          {label}
        </div>
        <div
          className={cn(
            "text-sm text-[var(--event-foreground)] font-medium truncate",
            mono && "font-mono text-xs"
          )}
        >
          {value ?? "—"}
        </div>
      </div>
    </div>
  );
}

export default TicketCard;