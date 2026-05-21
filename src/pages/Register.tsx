import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthService from "../services/auth.service";
import Navbar from "../layout/Navbar";
import { httpErrorMessage } from "../utils/httpErrorMessage";

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    if (AuthService.isLoggedIn()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    /** Always register as a standard user; elevated roles are assigned by admins only. */
    role: "user",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await AuthService.register({
        ...form,
        role: "user",
        createdAt: new Date().toISOString(),
      });

      navigate("/login", {
        state: { registered: true, email: form.email.trim() },
      });
    } catch (err: unknown) {
      setError(httpErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit} aria-busy={submitting}>
        <p className="auth-nav-back">
          <Link to="/" className="auth-back">
            ← Back to home
          </Link>
        </p>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join NutriGuide today</p>

        {error && <p className="auth-error">{error}</p>}

        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          autoComplete="given-name"
          aria-invalid={error ? true : undefined}
          value={form.firstName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          autoComplete="family-name"
          aria-invalid={error ? true : undefined}
          value={form.lastName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          aria-invalid={error ? true : undefined}
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password (min. 6 characters)"
          autoComplete="new-password"
          minLength={6}
          aria-invalid={error ? true : undefined}
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="auth-btn" disabled={submitting} aria-busy={submitting}>
          {submitting ? "Creating account…" : "Register"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
    </>
  );
}
