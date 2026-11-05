/* ================= v33: 📅 7-day attendance ================= */
// One reward per calendar day (local time). Days do not have to be consecutive: each new day you open the game moves
// you one step along the 7 rewards; after day 7 the cycle starts again. Day 7 gives the attendance-only trail the first
// time (DLY_DUP points instead once you own it). Moving the device clock backwards does not give extra days.
const DLY=[{p:50},{f:40},{p:80},{f:60},{p:120},{f:80},{t:'dly',p:100}],DLY_DUP=250;
function dlyDay(d){d=d||new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/864e5);}   // local calendar day number
function dlyTamper(){return !!(save.clk&&Date.now()<save.clk-300000);}
function dlyCan(){const L=save.login;return !dlyTamper()&&dlyDay()>(L.last|0);}
function dlyNext(){return (save.login.d|0)%7;}               // index of the reward the next claim gives
function dlyGotToday(){return (save.login.last|0)===dlyDay();}
function dlyTxt(i){const r=DLY[i];
  if(r.t){const just=dlyLast&&dlyLast.i===i&&dlyLast.trail;return save.trails.includes(r.t)&&!just?'⭐'+DLY_DUP+'P':'✨ '+TRAILS[r.t].name+' + ⭐'+r.p+'P';}
  if(r.f)return '🐟+'+passGain(r.f);return '⭐'+r.p+'P';}
let dlyLast=null;   // what the last claim in this session gave (for the dialog)
function dlyClaim(){
  if(!dlyCan())return null;
  const L=save.login,i=dlyNext(),r=DLY[i],out={i,pts:0,fish:0,trail:''};
  if(r.t){if(save.trails.includes(r.t))out.pts=DLY_DUP;else{save.trails.push(r.t);out.trail=r.t;out.pts=r.p;}}
  else if(r.f){const a=passAdd(r.f);out.fish=a?a.n:0;}
  else out.pts=r.p;
  save.points+=out.pts;
  L.d=i+1;if(L.d>=7){L.d=0;L.cyc=(L.cyc|0)+1;}L.last=dlyDay();L.tot=(L.tot|0)+1;
  dlyLast=out;persist();return out;
}
function dlyGridHtml(){
  const L=save.login,can=dlyCan(),nx=dlyNext(),got=dlyGotToday();
  const doneN=(!can&&got&&(L.d|0)===0&&(L.cyc|0)>0)?7:(L.d|0);   // claimed in this cycle (all 7 on the day the cycle completes)
  let h='<div class="dl-grid">';
  for(let i=0;i<7;i++){const r=DLY[i],done=i<doneN,today=can&&i===nx,justGot=!!(dlyLast&&dlyLast.i===i&&got);
    h+='<div class="dl-t'+(done?' dl-done':'')+(today?' dl-today':'')+(r.t?' dl-big':'')+(justGot?' dl-pop':'')+'"><small>'+fmtL('{d}일',{d:i+1})+'</small><b>'+(r.t?'✨':r.f?'🐟':'⭐')+'</b><span>'+dlyTxt(i)+'</span>'+(done?'<i>✓</i>':'')+'</div>';}
  return h+'</div>';
}
function dlyBody(){
  const can=dlyCan(),L=save.login;
  let h='<h3>📅 '+__L('7일 출석 보상')+'</h3><div class="dl-sub">'+__L('하루에 한 번 받을 수 있어요 · 날짜가 이어지지 않아도 괜찮아요')+'</div>'+dlyGridHtml();
  if(can)h+='<div class="row"><button class="btn primary" data-dly="claim">🎁 '+fmtL('{d}일차 보상 받기',{d:dlyNext()+1})+'</button></div>';
  else h+='<div class="dl-msg">'+(dlyTamper()?__L('기기 시계가 되돌려져 있어요. 시계가 맞으면 다시 받을 수 있어요'):__L('오늘 출석 완료! 내일 또 와요'))+'</div><div class="row"><button class="btn" data-dly="close">'+__L('닫기')+'</button></div>';
  h+='<div class="dl-foot">'+fmtL('7일차: 출석 전용 트레일 「{n}」 (이미 있으면 ⭐{p}P) · 7일을 다 받으면 1일차부터 다시 시작해요',{n:TRAILS.dly.name,p:DLY_DUP})
    +((L.tot|0)?' · '+fmtL('지금까지 {n}일 출석',{n:L.tot|0}):'')+'</div>';
  return h;
}
function dlyOpen(){
  const d=$('#dlyDlg');if(!d||window.__NOFX)return;
  d.querySelector('.cd-body').innerHTML=dlyBody();d.classList.add('on');
}
function dlyClose(){const d=$('#dlyDlg');if(d)d.classList.remove('on');dlyLast=null;if(G.ui==='sGoals')renderGoals();try{hypeMenuRefresh();}catch(e){}}
function dlyDo(){
  const o=dlyClaim();if(!o)return;SFX.win();vib([30,30,60]);
  hypeToast(o.trail?'✨ '+bondJ(fmtL('트레일 「{n}」을 얻었어요!',{n:TRAILS[o.trail].name})):o.fish?'🐟+'+o.fish:'⭐+'+o.pts+'P');
  const d=$('#dlyDlg');if(d&&d.classList.contains('on'))d.querySelector('.cd-body').innerHTML=dlyBody();
  const pn=$('#ptsN');if(pn)pn.textContent=save.points;
}
// the card on top of 오늘의 목표
function dlyCardHtml(){
  const can=dlyCan(),nx=dlyNext();
  return '<div class="dl-card'+(can?' rdy':'')+'"><b>📅 '+__L('7일 출석')+'</b><span>'+(can?fmtL('{d}일차 보상: {r}',{d:nx+1,r:dlyTxt(nx)}):__L('오늘 출석 완료! 내일 또 와요'))+'</span>'
    +'<button class="btn small'+(can?' primary':'')+'" data-dly="open">'+(can?__L('받기'):__L('보기'))+'</button></div>';
}
// once a day on the home screen (not before the first-run tutorial question, not over another dialog)
let dlyAutoDay=-1;
function dlyAuto(){
  if(window.__NOFX||window.PH_NODAILY||!dlyCan()||dlyAutoDay===dlyDay())return;   // PH_NODAILY: browser tests of other screens
  if(!(save.tut.done||save.tut.asked||save.stats.played>0))return;
  setTimeout(()=>{
    if(G.ui!=='sMenu'||G.view==='game'||!dlyCan()||dlyAutoDay===dlyDay())return;
    if(document.querySelector('.cdlg.on,.efx.on,#tutAsk.on,#vsFx.on'))return;
    dlyAutoDay=dlyDay();dlyOpen();
  },700);
}
function dlyInit(){
  if(!$('#dlyDlg')){const d=document.createElement('div');d.id='dlyDlg';d.className='cdlg';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
    d.innerHTML='<div class="cd-box dl-box"><button class="cd-x" aria-label="'+__L('닫기')+'">✕</button><div class="cd-body"></div></div>';document.body.appendChild(d);
    d.addEventListener('click',e=>{if(e.target===d||e.target.closest('.cd-x')||e.target.closest('[data-dly="close"]')){SFX.ui();dlyClose();}});}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-dly]');if(!b)return;
    if(b.dataset.dly==='claim'){dlyDo();}else if(b.dataset.dly==='open'){SFX.ui();dlyOpen();}});
  document.addEventListener('keydown',e=>{const d=$('#dlyDlg');if(e.key==='Escape'&&d&&d.classList.contains('on')){e.stopPropagation();dlyClose();}},true);
}
