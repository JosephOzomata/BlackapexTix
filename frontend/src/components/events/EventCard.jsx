import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "../../utils/cn";
import { Badge } from "../common/Badge";
import { ROUTES } from "../../constants/routes";
import { getDateBadge, formatEventRange, getDayLabel } from "../../utils/dates";
import { formatPrice } from "../../utils/currency";
import { CATEGORY_BY_SLUG } from "../../constants/categories";

export function EventCard({ event, index = 0, className, compact = false }) {
  const [saved, setSaved] = useState(false);
  if (!event) return null;

  const primary = event.media?.find((m) => m.isPrimary) ?? event.media?.[0];
  const badge = getDateBadge(event.startAt);
  const dayLabel = getDayLabel(event.startAt);
  const cat = CATEGORY_BY_SLUG[event.categorySlug];
  const soldOut = event.ticketSummary?.isSoldOut;
  const lowStock = event.ticketSummary?.isLowStock && !soldOut;
  const isPast = new Date(event.startAt) < new Date();
  const cancelled = event.status === "CANCELLED";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -3 }}
      className={cn("group relative", className)}
    >
      <Link
        to={ROUTES.eventDetail(event.slug)}
        className="block rounded-2xl overflow-hidden border border-border bg-card hover:border-border-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-card-elevated">
          {primary?.url ? (
            <img
              src={primary.url}
              alt={event.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <Calendar size={32} />
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Date badge */}
          <div className="absolute top-3 left-3 rounded-xl bg-background/95 backdrop-blur-sm text-center px-2.5 py-1.5 shadow-lg border border-white/10">
            <div className="text-[10px] font-bold text-primary tracking-wider">
              {badge.weekday}
            </div>
            <div className="text-lg font-extrabold text-foreground leading-none">
              {badge.day}
            </div>
            <div className="text-[10px] font-semibold text-muted-foreground tracking-wider">
              {badge.month}
            </div>
          </div>

          {/* Save button */}
          <button
            type="button"
            aria-label={saved ? "Remove from saved" : "Save event"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSaved((v) => !v);
            }}
            className={cn(
              "absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors",
              saved
                ? "bg-danger/90 border-danger text-white"
                : "bg-black/40 border-white/20 text-white hover:bg-black/60"
            )}
          >
            <Heart size={16} fill={saved ? "currentColor" : "none"} />
          </button>

          {/* Status badges */}
          <div className="absolute top-3 right-14 flex flex-col gap-1.5 items-end">
            {cancelled && <Badge tone="danger" size="sm">Cancelled</Badge>}
            {soldOut && !cancelled && <Badge tone="danger" size="sm">Sold Out</Badge>}
            {lowStock && !cancelled && <Badge tone="warning" size="sm">Few Left</Badge>}
            {!isPast && dayLabel && !soldOut && !cancelled && !lowStock && (
              <Badge tone="primary" size="sm">{dayLabel}</Badge>
            )}
          </div>

          {/* Bottom info */}
          <div className="absolute inset-x-0 bottom-0 p-3.5">
            {cat && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-white/80 mb-1">
                {cat.label}
              </span>
            )}
            <h3 className="font-bold text-white text-base leading-tight line-clamp-2 text-balance">
              {event.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/85">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">
                {event.venue ? `${event.venue} · ` : ""}{event.city}
              </span>
            </div>
          </div>
        </div>

        {!compact && (
          <div className="p-3.5 flex items-center justify-between gap-2 border-t border-border">
            <div className="min-w-0">
              <div className="text-[10px] text-subtle uppercase tracking-wider font-semibold">
                From
              </div>
              <div className="text-sm font-bold text-foreground">
                {formatPrice(event.startingPrice ?? 0, "NGN")}
              </div>
            </div>
            {event.organizer && (
              <div className="text-[11px] text-muted-foreground truncate text-right max-w-[55%]">
                {event.organizer.businessName}
              </div>
            )}
          </div>
        )}
      </Link>
    </motion.article>
  );
}

export default EventCard;