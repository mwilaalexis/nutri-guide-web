import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./SideBar";
import PageTransition from "../components/ui/PageTransition";
import DevApiBanner from "../components/dev/DevApiBanner";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setSidebarOpen(false);
    };

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <>
      <Navbar
        showDashboardMenu
        onDashboardMenuClick={() => setSidebarOpen(true)}
      />

      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="dashboard-main">
        <DevApiBanner />
        <PageTransition />
      </main>
    </>
  );
}
