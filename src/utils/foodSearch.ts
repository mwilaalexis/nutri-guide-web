import type { FoodDto } from "../Types/global-types";

/** Client-side filter (name, diet, tags, ingredient names). */
export function matchesFoodSearch(food: FoodDto, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (food.name.toLowerCase().includes(q)) return true;
  if (food.dietType?.toLowerCase().includes(q)) return true;
  if (food.tags.some((t) => t.toLowerCase().includes(q))) return true;
  if (food.ingredients.some((i) => i.name?.toLowerCase().includes(q))) return true;

  return false;
}

export function filterFoodsBySearch(foods: FoodDto[], query: string): FoodDto[] {
  const q = query.trim();
  if (!q) return foods;
  return foods.filter((f) => matchesFoodSearch(f, q));
}
