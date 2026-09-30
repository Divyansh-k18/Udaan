import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateResult, adjustedSeconds, getSectionRemainingAfterRefresh } from './examLogic.js';
import { calculateAttempt } from './analytics.js';

test('scoring preserves zero-index answers, negative marks and unanswered questions', () => {
  const paper = { examId:'demo', sections:[{name:'Math',marksPerQuestion:2,negativeMarks:.5,questions:[{id:'a',answer:0},{id:'b',answer:2},{id:'c',answer:1}]}] };
  const result = calculateResult(paper, {a:0,b:1});
  assert.equal(result.score,1.5); assert.equal(result.correct,1); assert.equal(result.wrong,1); assert.equal(result.unanswered,1); assert.equal(result.maxMarks,6);
});
test('null question scores are calculated, not treated as recorded zero', () => {
  const result=calculateAttempt({questions:[{id:'a',chosen:'A',answer:'A',marks:2,score:null},{id:'b',chosen:'A',answer:'B',marks:2,negative:.5},{id:'c',marks:2}]});
  assert.equal(result.score,1.5); assert.equal(result.attempted,2); assert.equal(result.totalQuestions,3); assert.equal(result.accuracy,50);
});
const paper={sections:[{minutes:1},{minutes:2},{minutes:1}]};
test('timer recovery deducts elapsed seconds within a section',()=>{
  assert.deepEqual(getSectionRemainingAfterRefresh({currentSectionIndex:0,remainingSectionSeconds:50},paper,0,10),{sectionIndex:0,remaining:40});
});
test('timer recovery carries background elapsed time across sections',()=>{
  assert.deepEqual(getSectionRemainingAfterRefresh({currentSectionIndex:0,remainingSectionSeconds:50},paper,0,180),{sectionIndex:2,remaining:50});
});
test('zero-time refresh advances a section and final expiry stays at zero',()=>{
  assert.deepEqual(getSectionRemainingAfterRefresh({currentSectionIndex:0,remainingSectionSeconds:0},paper,0,0),{sectionIndex:1,remaining:120});
  assert.deepEqual(getSectionRemainingAfterRefresh({currentSectionIndex:2,remainingSectionSeconds:0},paper,0,300),{sectionIndex:2,remaining:0});
});
test('extra time is applied consistently',()=> assert.equal(adjustedSeconds(10,50),900));
