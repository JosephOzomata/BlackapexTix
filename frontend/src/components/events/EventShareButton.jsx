import { Share2, Link2, Twitter, Facebook, MessageCircle } from "lucide-react";
import { Button } from "../common/Button";
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from "../common/Dropdown";
import { useToast } from "../../hooks/useToast";
import { copyToClipboard } from "../../utils/download";
import { APP } from "../../constants/config";

export function EventShareButton({ event, variant = "outline", size = "md" }) {
  const toast = useToast();
  const url = `${APP.url}/events/${event?.slug ?? ""}`;
  const text = `Check out ${event?.title ?? "this event"}`;

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, text, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    const ok = await copyToClipboard(url);
    ok ? toast.success("Link copied") : toast.error("Could not share");
  };

  const copyLink = async () => {
    const ok = await copyToClipboard(url);
    ok ? toast.success("Link copied") : toast.error("Could not copy link");
  };

  return (
    <Dropdown
      trigger={
        <Button
          variant={variant}
          size={size}
          leftIcon={<Share2 size={16} />}
          onClick={navigator.share ? nativeShare : undefined}
        >
          Share
        </Button>
      }
    >
      <DropdownLabel>Share this event</DropdownLabel>
      <DropdownItem icon={<Link2 size={14} />} onClick={copyLink}>
        Copy link
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem
        as="a"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        icon={<Twitter size={14} />}
      >
        Share on Twitter
      </DropdownItem>
      <DropdownItem
        as="a"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        icon={<Facebook size={14} />}
      >
        Share on Facebook
      </DropdownItem>
      <DropdownItem
        as="a"
        href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        icon={<MessageCircle size={14} />}
      >
        Share on WhatsApp
      </DropdownItem>
    </Dropdown>
  );
}

export default EventShareButton;