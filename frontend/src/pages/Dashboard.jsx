import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { apiGet } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const headingRef = useRef(null);
  const helpButtonRef = useRef(null);
  const helpHeadingRef = useRef(null);

  const [showHelp, setShowHelp] = useState(false);

  /*
    Backend status is only a quiet visual indicator.

    We intentionally do NOT use aria-live or role="alert".
    This prevents the automatic background health check
    from interrupting screen-reader users.
  */
  const [backendStatus, setBackendStatus] = useState("checking");

  /*
    Keep the existing fallback behaviour in case a translation
    key has not been added yet.
  */
  const text = (key, fallback) => {
    const translated = t(key);

    if (!translated || translated === key) {
      return fallback;
    }

    return translated;
  };

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  /*
    Quiet backend health check.

    FastAPI endpoint:
    GET /health

    Expected response:
    {
      "status": "ok"
    }
  */
  useEffect(() => {
    let mounted = true;

    async function checkBackend() {
      try {
        const data = await apiGet("/health");

        if (!mounted) {
          return;
        }

        if (data?.status === "ok") {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch (error) {
        if (mounted) {
          setBackendStatus("offline");
        }
      }
    }

    checkBackend();

    return () => {
      mounted = false;
    };
  }, []);

  function navigateWithFocus(path) {
    navigate(path);
  }

  function openHelp() {
    setShowHelp(true);

    requestAnimationFrame(() => {
      helpHeadingRef.current?.focus();
    });
  }

  function closeHelp() {
    setShowHelp(false);

    requestAnimationFrame(() => {
      helpButtonRef.current?.focus();
    });
  }

  function getBackendStatusText() {
    switch (backendStatus) {
      case "online":
        return "Server connected";

      case "offline":
        return "Server unavailable";

      default:
        return "Checking server";
    }
  }

  return (
    <main className="page-container">
      <header>
        <h1 ref={headingRef} tabIndex="-1">
          {text("dashboard.title", "Udaan Dashboard")}
        </h1>

        <p>
          {text(
            "dashboard.welcome",
            "Choose where you would like to go."
          )}
        </p>

        {/*
          No aria-live and no role="alert".

          The text is available if a screen-reader user
          chooses to navigate to it, but it will not suddenly
          interrupt them when the network request finishes.
        */}
        <p
          className={`backend-status backend-status--${backendStatus}`}
          aria-live="off"
        >
          <span aria-hidden="true">
            {backendStatus === "online" && "● "}
            {backendStatus === "offline" && "○ "}
            {backendStatus === "checking" && "… "}
          </span>

          {getBackendStatusText()}
        </p>
      </header>

      <nav
        className="dashboard-actions"
        aria-label={text(
          "dashboard.navigation",
          "Dashboard navigation"
        )}
      >
        <button
          type="button"
          className="large-button"
          onClick={() => navigateWithFocus("/exams")}
        >
          {text("dashboard.exams", "Exams")}
        </button>

        <button
          type="button"
          className="large-button"
          onClick={() => navigateWithFocus("/progress")}
        >
          {text("dashboard.progress", "Progress")}
        </button>

        <button
          type="button"
          className="large-button"
          onClick={() => navigateWithFocus("/setup")}
        >
          {text("dashboard.settings", "Settings")}
        </button>

        <button
          ref={helpButtonRef}
          type="button"
          className="large-button"
          onClick={openHelp}
          aria-expanded={showHelp}
          aria-controls="dashboard-help"
        >
          {text("dashboard.help", "Help")}
        </button>
      </nav>

      {showHelp && (
        <section
          id="dashboard-help"
          className="dashboard-help"
          aria-labelledby="dashboard-help-heading"
        >
          <h2
            id="dashboard-help-heading"
            ref={helpHeadingRef}
            tabIndex="-1"
          >
            {text("help.title", "Help")}
          </h2>

          <p>
            {text(
              "help.dashboard",
              "Use Tab to move between controls and Enter or Space to activate a button. You can also use Udaan keyboard shortcuts and voice commands when enabled."
            )}
          </p>

          <button type="button" onClick={closeHelp}>
            {text("common.close", "Close")}
          </button>
        </section>
      )}
    </main>
  );
}

export default Dashboard;