function SectionBar({
  sections = [],
  currentSectionIndex = 0,
  answers = {},
  marked = {},
  canChangeSection = true,
  onSectionChange,
}) {
  return (
    <nav
      className="mock-section-bar"
      aria-label="Exam sections"
    >
      {sections.map((section, index) => {
        const answeredCount =
          section.questions.filter((question) =>
            Number.isInteger(answers[question.id])
          ).length;

        const markedCount =
          section.questions.filter(
            (question) => marked[question.id]
          ).length;

        const isCurrent =
          currentSectionIndex === index;

        const isLocked =
          !canChangeSection && !isCurrent;

        return (
          <button
            key={`${section.subject}-${index}`}
            type="button"
            className={
              isCurrent
                ? "mock-section-button mock-section-current"
                : "mock-section-button"
            }
            aria-current={
              isCurrent ? "step" : undefined
            }
            disabled={isLocked}
            onClick={() =>
              onSectionChange?.(index)
            }
          >
            <span>
              {section.name}
            </span>

            <small>
              {answeredCount}/{section.questions.length}
              {" answered"}

              {markedCount > 0
                ? `, ${markedCount} marked`
                : ""}
            </small>
          </button>
        );
      })}
    </nav>
  );
}

export default SectionBar;