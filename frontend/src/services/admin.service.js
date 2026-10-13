import { adminHandler } from "../mocks/handlers/admin.handler";
import { useAuthStore } from "../stores/authStore";

const currentUser = () => useAuthStore.getState().user;

export const adminService = {
  getOverview() {
    return adminHandler.overview(currentUser());
  },
  getOrganizers(filters = {}) {
    return adminHandler.listOrganizers(currentUser(), filters);
  },
  updateOrganizerStatus(organizerId, status) {
    return adminHandler.updateOrganizerStatus(currentUser(), organizerId, status);
  },
  getUsers(filters = {}) {
    return adminHandler.listUsers(currentUser(), filters);
  },
  updateUserStatus(userId, status) {
    return adminHandler.updateUserStatus(currentUser(), userId, status);
  },
  getEvents(filters = {}) {
    return adminHandler.listEvents(currentUser(), filters);
  },
  cancelEvent(eventId, reason) {
    return adminHandler.cancelEvent(currentUser(), eventId, reason);
  },
  getTransactions(filters = {}) {
    return adminHandler.listTransactions(currentUser(), filters);
  },
};

export default adminService;