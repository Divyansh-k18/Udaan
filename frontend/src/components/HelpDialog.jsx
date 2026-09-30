import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const TEXT = {
  "en-IN": {
    help: "Help", title: "Udaan Help",
    description: "Keyboard shortcuts and voice commands available in Udaan.",
    keyboard: "Keyboard shortcuts", shortcut: "Shortcut", action: "Action",
    voice: "Voice commands", englishCommands: "English command words work even when another Udaan language is selected. Press Listen before each command. For display settings, say the setting first, for example Theme, then say a value such as Dark.",
    close: "Close", closeHelp: "Close help", footer: "Press Escape at any time to close this Help dialog.",
    actions: ["Next question", "Previous question", "Repeat question", "Time left", "Mark question", "Open help", "Start voice listening", "Change language", "Submit", "Go to question", "Section status", "Bookmark", "Explain again", "Select option A", "Select option B", "Select option C", "Select option D", "Stop speech or close dialog"],
  },
  "hi-IN": {
    help: "सहायता", title: "Udaan सहायता",
    description: "Udaan में उपलब्ध कीबोर्ड शॉर्टकट और वॉइस कमांड।",
    keyboard: "कीबोर्ड शॉर्टकट", shortcut: "शॉर्टकट", action: "कार्य",
    voice: "वॉइस कमांड", englishCommands: "दूसरी Udaan भाषा चुनी होने पर भी अंग्रेज़ी कमांड शब्द काम करते हैं।",
    close: "बंद करें", closeHelp: "सहायता बंद करें", footer: "इस सहायता डायलॉग को बंद करने के लिए किसी भी समय Escape दबाएँ।",
    actions: ["अगला प्रश्न", "पिछला प्रश्न", "प्रश्न दोहराएँ", "बाकी समय", "प्रश्न मार्क करें", "सहायता खोलें", "वॉइस सुनना शुरू करें", "भाषा बदलें", "जमा करें", "प्रश्न पर जाएँ", "सेक्शन स्थिति", "बुकमार्क", "फिर समझाएँ", "विकल्प A चुनें", "विकल्प B चुनें", "विकल्प C चुनें", "विकल्प D चुनें", "आवाज़ रोकें या डायलॉग बंद करें"],
  },
  "mr-IN": {
    help: "मदत", title: "Udaan मदत",
    description: "Udaan मध्ये उपलब्ध कीबोर्ड शॉर्टकट आणि व्हॉइस कमांड.",
    keyboard: "कीबोर्ड शॉर्टकट", shortcut: "शॉर्टकट", action: "क्रिया",
    voice: "व्हॉइस कमांड", englishCommands: "दुसरी Udaan भाषा निवडली असली तरी इंग्रजी कमांड शब्द काम करतात.",
    close: "बंद करा", closeHelp: "मदत बंद करा", footer: "हा मदत डायलॉग बंद करण्यासाठी कधीही Escape दाबा.",
    actions: ["पुढील प्रश्न", "मागील प्रश्न", "प्रश्न पुन्हा वाचा", "उरलेला वेळ", "प्रश्न मार्क करा", "मदत उघडा", "व्हॉइस ऐकणे सुरू करा", "भाषा बदला", "सबमिट करा", "प्रश्नावर जा", "विभाग स्थिती", "बुकमार्क", "पुन्हा समजावून सांगा", "पर्याय A निवडा", "पर्याय B निवडा", "पर्याय C निवडा", "पर्याय D निवडा", "वाचन थांबवा किंवा डायलॉग बंद करा"],
  },
  "gu-IN": {
    help: "મદદ", title: "Udaan મદદ",
    description: "Udaan માં ઉપલબ્ધ કીબોર્ડ શોર્ટકટ અને વૉઇસ કમાન્ડ.",
    keyboard: "કીબોર્ડ શોર્ટકટ", shortcut: "શોર્ટકટ", action: "ક્રિયા",
    voice: "વૉઇસ કમાન્ડ", englishCommands: "બીજી Udaan ભાષા પસંદ હોય ત્યારે પણ અંગ્રેજી કમાન્ડ શબ્દો કાર્ય કરે છે.",
    close: "બંધ કરો", closeHelp: "મદદ બંધ કરો", footer: "આ મદદ ડાયલોગ બંધ કરવા માટે કોઈપણ સમયે Escape દબાવો.",
    actions: ["આગલો પ્રશ્ન", "પાછલો પ્રશ્ન", "પ્રશ્ન ફરી વાંચો", "બાકી સમય", "પ્રશ્ન માર્ક કરો", "મદદ ખોલો", "વૉઇસ સાંભળવાનું શરૂ કરો", "ભાષા બદલો", "સબમિટ કરો", "પ્રશ્ન પર જાઓ", "વિભાગ સ્થિતિ", "બુકમાર્ક", "ફરી સમજાવો", "વિકલ્પ A પસંદ કરો", "વિકલ્પ B પસંદ કરો", "વિકલ્પ C પસંદ કરો", "વિકલ્પ D પસંદ કરો", "વાંચન રોકો અથવા ડાયલોગ બંધ કરો"],
  },
  "bn-IN": {
    help: "সহায়তা", title: "Udaan সহায়তা",
    description: "Udaan-এ উপলব্ধ কীবোর্ড শর্টকাট এবং ভয়েস কমান্ড।",
    keyboard: "কীবোর্ড শর্টকাট", shortcut: "শর্টকাট", action: "কাজ",
    voice: "ভয়েস কমান্ড", englishCommands: "অন্য Udaan ভাষা নির্বাচিত থাকলেও ইংরেজি কমান্ড শব্দ কাজ করে।",
    close: "বন্ধ করুন", closeHelp: "সহায়তা বন্ধ করুন", footer: "এই সহায়তা ডায়ালগ বন্ধ করতে যেকোনো সময় Escape চাপুন।",
    actions: ["পরের প্রশ্ন", "আগের প্রশ্ন", "প্রশ্ন আবার পড়ুন", "বাকি সময়", "প্রশ্ন মার্ক করুন", "সহায়তা খুলুন", "ভয়েস শোনা শুরু করুন", "ভাষা বদলান", "জমা দিন", "প্রশ্নে যান", "সেকশন অবস্থা", "বুকমার্ক", "আবার ব্যাখ্যা করুন", "অপশন A নির্বাচন করুন", "অপশন B নির্বাচন করুন", "অপশন C নির্বাচন করুন", "অপশন D নির্বাচন করুন", "পড়া বন্ধ করুন বা ডায়ালগ বন্ধ করুন"],
  },
  "ta-IN": {
    help: "உதவி", title: "Udaan உதவி",
    description: "Udaan-ல் கிடைக்கும் விசைப்பலகை குறுக்குவழிகள் மற்றும் குரல் கட்டளைகள்.",
    keyboard: "விசைப்பலகை குறுக்குவழிகள்", shortcut: "குறுக்குவழி", action: "செயல்",
    voice: "குரல் கட்டளைகள்", englishCommands: "வேறு Udaan மொழி தேர்ந்தெடுக்கப்பட்டிருந்தாலும் ஆங்கில கட்டளை சொற்கள் செயல்படும்.",
    close: "மூடு", closeHelp: "உதவியை மூடு", footer: "இந்த உதவி உரையாடலை மூட எந்த நேரத்திலும் Escape அழுத்தவும்.",
    actions: ["அடுத்த கேள்வி", "முந்தைய கேள்வி", "கேள்வியை மீண்டும் வாசிக்கவும்", "மீதமுள்ள நேரம்", "கேள்வியை குறிக்கவும்", "உதவியைத் திறக்கவும்", "குரல் கேட்பதைத் தொடங்கவும்", "மொழியை மாற்றவும்", "சமர்ப்பிக்கவும்", "கேள்விக்குச் செல்லவும்", "பிரிவு நிலை", "புக்மார்க்", "மீண்டும் விளக்கவும்", "விருப்பம் A தேர்ந்தெடுக்கவும்", "விருப்பம் B தேர்ந்தெடுக்கவும்", "விருப்பம் C தேர்ந்தெடுக்கவும்", "விருப்பம் D தேர்ந்தெடுக்கவும்", "குரலை நிறுத்தவும் அல்லது உரையாடலை மூடவும்"],
  },
};

const SHORTCUT_KEYS = [
  "Alt + N", "Alt + P", "Alt + R", "Alt + T", "Alt + M", "Alt + H",
  "Alt + V", "Alt + L", "Alt + S", "Alt + G", "Alt + C", "Alt + B",
  "Alt + E", "Alt + 1", "Alt + 2", "Alt + 3", "Alt + 4", "Escape",
];

const VOICE_COMMANDS = [
  "Next", "Previous", "Repeat", "Read options", "Option A", "Option B",
  "Option C", "Option D", "Option E", "Option F", "Clear", "Mark",
  "Time left", "Go to question 5", "Section status", "Submit", "Yes", "No",
  "Help", "Stop", "Start exam", "Practice", "Progress", "Settings",
  "Bookmark", "Explain again",
  "Theme", "Dark", "Light", "High contrast", "Text size", "150",
  "Line spacing", "Reading mode", "Silent", "Screen reader",
];

function isTypingElement(element) {
  if (!element) return false;
  const tagName = element.tagName?.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    element.isContentEditable
  );
}

function HelpDialog() {
  const { language } = useLanguage();
  const text = TEXT[language] || TEXT["en-IN"];
  const [open, setOpen] = useState(false);

  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  function openDialog() {
    previousFocusRef.current = document.activeElement;
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
  }

  useEffect(() => {
    const listener = () => openDialog();
    window.addEventListener("udaan:open-help", listener);
    return () => window.removeEventListener("udaan:open-help", listener);
  }, []);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
  }, [open]);

  useEffect(() => {
    function handleGlobalKeyDown(event) {
      if (
        event.altKey &&
        event.code === "KeyH" &&
        !isTypingElement(event.target)
      ) {
        event.preventDefault();
        if (!open) openDialog();
        return;
      }

      if (event.code === "Escape" && open) {
        event.preventDefault();
        closeDialog();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frameId = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [open]);

  useEffect(() => {
    if (open) return;
    if (
      previousFocusRef.current &&
      typeof previousFocusRef.current.focus === "function"
    ) {
      previousFocusRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function trapFocus(event) {
      if (event.code !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll(
          [
            'button:not([disabled])',
            'a[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
          ].join(",")
        )
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", trapFocus);
    return () => window.removeEventListener("keydown", trapFocus);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="help-open-button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {text.help}
        <span className="shortcut-hint"> Alt+H</span>
      </button>

      {open && (
        <div
          className="help-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <dialog
            ref={dialogRef}
            onCancel={(event) => {
              event.preventDefault();
              closeDialog();
            }}
            className="help-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-dialog-title"
            aria-describedby="help-dialog-description"
            tabIndex="-1"
          >
            <div className="help-dialog-header">
              <div>
                <h2 id="help-dialog-title">{text.title}</h2>
                <p id="help-dialog-description">{text.description}</p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                className="help-close-button"
                onClick={closeDialog}
                aria-label={text.closeHelp}
              >
                {text.close}
              </button>
            </div>

            <section aria-labelledby="keyboard-help-title">
              <h3 id="keyboard-help-title">{text.keyboard}</h3>

              <div className="shortcut-table-wrapper">
                <table className="shortcut-table">
                  <caption className="sr-only">{text.keyboard}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{text.shortcut}</th>
                      <th scope="col">{text.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHORTCUT_KEYS.map((shortcut, index) => (
                      <tr key={shortcut}>
                        <td><kbd>{shortcut}</kbd></td>
                        <td>{text.actions[index]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section
              className="voice-command-help"
              aria-labelledby="voice-help-title"
            >
              <h3 id="voice-help-title">{text.voice}</h3>
              <p>{text.englishCommands}</p>
              <ul className="voice-command-list">
                {VOICE_COMMANDS.map((command) => (
                  <li key={command}><code>{command}</code></li>
                ))}
              </ul>
            </section>

            <p className="help-footer">{text.footer}</p>
          </dialog>
        </div>
      )}
    </>
  );
}

export default HelpDialog;
