import { Wifi, WifiOff } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { cn } from "../../utils/cn";

/**
 * Offline UX. We do NOT pretend to validate tickets offline — the
 * production backend must atomically redeem each token. This banner
 * simply warns door staff that scanning is currently impossible.
 */
export function ScannerNetworkStatus({ className }) {
  const online = useOnlineStatus();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border",
        online
          ? "border-success/30 bg-success/10 text-success"
          : "border-danger/40 bg-danger/10 text-danger",
        className
      )}
    >
      {online ? <Wifi size={12} /> : <WifiOff size={12} />}
      {online ? "Online — ready to scan" : "Connection lost — validation requires internet"}
    </div>
  );
}

export default ScannerNetworkStatus;