import { useEffect, useRef, useState } from "react";
import { listenOnce, cancelListening, isSpeechRecognitionSupported } from "../services/listen.js";
import { matchCommandAlternatives } from "../voice/commands.js";
import { stopSpeaking } from "../services/speech.js";

export default function useExamVoice({ language, enabled, onCommand, scope }) {
  const [voice, setVoice] = useState({ state: isSpeechRecognitionSupported() ? "idle" : "unsupported", heard: "", message: "" });
  const handler = useRef(onCommand);
  const busy = useRef(false);
  const generation = useRef(0);
  useEffect(() => { handler.current = onCommand; });
  useEffect(() => {
    const status = event => setVoice(current => ({ ...current, ...event.detail }));
    const command = event => { if (enabled) handler.current(event.detail); };
    window.addEventListener("udaan:recognition-status", status);
    window.addEventListener("udaan:voice-command", command);
    return () => {
      window.removeEventListener("udaan:recognition-status", status);
      window.removeEventListener("udaan:voice-command", command);
    };
  }, [enabled]);
  useEffect(() => () => {
    generation.current += 1;
    busy.current = false;
    cancelListening();
    stopSpeaking();
  }, [scope, enabled]);

  async function listen() {
    if (!enabled || busy.current) return;
    busy.current = true;
    const request = generation.current;
    try {
      const alternatives = await listenOnce(language);
      if (request !== generation.current) return;
      const matched = matchCommandAlternatives(alternatives, language);
      setVoice({ state: matched ? "recognized" : "not-understood", heard: matched?.transcript || alternatives[0]?.transcript || "", message: matched ? "Command recognized." : "I did not understand that command. Say Help for available commands." });
      if (matched && handler.current(matched) === false) setVoice(current => ({ ...current, state: "not-understood", message: "That command is not available here. Say Help for available commands." }));
    } catch (error) {
      if (request !== generation.current || error.code === "cancelled" || error.code === "busy") return;
      setVoice(current => ({ ...current, state: error.code === "not-supported" ? "unsupported" : error.code === "mic-blocked" ? "mic-blocked" : error.code === "no-speech" ? "not-understood" : "error", message: error.message }));
    } finally {
      if (request === generation.current) busy.current = false;
    }
  }
  return { ...voice, listen, enabled };
}
