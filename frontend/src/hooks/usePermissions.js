import { useAuthStore } from "../stores/authStore";
import { ROLES, ROLE_AREAS } from "../constants/roles";

/**
 * UI-level permission checks. These are NOT security — the backend
 * enforces all real permissions. They exist only to shape navigation
 * and hide impossible actions from the current user.
 */
export function usePermissions() {
  const role = useAuthStore((s) => s.role);
  const status = useAuthStore((s) => s.status);

  const canEnterArea = (area) =>
    status === "authenticated" && (ROLE_AREAS[role]?.includes(area) ?? false);

  const can = {
    manageEvents: role === ROLES.ORGANIZER || role === ROLES.SUPER_ADMIN,
    manageScanners: role === ROLES.ORGANIZER || role === ROLES.SUPER_ADMIN,
    viewOrganizerAnalytics:
      role === ROLES.ORGANIZER || role === ROLES.SUPER_ADMIN,
    scanEvents: role === ROLES.SCANNER || role === ROLES.SUPER_ADMIN,
    moderate: role === ROLES.SUPER_ADMIN,
    viewAdmin: role === ROLES.SUPER_ADMIN,
    purchase: true, // guests can start purchase; auth required at confirmation
    viewOwnTickets: status === "authenticated",
  };

  return { role, status, canEnterArea, can };
}

export default usePermissions;