import { Search, X } from "lucide-react";
import { cn } from "../../utils/cn";

export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Search…",
  className,
  autoFocus,
  disabled,
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className={cn("relative", className)}
    >
      <Search
        size={18}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={placeholder}
        className={cn(
          "w-full h-11 pl-11 pr-10 rounded-full border border-border bg-card text-sm text-foreground placeholder:text-subtle",
          "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
          "disabled:opacity-50"
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}

export default SearchInput;