import { motion } from "framer-motion";
import {
  PartyPopper, Music, Tent, Moon, Presentation, GraduationCap,
  Smile, Trophy, Shirt, Palette, UtensilsCrossed, Users, Sparkles,
} from "lucide-react";
import { EVENT_CATEGORIES } from "../../constants/categories";
import { cn } from "../../utils/cn";

const ICONS = {
  PartyPopper, Music, Tent, Moon, Presentation, GraduationCap,
  Smile, Trophy, Shirt, Palette, UtensilsCrossed, Users, Sparkles,
};

export function EventCategoryChips({
  value,
  onChange,
  className,
  showAll = true,
  layout = "row",
}) {
  const items = showAll
    ? [{ slug: "", label: "All", icon: "Sparkles" }, ...EVENT_CATEGORIES]
    : EVENT_CATEGORIES;

  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto no-scrollbar pb-1",
        layout === "row" ? "flex-row" : "flex-wrap",
        className
      )}
      role="tablist"
      aria-label="Event categories"
    >
      {items.map((c) => {
        const Icon = ICONS[c.icon] ?? Sparkles;
        const active = (value ?? "") === c.slug;
        return (
          <motion.button
            key={c.slug || "all"}
            type="button"
            role="tab"
            aria-selected={active}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange?.(c.slug)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors border",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-border-strong"
            )}
          >
            <Icon size={14} />
            {c.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export default EventCategoryChips;