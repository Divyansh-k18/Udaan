// src/voice/settingsFlow.test.js

/**
 * End-to-end check of the two-step voice flow, driven through the
 * real matcher so the wiring is covered, not just the catalogue:
 *
 *   say "theme"  ->  say "dark"  ->  theme becomes dark
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { matchCommand } from "./commands.js";
import {
  beginSettingChoice,
  cancelSettingChoice,
  chooseSettingValue,
  getPendingSetting,
  handleSettingsCommand,
} from "./settingsFlow.js";


// The flow broadcasts through window events, as the rest of the app does.
const listeners = new Map();
const received = [];

globalThis.window = {
  addEventListener(type, handler) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(handler);
  },
  removeEventListener(type, handler) {
    const current = listeners.get(type) || [];
    listeners.set(type, current.filter((item) => item !== handler));
  },
  dispatchEvent(event) {
    received.push({ type: event.type, detail: event.detail });
    for (const handler of listeners.get(event.type) || []) handler(event);
    return true;
  },
};

function eventsOfType(type) {
  return received.filter((event) => event.type === type);
}


/** Say something: recognise it, then offer it to the flow. */
function say(transcript, langCode = "en-IN") {
  const command = matchCommand(transcript, langCode);
  const handled = command ? handleSettingsCommand(command, langCode) : false;
  return { command, handled };
}


function reset() {
  cancelSettingChoice("test-reset");
  received.length = 0;
}


test("chooser opens and asks which theme", () => {
  reset();

  const { command, handled } = say("theme");

  assert.equal(command.command, "SET_SETTING");
  assert.equal(command.setting, "theme");
  assert.equal(handled, true, "the flow consumed the command");
  assert.equal(getPendingSetting(), "theme");

  const prompt = eventsOfType("udaan:voice-setting-prompt");

  assert.equal(prompt.length, 1, "the user is asked for a value");
  assert.match(prompt[0].detail.text, /dark/i, "prompt names the values");

  const pending = eventsOfType("udaan:voice-setting-pending");

  assert.equal(pending[0].detail.choices.length, 6, "every theme is offered as a button");
});

test("saying dark after theme selects the dark theme", () => {
  reset();
  say("theme");

  const { command, handled } = say("dark");

  assert.equal(command.command, "SET_SETTING_VALUE");
  assert.equal(command.setting, "theme");
  assert.equal(command.value, "dark");
  assert.equal(handled, true);

  const apply = eventsOfType("udaan:voice-setting-apply");

  assert.equal(apply.length, 1, "applied exactly once");
  assert.deepEqual(apply[0].detail, { key: "theme", value: "dark", label: "Dark" });
  assert.equal(getPendingSetting(), null, "the chooser closed");
});

test("a value can be spoken without opening the chooser first", () => {
  reset();

  const { command } = say("dark theme");

  assert.equal(command.command, "SET_SETTING_VALUE");
  assert.equal(command.value, "dark");
  assert.equal(eventsOfType("udaan:voice-setting-prompt").length, 0, "no prompt needed");
});

test("chooser buttons apply the same value as speech", () => {
  reset();
  say("theme");

  assert.equal(chooseSettingValue("theme", "high-contrast"), true);

  const apply = eventsOfType("udaan:voice-setting-apply");

  assert.deepEqual(apply[0].detail, {
    key: "theme",
    value: "high-contrast",
    label: "Maximum Contrast",
  });
  assert.equal(getPendingSetting(), null);
});

test("say no cancels without changing anything", () => {
  reset();
  say("theme");

  const { command, handled } = say("no");

  assert.equal(command.command, "NO");
  assert.equal(handled, true, "the flow consumed it");
  assert.equal(getPendingSetting(), null);
  assert.equal(eventsOfType("udaan:voice-setting-apply").length, 0, "nothing was applied");
});

test("an exam command closes the chooser and is still handled", () => {
  reset();
  say("theme");

  const { command, handled } = say("next question");

  assert.equal(command.command, "NEXT");
  assert.equal(handled, false, "the exam keeps this command");
  assert.equal(getPendingSetting(), null, "the chooser cannot get stuck open");
});

test("a value for a different setting does not answer the open question", () => {
  reset();
  say("theme");

  // 150 is a text size, so the theme question is replaced, not
  // silently answered with the wrong value.
  const { command } = say("150");

  assert.equal(command.setting, "textSize");
  assert.equal(command.value, 150);

  const apply = eventsOfType("udaan:voice-setting-apply");

  assert.equal(apply.length, 1);
  assert.equal(apply[0].detail.key, "textSize", "text size was changed, not the theme");
});

test("saying a setting again re-opens the chooser without doubling up", () => {
  reset();
  say("theme");
  say("text size");

  assert.equal(getPendingSetting(), "textSize");
  assert.equal(eventsOfType("udaan:voice-setting-prompt").length, 2);
  assert.equal(beginSettingChoice("not-a-real-setting"), false);
  assert.equal(getPendingSetting(), "textSize", "an unknown setting changes nothing");
});

test("full flow in Hindi", () => {
  reset();

  say("थीम", "hi-IN");
  assert.equal(getPendingSetting(), "theme");

  const { command } = say("डार्क", "hi-IN");

  assert.equal(command.value, "dark");
  assert.equal(eventsOfType("udaan:voice-setting-apply")[0].detail.value, "dark");
});

test("exam options are not stolen by the settings flow", () => {
  reset();

  for (const [spoken, option] of [["option c", "C"], ["option d", "D"], ["answer is b", "B"], ["5", "E"]]) {
    const { command, handled } = say(spoken);
    assert.equal(command.command, "SELECT_OPTION", spoken);
    assert.equal(command.option, option, spoken);
    assert.equal(handled, false, `${spoken} stays an exam command`);
  }
});
