import { useEffect } from "react";
import { applySeo, buildEventJsonLd } from "../utils/seo";
import { APP } from "../constants/config";

/** Apply SEO metadata for the current page. */
export function useSeo(meta = {}) {
  useEffect(() => {
    applySeo(meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    meta.title,
    meta.description,
    meta.image,
    meta.url,
    meta.type,
  ]);
}

/** SEO specifically for an event detail page, including JSON-LD. */
export function useEventSeo(event) {
  useEffect(() => {
    if (!event) return;
    const url = `${APP.url}/events/${event.slug}`;
    applySeo({
      title: event.title,
      description:
        event.description?.slice(0, 160) ??
        `Get tickets for ${event.title} on TicketHub.`,
      image: event.media?.[0]?.url,
      url,
      type: "website",
      jsonLd: buildEventJsonLd(event, { url }),
    });
  }, [event]);
}

export default useSeo;