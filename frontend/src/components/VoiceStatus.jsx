import { Icon } from "./Visuals";
import { useState } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import { useLanguage } from "../context/LanguageContext";
import {
  isSpeechRecognitionSupported,
  listenOnce,
} from "../services/listen";
import { matchCommandAlternatives } from "../voice/commands";

const ERROR_MESSAGES = {
  "not-supported":
    "Voice input unavailable - keyboard still works.",
  "mic-blocked":
    "Microphone permission is blocked. Keyboard still works.",
  "no-speech":
    "No speech was heard. Please try again.",
  network:
    "Voice recognition network error. Keyboard still works.",
  "recognition-error":
    "Voice input could not understand you. Please try again.",
};

function VoiceStatus({ onCommand }) {
  const { preferences } = useAccessibility();
  const { language } = useLanguage();

  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [status, setStatus] = useState("Voice ready.");

  const supported = isSpeechRecognitionSupported();

  const voiceCommandsEnabled = preferences?.voiceCommands !== false;

  async function handleListen() {
    if (!supported) {
      setStatus("Voice input unavailable - keyboard still works.");
      return;
    }

    if (!voiceCommandsEnabled) {
      setStatus("Voice commands are turned off. Keyboard still works.");
      return;
    }

    if (listening) {
      return;
    }

    setListening(true);
    setStatus("Listening...");
    setHeard("");

    try {
      const alternatives = await listenOnce(language);

      const firstTranscript =
        alternatives?.[0]?.transcript?.trim() || "";

      setHeard(firstTranscript || "Nothing heard");

      const command = matchCommandAlternatives(
        alternatives,
        language
      );

      if (command) {
        setStatus(
          `Command recognised: ${(command.command || command.id)
            .replaceAll("_", " ")
            .toLowerCase()}`
        );

        if (typeof onCommand === "function") {
          onCommand(command);
        }

        /*
          This lets future pages listen for voice commands without
          tightly coupling VoiceStatus to Exam.jsx, Prepare.jsx, etc.

          Example later:

          window.addEventListener("udaan:voice-command", handler);
        */
        window.dispatchEvent(
          new CustomEvent("udaan:voice-command", {
            detail: command,
          })
        );
      } else {
        setStatus(
          "Speech heard, but no matching command was found."
        );
      }
    } catch (error) {
      const errorCode =
        error?.code ||
        error?.name ||
        error?.message ||
        "recognition-error";

      setStatus(
        ERROR_MESSAGES[errorCode] ||
          "Voice input failed. Keyboard still works."
      );
    } finally {
      setListening(false);
    }
  }

  return (
    <section
      className="voice-status"
      aria-labelledby="voice-status-title"
    >
      <h2 id="voice-status-title" className="sr-only">
        Voice controls
      </h2>

      <button
        type="button"
        className="voice-mic-button"
        onClick={handleListen}
        aria-pressed={listening}
        aria-label={
          listening
            ? "Listening for voice command"
            : "Start voice command"
        }
        disabled={
          listening ||
          !supported ||
          !voiceCommandsEnabled
        }
      >
        <span aria-hidden="true" className="voice-mic-icon">
          <Icon name="mic" />
        </span>

        <span>
          {listening ? "Listening..." : "Voice command"}
        </span>
      </button>

      <div className="voice-information">
        {heard && <p>
          <strong>Heard:</strong>{" "}
          <span>{heard}</span>
        </p>}

        <p
          className="voice-live-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {supported
            ? voiceCommandsEnabled
              ? status
              : "Voice commands are turned off - keyboard still works."
            : "Voice input unavailable - keyboard still works."}
        </p>
      </div>
    </section>
  );
}

export default VoiceStatus;