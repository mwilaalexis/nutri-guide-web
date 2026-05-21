import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PlansService } from "../../services/plans.service";
import type { MealSummaryDto } from "../../Types/global-types";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import { useToast } from "../../components/ui/ToastProvider";
import FormPageShell from "../../components/ui/FormPageShell";

export default function PlanRegenerateMealPage() {
  const { planId, mealId } = useParams<{ planId: string; mealId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const backTo = planId ? `/dashboard/plans/${planId}` : "/dashboard/plans";

  const [meal, setMeal] = useState<MealSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId || !mealId) {
      setError("Invalid plan or meal.");
      setLoading(false);
      return;
    }
    PlansService.getById(planId)
      .then((res) => {
        const days = res.data?.days ?? [];
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
      })
      .catch((err) => setError(httpErrorMessage(err, "Could not load meal.")))
      .finally(() => setLoading(false));
  }, [planId, mealId]);

  const applyRegenerate = async () => {
    if (!planId || !meal) return;
    setBusy(true);
    try {
      await PlansService.regenerateMeal(planId, meal.id);
      toast.success("Meal regenerated.");
      navigate(backTo);
    } catch (err) {
      toast.error(httpErrorMessage(err, "Regeneration failed."));
    } finally {
      setBusy(false);
    }
  };

  const footer = (
    <>
      <Link to={backTo} className="btn btn-secondary">
        Cancel
      </Link>
      <button type="button" className="btn btn-warning" disabled={busy || loading || !meal} onClick={() => void applyRegenerate()}>
        {busy ? "Regenerating…" : "Regenerate"}
      </button>
    </>
  );

  return (
    <FormPageShell
      title="Regenerate meal"
      kicker="Plan"
      subtitle={meal ? `Current meal: ${meal.name}` : undefined}
      backTo={backTo}
      backLabel="Plan details"
      size="compact"
      footer={footer}
    >
      {loading && <p className="food-modal__loading">Loading…</p>}
      {error && (
        <p className="food-modal__status food-modal__status--err" role="alert">
          {error}
        </p>
      )}
      {meal && (
        <p className="food-modal__danger-text">
          This replaces <strong>{meal.name}</strong> with a new compatible option from the system.
        </p>
      )}
    </FormPageShell>
  );
}
