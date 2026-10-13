import { create } from "zustand";
import { persist } from "zustand/middleware";
import storage, { STORAGE_NAMESPACES } from "../utils/storage";

/**
 * Global UI state — small, safe, worth persisting.
 * Do NOT put server data here; use TanStack Query for that.
 */
export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme preference
      colorScheme: "dark", // "dark" | "light" | "system"
      setColorScheme: (scheme) => set({ colorScheme: scheme }),

      // Layout
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      mobileNavOpen: false,
      setMobileNavOpen: (v) => set({ mobileNavOpen: v }),

      // Global overlays (dialog / drawer stacks)
      activeModal: null,
      openModal: (payload) => set({ activeModal: payload }),
      closeModal: () => set({ activeModal: null }),

      // Search history
      recentSearches: [],
      addRecentSearch: (term) => {
        const t = String(term ?? "").trim();
        if (!t) return;
        const current = get().recentSearches ?? [];
        const next = [t, ...current.filter((x) => x !== t)].slice(0, 8);
        set({ recentSearches: next });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Location preference
      preferredCity: null,
      setPreferredCity: (city) => set({ preferredCity: city }),
    }),
    {
      name: "ui",
      storage: {
        getItem: (name) => storage.get(STORAGE_NAMESPACES.ui, name),
        setItem: (name, value) => storage.set(STORAGE_NAMESPACES.ui, name, value),
        removeItem: (name) => storage.remove(STORAGE_NAMESPACES.ui, name),
      },
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        sidebarCollapsed: state.sidebarCollapsed,
        recentSearches: state.recentSearches,
        preferredCity: state.preferredCity,
      }),
    }
  )
);

export default useUIStore;