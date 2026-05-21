import type { IngredientDto } from "../../Types/global-types";

export type FoodIngredientLine = {
  ingredientId: string;
  unit: string;
  quantity: number;
};

type FoodIngredientEditorProps = {
  lines: FoodIngredientLine[];
  allIngredients: IngredientDto[];
  onChange: (lines: FoodIngredientLine[]) => void;
  quantityScale?: "direct" | "per100";
};

export function recalcNutritionFromLines(
  lines: FoodIngredientLine[],
  allIngredients: IngredientDto[],
  scale: "direct" | "per100",
) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let weight = 0;

  const factor = scale === "per100" ? (q: number) => q / 100 : (q: number) => q;

  lines.forEach((line) => {
    const ing = allIngredients.find((i) => i.id === line.ingredientId);
    if (!ing || line.quantity <= 0) return;
    const f = factor(line.quantity);
    calories += ing.calories * f;
    protein += ing.protein * f;
    carbs += ing.carbs * f;
    fat += ing.fat * f;
    weight += scale === "per100" ? line.quantity / 100 : line.quantity;
  });

  return { calories, protein, carbs, fat, weight };
}

export function inferDietTypeFromLines(
  lines: FoodIngredientLine[],
  allIngredients: IngredientDto[],
): string {
  let type = "Vegan";

  lines.forEach((line) => {
    const ing = allIngredients.find((i) => i.id === line.ingredientId);
    if (!ing) return;
    if (ing.dietType === "Balanced") type = "Balanced";
    else if (ing.dietType === "Pescatarian" && type !== "Balanced") type = "Pescatarian";
    else if (ing.dietType === "Vegetarian" && type !== "Balanced" && type !== "Pescatarian") {
      type = "Vegetarian";
    }
  });

  return type;
}

export default function FoodIngredientEditor({
  lines,
  allIngredients,
  onChange,
}: FoodIngredientEditorProps) {
  const updateLine = (index: number, patch: Partial<FoodIngredientLine>) => {
    const next = lines.map((line, i) => (i === index ? { ...line, ...patch } : line));
    onChange(next);
  };

  const removeLine = (index: number) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  const addLine = () => {
    onChange([...lines, { ingredientId: "", unit: "", quantity: 1 }]);
  };

  return (
    <section className="food-modal__section">
      <h3 className="food-modal__section-title">Ingredients</h3>
      <div className="food-modal__ingredient-list">
        {lines.map((line, index) => (
          <div key={index} className="food-modal__ingredient-row">
            <div className="food-modal__field" style={{ marginBottom: 0 }}>
              <label className="food-modal__label">Ingredient</label>
              <select
                className="food-modal__select"
                value={line.ingredientId}
                onChange={(e) => {
                  const id = e.target.value;
                  const selected = allIngredients.find((i) => i.id === id);
                  updateLine(index, {
                    ingredientId: id,
                    unit: selected?.unit ?? line.unit,
                  });
                }}
              >
                <option value="">Select…</option>
                {allIngredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="food-modal__field" style={{ marginBottom: 0 }}>
              <label className="food-modal__label">Unit</label>
              <input className="food-modal__input" value={line.unit} readOnly />
            </div>
            <div className="food-modal__field" style={{ marginBottom: 0 }}>
              <label className="food-modal__label">Qty</label>
              <input
                type="number"
                min={0}
                step="any"
                className="food-modal__input"
                value={line.quantity}
                onChange={(e) => updateLine(index, { quantity: Number(e.target.value) || 0 })}
              />
            </div>
            <button
              type="button"
              className="btn btn-sm btn-light food-modal__ingredient-remove"
              onClick={() => removeLine(index)}
              disabled={lines.length <= 1}
              aria-label="Remove ingredient"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-sm btn-secondary" onClick={addLine} style={{ marginTop: "0.65rem" }}>
        Add ingredient
      </button>
    </section>
  );
}
