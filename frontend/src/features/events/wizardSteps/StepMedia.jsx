import { useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { ImageUploader } from "../../../components/common/ImageUploader";
import { mediaService } from "../../../services/media.service";
import { useToast } from "../../../hooks/useToast";

export function StepMedia() {
  const { watch, setValue } = useFormContext();
  const media = watch("media") ?? [];
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const revokedRefs = useRef(new Set());

  const onFiles = async (files) => {
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await mediaService.uploadFlyer(file, {
          onProgress: () => {},
        });
        if (res.success) {
          uploaded.push({
            ...res.data,
            isPrimary: media.length === 0 && uploaded.length === 0,
          });
        }
      }
      setValue("media", [...media, ...uploaded], { shouldDirty: true });
      toast.success(`${uploaded.length} flyer${uploaded.length > 1 ? "s" : ""} uploaded`);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onRemove = (f) => {
    const next = media.filter((m) => m.id !== f.id);
    if (f.isPrimary && next.length) next[0].isPrimary = true;
    setValue("media", next, { shouldDirty: true });
    if (f.previewUrl && !revokedRefs.current.has(f.previewUrl)) {
      URL.revokeObjectURL(f.previewUrl);
      revokedRefs.current.add(f.previewUrl);
    }
  };

  const onSetPrimary = (f) => {
    const next = media.map((m) => ({ ...m, isPrimary: m.id === f.id }));
    setValue("media", next, { shouldDirty: true });
  };

  const onReorder = (next) => {
    setValue(
      "media",
      next.map((m, i) => ({ ...m, order: i })),
      { shouldDirty: true }
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Event flyers & media
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          The first image is used as the primary flyer and drives the automatic
          event theme.
        </p>
      </div>

      <ImageUploader
        files={media}
        onFiles={onFiles}
        onRemove={onRemove}
        onSetPrimary={onSetPrimary}
        onReorder={onReorder}
        multiple
        maxFiles={8}
        disabled={uploading}
      />
    </div>
  );
}

export default StepMedia;