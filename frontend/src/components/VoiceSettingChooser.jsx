import { useEffect, useState } from "react";
import { Icon } from "./Visuals";
import { useAccessibility } from "../context/AccessibilityContext";
import { useLanguage } from "../context/LanguageContext";
import {
  cancelSettingChoice,
  chooseSettingValue,
} from "../voice/settingsFlow.js";

const TEXT = {
  "en-IN": { current: "Current", cancel: "Cancel" },
  "hi-IN": { current: "अभी चालू", cancel: "रद्द करें" },
  "mr-IN": { current: "सध्याचे", cancel: "रद्द करा" },
  "gu-IN": { current: "હાલનું", cancel: "રદ કરો" },
  "bn-IN": { current: "বর্তমান", cancel: "বাতিল করুন" },
  "ta-IN": { current: "தற்போதையது", cancel: "ரத்து" },
};

/**
 * Chooser shown after a voice command names a display setting,
 * for example "theme". It is mounted once in the app layout.
 *
 * Saying the value works, and so do these buttons, so the
 * feature never becomes voice-only.
 */
export default function VoiceSettingChooser() {
  const { preferences, updatePreference, announce } = useAccessibility();
  const { language } = useLanguage();
  const text = TEXT[language] || TEXT["en-IN"];
  const [pending, setPending] = useState(null);

  useEffect(() => {
    function onPending(event) {
      setPending(event.detail);
    }

    function onSettled() {
      setPending(null);
    }

    // Only React may speak, because the accessibility context
    // decides whether narration is allowed in the current mode.
    function onPrompt(event) {
      announce(event.detail.text, { language });
    }

    function onApply(event) {
      updatePreference(event.detail.key, event.detail.value);
    }

    window.addEventListener("udaan:voice-setting-pending", onPending);
    window.addEventListener("udaan:voice-setting-settled", onSettled);
    window.addEventListener("udaan:voice-setting-prompt", onPrompt);
    window.addEventListener("udaan:voice-setting-apply", onApply);

    return () => {
      window.removeEventListener("udaan:voice-setting-pending", onPending);
      window.removeEventListener("udaan:voice-setting-settled", onSettled);
      window.removeEventListener("udaan:voice-setting-prompt", onPrompt);
      window.removeEventListener("udaan:voice-setting-apply", onApply);
    };
  }, [announce, language, updatePreference]);

  if (!pending) {
    return null;
  }

  return (
    <section
      className="voice-setting-chooser"
      aria-labelledby="voice-setting-chooser-title"
    >
      <h2 id="voice-setting-chooser-title" className="voice-setting-chooser-title">
        <Icon name="display" />
        {pending.label}
      </h2>

      <p
        className="voice-setting-chooser-prompt"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {pending.prompt}
      </p>

      <ul className="voice-setting-choices">
        {pending.choices.map((choice) => {
          const isCurrent = String(preferences[pending.settingId]) === String(choice.value);

          return (
            <li key={String(choice.value)}>
              <button
                type="button"
                className="voice-setting-choice"
                onClick={() => chooseSettingValue(pending.settingId, choice.value)}
              >
                {choice.label}
                {isCurrent && <small className="voice-setting-current">{text.current}</small>}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="voice-setting-cancel"
        onClick={() => cancelSettingChoice("cancelled")}
      >
        {text.cancel}
      </button>
    </section>
  );
}
