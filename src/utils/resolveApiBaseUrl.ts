/**
 * API origin for Axios and media URLs (no trailing slash).
 *
 * Dev: always "" (relative URLs) so the browser hits the Vite dev server and the
 * proxy forwards to VITE_GATEWAY_URL — avoids ERR_CERT_* when calling HTTPS gateway
 * (e.g. https://127.0.0.1:7059) directly. Do not set VITE_API_BASE_URL in dev.
 *
 * Prod: VITE_API_BASE_URL, else VITE_GATEWAY_URL, else "" (same host as static app).
 */
export function resolveApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    const direct = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
    if (direct && typeof console !== "undefined") {
      console.warn(
        "[NutriGuide] VITE_API_BASE_URL is ignored in dev. Requests use the Vite proxy. Remove VITE_API_BASE_URL from .env or use npm run dev.",
      );
    }
    return "";
  }

  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }

  const gateway = (import.meta.env.VITE_GATEWAY_URL as string | undefined)?.trim();
  if (gateway) {
    return gateway.replace(/\/$/, "");
  }

  return "";
}

/** Gateway URL from env (for dev hints and logging). */
export function getConfiguredGatewayUrl(): string {
  const fromEnv = (import.meta.env.VITE_GATEWAY_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return import.meta.env.DEV ? "https://localhost:7059" : "";
}
