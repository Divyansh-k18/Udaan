import { useEffect, useRef } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getExamById,
  getExamName,
  getTotalQuestions,
} from "../data/examCatalog";
import "../styles/themes.css";

function ModeSelect() {
  const { examId } = useParams();

  const navigate = useNavigate();

  const { language, t } = useLanguage();

  const headingRef = useRef(null);

  const exam = getExamById(examId);

  /*
    Translation helper.

    If the key has not yet been added to our language
    JSON files, show readable English instead of the key.
  */
  const text = (key, fallback) => {
    const translated = t(key);

    if (!translated || translated === key) {
      return fallback;
    }

    return translated;
  };

  /*
    Move focus to the heading after navigation.
    This helps keyboard and screen-reader users understand
    that a new page has opened.
  */
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  /*
    Handle invalid exam IDs safely.
  */
  if (!exam) {
    return (
      <section
        className="setup-page"
        aria-labelledby="exam-not-found-heading"
      >
        <div className="setup-container">
          <div className="setup-card">
            <h1
              id="exam-not-found-heading"
              ref={headingRef}
              tabIndex="-1"
            >
              {text(
                "modeSelect.notFound",
                "Exam not found"
              )}
            </h1>

            <p>
              {text(
                "modeSelect.notFoundDescription",
                "The selected exam could not be found."
              )}
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/exams")}
              style={{
                minHeight: "60px",
                width: "100%",
              }}
            >
              {text(
                "modeSelect.backToExams",
                "Back to exams"
              )}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const totalQuestions = getTotalQuestions(exam);

  const startPrepare = () => {
    navigate(`/prepare/${exam.id}`);
  };

  const startMock = () => {
    navigate(`/exam/${exam.id}`);
  };

  return (
    <section
      className="setup-page"
      aria-labelledby="mode-heading"
    >
      <div className="setup-container">
        <div className="setup-card">
          <header className="setup-header">
            <p>
              {text(
                "modeSelect.selectedExam",
                "Selected exam"
              )}
            </p>

            <h1
              id="mode-heading"
              ref={headingRef}
              tabIndex="-1"
            >
              {getExamName(exam, language)}
            </h1>

            <p>
              {totalQuestions}{" "}
              {text(
                "modeSelect.questions",
                "questions"
              )}
              {" • "}
              {exam.totalMinutes}{" "}
              {text(
                "modeSelect.minutes",
                "minutes"
              )}
            </p>

            <p>
              {text(
                "modeSelect.chooseMode",
                "Choose how you want to use this exam."
              )}
            </p>
          </header>

          <div className="setup-section">
            <button
              type="button"
              className="primary-button"
              onClick={startPrepare}
              style={{
                width: "100%",
                minHeight: "90px",
                marginBottom: "18px",
                textAlign: "left",
                padding: "18px",
              }}
              aria-describedby="prepare-description"
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "1.2em",
                  marginBottom: "8px",
                }}
              >
                {text(
                  "modeSelect.prepare",
                  "Prepare"
                )}
              </strong>

              <span id="prepare-description">
                {text(
                  "modeSelect.prepareDescription",
                  "Practise questions and learn with explanations."
                )}
              </span>
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={startMock}
              style={{
                width: "100%",
                minHeight: "90px",
                textAlign: "left",
                padding: "18px",
              }}
              aria-describedby="mock-description"
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "1.2em",
                  marginBottom: "8px",
                }}
              >
                {text(
                  "modeSelect.mockTest",
                  "Mock Test"
                )}
              </strong>

              <span id="mock-description">
                {text(
                  "modeSelect.mockDescription",
                  "Take the exam with timing and negative marking."
                )}
              </span>
            </button>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/exams")}
            style={{
              width: "100%",
              minHeight: "56px",
              marginTop: "20px",
            }}
          >
            {text(
              "modeSelect.chooseAnother",
              "Choose another exam"
            )}
          </button>

          <p
            style={{
              marginTop: "20px",
            }}
          >
            {text(
              "modeSelect.demoNotice",
              "This is a Udaan demo test inspired by an exam style. It is not an official examination paper."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ModeSelect;