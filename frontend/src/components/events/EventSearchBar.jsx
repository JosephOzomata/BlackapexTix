import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, SlidersHorizontal } from "lucide-react";
import { Button } from "../common/Button";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../utils/cn";

/**
 * Landing-hero search bar. Navigates to /events with query params.
 * Intentionally simple — the full filter UI lives on the events page.
 */
export function EventSearchBar({ className, defaultQuery = "", defaultCity = "" }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(defaultQuery);
  const [city, setCity] = useState(defaultCity);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city.trim()) params.set("city", city.trim());
    navigate(`${ROUTES.events}${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        "w-full max-w-3xl rounded-full border border-border bg-card/90 backdrop-blur-md shadow-xl p-1.5 flex items-center gap-1.5",
        className
      )}
    >
      <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
        <Search size={18} className="text-muted-foreground shrink-0" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events, artists, venues…"
          aria-label="Search events"
          className="w-full h-10 bg-transparent border-0 text-sm text-foreground placeholder:text-subtle focus:outline-none"
        />
      </div>

      <span className="hidden sm:block h-6 w-px bg-border" />

      <div className="hidden sm:flex items-center gap-2 px-3 w-[200px] shrink-0">
        <MapPin size={16} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          aria-label="City"
          className="w-full h-10 bg-transparent border-0 text-sm text-foreground placeholder:text-subtle focus:outline-none"
        />
      </div>

      <Button type="submit" size="md" className="rounded-full shrink-0 px-5">
        Search
      </Button>
    </form>
  );
}

export function EventFilterToggle({ onClick, count = 0 }) {
  return (
    <Button
      variant="outline"
      size="md"
      onClick={onClick}
      leftIcon={<SlidersHorizontal size={16} />}
      className="relative"
    >
      Filters
      {count > 0 && (
        <span className="ml-1 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </Button>
  );
}

export default EventSearchBar;