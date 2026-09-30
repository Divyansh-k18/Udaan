import { stopSpeaking } from "./speech.js";

export class ListenError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.name = "ListenError";
    this.code = code;
    this.originalError = originalError;
  }
}
let active = null;
export function isSpeechRecognitionSupported() {
  return typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}
function report(state, message = "", heard = "") {
  if (typeof window !== "undefined" && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent("udaan:recognition-status", { detail: { state, message, heard } }));
  }
}
export function isListening() { return active !== null; }
export function cancelListening() { active?.cancel(); }

// Explicit, single-shot recognition. Never restart on end or error.
export function listenOnce(langCode = "en-IN", { signal } = {}) {
  if (!isSpeechRecognitionSupported()) return Promise.reject(new ListenError("not-supported", "Voice commands are unavailable in this browser. Keyboard and screen-reader controls remain available."));
  if (active) return Promise.reject(new ListenError("busy", "A voice command is already being heard."));
  if (signal?.aborted) return Promise.reject(new ListenError("cancelled", "Listening stopped."));
  stopSpeaking();
  return new Promise((resolve, reject) => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    try { recognition = new Recognition(); }
    catch (error) { reject(new ListenError("recognition-error", "Could not start speech recognition.", error)); return; }
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.lang = langCode || "en-IN";
    let finished = false;
    let timer;
    const cancel = () => finish(new ListenError("cancelled", "Listening stopped."));
    function finish(error, alternatives) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      recognition.onresult = recognition.onerror = recognition.onend = recognition.onstart = recognition.onspeechend = null;
      // Release the microphone before resolving and executing a command.
      try { recognition.abort(); } catch { /* Already stopped. */ }
      active = null;
      if (error) {
        const state = error.code === "cancelled" ? "idle" : error.code === "mic-blocked" ? "mic-blocked" : error.code === "no-speech" ? "not-understood" : "error";
        report(state, error.message);
        reject(error);
      } else {
        report("recognized", "Speech received.", alternatives[0].transcript);
        resolve(alternatives);
      }
    }
    active = { cancel };
    signal?.addEventListener("abort", cancel, { once: true });
    recognition.onstart = () => report("listening", "Listening…");
    recognition.onspeechend = () => report("processing", "Processing…");
    recognition.onresult = event => {
      const result = event.results[event.resultIndex] || event.results[0];
      if (result?.isFinal === false) return;
      const alternatives = Array.from(result || []).filter(item => item?.transcript?.trim()).map(item => ({ transcript: item.transcript.trim(), confidence: typeof item.confidence === "number" ? item.confidence : null }));
      finish(alternatives.length ? null : new ListenError("no-speech", "No speech detected. Try again."), alternatives);
    };
    recognition.onerror = event => {
      const blocked = ["not-allowed", "service-not-allowed", "audio-capture"].includes(event.error);
      const code = blocked ? "mic-blocked" : event.error === "no-speech" ? "no-speech" : event.error === "network" ? "network" : "recognition-error";
      const message = blocked ? "Microphone permission is blocked. Enable microphone permission or use keyboard controls." : code === "no-speech" ? "No speech detected. Try again." : code === "network" ? "Voice recognition could not connect. Try again or use keyboard controls." : "Voice recognition failed. Try again or use keyboard controls.";
      finish(new ListenError(code, message, event.error));
    };
    recognition.onend = () => finish(new ListenError("no-speech", "No speech detected. Try again."));
    timer = setTimeout(() => finish(new ListenError("no-speech", "No speech detected. Try again.")), 15000);
    report("listening", "Listening…");
    try { recognition.start(); }
    catch (error) { finish(new ListenError(["NotAllowedError", "SecurityError"].includes(error.name) ? "mic-blocked" : "recognition-error", "Could not start the microphone. Check permission or use keyboard controls.", error)); }
  });
}
