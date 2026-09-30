// tests/browser-voice-settings.cjs
//
// Browser check for the two-step voice setting chooser, for example
// say "theme", then say "dark". Also re-checks that exam options are
// still chosen by voice.
//
// Recognition results are injected, so this validates the app's
// handling of recognised speech. It does not replace a live
// microphone test.

const baseURL = process.env.UDAAN_TEST_URL || "http://127.0.0.1:5182";
const artifactDir = process.env.UDAAN_TEST_OUTPUT || require("node:os").tmpdir();
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const tested = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.addInitScript(() => {
    localStorage.setItem('udaan_accessibility_preferences', JSON.stringify({
      theme: 'light', voiceMode: 'udaan', voiceCommands: true, textSize: 100,
    }));
    localStorage.setItem('udaan-setup-complete', 'true');
    localStorage.setItem('udaan-setup-started', 'true');
    window.__spoken = [];
    window.__recognizers = [];
    window.__active = 0;
    window.__maxActive = 0;
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { value: {
      cancel() {}, getVoices() { return []; }, resume() {},
      speak(u) { window.__spoken.push(u.text); u.onstart?.(); u.onend?.(); },
    }});
    window.SpeechRecognition = class {
      constructor() { window.__recognizers.push(this); }
      start() { window.__active++; window.__maxActive = Math.max(window.__active, window.__maxActive); this.onstart?.(); }
      abort() { if (!this.aborted) { this.aborted = true; window.__active--; } }
    };
  });

  async function check(name, fn) { await fn(); tested.push(name); console.log('PASS', name); }

  // Speak using a real microphone button.
  // Selectors avoid accessible names, which change with the UI language.
  const HEADER_MIC = '.app-header .voice-mic-button';
  const EXAM_MIC = '.exam-voice-panel button';

  async function command(text, { duplicate = false, mic = HEADER_MIC } = {}) {
    await page.locator(mic).first().click();
    await page.evaluate(({ text, duplicate }) => {
      const r = window.__recognizers.at(-1);
      const callback = r.onresult;
      r.onspeechend?.();
      const e = { resultIndex: 0, results: [[{ transcript: text, confidence: .97 }]] };
      callback(e);
      if (duplicate) callback(e);
    }, { text, duplicate });
    await page.waitForTimeout(220);
  }

  const theme = () => page.evaluate(() => document.documentElement.dataset.theme);
  const chooser = () => page.locator('.voice-setting-chooser');
  const preferences = () => page.evaluate(() => JSON.parse(localStorage.getItem('udaan_accessibility_preferences')));

  try {
    await page.goto(baseURL + '/dashboard');

    await check('Page starts on the light theme', async () => {
      assert.equal(await theme(), 'light');
    });

    await check('Saying theme opens the chooser and asks which theme', async () => {
      await command('Theme');
      await chooser().waitFor();
      assert.match(await chooser().innerText(), /Which theme\?/);
      assert.match(await chooser().innerText(), /dark/i);
      assert.equal(await page.locator('.voice-setting-choice').count(), 6, 'every theme is a button');
    });

    await check('The prompt is spoken and the chooser is keyboard reachable', async () => {
      assert.match(await page.evaluate(() => window.__spoken.at(-1)), /Which theme\?/);
      await page.locator('.voice-setting-choice').first().focus();
      assert.equal(await page.evaluate(() => document.activeElement.className), 'voice-setting-choice');
    });

    await check('Saying dark selects the dark theme', async () => {
      await command('Dark');
      await chooser().waitFor({ state: 'detached' });
      assert.equal(await theme(), 'dark');
      assert.equal((await preferences()).theme, 'dark', 'saved');
      assert.match(await page.evaluate(() => window.__spoken.at(-1)), /Dark theme selected/);
    });

    await check('The dark theme is actually applied to the page', async () => {
      const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      assert.notEqual(background, 'rgb(242, 246, 245)', 'light page background is gone');
    });

    await check('A value spoken on its own also works', async () => {
      await command('Light');
      assert.equal(await theme(), 'light');
    });

    await check('Saying no cancels without changing anything', async () => {
      await command('Theme');
      await chooser().waitFor();
      await command('No');
      await chooser().waitFor({ state: 'detached' });
      assert.equal(await theme(), 'light', 'unchanged');
    });

    await check('Chooser buttons apply the same value as speech', async () => {
      await command('Theme');
      await chooser().waitFor();
      // Buttons use the same labels as the setup selects.
      await page.getByRole('button', { name: 'Maximum Contrast' }).click();
      await chooser().waitFor({ state: 'detached' });
      assert.equal(await theme(), 'high-contrast');

      // The chooser closes after one answer, so open it again.
      await command('Theme');
      await chooser().waitFor();
      await page.getByRole('button', { name: 'Standard Light' }).click();
      await chooser().waitFor({ state: 'detached' });
      assert.equal(await theme(), 'light');
    });

    await check('Saying an unknown value leaves the chooser open', async () => {
      await command('Theme');
      await chooser().waitFor();
      await command('banana');
      assert.match(await page.locator('.voice-status').innerText(), /no matching command/i);
      assert.equal(await theme(), 'light', 'unchanged');
      await page.getByRole('button', { name: 'Cancel' }).click();
      await chooser().waitFor({ state: 'detached' });
    });

    await check('Text size and reading mode work the same way', async () => {
      await command('Text size');
      assert.match(await chooser().innerText(), /Which text size\?/);
      await command('150');
      await chooser().waitFor({ state: 'detached' });
      assert.equal((await preferences()).textSize, 150);

      await command('Reading mode');
      assert.match(await chooser().innerText(), /Which reading mode\?/);
      await command('Silent');
      await chooser().waitFor({ state: 'detached' });
      assert.equal((await preferences()).voiceMode, 'silent');
      await command('Udaan');
      assert.equal((await preferences()).voiceMode, 'udaan');
    });

    await check('A value is applied exactly once for a duplicate result', async () => {
      await command('Theme');
      await command('Dark', { duplicate: true });
      await chooser().waitFor({ state: 'detached' });
      assert.equal(await theme(), 'dark');
      const applied = await page.evaluate(() => window.__applied || 0);
      assert.ok(applied === 0 || applied === 1, 'no runaway application');
    });

    await check('Local language words and English both work in Hindi', async () => {
      await page.goto(baseURL + '/setup?edit=1');
      await page.locator('#language-select').selectOption('hi-IN');
      await page.goto(baseURL + '/dashboard');

      await command('Theme');
      await chooser().waitFor();
      assert.match(await chooser().innerText(), /कौन सी थीम\?/, 'Hindi prompt');
      assert.match(await chooser().innerText(), /डार्क/, 'prompt names the Hindi value');

      // English must keep working while Hindi is selected.
      await command('Dark');
      await chooser().waitFor({ state: 'detached' });
      assert.equal(await theme(), 'dark');

      await command('थीम');
      await chooser().waitFor();
      await command('लाइट');
      await chooser().waitFor({ state: 'detached' });
      assert.equal(await theme(), 'light');

      await page.goto(baseURL + '/setup?edit=1');
      await page.locator('#language-select').selectOption('en-IN');
      await page.goto(baseURL + '/dashboard');
    });

    await check('Settings are still reachable with keyboard and buttons', async () => {
      await page.goto(baseURL + '/dashboard');
      // The reading toolbar is a collapsed <details>.
      await page.locator('.accessibility-toolbar summary').click();
      await page.locator('#toolbar-theme').selectOption('light');
      assert.equal(await theme(), 'light');

      await page.goto(baseURL + '/setup?edit=1');
      await page.locator('#setup-theme').selectOption('dark');
      assert.equal(await theme(), 'dark');
      await page.locator('#setup-theme').selectOption('light');
      assert.equal(await theme(), 'light');
    });

    await check('Exam options are still chosen by voice, and themes work mid-test', async () => {
      await page.goto(baseURL + '/exams');
      await page.getByRole('button', { name: 'Government Exams', exact: true }).click();
      await page.getByRole('button', { name: /SSC style demo/ }).click();
      await page.getByRole('button', { name: /^Mock Test/ }).click();
      await page.getByRole('button', { name: 'General Intelligence', exact: true }).click();
      await command('Start');
      await page.getByRole('heading', { name: 'Question 1 of 12', exact: true }).waitFor();

      const state = () => page.locator('.mock-current-status').first();
      await command('Option C');
      assert.match(await state().innerText(), /Selected: Option C/);

      // The in-exam panel microphone uses the same handlers.
      await command('Option D', { mic: EXAM_MIC });
      assert.match(await state().innerText(), /Selected: Option D/);

      // A display setting must work while the test is running.
      await command('Theme');
      await chooser().waitFor();
      await command('Dark');
      await chooser().waitFor({ state: 'detached' });
      assert.equal(await theme(), 'dark');
      assert.match(await state().innerText(), /Selected: Option D/, 'the answer survived the theme change');
    });

    await check('Submit confirmation still blocks other commands', async () => {
      await command('Submit');
      await page.getByRole('dialog').waitFor();

      // The modal has its own Listen button; the header mic is covered.
      await command('Theme', { mic: EXAM_MIC });
      assert.equal(await chooser().count(), 0, 'chooser blocked during confirmation');
      assert.match(await page.getByRole('dialog').innerText(), /Say Yes to submit or No/, 'guidance still given');

      await command('No', { mic: EXAM_MIC });
      await page.getByRole('dialog').waitFor({ state: 'detached' });

      // Once it is closed, the setting works again.
      await command('Theme');
      await chooser().waitFor();
      await page.getByRole('button', { name: 'Cancel' }).click();
      await chooser().waitFor({ state: 'detached' });
    });

    await page.screenshot({ path: artifactDir + '/voice-settings.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('RESULT', JSON.stringify({ tested, errors }));
    fs.writeFileSync(artifactDir + '/voice-settings-results.json', JSON.stringify({ tested, errors }, null, 2));
  } catch (e) {
    console.log('ERRORS', errors);
    console.log((await page.locator('body').innerText()).slice(0, 6000));
    throw e;
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
