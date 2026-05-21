import type { CSSProperties } from "react";

export default function PlansSkeleton() {
  return (
    <div className="plans-card-grid" aria-busy="true" aria-label="Loading plans">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="plan-list-card card ng-reveal"
          style={{ "--ng-delay": `${i * 70}ms` } as CSSProperties}
        >
          <div className="ng-skeleton ng-skeleton--title" />
          <div className="ng-skeleton ng-skeleton--text" style={{ width: "70%" }} />
          <div className="ng-skeleton ng-skeleton--text" style={{ width: "50%" }} />
          <div className="ng-skeleton ng-skeleton--block" style={{ height: "2.5rem", marginTop: "0.5rem" }} />
        </div>
      ))}
    </div>
  );
}
