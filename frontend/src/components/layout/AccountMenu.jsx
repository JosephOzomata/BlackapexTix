import { useNavigate } from "react-router-dom";
import {
  User, Ticket, Settings, LogOut, LayoutDashboard, ShieldCheck,
  ScanLine, ChevronDown,
} from "lucide-react";
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from "../common/Dropdown";
import { Avatar } from "../common/Avatar";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../stores/authStore";
import { ROLES, ROLE_LABELS } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../utils/cn";

export default function AccountMenu({ compact = false }) {
  const { user, signOut } = useAuth();
  const role = useAuthStore((s) => s.role);
  const navigate = useNavigate();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.home, { replace: true });
  };

  const roleEntry = (() => {
    switch (role) {
      case ROLES.ORGANIZER:
        return { to: ROUTES.organizer.dashboard, label: "Organizer Dashboard", icon: <LayoutDashboard size={16} /> };
      case ROLES.SCANNER:
        return { to: ROUTES.scanner.home, label: "Scanner Home", icon: <ScanLine size={16} /> };
      case ROLES.SUPER_ADMIN:
        return { to: ROUTES.admin.dashboard, label: "Admin Dashboard", icon: <ShieldCheck size={16} /> };
      default:
        return null;
    }
  })();

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border border-border hover:border-border-strong transition-colors bg-card/60",
            compact && "pr-2"
          )}
          aria-label="Account menu"
        >
          <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
          <span className={cn("text-sm font-medium text-foreground max-w-[120px] truncate", compact && "hidden sm:inline")}>
            {user.fullName?.split(" ")[0] ?? "Account"}
          </span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
      }
    >
      <DropdownLabel>Signed in as</DropdownLabel>
      <div className="px-3 pb-2">
        <div className="text-sm font-medium text-foreground truncate">{user.fullName}</div>
        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-primary font-semibold">
          {ROLE_LABELS[role] ?? role}
        </div>
      </div>
      <DropdownSeparator />

      {roleEntry && (
        <DropdownItem icon={roleEntry.icon} onClick={() => navigate(roleEntry.to)}>
          {roleEntry.label}
        </DropdownItem>
      )}

      <DropdownItem icon={<Ticket size={16} />} onClick={() => navigate(ROUTES.myTickets)}>
        My Tickets
      </DropdownItem>
      <DropdownItem icon={<User size={16} />} onClick={() => navigate(ROUTES.profile)}>
        Profile
      </DropdownItem>
      <DropdownItem icon={<Settings size={16} />} onClick={() => navigate(ROUTES.profile)}>
        Settings
      </DropdownItem>

      <DropdownSeparator />

      <DropdownItem icon={<LogOut size={16} />} danger onClick={handleSignOut}>
        Sign out
      </DropdownItem>
    </Dropdown>
  );
}