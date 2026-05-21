import { useCallback, useEffect, useState } from "react";
import { NotificationService, type InAppNotificationDto } from "../services/notification.service";
import { httpErrorMessage } from "../utils/httpErrorMessage";

type InboxOptions = {
  unreadOnly?: boolean;
  all?: boolean;
  enabled?: boolean;
};

export function useNotificationInbox(opts: InboxOptions = {}) {
  const { unreadOnly = false, all = false, enabled = true } = opts;

  const [items, setItems] = useState<InAppNotificationDto[]>([]);
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await NotificationService.getInbox({ unreadOnly, all });
      setItems(data.items);
      setScope(data.scope);
    } catch (e) {
      setItems([]);
      setError(httpErrorMessage(e, "Unable to load notifications."));
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, all, enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  return { items, scope, loading, error, unreadCount, load, setItems };
}

/** Lightweight poll for nav badges (unread only). */
export function useUnreadNotificationCount(enabled = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    NotificationService.getInbox({ unreadOnly: true })
      .then(({ data }) => {
        if (!cancelled) setCount(data.items.filter((n) => !n.isRead).length);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return count;
}
