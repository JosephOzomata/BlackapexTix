/**
 * Storage helpers.
 *
 * CRITICAL: This is NOT a production authentication mechanism.
 * Only used to persist (a) safe UI preferences (theme, sidebar state),
 * and (b) a development-only mock session so the frontend can simulate
 * logged-in flows. Real authentication state will come from the backend
 * via httpOnly cookies or short-lived tokens issued to the client.
 */

const PREFIX = "th";

function makeKey(namespace, key) {
  return `${PREFIX}:${namespace}:${key}`;
}

function safeGet() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const storage = {
  get(namespace, key, fallback = null) {
    const ls = safeGet();
    if (!ls) return fallback;
    try {
      const raw = ls.getItem(makeKey(namespace, key));
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(namespace, key, value) {
    const ls = safeGet();
    if (!ls) return;
    try {
      ls.setItem(makeKey(namespace, key), JSON.stringify(value));
    } catch {
      /* quota / private-mode — silently ignore */
    }
  },
  remove(namespace, key) {
    const ls = safeGet();
    if (!ls) return;
    try {
      ls.removeItem(makeKey(namespace, key));
    } catch {
      /* ignore */
    }
  },
  clear(namespace) {
    const ls = safeGet();
    if (!ls) return;
    try {
      const keys = Object.keys(ls).filter((k) => k.startsWith(`${PREFIX}:${namespace}:`));
      keys.forEach((k) => ls.removeItem(k));
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_NAMESPACES = Object.freeze({
  ui: "ui",
  mockSession: "mock-session", // dev simulation only
  cart: "cart",
  favorites: "favorites",
});

export default storage;