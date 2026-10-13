import { Calendar, Clock, MapPin, Users, Sparkles, Tag } from "lucide-react";
import { formatEventRange, formatTime } from "../../utils/dates";
import { CATEGORY_BY_SLUG } from "../../constants/categories";

export function EventInfo({ event }) {
  if (!event) return null;
  const cat = CATEGORY_BY_SLUG[event.categorySlug];

  const rows = [
    {
      icon: <Calendar size={18} />,
      label: "Date",
      value: formatEventRange(event.startAt, event.endAt, { withTime: false }),
    },
    {
      icon: <Clock size={18} />,
      label: "Time",
      value: `Doors ${formatTime(event.doorsOpenAt)} · ${formatTime(event.startAt)} – ${formatTime(event.endAt)}`,
    },
    {
      icon: <MapPin size={18} />,
      label: "Venue",
      value: event.venue,
      sub: `${event.addressLine}, ${event.city}, ${event.state}`,
    },
    ...(event.ageRestriction
      ? [{ icon: <Users size={18} />, label: "Age restriction", value: `${event.ageRestriction}+` }]
      : []),
    ...(cat
      ? [{ icon: <Tag size={18} />, label: "Category", value: cat.label }]
      : []),
    ...(event.tags?.length
      ? [{
          icon: <Sparkles size={18} />,
          label: "Tags",
          value: event.tags.join(" · "),
        }]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-[var(--event-border)] bg-[var(--event-surface)] overflow-hidden">
      <div className="divide-y divide-[var(--event-border)]">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start gap-4 p-4 sm:p-5">
            <span className="h-10 w-10 rounded-lg bg-[var(--event-background)] border border-[var(--event-border)] flex items-center justify-center text-[var(--event-primary)] shrink-0">
              {r.icon}
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-[var(--event-muted)] font-semibold">
                {r.label}
              </div>
              <div className="text-sm sm:text-base text-[var(--event-foreground)] font-medium mt-0.5 break-words">
                {r.value}
              </div>
              {r.sub && (
                <div className="text-xs text-[var(--event-muted)] mt-0.5">{r.sub}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventInfo;