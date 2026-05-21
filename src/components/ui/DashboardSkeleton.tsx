import type { CSSProperties } from "react";

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-page dashboard-page--rich" aria-busy="true" aria-label="Loading dashboard">
      <div className="dashboard-page__inner dash-page-shell">
        <header className="dash-welcome dash-welcome--elevated ng-reveal" style={{ "--ng-delay": "0ms" } as CSSProperties}>
          <div className="dash-welcome__main">
            <div className="ng-skeleton ng-skeleton--circle" style={{ width: "4.5rem", height: "4.5rem" }} />
            <div style={{ flex: 1 }}>
              <div className="ng-skeleton ng-skeleton--text" style={{ width: "40%" }} />
              <div className="ng-skeleton ng-skeleton--title" />
              <div className="ng-skeleton ng-skeleton--text" style={{ width: "85%" }} />
            </div>
          </div>
        </header>
        <div className="dash-spotlight ng-reveal" style={{ "--ng-delay": "80ms" } as CSSProperties}>
          <div className="ng-skeleton ng-skeleton--block" style={{ minHeight: "12rem" }} />
        </div>
        <div
          className="ng-reveal"
          style={
            {
              "--ng-delay": "160ms",
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
            } as CSSProperties
          }
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="ng-skeleton ng-skeleton--block" style={{ height: "5.5rem" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
