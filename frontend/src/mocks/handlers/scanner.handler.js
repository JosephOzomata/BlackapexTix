import { db, delay, maybeFail } from "../database";
import { ERROR_CODES, makeError, makeSuccess } from "../../utils/errorCodes";
import { hydrateEvent } from "./events.handler";
import { hydrateTicket } from "./tickets.handler";

/**
 * Scanner handler.
 * Scanner permission is EVENT-SCOPED. We never trust the frontend's claim
 * that a user is a scanner — this handler re-checks the assignment.
 *
 * The redeem operation is atomic-ish here (single-threaded JS) so double
 * redemption returns TICKET_ALREADY_USED. In production this is a
 * transactional UPDATE on the backend.
 */

function requireScanner(user, eventId) {
  if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
  const assignment = db.getScannerAssignment(eventId, user.id);
  if (!assignment || assignment.status !== "ACTIVE") {
    return makeError(ERROR_CODES.NOT_EVENT_SCANNER);
  }
  return null;
}

export const scannerHandler = {
  async assignedEvents(user) {
    await delay(200, 400);
    maybeFail();
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);

    const assignments = db.getScannersForUser(user.id);
    const items = assignments
      .filter((a) => a.status !== "REVOKED")
      .map((a) => {
        const event = db.getEventById(a.eventId);
        if (!event) return null;
        return {
          assignmentId: a.id,
          status: a.status,
          checkInsCount: a.checkInsCount ?? 0,
          lastActiveAt: a.lastActiveAt,
          event: hydrateEvent(event),
        };
      })
      .filter(Boolean);

    return makeSuccess({ items });
  },

  async eventContext(user, eventId) {
    await delay(180, 360);
    const err = requireScanner(user, eventId);
    if (err) return err;

    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);

    const tickets = db.tickets.filter(
      (t) => t.eventId === eventId && !["CANCELLED", "VOID"].includes(t.status)
    );
    const checkedIn = tickets.filter((t) => t.status === "CHECKED_IN").length;

    const assignment = db.getScannerAssignment(eventId, user.id);

    return makeSuccess({
      event: hydrateEvent(event),
      attendance: {
        total: tickets.length,
        checkedIn,
        remaining: tickets.length - checkedIn,
      },
      assignment: {
        id: assignment.id,
        checkInsCount: assignment.checkInsCount ?? 0,
        lastActiveAt: assignment.lastActiveAt,
      },
    });
  },

  /** Validate a token WITHOUT redeeming it (dry check for the UI). */
  async validate(user, eventId, { token, manualCode }) {
    await delay(180, 360);
    const err = requireScanner(user, eventId);
    if (err) return err;

    const ticket = manualCode
      ? db.getTicketByReference(manualCode)
      : db.getTicketByToken(token);

    if (!ticket) {
      return makeError(ERROR_CODES.TICKET_INVALID);
    }
    if (ticket.eventId !== eventId) {
      return makeError(ERROR_CODES.TICKET_WRONG_EVENT, null, { ticket: hydrateTicket(ticket) });
    }

    return makeSuccess({ ticket: hydrateTicket(ticket) });
  },

  /** Atomic redeem — the actual entry grant. */
  async redeem(user, eventId, { token, manualCode }) {
    await delay(220, 460);
    maybeFail();
    const err = requireScanner(user, eventId);
    if (err) return err;

    const ticket = manualCode
      ? db.getTicketByReference(manualCode)
      : db.getTicketByToken(token);

    if (!ticket) return makeError(ERROR_CODES.TICKET_INVALID);
    if (ticket.eventId !== eventId) return makeError(ERROR_CODES.TICKET_WRONG_EVENT);

    // Atomic-ish check-and-set. In production this is a single SQL update
    // with a WHERE status = 'VALID' clause.
    if (ticket.status === "CHECKED_IN") {
      return makeError(ERROR_CODES.TICKET_ALREADY_USED, null, {
        ticket: hydrateTicket(ticket),
      });
    }
    if (ticket.status === "EXPIRED") return makeError(ERROR_CODES.TICKET_EXPIRED);
    if (ticket.status === "CANCELLED") return makeError(ERROR_CODES.TICKET_CANCELLED);
    if (ticket.status === "REFUNDED") return makeError(ERROR_CODES.TICKET_REFUNDED);
    if (ticket.status === "VOID") return makeError(ERROR_CODES.TICKET_VOID);
    if (ticket.status === "PENDING_PAYMENT" || ticket.status === "PAYMENT_CONFIRMED") {
      return makeError(ERROR_CODES.TICKET_PENDING_PAYMENT);
    }

    const assignment = db.getScannerAssignment(eventId, user.id);
    const now = new Date().toISOString();

    const updated = db.updateTicket(ticket.id, {
      status: "CHECKED_IN",
      checkedInAt: now,
      checkedInByScannerId: assignment.id,
    });

    if (assignment) {
      db.updateScanner(assignment.id, {
        checkInsCount: (assignment.checkInsCount ?? 0) + 1,
        lastActiveAt: now,
      });
    }

    db.recomputeEventStats(eventId);

    return makeSuccess(
      { ticket: hydrateTicket(updated), checkedInAt: now },
      "Entry approved."
    );
  },

  async recentCheckins(user, eventId, limit = 10) {
    await delay(160, 320);
    const err = requireScanner(user, eventId);
    if (err) return err;

    const items = db.tickets
      .filter((t) => t.eventId === eventId && t.status === "CHECKED_IN")
      .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
      .slice(0, limit)
      .map(hydrateTicket);

    return makeSuccess({ items });
  },
};

export default scannerHandler;