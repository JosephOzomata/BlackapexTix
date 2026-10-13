import { ticketsHandler } from "../mocks/handlers/tickets.handler";
import { useAuthStore } from "../stores/authStore";

const currentUser = () => useAuthStore.getState().user;

export const ticketsService = {
  getMyTickets(filters = {}) {
    return ticketsHandler.mine(currentUser(), filters);
  },

  getTicket(ticketId) {
    return ticketsHandler.detail(currentUser(), ticketId);
  },

  getGroupOrder(orderId) {
    return ticketsHandler.groupOrder(currentUser(), orderId);
  },

  getEventTickets(organizerId, eventId, filters = {}) {
    return ticketsHandler.listForEvent(organizerId, eventId, filters);
  },

  /**
   * Download helpers run client-side. The real backend also emails each
   * ticket; the frontend never sends email itself.
   */
  async markDownloaded(ticketId) {
    // In production: POST /me/tickets/:id/download (analytics only).
    // Mock is a no-op so the UI can call it freely.
    return { success: true, data: { ticketId } };
  },
};

export default ticketsService;