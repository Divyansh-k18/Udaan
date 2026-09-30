import { BrandMark, LearningIllustration } from "../components/Visuals";
import { storage } from "../services/storage.js";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAccessibility } from "../context/AccessibilityContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

import "../styles/themes.css";

export default function Setup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editing = searchParams.get("edit") === "1";

  const headingRef = useRef(null);
  const startButtonRef = useRef(null);

  const {
    preferences,
    updatePreference,
    resetPreferences,
  } = useAccessibility();

  const {
    language,
    setLanguage,
    languages,
    t,
  } = useLanguage();

  /*
    When opening Settings from inside Udaan,
    skip the welcome page.

    On the very first visit,
    show "Press Enter to start".
  */
  const [started, setStarted] = useState(editing);

  /*
    FIRST PAGE ONLY

    Focus the start button so NVDA/screen readers
    announce "Press Enter to start, button".
  */
  useEffect(() => {
    if (!started) {
      startButtonRef.current?.focus();
    }
  }, [started]);

  /*
    After Enter/start is pressed,
    focus the Accessibility Setup heading.

    We DO NOT read the welcome instructions again.
  */
  useEffect(() => {
    document.title = "Accessibility setup | Udaan";

    if (started) {
      requestAnimationFrame(() => {
        headingRef.current?.focus();
      });
    }
  }, [started]);

  function handleStart() {
    setStarted(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      storage.setItem(
        "udaan-setup-complete",
        "true"
      );
    } catch {
      /*
        Preferences can still work for the
        current browser session.
      */
    }

    navigate(
      editing
        ? "/dashboard"
        : "/login"
    );
  }

  /*
    --------------------------------------------------
    FIRST PAGE
    --------------------------------------------------

    This is the ONLY page that shows the initial
    Udaan instructions.

    The start button receives focus automatically.
  */
  if (!started) {
    return (
      <main
        className="setup-page"
        id="main-content"
        tabIndex={-1}
      >
        <section className="start-card landscape-welcome">
          <div className="welcome-copy">
            <p className="brand">
              <BrandMark /> Udaan
            </p>

            <h1>
              {t("setup.welcome")}
            </h1>

            <p className="welcome-promise">
              Your ambition. Your pace.
              <br />
              Your way to learn.
            </p>

            <p>
              Independent exam preparation with
              readable questions, keyboard controls
              and optional voice support.
            </p>

            {/*
              Initial instructions appear ONLY here.
            */}
            <p className="setup-description">
              {t("setup.instructions")}
            </p>

            <button
              ref={startButtonRef}
              type="button"
              className="primary-button start-button"
              onClick={handleStart}
              aria-label="Press Enter to start"
            >
              Press Enter to start
            </button>
          </div>

          <div className="welcome-art">
            <LearningIllustration />
          </div>
        </section>
      </main>
    );
  }

  /*
    --------------------------------------------------
    ACCESSIBILITY SETTINGS
    --------------------------------------------------

    IMPORTANT:
    setup.instructions is intentionally NOT shown here.

    That prevents the initial instructions from
    being repeated after the user presses Enter.
  */
  return (
    <main
      className="setup-page"
      id="main-content"
    >
      <form
        className="setup-card landscape-setup"
        onSubmit={handleSubmit}
      >
        <header className="setup-header">
          <p className="brand">
            <BrandMark /> Udaan
          </p>

          <h1
            ref={headingRef}
            tabIndex={-1}
          >
            {t("setup.title")}
          </h1>
        </header>

        {/* LANGUAGE */}

        <fieldset className="setup-section">
          <legend>
            {t("language.title")}
          </legend>

          <p>
            {t("language.description")}
          </p>

          <label htmlFor="language-select">
            {t("language.title")}
          </label>

          <select
            id="language-select"
            className="setup-select"
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value)
            }
          >
            {languages.map((item) => (
              <option
                key={item.code}
                value={item.code}
              >
                {item.nativeName}
              </option>
            ))}
          </select>
        </fieldset>

        {/* THEME */}

        <fieldset className="setup-section">
          <legend>
            {t("setup.theme")}
          </legend>

          <div className="option-grid">
            <label className="option-card">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={
                  preferences.theme === "light"
                }
                onChange={(event) =>
                  updatePreference(
                    "theme",
                    event.target.value
                  )
                }
              />

              <span>
                {t("theme.light")}
              </span>
            </label>

            <label className="option-card">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={
                  preferences.theme === "dark"
                }
                onChange={(event) =>
                  updatePreference(
                    "theme",
                    event.target.value
                  )
                }
              />

              <span>
                {t("theme.dark")}
              </span>
            </label>

            <label className="option-card">
              <input
                type="radio"
                name="theme"
                value="high-contrast"
                checked={
                  preferences.theme ===
                  "high-contrast"
                }
                onChange={(event) =>
                  updatePreference(
                    "theme",
                    event.target.value
                  )
                }
              />

              <span>
                {t("theme.highContrast")}
              </span>
            </label>
          </div>
        </fieldset>

        {/* TEXT SIZE */}

        <fieldset className="setup-section">
          <legend>
            {t("setup.textSize")}
          </legend>

          <label htmlFor="text-size">
            {t("setup.textSize")}:{" "}
            <strong>
              {preferences.textSize}%
            </strong>
          </label>

          <input
            id="text-size"
            type="range"
            min="100"
            max="200"
            step="10"
            value={preferences.textSize}
            onChange={(event) =>
              updatePreference(
                "textSize",
                Number(event.target.value)
              )
            }
          />
        </fieldset>

        {/* VOICE MODE */}

        <fieldset className="setup-section">
          <legend>
            {t("setup.voiceMode")}
          </legend>

          <div className="option-grid">
            <label className="option-card">
              <input
                type="radio"
                name="voiceMode"
                value="udaan"
                checked={
                  preferences.voiceMode ===
                  "udaan"
                }
                onChange={(event) =>
                  updatePreference(
                    "voiceMode",
                    event.target.value
                  )
                }
              />

              <span>
                {t("voice.udaan")}
              </span>
            </label>

            <label className="option-card">
              <input
                type="radio"
                name="voiceMode"
                value="screen-reader"
                checked={
                  preferences.voiceMode ===
                  "screen-reader"
                }
                onChange={(event) =>
                  updatePreference(
                    "voiceMode",
                    event.target.value
                  )
                }
              />

              <span>
                {t("voice.screenReader")}
              </span>
            </label>

            <label className="option-card">
              <input
                type="radio"
                name="voiceMode"
                value="silent"
                checked={
                  preferences.voiceMode ===
                  "silent"
                }
                onChange={(event) =>
                  updatePreference(
                    "voiceMode",
                    event.target.value
                  )
                }
              />

              <span>
                {t("voice.silent")}
              </span>
            </label>
          </div>
        </fieldset>

        {/* SPEECH RATE */}

        <fieldset className="setup-section">
          <legend>
            {t("setup.speechRate")}
          </legend>

          <label htmlFor="speech-rate">
            {t("setup.speechRate")}:{" "}
            <strong>
              {preferences.speechRate}x
            </strong>
          </label>

          <input
            id="speech-rate"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={preferences.speechRate}
            onChange={(event) =>
              updatePreference(
                "speechRate",
                Number(event.target.value)
              )
            }
          />
        </fieldset>

        {/* VOICE COMMANDS */}

        <fieldset className="setup-section">
          <legend>
            {t("setup.voiceCommands")}
          </legend>

          <label className="switch-row">
            <input
              type="checkbox"
              checked={
                preferences.voiceCommands
              }
              onChange={(event) =>
                updatePreference(
                  "voiceCommands",
                  event.target.checked
                )
              }
            />

            <span>
              {preferences.voiceCommands
                ? t("voice.commandsOn")
                : t("voice.commandsOff")}
            </span>
          </label>
        </fieldset>

        {/* EXTRA TIME */}

        <fieldset className="setup-section">
          <legend>
            {t("setup.extraTime")}
          </legend>

          <label htmlFor="extra-time">
            {t("setup.extraTime")}:{" "}
            <strong>
              {preferences.extraTimePercent}%
            </strong>
          </label>

          <input
            id="extra-time"
            type="range"
            min="0"
            max="100"
            step="5"
            value={
              preferences.extraTimePercent
            }
            onChange={(event) =>
              updatePreference(
                "extraTimePercent",
                Number(event.target.value)
              )
            }
          />
        </fieldset>

        {/* BUTTONS */}

        <div className="setup-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={resetPreferences}
          >
            Reset
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            {t("setup.saveContinue")}
          </button>
        </div>
      </form>
    </main>
  );
}