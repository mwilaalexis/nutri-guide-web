import type { DailyMealSummaryDto } from "../Types/global-types";

/** Clé date locale YYYY-MM-DD */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dayDateKey(iso: string): string {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "";
  return localDateKey(t);
}

/** Jour du plan correspondant à aujourd'hui, sinon premier jour (trié). */
export function pickPlanDayForToday(days: DailyMealSummaryDto[] | undefined): {
  day: DailyMealSummaryDto | null;
  matchesCalendar: boolean;
} {
  if (!days?.length) return { day: null, matchesCalendar: false };
  const sorted = [...days].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const todayKey = localDateKey(new Date());
  const match = sorted.find((d) => dayDateKey(d.date) === todayKey);
  if (match) return { day: match, matchesCalendar: true };
  return { day: sorted[0], matchesCalendar: false };
}

export function countMealsOnDay(d: DailyMealSummaryDto): number {
  return (
    (d.breakfast?.length ?? 0) +
    (d.lunch?.length ?? 0) +
    (d.dinner?.length ?? 0) +
    (d.snacks?.length ?? 0)
  );
}

export function formatGoalCode(code: string | undefined): string {
  if (!code) return "—";
  const map: Record<string, string> = {
    LoseWeight: "Lose weight",
    Maintain: "Maintain",
    GainMuscle: "Gain muscle",
    Balanced: "Balanced",
    Keto: "Keto",
    Vegan: "Vegan",
    Vegetarian: "Vegetarian",
    HighProtein: "High protein",
  };
  return map[code] ?? code.replace(/([A-Z])/g, " $1").trim();
}
