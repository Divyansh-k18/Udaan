// src/voice/normalize.js

/**
 * Shared speech-text normalization.
 *
 * Kept in its own module so `commands.js` and `settingsCommands.js`
 * can both use it without importing each other.
 *
 * IMPORTANT:
 * Voice commands must always have keyboard/button alternatives.
 */

const DIGIT_MAP = {
  // Devanagari
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",

  // Bengali
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",

  // Gujarati
  "૦": "0",
  "૧": "1",
  "૨": "2",
  "૩": "3",
  "૪": "4",
  "૫": "5",
  "૬": "6",
  "૭": "7",
  "૮": "8",
  "૯": "9",

  // Tamil
  "௦": "0",
  "௧": "1",
  "௨": "2",
  "௩": "3",
  "௪": "4",
  "௫": "5",
  "௬": "6",
  "௭": "7",
  "௮": "8",
  "௯": "9",
};

export function normalizeCommandText(value = "") {
  let text = String(value).normalize("NFKC").toLowerCase();

  text = Array.from(text)
    .map((character) => DIGIT_MAP[character] ?? character)
    .join("");

  return text
    .replace(/[.,!?;:"'`(){}[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getBaseLanguage(langCode = "en-IN") {
  return String(langCode)
    .toLowerCase()
    .split("-")[0];
}
