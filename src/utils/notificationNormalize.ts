import { asArray } from "./normalize";
import type { InAppNotificationDto, NotificationInboxResponse } from "../services/notification.service";

function pickStr(o: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function pickBool(o: Record<string, unknown>, ...keys: string[]): boolean {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "boolean") return v;
  }
  return false;
}

export function normalizeInAppNotification(raw: unknown): InAppNotificationDto | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = pickStr(o, "id", "Id");
  if (!id) return null;

  return {
    id,
    recipientEmail: pickStr(o, "recipientEmail", "RecipientEmail"),
    subject: pickStr(o, "subject", "Subject"),
    bodyPreview: pickStr(o, "bodyPreview", "BodyPreview"),
    channel: pickStr(o, "channel", "Channel") || "email",
    createdAtUtc: pickStr(o, "createdAtUtc", "CreatedAtUtc"),
    isRead: pickBool(o, "isRead", "IsRead"),
  };
}

export function parseNotificationInboxResponse(raw: unknown): NotificationInboxResponse {
  if (!raw || typeof raw !== "object") {
    return { items: [], scope: "mine" };
  }

  const o = raw as Record<string, unknown>;
  const listRaw = asArray<unknown>(o.items ?? o.Items ?? raw);
  const items = listRaw
    .map(normalizeInAppNotification)
    .filter((n): n is InAppNotificationDto => n !== null);

  const scopeRaw = o.scope ?? o.Scope;
  const scope = scopeRaw === "all" ? "all" : "mine";
  const recipientEmail = pickStr(o, "recipientEmail", "RecipientEmail") || undefined;

  return { items, scope, recipientEmail };
}
