import { ordersHandler } from "../mocks/handlers/orders.handler";
import { useAuthStore } from "../stores/authStore";

/**
 * Orders service — creates and reads orders.
 * NOTE: no method here marks an order as PAID — only payments.service can
 * trigger the simulated backend webhook flow.
 */

const currentUser = () => useAuthStore.getState().user;

export const ordersService = {
  createOrder(payload) {
    return ordersHandler.create(currentUser(), payload);
  },

  getOrder(orderId) {
    return ordersHandler.detail(orderId, currentUser());
  },

  cancelOrder(orderId) {
    return ordersHandler.cancel(orderId, currentUser());
  },

  getMyOrders(filters = {}) {
    return ordersHandler.mine(currentUser(), filters);
  },

  getEventOrders(organizerId, eventId, filters = {}) {
    return ordersHandler.listForEvent(organizerId, eventId, filters);
  },
};

export default ordersService;