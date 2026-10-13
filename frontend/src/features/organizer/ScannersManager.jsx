import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, X, Ban, CheckCircle2, Clock } from "lucide-react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Dialog } from "../../components/common/Dialog";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { organizersService } from "../../services/organizers.service";
import { useToast } from "../../hooks/useToast";
import { formatRelative } from "../../utils/dates";
import { queryKeys } from "../../queryClient";
import { cn } from "../../utils/cn";
import { ScanLine } from "lucide-react";

const STATUS_TONE = {
  INVITED: "warning",
  ACTIVE: "success",
  DISABLED: "neutral",
  REVOKED: "danger",
};

const STATUS_LABEL = {
  INVITED: "Pending invitation",
  ACTIVE: "Active",
  DISABLED: "Disabled",
  REVOKED: "Revoked",
};

export function ScannersManager({ organizerId, eventId }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.organizer.scanners(eventId),
    queryFn: () => organizersService.getEventScanners(organizerId, eventId),
    enabled: Boolean(organizerId && eventId),
  });

  const items = data?.data?.items ?? [];

  const invite = useMutation({
    mutationFn: () =>
      organizersService.inviteScanner(organizerId, eventId, { email, name }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Scanner invited");
        setInviteOpen(false);
        setEmail("");
        setName("");
        queryClient.invalidateQueries({ queryKey: queryKeys.organizer.scanners(eventId) });
      } else {
        toast.error(res.message ?? "Could not invite scanner");
      }
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ scannerId, status }) =>
      organizersService.updateScannerStatus(organizerId, eventId, scannerId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.scanners(eventId) });
      toast.success("Scanner updated");
    },
  });

  const remove = useMutation({
    mutationFn: (scannerId) =>
      organizersService.removeScanner(organizerId, eventId, scannerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.scanners(eventId) });
      toast.success("Scanner removed");
      setConfirmRemove(null);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Scanners</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Scanner access is event-specific. Adding someone here does not give
            them access to your other events.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<UserPlus size={14} />}
          onClick={() => setInviteOpen(true)}
        >
          Invite scanner
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ScanLine size={26} />}
          title="No scanners yet"
          description="Invite a trusted team member to scan tickets at the door."
          action={
            <Button onClick={() => setInviteOpen(true)} leftIcon={<UserPlus size={14} />}>
              Invite your first scanner
            </Button>
          }
          size="sm"
        />
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((s) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
              >
                <Avatar name={s.scannerName} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">
                      {s.scannerName}
                    </span>
                    <Badge tone={STATUS_TONE[s.status]} size="sm">
                      {STATUS_LABEL[s.status]}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {s.scannerEmail}
                  </div>
                  <div className="text-[11px] text-subtle mt-1">
                    {s.checkInsCount > 0
                      ? `${s.checkInsCount} check-ins · last active ${formatRelative(s.lastActiveAt)}`
                      : "No check-ins yet"}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {s.status === "INVITED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateStatus.mutate({ scannerId: s.id, status: "ACTIVE" })
                      }
                      leftIcon={<CheckCircle2 size={12} />}
                    >
                      Activate
                    </Button>
                  )}
                  {s.status === "ACTIVE" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        updateStatus.mutate({ scannerId: s.id, status: "DISABLED" })
                      }
                      aria-label="Disable scanner"
                    >
                      <Ban size={14} />
                    </Button>
                  )}
                  {s.status === "DISABLED" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        updateStatus.mutate({ scannerId: s.id, status: "ACTIVE" })
                      }
                      aria-label="Reactivate scanner"
                    >
                      <CheckCircle2 size={14} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-danger"
                    onClick={() => setConfirmRemove(s)}
                    aria-label="Remove scanner"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a scanner"
        description="They'll only get scanner access for this event."
        footer={
          <>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => invite.mutate()}
              loading={invite.isPending}
              disabled={!email}
            >
              Send invitation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="scanner@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={14} />}
            required
          />
          <Input
            label="Name (optional)"
            placeholder="e.g. Kelechi Nnamdi"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => remove.mutate(confirmRemove.id)}
        title="Remove this scanner?"
        description={`${confirmRemove?.scannerName} will immediately lose access to scan this event.`}
        confirmLabel="Remove"
        loading={remove.isPending}
      />
    </div>
  );
}

export default ScannersManager;