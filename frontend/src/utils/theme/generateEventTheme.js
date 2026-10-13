/**
 * Turns a raw palette (from extractEventPalette) into a full,
 * accessible event theme object that can be applied via CSS custom
 * properties (see applyTheme.js).
 *
 * The result is deliberately opinionated: it always produces a dark
 * background + light foreground by default, because event pages are
 * almost always shown in dark mode at night venues and on phones.
 * The generator auto-corrects contrast so text is always readable.
 */

import {
  getContrastRatio,
  pickReadableForeground,
  ensureContrast,
  adjustLightness,
  adjustSaturation,
  mixColors,
  hexToHsl,
  hslToHex,
  isLight,
} from "./contrast";

export const DEFAULT_EVENT_THEME = {
  source: "auto",
  primary: "#7c3aed",
  primaryForeground: "#ffffff",
  secondary: "#ec4899",
  secondaryForeground: "#ffffff",
  accent: "#f59e0b",
  accentForeground: "#0f172a",
  background: "#08080c",
  surface: "#0f1117",
  surfaceElevated: "#161923",
  foreground: "#f8fafc",
  muted: "#94a3b8",
  border: "#1e293b",
  glow: "#7c3aed",
  generatedFromMediaId: null,
  updatedAt: null,
};

/** Given a hue+base colour, produce a very dark background version. */
function deriveBackground(baseHex, { lightness = 7, saturationFloor = 22 } = {}) {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return DEFAULT_EVENT_THEME.background;
  const s = Math.max(saturationFloor, Math.min(40, hsl.s * 0.45));
  return hslToHex({ h: hsl.h, s, l: lightness });
}

function deriveSurface(baseHex, { lightness = 12, saturationFloor = 18 } = {}) {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return DEFAULT_EVENT_THEME.surface;
  const s = Math.max(saturationFloor, Math.min(35, hsl.s * 0.4));
  return hslToHex({ h: hsl.h, s, l: lightness });
}

function deriveSurfaceElevated(baseHex, { lightness = 18, saturationFloor = 16 } = {}) {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return DEFAULT_EVENT_THEME.surfaceElevated;
  const s = Math.max(saturationFloor, Math.min(30, hsl.s * 0.35));
  return hslToHex({ h: hsl.h, s, l: lightness });
}

function deriveBorder(surfaceHex, primaryHex) {
  // Slightly lighter than surface, tinted a touch toward primary.
  const lifted = adjustLightness(surfaceHex, 10);
  return mixColors(lifted, primaryHex, 0.18);
}

function deriveMuted(foregroundHex) {
  // Muted is a desaturated version of foreground — readable but quiet.
  const hsl = hexToHsl(foregroundHex);
  if (!hsl) return DEFAULT_EVENT_THEME.muted;
  return hslToHex({ h: hsl.h, s: Math.min(20, hsl.s), l: 62 });
}

/**
 * Ensure the primary colour is safe to use as a button background:
 * not too light (would wash out white text) and not too dark (would
 * disappear against the dark surface).
 */
function normalisePrimary(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return DEFAULT_EVENT_THEME.primary;
  let { h, s, l } = hsl;
  s = Math.max(45, Math.min(95, s));       // keep it vivid
  l = Math.max(38, Math.min(68, l));       // keep it punchy but not blinding
  return hslToHex({ h, s, l });
}

function normaliseAccent(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return DEFAULT_EVENT_THEME.accent;
  let { h, s, l } = hsl;
  s = Math.max(60, Math.min(100, s));
  l = Math.max(45, Math.min(75, l));
  return hslToHex({ h, s, l });
}

function normaliseSecondary(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return DEFAULT_EVENT_THEME.secondary;
  let { h, s, l } = hsl;
  s = Math.max(50, Math.min(95, s));
  l = Math.max(42, Math.min(72, l));
  return hslToHex({ h, s, l });
}

/**
 * Main entry point.
 * @param {object} paletteResult - result of extractEventPalette()
 * @param {object} [overrides]   - optional manual overrides by key
 */
export function generateEventTheme(paletteResult, overrides = {}) {
  const candidates = paletteResult?.candidates ?? {};
  const quality = paletteResult?.quality ?? "fallback";

  const primaryRaw = overrides.primary ?? candidates.primary ?? DEFAULT_EVENT_THEME.primary;
  const secondaryRaw = overrides.secondary ?? candidates.secondary ?? DEFAULT_EVENT_THEME.secondary;
  const accentRaw = overrides.accent ?? candidates.accent ?? DEFAULT_EVENT_THEME.accent;

  const primary = normalisePrimary(primaryRaw);
  const secondary = normaliseSecondary(secondaryRaw);
  const accent = normaliseAccent(accentRaw);

  const background = overrides.background ?? deriveBackground(primary);
  const surface = overrides.surface ?? deriveSurface(primary);
  const surfaceElevated = overrides.surfaceElevated ?? deriveSurfaceElevated(primary);

  // Foreground: pick a colour that reads on `background`.
  const foreground =
    overrides.foreground ?? pickReadableForeground(background, "#f8fafc", 7);

  const muted = overrides.muted ?? deriveMuted(foreground);
  const border = overrides.border ?? deriveBorder(surface, primary);

  // Button foregrounds — auto-correct for accessibility.
  const primaryForeground = pickReadableForeground(primary, "#ffffff", 4.5);
  const secondaryForeground = pickReadableForeground(secondary, "#ffffff", 4.5);
  const accentForeground = pickReadableForeground(accent, "#0a0a0f", 4.5);

  // Ambient glow colour — a lighter, saturating version of primary.
  const glow = mixColors(primary, "#ffffff", 0.08);

  // Final safety pass: any low-contrast pair is nudged automatically.
  const safeForeground = ensureContrast(foreground, background, 7);
  const safeMuted = ensureContrast(muted, background, 4.5);

  return {
    source: overrides.source ?? "auto",
    quality,
    primary,
    primaryForeground,
    secondary,
    secondaryForeground,
    accent,
    accentForeground,
    background,
    surface,
    surfaceElevated,
    foreground: safeForeground,
    muted: safeMuted,
    border,
    glow,
    generatedFromMediaId: overrides.generatedFromMediaId ?? null,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Same as generateEventTheme but accepts a manual partial override set.
 * Used by the "Manual override" / "Reset to auto" UI in the wizard.
 */
export function regenerateTheme(paletteResult, manualOverrides = {}) {
  return generateEventTheme(paletteResult, {
    ...manualOverrides,
    source: Object.keys(manualOverrides).length > 0 ? "manual" : "auto",
  });
}

/**
 * Runtime guard: is a theme object safe to ship to the DOM?
 * Prevents accidental "invisible text on background" bugs.
 */
export function validateEventTheme(theme) {
  if (!theme || typeof theme !== "object") return false;
  const required = [
    "primary",
    "primaryForeground",
    "background",
    "surface",
    "foreground",
    "muted",
    "border",
  ];
  for (const key of required) {
    if (!theme[key] || typeof theme[key] !== "string") return false;
  }
  // Sanity check on the most critical pair.
  if (getContrastRatio(theme.foreground, theme.background) < 4.5) return false;
  return true;
}

export default generateEventTheme;