import PassageView from "./PassageView.jsx";
import DataTable from "./DataTable.jsx";
import "../styles/questionRendering.css";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

function normaliseOption(option, index, fallbackLang) {
  if (typeof option === "string") {
    return {
      id: OPTION_LETTERS[index] || String(index + 1),
      text: option,
      spoken: option,
      lang: fallbackLang,
    };
  }

  return {
    id:
      option?.id ??
      option?.value ??
      OPTION_LETTERS[index] ??
      String(index + 1),

    text:
      option?.text ??
      option?.label ??
      option?.value ??
      "",

    spoken:
      option?.spoken ??
      option?.text ??
      option?.label ??
      "",

    lang:
      option?.lang ??
      option?.langCode ??
      fallbackLang,
  };
}

function getImageSource(question) {
  if (!question) {
    return "";
  }

  if (typeof question.image === "string") {
    return question.image;
  }

  if (question.image?.src) {
    return question.image.src;
  }

  if (question.image?.url) {
    return question.image.url;
  }

  return question.imageUrl || "";
}

export default function QuestionView({
  question,
  questionNumber = 1,
  totalQuestions,

  selectedAnswer,
  selectedOption,
  value,

  onSelectAnswer,
  onSelectOption,
  onAnswer,

  disabled = false,

  passage,
  table,

  langCode = "en-IN",
  speechRate = 1,
  allowSpeech = true,
  onReadText,

  showFeedback = false,
  isCorrect,
  feedback,
}) {
  if (!question) {
    return (
      <section className="accessible-question">
        <p role="alert">
          Question data is not available.
        </p>
      </section>
    );
  }

  const questionLang =
    question.lang ||
    question.langCode ||
    langCode;

  const options = Array.isArray(question.options)
    ? question.options.map((option, index) =>
        normaliseOption(option, index, questionLang)
      )
    : [];

  const currentAnswer =
    selectedAnswer ??
    selectedOption ??
    value ??
    "";

  const selectHandler =
    onSelectAnswer ||
    onSelectOption ||
    onAnswer;

  const imageSource = getImageSource(question);

  const imageAlt =
    question.altText ||
    question.image?.altText ||
    question.image?.alt ||
    "";

  const activePassage =
    passage ||
    question.passage ||
    null;

  const activeTable =
    table ||
    question.table ||
    question.dataTable ||
    null;

  let calculatedCorrect = isCorrect;

  if (
    calculatedCorrect === undefined &&
    showFeedback &&
    currentAnswer !== "" &&
    question.answer !== undefined
  ) {
    calculatedCorrect =
      String(currentAnswer) === String(question.answer);
  }

  let feedbackText = "";

  if (typeof feedback === "string") {
    feedbackText = feedback;
  } else if (feedback?.text) {
    feedbackText = feedback.text;
  } else if (
    showFeedback &&
    calculatedCorrect === true
  ) {
    feedbackText = "Correct answer.";
  } else if (
    showFeedback &&
    calculatedCorrect === false
  ) {
    feedbackText = "Incorrect answer.";
  }

  const headingId = `question-heading-${question.id ?? questionNumber}`;
  const optionsLegendId = `question-options-${question.id ?? questionNumber}`;

  function handleAnswer(optionId) {
    if (disabled || typeof selectHandler !== "function") {
      return;
    }

    selectHandler(optionId);
  }

  return (
    <article
      className="accessible-question"
      aria-labelledby={headingId}
    >
      <header className="question-header">
        <h2 id={headingId}>
          Question {questionNumber}
          {totalQuestions
            ? ` of ${totalQuestions}`
            : ""}
        </h2>

        {question.difficulty && (
          <p className="question-metadata">
            Difficulty:{" "}
            <strong>{question.difficulty}</strong>
          </p>
        )}
      </header>

      {activePassage && (
        <PassageView
          passage={activePassage}
          langCode={questionLang}
          speechRate={speechRate}
          allowSpeech={allowSpeech}
          onReadText={onReadText}
        />
      )}

      <div
        className="question-text"
        lang={questionLang}
      >
        {question.text}
      </div>

      {imageSource && !imageAlt.trim() && (
        <div
          className="content-error"
          role="alert"
          aria-live="assertive"
        >
          <strong>Question image rejected:</strong>{" "}
          this image does not have accessible alt text.
        </div>
      )}

      {imageSource && imageAlt.trim() && (
        <figure className="question-figure">
          <img
            src={imageSource}
            alt={imageAlt}
            className="question-image"
            lang={questionLang}
          />
        </figure>
      )}

      {activeTable && (
        <DataTable
          table={activeTable}
          langCode={questionLang}
          speechRate={speechRate}
          allowSpeech={allowSpeech}
          onReadText={onReadText}
        />
      )}

      {feedbackText && (
        <div
          className={
            calculatedCorrect === true
              ? "answer-feedback answer-feedback-correct"
              : calculatedCorrect === false
                ? "answer-feedback answer-feedback-wrong"
                : "answer-feedback"
          }
          role="status"
          aria-live="polite"
        >
          <strong>
            {calculatedCorrect === true
              ? "✓ Correct: "
              : calculatedCorrect === false
                ? "✕ Incorrect: "
                : "Answer status: "}
          </strong>

          <span>{feedbackText}</span>
        </div>
      )}

      <fieldset
        className="question-options"
        disabled={disabled}
        aria-labelledby={optionsLegendId}
      >
        <legend id={optionsLegendId}>
          Choose one answer
        </legend>

        {options.length === 0 && (
          <p role="alert">
            No answer options are available.
          </p>
        )}

        {options.map((option, index) => {
          const optionId = String(option.id);

          const isSelected =
            String(currentAnswer) === optionId;

          const isCorrectOption =
            showFeedback &&
            question.answer !== undefined &&
            optionId === String(question.answer);

          const isSelectedWrong =
            showFeedback &&
            isSelected &&
            question.answer !== undefined &&
            !isCorrectOption;

          const inputId = `question-${question.id ?? questionNumber}-option-${optionId}`;

          return (
            <label
              key={optionId}
              htmlFor={inputId}
              className={[
                "question-option",
                isSelected ? "option-selected" : "",
                isCorrectOption
                  ? "option-correct"
                  : "",
                isSelectedWrong
                  ? "option-wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                id={inputId}
                type="radio"
                name={`question-${question.id ?? questionNumber}`}
                value={optionId}
                checked={isSelected}
                onChange={() =>
                  handleAnswer(optionId)
                }
              />

              <span
                className="option-letter"
                aria-hidden="true"
              >
                {OPTION_LETTERS[index] ||
                  optionId}.
              </span>

              <span
                className="option-text"
                lang={option.lang}
              >
                {option.text}
              </span>

              {isSelected && (
                <span className="option-status-text">
                  Selected
                </span>
              )}

              {isCorrectOption && (
                <span className="option-status-text">
                  Correct answer
                </span>
              )}

              {isSelectedWrong && (
                <span className="option-status-text">
                  Incorrect selection
                </span>
              )}
            </label>
          );
        })}
      </fieldset>
    </article>
  );
}