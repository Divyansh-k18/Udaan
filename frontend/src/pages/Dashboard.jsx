import { Icon, LearningIllustration } from "../components/Visuals";
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

        if (data?.status === "ok" || data?.ok === true) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch {
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
    <section className="page-container">
      <header className="dashboard-hero">
        <p className="eyebrow">YOUR LEARNING SPACE</p>
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

      <section className="journey-card modern-hero" aria-labelledby="journey-title">
        <div className="hero-copy"><p className="eyebrow">A CLEARER PATH FORWARD</p>
          <h2 id="journey-title">Build confidence.<br />One question at a time.</h2>
          <p>Prepare independently, practise at your pace, and take your next step with confidence.</p>
          <button className="primary-button hero-cta" onClick={() => navigate("/exams")}>Start practising <Icon name="arrow" /></button>
          <div className="feature-pills"><span><Icon name="keyboard" /> Keyboard ready</span><span><Icon name="headphones" /> Guided learning</span><span><Icon name="display" /> Your display, your way</span></div>
        </div>
        <div className="hero-art"><LearningIllustration /></div>
      </section>
      <ol className="journey-steps landscape-steps">
        <li><span className="step-number" aria-hidden="true">01</span><div><strong>Prepare</strong><span>Learn with clear explanations</span></div></li>
        <li><span className="step-number" aria-hidden="true">02</span><div><strong>Try a mock</strong><span>Build confidence with timed practice</span></div></li>
        <li><span className="step-number" aria-hidden="true">03</span><div><strong>See your progress</strong><span>Know what to work on next</span></div></li>
      </ol>
      <h2>Explore Udaan</h2>
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
          <span className="action-icon"><Icon name="book" /></span>{text("dashboard.exams", "Exams")}<span className="card-detail">Choose a practice or mock test</span>
        </button>

        <button
          type="button"
          className="large-button"
          onClick={() => navigateWithFocus("/progress")}
        >
          <span className="action-icon"><Icon name="chart" /></span>{text("dashboard.progress", "Progress")}<span className="card-detail">Review scores and learning trends</span>
        </button>

        <button
          type="button"
          className="large-button"
          onClick={() => navigateWithFocus("/setup?edit=1")}
        >
          <span className="action-icon"><Icon name="settings" /></span>{text("dashboard.settings", "Settings")}<span className="card-detail">Adjust reading, voice and extra time</span>
        </button>

        <button
          ref={helpButtonRef}
          type="button"
          className="large-button"
          onClick={openHelp}
          aria-expanded={showHelp}
          aria-controls="dashboard-help"
        >
          <span className="action-icon"><Icon name="help" /></span>{text("dashboard.help", "Help")}<span className="card-detail">Find keyboard and voice controls</span>
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
    </section>
  );
}

export default Dashboard;