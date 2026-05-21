import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserService } from "../../services/user.service";
import type { UserDto } from "../../Types/global-types";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import FormPageShell from "../../components/ui/FormPageShell";

export default function UserDeletePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const backTo = "/dashboard/users";

  const [item, setItem] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("Invalid user ID.");
      setLoading(false);
      return;
    }
    UserService.getAll(1, 100)
      .then((res) => {
        const u = (Array.isArray(res.data) ? res.data : []).find((x) => x.userId === userId);
        if (!u) throw new Error("User not found");
        setItem(u);
      })
      .catch((err) => setError(httpErrorMessage(err, "Could not load user.")))
      .finally(() => setLoading(false));
  }, [userId]);

  const remove = async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      await UserService.delete(userId);
      navigate(backTo);
    } catch (err) {
      setError(httpErrorMessage(err, "Could not delete user."));
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
      title="Delete user"
      kicker="Confirm"
      subtitle={item?.fullName}
      backTo={backTo}
      backLabel="Users"
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
          Do you really want to delete <strong className="food-modal__danger-name">{item.fullName}</strong>?
        </p>
      )}
    </FormPageShell>
  );
}
