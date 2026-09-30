import { Icon } from "./Visuals";
import { useState } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import { useLanguage } from "../context/LanguageContext";
import {
  isSpeechRecognitionSupported,
  listenOnce,
} from "../services/listen";
import { matchCommandAlternatives } from "../voice/commands";

const TEXT = {
  "en-IN": {
    ready: "Voice ready.", listening: "Listening...", nothing: "Nothing heard",
    unavailable: "Voice input unavailable - keyboard still works.", blocked: "Microphone permission is blocked. Keyboard still works.",
    noSpeech: "No speech was heard. Please try again.", network: "Voice recognition network error. Keyboard still works.",
    recognition: "Voice input could not understand you. Please try again.", off: "Voice commands are turned off. Keyboard still works.",
    noMatch: "Speech heard, but no matching command was found.", failed: "Voice input failed. Keyboard still works.",
    controls: "Voice controls", start: "Start voice command", listeningLabel: "Listening for voice command", button: "Voice command", heard: "Heard", recognised: "Command recognised",
  },
  "hi-IN": {
    ready: "वॉइस तैयार है।", listening: "सुन रहा है...", nothing: "कुछ सुनाई नहीं दिया",
    unavailable: "वॉइस इनपुट उपलब्ध नहीं है - कीबोर्ड अभी भी काम करता है।", blocked: "माइक्रोफ़ोन की अनुमति बंद है। कीबोर्ड अभी भी काम करता है।",
    noSpeech: "कोई आवाज़ नहीं सुनी गई। फिर से कोशिश करें।", network: "वॉइस पहचान में नेटवर्क त्रुटि हुई। कीबोर्ड अभी भी काम करता है।",
    recognition: "वॉइस इनपुट समझ नहीं पाया। फिर से कोशिश करें।", off: "वॉइस कमांड बंद हैं। कीबोर्ड अभी भी काम करता है।",
    noMatch: "आवाज़ सुनी गई, लेकिन कोई मिलती हुई कमांड नहीं मिली।", failed: "वॉइस इनपुट विफल हुआ। कीबोर्ड अभी भी काम करता है।",
    controls: "वॉइस नियंत्रण", start: "वॉइस कमांड शुरू करें", listeningLabel: "वॉइस कमांड सुन रहा है", button: "वॉइस कमांड", heard: "सुना", recognised: "कमांड पहचानी गई",
  },
  "mr-IN": {
    ready: "व्हॉइस तयार आहे.", listening: "ऐकत आहे...", nothing: "काहीही ऐकू आले नाही",
    unavailable: "व्हॉइस इनपुट उपलब्ध नाही - कीबोर्ड अजूनही काम करतो.", blocked: "मायक्रोफोन परवानगी बंद आहे. कीबोर्ड अजूनही काम करतो.",
    noSpeech: "आवाज ऐकू आला नाही. पुन्हा प्रयत्न करा.", network: "व्हॉइस ओळख नेटवर्क त्रुटी. कीबोर्ड अजूनही काम करतो.",
    recognition: "व्हॉइस इनपुट समजला नाही. पुन्हा प्रयत्न करा.", off: "व्हॉइस कमांड बंद आहेत. कीबोर्ड अजूनही काम करतो.",
    noMatch: "आवाज ऐकू आला, पण जुळणारी कमांड सापडली नाही.", failed: "व्हॉइस इनपुट अयशस्वी. कीबोर्ड अजूनही काम करतो.",
    controls: "व्हॉइस नियंत्रण", start: "व्हॉइस कमांड सुरू करा", listeningLabel: "व्हॉइस कमांड ऐकत आहे", button: "व्हॉइस कमांड", heard: "ऐकले", recognised: "कमांड ओळखली",
  },
  "gu-IN": {
    ready: "વૉઇસ તૈયાર છે.", listening: "સાંભળી રહ્યું છે...", nothing: "કંઈ સાંભળાયું નહીં",
    unavailable: "વૉઇસ ઇનપુટ ઉપલબ્ધ નથી - કીબોર્ડ હજુ કાર્ય કરે છે.", blocked: "માઇક્રોફોન પરવાનગી બંધ છે. કીબોર્ડ હજુ કાર્ય કરે છે.",
    noSpeech: "કોઈ અવાજ સાંભળાયો નહીં. ફરી પ્રયાસ કરો.", network: "વૉઇસ ઓળખ નેટવર્ક ભૂલ. કીબોર્ડ હજુ કાર્ય કરે છે.",
    recognition: "વૉઇસ ઇનપુટ સમજાયું નહીં. ફરી પ્રયાસ કરો.", off: "વૉઇસ કમાન્ડ બંધ છે. કીબોર્ડ હજુ કાર્ય કરે છે.",
    noMatch: "અવાજ સાંભળાયો, પરંતુ મેળ ખાતી કમાન્ડ મળી નહીં.", failed: "વૉઇસ ઇનપુટ નિષ્ફળ થયું. કીબોર્ડ હજુ કાર્ય કરે છે.",
    controls: "વૉઇસ નિયંત્રણ", start: "વૉઇસ કમાન્ડ શરૂ કરો", listeningLabel: "વૉઇસ કમાન્ડ સાંભળી રહ્યું છે", button: "વૉઇસ કમાન્ડ", heard: "સાંભળ્યું", recognised: "કમાન્ડ ઓળખાઈ",
  },
  "bn-IN": {
    ready: "ভয়েস প্রস্তুত।", listening: "শুনছে...", nothing: "কিছু শোনা যায়নি",
    unavailable: "ভয়েস ইনপুট পাওয়া যাচ্ছে না - কীবোর্ড এখনও কাজ করে।", blocked: "মাইক্রোফোন অনুমতি বন্ধ। কীবোর্ড এখনও কাজ করে।",
    noSpeech: "কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন।", network: "ভয়েস শনাক্তকরণে নেটওয়ার্ক সমস্যা। কীবোর্ড এখনও কাজ করে।",
    recognition: "ভয়েস ইনপুট বোঝা যায়নি। আবার চেষ্টা করুন।", off: "ভয়েস কমান্ড বন্ধ। কীবোর্ড এখনও কাজ করে।",
    noMatch: "কথা শোনা গেছে, কিন্তু মিল থাকা কমান্ড পাওয়া যায়নি।", failed: "ভয়েস ইনপুট ব্যর্থ হয়েছে। কীবোর্ড এখনও কাজ করে।",
    controls: "ভয়েস নিয়ন্ত্রণ", start: "ভয়েস কমান্ড শুরু করুন", listeningLabel: "ভয়েস কমান্ড শুনছে", button: "ভয়েস কমান্ড", heard: "শোনা হয়েছে", recognised: "কমান্ড শনাক্ত হয়েছে",
  },
  "ta-IN": {
    ready: "குரல் தயாராக உள்ளது.", listening: "கேட்கிறது...", nothing: "எதுவும் கேட்கவில்லை",
    unavailable: "குரல் உள்ளீடு கிடைக்கவில்லை - விசைப்பலகை இன்னும் செயல்படும்.", blocked: "மைக்ரோஃபோன் அனுமதி தடுக்கப்பட்டுள்ளது. விசைப்பலகை இன்னும் செயல்படும்.",
    noSpeech: "குரல் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்.", network: "குரல் அடையாள நெட்வொர்க் பிழை. விசைப்பலகை இன்னும் செயல்படும்.",
    recognition: "குரல் உள்ளீட்டை புரிந்துகொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும்.", off: "குரல் கட்டளைகள் அணைக்கப்பட்டுள்ளன. விசைப்பலகை இன்னும் செயல்படும்.",
    noMatch: "குரல் கேட்கப்பட்டது, ஆனால் பொருந்தும் கட்டளை கிடைக்கவில்லை.", failed: "குரல் உள்ளீடு தோல்வியடைந்தது. விசைப்பலகை இன்னும் செயல்படும்.",
    controls: "குரல் கட்டுப்பாடுகள்", start: "குரல் கட்டளையை தொடங்கவும்", listeningLabel: "குரல் கட்டளையை கேட்கிறது", button: "குரல் கட்டளை", heard: "கேட்டது", recognised: "கட்டளை அடையாளம் காணப்பட்டது",
  },
};

function VoiceStatus({ onCommand }) {
  const { preferences } = useAccessibility();
  const { language } = useLanguage();
  const text = TEXT[language] || TEXT["en-IN"];

  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [status, setStatus] = useState(text.ready);

  const supported = isSpeechRecognitionSupported();
  const voiceCommandsEnabled = preferences?.voiceCommands !== false;

  async function handleListen() {
    if (!supported) {
      setStatus(text.unavailable);
      return;
    }

    if (!voiceCommandsEnabled) {
      setStatus(text.off);
      return;
    }

    if (listening) return;

    setListening(true);
    setStatus(text.listening);
    setHeard("");

    try {
      const alternatives = await listenOnce(language);
      const firstTranscript = alternatives?.[0]?.transcript?.trim() || "";
      setHeard(firstTranscript || text.nothing);

      const command = matchCommandAlternatives(alternatives, language);

      if (command) {
        const readableCommand = (command.command || command.id)
          .replaceAll("_", " ")
          .toLowerCase();
        setStatus(`${text.recognised}: ${readableCommand}`);

        if (typeof onCommand === "function") onCommand(command);

        window.dispatchEvent(
          new CustomEvent("udaan:voice-command", { detail: command })
        );
      } else {
        setStatus(text.noMatch);
      }
    } catch (error) {
      const errorCode =
        error?.code || error?.name || error?.message || "recognition-error";

      const messages = {
        "not-supported": text.unavailable,
        "mic-blocked": text.blocked,
        "no-speech": text.noSpeech,
        network: text.network,
        "recognition-error": text.recognition,
      };

      setStatus(messages[errorCode] || text.failed);
    } finally {
      setListening(false);
    }
  }

  return (
    <section className="voice-status" aria-labelledby="voice-status-title">
      <h2 id="voice-status-title" className="sr-only">
        {text.controls}
      </h2>

      <button
        type="button"
        className="voice-mic-button"
        onClick={handleListen}
        aria-pressed={listening}
        aria-label={listening ? text.listeningLabel : text.start}
        disabled={listening || !supported || !voiceCommandsEnabled}
      >
        <span aria-hidden="true" className="voice-mic-icon">
          <Icon name="mic" />
        </span>
        <span>{listening ? text.listening : text.button}</span>
      </button>

      <div className="voice-information">
        {heard && (
          <p>
            <strong>{text.heard}:</strong> <span>{heard}</span>
          </p>
        )}

        <p
          className="voice-live-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {supported
            ? voiceCommandsEnabled
              ? status
              : text.off
            : text.unavailable}
        </p>
      </div>
    </section>
  );
}

export default VoiceStatus;
