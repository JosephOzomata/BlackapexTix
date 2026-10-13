import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs } from "../../components/common/Tabs";
import { ScannerCamera } from "../../components/scanner/ScannerCamera";
import { ScannerResultOverlay } from "../../components/scanner/ScannerResultOverlay";
import { ScannerManualEntry } from "../../components/scanner/ScannerManualEntry";
import { ScannerRecentCheckins } from "../../components/scanner/ScannerRecentCheckins";
import { ScannerNetworkStatus } from "../../components/scanner/ScannerNetworkStatus";
import { scannerService } from "../../services/scanner.service";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useToast } from "../../hooks/useToast";
import { queryKeys } from "../../queryClient";

const DEBOUNCE_MS = 2200;

export function ScannerApp({ eventId }) {
  const [tab, setTab] = useState("camera");
  const [result, setResult] = useState(null);
  const lastScanRef = useRef({ value: null, at: 0 });
  const queryClient = useQueryClient();
  const online = useOnlineStatus();
  const toast = useToast();

  const { data: recentData } = useQuery({
    queryKey: queryKeys.scanner.recentCheckins(eventId),
    queryFn: () => scannerService.getRecentCheckins(eventId, 12),
    enabled: Boolean(eventId),
    refetchInterval: 15_000,
  });

  const redeem = useMutation({
    mutationFn: (payload) => scannerService.redeemToken(eventId, payload),
    onSuccess: (res) => {
      if (res.success) {
        setResult({
          kind: "VALID",
          ticket: res.data.ticket,
          checkedInAt: res.data.checkedInAt,
        });
        vibrate(30);
        beep(true);
        queryClient.invalidateQueries({
          queryKey: queryKeys.scanner.recentCheckins(eventId),
        });
      } else {
        const kindByCode = {
          TICKET_ALREADY_USED: "ALREADY_USED",
          TICKET_WRONG_EVENT: "WRONG_EVENT",
          TICKET_EXPIRED: "EXPIRED",
          TICKET_CANCELLED: "CANCELLED",
          TICKET_PENDING_PAYMENT: "PENDING",
          TICKET_INVALID: "INVALID",
        };
        setResult({
          kind: kindByCode[res.code] ?? "INVALID",
          ticket: res.ticket ?? null,
          message: res.message,
        });
        vibrate([30, 60, 30]);
        beep(false);
      }
    },
    onError: () => {
      setResult({ kind: "INVALID", message: "Network error. Please try again." });
    },
  });

  const handleScan = (token) => {
    if (!online) {
      toast.error("Cannot validate while offline");
      return;
    }
    const now = Date.now();
    if (
      lastScanRef.current.value === token &&
      now - lastScanRef.current.at < DEBOUNCE_MS
    ) {
      return;
    }
    lastScanRef.current = { value: token, at: now };
    redeem.mutate({ token });
  };

  const handleManual = (code) => {
    if (!online) {
      toast.error("Cannot validate while offline");
      return;
    }
    redeem.mutate({ manualCode: code });
  };

  useEffect(() => {
    if (!("vibrate" in navigator)) return;
    return () => navigator.vibrate?.(0);
  }, []);

  const recent = recentData?.data?.items ?? [];

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3">
        <ScannerNetworkStatus />
      </div>

      <div className="px-4">
        <Tabs
          value={tab}
          onChange={setTab}
          variant="pill"
          items={[
            { value: "camera", label: "Camera" },
            { value: "manual", label: "Manual code" },
            { value: "recent", label: "Recent" },
          ]}
        />
      </div>

      <div className="p-4 space-y-4">
        {tab === "camera" && (
          <ScannerCamera onResult={handleScan} paused={!online} />
        )}
        {tab === "manual" && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-4">
              Enter the ticket reference shown under the QR code.
            </p>
            <ScannerManualEntry onSubmit={handleManual} disabled={!online} />
          </div>
        )}
        {tab === "recent" && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <ScannerRecentCheckins items={recent} />
          </div>
        )}
      </div>

      <ScannerResultOverlay
        result={result}
        onDismiss={() => setResult(null)}
      />
    </div>
  );
}

function vibrate(pattern) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}

function beep(success) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = success ? 880 : 220;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close?.(), 400);
  } catch {
    /* ignore — audio may be blocked */
  }
}

export default ScannerApp;