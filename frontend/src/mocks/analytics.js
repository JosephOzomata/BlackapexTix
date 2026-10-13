/**
 * Analytics helper — computes derived series from orders/tickets.
 * Kept here so both the analytics service and admin service can reuse it.
 */
import { db } from "./database";

/** Daily revenue over the last N days for an event or organizer. */
export function revenueSeries({ eventId = null, organizerId = null, days = 30 } = {}) {
  const now = Date.now();
  const buckets = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { date: key, revenue: 0, tickets: 0 };
  }

  const eventIds = organizerId
    ? db.events.filter((e) => e.organizerId === organizerId).map((e) => e.id)
    : null;

  for (const tx of db.transactions) {
    if (tx.status !== "CONFIRMED") continue;
    if (eventId && tx.eventId !== eventId) continue;
    if (eventIds && !eventIds.includes(tx.eventId)) continue;
    const key = (tx.verifiedAt ?? tx.createdAt).slice(0, 10);
    if (!buckets[key]) continue;
    buckets[key].revenue += tx.amount;
    buckets[key].tickets += tx.metadata?.tickets ?? 0;
  }

  return Object.values(buckets);
}

/** Sales by ticket category for an event. */
export function categoryBreakdown(eventId) {
  const types = db.getTicketTypesForEvent(eventId);
  return types.map((t) => {
    const sold = db.tickets.filter(
      (tk) =>
        tk.ticketTypeId === t.id && !["CANCELLED", "VOID"].includes(tk.status)
    ).length;
    const revenue = db.tickets
      .filter(
        (tk) =>
          tk.ticketTypeId === t.id && !["CANCELLED", "VOID", "REFUNDED"].includes(tk.status)
      )
      .reduce((s, tk) => s + (tk.pricePaid ?? 0), 0);
    return {
      ticketTypeId: t.id,
      name: t.name,
      sold,
      remaining: Math.max(0, t.quantityTotal - sold),
      capacity: t.quantityTotal,
      revenue,
    };
  });
}

/** Check-in progress for an event. */
export function checkinProgress(eventId) {
  const tickets = db.tickets.filter(
    (t) => t.eventId === eventId && !["CANCELLED", "VOID"].includes(t.status)
  );
  const total = tickets.length;
  const checkedIn = tickets.filter((t) => t.status === "CHECKED_IN").length;
  return {
    total,
    checkedIn,
    remaining: total - checkedIn,
    rate: total > 0 ? checkedIn / total : 0,
  };
}

/** Top-level numbers for the organizer dashboard. */
export function organizerOverview(organizerId) {
  const events = db.events.filter((e) => e.organizerId === organizerId);
  const eventIds = events.map((e) => e.id);

  const paidTx = db.transactions.filter(
    (t) => t.status === "CONFIRMED" && eventIds.includes(t.eventId)
  );
  const grossRevenue = paidTx.reduce((s, t) => s + t.amount, 0);
  const platformFees = paidTx.reduce((s, t) => s + (t.platformFee ?? 0), 0);
  const netRevenue = grossRevenue - platformFees;

  const ticketsSold = db.tickets.filter(
    (t) => eventIds.includes(t.eventId) && !["CANCELLED", "VOID"].includes(t.status)
  ).length;
  const checkedIn = db.tickets.filter(
    (t) => eventIds.includes(t.eventId) && t.status === "CHECKED_IN"
  ).length;

  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.startAt).getTime() > now).length;
  const active = events.filter((e) => e.status === "SALES_LIVE").length;
  const completed = events.filter((e) => e.status === "COMPLETED").length;

  return {
    grossRevenue,
    netRevenue,
    platformFees,
    ticketsSold,
    checkedIn,
    upcomingEvents: upcoming,
    activeEvents: active,
    completedEvents: completed,
    totalEvents: events.length,
  };
}

/** Platform-wide numbers for the super admin dashboard. */
export function platformOverview() {
  const paidTx = db.transactions.filter((t) => t.status === "CONFIRMED");
  const grossRevenue = paidTx.reduce((s, t) => s + t.amount, 0);
  const platformRevenue = paidTx.reduce((s, t) => s + (t.platformFee ?? 0), 0);

  return {
    grossRevenue,
    platformRevenue,
    organizers: db.organizers.length,
    users: db.users.length,
    events: db.events.length,
    liveEvents: db.events.filter((e) => e.status === "SALES_LIVE").length,
    ticketsSold: db.tickets.filter((t) => !["CANCELLED", "VOID"].includes(t.status)).length,
    transactions: paidTx.length,
  };
}