import { db, delay } from "../mocks/database";
import { ERROR_CODES, makeSuccess, makeError } from "../utils/errorCodes";
import { useAuthStore } from "../stores/authStore";

/**
 * Customers service — anything customer-scoped.
 * Includes the account-existence check used during group/table purchases.
 */

const currentUser = () => useAuthStore.getState().user;

export const customersService = {
  async checkAccountsByEmails(emails = []) {
    await delay(280, 520);
    const results = emails.map((email) => {
      const normalized = String(email ?? "").trim().toLowerCase();
      if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return { email: normalized, status: "INVALID" };
      }
      const user = db.getUserByEmail(normalized);
      if (!user) return { email: normalized, status: "NOT_FOUND" };
      return {
        email: normalized,
        status: "FOUND",
        displayName: user.fullName?.split(" ")[0] ?? null,
      };
    });
    return makeSuccess({ results });
  },

  async getProfile() {
    await delay(160, 320);
    const user = currentUser();
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    const fresh = db.getUserById(user.id);
    return makeSuccess({
      user: fresh
        ? {
            id: fresh.id,
            fullName: fresh.fullName,
            email: fresh.email,
            phone: fresh.phone,
            avatarUrl: fresh.avatarUrl,
            role: fresh.role,
            emailVerified: fresh.emailVerified,
          }
        : null,
    });
  },

  async updateProfile(patch) {
    await delay(280, 520);
    const user = currentUser();
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    db.updateUser(user.id, {
      fullName: patch.fullName,
      phone: patch.phone,
      avatarUrl: patch.avatarUrl,
    });
    return makeSuccess(null, "Profile updated.");
  },

  async changePassword({ currentPassword, newPassword }) {
    await delay(340, 620);
    const user = currentUser();
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    const fresh = db.getUserById(user.id);
    if (!fresh || fresh.password !== currentPassword) {
      return makeError(
        ERROR_CODES.INVALID_CREDENTIALS,
        "Current password is incorrect."
      );
    }
    db.updateUser(user.id, { password: newPassword });
    return makeSuccess(null, "Password updated.");
  },
};

export default customersService;