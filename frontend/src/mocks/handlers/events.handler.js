import { db, delay, maybeFail } from "../database";
import { ERROR_CODES, makeError, makeSuccess } from "../../utils/errorCodes";
import { uniqueSlug } from "../../utils/slugify";

/** Attach organizer + ticket type summary + availability to an event. */
function hydrateEvent(event, { includeOrganizer = true, includeTickets = true } = {}) {
  if (!event) return null;
  const out = { ...event };

  if (includeOrganizer) {
    const org = db.getOrganizerById(event.organizerId);
    if (org) {
      out.organizer = {
        id: org.id,
        slug: org.slug,
        businessName: org.businessName,
        logoUrl: org.logoUrl,
        status: org.status,
        publicUrl: `/organizers/${org.slug}`,
      };
    }
  }

  if (includeTickets) {
    const types = db.getTicketTypesForEvent(event.id)
      .filter((t) => t.isVisible)
      .map((t) => {
        const avail = db.getTicketTypeAvailability(t.id);
        const now = Date.now();
        const saleStartsAt = t.saleStartsAt ? new Date(t.saleStartsAt).getTime() : null;
        const saleEndsAt = t.saleEndsAt
          ? new Date(t.saleEndsAt).getTime()
          : event.salesEndAt
          ? new Date(event.salesEndAt).getTime()
          : null;

        let saleState = "ON_SALE";
        if (saleStartsAt && now < saleStartsAt) saleState = "NOT_STARTED";
        else if (saleEndsAt && now > saleEndsAt) saleState = "ENDED";
        else if (avail.remaining === 0) saleState = "SOLD_OUT";

        return {
          id: t.id,
          name: t.name,
          description: t.description,
          price: t.price,
          currency: t.currency,
          quantityTotal: t.quantityTotal,
          remaining: avail.remaining,
          quantitySold: avail.quantitySold,
          minPerOrder: t.minPerOrder,
          maxPerOrder: t.maxPerOrder,
          admits: t.admits,
          type: t.type,
          benefits: t.benefits ?? [],
          saleStartsAt: t.saleStartsAt ?? null,
          saleEndsAt: t.saleEndsAt ?? event.salesEndAt ?? null,
          saleState,
          order: t.order,
        };
      });

    out.ticketTypes = types;
    const totalRemaining = types.reduce((s, t) => s + t.remaining, 0);
    const totalCapacity = types.reduce((s, t) => s + t.quantityTotal, 0);
    const minPrice = types.reduce(
      (min, t) => (min === null || t.price < min ? t.price : min),
      null
    );
    out.startingPrice = minPrice;
    out.ticketSummary = {
      totalCapacity,
      totalRemaining,
      isSoldOut: totalRemaining === 0 && totalCapacity > 0,
      isLowStock: totalCapacity > 0 && totalRemaining / totalCapacity < 0.15,
    };
  }

  return out;
}

export const eventsHandler = {
  async list(filters = {}) {
    await delay(280, 620);
    maybeFail();

    let items = db.events.filter(
      (e) => e.status !== "DRAFT" && e.status !== "UNPUBLISHED"
    );

    const {
      q,
      category,
      city,
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      isFree,
      organizer,
      sort = "soonest",
      page = 1,
      pageSize = 12,
    } = filters;

    if (q) {
      const needle = String(q).toLowerCase();
      items = items.filter((e) => {
        const org = db.getOrganizerById(e.organizerId);
        return (
          e.title.toLowerCase().includes(needle) ||
          e.description?.toLowerCase().includes(needle) ||
          e.city?.toLowerCase().includes(needle) ||
          e.venue?.toLowerCase().includes(needle) ||
          org?.businessName?.toLowerCase().includes(needle)
        );
      });
    }
    if (category) items = items.filter((e) => e.categorySlug === category);
    if (city) items = items.filter((e) => e.city?.toLowerCase() === city.toLowerCase());
    if (organizer) items = items.filter((e) => e.organizerId === organizer);

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      items = items.filter((e) => new Date(e.startAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      items = items.filter((e) => new Date(e.startAt).getTime() <= to);
    }

    if (isFree === true) {
      items = items.filter((e) => {
        const types = db.getTicketTypesForEvent(e.id);
        return types.some((t) => t.price === 0);
      });
    }
    if (priceMin != null || priceMax != null) {
      items = items.filter((e) => {
        const types = db.getTicketTypesForEvent(e.id);
        const min = Math.min(...types.map((t) => t.price));
        if (priceMin != null && min < priceMin) return false;
        if (priceMax != null && min > priceMax) return false;
        return true;
      });
    }

    const sorters = {
      soonest: (a, b) => new Date(a.startAt) - new Date(b.startAt),
      latest: (a, b) => new Date(b.startAt) - new Date(a.startAt),
      popular: (a, b) => (b.views ?? 0) - (a.views ?? 0),
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      priceAsc: (a, b) => {
        const pa = Math.min(...db.getTicketTypesForEvent(a.id).map((t) => t.price));
        const pb = Math.min(...db.getTicketTypesForEvent(b.id).map((t) => t.price));
        return pa - pb;
      },
    };
    items.sort(sorters[sort] ?? sorters.soonest);

    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize).map((e) => hydrateEvent(e));

    return makeSuccess({
      items: paged,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  },

  async detail(slug) {
    await delay(220, 480);
    maybeFail();

    const event = db.getEventBySlug(slug);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.status === "DRAFT" || event.status === "UNPUBLISHED") {
      return makeError(ERROR_CODES.EVENT_UNPUBLISHED);
    }

    event.views = (event.views ?? 0) + 1;
    return makeSuccess(hydrateEvent(event));
  },

  async featured() {
    await delay(200, 400);
    const items = db.events
      .filter((e) => ["SALES_LIVE", "PUBLISHED", "SOLD_OUT"].includes(e.status))
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
      .slice(0, 6)
      .map((e) => hydrateEvent(e));
    return makeSuccess({ items });
  },

  async trending() {
    await delay(200, 400);
    const items = db.events
      .filter((e) => ["SALES_LIVE", "PUBLISHED", "SOLD_OUT"].includes(e.status))
      .sort((a, b) => (b.stats?.sold ?? 0) - (a.stats?.sold ?? 0))
      .slice(0, 8)
      .map((e) => hydrateEvent(e));
    return makeSuccess({ items });
  },

  async upcoming() {
    await delay(200, 400);
    const now = Date.now();
    const items = db.events
      .filter(
        (e) =>
          ["SALES_LIVE", "PUBLISHED", "SOLD_OUT"].includes(e.status) &&
          new Date(e.startAt).getTime() > now
      )
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
      .slice(0, 8)
      .map((e) => hydrateEvent(e));
    return makeSuccess({ items });
  },

  async cities() {
    await delay(120, 260);
    const counts = {};
    for (const e of db.events) {
      if (!e.city) continue;
      if (!["SALES_LIVE", "PUBLISHED", "SOLD_OUT"].includes(e.status)) continue;
      counts[e.city] = (counts[e.city] ?? 0) + 1;
    }
    return makeSuccess({
      items: Object.entries(counts).map(([city, count]) => ({ city, count })),
    });
  },

  /* -------- Organizer-scoped operations -------- */

  async organizerList(organizerId, filters = {}) {
    await delay(240, 520);
    maybeFail();
    let items = db.events.filter((e) => e.organizerId === organizerId);

    if (filters.status) items = items.filter((e) => e.status === filters.status);
    if (filters.q) {
      const needle = filters.q.toLowerCase();
      items = items.filter((e) => e.title.toLowerCase().includes(needle));
    }

    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    items = items.map((e) => {
      db.recomputeEventStats(e.id);
      return hydrateEvent(db.getEventById(e.id));
    });

    return makeSuccess({ items, total: items.length });
  },

  async organizerGet(organizerId, eventId) {
    await delay(180, 380);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    db.recomputeEventStats(eventId);
    return makeSuccess(hydrateEvent(db.getEventById(eventId)));
  },

  async create(organizerId, payload) {
    await delay(400, 800);
    maybeFail();

    const existingSlugs = db.events.map((e) => e.slug);
    const slug = uniqueSlug(payload.title ?? "event", existingSlugs);

    const event = db.addEvent({
      organizerId,
      slug,
      ...payload,
      status: "DRAFT",
    });
    return makeSuccess(hydrateEvent(event));
  },

  async update(organizerId, eventId, patch) {
    await delay(280, 560);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    const updated = db.updateEvent(eventId, patch);
    return makeSuccess(hydrateEvent(updated));
  },

  async publish(organizerId, eventId) {
    await delay(400, 700);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    if (!event.media?.length) {
      return makeError(ERROR_CODES.VALIDATION_ERROR, "Add at least one flyer before publishing.");
    }
    const types = db.getTicketTypesForEvent(eventId);
    if (!types.length) {
      return makeError(ERROR_CODES.VALIDATION_ERROR, "Add at least one ticket category before publishing.");
    }

    const now = new Date().toISOString();
    const isFuture = new Date(event.startAt).getTime() > Date.now();
    const updated = db.updateEvent(eventId, {
      status: isFuture ? "SALES_LIVE" : "PUBLISHED",
      publishedAt: now,
    });
    return makeSuccess(hydrateEvent(updated), "Event published.");
  },

  async unpublish(organizerId, eventId) {
    await delay(280, 500);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    if (event.stats?.sold > 0) {
      return makeError(
        ERROR_CODES.VALIDATION_ERROR,
        "This event has sales and cannot be unpublished. Cancel instead."
      );
    }
    const updated = db.updateEvent(eventId, { status: "UNPUBLISHED" });
    return makeSuccess(hydrateEvent(updated), "Event unpublished.");
  },

  async cancel(organizerId, eventId, reason = null) {
    await delay(300, 600);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    const updated = db.updateEvent(eventId, {
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
    });
    return makeSuccess(hydrateEvent(updated), "Event cancelled.");
  },

  async duplicate(organizerId, eventId) {
    await delay(400, 700);
    const source = db.getEventById(eventId);
    if (!source) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (source.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);

    const existingSlugs = db.events.map((e) => e.slug);
    const slug = uniqueSlug(`${source.title} copy`, existingSlugs);

    const copy = db.addEvent({
      ...source,
      id: undefined,
      slug,
      title: `${source.title} (Copy)`,
      status: "DRAFT",
      publishedAt: null,
      views: 0,
      stats: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    });

    // Duplicate ticket types too
    const types = db.getTicketTypesForEvent(eventId);
    for (const t of types) {
      db.addTicketType({
        eventId: copy.id,
        name: t.name,
        description: t.description,
        price: t.price,
        currency: t.currency,
        quantityTotal: t.quantityTotal,
        minPerOrder: t.minPerOrder,
        maxPerOrder: t.maxPerOrder,
        admits: t.admits,
        type: t.type,
        benefits: t.benefits,
        order: t.order,
        isVisible: t.isVisible,
      });
    }

    return makeSuccess(hydrateEvent(copy), "Event duplicated.");
  },

  async deleteDraft(organizerId, eventId) {
    await delay(240, 480);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    if (event.status !== "DRAFT") {
      return makeError(ERROR_CODES.FORBIDDEN, "Only drafts can be deleted.");
    }
    db.deleteEvent(eventId);
    return makeSuccess(null, "Draft deleted.");
  },

  /* -------- Ticket type CRUD (organizer scoped) -------- */

  async listTicketTypes(organizerId, eventId) {
    await delay(180, 380);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    const items = db.getTicketTypesForEvent(eventId).map((t) => ({
      ...t,
      availability: db.getTicketTypeAvailability(t.id),
    }));
    return makeSuccess({ items });
  },

  async createTicketType(organizerId, eventId, payload) {
    await delay(280, 520);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    const tt = db.addTicketType({ eventId, ...payload });
    return makeSuccess({ ...tt, availability: db.getTicketTypeAvailability(tt.id) });
  },

  async updateTicketType(organizerId, eventId, ticketTypeId, patch) {
    await delay(240, 480);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    const tt = db.getTicketTypeById(ticketTypeId);
    if (!tt || tt.eventId !== eventId) return makeError(ERROR_CODES.NOT_FOUND);

    // Capacity cannot drop below tickets already sold.
    if (patch.quantityTotal != null) {
      const sold = db.tickets.filter(
        (t) => t.ticketTypeId === ticketTypeId && !["CANCELLED", "VOID"].includes(t.status)
      ).length;
      if (patch.quantityTotal < sold) {
        return makeError(
          ERROR_CODES.VALIDATION_ERROR,
          `Capacity cannot be lower than tickets already sold (${sold}).`
        );
      }
    }
    const updated = db.updateTicketType(ticketTypeId, patch);
    return makeSuccess({ ...updated, availability: db.getTicketTypeAvailability(ticketTypeId) });
  },

  async deleteTicketType(organizerId, eventId, ticketTypeId) {
    await delay(220, 440);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    const tt = db.getTicketTypeById(ticketTypeId);
    if (!tt || tt.eventId !== eventId) return makeError(ERROR_CODES.NOT_FOUND);

    const sold = db.tickets.filter(
      (t) => t.ticketTypeId === ticketTypeId && !["CANCELLED", "VOID"].includes(t.status)
    ).length;
    if (sold > 0) {
      return makeError(
        ERROR_CODES.VALIDATION_ERROR,
        "Ticket categories with sales cannot be deleted. Hide or pause instead."
      );
    }
    db.deleteTicketType(ticketTypeId);
    return makeSuccess(null, "Ticket category deleted.");
  },

  async reorderTicketTypes(organizerId, eventId, orderedIds) {
    await delay(200, 400);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    orderedIds.forEach((id, index) => db.updateTicketType(id, { order: index }));
    return makeSuccess({ items: db.getTicketTypesForEvent(eventId) });
  },
};

export { hydrateEvent };
export default eventsHandler;