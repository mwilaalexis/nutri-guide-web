import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserService } from "../../services/user.service";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import FormPageShell from "../../components/ui/FormPageShell";

export default function UserEditPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const backTo = "/dashboard/users";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
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
        setFullName(u.fullName);
        setEmail(u.email);
        setRole(u.role);
      })
      .catch((err) => setError(httpErrorMessage(err, "Could not load user.")))
      .finally(() => setLoading(false));
  }, [userId]);

  const save = async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      await UserService.update(userId, { fullName, email, role });
      navigate(backTo);
    } catch (err) {
      setError(httpErrorMessage(err, "Could not update user."));
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
        {busy ? "Saving…" : "Update user"}
      </button>
    </>
  );

  return (
    <FormPageShell
      title="Modify user"
      kicker="Admin"
      subtitle={fullName || undefined}
      backTo={backTo}
      backLabel="Users"
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
            <span className="food-modal__label">Full name</span>
            <input className="food-modal__input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label className="food-modal__field">
            <span className="food-modal__label">Email</span>
            <input className="food-modal__input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="food-modal__field">
            <span className="food-modal__label">Role</span>
            <select className="food-modal__select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
      )}
    </FormPageShell>
  );
}
