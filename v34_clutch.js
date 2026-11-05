/* ================= v34: 🔥 comeback drama ================= */
// 1) Chase: the last 30 s of regulation while your team trails by 1–2 goals — heartbeat (faster in the last 10 s),
//    a pulsing red edge on the screen, the crowd getting louder, one "따라잡을 시간!" call-out.
// 2) The goal that ties it after being behind (EQUALIZER!) or turns it around (COMEBACK!): a gold banner, confetti,
//    a gold flash, stronger shake and — late in the match or for the go-ahead goal — a short slow motion.
// 3) Winning after trailing at any point: COMEBACK WIN! (was: only when trailing in the last 30 s).
const CLUTCH={win:30,fast:10,maxDef:2};
function clutchReal(){const c=G.cfg;return !!(c&&G.mine&&c.mode!=='demo'&&c.mode!=='practice'&&c.mode!=='free'&&c.mode!=='tutorial'&&c.time&&!G.so&&!G.ps);}
function clutchDef(){return G.mine?G.mine.opp.score-G.mine.score:0;}
function clutchOn(){const d=clutchDef();return clutchReal()&&!G.ot&&G.state==='play'&&G.timeLeft>0&&G.timeLeft<=CLUTCH.win&&d>=1&&d<=CLUTCH.maxDef;}
let chaseEl=null;
function clutchFrame(dt){
  const h=G.hype;if(!h||G.view!=='game')return;
  const on=clutchOn();
  if(!chaseEl)chaseEl=document.getElementById('chaseFx');
  if(on!==!!h.chase){
    h.chase=on;if(chaseEl)chaseEl.classList.toggle('on',on);document.body.classList.toggle('chase',on);
    if(on){h.hbT=0;if(!h.chaseShown){h.chaseShown=true;hypeToast(clutchDef()===1?__L('🔥 따라잡을 시간! 1골 차'):__L('🔥 따라잡을 시간! 2골 차'));}}
  }
  if(!on)return;
  const fast=G.timeLeft<=CLUTCH.fast;if(chaseEl)chaseEl.classList.toggle('fast',fast);
  h.hbT-=dt;if(h.hbT<=0){h.hbT=fast?.5:.78;SFX.heart(fast?1:.8);if(chaseEl){chaseEl.classList.remove('beat');void chaseEl.offsetWidth;chaseEl.classList.add('beat');}}
  G.cheer=Math.max(G.cheer,fast?.75:.55);   // the crowd gets on its feet
}
function clutchClear(){const h=G.hype;if(h)h.chase=false;const e=document.getElementById('chaseFx');if(e)e.className='';document.body.classList.remove('chase');}
// called right after the normal goal banner; returns what it did (for tests)
function clutchGoal(tm,main){
  const h=G.hype;if(!h||!G.mine||tm!==G.mine||!clutchReal()||main==='OT WINNER!')return null;
  const eq=tm.score===tm.opp.score,ahead=tm.score===tm.opp.score+1;
  if(!h.wasBehind||!(eq||ahead))return null;
  if(ahead&&h.cbDone)return null;   // the turn-around is celebrated once; later goals are normal
  const late=G.ot||G.timeLeft<=CLUTCH.win,big=ahead||late,kind=ahead?'COMEBACK!':'EQUALIZER!';
  if(ahead)h.cbDone=true;h.cbGoals=(h.cbGoals||0)+1;
  // banner: the comeback word on top, the rest of the goal's tags below
  const sub=[...document.querySelectorAll('#bannerSub span')].map(e=>e.textContent).filter(x=>x!==kind&&x!=='EQUALIZER!'&&x!=='GO-AHEAD!');
  if(ahead&&!sub.includes('GO-AHEAD!'))sub.unshift('GO-AHEAD!');
  hypeBanner(kind,sub.slice(0,3),4,tm.key);const b=$('#banner');if(b)b.classList.add('cb');
  hypeToast(ahead?__L('🔥 역전! 경기를 뒤집었어요!'):__L('⚖️ 따라잡았어요! 동점!'));
  // feel
  const sk=shakeK();G.cam.shake=Math.max(G.cam.shake,(big?1.1:.8)*Math.max(.35,sk));
  if(big&&!G.net&&!save.set.motion)hypeSlow(.35,big&&ahead?1.1:.8);
  const fl=$('#gflash');if(fl){fl.style.setProperty('--gc','rgba(255,205,70,');fl.style.setProperty('--ga','.42');fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on');}
  document.body.classList.remove('cbhit');void document.body.offsetWidth;document.body.classList.add('cbhit');clearTimeout(clutchGoal.t);clutchGoal.t=setTimeout(()=>document.body.classList.remove('cbhit'),1600);
  const n=big?170:90,gx=tm.dir*W,C=[[1,.85,.25],[1,.45,.6],[.45,.8,1],[.55,1,.65],[1,1,1]];
  for(let i=0;i<n;i++){const c=C[i%5];emit(rnd(-W*.8,W*.8)*.6+gx*.35,rnd(5,9),rnd(-GW*1.6,GW*1.6),rnd(-3,3),rnd(1,6),rnd(-3,3),rnd(1.6,2.8),rnd(.18,.4),c[0],c[1],c[2]);}
  SFX.fanfare();G.cheer=1;vib(ahead?[60,40,60,40,160]:[50,40,120]);
  clutchClear();
  return {kind,big};
}
