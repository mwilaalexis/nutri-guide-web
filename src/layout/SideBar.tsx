import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

type MenuItem = {
  label: string;
  path: string;
  roles: string[];
};

type MenuSection = {
  section: string;
  roles: string[];
};

type MenuEntry = MenuItem | MenuSection;

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function isSection(entry: MenuEntry): entry is MenuSection {
  return "section" in entry;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [role, setRole] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Load role safely after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const stored = localStorage.getItem("role")?.toLowerCase() || null;
    setRole(stored);
  }, []);

  // Track desktop/mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);

    update(); // initial
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Close on ESC (mobile only)
  useEffect(() => {
    if (!mobileOpen || isDesktop) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, isDesktop, onMobileClose]);

  const menuConfig: MenuEntry[] = [
    { section: "Navigation", roles: ["user", "admin", "moderator"] },
    { label: "Dashboard", path: "/dashboard", roles: ["user", "admin", "moderator"] },
    { label: "Gallery", path: "/dashboard/gallery", roles: ["user", "admin", "moderator"] },
    { label: "Plans", path: "/dashboard/plans", roles: ["user", "admin", "moderator"] },
    { label: "Notifications", path: "/dashboard/notifications/inbox", roles: ["user", "admin", "moderator"] },
    { label: "Settings", path: "/dashboard/settings", roles: ["user", "admin", "moderator"] },
    { label: "Tracking", path: "/dashboard/tracking", roles: ["user", "admin", "moderator"] },

    { section: "Admin", roles: ["admin"] },
    { label: "Users", path: "/dashboard/users", roles: ["admin"] },
    { label: "Admin Management", path: "/dashboard/admin", roles: ["admin"] },
    { label: "Food", path: "/dashboard/food", roles: ["admin"] },
    { label: "Permissions", path: "/dashboard/permissions", roles: ["admin"] },

    { section: "Monitoring", roles: ["admin", "moderator"] },
    { label: "System logs", path: "/dashboard/logs", roles: ["admin", "moderator"] },
    { label: "Performance", path: "/dashboard/performance", roles: ["admin", "moderator"] },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "dashboard-sidebar__link dashboard-sidebar__link--active"
      : "dashboard-sidebar__link";

  const sidebarClass = [
    "dashboard-sidebar",
    mobileOpen || isDesktop ? "dashboard-sidebar--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {mobileOpen && !isDesktop && (
        <button
          type="button"
          className="dashboard-sidebar-overlay"
          aria-label="Close menu"
          onClick={onMobileClose}
        />
      )}

      <aside className={sidebarClass} aria-hidden={!isDesktop && !mobileOpen}>
        <div className="dashboard-sidebar__mobile-header">
          <span className="dashboard-sidebar__mobile-label">Menu</span>
          <button type="button" className="dashboard-sidebar__close" onClick={onMobileClose}>
            Close
          </button>
        </div>

        <h3 className="dashboard-sidebar__title">Menu</h3>

        <ul className="dashboard-sidebar__menu">
          {menuConfig.map((item, index) => {
            if (!role || !item.roles.includes(role)) return null;

            if (isSection(item)) {
              return (
                <li key={index} className="dashboard-sidebar__section">
                  {item.section}
                </li>
              );
            }

            return (
              <li key={index}>
                <NavLink to={item.path} className={linkClass} onClick={onMobileClose}>
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
