import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { cn } from "../../utils/cn";
import { UPLOADS } from "../../constants/config";

const validateFile = (file) => {
  if (!UPLOADS.acceptedImageTypes.includes(file.type)) {
    return "Only JPG, PNG, WEBP, and AVIF images are supported.";
  }
  if (file.size > UPLOADS.maxFileSizeMb * 1024 * 1024) {
    return `Maximum file size is ${UPLOADS.maxFileSizeMb}MB.`;
  }
  return null;
};

export function FileUploader({
  onFiles,
  multiple = false,
  maxFiles = UPLOADS.maxFlyers,
  existingCount = 0,
  className,
  accept = UPLOADS.acceptedImageTypes.join(","),
  disabled = false,
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (files) => {
      setError(null);
      const arr = Array.from(files ?? []);
      if (!arr.length) return;
      const filtered = [];
      for (const file of arr) {
        const err = validateFile(file);
        if (err) {
          setError(err);
          return;
        }
        filtered.push(file);
      }
      const remaining = Math.max(0, maxFiles - existingCount);
      const capped = multiple ? filtered.slice(0, remaining) : [filtered[0]];
      if (!capped.length) {
        setError(`You've reached the maximum of ${maxFiles} files.`);
        return;
      }
      onFiles?.(capped);
    },
    [existingCount, maxFiles, multiple, onFiles]
  );

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-6 sm:p-8 transition-colors text-center",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-border-strong bg-card/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
        <motion.div
          animate={dragging ? { scale: 1.02 } : { scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="h-12 w-12 rounded-full bg-card-elevated flex items-center justify-center text-primary">
            <Upload size={20} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              {dragging ? "Drop files here" : "Drag & drop your files"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or{" "}
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="text-primary underline-offset-4 hover:underline font-medium"
              >
                browse from your device
              </button>
            </p>
          </div>
          <p className="text-[11px] text-subtle">
            JPG, PNG, WEBP, AVIF · Max {UPLOADS.maxFileSizeMb}MB
            {multiple && ` · Up to ${maxFiles} files`}
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            role="alert"
            className="mt-2 text-xs text-danger flex items-center gap-1.5"
          >
            <X size={12} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MediaPreviewTile({
  src,
  label,
  isPrimary,
  onRemove,
  onSetPrimary,
  onDragStart,
  onDragOver,
  onDrop,
  draggable,
}) {
  return (
    <motion.div
      layout
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-card"
    >
      {src ? (
        <img src={src} alt={label ?? "Flyer"} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          <ImageIcon size={28} />
        </div>
      )}

      {isPrimary && (
        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary text-white px-2 py-0.5">
          Primary
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex gap-1.5 justify-end">
        {!isPrimary && onSetPrimary && (
          <Button
            size="sm"
            variant="subtle"
            className="h-7 text-xs"
            onClick={onSetPrimary}
          >
            Set primary
          </Button>
        )}
        {onRemove && (
          <Button
            size="icon-sm"
            variant="danger"
            onClick={onRemove}
            aria-label="Remove file"
          >
            <X size={14} />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default FileUploader;