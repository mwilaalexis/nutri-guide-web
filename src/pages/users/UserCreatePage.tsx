import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserService } from "../../services/user.service";
import { httpErrorMessage } from "../../utils/httpErrorMessage";
import FormPageShell from "../../components/ui/FormPageShell";

export default function UserCreatePage() {
  const navigate = useNavigate();
  const backTo = "/dashboard/users";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await UserService.create({ fullName, email, role });
      navigate(backTo);
    } catch (err) {
      setError(httpErrorMessage(err, "Could not create user."));
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
        {busy ? "Creating…" : "Create user"}
      </button>
    </>
  );

  return (
    <FormPageShell title="Create user" kicker="Admin" backTo={backTo} backLabel="Users" footer={footer}>
      {error && (
        <p className="food-modal__status food-modal__status--err" role="alert">
          {error}
        </p>
      )}
      <div className="form-page__stack">
        <label className="food-modal__field">
          <span className="food-modal__label">Full name</span>
          <input
            className="food-modal__input"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className="food-modal__field">
          <span className="food-modal__label">Email</span>
          <input
            className="food-modal__input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="food-modal__field">
          <span className="food-modal__label">Role</span>
          <select className="food-modal__select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>
    </FormPageShell>
  );
}
