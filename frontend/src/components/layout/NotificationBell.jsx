import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { notificationsService } from "../../services/notifications.service";
import { queryKeys } from "../../queryClient";
import { useAuthStore } from "../../stores/authStore";
import { Dropdown } from "../common/Dropdown";
import { IconButton } from "../common/IconButton";
import { Button } from "../common/Button";
import { formatRelative } from "../../utils/dates";

export default function NotificationBell() {
  const isAuthed = useAuthStore((s) => s.status === "authenticated");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationsService.list(),
    enabled: isAuthed,
    refetchInterval: 60_000,
  });

  const markAll = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  if (!isAuthed) return null;

  const items = data?.data?.items ?? [];
  const unread = data?.data?.unread ?? 0;

  return (
    <Dropdown
      trigger={
        <IconButton
          label="Notifications"
          variant="ghost"
          className="relative"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center px-1">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </IconButton>
      }
      panelClassName="w-[min(92vw,360px)] max-h-[70vh] overflow-y-auto"
    >
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-border">
        <span className="text-sm font-semibold">Notifications</span>
        {unread > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => markAll.mutate()}
            leftIcon={<Check size={14} />}
            className="h-7 text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>
      {isLoading ? (
        <div className="p-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-14 rounded-md" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          You have no notifications.
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {items.slice(0, 8).map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Link
                to={n.link ?? "#"}
                className="block px-3 py-2.5 hover:bg-card/60 border-b border-border/60 last:border-0"
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  )}
                  <div className={n.read ? "opacity-70" : ""}>
                    <div className="text-sm font-medium text-foreground">{n.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {n.message}
                    </div>
                    <div className="text-[10px] text-subtle mt-1">
                      {formatRelative(n.createdAt)}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </Dropdown>
  );
}