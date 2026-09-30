const baseURL=process.env.UDAAN_TEST_URL || "http://127.0.0.1:5182";
const artifactDir=process.env.UDAAN_TEST_OUTPUT || require("node:os").tmpdir();
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const context=await browser.newContext();const page=await context.newPage(); const errors=[];const tested=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>{
   localStorage.setItem('udaan_accessibility_preferences',JSON.stringify({voiceMode:'udaan',voiceCommands:true}));
   window.__spoken=[];window.__recognizers=[];window.__active=0;window.__maxActive=0;
   window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
   Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return [];},resume(){},speak(u){window.__spoken.push(u.text);u.onstart?.();u.onend?.();}}});
   window.SpeechRecognition=class {
     constructor(){window.__recognizers.push(this);}
     start(){window.__active++;window.__maxActive=Math.max(window.__active,window.__maxActive);this.onstart?.();}
     abort(){if(!this.aborted){this.aborted=true;window.__active--;}}
   };
 });
 async function check(name,fn){await fn();tested.push(name);console.log('PASS',name);}
 async function command(text,{duplicate=false}={}){
   await page.getByRole('button',{name:'Listen for command',exact:true}).click();
   await page.evaluate(({text,duplicate})=>{const r=window.__recognizers.at(-1);const callback=r.onresult;r.onspeechend?.();const e={resultIndex:0,results:[[{transcript:text,confidence:.97}]]};callback(e);if(duplicate)callback(e);},{text,duplicate});
   await page.waitForTimeout(160);
 }
 const state=()=>page.locator('.mock-current-status').first();
 try{
 await page.goto(baseURL+'/exams');
 await check('category → SSC demo → Mock → section → Start',async()=>{
  await page.getByRole('button',{name:'Government Exams',exact:true}).click();
  await page.getByRole('button',{name:/SSC style demo/}).click();
  await page.getByRole('button',{name:/^Mock Test/}).click();
  await page.getByRole('button',{name:'General Intelligence',exact:true}).click();
  await command('Start'); await page.getByRole('heading',{name:'Question 1 of 12',exact:true}).waitFor();
 });
 await check('Option B selected without scoring or locking',async()=>{await command('Option B');assert.match(await state().innerText(),/Selected: Option B/);assert.match(await page.locator('.mock-current-status').last().innerText(),/Answered: 0/);});
 await check('Lock answer and prevent replacement by accidental selection',async()=>{await command('Lock answer');assert.match(await state().innerText(),/Locked: Option B/);await command('Option A');assert.match(await state().innerText(),/Locked: Option B/);});
 await check('Next question executes once even for duplicate result event',async()=>{await command('Next question',{duplicate:true});assert.equal(await page.locator('.question-header h2').innerText(),'Question 2 of 12');});
 await check('Previous question preserves locked answer',async()=>{await command('Previous question');assert.match(await state().innerText(),/Locked: Option B/);});
 await check('Read options only; Repeat current question and options',async()=>{await command('Read options');assert.match(await page.evaluate(()=>window.__spoken.at(-1)),/^Option A/);await command('Repeat question');assert.match(await page.evaluate(()=>window.__spoken.at(-1)),/^Question 1 of 12/);});
 await check('Mark question, Progress, Time left, Section status, Bookmark',async()=>{await command('Mark question');await command('Progress');assert.match(await page.locator('.exam-voice-panel').innerText(),/1 answered. 11 unanswered. 1 marked/);await command('Time left');assert.match(await page.locator('.exam-voice-panel').innerText(),/remaining/);await command('Section status');assert.match(await page.locator('.exam-voice-panel').innerText(),/General Intelligence. Question 1 of 3. 1 answered. 2 remaining/);await command('Bookmark');assert.match(await page.getByRole('navigation',{name:'Question navigator'}).innerText(),/bookmarked/);});
 await check('Unknown command cannot select an option',async()=>{await command('a bird is flying over the next question');assert.match(await page.locator('.exam-voice-panel').innerText(),/Not understood/);assert.match(await state().innerText(),/Locked: Option B/);});
 await check('Submit opens confirmation; No cancels; underlying commands blocked',async()=>{await command('Submit');assert.ok(await page.getByRole('dialog').isVisible());await command('Next question');assert.equal(await page.locator('.question-header h2').innerText(),'Question 1 of 12');await command('No');assert.equal(await page.getByRole('dialog').count(),0);});
 await check('Clear answer, keyboard selection, button lock share handlers',async()=>{await command('Clear answer');await page.locator('.question-header h2').focus();await page.keyboard.press('Alt+2');assert.match(await state().innerText(),/Selected: Option B/);await page.getByRole('button',{name:'Lock Answer',exact:true}).click();assert.match(await state().innerText(),/Locked: Option B/);});
 await check('Go to question; shortcuts ignored in input',async()=>{await command('Go to question');await page.getByLabel('Question number',{exact:true}).fill('3');await page.keyboard.press('Alt+n');assert.equal(await page.locator('.question-header h2').innerText(),'Question 1 of 12');await page.getByRole('button',{name:'Go',exact:true}).click();assert.equal(await page.locator('.question-header h2').innerText(),'Question 3 of 12');});
 await check('Rapid mic activation uses one recognizer; errors recover',async()=>{
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent==='Listen for command');b.click();b.click();b.click();});
  assert.equal(await page.evaluate(()=>window.__active),1);assert.equal(await page.evaluate(()=>window.__maxActive),1);
  await page.evaluate(()=>window.__recognizers.at(-1).onerror({error:'not-allowed'}));
  await page.getByText('Voice: Microphone blocked',{exact:true}).waitFor();
  await page.locator('.question-header h2').focus();await page.keyboard.press('Alt+1');await page.getByRole('button',{name:'Lock Answer',exact:true}).click();
  for(const error of ['no-speech','network']) {await page.getByRole('button',{name:'Listen for command',exact:true}).click();await page.evaluate(error=>window.__recognizers.at(-1).onerror({error}),error);await page.waitForTimeout(50);}
 });
 await check('Refresh preserves locked answers and elapsed timer',async()=>{const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('udaan_mock_session_v1:ssc-cgl-mini:en-IN')).remainingSeconds);await page.reload();await page.locator('.question-header h2').waitFor();assert.match(await state().innerText(),/Locked: Option A/);const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('udaan_mock_session_v1:ssc-cgl-mini:en-IN')).remainingSeconds);assert.ok(after<=before);});
 await check('Submit then Yes submits exactly once',async()=>{await command('Submit');await command('Yes',{duplicate:true});await page.waitForURL('**/result');const result=await page.evaluate(()=>JSON.parse(localStorage.getItem('udaan_mock_last_result_v1')));assert.equal(result.attempted,2);});
 await check('Prepare uses selected → lock → textual result → explanation',async()=>{
  await page.goto(baseURL+'/prepare/class-9-demo');await page.getByLabel('Choose subject',{exact:true}).selectOption('Mathematics');await page.getByLabel('Choose topic',{exact:true}).selectOption('Linear equations');await page.getByRole('button',{name:'Start Practice',exact:true}).click();
  await command('Option A');assert.equal(await page.locator('.prepare-feedback').count(),0);await command('Lock answer');assert.match(await page.locator('.prepare-feedback').innerText(),/Incorrect/);await command('Explain again');await command('Retry wrong');assert.equal(await page.locator('.prepare-feedback').count(),0);await command('Option B');await command('Lock answer');assert.match(await page.locator('.prepare-feedback').innerText(),/Correct|Incorrect/);await command('Bookmark');await command('Read options');await command('Repeat question');await command('Progress');await command('Skip');
 });
 await check('Route change cancels active microphone and no welcome on exam routes',async()=>{await page.getByRole('button',{name:'Listen for command',exact:true}).click();await page.getByRole('link',{name:'Exams',exact:true}).click();assert.equal(await page.evaluate(()=>window.__active),0);assert.ok(!(await page.evaluate(()=>window.__spoken)).some(t=>t.startsWith('Welcome to Udaan')));});
 await page.screenshot({path:artifactDir+'/categories.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('RESULT',JSON.stringify({tested,errors}));fs.writeFileSync(artifactDir+'/browser-results.json',JSON.stringify({tested,errors},null,2));
 }catch(e){console.log('ERRORS',errors);console.log((await page.locator('body').innerText()).slice(0,13000));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
