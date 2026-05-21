import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PlansService } from "../../services/plans.service";
import { FoodService } from "../../services/food.service";
import type { FoodDto, MealSummaryDto } from "../../Types/global-types";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import { useToast } from "../../components/ui/ToastProvider";
import { asArray } from "../../utils/normalize";
import FoodImage from "../../components/media/FoodImage";
import FormPageShell from "../../components/ui/FormPageShell";

export default function PlanSwapMealPage() {
  const { planId, mealId } = useParams<{ planId: string; mealId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const backTo = planId ? `/dashboard/plans/${planId}` : "/dashboard/plans";

  const [meal, setMeal] = useState<MealSummaryDto | null>(null);
  const [compatibleFoods, setCompatibleFoods] = useState<FoodDto[]>([]);
  const [selectedSwapFood, setSelectedSwapFood] = useState<FoodDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId || !mealId) {
      setError("Invalid plan or meal.");
      setLoading(false);
      return;
    }
    Promise.all([PlansService.getById(planId), FoodService.getCompatible()])
      .then(([planRes, foodsRes]) => {
        const days = planRes.data?.days ?? [];
        let found: MealSummaryDto | null = null;
        for (const day of days) {
          const all = [
            ...(day.breakfast ?? []),
            ...(day.lunch ?? []),
            ...(day.dinner ?? []),
            ...(day.snacks ?? []),
          ];
          found = all.find((m) => m.id === mealId) ?? null;
          if (found) break;
        }
        if (!found) throw new Error("Meal not found in this plan.");
        setMeal(found);
        setCompatibleFoods(asArray<FoodDto>(foodsRes.data));
      })
      .catch((err) => setError(httpErrorMessage(err, "Could not load swap options.")))
      .finally(() => setLoading(false));
  }, [planId, mealId]);

  const applySwap = async () => {
    if (!planId || !meal || !selectedSwapFood) return;
    setBusy(true);
    try {
      await PlansService.swapMeal(planId, meal.id, selectedSwapFood.id);
      toast.success("Meal updated.");
      navigate(backTo);
    } catch (err) {
      toast.error(httpErrorMessage(err, "Swap could not be applied."));
    } finally {
      setBusy(false);
    }
  };

  const applyRandomSwap = async () => {
    if (!planId || !meal) return;
    setBusy(true);
    try {
      await PlansService.swapMeal(planId, meal.id, null);
      toast.success("Meal swapped randomly.");
      navigate(backTo);
    } catch (err) {
      toast.error(httpErrorMessage(err, "Random swap failed."));
    } finally {
      setBusy(false);
    }
  };

  const footer = (
    <>
      <Link to={backTo} className="btn btn-secondary">
        Cancel
      </Link>
      <button
        type="button"
        className="btn btn-success"
        disabled={!selectedSwapFood || busy}
        onClick={() => void applySwap()}
      >
        {busy ? "Applying…" : "Apply selected swap"}
      </button>
    </>
  );

  return (
    <FormPageShell
      title="Swap meal"
      kicker="Plan"
      subtitle={meal ? `Current: ${meal.name}` : undefined}
      backTo={backTo}
      backLabel="Plan details"
      size="wide"
      footer={footer}
    >
      {loading && <p className="food-modal__loading">Loading…</p>}
      {error && (
        <p className="food-modal__status food-modal__status--err" role="alert">
          {error}
        </p>
      )}

      {!loading && meal && (
        <>
          <button type="button" className="btn btn-primary w-100 mb-3" disabled={busy} onClick={() => void applyRandomSwap()}>
            Random swap
          </button>

          <h3 className="food-modal__section-title">Choose a replacement</h3>

          <div className="swap-list max-h-[45vh] overflow-y-auto pr-1">
            {compatibleFoods.length === 0 ? (
              <p className="text-sm text-[var(--text-light)]">No compatible foods loaded.</p>
            ) : (
              compatibleFoods.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`swap-item w-full ${selectedSwapFood?.id === f.id ? "active" : ""}`}
                  onClick={() => setSelectedSwapFood(f)}
                >
                  <FoodImage
                    src={f.imagePath}
                    alt=""
                    className="swap-thumb h-16 w-20 shrink-0 object-cover sm:h-20 sm:w-24"
                  />
                  <div className="swap-info min-w-0 text-left">
                    <strong className="block truncate">{f.name}</strong>
                    <p className="text-muted mb-0 text-sm">{f.calories} kcal</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </FormPageShell>
  );
}
