/**
 * Client-side file download helpers. Only used for QR ticket PNG export
 * and small JSON exports. Never used for anything security-sensitive.
 */

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, filename);
}

/**
 * Render an HTML element (e.g. a ticket card) to a PNG data URL.
 * Uses html-to-image lazily so we don't bloat the initial bundle.
 */
export async function elementToPngDataUrl(element, options = {}) {
  if (!element) throw new Error("No element provided");
  const { toPng } = await import("html-to-image");
  return toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: options.backgroundColor ?? "#0b0b10",
    ...options,
  });
}

/** Copy text to clipboard with a graceful fallback. */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}