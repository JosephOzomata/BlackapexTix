/**
 * In-memory mock database.
 *
 * Simulates what a real backend would provide during the frontend phase:
 *  - latency
 *  - occasional failures
 *  - atomic-ish mutations
 *  - isolated state between resets
 *
 * IMPORTANT: Nothing in here is security. It exists ONLY to let the
 * frontend behave like a production app before the real backend lands.
 * See docs/security-boundaries.md.
 */

import seedUsers from "./users";
import seedOrganizers from "./organizers";
import seedEvents from "./events";
import seedTicketTypes from "./ticketTypes";
import seedTickets from "./tickets";
import seedOrders from "./orders";
import seedTransactions from "./transactions";
import seedScanners from "./scanners";
import seedNotifications from "./notifications";

const clone = (v) => JSON.parse(JSON.stringify(v));

/** Simulated network latency (ms). */
export function delay(min = 180, max = 520) {
  const ms = Math.floor(Math.random() * (max - min)) + min;
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Random failure injection. Default 0% to keep the app predictable;
 * individual tests can bump this by setting `db.failureRate = 0.1`.
 */
export function maybeFail(rate = null) {
  const r = rate ?? db.failureRate ?? 0;
  if (r > 0 && Math.random() < r) {
    const err = new Error("Simulated network failure");
    err.simulated = true;
    throw err;
  }
}

class MockDatabase {
  constructor() {
    this.failureRate = 0;
    this.reset();
  }

  reset() {
    this.users = clone(seedUsers);
    this.organizers = clone(seedOrganizers);
    this.events = clone(seedEvents);
    this.ticketTypes = clone(seedTicketTypes);
    this.tickets = clone(seedTickets);
    this.orders = clone(seedOrders);
    this.transactions = clone(seedTransactions);
    this.scanners = clone(seedScanners);
    this.notifications = clone(seedNotifications);
    this.sessions = {}; // sessionToken -> userId
    this.auditLogs = [];
  }

  /* ---------- Read helpers (defensive copies) ---------- */
  getUserById(id) {
    return this.users.find((u) => u.id === id) ?? null;
  }
  getUserByEmail(email) {
    const e = String(email ?? "").toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === e) ?? null;
  }
  getOrganizerById(id) {
    return this.organizers.find((o) => o.id === id) ?? null;
  }
  getOrganizerBySlug(slug) {
    return this.organizers.find((o) => o.slug === slug) ?? null;
  }
  getOrganizerByUserId(userId) {
    return this.organizers.find((o) => o.userId === userId) ?? null;
  }
  getEventById(id) {
    return this.events.find((e) => e.id === id) ?? null;
  }
  getEventBySlug(slug) {
    return this.events.find((e) => e.slug === slug) ?? null;
  }
  getTicketTypeById(id) {
    return this.ticketTypes.find((t) => t.id === id) ?? null;
  }
  getTicketTypesForEvent(eventId) {
    return this.ticketTypes
      .filter((t) => t.eventId === eventId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  getOrderById(id) {
    return this.orders.find((o) => o.id === id) ?? null;
  }
  getTicketById(id) {
    return this.tickets.find((t) => t.id === id) ?? null;
  }
  getTicketByToken(token) {
    return this.tickets.find((t) => t.verificationToken === token) ?? null;
  }
  getTicketsForOrder(orderId) {
    return this.tickets.filter((t) => t.orderId === orderId);
  }
  getTicketByReference(ref) {
    return this.tickets.find((t) => t.reference === ref) ?? null;
  }
  getTicketsForUserEmail(email) {
    const e = String(email ?? "").toLowerCase();
    return this.tickets.filter(
      (t) => (t.attendeeEmail ?? "").toLowerCase() === e || (t.ownerEmail ?? "").toLowerCase() === e
    );
  }
  getScannersForEvent(eventId) {
    return this.scanners.filter((s) => s.eventId === eventId);
  }
  getScannerAssignment(eventId, scannerUserId) {
    return this.scanners.find(
      (s) => s.eventId === eventId && s.scannerUserId === scannerUserId
    ) ?? null;
  }
  getScannersForUser(userId) {
    return this.scanners.filter((s) => s.scannerUserId === userId);
  }

  /* ---------- ID factories ---------- */
  nextId(prefix) {
    const key = `_seq_${prefix}`;
    this[key] = (this[key] ?? 1000) + 1;
    return `${prefix}_${this[key]}`;
  }

  /* ---------- Mutation helpers ---------- */
  addUser(data) {
    const user = {
      id: this.nextId("usr"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "ACTIVE",
      emailVerified: false,
      ...data,
    };
    this.users.push(user);
    return user;
  }
  updateUser(id, patch) {
    const u = this.getUserById(id);
    if (!u) return null;
    Object.assign(u, patch, { updatedAt: new Date().toISOString() });
    return u;
  }
  addEvent(data) {
    const event = {
      id: this.nextId("evt"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "DRAFT",
      views: 0,
      media: [],
      tags: [],
      ...data,
    };
    this.events.push(event);
    return event;
  }
  updateEvent(id, patch) {
    const e = this.getEventById(id);
    if (!e) return null;
    Object.assign(e, patch, { updatedAt: new Date().toISOString() });
    return e;
  }
  deleteEvent(id) {
    this.events = this.events.filter((e) => e.id !== id);
    this.ticketTypes = this.ticketTypes.filter((t) => t.eventId !== id);
  }
  addTicketType(data) {
    const tt = {
      id: this.nextId("tt"),
      order: this.getTicketTypesForEvent(data.eventId).length,
      status: "ACTIVE",
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.ticketTypes.push(tt);
    return tt;
  }
  updateTicketType(id, patch) {
    const tt = this.getTicketTypeById(id);
    if (!tt) return null;
    Object.assign(tt, patch, { updatedAt: new Date().toISOString() });
    return tt;
  }
  deleteTicketType(id) {
    this.ticketTypes = this.ticketTypes.filter((t) => t.id !== id);
  }
  addOrder(data) {
    const order = {
      id: this.nextId("ord"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "AWAITING_PAYMENT",
      paymentStatus: "PENDING",
      ...data,
    };
    this.orders.push(order);
    return order;
  }
  updateOrder(id, patch) {
    const o = this.getOrderById(id);
    if (!o) return null;
    Object.assign(o, patch, { updatedAt: new Date().toISOString() });
    return o;
  }
  addTicket(data) {
    const ticket = {
      id: this.nextId("tkt"),
      status: "PENDING_PAYMENT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checkedInAt: null,
      checkedInByScannerId: null,
      ...data,
    };
    this.tickets.push(ticket);
    return ticket;
  }
  updateTicket(id, patch) {
    const t = this.getTicketById(id);
    if (!t) return null;
    Object.assign(t, patch, { updatedAt: new Date().toISOString() });
    return t;
  }
  addTransaction(data) {
    const tx = {
      id: this.nextId("tx"),
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.transactions.push(tx);
    return tx;
  }
  updateTransaction(id, patch) {
    const tx = this.transactions.find((t) => t.id === id);
    if (!tx) return null;
    Object.assign(tx, patch);
    return tx;
  }
  addScanner(data) {
    const s = {
      id: this.nextId("scn"),
      status: "INVITED",
      invitedAt: new Date().toISOString(),
      acceptedAt: null,
      checkInsCount: 0,
      lastActiveAt: null,
      ...data,
    };
    this.scanners.push(s);
    return s;
  }
  updateScanner(id, patch) {
    const s = this.scanners.find((x) => x.id === id);
    if (!s) return null;
    Object.assign(s, patch);
    return s;
  }
  removeScanner(id) {
    this.scanners = this.scanners.filter((s) => s.id !== id);
  }
  addNotification(data) {
    const n = {
      id: this.nextId("ntf"),
      createdAt: new Date().toISOString(),
      read: false,
      ...data,
    };
    this.notifications.push(n);
    return n;
  }
  addAuditLog(entry) {
    this.auditLogs.push({
      id: this.nextId("log"),
      createdAt: new Date().toISOString(),
      ...entry,
    });
  }

  /* ---------- Domain helpers ---------- */

  /** Compute live availability for a ticket type from orders in progress. */
  getTicketTypeAvailability(ticketTypeId) {
    const tt = this.getTicketTypeById(ticketTypeId);
    if (!tt) return null;
    const sold = this.tickets.filter(
      (t) =>
        t.ticketTypeId === ticketTypeId &&
        !["CANCELLED", "REFUNDED", "VOID"].includes(t.status)
    ).length;
    return {
      quantityAvailable: tt.quantityTotal,
      quantitySold: sold,
      remaining: Math.max(0, tt.quantityTotal - sold),
    };
  }

  /** Recompute per-event aggregates used by cards + dashboard. */
  recomputeEventStats(eventId) {
    const event = this.getEventById(eventId);
    if (!event) return;
    const tts = this.getTicketTypesForEvent(eventId);
    const totalCapacity = tts.reduce((s, t) => s + (t.quantityTotal ?? 0), 0);
    const tickets = this.tickets.filter(
      (t) => t.eventId === eventId && !["CANCELLED", "VOID"].includes(t.status)
    );
    const sold = tickets.length;
    const checkedIn = tickets.filter((t) => t.status === "CHECKED_IN").length;
    const revenue = tickets
      .filter((t) => !["REFUNDED"].includes(t.status))
      .reduce((s, t) => s + (t.pricePaid ?? 0), 0);

    event.stats = {
      capacity: totalCapacity,
      sold,
      remaining: Math.max(0, totalCapacity - sold),
      checkedIn,
      revenue,
    };
  }
}

export const db = new MockDatabase();
export default db;