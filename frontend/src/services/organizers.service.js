import { db, delay } from "../mocks/database";
import { ERROR_CODES, makeSuccess, makeError } from "../utils/errorCodes";
import { eventsHandler } from "../mocks/handlers/events.handler";
import { useAuthStore } from "../stores/authStore";

/**
 * Organizers service — public organizer profiles and organizer settings.
 */

const currentUser = () => useAuthStore.getState().user;

export const organizersService = {
  async getPublicProfile(slug) {
    await delay(200, 420);
    const org = db.getOrganizerBySlug(slug);
    if (!org) return makeError(ERROR_CODES.ORGANIZER_NOT_FOUND);

    const events = await eventsHandler.organizerList(org.id, {});
    const now = Date.now();

    const upcoming = (events.data?.items ?? []).filter(
      (e) => new Date(e.startAt).getTime() > now && e.status !== "DRAFT"
    );
    const past = (events.data?.items ?? [])
      .filter((e) => new Date(e.startAt).getTime() <= now && e.status !== "DRAFT")
      .slice(0, 6);

    return makeSuccess({
      organizer: {
        id: org.id,
        slug: org.slug,
        businessName: org.businessName,
        logoUrl: org.logoUrl,
        description: org.description,
        contactEmail: org.contactEmail,
        contactPhone: org.contactPhone,
        website: org.website,
        social: org.social ?? {},
        status: org.status,
        isVerified: org.status === "VERIFIED",
      },
      upcoming,
      past,
    });
  },

  async getMyProfile() {
    await delay(180, 360);
    const user = currentUser();
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    const org = db.getOrganizerByUserId(user.id);
    if (!org) return makeError(ERROR_CODES.ORGANIZER_NOT_FOUND);
    return makeSuccess({ organizer: org });
  },

  async updateMyProfile(patch) {
    await delay(280, 520);
    const user = currentUser();
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    const org = db.getOrganizerByUserId(user.id);
    if (!org) return makeError(ERROR_CODES.ORGANIZER_NOT_FOUND);
    Object.assign(org, patch, { updatedAt: new Date().toISOString() });
    return makeSuccess({ organizer: org }, "Profile updated.");
  },

  /* ---------- Scanner management (organizer scoped) ---------- */

  async getEventScanners(organizerId, eventId) {
    await delay(180, 380);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    const items = db.getScannersForEvent(eventId);
    return makeSuccess({ items });
  },

  async inviteScanner(organizerId, eventId, { email, name }) {
    await delay(280, 560);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);

    const normalized = String(email).trim().toLowerCase();
    const existing = db.scanners.find(
      (s) => s.eventId === eventId && s.scannerEmail.toLowerCase() === normalized
    );
    if (existing) {
      return makeError(
        ERROR_CODES.VALIDATION_ERROR,
        "This email has already been invited to scan this event."
      );
    }

    const userAccount = db.getUserByEmail(normalized);
    const scannerUserId = userAccount?.id ?? null;
    const scannerName = userAccount?.fullName ?? name ?? normalized;

    const assignment = db.addScanner({
      eventId,
      scannerUserId,
      scannerEmail: normalized,
      scannerName,
      invitedByUserId: currentUser()?.id ?? null,
      status: "INVITED",
    });

    db.addNotification({
      userId: scannerUserId,
      type: "SCANNER_INVITED",
      title: "New scanner invitation",
      message: `You've been invited to scan ${event.title}.`,
      link: "/scanner",
    });

    return makeSuccess(assignment, "Scanner invited.");
  },

  async updateScannerStatus(organizerId, eventId, scannerId, status) {
    await delay(220, 440);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);

    const assignment = db.scanners.find((s) => s.id === scannerId && s.eventId === eventId);
    if (!assignment) return makeError(ERROR_CODES.NOT_FOUND);

    db.updateScanner(scannerId, {
      status,
      acceptedAt: status === "ACTIVE" ? new Date().toISOString() : assignment.acceptedAt,
    });
    return makeSuccess(null, `Scanner ${status === "ACTIVE" ? "activated" : "updated"}.`);
  },

  async removeScanner(organizerId, eventId, scannerId) {
    await delay(200, 400);
    const event = db.getEventById(eventId);
    if (!event) return makeError(ERROR_CODES.EVENT_NOT_FOUND);
    if (event.organizerId !== organizerId) return makeError(ERROR_CODES.FORBIDDEN);
    const assignment = db.scanners.find((s) => s.id === scannerId && s.eventId === eventId);
    if (!assignment) return makeError(ERROR_CODES.NOT_FOUND);
    db.removeScanner(scannerId);
    return makeSuccess(null, "Scanner removed.");
  },
};

export default organizersService;