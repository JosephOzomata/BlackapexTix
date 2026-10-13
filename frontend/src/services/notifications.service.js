import { db, delay } from "../mocks/database";
import { ERROR_CODES, makeSuccess, makeError } from "../utils/errorCodes";
import { useAuthStore } from "../stores/authStore";

/**
 * Notifications service.
 * REALITY CHECK: the frontend never sends email — that's a backend job.
 * This service only reads in-app notifications and (in the mock) exposes
 * a no-op contract that the backend will eventually implement.
 */

const currentUser = () => useAuthStore.getState().user;

export const notificationsService = {
  async list() {
    await delay(140, 300);
    const user = currentUser();
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    const items = db.notifications
      .filter((n) => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unread = items.filter((n) => !n.read).length;
    return makeSuccess({ items, unread });
  },

  async markRead(notificationId) {
    await delay(120, 260);
    const user = currentUser();
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    const n = db.notifications.find(
      (x) => x.id === notificationId && x.userId === user.id
    );
    if (!n) return makeError(ERROR_CODES.NOT_FOUND);
    n.read = true;
    return makeSuccess(null);
  },

  async markAllRead() {
    await delay(140, 280);
    const user = currentUser();
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    db.notifications.forEach((n) => {
      if (n.userId === user.id) n.read = true;
    });
    return makeSuccess(null);
  },

  /**
   * PRODUCTION: this is a backend responsibility. The mock only reports
   * that the "backend" has queued the email. Never send email from the
   * browser.
   */
  async sendTicketEmail({ orderId, email }) {
    await delay(220, 460);
    return makeSuccess(
      { orderId, email, queuedAt: new Date().toISOString() },
      "Ticket email queued."
    );
  },
};

export default notificationsService;