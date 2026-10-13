import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { ROLE_HOME, ROLES, ROLE_AREAS } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import { Spinner } from "../common/Spinner";

/**
 * Route guards. These are UI-LEVEL ONLY. The backend enforces real
 * permissions on every request. These guards simply avoid rendering
 * pages a user obviously cannot use, and route them to sensible
 * fallbacks (never 404-style silent hiding for security).
 */

function FullPageLoader({ label = "Loading" }) {
  return (
    <div className="min-h-[70dvh] flex items-center justify-center">
      <Spinner size="lg" label={label} />
    </div>
  );
}

/** Requires an authenticated user. Redirects to /login with `from`. */
export function RequireAuth() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (status === "loading") return <FullPageLoader label="Checking your session" />;
  if (status !== "authenticated" || !user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Requires one of the given roles. */
export function RequireRole({ roles = [] }) {
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.role);

  if (status === "loading") return <FullPageLoader />;
  if (status !== "authenticated") return <Navigate to={ROUTES.login} replace />;
  if (roles.length && !roles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] ?? ROUTES.home} replace />;
  }
  return <Outlet />;
}

/** Requires organizer access. */
export function RequireOrganizer() {
  return <RequireRole roles={[ROLES.ORGANIZER, ROLES.SUPER_ADMIN]} />;
}

/** Requires scanner access. */
export function RequireScanner() {
  return <RequireRole roles={[ROLES.SCANNER, ROLES.SUPER_ADMIN]} />;
}

/** Requires super admin. */
export function RequireAdmin() {
  return <RequireRole roles={[ROLES.SUPER_ADMIN]} />;
}

/** Requires any customer-area access (any authenticated user). */
export function RequireCustomerArea() {
  return <RequireAuth />;
}

/** Redirects authenticated users away from /login, /register, etc. */
export function RedirectIfAuthed() {
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.role);

  if (status === "authenticated") {
    return <Navigate to={ROLE_HOME[role] ?? ROUTES.home} replace />;
  }
  return <Outlet />;
}

export function canEnter(role, area) {
  return ROLE_AREAS[role]?.includes(area) ?? false;
}