// src/voice/optionCoverage.test.js

/**
 * Guards the "option A/B/C..." surface.
 *
 * Three things must agree:
 *
 *   1. how many options a question actually has (the question bank),
 *   2. how many option letters the voice matcher recognises,
 *   3. which option letters the Help dialog advertises.
 *
 * They drifted apart once: the matcher and Help listed E and F while
 * every question in the app has exactly four options, so "option e"
 * matched a command that could never be honoured. These tests fail if
 * that happens again.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { matchCommand } from "./commands.js";
import { questionBank } from "../data/questionBank.js";
import { demoQuestions } from "../data/demoQuestions.js";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function maxOptionsPerQuestion() {
  let max = 0;

  for (const question of [
    ...questionBank,
    ...demoQuestions,
  ]) {
    for (const options of Object.values(
      question.options || {}
    )) {
      max = Math.max(max, options.length);
    }
  }

  return max;
}

function recognisedLetters() {
  return LETTERS.filter((letter) => {
    const result = matchCommand(
      `option ${letter}`,
      "en-IN"
    );

    return (
      result?.command ===
        "SELECT_OPTION" &&
      result?.option === letter
    );
  });
}

function advertisedLetters() {
  const source = fs.readFileSync(
    fileURLToPath(
      new URL(
        "../components/HelpDialog.jsx",
        import.meta.url
      )
    ),
    "utf8"
  );

  // Only the VOICE_COMMANDS array, not unrelated prose.
  const start =
    source.indexOf(
      "const VOICE_COMMANDS"
    );

  assert.notEqual(
    start,
    -1,
    "VOICE_COMMANDS list not found in HelpDialog"
  );

  const end =
    source.indexOf(
      "];",
      start
    );

  const block =
    source.slice(
      start,
      end === -1 ? undefined : end
    );

  return [
    ...new Set(
      [...block.matchAll(/Option ([A-Z])\b/g)].map(
        (match) => match[1]
      )
    ),
  ].sort();
}

test(
  "every option letter the matcher recognises exists on a real question",
  () => {
    const available =
      maxOptionsPerQuestion();

    const recognised = recognisedLetters();

    assert.ok(
      available > 0,
      "question bank exposed no options"
    );

    assert.deepEqual(
      recognised,
      LETTERS.slice(0, available),
      `matcher recognises ${recognised.join(",")} but questions have ${available} option(s)`
    );
  }
);

test(
  "Help advertises exactly the option letters the matcher recognises",
  () => {
    assert.deepEqual(
      advertisedLetters(),
      recognisedLetters(),
      "Help dialog and voice matcher disagree about which options exist"
    );
  }
);

test(
  "a spoken option letter always resolves to a selectable index",
  () => {
    // Mirrors the bounds check the exam uses before selecting.
    for (const letter of recognisedLetters()) {
      const index =
        letter.charCodeAt(0) - 65;

      assert.ok(
        index >= 0 &&
          index <
            maxOptionsPerQuestion(),
        `option ${letter} resolves to ${index}, which is out of range`
      );
    }
  }
);

test(
  "option letters past the last option are not recognised",
  () => {
    const beyond =
      LETTERS.slice(
        maxOptionsPerQuestion()
      );

    assert.ok(
      beyond.length > 0,
      "expected at least one unused letter to guard against"
    );

    for (const letter of beyond) {
      assert.equal(
        matchCommand(
          `option ${letter}`,
          "en-IN"
        )?.command,
        undefined,
        `option ${letter} should not match`
      );
    }
  }
);
