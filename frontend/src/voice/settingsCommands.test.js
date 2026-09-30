// src/voice/settingsCommands.test.js

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  matchSettingRequest,
  matchSettingValue,
  settingChoices,
  settingLabel,
  settingPrompt,
  getSetting,
} from "./settingsCommands.js";


/* ---------------------------------------------------
   STEP 1: THE USER NAMES A SETTING
--------------------------------------------------- */

test("theme request", () => {
  assert.deepEqual(matchSettingRequest("theme", "en-IN"), { setting: "theme" });
  assert.deepEqual(matchSettingRequest("themes", "en-IN"), { setting: "theme" });
  assert.deepEqual(matchSettingRequest("change theme", "en-IN"), { setting: "theme" });
  assert.deepEqual(matchSettingRequest("set theme", "en-IN"), { setting: "theme" });
  assert.deepEqual(matchSettingRequest("colour theme", "en-IN"), { setting: "theme" });
});

test("theme request in local languages", () => {
  assert.deepEqual(matchSettingRequest("थीम", "hi-IN"), { setting: "theme" });
  assert.deepEqual(matchSettingRequest("रंग थीम", "hi-IN"), { setting: "theme" });
  assert.deepEqual(matchSettingRequest("થીમ", "gu-IN"), { setting: "theme" });
  assert.deepEqual(matchSettingRequest("থিম", "bn-IN"), { setting: "theme" });
  assert.deepEqual(matchSettingRequest("தீம்", "ta-IN"), { setting: "theme" });
  assert.deepEqual(matchSettingRequest("थीम", "mr-IN"), { setting: "theme" });
});

test("other setting requests", () => {
  assert.deepEqual(matchSettingRequest("text size", "en-IN"), { setting: "textSize" });
  assert.deepEqual(matchSettingRequest("font size", "en-IN"), { setting: "textSize" });
  assert.deepEqual(matchSettingRequest("line spacing", "en-IN"), { setting: "lineSpacing" });
  assert.deepEqual(matchSettingRequest("reading mode", "en-IN"), { setting: "voiceMode" });
  assert.deepEqual(matchSettingRequest("voice mode", "en-IN"), { setting: "voiceMode" });
});

test("unrelated speech is not a setting request", () => {
  assert.equal(matchSettingRequest("dark", "en-IN"), null);
  assert.equal(matchSettingRequest("read options", "en-IN"), null);
  assert.equal(matchSettingRequest("settings", "en-IN"), null);
  assert.equal(matchSettingRequest("options", "en-IN"), null);
  assert.equal(matchSettingRequest("next question", "en-IN"), null);
  assert.equal(matchSettingRequest("", "en-IN"), null);
});


/* ---------------------------------------------------
   STEP 2: THE USER SAYS A VALUE
--------------------------------------------------- */

test("bare value answers the theme", () => {
  assert.deepEqual(matchSettingValue("dark", "en-IN", "theme"), {
    setting: "theme",
    value: "dark",
    label: "Dark",
  });

  assert.equal(matchSettingValue("light", "en-IN", "theme").value, "light");
  assert.equal(matchSettingValue("high contrast", "en-IN", "theme").value, "high-contrast");
  assert.equal(matchSettingValue("reading comfort", "en-IN", "theme").value, "reading");
  assert.equal(matchSettingValue("protan deutan", "en-IN", "theme").value, "protan-deutan");
  assert.equal(matchSettingValue("tritan", "en-IN", "theme").value, "tritan");
});

test("value works with and without the setting name", () => {
  for (const spoken of ["dark", "dark theme", "theme dark", "set theme dark", "choose dark", "switch to dark"]) {
    assert.equal(matchSettingValue(spoken, "en-IN", "theme")?.value, "dark", spoken);
  }
});

test("value works in local languages", () => {
  assert.equal(matchSettingValue("डार्क", "hi-IN", "theme")?.value, "dark");
  assert.equal(matchSettingValue("डार्क थीम", "hi-IN", "theme")?.value, "dark");
  assert.equal(matchSettingValue("थीम डार्क", "hi-IN", "theme")?.value, "dark");
  assert.equal(matchSettingValue("ડાર્ક", "gu-IN", "theme")?.value, "dark");
  assert.equal(matchSettingValue("ডার্ক", "bn-IN", "theme")?.value, "dark");
  assert.equal(matchSettingValue("டார்க்", "ta-IN", "theme")?.value, "dark");
});

test("text size and reading mode values", () => {
  assert.equal(matchSettingValue("150", "en-IN", "textSize")?.value, 150);
  assert.equal(matchSettingValue("150 percent", "en-IN", "textSize")?.value, 150);
  assert.equal(matchSettingValue("one fifty", "en-IN", "textSize")?.value, 150);
  assert.equal(matchSettingValue("text size 200", "en-IN", "textSize")?.value, 200);
  assert.equal(matchSettingValue("screen reader", "en-IN", "voiceMode")?.value, "screen-reader");
  assert.equal(matchSettingValue("silent", "en-IN", "voiceMode")?.value, "silent");
  assert.equal(matchSettingValue("udaan", "en-IN", "voiceMode")?.value, "udaan");
});

test("line spacing needs the setting name so it cannot be read as an option", () => {
  assert.equal(matchSettingValue("2", "en-IN", "lineSpacing"), null);
  assert.equal(matchSettingValue("line spacing 2", "en-IN", "lineSpacing")?.value, 2);
  assert.equal(matchSettingValue("line spacing 1.65", "en-IN", "lineSpacing")?.value, 1.65);
  assert.equal(matchSettingValue("line spacing 2.5", "en-IN", "lineSpacing")?.value, 2.5);
  assert.equal(matchSettingValue("double spacing", "en-IN", "lineSpacing")?.value, 2);
});

test("value is restricted to the setting being chosen", () => {
  // 150 is a text size, not a theme, so it must not answer a theme question.
  assert.equal(matchSettingValue("150", "en-IN", "theme"), null);
  // "dark" is a theme, not a text size.
  assert.equal(matchSettingValue("dark", "en-IN", "textSize"), null);
  // Without a setting, the value is matched against every setting.
  assert.equal(matchSettingValue("150", "en-IN")?.setting, "textSize");
  assert.equal(matchSettingValue("dark", "en-IN")?.setting, "theme");
});

test("unrelated speech is not a value", () => {
  assert.equal(matchSettingValue("next question", "en-IN", "theme"), null);
  assert.equal(matchSettingValue("read options", "en-IN", "theme"), null);
  assert.equal(matchSettingValue("option c", "en-IN", "theme"), null);
  assert.equal(matchSettingValue("", "en-IN", "theme"), null);
});

test("no existing exam command is shadowed by a value", () => {
  const spokenCommands = [
    "lock", "lock answer", "confirm", "skip", "next", "next question",
    "continue", "previous", "go back", "repeat", "say again",
    "read options", "options", "read answers", "clear", "clear answer",
    "mark", "mark for review", "time left", "remaining time",
    "section status", "submit", "finish exam", "yes", "no", "cancel",
    "help", "show commands", "stop", "be quiet", "start exam", "practice",
    "progress", "my progress", "settings", "open settings", "bookmark",
    "save question", "explain again", "retry wrong",
  ];

  for (const spoken of spokenCommands) {
    assert.equal(matchSettingValue(spoken, "en-IN"), null, spoken);
    assert.equal(matchSettingRequest(spoken, "en-IN"), null, spoken);
  }
});


/* ---------------------------------------------------
   CHOOSER DATA
--------------------------------------------------- */

test("every theme in the app can be chosen by voice", () => {
  const themeIds = ["light", "dark", "high-contrast", "protan-deutan", "tritan", "reading"];

  for (const id of themeIds) {
    assert.ok(getSetting("theme"), "theme setting exists");
    assert.ok(
      settingChoices("theme").some((choice) => choice.value === id),
      `chooser offers ${id}`,
    );
  }
});

test("every text size in the app can be chosen by voice", () => {
  const sizes = settingChoices("textSize").map((choice) => choice.value);

  assert.deepEqual(sizes, [100, 110, 125, 150, 175, 200]);

  for (const size of sizes) {
    assert.equal(matchSettingValue(String(size), "en-IN", "textSize")?.value, size);
  }
});

test("prompt and label exist in every supported language", () => {
  for (const langCode of ["en-IN", "hi-IN", "mr-IN", "gu-IN", "bn-IN", "ta-IN"]) {
    for (const key of ["theme", "textSize", "lineSpacing", "voiceMode"]) {
      assert.ok(settingPrompt(key, langCode), `prompt ${key} ${langCode}`);
      assert.ok(settingLabel(key, langCode), `label ${key} ${langCode}`);
      assert.ok(settingChoices(key).length, `choices ${key}`);
    }
  }
});

test("the theme prompt names the values the user should say", () => {
  const prompt = settingPrompt("theme", "en-IN").toLowerCase();

  for (const spoken of ["light", "dark", "high contrast", "tritan"]) {
    assert.ok(prompt.includes(spoken), `prompt mentions ${spoken}`);
  }
});
