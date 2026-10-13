import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const SIZES = { sm: 14, md: 18, lg: 24, xl: 32 };

export function Spinner({ size = "md", className, label = "Loading" }) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex", className)}>
      <Loader2 size={SIZES[size]} className="animate-spin text-current" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default Spinner;