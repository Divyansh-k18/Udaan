import { useAccessibility } from "../context/AccessibilityContext";
import { useLanguage } from "../context/LanguageContext";
import { stopSpeaking } from "../services/speech";

const TEXT = {
  "en-IN": {
    summary: "Reading & display settings",
    textSize: "Text size",
    theme: "Colour theme",
    light: "Light",
    dark: "Dark",
    contrast: "High contrast",
    mode: "Reading mode",
    udaan: "Udaan speaks",
    reader: "Use my screen reader",
    silent: "Silent",
    stop: "Stop reading aloud",
  },
  "hi-IN": {
    summary: "पढ़ने और डिस्प्ले की सेटिंग्स",
    textSize: "टेक्स्ट आकार",
    theme: "रंग थीम",
    light: "लाइट",
    dark: "डार्क",
    contrast: "हाई कॉन्ट्रास्ट",
    mode: "पढ़ने का मोड",
    udaan: "Udaan पढ़े",
    reader: "मेरे स्क्रीन रीडर का उपयोग करें",
    silent: "शांत",
    stop: "आवाज़ में पढ़ना बंद करें",
  },
  "mr-IN": {
    summary: "वाचन आणि डिस्प्ले सेटिंग्ज",
    textSize: "मजकूर आकार",
    theme: "रंग थीम",
    light: "लाइट",
    dark: "डार्क",
    contrast: "हाय कॉन्ट्रास्ट",
    mode: "वाचन मोड",
    udaan: "Udaan वाचेल",
    reader: "माझा स्क्रीन रीडर वापरा",
    silent: "शांत",
    stop: "मोठ्याने वाचन थांबवा",
  },
  "gu-IN": {
    summary: "વાંચન અને ડિસ્પ્લે સેટિંગ્સ",
    textSize: "ટેક્સ્ટ કદ",
    theme: "રંગ થીમ",
    light: "લાઇટ",
    dark: "ડાર્ક",
    contrast: "હાઇ કોન્ટ્રાસ્ટ",
    mode: "વાંચન મોડ",
    udaan: "Udaan વાંચે",
    reader: "મારા સ્ક્રીન રીડરનો ઉપયોગ કરો",
    silent: "શાંત",
    stop: "મોટેથી વાંચવાનું બંધ કરો",
  },
  "bn-IN": {
    summary: "পড়া ও ডিসপ্লে সেটিংস",
    textSize: "টেক্সটের আকার",
    theme: "রঙের থিম",
    light: "লাইট",
    dark: "ডার্ক",
    contrast: "হাই কনট্রাস্ট",
    mode: "পড়ার মোড",
    udaan: "Udaan পড়ে শোনাবে",
    reader: "আমার স্ক্রিন রিডার ব্যবহার করুন",
    silent: "নীরব",
    stop: "জোরে পড়া বন্ধ করুন",
  },
  "ta-IN": {
    summary: "வாசிப்பு மற்றும் காட்சி அமைப்புகள்",
    textSize: "உரை அளவு",
    theme: "வண்ண தீம்",
    light: "லைட்",
    dark: "டார்க்",
    contrast: "உயர் மாறுபாடு",
    mode: "வாசிப்பு முறை",
    udaan: "Udaan வாசிக்கும்",
    reader: "என் ஸ்கிரீன் ரீடரை பயன்படுத்தவும்",
    silent: "அமைதி",
    stop: "சத்தமாக வாசிப்பதை நிறுத்தவும்",
  },
};

export default function AccessibilityToolbar() {
  const { preferences, updatePreference } = useAccessibility();
  const { language } = useLanguage();
  const text = TEXT[language] || TEXT["en-IN"];

  return (
    <details className="accessibility-toolbar">
      <summary>{text.summary}</summary>

      <div className="accessibility-controls">
        <div>
          <label htmlFor="toolbar-size">
            {text.textSize}: {preferences.textSize}%
          </label>
          <input
            id="toolbar-size"
            type="range"
            min="100"
            max="200"
            step="10"
            value={preferences.textSize}
            onChange={(event) =>
              updatePreference("textSize", Number(event.target.value))
            }
          />
        </div>

        <div>
          <label htmlFor="toolbar-theme">{text.theme}</label>
          <select
            id="toolbar-theme"
            value={preferences.theme}
            onChange={(event) =>
              updatePreference("theme", event.target.value)
            }
          >
            <option value="light">{text.light}</option>
            <option value="dark">{text.dark}</option>
            <option value="high-contrast">{text.contrast}</option>
          </select>
        </div>

        <div>
          <label htmlFor="toolbar-voice">{text.mode}</label>
          <select
            id="toolbar-voice"
            value={preferences.voiceMode}
            onChange={(event) => {
              stopSpeaking();
              updatePreference("voiceMode", event.target.value);
            }}
          >
            <option value="udaan">{text.udaan}</option>
            <option value="screen-reader">{text.reader}</option>
            <option value="silent">{text.silent}</option>
          </select>
        </div>

        <button type="button" onClick={stopSpeaking}>
          {text.stop}
        </button>
      </div>
    </details>
  );
}
