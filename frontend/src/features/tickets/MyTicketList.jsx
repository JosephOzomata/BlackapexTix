import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Ticket, Users, Calendar, MapPin, ArrowRight } from "lucide-react";
import { TicketStatusBadge } from "../../components/tickets/TicketStatusBadge";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "../../components/common/Button";
import { ROUTES } from "../../constants/routes";
import { formatDateTime } from "../../utils/dates";
import { cn } from "../../utils/cn";

export function MyTicketList({ tickets = [], emptyVariant = "upcoming" }) {
  if (!tickets.length) {
    const copy = {
      upcoming: {
        title: "No upcoming tickets",
        description: "When you buy tickets to an event, they'll appear here.",
      },
      past: {
        title: "No past tickets",
        description: "Your completed events will show up here.",
      },
      all: {
        title: "No tickets yet",
        description: "Discover events and grab your first ticket.",
      },
    }[emptyVariant];

    return (
      <EmptyState
        icon={<Ticket size={26} />}
        title={copy.title}
        description={copy.description}
        action={
          <Button to={ROUTES.events} leftIcon={<ArrowRight size={16} />}>
            Explore events
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tickets.map((t, i) => {
        const isGroup = (t.ticketType?.admits ?? 1) > 1;
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: Math.min(i * 0.03, 0.2) }}
          >
            <Link
              to={ROUTES.ticketDetail(t.id)}
              className={cn(
                "block rounded-2xl border border-border bg-card overflow-hidden",
                "hover:border-border-strong transition-colors"
              )}
            >
              <div className="relative h-32 bg-card-elevated overflow-hidden">
                {t.event?.media?.[0]?.url && (
                  <img
                    src={t.event.media[0].url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <div className="absolute top-3 right-3">
                  <TicketStatusBadge status={t.status} size="sm" />
                </div>
                {isGroup && (
                  <div className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur-sm border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1">
                    <Users size={10} /> Table
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-primary font-bold">
                  {t.ticketType?.name ?? "Ticket"}
                </p>
                <h3 className="mt-0.5 text-sm font-bold text-foreground line-clamp-2">
                  {t.event?.title ?? "Event"}
                </h3>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    {t.event ? formatDateTime(t.event.startAt, "EEE, d MMM · h:mm a") : "—"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} />
                    <span className="truncate">
                      {t.event?.city ?? "—"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {t.reference}
                  </span>
                  <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
                    View <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export default MyTicketList;