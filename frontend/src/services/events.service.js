import { eventsHandler } from "../mocks/handlers/events.handler";
import { useAuthStore } from "../stores/authStore";

/**
 * Events service. Public + organizer-scoped event operations.
 * PRODUCTION SWAP: map to ENDPOINTS.events.* and ENDPOINTS.organizer.*
 */

const currentUser = () => useAuthStore.getState().user;

export const eventsService = {
  /* ---------- Public ---------- */

  getEvents(filters = {}) {
    return eventsHandler.list(filters);
  },

  getEventBySlug(slug) {
    return eventsHandler.detail(slug);
  },

  getFeatured() {
    return eventsHandler.featured();
  },

  getTrending() {
    return eventsHandler.trending();
  },

  getUpcoming() {
    return eventsHandler.upcoming();
  },

  getCities() {
    return eventsHandler.cities();
  },

  /* ---------- Organizer ---------- */

  getOrganizerEvents(organizerId, filters = {}) {
    return eventsHandler.organizerList(organizerId, filters);
  },

  getOrganizerEvent(organizerId, eventId) {
    return eventsHandler.organizerGet(organizerId, eventId);
  },

  createEvent(organizerId, payload) {
    return eventsHandler.create(organizerId, payload);
  },

  updateEvent(organizerId, eventId, patch) {
    return eventsHandler.update(organizerId, eventId, patch);
  },

  publishEvent(organizerId, eventId) {
    return eventsHandler.publish(organizerId, eventId);
  },

  unpublishEvent(organizerId, eventId) {
    return eventsHandler.unpublish(organizerId, eventId);
  },

  cancelEvent(organizerId, eventId, reason) {
    return eventsHandler.cancel(organizerId, eventId, reason);
  },

  duplicateEvent(organizerId, eventId) {
    return eventsHandler.duplicate(organizerId, eventId);
  },

  deleteDraft(organizerId, eventId) {
    return eventsHandler.deleteDraft(organizerId, eventId);
  },

  /* ---------- Ticket types (organizer-scoped) ---------- */

  getTicketTypes(organizerId, eventId) {
    return eventsHandler.listTicketTypes(organizerId, eventId);
  },

  createTicketType(organizerId, eventId, payload) {
    return eventsHandler.createTicketType(organizerId, eventId, payload);
  },

  updateTicketType(organizerId, eventId, ticketTypeId, patch) {
    return eventsHandler.updateTicketType(organizerId, eventId, ticketTypeId, patch);
  },

  deleteTicketType(organizerId, eventId, ticketTypeId) {
    return eventsHandler.deleteTicketType(organizerId, eventId, ticketTypeId);
  },

  reorderTicketTypes(organizerId, eventId, orderedIds) {
    return eventsHandler.reorderTicketTypes(organizerId, eventId, orderedIds);
  },

  /* ---------- Convenience ---------- */

  /** The organizer profile id for the currently signed-in organizer. */
  currentOrganizerId() {
    const user = currentUser();
    return user?.organizerId ?? null;
  },
};

export default eventsService;