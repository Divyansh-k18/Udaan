import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import "../styles/themes.css";

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const headingRef = useRef(null);
  const helpButtonRef = useRef(null);
  const helpHeadingRef = useRef(null);

  const [showHelp, setShowHelp] = useState(false);

  const text = (key, fallback) => {
    const translated = t(key);

    if (!translated || translated === key) {
      return fallback;
    }

    return translated;
  };

  // When Dashboard opens after Login,
  // keyboard/screen-reader focus moves to the page heading.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const navigateWithFocus = (path) => {
    navigate(path);

    // After React Router changes the page,
    // move focus to the new page's main heading.
    setTimeout(() => {
      const heading = document.querySelector("main h1, h1");

      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }
    }, 0);
  };

  const openHelp = () => {
    setShowHelp(true);

    setTimeout(() => {
      helpHeadingRef.current?.focus();
    }, 0);
  };

  const closeHelp = () => {
    setShowHelp(false);

    setTimeout(() => {
      helpButtonRef.current?.focus();
    }, 0);
  };

  const userEmail = localStorage.getItem("udaan-demo-user");

  return (
    <main
      className="setup-page"
      aria-labelledby="dashboard-heading"
    >
      <div className="setup-container">
        <section className="setup-card">
          <header className="setup-header">
            <h1
              id="dashboard-heading"
              ref={headingRef}
              tabIndex="-1"
            >
              {text("dashboard.title", "Udaan Dashboard")}
            </h1>

            <p>
              {text(
                "dashboard.description",
                "Choose what you would like to do."
              )}
            </p>

            {userEmail && (
              <p>
                {text("dashboard.signedInAs", "Signed in as")}:{" "}
                <strong>{userEmail}</strong>
              </p>
            )}
          </header>

          <nav
            aria-label={text(
              "dashboard.navigation",
              "Dashboard navigation"
            )}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "1rem",
              marginTop: "2rem",
            }}
          >
            <button
              type="button"
              className="primary-button"
              onClick={() => navigateWithFocus("/exams")}
              style={{
                width: "100%",
                minHeight: "72px",
                fontSize: "1.15rem",
              }}
            >
              {text("dashboard.exams", "Exams")}
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigateWithFocus("/progress")}
              style={{
                width: "100%",
                minHeight: "72px",
                fontSize: "1.15rem",
              }}
            >
              {text("dashboard.progress", "Progress")}
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigateWithFocus("/setup")}
              style={{
                width: "100%",
                minHeight: "72px",
                fontSize: "1.15rem",
              }}
            >
              {text("dashboard.settings", "Settings")}
            </button>

            <button
              ref={helpButtonRef}
              type="button"
              className="primary-button"
              onClick={openHelp}
              aria-expanded={showHelp}
              aria-controls="dashboard-help"
              style={{
                width: "100%",
                minHeight: "72px",
                fontSize: "1.15rem",
              }}
            >
              {text("dashboard.help", "Help")}
            </button>
          </nav>

          {showHelp && (
            <section
              id="dashboard-help"
              className="setup-section"
              aria-labelledby="help-heading"
              style={{
                marginTop: "2rem",
                padding: "1.25rem",
                border: "2px solid currentColor",
                borderRadius: "12px",
              }}
            >
              <h2
                id="help-heading"
                ref={helpHeadingRef}
                tabIndex="-1"
              >
                {text("help.title", "Help")}
              </h2>

              <p>
                {text(
                  "help.dashboardMessage",
                  "Use Tab to move through buttons and press Enter or Space to activate them."
                )}
              </p>

              <p>
                {text(
                  "help.accessibilityMessage",
                  "You can change contrast, text size, voice settings and extra time from Settings."
                )}
              </p>

              <button
                type="button"
                className="secondary-button"
                onClick={closeHelp}
              >
                {text("common.close", "Close Help")}
              </button>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;