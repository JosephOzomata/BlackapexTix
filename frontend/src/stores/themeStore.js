import { create } from "zustand";

/**
 * Event-theme store. Used by the event detail page and by the theme
 * preview inside the event-creation wizard.
 *
 * This store only holds the *currently rendered* event theme — it never
 * persists across sessions because each event has its own theme, and
 * cross-session persistence is a backend responsibility.
 */
export const useThemeStore = create((set, get) => ({
  /** Map of eventId → resolved theme object. */
  themesById: {},
  /** Currently active theme id (usually the current event). */
  activeId: null,

  setTheme: (id, theme) =>
    set((s) => ({
      themesById: { ...s.themesById, [id]: theme },
      activeId: id,
    })),

  getTheme: (id) => get().themesById[id] ?? null,

  clearTheme: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.themesById;
      return { themesById: rest, activeId: s.activeId === id ? null : s.activeId };
    }),

  clearAll: () => set({ themesById: {}, activeId: null }),
}));

export default useThemeStore;