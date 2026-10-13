import { db, delay, maybeFail } from "../database";
import { ERROR_CODES, makeError, makeSuccess } from "../../utils/errorCodes";
import { paymentRef } from "../../utils/ids";
import { FEES } from "../../constants/config";

/**
 * Mock payments handler.
 *
 * CRITICAL DESIGN NOTE:
 * The frontend NEVER decides that a payment succeeded. Even in mock mode,
 * we simulate the two-phase flow:
 *
 *   1) initialize()  — returns a provider reference.
 *   2) verifyStatus() — the frontend POLLS until the mock backend
 *                      "webhook" (simulated asynchronously) flips the
 *                      order to PAID and issues tickets.
 *
 * The ticket issuance happens INSIDE the simulated webhook, not on the
 * frontend. The frontend only observes the outcome.
 */

const VERIFICATION_DELAY_MS = 2600; // mock backend "webhook" latency

/* Simulate the backend webhook that issues tickets after verification. */
async function runMockWebhook(orderId) {
  // The webhook ONLY fires if the payment was actually "received" by the
  // simulated provider. Here we always succeed unless the order was
  // cancelled or expired in the interim.
  const order = db.getOrderById(orderId);
  if (!order) return;
  if (order.status === "CANCELLED" || order.status === "EXPIRED") return;

  // Idempotency: if the tickets are already issued, do nothing.
  if (order.status === "FULFILLED") return;

  // Build tickets per admission.
  const lines = order.items ?? [];
  for (const item of lines) {
    const tt = db.getTicketTypeById(item.ticketTypeId);
    const admissions = (item.admits ?? 1) * item.quantity;

    // If we have attendee details from the order, use them; otherwise
    // fall back to the purchaser (single-admission categories).
    const attendeeList =
      order.attendeeDetails && order.attendeeDetails.length
        ? order.attendeeDetails
        : Array.from({ length: admissions }).map(() => ({
            fullName: order.userEmail ?? "Guest",
            email: order.userEmail ?? "guest@example.com",
          }));

    for (let i = 0; i < admissions; i++) {
      const attendee = attendeeList.shift() ?? {
        fullName: order.userEmail ?? "Guest",
        email: order.userEmail ?? "guest@example.com",
      };
      db.addTicket({
        orderId: order.id,
        eventId: order.eventId,
        ticketTypeId: item.ticketTypeId,
        reference: `TKT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        verificationToken: `tok_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
        attendeeName: attendee.fullName,
        attendeeEmail: attendee.email,
        ownerEmail: order.userEmail,
        ownerUserId: order.userId,
        pricePaid: item.price / (item.admits ?? 1),
        currency: item.currency,
        status: "VALID",
        issuedAt: new Date().toISOString(),
      });
    }
  }

  // Update order + transaction.
  db.updateOrder(orderId, {
    status: "FULFILLED",
    paymentStatus: "CONFIRMED",
    fulfilledAt: new Date().toISOString(),
  });

  const tx = db.transactions.find((t) => t.orderId === orderId);
  if (tx) {
    const platformFee = Math.round((tx.amount * FEES.platformFeePercent) / 100);
    db.updateTransaction(tx.id, {
      status: "CONFIRMED",
      verifiedAt: new Date().toISOString(),
      platformFee,
      organizerNet: tx.amount - platformFee,
    });
  }

  // Notification.
  db.addNotification({
    userId: order.userId,
    type: "TICKETS_ISSUED",
    title: "Your tickets are ready",
    message: `Your tickets for your order ${order.reference} have been issued.`,
    link: "/my-tickets",
  });

  // Recompute event stats.
  db.recomputeEventStats(order.eventId);
}

export const paymentsHandler = {
  async initialize(user, { orderId, method = "card" }) {
    await delay(360, 720);
    maybeFail();

    const order = db.getOrderById(orderId);
    if (!order) return makeError(ERROR_CODES.ORDER_NOT_FOUND);
    if (order.userId && user && order.userId !== user.id) {
      return makeError(ERROR_CODES.FORBIDDEN);
    }
    if (order.status === "FULFILLED" || order.paymentStatus === "CONFIRMED") {
      return makeError(ERROR_CODES.ORDER_ALREADY_PAID);
    }

    const reference = paymentRef();
    db.updateOrder(orderId, {
      status: "PAYMENT_PROCESSING",
      paymentStatus: "INITIATED",
      paymentReference: reference,
      paymentMethod: method,
    });

    // Create the pending transaction record.
    const event = db.getEventById(order.eventId);
    db.addTransaction({
      orderId,
      reference,
      provider: "mock-pay",
      amount: order.total,
      currency: order.currency,
      status: "PROCESSING",
      customerEmail: order.userEmail,
      eventId: order.eventId,
      organizerId: event?.organizerId ?? null,
      platformFee: 0,
      organizerNet: 0,
      metadata: { tickets: order.items.reduce((s, i) => s + i.quantity, 0) },
    });

    // Simulate the async backend webhook firing after a delay.
    // The frontend never calls runMockWebhook directly — it just polls.
    setTimeout(() => {
      runMockWebhook(orderId).catch(() => {});
    }, VERIFICATION_DELAY_MS);

    return makeSuccess({
      reference,
      // NOTE: real integrations return a provider auth URL or public key here.
      providerAuthUrl: null,
      providerPublicKey: null,
      message: "Payment initiated. Complete the payment in the provider window.",
    });
  },

  async verifyStatus(orderId, user) {
    await delay(160, 320);

    const order = db.getOrderById(orderId);
    if (!order) return makeError(ERROR_CODES.ORDER_NOT_FOUND);
    if (order.userId && user && order.userId !== user.id) {
      return makeError(ERROR_CODES.FORBIDDEN);
    }

    const tickets = db.getTicketsForOrder(orderId);

    return makeSuccess({
      orderId: order.id,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      reference: order.paymentReference,
      fulfilled: order.status === "FULFILLED",
      tickets,
    });
  },

  async cancel(orderId, user) {
    await delay(200, 400);
    const order = db.getOrderById(orderId);
    if (!order) return makeError(ERROR_CODES.ORDER_NOT_FOUND);
    if (order.userId && user && order.userId !== user.id) {
      return makeError(ERROR_CODES.FORBIDDEN);
    }
    if (order.status === "FULFILLED") return makeError(ERROR_CODES.ORDER_ALREADY_PAID);

    db.updateOrder(orderId, { status: "CANCELLED", paymentStatus: "CANCELLED" });
    const tx = db.transactions.find((t) => t.orderId === orderId);
    if (tx) db.updateTransaction(tx.id, { status: "CANCELLED" });

    return makeSuccess(null, "Payment cancelled.");
  },
};

export default paymentsHandler;