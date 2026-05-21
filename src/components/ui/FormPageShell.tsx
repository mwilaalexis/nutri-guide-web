import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type FormPageShellProps = {
  title: string;
  kicker?: string;
  subtitle?: string;
  backTo: string;
  backLabel?: string;
  size?: "default" | "wide" | "compact";
  footer?: ReactNode;
  children: ReactNode;
};

export default function FormPageShell({
  title,
  kicker,
  subtitle,
  backTo,
  backLabel = "Back",
  size = "default",
  footer,
  children,
}: FormPageShellProps) {
  const sizeClass =
    size === "wide" ? " form-page--wide" : size === "compact" ? " form-page--compact" : "";

  return (
    <div className={`app-page form-page${sizeClass}`}>
      <header className="form-page__header">
        <Link to={backTo} className="btn btn-sm btn-secondary form-page__back">
          ← {backLabel}
        </Link>
        <div className="form-page__header-text">
          {kicker && <p className="app-page__kicker">{kicker}</p>}
          <h1 className="app-page__title">{title}</h1>
          {subtitle && <p className="app-page__subtitle">{subtitle}</p>}
        </div>
      </header>

      <section className="app-panel form-page__body">{children}</section>

      {footer && <footer className="form-page__footer">{footer}</footer>}
    </div>
  );
}
