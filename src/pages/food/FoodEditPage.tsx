import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FoodService } from "../../services/food.service";
import { IngredientsService } from "../../services/ingredients.service";
import type { FoodDto, IngredientDto } from "../../Types/global-types";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import { useToast } from "../../components/ui/ToastProvider";
import FoodImage from "../../components/media/FoodImage";
import FoodIngredientEditor, {
  type FoodIngredientLine,
  inferDietTypeFromLines,
  recalcNutritionFromLines,
} from "../../components/Food/FoodIngredientEditor";
import FormPageShell from "../../components/ui/FormPageShell";

export default function FoodEditPage() {
  const { foodId } = useParams<{ foodId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const backTo = "/dashboard/food";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [allIngredients, setAllIngredients] = useState<IngredientDto[]>([]);
  const [ingredientLines, setIngredientLines] = useState<FoodIngredientLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!foodId) {
      setError("Invalid food ID.");
      setLoading(false);
      return;
    }
    Promise.all([IngredientsService.getAll(), FoodService.getById(foodId)])
      .then(([ingRes, foodRes]) => {
        setAllIngredients(Array.isArray(ingRes.data) ? ingRes.data : []);
        const food: FoodDto = foodRes.data;
        setName(food.name);
        setDescription(food.recipe);
        setTags((food.tags ?? []).join(", "));
        setImagePath(food.imagePath);
        const lines = (food.ingredients ?? []).map((i) => ({
          ingredientId: i.id,
          unit: i.unit,
          quantity: i.quantity,
        }));
        setIngredientLines(lines.length > 0 ? lines : [{ ingredientId: "", unit: "", quantity: 1 }]);
      })
      .catch((err) => setError(httpErrorMessage(err, "Could not load food.")))
      .finally(() => setLoading(false));
  }, [foodId]);

  useEffect(() => {
    if (!document) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(document);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [document]);

  const nutrition = useMemo(
    () => recalcNutritionFromLines(ingredientLines, allIngredients, "per100"),
    [ingredientLines, allIngredients],
  );

  const dietType = useMemo(
    () => inferDietTypeFromLines(ingredientLines, allIngredients),
    [ingredientLines, allIngredients],
  );

  const save = async () => {
    if (!foodId || !name.trim()) {
      setError("Name is required.");
      return;
    }

    setBusy(true);
    setError(null);

    const formData = new FormData();
    formData.append("Name", name.trim());
    formData.append("Calories", Math.round(nutrition.calories).toString());
    formData.append("Protein", nutrition.protein.toString());
    formData.append("Carbs", nutrition.carbs.toString());
    formData.append("Fat", nutrition.fat.toString());
    formData.append("DietType", dietType);
    formData.append("Recipe", description.trim() || "No recipe provided");
    formData.append("Tags", tags.trim() || "none");
    if (document) formData.append("Document", document);

    ingredientLines.forEach((line, i) => {
      if (!line.ingredientId) return;
      formData.append(`Ingredients[${i}].IngredientId`, line.ingredientId);
      formData.append(`Ingredients[${i}].Unit`, line.unit);
      formData.append(`Ingredients[${i}].Quantity`, line.quantity.toString());
    });

    try {
      await FoodService.update(foodId, formData);
      toast.success("Food updated.");
      navigate(backTo);
    } catch (err) {
      const msg = httpErrorMessage(err, "Could not update food.");
      setError(msg);
      toast.error(msg);
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
        {busy ? "Saving…" : "Save changes"}
      </button>
    </>
  );

  return (
    <FormPageShell
      title="Edit food"
      kicker="Update"
      subtitle={name || undefined}
      backTo={backTo}
      backLabel="Food catalog"
      size="wide"
      footer={footer}
    >
      {loading && <p className="food-modal__loading">Loading food…</p>}
      {error && (
        <p className="food-modal__status food-modal__status--err" role="alert">
          {error}
        </p>
      )}

      {!loading && (
        <>
          <FoodImage src={previewUrl ?? imagePath} alt={name} className="food-modal__img" />

          <div className="food-modal__field">
            <label className="food-modal__label" htmlFor="food-edit-name">
              Name *
            </label>
            <input
              id="food-edit-name"
              className="food-modal__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="food-modal__field">
            <label className="food-modal__label" htmlFor="food-edit-photo">
              Replace photo
            </label>
            <input
              id="food-edit-photo"
              type="file"
              accept="image/*"
              className="food-modal__input"
              onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
            />
            <p className="food-modal__file-hint">Leave empty to keep the current image.</p>
          </div>

          <div className="food-modal__field">
            <label className="food-modal__label" htmlFor="food-edit-recipe">
              Recipe
            </label>
            <textarea
              id="food-edit-recipe"
              className="food-modal__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="food-modal__field">
            <label className="food-modal__label" htmlFor="food-edit-tags">
              Tags
            </label>
            <input
              id="food-edit-tags"
              className="food-modal__input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <FoodIngredientEditor
            lines={ingredientLines}
            allIngredients={allIngredients}
            onChange={setIngredientLines}
          />

          <section className="food-modal__section">
            <h3 className="food-modal__section-title">Calculated totals (per 100 g/ml)</h3>
            <div className="food-modal__summary">
              <p>
                <strong>Weight factor:</strong> {nutrition.weight.toFixed(2)}
              </p>
              <p>
                <strong>Calories:</strong> {nutrition.calories.toFixed(1)} · <strong>Protein:</strong>{" "}
                {nutrition.protein.toFixed(1)} g
              </p>
              <p>
                <strong>Carbs:</strong> {nutrition.carbs.toFixed(1)} g · <strong>Fat:</strong>{" "}
                {nutrition.fat.toFixed(1)} g
              </p>
              <p>
                <strong>Diet type:</strong> {dietType}
              </p>
            </div>
          </section>
        </>
      )}
    </FormPageShell>
  );
}
