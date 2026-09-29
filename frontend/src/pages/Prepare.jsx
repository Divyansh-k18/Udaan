import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";
import { useAccessibility } from "../context/AccessibilityContext";

import { getQuestions } from "../data/questionBank";

import {
  speak,
  stopSpeaking,
  beep,
} from "../services/speech";

import { listenOnce } from "../services/listen";
import { matchCommand } from "../voice/commands";
import useShortcuts from "../hooks/useShortcuts";

import {
  recordPracticeAttempt,
  getWeakTopic,
  getBookmarks,
  setBookmark,
} from "../services/practiceStore";

import "../styles/prepare.css";

/*
  getQuestions() may return either:
  - an array
  - or { questions: [], warning: "..." }

  This helper supports both.
*/
function extractQuestions(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.questions)) {
    return result.questions;
  }

  return [];
}

function extractWarning(result) {
  if (Array.isArray(result)) {
    return "";
  }

  return result?.warning || "";
}

/*
  Supports both:
  "Hello"

  and:

  {
    "en-IN": "Hello",
    en: "Hello"
  }
*/
function localize(value, language) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "object") {
    return String(value);
  }

  const shortLanguage = language?.split("-")[0];

  return (
    value[language] ??
    value[shortLanguage] ??
    value["en-IN"] ??
    value.en ??
    ""
  );
}

function getLocalizedOptions(options, language) {
  const localized = localize(options, language);

  return Array.isArray(localized)
    ? localized
    : [];
}

/*
  questionBank uses numeric option indexes:
  0 = A
  1 = B
  2 = C
  3 = D

  We also accept A/B/C/D just to make the
  component more defensive.
*/
function getAnswerIndex(answer) {
  if (typeof answer === "number") {
    return answer;
  }

  const value = String(answer ?? "")
    .trim()
    .toUpperCase();

  if (/^[A-D]$/.test(value)) {
    return value.charCodeAt(0) - 65;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  return -1;
}

function optionLetter(index) {
  return String.fromCharCode(65 + index);
}

function commandOptionToIndex(value) {
  if (typeof value === "number") {
    return value;
  }

  const cleaned = String(value ?? "")
    .trim()
    .toUpperCase();

  if (/^[A-D]$/.test(cleaned)) {
    return cleaned.charCodeAt(0) - 65;
  }

  const number = Number(cleaned);

  if (
    Number.isInteger(number) &&
    number >= 0 &&
    number <= 3
  ) {
    return number;
  }

  return -1;
}

/*
  Step 8 did not originally contain SKIP and
  RETRY_WRONG, so Prepare mode recognises these
  two extra English commands locally.

  Existing voice commands still go through
  matchCommand().
*/
function matchPrepareOnlyCommand(text) {
  const value = String(text || "")
    .trim()
    .toLowerCase();

  if (
    value.includes("retry wrong") ||
    value.includes("retry incorrect") ||
    value.includes("try wrong again")
  ) {
    return {
      command: "RETRY_WRONG",
    };
  }

  if (
    value === "skip" ||
    value === "skip question" ||
    value === "skip this question"
  ) {
    return {
      command: "SKIP",
    };
  }

  return null;
}

function Prepare() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const { language, t } = useLanguage();

  const { preferences } = useAccessibility();

  const headingRef = useRef(null);

  const voiceMode =
    preferences?.voiceMode || "silent";

  const speechRate =
    Number(preferences?.speechRate) || 1;

  const voiceCommandsEnabled =
    preferences?.voiceCommands !== false;

  /*
    Page states:

    select   = choose subject/topic
    practice = answer questions
    result   = show result
  */
  const [phase, setPhase] = useState("select");

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [selectedTopic, setSelectedTopic] =
    useState("");

  const [questions, setQuestions] = useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  /*
    answers format:

    {
      questionId: {
        selected: 2,
        correct: true
      }
    }
  */
  const [answers, setAnswers] = useState({});

  const [bookmarks, setBookmarks] = useState(
    () => new Set(getBookmarks())
  );

  const [liveMessage, setLiveMessage] =
    useState("");

  const [bankWarning, setBankWarning] =
    useState("");

  const [weakTopic, setWeakTopic] =
    useState(null);

  const [showHelp, setShowHelp] =
    useState(false);

  /*
    Use t() when a translation already exists.
    Otherwise show a safe English fallback.
  */
  function ui(key, fallback, values = {}) {
    try {
      const translated = t(key, values);

      if (
        translated &&
        translated !== key
      ) {
        return translated;
      }
    } catch {
      // Use fallback below.
    }

    return fallback;
  }

  /*
    Get enough questions so we can discover
    every available subject/topic for this exam.
  */
  const allQuestions = useMemo(() => {
    try {
      const result = getQuestions({
        exam: examId,
        count: 999,
        shuffle: false,
        language,
      });

      return extractQuestions(result);
    } catch (error) {
      console.error(
        "Could not load questions:",
        error
      );

      return [];
    }
  }, [examId, language]);

  const subjects = useMemo(() => {
    return [
      ...new Set(
        allQuestions
          .map((question) => question.subject)
          .filter(Boolean)
      ),
    ];
  }, [allQuestions]);

  const topics = useMemo(() => {
    if (!selectedSubject) {
      return [];
    }

    return [
      ...new Set(
        allQuestions
          .filter(
            (question) =>
              question.subject === selectedSubject
          )
          .map((question) => question.topic)
          .filter(Boolean)
      ),
    ];
  }, [allQuestions, selectedSubject]);

  const currentQuestion =
    questions[currentIndex] || null;

  const currentAnswer =
    currentQuestion
      ? answers[currentQuestion.id]
      : null;

  const currentOptions =
    currentQuestion
      ? getLocalizedOptions(
          currentQuestion.options,
          language
        )
      : [];

  const currentQuestionText =
    currentQuestion
      ? localize(
          currentQuestion.text,
          language
        )
      : "";

  const currentSpokenText =
    currentQuestion
      ? localize(
          currentQuestion.spoken,
          language
        ) || currentQuestionText
      : "";

  const currentExplanation =
    currentQuestion
      ? localize(
          currentQuestion.explanation,
          language
        )
      : "";

  const currentCorrectIndex =
    currentQuestion
      ? getAnswerIndex(
          currentQuestion.answer
        )
      : -1;

  const currentBookmarked =
    currentQuestion
      ? bookmarks.has(currentQuestion.id)
      : false;

  const correctCount = Object.values(
    answers
  ).filter((answer) => answer.correct).length;

  const attemptedCount =
    Object.keys(answers).length;

  const wrongQuestionIds =
    questions
      .filter(
        (question) =>
          answers[question.id]?.correct === false
      )
      .map((question) => question.id);

  /*
    Accessible page focus.
  */
  useEffect(() => {
    headingRef.current?.focus();
  }, [phase]);

  /*
    If subject changes, clear an old topic.
  */
  useEffect(() => {
    if (
      selectedTopic &&
      !topics.includes(selectedTopic)
    ) {
      setSelectedTopic("");
    }
  }, [topics, selectedTopic]);

  function buildOptionsSpeech(question) {
    const options = getLocalizedOptions(
      question?.options,
      language
    );

    if (!options.length) {
      return "";
    }

    return options
      .map(
        (option, index) =>
          `${optionLetter(index)}. ${option}`
      )
      .join(". ");
  }

  function buildQuestionSpeech(question) {
    if (!question) {
      return "";
    }

    const spoken =
      localize(
        question.spoken,
        language
      ) ||
      localize(
        question.text,
        language
      );

    const optionsSpeech =
      buildOptionsSpeech(question);

    return `${spoken}. ${ui(
      "prepare.options",
      "Options"
    )}. ${optionsSpeech}`;
  }

  function speakOnlyInUdaanMode(text) {
    if (
      voiceMode !== "udaan" ||
      !text
    ) {
      return;
    }

    speak(
      text,
      language,
      speechRate
    );
  }

  /*
    Automatically read each new question only
    in "Udaan speaks" mode.

    Screen-reader mode receives normal semantic
    HTML instead, preventing double speech.
  */
  useEffect(() => {
    if (
      phase !== "practice" ||
      !currentQuestion ||
      voiceMode !== "udaan"
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      speak(
        buildQuestionSpeech(
          currentQuestion
        ),
        language,
        speechRate
      );
    }, 100);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    phase,
    currentIndex,
    currentQuestion?.id,
    voiceMode,
    language,
    speechRate,
  ]);

  function startPractice(
    topicOverride = selectedTopic,
    questionIds = null
  ) {
    if (
      !selectedSubject ||
      !topicOverride
    ) {
      setLiveMessage(
        ui(
          "prepare.chooseSubjectTopic",
          "Choose a subject and topic first."
        )
      );

      return;
    }

    stopSpeaking();

    try {
      const result = getQuestions({
        exam: examId,
        subject: selectedSubject,
        topic: topicOverride,
        count: 999,
        shuffle: true,
        language,
      });

      let loadedQuestions =
        extractQuestions(result);

      if (questionIds) {
        const allowedIds =
          new Set(questionIds);

        loadedQuestions =
          loadedQuestions.filter(
            (question) =>
              allowedIds.has(question.id)
          );
      }

      setBankWarning(
        extractWarning(result)
      );

      if (!loadedQuestions.length) {
        setLiveMessage(
          ui(
            "prepare.noQuestions",
            "No questions are available for this topic yet."
          )
        );

        return;
      }

      setSelectedTopic(topicOverride);
      setQuestions(loadedQuestions);
      setCurrentIndex(0);
      setAnswers({});
      setWeakTopic(null);
      setPhase("practice");

      setLiveMessage(
        `${topicOverride}. ${
          loadedQuestions.length
        } ${ui(
          "prepare.questionsReady",
          "questions ready."
        )}`
      );
    } catch (error) {
      console.error(error);

      setLiveMessage(
        ui(
          "prepare.loadError",
          "Questions could not be loaded."
        )
      );
    }
  }

  function finishPractice() {
    stopSpeaking();

    const weak =
      getWeakTopic(
        examId,
        selectedSubject
      );

    setWeakTopic(weak);
    setPhase("result");

    const resultText =
      `${ui(
        "prepare.score",
        "Score"
      )}: ${correctCount} ${ui(
        "prepare.outOf",
        "out of"
      )} ${questions.length}. ` +
      (
        weak
          ? `${ui(
              "prepare.weakTopic",
              "Weak topic"
            )}: ${weak.topic}.`
          : ""
      );

    setLiveMessage(resultText);

    speakOnlyInUdaanMode(resultText);
  }

  function nextQuestion() {
    stopSpeaking();

    if (
      currentIndex <
      questions.length - 1
    ) {
      setCurrentIndex(
        (index) => index + 1
      );

      setLiveMessage(
        ui(
          "prepare.nextQuestion",
          "Next question."
        )
      );
    } else {
      finishPractice();
    }
  }

  function previousQuestion() {
    stopSpeaking();

    if (currentIndex <= 0) {
      setLiveMessage(
        ui(
          "prepare.firstQuestion",
          "This is the first question."
        )
      );

      return;
    }

    setCurrentIndex(
      (index) => index - 1
    );

    setLiveMessage(
      ui(
        "prepare.previousQuestion",
        "Previous question."
      )
    );
  }

  function repeatQuestion() {
    if (!currentQuestion) {
      return;
    }

    if (voiceMode !== "udaan") {
      setLiveMessage(
        ui(
          "prepare.speechOff",
          "Udaan speech is not enabled. The question is available on screen and to your screen reader."
        )
      );

      return;
    }

    speak(
      buildQuestionSpeech(
        currentQuestion
      ),
      language,
      speechRate
    );
  }

  function readOptions() {
    if (!currentQuestion) {
      return;
    }

    if (voiceMode !== "udaan") {
      setLiveMessage(
        ui(
          "prepare.speechOff",
          "Udaan speech is not enabled. The options are available on screen and to your screen reader."
        )
      );

      return;
    }

    const optionsSpeech =
      buildOptionsSpeech(
        currentQuestion
      );

    speak(
      `${ui(
        "prepare.options",
        "Options"
      )}. ${optionsSpeech}`,
      language,
      speechRate
    );
  }

  function selectOption(optionIndex) {
    if (
      phase !== "practice" ||
      !currentQuestion
    ) {
      return;
    }

    if (currentAnswer) {
      setLiveMessage(
        ui(
          "prepare.alreadyAnswered",
          "This question has already been answered."
        )
      );

      return;
    }

    if (
      optionIndex < 0 ||
      optionIndex >= currentOptions.length
    ) {
      return;
    }

    const correct =
      optionIndex ===
      currentCorrectIndex;

    setAnswers((previous) => ({
      ...previous,

      [currentQuestion.id]: {
        selected: optionIndex,
        correct,
      },
    }));

    recordPracticeAttempt({
      examId,
      subject: selectedSubject,
      topic: selectedTopic,
      correct,
    });

    const correctLetter =
      currentCorrectIndex >= 0
        ? optionLetter(
            currentCorrectIndex
          )
        : "";

    let resultMessage;

    if (correct) {
      resultMessage =
        `${ui(
          "prepare.correct",
          "Correct."
        )} ${currentExplanation}`;
    } else {
      resultMessage =
        `${ui(
          "prepare.wrong",
          "Wrong."
        )} ` +
        `${ui(
          "prepare.correctAnswer",
          "The correct answer is"
        )} ${correctLetter}. ` +
        `${currentExplanation}`;
    }

    setLiveMessage(resultMessage);

    /*
      Silent mode = no sounds at all.
    */
    if (voiceMode !== "silent") {
      try {
        beep(
          correct
            ? "correct"
            : "wrong"
        );
      } catch (error) {
        console.error(
          "Audio beep failed:",
          error
        );
      }
    }

    /*
      speak() cancels previous speech,
      so result + explanation are sent as
      one utterance.

      It still naturally says:
      "Correct. Explanation..."
    */
    speakOnlyInUdaanMode(
      resultMessage
    );
  }

  function explainAgain() {
    if (!currentQuestion) {
      return;
    }

    if (!currentAnswer) {
      setLiveMessage(
        ui(
          "prepare.answerFirst",
          "Answer the question before requesting the explanation."
        )
      );

      return;
    }

    const message =
      `${ui(
        "prepare.explanation",
        "Explanation"
      )}. ${currentExplanation}`;

    setLiveMessage(message);

    speakOnlyInUdaanMode(message);
  }

  function toggleBookmark() {
    if (!currentQuestion) {
      return;
    }

    const shouldBookmark =
      !bookmarks.has(
        currentQuestion.id
      );

    const updated =
      setBookmark(
        currentQuestion.id,
        shouldBookmark
      );

    setBookmarks(
      new Set(updated)
    );

    setLiveMessage(
      shouldBookmark
        ? ui(
            "prepare.bookmarked",
            "Question bookmarked."
          )
        : ui(
            "prepare.bookmarkRemoved",
            "Bookmark removed."
          )
    );
  }

  function skipQuestion() {
    if (!currentQuestion) {
      return;
    }

    setLiveMessage(
      ui(
        "prepare.skipped",
        "Question skipped."
      )
    );

    /*
      Skipped questions are deliberately
      NOT stored as attempted.
    */
    nextQuestion();
  }

  function retryWrong() {
    /*
      On the result screen retry every wrong
      question from this session.
    */
    if (phase === "result") {
      if (!wrongQuestionIds.length) {
        setLiveMessage(
          ui(
            "prepare.noWrong",
            "There are no wrong questions to retry."
          )
        );

        return;
      }

      startPractice(
        selectedTopic,
        wrongQuestionIds
      );

      return;
    }

    /*
      During practice retry only the current
      question if it was wrong.
    */
    if (
      !currentQuestion ||
      !currentAnswer ||
      currentAnswer.correct
    ) {
      setLiveMessage(
        ui(
          "prepare.notWrong",
          "The current question does not need a wrong-answer retry."
        )
      );

      return;
    }

    setAnswers((previous) => {
      const updated = {
        ...previous,
      };

      delete updated[
        currentQuestion.id
      ];

      return updated;
    });

    setLiveMessage(
      ui(
        "prepare.retryReady",
        "Try the question again."
      )
    );

    speakOnlyInUdaanMode(
      buildQuestionSpeech(
        currentQuestion
      )
    );
  }

  function openHelp() {
    setShowHelp(true);

    setLiveMessage(
      ui(
        "prepare.helpOpened",
        "Prepare mode help opened."
      )
    );
  }

  function stopEverything() {
    stopSpeaking();
    setShowHelp(false);

    setLiveMessage(
      ui(
        "prepare.stopped",
        "Speech stopped."
      )
    );
  }

  /*
    IMPORTANT:
    This is the ONE handlers object.

    Keyboard, buttons and voice all eventually
    call functions from this same object.
  */
  const handlers = {
    next: nextQuestion,
    previous: previousQuestion,
    repeat: repeatQuestion,
    readOptions,
    selectOption,
    explainAgain,
    bookmark: toggleBookmark,
    skip: skipQuestion,
    retryWrong,
    help: openHelp,
    stop: stopEverything,

    listen: async () => {
      if (!voiceCommandsEnabled) {
        setLiveMessage(
          ui(
            "prepare.voiceCommandsOff",
            "Voice commands are turned off in accessibility settings."
          )
        );

        return;
      }

      try {
        if (voiceMode !== "silent") {
          beep("listen");
        }

        setLiveMessage(
          ui(
            "prepare.listening",
            "Listening..."
          )
        );

        const alternatives =
          await listenOnce(language);

        let matched = null;
        let heardText = "";

        for (
          const alternative of alternatives
        ) {
          const transcript =
            alternative?.transcript || "";

          if (!heardText) {
            heardText = transcript;
          }

          matched =
            matchPrepareOnlyCommand(
              transcript
            ) ||
            matchCommand(
              transcript,
              language
            );

          if (matched) {
            break;
          }
        }

        if (!matched) {
          if (
            voiceMode !== "silent"
          ) {
            beep("error");
          }

          setLiveMessage(
            heardText
              ? `Heard: ${heardText}. ${ui(
                  "prepare.unknownCommand",
                  "Command not recognised."
                )}`
              : ui(
                  "prepare.unknownCommand",
                  "Command not recognised."
                )
          );

          return;
        }

        if (voiceMode !== "silent") {
          beep("ok");
        }

        setLiveMessage(
          heardText
            ? `Heard: ${heardText}`
            : ui(
                "prepare.commandReceived",
                "Voice command received."
              )
        );

        handleVoiceCommand(matched);
      } catch (error) {
        console.error(error);

        if (voiceMode !== "silent") {
          try {
            beep("error");
          } catch {
            // Ignore audio failure.
          }
        }

        const errorCode =
          error?.code || "";

        if (
          errorCode ===
          "not-supported"
        ) {
          setLiveMessage(
            "Voice input is not supported in this browser. Keyboard controls still work."
          );
        } else if (
          errorCode ===
          "mic-blocked"
        ) {
          setLiveMessage(
            "Microphone access is blocked. Allow microphone permission or use the keyboard."
          );
        } else if (
          errorCode === "no-speech"
        ) {
          setLiveMessage(
            "No speech was detected. Please try again."
          );
        } else if (
          errorCode === "network"
        ) {
          setLiveMessage(
            "Voice recognition had a network problem. Keyboard controls still work."
          );
        } else {
          setLiveMessage(
            "Voice command could not be heard. Keyboard controls still work."
          );
        }
      }
    },
  };

  /*
    Every recognised voice command is routed
    through the SAME handlers object above.
  */
  function handleVoiceCommand(
    commandData
  ) {
    let commandName = "";

    if (
      typeof commandData === "string"
    ) {
      commandName = commandData;
    } else {
      commandName =
        commandData?.command ||
        commandData?.id ||
        "";
    }

    commandName =
      String(commandName)
        .trim()
        .toUpperCase();

    const commandValue =
      commandData?.option ??
      commandData?.value;

    switch (commandName) {
      case "NEXT":
        handlers.next();
        break;

      case "PREVIOUS":
        handlers.previous();
        break;

      case "REPEAT":
        handlers.repeat();
        break;

      case "READ_OPTIONS":
        handlers.readOptions();
        break;

      case "SELECT_OPTION": {
        const index =
          commandOptionToIndex(
            commandValue
          );

        if (index >= 0) {
          handlers.selectOption(index);
        }

        break;
      }

      case "EXPLAIN_AGAIN":
        handlers.explainAgain();
        break;

      case "BOOKMARK":
        handlers.bookmark();
        break;

      case "SKIP":
        handlers.skip();
        break;

      case "RETRY_WRONG":
        handlers.retryWrong();
        break;

      case "HELP":
        handlers.help();
        break;

      case "STOP":
        handlers.stop();
        break;

      default:
        setLiveMessage(
          ui(
            "prepare.unsupportedCommand",
            "That command is not available in Prepare mode."
          )
        );
    }
  }

  /*
    Keyboard also calls the SAME handlers.
  */
  useShortcuts({
    next: handlers.next,
    previous: handlers.previous,
    repeat: handlers.repeat,
    bookmark: handlers.bookmark,
    explain: handlers.explainAgain,
    help: handlers.help,
    listen: handlers.listen,

    option1: () =>
      handlers.selectOption(0),

    option2: () =>
      handlers.selectOption(1),

    option3: () =>
      handlers.selectOption(2),

    option4: () =>
      handlers.selectOption(3),

    escape: handlers.stop,
  });

  /*
    VoiceStatus from Layout can send:

    window.dispatchEvent(
      new CustomEvent(
        "udaan:voice-command",
        { detail: command }
      )
    )

    Listen to it here and route it through
    the same handlers object.
  */
  useEffect(() => {
    function receiveVoiceCommand(
      event
    ) {
      handleVoiceCommand(
        event.detail
      );
    }

    window.addEventListener(
      "udaan:voice-command",
      receiveVoiceCommand
    );

    return () => {
      window.removeEventListener(
        "udaan:voice-command",
        receiveVoiceCommand
      );
    };
  });

  function chooseAnotherTopic() {
    stopSpeaking();

    setPhase("select");
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setWeakTopic(null);

    setLiveMessage(
      ui(
        "prepare.chooseAnother",
        "Choose another topic."
      )
    );
  }

  function practiseWeakTopic() {
    if (!weakTopic) {
      return;
    }

    setSelectedTopic(
      weakTopic.topic
    );

    startPractice(
      weakTopic.topic
    );
  }

  /*
    -------------------------
    SUBJECT + TOPIC SELECTION
    -------------------------
  */
  if (phase === "select") {
    return (
      <main className="prepare-page">
        <h1
          ref={headingRef}
          tabIndex="-1"
        >
          {ui(
            "prepare.title",
            "Prepare Mode"
          )}
        </h1>

        <p className="prepare-intro">
          Practise one topic at a time.
          There is no strict timer.
        </p>

        <p>
          Exam:{" "}
          <strong>
            {examId}
          </strong>
        </p>

        {allQuestions.length === 0 && (
          <div
            className="prepare-message"
            role="alert"
          >
            No practice questions are
            currently available for this
            exam.
          </div>
        )}

        <div className="prepare-field">
          <label htmlFor="prepare-subject">
            <strong>
              Choose subject
            </strong>
          </label>

          <select
            id="prepare-subject"
            value={selectedSubject}
            onChange={(event) => {
              setSelectedSubject(
                event.target.value
              );

              setSelectedTopic("");
            }}
          >
            <option value="">
              Select a subject
            </option>

            {subjects.map((subject) => (
              <option
                key={subject}
                value={subject}
              >
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="prepare-field">
          <label htmlFor="prepare-topic">
            <strong>
              Choose topic
            </strong>
          </label>

          <select
            id="prepare-topic"
            value={selectedTopic}
            disabled={!selectedSubject}
            onChange={(event) =>
              setSelectedTopic(
                event.target.value
              )
            }
          >
            <option value="">
              Select a topic
            </option>

            {topics.map((topic) => (
              <option
                key={topic}
                value={topic}
              >
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="prepare-actions">
          <button
            type="button"
            className="prepare-primary"
            disabled={
              !selectedSubject ||
              !selectedTopic
            }
            onClick={() =>
              startPractice()
            }
          >
            Start Practice
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/mode/${examId}`
              )
            }
          >
            Back
          </button>
        </div>

        <div
          className="sr-live"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveMessage}
        </div>
      </main>
    );
  }

  /*
    -------------
    RESULT SCREEN
    -------------
  */
  if (phase === "result") {
    return (
      <main className="prepare-page">
        <h1
          ref={headingRef}
          tabIndex="-1"
        >
          Practice Complete
        </h1>

        <section
          className="prepare-result-card"
          aria-labelledby="result-score"
        >
          <h2 id="result-score">
            Score: {correctCount} /{" "}
            {questions.length}
          </h2>

          <p>
            Attempted:{" "}
            <strong>
              {attemptedCount}
            </strong>
          </p>

          <p>
            Correct:{" "}
            <strong>
              {correctCount}
            </strong>
          </p>

          <p>
            Wrong:{" "}
            <strong>
              {wrongQuestionIds.length}
            </strong>
          </p>

          {weakTopic ? (
            <>
              <h2>
                Weak topic
              </h2>

              <p>
                <strong>
                  {weakTopic.topic}
                </strong>
              </p>

              <p>
                Accuracy:{" "}
                {weakTopic.accuracy}%
              </p>

              <p>
                {weakTopic.correct} correct
                from{" "}
                {weakTopic.attempted}{" "}
                attempts
              </p>
            </>
          ) : (
            <p>
              Complete some answered
              questions to calculate a weak
              topic.
            </p>
          )}
        </section>

        <div className="prepare-actions">
          {weakTopic && (
            <button
              type="button"
              className="prepare-primary"
              onClick={
                practiseWeakTopic
              }
            >
              Practise weak topics
            </button>
          )}

          {wrongQuestionIds.length >
            0 && (
            <button
              type="button"
              onClick={
                handlers.retryWrong
              }
            >
              Retry wrong questions
            </button>
          )}

          <button
            type="button"
            onClick={
              chooseAnotherTopic
            }
          >
            Choose another topic
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/mode/${examId}`
              )
            }
          >
            Back to mode selection
          </button>
        </div>

        <div
          className="sr-live"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveMessage}
        </div>
      </main>
    );
  }

  /*
    ---------------
    PRACTICE SCREEN
    ---------------
  */
  return (
    <main className="prepare-page">
      <h1
        ref={headingRef}
        tabIndex="-1"
      >
        Prepare Mode
      </h1>

      {bankWarning && (
        <div
          className="prepare-warning"
          role="alert"
        >
          {bankWarning}
        </div>
      )}

      <section
        className="prepare-progress"
        aria-label="Practice progress"
      >
        <p>
          Question{" "}
          <strong>
            {currentIndex + 1}
          </strong>{" "}
          of{" "}
          <strong>
            {questions.length}
          </strong>
        </p>

        <p>
          Subject:{" "}
          <strong>
            {selectedSubject}
          </strong>
        </p>

        <p>
          Topic:{" "}
          <strong>
            {selectedTopic}
          </strong>
        </p>
      </section>

      {currentQuestion && (
        <article
          className="prepare-question"
          aria-labelledby="question-text"
        >
          <h2 id="question-text">
            {currentQuestionText}
          </h2>

          <div
            className="prepare-options"
            role="group"
            aria-label="Answer options"
          >
            {currentOptions.map(
              (option, index) => {
                const selected =
                  currentAnswer?.selected ===
                  index;

                return (
                  <button
                    key={`${currentQuestion.id}-${index}`}
                    type="button"
                    className={
                      selected
                        ? "prepare-option selected"
                        : "prepare-option"
                    }
                    aria-pressed={
                      selected
                    }
                    disabled={
                      Boolean(
                        currentAnswer
                      )
                    }
                    onClick={() =>
                      handlers.selectOption(
                        index
                      )
                    }
                  >
                    <strong>
                      {optionLetter(
                        index
                      )}
                      .
                    </strong>{" "}
                    {option}
                  </button>
                );
              }
            )}
          </div>

          {currentAnswer && (
            <section
              className="prepare-feedback"
              aria-labelledby="answer-result"
            >
              <h3 id="answer-result">
                {currentAnswer.correct
                  ? "Correct"
                  : "Wrong"}
              </h3>

              {!currentAnswer.correct &&
                currentCorrectIndex >=
                  0 && (
                  <p>
                    Correct answer:{" "}
                    <strong>
                      {optionLetter(
                        currentCorrectIndex
                      )}
                    </strong>
                  </p>
                )}

              <h3>
                Explanation
              </h3>

              <p>
                {currentExplanation}
              </p>
            </section>
          )}
        </article>
      )}

      <div className="prepare-actions">
        <button
          type="button"
          onClick={
            handlers.previous
          }
          disabled={
            currentIndex === 0
          }
        >
          Previous
          <span className="shortcut-hint">
            {" "}
            Alt+P
          </span>
        </button>

        <button
          type="button"
          className="prepare-primary"
          onClick={handlers.next}
        >
          {currentIndex ===
          questions.length - 1
            ? "Finish practice"
            : "Next"}
          <span className="shortcut-hint">
            {" "}
            Alt+N
          </span>
        </button>

        <button
          type="button"
          onClick={handlers.skip}
        >
          Skip
        </button>

        <button
          type="button"
          aria-pressed={
            currentBookmarked
          }
          onClick={
            handlers.bookmark
          }
        >
          {currentBookmarked
            ? "Remove bookmark"
            : "Bookmark"}
          <span className="shortcut-hint">
            {" "}
            Alt+B
          </span>
        </button>

        <button
          type="button"
          onClick={handlers.repeat}
        >
          Repeat question
          <span className="shortcut-hint">
            {" "}
            Alt+R
          </span>
        </button>

        <button
          type="button"
          onClick={
            handlers.readOptions
          }
        >
          Read options
        </button>

        <button
          type="button"
          disabled={!currentAnswer}
          onClick={
            handlers.explainAgain
          }
        >
          Explain again
          <span className="shortcut-hint">
            {" "}
            Alt+E
          </span>
        </button>

        <button
          type="button"
          disabled={
            !currentAnswer ||
            currentAnswer.correct
          }
          onClick={
            handlers.retryWrong
          }
        >
          Retry wrong
        </button>

        {voiceCommandsEnabled && (
          <button
            type="button"
            onClick={
              handlers.listen
            }
          >
            Listen for command
            <span className="shortcut-hint">
              {" "}
              Alt+V
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={handlers.help}
        >
          Help
          <span className="shortcut-hint">
            {" "}
            Alt+H
          </span>
        </button>
      </div>

      {showHelp && (
        <section
          className="prepare-help"
          aria-labelledby="prepare-help-title"
        >
          <h2 id="prepare-help-title">
            Prepare mode help
          </h2>

          <p>
            Keyboard shortcuts:
            Alt+N next, Alt+P previous,
            Alt+R repeat, Alt+B bookmark,
            Alt+E explanation, Alt+V
            listen, and Alt+1 to Alt+4
            choose options A to D.
          </p>

          <p>
            Voice commands include next,
            previous, repeat, read options,
            option A, option B, option C,
            option D, bookmark, skip,
            retry wrong, explain again,
            help and stop.
          </p>

          <button
            type="button"
            onClick={() => {
              setShowHelp(false);

              setLiveMessage(
                "Help closed."
              );
            }}
          >
            Close help
          </button>
        </section>
      )}

      {currentAnswer &&
        !currentAnswer.correct && (
        <p className="prepare-tip">
          You can retry this question before
          moving on.
        </p>
      )}

      <div
        className="sr-live"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveMessage}
      </div>
    </main>
  );
}

export default Prepare;