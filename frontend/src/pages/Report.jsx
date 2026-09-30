import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import DataTable from "../components/DataTable.jsx";

import {
  formatSeconds,
  getProgressSummary,
  readAttempts,
} from "../services/analytics.js";

import {
  buildAccessibleHtmlReport,
  buildReportModel,
  formatReportDate,
} from "../services/reportBuilder.js";

import {
  speak,
  stopSpeaking,
} from "../services/speech.js";

import "../styles/questionRendering.css";

export default function Report() {
  const navigate =
    useNavigate();

  const [
    downloadMessage,
    setDownloadMessage,
  ] = useState("");

  const progress =
    useMemo(
      () =>
        getProgressSummary(
          readAttempts()
        ),
      []
    );

  const report =
    useMemo(
      () =>
        buildReportModel(
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
      report.spokenSummary,
      "en-IN",
      1
    );
  }

  function practiseWeakTopics() {
    const weakTopics =
      report.weakTopics.map(
        (topic) =>
          topic.name
      );

    navigate(
      "/exams",
      {
        state: {
          weakTopics,
          practiceWeakTopics:
            true,
        },
      }
    );
  }

  function downloadReport() {
    try {
      const html =
        buildAccessibleHtmlReport(
          progress
        );

      const blob =
        new Blob(
          [html],
          {
            type:
              "text/html;charset=utf-8",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      const date =
        new Date()
          .toISOString()
          .slice(0, 10);

      link.href = url;

      link.download =
        `udaan-progress-report-${date}.html`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        url
      );

      setDownloadMessage(
        "Accessible HTML progress report downloaded."
      );
    } catch {
      setDownloadMessage(
        "The report could not be downloaded."
      );
    }
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
          Personalized Progress Report
        </h1>

        <p role="status">
          No saved attempts are
          available yet. Complete
          at least one test before
          creating your progress
          report.
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
      "Combined section performance",

    columns: [
      {
        key: "section",
        label: "Section",
      },

      {
        key: "tests",
        label:
          "Tests included",
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
      report.sections.map(
        (section) => ({
          section:
            section.name,

          tests:
            String(
              section.tests
            ),

          score:
            `${section.score} / ${section.maxScore}`,

          attempted:
            `${section.attempted} / ${section.total}`,

          accuracy:
            `${section.accuracy}%`,

          attemptedRate:
            `${section.attemptedRate}%`,

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
      "Combined topic performance",

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
      report.topics.map(
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

  const newestFirst =
    [...report.attempts]
      .reverse();

  const timeTable = {
    caption:
      "Time used in saved attempts",

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
        key: "totalTime",
        label: "Total time",
      },

      {
        key: "averageTime",
        label:
          "Average time per question",
      },
    ],

    rows:
      newestFirst.map(
        (
          attempt,
          index
        ) => ({
          attempt:
            String(
              report.attempts.length -
                index
            ),

          exam:
            attempt.examName,

          date:
            formatReportDate(
              attempt.submittedAt
            ),

          totalTime:
            formatSeconds(
              attempt.totalSeconds
            ),

          averageTime:
            formatSeconds(
              attempt.averageSecondsPerQuestion
            ),
        })
      ),

    rowHeaderIndex: 0,
  };

  const trendTable = {
    caption:
      "Score and accuracy trend",

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
      report.trend.points.map(
        (point) => ({
          attempt:
            String(
              point.attemptNumber
            ),

          exam:
            point.examName,

          date:
            formatReportDate(
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

  return (
    <section
      className="accessible-question"
      tabIndex="-1"
    >
      <header>
        <h1>
          Personalized Progress Report
        </h1>

        <p>
          Based on your latest{" "}
          {progress.attemptCount}{" "}
          saved{" "}
          {progress.attemptCount ===
          1
            ? "attempt"
            : "attempts"}.
        </p>
      </header>

      {/* SECTION 1 */}
      <section
        aria-labelledby="report-summary-heading"
      >
        <h2 id="report-summary-heading">
          1. Progress summary
        </h2>

        <p
          role="status"
          aria-live="polite"
        >
          {report.spokenSummary}
        </p>

        <button
          type="button"
          onClick={
            readSummary
          }
        >
          Read short summary aloud
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

          <div>
            <dt>
              Main weak topic
            </dt>

            <dd>
              {report.weakTopics[0]
                ?.name ||
                "None identified"}
            </dd>
          </div>
        </dl>
      </section>

      {/* SECTION 2 */}
      <section
        aria-labelledby="report-section-heading"
      >
        <h2 id="report-section-heading">
          2. Section performance
        </h2>

        {report.sections.length >
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
            Section-level data is
            not available yet.
          </p>
        )}
      </section>

      {/* SECTION 3 */}
      <section
        aria-labelledby="report-topic-heading"
      >
        <h2 id="report-topic-heading">
          3. Topic performance
        </h2>

        {report.weakTopics.length >
        0 && (
          <p>
            Topics currently needing
            more practice:{" "}
            <strong>
              {report.weakTopics
                .map(
                  (topic) =>
                    topic.name
                )
                .join(", ")}
            </strong>
            .
          </p>
        )}

        {report.topics.length >
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
            Topic-level data is
            not available yet.
          </p>
        )}
      </section>

      {/* SECTION 4 */}
      <section
        aria-labelledby="report-time-heading"
      >
        <h2 id="report-time-heading">
          4. Time analysis
        </h2>

        <p>
          Times marked
          "Not recorded" were not
          captured at question
          level during that test.
        </p>

        <DataTable
          table={
            timeTable
          }
          allowSpeech={
            false
          }
        />
      </section>

      {/* SECTION 5 */}
      <section
        aria-labelledby="report-trend-heading"
      >
        <h2 id="report-trend-heading">
          5. Performance trend
        </h2>

        {/* Plain-text equivalent */}
        <p>
          {report.trend.sentence}
        </p>

        {/* Semantic table equivalent */}
        <DataTable
          table={
            trendTable
          }
          allowSpeech={
            false
          }
        />
      </section>

      {/* SECTION 6 */}
      <section
        aria-labelledby="next-actions-heading"
      >
        <h2 id="next-actions-heading">
          6. What to do next
        </h2>

        <ol>
          {report.actions.map(
            (action) => (
              <li
                key={
                  action.id
                }
              >
                <h3>
                  {action.title}
                </h3>

                <p>
                  {
                    action.description
                  }
                </p>
              </li>
            )
          )}
        </ol>
      </section>

      {/* SECTION 7 */}
      <section
        aria-labelledby="report-actions-heading"
      >
        <h2 id="report-actions-heading">
          7. Report actions
        </h2>

        <div
          className="reading-controls"
          aria-label="Progress report actions"
        >
          <button
            type="button"
            onClick={
              practiseWeakTopics
            }
          >
            Practise weak topics
          </button>

          <button
            type="button"
            onClick={
              downloadReport
            }
          >
            Download accessible HTML report
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/progress"
              )
            }
          >
            Back to progress
          </button>
        </div>

        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {downloadMessage}
        </p>
      </section>
    </section>
  );
}