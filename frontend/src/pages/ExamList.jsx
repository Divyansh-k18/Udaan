import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  examCatalog,
  getExamName,
  getTotalQuestions,
} from "../data/examCatalog";
import "../styles/themes.css";

function ExamList() {
  const navigate = useNavigate();

  const { language, t } = useLanguage();

  const headingRef = useRef(null);

  /*
    Use t() when a translation exists.

    During development, if a key has not yet been added
    to the language JSON files, use the English fallback.
  */
  const text = (key, fallback) => {
    const translated = t(key);

    if (!translated || translated === key) {
      return fallback;
    }

    return translated;
  };

  /*
    Move keyboard/screen-reader focus to the page heading
    when this page opens.
  */
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const openExam = (examId) => {
    navigate(`/mode/${examId}`);
  };

  return (
    <section
      className="setup-page"
      aria-labelledby="exam-list-heading"
    >
      <div className="setup-container">
        <div className="setup-card">
          <header className="setup-header">
            <h1
              id="exam-list-heading"
              ref={headingRef}
              tabIndex="-1"
            >
              {text("examList.title", "Choose an exam")}
            </h1>

            <p>
              {text(
                "examList.description",
                "Choose a practice exam. These are small demo tests inspired by common competitive-exam styles and are not official examination papers."
              )}
            </p>
          </header>

          <div
            className="setup-section"
            aria-label={text(
              "examList.availableExams",
              "Available exams"
            )}
          >
            {examCatalog.map((exam) => {
              const totalQuestions = getTotalQuestions(exam);

              return (
                <button
                  key={exam.id}
                  type="button"
                  className="primary-button"
                  onClick={() => openExam(exam.id)}
                  style={{
                    width: "100%",
                    minHeight: "90px",
                    marginBottom: "16px",
                    textAlign: "left",
                    padding: "18px",
                  }}
                  aria-label={`${getExamName(
                    exam,
                    language
                  )}. ${totalQuestions} questions. ${
                    exam.totalMinutes
                  } minutes.`}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: "1.15em",
                      marginBottom: "8px",
                    }}
                  >
                    {getExamName(exam, language)}
                  </strong>

                  <span
                    style={{
                      display: "block",
                    }}
                  >
                    {totalQuestions}{" "}
                    {text(
                      "examList.questions",
                      "questions"
                    )}
                    {" • "}
                    {exam.totalMinutes}{" "}
                    {text(
                      "examList.minutes",
                      "minutes"
                    )}
                  </span>

                  <span
                    style={{
                      display: "block",
                      marginTop: "6px",
                    }}
                  >
                    {exam.sections.length}{" "}
                    {text(
                      "examList.sections",
                      "sections"
                    )}
                    {" • "}
                    {exam.sectionalTiming
                      ? text(
                          "examList.sectionalTiming",
                          "Sectional timing"
                        )
                      : text(
                          "examList.noSectionalTiming",
                          "No sectional timing"
                        )}
                  </span>
                </button>
              );
            })}
          </div>

          <p
            style={{
              marginTop: "20px",
            }}
          >
            <strong>
              {text("examList.note", "Note:")}
            </strong>{" "}
            {text(
              "examList.demoNotice",
              "These mini tests are for the Udaan demo only. Exam rules must be verified from the relevant official notification."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ExamList;