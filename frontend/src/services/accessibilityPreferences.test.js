import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, normalizePreferences, themes, settingMessage } from './accessibilityPreferences.js';

test('old saved preferences migrate without losing voice mode or exam timing', () => {
  const prefs = normalizePreferences({ theme: 'dark', textSize: 60, voiceMode: 'screen-reader', extraTimePercent: 25 });
  assert.equal(prefs.textSize, 100);
  assert.equal(prefs.voiceMode, 'screen-reader');
  assert.equal(prefs.extraTimePercent, 25);
  assert.equal(prefs.lineSpacing, 1.65);
});
test('corrupt and null preference values fall back safely', () => {
  assert.deepEqual(normalizePreferences(null), defaults);
  const prefs = normalizePreferences({ theme: 'unknown', textSize: 'broken', speechRate: 9, reducedMotion: 'false' });
  assert.equal(prefs.theme, 'light');
  assert.equal(prefs.textSize, 100);
  assert.equal(prefs.speechRate, 2);
  assert.equal(prefs.reducedMotion, false);
});
test('all six themes survive persistence and feedback uses meaningful labels', () => {
  for (const [id, label] of themes) {
    assert.equal(normalizePreferences({ theme: id }).theme, id);
    assert.equal(settingMessage('theme', id), `${label} theme selected.`);
  }
  assert.equal(settingMessage('textSize', 150), 'Text size 150 percent selected.');
  assert.equal(settingMessage('reducedMotion', true), 'Reduced motion enabled.');
});
