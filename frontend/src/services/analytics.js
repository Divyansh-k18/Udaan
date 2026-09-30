import { storage } from "./storage.js";
const STORAGE_KEY = "udaan_attempts_v1";
const MAX_ATTEMPTS = 20;

function number(value, fallback = 0) {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round((number(value) + Number.EPSILON) * factor) / factor;
}

function percent(part, total) {
  if (!total) {
    return 0;
  }

  return round((part / total) * 100, 1);
}

function getChoice(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value.chosen ??
        value.selected ??
        value.selectedAnswer ??
        value.selectedOption ??
        value.value ??
        value.id ??
        ""
    );
  }

  return String(value);
}

export function formatSeconds(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not recorded";
  }

  const total = Math.max(0, Math.round(number(value)));

  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  if (minutes === 0) {
    return `${seconds} sec`;
  }

  if (seconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${seconds} sec`;
}

function normaliseQuestion(question, index) {
  const chosen =
    question.chosen ??
    question.selected ??
    question.selectedAnswer ??
    question.selectedOption ??
    question.userAnswer ??
    "";

  const correctAnswer =
    question.correctAnswer ??
    question.answer ??
    question.answerId ??
    "";

  const attempted =
    typeof question.attempted === "boolean"
      ? question.attempted
      : getChoice(chosen) !== "";

  const correct =
    typeof question.correct === "boolean"
      ? question.correct
      : attempted &&
          correctAnswer !== "" &&
          getChoice(chosen) === getChoice(correctAnswer);

  const marks = number(
    question.marks ??
      question.positiveMarks ??
      question.maxMarks,
    1
  );

  const negative = Math.abs(
    number(
      question.negative ??
        question.negativeMarks ??
        question.penalty,
      0
    )
  );

  let score = 0;

  if (question.score != null && question.score !== "" && Number.isFinite(Number(question.score))) {
    score = number(question.score);
  } else if (attempted && correct) {
    score = marks;
  } else if (attempted && !correct) {
    score = -negative;
  }

  const rawSeconds =
    question.seconds ??
    question.timeSpentSeconds ??
    question.durationSeconds ??
    null;

  const seconds =
    rawSeconds === null ||
    rawSeconds === undefined
      ? null
      : Math.max(0, round(rawSeconds, 1));

  return {
    id: String(
      question.id ??
        question.questionId ??
        index + 1
    ),

    subject:
      question.subject ||
      "General",

    section:
      question.section ||
      question.subject ||
      "General",

    topic:
      question.topic ||
      "General",

    chosen: getChoice(chosen),

    attempted,
    correct,

    seconds,

    marks,
    negative,

    score: round(score, 2),
  };
}

function groupedStats(questions, key) {
  const groups = new Map();

  questions.forEach((question) => {
    const name =
      question[key] ||
      "General";

    if (!groups.has(name)) {
      groups.set(name, {
        name,

        total: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,

        score: 0,
        maxScore: 0,

        recordedSeconds: 0,
        timedQuestions: 0,
      });
    }

    const stat = groups.get(name);

    stat.total += 1;

    if (question.attempted) {
      stat.attempted += 1;
    }

    if (question.correct) {
      stat.correct += 1;
    }

    if (
      question.attempted &&
      !question.correct
    ) {
      stat.incorrect += 1;
    }

    stat.score += question.score;
    stat.maxScore += question.marks;

    if (question.seconds !== null) {
      stat.recordedSeconds +=
        question.seconds;

      stat.timedQuestions += 1;
    }
  });

  return Array.from(groups.values()).map(
    (stat) => ({
      name: stat.name,

      total: stat.total,
      attempted: stat.attempted,
      correct: stat.correct,
      incorrect: stat.incorrect,

      score: round(stat.score, 2),
      maxScore: round(
        stat.maxScore,
        2
      ),

      accuracy: percent(
        stat.correct,
        stat.attempted
      ),

      attemptedRate: percent(
        stat.attempted,
        stat.total
      ),

      averageSeconds:
        stat.timedQuestions > 0
          ? round(
              stat.recordedSeconds /
                stat.timedQuestions,
              1
            )
          : null,
    })
  );
}

export function getWeakTopics(
  topicStats,
  limit = 5
) {
  return [...topicStats]
    .filter(
      (topic) =>
        topic.total > 0 &&
        (
          topic.accuracy < 70 ||
          topic.attemptedRate < 70
        )
    )
    .sort((a, b) => {
      if (
        a.accuracy !== b.accuracy
      ) {
        return (
          a.accuracy -
          b.accuracy
        );
      }

      if (
        a.attemptedRate !==
        b.attemptedRate
      ) {
        return (
          a.attemptedRate -
          b.attemptedRate
        );
      }

      return b.total - a.total;
    })
    .slice(0, limit);
}

export function calculateAttempt(data = {}) {
  const source =
    data.questions ||
    data.questionResults ||
    data.perQuestion ||
    [];

  const questions =
    Array.isArray(source)
      ? source.map(
          normaliseQuestion
        )
      : [];

  const attempted =
    questions.filter(
      (question) =>
        question.attempted
    ).length;

  const correct =
    questions.filter(
      (question) =>
        question.correct
    ).length;

  const incorrect =
    questions.filter(
      (question) =>
        question.attempted &&
        !question.correct
    ).length;

  const score =
    questions.length > 0
      ? round(
          questions.reduce(
            (sum, question) =>
              sum +
              question.score,
            0
          ),
          2
        )
      : number(
          data.score,
          0
        );

  const maxScore =
    questions.length > 0
      ? round(
          questions.reduce(
            (sum, question) =>
              sum +
              question.marks,
            0
          ),
          2
        )
      : number(
          data.maxScore ??
            data.maxMarks,
          0
        );

  const totalQuestions =
    questions.length ||
    number(
      data.totalQuestions,
      0
    );

  const totalSeconds =
    data.totalSeconds ??
    data.timeUsedSeconds ??
    null;

  const timedQuestions =
    questions.filter(
      (question) =>
        question.seconds !== null
    );

  const averageSecondsPerQuestion =
    timedQuestions.length > 0
      ? round(
          timedQuestions.reduce(
            (sum, question) =>
              sum +
              question.seconds,
            0
          ) /
            timedQuestions.length,
          1
        )
      : totalSeconds !== null &&
          totalQuestions > 0
        ? round(
            totalSeconds /
              totalQuestions,
            1
          )
        : null;

  const sectionStats =
    questions.length > 0
      ? groupedStats(
          questions,
          "section"
        )
      : Array.isArray(
            data.sections
          )
        ? data.sections.map(
            (section) => ({
              name:
                section.name ||
                section.section ||
                "Section",

              total:
                section.totalQuestions ??
                section.questions ??
                0,

              attempted:
                section.attempted ??
                0,

              correct:
                section.correct ??
                0,

              incorrect:
                section.wrong ??
                section.incorrect ??
                0,

              score:
                number(
                  section.score
                ),

              maxScore:
                number(
                  section.maxScore ??
                    section.maxMarks
                ),

              accuracy:
                number(
                  section.accuracy
                ),

              attemptedRate:
                percent(
                  section.attempted ??
                    0,
                  section.totalQuestions ??
                    section.questions ??
                    0
                ),

              averageSeconds:
                section.averageSeconds ??
                null,
            })
          )
        : [];

  const topicStats =
    groupedStats(
      questions,
      "topic"
    );

  const weakTopics =
    getWeakTopics(
      topicStats
    );

  const submittedAt =
    data.submittedAt ||
    new Date().toISOString();

  return {
    id:
      data.id ||
      `${
        data.examId ||
        "exam"
      }:${submittedAt}`,

    examId:
      data.examId ||
      "unknown-exam",

    examName:
      data.examName ||
      "Exam",

    mode:
      data.mode ||
      "mock",

    submittedAt,

    totalQuestions,

    attempted:
      questions.length > 0
        ? attempted
        : number(
            data.attempted
          ),

    correct:
      questions.length > 0
        ? correct
        : number(
            data.correct
          ),

    incorrect:
      questions.length > 0
        ? incorrect
        : number(
            data.incorrect ??
              data.wrong
          ),

    score,
    maxScore,

    scorePercent:
      maxScore > 0
        ? percent(
            score,
            maxScore
          )
        : 0,

    accuracy:
      questions.length > 0
        ? percent(
            correct,
            attempted
          )
        : number(
            data.accuracy
          ),

    attemptedRate:
      percent(
        questions.length > 0
          ? attempted
          : data.attempted,
        totalQuestions
      ),

    totalSeconds,

    averageSecondsPerQuestion,

    sectionStats,
    topicStats,
    weakTopics,

    questions,
  };
}

export function readAttempts() {
  try {
    const stored =
      storage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const attempts =
      JSON.parse(stored);

    if (
      !Array.isArray(attempts)
    ) {
      return [];
    }

    return attempts.filter(item => item && typeof item.id === "string" &&
      [item.questions, item.sectionStats, item.topicStats, item.weakTopics].every(Array.isArray)
    ).slice(-MAX_ATTEMPTS);
  } catch {
    return [];
  }
}

export function saveAttempt(attempt) {
  try {
    const attempts =
      readAttempts();

    const withoutDuplicate =
      attempts.filter(
        (item) =>
          item.id !==
          attempt.id
      );

    /*
      Store the required per-question
      review fields.

      We deliberately do not need to
      store the correct answer text.
    */
    const storedAttempt = {
      ...attempt,

      questions:
        attempt.questions.map(
          (question) => ({
            id: question.id,
            subject:
              question.subject,
            section:
              question.section,
            topic:
              question.topic,

            chosen:
              question.chosen,

            attempted:
              question.attempted,

            correct:
              question.correct,

            seconds:
              question.seconds,

            marks:
              question.marks,

            score:
              question.score,
          })
        ),
    };

    const next = [
      ...withoutDuplicate,
      storedAttempt,
    ].slice(-MAX_ATTEMPTS);

    storage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    );

    return storedAttempt;
  } catch {
    return attempt;
  }
}

export function getTrend(
  attempts = []
) {
  const ordered = [
    ...attempts,
  ].sort(
    (a, b) =>
      new Date(
        a.submittedAt
      ).getTime() -
      new Date(
        b.submittedAt
      ).getTime()
  );

  const points =
    ordered.map(
      (attempt, index) => ({
        attemptNumber:
          index + 1,

        id:
          attempt.id,

        examName:
          attempt.examName,

        submittedAt:
          attempt.submittedAt,

        scorePercent:
          round(
            attempt.scorePercent
          ),

        accuracy:
          round(
            attempt.accuracy
          ),
      })
    );

  if (
    points.length === 0
  ) {
    return {
      sentence:
        "No attempts have been saved yet.",

      points,
    };
  }

  if (
    points.length === 1
  ) {
    return {
      sentence:
        `Your first recorded score is ${points[0].scorePercent}%.`,

      points,
    };
  }

  const latest =
    points[
      points.length - 1
    ].scorePercent;

  const previous =
    points[
      points.length - 2
    ].scorePercent;

  const change =
    round(
      latest - previous
    );

  let sentence;

  if (change > 0) {
    sentence =
      `Your latest score is ${latest}%, ` +
      `${change} percentage points higher than the previous attempt.`;
  } else if (
    change < 0
  ) {
    sentence =
      `Your latest score is ${latest}%, ` +
      `${Math.abs(change)} percentage points lower than the previous attempt.`;
  } else {
    sentence =
      `Your latest score is ${latest}%, the same as the previous attempt.`;
  }

  return {
    sentence,
    points,
  };
}

export function getProgressSummary(
  attempts = readAttempts()
) {
  const ordered = [
    ...attempts,
  ].sort(
    (a, b) =>
      new Date(
        a.submittedAt
      ).getTime() -
      new Date(
        b.submittedAt
      ).getTime()
  );

  const topicMap =
    new Map();

  ordered.forEach(
    (attempt) => {
      (
        attempt.questions ||
        []
      ).forEach(
        (question) => {
          const topic =
            question.topic ||
            "General";

          if (
            !topicMap.has(
              topic
            )
          ) {
            topicMap.set(
              topic,
              {
                name:
                  topic,

                total: 0,
                attempted: 0,
                correct: 0,

                seconds: 0,
                timed: 0,
              }
            );
          }

          const stat =
            topicMap.get(
              topic
            );

          stat.total += 1;

          if (
            question.attempted
          ) {
            stat.attempted += 1;
          }

          if (
            question.correct
          ) {
            stat.correct += 1;
          }

          if (
            question.seconds !==
              null &&
            question.seconds !==
              undefined
          ) {
            stat.seconds +=
              number(
                question.seconds
              );

            stat.timed += 1;
          }
        }
      );
    }
  );

  const topicStats =
    Array.from(
      topicMap.values()
    ).map(
      (topic) => ({
        name:
          topic.name,

        total:
          topic.total,

        attempted:
          topic.attempted,

        correct:
          topic.correct,

        accuracy:
          percent(
            topic.correct,
            topic.attempted
          ),

        attemptedRate:
          percent(
            topic.attempted,
            topic.total
          ),

        averageSeconds:
          topic.timed > 0
            ? round(
                topic.seconds /
                  topic.timed
              )
            : null,
      })
    );

  const attemptCount =
    ordered.length;

  const averageScorePercent =
    attemptCount > 0
      ? round(
          ordered.reduce(
            (sum, attempt) =>
              sum +
              number(
                attempt.scorePercent
              ),
            0
          ) /
            attemptCount
        )
      : 0;

  const averageAccuracy =
    attemptCount > 0
      ? round(
          ordered.reduce(
            (sum, attempt) =>
              sum +
              number(
                attempt.accuracy
              ),
            0
          ) /
            attemptCount
        )
      : 0;

  const averageAttemptedRate =
    attemptCount > 0
      ? round(
          ordered.reduce(
            (sum, attempt) =>
              sum +
              number(
                attempt.attemptedRate
              ),
            0
          ) /
            attemptCount
        )
      : 0;

  return {
    attempts:
      ordered,

    attemptCount,

    averageScorePercent,
    averageAccuracy,
    averageAttemptedRate,

    trend:
      getTrend(
        ordered
      ),

    topicStats,

    weakTopics:
      getWeakTopics(
        topicStats
      ),
  };
}

export function buildResultSummary(
  attempt
) {
  if (!attempt) {
    return "No result is available.";
  }

  const weakTopic =
    attempt.weakTopics?.[0];

  return [
    `You scored ${attempt.score} out of ${attempt.maxScore}.`,

    `Accuracy was ${attempt.accuracy} percent.`,

    `You attempted ${attempt.attempted} of ${attempt.totalQuestions} questions.`,

    weakTopic
      ? `A topic needing more practice is ${weakTopic.name}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildProgressSpokenSummary(
  progress
) {
  if (
    !progress ||
    progress.attemptCount === 0
  ) {
    return "No saved attempts are available yet.";
  }

  const weakTopic =
    progress.weakTopics?.[0];

  return [
    `You have ${progress.attemptCount} saved attempts.`,

    `Average score is ${progress.averageScorePercent} percent.`,

    `Average accuracy is ${progress.averageAccuracy} percent.`,

    progress.trend.sentence,

    weakTopic
      ? `A topic needing more practice is ${weakTopic.name}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}