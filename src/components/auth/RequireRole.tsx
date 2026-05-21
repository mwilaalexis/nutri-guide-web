import { Navigate } from "react-router-dom";
import AuthService from "../../services/auth.service";

type RequireRoleProps = {
  roles: string[];
  children: React.ReactNode;
};

/**
 * Requires an authenticated user whose role (from login) matches one of `roles`.
 * Server must still enforce authorization; this only blocks casual URL access.
 */
export default function RequireRole({ roles, children }: RequireRoleProps) {
  if (!AuthService.isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const userRole = AuthService.getCurrentUserRole()?.toLowerCase() ?? "";
  const allowed = roles.some((r) => r.toLowerCase() === userRole);

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
