import {
  useEffect,
  useMemo,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import DataTable from "../components/DataTable.jsx";

import {
  buildProgressSpokenSummary,
  formatSeconds,
  getProgressSummary,
  readAttempts,
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

export default function Progress() {
  const navigate =
    useNavigate();

  const progress =
    useMemo(
      () =>
        getProgressSummary(
          readAttempts()
        ),
      []
    );

  const spokenSummary =
    useMemo(
      () =>
        buildProgressSpokenSummary(
          progress
        ),
      [progress]
    );

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  function readSummary() {
    stopSpeaking();

    speak(
      spokenSummary,
      "en-IN",
      1
    );
  }

  if (
    progress.attemptCount ===
    0
  ) {
    return (
      <section
        className="accessible-question"
        tabIndex="-1"
      >
        <h1>
          My Progress
        </h1>

        <p role="status">
          No saved attempts yet.
          Complete a mock test to
          start building your
          progress history.
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

  const trendTable = {
    caption:
      "Score trend for saved attempts",

    columns: [
      {
        key: "attempt",
        label: "Attempt",
      },

      {
        key: "exam",
        label: "Exam",
      },

      {
        key: "date",
        label: "Date",
      },

      {
        key: "score",
        label:
          "Score percentage",
      },

      {
        key: "accuracy",
        label: "Accuracy",
      },
    ],

    rows:
      progress.trend.points.map(
        (point) => ({
          attempt:
            String(
              point.attemptNumber
            ),

          exam:
            point.examName,

          date:
            formatDate(
              point.submittedAt
            ),

          score:
            `${point.scorePercent}%`,

          accuracy:
            `${point.accuracy}%`,
        })
      ),

    rowHeaderIndex: 0,
  };

  const weakTopicTable = {
    caption:
      "Topics needing more practice",

    columns: [
      {
        key: "topic",
        label: "Topic",
      },

      {
        key: "questions",
        label:
          "Questions seen",
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
        label:
          "Average time",
      },
    ],

    rows:
      progress.weakTopics.map(
        (topic) => ({
          topic:
            topic.name,

          questions:
            String(
              topic.total
            ),

          attempted:
            String(
              topic.attempted
            ),

          correct:
            String(
              topic.correct
            ),

          accuracy:
            `${topic.accuracy}%`,

          time:
            formatSeconds(
              topic.averageSeconds
            ),
        })
      ),

    rowHeaderIndex: 0,
  };

  const topicTable = {
    caption:
      "Combined topic statistics",

    columns: [
      {
        key: "topic",
        label: "Topic",
      },

      {
        key: "questions",
        label: "Questions",
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
      progress.topicStats.map(
        (topic) => ({
          topic:
            topic.name,

          questions:
            String(
              topic.total
            ),

          attempted:
            String(
              topic.attempted
            ),

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

  const newestFirst = [
    ...progress.attempts,
  ].reverse();

  const historyTable = {
    caption:
      "Latest saved attempts",

    columns: [
      {
        key: "exam",
        label: "Exam",
      },

      {
        key: "date",
        label: "Date",
      },

      {
        key: "score",
        label: "Score",
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
          "Average time per question",
      },
    ],

    rows:
      newestFirst.map(
        (attempt) => ({
          exam:
            attempt.examName,

          date:
            formatDate(
              attempt.submittedAt
            ),

          score:
            `${attempt.score} / ${attempt.maxScore} (${attempt.scorePercent}%)`,

          accuracy:
            `${attempt.accuracy}%`,

          attemptedRate:
            `${attempt.attemptedRate}%`,

          time:
            formatSeconds(
              attempt.averageSecondsPerQuestion
            ),
        })
      ),

    rowHeaderIndex: 0,
  };

  return (
    <section
      className="accessible-question"
      tabIndex="-1"
    >
      <header>
        <h1>
          My Progress
        </h1>

        <p>
          Udaan stores your latest
          20 exam attempts on this
          device.
        </p>
      </header>

      <section
        aria-labelledby="progress-summary-title"
      >
        <h2 id="progress-summary-title">
          Progress summary
        </h2>

        <p
          role="status"
          aria-live="polite"
        >
          {spokenSummary}
        </p>

        <button
          type="button"
          onClick={
            readSummary
          }
        >
          Read progress summary aloud
        </button>

        <dl>
          <div>
            <dt>
              Saved attempts
            </dt>

            <dd>
              {progress.attemptCount}
            </dd>
          </div>

          <div>
            <dt>
              Average score
            </dt>

            <dd>
              {progress.averageScorePercent}%
            </dd>
          </div>

          <div>
            <dt>
              Average accuracy
            </dt>

            <dd>
              {progress.averageAccuracy}%
            </dd>
          </div>

          <div>
            <dt>
              Average attempted rate
            </dt>

            <dd>
              {progress.averageAttemptedRate}%
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="trend-title"
      >
        <h2 id="trend-title">
          Score trend
        </h2>

        <p>
          {progress.trend.sentence}
        </p>

        <DataTable
          table={
            trendTable
          }
          allowSpeech={
            false
          }
        />
      </section>

      <section
        aria-labelledby="weak-topic-title"
      >
        <h2 id="weak-topic-title">
          Weak topics
        </h2>

        <p>
          Topics appear here when
          accuracy or attempted rate
          is below 70%.
        </p>

        {progress.weakTopics.length >
        0 ? (
          <DataTable
            table={
              weakTopicTable
            }
            allowSpeech={
              false
            }
          />
        ) : (
          <p>
            No weak topics were
            identified from the
            saved attempts.
          </p>
        )}
      </section>

      <section
        aria-labelledby="all-topic-title"
      >
        <h2 id="all-topic-title">
          All topic statistics
        </h2>

        {progress.topicStats.length >
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
            No topic-level data is
            available yet.
          </p>
        )}
      </section>

      <section
        aria-labelledby="history-title"
      >
        <h2 id="history-title">
          Attempt history
        </h2>

        <DataTable
          table={
            historyTable
          }
          allowSpeech={
            false
          }
        />
      </section>

      <div
        className="reading-controls"
        aria-label="Progress actions"
      >
        <button
          type="button"
          onClick={() =>
            navigate(
              "/report"
            )
          }
        >
          Open personalized report
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/exams",
              {
                state: {
                  weakTopics:
                    progress.weakTopics.map(
                      (topic) =>
                        topic.name
                    ),
                },
              }
            )
          }
        >
          Practise weak topics
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/dashboard"
            )
          }
        >
          Back to dashboard
        </button>
      </div>
    </section>
  );
}