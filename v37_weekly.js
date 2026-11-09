/* ================= v37: weekly fixes (2026-11-09) ================= */
// A finished fish pass (all tiers) holds no more fish. The screens stop promising fish that would go nowhere:
// the result row says the pass is complete, daily-goal rewards drop the 🐟 part, and the 7-day attendance fish days
// pay the same number of ⭐ points instead (v33).
function passFull(){passCheck();return passTier()>=PASS.tiers;}   // passCheck: a new season starts a fresh (empty) pass
function goalFishTxt(){return passFull()?'':' · 🐟+'+passGain(PASS.earn.daily);}
// Touch button labels stay on one line: a label wider than its circle (シュート, スペシャル, Special on a small button…)
// gets a smaller font instead of breaking in the middle of the word. Runs after every layout change and once the web fonts are in.
function ctlFitAll(){
  const t=$('#touch');if(!t||!t.classList||typeof document.createRange!=='function')return;
  t.classList.add('meas');
  try{for(const k of CL.keys){const b=$(CL.ids[k]);if(!b||!b.firstChild||!b.getBoundingClientRect)continue;
    const w=b.getBoundingClientRect().width;if(!(w>0))continue;
    const r=document.createRange();r.selectNodeContents(b);const tw=r.getBoundingClientRect().width,room=w*.86;
    if(tw>room){const fs=parseFloat(b.style.fontSize)||parseFloat(getComputedStyle(b).fontSize)||16;b.style.fontSize=Math.max(9,Math.floor(fs*room/tw))+'px';}}}
  finally{t.classList.remove('meas');}
}
