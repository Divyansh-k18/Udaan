export function normalisePercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(100, Math.max(0, number));
}

export function adjustedSeconds(minutes, extraPercent = 0) {
  const seconds =
    Number(minutes || 0) *
    60 *
    (1 + extraPercent / 100);

  return Math.max(
    0,
    Math.round(seconds)
  );
}

export function getFlatQuestions(paper) {
  if (!paper?.sections) {
    return [];
  }

  let globalIndex = 0;

  return paper.sections.flatMap(
    (section, sectionIndex) =>
      section.questions.map(
        (question, questionIndex) => {
          const entry = {
            question,
            section,
            sectionIndex,
            questionIndex,
            globalIndex,
          };

          globalIndex += 1;

          return entry;
        }
      )
  );
}

export function roundMarks(value) {
  return Number(
    Number(value || 0).toFixed(2)
  );
}

export function calculateResult(
  paper,
  answers
) {
  const sectionResults =
    paper.sections.map((section) => {
      let correct = 0;
      let wrong = 0;
      let unanswered = 0;
      let score = 0;
      let negativeLost = 0;

      section.questions.forEach(
        (question) => {
          const answer =
            answers[question.id];

          if (!Number.isInteger(answer)) {
            unanswered += 1;
            return;
          }

          if (answer === question.answer) {
            correct += 1;
            score +=
              Number(
                section.marksPerQuestion || 0
              );
          } else {
            wrong += 1;

            const negative =
              Number(
                section.negativeMarks || 0
              );

            score -= negative;
            negativeLost += negative;
          }
        }
      );

      const totalQuestions =
        section.questions.length;

      const attempted =
        correct + wrong;

      const maxMarks =
        totalQuestions *
        Number(
          section.marksPerQuestion || 0
        );

      const accuracy =
        attempted > 0
          ? (correct / attempted) * 100
          : 0;

      return {
        name: section.name,
        subject: section.subject,
        correct,
        wrong,
        unanswered,
        attempted,
        totalQuestions,
        score: roundMarks(score),
        maxMarks: roundMarks(maxMarks),
        negativeLost:
          roundMarks(negativeLost),
        accuracy:
          roundMarks(accuracy),
      };
    });

  const totals =
    sectionResults.reduce(
      (result, section) => ({
        correct:
          result.correct +
          section.correct,

        wrong:
          result.wrong +
          section.wrong,

        unanswered:
          result.unanswered +
          section.unanswered,

        attempted:
          result.attempted +
          section.attempted,

        score:
          result.score +
          section.score,

        maxMarks:
          result.maxMarks +
          section.maxMarks,

        negativeLost:
          result.negativeLost +
          section.negativeLost,
      }),
      {
        correct: 0,
        wrong: 0,
        unanswered: 0,
        attempted: 0,
        score: 0,
        maxMarks: 0,
        negativeLost: 0,
      }
    );

  const accuracy =
    totals.attempted > 0
      ? (
          totals.correct /
          totals.attempted
        ) * 100
      : 0;

  return {
    examId: paper.examId,
    examName: paper.examName,

    totalQuestions:
      totals.correct +
      totals.wrong +
      totals.unanswered,

    correct: totals.correct,
    wrong: totals.wrong,
    unanswered: totals.unanswered,
    attempted: totals.attempted,

    score: roundMarks(
      totals.score
    ),

    maxMarks: roundMarks(
      totals.maxMarks
    ),

    negativeLost:
      roundMarks(
        totals.negativeLost
      ),

    accuracy:
      roundMarks(accuracy),

    sections: sectionResults,
  };
}

export function getSectionRemainingAfterRefresh(
  saved,
  paper,
  extraPercent,
  elapsedSeconds
) {
  const lastIndex =
    paper.sections.length - 1;

  let sectionIndex =
    Math.min(
      Math.max(
        Number(
          saved.currentSectionIndex || 0
        ),
        0
      ),
      lastIndex
    );

  let remaining =
    typeof saved.remainingSectionSeconds ===
    "number"
      ? saved.remainingSectionSeconds
      : adjustedSeconds(
          paper.sections[sectionIndex]
            ?.minutes,
          extraPercent
        );

  let elapsed =
    Math.max(
      0,
      elapsedSeconds
    );

  while (
    elapsed > 0 || remaining === 0
  ) {
    if (elapsed < remaining) {
      remaining -= elapsed;
      elapsed = 0;
      break;
    }

    elapsed -= remaining;

    if (sectionIndex >= lastIndex) {
      remaining = 0;
      elapsed = 0;
      break;
    }

    sectionIndex += 1;

    remaining =
      adjustedSeconds(
        paper.sections[sectionIndex]
          .minutes,
        extraPercent
      );
  }

  return {
    sectionIndex,
    remaining:
      Math.max(0, remaining),
  };
}


export function isValidSavedSession(saved, examId) {
  if (!saved || saved.version !== 1 || saved.examId !== examId || !saved.paper || !Array.isArray(saved.paper.sections) || !saved.paper.sections.length) return false;
  return saved.paper.sections.every(section => section && Array.isArray(section.questions) && section.questions.every(question => question && typeof question.id === 'string' && typeof question.text === 'string' && Array.isArray(question.options) && question.options.length && Number.isInteger(question.answer)));
}
