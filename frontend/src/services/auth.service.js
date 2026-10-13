import { authHandler } from "../mocks/handlers/auth.handler";
import { storage, STORAGE_NAMESPACES } from "../utils/storage";

/**
 * Auth service.
 *
 * PRODUCTION SWAP:
 *   Replace the mock handler calls with httpClient calls to ENDPOINTS.auth.*
 *   Remove the local mockSession write (session comes from httpOnly cookies).
 */

const getSessionToken = () => storage.get(STORAGE_NAMESPACES.mockSession, "token", null);
const setSessionToken = (t) => storage.set(STORAGE_NAMESPACES.mockSession, "token", t);
const clearSessionToken = () => storage.remove(STORAGE_NAMESPACES.mockSession, "token");

export const authService = {
  async register(payload) {
    const res = await authHandler.register(payload);
    if (res.success && res.data?.sessionToken) {
      setSessionToken(res.data.sessionToken);
    }
    return res;
  },

  async login(payload) {
    const res = await authHandler.login(payload);
    if (res.success && res.data?.sessionToken) {
      setSessionToken(res.data.sessionToken);
    }
    return res;
  },

  async logout() {
    try {
      await authHandler.logout();
    } finally {
      clearSessionToken();
    }
    return { success: true, data: null };
  },

  async me() {
    const token = getSessionToken();
    if (!token) {
      // Return a successful "no session" instead of an error — lets the
      // bootstrap treat it as unauthenticated without polluting error
      // handling everywhere.
      return { success: true, data: { user: null } };
    }
    return authHandler.me(token);
  },

  async forgotPassword(payload) {
    return authHandler.forgotPassword(payload);
  },

  async resetPassword(payload) {
    return authHandler.resetPassword(payload);
  },

  async verifyEmail(payload) {
    return authHandler.verifyEmail(payload);
  },

  async resendVerification(payload) {
    return authHandler.resendVerification(payload);
  },
};

export default authService;