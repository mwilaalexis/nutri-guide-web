import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import { NotificationService } from "../services/notification.service";
import { useNotificationInbox } from "../hooks/useNotificationInbox";
import { httpErrorMessage } from "../utils/httpErrorMessage";
import { useToast } from "../components/ui/ToastProvider";

type Filter = "all" | "unread";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationInbox() {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const jwtEmail = AuthService.getCurrentUserEmail();
  const canViewAll = useMemo(() => {
    const r = AuthService.getCurrentUserRole()?.toLowerCase() ?? "";
    return r === "admin" || r === "moderator";
  }, []);

  const [filter, setFilter] = useState<Filter>("all");
  const [viewAllUsers, setViewAllUsers] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { items, scope, loading, error, unreadCount, load, setItems } = useNotificationInbox({
    unreadOnly: filter === "unread",
    all: viewAllUsers && canViewAll,
  });

  const justSent = (location.state as { justSent?: boolean } | null)?.justSent;

  useEffect(() => {
    if (!justSent) return;
    void load();
    navigate("/dashboard/notifications/inbox", { replace: true, state: {} });
  }, [justSent, load, navigate]);

  const markRead = async (id: string) => {
    setBusyId(id);
    try {
      await NotificationService.markRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      toast.success("Marked as read.");
    } catch (e) {
      toast.error(httpErrorMessage(e, "Could not update notification."));
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    if (viewAllUsers) {
      toast.error("Mark all is only available for your own inbox.");
      return;
    }
    try {
      const { data } = await NotificationService.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(data.marked > 0 ? `${data.marked} marked as read.` : "Nothing to mark.");
      if (filter === "unread") void load();
    } catch (e) {
      toast.error(httpErrorMessage(e, "Could not mark all as read."));
    }
  };

  return (
    <div className="notifications-hub__panel notifications-inbox">
      {justSent && (
        <p className="app-status app-status--ok" role="status">
          Message sent — it appears in the list below.
        </p>
      )}

      {!jwtEmail && (
        <p className="app-status app-status--warn" role="status">
          Your session token has no email claim. Notifications are matched by email — use Send → override recipient or
          sign in again.
        </p>
      )}

      {error && (
        <p className="app-status app-status--err" role="alert">
          {error}
        </p>
      )}

      <div className="notifications-inbox__toolbar">
        <div className="notifications-inbox__filters" role="group" aria-label="Filter">
          <button
            type="button"
            className={`notifications-inbox__filter${filter === "all" ? " notifications-inbox__filter--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`notifications-inbox__filter${filter === "unread" ? " notifications-inbox__filter--active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        </div>

        <div className="notifications-inbox__actions">
          {canViewAll && (
            <button
              type="button"
              className={`btn btn-sm ${viewAllUsers ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setViewAllUsers((v) => !v)}
            >
              {viewAllUsers ? "My inbox" : "All users (staff)"}
            </button>
          )}
          <button type="button" className="btn btn-sm btn-secondary" disabled={loading} onClick={() => void load()}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          {!viewAllUsers && (
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => void markAllRead()}>
              Mark all read
            </button>
          )}
          <Link to="/dashboard/notifications/send" className="btn btn-sm btn-primary">
            Send email
          </Link>
        </div>
      </div>

      <section className="app-panel" aria-label="Notification list">
        <p className="food-page__table-meta m-0" aria-live="polite">
          {loading
            ? "Loading…"
            : scope === "all"
              ? `${items.length} notification${items.length === 1 ? "" : "s"} (all users)`
              : `${items.length} notification${items.length === 1 ? "" : "s"}${jwtEmail ? ` · ${jwtEmail}` : ""}`}
        </p>

        {!loading && items.length === 0 ? (
          <div className="notifications-inbox__empty">
            <p>No notifications yet for this filter.</p>
            <Link to="/dashboard/notifications/send" className="btn btn-primary">
              Send test email
            </Link>
          </div>
        ) : (
          <ul className="notifications-inbox__list">
            {items.map((n) => {
              const open = expandedId === n.id;
              return (
                <li
                  key={n.id}
                  className={`notifications-inbox__item${n.isRead ? "" : " notifications-inbox__item--unread"}`}
                >
                  <button
                    type="button"
                    className="notifications-inbox__item-head"
                    aria-expanded={open}
                    onClick={() => setExpandedId(open ? null : n.id)}
                  >
                    <p className="notifications-inbox__subject">{n.subject}</p>
                    <span className="notifications-inbox__meta">
                      <span>{formatWhen(n.createdAtUtc)}</span>
                      <span className="notifications-inbox__badge notifications-inbox__badge--read">
                        {n.channel}
                      </span>
                      <span
                        className={`notifications-inbox__badge${n.isRead ? " notifications-inbox__badge--read" : ""}`}
                      >
                        {n.isRead ? "Read" : "New"}
                      </span>
                    </span>
                  </button>

                  {open && (
                    <div className="notifications-inbox__body">
                      {scope === "all" && (
                        <p className="notifications-inbox__recipient">To: {n.recipientEmail}</p>
                      )}
                      <p className="notifications-inbox__preview">{n.bodyPreview || "—"}</p>
                      {!n.isRead && !viewAllUsers && (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          disabled={busyId === n.id}
                          onClick={() => void markRead(n.id)}
                        >
                          {busyId === n.id ? "Updating…" : "Mark as read"}
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
