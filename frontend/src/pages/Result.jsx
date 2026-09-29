import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  formatClockTime,
} from "../components/Timer";

import "../styles/mock.css";

const LAST_RESULT_KEY =
  "udaan_mock_last_result_v1";

function getSavedResult() {
  try {
    const raw =
      localStorage.getItem(
        LAST_RESULT_KEY
      );

    return raw
      ? JSON.parse(raw)
      : null;
  } catch {
    return null;
  }
}

function formatMarks(value) {
  const number =
    Number(value || 0);

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);
}

function Result() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const result =
    location.state?.result ||
    getSavedResult();

  if (!result) {
    return (
      <main className="mock-page">
        <section className="mock-card">
          <h1>
            No result available
          </h1>

          <p>
            Complete a mock test to see
            your result.
          </p>

          <button
            type="button"
            className="mock-button"
            onClick={() =>
              navigate("/exams")
            }
          >
            Go to Exams
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mock-page">
      <section className="mock-card">
        <p className="mock-eyebrow">
          Mock Test Result
        </p>

        <h1>
          {result.examName}
        </h1>

        {result.autoSubmitted && (
          <p role="status">
            The test was automatically
            submitted when the timer
            ended.
          </p>
        )}

        {result.warning && (
          <div
            className="mock-warning"
            role="alert"
          >
            {result.warning}
          </div>
        )}

        <div className="mock-result-score">
          <span>
            Score
          </span>

          <strong>
            {formatMarks(
              result.score
            )}
            {" / "}
            {formatMarks(
              result.maxMarks
            )}
          </strong>
        </div>

        <div className="mock-summary-grid">
          <div>
            <strong>
              Correct
            </strong>

            <span>
              {result.correct}
            </span>
          </div>

          <div>
            <strong>
              Wrong
            </strong>

            <span>
              {result.wrong}
            </span>
          </div>

          <div>
            <strong>
              Unanswered
            </strong>

            <span>
              {result.unanswered}
            </span>
          </div>

          <div>
            <strong>
              Accuracy
            </strong>

            <span>
              {result.accuracy}%
            </span>
          </div>

          <div>
            <strong>
              Negative marks lost
            </strong>

            <span>
              -
              {formatMarks(
                result.negativeLost
              )}
            </span>
          </div>

          <div>
            <strong>
              Time used
            </strong>

            <span>
              {formatClockTime(
                result.timeUsedSeconds
              )}
            </span>
          </div>
        </div>

        <h2>
          Section Results
        </h2>

        <div className="mock-result-sections">
          {result.sections.map(
            (section, index) => (
              <article
                key={`${section.subject}-${index}`}
                className="mock-result-section"
              >
                <h3>
                  {section.name}
                </h3>

                <p>
                  Score:{" "}
                  <strong>
                    {formatMarks(
                      section.score
                    )}
                    {" / "}
                    {formatMarks(
                      section.maxMarks
                    )}
                  </strong>
                </p>

                <p>
                  Correct:{" "}
                  <strong>
                    {section.correct}
                  </strong>
                </p>

                <p>
                  Wrong:{" "}
                  <strong>
                    {section.wrong}
                  </strong>
                </p>

                <p>
                  Unanswered:{" "}
                  <strong>
                    {
                      section.unanswered
                    }
                  </strong>
                </p>

                <p>
                  Negative marks lost:{" "}
                  <strong>
                    -
                    {formatMarks(
                      section.negativeLost
                    )}
                  </strong>
                </p>

                <p>
                  Accuracy:{" "}
                  <strong>
                    {section.accuracy}%
                  </strong>
                </p>
              </article>
            )
          )}
        </div>

        <div className="mock-actions">
          <button
            type="button"
            className="mock-button mock-primary"
            onClick={() =>
              navigate("/exams")
            }
          >
            Take Another Mock
          </button>

          <button
            type="button"
            className="mock-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>
        </div>
      </section>
    </main>
  );
}

export default Result;