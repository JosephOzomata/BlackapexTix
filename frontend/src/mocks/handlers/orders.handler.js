import { db, delay, maybeFail } from "../database";
import { ERROR_CODES, makeError, makeSuccess } from "../../utils/errorCodes";
import { orderRef } from "../../utils/ids";
import { FEES, CHECKOUT } from "../../constants/config";
import { hydrateEvent } from "./events.handler";

/**
 * Orders handler.
 * Orders never become "PAID" here — only the payments handler does that,
 * mirroring the backend webhook flow. See docs/security-boundaries.md.
 */

function computeLineItems(lines) {
  return lines.map((l) => {
    const tt = db.getTicketTypeById(l.ticketTypeId);
    const price = tt?.price ?? 0;
    const quantity = l.quantity;
    return {
      ticketTypeId: l.ticketTypeId,
      name: tt?.name ?? "Ticket",
      price,
      currency: tt?.currency ?? "NGN",
      quantity,
      admits: tt?.admits ?? 1,
      subtotal: price * quantity,
    };
  });
}

function computeTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const totalTickets = items.reduce((s, i) => s + i.quantity, 0);
  const percent = Math.round((subtotal * FEES.serviceFeePercent) / 100);
  const fixed = FEES.fixedFeePerTicketKobo * totalTickets;
  const fees = percent + fixed;
  return { subtotal, fees, total: subtotal + fees, currency: "NGN" };
}

function hydrateOrder(order) {
  if (!order) return null;
  const event = db.getEventById(order.eventId);
  return {
    ...order,
    event: event ? hydrateEvent(event) : null,
    tickets: db.getTicketsForOrder(order.id),
  };
}

export const ordersHandler = {
  async create(user, payload) {
    await delay(400, 800);
    maybeFail();

    const { eventId, lines } = payload;
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);

    // ---- Inventory check + reservation ----
    for (const l of lines) {
      const tt = db.getTicketTypeById(l.ticketTypeId);
      if (!tt) return makeError(ERROR_CODES.NOT_FOUND, "Ticket category not found.");
      const avail = db.getTicketTypeAvailability(tt.id);

      if (l.quantity > avail.remaining) {
        return makeError(ERROR_CODES.INSUFFICIENT_INVENTORY, `Only ${avail.remaining} left for ${tt.name}.`);
      }
      if (l.quantity < tt.minPerOrder) return makeError(ERROR_CODES.BELOW_MIN_PER_ORDER);
      if (l.quantity > tt.maxPerOrder) return makeError(ERROR_CODES.EXCEEDS_MAX_PER_ORDER);

      // Group tickets require attendee details for each admission.
      if (tt.admits > 1) {
        const required = l.quantity * tt.admits;
        const provided = (l.attendees ?? []).filter(
          (a) => a?.fullName?.trim() && a?.email?.trim()
        ).length;
        if (provided < required) {
          return makeError(
            ERROR_CODES.VALIDATION_ERROR,
            `Please provide details for all ${required} attendees.`
          );
        }
      }
    }

    const items = computeLineItems(lines);
    const totals = computeTotals(items);

    const order = db.addOrder({
      id: undefined,
      userId: user?.id ?? null,
      userEmail: user?.email ?? payload.guestEmail ?? null,
      eventId,
      eventSlug: event.slug,
      items,
      ...totals,
      discount: 0,
      paymentStatus: "PENDING",
      status: "AWAITING_PAYMENT",
      paymentReference: null,
      reference: orderRef(),
      attendeeDetails: lines.flatMap((l) => l.attendees ?? []),
    });

    return makeSuccess(hydrateOrder(order));
  },

  async detail(orderId, user) {
    await delay(180, 380);
    const order = db.getOrderById(orderId);
    if (!order) return makeError(ERROR_CODES.ORDER_NOT_FOUND);
    if (user && order.userId && order.userId !== user.id) {
      return makeError(ERROR_CODES.FORBIDDEN);
    }
    return makeSuccess(hydrateOrder(order));
  },

  async cancel(orderId, user) {
    await delay(220, 440);
    const order = db.getOrderById(orderId);
    if (!order) return makeError(ERROR_CODES.ORDER_NOT_FOUND);
    if (user && order.userId && order.userId !== user.id) {
      return makeError(ERROR_CODES.FORBIDDEN);
    }
    if (order.status === "FULFILLED" || order.status === "PAID") {
      return makeError(ERROR_CODES.ORDER_ALREADY_PAID, "Paid orders cannot be cancelled. Request a refund instead.");
    }
    db.updateOrder(orderId, { status: "CANCELLED", paymentStatus: "CANCELLED" });
    return makeSuccess(null, "Order cancelled.");
  },

  async mine(user, filters = {}) {
    await delay(220, 460);
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    let items = db.orders.filter((o) => o.userId === user.id || o.userEmail === user.email);
    if (filters.status) items = items.filter((o) => o.status === filters.status);
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return makeSuccess({ items: items.map(hydrateOrder) });
  },

  async listForEvent(organizerId, eventId, filters = {}) {
    await delay(220, 460);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);

    let items = db.orders.filter((o) => o.eventId === eventId);
    if (filters.paymentStatus) {
      items = items.filter((o) => o.paymentStatus === filters.paymentStatus);
    }
    if (filters.q) {
      const needle = filters.q.toLowerCase();
      items = items.filter(
        (o) =>
          o.reference?.toLowerCase().includes(needle) ||
          o.userEmail?.toLowerCase().includes(needle)
      );
    }
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return makeSuccess({ items: items.map(hydrateOrder) });
  },
};

export { hydrateOrder };
export default ordersHandler;