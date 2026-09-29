import { useEffect, useRef } from "react";
import {
  Link,
  Outlet,
  useLocation,
} from "react-router-dom";

import HelpDialog from "./HelpDialog";
import VoiceStatus from "./VoiceStatus";
import "../styles/components.css";

function Layout() {
  const mainRef = useRef(null);
  const location = useLocation();

  // Move focus to main content after page navigation
  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Accessible skip link */}
      <a
        className="skip-link"
        href="#main-content"
      >
        Skip to main content
      </a>

      <header className="app-header">
        <div className="app-brand-area">
          <Link
            to="/dashboard"
            className="app-brand"
            aria-label="Go to Udaan dashboard"
          >
            Udaan
          </Link>

          <p className="app-tagline">
            Accessible Exam Platform
          </p>
        </div>

        <div className="app-header-actions">
          <VoiceStatus />
          <HelpDialog />
        </div>
      </header>

      <main
        ref={mainRef}
        id="main-content"
        className="app-main"
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;