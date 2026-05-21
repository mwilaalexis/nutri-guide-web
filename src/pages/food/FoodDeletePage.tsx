import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FoodService } from "../../services/food.service";
import type { FoodDto } from "../../Types/global-types";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import { useToast } from "../../components/ui/ToastProvider";
import FoodImage from "../../components/media/FoodImage";
import FormPageShell from "../../components/ui/FormPageShell";

export default function FoodDeletePage() {
  const { foodId } = useParams<{ foodId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const backTo = "/dashboard/food";

  const [item, setItem] = useState<FoodDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!foodId) {
      setError("Invalid food ID.");
      setLoading(false);
      return;
    }
    FoodService.getById(foodId)
      .then((res) => setItem(res.data))
      .catch((err) => setError(httpErrorMessage(err, "Could not load food.")))
      .finally(() => setLoading(false));
  }, [foodId]);

  const remove = async () => {
    if (!foodId || !item) return;
    setBusy(true);
    setError(null);
    try {
      await FoodService.delete(foodId);
      toast.success(`“${item.name}” deleted.`);
      navigate(backTo);
    } catch (err) {
      const msg = httpErrorMessage(err, "Could not delete food.");
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
      <button type="button" className="btn btn-danger" onClick={() => void remove()} disabled={busy || loading || !item}>
        {busy ? "Deleting…" : "Delete permanently"}
      </button>
    </>
  );

  return (
    <FormPageShell
      title="Delete food"
      kicker="Confirm"
      subtitle={item?.name}
      backTo={backTo}
      backLabel="Food catalog"
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
        <>
          <FoodImage src={item.imagePath} alt="" className="food-modal__img" />
          <p className="food-modal__danger-text">
            Delete <strong className="food-modal__danger-name">{item.name}</strong>? This cannot be
            undone.
          </p>
        </>
      )}
    </FormPageShell>
  );
}
