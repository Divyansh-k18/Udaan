// src/services/listen.js

/**
 * One-time browser speech recognition for Udaan.
 *
 * IMPORTANT:
 * - Always start listening from an explicit user action
 *   such as clicking a "Listen" button or pressing a keyboard shortcut.
 * - Never auto-start the microphone.
 * - Keyboard controls must always remain available.
 */

export class ListenError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.name = "ListenError";
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Check whether this browser provides SpeechRecognition.
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
}

/**
 * Listen once and return up to 3 recognition alternatives.
 *
 * Example return value:
 *
 * [
 *   {
 *     transcript: "next question",
 *     confidence: 0.92
 *   },
 *   {
 *     transcript: "next",
 *     confidence: 0.71
 *   }
 * ]
 *
 * Possible error codes:
 *
 * not-supported
 * mic-blocked
 * no-speech
 * network
 * recognition-error
 */
export function listenOnce(langCode = "en-IN") {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(
        new ListenError(
          "not-supported",
          "Speech recognition is not available in this environment."
        )
      );
      return;
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      reject(
        new ListenError(
          "not-supported",
          "Speech recognition is not supported by this browser."
        )
      );
      return;
    }

    const recognition = new SpeechRecognitionClass();

    // We only want one spoken command.
    recognition.continuous = false;

    // Only final speech results.
    recognition.interimResults = false;

    // Ask browser for maximum 3 possible interpretations.
    recognition.maxAlternatives = 3;

    // Example:
    // en-IN
    // hi-IN
    // mr-IN
    // gu-IN
    // bn-IN
    // ta-IN
    recognition.lang = langCode || "en-IN";

    let finished = false;

    function resolveOnce(value) {
      if (finished) return;

      finished = true;
      resolve(value);
    }

    function rejectOnce(error) {
      if (finished) return;

      finished = true;
      reject(error);
    }

    recognition.onresult = (event) => {
      const result =
        event.results[event.resultIndex] ||
        event.results[0];

      if (!result || result.length === 0) {
        rejectOnce(
          new ListenError(
            "no-speech",
            "No speech was recognized."
          )
        );
        return;
      }

      const alternatives = [];

      const count = Math.min(result.length, 3);

      for (let i = 0; i < count; i += 1) {
        const alternative = result[i];

        const transcript =
          alternative?.transcript?.trim() || "";

        if (!transcript) {
          continue;
        }

        alternatives.push({
          transcript,

          confidence:
            typeof alternative.confidence === "number"
              ? alternative.confidence
              : null,
        });
      }

      if (alternatives.length === 0) {
        rejectOnce(
          new ListenError(
            "no-speech",
            "No speech was recognized."
          )
        );
        return;
      }

      resolveOnce(alternatives);
    };

    recognition.onerror = (event) => {
      const browserError = event.error;

      switch (browserError) {
        case "not-allowed":
        case "service-not-allowed":
        case "audio-capture":
          rejectOnce(
            new ListenError(
              "mic-blocked",
              "Microphone access is blocked or unavailable.",
              browserError
            )
          );
          break;

        case "no-speech":
          rejectOnce(
            new ListenError(
              "no-speech",
              "No speech was detected. Please try again.",
              browserError
            )
          );
          break;

        case "network":
          rejectOnce(
            new ListenError(
              "network",
              "Speech recognition could not connect to the network.",
              browserError
            )
          );
          break;

        case "language-not-supported":
          rejectOnce(
            new ListenError(
              "not-supported",
              `Speech recognition does not support ${langCode} in this browser.`,
              browserError
            )
          );
          break;

        default:
          rejectOnce(
            new ListenError(
              "recognition-error",
              "Speech recognition failed.",
              browserError
            )
          );
      }
    };

    // Sometimes browsers stop without giving a result.
    recognition.onend = () => {
      if (!finished) {
        rejectOnce(
          new ListenError(
            "no-speech",
            "Listening ended before speech was recognized."
          )
        );
      }
    };

    try {
      recognition.start();
    } catch (error) {
      if (
        error?.name === "NotAllowedError" ||
        error?.name === "SecurityError"
      ) {
        rejectOnce(
          new ListenError(
            "mic-blocked",
            "Microphone access is blocked.",
            error
          )
        );
        return;
      }

      rejectOnce(
        new ListenError(
          "recognition-error",
          "Could not start speech recognition.",
          error
        )
      );
    }
  });
}