import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Ticket } from "lucide-react";
import { APP } from "../../constants/config";
import { ROUTES } from "../../constants/routes";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../common/Button";
import { IconButton } from "../common/IconButton";
import AccountMenu from "./AccountMenu";
import NotificationBell from "./NotificationBell";
import MobileNav from "./MobileNav";
import { cn } from "../../utils/cn";

const NAV_LINKS = [
  { to: ROUTES.events, label: "Discover" },
  { to: `${ROUTES.events}?category=concerts`, label: "Concerts" },
  { to: `${ROUTES.events}?category=conferences`, label: "Conferences" },
  { to: `${ROUTES.events}?category=parties`, label: "Parties" },
];

export default function Navbar() {
  const isAuthed = useAuthStore((s) => s.status === "authenticated");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-sticky w-full border-b border-border/60 bg-background/80 backdrop-blur-xl safe-top">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            {/* Logo */}
            <Link
              to={ROUTES.home}
              className="flex items-center gap-2 shrink-0 group"
              aria-label={`${APP.name} home`}
            >
              <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Ticket size={18} className="text-white" />
              </span>
              <span className="font-extrabold text-lg tracking-tight text-foreground hidden sm:inline">
                {APP.name}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label="Primary">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "text-foreground bg-card/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1.5 ml-auto">
              <IconButton
                label="Search events"
                variant="ghost"
                onClick={() => navigate(ROUTES.events)}
              >
                <Search size={18} />
              </IconButton>

              {isAuthed ? (
                <>
                  <NotificationBell />
                  <AccountMenu compact />
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" size="sm" to={ROUTES.login}>
                    Sign in
                  </Button>
                  <Button variant="primary" size="sm" to={ROUTES.register}>
                    Get started
                  </Button>
                </div>
              )}

              <IconButton
                label="Open menu"
                variant="ghost"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </IconButton>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileNav
            links={NAV_LINKS}
            isAuthed={isAuthed}
            onClose={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}