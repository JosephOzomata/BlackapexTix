/**
 * SEO helpers. In this SPA phase we set document.title / meta tags
 * dynamically. The structure is designed so that migrating to SSR/SSG
 * later (e.g. for public event pages) requires no changes to the
 * components — only the transport changes.
 */

const DEFAULT_TITLE = "TicketHub";
const DEFAULT_DESCRIPTION =
  "Discover events, buy tickets, and get instant QR passes. For organizers, customers, and venues.";
const DEFAULT_IMAGE = "/og-default.png";

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Apply a bundle of SEO metadata. */
export function applySeo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  jsonLd = null,
} = {}) {
  const finalTitle = title ? `${title} · ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  document.title = finalTitle;

  upsertMeta("name", "description", description);
  upsertMeta("property", "og:title", finalTitle);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:type", type);
  if (image) upsertMeta("property", "og:image", image);
  if (url) {
    upsertMeta("property", "og:url", url);
    upsertLink("canonical", url);
  }
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", finalTitle);
  upsertMeta("name", "twitter:description", description);
  if (image) upsertMeta("name", "twitter:image", image);

  // Structured data (Event schema) — replace on each navigation
  const existing = document.getElementById("seo-jsonld");
  if (existing) existing.remove();
  if (jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "seo-jsonld";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
}

/**
 * Build an Event structured-data payload from an event object.
 * Ready for Google's Event rich results.
 */
export function buildEventJsonLd(event, { url } = {}) {
  if (!event) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description?.slice(0, 300),
    startDate: event.startAt,
    endDate: event.endAt,
    eventStatus:
      event.status === "CANCELLED"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: event.media?.[0]?.url ? [event.media[0].url] : undefined,
    location: event.venue
      ? {
          "@type": "Place",
          name: event.venue,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.addressLine,
            addressLocality: event.city,
            addressRegion: event.state,
            addressCountry: event.country ?? "NG",
          },
        }
      : undefined,
    organizer: event.organizer
      ? {
          "@type": "Organization",
          name: event.organizer.businessName,
          url: event.organizer.publicUrl,
        }
      : undefined,
    offers: (event.ticketTypes ?? []).map((t) => ({
      "@type": "Offer",
      name: t.name,
      price: t.price / 100,
      priceCurrency: t.currency,
      availability:
        t.remaining > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      url,
    })),
  };
}

export const SITE = {
  defaultTitle: DEFAULT_TITLE,
  defaultDescription: DEFAULT_DESCRIPTION,
};