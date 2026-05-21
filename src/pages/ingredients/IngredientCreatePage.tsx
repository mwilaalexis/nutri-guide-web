import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IngredientsService } from "../../services/ingredients.service";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import FormPageShell from "../../components/ui/FormPageShell";

export default function IngredientCreatePage() {
  const navigate = useNavigate();
  const backTo = "/dashboard/ingredients";

  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await IngredientsService.create({ name, calories, category });
      navigate(backTo);
    } catch (err) {
      setError(httpErrorMessage(err, "Could not create ingredient."));
    } finally {
      setBusy(false);
    }
  };

  const footer = (
    <>
      <Link to={backTo} className="btn btn-secondary">
        Cancel
      </Link>
      <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={busy}>
        {busy ? "Saving…" : "Save ingredient"}
      </button>
    </>
  );

  return (
    <FormPageShell title="Add ingredient" kicker="Admin" backTo={backTo} backLabel="Ingredients" footer={footer}>
      {error && (
        <p className="food-modal__status food-modal__status--err" role="alert">
          {error}
        </p>
      )}
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
    </FormPageShell>
  );
}
