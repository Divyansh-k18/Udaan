import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAccessibility } from "../context/AccessibilityContext";
import { speak, stopSpeaking } from "../services/speech";
import { Icon } from "./Visuals";

export const keyboardGuide = "Use Tab to move forward, Shift Tab to move back, and Enter or Space to activate a control. Press Alt K to read this guide again. Press Escape to stop speech. In a mock exam, use Alt N for next, Alt P for previous, Alt R to repeat the question, Alt T for time remaining, and Alt 1 through Alt 4 to choose an answer. Alt S opens submission confirmation.";

export default function VoiceGuide() {
  const { pathname } = useLocation();
  const { preferences, updatePreference } = useAccessibility();
  const [status, setStatus] = useState("");
  const enabled = preferences.voiceMode === "udaan";
  const rate = preferences.speechRate;
  useEffect(() => {
    function receive(event) {
      const { state } = event.detail;
      setStatus(state === "error" ? "Speech could not start. Select Read keyboard guide to try again, and check your device volume and installed voices." : state === "speaking" ? "Speaking. Press Escape to stop." : "");
    }
    window.addEventListener("udaan:speech-status", receive);
    return () => window.removeEventListener("udaan:speech-status", receive);
  }, []);
  useEffect(() => {
    if (!enabled || /^\/(exam|prepare|mode)(\/|$)|^\/exams$/.test(pathname)) return;
    const timer = setTimeout(() => speak("Welcome to Udaan. " + keyboardGuide, "en-IN", rate), 250);
    return () => { clearTimeout(timer); stopSpeaking(); };
  }, [pathname, enabled, rate]);
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") stopSpeaking();
      if (event.altKey && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === "k" && !document.querySelector("dialog[open]")) {
        event.preventDefault();
        if (enabled) speak(keyboardGuide, "en-IN", rate);
        else document.getElementById("read-keyboard-guide")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, rate]);
  function readGuide() {
    if (!enabled) updatePreference("voiceMode", "udaan");
    speak(keyboardGuide, "en-IN", rate);
  }
  return <aside className="voice-guide" aria-label="Spoken keyboard guidance" lang="en">
    <div className="voice-guide-copy"><Icon name="headphones" /><div><strong>Your keyboard companion</strong><p>{enabled ? "Spoken help is on. No microphone needed." : "Spoken help is off. You can read the instructions below."}</p></div></div>
    <div className="voice-guide-actions"><button id="read-keyboard-guide" onClick={readGuide} aria-keyshortcuts="Alt+k"><Icon name="keyboard" />{enabled ? "Read keyboard guide" : "Enable voice guide"}</button><button onClick={() => { stopSpeaking(); updatePreference("voiceMode", "silent"); }}><Icon name="stop" />Stop & mute</button></div>
    <details><summary>Read keyboard instructions</summary><p>{keyboardGuide}</p></details>
    {status && <p className="voice-guide-status" role="status">{status}</p>}
  </aside>;
}
