import { Navigate } from "react-router-dom";

/** Legacy route: redirects to the notifications inbox. */
export default function NotificationsRedirect() {
  return <Navigate to="/dashboard/notifications/inbox" replace />;
}
