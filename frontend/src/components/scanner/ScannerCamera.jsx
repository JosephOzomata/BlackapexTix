import { useEffect, useRef, useState } from "react";
import { Loader2, Camera, CameraOff, Zap, ZapOff, RotateCw } from "lucide-react";
import { Button } from "../common/Button";
import { cn } from "../../utils/cn";

/**
 * Browser camera QR scanner.
 * Uses html5-qrcode lazily so the initial bundle stays small.
 * Falls back gracefully when camera permission is denied.
 */
export function ScannerCamera({ onResult, paused = false, className }) {
  const [state, setState] = useState("idle"); // idle | starting | ready | error
  const [error, setError] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [facing, setFacing] = useState("environment");
  const containerId = useRef(`scanner-${Math.random().toString(36).slice(2)}`);
  const scannerRef = useRef(null);

  const start = async () => {
    setState("starting");
    setError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(containerId.current);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: facing },
        {
          fps: 12,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1,
        },
        (decodedText) => {
          onResult?.(decodedText);
        },
        () => {}
      );

      // Torch support probe
      try {
        const caps = scanner.getRunningTrackCameraCapabilities();
        setTorchAvailable(Boolean(caps?.torchFeature?.isSupported?.()));
      } catch {
        setTorchAvailable(false);
      }

      setState("ready");
    } catch (e) {
      const msg = String(e?.message ?? e);
      setError(
        /permission/i.test(msg)
          ? "Camera permission was denied. Enable it in your browser settings to scan."
          : /not found|no camera/i.test(msg)
          ? "No camera detected on this device."
          : "Unable to start the camera."
      );
      setState("error");
    }
  };

  const stop = async () => {
    try {
      await scannerRef.current?.stop?.();
      scannerRef.current?.clear?.();
    } catch {
      /* ignore */
    }
    scannerRef.current = null;
    setState("idle");
  };

  useEffect(() => {
    if (paused) {
      stop();
    } else {
      start();
    }
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, facing]);

  const toggleTorch = async () => {
    try {
      const caps = scannerRef.current?.getRunningTrackCameraCapabilities?.();
      if (caps?.torchFeature?.isSupported?.()) {
        await caps.torchFeature.apply(!torchOn);
        setTorchOn((v) => !v);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={cn("relative rounded-2xl overflow-hidden bg-black aspect-square", className)}>
      <div id={containerId.current} className="absolute inset-0" />

      {/* Overlay frame */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative w-[70%] max-w-[280px] aspect-square">
          <span className="absolute inset-0 rounded-2xl border-2 border-white/30" />
          <span className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
          <span className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
          <span className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
          <span className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
          {state === "ready" && (
            <span className="absolute inset-x-0 top-0 h-0.5 bg-white/90 animate-[scan-line_2.2s_ease-in-out_infinite]" />
          )}
        </div>
      </div>

      {/* Status */}
      {state === "starting" && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Starting camera…</p>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
          <CameraOff size={32} className="text-white/70 mb-3" />
          <p className="text-sm text-white/90 max-w-xs">{error}</p>
          <Button size="sm" className="mt-4" onClick={start}>
            Try again
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        {torchAvailable && (
          <button
            type="button"
            onClick={toggleTorch}
            aria-label={torchOn ? "Turn off torch" : "Turn on torch"}
            className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center"
          >
            {torchOn ? <ZapOff size={16} /> : <Zap size={16} />}
          </button>
        )}
        <button
          type="button"
          onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
          aria-label="Switch camera"
          className="ml-auto h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center"
        >
          <RotateCw size={16} />
        </button>
      </div>
    </div>
  );
}

export default ScannerCamera;