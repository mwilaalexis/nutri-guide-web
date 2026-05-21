import api from "./api";
import { parseNotificationInboxResponse } from "../utils/notificationNormalize";

export type SendNotificationEmailBody = {
  to: string;
  subject: string;
  htmlBody: string;
};

export type InAppNotificationDto = {
  id: string;
  recipientEmail: string;
  subject: string;
  bodyPreview: string;
  channel: string;
  createdAtUtc: string;
  isRead: boolean;
};

export type NotificationInboxResponse = {
  items: InAppNotificationDto[];
  scope: "mine" | "all";
  recipientEmail?: string;
};

export const NotificationService = {
  /** Sends a fixed test message; uses JWT email unless `to` is set. */
  selfTest: (to?: string) =>
    api.post<{ sent: boolean; to: string }>("/api/notifications/self-test", undefined, {
      params: to?.trim() ? { to: to.trim() } : {},
    }),

  /** Admin or Moderator only — sends arbitrary HTML email. */
  sendEmail: (body: SendNotificationEmailBody) =>
    api.post<{ sent: boolean }>("/api/notifications/email", body),

  /** In-app history for the signed-in user (JWT email). */
  getInbox: async (opts?: { unreadOnly?: boolean; all?: boolean }) => {
    const res = await api.get("/api/notifications/inbox", {
      params: {
        unreadOnly: opts?.unreadOnly ? true : undefined,
        all: opts?.all ? true : undefined,
      },
    });
    return { ...res, data: parseNotificationInboxResponse(res.data) };
  },

  markRead: (id: string) =>
    api.put<{ read: boolean }>(`/api/notifications/inbox/${id}/read`),

  markAllRead: async () => {
    const res = await api.put("/api/notifications/inbox/read-all");
    const o = (res.data ?? {}) as Record<string, unknown>;
    const marked = Number(o.marked ?? o.Marked ?? 0);
    return { ...res, data: { marked: Number.isFinite(marked) ? marked : 0 } };
  },
};
