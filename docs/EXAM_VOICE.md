# Developer 2: exam and voice handoff

Implemented on `feature/exam-voice`. No merge into main.

## Behavior

- Categories: Government Exams, School, Engineering Entrance, Medical Entrance, Other Competitive Exams. All content is explicitly demo content. New school/JEE/NEET fundamentals questions are English-only and require academic review; they are not full syllabus papers.
- Flow: category, exam, Prepare/Mock, subject or starting section, test. Timed sectional mocks begin with their first section. Restoring a saved mock retains its saved position.
- Options are selected first and locked separately. Only locked answers count for mock scoring. Clear unlocks/removes a mock answer. Prepare reveals correctness and explanation only after locking; Retry wrong clears an incorrect attempt.
- Visible recognition states, transcript and action feedback; Listen is an explicit one-command action. Press Listen or Alt+V again before each command. No automatic microphone restart.
- A single shared recognition service rejects overlapping starts, settles each result once, detaches callbacks, aborts the recognizer, has a 15-second timeout and supports cancellation. Route/question changes cancel pending recognition. Speech is stopped before listening.
- Question reading includes number, question and options. Repeat reads current content; Read options reads only options. Screen-reader mode does not call speech synthesis for questions.
- Submission requires a separate Yes after Submit. No cancels. The confirmation contains its own Listen button and supports Alt+V. Other exam commands are blocked while confirmation is open. Duplicate submission is guarded.
- Textual navigator states, bookmarks, review marks, progress and current-section status. Existing local scoring, negative marking, elapsed-time recovery and timed-section progression are retained.

## Commands

Start; Next / Next question / Go next / Continue; Previous / Previous question / Go back; Repeat / Repeat question; Read options / Options / Repeat options; Option A–D / Select A–D / Answer A–D / A–D; Lock / Lock answer / Confirm / Confirm answer; Clear answer; Mark / Mark question / Mark for review; Bookmark; Time left; Go to question (opens dialog) / Go to question 12; Section status; Progress / My progress / Status; Submit / Submit test / Finish test; Yes; No; Help; Stop; Explain again.

Prepare also supports Skip and Retry wrong. Explanations are intentionally unavailable in a running mock. English aliases work with all selected languages; existing local-language aliases remain. Matching is normalized and exact, not substring-based. “Confirm” locks an answer; it is not submission consent.

## Voice setting chooser

Display settings use the same two-step shape as choosing an exam option. Say the setting, then say a value:

- Theme → Light, Dark, High contrast, Protan deutan, Tritan, Reading comfort
- Text size → 100, 110, 125, 150, 175, 200
- Line spacing → 1.5, 1.65, 2, 2.5
- Reading mode → Udaan speaks, Screen Reader, Silent

A value may also be spoken on its own or with the setting name: “dark”, “dark theme”, “theme dark”, “set theme dark”, “150”, “text size 150”. Local-language words work, and English always works.

Behaviour:

- The setting name opens an on-screen chooser that asks which value, both visibly and in speech. Every value is also a real button, so the feature is never voice-only.
- Only React may speak. The chooser asks the accessibility context to announce, so the selected reading mode still governs narration.
- Values are matched against the setting being chosen. “150” while a theme is open applies the text size and dismisses the theme question rather than answering it wrongly.
- “No” and “Stop” cancel. Any other command closes the chooser and is handled normally, so the chooser can never get stuck open.
- The chooser works in Prepare and mid-mock, from the header microphone and the in-exam panel microphone. The submit confirmation still blocks it, as it blocks every command except Yes, No, Stop and Help.
- Line spacing requires the setting name (“line spacing 2”), because a bare 1 or 2 must stay an exam option.
- Matching order is exam option, go to question, setting name, setting value, then fixed commands, so no existing command is shadowed.

## Validation performed

- `npm test`: 16 passing test groups, including the existing 18 command cases, plus required aliases, unrelated speech rejection, recognition alternatives, singleton recognition, duplicate results, cancellation, error recovery, complete category banks, scoring and timer recovery.
- `npm run lint`: zero errors, seven existing React Fast Refresh warnings in unchanged files.
- `npm run build -- --configLoader native`: passed. Default `npm run build` was attempted, but this Windows sandbox denies esbuild's ancestor-directory lookup while bundling the Vite config. Native config loading avoids that environment issue. The production bundle has a non-fatal size warning.
- Running production app tested in headless Microsoft Edge with recognition-result and speech-synthesis test doubles: 16 browser scenarios, zero console/runtime errors. Exact injected sequence included Start, Option B, Lock answer, Next question, Previous question, Read options, Repeat question, Mark question, Progress, Time left, Section status, Bookmark, Submit, No, Submit, Yes, Clear answer, Go to question, Explain again, Retry wrong and Skip. Unrelated input was rejected.
- Duplicate result delivery navigated/submitted once. Rapid Listen clicks used one recognizer. Permission, no-speech and network errors recovered. Refresh retained locked answers and deducted elapsed time. Prepare withheld results until locking. Route changes aborted active recognition.
- Separate browser checks verified no speech synthesis in screen-reader mode, question-heading focus, the global microphone's single command dispatch and route cancellation, Alt+V/No inside confirmation, and completing a mock using keyboard/buttons when recognition was unsupported.
- A native (unmocked) Edge recognition attempt returned microphone blocked in the automated browser, and the application displayed its fallback correctly.
- `npm test`: 48 passing test groups, including the original 18 command cases, plus 16 setting-catalogue cases and 10 two-step flow cases driven through the real matcher.
- `npm run lint`: zero errors, the same seven existing React Fast Refresh warnings in unchanged files.
- `npm run build -- --configLoader native`: passed, with the existing non-fatal size warning.
- `node tests/browser-voice-settings.cjs`: 15 browser scenarios, zero console/runtime errors. Covered the chooser opening, the prompt being spoken, Dark being applied and saved, a value spoken on its own, No cancelling, chooser buttons, an unknown value leaving the chooser open, text size and reading mode, a duplicate recognition result applying once, the full Hindi round trip with English still working, the existing setup and toolbar selects, Option C and Option D during a mock with a theme change that preserved the selected answer, and the submit confirmation still blocking the chooser.
- `node tests/browser-test.cjs` and `node tests/browser-fallbacks.cjs` were re-run unchanged and still pass, so the new commands did not shadow or delay any existing exam command.

**Live spoken-audio recognition and actual audible speech have not been verified.** The automated sequence validates recognition-event handling, not the browser service's ability to hear a human. A user microphone test was requested. Voice depends on browser API support, permission, device availability, language support and the browser recognition service/network. Do not call the voice flow error-free or mark live microphone acceptance passed yet.

## Reproduce browser checks

Start the built app on port 5182:

```sh
npm run build -- --configLoader native
npm run preview -- --configLoader native --port 5182 --strictPort
```

With Playwright available, run `node tests/browser-test.cjs` and `node tests/browser-fallbacks.cjs` from frontend. Tests use installed Microsoft Edge. `PLAYWRIGHT_MODULE` can point to an existing Playwright package; `UDAAN_TEST_URL` overrides the base URL, and `UDAAN_TEST_OUTPUT` overrides the temporary artifact directory. Browser command tests deliberately inject recognition results; they do not replace live microphone testing.

For the setting chooser, run `node tests/browser-voice-settings.cjs` against the same preview server.

For live acceptance, use Chrome/Edge, open Exams → Government Exams → SSC style demo → Mock Test → General Intelligence → Start. Press Listen before each command. Run Option B → Lock answer → Next question → Previous question → Read options → Repeat question → Mark question → Progress → Time left → Submit → No → Submit → Yes. Verify selected versus locked states and one action per command. Also deny microphone permission and complete using keyboard/buttons.

Then, on any page, press Listen and say Theme. Confirm the chooser appears and asks which theme. Press Listen again and say Dark. Confirm the page turns dark, “Dark theme selected” is spoken, and the choice is marked as current. Repeat with Light, then with Text size → 150 and Reading mode → Silent. Confirm the Cancel button and the existing setup and toolbar selects still change the same settings.

## Collaboration and files

Primary changes: `pages/Exam.jsx`, `Prepare.jsx`, `ExamList.jsx`, `ModeSelect.jsx`; `data/examCatalog.js`, `questionBank.js`, new `demoQuestions.js`; `services/listen.js`; `voice/commands.js`; `hooks/useShortcuts.js`, new `useExamVoice.js`; new `components/ExamVoicePanel.jsx`, `styles/examVoice.css`, `services/listen.test.js`, `services/catalog.test.js`, and browser tests.

Shared integration changes to review with Developer 1: `components/VoiceGuide.jsx` has a one-line exam/prepare/mode/list route exception to stop repeated welcome speech; `components/VoiceStatus.jsx` now cancels pending recognition on navigation and reports unknown commands to the exam panel. `listen.js`, `commands.js` and `useShortcuts.js` are also shared APIs.

No changes to AccessibilityContext, Setup, Login, Dashboard, themes.css or speech.js.

The voice setting chooser adds `voice/normalize.js` (extracted from `commands.js` so both matchers can share it and avoid a circular import), `voice/settingsCommands.js`, `voice/settingsFlow.js`, `components/VoiceSettingChooser.jsx` and their tests, plus a `VoiceSettingChooser` mount and command routing line in `components/Layout.jsx`. It touches only new files plus one routing line in Layout, because the chooser must appear on every page; no existing Layout behaviour changed. `commands.js` also gained option E and F and a few extra option phrasings, which remain bounded by the existing `selectOption` range guards in `Exam.jsx` and `Prepare.jsx`.

The original OneDrive checkout's Git metadata was denied by Windows even after a permission grant. Work was therefore performed in an isolated clone in this chat's `work/Udaan` directory, starting from origin/main. Integrate the feature branch through the normal review workflow; do not overwrite Developer 1's current checkout.
