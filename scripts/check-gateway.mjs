/**
 * Dev preflight: verify the API gateway responds before starting Vite.
 * Reads VITE_GATEWAY_URL from .env.development (default https://localhost:7059).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";
import http from "node:http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadGatewayUrl() {
  const envPath = resolve(root, ".env.development");
  if (existsSync(envPath)) {
    const text = readFileSync(envPath, "utf8");
    const m = text.match(/^\s*VITE_GATEWAY_URL\s*=\s*(\S+)/m);
    if (m?.[1]) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return "https://localhost:7059";
}

function probe(urlString) {
  return new Promise((resolveProbe) => {
    const url = new URL(`${urlString.replace(/\/$/, "")}/api/foods?page=1&pageSize=1`);
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      url,
      {
        method: "GET",
        timeout: 8000,
        rejectUnauthorized: false,
      },
      (res) => {
        res.resume();
        resolveProbe({
          ok: true,
          status: res.statusCode ?? 0,
          redirected: res.statusCode >= 300 && res.statusCode < 400,
          location: res.headers.location,
        });
      },
    );
    req.on("error", (err) => resolveProbe({ ok: false, error: err.message }));
    req.on("timeout", () => {
      req.destroy();
      resolveProbe({ ok: false, error: "timeout" });
    });
    req.end();
  });
}

const gateway = loadGatewayUrl();
const result = await probe(gateway);

if (!result.ok) {
  console.error("\n[NutriGuide] Gateway unreachable:", gateway);
  console.error("  ", result.error);
  console.error("\n  1. Start test.Server / Ocelot (HTTPS on localhost:7059)");
  console.error("  2. Set VITE_GATEWAY_URL=https://localhost:7059 in .env.development");
  console.error("  3. Do NOT use http://127.0.0.1:5284 (redirects break TLS in the browser)\n");
  process.exit(1);
}

if (result.redirected && result.location?.includes("127.0.0.1")) {
  console.warn(
    "[NutriGuide] Warning: gateway redirects to",
    result.location,
    "\n  Use VITE_GATEWAY_URL=https://localhost:7059 in .env.development\n",
  );
  process.exit(1);
}

const label =
  result.status === 401
    ? "reachable (auth required — expected)"
    : `reachable (HTTP ${result.status})`;
console.log(`[NutriGuide] Gateway ${label}: ${gateway}`);
