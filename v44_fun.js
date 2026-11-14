/* ================= v44: 🏅 coach level, win streaks, first win of the day (2026-11-14) ================= */
// The owner: "make it something you keep wanting to play". The game already pays points, combos, mastery levels,
// achievements, daily goals, attendance and the fish pass; what it lacked was one thing that grows with EVERY match and a
// reason to win again right away. So:
//  · 감독 레벨: every finished match gives XP (CO.xp), levels pay points (coachReward), every 5th level pays triple;
//    the bar on the home screen and on the result screen always shows the next reward
//  · 연승 보너스: the 2nd win in a row +5 P, the 3rd +10 … up to +25 (a loss resets it, a draw keeps it)
//  · 오늘 첫 승: the first win of each day +50 P and +20 XP
//  · a level-up moment after the result screen (fanfare, vibration; respects 번쩍임 끔 / 움직임 줄이기)
// Points only — nothing here costs or sells anything, and nothing is random.
var CO={need0:80,needK:20,max:99,xp:{win:40,draw:25,loss:15,goal:5,goals:5,fw:20},streakK:5,streakMax:25,fwPts:50,rew0:20,rewK:10,big:5,bigX:3};
function coach(){const c=save.coach||(save.coach={});if(!(c.lv>=1))c.lv=1;if(!(c.xp>=0))c.xp=0;if(!(c.streak>=0))c.streak=0;if(!(c.best>=0))c.best=0;if(typeof c.fw!=='string')c.fw='';return c;}
function coachNeed(lv){return CO.need0+CO.needK*lv;}
function coachReward(lv){const r=CO.rew0+CO.rewK*lv;return lv%CO.big===0?r*CO.bigX:r;}
function coachStreakBonus(n){return n>=2?Math.min(CO.streakMax,CO.streakK*(n-1)):0;}
function coachFwReady(){return coach().fw!==todayKey();}
function coachCounts(cfg){return !!cfg&&!['demo','practice','free','tut'].includes(cfg.mode);}
// after a match (called once, from showResultScreen's payout): XP, levels, streak, first win — returns what happened
function coachMatch(R,cfg,win,draw,ms){
  if(!coachCounts(cfg))return null;
  const c=coach(),mult={easy:.7,normal:1,hard:1.3}[cfg.diff||'normal']||1,from={lv:c.lv,xp:c.xp};
  let xp=Math.round(((win?CO.xp.win:draw?CO.xp.draw:CO.xp.loss)+CO.xp.goal*Math.min(ms|0,CO.xp.goals))*mult),pts=0,fw=0,sb=0;
  if(win&&coachFwReady()){fw=CO.fwPts;c.fw=todayKey();xp+=CO.xp.fw;}
  if(cfg.mode!=='friend'){if(win){c.streak++;c.best=Math.max(c.best,c.streak);sb=coachStreakBonus(c.streak);}else if(!draw)c.streak=0;}
  c.xp+=xp;const ups=[];
  while(c.lv<CO.max&&c.xp>=coachNeed(c.lv)){c.xp-=coachNeed(c.lv);c.lv++;ups.push({lv:c.lv,pts:coachReward(c.lv)});}
  if(c.lv>=CO.max)c.xp=Math.min(c.xp,coachNeed(c.lv));
  const up=ups.reduce((s,u)=>s+u.pts,0);pts=fw+sb+up;
  save.points+=pts;if(R)R.total=(R.total||0)+pts;
  return {xp,from,to:{lv:c.lv,xp:c.xp},ups,up,fw,sb,streak:c.streak,pts};
}
function coachBarIn(lv,xp){return lv>=CO.max?100:Math.max(0,Math.min(100,xp/coachNeed(lv)*100));}
// rows inside the point table of the result screen (each = what coachMatch paid)
function coachRowsHtml(R){const o=R&&R.co;if(!o)return '';let h='';
  if(o.sb>0)h+='<div class="rs-row"><span>'+fmtL(__L('🔥 {n}연승 보너스'),{n:o.streak})+'</span><span><b class="cu" data-to="'+o.sb+'">0</b> P</span></div>';
  if(o.fw>0)h+='<div class="rs-row"><span>'+__L('🎁 오늘 첫 승리')+'</span><span><b class="cu" data-to="'+o.fw+'">0</b> P</span></div>';
  if(o.up>0)h+='<div class="rs-row"><span>'+fmtL(__L('🏅 감독 레벨 업 보상 (Lv.{lv})'),{lv:o.to.lv})+'</span><span><b class="cu" data-to="'+o.up+'">0</b> P</span></div>';
  return h;}
// the coach bar under the point table: XP gained, the bar filling, the next reward
function coachBarHtml(R){const o=R&&R.co;if(!o)return '';const lv=o.to.lv,a=o.ups.length?0:coachBarIn(o.from.lv,o.from.xp),b=coachBarIn(lv,o.to.xp);
  return '<div class="co-res'+(o.ups.length?' up':'')+'"><div class="co-top"><b>'+fmtL(__L('🏅 감독 Lv.{lv}'),{lv})+'</b><span class="co-xp">+'+o.xp+' XP</span></div>'
    +'<div class="co-bar"><i style="width:'+a.toFixed(1)+'%" data-to="'+b.toFixed(1)+'"></i></div>'
    +'<div class="co-next">'+(lv>=CO.max?__L('최고 레벨!'):fmtL(__L('다음 레벨까지 {xp} XP · 보상 {pts} P'),{xp:coachNeed(lv)-o.to.xp,pts:coachReward(lv+1)})+(coachNeed(lv)-o.to.xp<=CO.xp.win?'<b class="co-one">'+__L('한 번 더 이기면 레벨 업!')+'</b>':''))+'</div></div>';}
function coachResultAnim(R){
  const o=R&&R.co;if(!o)return;
  setTimeout(()=>{const i=document.querySelector('.co-res .co-bar i');if(i)i.style.width=i.dataset.to+'%';},450);
  if(o.ups.length&&!R.coShown){R.coShown=true;setTimeout(()=>coachLevelUp(o),1300);}
}
// the level-up moment
function coachLevelUp(o){
  let el=$('#coUp');if(!el){el=document.createElement('div');el.id='coUp';document.body.appendChild(el);el.addEventListener('click',()=>el.classList.remove('on'));}
  const last=o.ups[o.ups.length-1],big=o.ups.some(u=>u.lv%CO.big===0);
  el.innerHTML='<div class="co-card'+(big?' big':'')+'"><div class="co-rays"></div><div class="co-t">LEVEL UP!</div><div class="co-lv">'+fmtL(__L('감독 Lv.{lv}'),{lv:last.lv})+'</div>'
    +'<div class="co-p">+'+o.up+' P</div>'+(big?'<div class="co-b">'+__L('5레벨 보너스 ×3')+'</div>':'')+'<div class="co-tap">'+__L('탭하여 닫기')+'</div></div>';
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
  try{SFX.fanfare();vib([40,40,40,40,180]);}catch(e){}
  clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),3200);
}
// the home bar (under the club chip)
function coachRow(){
  const home=$('#sMenu');if(!home)return;let el=$('#coachBar');
  if(!el){el=document.createElement('div');el.id='coachBar';el.setAttribute('role','status');const mr=$('#menuRank');(mr&&mr.parentNode||home).insertBefore(el,mr?mr.nextSibling:home.firstChild);}
  const c=coach(),p=coachBarIn(c.lv,c.xp);
  const L=(l,sh)=>'<span class="L">'+l+'</span><span class="S">'+sh+'</span>';
  el.innerHTML='<span class="cb-lv">'+L(fmtL(__L('🏅 감독 Lv.{lv}'),{lv:c.lv}),'🏅 Lv.'+c.lv)+'</span><span class="cb-bar"><i style="width:'+p.toFixed(1)+'%"></i></span>'
    +'<span class="cb-n L">'+(c.lv>=CO.max?__L('최고 레벨!'):fmtL(__L('다음 보상 {pts} P'),{pts:coachReward(c.lv+1)}))+'</span>'
    +(c.streak>=1?'<span class="cb-st">'+L(fmtL(__L('🔥 {n}연승'),{n:c.streak}),'🔥'+c.streak)+'</span>':'')
    +(coachFwReady()?'<span class="cb-fw">'+L(fmtL(__L('🎁 오늘 첫 승 +{p}P'),{p:CO.fwPts}),'🎁+'+CO.fwPts+'P')+'</span>':'');
  coachPlace();
}
// under the club chip; where that would touch the logo (landscape phones, short PC windows) the bar turns compact and
// sits on the chip's row between the chip and the points (or, if even that does not fit, compact under the chip)
function coachPlace(){const el=$('#coachBar'),mr=$('#menuRank');if(!el)return;const r=mr&&mr.getBoundingClientRect();
  const lg=$('#sMenu .logo'),hit=()=>{if(!lg)return false;const a=el.getBoundingClientRect(),b=lg.getBoundingClientRect();return b.width>0&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;};
  const below=()=>{el.style.left='';el.style.top=(r&&r.height?Math.round(r.bottom+6):52)+'px';};
  el.classList.remove('cmp');below();if(!hit())return;
  el.classList.add('cmp');
  if(r&&r.width){const pt=$('#pts'),pb=pt?pt.getBoundingClientRect():null,pr=pb&&pb.width>0?pb:null,room=(pr?pr.left:innerWidth)-r.right-16;
    if(el.offsetWidth<=room){el.style.top=Math.round(r.top+(r.height-el.offsetHeight)/2)+'px';el.style.left=Math.round(r.right+8)+'px';return;}
    if(pr){el.style.top=Math.round(pr.bottom+6)+'px';el.style.left=Math.round(pr.right-el.offsetWidth)+'px';if(!hit())return;}}   // under the points, right-aligned
  below();}
