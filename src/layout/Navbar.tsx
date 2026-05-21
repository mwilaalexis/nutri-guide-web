import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthService from "../services/auth.service";
import Avatar from "../components/profile/Avatar";
import { syncProfileToSession } from "../utils/profileSession";
type NavbarProps = {
  /** When set, shows a menu control to open the dashboard sidebar on small screens */
  showDashboardMenu?: boolean;
  onDashboardMenuClick?: () => void;
};

export default function Navbar({
  showDashboardMenu = false,
  onDashboardMenuClick,
}: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => AuthService.isLoggedIn());
  const [fullName, setFullName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    const loggedIn = AuthService.isLoggedIn();
    setIsLoggedIn(loggedIn);
    setFullName(localStorage.getItem("userName") ?? "");
    setProfileUrl(localStorage.getItem("profileUrl") ?? "");

    if (loggedIn) {
      void syncProfileToSession().then((url) => setProfileUrl(url));
    }

    const onProfileUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ profileUrl?: string; fullName?: string }>).detail;
      if (detail?.profileUrl != null) setProfileUrl(detail.profileUrl);
      if (detail?.fullName) setFullName(detail.fullName);
    };
    window.addEventListener("profile-updated", onProfileUpdated);
    return () => window.removeEventListener("profile-updated", onProfileUpdated);
  }, []);

  return (
    <nav className="app-navbar">
      <div className="app-navbar__start">
        {showDashboardMenu && (
          <button
            type="button"
            className="app-navbar__menu-btn"
            onClick={onDashboardMenuClick}
            aria-label="Open navigation menu"
          >
            <span className="app-navbar__menu-icon" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
        )}
        <Link to="/" className="app-navbar__logo">
          NutriGuide
        </Link>
      </div>

      <ul className="app-navbar__links">
        <li>
          <a href="/#hero">Home</a>
        </li>
        <li>
          <a href="/#about">About</a>
        </li>
        <li className="app-navbar__link--hide-sm">
          <a href="/#service">Services</a>
        </li>
        <li>
          <a href="/#contact">Contact</a>
        </li>
        {isLoggedIn && (
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/dashboard/notifications/inbox">Notifications</Link>
            </li>
          </>
        )}
      </ul>

      <div className="app-navbar__end">
        {isLoggedIn ? (
          <Link
            to="/profile"
            className="app-navbar__profile"
            aria-label="Open your profile"
            title="Profile"
          >
            <Avatar fullName={fullName} src={profileUrl} size={40} />
            <span className="app-navbar__profile-label">Profile</span>
          </Link>
        ) : (
          <Link to="/login" className="app-navbar__login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
