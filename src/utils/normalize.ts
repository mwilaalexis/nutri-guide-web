import type { PlanSummaryDto } from "../Types/global-types";

/**
 * Normalise les réponses API où la liste est parfois au racine, parfois sous `items`, `data`, etc.
 */
export function asArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.items)) return o.items as T[];
    if (Array.isArray(o.data)) return o.data as T[];
    if (Array.isArray(o.plans)) return o.plans as T[];
    if (Array.isArray(o.results)) return o.results as T[];
    if (Array.isArray(o.value)) return o.value as T[];
    if (o.data && typeof o.data === "object" && !Array.isArray(o.data)) {
      const nested = asArray<T>(o.data);
      if (nested.length) return nested;
    }
  }
  return [];
}

/** Extrait le corps du plan depuis la réponse GET /api/plans/:id (enveloppes `data` / `plan`). */
export function extractPlanPayload(raw: unknown): unknown {
  let cur: unknown = raw;
  for (let d = 0; d < 6 && cur && typeof cur === "object"; d++) {
    const o = cur as Record<string, unknown>;
    if (Array.isArray(o.days)) return o;
    if (typeof o.planId === "string") return o;
    const next =
      o.data && typeof o.data === "object"
        ? o.data
        : o.plan && typeof o.plan === "object"
          ? o.plan
          : null;
    if (!next) return cur;
    cur = next;
  }
  return cur;
}

export function toPlanSummaryDto(raw: unknown): PlanSummaryDto | null {
  const body = extractPlanPayload(raw);
  if (!body || typeof body !== "object") return null;
  const p = body as Record<string, unknown>;
  if (typeof p.planId !== "string") return null;
  return {
    ...(body as PlanSummaryDto),
    days: Array.isArray(p.days) ? (p.days as PlanSummaryDto["days"]) : [],
  };
}
