import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Edit3, Ticket, Users, ScanLine, Eye, BarChart3, Copy, Trash2, Ban,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { formatCurrency } from "../../utils/currency";
import { formatDateTime } from "../../utils/dates";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../utils/cn";

export function EventControlCenter({
  event,
  onDuplicate,
  onDelete,
  onCancel,
  onPublish,
  className,
}) {
  if (!event) return null;

  const stats = event.stats ?? {};
  const sold = stats.sold ?? 0;
  const capacity = stats.capacity ?? 0;
  const checkedIn = stats.checkedIn ?? 0;
  const revenue = stats.revenue ?? 0;

  const primary = event.media?.find((m) => m.isPrimary) ?? event.media?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        {primary?.url ? (
          <img
            src={primary.url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-card-elevated" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <StatusBadge kind="event" status={event.status} size="sm" />
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-foreground leading-tight">
              {event.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateTime(event.startAt, "EEE, d MMM yyyy · h:mm a")} · {event.city}
            </p>
          </div>
          <Button
            as={Link}
            to={ROUTES.eventDetail(event.slug)}
            variant="subtle"
            size="sm"
            leftIcon={<Eye size={14} />}
            className="shrink-0 bg-background/80 backdrop-blur-sm border-white/10"
          >
            Preview
          </Button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-border">
        <Stat label="Revenue" value={formatCurrency(revenue, "NGN")} />
        <Stat label="Sold" value={`${sold} / ${capacity}`} />
        <Stat label="Checked in" value={`${checkedIn} / ${sold || 0}`} />
        <Stat
          label="Rate"
          value={`${sold ? Math.round((checkedIn / sold) * 100) : 0}%`}
        />
      </div>

      <div className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">
          Quick actions
        </p>
        <div className="flex flex-wrap gap-2">
          <Button as={Link} to={ROUTES.organizer.eventEdit(event.id)} variant="outline" size="sm" leftIcon={<Edit3 size={14} />}>
            Edit
          </Button>
          <Button as={Link} to={ROUTES.organizer.eventTickets(event.id)} variant="outline" size="sm" leftIcon={<Ticket size={14} />}>
            Tickets
          </Button>
          <Button as={Link} to={ROUTES.organizer.eventAttendees(event.id)} variant="outline" size="sm" leftIcon={<Users size={14} />}>
            Attendees
          </Button>
          <Button as={Link} to={ROUTES.organizer.eventScanners(event.id)} variant="outline" size="sm" leftIcon={<ScanLine size={14} />}>
            Scanners
          </Button>
          <Button as={Link} to={ROUTES.organizer.eventAnalytics(event.id)} variant="outline" size="sm" leftIcon={<BarChart3 size={14} />}>
            Analytics
          </Button>
          {event.status === "DRAFT" && onPublish && (
            <Button variant="primary" size="sm" onClick={onPublish}>
              Publish event
            </Button>
          )}
          {onDuplicate && (
            <Button variant="ghost" size="sm" onClick={onDuplicate} leftIcon={<Copy size={14} />}>
              Duplicate
            </Button>
          )}
          {event.status === "DRAFT" && onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} leftIcon={<Trash2 size={14} />}>
              Delete draft
            </Button>
          )}
          {event.status !== "CANCELLED" && event.status !== "COMPLETED" && onCancel && (
            <Button variant="ghost" size="sm" className="text-danger" onClick={onCancel} leftIcon={<Ban size={14} />}>
              Cancel event
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-sm sm:text-base font-bold text-foreground tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
    </div>
  );
}

export default EventControlCenter;