import { FoodService } from "../services/food.service";
import type { DailyMealSummaryDto, FoodDto, MealSummaryDto, PlanSummaryDto } from "../Types/global-types";

export const MEAL_CATEGORIES: { label: string; key: keyof DailyMealSummaryDto }[] = [
  { label: "Petit-déjeuner", key: "breakfast" },
  { label: "Déjeuner", key: "lunch" },
  { label: "Dîner", key: "dinner" },
  { label: "Collations", key: "snacks" },
];

export function sortedPlanDays(plan: PlanSummaryDto) {
  return [...(plan.days ?? [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export function collectFoodIds(plan: PlanSummaryDto): string[] {
  const ids = new Set<string>();
  for (const day of plan.days ?? []) {
    for (const { key } of MEAL_CATEGORIES) {
      const meals = day[key];
      if (!Array.isArray(meals)) continue;
      for (const meal of meals) {
        if (meal.foodId) ids.add(meal.foodId);
      }
    }
  }
  return [...ids];
}

export async function fetchFoodsMap(ids: string[]): Promise<Map<string, FoodDto>> {
  const map = new Map<string, FoodDto>();
  await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await FoodService.getById(id);
        if (res.data?.id) map.set(id, res.data);
      } catch {
        // ignore
      }
    }),
  );
  return map;
}

export function formatIngredients(meal: MealSummaryDto, food?: FoodDto): string[] {
  if (meal.ingredients?.length) {
    return meal.ingredients.map((ing) => {
      const qty = ing.quantity ? `${ing.quantity}` : "";
      const unit = ing.unit ? ` ${ing.unit}` : "";
      return `${ing.name}${qty ? `  ·  ${qty}${unit}` : ""}`;
    });
  }
  if (food?.ingredients?.length) {
    return food.ingredients.map((ing) => {
      const qty = ing.quantity ? `${ing.quantity}` : "";
      const unit = ing.unit ? ` ${ing.unit}` : "";
      return `${ing.name}${qty ? `  ·  ${qty}${unit}` : ""}`;
    });
  }
  return ["Non renseigné"];
}

export function formatRecipe(food?: FoodDto): string {
  const text = food?.recipe?.trim();
  if (!text) return "Recette non disponible pour ce plat.";
  return text.replace(/\s+/g, " ").trim();
}

export function macrosLine(food?: FoodDto, meal?: MealSummaryDto): string {
  const kcal = meal?.calories ?? food?.calories ?? 0;
  if (food) {
    return `${kcal} kcal   ·   Prot. ${food.protein} g   ·   Gluc. ${food.carbs} g   ·   Lip. ${food.fat} g`;
  }
  return `${kcal} kcal`;
}

export function formatDateFr(iso: string, style: "long" | "short" = "long") {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: style === "long" ? "long" : undefined,
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  });
}
