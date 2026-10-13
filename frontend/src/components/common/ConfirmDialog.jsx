import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

/**
 * Standard confirmation dialog. Never use window.confirm.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger", // "danger" | "primary" | "warning" | "success"
  loading = false,
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;
  const toneClass = {
    danger: "text-danger bg-danger/10",
    warning: "text-warning bg-warning/10",
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
  }[tone];

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      title={null}
      description={null}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start pb-2">
        <span className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", toneClass)}>
          <Icon size={20} />
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 text-pretty">{description}</p>
          )}
        </div>
      </div>
    </Dialog>
  );
}

export default ConfirmDialog;