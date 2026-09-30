import "../styles/examVoice.css";
const labels = { idle: "Ready", listening: "Listening…", processing: "Processing…", recognized: "Recognized", "not-understood": "Not understood", "mic-blocked": "Microphone blocked", unsupported: "Unavailable", error: "Error" };
export default function ExamVoicePanel({ voice, feedback = "" }) {
  return <section className="exam-voice-panel" aria-label="Exam voice controls">
    <strong>Voice: {voice.enabled ? labels[voice.state] : "Off in settings"}</strong>
    <button type="button" onClick={voice.listen} disabled={!voice.enabled || ["listening", "processing", "unsupported"].includes(voice.state)}>Listen for command</button>
    <p>Press Listen or Alt+V before each command. Select an option, then say “Lock answer”.</p>
    <div role="status" aria-live="polite" aria-atomic="true">
      {voice.heard && <p>Heard: “{voice.heard}”</p>}
      {voice.message && <p>{voice.message}</p>}
      {voice.state === "unsupported" && <p>Voice commands are unavailable in this browser. Keyboard and screen-reader controls remain available.</p>}
      {feedback && <p>{feedback}</p>}
    </div>
  </section>;
}
