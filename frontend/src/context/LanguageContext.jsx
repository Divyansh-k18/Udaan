import { storage } from "../services/storage.js";
import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";

import en from "../i18n/en.json";
import hi from "../i18n/hi.json";
import mr from "../i18n/mr.json";
import gu from "../i18n/gu.json";
import bn from "../i18n/bn.json";
import ta from "../i18n/ta.json";

const LanguageContext = createContext(null);

const STORAGE_KEY = "udaan-language";

export const LANGUAGES = [
  {
    code: "en-IN",
    name: "English",
    nativeName: "English",
  },
  {
    code: "hi-IN",
    name: "Hindi",
    nativeName: "हिन्दी",
  },
  {
    code: "mr-IN",
    name: "Marathi",
    nativeName: "मराठी",
  },
  {
    code: "gu-IN",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
  },
  {
    code: "bn-IN",
    name: "Bengali",
    nativeName: "বাংলা",
  },
  {
    code: "ta-IN",
    name: "Tamil",
    nativeName: "தமிழ்",
  },
];

const translations = {
  "en-IN": en,
  "hi-IN": hi,
  "mr-IN": mr,
  "gu-IN": gu,
  "bn-IN": bn,
  "ta-IN": ta,
};

function getNestedValue(object, key) {
  return key.split(".").reduce((current, part) => {
    if (current && Object.prototype.hasOwnProperty.call(current, part)) {
      return current[part];
    }

    return undefined;
  }, object);
}

function replacePlaceholders(text, values = {}) {
  if (typeof text !== "string") {
    return text;
  }

  return text.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
    if (
      Object.prototype.hasOwnProperty.call(values, placeholder) &&
      values[placeholder] !== null &&
      values[placeholder] !== undefined
    ) {
      return String(values[placeholder]);
    }

    return match;
  });
}

function getInitialLanguage() {
  try {
    const savedLanguage = storage.getItem(STORAGE_KEY);

    const isSupported = LANGUAGES.some(
      (language) => language.code === savedLanguage
    );

    if (isSupported) {
      return savedLanguage;
    }
  } catch (error) {
    console.warn("Could not read language from localStorage:", error);
  }

  return "en-IN";
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;

    try {
      storage.setItem(STORAGE_KEY, language);
    } catch (error) {
      console.warn("Could not save language to localStorage:", error);
    }
  }, [language]);

  function setLanguage(newLanguage) {
    const isSupported = LANGUAGES.some(
      (languageItem) => languageItem.code === newLanguage
    );

    if (!isSupported) {
      console.warn(`Unsupported language: ${newLanguage}`);
      return;
    }

    setLanguageState(newLanguage);
  }

  const t = useCallback((key, values = {}) => {
    const selectedTranslations = translations[language] || en;

    let translatedText = getNestedValue(selectedTranslations, key);

    // Fall back to English if translation is missing.
    if (
      translatedText === undefined ||
      translatedText === null ||
      translatedText === ""
    ) {
      translatedText = getNestedValue(en, key);
    }

    // If the key does not exist in English either,
    // return the key so the missing translation is easy to notice.
    if (
      translatedText === undefined ||
      translatedText === null ||
      translatedText === ""
    ) {
      console.warn(`Missing translation key: ${key}`);
      return key;
    }

    return replacePlaceholders(translatedText, values);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: LANGUAGES,
      t,
    }),
    [language, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside a LanguageProvider"
    );
  }

  return context;
}