/** Quick probe: is the Vite proxy + gateway responding? */
export type ApiProbeResult = "online" | "auth_required" | "offline";

export async function probeApiReachable(): Promise<ApiProbeResult> {
  try {
    const res = await fetch("/api/foods?page=1&pageSize=1", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.status === 401 || res.status === 403) return "auth_required";
    if (res.ok || res.status < 500) return "online";
    return "offline";
  } catch {
    return "offline";
  }
}
