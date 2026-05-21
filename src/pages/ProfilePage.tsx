import { useEffect, useState } from "react";
import axios from "axios";
import { ProfileService } from "../services/profile.service";
import AuthService from "../services/auth.service";

function isMissingProfileError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}
import type { ProfileDto } from "../Types/global-types";
import Avatar from "../components/profile/Avatar";
import { applyProfileToSession } from "../utils/profileSession";
import { useNavigate } from "react-router-dom";
import Navbar from "../layout/Navbar";

function useLogout() {
  const navigate = useNavigate();

  return () => {
    void AuthService.logout().finally(() => navigate("/login", { replace: true }));
  };
}

type FormState = Omit<Partial<ProfileDto>, "allergies"> & { allergies?: string };

function allergiesToFormValue(allergies: ProfileDto["allergies"] | string | undefined): string {
  if (typeof allergies === "string") return allergies;
  if (Array.isArray(allergies)) return allergies.join(", ");
  return "";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({});
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const logout = useLogout();

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  useEffect(() => {
    ProfileService.getMe()
      .then((res) => {
        const data = res.data;
        setProfile(data);
        setLoadError(null);
        applyProfileToSession(data);
        setForm({
          ...data,
          allergies: allergiesToFormValue(data.allergies),
        });
      })
      .catch((err) => {
        setProfile(null);
        if (isMissingProfileError(err)) {
          setLoadError(null);
          return;
        }
        setLoadError("Could not load your profile. You can still create one below.");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();

    formData.append("fullName", form.fullName ?? "");
    formData.append("email", form.email ?? "");
    formData.append("biologicalSex", form.biologicalSex ?? "");
    formData.append("weightKg", String(form.weightKg ?? ""));
    formData.append("heightCm", String(form.heightCm ?? ""));
    formData.append("activityLevel", form.activityLevel ?? "");
    formData.append("goal", form.goal ?? "");
    formData.append("allergies", typeof form.allergies === "string" ? form.allergies : "");
    formData.append("age", String(form.age ?? ""));
    formData.append("dietType", form.dietType ?? "");
    formData.append("CreatedAt", Date.now().toString());
    formData.append("UpdatedAt", Date.now().toString());

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      if (profile) {
        await ProfileService.update(formData);
        alert("Profile updated.");
      } else {
        await ProfileService.create(formData);
        alert("Profile created.");
      }

      const res = await ProfileService.getMe();
      const data = res.data;
      setProfile(data);
      setProfileImage(null);
      applyProfileToSession(data);
      setForm({
        ...data,
        allergies: allergiesToFormValue(data.allergies),
      });
      navigate("/dashboard");
    } catch {
      alert("Could not save profile. Check that the API gateway is running and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="profile-page">
          <div className="profile-page__inner profile-page__inner--loading">
            <p className="profile-loading-text">Loading profile…</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <div className="profile-page__inner">
          {loadError && (
            <p className="profile-load-error" role="alert">
              {loadError}
            </p>
          )}
          <header className="profile-hero card">
            <div className="profile-hero__main">
              <div className="profile-hero__avatar">
                <Avatar
                  fullName={form.fullName ?? ""}
                  src={previewUrl ?? profile?.profileUrl}
                  size={104}
                />
              </div>
              <div className="profile-hero__text">
                <p className="profile-hero__kicker">Your profile</p>
                <h1 className="profile-hero__title">{form.fullName?.trim() || "Complete your profile"}</h1>
                <p className="profile-hero__email">{form.email || "Add your details below to personalize meal plans."}</p>
                {profileImage && (
                  <p className="profile-hero__pending">New photo selected — save profile to apply.</p>
                )}
              </div>
            </div>
            <div className="profile-hero__toolbar">
              <label className="profile-btn profile-btn--secondary">
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  className="profile-file-input"
                  onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)}
                />
              </label>
              <button type="button" className="profile-btn profile-btn--secondary" onClick={() => navigate("/dashboard")}>
                Back to dashboard
              </button>
              <button type="button" className="profile-btn profile-btn--ghost" onClick={logout}>
                Log out
              </button>
            </div>
          </header>

          <form className="profile-form profile-form--elevated" onSubmit={handleSubmit}>
            <Section title="Personal information" description="Identity and contact used across the app.">
              <ProfileField label="Full name">
                <input
                  type="text"
                  className="profile-input"
                  value={form.fullName ?? ""}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  autoComplete="name"
                />
              </ProfileField>
              <ProfileField label="Email">
                <input
                  type="email"
                  className="profile-input"
                  value={form.email ?? ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  autoComplete="email"
                />
              </ProfileField>
              <ProfileField label="Biological sex">
                <select
                  className="profile-select"
                  value={form.biologicalSex ?? ""}
                  onChange={(e) => updateField("biologicalSex", e.target.value)}
                >
                  <option value="">Select</option>
                  {["Male", "Female"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </ProfileField>
            </Section>

            <Section title="Physical data" description="Used to estimate energy needs and BMI.">
              <div className="profile-field-row">
                <ProfileField label="Weight (kg)">
                  <input
                    type="number"
                    className="profile-input"
                    value={form.weightKg ?? ""}
                    onChange={(e) => updateField("weightKg", e.target.value === "" ? undefined : Number(e.target.value))}
                    min={0}
                    step={0.1}
                  />
                </ProfileField>
                <ProfileField label="Height (cm)">
                  <input
                    type="number"
                    className="profile-input"
                    value={form.heightCm ?? ""}
                    onChange={(e) => updateField("heightCm", e.target.value === "" ? undefined : Number(e.target.value))}
                    min={0}
                    step={1}
                  />
                </ProfileField>
              </div>
              <ProfileField label="Age">
                <input
                  type="number"
                  className="profile-input"
                  value={form.age ?? ""}
                  onChange={(e) => updateField("age", e.target.value === "" ? undefined : Number(e.target.value))}
                  min={0}
                  max={120}
                />
              </ProfileField>
            </Section>

            <Section title="Habits & goals" description="Drives calorie targets and plan recommendations.">
              <ProfileField label="Activity level">
                <select
                  className="profile-select"
                  value={form.activityLevel ?? ""}
                  onChange={(e) => updateField("activityLevel", e.target.value)}
                >
                  <option value="">Select</option>
                  {["Sedentary", "Light", "Moderate", "Active"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </ProfileField>
              <ProfileField label="Goal">
                <select className="profile-select" value={form.goal ?? ""} onChange={(e) => updateField("goal", e.target.value)}>
                  <option value="">Select</option>
                  {[
                    { v: "LoseWeight", l: "Lose weight" },
                    { v: "Maintain", l: "Maintain" },
                    { v: "GainMuscle", l: "Gain muscle" },
                  ].map(({ v, l }) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </ProfileField>
            </Section>

            <Section title="Nutrition" description="Allergies and diet style filter foods and generated plans.">
              <ProfileField label="Allergies (comma-separated)">
                <input
                  type="text"
                  className="profile-input"
                  placeholder="e.g. peanuts, shellfish"
                  value={typeof form.allergies === "string" ? form.allergies : ""}
                  onChange={(e) => updateField("allergies", e.target.value)}
                />
              </ProfileField>
              <ProfileField label="Diet type">
                <select className="profile-select" value={form.dietType ?? ""} onChange={(e) => updateField("dietType", e.target.value)}>
                  <option value="">Select</option>
                  {[
                    { v: "Balanced", l: "Balanced" },
                    { v: "Keto", l: "Keto" },
                    { v: "Vegan", l: "Vegan" },
                    { v: "Vegetarian", l: "Vegetarian" },
                    { v: "HighProtein", l: "High protein" },
                  ].map(({ v, l }) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </ProfileField>
            </Section>

            <div className="profile-submit-bar">
              <p className="profile-submit-bar__hint">
                {profile ? "Changes are saved to your account." : "Create your profile to unlock meal plans and the dashboard."}
              </p>
              <button
                type="submit"
                className="btn btn-primary profile-submit-bar__btn"
                disabled={saving}
              >
                {saving ? "Saving…" : profile ? "Save profile" : "Create profile"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="profile-section">
      <div className="profile-section__head">
        <h2 className="profile-section__title">{title}</h2>
        {description ? <p className="profile-section__desc">{description}</p> : null}
      </div>
      <div className="profile-section__body">{children}</div>
    </section>
  );
}

function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="profile-field">
      <label className="profile-field__label">{label}</label>
      {children}
    </div>
  );
}
