/**
 * Applies an event theme to a DOM element by setting the --event-*
 * CSS custom properties. Never mutates global state, never touches
 * document.documentElement except in the `scope === "root"` case.
 *
 * Used by:
 *   - <EventThemeProvider> on event detail pages
 *   - The live preview in the event-creation wizard
 *   - The QR ticket card (to inherit the event's identity)
 */

const VARIABLE_MAP = {
  primary: "--event-primary",
  primaryForeground: "--event-primary-foreground",
  secondary: "--event-secondary",
  secondaryForeground: "--event-secondary-foreground",
  accent: "--event-accent",
  accentForeground: "--event-accent-foreground",
  background: "--event-background",
  surface: "--event-surface",
  surfaceElevated: "--event-surface-elevated",
  foreground: "--event-foreground",
  muted: "--event-muted",
  border: "--event-border",
  glow: "--event-glow",
};

/** Returns a plain object of { "--event-primary": "#..", ... }. */
export function themeToCSSVars(theme) {
  if (!theme) return {};
  const out = {};
  for (const [key, cssVar] of Object.entries(VARIABLE_MAP)) {
    if (theme[key]) out[cssVar] = theme[key];
  }
  return out;
}

/**
 * Apply a theme to any HTMLElement.
 * @param {HTMLElement} el
 * @param {object} theme
 * @param {"element"|"root"} scope - "element" (default) sets the
 *   variables on the element itself; "root" also mirrors them onto
 *   document.documentElement (used for global modals/drawers that
 *   render outside the event subtree).
 */
export function applyTheme(el, theme, scope = "element") {
  if (!el || !theme) return;
  const vars = themeToCSSVars(theme);
  for (const [k, v] of Object.entries(vars)) {
    el.style.setProperty(k, v);
  }
  el.classList.add("event-theme");

  if (scope === "root") {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) {
      root.style.setProperty(k, v);
    }
  }
}

/** Remove all event-theme variables from an element. */
export function removeTheme(el, scope = "element") {
  if (!el) return;
  for (const cssVar of Object.values(VARIABLE_MAP)) {
    el.style.removeProperty(cssVar);
    if (scope === "root") {
      document.documentElement.style.removeProperty(cssVar);
    }
  }
  el.classList.remove("event-theme");
}

/**
 * Convenience for one-shot application (e.g., a portal overlay).
 * Returns a cleanup function.
 */
export function withTheme(el, theme, scope = "element") {
  applyTheme(el, theme, scope);
  return () => removeTheme(el, scope);
}

export default applyTheme;