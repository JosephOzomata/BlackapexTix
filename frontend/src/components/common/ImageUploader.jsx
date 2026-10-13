import { FileUploader, MediaPreviewTile } from "./FileUploader";

/**
 * Image-specific wrapper around FileUploader, with preview grid.
 * Used by the event wizard, organizer profile, and avatars.
 */
export function ImageUploader({
  files = [],
  onFiles,
  onRemove,
  onSetPrimary,
  onReorder,
  multiple = true,
  maxFiles = 8,
  className,
  disabled,
}) {
  const handleDrop = (index) => (e) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(from) || from === index || !onReorder) return;
    const next = [...files];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    onReorder(next);
  };

  return (
    <div className={className}>
      <FileUploader
        onFiles={onFiles}
        multiple={multiple}
        maxFiles={maxFiles}
        existingCount={files.length}
        disabled={disabled}
      />

      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
          {files.map((f, i) => (
            <MediaPreviewTile
              key={f.id ?? f.previewUrl ?? i}
              src={f.previewUrl ?? f.url}
              label={f.fileName}
              isPrimary={f.isPrimary}
              onRemove={() => onRemove?.(f, i)}
              onSetPrimary={() => onSetPrimary?.(f, i)}
              draggable={Boolean(onReorder)}
              onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;