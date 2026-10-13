import { db, delay, maybeFail } from "../database";
import { ERROR_CODES, makeError, makeSuccess } from "../../utils/errorCodes";
import { hydrateEvent } from "./events.handler";
import {
  organizerOverview,
  platformOverview,
  revenueSeries,
} from "../analytics";

function requireAdmin(user) {
  if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
  if (user.role !== "SUPER_ADMIN") return makeError(ERROR_CODES.FORBIDDEN);
  return null;
}

export const adminHandler = {
  async overview(user) {
    await delay(240, 480);
    maybeFail();
    const err = requireAdmin(user);
    if (err) return err;

    const stats = platformOverview();
    const series = revenueSeries({ days: 30 });

    const topOrganizers = db.organizers
      .map((o) => {
        const overview = organizerOverview(o.id);
        return {
          id: o.id,
          businessName: o.businessName,
          slug: o.slug,
          status: o.status,
          ...overview,
        };
      })
      .sort((a, b) => b.grossRevenue - a.grossRevenue)
      .slice(0, 5);

    const recentTransactions = [...db.transactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    return makeSuccess({ stats, series, topOrganizers, recentTransactions });
  },

  async listOrganizers(user, filters = {}) {
    await delay(200, 440);
    const err = requireAdmin(user);
    if (err) return err;

    let items = db.organizers.map((o) => {
      const owner = db.getUserById(o.userId);
      const overview = organizerOverview(o.id);
      return {
        ...o,
        ownerEmail: owner?.email,
        ownerName: owner?.fullName,
        ...overview,
      };
    });

    if (filters.status) items = items.filter((o) => o.status === filters.status);
    if (filters.q) {
      const needle = filters.q.toLowerCase();
      items = items.filter(
        (o) =>
          o.businessName.toLowerCase().includes(needle) ||
          o.ownerEmail?.toLowerCase().includes(needle)
      );
    }

    return makeSuccess({ items, total: items.length });
  },

  async updateOrganizerStatus(user, organizerId, status) {
    await delay(240, 480);
    const err = requireAdmin(user);
    if (err) return err;
    const org = db.getOrganizerById(organizerId);
    if (!org) return makeError(ERROR_CODES.ORGANIZER_NOT_FOUND);
    org.status = status;
    if (status === "VERIFIED") org.verifiedAt = new Date().toISOString();
    db.addAuditLog({
      actorUserId: user.id,
      action: "ORGANIZER_STATUS_CHANGED",
      targetType: "Organizer",
      targetId: organizerId,
      metadata: { status },
    });
    return makeSuccess(org, "Organizer status updated.");
  },

  async listUsers(user, filters = {}) {
    await delay(200, 440);
    const err = requireAdmin(user);
    if (err) return err;

    let items = db.users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      emailVerified: u.emailVerified,
      status: u.status,
      createdAt: u.createdAt,
    }));

    if (filters.role) items = items.filter((u) => u.role === filters.role);
    if (filters.status) items = items.filter((u) => u.status === filters.status);
    if (filters.q) {
      const needle = filters.q.toLowerCase();
      items = items.filter(
        (u) =>
          u.fullName.toLowerCase().includes(needle) ||
          u.email.toLowerCase().includes(needle)
      );
    }

    return makeSuccess({ items, total: items.length });
  },

  async updateUserStatus(user, userId, status) {
    await delay(220, 440);
    const err = requireAdmin(user);
    if (err) return err;
    const target = db.getUserById(userId);
    if (!target) return makeError(ERROR_CODES.NOT_FOUND);
    if (target.role === "SUPER_ADMIN") {
      return makeError(ERROR_CODES.FORBIDDEN, "Super admin accounts cannot be modified here.");
    }
    db.updateUser(userId, { status });
    db.addAuditLog({
      actorUserId: user.id,
      action: "USER_STATUS_CHANGED",
      targetType: "User",
      targetId: userId,
      metadata: { status },
    });
    return makeSuccess(null, "User status updated.");
  },

  async listEvents(user, filters = {}) {
    await delay(220, 460);
    const err = requireAdmin(user);
    if (err) return err;
    let items = db.events.map((e) => hydrateEvent(e));
    if (filters.status) items = items.filter((e) => e.status === filters.status);
    if (filters.q) {
      const needle = filters.q.toLowerCase();
      items = items.filter((e) => e.title.toLowerCase().includes(needle));
    }
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return makeSuccess({ items, total: items.length });
  },

  async cancelEvent(user, eventId, reason) {
    await delay(240, 480);
    const err = requireAdmin(user);
    if (err) return err;
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    db.updateEvent(eventId, {
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
    });
    db.addAuditLog({
      actorUserId: user.id,
      action: "EVENT_CANCELLED",
      targetType: "Event",
      targetId: eventId,
      metadata: { reason },
    });
    return makeSuccess(null, "Event cancelled.");
  },

  async listTransactions(user, filters = {}) {
    await delay(200, 440);
    const err = requireAdmin(user);
    if (err) return err;

    let items = [...db.transactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    if (filters.status) items = items.filter((t) => t.status === filters.status);
    if (filters.q) {
      const needle = filters.q.toLowerCase();
      items = items.filter(
        (t) =>
          t.reference?.toLowerCase().includes(needle) ||
          t.customerEmail?.toLowerCase().includes(needle)
      );
    }
    return makeSuccess({ items, total: items.length });
  },
};

export default adminHandler;