// src/voice/commands.test.js

import {
  matchCommand,
  matchCommandAlternatives,
} from "./commands.js";


const tests = [
  {
    speech: "next",
    language: "en-IN",
    expected: {
      command: "NEXT",
    },
  },

  // English must also work while Hindi is selected.
  {
    speech: "next question",
    language: "hi-IN",
    expected: {
      command: "NEXT",
    },
  },

  {
    speech: "अगला प्रश्न",
    language: "hi-IN",
    expected: {
      command: "NEXT",
    },
  },

  {
    speech: "previous",
    language: "mr-IN",
    expected: {
      command: "PREVIOUS",
    },
  },

  {
    speech: "पुढचा प्रश्न",
    language: "mr-IN",
    expected: {
      command: "NEXT",
    },
  },

  {
    speech: "read options",
    language: "gu-IN",
    expected: {
      command: "READ_OPTIONS",
    },
  },

  {
    speech: "select option b",
    language: "en-IN",
    expected: {
      command: "SELECT_OPTION",
      option: "B",
    },
  },

  {
    speech: "option c",
    language: "hi-IN",
    expected: {
      command: "SELECT_OPTION",
      option: "C",
    },
  },

  {
    speech: "विकल्प ए",
    language: "hi-IN",
    expected: {
      command: "SELECT_OPTION",
      option: "A",
    },
  },

  {
    speech: "go to question 12",
    language: "en-IN",
    expected: {
      command: "GO_TO",
      questionNumber: 12,
    },
  },

  {
    speech: "प्रश्न ५",
    language: "hi-IN",
    expected: {
      command: "GO_TO",
      questionNumber: 5,
    },
  },

  {
    speech: "time left",
    language: "ta-IN",
    expected: {
      command: "TIME_LEFT",
    },
  },

  {
    speech: "submit exam",
    language: "bn-IN",
    expected: {
      command: "SUBMIT",
    },
  },

  {
    speech: "help",
    language: "gu-IN",
    expected: {
      command: "HELP",
    },
  },

  {
    speech: "bookmark question",
    language: "ta-IN",
    expected: {
      command: "BOOKMARK",
    },
  },

  {
    speech: "explain again",
    language: "hi-IN",
    expected: {
      command: "EXPLAIN_AGAIN",
    },
  },

  {
    speech: "start exam",
    language: "mr-IN",
    expected: {
      command: "START_EXAM",
    },
  },

  {
    speech: "settings",
    language: "bn-IN",
    expected: {
      command: "SETTINGS",
    },
  },
];


let passed = 0;


for (const test of tests) {
  const result =
    matchCommand(
      test.speech,
      test.language
    );

  const success =
    result &&
    Object.entries(
      test.expected
    ).every(
      ([key, value]) =>
        result[key] === value
    );

  if (success) {
    passed += 1;

    console.log(
      `✅ PASS: "${test.speech}"`
    );
  } else {
    console.error(
      `❌ FAIL: "${test.speech}"`,
      {
        expected: test.expected,
        received: result,
      }
    );
  }
}


console.log(
  `\n${passed}/${tests.length} command tests passed.`
);


/* -----------------------------------------------
   Test recognition alternatives too
------------------------------------------------ */

const alternativeTest =
  matchCommandAlternatives(
    [
      {
        transcript:
          "something incorrect",
        confidence: 0.8,
      },

      {
        transcript:
          "select option d",
        confidence: 0.65,
      },

      {
        transcript:
          "select option b",
        confidence: 0.4,
      },
    ],
    "hi-IN"
  );


console.log(
  "\nAlternative matching test:"
);

console.log(
  alternativeTest
);


if (
  alternativeTest?.command ===
    "SELECT_OPTION" &&
  alternativeTest?.option === "D"
) {
  console.log(
    "✅ Alternative matching PASS"
  );
} else {
  console.error(
    "❌ Alternative matching FAIL"
  );

  process.exitCode = 1;
}


if (passed !== tests.length) {
  process.exitCode = 1;
}