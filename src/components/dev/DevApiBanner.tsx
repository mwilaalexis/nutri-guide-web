import { useEffect, useState } from "react";
import { probeApiReachable, type ApiProbeResult } from "../../utils/apiHealth";
import { getConfiguredGatewayUrl } from "../../utils/resolveApiBaseUrl";

/**
 * Shown in dev when the API gateway is not reachable through the Vite proxy.
 */
export default function DevApiBanner() {
  const [status, setStatus] = useState<ApiProbeResult | "checking">("checking");

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let cancelled = false;

    const run = async () => {
      const result = await probeApiReachable();
      if (!cancelled) setStatus(result);
    };

    run();
    const id = window.setInterval(run, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (!import.meta.env.DEV || status === "checking" || status !== "offline") {
    return null;
  }

  const gateway = getConfiguredGatewayUrl();

  return (
    <div className="dev-api-banner" role="alert">
      <strong>API offline</strong>
      <p>
        The Vite proxy cannot reach the gateway ({gateway}). Start test.Server, then run{" "}
        <code>npm run dev</code> and open <code>http://localhost:5174</code>. Do not set{" "}
        <code>VITE_API_BASE_URL</code> in development.
      </p>
    </div>
  );
}
