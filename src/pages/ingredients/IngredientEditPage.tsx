import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IngredientsService } from "../../services/ingredients.service";
import type { IngredientDto } from "../../Types/global-types";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import FormPageShell from "../../components/ui/FormPageShell";

export default function IngredientEditPage() {
  const { ingredientId } = useParams<{ ingredientId: string }>();
  const navigate = useNavigate();
  const backTo = "/dashboard/ingredients";

  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ingredientId) {
      setError("Invalid ingredient ID.");
      setLoading(false);
      return;
    }
    IngredientsService.getById(ingredientId)
      .then((res) => {
        const item: IngredientDto = res.data;
        setName(item.name);
        setCalories(item.calories);
        setCategory((item as IngredientDto & { category?: string; dietType?: string }).category ?? item.dietType ?? "");
      })
      .catch((err) => setError(httpErrorMessage(err, "Could not load ingredient.")))
      .finally(() => setLoading(false));
  }, [ingredientId]);

  const save = async () => {
    if (!ingredientId) return;
    setBusy(true);
    setError(null);
    try {
      await IngredientsService.update(ingredientId, { name, calories, category });
      navigate(backTo);
    } catch (err) {
      setError(httpErrorMessage(err, "Could not update ingredient."));
    } finally {
      setBusy(false);
    }
  };

  const footer = (
    <>
      <Link to={backTo} className="btn btn-secondary">
        Cancel
      </Link>
      <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={busy || loading}>
        {busy ? "Saving…" : "Update ingredient"}
      </button>
    </>
  );

  return (
    <FormPageShell
      title="Edit ingredient"
      kicker="Admin"
      subtitle={name || undefined}
      backTo={backTo}
      backLabel="Ingredients"
      footer={footer}
    >
      {loading && <p className="food-modal__loading">Loading…</p>}
      {error && (
        <p className="food-modal__status food-modal__status--err" role="alert">
          {error}
        </p>
      )}
      {!loading && (
        <div className="form-page__stack">
          <label className="food-modal__field">
            <span className="food-modal__label">Name</span>
            <input className="food-modal__input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="food-modal__field">
            <span className="food-modal__label">Calories</span>
            <input
              className="food-modal__input"
              type="number"
              value={calories}
              onChange={(e) => setCalories(+e.target.value)}
            />
          </label>
          <label className="food-modal__field">
            <span className="food-modal__label">Category</span>
            <input className="food-modal__input" value={category} onChange={(e) => setCategory(e.target.value)} />
          </label>
        </div>
      )}
    </FormPageShell>
  );
}
