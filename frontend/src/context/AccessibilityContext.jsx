import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { storage } from '../services/storage.js';
import { speak, stopSpeaking } from '../services/speech.js';
import { defaults, normalizePreferences, profiles, settingMessage } from '../services/accessibilityPreferences.js';

const AccessibilityContext = createContext(null);
const STORAGE_KEY = 'udaan_accessibility_preferences';
function loadPreferences() {
  try { return normalizePreferences(JSON.parse(storage.getItem(STORAGE_KEY) || '{}')); }
  catch { return { ...defaults }; }
}
export function AccessibilityProvider({ children }) {
  const [preferences, setPreferences] = useState(loadPreferences);
  const current = useRef(preferences);
  const [message, setMessage] = useState('');
  const timer = useRef(null);
  const announce = useCallback((text, options = {}) => {
    clearTimeout(timer.current);
    setMessage('');
    timer.current = setTimeout(() => {
      const prefs = current.current;
      setMessage(text);
      if ((options.mode || prefs.voiceMode) === 'udaan') speak(text, options.language || 'en-IN', prefs.speechRate);
    }, 120);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    current.current = preferences;
    storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    const root = document.documentElement;
    root.dataset.theme = preferences.theme;
    root.dataset.reducedMotion = String(preferences.reducedMotion);
    root.dataset.readingComfort = String(preferences.readingComfort);
    root.dataset.largeControls = String(preferences.largeControls);
    root.style.setProperty('--text-scale', String(preferences.textSize / 100));
    root.style.setProperty('--reading-line-height', String(preferences.lineSpacing));
    root.style.colorScheme = ['dark', 'high-contrast'].includes(preferences.theme) ? 'dark' : 'light';
  }, [preferences]);
  const updatePreference = useCallback((key, value) => {
    if (!(key in defaults)) return;
    if (key === 'voiceMode') stopSpeaking();
    const next = normalizePreferences({ ...current.current, [key]: value, profile: 'custom' });
    current.current = next;
    setPreferences(next);
    announce(settingMessage(key, next[key]));
  }, [announce]);
  const applyProfile = useCallback((id) => {
    const profile = profiles.find(item => item.id === id);
    if (!profile) return;
    // Presets change presentation, preserving voice choice unless explicitly requested and exam timing.
    const next = id === 'custom' ? { ...current.current, profile: id } : {
      ...current.current, theme: defaults.theme, textSize: defaults.textSize,
      lineSpacing: defaults.lineSpacing, readingComfort: false, reducedMotion: false,
      largeControls: false, ...profile.settings, profile: id,
    };
    stopSpeaking();
    current.current = next;
    setPreferences(next);
    announce(`${profile.label} profile selected. You can customize every setting.`);
  }, [announce]);
  const resetPreferences = useCallback(() => {
    const next = { ...defaults, voiceMode: current.current.voiceMode, extraTimePercent: current.current.extraTimePercent };
    current.current = next;
    setPreferences(next);
    announce('Accessibility settings reset. Voice mode and extra time preserved.');
  }, [announce]);
  const value = useMemo(() => ({ preferences, updatePreference, applyProfile, resetPreferences, announce }),
    [preferences, updatePreference, applyProfile, resetPreferences, announce]);
  return <AccessibilityContext.Provider value={value}>
    {children}
    <div className="sr-only" lang="en" role="status" aria-live={preferences.voiceMode === 'udaan' ? 'off' : 'polite'} aria-atomic="true">{message}</div>
  </AccessibilityContext.Provider>;
}
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used inside AccessibilityProvider');
  return context;
}
