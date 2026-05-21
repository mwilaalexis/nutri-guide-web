import { NavLink, Outlet } from "react-router-dom";
import { useUnreadNotificationCount } from "../hooks/useNotificationInbox";

export default function NotificationsLayout() {
  const unread = useUnreadNotificationCount();

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `notifications-hub__tab${isActive ? " notifications-hub__tab--active" : ""}`;

  return (
    <div className="notifications-hub">
      <header className="app-page__header notifications-hub__header">
        <p className="app-page__kicker">Messaging</p>
        <h1 className="app-page__title">Notifications</h1>
        <p className="app-page__subtitle m-0">
          Check messages you received or send a test / staff email.
        </p>
      </header>

      <nav className="notifications-hub__tabs" aria-label="Notification sections">
        <NavLink to="/dashboard/notifications/inbox" className={tabClass} end>
          Received
          {unread > 0 ? <span className="notifications-hub__badge">{unread}</span> : null}
        </NavLink>
        <NavLink to="/dashboard/notifications/send" className={tabClass}>
          Send
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
}
