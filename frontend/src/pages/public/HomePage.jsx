import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Sparkles, CalendarClock, MapPin } from "lucide-react";
import { EventSearchBar } from "../../components/events/EventSearchBar";
import { EventGrid } from "../../components/events/EventGrid";
import { EventCategoryChips } from "../../components/events/EventCategoryChips";
import { Button } from "../../components/common/Button";
import { eventsService } from "../../services/events.service";
import { queryKeys } from "../../queryClient";
import { ROUTES } from "../../constants/routes";
import { useSeo } from "../../hooks/useSeo";
import { useNavigate } from "react-router-dom";
import { APP } from "../../constants/config";

export default function HomePage() {
  useSeo({
    title: "Discover events near you",
    description: APP.description,
  });

  const navigate = useNavigate();

  const featured = useQuery({
    queryKey: queryKeys.events.featured,
    queryFn: () => eventsService.getFeatured(),
  });
  const trending = useQuery({
    queryKey: queryKeys.events.trending,
    queryFn: () => eventsService.getTrending(),
  });
  const upcoming = useQuery({
    queryKey: queryKeys.events.upcoming,
    queryFn: () => eventsService.getUpcoming(),
  });
  const cities = useQuery({
    queryKey: ["events", "cities"],
    queryFn: () => eventsService.getCities(),
  });

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -top-20 right-0 h-[420px] w-[420px] rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.05),transparent_60%)]" />
        </div>

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-16 pb-14 lg:pt-24 lg:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm px-3 py-1 text-xs text-muted-foreground">
              <Sparkles size={12} className="text-primary" />
              The best events in Nigeria, in one place
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05] text-balance">
              Find your next <span className="event-gradient-text">unforgettable</span> night out.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty">
              From intimate jazz nights to the city's biggest raves — discover, book, and
              get instant QR tickets on any device.
            </p>

            <div className="mt-8">
              <EventSearchBar />
            </div>

            <div className="mt-8">
              <EventCategoryChips
                onChange={(slug) =>
                  navigate(slug ? `${ROUTES.events}?category=${slug}` : ROUTES.events)
                }
                showAll
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED */}
      <Section
        icon={<Sparkles size={16} />}
        title="Featured events"
        subtitle="Handpicked by our team"
        href={ROUTES.events}
      >
        <EventGrid
          events={featured.data?.data?.items ?? []}
          loading={featured.isLoading}
          columns={4}
        />
      </Section>

      {/* TRENDING */}
      <Section
        icon={<Flame size={16} />}
        title="Trending now"
        subtitle="Events selling fast"
        href={`${ROUTES.events}?sort=popular`}
      >
        <EventGrid
          events={trending.data?.data?.items ?? []}
          loading={trending.isLoading}
          columns={4}
        />
      </Section>

      {/* UPCOMING */}
      <Section
        icon={<CalendarClock size={16} />}
        title="Happening soon"
        subtitle="Don't miss these"
        href={`${ROUTES.events}?sort=soonest`}
      >
        <EventGrid
          events={upcoming.data?.data?.items ?? []}
          loading={upcoming.isLoading}
          columns={4}
        />
      </Section>

      {/* CITIES */}
      {(cities.data?.data?.items?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <header className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                <MapPin size={14} /> Explore by city
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Popular cities
              </h2>
            </div>
          </header>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {cities.data.data.items.map((c) => (
              <Link
                key={c.city}
                to={`${ROUTES.events}?city=${encodeURIComponent(c.city)}`}
                className="rounded-2xl border border-border bg-card p-4 hover:border-border-strong transition-colors group"
              >
                <div className="text-lg font-bold text-foreground">{c.city}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {c.count} event{c.count === 1 ? "" : "s"}
                </div>
                <ArrowRight
                  size={16}
                  className="mt-3 text-primary group-hover:translate-x-1 transition-transform"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-secondary/15 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hosting an event?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-pretty">
            Sell tickets, track revenue, and manage scanners — all from one dashboard.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" to={ROUTES.register}>
              Start selling tickets
            </Button>
            <Button size="lg" variant="outline" to={ROUTES.about}>
              Learn more
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ icon, title, subtitle, href, children }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <header className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            {icon} {subtitle}
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
        <Link
          to={href}
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0"
        >
          See all <ArrowRight size={14} />
        </Link>
      </header>
      {children}
    </section>
  );
}