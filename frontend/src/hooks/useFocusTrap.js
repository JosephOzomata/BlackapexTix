import { useCallback, useEffect, useRef, useState } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null
  );
}

/**
 * Core trap logic shared by every variant below.
 * Handles Tab / Shift+Tab cycling, Escape callback, and focus restoration.
 */
function useTrapCore(ref, { active = true, onEscape } = {}) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    const previouslyFocused = document.activeElement;

    const items = getFocusable(container);
    items[0]?.focus?.();

    const onKey = (e) => {
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }
      if (e.key !== "Tab") return;
      const list = getFocusable(container);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [active, onEscape, ref]);
}

/**
 * Hook returning a ref object. Recommended API.
 *
 *   const ref = useTrap({ active: true, onEscape: close });
 *   <div ref={ref}>...</div>
 */
export function useTrap({ active = true, onEscape } = {}) {
  const ref = useRef(null);
  useTrapCore(ref, { active, onEscape });
  return ref;
}

/**
 * Same as useTrap but with a stable alias name for older call sites.
 * Kept for compatibility.
 */
export const useFocusTrapRef = useTrap;

/**
 * Callback-ref variant.
 *
 *   const setNode = useFocusTrap(true, close);
 *   <div ref={setNode}>...</div>
 *
 * The returned function is stable across renders.
 */
export function useFocusTrap(active = true, onEscape = null) {
  const [node, setNode] = useState(null);
  const ref = useRef(null);

  // Keep a live ref in sync with the current node.
  ref.current = node;

  // Reuse the same core logic against our internal ref.
  useTrapCore(ref, { active, onEscape });

  return useCallback((n) => setNode(n), []);
}

export default useTrap;