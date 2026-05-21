import { Navigate, Outlet, useLocation } from "react-router-dom";
import AuthService from "../../services/auth.service";

/** Requires a usable session (valid access token or refresh token for silent renew). */
export default function ProtectedRoute() {
  const location = useLocation();

  if (!AuthService.isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
