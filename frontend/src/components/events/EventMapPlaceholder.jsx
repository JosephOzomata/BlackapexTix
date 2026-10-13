import { MapPin, ExternalLink } from "lucide-react";
import { Button } from "../common/Button";

/**
 * Map placeholder. Real map integration is deferred to a later phase;
 * the component already exposes the `event.latitude/longitude` and
 * builds a Google Maps link so the UX is complete today.
 */
export function EventMapPlaceholder({ event }) {
  if (!event?.venue) return null;

  const hasCoords =
    typeof event.latitude === "number" && typeof event.longitude === "number";
  const mapUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.venue}, ${event.addressLine}, ${event.city}`
      )}`;

  return (
    <div className="rounded-2xl border border-[var(--event-border)] bg-[var(--event-surface)] overflow-hidden">
      <div className="relative aspect-[16/9] bg-[var(--event-background)] flex items-center justify-center">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, var(--event-primary), transparent 45%), radial-gradient(circle at 70% 70%, var(--event-accent), transparent 45%)",
          }}
        />
        <div className="relative flex flex-col items-center text-center px-6">
          <span className="h-12 w-12 rounded-full bg-[var(--event-primary)]/20 border border-[var(--event-primary)]/40 flex items-center justify-center text-[var(--event-primary)] mb-3">
            <MapPin size={22} />
          </span>
          <p className="text-sm font-semibold text-[var(--event-foreground)]">
            {event.venue}
          </p>
          <p className="text-xs text-[var(--event-muted)] mt-1">
            {event.addressLine}, {event.city}
          </p>
        </div>
      </div>
      <div className="p-4 border-t border-[var(--event-border)] flex justify-end">
        <Button
          as="a"
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="subtle"
          size="sm"
          rightIcon={<ExternalLink size={14} />}
          className="bg-[var(--event-background)] border-[var(--event-border)] text-[var(--event-foreground)] hover:bg-[var(--event-surface-elevated)]"
        >
          Open in Maps
        </Button>
      </div>
    </div>
  );
}

export default EventMapPlaceholder;