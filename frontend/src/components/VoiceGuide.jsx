import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAccessibility } from "../context/AccessibilityContext";
import { speak, stopSpeaking } from "../services/speech";
import { Icon } from "./Visuals";

export const keyboardGuide =
  "Use Tab to move forward, Shift Tab to move back, and Enter or Space to activate a control. " +
  "Press Alt K to read this guide again. Press Escape to stop speech. " +
  "In a mock exam, use Alt N for next, Alt P for previous, Alt R to repeat the question, " +
  "Alt T for time remaining, and Alt 1 through Alt 4 to choose an answer. " +
  "Alt S opens submission confirmation.";

export default function VoiceGuide() {
  const { pathname } = useLocation();
  const { preferences, updatePreference } = useAccessibility();

  const [status, setStatus] = useState("");

  const enabled = preferences.voiceMode === "udaan";
  const rate = preferences.speechRate;

  /*
    IMPORTANT:
    Setup owns the welcome/onboarding narration.

    Exam, Prepare and Mock pages own their own question/voice narration.

    VoiceGuide must NOT replay:
    "Welcome to Udaan..."
    when the user changes pages.
  */

  useEffect(() => {
    function receive(event) {
      const state = event.detail?.state;

      if (state === "error") {
        setStatus(
          "Speech could not start. Select Read keyboard guide to try again, and check your device volume and installed voices."
        );
        return;
      }

      if (state === "speaking") {
        setStatus("Speaking. Press Escape to stop.");
        return;
      }

      setStatus("");
    }

    window.addEventListener("udaan:speech-status", receive);

    return () => {
      window.removeEventListener("udaan:speech-status", receive);
    };
  }, []);

  /*
    Only short contextual announcements are allowed here.

    DO NOT add exam-question narration here.
    Exam.jsx / Prepare.jsx and the exam voice system own that narration.
  */
  useEffect(() => {
    if (!enabled) return;

    const contextualNarration = {
      "/login": "Login.",
      "/dashboard": "Dashboard.",
      "/exams": "Choose an exam category.",
      "/progress": "Progress.",
      "/result": "Results.",
      "/report": "Report.",
    };

    const message = contextualNarration[pathname];

    // Dynamic exam routes intentionally have no global narration.
    // This prevents double speech with the exam voice assistant.
    if (!message) return;

    const timer = window.setTimeout(() => {
      stopSpeaking();
      speak(message, "en-IN", rate);
    }, 250);

    return () => {
      window.clearTimeout(timer);
      stopSpeaking();
    };
  }, [pathname, enabled, rate]);

  /*
    Global keyboard help.

    Escape:
    stop Udaan speech.

    Alt + K:
    read keyboard guide.
  */
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") {
        stopSpeaking();
        return;
      }

      const isTyping =
        event.target instanceof HTMLElement &&
        (event.target.matches("input, textarea, select") ||
          event.target.isContentEditable);

      if (isTyping) return;

      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.key.toLowerCase() === "k" &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();

        if (enabled) {
          stopSpeaking();
          speak(keyboardGuide, "en-IN", rate);
        } else {
          document.getElementById("read-keyboard-guide")?.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [enabled, rate]);

  function readGuide() {
    stopSpeaking();

    if (!enabled) {
      updatePreference("voiceMode", "udaan");
    }

    speak(keyboardGuide, "en-IN", rate);
  }

  function muteVoiceGuide() {
    stopSpeaking();
    updatePreference("voiceMode", "silent");
    setStatus("");
  }

  return (
    <aside
      className="voice-guide"
      aria-label="Spoken keyboard guidance"
      lang="en"
    >
      <div className="voice-guide-copy">
        <Icon name="headphones" />

        <div>
          <strong>Your keyboard companion</strong>

          <p>
            {enabled
              ? "Spoken help is on. No microphone needed."
              : "Spoken help is off. You can read the instructions below."}
          </p>
        </div>
      </div>

      <div className="voice-guide-actions">
        <button
          id="read-keyboard-guide"
          type="button"
          onClick={readGuide}
          aria-keyshortcuts="Alt+K"
        >
          <Icon name="keyboard" />
          {enabled ? "Read keyboard guide" : "Enable voice guide"}
        </button>

        <button type="button" onClick={muteVoiceGuide}>
          <Icon name="stop" />
          Stop & mute
        </button>
      </div>

      <details>
        <summary>Read keyboard instructions</summary>
        <p>{keyboardGuide}</p>
      </details>

      {status && (
        <p className="voice-guide-status" aria-live="off">
          {status}
        </p>
      )}
    </aside>
  );
}