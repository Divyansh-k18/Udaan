import test from 'node:test';
import assert from 'node:assert/strict';
import { questionBank, getQuestions, buildPaper } from '../data/questionBank.js';
import { expandedQuestions } from '../data/expandedQuestions.js';
import { examCatalog } from '../data/examCatalog.js';
import { topicGuides } from '../data/topicGuides.js';

const languages = ['en-IN','hi-IN','mr-IN','gu-IN','bn-IN','ta-IN'];
test('expanded bank has unique IDs, valid options, answers, explanations and guides', () => {
  assert.equal(questionBank.length, 176);
  assert.equal(expandedQuestions.length, 160);
  assert.equal(new Set(questionBank.map(q => q.id)).size, questionBank.length);
  const uniqueItems = new Set();
  const topics = new Map();
  for (const q of questionBank) {
    const options = q.options['en-IN'];
    assert.equal(options.length,4,q.id);
    assert.equal(new Set(options).size,4,`${q.id}: duplicate options`);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4,q.id);
    assert.ok(q.text['en-IN'].trim() && q.spoken['en-IN'].trim() && q.explanation['en-IN'].trim(),q.id);
    const signature = JSON.stringify([q.text['en-IN'], [...options].sort()]);
    assert.ok(!uniqueItems.has(signature),`${q.id}: repeated question`);
    uniqueItems.add(signature);
    const key = `${q.subject}/${q.topic}`;
    topics.set(key,(topics.get(key)||0)+1);
    assert.ok(topicGuides[key],`Missing guide for ${key}`);
    for (const exam of q.exams) assert.ok(examCatalog.some(item=>item.id===exam));
  }
  assert.equal(topics.size,32);
  for (const [topic,count] of topics) assert.ok(count>=5,`${topic} has too few questions`);
});
test('worked mathematics answer keys match independently calculated results', () => {
  const expected = {
    Percentage: [36,70,120,72,120], Average: [18,27.5,16,48,24], Ratio: [40,60,80,150,140],
    'Simple Interest': [300,240,240,720,500], 'Profit and Loss': ['25%','20%','25%','30%','10%'],
    'Speed and Distance': ['135 km','240 km','70 km','360 km','240 km'],
    'Time and Work': ['4 days','6 days','6 days','8 days','10 days'], Algebra: [7,6,9,4,8],
  };
  for (const [topic,answers] of Object.entries(expected)) {
    const actual=expandedQuestions.filter(q=>q.subject==='Mathematics' && q.topic===topic).map(q=>q.options['en-IN'][q.answer]);
    assert.deepEqual(actual,answers.map(String),topic);
  }
});
test('each exam builds a full unique paper in all supported languages', () => {
  for (const exam of examCatalog) {
    assert.equal(exam.totalMinutes,exam.sections.reduce((sum,s)=>sum+s.minutes,0));
    for (const language of languages) {
      for (let attempt=0;attempt<5;attempt++) {
        const paper=buildPaper(exam.id,language);
        assert.equal(paper.warning,null);
        assert.equal(paper.totalReturned,exam.id==='ssc-cgl-mini'?40:30);
        assert.equal(paper.totalReturned,paper.totalRequested);
        assert.equal(new Set(paper.questions.map(q=>q.id)).size,paper.totalReturned);
        for (const section of paper.sections) {
          assert.equal(section.questions.length,10);
          assert.ok(section.questions.every(q=>q.subject===section.subject));
        }
      }
    }
  }
});
test('topic practice returns all questions without artificial shortage warnings', () => {
  for (const guide of Object.values(topicGuides)) {
    const result=getQuestions({subject:guide.subject,topic:guide.topic,count:null});
    assert.equal(result.warning,null);
    assert.ok(result.questions.length>=5);
  }
});
test('original translations remain available and new English fallback identifies its language', () => {
  for (const language of languages) {
    const result=getQuestions({language});
    assert.equal(result.questions.length,176);
    for (const q of result.questions) {
      assert.equal(typeof q.text,'string');
      assert.ok(Array.isArray(q.options));
      assert.equal(typeof q.explanation,'string');
      if (q.id.startsWith('expanded-')) assert.equal(q.language,'en-IN');
      else assert.equal(q.language,language);
    }
  }
});
