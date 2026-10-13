import { AlertCircle } from "lucide-react";
import { cn } from "../../utils/cn";

export function FormError({ children, className }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger",
        className
      )}
    >
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default FormError;