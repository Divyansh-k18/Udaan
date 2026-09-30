// src/voice/settingsCommands.js

/**
 * Voice-settable preferences.
 *
 * Two-step flow, exactly like choosing an exam option:
 *
 *   1. Say the setting name   -> "theme"
 *   2. Say the value          -> "dark"
 *
 * A value may also be spoken on its own or with the setting name:
 *   "dark", "dark theme", "theme dark", "set theme dark".
 *
 * IMPORTANT:
 * Every value here has a keyboard/button equivalent
 * (the selects in Setup and AccessibilityToolbar).
 */

import { themes, textSizes } from "../services/accessibilityPreferences.js";
import { normalizeCommandText, getBaseLanguage } from "./normalize.js";

/**
 * Defined here rather than in `commands.js` so that `commands.js`
 * can import this module without a circular import.
 */
export const SETTING_COMMANDS = Object.freeze({
  SET_SETTING: "SET_SETTING",
  SET_SETTING_VALUE: "SET_SETTING_VALUE",
});

const THEME_LABELS = Object.fromEntries(themes);

const NUMBER_WORDS = {
  100: ["one hundred", "one hundred percent", "one hundred per cent"],
  110: ["one ten", "one hundred ten"],
  125: ["one twenty five", "one hundred twenty five"],
  150: ["one fifty", "one hundred fifty"],
  175: ["one seventy five", "one hundred seventy five"],
  200: ["two hundred", "two hundred percent", "two hundred per cent"],
};

const SETTINGS = [
  {
    key: "theme",
    nouns: {
      en: "theme",
      hi: "थीम",
      mr: "थीम",
      gu: "થીમ",
      bn: "থিম",
      ta: "தீம்",
    },
    requests: {
      en: [
        "theme",
        "themes",
        "colour theme",
        "color theme",
        "set theme",
        "change theme",
        "switch theme",
        "display theme",
        "theme options",
        "choose theme",
      ],
      hi: ["थीम", "थीम बदलो", "रंग थीम", "रंग बदलो", "रंग चुनो", "थीम बताओ"],
      mr: ["थीम", "थीम बदला", "रंग थीम", "रंग बदला", "रंग निवडा", "थीम सांगा"],
      gu: ["થીમ", "થીમ બદલો", "રંગ થીમ", "રંગ બદલો", "રંગ પસંદ કરો", "થીમ કહો"],
      bn: ["থিম", "থিম বদলান", "রঙের থিম", "রঙ বদলান", "রঙ বেছে নিন", "থিম বলুন"],
      ta: ["தீம்", "தீம் மாற்று", "வண்ண தீம்", "வண்ணம் மாற்று", "தீம் சொல்லவும்"],
    },
    labels: {
      "en-IN": "Colour theme",
      "hi-IN": "रंग थीम",
      "mr-IN": "रंग थीम",
      "gu-IN": "રંગ થીમ",
      "bn-IN": "রঙের থিম",
      "ta-IN": "வண்ண தீம்",
    },
    prompts: {
      "en-IN":
        "Which theme? Say light, dark, high contrast, protan deutan, tritan, or reading comfort.",
      "hi-IN":
        "कौन सी थीम? लाइट, डार्क, हाई कॉन्ट्रास्ट, प्रोटान ड्यूटन, ट्राइटन, या रीडिंग कम्फर्ट कहें।",
      "mr-IN":
        "कोणती थीम? लाइट, डार्क, हाय कॉन्ट्रास्ट, प्रोटन ड्युटन, ट्रायटन, किंवा वाचन आरामदायक म्हणा.",
      "gu-IN":
        "કઈ થીમ? લાઇટ, ડાર્ક, હાઇ કોન્ટ્રાસ્ટ, પ્રોટન ડ્યુટન, ટ્રાઇટન, અથવા વાંચન આરામદાયક કહો.",
      "bn-IN":
        "কোন থিম? লাইট, ডার্ক, হাই কনট্রাস্ট, প্রোটান ডিউটান, ট্রাইটান, বা পড়ার আরাম বলুন।",
      "ta-IN":
        "எந்த தீம்? லைட், டார்க், உயர் மாறுபாடு, புரோட்டான் டியூட்டன், ட்ரைடன், அல்லது வாசிப்பு ஆரம் சொல்லவும்.",
    },
    choices: [
      {
        value: "light",
        label: THEME_LABELS.light,
        spoken: {
          en: ["light", "standard light", "white", "bright"],
          hi: ["लाइट", "सामान्य लाइट", "सफेद"],
          mr: ["लाइट", "सामान्य लाइट", "पांढरा"],
          gu: ["લાઇટ", "સામાન્ય લાઇટ", "સફેદ"],
          bn: ["লাইট", "সাধারণ লাইট", "সাদা"],
          ta: ["லைட்", "வழக்கமான லைட்", "வெள்ளை"],
        },
      },
      {
        value: "dark",
        label: THEME_LABELS.dark,
        spoken: {
          en: ["dark", "black"],
          hi: ["डार्क", "काला"],
          mr: ["डार्क", "काळा"],
          gu: ["ડાર્ક", "કાળું"],
          bn: ["ডার্ক", "কালো"],
          ta: ["டார்க்", "கருப்பு"],
        },
      },
      {
        value: "high-contrast",
        label: THEME_LABELS["high-contrast"],
        spoken: {
          en: ["high contrast", "maximum contrast", "contrast"],
          hi: ["हाई कॉन्ट्रास्ट", "ज़्यादा कॉन्ट्रास्ट", "कॉन्ट्रास्ट"],
          mr: ["हाय कॉन्ट्रास्ट", "जास्त कॉन्ट्रास्ट", "कॉन्ट्रास्ट"],
          gu: ["હાઇ કોન્ટ્રાસ્ટ", "વધુ કોન્ટ્રાસ્ટ", "કોન્ટ્રાસ્ટ"],
          bn: ["হাই কনট্রাস্ট", "বেশি কনট্রাস্ট", "কনট্রাস্ট"],
          ta: ["உயர் மாறுபாடு", "அதிக மாறுபாடு", "மாறுபாடு"],
        },
      },
      {
        value: "protan-deutan",
        label: THEME_LABELS["protan-deutan"],
        spoken: {
          en: [
            "protan deutan",
            "protan",
            "deutan",
            "colour friendly",
            "color friendly",
            "colour blind friendly",
          ],
          hi: ["प्रोटान ड्यूटन", "रंग अनुकूल", "रंगबंधित अनुकूल"],
          mr: ["प्रोटन ड्युटन", "रंग अनुकूल"],
          gu: ["પ્રોટન ડ્યુટન", "રંગ અનુકૂળ"],
          bn: ["প্রোটান ডিউটান", "রঙ বান্ধব"],
          ta: ["புரோட்டான் டியூட்டன்", "வண்ண நட்பு"],
        },
      },
      {
        value: "tritan",
        label: THEME_LABELS.tritan,
        spoken: {
          en: ["tritan"],
          hi: ["ट्राइटन"],
          mr: ["ट्रायटन"],
          gu: ["ટ્રાઇટન"],
          bn: ["ট্রাইটান"],
          ta: ["ட்ரைடன்"],
        },
      },
      {
        value: "reading",
        label: THEME_LABELS.reading,
        spoken: {
          en: ["reading comfort", "reading"],
          hi: ["रीडिंग कम्फर्ट", "पढ़ने की थीम"],
          mr: ["वाचन आरामदायक", "वाचन थीम"],
          gu: ["વાંચન આરામદાયક", "વાંચન થીમ"],
          bn: ["পড়ার আরাম", "পড়ার থিম"],
          ta: ["வாசிப்பு ஆரம்", "வாசிப்பு தீம்"],
        },
      },
    ],
  },
  {
    key: "textSize",
    nouns: {
      en: "text size",
      hi: "टेक्स्ट आकार",
      mr: "मजकूर आकार",
      gu: "ટેક્સ્ટ કદ",
      bn: "টেক্সটের আকার",
      ta: "உரை அளவு",
    },
    requests: {
      en: [
        "text size",
        "font size",
        "letter size",
        "set text size",
        "change text size",
        "text size options",
        "choose text size",
      ],
      hi: ["टेक्स्ट आकार", "टेक्स्ट साइज़", "अक्षर आकार", "टेक्स्ट आकार बदलो"],
      mr: ["मजकूर आकार", "मजकूर साइझ", "अक्षर आकार", "मजकूर आकार बदला"],
      gu: ["ટેક્સ્ટ કદ", "ટેક્સ્ટ સાઇઝ", "અક્ષર કદ", "ટેક્સ્ટ કદ બદલો"],
      bn: ["টেক্সটের আকার", "টেক্সট সাইজ", "অক্ষরের আকার", "টেক্সটের আকার বদলান"],
      ta: ["உரை அளவு", "எழுத்து அளவு", "உரை அளவு மாற்று"],
    },
    labels: {
      "en-IN": "Text size",
      "hi-IN": "टेक्स्ट आकार",
      "mr-IN": "मजकूर आकार",
      "gu-IN": "ટેક્સ્ટ કદ",
      "bn-IN": "টেক্সটের আকার",
      "ta-IN": "உரை அளவு",
    },
    prompts: {
      "en-IN":
        "Which text size? Say 100, 125, 150, 175, or 200 percent.",
      "hi-IN":
        "कौन सा टेक्स्ट आकार? 100, 125, 150, 175, या 200 प्रतिशत कहें।",
      "mr-IN":
        "कोणता मजकूर आकार? 100, 125, 150, 175, किंवा 200 टक्के सांगा.",
      "gu-IN":
        "કયો ટેક્સ્ટ કદ? 100, 125, 150, 175, અથવા 200 ટકા કહો.",
      "bn-IN":
        "কোন টেক্সটের আকার? 100, 125, 150, 175, বা 200 শতাংশ বলুন।",
      "ta-IN":
        "எந்த உரை அளவு? 100, 125, 150, 175, அல்லது 200 சதவீதம் சொல்லவும்.",
    },
    choices: textSizes.map((size) => ({
      value: size,
      label: `${size}%`,
      spoken: {
        en: [
          String(size),
          `${size} percent`,
          `${size} per cent`,
          ...(NUMBER_WORDS[size] || []),
        ],
        hi: [`${size}`, `${size} प्रतिशत`],
        mr: [`${size}`, `${size} टक्के`],
        gu: [`${size}`, `${size} ટકા`],
        bn: [`${size}`, `${size} শতাংশ`],
        ta: [`${size}`, `${size} சதவீதம்`],
      },
    })),
  },
  {
    // 1.5 and 2 would collide with exam options, so a value is only
    // accepted together with the setting name, e.g. "line spacing 2".
    key: "lineSpacing",
    requireNoun: true,
    nouns: {
      en: "line spacing",
      hi: "लाइन स्पेसिंग",
      mr: "ओळ अंतराल",
      gu: "લાઇન અંતર",
      bn: "লাইন স্পেসিং",
      ta: "வரி இடைவெளி",
    },
    requests: {
      en: [
        "line spacing",
        "line height",
        "set line spacing",
        "change line spacing",
        "spacing options",
      ],
      hi: ["लाइन स्पेसिंग", "लाइन स्पेसिंग बदलो", "पंक्ति दूरी"],
      mr: ["ओळ अंतराल", "ओळ अंतराल बदला"],
      gu: ["લાઇન અંતર", "લાઇન અંતર બદલો"],
      bn: ["লাইন স্পেসিং", "লাইন স্পেসিং বদলান"],
      ta: ["வரி இடைவெளி", "வரி இடைவெளி மாற்று"],
    },
    labels: {
      "en-IN": "Line spacing",
      "hi-IN": "लाइन स्पेसिंग",
      "mr-IN": "ओळ अंतराल",
      "gu-IN": "લાઇન અંતર",
      "bn-IN": "লাইন স্পেসিং",
      "ta-IN": "வரி இடைவெளி",
    },
    prompts: {
      "en-IN": "Which line spacing? Say 1.5, 1.65, 2, or 2.5.",
      "hi-IN": "कौन सी लाइन स्पेसिंग? 1.5, 1.65, 2, या 2.5 कहें।",
      "mr-IN": "कोणती ओळ अंतराल? 1.5, 1.65, 2, किंवा 2.5 सांगा.",
      "gu-IN": "કઈ લાઇન અંતર? 1.5, 1.65, 2, અથવા 2.5 કહો.",
      "bn-IN": "কোন লাইন স্পেসিং? 1.5, 1.65, 2, বা 2.5 বলুন।",
      "ta-IN": "எந்த வரி இடைவெளி? 1.5, 1.65, 2, அல்லது 2.5 சொல்லவும்.",
    },
    choices: [1.5, 1.65, 2, 2.5].map((spacing) => ({
      value: spacing,
      label: `${spacing} ×`,
      spoken: {
        en: [
          String(spacing),
          `${spacing} times`,
          `${spacing} normal spacing`,
          `${spacing} spacing`,
          ...(spacing === 1.5
            ? ["tight spacing"]
            : spacing === 1.65
              ? ["normal spacing"]
              : spacing === 2
                ? ["double spacing"]
                : ["wide spacing", "extra wide spacing"]),
        ],
        hi: [`${spacing}`, `${spacing} गुना`],
        mr: [`${spacing}`, `${spacing} पट`],
        gu: [`${spacing}`, `${spacing} ગણો`],
        bn: [`${spacing}`, `${spacing} গুণ`],
        ta: [`${spacing}`, `${spacing} மடங்கு`],
      },
    })),
  },
  {
    key: "voiceMode",
    nouns: {
      en: "reading mode",
      hi: "पढ़ने का मोड",
      mr: "वाचन मोड",
      gu: "વાંચન મોડ",
      bn: "পড়ার মোড",
      ta: "வாசிப்பு முறை",
    },
    requests: {
      en: [
        "reading mode",
        "voice mode",
        "speech mode",
        "sound mode",
        "set reading mode",
        "change reading mode",
        "reading mode options",
      ],
      hi: ["पढ़ने का मोड", "वॉइस मोड", "बोलने का मोड", "पढ़ने का मोड बदलो"],
      mr: ["वाचन मोड", "व्हॉइस मोड", "बोलण्याचा मोड"],
      gu: ["વાંચન મોડ", "વૉઇસ મોડ", "બોલવાનો મોડ"],
      bn: ["পড়ার মোড", "ভয়েস মোড", "বলার মোড"],
      ta: ["வாசிப்பு முறை", "குரல் முறை", "பேசும் முறை"],
    },
    labels: {
      "en-IN": "Reading mode",
      "hi-IN": "पढ़ने का मोड",
      "mr-IN": "वाचन मोड",
      "gu-IN": "વાંચન મોડ",
      "bn-IN": "পড়ার মোড",
      "ta-IN": "வாசிப்பு முறை",
    },
    prompts: {
      "en-IN":
        "Which reading mode? Say Udaan speaks, Screen Reader, or Silent.",
      "hi-IN":
        "कौन सा पढ़ने का मोड? उडान बोले, स्क्रीन रीडर, या चुप कहें।",
      "mr-IN":
        "कोणता वाचन मोड? उडान वाचेल, स्क्रीन रीडर, किंवा शांत म्हणा.",
      "gu-IN":
        "કયો વાંચન મોડ? ઉડાન વાંચે, સ્ક્રીન રીડર, અથવા શાંત કહો.",
      "bn-IN":
        "কোন পড়ার মোড? উডান পড়বে, স্ক্রিন রিডার, বা নীরব বলুন।",
      "ta-IN":
        "எந்த வாசிப்பு முறை? உடான் வாசிக்கும், ஸ்கிரீன் ரீடர், அல்லது அமைதி சொல்லவும்.",
    },
    choices: [
      {
        value: "udaan",
        label: "Udaan Speaks",
        spoken: {
          en: ["udaan", "udaan speaks", "udaan mode", "speak udaan"],
          hi: ["उडान", "उडान बोले"],
          mr: ["उडान", "उडान वाचेल"],
          gu: ["ઉડાન", "ઉડાન વાંચે"],
          bn: ["উডান", "উডান পড়বে"],
          ta: ["உடான்", "உடான் வாசிக்கும்"],
        },
      },
      {
        value: "screen-reader",
        label: "Screen Reader",
        spoken: {
          en: ["screen reader", "screenreader", "reader mode"],
          hi: ["स्क्रीन रीडर", "रीडर मोड"],
          mr: ["स्क्रीन रीडर", "रीडर मोड"],
          gu: ["સ્ક્રીન રીડર", "રીડર મોડ"],
          bn: ["স্ক্রিন রিডার", "রিডার মোড"],
          ta: ["ஸ்கிரீன் ரீடர்", "ரீடர் முறை"],
        },
      },
      {
        value: "silent",
        label: "Silent",
        spoken: {
          en: ["silent", "silent mode", "no voice", "mute"],
          hi: ["चुप", "शांत", "आवाज़ बंद"],
          mr: ["शांत", "नकाश", "आवाज बंद"],
          gu: ["શાંત", "મૌન", "અવાજ બંધ"],
          bn: ["নীরব", "চুপ", "কণ্ঠ বন্ধ"],
          ta: ["அமைதி", "ஒர்க்காமல்", "குரல் அணை"],
        },
      },
    ],
  },
];


/* ---------------------------------------------------
   HELPERS
 --------------------------------------------------- */

const VALUE_PREFIXES = {
  en: [
    "",
    "set",
    "select",
    "choose",
    "change to",
    "change",
    "switch to",
    "make it",
  ],
  hi: ["", "सेट", "चुनो", "सेलेक्ट करो", "बदलो", "कर दो"],
  mr: ["", "सेट", "निवडा", "बदला", "करा"],
  gu: ["", "સેટ", "પસંદ કરો", "બદલો", "કરો"],
  bn: ["", "সেট", "বেছে নিন", "বদলান", "করুন"],
  ta: ["", "தேர்வு செய்", "மாற்று", "செய்"],
};


function spokenFor(choice, language) {
  const english = choice.spoken?.en || [];

  if (language === "en") {
    return Array.from(new Set(english));
  }

  return Array.from(
    new Set([...(choice.spoken?.[language] || []), ...english]),
  );
}


function nounsFor(setting, language) {
  const english = setting.nouns?.en ? [setting.nouns.en] : [];

  if (language === "en") {
    return english;
  }

  const local = setting.nouns?.[language];

  return local
    ? Array.from(new Set([local, ...english]))
    : english;
}


function prefixesFor(language) {
  return VALUE_PREFIXES[language] || VALUE_PREFIXES.en;
}


function buildValueLookup(setting, language) {
  const lookup = new Map();
  const nouns = nounsFor(setting, language);
  const prefixes = prefixesFor(language);
  // "1 5" and "2" are bare numbers once normalized, so on a setting
  // marked `requireNoun` they are only accepted together with the
  // setting name. Word aliases such as "double spacing" are
  // unambiguous and stay available on their own.
  const isBareNumber = (text) => /^\d+( \d+)*$/.test(text);

  for (const choice of setting.choices) {
    for (const alias of spokenFor(choice, language)) {
      const spoken = normalizeCommandText(alias);

      if (!spoken) {
        continue;
      }

      if (!setting.requireNoun || !isBareNumber(spoken)) {
        for (const prefix of prefixes) {
          lookup.set([prefix, spoken].filter(Boolean).join(" "), choice);
        }
      }

      // "theme dark", "dark theme", "set theme dark", ...
      // At least one side must carry the setting name.
      for (const prefix of prefixes) {
        for (const before of ["", ...nouns]) {
          for (const after of ["", ...nouns]) {
            if (!before && !after) {
              continue;
            }

            lookup.set(
              [prefix, before, spoken, after].filter(Boolean).join(" "),
              choice,
            );
          }
        }
      }
    }
  }

  return lookup;
}


const VALUE_LOOKUP_CACHE = new Map();

function valueLookup(setting, language) {
  const cacheKey = `${setting.key}:${language}`;

  if (!VALUE_LOOKUP_CACHE.has(cacheKey)) {
    VALUE_LOOKUP_CACHE.set(cacheKey, buildValueLookup(setting, language));
  }

  return VALUE_LOOKUP_CACHE.get(cacheKey);
}


const REQUEST_LOOKUP_CACHE = new Map();

function requestLookup(setting, language) {
  const cacheKey = `${setting.key}:${language}`;

  if (!REQUEST_LOOKUP_CACHE.has(cacheKey)) {
    const lookup = new Set();

    for (const alias of [
      ...(setting.requests?.en || []),
      ...(language === "en" ? [] : setting.requests?.[language] || []),
    ]) {
      const normalized = normalizeCommandText(alias);

      if (normalized) {
        lookup.add(normalized);
      }
    }

    REQUEST_LOOKUP_CACHE.set(cacheKey, lookup);
  }

  return REQUEST_LOOKUP_CACHE.get(cacheKey);
}


function pickText(map, langCode) {
  return map?.[langCode] || map?.["en-IN"] || "";
}


/* ---------------------------------------------------
   PUBLIC API
 --------------------------------------------------- */

export function getSettings() {
  return SETTINGS;
}


export function getSetting(key) {
  return SETTINGS.find((setting) => setting.key === key) || null;
}


export function settingLabel(key, langCode = "en-IN") {
  return pickText(getSetting(key)?.labels, langCode);
}


export function settingPrompt(key, langCode = "en-IN") {
  return pickText(getSetting(key)?.prompts, langCode);
}


/**
 * Choices for the on-screen chooser, which is the
 * keyboard/button equivalent of saying the value.
 */
export function settingChoices(key) {
  const setting = getSetting(key);

  if (!setting) {
    return [];
  }

  return setting.choices.map((choice) => ({
    value: choice.value,
    label: choice.label,
  }));
}


/**
 * "theme" / "change theme" / "रंग थीम" opens the chooser.
 */
export function matchSettingRequest(transcript, langCode = "en-IN") {
  const language = getBaseLanguage(langCode);
  const text = normalizeCommandText(transcript);

  if (!text) {
    return null;
  }

  for (const setting of SETTINGS) {
    if (requestLookup(setting, language).has(text)) {
      return { setting: setting.key };
    }
  }

  return null;
}


/**
 * "dark" / "dark theme" / "set theme dark" picks a value.
 *
 * Passing `settingId` restricts the search, which is what the
 * pending chooser uses so that "150" while choosing a theme does
 * not silently answer the wrong question.
 */
export function matchSettingValue(
  transcript,
  langCode = "en-IN",
  settingId = null,
) {
  const language = getBaseLanguage(langCode);
  const text = normalizeCommandText(transcript);

  if (!text) {
    return null;
  }

  const settings = settingId
    ? SETTINGS.filter((setting) => setting.key === settingId)
    : SETTINGS;

  for (const setting of settings) {
    const choice = valueLookup(setting, language).get(text);

    if (choice) {
      return {
        setting: setting.key,
        value: choice.value,
        label: choice.label,
      };
    }
  }

  return null;
}
