import { create } from "zustand";
import storage, { STORAGE_NAMESPACES } from "../utils/storage";
import { FEES, CHECKOUT } from "../constants/config";

/**
 * Temporary purchase/cart state.
 * Only carries the ephemeral selection the customer is currently buying.
 * Once an order is created server-side, this store is cleared and the
 * order becomes the source of truth.
 */
export const useCartStore = create((set, get) => ({
  // eventId + slug for the current cart
  eventId: null,
  eventSlug: null,
  eventTitle: null,
  eventCurrency: "NGN",

  /**
   * Selected ticket lines, keyed by ticketTypeId.
   * {
   *   [ticketTypeId]: {
   *     ticketTypeId, name, price, currency, quantity, admits,
   *     maxPerOrder, minPerOrder, attendees: [{ fullName, email }]
   *   }
   * }
   */
  lines: {},

  /** Reservation expiry (ISO) — set when the backend confirms the hold. */
  reservationExpiresAt: null,
  reservationId: null,

  setEvent: ({ eventId, eventSlug, eventTitle, eventCurrency = "NGN" }) =>
    set({ eventId, eventSlug, eventTitle, eventCurrency }),

  addLine: (ticketType, quantity = 1) => {
    const lines = { ...get().lines };
    const existing = lines[ticketType.id];
    const qty = Math.min(
      (existing?.quantity ?? 0) + quantity,
      ticketType.maxPerOrder ?? CHECKOUT.maxTotalQuantityPerOrder
    );
    lines[ticketType.id] = {
      ticketTypeId: ticketType.id,
      name: ticketType.name,
      price: ticketType.price,
      currency: ticketType.currency ?? get().eventCurrency,
      admits: ticketType.admits ?? 1,
      minPerOrder: ticketType.minPerOrder ?? 1,
      maxPerOrder: ticketType.maxPerOrder ?? 10,
      quantity: Math.max(qty, ticketType.minPerOrder ?? 1),
      attendees: existing?.attendees ?? [],
    };
    set({ lines });
  },

  setQuantity: (ticketTypeId, quantity) => {
    const lines = { ...get().lines };
    if (!lines[ticketTypeId]) return;
    if (quantity <= 0) {
      delete lines[ticketTypeId];
      set({ lines });
      return;
    }
    const max = lines[ticketTypeId].maxPerOrder;
    lines[ticketTypeId] = {
      ...lines[ticketTypeId],
      quantity: Math.max(1, Math.min(quantity, max)),
    };
    set({ lines });
  },

  removeLine: (ticketTypeId) => {
    const lines = { ...get().lines };
    delete lines[ticketTypeId];
    set({ lines });
  },

  setAttendees: (ticketTypeId, attendees) => {
    const lines = { ...get().lines };
    if (!lines[ticketTypeId]) return;
    lines[ticketTypeId] = { ...lines[ticketTypeId], attendees };
    set({ lines });
  },

  setReservation: ({ reservationId, expiresAt }) =>
    set({ reservationId, expiresAt: expiresAt }),

  clearReservation: () => set({ reservationId: null, reservationExpiresAt: null }),

  clearCart: () =>
    set({
      eventId: null,
      eventSlug: null,
      eventTitle: null,
      lines: {},
      reservationId: null,
      reservationExpiresAt: null,
    }),

  /** Derived totals. Purely presentational — backend recomputes on order create. */
  getTotals: () => {
    const { lines } = get();
    const items = Object.values(lines);
    const subtotal = items.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const totalTickets = items.reduce((sum, l) => sum + l.quantity, 0);
    const totalAdmissions = items.reduce(
      (sum, l) => sum + l.quantity * (l.admits ?? 1),
      0
    );

    // Service fee — shown in the review but the backend is authoritative.
    const percentFee = Math.round((subtotal * FEES.serviceFeePercent) / 100);
    const fixedFee = FEES.fixedFeePerTicketKobo * totalTickets;
    const fees = percentFee + fixedFee;

    return {
      subtotal,
      fees,
      total: subtotal + fees,
      totalTickets,
      totalAdmissions,
      currency: get().eventCurrency,
    };
  },

  /** True when every selected line has the required attendee info. */
  isReadyForCheckout: () => {
    const items = Object.values(get().lines);
    if (items.length === 0) return false;
    return items.every((l) => {
      if (l.quantity < (l.minPerOrder ?? 1)) return false;
      if (l.quantity > (l.maxPerOrder ?? 10)) return false;
      // Group tickets (admits > 1) need attendee info for each admission.
      const requiredAttendees = l.admits > 1 ? l.quantity * l.admits : 0;
      if (requiredAttendees > 0) {
        const filled = (l.attendees ?? []).filter(
          (a) => a?.fullName?.trim() && a?.email?.trim()
        );
        if (filled.length < requiredAttendees) return false;
      }
      return true;
    });
  },
}));

export default useCartStore;