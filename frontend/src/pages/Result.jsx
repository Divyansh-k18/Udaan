import {
  useEffect,
  useMemo,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import DataTable from "../components/DataTable.jsx";

import {
  buildResultSummary,
  calculateAttempt,
  formatSeconds,
  getTrend,
  readAttempts,
  saveAttempt,
} from "../services/analytics.js";

import {
  speak,
  stopSpeaking,
} from "../services/speech.js";

import "../styles/questionRendering.css";

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(date);
}

function extractQuestions(
  result
) {
  if (
    Array.isArray(
      result.questions
    )
  ) {
    return result.questions;
  }

  if (
    Array.isArray(
      result.questionResults
    )
  ) {
    return result.questionResults;
  }

  /*
    Some result formats keep
    questions inside sections.
  */
  if (
    Array.isArray(
      result.sections
    )
  ) {
    const questions =
      result.sections.flatMap(
        (section) => {
          if (
            !Array.isArray(
              section.questions
            )
          ) {
            return [];
          }

          return section.questions.map(
            (question) => ({
              ...question,

              section:
                question.section ||
                section.name ||
                section.section ||
                "General",
            })
          );
        }
      );

    if (
      questions.length > 0
    ) {
      return questions;
    }
  }

  return [];
}

function buildAttempt(
  locationState
) {
  const result =
    locationState?.result ||
    locationState ||
    {};

  const questions =
    extractQuestions(
      result
    );

  return calculateAttempt({
    ...result,

    examId:
      result.examId,

    examName:
      result.examName ||
      "Exam",

    mode:
      result.mode ||
      "mock",

    totalQuestions:
      result.totalQuestions,

    attempted:
      result.attempted,

    correct:
      result.correct,

    incorrect:
      result.wrong ??
      result.incorrect,

    score:
      result.score,

    maxScore:
      result.maxScore ??
      result.maxMarks,

    accuracy:
      result.accuracy,

    totalSeconds:
      result.timeUsedSeconds ??
      result.totalSeconds,

    sections:
      result.sections,

    questions,

    submittedAt:
      result.submittedAt,
  });
}

export default function Result() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const attempt =
    useMemo(() => {
      if (
        location.state
      ) {
        return buildAttempt(
          location.state
        );
      }

      /*
        If the page was refreshed,
        show the latest stored result.
      */
      const saved =
        readAttempts();

      return (
        saved[
          saved.length - 1
        ] ||
        null
      );
    }, [location.state]);

  useEffect(() => {
    if (attempt) {
      saveAttempt(
        attempt
      );
    }
  }, [attempt]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const summary =
    useMemo(
      () =>
        buildResultSummary(
          attempt
        ),
      [attempt]
    );

  const trend =
    useMemo(() => {
      if (!attempt) {
        return getTrend(
          []
        );
      }

      const oldAttempts =
        readAttempts().filter(
          (item) =>
            item.id !==
            attempt.id
        );

      return getTrend([
        ...oldAttempts,
        attempt,
      ]);
    }, [attempt]);

  function readSummary() {
    stopSpeaking();

    speak(
      summary,
      "en-IN",
      1
    );
  }

  if (!attempt) {
    return (
      <section
        className="accessible-question"
        tabIndex="-1"
      >
        <h1>Result</h1>

        <p role="alert">
          No completed exam result
          was found.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/exams"
            )
          }
        >
          Go to exams
        </button>
      </section>
    );
  }

  const sectionTable = {
    caption:
      "Section performance",

    columns: [
      {
        key: "section",
        label: "Section",
      },

      {
        key: "score",
        label: "Score",
      },

      {
        key: "attempted",
        label: "Attempted",
      },

      {
        key: "correct",
        label: "Correct",
      },

      {
        key: "accuracy",
        label: "Accuracy",
      },

      {
        key: "time",
        label: "Average time",
      },
    ],

    rows:
      attempt.sectionStats.map(
        (section) => ({
          section:
            section.name,

          score:
            `${section.score} / ${section.maxScore}`,

          attempted:
            `${section.attempted} / ${section.total}`,

          correct:
            String(
              section.correct
            ),

          accuracy:
            `${section.accuracy}%`,

          time:
            formatSeconds(
              section.averageSeconds
            ),
        })
      ),

    rowHeaderIndex: 0,
  };

  const topicTable = {
    caption:
      "Topic performance",

    columns: [
      {
        key: "topic",
        label: "Topic",
      },

      {
        key: "attempted",
        label: "Attempted",
      },

      {
        key: "correct",
        label: "Correct",
      },

      {
        key: "accuracy",
        label: "Accuracy",
      },

      {
        key: "attemptedRate",
        label:
          "Attempted rate",
      },

      {
        key: "time",
        label:
          "Average time",
      },
    ],

    rows:
      attempt.topicStats.map(
        (topic) => ({
          topic:
            topic.name,

          attempted:
            `${topic.attempted} / ${topic.total}`,

          correct:
            String(
              topic.correct
            ),

          accuracy:
            `${topic.accuracy}%`,

          attemptedRate:
            `${topic.attemptedRate}%`,

          time:
            formatSeconds(
              topic.averageSeconds
            ),
        })
      ),

    rowHeaderIndex: 0,
  };

  const questionTable = {
    caption:
      "Per-question result",

    columns: [
      {
        key: "question",
        label: "Question",
      },

      {
        key: "topic",
        label: "Topic",
      },

      {
        key: "chosen",
        label: "Chosen",
      },

      {
        key: "result",
        label: "Result",
      },

      {
        key: "time",
        label: "Time",
      },

      {
        key: "score",
        label: "Score",
      },
    ],

    rows:
      attempt.questions.map(
        (question) => ({
          question:
            question.id,

          topic:
            question.topic,

          chosen:
            question.attempted
              ? question.chosen
              : "Not answered",

          result:
            question.correct
              ? "Correct"
              : question.attempted
                ? "Incorrect"
                : "Unanswered",

          time:
            formatSeconds(
              question.seconds
            ),

          score:
            String(
              question.score
            ),
        })
      ),

    rowHeaderIndex: 0,
  };

  const weakTopicText =
    attempt.weakTopics.length > 0
      ? `Topics needing more practice: ${attempt.weakTopics
          .map(
            (topic) =>
              topic.name
          )
          .join(", ")}.`
      : "No weak topic was identified from this attempt.";

  return (
    <section
      className="accessible-question"
      tabIndex="-1"
    >
      <header>
        <h1>
          Exam Result
        </h1>

        <p>
          <strong>
            {attempt.examName}
          </strong>
        </p>

        <p>
          {formatDate(
            attempt.submittedAt
          )}
        </p>
      </header>

      <section
        aria-labelledby="result-summary-title"
      >
        <h2 id="result-summary-title">
          Summary
        </h2>

        <p
          role="status"
          aria-live="polite"
        >
          {summary}
        </p>

        <button
          type="button"
          onClick={
            readSummary
          }
        >
          Read result summary aloud
        </button>

        <dl>
          <div>
            <dt>
              Total score
            </dt>

            <dd>
              {attempt.score} /{" "}
              {attempt.maxScore}
            </dd>
          </div>

          <div>
            <dt>
              Score percentage
            </dt>

            <dd>
              {attempt.scorePercent}%
            </dd>
          </div>

          <div>
            <dt>
              Accuracy
            </dt>

            <dd>
              {attempt.accuracy}%
            </dd>
          </div>

          <div>
            <dt>
              Attempted rate
            </dt>

            <dd>
              {attempt.attemptedRate}%
            </dd>
          </div>

          <div>
            <dt>
              Questions attempted
            </dt>

            <dd>
              {attempt.attempted} /{" "}
              {attempt.totalQuestions}
            </dd>
          </div>

          <div>
            <dt>
              Total time
            </dt>

            <dd>
              {formatSeconds(
                attempt.totalSeconds
              )}
            </dd>
          </div>

          <div>
            <dt>
              Average time per question
            </dt>

            <dd>
              {formatSeconds(
                attempt.averageSecondsPerQuestion
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="section-results-title"
      >
        <h2 id="section-results-title">
          Section scores
        </h2>

        {attempt.sectionStats.length >
        0 ? (
          <DataTable
            table={
              sectionTable
            }
            allowSpeech={
              false
            }
          />
        ) : (
          <p>
            No section data is
            available.
          </p>
        )}
      </section>

      <section
        aria-labelledby="topic-results-title"
      >
        <h2 id="topic-results-title">
          Topic statistics
        </h2>

        <p>
          {weakTopicText}
        </p>

        {attempt.topicStats.length >
        0 ? (
          <DataTable
            table={
              topicTable
            }
            allowSpeech={
              false
            }
          />
        ) : (
          <p>
            Topic-level data was
            not available for this
            attempt.
          </p>
        )}
      </section>

      <section
        aria-labelledby="trend-title"
      >
        <h2 id="trend-title">
          Recent trend
        </h2>

        <p>
          {trend.sentence}
        </p>
      </section>

      <section
        aria-labelledby="question-review-title"
      >
        <h2 id="question-review-title">
          Question review
        </h2>

        {attempt.questions.length >
        0 ? (
          <DataTable
            table={
              questionTable
            }
            allowSpeech={
              false
            }
          />
        ) : (
          <p>
            Question-level review
            data was not available
            from this attempt.
          </p>
        )}
      </section>

      <div
        className="reading-controls"
        aria-label="Result actions"
      >
        <button
          type="button"
          onClick={() =>
            navigate(
              "/progress"
            )
          }
        >
          View progress
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/exams"
            )
          }
        >
          Back to exams
        </button>
      </div>
    </section>
  );
}