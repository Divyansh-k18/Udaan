/*
  Udaan demo exam catalog

  IMPORTANT:
  These are small STYLE-BASED DEMO EXAMS inspired by common
  competitive-exam patterns.

  They are NOT official papers and should never be presented
  as official SSC, Bank PO, or RRB papers.

  VERIFY WITH OFFICIAL NOTIFICATION before using real exam
  timings, marks, section structure, negative marking, etc.
*/

export const examCatalog = [
  {
    id: "ssc-cgl-mini",

    name: {
      "en-IN": "SSC CGL Style Mini Test",
      "hi-IN": "SSC CGL शैली मिनी टेस्ट",
      "mr-IN": "SSC CGL शैली मिनी टेस्ट",
      "gu-IN": "SSC CGL શૈલી મિની ટેસ્ટ",
      "bn-IN": "SSC CGL স্টাইল মিনি টেস্ট",
      "ta-IN": "SSC CGL பாணி மினி தேர்வு",
    },

    totalMinutes: 60,

    sectionalTiming: false,

    sections: [
      {
        name: "General Intelligence",
        subject: "Reasoning",
        questions: 10,
        minutes: 15,
        marks: 2,
        negative: 0.5,
      },
      {
        name: "General Awareness",
        subject: "General Knowledge",
        questions: 10,
        minutes: 15,
        marks: 2,
        negative: 0.5,
      },
      {
        name: "Quantitative Aptitude",
        subject: "Mathematics",
        questions: 10,
        minutes: 15,
        marks: 2,
        negative: 0.5,
      },
      {
        name: "English Comprehension",
        subject: "English",
        questions: 10,
        minutes: 15,
        marks: 2,
        negative: 0.5,
      },
    ],
  },

  {
    id: "bank-po-mini",

    name: {
      "en-IN": "Bank PO Style Mini Test",
      "hi-IN": "Bank PO शैली मिनी टेस्ट",
      "mr-IN": "Bank PO शैली मिनी टेस्ट",
      "gu-IN": "Bank PO શૈલી મિની ટેસ્ટ",
      "bn-IN": "Bank PO স্টাইল মিনি টেস্ট",
      "ta-IN": "Bank PO பாணி மினி தேர்வு",
    },

    totalMinutes: 45,

    sectionalTiming: true,

    sections: [
      {
        name: "English Language",
        subject: "English",
        questions: 10,
        minutes: 15,
        marks: 1,
        negative: 0.25,
      },
      {
        name: "Quantitative Aptitude",
        subject: "Mathematics",
        questions: 10,
        minutes: 15,
        marks: 1,
        negative: 0.25,
      },
      {
        name: "Reasoning Ability",
        subject: "Reasoning",
        questions: 10,
        minutes: 15,
        marks: 1,
        negative: 0.25,
      },
    ],
  },

  {
    id: "rrb-ntpc-mini",

    name: {
      "en-IN": "RRB NTPC Style Mini Test",
      "hi-IN": "RRB NTPC शैली मिनी टेस्ट",
      "mr-IN": "RRB NTPC शैली मिनी टेस्ट",
      "gu-IN": "RRB NTPC શૈલી મિની ટેસ્ટ",
      "bn-IN": "RRB NTPC স্টাইল মিনি টেস্ট",
      "ta-IN": "RRB NTPC பாணி மினி தேர்வு",
    },

    totalMinutes: 45,

    sectionalTiming: false,

    sections: [
      {
        name: "Mathematics",
        subject: "Mathematics",
        questions: 10,
        minutes: 15,
        marks: 1,
        negative: 1 / 3,
      },
      {
        name: "General Intelligence and Reasoning",
        subject: "Reasoning",
        questions: 10,
        minutes: 15,
        marks: 1,
        negative: 1 / 3,
      },
      {
        name: "General Awareness",
        subject: "General Knowledge",
        questions: 10,
        minutes: 15,
        marks: 1,
        negative: 1 / 3,
      },
    ],
  },
];

/*
  Returns the exam matching the given ID.
*/
export function getExamById(examId) {
  return examCatalog.find((exam) => exam.id === examId);
}

/*
  Returns the exam name in the user's selected language.

  If a translation is missing, English is used.
*/
export function getExamName(exam, language = "en-IN") {
  if (!exam) {
    return "";
  }

  return exam.name[language] || exam.name["en-IN"];
}

/*
  Returns total number of questions in an exam.
*/
export function getTotalQuestions(exam) {
  if (!exam) {
    return 0;
  }

  return exam.sections.reduce(
    (total, section) => total + section.questions,
    0
  );
}