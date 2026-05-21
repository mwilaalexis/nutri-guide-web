import axios from "axios";
import { getConfiguredGatewayUrl } from "./resolveApiBaseUrl";

/**
 * Human-readable message for failed API calls (network, timeout, validation, auth).
 */
export function httpErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : fallback;
  }

  if (err.code === "ERR_NETWORK") {
    const gateway = getConfiguredGatewayUrl() || "https://localhost:7059";
    if (import.meta.env.DEV) {
      return `Cannot reach the API. Start the gateway (${gateway}), then run npm run dev and open http://localhost:5174 (requests are proxied; do not set VITE_API_BASE_URL). If the gateway only listens on HTTP port 5284, set VITE_GATEWAY_URL=https://localhost:7059 in .env.development — not http://127.0.0.1:5284 (that redirects to 127.0.0.1:7059 and breaks TLS).`;
    }
    return `Cannot reach the API (${gateway}). Check VITE_API_BASE_URL / VITE_GATEWAY_URL and that the server is running.`;
  }
  if (err.code === "ECONNABORTED") {
    return "The request timed out. Check your connection and try again.";
  }

  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();

  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
    if (typeof o.title === "string" && o.title.trim()) return o.title.trim();
    const errors = o.errors;
    if (errors && typeof errors === "object" && !Array.isArray(errors)) {
      const firstKey = Object.keys(errors as Record<string, unknown>)[0];
      const val = firstKey ? (errors as Record<string, unknown>)[firstKey] : undefined;
      if (Array.isArray(val) && typeof val[0] === "string") return val.filter(Boolean).join(" ");
    }
  }

  const status = err.response?.status;
  if (status === 401) return "Session expired or not signed in. Please sign in again.";
  if (status === 403) return "You do not have permission for this action.";
  if (status === 404) return "Resource not found.";
  if (status === 409) return "This email or account is already in use.";
  if (status != null && status >= 500) return "The server had a problem. Please try again in a moment.";

  return fallback;
}
