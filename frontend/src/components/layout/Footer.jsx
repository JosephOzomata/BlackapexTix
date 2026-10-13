import { Link } from "react-router-dom";
import { Ticket, Instagram, Twitter, Facebook } from "lucide-react";
import { APP } from "../../constants/config";
import { ROUTES } from "../../constants/routes";
import { EVENT_CATEGORIES } from "../../constants/categories";

const COLS = [
  {
    title: "Discover",
    links: [
      { to: ROUTES.events, label: "All Events" },
      { to: `${ROUTES.events}?sort=trending`, label: "Trending" },
      { to: `${ROUTES.events}?isFree=true`, label: "Free Events" },
      { to: `${ROUTES.events}?sort=soonest`, label: "Happening Soon" },
    ],
  },
  {
    title: "Organizers",
    links: [
      { to: ROUTES.register, label: "Become an Organizer" },
      { to: ROUTES.organizer.dashboard, label: "Organizer Dashboard" },
      { to: "/contact", label: "Support" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/contact", label: "Press" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 mt-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to={ROUTES.home} className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Ticket size={20} className="text-white" />
              </span>
              <span className="font-extrabold text-xl">{APP.name}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm text-pretty">
              {APP.description}
            </p>
            <div className="mt-5 flex items-center gap-3 text-muted-foreground">
              <a href="#" aria-label="Instagram" className="hover:text-foreground"><Instagram size={18} /></a>
              <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter size={18} /></a>
              <a href="#" aria-label="Facebook" className="hover:text-foreground"><Facebook size={18} /></a>
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.title}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{c.title}</h3>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
            <ul className="space-y-2">
              {EVENT_CATEGORIES.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`${ROUTES.events}?category=${c.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-subtle">
          <p>© {new Date().getFullYear()} {APP.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-foreground">Terms</Link>
            <Link to="#" className="hover:text-foreground">Privacy</Link>
            <Link to="#" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}