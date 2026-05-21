import api from "./api";

export type LayerBlock = {
  title: string;
  period: string;
  score: number;
  detail: string;
};

export type DailyTrackingPoint = {
  date: string;
  mealsLogged?: number | null;
  mealsGoal?: number | null;
  adherencePercent?: number | null;
};

export type GoalSnapshot = {
  metricKey: string;
  target?: number | null;
  current?: number | null;
};

/** Réponse API (recordedUtc) + alias UI (measuredAt). */
export type WeightEntryDto = {
  id: string;
  weightKg: number;
  recordedUtc?: string;
  /** Alias utilisé par les graphiques / table */
  measuredAt: string;
  note?: string | null;
};

export type TrackingSummary = {
  layer1Daily: LayerBlock;
  layer2Weekly: LayerBlock;
  layer3Goal: LayerBlock;
  weekSeries: DailyTrackingPoint[];
  goalSnapshot?: GoalSnapshot | null;
  weightSeries?: { id?: string; recordedUtc: string; weightKg: number }[];
};

export type DailyLogBody = {
  date?: string;
  mealsLogged: number;
  mealsGoal?: number;
};

export type GoalBody = {
  metricKey: string;
  target?: number | null;
  current?: number | null;
};

export type LogWeightBody = {
  weightKg: number;
  /** Date du relevé (ISO ou YYYY-MM-DD + heure) */
  measuredAt?: string;
  note?: string | null;
};

type WeightEntryApi = {
  id: string;
  weightKg: number;
  recordedUtc: string;
};

function mapWeightEntry(row: WeightEntryApi): WeightEntryDto {
  return {
    id: row.id,
    weightKg: row.weightKg,
    recordedUtc: row.recordedUtc,
    measuredAt: row.recordedUtc,
  };
}

function daysAgoUtcIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export const TrackingService = {
  getSummary: () => api.get<TrackingSummary>("/api/tracking/summary"),

  logDaily: (body: DailyLogBody) => api.post("/api/tracking/daily", body),

  upsertGoal: (body: GoalBody) => api.put("/api/tracking/goal", body),

  getWeights: async (params?: { days?: number; fromUtc?: string; toUtc?: string }) => {
    const fromUtc = params?.fromUtc ?? (params?.days != null ? daysAgoUtcIso(params.days) : undefined);
    const res = await api.get<WeightEntryApi[]>("/api/tracking/weight-entries", {
      params: { fromUtc, toUtc: params?.toUtc },
    });
    return { ...res, data: (Array.isArray(res.data) ? res.data : []).map(mapWeightEntry) };
  },

  logWeight: async (body: LogWeightBody) => {
    const recordedUtc = body.measuredAt?.includes("T")
      ? body.measuredAt.endsWith("Z")
        ? body.measuredAt
        : `${body.measuredAt}Z`
      : body.measuredAt
        ? `${body.measuredAt}T12:00:00Z`
        : undefined;

    const res = await api.post<WeightEntryApi>("/api/tracking/weight-entries", {
      weightKg: body.weightKg,
      recordedUtc,
    });
    return { ...res, data: mapWeightEntry(res.data) };
  },

  /** Non implémenté côté API — conservé pour compatibilité UI */
  deleteWeight: (id: string) => api.delete(`/api/tracking/weight-entries/${encodeURIComponent(id)}`),
};
