import { useEffect, useMemo, useState } from "react";
import { speak, stopSpeaking } from "../services/speech.js";
import "../styles/questionRendering.css";

function normaliseParagraphs(passage, fallbackLang) {
  if (!passage) {
    return [];
  }

  const passageLang =
    typeof passage === "object"
      ? passage.lang || passage.langCode || fallbackLang
      : fallbackLang;

  let paragraphs = [];

  if (typeof passage === "string") {
    paragraphs = passage
      .split(/\n\s*\n/)
      .map((text) => text.trim())
      .filter(Boolean);
  } else if (Array.isArray(passage.paragraphs)) {
    paragraphs = passage.paragraphs;
  } else if (typeof passage.text === "string") {
    paragraphs = passage.text
      .split(/\n\s*\n/)
      .map((text) => text.trim())
      .filter(Boolean);
  }

  return paragraphs
    .map((paragraph) => {
      if (typeof paragraph === "string") {
        return {
          text: paragraph,
          lang: passageLang,
        };
      }

      return {
        text: paragraph?.text || "",
        lang: paragraph?.lang || paragraph?.langCode || passageLang,
      };
    })
    .filter((paragraph) => paragraph.text.trim());
}

function getImageSource(image) {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return image;
  }

  return image.src || image.url || "";
}

export default function PassageView({
  passage,
  langCode = "en-IN",
  speechRate = 1,
  allowSpeech = true,
  onReadText,
  heading = "Passage",
}) {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [liveMessage, setLiveMessage] = useState("");

  const paragraphs = useMemo(
    () => normaliseParagraphs(passage, langCode),
    [passage, langCode]
  );

  const passageLang =
    typeof passage === "object"
      ? passage?.lang || passage?.langCode || langCode
      : langCode;

  const passageTitle =
    typeof passage === "object" && passage?.title
      ? passage.title
      : heading;

  const imageSource =
    typeof passage === "object"
      ? getImageSource(passage?.image || passage?.imageUrl)
      : "";

  const imageAlt =
    typeof passage === "object"
      ? passage?.altText ||
        passage?.image?.altText ||
        passage?.image?.alt ||
        ""
      : "";

  useEffect(() => {
    setCurrentParagraph(0);
    setLiveMessage("");
  }, [passage]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  function readText(text, language = passageLang) {
    if (!text?.trim()) {
      return;
    }

    stopSpeaking();

    if (typeof onReadText === "function") {
      onReadText(text, language);
      return;
    }

    if (!allowSpeech) {
      setLiveMessage(
        "Udaan speech is turned off. You can read this content using your screen reader."
      );
      return;
    }

    speak(text, language, speechRate);
  }

  function readPassage() {
    if (paragraphs.length === 0) {
      setLiveMessage("No passage is available.");
      return;
    }

    const text = paragraphs
      .map(
        (paragraph, index) =>
          `Paragraph ${index + 1}. ${paragraph.text}`
      )
      .join(" ");

    setLiveMessage(
      `Reading passage containing ${paragraphs.length} paragraphs.`
    );

    readText(text, passageLang);
  }

  function repeatParagraph() {
    if (paragraphs.length === 0) {
      setLiveMessage("No paragraph is available.");
      return;
    }

    const paragraph = paragraphs[currentParagraph];

    setLiveMessage(
      `Repeating paragraph ${currentParagraph + 1} of ${paragraphs.length}.`
    );

    readText(
      `Paragraph ${currentParagraph + 1}. ${paragraph.text}`,
      paragraph.lang
    );
  }

  function nextParagraph() {
    if (paragraphs.length === 0) {
      setLiveMessage("No paragraph is available.");
      return;
    }

    if (currentParagraph >= paragraphs.length - 1) {
      setLiveMessage("You are already at the last paragraph.");
      return;
    }

    const nextIndex = currentParagraph + 1;
    const paragraph = paragraphs[nextIndex];

    setCurrentParagraph(nextIndex);

    setLiveMessage(
      `Paragraph ${nextIndex + 1} of ${paragraphs.length}.`
    );

    readText(
      `Paragraph ${nextIndex + 1}. ${paragraph.text}`,
      paragraph.lang
    );
  }

  return (
    <section
      className="passage-view"
      aria-labelledby="passage-heading"
    >
      <div className="section-heading-row">
        <h2 id="passage-heading" lang={passageLang}>
          {passageTitle}
        </h2>

        <p className="paragraph-position">
          Paragraph {paragraphs.length ? currentParagraph + 1 : 0} of{" "}
          {paragraphs.length}
        </p>
      </div>

      {imageSource && !imageAlt.trim() && (
        <div className="content-error" role="alert">
          <strong>Image not displayed:</strong> accessible alt text is
          missing.
        </div>
      )}

      {imageSource && imageAlt.trim() && (
        <figure className="question-figure">
          <img
            className="question-image"
            src={imageSource}
            alt={imageAlt}
            lang={passageLang}
          />
        </figure>
      )}

      {paragraphs.length > 0 ? (
        <ol className="passage-paragraphs">
          {paragraphs.map((paragraph, index) => {
            const isCurrent = index === currentParagraph;

            return (
              <li
                key={`${index}-${paragraph.text.slice(0, 20)}`}
                className={
                  isCurrent
                    ? "passage-paragraph current-paragraph"
                    : "passage-paragraph"
                }
                aria-current={isCurrent ? "true" : undefined}
              >
                {isCurrent && (
                  <strong className="current-paragraph-label">
                    Current paragraph
                  </strong>
                )}

                <p lang={paragraph.lang}>
                  {paragraph.text}
                </p>
              </li>
            );
          })}
        </ol>
      ) : (
        <p>No passage text is available.</p>
      )}

      <div
        className="reading-controls"
        aria-label="Passage reading controls"
      >
        <button
          type="button"
          onClick={readPassage}
          disabled={paragraphs.length === 0}
        >
          Read passage
        </button>

        <button
          type="button"
          onClick={nextParagraph}
          disabled={paragraphs.length === 0}
        >
          Next paragraph
        </button>

        <button
          type="button"
          onClick={repeatParagraph}
          disabled={paragraphs.length === 0}
        >
          Repeat paragraph
        </button>
      </div>

      <p
        className="sr-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveMessage}
      </p>
    </section>
  );
}