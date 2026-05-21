import type { WeightEntryDto } from "../services/tracking.service";

export type WeightSideStat = {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative" | "muted";
};

export type WeightSideData = {
  stats: WeightSideStat[];
  hasData: boolean;
};

function measuredAtTime(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function formatKg(n: number): string {
  return `${n.toFixed(1)} kg`;
}

function formatDeltaKg(delta: number): string {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} kg`;
}

export function buildWeightSideData(
  entries: WeightEntryDto[],
  goalTarget: number | null | undefined,
  goalCurrent: number | null | undefined,
): WeightSideData {
  if (!entries.length) {
    const stats: WeightSideStat[] = [
      { label: "Poids actuel", value: "—", tone: "muted" },
      { label: "Objectif", value: goalTarget != null ? formatKg(goalTarget) : "—", tone: "muted" },
      { label: "Mesures", value: "0", tone: "muted" },
    ];
    return { stats, hasData: false };
  }

  const sorted = [...entries].sort((a, b) => measuredAtTime(a.measuredAt) - measuredAtTime(b.measuredAt));
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  const weights = sorted.map((e) => e.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);

  const delta = previous != null ? latest.weightKg - previous.weightKg : null;

  const target = goalTarget ?? null;
  const gapToTarget =
    target != null && Number.isFinite(target) ? latest.weightKg - target : null;

  const first = sorted[0];
  const daysSpan =
    sorted.length >= 2
      ? Math.max(
          1,
          Math.round(
            (measuredAtTime(latest.measuredAt) - measuredAtTime(first.measuredAt)) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;
  const totalChange =
    sorted.length >= 2 ? latest.weightKg - first.weightKg : null;
  const trendPerWeek =
    totalChange != null && daysSpan > 0 ? (totalChange / daysSpan) * 7 : null;

  const latestDate = new Date(latest.measuredAt);
  const dateLabel = Number.isNaN(latestDate.getTime())
    ? latest.measuredAt
    : latestDate.toLocaleDateString(undefined, { dateStyle: "medium" });

  const stats: WeightSideStat[] = [
    {
      label: "Poids actuel",
      value: formatKg(latest.weightKg),
      hint: `Dernière pesée · ${dateLabel}`,
    },
  ];

  if (delta != null) {
    stats.push({
      label: "Depuis la pesée précédente",
      value: formatDeltaKg(delta),
      tone: delta < 0 ? "positive" : delta > 0 ? "negative" : "default",
      hint: previous ? formatKg(previous.weightKg) : undefined,
    });
  }

  if (target != null) {
    stats.push({
      label: "Objectif",
      value: formatKg(target),
    });
    if (gapToTarget != null) {
      stats.push({
        label: "Écart à l’objectif",
        value: formatDeltaKg(gapToTarget),
        tone: gapToTarget <= 0 ? "positive" : "negative",
        hint: gapToTarget <= 0 ? "Objectif atteint ou en dessous" : "Reste à perdre",
      });
    }
  } else if (goalCurrent != null) {
    stats.push({
      label: "Référence objectif",
      value: formatKg(goalCurrent),
      hint: "Définissez une cible dans « Goal metric »",
    });
  }

  stats.push({
    label: "Min / max (période)",
    value: `${min.toFixed(1)} – ${max.toFixed(1)} kg`,
  });

  if (trendPerWeek != null && sorted.length >= 2) {
    stats.push({
      label: "Tendance (~7 j)",
      value: formatDeltaKg(trendPerWeek),
      tone: trendPerWeek < 0 ? "positive" : trendPerWeek > 0 ? "negative" : "default",
      hint: `Sur ${daysSpan} jour(s), ${formatDeltaKg(totalChange!)} au total`,
    });
  }

  stats.push({
    label: "Nombre de mesures",
    value: String(sorted.length),
  });

  return { stats, hasData: true };
}
