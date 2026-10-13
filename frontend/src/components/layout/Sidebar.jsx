import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { useUIStore } from "../../stores/uiStore";
import { IconButton } from "../common/IconButton";

export default function Sidebar({ items = [], footer = null, brand = null }) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card/40 transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {brand && <div className="h-16 flex items-center px-4 border-b border-border">{brand}</div>}

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Sidebar">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-card",
                collapsed && "justify-center px-2"
              )
            }
            title={collapsed ? it.label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebarActiveIndicator"
                    className="absolute inset-y-1 -left-2 w-1 rounded-r-full bg-primary"
                  />
                )}
                <span className="shrink-0" aria-hidden>{it.icon}</span>
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {it.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && it.badge != null && (
                  <span className="ml-auto text-[10px] font-bold text-primary bg-primary/15 rounded-full px-1.5 py-0.5">
                    {it.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {footer}

      <div className="border-t border-border p-2 flex justify-end">
        <IconButton
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </IconButton>
      </div>
    </aside>
  );
}