/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";
import mr from "../i18n/mr.json";
import gu from "../i18n/gu.json";
import bn from "../i18n/bn.json";
import ta from "../i18n/ta.json";

// ONE list of all languages.
// To add a new language: import its json above and add one line here.
export const LANGUAGES = [
  { code: "en", nativeName: "English", speechCode: "en-IN", texts: en },
  { code: "hi", nativeName: "हिंदी", speechCode: "hi-IN", texts: hi },
  { code: "mr", nativeName: "मराठी", speechCode: "mr-IN", texts: mr },
  { code: "gu", nativeName: "ગુજરાતી", speechCode: "gu-IN", texts: gu },
  { code: "bn", nativeName: "বাংলা", speechCode: "bn-IN", texts: bn },
  { code: "ta", nativeName: "தமிழ்", speechCode: "ta-IN", texts: ta },
];

const STORAGE_KEY = "udaan-language";
const LanguageContext = createContext(null);

function findLanguage(code) {
  return LANGUAGES.find((l) => l.code === code);
}

// Read the saved language (or use English)
function getSavedLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && findLanguage(saved)) return saved;
  } catch {
    // localStorage may be blocked, so we ignore it
  }
  return "en";
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getSavedLanguage);

  // Every time the language changes: save it and update the page language tag
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = (code) => {
    if (findLanguage(code)) setLanguageState(code);
  };

  const current = findLanguage(language);

  // t("questionOf", { n: 3, total: 20 }) -> "Question 3 of 20"
  // If a text is missing in this language, English is used.
  const t = (key, values = {}) => {
    let text = current.texts[key] || en[key] || key;
    Object.keys(values).forEach((name) => {
      text = text.split("{" + name + "}").join(values[name]);
    });
    return text;
  };

  const value = { language, setLanguage, t, speechCode: current.speechCode };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Use this in any page: const { t, language, setLanguage, speechCode } = useLanguage();
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}