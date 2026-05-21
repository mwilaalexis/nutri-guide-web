import { getConfiguredGatewayUrl } from "../utils/resolveApiBaseUrl";

/** One-time dev console hints (proxy + gateway). */
export function logDevSetup(): void {
  if (!import.meta.env.DEV) return;

  const gateway = getConfiguredGatewayUrl();
  const apiBase = import.meta.env.VITE_API_BASE_URL?.trim();

  console.info(
    "%c[NutriGuide dev]",
    "font-weight:bold;color:#4a8c31",
    `\n  App:     ${typeof window !== "undefined" ? window.location.origin : "—"}`,
    `\n  API:     relative /api/* → Vite proxy → ${gateway}`,
    `\n  Open:    http://localhost:5174`,
  );

  if (apiBase) {
    console.warn(
      "[NutriGuide] VITE_API_BASE_URL is set but ignored in dev. Remove it from .env to use the proxy.",
    );
  }
}
