import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import type { FoodDto } from "../../Types/global-types";
import { FoodService } from "../../services/food.service";
import AuthService from "../../services/auth.service";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import FoodImage from "../../components/media/FoodImage";
import FormPageShell from "../../components/ui/FormPageShell";

export default function FoodDetailPage() {
  const { foodId } = useParams<{ foodId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as { from?: string; viewOnly?: boolean } | null) ?? null;
  const backTo = navState?.from ?? "/dashboard/gallery";
  const viewOnly =
    navState?.viewOnly === true || backTo.includes("/gallery");

  const [data, setData] = useState<FoodDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = AuthService.getCurrentUserRole()?.toLowerCase() === "admin";
  const showAdminActions = isAdmin && !viewOnly;

  useEffect(() => {
    if (!foodId) {
      setError("Invalid food ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    FoodService.getById(foodId)
      .then((res) => setData(res.data))
      .catch((err) => setError(httpErrorMessage(err, "Could not load food details.")))
      .finally(() => setLoading(false));
  }, [foodId]);

  const ingredients = data?.ingredients ?? [];
  const tags = data?.tags ?? [];

  const footer = data ? (
    <>
      {showAdminActions && (
        <>
          <Link to={`/dashboard/food/${data.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <Link to={`/dashboard/food/${data.id}/delete`} className="btn btn-danger">
            Delete
          </Link>
        </>
      )}
      <Link to={backTo} className="btn btn-primary">
        {viewOnly ? "Back to gallery" : "Done"}
      </Link>
    </>
  ) : (
    <Link to={backTo} className="btn btn-secondary">
      Back
    </Link>
  );

  return (
    <FormPageShell
      title={data?.name ?? "Food details"}
      kicker="Food details"
      subtitle={data?.dietType ? `Diet: ${data.dietType}` : undefined}
      backTo={backTo}
      size="wide"
      footer={footer}
    >
      {loading && <p className="food-modal__loading">Loading details…</p>}
      {error && (
        <p className="food-modal__status food-modal__status--err" role="alert">
          {error}
        </p>
      )}

      {data && (
        <>
          <FoodImage src={data.imagePath} alt={data.name} className="food-modal__img" />

          <div className="food-modal__macros">
            <div className="food-modal__macro">
              <span className="food-modal__macro-value">{Math.round(data.calories)}</span>
              <span className="food-modal__macro-label">kcal</span>
            </div>
            <div className="food-modal__macro">
              <span className="food-modal__macro-value">{data.protein}</span>
              <span className="food-modal__macro-label">Protein (g)</span>
            </div>
            <div className="food-modal__macro">
              <span className="food-modal__macro-value">{data.carbs}</span>
              <span className="food-modal__macro-label">Carbs (g)</span>
            </div>
            <div className="food-modal__macro">
              <span className="food-modal__macro-value">{data.fat}</span>
              <span className="food-modal__macro-label">Fat (g)</span>
            </div>
          </div>

          <section className="food-modal__section">
            <h3 className="food-modal__section-title">Ingredients</h3>
            {ingredients.length > 0 ? (
              <table className="food-modal__ingredient-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Qty</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing) => (
                    <tr key={ing.id}>
                      <td>{ing.name}</td>
                      <td>{ing.quantity}</td>
                      <td>{ing.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="food-modal__empty">No ingredients listed.</p>
            )}
          </section>

          <section className="food-modal__section">
            <h3 className="food-modal__section-title">Tags</h3>
            {tags.length > 0 ? (
              <div className="food-modal__tags">
                {tags.map((tag) => (
                  <span key={tag} className="food-tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="food-modal__empty">No tags.</p>
            )}
          </section>

          <section className="food-modal__section">
            <h3 className="food-modal__section-title">Recipe</h3>
            <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.55, color: "var(--text)" }}>
              {data.recipe?.trim() || "No recipe provided."}
            </p>
          </section>
        </>
      )}

      {!loading && !data && !error && (
        <button type="button" className="btn btn-secondary" onClick={() => navigate(backTo)}>
          Go back
        </button>
      )}
    </FormPageShell>
  );
}
