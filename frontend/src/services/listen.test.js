import test from 'node:test';
import assert from 'node:assert/strict';
import { listenOnce, cancelListening, isSpeechRecognitionSupported } from './listen.js';
import { matchCommand, matchCommandAlternatives } from '../voice/commands.js';

let instances = [];
class Recognition {
  constructor() { instances.push(this); }
  start() { this.onstart?.(); }
  abort() { this.aborted = true; }
  result(text) { this.onresult?.({ resultIndex: 0, results: [[{ transcript: text, confidence: .9 }]] }); }
}
function setup() { instances = []; globalThis.window = { SpeechRecognition: Recognition, dispatchEvent() {} }; }
test('single recognizer, exactly one result, handlers removed before executing', async () => {
  setup();
  const first = listenOnce();
  await assert.rejects(listenOnce(), { code: 'busy' });
  assert.equal(instances.length, 1);
  const callback = instances[0].onresult;
  instances[0].result('Option B');
  callback({ resultIndex: 0, results: [[{ transcript: 'Next' }]] });
  assert.equal((await first)[0].transcript, 'Option B');
  assert.equal(instances[0].onresult, null);
  assert.equal(instances[0].aborted, true);
});
test('cancel on navigation rejects pending recognition; later instance can start', async () => {
  setup(); const pending = listenOnce(); cancelListening();
  await assert.rejects(pending, { code: 'cancelled' });
  const next = listenOnce(); instances[1].result('Next'); await next;
});
test('permission, no speech and network failures release microphone without restart', async () => {
  for (const [error, code] of [['not-allowed','mic-blocked'], ['no-speech','no-speech'], ['network','network']]) {
    setup(); const pending=listenOnce(); instances[0].onerror({error});
    await assert.rejects(pending, {code});
    assert.equal(instances.length,1); assert.equal(instances[0].aborted,true);
  }
  setup(); const pending=listenOnce(); instances[0].onend(); await assert.rejects(pending,{code:'no-speech'});
});
test('unsupported browser and webkit fallback', async () => {
  globalThis.window = {}; assert.equal(isSpeechRecognitionSupported(),false);
  await assert.rejects(listenOnce(),{code:'not-supported'});
  setup(); window.webkitSpeechRecognition=Recognition; delete window.SpeechRecognition;
  const pending=listenOnce(); instances[0].result('Help'); await pending;
});
test('all required command aliases and unrelated speech safety', () => {
  const commands={ START_EXAM:['start'], NEXT:['next','next question','go next','continue'], PREVIOUS:['previous','previous question','go back'], LOCK:['lock','lock answer','confirm','confirm answer'], MARK:['mark','mark question','mark for review'], PROGRESS:['progress','my progress','status'], READ_OPTIONS:['read options','options','repeat options'], SUBMIT:['submit','submit test','finish test'], YES:['yes'], NO:['no'], REPEAT:['repeat','repeat question'], CLEAR:['clear answer'], BOOKMARK:['bookmark'], TIME_LEFT:['time left'], GO_TO:['go to question'], SECTION_STATUS:['section status'], HELP:['help'], STOP:['stop'], EXPLAIN_AGAIN:['explain again'] };
  for(const [command,aliases] of Object.entries(commands)) for(const text of aliases) assert.equal(matchCommand(text)?.command,command,text);
  for(const option of ['A','B','C','D']) for(const prefix of ['', 'option ', 'select ', 'answer ']) assert.equal(matchCommand(prefix+option)?.option,option);
  assert.equal(matchCommand('  OPTION   B!! ')?.option,'B');
  for(const text of ['I think option b might be right','a bird is flying','next question is about apples','submit my homework tomorrow','yes please select a random answer']) assert.equal(matchCommand(text),null,text);
  assert.equal(matchCommandAlternatives([{transcript:'unrelated'}, {transcript:'option c'}])?.option,'C');
  assert.equal(matchCommand('go to question 12')?.questionNumber,12);
});
