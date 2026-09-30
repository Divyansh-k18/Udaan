const baseURL=process.env.UDAAN_TEST_URL || "http://127.0.0.1:5182";
const artifactDir=process.env.UDAAN_TEST_OUTPUT || require("node:os").tmpdir();
const { chromium }=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   localStorage.setItem('udaan_accessibility_preferences',JSON.stringify({voiceMode:'screen-reader',voiceCommands:true}));
   window.__spoken=[];Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return [];},resume(){},speak(u){window.__spoken.push(u.text);}}});
   window.__recognizers=[];window.SpeechRecognition=class {constructor(){window.__recognizers.push(this);} start(){this.onstart?.();} abort(){this.aborted=true;}};
  });
  await page.goto(baseURL+'/exam/ssc-cgl-mini');await page.getByRole('button',{name:'Start Mock Test',exact:true}).click();
  await page.getByRole('heading',{name:'Question 1 of 12',exact:true}).waitFor();await page.waitForTimeout(250);
  assert.deepEqual(await page.evaluate(()=>window.__spoken),[]);
  assert.match(await page.evaluate(()=>document.activeElement.textContent),/Question 1 of 12/);
  // Global microphone must also execute exactly once and stop on route change.
  await page.getByRole('button',{name:'Start voice command',exact:true}).click();
  await page.evaluate(()=>window.__recognizers.at(-1).onresult({resultIndex:0,results:[[{transcript:'Next question'}]]}));
  await page.getByRole('heading',{name:'Question 2 of 12',exact:true}).waitFor();
  await page.getByRole('button',{name:'Start voice command',exact:true}).click();
  await page.getByRole('link',{name:'Exams',exact:true}).click(); await page.waitForURL('**/exams'); await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>window.__recognizers.at(-1).aborted),true);
  console.log('PASS screen-reader mode: no synthesis; question focus; global microphone single execution and route cleanup');
  await page.goto(baseURL+'/exam/ssc-cgl-mini');await page.locator('.question-header h2').waitFor();
  await page.locator('.question-header h2').focus();await page.keyboard.press('Alt+s');
  await page.getByRole('dialog').waitFor();await page.keyboard.press('Alt+v');
  await page.evaluate(()=>window.__recognizers.at(-1).onresult({resultIndex:0,results:[[{transcript:'No'}]]}));
  await page.waitForTimeout(100);assert.equal(await page.getByRole('dialog').count(),0);
  console.log('PASS Alt+V inside submit dialog supports No');
  await page.screenshot({path:artifactDir+'/mock-screen.png',fullPage:true});
  const unsupported=await browser.newPage();
  await unsupported.addInitScript(()=>{window.SpeechRecognition=undefined;window.webkitSpeechRecognition=undefined;localStorage.setItem('udaan_accessibility_preferences',JSON.stringify({voiceMode:'silent'}));});
  await unsupported.goto(baseURL+'/exam/ssc-cgl-mini');
  assert.ok(await unsupported.getByText('Voice: Unavailable',{exact:true}).isVisible());
  await unsupported.getByRole('button',{name:'Start Mock Test',exact:true}).click();
  await unsupported.locator('.question-header h2').waitFor();await unsupported.locator('.question-header h2').focus();await unsupported.keyboard.press('Alt+2');await unsupported.getByRole('button',{name:'Lock Answer',exact:true}).click();await unsupported.getByRole('button',{name:'Submit Mock Test',exact:true}).click();await unsupported.getByRole('button',{name:'Yes, Submit',exact:true}).click();await unsupported.waitForURL('**/result');
  console.log('PASS unsupported recognition: complete mock with keyboard/buttons');
  const native=await browser.newPage();
  await native.addInitScript(()=>localStorage.setItem('udaan_accessibility_preferences',JSON.stringify({voiceMode:'silent'})));
  await native.goto(baseURL+'/exam/ssc-cgl-mini');
  const supported=await native.evaluate(()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition));
  if(supported){await native.getByRole('button',{name:'Listen for command',exact:true}).click();await native.waitForFunction(()=>!document.querySelector('.exam-voice-panel strong')?.textContent.includes('Listening'),null,{timeout:18000});}
  console.log('NATIVE_BROWSER',await native.locator('.exam-voice-panel').innerText());
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
