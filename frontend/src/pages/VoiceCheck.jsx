// src/pages/VoiceCheck.jsx

import { useEffect, useRef, useState } from "react";

import { useAccessibility } from "../context/AccessibilityContext.jsx";

import {
  speak,
  stopSpeaking,
  getVoices,
  hasVoice,
  beepListen,
} from "../services/speech.js";

const LANGUAGES = [
  {
    code: "en-IN",
    name: "English",
    nativeName: "English",
    testText: "Udaan voice test.",
  },
  {
    code: "hi-IN",
    name: "Hindi",
    nativeName: "हिन्दी",
    testText: "Udaan आवाज़ परीक्षण।",
  },
  {
    code: "mr-IN",
    name: "Marathi",
    nativeName: "मराठी",
    testText: "Udaan आवाज चाचणी.",
  },
  {
    code: "gu-IN",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    testText: "Udaan અવાજ પરીક્ષણ.",
  },
  {
    code: "bn-IN",
    name: "Bengali",
    nativeName: "বাংলা",
    testText: "Udaan ভয়েস পরীক্ষা.",
  },
  {
    code: "ta-IN",
    name: "Tamil",
    nativeName: "தமிழ்",
    testText: "Udaan குரல் சோதனை.",
  },
];

function VoiceCheck() {
  const { preferences } = useAccessibility();

  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const headingRef = useRef(null);

  const voiceMode = preferences?.voiceMode || "udaan";
  const speechRate = preferences?.speechRate || 1;

  // Move keyboard/screen-reader focus to the page heading
  // after navigation.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Browser voices can load a little later,
  // so listen for the voiceschanged event.
  useEffect(() => {
    function updateVoices() {
      const voices = getVoices();

      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    }

    updateVoices();

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        updateVoices
      );
    }

    return () => {
      stopSpeaking();

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          updateVoices
        );
      }
    };
  }, []);

  function handleTest(language) {
    // Respect the accessibility mode selected during Setup.

    if (voiceMode === "silent") {
      setStatusMessage(
        "Silent mode is enabled. Udaan speech is turned off."
      );
      return;
    }

    if (voiceMode === "screen-reader") {
      setStatusMessage(
        "Screen reader mode is enabled. Udaan speech is turned off."
      );
      return;
    }

    if (!hasVoice(language.code)) {
      setStatusMessage(
        `${language.name} voice is not available on this device.`
      );
      return;
    }

    // Small cue before Udaan starts speaking.
    beepListen();

    speak(
      language.testText,
      language.code,
      speechRate
    );

    setStatusMessage(
      `Testing ${language.name} voice.`
    );
  }

  const speechDisabled =
    voiceMode === "silent" ||
    voiceMode === "screen-reader";

  return (
    <section
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "24px",
      }}
    >
      <h1
        ref={headingRef}
        tabIndex="-1"
        style={{
          outlineOffset: "6px",
        }}
      >
        Voice Check
      </h1>

      <p>
        Check whether your browser has a voice available for
        each language supported by Udaan.
      </p>

      {voiceMode === "screen-reader" && (
        <p role="status">
          Screen reader mode is active. Udaan will not use its
          own text-to-speech.
        </p>
      )}

      {voiceMode === "silent" && (
        <p role="status">
          Silent mode is active. Speech and Udaan audio testing
          are disabled.
        </p>
      )}

      {!voicesLoaded && (
        <p role="status">
          Checking voices available on this device...
        </p>
      )}

      <div
        style={{
          display: "grid",
          gap: "16px",
          marginTop: "24px",
        }}
      >
        {LANGUAGES.map((language) => {
          const available = hasVoice(language.code);

          return (
            <section
              key={language.code}
              aria-labelledby={`voice-${language.code}`}
              style={{
                border: "2px solid currentColor",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <h2
                id={`voice-${language.code}`}
                style={{
                  marginTop: 0,
                }}
              >
                {language.name}
              </h2>

              <p>
                {language.nativeName}
                {" · "}
                <span>{language.code}</span>
              </p>

              <p>
                Voice status:{" "}
                <strong>
                  {available
                    ? "Available"
                    : "Not available"}
                </strong>
              </p>

              <button
                type="button"
                onClick={() => handleTest(language)}
                disabled={
                  !available || speechDisabled
                }
                aria-label={`Test ${language.name} voice`}
                style={{
                  minHeight: "48px",
                  minWidth: "100px",
                  padding: "10px 18px",
                  fontSize: "1rem",
                  cursor:
                    !available || speechDisabled
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Test
              </button>
            </section>
          );
        })}
      </div>

      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          marginTop: "24px",
          minHeight: "1.5em",
        }}
      >
        {statusMessage}
      </p>
    </section>
  );
}

export default VoiceCheck;