import { Outlet, useLocation } from "react-router-dom";

/** Fade/slide dashboard child routes on navigation. */
export default function PageTransition() {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="page-enter">
      <Outlet />
    </div>
  );
}
