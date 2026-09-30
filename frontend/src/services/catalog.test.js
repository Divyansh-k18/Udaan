import test from 'node:test';
import assert from 'node:assert/strict';
import { examCatalog, examCategories, getTotalQuestions } from '../data/examCatalog.js';
import { buildPaper } from '../data/questionBank.js';
test('every category has demos with valid, nonempty, correctly sized question banks', () => {
  for(const category of examCategories) assert.ok(examCatalog.some(exam=>exam.category===category));
  for(const exam of examCatalog) {
    const paper=buildPaper(exam.id);
    assert.equal(paper.questions.length,getTotalQuestions(exam),exam.id);
    assert.equal(new Set(paper.questions.map(q=>q.id)).size,paper.questions.length);
    for(const question of paper.questions) {
      assert.equal(typeof question.text,'string'); assert.equal(question.options.length,4);
      assert.ok(question.answer>=0 && question.answer<4); assert.ok(question.explanation);
    }
  }
});
