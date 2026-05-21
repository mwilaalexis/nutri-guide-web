import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import AuthService from "../services/auth.service";
import { syncProfileToSession } from "../utils/profileSession";
import Navbar from "../layout/Navbar";
import { httpErrorMessage } from "../utils/httpErrorMessage";

type LoginLocationState = {
  from?: string;
  registered?: boolean;
  email?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successBanner, setSuccessBanner] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (AuthService.isLoggedIn()) {
      const from = (location.state as LoginLocationState | null)?.from;
      navigate(from && from.startsWith("/") ? from : "/dashboard", { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const st = location.state as LoginLocationState | null;
    if (st?.registered) {
      setSuccessBanner("Your account was created. Sign in with your email and password.");
      if (typeof st.email === "string" && st.email.trim()) {
        setForm((f) => ({ ...f, email: st.email!.trim() }));
      }
      navigate(location.pathname, { replace: true, state: { from: st.from } });
    }
  }, [location.pathname, location.state, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await AuthService.login({
        email: form.email,
        password: form.password,
      });
      await syncProfileToSession();

      const from = (location.state as LoginLocationState | null)?.from;
      navigate(from && from.startsWith("/") ? from : "/dashboard", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 400) {
          setError("Invalid email or password.");
        } else {
          setError(httpErrorMessage(err, "Unable to sign in. Please try again."));
        }
      } else {
        setError("Unable to sign in. Please try again.");
      }
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
        <h2>Welcome Back!</h2>
        <p className="auth-subtitle">Log in to continue</p>

        {successBanner && <p className="auth-success">{successBanner}</p>}
        {error && <p className="auth-error">{error}</p>}

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
          placeholder="Password"
          autoComplete="current-password"
          aria-invalid={error ? true : undefined}
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="auth-btn" disabled={submitting} aria-busy={submitting}>
          {submitting ? "Signing in…" : "Login"}
        </button>

        <p className="auth-switch">
          No account? <Link to="/register">Create one here</Link>
        </p>
      </form>
    </div>
    </>
  );
}
