import { useMemo } from "react";
import { Link, useLocation, useNavigate, useRouteError } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Home, Search, Ticket, ShieldAlert, ScanLine, LayoutDashboard } from "lucide-react";
import { Button } from "../../components/common/Button";
import { useAuthStore } from "../../stores/authStore";
import { ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { cn } from "../../utils/cn";

/**
 * Context-aware 404 / missing-resource screen.
 *
 * Contexts:
 *   - public         (default) — general "page not found"
 *   - event          — an event slug that doesn't resolve
 *   - customer       — customer area
 *   - organizer      — organizer area
 *   - scanner        — scanner area
 *   - admin          — admin area
 *
 * The component NEVER leaks IDs, stack traces, or internal errors.
 */
export default function NotFoundPage({
  context: explicitContext,
  title,
  message,
}) {
  useDocumentTitle("Page not found");

  const location = useLocation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);

  const context = useMemo(() => {
    if (explicitContext) return explicitContext;
    const p = location.pathname;
    if (p.startsWith("/events/")) return "event";
    if (p.startsWith("/organizers/")) return "event";
    if (p.startsWith("/organizer")) return "organizer";
    if (p.startsWith("/scanner")) return "scanner";
    if (p.startsWith("/admin")) return "admin";
    if (
      p.startsWith("/my-tickets") ||
      p.startsWith("/orders") ||
      p.startsWith("/account")
    )
      return "customer";
    return "public";
  }, [explicitContext, location.pathname]);

  const copy = useMemo(() => {
    const base = (() => {
      switch (context) {
        case "event":
          return {
            code: "404",
            title: title ?? "This event couldn't be found.",
            message:
              message ??
              "It may have been removed, unpublished, cancelled, or the link you followed may be incorrect.",
            primary: { to: ROUTES.events, label: "Browse Events", icon: <Compass size={16} /> },
            secondary: { to: ROUTES.home, label: "Go Home", icon: <Home size={16} /> },
            Icon: Ticket,
          };
        case "organizer":
          return {
            code: "404",
            title: title ?? "This organizer page doesn't exist.",
            message: message ?? "It may have been moved or removed.",
            primary: { to: ROUTES.organizer.dashboard, label: "Organizer Dashboard", icon: <LayoutDashboard size={16} /> },
            secondary: { to: ROUTES.organizer.events, label: "My Events", icon: <Compass size={16} /> },
            Icon: LayoutDashboard,
          };
        case "scanner":
          return {
            code: "404",
            title: title ?? "This scanner page isn't available.",
            message: message ?? "Double-check the link or return to your assigned events.",
            primary: { to: ROUTES.scanner.home, label: "Scanner Home", icon: <ScanLine size={16} /> },
            secondary: { to: ROUTES.scanner.home, label: "Assigned Events", icon: <Compass size={16} /> },
            Icon: ScanLine,
          };
        case "admin":
          return {
            code: "404",
            title: title ?? "This admin page couldn't be found.",
            message: message ?? "It may have been moved or removed.",
            primary: { to: ROUTES.admin.dashboard, label: "Admin Dashboard", icon: <ShieldAlert size={16} /> },
            secondary: { to: ROUTES.admin.events, label: "Events", icon: <Compass size={16} /> },
            Icon: ShieldAlert,
          };
        case "customer":
          return {
            code: "404",
            title: title ?? "We couldn't find that page.",
            message: message ?? "Your tickets are still safe in My Tickets.",
            primary: { to: ROUTES.myTickets, label: "My Tickets", icon: <Ticket size={16} /> },
            secondary: { to: ROUTES.events, label: "Explore Events", icon: <Compass size={16} /> },
            Icon: Ticket,
          };
        default:
          return {
            code: "404",
            title: title ?? "Looks like this event doesn't exist.",
            message:
              message ??
              "The page may have been removed, the event may no longer be available, or the link may be incorrect.",
            primary: { to: ROUTES.events, label: "Explore Events", icon: <Compass size={16} /> },
            secondary: { to: ROUTES.home, label: "Go Home", icon: <Home size={16} /> },
            Icon: Ticket,
          };
      }
    })();

    // If a signed-in user lands here, adjust the secondary CTA.
    if (role === ROLES.ORGANIZER && context === "public") {
      base.secondary = { to: ROUTES.organizer.dashboard, label: "Organizer Dashboard", icon: <LayoutDashboard size={16} /> };
    }
    if (role === ROLES.SCANNER && context === "public") {
      base.secondary = { to: ROUTES.scanner.home, label: "Scanner Home", icon: <ScanLine size={16} /> };
    }
    return base;
  }, [context, role, title, message]);

  const Icon = copy.Icon;

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden flex items-center justify-center px-4 py-16">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.03),transparent_60%)]" />
      </div>

      <div className="w-full max-w-xl mx-auto text-center">
        {/* Floating ticket stub decorations */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, y: -12, rotate: -8 }}
          animate={{ opacity: 1, y: 0, rotate: -8 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "absolute hidden md:block left-[6%] top-[14%] w-[110px] h-[70px] rounded-xl border border-border bg-card/80 shadow-xl",
            "before:absolute before:left-1/2 before:top-3 before:bottom-3 before:w-px before:bg-border"
          )}
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0, y: 12, rotate: 10 }}
          animate={{ opacity: 1, y: 0, rotate: 10 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className={cn(
            "absolute hidden md:block right-[6%] top-[22%] w-[130px] h-[80px] rounded-xl border border-border bg-card/80 shadow-xl",
            "before:absolute before:left-1/2 before:top-3 before:bottom-3 before:w-px before:bg-border"
          )}
        />

        {/* Hero icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mb-6 h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/30 to-secondary/30 border border-border flex items-center justify-center"
        >
          <Icon size={44} className="text-primary" />
          <motion.span
            aria-hidden
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.06, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl ring-1 ring-primary/40"
          />
        </motion.div>

        {/* Code */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="font-mono text-sm tracking-[0.4em] text-muted mb-2"
        >
          {copy.code}
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance"
        >
          {copy.title}
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mt-3 text-muted-foreground text-pretty max-w-md mx-auto"
        >
          {copy.message}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            as={Link}
            to={copy.primary.to}
            size="lg"
            leftIcon={copy.primary.icon}
          >
            {copy.primary.label}
          </Button>
          <Button
            as={Link}
            to={copy.secondary.to}
            variant="outline"
            size="lg"
            leftIcon={copy.secondary.icon}
          >
            {copy.secondary.label}
          </Button>
        </motion.div>

        {/* Compact search (public only) */}
        {context === "public" && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.currentTarget.q.value.trim();
              navigate(q ? `${ROUTES.events}?q=${encodeURIComponent(q)}` : ROUTES.events);
            }}
            className="mt-10 max-w-md mx-auto"
          >
            <label htmlFor="not-found-search" className="sr-only">
              Search events
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="not-found-search"
                name="q"
                type="search"
                autoComplete="off"
                placeholder="Can't find what you were looking for? Search events…"
                className="w-full h-12 pl-11 pr-4 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
}

/** Route error boundary variant — used with `errorElement`. */
export function RouteErrorBoundary() {
  const err = useRouteError();
  const isNotFound = err?.status === 404;
  return (
    <NotFoundPage
      context="public"
      title={isNotFound ? undefined : "Something went wrong."}
      message={
        isNotFound
          ? undefined
          : "We hit an unexpected problem loading this page. Please try again."
      }
    />
  );
}