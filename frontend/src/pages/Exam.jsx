import { keyboardGuide } from "../components/VoiceGuide";
import ExamDialog from "../components/ExamDialog";
import { storage } from "../services/storage.js";
import { isValidSavedSession, roundMarks, normalisePercent, adjustedSeconds, getFlatQuestions, calculateResult, getSectionRemainingAfterRefresh } from "../services/examLogic.js";
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

import { buildPaper } from "../data/questionBank";

import { useLanguage } from "../context/LanguageContext";
import { useAccessibility } from "../context/AccessibilityContext";

import useShortcuts from "../hooks/useShortcuts";

import {
  speak,
  stopSpeaking,
} from "../services/speech";

import { listenOnce } from "../services/listen";
import { matchCommand } from "../voice/commands";

import Timer, {
  formatSpokenTime,
} from "../components/Timer";

import QuestionView from "../components/QuestionView";
import SectionBar from "../components/SectionBar";

import "../styles/mock.css";

const SESSION_VERSION = 1;

const LAST_RESULT_KEY =
  "udaan_mock_last_result_v1";

const OPTION_LETTERS = [
  "A",
  "B",
  "C",
  "D",
];

function getSessionKey(examId, language) {
  return `udaan_mock_session_v1:${examId}:${language}`;
}

function optionValueToIndex(value) {
  if (
    typeof value === "number"
  ) {
    if (value === 0) {
      return 0;
    }

    if (
      value >= 1 &&
      value <= 4
    ) {
      return value - 1;
    }
  }

  const text =
    String(value ?? "")
      .trim()
      .toUpperCase();

  if (
    OPTION_LETTERS.includes(text)
  ) {
    return OPTION_LETTERS.indexOf(text);
  }

  const number = Number(text);

  if (
    Number.isInteger(number) &&
    number >= 1 &&
    number <= 4
  ) {
    return number - 1;
  }

  return -1;
}

function Exam() {
  const { examId } = useParams();

  const navigate = useNavigate();

  const { language } =
    useLanguage();

  const { preferences } =
    useAccessibility();

  const initialExtraTime = useRef(preferences?.extraTimePercent);
  const sessionKey =
    useMemo(
      () =>
        getSessionKey(
          examId,
          language
        ),
      [examId, language]
    );

  const [phase, setPhase] =
    useState("loading");

  const [paper, setPaper] =
    useState(null);

  const [
    examExtraTimePercent,
    setExamExtraTimePercent,
  ] = useState(0);

  const [
    currentQuestionId,
    setCurrentQuestionId,
  ] = useState(null);

  const [
    currentSectionIndex,
    setCurrentSectionIndex,
  ] = useState(0);

  const [answers, setAnswers] =
    useState({});

  const [marked, setMarked] =
    useState({});

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(0);

  const [
    remainingSectionSeconds,
    setRemainingSectionSeconds,
  ] = useState(0);

  const [
    liveMessage,
    setLiveMessage,
  ] = useState({
    id: 0,
    text: "",
  });

  const [
    showSubmitConfirm,
    setShowSubmitConfirm,
  ] = useState(false);

  const [
    showGoTo,
    setShowGoTo,
  ] = useState(false);

  const [goToValue, setGoToValue] =
    useState("");

  const submitButtonRef =
    useRef(null);

  const submitYesRef =
    useRef(null);

  const goToInputRef =
    useRef(null);

  const announcedThresholds =
    useRef(new Set());

  const handledSectionExpiry =
    useRef(null);

  const handledExamExpiry =
    useRef(false);

  const voiceMode =
    preferences?.voiceMode ||
    "silent";

  const udaanSpeaks =
    voiceMode === "udaan" ||
    voiceMode === "Udaan speaks";

  const speechRate =
    Number(
      preferences?.speechRate
    ) || 1;

  const voiceCommandsEnabled =
    preferences?.voiceCommands !==
    false;

  const flatQuestions =
    useMemo(
      () =>
        getFlatQuestions(paper),
      [paper]
    );

  const currentEntry =
    useMemo(
      () =>
        flatQuestions.find(
          (entry) =>
            entry.question.id ===
            currentQuestionId
        ) || null,
      [
        flatQuestions,
        currentQuestionId,
      ]
    );

  const currentSection =
    paper?.sections?.[
      currentSectionIndex
    ] || null;

  const currentAnswer =
    currentEntry
      ? answers[
          currentEntry.question.id
        ]
      : undefined;

  const isCurrentMarked =
    currentEntry
      ? Boolean(
          marked[
            currentEntry.question.id
          ]
        )
      : false;

  const unansweredCount =
    flatQuestions.filter(
      ({ question }) =>
        !Number.isInteger(
          answers[question.id]
        )
    ).length;

  const totalMaxMarks =
    paper
      ? paper.sections.reduce(
          (total, section) =>
            total +
            section.questions.length *
              Number(
                section.marksPerQuestion ||
                  0
              ),
          0
        )
      : 0;

  function announce(
    text,
    shouldSpeak = true
  ) {
    setLiveMessage({
      id: Date.now(),
      text,
    });

    if (
      shouldSpeak &&
      udaanSpeaks
    ) {
      speak(
        text,
        language,
        speechRate
      );
    }
  }

  function requireExamStarted() {
    if (phase !== "exam") {
      announce(
        "Start the mock test first."
      );

      return false;
    }

    return true;
  }

  function getAccessibleEntries() {
    if (!paper) {
      return [];
    }

    if (!paper.sectionalTiming) {
      return flatQuestions;
    }

    return flatQuestions.filter(
      (entry) =>
        entry.sectionIndex ===
        currentSectionIndex
    );
  }

  function moveToEntry(entry) {
    if (!entry) {
      return;
    }

    setCurrentQuestionId(
      entry.question.id
    );

    setCurrentSectionIndex(
      entry.sectionIndex
    );
  }

  function nextQuestion() {
    if (!requireExamStarted()) {
      return;
    }

    const available =
      getAccessibleEntries();

    const position =
      available.findIndex(
        (entry) =>
          entry.question.id ===
          currentQuestionId
      );

    if (
      position < 0 ||
      position >=
        available.length - 1
    ) {
      if (paper?.sectionalTiming) {
        announce(
          "This is the last question in the current section."
        );
      } else {
        announce(
          "This is the last question in the mock test."
        );
      }

      return;
    }

    moveToEntry(
      available[position + 1]
    );
  }

  function previousQuestion() {
    if (!requireExamStarted()) {
      return;
    }

    const available =
      getAccessibleEntries();

    const position =
      available.findIndex(
        (entry) =>
          entry.question.id ===
          currentQuestionId
      );

    if (position <= 0) {
      announce(
        "This is the first available question."
      );

      return;
    }

    moveToEntry(
      available[position - 1]
    );
  }

  function selectOption(index) {
    if (!requireExamStarted()) {
      return;
    }

    if (
      !currentEntry ||
      index < 0 ||
      index >
        currentEntry.question.options
          .length -
          1
    ) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [currentEntry.question.id]:
        index,
    }));

    announce(
      `Option ${OPTION_LETTERS[index]} selected.`
    );
  }

  function clearAnswer() {
    if (!requireExamStarted()) {
      return;
    }

    if (!currentEntry) {
      return;
    }

    setAnswers((previous) => {
      const next = {
        ...previous,
      };

      delete next[
        currentEntry.question.id
      ];

      return next;
    });

    announce(
      "Answer cleared."
    );
  }

  function toggleMark() {
    if (!requireExamStarted()) {
      return;
    }

    if (!currentEntry) {
      return;
    }

    const id =
      currentEntry.question.id;

    const nextValue =
      !marked[id];

    setMarked((previous) => ({
      ...previous,
      [id]: nextValue,
    }));

    announce(
      nextValue
        ? "Question marked for review."
        : "Review mark removed."
    );
  }

  function repeatQuestion() {
    if (!requireExamStarted()) {
      return;
    }

    if (!currentEntry) {
      return;
    }

    announce(
      currentEntry.question.spoken ||
        currentEntry.question.text
    );
  }

  function readOptions() {
    if (!requireExamStarted()) {
      return;
    }

    if (!currentEntry) {
      return;
    }

    const text =
      currentEntry.question.options
        .map(
          (option, index) =>
            `Option ${OPTION_LETTERS[index]}, ${option}`
        )
        .join(". ");

    announce(text);
  }

  function announceTimeLeft() {
    if (!requireExamStarted()) {
      return;
    }

    if (paper.sectionalTiming) {
      announce(
        `${currentSection?.name || "Current section"}: ${formatSpokenTime(
          remainingSectionSeconds
        )} remaining.`
      );
    } else {
      announce(
        `${formatSpokenTime(
          remainingSeconds
        )} remaining in the mock test.`
      );
    }
  }

  function announceSectionStatus() {
    if (!requireExamStarted()) {
      return;
    }

    const totalAnswered =
      flatQuestions.filter(
        ({ question }) =>
          Number.isInteger(
            answers[question.id]
          )
      ).length;

    const totalMarked =
      flatQuestions.filter(
        ({ question }) =>
          marked[question.id]
      ).length;

    const sectionAnswered =
      currentSection?.questions.filter(
        (question) =>
          Number.isInteger(
            answers[question.id]
          )
      ).length || 0;

    const sectionMarked =
      currentSection?.questions.filter(
        (question) =>
          marked[question.id]
      ).length || 0;

    announce(
      `${totalAnswered} of ${flatQuestions.length} questions answered. ` +
        `${unansweredCount} unanswered. ` +
        `${totalMarked} marked for review. ` +
        `${currentSection?.name || "Current section"} has ` +
        `${sectionAnswered} answered and ${sectionMarked} marked.`
    );
  }

  function jumpToQuestion(
    questionNumber
  ) {
    if (!requireExamStarted()) {
      return;
    }

    const number =
      Number(questionNumber);

    if (
      !Number.isInteger(number) ||
      number < 1 ||
      number >
        flatQuestions.length
    ) {
      announce(
        `Enter a question number between 1 and ${flatQuestions.length}.`
      );

      return;
    }

    const target =
      flatQuestions[number - 1];

    if (
      paper.sectionalTiming &&
      target.sectionIndex !==
        currentSectionIndex
    ) {
      announce(
        "That question is outside the current timed section."
      );

      return;
    }

    moveToEntry(target);

    setShowGoTo(false);
    setGoToValue("");

    announce(
      `Moved to question ${number}.`
    );
  }

  function openGoTo(
    questionNumber = null
  ) {
    if (!requireExamStarted()) {
      return;
    }

    if (
      Number.isInteger(
        Number(questionNumber)
      ) &&
      Number(questionNumber) > 0
    ) {
      jumpToQuestion(
        Number(questionNumber)
      );

      return;
    }

    setShowGoTo(true);

    setTimeout(() => {
      goToInputRef.current?.focus();
    }, 0);
  }

  function handleSectionChange(
    sectionIndex
  ) {
    if (!requireExamStarted()) {
      return;
    }

    if (
      paper.sectionalTiming &&
      sectionIndex !==
        currentSectionIndex
    ) {
      announce(
        "Section changes are locked because this mock test uses sectional timing."
      );

      return;
    }

    const firstQuestion =
      paper.sections[
        sectionIndex
      ]?.questions?.[0];

    if (!firstQuestion) {
      return;
    }

    setCurrentSectionIndex(
      sectionIndex
    );

    setCurrentQuestionId(
      firstQuestion.id
    );

    announce(
      `Moved to ${paper.sections[sectionIndex].name}.`
    );
  }

  function requestSubmit() {
    if (!requireExamStarted()) {
      return;
    }

    setShowSubmitConfirm(true);

    announce(
      `Submit mock test? ${unansweredCount} questions are unanswered.`
    );

    setTimeout(() => {
      submitYesRef.current?.focus();
    }, 0);
  }

  function cancelSubmit() {
    setShowSubmitConfirm(false);

    announce(
      "Submission cancelled.",
      false
    );

    setTimeout(() => {
      submitButtonRef.current?.focus();
    }, 0);
  }

  function getTotalAvailableSeconds() {
    if (!paper) {
      return 0;
    }

    if (paper.sectionalTiming) {
      return paper.sections.reduce(
        (total, section) =>
          total +
          adjustedSeconds(
            section.minutes,
            examExtraTimePercent
          ),
        0
      );
    }

    return adjustedSeconds(
      paper.totalMinutes,
      examExtraTimePercent
    );
  }

  function getSecondsStillAvailable() {
    if (!paper) {
      return 0;
    }

    if (!paper.sectionalTiming) {
      return remainingSeconds;
    }

    const futureSections =
      paper.sections
        .slice(
          currentSectionIndex + 1
        )
        .reduce(
          (total, section) =>
            total +
            adjustedSeconds(
              section.minutes,
              examExtraTimePercent
            ),
          0
        );

    return (
      remainingSectionSeconds +
      futureSections
    );
  }

  function finalizeExam(
    autoSubmitted = false
  ) {
    if (!paper) {
      return;
    }

    const result =
      calculateResult(
        paper,
        answers
      );

    const totalAvailable =
      getTotalAvailableSeconds();

    const stillAvailable =
      getSecondsStillAvailable();

    result.timeUsedSeconds =
      Math.max(
        0,
        totalAvailable -
          stillAvailable
      );

    result.extraTimePercent =
      examExtraTimePercent;

    result.sectionalTiming =
      Boolean(
        paper.sectionalTiming
      );

    result.autoSubmitted =
      autoSubmitted;

    result.id = crypto.randomUUID();
    result.questions = flatQuestions.map(({ question, section }) => {
      const chosen = answers[question.id];
      const attempted = Number.isInteger(chosen);
      return {
        id: question.id, subject: question.subject || section.subject,
        section: section.name, topic: question.topic,
        chosen: attempted ? OPTION_LETTERS[chosen] : "",
        correct: attempted && chosen === question.answer, attempted,
        marks: section.marksPerQuestion, negative: section.negativeMarks,
        seconds: null,
      };
    });
    result.submittedAt =
      new Date().toISOString();

    result.warning =
      paper.warning || null;

    storage.setItem(
      LAST_RESULT_KEY,
      JSON.stringify(result)
    );

    storage.removeItem(
      sessionKey
    );

    setPhase("submitted");

    stopSpeaking();

    if (
      autoSubmitted &&
      udaanSpeaks
    ) {
      speak(
        "Time is up. Your mock test has been submitted.",
        language,
        speechRate
      );
    }

    navigate(
      "/result",
      {
        replace: true,
        state: {
          result,
        },
      }
    );
  }

  function startExam() {
    if (!paper) {
      return;
    }

    if (
      flatQuestions.length === 0
    ) {
      announce(
        "This mock test contains no available questions."
      );

      return;
    }

    setPhase("exam");

    if (!currentQuestionId) {
      setCurrentQuestionId(
        flatQuestions[0].question.id
      );

      setCurrentSectionIndex(
        flatQuestions[0].sectionIndex
      );
    }

    announce(
      `${paper.examName} started.`
    );
  }

  function showHelp() {
    announce(
      "Keyboard shortcuts: Alt N next, Alt P previous, Alt R repeat question, " +
        "Alt T time left, Alt M mark, Alt G go to question, Alt C section status, " +
        "Alt S submit, and Alt 1 through Alt 4 choose an option."
    );
  }

  function closePanels() {
    stopSpeaking();

    setShowSubmitConfirm(false);
    setShowGoTo(false);
  }

  function handleVoiceCommand(
    matched
  ) {
    if (!matched) {
      return false;
    }

    const commandId =
      typeof matched.command ===
      "string"
        ? matched.command
        : matched.command?.id ||
          matched.id;

    switch (commandId) {
      case "NEXT":
        handlers.next();
        return true;

      case "PREVIOUS":
        handlers.previous();
        return true;

      case "REPEAT":
        handlers.repeat();
        return true;

      case "READ_OPTIONS":
        handlers.readOptions();
        return true;

      case "SELECT_OPTION": {
        const optionIndex =
          optionValueToIndex(
            matched.option ??
              matched.value
          );

        if (optionIndex >= 0) {
          handlers.selectOption(
            optionIndex
          );

          return true;
        }

        return false;
      }

      case "CLEAR":
        handlers.clear();
        return true;

      case "MARK":
        handlers.mark();
        return true;

      case "TIME_LEFT":
        handlers.timeLeft();
        return true;

      case "GO_TO":
        handlers.goTo(
          matched.questionNumber ??
            matched.value
        );

        return true;

      case "SECTION_STATUS":
        handlers.sectionStatus();
        return true;

      case "SUBMIT":
        handlers.submit();
        return true;

      case "YES":
        if (showSubmitConfirm) {
          handlers.confirmSubmit();
          return true;
        }

        return false;

      case "NO":
        if (showSubmitConfirm) {
          handlers.cancelSubmit();
          return true;
        }

        return false;

      case "START_EXAM":
        if (phase === "instructions") {
          handlers.startExam();
          return true;
        }

        return false;

      case "HELP":
        handlers.help();
        return true;

      case "STOP":
        handlers.escape();
        return true;

      default:
        return false;
    }
  }

  async function listenForCommand() {
    if (
      !voiceCommandsEnabled
    ) {
      announce(
        "Voice commands are turned off in accessibility settings.",
        false
      );

      return;
    }

    try {
      const alternatives =
        await listenOnce(language);

      for (const alternative of alternatives) {
        const transcript =
          typeof alternative ===
          "string"
            ? alternative
            : alternative.transcript;

        const matched =
          matchCommand(
            transcript,
            language
          );

        if (
          handleVoiceCommand(
            matched
          )
        ) {
          return;
        }
      }

      announce(
        "Voice command not recognised."
      );
    } catch (error) {
      const errorCode =
        error?.code ||
        "recognition-error";

      const messages = {
        "not-supported":
          "Speech recognition is not supported in this browser.",

        "mic-blocked":
          "Microphone permission is blocked.",

        "no-speech":
          "No speech was detected.",

        network:
          "Speech recognition had a network error.",

        "recognition-error":
          "Speech recognition could not understand the command.",
      };

      announce(
        messages[errorCode] ||
          messages[
            "recognition-error"
          ]
      );
    }
  }

  const handlers = {
    next: nextQuestion,

    previous:
      previousQuestion,

    repeat:
      repeatQuestion,

    readOptions,

    selectOption,

    clear: clearAnswer,

    mark: toggleMark,

    timeLeft:
      announceTimeLeft,

    goTo: openGoTo,

    sectionStatus:
      announceSectionStatus,

    submit:
      requestSubmit,

    confirmSubmit: () =>
      finalizeExam(false),

    cancelSubmit,

    startExam,

    help: showHelp,

    listen:
      listenForCommand,

    language: () => {
      if (
        phase === "exam"
      ) {
        announce(
          "Language cannot be changed during an active mock test."
        );
      }
    },

    escape:
      closePanels,
  };

  const voiceHandlerRef = useRef(handleVoiceCommand);
  useEffect(() => { voiceHandlerRef.current = handleVoiceCommand; });
  useEffect(() => {
    const listener = (event) => voiceHandlerRef.current(event.detail);
    window.addEventListener("udaan:voice-command", listener);
    return () => { window.removeEventListener("udaan:voice-command", listener); stopSpeaking(); };
  }, []);

  useShortcuts({
    next:
      handlers.next,

    previous:
      handlers.previous,

    repeat:
      handlers.repeat,

    timeLeft:
      handlers.timeLeft,

    mark:
      handlers.mark,

    help:
      handlers.help,

    listen:
      handlers.listen,

    language:
      handlers.language,

    submit:
      handlers.submit,

    goTo:
      handlers.goTo,

    sectionStatus:
      handlers.sectionStatus,

    option1: () =>
      handlers.selectOption(0),

    option2: () =>
      handlers.selectOption(1),

    option3: () =>
      handlers.selectOption(2),

    option4: () =>
      handlers.selectOption(3),

    escape:
      handlers.escape,
  }, { enabled: !showSubmitConfirm && !showGoTo });

  /*
    Load a saved mock test, or create
    a new paper.
  */
  useEffect(() => {
    let saved = null;

    try {
      const raw =
        storage.getItem(
          sessionKey
        );

      if (raw) {
        saved = JSON.parse(raw);
      }
    } catch {
      storage.removeItem(
        sessionKey
      );
    }

    const preferenceExtraTime =
      normalisePercent(
        initialExtraTime.current
      );

    if (
      isValidSavedSession(saved, examId)
    ) {
      const restoredPaper =
        saved.paper;

      const extraTime =
        normalisePercent(
          saved.extraTimePercent
        );

      const elapsedSeconds =
        saved.started &&
        saved.lastSavedAt
          ? Math.max(
              0,
              Math.floor(
                (
                  Date.now() -
                  saved.lastSavedAt
                ) / 1000
              )
            )
          : 0;

      setPaper(
        restoredPaper
      );

      setExamExtraTimePercent(
        extraTime
      );

      setAnswers(
        saved.answers || {}
      );

      setMarked(
        saved.marked || {}
      );

      if (
        restoredPaper.sectionalTiming
      ) {
        const restored =
          getSectionRemainingAfterRefresh(
            saved,
            restoredPaper,
            extraTime,
            elapsedSeconds
          );

        setCurrentSectionIndex(
          restored.sectionIndex
        );

        setRemainingSectionSeconds(
          restored.remaining
        );

        const savedQuestionExists =
          restoredPaper.sections[
            restored.sectionIndex
          ]?.questions?.some(
            (question) =>
              question.id ===
              saved.currentQuestionId
          );

        if (
          savedQuestionExists
        ) {
          setCurrentQuestionId(
            saved.currentQuestionId
          );
        } else {
          setCurrentQuestionId(
            restoredPaper.sections[
              restored.sectionIndex
            ]?.questions?.[0]?.id ||
              null
          );
        }
      } else {
        const startingSeconds =
          typeof saved.remainingSeconds ===
          "number"
            ? saved.remainingSeconds
            : adjustedSeconds(
                restoredPaper.totalMinutes,
                extraTime
              );

        setRemainingSeconds(
          saved.started
            ? Math.max(
                0,
                startingSeconds -
                  elapsedSeconds
              )
            : startingSeconds
        );

        setCurrentSectionIndex(
          Number(
            saved.currentSectionIndex ||
              0
          )
        );

        setCurrentQuestionId(
          saved.currentQuestionId ||
            getFlatQuestions(
              restoredPaper
            )[0]?.question?.id ||
            null
        );
      }

      setPhase(
        saved.started
          ? "exam"
          : "instructions"
      );

      return;
    }

    const newPaper =
      buildPaper(
        examId,
        language
      );

    const flat =
      getFlatQuestions(
        newPaper
      );

    setPaper(newPaper);

    setExamExtraTimePercent(
      preferenceExtraTime
    );

    setAnswers({});
    setMarked({});

    setCurrentSectionIndex(0);

    setCurrentQuestionId(
      flat[0]?.question?.id ||
        null
    );

    setRemainingSeconds(
      adjustedSeconds(
        newPaper.totalMinutes,
        preferenceExtraTime
      )
    );

    setRemainingSectionSeconds(
      adjustedSeconds(
        newPaper.sections?.[0]
          ?.minutes,
        preferenceExtraTime
      )
    );

    setPhase("instructions");
  }, [
    examId,
    language,
    sessionKey,
  ]);

  /*
    Local v1 autosave.

    It stores:
    - paper order
    - answers
    - review marks
    - current question
    - timer
  */
  useEffect(() => {
    if (
      !paper ||
      phase === "loading" ||
      phase === "submitted"
    ) {
      return;
    }

    const session = {
      version:
        SESSION_VERSION,

      examId,

      language,

      paper,

      extraTimePercent:
        examExtraTimePercent,

      started:
        phase === "exam",

      answers,

      marked,

      currentQuestionId,

      currentSectionIndex,

      remainingSeconds,

      remainingSectionSeconds,

      lastSavedAt:
        Date.now(),
    };

    storage.setItem(
      sessionKey,
      JSON.stringify(session)
    );
  }, [
    paper,
    phase,
    answers,
    marked,
    currentQuestionId,
    currentSectionIndex,
    remainingSeconds,
    remainingSectionSeconds,
    examExtraTimePercent,
    examId,
    language,
    sessionKey,
  ]);

  // Use elapsed wall time: browser throttling must not grant extra exam time.
  const timerStateRef = useRef(null);
  useEffect(() => {
    timerStateRef.current = { remainingSeconds, remainingSectionSeconds, currentSectionIndex, announce };
  });
  useEffect(() => {
    if (phase !== "exam" || !paper) return;
    let lastTick = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastTick) / 1000);
      if (elapsed < 1) return;
      lastTick += elapsed * 1000;
      const current = timerStateRef.current;
      const previous = paper.sectionalTiming ? current.remainingSectionSeconds : current.remainingSeconds;
      let next = Math.max(0, previous - elapsed);
      if (paper.sectionalTiming) {
        const restored = getSectionRemainingAfterRefresh(current, paper, examExtraTimePercent, elapsed);
        next = restored.remaining;
        setRemainingSectionSeconds(next);
        if (restored.sectionIndex !== current.currentSectionIndex) {
          setCurrentSectionIndex(restored.sectionIndex);
          setCurrentQuestionId(paper.sections[restored.sectionIndex]?.questions[0]?.id || null);
          current.announce(`Section time ended. Moving to ${paper.sections[restored.sectionIndex].name}.`);
        }
      } else {
        setRemainingSeconds(next);
      }
      for (const threshold of [600, 300, 60]) {
        const key = `${current.currentSectionIndex}-${threshold}`;
        if (previous > threshold && next <= threshold && !announcedThresholds.current.has(key)) {
          announcedThresholds.current.add(key);
          current.announce(`${formatSpokenTime(next)} remaining.`);
          break;
        }
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [phase, paper, examExtraTimePercent]);

  const expiryActions = useRef(null);
  useEffect(() => { expiryActions.current = { finalizeExam, announce }; });

  /*
    Overall timer expiry.
  */
  useEffect(() => {
    if (
      phase !== "exam" ||
      !paper ||
      paper.sectionalTiming ||
      remainingSeconds !== 0 ||
      handledExamExpiry.current
    ) {
      return;
    }

    handledExamExpiry.current =
      true;

    expiryActions.current.finalizeExam(true);
  }, [
    remainingSeconds,
    phase,
    paper,
  ]);

  /*
    Section timer expiry.
  */
  useEffect(() => {
    if (
      phase !== "exam" ||
      !paper?.sectionalTiming ||
      remainingSectionSeconds !==
        0
    ) {
      return;
    }

    if (
      handledSectionExpiry.current ===
      currentSectionIndex
    ) {
      return;
    }

    handledSectionExpiry.current =
      currentSectionIndex;

    const nextSectionIndex =
      currentSectionIndex + 1;

    if (
      nextSectionIndex <
      paper.sections.length
    ) {
      const nextSection =
        paper.sections[
          nextSectionIndex
        ];

      setCurrentSectionIndex(
        nextSectionIndex
      );

      setCurrentQuestionId(
        nextSection.questions?.[0]
          ?.id || null
      );

      setRemainingSectionSeconds(
        adjustedSeconds(
          nextSection.minutes,
          examExtraTimePercent
        )
      );

      expiryActions.current.announce(
        `${currentSection?.name || "Section"} time is over. ` +
          `Moving to ${nextSection.name}.`
      );

      return;
    }

    expiryActions.current.finalizeExam(true);
  }, [
    remainingSectionSeconds,
    phase,
    paper,
    currentSectionIndex,
    examExtraTimePercent,
    currentSection?.name,
  ]);

  const introductionRead = useRef(false);
  const questionSpeech = currentEntry ? `${currentEntry.question.spoken || currentEntry.question.text}. ${currentEntry.question.options.map((option, index) => `Option ${OPTION_LETTERS[index]}: ${option}`).join('. ')}` : "";
  useEffect(() => {
    if (phase !== "exam") { introductionRead.current = false; return; }
    if (!udaanSpeaks || !questionSpeech) return;
    const timer = setTimeout(() => {
      const introduction = introductionRead.current ? "" : "Mock exam started. ";
      introductionRead.current = true;
      speak(introduction + questionSpeech, language, speechRate);
    }, 100);
    return () => { clearTimeout(timer); stopSpeaking(); };
  }, [phase, currentQuestionId, questionSpeech, udaanSpeaks, language, speechRate]);

  useEffect(() => {
    if (phase !== "exam") return;
    const heading = document.querySelector(".question-header h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus();
  }, [currentQuestionId, phase]);

  if (phase === "loading") {
    return (
      <section className="mock-page">
        <h1>
          Loading mock test…
        </h1>
      </section>
    );
  }

  if (!paper) {
    return (
      <section className="mock-page">
        <h1>
          Mock test unavailable
        </h1>

        <p role="alert">
          The exam could not be loaded.
        </p>

        <button
          type="button"
          className="mock-button"
          onClick={() =>
            navigate("/exams")
          }
        >
          Back to Exams
        </button>
      </section>
    );
  }

  if (phase === "instructions") {
    return (
      <section className="mock-page">
        <section className="mock-card">
          <p className="mock-eyebrow">
            Mock Test Instructions
          </p>

          <h1>
            {paper.examName}
          </h1>

          {paper.warning && (
            <div
              className="mock-warning"
              role="alert"
            >
              <strong>
                Question bank warning:
              </strong>{" "}
              {paper.warning}
            </div>
          )}

          <div className="mock-summary-grid">
            <div>
              <strong>
                Questions
              </strong>

              <span>
                {flatQuestions.length}
              </span>
            </div>

            <div>
              <strong>
                Time
              </strong>

              <span>
                {paper.totalMinutes}
                {" minutes"}
              </span>
            </div>

            <div>
              <strong>
                Maximum marks
              </strong>

              <span>
                {roundMarks(
                  totalMaxMarks
                )}
              </span>
            </div>

            <div>
              <strong>
                Timing
              </strong>

              <span>
                {paper.sectionalTiming
                  ? "Section timers"
                  : "Overall timer"}
              </span>
            </div>
          </div>

          {examExtraTimePercent >
            0 && (
            <p>
              Your accessibility
              setting adds{" "}
              <strong>
                {
                  examExtraTimePercent
                }
                %
              </strong>{" "}
              extra time.
            </p>
          )}

          <h2>
            Sections
          </h2>

          <div className="mock-instruction-sections">
            {paper.sections.map(
              (section, index) => (
                <article
                  key={`${section.subject}-${index}`}
                  className="mock-instruction-section"
                >
                  <h3>
                    {index + 1}.{" "}
                    {section.name}
                  </h3>

                  <p>
                    Questions:{" "}
                    <strong>
                      {
                        section.questions
                          .length
                      }
                    </strong>
                  </p>

                  <p>
                    Time:{" "}
                    <strong>
                      {
                        section.minutes
                      }{" "}
                      minutes
                    </strong>
                  </p>

                  <p>
                    Correct answer:{" "}
                    <strong>
                      +
                      {
                        section.marksPerQuestion
                      }{" "}
                      mark
                      {Number(
                        section.marksPerQuestion
                      ) === 1
                        ? ""
                        : "s"}
                    </strong>
                  </p>

                  <p>
                    Wrong answer:{" "}
                    <strong>
                      -
                      {
                        section.negativeMarks
                      }{" "}
                      mark
                      {Number(
                        section.negativeMarks
                      ) === 1
                        ? ""
                        : "s"}
                    </strong>
                  </p>
                </article>
              )
            )}
          </div>

          {paper.sectionalTiming ? (
            <p>
              This mock uses{" "}
              <strong>
                sectional timing
              </strong>
              . When a section timer
              reaches zero, Udaan moves
              to the next section. You
              cannot return to an expired
              section.
            </p>
          ) : (
            <p>
              This mock uses one overall
              timer. You may move between
              sections while time
              remains.
            </p>
          )}

          <p>
            Your answers, marked
            questions, current position
            and remaining time are saved
            locally on this device for
            hackathon v1. Refreshing the
            page will resume the mock.
          </p>

          <div className="mock-actions">
            <button
              type="button"
              className="mock-button mock-primary"
              onClick={
                handlers.startExam
              }
            >
              Start Mock Test
            </button>

            {voiceCommandsEnabled && (
              <button
                type="button"
                className="mock-button"
                onClick={
                  handlers.listen
                }
              >
                Listen for Voice Command
              </button>
            )}

            <button
              type="button"
              className="mock-button"
              onClick={() =>
                navigate("/exams")
              }
            >
              Back to Exams
            </button>
          </div>
        </section>

        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveMessage.text}
        </div>
      </section>
    );
  }

  return (
    <section className="mock-page">
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveMessage.text}
      </div>

      <header className="mock-exam-header">
        <div>
          <p className="mock-eyebrow">
            Mock Test
          </p>

          <h1>
            {paper.examName}
          </h1>

          <p>
            {currentSection?.name}
          </p>
        </div>

        <Timer
          seconds={
            paper.sectionalTiming
              ? remainingSectionSeconds
              : remainingSeconds
          }
          label={
            paper.sectionalTiming
              ? "Section time left"
              : "Time left"
          }
        />
      </header>

      <div className="mock-utility-actions">
        <button
          type="button"
          className="mock-button"
          onClick={
            handlers.timeLeft
          }
        >
          Time Left
        </button>

        <button
          type="button"
          className="mock-button"
          onClick={
            handlers.sectionStatus
          }
        >
          Status
        </button>

        {voiceCommandsEnabled && (
          <button
            type="button"
            className="mock-button"
            onClick={
              handlers.listen
            }
          >
            Voice Command
          </button>
        )}
      </div>

      <SectionBar
        sections={paper.sections}
        currentSectionIndex={
          currentSectionIndex
        }
        answers={answers}
        marked={marked}
        canChangeSection={
          !paper.sectionalTiming
        }
        onSectionChange={
          handleSectionChange
        }
      />

      <QuestionView
        question={
          currentEntry?.question
        }
        questionNumber={
          currentEntry
            ? currentEntry.globalIndex +
              1
            : 0
        }
        totalQuestions={
          flatQuestions.length
        }
        sectionName={
          currentSection?.name
        }
        selectedAnswer={Number.isInteger(currentAnswer) ? OPTION_LETTERS[currentAnswer] : ""}
        langCode={language}
        speechRate={speechRate}
        allowSpeech={udaanSpeaks}
        marked={
          isCurrentMarked
        }
        onSelectAnswer={(id) => handlers.selectOption(OPTION_LETTERS.indexOf(id))}
      />

      <div className="mock-navigation">
        <button
          type="button"
          className="mock-button"
          onClick={
            handlers.previous
          }
        >
          Previous
        </button>

        <button
          type="button"
          className="mock-button"
          onClick={handlers.next}
        >
          Next
        </button>
      </div>

      <div className="mock-actions">
        <button
          type="button"
          className="mock-button"
          aria-pressed={
            isCurrentMarked
          }
          onClick={
            handlers.mark
          }
        >
          {isCurrentMarked
            ? "Unmark"
            : "Mark for Review"}
        </button>

        <button
          type="button"
          className="mock-button"
          onClick={
            handlers.clear
          }
          disabled={
            !Number.isInteger(
              currentAnswer
            )
          }
        >
          Clear Answer
        </button>

        <button
          type="button"
          className="mock-button"
          onClick={() =>
            handlers.goTo()
          }
        >
          Go To Question
        </button>

        <button
          ref={submitButtonRef}
          type="button"
          className="mock-button mock-submit"
          onClick={
            handlers.submit
          }
        >
          Submit Mock Test
        </button>
      </div>

      <p className="mock-current-status">
        Answered:{" "}
        {
          flatQuestions.filter(
            ({ question }) =>
              Number.isInteger(
                answers[question.id]
              )
          ).length
        }
        {" / "}
        {flatQuestions.length}
        {" · "}
        Unanswered:{" "}
        {unansweredCount}
        {" · "}
        Marked:{" "}
        {
          flatQuestions.filter(
            ({ question }) =>
              marked[question.id]
          ).length
        }
      </p>

      {showGoTo && (
        <ExamDialog
          className="mock-dialog"
          onClose={() => setShowGoTo(false)}
          role="dialog"
          aria-labelledby="go-to-title"
        >
          <h2 id="go-to-title">
            Go to Question
          </h2>

          <form
            onSubmit={(event) => {
              event.preventDefault();

              jumpToQuestion(
                Number(goToValue)
              );
            }}
          >
            <label htmlFor="go-to-question">
              Question number
            </label>

            <input
              ref={goToInputRef}
              id="go-to-question"
              type="number"
              min="1"
              max={
                flatQuestions.length
              }
              value={goToValue}
              onChange={(event) =>
                setGoToValue(
                  event.target.value
                )
              }
            />

            {paper.sectionalTiming && (
              <p>
                Only questions in the
                current timed section are
                available.
              </p>
            )}

            <div className="mock-actions">
              <button
                type="submit"
                className="mock-button mock-primary"
              >
                Go
              </button>

              <button
                type="button"
                className="mock-button"
                onClick={() => {
                  setShowGoTo(
                    false
                  );

                  setGoToValue("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </ExamDialog>
      )}

      {showSubmitConfirm && (
        <ExamDialog
          className="mock-dialog mock-submit-confirm"
          onClose={handlers.cancelSubmit}
          role="dialog"
          aria-labelledby="submit-confirm-title"
          aria-describedby="submit-confirm-description"
        >
          <h2 id="submit-confirm-title">
            Submit mock test?
          </h2>

          <p id="submit-confirm-description">
            You have{" "}
            <strong>
              {unansweredCount}
            </strong>{" "}
            unanswered{" "}
            {unansweredCount === 1
              ? "question"
              : "questions"}
            .
          </p>

          <p>
            After submission, your
            answers cannot be changed in
            this attempt.
          </p>

          <div className="mock-actions">
            <button
              ref={submitYesRef}
              type="button"
              className="mock-button mock-submit"
              onClick={
                handlers.confirmSubmit
              }
            >
              Yes, Submit
            </button>

            <button
              type="button"
              className="mock-button"
              onClick={
                handlers.cancelSubmit
              }
            >
              No, Continue Test
            </button>
          </div>
        </ExamDialog>
      )}
    </section>
  );
}

export default Exam;