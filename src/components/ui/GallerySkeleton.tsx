import type { CSSProperties } from "react";

export default function GallerySkeleton() {
  return (
    <ul
      className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading gallery"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i} className="ng-reveal" style={{ "--ng-delay": `${i * 40}ms` } as CSSProperties}>
          <div className="ng-skeleton" style={{ aspectRatio: "4/3", borderRadius: "var(--radius)" }} />
        </li>
      ))}
    </ul>
  );
}
