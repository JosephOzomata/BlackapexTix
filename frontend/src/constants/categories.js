/**
 * Event categories — data-driven, never hardcoded in rendering.
 * `slug` is the canonical value stored on events; `label` is display-only.
 */
export const EVENT_CATEGORIES = Object.freeze([
  { slug: "parties",     label: "Parties",      icon: "PartyPopper" },
  { slug: "concerts",    label: "Concerts",     icon: "Music" },
  { slug: "festivals",   label: "Festivals",    icon: "Tent" },
  { slug: "nightlife",   label: "Nightlife",    icon: "Moon" },
  { slug: "conferences", label: "Conferences",  icon: "Presentation" },
  { slug: "campus",      label: "Campus Events",icon: "GraduationCap" },
  { slug: "comedy",      label: "Comedy",       icon: "Smile" },
  { slug: "sports",      label: "Sports",       icon: "Trophy" },
  { slug: "fashion",     label: "Fashion",      icon: "Shirt" },
  { slug: "art",         label: "Art",          icon: "Palette" },
  { slug: "food",        label: "Food",         icon: "UtensilsCrossed" },
  { slug: "networking",  label: "Networking",   icon: "Users" },
  { slug: "other",       label: "Other",        icon: "Sparkles" },
]);

export const CATEGORY_BY_SLUG = Object.freeze(
  Object.fromEntries(EVENT_CATEGORIES.map((c) => [c.slug, c]))
);

export const getCategoryLabel = (slug) =>
  CATEGORY_BY_SLUG[slug]?.label ?? slug;