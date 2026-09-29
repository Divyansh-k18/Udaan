import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AccessibilityContext = createContext(null);

const STORAGE_KEY = "udaan_accessibility_preferences";

const defaultPreferences = {
  theme: "light",
  textSize: 100,
  voiceMode: "udaan",
  speechRate: 1,
  voiceCommands: true,
  extraTimePercent: 0,
};

function loadPreferences() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultPreferences;
    }

    const parsed = JSON.parse(saved);

    return {
      ...defaultPreferences,
      ...parsed,
    };
  } catch (error) {
    console.error("Could not load accessibility preferences:", error);
    return defaultPreferences;
  }
}

export function AccessibilityProvider({ children }) {
  const [preferences, setPreferences] = useState(loadPreferences);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("Could not save accessibility preferences:", error);
    }
  }, [preferences]);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = preferences.theme;

    root.style.setProperty(
      "--text-scale",
      String(preferences.textSize / 100)
    );

    root.style.colorScheme =
      preferences.theme === "dark" ? "dark" : "light";
  }, [preferences.theme, preferences.textSize]);

  const updatePreference = (key, value) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const value = useMemo(
    () => ({
      preferences,
      updatePreference,
      resetPreferences,
    }),
    [preferences]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      "useAccessibility must be used inside AccessibilityProvider"
    );
  }

  return context;
}