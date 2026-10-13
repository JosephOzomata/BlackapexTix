/**
 * Colour maths for the event-theme engine.
 * Pure functions — no DOM, no dependencies. Safe to unit test.
 */

/* ---------- Parsing ---------- */

export function hexToRgb(hex) {
  if (!hex) return null;
  let h = String(hex).trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return null;
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex({ r, g, b }) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }) {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  };
}

export const hexToHsl = (hex) => {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
};

export const hslToHex = (hsl) => rgbToHex(hslToRgb(hsl));

/* ---------- Luminance & contrast ---------- */

export function getRelativeLuminance({ r, g, b }) {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

export function getContrastRatio(hexA, hexB) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return 1;
  const l1 = getRelativeLuminance(a);
  const l2 = getRelativeLuminance(b);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

export const isLight = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return getRelativeLuminance(rgb) > 0.5;
};

export const isDark = (hex) => !isLight(hex);

/* ---------- Colour manipulation ---------- */

export function adjustLightness(hex, delta) {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex({ ...hsl, l: Math.max(0, Math.min(100, hsl.l + delta)) });
}

export function setLightness(hex, l) {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex({ ...hsl, l: Math.max(0, Math.min(100, l)) });
}

export function adjustSaturation(hex, delta) {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  return hslToHex({ ...hsl, s: Math.max(0, Math.min(100, hsl.s + delta)) });
}

export function mixColors(a, b, weight = 0.5) {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return a;
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex({
    r: ra.r * (1 - w) + rb.r * w,
    g: ra.g * (1 - w) + rb.g * w,
    b: ra.b * (1 - w) + rb.b * w,
  });
}

export function withAlpha(hex, alpha) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${alpha})`;
}

/* ---------- Accessibility helpers ---------- */

/**
 * Pick the closest-to-brand text colour on a given background that
 * meets at least the target WCAG ratio.
 * Falls back to pure white or pure black if nothing else works.
 */
export function pickReadableForeground(bgHex, preferredHex = null, minRatio = 4.5) {
  const bg = hexToRgb(bgHex);
  if (!bg) return "#ffffff";

  // If a preferred brand foreground is passed, keep it if it already passes.
  if (preferredHex && getContrastRatio(preferredHex, bgHex) >= minRatio) {
    return preferredHex;
  }

  const white = "#ffffff";
  const black = "#0a0a0f";

  const whiteRatio = getContrastRatio(white, bgHex);
  const blackRatio = getContrastRatio(black, bgHex);

  // If a preferred colour is close, try nudging it lighter/darker
  if (preferredHex) {
    for (let i = 1; i <= 40; i++) {
      const lighter = adjustLightness(preferredHex, i);
      if (getContrastRatio(lighter, bgHex) >= minRatio) return lighter;
      const darker = adjustLightness(preferredHex, -i);
      if (getContrastRatio(darker, bgHex) >= minRatio) return darker;
    }
  }

  return whiteRatio >= blackRatio ? white : black;
}

/**
 * Nudge `fg` away from `bg` until it hits the target contrast ratio.
 * Returns the original if it already passes.
 */
export function ensureContrast(fgHex, bgHex, minRatio = 4.5) {
  if (getContrastRatio(fgHex, bgHex) >= minRatio) return fgHex;
  const bgLum = getRelativeLuminance(hexToRgb(bgHex));
  const goLighter = bgLum < 0.5;
  let current = fgHex;
  for (let i = 1; i <= 60; i++) {
    current = adjustLightness(current, goLighter ? 1.5 : -1.5);
    if (getContrastRatio(current, bgHex) >= minRatio) return current;
  }
  return pickReadableForeground(bgHex, null, minRatio);
}

/* ---------- Categorisation ---------- */

export function isNeutral(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return true;
  return hsl.s < 12; // very grey
}

export function isNearWhite(hex, threshold = 92) {
  const hsl = hexToHsl(hex);
  return hsl ? hsl.l > threshold : false;
}

export function isNearBlack(hex, threshold = 8) {
  const hsl = hexToHsl(hex);
  return hsl ? hsl.l < threshold : false;
}

export function isVibrant(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return false;
  return hsl.s > 25 && hsl.l > 12 && hsl.l < 88;
}

/** Hue distance in degrees, returns value in [0,180]. */
export function hueDistance(hexA, hexB) {
  const a = hexToHsl(hexA);
  const b = hexToHsl(hexB);
  if (!a || !b) return 180;
  const d = Math.abs(a.h - b.h) % 360;
  return d > 180 ? 360 - d : d;
}