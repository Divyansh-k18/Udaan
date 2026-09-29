// src/voice/commands.js

/**
 * Udaan voice command matcher.
 *
 * English commands work for EVERY language.
 *
 * We also include common Hindi, Marathi, Gujarati,
 * Bengali and Tamil equivalents.
 *
 * IMPORTANT:
 * Voice commands must always have keyboard/button alternatives.
 */

export const COMMANDS = Object.freeze({
  NEXT: "NEXT",
  PREVIOUS: "PREVIOUS",
  REPEAT: "REPEAT",
  READ_OPTIONS: "READ_OPTIONS",
  SELECT_OPTION: "SELECT_OPTION",
  CLEAR: "CLEAR",
  MARK: "MARK",
  TIME_LEFT: "TIME_LEFT",
  GO_TO: "GO_TO",
  SECTION_STATUS: "SECTION_STATUS",
  SUBMIT: "SUBMIT",
  YES: "YES",
  NO: "NO",
  HELP: "HELP",
  STOP: "STOP",
  START_EXAM: "START_EXAM",
  PRACTICE: "PRACTICE",
  PROGRESS: "PROGRESS",
  SETTINGS: "SETTINGS",
  BOOKMARK: "BOOKMARK",
  EXPLAIN_AGAIN: "EXPLAIN_AGAIN",
});


/* ---------------------------------------------------
   DIGIT NORMALIZATION
--------------------------------------------------- */

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


/* ---------------------------------------------------
   TEXT NORMALIZATION
--------------------------------------------------- */

export function normalizeCommandText(value = "") {
  let text = String(value).normalize("NFKC").toLowerCase();

  text = Array.from(text)
    .map((character) => DIGIT_MAP[character] ?? character)
    .join("");

  return text
    .replace(/[.,!?;:"'`(){}\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* ---------------------------------------------------
   ENGLISH COMMANDS

   These are ALWAYS active, regardless of language.
--------------------------------------------------- */

const ENGLISH_ALIASES = {
  NEXT: [
    "next",
    "next question",
    "go next",
  ],

  PREVIOUS: [
    "previous",
    "previous question",
    "back",
    "go back",
  ],

  REPEAT: [
    "repeat",
    "repeat question",
    "say again",
    "repeat that",
  ],

  READ_OPTIONS: [
    "read options",
    "read the options",
    "options",
    "read answers",
  ],

  CLEAR: [
    "clear",
    "clear answer",
    "clear option",
    "remove answer",
    "remove selection",
  ],

  MARK: [
    "mark",
    "mark question",
    "mark for review",
  ],

  TIME_LEFT: [
    "time left",
    "how much time is left",
    "remaining time",
    "tell me the time left",
  ],

  SECTION_STATUS: [
    "section status",
    "section progress",
    "status of section",
  ],

  SUBMIT: [
    "submit",
    "submit exam",
    "finish exam",
    "finish test",
  ],

  YES: [
    "yes",
    "confirm",
  ],

  NO: [
    "no",
    "cancel",
  ],

  HELP: [
    "help",
    "voice help",
    "commands",
    "show commands",
  ],

  STOP: [
    "stop",
    "stop speaking",
    "be quiet",
  ],

  START_EXAM: [
    "start exam",
    "start test",
    "begin exam",
    "begin test",
  ],

  PRACTICE: [
    "practice",
    "practice mode",
    "prepare",
    "prepare mode",
  ],

  PROGRESS: [
    "progress",
    "show progress",
    "my progress",
  ],

  SETTINGS: [
    "settings",
    "open settings",
  ],

  BOOKMARK: [
    "bookmark",
    "bookmark question",
    "save question",
  ],

  EXPLAIN_AGAIN: [
    "explain again",
    "explain it again",
    "explain once more",
  ],
};


/* ---------------------------------------------------
   LOCAL-LANGUAGE COMMANDS

   English aliases above remain available everywhere.
--------------------------------------------------- */

const LANGUAGE_ALIASES = {
  hi: {
    NEXT: [
      "अगला",
      "अगला प्रश्न",
      "आगे",
    ],

    PREVIOUS: [
      "पिछला",
      "पिछला प्रश्न",
      "पीछे",
    ],

    REPEAT: [
      "दोहराओ",
      "फिर से",
      "फिर बोलो",
    ],

    READ_OPTIONS: [
      "विकल्प पढ़ो",
      "विकल्प सुनाओ",
    ],

    CLEAR: [
      "साफ करो",
      "उत्तर हटाओ",
      "चयन हटाओ",
    ],

    MARK: [
      "मार्क करो",
      "समीक्षा के लिए चिह्नित करो",
    ],

    TIME_LEFT: [
      "समय बाकी",
      "कितना समय बचा है",
    ],

    SECTION_STATUS: [
      "सेक्शन स्टेटस",
      "सेक्शन स्थिति",
    ],

    SUBMIT: [
      "जमा करो",
      "सबमिट",
      "सबमिट करो",
    ],

    YES: [
      "हाँ",
      "हां",
    ],

    NO: [
      "नहीं",
      "नही",
    ],

    HELP: [
      "मदद",
      "सहायता",
    ],

    STOP: [
      "रुको",
      "बंद करो",
    ],

    START_EXAM: [
      "परीक्षा शुरू करो",
      "एग्जाम शुरू करो",
    ],

    PRACTICE: [
      "अभ्यास",
      "प्रैक्टिस",
    ],

    PROGRESS: [
      "प्रगति",
      "प्रोग्रेस",
    ],

    SETTINGS: [
      "सेटिंग",
      "सेटिंग्स",
    ],

    BOOKMARK: [
      "बुकमार्क",
      "बुकमार्क करो",
    ],

    EXPLAIN_AGAIN: [
      "फिर समझाओ",
      "दोबारा समझाओ",
    ],
  },

  mr: {
    NEXT: [
      "पुढे",
      "पुढचा प्रश्न",
    ],

    PREVIOUS: [
      "मागे",
      "मागचा प्रश्न",
    ],

    REPEAT: [
      "पुन्हा",
      "पुन्हा सांगा",
    ],

    READ_OPTIONS: [
      "पर्याय वाचा",
    ],

    CLEAR: [
      "उत्तर काढा",
      "निवड काढा",
    ],

    MARK: [
      "चिन्हांकित करा",
      "मार्क करा",
    ],

    TIME_LEFT: [
      "किती वेळ बाकी आहे",
    ],

    SECTION_STATUS: [
      "विभाग स्थिती",
      "सेक्शन स्टेटस",
    ],

    SUBMIT: [
      "सबमिट करा",
      "जमा करा",
    ],

    YES: [
      "हो",
    ],

    NO: [
      "नाही",
    ],

    HELP: [
      "मदत",
    ],

    STOP: [
      "थांबा",
    ],

    START_EXAM: [
      "परीक्षा सुरू करा",
    ],

    PRACTICE: [
      "सराव",
      "प्रॅक्टिस",
    ],

    PROGRESS: [
      "प्रगती",
    ],

    SETTINGS: [
      "सेटिंग्स",
    ],

    BOOKMARK: [
      "बुकमार्क",
    ],

    EXPLAIN_AGAIN: [
      "पुन्हा समजावून सांगा",
    ],
  },

  gu: {
    NEXT: [
      "આગળ",
      "આગળનો પ્રશ્ન",
    ],

    PREVIOUS: [
      "પાછળ",
      "પાછલો પ્રશ્ન",
    ],

    REPEAT: [
      "ફરી કહો",
    ],

    READ_OPTIONS: [
      "વિકલ્પો વાંચો",
    ],

    CLEAR: [
      "જવાબ સાફ કરો",
      "પસંદગી દૂર કરો",
    ],

    MARK: [
      "માર્ક કરો",
    ],

    TIME_LEFT: [
      "કેટલો સમય બાકી છે",
    ],

    SECTION_STATUS: [
      "વિભાગ સ્થિતિ",
      "સેક્શન સ્ટેટસ",
    ],

    SUBMIT: [
      "સબમિટ કરો",
    ],

    YES: [
      "હા",
    ],

    NO: [
      "ના",
    ],

    HELP: [
      "મદદ",
    ],

    STOP: [
      "રોકો",
    ],

    START_EXAM: [
      "પરીક્ષા શરૂ કરો",
    ],

    PRACTICE: [
      "અભ્યાસ",
      "પ્રેક્ટિસ",
    ],

    PROGRESS: [
      "પ્રગતિ",
    ],

    SETTINGS: [
      "સેટિંગ્સ",
    ],

    BOOKMARK: [
      "બુકમાર્ક",
    ],

    EXPLAIN_AGAIN: [
      "ફરી સમજાવો",
    ],
  },

  bn: {
    NEXT: [
      "পরের",
      "পরের প্রশ্ন",
    ],

    PREVIOUS: [
      "আগের",
      "আগের প্রশ্ন",
    ],

    REPEAT: [
      "আবার বলুন",
    ],

    READ_OPTIONS: [
      "বিকল্পগুলো পড়ুন",
    ],

    CLEAR: [
      "উত্তর মুছুন",
      "নির্বাচন মুছুন",
    ],

    MARK: [
      "মার্ক করুন",
    ],

    TIME_LEFT: [
      "কত সময় বাকি",
    ],

    SECTION_STATUS: [
      "সেকশন স্ট্যাটাস",
      "বিভাগের অবস্থা",
    ],

    SUBMIT: [
      "জমা দিন",
      "সাবমিট",
    ],

    YES: [
      "হ্যাঁ",
    ],

    NO: [
      "না",
    ],

    HELP: [
      "সাহায্য",
    ],

    STOP: [
      "থামুন",
    ],

    START_EXAM: [
      "পরীক্ষা শুরু করুন",
    ],

    PRACTICE: [
      "অনুশীলন",
    ],

    PROGRESS: [
      "অগ্রগতি",
    ],

    SETTINGS: [
      "সেটিংস",
    ],

    BOOKMARK: [
      "বুকমার্ক",
    ],

    EXPLAIN_AGAIN: [
      "আবার বুঝিয়ে বলুন",
    ],
  },

  ta: {
    NEXT: [
      "அடுத்து",
      "அடுத்த கேள்வி",
    ],

    PREVIOUS: [
      "முந்தையது",
      "முந்தைய கேள்வி",
    ],

    REPEAT: [
      "மீண்டும் சொல்லவும்",
    ],

    READ_OPTIONS: [
      "விருப்பங்களை வாசிக்கவும்",
    ],

    CLEAR: [
      "பதிலை அழிக்கவும்",
      "தேர்வை நீக்கவும்",
    ],

    MARK: [
      "குறிக்கவும்",
    ],

    TIME_LEFT: [
      "எவ்வளவு நேரம் மீதம்",
    ],

    SECTION_STATUS: [
      "பிரிவு நிலை",
    ],

    SUBMIT: [
      "சமர்ப்பிக்கவும்",
    ],

    YES: [
      "ஆம்",
    ],

    NO: [
      "இல்லை",
    ],

    HELP: [
      "உதவி",
    ],

    STOP: [
      "நிறுத்து",
    ],

    START_EXAM: [
      "தேர்வை தொடங்கு",
    ],

    PRACTICE: [
      "பயிற்சி",
    ],

    PROGRESS: [
      "முன்னேற்றம்",
    ],

    SETTINGS: [
      "அமைப்புகள்",
    ],

    BOOKMARK: [
      "புக்மார்க்",
    ],

    EXPLAIN_AGAIN: [
      "மீண்டும் விளக்கவும்",
    ],
  },
};


/* ---------------------------------------------------
   OPTION A / B / C / D
--------------------------------------------------- */

const OPTION_VALUES = {
  A: [
    "a",
    "ए",
    "એ",
    "এ",
    "ஏ",
    "1",
    "one",
  ],

  B: [
    "b",
    "बी",
    "બી",
    "বি",
    "பி",
    "2",
    "two",
  ],

  C: [
    "c",
    "सी",
    "સી",
    "সি",
    "சி",
    "3",
    "three",
  ],

  D: [
    "d",
    "डी",
    "ડી",
    "ডি",
    "டி",
    "4",
    "four",
  ],
};


const ENGLISH_OPTION_PREFIXES = [
  "",
  "option",
  "select",
  "select option",
  "choose",
  "choose option",
  "answer",
];


const LOCAL_OPTION_PREFIXES = {
  hi: [
    "विकल्प",
    "विकल्प चुनो",
    "चुनो",
    "उत्तर",
  ],

  mr: [
    "पर्याय",
    "पर्याय निवडा",
    "निवडा",
    "उत्तर",
  ],

  gu: [
    "વિકલ્પ",
    "વિકલ્પ પસંદ કરો",
    "પસંદ કરો",
    "જવાબ",
  ],

  bn: [
    "বিকল্প",
    "বিকল্প বেছে নিন",
    "বেছে নিন",
    "উত্তর",
  ],

  ta: [
    "விருப்பம்",
    "விருப்பத்தை தேர்வு செய்",
    "தேர்வு செய்",
    "பதில்",
  ],
};


/* ---------------------------------------------------
   GO TO QUESTION
--------------------------------------------------- */

const ENGLISH_GO_TO_PREFIXES = [
  "go to",
  "go to question",
  "question",
  "open question",
];


const LOCAL_GO_TO_PREFIXES = {
  hi: [
    "प्रश्न पर जाओ",
    "प्रश्न",
  ],

  mr: [
    "प्रश्नावर जा",
    "प्रश्न",
  ],

  gu: [
    "પ્રશ્ન પર જાઓ",
    "પ્રશ્ન",
  ],

  bn: [
    "প্রশ্নে যান",
    "প্রশ্ন",
  ],

  ta: [
    "கேள்விக்கு செல்",
    "கேள்வி",
  ],
};


/* ---------------------------------------------------
   HELPERS
--------------------------------------------------- */

function getBaseLanguage(langCode = "en-IN") {
  return String(langCode)
    .toLowerCase()
    .split("-")[0];
}


function getAliasesForCommand(command, langCode) {
  const language = getBaseLanguage(langCode);

  const english =
    ENGLISH_ALIASES[command] || [];

  const local =
    LANGUAGE_ALIASES[language]?.[command] || [];

  // English is intentionally ALWAYS included.
  return [...english, ...local];
}


function matchOption(text, langCode) {
  const language = getBaseLanguage(langCode);

  const prefixes = [
    ...ENGLISH_OPTION_PREFIXES,
    ...(LOCAL_OPTION_PREFIXES[language] || []),
  ];

  for (const [option, spokenValues] of Object.entries(
    OPTION_VALUES
  )) {
    for (const spokenValue of spokenValues) {
      for (const prefix of prefixes) {
        const candidate = normalizeCommandText(
          prefix
            ? `${prefix} ${spokenValue}`
            : spokenValue
        );

        if (text === candidate) {
          return option;
        }
      }
    }
  }

  return null;
}


function matchGoToQuestion(text, langCode) {
  const language = getBaseLanguage(langCode);

  const prefixes = [
    ...ENGLISH_GO_TO_PREFIXES,
    ...(LOCAL_GO_TO_PREFIXES[language] || []),
  ];

  for (const prefix of prefixes) {
    const normalizedPrefix =
      normalizeCommandText(prefix);

    if (!text.startsWith(`${normalizedPrefix} `)) {
      continue;
    }

    const possibleNumber = text
      .slice(normalizedPrefix.length)
      .trim();

    if (!/^\d{1,3}$/.test(possibleNumber)) {
      continue;
    }

    const questionNumber =
      Number(possibleNumber);

    if (questionNumber < 1) {
      continue;
    }

    return questionNumber;
  }

  return null;
}


/* ---------------------------------------------------
   MAIN MATCHER
--------------------------------------------------- */

/**
 * Convert recognized speech to a Udaan command.
 *
 * Example:
 *
 * matchCommand("next question", "hi-IN")
 *
 * returns:
 *
 * {
 *   command: "NEXT",
 *   raw: "next question"
 * }
 *
 *
 * matchCommand("select option b", "en-IN")
 *
 * returns:
 *
 * {
 *   command: "SELECT_OPTION",
 *   option: "B",
 *   raw: "select option b"
 * }
 *
 *
 * matchCommand("go to question 12", "en-IN")
 *
 * returns:
 *
 * {
 *   command: "GO_TO",
 *   questionNumber: 12,
 *   raw: "go to question 12"
 * }
 */
export function matchCommand(
  transcript,
  langCode = "en-IN"
) {
  const text =
    normalizeCommandText(transcript);

  if (!text) {
    return null;
  }

  // First check option commands because they contain
  // variable A/B/C/D data.
  const option = matchOption(
    text,
    langCode
  );

  if (option) {
    return {
      command: COMMANDS.SELECT_OPTION,
      option,
      raw: transcript,
    };
  }

  // Then check "go to question X".
  const questionNumber =
    matchGoToQuestion(
      text,
      langCode
    );

  if (questionNumber !== null) {
    return {
      command: COMMANDS.GO_TO,
      questionNumber,
      raw: transcript,
    };
  }

  // All normal fixed commands.
  const normalCommands = [
    COMMANDS.EXPLAIN_AGAIN,
    COMMANDS.READ_OPTIONS,
    COMMANDS.SECTION_STATUS,
    COMMANDS.START_EXAM,
    COMMANDS.TIME_LEFT,
    COMMANDS.PREVIOUS,
    COMMANDS.NEXT,
    COMMANDS.REPEAT,
    COMMANDS.CLEAR,
    COMMANDS.MARK,
    COMMANDS.SUBMIT,
    COMMANDS.YES,
    COMMANDS.NO,
    COMMANDS.HELP,
    COMMANDS.STOP,
    COMMANDS.PRACTICE,
    COMMANDS.PROGRESS,
    COMMANDS.SETTINGS,
    COMMANDS.BOOKMARK,
  ];

  for (const command of normalCommands) {
    const aliases =
      getAliasesForCommand(
        command,
        langCode
      );

    for (const alias of aliases) {
      if (
        text ===
        normalizeCommandText(alias)
      ) {
        return {
          command,
          raw: transcript,
        };
      }
    }
  }

  // Nothing matched.
  return null;
}


/* ---------------------------------------------------
   MATCH SPEECH ALTERNATIVES
--------------------------------------------------- */

/**
 * Useful with listenOnce().
 *
 * It tries recognition alternative 1,
 * then alternative 2,
 * then alternative 3.
 */
export function matchCommandAlternatives(
  alternatives = [],
  langCode = "en-IN"
) {
  for (const alternative of alternatives) {
    const transcript =
      typeof alternative === "string"
        ? alternative
        : alternative?.transcript;

    if (!transcript) {
      continue;
    }

    const match =
      matchCommand(
        transcript,
        langCode
      );

    if (match) {
      return {
        ...match,
        transcript,
        confidence:
          typeof alternative === "object"
            ? alternative.confidence ?? null
            : null,
      };
    }
  }

  return null;
}