import { useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";
import { Button } from "../common/Button";
import { useToast } from "../../hooks/useToast";
import { elementToPngDataUrl, downloadDataUrl } from "../../utils/download";
import { ticketsService } from "../../services/tickets.service";

/**
 * Client-side PNG export of a ticket card. The real backend also
 * emails the ticket; the frontend never sends email itself.
 */
export function DownloadTicketButton({ ticket, targetRef, variant = "primary", size = "md" }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const handle = async () => {
    const el = targetRef?.current;
    if (!el) return;
    setBusy(true);
    try {
      const dataUrl = await elementToPngDataUrl(el, {
        backgroundColor: "#0b0b10",
        pixelRatio: 2,
      });
      const safe = (ticket?.reference ?? ticket?.id ?? "ticket").replace(/[^\w-]/g, "");
      downloadDataUrl(dataUrl, `${safe}.png`);
      ticketsService.markDownloaded?.(ticket?.id).catch(() => {});
      toast.success("Ticket downloaded");
    } catch {
      toast.error("Could not generate the image. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      loading={busy}
      onClick={handle}
      leftIcon={<Download size={16} />}
    >
      Download ticket
    </Button>
  );
}

export function ShareTicketButton({ ticket }) {
  const toast = useToast();
  const handle = async () => {
    const text = `${ticket?.event?.title ?? "My ticket"} — ${ticket?.reference ?? ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        /* cancelled */
      }
    }
    toast.info("Sharing isn't available on this device.");
  };
  return (
    <Button variant="outline" onClick={handle} leftIcon={<Share2 size={16} />}>
      Share
    </Button>
  );
}

export default DownloadTicketButton;