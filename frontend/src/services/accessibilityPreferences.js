export const themes = [
  ['light', 'Standard Light'], ['dark', 'Dark'], ['high-contrast', 'Maximum Contrast'],
  ['protan-deutan', 'Protan / Deutan Friendly'], ['tritan', 'Tritan Friendly'], ['reading', 'Reading Comfort'],
];
export const textSizes = [100, 110, 125, 150, 175, 200];
export const defaults = {
  theme: 'light', textSize: 100, voiceMode: 'udaan', speechRate: 1,
  voiceCommands: true, extraTimePercent: 0, profile: 'custom',
  lineSpacing: 1.65, readingComfort: false, reducedMotion: false, largeControls: false,
};
export const profiles = [
  { id: 'screen-reader', label: 'Screen Reader / Blind', settings: { voiceMode: 'screen-reader' } },
  { id: 'low-vision', label: 'Low Vision', settings: { textSize: 150, theme: 'high-contrast', largeControls: true } },
  { id: 'colour', label: 'Colour Vision Assistance', settings: { theme: 'protan-deutan' } },
  { id: 'reading', label: 'Reading / Dyslexia Support', settings: { theme: 'reading', readingComfort: true, lineSpacing: 2 } },
  { id: 'motor', label: 'Keyboard / Motor Assistance', settings: { largeControls: true } },
  { id: 'comfort', label: 'Reduced Motion / Cognitive Comfort', settings: { reducedMotion: true, voiceMode: 'silent', readingComfort: true } },
  { id: 'custom', label: 'Custom', settings: {} },
];
export function normalizePreferences(saved = {}) {
  const clamp = (value, fallback, min, max) => Number.isFinite(Number(value)) && value != null ? Math.min(max, Math.max(min, Number(value))) : fallback;
  return {
    ...defaults,
    theme: themes.some(([id]) => id === saved?.theme) ? saved.theme : defaults.theme,
    textSize: clamp(saved?.textSize, 100, 100, 200),
    voiceMode: ['udaan', 'screen-reader', 'silent'].includes(saved?.voiceMode) ? saved.voiceMode : defaults.voiceMode,
    speechRate: clamp(saved?.speechRate, 1, .5, 2),
    extraTimePercent: clamp(saved?.extraTimePercent, 0, 0, 100),
    lineSpacing: clamp(saved?.lineSpacing, 1.65, 1.5, 2.5),
    voiceCommands: saved?.voiceCommands !== false,
    profile: profiles.some(p => p.id === saved?.profile) ? saved.profile : 'custom',
    ...Object.fromEntries(['readingComfort', 'reducedMotion', 'largeControls'].map(key => [key, saved?.[key] === true])),
  };
}
export function settingMessage(key, value) {
  const names = { textSize: 'Text size', lineSpacing: 'Line spacing', speechRate: 'Speech rate', reducedMotion: 'Reduced motion', readingComfort: 'Reading comfort', largeControls: 'Large controls', voiceCommands: 'Voice commands', extraTimePercent: 'Extra time' };
  if (key === 'theme') return `${themes.find(([id]) => id === value)?.[1] || value} theme selected.`;
  if (key === 'voiceMode') return `${{ udaan: 'Udaan Speaks', 'screen-reader': 'Screen Reader', silent: 'Silent' }[value]} mode selected.`;
  if (typeof value === 'boolean') return `${names[key] || key} ${value ? 'enabled' : 'disabled'}.`;
  return `${names[key] || key} ${value}${['textSize', 'extraTimePercent'].includes(key) ? ' percent' : ''} selected.`;
}
