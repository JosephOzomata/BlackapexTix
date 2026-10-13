import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IconButton } from "./IconButton";
import { copyToClipboard } from "../../utils/download";
import { useToast } from "../../hooks/useToast";

export function CopyButton({ value, label = "Copy", size = "icon-sm", variant = "ghost" }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const onCopy = async () => {
    const ok = await copyToClipboard(String(value ?? ""));
    if (ok) {
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error("Could not copy");
    }
  };

  return (
    <IconButton label={label} size={size} variant={variant} onClick={onCopy}>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="text-success"
          >
            <Check size={14} />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            <Copy size={14} />
          </motion.span>
        )}
      </AnimatePresence>
    </IconButton>
  );
}

export default CopyButton;