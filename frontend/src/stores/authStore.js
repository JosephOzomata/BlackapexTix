import { create } from "zustand";
import storage, { STORAGE_NAMESPACES } from "../utils/storage";
import { ROLES } from "../constants/roles";

/**
 * Session store.
 *
 * SECURITY NOTE: the persisted value here is a development simulation
 * only. Production auth flows will return an httpOnly session cookie;
 * this store then holds only the *public* user shape (id, name, role)
 * fetched from GET /auth/me. No tokens are ever persisted in the browser
 * in production.
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  role: null,
  status: "idle", // "idle" | "loading" | "authenticated" | "unauthenticated"
  error: null,
  hydrated: false,

  setUser: (user) => {
    if (!user) {
      set({ user: null, role: null, status: "unauthenticated" });
      storage.remove(STORAGE_NAMESPACES.mockSession, "user");
      return;
    }
    set({ user, role: user.role ?? null, status: "authenticated", error: null });
    // Persisted only for dev-mock continuity. In production, /auth/me is
    // the source of truth on every app start.
    storage.set(STORAGE_NAMESPACES.mockSession, "user", user);
  },

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),

  /** Restore from local mock storage once, on boot. */
  hydrate: () => {
    if (get().hydrated) return;
    const cached = storage.get(STORAGE_NAMESPACES.mockSession, "user", null);
    if (cached?.id && cached?.role) {
      set({
        user: cached,
        role: cached.role,
        status: "authenticated",
        hydrated: true,
      });
    } else {
      set({ hydrated: true, status: "unauthenticated" });
    }
  },

  logout: () => {
    set({ user: null, role: null, status: "unauthenticated", error: null });
    storage.remove(STORAGE_NAMESPACES.mockSession, "user");
  },

  /** Permissions helpers (UI-only — backend still enforces). */
  hasRole: (...roles) => {
    const r = get().role;
    return r ? roles.includes(r) : false;
  },
  isSuperAdmin: () => get().role === ROLES.SUPER_ADMIN,
  isOrganizer: () => get().role === ROLES.ORGANIZER,
  isScanner: () => get().role === ROLES.SCANNER,
  isCustomer: () => get().role === ROLES.CUSTOMER,
  isAuthenticated: () => get().status === "authenticated" && Boolean(get().user),
}));

export default useAuthStore;