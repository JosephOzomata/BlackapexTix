import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Users, Share2, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "../../utils/cn";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { getDateBadge, formatEventRange, formatTime } from "../../utils/dates";
import { CATEGORY_BY_SLUG } from "../../constants/categories";
import { StatusBadge } from "../common/StatusBadge";

/**
 * Event hero — cinematic, flyer-driven. Uses the ambient event theme
 * (--event-* CSS vars) for glow, gradients, and accent colours.
 */
export function EventHero({ event, activeImageIndex = 0, onShare, onSave, isSaved }) {
  if (!event) return null;

  const images = event.media ?? [];
  const primary = images.find((m) => m.isPrimary) ?? images[0];
  const activeImage = images[activeImageIndex] ?? primary;
  const badge = getDateBadge(event.startAt);
  const cat = CATEGORY_BY_SLUG[event.categorySlug];

  return (
    <section className="relative event-glow overflow-hidden">
      {/* Blurred backdrop from current image */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
      >
        {activeImage?.url && (
          <motion.div
            key={activeImage.id ?? activeImage.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center scale-125 blur-3xl"
            style={{ backgroundImage: `url(${activeImage.url})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--event-background)]/70 via-[var(--event-background)]/90 to-[var(--event-background)]" />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-16 lg:pb-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14 items-start">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-0 order-2 lg:order-1"
          >
            <div className="flex items-center flex-wrap gap-2 mb-3">
              {cat && (
                <span className="text-xs font-bold uppercase tracking-[0.16em] event-gradient-text">
                  {cat.label}
                </span>
              )}
              <StatusBadge kind="event" status={event.status} size="sm" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-[var(--event-foreground)] text-balance leading-[1.05]">
              {event.title}
            </h1>

            {event.organizer && (
              <p className="mt-3 text-sm text-[var(--event-muted)]">
                By{" "}
                <span className="text-[var(--event-foreground)] font-medium">
                  {event.organizer.businessName}
                </span>
                {event.organizer.status === "VERIFIED" && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-[var(--event-accent)] font-semibold">
                    ✓ Verified
                  </span>
                )}
              </p>
            )}

            {/* Event facts */}
            <div className="mt-6 space-y-3">
              <HeroFact
                icon={<Calendar size={16} />}
                primary={`${badge.weekday}, ${badge.day} ${badge.month}`}
                secondary={formatEventRange(event.startAt, event.endAt, { withTime: false })}
              />
              <HeroFact
                icon={<Clock size={16} />}
                primary={`Doors ${formatTime(event.doorsOpenAt)} · Starts ${formatTime(event.startAt)}`}
              />
              <HeroFact
                icon={<MapPin size={16} />}
                primary={event.venue}
                secondary={`${event.addressLine}, ${event.city}`}
              />
              {event.ageRestriction && (
                <HeroFact
                  icon={<Users size={16} />}
                  primary={`${event.ageRestriction}+ only`}
                />
              )}
            </div>

            {/* CTA row */}
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Button
                variant="secondary"
                size="md"
                onClick={onShare}
                leftIcon={<Share2 size={16} />}
                className="bg-[var(--event-surface)] text-[var(--event-foreground)] border border-[var(--event-border)] hover:bg-[var(--event-surface-elevated)]"
              >
                Share
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={onSave}
                leftIcon={<Heart size={16} fill={isSaved ? "currentColor" : "none"} />}
                className="text-[var(--event-foreground)] hover:bg-[var(--event-surface)]"
              >
                {isSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </motion.div>

          {/* Right: flyer */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
            className="order-1 lg:order-2 w-full max-w-md mx-auto lg:mx-0 lg:max-w-none"
          >
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 rounded-3xl opacity-60 blur-3xl"
                style={{
                  background:
                    "radial-gradient(60% 60% at 30% 30%, var(--event-primary), transparent 70%), radial-gradient(50% 50% at 70% 70%, var(--event-accent), transparent 70%)",
                }}
              />
              <div className="relative rounded-2xl overflow-hidden border border-[var(--event-border)] shadow-2xl bg-[var(--event-surface)]">
                {activeImage?.url ? (
                  <img
                    src={activeImage.url}
                    alt={event.title}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center text-[var(--event-muted)]">
                    No flyer
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroFact({ icon, primary, secondary }) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-8 w-8 rounded-lg bg-[var(--event-surface)] border border-[var(--event-border)] flex items-center justify-center text-[var(--event-primary)] shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium text-[var(--event-foreground)]">
          {primary}
        </div>
        {secondary && (
          <div className="text-xs text-[var(--event-muted)] mt-0.5">{secondary}</div>
        )}
      </div>
    </div>
  );
}

export default EventHero;