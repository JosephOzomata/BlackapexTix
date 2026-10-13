import { db, delay, maybeFail } from "../database";
import { ERROR_CODES, makeError, makeSuccess } from "../../utils/errorCodes";
import { hydrateEvent } from "./events.handler";

function hydrateTicket(ticket) {
  if (!ticket) return null;
  const event = db.getEventById(ticket.eventId);
  const tt = db.getTicketTypeById(ticket.ticketTypeId);
  return {
    ...ticket,
    event: event ? hydrateEvent(event) : null,
    ticketType: tt
      ? {
          id: tt.id,
          name: tt.name,
          admits: tt.admits,
          type: tt.type,
        }
      : null,
  };
}

/** Group tickets by orderId for the group-order view. */
function groupByOrder(tickets) {
  const grouped = {};
  for (const t of tickets) {
    if (!grouped[t.orderId]) grouped[t.orderId] = [];
    grouped[t.orderId].push(t);
  }
  return grouped;
}

export const ticketsHandler = {
  async mine(user, filters = {}) {
    await delay(240, 480);
    maybeFail();
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);

    const email = String(user.email ?? "").toLowerCase();
    let items = db.tickets.filter(
      (t) =>
        t.ownerUserId === user.id ||
        (t.attendeeEmail ?? "").toLowerCase() === email ||
        (t.ownerEmail ?? "").toLowerCase() === email
    );

    if (filters.status) items = items.filter((t) => t.status === filters.status);
    if (filters.eventId) items = items.filter((t) => t.eventId === filters.eventId);

    if (filters.scope) {
      const now = Date.now();
      items = items.filter((t) => {
        const event = db.getEventById(t.eventId);
        if (!event) return false;
        const start = new Date(event.startAt).getTime();
        if (filters.scope === "upcoming") return start > now;
        if (filters.scope === "past") return start <= now;
        return true;
      });
    }

    // Sort upcoming first, then by event start
    items.sort((a, b) => {
      const ea = db.getEventById(a.eventId);
      const eb = db.getEventById(b.eventId);
      return new Date(ea?.startAt ?? 0) - new Date(eb?.startAt ?? 0);
    });

    return makeSuccess({ items: items.map(hydrateTicket) });
  },

  async detail(user, ticketId) {
    await delay(180, 360);
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    const t = db.getTicketById(ticketId);
    if (!t) return makeError(ERROR_CODES.TICKET_NOT_FOUND);
    const email = String(user.email ?? "").toLowerCase();
    const allowed =
      t.ownerUserId === user.id ||
      (t.attendeeEmail ?? "").toLowerCase() === email ||
      (t.ownerEmail ?? "").toLowerCase() === email;
    if (!allowed) return makeError(ERROR_CODES.FORBIDDEN);
    return makeSuccess(hydrateTicket(t));
  },

  async groupOrder(user, orderId) {
    await delay(200, 420);
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    const order = db.getOrderById(orderId);
    if (!order) return makeError(ERROR_CODES.ORDER_NOT_FOUND);

    const tickets = db.getTicketsForOrder(orderId);
    const isOwner = order.userId === user.id || order.userEmail === user.email;
    const isGroupMember = tickets.some(
      (t) => (t.attendeeEmail ?? "").toLowerCase() === String(user.email).toLowerCase()
    );
    if (!isOwner && !isGroupMember) return makeError(ERROR_CODES.FORBIDDEN);

    const grouped = groupByOrder(tickets)[orderId] ?? [];
    const checkedIn = grouped.filter((t) => t.status === "CHECKED_IN").length;

    return makeSuccess({
      orderId,
      order,
      tickets: grouped.map(hydrateTicket),
      summary: {
        total: grouped.length,
        checkedIn,
        remaining: grouped.length - checkedIn,
        isOwner,
      },
    });
  },

  async listForEvent(organizerId, eventId, filters = {}) {
    await delay(220, 460);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);

    let items = db.tickets.filter((t) => t.eventId === eventId);

    if (filters.ticketTypeId) {
      items = items.filter((t) => t.ticketTypeId === filters.ticketTypeId);
    }
    if (filters.status) items = items.filter((t) => t.status === filters.status);
    if (filters.checkedIn === true) items = items.filter((t) => t.status === "CHECKED_IN");
    if (filters.checkedIn === false) items = items.filter((t) => t.status !== "CHECKED_IN");
    if (filters.q) {
      const needle = filters.q.toLowerCase();
      items = items.filter(
        (t) =>
          t.attendeeName?.toLowerCase().includes(needle) ||
          t.attendeeEmail?.toLowerCase().includes(needle) ||
          t.reference?.toLowerCase().includes(needle)
      );
    }

    items.sort((a, b) => new Date(b.issuedAt ?? 0) - new Date(a.issuedAt ?? 0));

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const total = items.length;
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return makeSuccess({
      items: paged.map(hydrateTicket),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  },
};

export { hydrateTicket };
export default ticketsHandler;