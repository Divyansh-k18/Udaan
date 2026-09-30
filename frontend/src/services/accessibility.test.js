import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css=readFileSync(new URL('../styles/accessibility.css',import.meta.url),'utf8');
function luminance(hex) {
  let h=hex.slice(1); if(h.length===3) h=h.split('').map(x=>x+x).join('');
  return h.match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
}
for(const theme of [':root','html[data-theme="dark"]','html[data-theme="high-contrast"]']) {
  test(`${theme}: text, primary controls, borders and focus contrast`,()=>{
    const block=css.slice(css.indexOf(theme)).split('}')[0];
    const colors=Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]+)/g)].map(m=>[m[1],m[2]]));
    function check(a,b,min) { const x=luminance(colors[a]),y=luminance(colors[b]); const ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05); assert.ok(ratio>=min,`${a}/${b}: ${ratio}`); }
    for(const bg of ['page','surface','surface-soft']) { check('ink',bg,4.5); check('muted',bg,4.5); check('accent',bg,4.5); check('focus',bg,3); check('line',bg,3); }
    check('on-accent','accent',4.5);
  });
}
