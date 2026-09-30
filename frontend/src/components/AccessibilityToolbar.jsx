import { useAccessibility } from "../context/AccessibilityContext";
import { stopSpeaking } from "../services/speech";

export default function AccessibilityToolbar() {
  const { preferences, updatePreference } = useAccessibility();
  return <details className="accessibility-toolbar">
    <summary>Reading & display settings</summary>
    <div className="accessibility-controls">
      <div><label htmlFor="toolbar-size">Text size: {preferences.textSize}%</label>
        <input id="toolbar-size" type="range" min="100" max="200" step="10" value={preferences.textSize}
          onChange={e => updatePreference("textSize", Number(e.target.value))} /></div>
      <div><label htmlFor="toolbar-theme">Colour theme</label>
        <select id="toolbar-theme" value={preferences.theme} onChange={e => updatePreference("theme", e.target.value)}>
          <option value="light">Light</option><option value="dark">Dark</option><option value="high-contrast">High contrast</option>
        </select></div>
      <div><label htmlFor="toolbar-voice">Reading mode</label>
        <select id="toolbar-voice" value={preferences.voiceMode} onChange={e => { stopSpeaking(); updatePreference("voiceMode", e.target.value); }}>
          <option value="udaan">Udaan speaks</option><option value="screen-reader">Use my screen reader</option><option value="silent">Silent</option>
        </select></div>
      <button type="button" onClick={stopSpeaking}>Stop reading aloud</button>
    </div>
  </details>;
}
