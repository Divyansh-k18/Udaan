import { formatSeconds } from "./analytics.js";

function number(value, fallback = 0) {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;

  return (
    Math.round(
      (number(value) + Number.EPSILON) *
        factor
    ) / factor
  );
}

function percent(part, total) {
  if (!total) {
    return 0;
  }

  return round(
    (part / total) * 100,
    1
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatReportDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

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
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

/*
  Combines section performance
  across all saved attempts.
*/
export function buildSectionStats(
  attempts = []
) {
  const sectionMap = new Map();

  attempts.forEach((attempt) => {
    (
      attempt.sectionStats || []
    ).forEach((section) => {
      const name =
        section.name ||
        "General";

      if (
        !sectionMap.has(name)
      ) {
        sectionMap.set(name, {
          name,

          tests: 0,
          total: 0,
          attempted: 0,
          correct: 0,

          score: 0,
          maxScore: 0,

          totalSeconds: 0,
          timedSections: 0,
        });
      }

      const stat =
        sectionMap.get(name);

      stat.tests += 1;

      stat.total +=
        number(
          section.total
        );

      stat.attempted +=
        number(
          section.attempted
        );

      stat.correct +=
        number(
          section.correct
        );

      stat.score +=
        number(
          section.score
        );

      stat.maxScore +=
        number(
          section.maxScore
        );

      if (
        section.averageSeconds !==
          null &&
        section.averageSeconds !==
          undefined
      ) {
        stat.totalSeconds +=
          number(
            section.averageSeconds
          );

        stat.timedSections += 1;
      }
    });
  });

  return Array.from(
    sectionMap.values()
  ).map((section) => ({
    name: section.name,

    tests: section.tests,

    total: section.total,
    attempted: section.attempted,
    correct: section.correct,

    score: round(
      section.score,
      2
    ),

    maxScore: round(
      section.maxScore,
      2
    ),

    accuracy: percent(
      section.correct,
      section.attempted
    ),

    attemptedRate: percent(
      section.attempted,
      section.total
    ),

    averageSeconds:
      section.timedSections > 0
        ? round(
            section.totalSeconds /
              section.timedSections,
            1
          )
        : null,
  }));
}

function findSlowestTopic(
  topics = []
) {
  return [...topics]
    .filter(
      (topic) =>
        topic.averageSeconds !==
        null
    )
    .sort(
      (a, b) =>
        number(
          b.averageSeconds
        ) -
        number(
          a.averageSeconds
        )
    )[0];
}

/*
  Exactly three personalised
  "what to do next" actions.
*/
export function buildNextActions(
  progress
) {
  if (
    !progress ||
    progress.attemptCount === 0
  ) {
    return [
      {
        id: "start",
        title:
          "Complete your first mock test",
        description:
          "Take one mock test so Udaan can identify your accuracy, speed and weak topics.",
      },

      {
        id: "review",
        title:
          "Review every explanation",
        description:
          "After practising, read the explanation for each incorrect answer before continuing.",
      },

      {
        id: "timing",
        title:
          "Record question time",
        description:
          "Use timed mock tests so Udaan can compare your speed as well as your accuracy.",
      },
    ];
  }

  const weakest =
    progress.weakTopics?.[0];

  const slowest =
    findSlowestTopic(
      progress.topicStats
    );

  const actions = [];

  if (weakest) {
    actions.push({
      id: "weak-topic",

      title:
        `Practise ${weakest.name}`,

      description:
        `${weakest.name} currently has ${weakest.accuracy}% accuracy and ${weakest.attemptedRate}% attempted rate. Practise this topic first and review explanations after mistakes.`,
    });
  } else {
    actions.push({
      id: "maintain-topics",

      title:
        "Maintain topic consistency",

      description:
        "No weak topic is currently identified. Continue mixed-topic practice so your performance remains balanced.",
    });
  }

  if (
    progress.averageAccuracy < 75
  ) {
    actions.push({
      id: "accuracy",

      title:
        "Improve answer accuracy",

      description:
        `Your average accuracy is ${progress.averageAccuracy}%. Slow down on uncertain questions and review why each incorrect option was wrong.`,
    });
  } else {
    actions.push({
      id: "accuracy",

      title:
        "Protect your accuracy",

      description:
        `Your average accuracy is ${progress.averageAccuracy}%. Keep reviewing mistakes while gradually increasing question difficulty.`,
    });
  }

  if (slowest) {
    actions.push({
      id: "speed",

      title:
        `Improve speed in ${slowest.name}`,

      description:
        `${slowest.name} currently averages ${formatSeconds(
          slowest.averageSeconds
        )} per recorded question. Practise short sets and compare both time and accuracy.`,
    });
  } else if (
    progress.averageAttemptedRate <
    80
  ) {
    actions.push({
      id: "completion",

      title:
        "Increase attempted rate",

      description:
        `Your average attempted rate is ${progress.averageAttemptedRate}%. Practise deciding when to answer, skip or return to a question.`,
    });
  } else {
    actions.push({
      id: "timing",

      title:
        "Build timed consistency",

      description:
        "Continue timed practice and try to maintain your accuracy while completing a larger share of each test.",
    });
  }

  return actions.slice(0, 3);
}

export function buildReportModel(
  progress
) {
  const attempts =
    progress?.attempts || [];

  const latest =
    attempts[
      attempts.length - 1
    ] || null;

  const sections =
    buildSectionStats(
      attempts
    );

  const actions =
    buildNextActions(
      progress
    );

  const weakestTopic =
    progress?.weakTopics?.[0] ||
    null;

  const summaryParts = [
    `You have ${progress?.attemptCount || 0} saved attempts.`,

    `Your average score is ${progress?.averageScorePercent || 0} percent.`,

    `Your average accuracy is ${progress?.averageAccuracy || 0} percent.`,

    progress?.trend?.sentence || "",

    weakestTopic
      ? `Your main practice priority is ${weakestTopic.name}.`
      : "No weak topic is currently identified.",
  ];

  return {
    generatedAt:
      new Date().toISOString(),

    latest,

    sections,

    topics:
      progress?.topicStats || [],

    attempts,

    trend:
      progress?.trend || {
        sentence:
          "No trend data is available.",
        points: [],
      },

    weakTopics:
      progress?.weakTopics || [],

    actions,

    spokenSummary:
      summaryParts
        .filter(Boolean)
        .join(" "),
  };
}

function tableHtml({
  caption,
  columns,
  rows,
}) {
  if (!rows.length) {
    return `
      <p>
        No data is available for this section.
      </p>
    `;
  }

  const headingCells =
    columns
      .map(
        (column) => `
          <th scope="col">
            ${escapeHtml(
              column.label
            )}
          </th>
        `
      )
      .join("");

  const bodyRows =
    rows
      .map((row) => {
        const cells =
          columns
            .map(
              (
                column,
                columnIndex
              ) => {
                const value =
                  escapeHtml(
                    row[
                      column.key
                    ]
                  );

                if (
                  columnIndex ===
                  0
                ) {
                  return `
                    <th scope="row">
                      ${value}
                    </th>
                  `;
                }

                return `
                  <td>
                    ${value}
                  </td>
                `;
              }
            )
            .join("");

        return `
          <tr>
            ${cells}
          </tr>
        `;
      })
      .join("");

  return `
    <div
      class="table-wrapper"
      role="region"
      tabindex="0"
      aria-label="${escapeHtml(
        caption
      )}"
    >
      <table>
        <caption>
          ${escapeHtml(
            caption
          )}
        </caption>

        <thead>
          <tr>
            ${headingCells}
          </tr>
        </thead>

        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </div>
  `;
}

export function buildAccessibleHtmlReport(
  progress
) {
  const report =
    buildReportModel(
      progress
    );

  const sectionRows =
    report.sections.map(
      (section) => ({
        section:
          section.name,

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
    );

  const topicRows =
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
    );

  const timeRows =
    [...report.attempts]
      .reverse()
      .map(
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

          average:
            formatSeconds(
              attempt.averageSecondsPerQuestion
            ),
        })
      );

  const trendRows =
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
    );

  const actionHtml =
    report.actions
      .map(
        (
          action,
          index
        ) => `
          <li>
            <h3>
              ${index + 1}.
              ${escapeHtml(
                action.title
              )}
            </h3>

            <p>
              ${escapeHtml(
                action.description
              )}
            </p>
          </li>
        `
      )
      .join("");

  const weakTopicText =
    report.weakTopics.length >
    0
      ? report.weakTopics
          .map(
            (topic) =>
              topic.name
          )
          .join(", ")
      : "None identified";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />

  <title>
    Udaan Accessible Progress Report
  </title>

  <style>
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html {
      font-family:
        Arial,
        Helvetica,
        sans-serif;

      line-height: 1.6;
    }

    body {
      max-width: 72rem;

      margin:
        0 auto;

      padding:
        1rem;

      background:
        Canvas;

      color:
        CanvasText;

      overflow-wrap:
        anywhere;
    }

    h1,
    h2,
    h3 {
      line-height:
        1.3;
    }

    section {
      margin-block:
        2rem;
    }

    dl {
      display:
        grid;

      grid-template-columns:
        repeat(
          auto-fit,
          minmax(
            min(100%, 12rem),
            1fr
          )
        );

      gap:
        1rem;
    }

    dl div {
      border:
        0.1rem solid
        currentColor;

      padding:
        0.75rem;
    }

    dt {
      font-weight:
        700;
    }

    dd {
      margin:
        0.25rem 0 0;
    }

    .table-wrapper {
      max-width:
        100%;

      overflow-x:
        auto;

      border:
        0.1rem solid
        currentColor;
    }

    table {
      width:
        100%;

      border-collapse:
        collapse;
    }

    caption {
      font-weight:
        700;

      text-align:
        left;

      padding:
        0.75rem;
    }

    th,
    td {
      border:
        0.0625rem solid
        currentColor;

      padding:
        0.65rem;

      text-align:
        left;

      vertical-align:
        top;
    }

    ol {
      padding-inline-start:
        1.5rem;
    }

    li {
      margin-block:
        1rem;
    }

    a:focus,
    .table-wrapper:focus {
      outline:
        0.2rem solid
        currentColor;

      outline-offset:
        0.2rem;
    }

    @media
    (max-width: 30rem) {
      body {
        padding:
          0.5rem;
      }

      dl {
        grid-template-columns:
          1fr;
      }

      th,
      td {
        padding:
          0.45rem;
      }
    }

    @media print {
      body {
        max-width:
          none;
      }
    }
  </style>
</head>

<body>
  <header>
    <h1>
      Udaan Accessible Progress Report
    </h1>

    <p>
      Generated:
      ${escapeHtml(
        formatReportDate(
          report.generatedAt
        )
      )}
    </p>
  </header>

  <main>
    <section
      aria-labelledby="summary-heading"
    >
      <h2 id="summary-heading">
        1. Progress summary
      </h2>

      <p>
        ${escapeHtml(
          report.spokenSummary
        )}
      </p>

      <dl>
        <div>
          <dt>
            Saved attempts
          </dt>

          <dd>
            ${escapeHtml(
              progress.attemptCount
            )}
          </dd>
        </div>

        <div>
          <dt>
            Average score
          </dt>

          <dd>
            ${escapeHtml(
              progress.averageScorePercent
            )}%
          </dd>
        </div>

        <div>
          <dt>
            Average accuracy
          </dt>

          <dd>
            ${escapeHtml(
              progress.averageAccuracy
            )}%
          </dd>
        </div>

        <div>
          <dt>
            Average attempted rate
          </dt>

          <dd>
            ${escapeHtml(
              progress.averageAttemptedRate
            )}%
          </dd>
        </div>

        <div>
          <dt>
            Weak topics
          </dt>

          <dd>
            ${escapeHtml(
              weakTopicText
            )}
          </dd>
        </div>
      </dl>
    </section>

    <section
      aria-labelledby="section-heading"
    >
      <h2 id="section-heading">
        2. Section performance
      </h2>

      ${tableHtml({
        caption:
          "Combined section performance",

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

        rows: sectionRows,
      })}
    </section>

    <section
      aria-labelledby="topic-heading"
    >
      <h2 id="topic-heading">
        3. Topic performance
      </h2>

      ${tableHtml({
        caption:
          "Combined topic performance",

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

        rows: topicRows,
      })}
    </section>

    <section
      aria-labelledby="time-heading"
    >
      <h2 id="time-heading">
        4. Time analysis
      </h2>

      ${tableHtml({
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
            key: "average",
            label:
              "Average time per question",
          },
        ],

        rows: timeRows,
      })}
    </section>

    <section
      aria-labelledby="trend-heading"
    >
      <h2 id="trend-heading">
        5. Score trend
      </h2>

      <p>
        ${escapeHtml(
          report.trend.sentence
        )}
      </p>

      ${tableHtml({
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

        rows: trendRows,
      })}
    </section>

    <section
      aria-labelledby="actions-heading"
    >
      <h2 id="actions-heading">
        6. What to do next
      </h2>

      <ol>
        ${actionHtml}
      </ol>
    </section>
  </main>

  <footer>
    <p>
      This report is provided as
      semantic HTML so it can be
      read with a screen reader,
      enlarged, printed or opened
      without relying on a visual
      chart.
    </p>
  </footer>
</body>
</html>`;
}