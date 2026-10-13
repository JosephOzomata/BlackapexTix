import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

export function ErrorState({
  title = "Something went wrong.",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  retryLabel = "Try again",
  className,
}) {
  return (
    <div className={cn("flex flex-col items-center text-center py-14", className)}>
      <span className="h-14 w-14 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center text-danger mb-4">
        <AlertTriangle size={26} />
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-md text-pretty">
          {description}
        </p>
      )}
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="mt-5"
          leftIcon={<RefreshCcw size={14} />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;