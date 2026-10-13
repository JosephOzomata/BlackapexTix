import { AlertTriangle, Clock, XCircle, CheckCircle2, Ban } from "lucide-react";
import { cn } from "../../utils/cn";

const VARIANTS = {
  CANCELLED: {
    tone: "danger",
    icon: <XCircle size={18} />,
    title: "This event has been cancelled.",
    body: (e) =>
      e.cancellationReason
        ? `Reason: ${e.cancellationReason}. Refunds are being processed for existing ticket holders.`
        : "Refunds are being processed for existing ticket holders.",
  },
  COMPLETED: {
    tone: "neutral",
    icon: <CheckCircle2 size={18} />,
    title: "This event has already taken place.",
    body: () => "Thanks for visiting. Discover more upcoming events below.",
  },
  SALES_ENDED: {
    tone: "warning",
    icon: <Clock size={18} />,
    title: "Ticket sales have ended.",
    body: () => "This event is still visible for reference.",
  },
  SOLD_OUT: {
    tone: "danger",
    icon: <Ban size={18} />,
    title: "Sold out.",
    body: () => "All tickets for this event have been claimed.",
  },
  UNPUBLISHED: {
    tone: "warning",
    icon: <AlertTriangle size={18} />,
    title: "This event is temporarily unavailable.",
    body: () => "The organizer has unpublished this event. Please check back later.",
  },
};

export function EventStatusNotice({ event, className }) {
  if (!event) return null;
  const cfg = VARIANTS[event.status];
  if (!cfg) return null;

  const toneClass = {
    danger: "border-danger/30 bg-danger/10 text-danger",
    warning: "border-warning/30 bg-warning/10 text-warning",
    neutral: "border-border bg-card text-muted-foreground",
  }[cfg.tone];

  return (
    <div className={cn("rounded-xl border p-4 flex items-start gap-3", toneClass, className)}>
      <span className="shrink-0 mt-0.5">{cfg.icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{cfg.title}</p>
        <p className="text-xs mt-1 opacity-90">{cfg.body(event)}</p>
      </div>
    </div>
  );
}

export default EventStatusNotice;