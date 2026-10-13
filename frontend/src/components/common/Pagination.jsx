import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "./IconButton";
import { cn } from "../../utils/cn";

function pagesFor(current, total, max = 5) {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = start + max - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - max + 1);
  }
  const list = [];
  for (let i = start; i <= end; i++) list.push(i);
  return list;
}

export function Pagination({ page = 1, totalPages = 1, onChange, className }) {
  if (totalPages <= 1) return null;
  const pages = pagesFor(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <IconButton
        label="Previous page"
        size="icon-sm"
        variant="ghost"
        disabled={page <= 1}
        onClick={() => onChange?.(page - 1)}
      >
        <ChevronLeft size={16} />
      </IconButton>
      {pages[0] > 1 && (
        <>
          <PageBtn active={page === 1} onClick={() => onChange?.(1)}>1</PageBtn>
          {pages[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}
      {pages.map((p) => (
        <PageBtn key={p} active={page === p} onClick={() => onChange?.(p)}>
          {p}
        </PageBtn>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <PageBtn
            active={page === totalPages}
            onClick={() => onChange?.(totalPages)}
          >
            {totalPages}
          </PageBtn>
        </>
      )}
      <IconButton
        label="Next page"
        size="icon-sm"
        variant="ghost"
        disabled={page >= totalPages}
        onClick={() => onChange?.(page + 1)}
      >
        <ChevronRight size={16} />
      </IconButton>
    </nav>
  );
}

function PageBtn({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "h-8 min-w-8 px-2.5 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-card"
      )}
    >
      {children}
    </button>
  );
}

export default Pagination;