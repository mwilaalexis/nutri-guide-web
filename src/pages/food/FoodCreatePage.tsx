import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FoodService } from "../../services/food.service";
import { IngredientsService } from "../../services/ingredients.service";
import type { IngredientDto } from "../../Types/global-types";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import { useToast } from "../../components/ui/ToastProvider";
import FoodImage from "../../components/media/FoodImage";
import FoodIngredientEditor, {
  type FoodIngredientLine,
  inferDietTypeFromLines,
  recalcNutritionFromLines,
} from "../../components/Food/FoodIngredientEditor";
import FormPageShell from "../../components/ui/FormPageShell";

export default function FoodCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const backTo = "/dashboard/food";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [allIngredients, setAllIngredients] = useState<IngredientDto[]>([]);
  const [ingredientLines, setIngredientLines] = useState<FoodIngredientLine[]>([
    { ingredientId: "", unit: "", quantity: 1 },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    IngredientsService.getAll()
      .then((res) => setAllIngredients(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAllIngredients([]));
  }, []);

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
    () => recalcNutritionFromLines(ingredientLines, allIngredients, "direct"),
    [ingredientLines, allIngredients],
  );

  const dietType = useMemo(
    () => inferDietTypeFromLines(ingredientLines, allIngredients),
    [ingredientLines, allIngredients],
  );

  const save = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    for (const line of ingredientLines) {
      if (!line.ingredientId) {
        setError("Select an ingredient for each row.");
        return;
      }
      if (line.quantity <= 0) {
        setError("Each ingredient quantity must be greater than 0.");
        return;
      }
    }

    setBusy(true);
    setError(null);

    const formData = new FormData();
    formData.append("Name", name.trim());
    formData.append("Calories", nutrition.calories.toString());
    formData.append("Protein", nutrition.protein.toString());
    formData.append("Carbs", nutrition.carbs.toString());
    formData.append("Fat", nutrition.fat.toString());
    formData.append("DietType", dietType);
    formData.append("Recipe", description.trim() || "No recipe provided");
    formData.append("Tags", tags.trim() || "none");
    if (document) formData.append("Document", document);

    ingredientLines.forEach((line, i) => {
      formData.append(`Ingredients[${i}].IngredientId`, line.ingredientId);
      formData.append(`Ingredients[${i}].Unit`, line.unit);
      formData.append(`Ingredients[${i}].Quantity`, line.quantity.toString());
    });

    try {
      await FoodService.create(formData);
      toast.success("Food created.");
      navigate(backTo);
    } catch (err) {
      const msg = httpErrorMessage(err, "Could not create food.");
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
      <button type="button" className="btn btn-primary" onClick={() => void save()} disabled={busy}>
        {busy ? "Creating…" : "Create food"}
      </button>
    </>
  );

  return (
    <FormPageShell
      title="Create food"
      kicker="New item"
      subtitle="Add a meal to the catalog with ingredients and photo."
      backTo={backTo}
      backLabel="Food catalog"
      size="wide"
      footer={footer}
    >
      {error && (
        <p className="food-modal__status food-modal__status--err" role="alert">
          {error}
        </p>
      )}

      <div className="food-modal__field">
        <label className="food-modal__label" htmlFor="food-create-name">
          Name *
        </label>
        <input
          id="food-create-name"
          className="food-modal__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chicken rice bowl"
        />
      </div>

      <div className="food-modal__field">
        <label className="food-modal__label" htmlFor="food-create-photo">
          Photo
        </label>
        <input
          id="food-create-photo"
          type="file"
          accept="image/*"
          className="food-modal__input"
          onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
        />
        <p className="food-modal__file-hint">JPEG or PNG recommended.</p>
        {previewUrl && <FoodImage src={previewUrl} alt="Preview" className="food-modal__img" />}
      </div>

      <div className="food-modal__field">
        <label className="food-modal__label" htmlFor="food-create-recipe">
          Recipe
        </label>
        <textarea
          id="food-create-recipe"
          className="food-modal__textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Preparation steps…"
        />
      </div>

      <div className="food-modal__field">
        <label className="food-modal__label" htmlFor="food-create-tags">
          Tags
        </label>
        <input
          id="food-create-tags"
          className="food-modal__input"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Comma-separated, e.g. lunch, high-protein"
        />
      </div>

      <FoodIngredientEditor
        lines={ingredientLines}
        allIngredients={allIngredients}
        onChange={setIngredientLines}
      />

      <section className="food-modal__section">
        <h3 className="food-modal__section-title">Calculated totals</h3>
        <div className="food-modal__summary">
          <p>
            <strong>Weight:</strong> {nutrition.weight.toFixed(1)} g/ml
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
    </FormPageShell>
  );
}
