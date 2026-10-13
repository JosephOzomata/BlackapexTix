import { scannerHandler } from "../mocks/handlers/scanner.handler";
import { useAuthStore } from "../stores/authStore";

const currentUser = () => useAuthStore.getState().user;

export const scannerService = {
  getAssignedEvents() {
    return scannerHandler.assignedEvents(currentUser());
  },

  getEventContext(eventId) {
    return scannerHandler.eventContext(currentUser(), eventId);
  },

  validateToken(eventId, payload) {
    return scannerHandler.validate(currentUser(), eventId, payload);
  },

  redeemToken(eventId, payload) {
    return scannerHandler.redeem(currentUser(), eventId, payload);
  },

  getRecentCheckins(eventId, limit = 10) {
    return scannerHandler.recentCheckins(currentUser(), eventId, limit);
  },
};

export default scannerService;