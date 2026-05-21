import { Link } from "react-router-dom";
import ThemeSettings from "../components/theme/ThemeSettings";

export default function Settings() {
  return (
    <main className="settings-page">
      <header className="settings-page__header">
        <div>
          <p className="settings-page__kicker">Preferences</p>
          <h1 className="settings-page__title">Settings</h1>
          <p className="settings-page__subtitle">
            Customize how NutriGuide looks and feels on your device.
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-secondary">
          Back to dashboard
        </Link>
      </header>

      <div className="settings-page__card card">
        <ThemeSettings />
      </div>
    </main>
  );
}
