import { useEffect, useState } from "react";

/**
 * Browser online/offline state.
 * This is intentionally conservative — a scanner offline is a serious
 * edge case; the UI must not pretend to safely validate tickets while
 * offline. See docs/security-boundaries.md.
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}

export default useOnlineStatus;