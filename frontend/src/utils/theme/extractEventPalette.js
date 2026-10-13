/**
 * Extracts a candidate colour palette from an event flyer.
 * Uses ColorThief under the hood, but is written to be swappable.
 *
 * PUBLIC CONTRACT:
 *   extractEventPalette(imageElementOrUrl, options) -> Promise<PaletteResult>
 *
 * PaletteResult = {
 *   dominant: "#rrggbb",
 *   palette:  [{ hex, rgb, population, hsl, vibrant, neutral }],
 *   candidates: { primary, secondary, accent, neutral },
 *   raw:      [{ hex, population }],
 *   quality:  "high" | "medium" | "low" | "fallback",
 * }
 */

import ColorThief from "colorthief";
import {
  rgbToHex,
  rgbToHsl,
  isVibrant,
  isNeutral,
  isNearWhite,
  isNearBlack,
  hueDistance,
} from "./contrast";

const DEFAULT_OPTIONS = {
  colorCount: 12,
  quality: 8,
  crossOrigin: "anonymous",
  /**
   * If true, filters out near-white and near-black colours from the
   * candidate set (they're usually borders/backgrounds of the flyer,
   * not the identity colours we want).
   */
  filterNeutrals: false,
};

/** Load an image (URL) into an HTMLImageElement ready for ColorThief. */
function loadImage(src, { crossOrigin } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.decoding = "async";
    img.loading = "eager";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    img.src = src;
  });
}

/** ColourThief can throw on tainted canvases / broken images. */
function safeExtract(img, { colorCount, quality }) {
  try {
    const thief = new ColorThief();
    const palette = thief.getPalette(img, colorCount, quality) || [];
    const dominant = thief.getColor(img, quality);
    return { palette, dominant };
  } catch (err) {
    return { palette: [], dominant: null, error: err };
  }
}

function rgbArrayToHex(arr) {
  if (!Array.isArray(arr) || arr.length < 3) return null;
  return rgbToHex({ r: arr[0], g: arr[1], b: arr[2] });
}

/** Score colours so we can rank by how "identity-worthy" they are. */
function scoreColour(entry, index) {
  const hsl = rgbToHsl(entry.rgb);
  let score = 0;

  // Population matters but shouldn't dominate (a huge pastel background
  // shouldn't beat a smaller, vivid brand colour).
  score += Math.log10(entry.population + 1) * 18;

  // Vibrant colours are more likely to be brand colours.
  if (hsl.s > 25 && hsl.l > 20 && hsl.l < 85) score += 30;

  // Very light / very dark colours are usually background or text —
  // still keep them, but rank them lower as "identity" colours.
  if (hsl.l > 92 || hsl.l < 8) score -= 25;

  // Mild preference for mid-lightness colours.
  const midDistance = Math.abs(hsl.l - 50);
  score -= midDistance * 0.4;

  // Slight positional preference — ColorThief returns larger swatches first.
  score -= index * 1.5;

  return score;
}

/** Pick 3 visually distinct colours from a ranked list. */
function pickDistinct(ranked, count = 3, minHueGap = 25) {
  const picked = [];
  for (const c of ranked) {
    if (picked.every((p) => hueDistance(p.hex, c.hex) >= minHueGap)) {
      picked.push(c);
      if (picked.length === count) break;
    }
  }
  // Relax the hue requirement if we couldn't fill the quota.
  if (picked.length < count) {
    for (const c of ranked) {
      if (!picked.some((p) => p.hex === c.hex)) {
        picked.push(c);
        if (picked.length === count) break;
      }
    }
  }
  return picked;
}

export async function extractEventPalette(image, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!image) {
    return fallbackPalette();
  }

  let img;
  try {
    img = typeof image === "string" ? await loadImage(image, opts) : image;
  } catch {
    return fallbackPalette();
  }

  // ColorThief needs the image fully decoded.
  if (!img.complete || img.naturalWidth === 0) {
    try {
      await new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    } catch {
      /* fall through */
    }
  }

  const { palette, dominant } = safeExtract(img, opts);

  if (!palette.length || !dominant) {
    return fallbackPalette();
  }

  const raw = palette.map((rgb, index) => {
    const hex = rgbArrayToHex(rgb);
    return { hex, rgb: { r: rgb[0], g: rgb[1], b: rgb[2] }, population: rgb.length ?? 0, index };
  }).filter((e) => e.hex);

  if (!raw.length) return fallbackPalette();

  const entries = raw.map((e) => {
    const hsl = rgbToHsl(e.rgb);
    return {
      ...e,
      hsl,
      vibrant: isVibrant(e.hex),
      neutral: isNeutral(e.hex),
      nearWhite: isNearWhite(e.hex),
      nearBlack: isNearBlack(e.hex),
    };
  });

  let considered = entries;
  if (opts.filterNeutrals) {
    considered = entries.filter((e) => !e.nearWhite && !e.nearBlack);
    if (!considered.length) considered = entries;
  }

  const ranked = [...considered]
    .map((e) => ({ ...e, score: scoreColour(e, e.index) }))
    .sort((a, b) => b.score - a.score);

  const distinct = pickDistinct(ranked, 3, 25);

  const primary = distinct[0]?.hex ?? ranked[0].hex;
  const secondary = distinct[1]?.hex ?? ranked[1]?.hex ?? primary;
  const accent = distinct[2]?.hex ?? ranked[2]?.hex ?? secondary;

  // Neutral: prefer a mid-lightness low-saturation colour from the flyer.
  const neutralCandidate =
    ranked.find((e) => e.neutral && e.hsl.l > 15 && e.hsl.l < 85) ||
    ranked.find((e) => !e.vibrant);

  // "dominant" is the single most common colour — useful for backgrounds.
  const dominantHex = rgbArrayToHex(dominant) || primary;

  // Quality: how many usable vibrant candidates did we actually get?
  const vibrantCount = entries.filter((e) => e.vibrant).length;
  const quality =
    entries.length >= 8 && vibrantCount >= 3 ? "high"
    : entries.length >= 5 ? "medium"
    : "low";

  return {
    dominant: dominantHex,
    palette: entries.sort((a, b) => b.population - a.population),
    candidates: {
      primary,
      secondary,
      accent,
      neutral: neutralCandidate?.hex ?? null,
    },
    raw,
    quality,
  };
}

/** Deterministic fallback so the UI never breaks. */
function fallbackPalette() {
  return {
    dominant: "#7c3aed",
    palette: [],
    candidates: {
      primary: "#7c3aed",
      secondary: "#ec4899",
      accent: "#f59e0b",
      neutral: "#1e293b",
    },
    raw: [],
    quality: "fallback",
  };
}

/**
 * Convenience: extract using a File from an <input type="file">.
 * Uses a temporary object URL; revokes it afterwards.
 */
export async function extractEventPaletteFromFile(file, options = {}) {
  if (!file || !file.type?.startsWith("image/")) return fallbackPalette();
  const url = URL.createObjectURL(file);
  try {
    return await extractEventPalette(url, options);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default extractEventPalette;