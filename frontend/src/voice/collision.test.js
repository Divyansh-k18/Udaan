// src/voice/collision.test.js

/**
 * Proves the display-setting flow never steals a normal exam command.
 *
 * `matchCommand` checks setting requests and setting values BEFORE
 * the fixed command table, so if a setting phrase ever equals a
 * normal alias the normal command becomes unreachable and the user
 * gets a chooser instead of "next" or "submit".
 *
 * These tests walk every alias in every supported language rather
 * than a hand-written sample, so adding a phrase to either table
 * without checking the other fails here.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  COMMANDS,
  matchCommand,
  getAliasesForCommand,
} from "./commands.js";

import { getSettings } from "./settingsCommands.js";
import { normalizeCommandText } from "./normalize.js";

const LANGUAGES = [
  "en-IN",
  "hi-IN",
  "mr-IN",
  "gu-IN",
  "bn-IN",
  "ta-IN",
];

const SETTING_COMMANDS = new Set(
  [
    COMMANDS.SET_SETTING,
    COMMANDS.SET_SETTING_VALUE,
  ]
);

const SETTING_KEYS = getSettings().map(
  (setting) => setting.key
);

/**
 * Every phrase that can open a chooser or answer one, with the
 * language it belongs to.
 */
function settingPhrases() {
  const phrases = [];

  for (const setting of getSettings()) {
    for (const [language, spoken] of Object.entries(
      setting.requests || {}
    )) {
      for (const phrase of spoken) {
        phrases.push({
          phrase,
          langCode: `${language}-IN`,
          kind: `request for "${setting.key}"`,
        });
      }
    }

    for (const choice of setting.choices ||
      []) {
      for (const [language, spoken] of Object.entries(
        choice.spoken || {}
      )) {
        for (const phrase of spoken) {
          phrases.push({
            phrase,
            langCode: `${language}-IN`,
            kind: `value "${choice.value}"`,
          });
        }
      }
    }
  }

  return phrases;
}

test(
  "no setting phrase is spelled like a normal command",
  () => {
    const normalAliases = new Set();

    for (const command of Object.values(
      COMMANDS
    )) {
      if (SETTING_COMMANDS.has(command)) {
        continue;
      }

      for (const langCode of LANGUAGES) {
        for (const alias of getAliasesForCommand(
          command,
          langCode
        )) {
          normalAliases.add(
            normalizeCommandText(alias)
          );
        }
      }
    }

    const clashes = [];

    for (const entry of settingPhrases()) {
      const key =
        normalizeCommandText(entry.phrase);

      if (
        key &&
        normalAliases.has(key)
      ) {
        clashes.push(
          `"${entry.phrase}" (${entry.kind}, ${entry.langCode})`
        );
      }
    }

    assert.deepEqual(
      clashes,
      [],
      `setting phrases collide with normal commands: ${clashes.join(", ")}`
    );
  }
);

test(
  "every normal command phrase still reaches its own command",
  () => {
    const problems = [];

    for (const command of Object.values(
      COMMANDS
    )) {
      if (SETTING_COMMANDS.has(command)) {
        continue;
      }

      for (const langCode of LANGUAGES) {
        for (const alias of getAliasesForCommand(
          command,
          langCode
        )) {
          const result = matchCommand(
            alias,
            langCode
          );

          if (!result) {
            problems.push(
              `"${alias}" (${langCode}) matched nothing`
            );
          } else if (
            SETTING_COMMANDS.has(
              result.command
            )
          ) {
            problems.push(
              `"${alias}" (${langCode}) matched ${result.command} instead of ${command}`
            );
          } else if (
            result.command !== command
          ) {
            problems.push(
              `"${alias}" (${langCode}) matched ${result.command} instead of ${command}`
            );
          }
        }
      }
    }

    assert.deepEqual(
      problems,
      [],
      problems.slice(0, 10).join("; ")
    );
  }
);

/**
 * Bare numbers are deliberately NOT setting values.
 *
 * "2" has to keep meaning exam option B, so the numeric size and
 * spacing aliases are gated behind the setting name and only fire
 * in the noun form ("line spacing 2"). Asserting that here stops a
 * future change from quietly stealing exam options.
 */
const BARE_NUMBER = /^\d+(?:\s+\d+)*$/;

test(
  "a bare number stays an exam option, not a setting value",
  () => {
    for (const phrase of [
      "1",
      "2",
      "3",
      "4",
    ]) {
      const result = matchCommand(
        phrase,
        "en-IN"
      );

      assert.equal(
        result?.command,
        "SELECT_OPTION",
        `"${phrase}" must remain an exam option`
      );

      assert.equal(
        SETTING_COMMANDS.has(
          result?.command
        ),
        false
      );
    }
  }
);

test(
  "setting phrases are recognised in every language",
  () => {
    const missing = [];

    for (const entry of settingPhrases()) {
      // See the bare-number rule above.
      if (
        BARE_NUMBER.test(
          normalizeCommandText(entry.phrase)
        )
      ) {
        continue;
      }

      const result = matchCommand(
        entry.phrase,
        entry.langCode
      );

      if (
        !SETTING_COMMANDS.has(
          result?.command
        )
      ) {
        missing.push(
          `"${entry.phrase}" (${entry.langCode}, ${entry.kind})`
        );
      }
    }

    assert.deepEqual(
      missing,
      [],
      `unrecognised setting phrases: ${missing.slice(0, 10).join("; ")}`
    );
  }
);

test(
  "the collision suite actually covers something",
  () => {
    // Guards against the walkers silently returning nothing.
    assert.ok(
      settingPhrases().length > 50,
      "expected the settings catalogue to be walked"
    );

    assert.ok(
      SETTING_KEYS.length >= 4,
      "expected theme, textSize, lineSpacing and voiceMode"
    );
  }
);
