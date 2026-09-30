// src/services/speech.js

/*
  Udaan Speech Service

  Uses only built-in browser APIs:
  - speechSynthesis for text-to-speech
  - Web Audio API for small sound cues

  IMPORTANT:
  The React page/context decides whether speech is allowed.
  For example, screen-reader and silent modes should not call speak().
*/

// --------------------------------------------------
// TEXT TO SPEECH
// --------------------------------------------------

let activeUtterance = null;
let speechWatchdog = null;
let speechSequence = 0;
function reportSpeech(state, error = "") {
  window.dispatchEvent(new CustomEvent("udaan:speech-status", { detail: { state, error } }));
}
export function stopSpeaking() {
  speechSequence += 1;
  clearTimeout(speechWatchdog);
  activeUtterance = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    reportSpeech("stopped");
  }
}

export function getVoices() {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

function findBestVoice(langCode) {
  const voices = getVoices();

  if (!langCode || voices.length === 0) {
    return null;
  }

  const wanted = langCode.toLowerCase();

  // Example:
  // en-IN should first try to find exactly en-IN
  const exactVoice = voices.find(
    (voice) => voice.lang?.toLowerCase() === wanted
  );

  if (exactVoice) {
    return exactVoice;
  }

  // If exact locale does not exist,
  // try the base language.
  // Example: hi-IN -> hi
  const baseLanguage = wanted.split("-")[0];

  const baseVoice = voices.find((voice) =>
    voice.lang?.toLowerCase().startsWith(baseLanguage)
  );

  return baseVoice || null;
}

export function hasVoice(langCode) {
  return Boolean(findBestVoice(langCode));
}

export function speak(text, langCode = "en-IN", rate = 1) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    if (typeof window !== "undefined") reportSpeech("error", "unavailable");
    return false;
  }

  if (!text || !text.trim()) {
    return false;
  }

  // IMPORTANT:
  // Cancel previous Udaan speech before starting new speech.
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = langCode;

  // Keep speech rate inside a safe browser-supported range.
  const safeRate = Number(rate);

  utterance.rate = Number.isFinite(safeRate)
    ? Math.min(Math.max(safeRate, 0.5), 2)
    : 1;

  const selectedVoice = findBestVoice(langCode);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  activeUtterance = utterance;
  const sequence = speechSequence;
  utterance.onstart = () => {
    if (sequence !== speechSequence) return;
    clearTimeout(speechWatchdog);
    reportSpeech("speaking");
  };
  utterance.onend = () => {
    if (sequence !== speechSequence) return;
    clearTimeout(speechWatchdog);
    activeUtterance = null;
    reportSpeech("finished");
  };
  utterance.onerror = (event) => {
    if (sequence !== speechSequence) return;
    clearTimeout(speechWatchdog);
    activeUtterance = null;
    reportSpeech("error", event.error);
  };
  reportSpeech("starting");
  speechWatchdog = setTimeout(() => {
    if (sequence === speechSequence) reportSpeech("error", "not-started");
  }, 4500);
  try {
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(activeUtterance);
  } catch {
    clearTimeout(speechWatchdog);
    reportSpeech("error", "unavailable");
    return false;
  }

  return true;
}

// --------------------------------------------------
// WEB AUDIO BEEPS
// --------------------------------------------------

let audioContext = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

async function playTone(
  frequency,
  duration = 0.12,
  volume = 0.08,
  delay = 0
) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  try {
    if (context.state === "suspended") {
      await context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(
      volume,
      context.currentTime + delay
    );

    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + delay + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime + delay);

    oscillator.stop(
      context.currentTime + delay + duration
    );
  } catch (error) {
    // Audio cue failure must never break the app.
    console.warn("Udaan audio cue could not play:", error);
  }
}

/*
  Generic beep function.

  Supported types:
  listen
  ok
  error
  correct
  wrong
*/
export async function playBeep(type = "ok") {
  switch (type) {
    case "listen":
      await playTone(620, 0.1);
      break;

    case "ok":
      await playTone(820, 0.12);
      break;

    case "error":
      await playTone(220, 0.18);
      break;

    case "correct":
      await playTone(750, 0.1);
      await playTone(1050, 0.12, 0.08, 0.11);
      break;

    case "wrong":
      await playTone(320, 0.12);
      await playTone(190, 0.18, 0.08, 0.13);
      break;

    default:
      await playTone(700, 0.1);
  }
}

// Convenient named functions for other Udaan pages.

export function beepListen() {
  return playBeep("listen");
}

export function beepOk() {
  return playBeep("ok");
}

export function beepError() {
  return playBeep("error");
}

export function beepCorrect() {
  return playBeep("correct");
}

export function beepWrong() {
  return playBeep("wrong");
}