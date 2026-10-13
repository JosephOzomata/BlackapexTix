import { motion } from "framer-motion";
import { Ticket, MapPin, Calendar } from "lucide-react";
import { cn } from "../../utils/cn";
import { formatEventRange } from "../../utils/dates";
import { formatPrice } from "../../utils/currency";

/**
 * Compact event-page preview that applies a theme object via inline
 * CSS custom properties. Used inside the wizard's Theme step so the
 * organizer sees a real preview of the public event page.
 */
export function EventThemePreview({ theme, event, className }) {
  if (!theme) return null;

  const style = {
    "--event-primary": theme.primary,
    "--event-primary-foreground": theme.primaryForeground,
    "--event-secondary": theme.secondary,
    "--event-secondary-foreground": theme.secondaryForeground,
    "--event-accent": theme.accent,
    "--event-accent-foreground": theme.accentForeground,
    "--event-background": theme.background,
    "--event-surface": theme.surface,
    "--event-surface-elevated": theme.surfaceElevated,
    "--event-foreground": theme.foreground,
    "--event-muted": theme.muted,
    "--event-border": theme.border,
    "--event-glow": theme.glow,
  };

  const primaryImage = event?.media?.find((m) => m.isPrimary) ?? event?.media?.[0];

  return (
    <div
      style={style}
      className={cn(
        "event-theme rounded-2xl overflow-hidden border border-[var(--event-border)] bg-[var(--event-background)]",
        className
      )}
    >
      <div className="relative h-40 sm:h-48 bg-[var(--event-surface)] event-glow overflow-hidden">
        {primaryImage?.url ? (
          <img
            src={primaryImage.url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--event-background)] via-[var(--event-background)]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--event-accent)] font-bold">
            {event?.categorySlug ?? "Event"}
          </p>
          <h3 className="mt-1 text-lg sm:text-xl font-extrabold text-[var(--event-foreground)] leading-tight">
            {event?.title || "Your event title"}
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-[var(--event-muted)]">
          <Calendar size={12} />
          {event?.startAt
            ? formatEventRange(event.startAt, event.endAt, { withTime: false })
            : "Date to be announced"}
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--event-muted)]">
          <MapPin size={12} />
          {event?.venue ? `${event.venue}, ${event.city}` : "Venue to be announced"}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--event-primary)] text-[var(--event-primary-foreground)] text-xs font-semibold px-3 py-2">
            <Ticket size={12} /> Get tickets
          </span>
          <span className="text-sm font-bold text-[var(--event-foreground)] ml-auto">
            {formatPrice(event?.startingPrice ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default EventThemePreview;