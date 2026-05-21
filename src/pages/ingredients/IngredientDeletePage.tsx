import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IngredientsService } from "../../services/ingredients.service";
import type { IngredientDto } from "../../Types/global-types";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import FormPageShell from "../../components/ui/FormPageShell";

export default function IngredientDeletePage() {
  const { ingredientId } = useParams<{ ingredientId: string }>();
  const navigate = useNavigate();
  const backTo = "/dashboard/ingredients";

  const [item, setItem] = useState<IngredientDto | null>(null);
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
      .then((res) => setItem(res.data))
      .catch((err) => setError(httpErrorMessage(err, "Could not load ingredient.")))
      .finally(() => setLoading(false));
  }, [ingredientId]);

  const remove = async () => {
    if (!ingredientId) return;
    setBusy(true);
    setError(null);
    try {
      await IngredientsService.delete(ingredientId);
      navigate(backTo);
    } catch (err) {
      setError(httpErrorMessage(err, "Could not delete ingredient."));
    } finally {
      setBusy(false);
    }
  };

  const footer = (
    <>
      <Link to={backTo} className="btn btn-secondary">
        Cancel
      </Link>
      <button type="button" className="btn btn-danger" onClick={() => void remove()} disabled={busy || loading || !item}>
        {busy ? "Deleting…" : "Yes, delete"}
      </button>
    </>
  );

  return (
    <FormPageShell
      title="Delete ingredient"
      kicker="Confirm"
      subtitle={item?.name}
      backTo={backTo}
      backLabel="Ingredients"
      size="compact"
      footer={footer}
    >
      {loading && <p className="food-modal__loading">Loading…</p>}
      {error && (
        <p className="food-modal__status food-modal__status--err" role="alert">
          {error}
        </p>
      )}
      {item && (
        <p className="food-modal__danger-text">
          Do you really want to delete <strong className="food-modal__danger-name">{item.name}</strong>?
        </p>
      )}
    </FormPageShell>
  );
}
