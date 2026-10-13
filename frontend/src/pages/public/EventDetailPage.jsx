import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Ticket, ShoppingBag, Users, ArrowLeft } from "lucide-react";

import { EventHero } from "../../components/events/EventHero";
import { EventInfo } from "../../components/events/EventInfo";
import { EventDescription } from "../../components/events/EventDescription";
import { EventPolicies } from "../../components/events/EventPolicies";
import { EventMapPlaceholder } from "../../components/events/EventMapPlaceholder";
import { EventStatusNotice } from "../../components/events/EventStatusNotice";
import { EventShareButton } from "../../components/events/EventShareButton";
import { EventCarousel } from "../../components/events/EventCarousel";
import { TicketTypeSelector } from "../../components/tickets/TicketTypeSelector";
import { Button } from "../../components/common/Button";
import { Spinner } from "../../components/common/Spinner";

import { eventsService } from "../../services/events.service";
import { queryKeys } from "../../queryClient";
import { useCartStore } from "../../stores/cartStore";
import { useThemeStore } from "../../stores/themeStore";
import { useEventSeo } from "../../hooks/useSeo";
import { useEventPalette } from "../../hooks/useEventPalette";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { ROUTES } from "../../constants/routes";
import { formatPrice } from "../../utils/currency";
import { cn } from "../../utils/cn";
import { DEFAULT_EVENT_THEME } from "../../utils/theme/generateEventTheme";

export default function EventDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.events.detail(slug),
    queryFn: () => eventsService.getEventBySlug(slug),
    retry: false,
  });
  const event = data?.data;

  useEventSeo(event);

  /* Resolve theme: from event data, or extract from primary flyer if missing */
  const storedTheme = event?.theme;
  const primaryImage =
    event?.media?.find((m) => m.isPrimary)?.url ?? event?.media?.[0]?.url;
  const { theme: extractedTheme } = useEventPalette(storedTheme);
  const [analyzedTheme, setAnalyzedTheme] = useState(null);

  const resolvedTheme =
    storedTheme ?? analyzedTheme ?? DEFAULT_EVENT_THEME;

  // Trigger extraction once when needed.
  useMemo(() => {
    if (!storedTheme && primaryImage && !analyzedTheme) {
      import("../../utils/theme/extractEventPalette").then(({ extractEventPalette }) =>
        import("../../utils/theme/generateEventTheme").then(({ generateEventTheme }) =>
          extractEventPalette(primaryImage).then((p) =>
            setAnalyzedTheme(generateEventTheme(p))
          )
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedTheme, primaryImage]);

  /* Cart wiring */
  const cartLines = useCartStore((s) => s.lines);
  const addLine = useCartStore((s) => s.addLine);
  const removeLine = useCartStore((s) => s.setQuantity);
  const setEvent = useCartStore((s) => s.setEvent);
  const totals = useCartStore((s) => s.getTotals());

  // Ensure cart is scoped to this event.
  useMemo(() => {
    if (event) {
      setEvent({
        eventId: event.id,
        eventSlug: event.slug,
        eventTitle: event.title,
        eventCurrency: event.ticketTypes?.[0]?.currency ?? "NGN",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  const themeStyle = {
    "--event-primary": resolvedTheme.primary,
    "--event-primary-foreground": resolvedTheme.primaryForeground,
    "--event-secondary": resolvedTheme.secondary,
    "--event-secondary-foreground": resolvedTheme.secondaryForeground,
    "--event-accent": resolvedTheme.accent,
    "--event-accent-foreground": resolvedTheme.accentForeground,
    "--event-background": resolvedTheme.background,
    "--event-surface": resolvedTheme.surface,
    "--event-surface-elevated": resolvedTheme.surfaceElevated,
    "--event-foreground": resolvedTheme.foreground,
    "--event-muted": resolvedTheme.muted,
    "--event-border": resolvedTheme.border,
    "--event-glow": resolvedTheme.glow,
  };

  if (isLoading) {
    return (
      <div className="min-h-[80dvh] flex items-center justify-center">
        <Spinner size="lg" label="Loading event" />
      </div>
    );
  }

  if (isError || !event) {
    const code = data?.code;
    if (code === "EVENT_UNPUBLISHED" || code === "EVENT_NOT_FOUND") {
      return (
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">
            This event couldn't be found. It may have been removed or unpublished.
          </p>
          <div className="mt-5 flex gap-2 justify-center">
            <Button to={ROUTES.events}>Browse events</Button>
            <Button variant="outline" to={ROUTES.home}>Go home</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">We couldn't load this event.</p>
        <Button className="mt-4" onClick={refetch}>Try again</Button>
      </div>
    );
  }

  const selections = Object.fromEntries(
    Object.values(cartLines).map((l) => [l.ticketTypeId, l.quantity])
  );
  const soldOutEvent = event.ticketSummary?.isSoldOut;
  const salesEnded = event.status === "SALES_ENDED";
  const canBuy = !soldOutEvent && !salesEnded && event.status !== "CANCELLED" && event.status !== "COMPLETED";

  return (
    <div style={themeStyle} className="event-theme min-h-dvh pb-28 lg:pb-0">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-4">
        <Link
          to={ROUTES.events}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--event-muted)] hover:text-[var(--event-foreground)]"
        >
          <ArrowLeft size={14} /> Back to events
        </Link>
      </div>

      <EventHero
        event={event}
        activeImageIndex={activeImageIndex}
        isSaved={saved}
        onSave={() => setSaved((v) => !v)}
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-10">
          {/* Left: content */}
          <div className="space-y-8 min-w-0">
            <EventStatusNotice event={event} />

            {/* Carousel of additional flyers */}
            {event.media?.length > 1 && (
              <div className="rounded-2xl border border-[var(--event-border)] bg-[var(--event-surface)] p-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--event-muted)] mb-3">
                  Gallery
                </h3>
                <EventCarousel
                  images={event.media}
                  autoPlay={0}
                  onIndexChange={setActiveImageIndex}
                />
              </div>
            )}

            <EventDescription text={event.description} />

            <EventInfo event={event} />

            <EventMapPlaceholder event={event} />

            <EventPolicies event={event} />
          </div>

          {/* Right: ticketing */}
          <div className="space-y-5">
            <div className="lg:sticky lg:top-20 space-y-5">
              {canBuy && (
                <TicketTypeSelector
                  ticketTypes={event.ticketTypes ?? []}
                  selections={selections}
                  onAdd={(t) => addLine(t, 1)}
                  onRemove={(t) =>
                    removeLine(t.id, (selections[t.id] ?? 1) - 1)
                  }
                />
              )}

              {/* Order preview */}
              {Object.keys(cartLines).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-[var(--event-border)] bg-[var(--event-surface)] p-5"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--event-muted)] mb-3">
                    Your order
                  </h3>
                  <div className="space-y-2 mb-3">
                    {Object.values(cartLines).map((l) => (
                      <div
                        key={l.ticketTypeId}
                        className="flex justify-between text-sm text-[var(--event-foreground)]"
                      >
                        <span>
                          {l.name} × {l.quantity}
                        </span>
                        <span className="tabular-nums">
                          {formatPrice(l.price * l.quantity, l.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-[var(--event-border)] flex justify-between font-bold text-[var(--event-foreground)]">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      {formatPrice(totals.subtotal, totals.currency)}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full mt-4"
                    leftIcon={<ShoppingBag size={16} />}
                    onClick={() => navigate(ROUTES.checkout(event.slug))}
                  >
                    Continue to checkout
                  </Button>
                </motion.div>
              )}

              <div className="rounded-2xl border border-[var(--event-border)] bg-[var(--event-surface)] p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[var(--event-muted)]">Share the vibe</p>
                  <p className="text-sm font-medium text-[var(--event-foreground)]">
                    Invite your people
                  </p>
                </div>
                <EventShareButton event={event} />
              </div>

              {event.organizer && (
                <Link
                  to={ROUTES.organizerPublic(event.organizer.slug)}
                  className="block rounded-2xl border border-[var(--event-border)] bg-[var(--event-surface)] p-5 hover:border-[var(--event-primary)]/50 transition-colors"
                >
                  <p className="text-xs text-[var(--event-muted)] mb-1.5">Organized by</p>
                  <p className="font-semibold text-[var(--event-foreground)]">
                    {event.organizer.businessName}
                  </p>
                  {event.organizer.status === "VERIFIED" && (
                    <p className="text-xs text-[var(--event-accent)] mt-1">✓ Verified organizer</p>
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      {canBuy && isMobile && (
        <motion.div
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 inset-x-0 z-sticky border-t border-[var(--event-border)] bg-[var(--event-surface)] p-3 safe-bottom"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-[var(--event-muted)] font-bold">
                From
              </p>
              <p className="text-base font-extrabold text-[var(--event-foreground)]">
                {formatPrice(event.startingPrice ?? 0)}
              </p>
            </div>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                const target = document.querySelector("[aria-label='Ticket categories']");
                target?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <Ticket size={16} className="mr-1.5" /> Get tickets
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}