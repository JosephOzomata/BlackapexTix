import { useState, useCallback } from "react";
import { extractEventPalette } from "../utils/theme/extractEventPalette";
import { generateEventTheme, regenerateTheme, validateEventTheme } from "../utils/theme/generateEventTheme";
import { DEFAULT_EVENT_THEME } from "../utils/theme/generateEventTheme";

/**
 * Hook that runs the flyer → palette → theme pipeline for a given image.
 * Used by:
 *   - the event creation wizard (Step 3 Media / Step 4 Theme)
 *   - the event detail page (loads the stored theme, then applies it)
 *
 * This is intentionally side-effect free — it never touches the DOM.
 * applyTheme() is called by the component that owns the wrapper element.
 */
export function useEventPalette(initialTheme = null) {
  const [theme, setThemeState] = useState(initialTheme ?? DEFAULT_EVENT_THEME);
  const [palette, setPalette] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | analyzing | ready | error
  const [error, setError] = useState(null);
  const [manualOverrides, setManualOverrides] = useState({});

  const analyse = useCallback(
    async (imageSource, opts = {}) => {
      if (!imageSource) return null;
      setStatus("analyzing");
      setError(null);
      try {
        const result = await extractEventPalette(imageSource, opts);
        setPalette(result);
        const next = generateEventTheme(result, {
          generatedFromMediaId: opts.mediaId ?? null,
        });
        setThemeState(next);
        setManualOverrides({});
        setStatus("ready");
        return { palette: result, theme: next };
      } catch (e) {
        setError(e?.message ?? "PALETTE_FAILED");
        setStatus("error");
        // graceful fallback — never leave the UI themeless
        setThemeState(DEFAULT_EVENT_THEME);
        return null;
      }
    },
    []
  );

  const override = useCallback(
    (partial) => {
      const merged = { ...manualOverrides, ...partial };
      setManualOverrides(merged);
      const next = palette
        ? regenerateTheme(palette, merged)
        : { ...theme, ...partial, source: "manual" };
      if (validateEventTheme(next)) setThemeState(next);
      return next;
    },
    [manualOverrides, palette, theme]
  );

  const regenerate = useCallback(
    (opts = {}) => {
      if (!palette) return null;
      const next = generateEventTheme(palette, opts);
      setManualOverrides({});
      setThemeState(next);
      return next;
    },
    [palette]
  );

  const reset = useCallback(() => {
    setThemeState(DEFAULT_EVENT_THEME);
    setManualOverrides({});
  }, []);

  return {
    theme,
    palette,
    status,
    error,
    manualOverrides,
    hasManualOverrides: Object.keys(manualOverrides).length > 0,
    analyse,
    override,
    regenerate,
    reset,
    setTheme: (t) => validateEventTheme(t) && setThemeState(t),
  };
}

export default useEventPalette;