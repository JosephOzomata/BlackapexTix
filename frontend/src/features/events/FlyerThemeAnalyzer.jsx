import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, Palette, RotateCcw } from "lucide-react";
import { Button } from "../../components/common/Button";
import { cn } from "../../utils/cn";
import { useEventPalette } from "../../hooks/useEventPalette";

const SWATCH_KEYS = ["primary", "secondary", "accent"];

/**
 * Flyer → theme analyser. Runs the palette engine on an image source
 * and reports the resolved theme upward. Shows live swatches and manual
 * overrides.
 */
export function FlyerThemeAnalyzer({
  imageSource,
  initialTheme,
  onChange,
  mediaId = null,
  className,
}) {
  const {
    theme,
    palette,
    status,
    error,
    hasManualOverrides,
    analyse,
    override,
    regenerate,
    reset,
  } = useEventPalette(initialTheme);

  const lastSourceRef = useRef(null);

  useEffect(() => {
    if (!imageSource) return;
    if (lastSourceRef.current === imageSource) return;
    lastSourceRef.current = imageSource;
    analyse(imageSource, { mediaId });
  }, [imageSource, mediaId, analyse]);

  useEffect(() => {
    onChange?.(theme);
  }, [theme, onChange]);

  const analyzing = status === "analyzing";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {analyzing
                ? "Analyzing flyer…"
                : status === "ready"
                ? "Event theme generated"
                : status === "error"
                ? "Using default theme"
                : "Theme preview"}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasManualOverrides
                ? "Manual overrides active"
                : palette?.quality === "fallback"
                ? "Fallback palette"
                : "Auto-extracted from your primary flyer"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={() => regenerate()}
            disabled={!palette || analyzing}
          >
            Regenerate
          </Button>
          {hasManualOverrides && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw size={14} />}
              onClick={reset}
            >
              Reset to auto
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 gap-3"
        >
          {SWATCH_KEYS.map((key) => (
            <SwatchEditor
              key={key}
              label={key}
              value={theme[key]}
              onManual={(v) => override({ [key]: v })}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Live preview strip */}
      <div
        className="rounded-xl overflow-hidden border border-[var(--event-border)]"
        style={{
          "--event-primary": theme.primary,
          "--event-secondary": theme.secondary,
          "--event-accent": theme.accent,
          "--event-background": theme.background,
          "--event-surface": theme.surface,
          "--event-surface-elevated": theme.surfaceElevated,
          "--event-foreground": theme.foreground,
          "--event-muted": theme.muted,
          "--event-border": theme.border,
          "--event-glow": theme.glow,
        }}
      >
        <div className="bg-[var(--event-background)] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--event-primary)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--event-secondary)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--event-accent)]" />
            <span className="text-xs text-[var(--event-muted)] ml-2">live preview</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[var(--event-primary)] text-[var(--event-primary-foreground)]"
            >
              Primary
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[var(--event-secondary)] text-[var(--event-secondary-foreground)]"
            >
              Secondary
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-[var(--event-accent)] text-[var(--event-accent-foreground)]"
            >
              Accent
            </button>
          </div>
          <div className="rounded-lg bg-[var(--event-surface)] border border-[var(--event-border)] p-3">
            <p className="text-sm text-[var(--event-foreground)] font-semibold">
              Card surface
            </p>
            <p className="text-xs text-[var(--event-muted)]">
              Muted text sits on the surface cleanly.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-danger">
          Palette extraction failed — using a safe fallback theme.
        </p>
      )}
    </div>
  );
}

function SwatchEditor({ label, value, onManual }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
        <span
          className="h-6 w-6 rounded-md border border-black/20 shrink-0"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onManual(e.target.value)}
          className="w-full bg-transparent text-xs font-mono text-foreground focus:outline-none"
        />
        <input
          type="color"
          value={value ?? "#000000"}
          onChange={(e) => onManual(e.target.value)}
          aria-label={`${label} color picker`}
          className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent p-0"
        />
      </div>
    </label>
  );
}

export default FlyerThemeAnalyzer;