import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, ScanLine } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import { formatDateTime } from "../../utils/dates";
import { ROUTES } from "../../constants/routes";

export function ScannerEventsList({ items = [], loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={<ScanLine size={26} />}
        title="No events assigned"
        description="When an organizer invites you to scan their event, it will appear here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map(({ event, status, checkInsCount }, i) => {
        const primary = event?.media?.[0];
        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: Math.min(i * 0.04, 0.2) }}
          >
            <Link
              to={ROUTES.scanner.event(event.id)}
              className="flex items-stretch gap-3 rounded-2xl border border-border bg-card hover:border-border-strong transition-colors overflow-hidden"
            >
              <div className="w-24 sm:w-28 shrink-0 bg-card-elevated overflow-hidden">
                {primary?.url && (
                  <img
                    src={primary.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    tone={status === "ACTIVE" ? "success" : "warning"}
                    size="sm"
                  >
                    {status === "ACTIVE" ? "Active" : "Invitation pending"}
                  </Badge>
                </div>
                <h3 className="mt-1.5 text-sm font-bold text-foreground truncate">
                  {event.title}
                </h3>
                <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} /> {formatDateTime(event.startAt, "EEE, d MMM · h:mm a")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} /> <span className="truncate">{event.city}</span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-subtle">
                  {checkInsCount ?? 0} check-ins recorded
                </div>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}

export default ScannerEventsList;