/* ================= v24: Sardine Pass (정어리 패스) — a new name every season ================= */
// 경기와 오늘의 목표로 정어리(🐟)를 모아 30단계를 올라가요. 무료 칸은 누구나, 골드 칸은 경기로 번 포인트로 열어요 (현금 결제 없음).
// Seasons follow the league season (SEASON: 28 days). Every number on screen comes from PASS.
const PASS={
  tiers:30,per:100,cost:900,dup:150,
  earn:{win:24,draw:16,loss:10,goal:3,goalMax:5,first:30,daily:40},
  themes:[
    {n:'오로라',e:'🌌',c:['#3de8b0','#6a4cff'],t:'ps1'},
    {n:'빙하 탐험',e:'🧊',c:['#7fe3ff','#2b6bff'],t:'ps2'},
    {n:'크릴 축제',e:'🦐',c:['#ff9a7a','#e8344f'],t:'ps3'},
    {n:'남극 해적',e:'🏴‍☠️',c:['#ffcf6b','#9a5a16'],t:'ps4'},
    {n:'별빛 우주',e:'🚀',c:['#b18cff','#2a1f6b'],t:'ps5'},
    {n:'펭귄 왕국',e:'👑',c:['#ffd34d','#c41f3a'],t:'ps6'},
    {n:'눈보라 레이스',e:'🌨️',c:['#e8f6ff','#5f7fae'],t:'ps7'},
    {n:'심해 보물',e:'🐙',c:['#3da8ff','#0b2a63'],t:'ps8'}
  ],
  // p: points · c: a penguin card of that rarity (0 기본 … 4 전설) · t: the season's exclusive skating trail
  free:[{p:40},{p:40},{c:0},{p:50},{c:1},{p:50},{p:60},{c:0},{p:60},{c:2},{p:60},{p:70},{c:1},{p:70},{c:2},{p:70},{p:80},{c:1},{p:80},{c:3},{p:80},{p:90},{c:2},{p:90},{c:3},{p:90},{p:100},{c:2},{p:100},{c:3}],
  gold:[{t:1},{p:80},{c:1},{p:90},{c:2},{p:100},{c:1},{p:100},{c:2},{c:3},{p:110},{c:2},{p:110},{c:2},{c:3},{p:120},{c:2},{p:120},{c:3},{c:4},{p:130},{c:2},{p:130},{c:3},{c:3},{p:140},{c:3},{p:150},{c:3},{c:4}]
};
// called from loadSave() (hoisted, runs before this module's constants exist): literals only
function passLoad(S){
  const P=save.pass,n=(v,max)=>Number.isFinite(+v)?Math.max(0,Math.min(max,Math.floor(+v))):0;
  P.s=n(S.s,99999);P.xp=n(S.xp,3000);P.gold=S.gold===true;P.cf=n(S.cf,0x3fffffff)&0x3fffffff;P.cg=n(S.cg,0x3fffffff)&0x3fffffff;P.fw=n(S.fw,9999999);
  P.last=S.last&&typeof S.last==='object'?{s:n(S.last.s,99999),tier:n(S.last.tier,30),p:n(S.last.p,999999),c:n(S.last.c,99),seen:S.last.seen===true}:null;
}
function passTheme(n){const L=PASS.themes;return L[((Math.max(1,n||1)-1)%L.length+L.length)%L.length];}
function passName(n){const T=passTheme(n);return T.e+' '+fmtL('{n} 정어리 패스',{n:T.n});}
function passTier(){return Math.min(PASS.tiers,Math.floor(save.pass.xp/PASS.per));}
function passBit(i){return 1<<i;}
function passCan(track,i){const P=save.pass;if(i<0||i>=PASS.tiers||i>=passTier())return false;if(track==='g'&&!P.gold)return false;return !((track==='g'?P.cg:P.cf)&passBit(i));}
function passCount(){let n=0;for(let i=0;i<PASS.tiers;i++){if(passCan('f',i))n++;if(passCan('g',i))n++;}return n;}
function passGrant(R,quiet){   // → {txt, card}
  const P=save.pass;
  if(R.p){save.points+=R.p;return{txt:'⭐'+R.p+'P'};}
  if(R.c!=null){const c=grantTier(R.c);return{txt:fmtL('{g} 카드 · {n}',{g:GRADES[c.g].n,n:TYPES[c.k].name})+(c.isNew?' 🎉':''),card:c};}
  if(R.t){const k=passTheme(P.s).t;if(save.trails.includes(k)){save.points+=PASS.dup;return{txt:fmtL('트레일은 이미 있어서 ⭐{p}P',{p:PASS.dup})};}save.trails.push(k);return{txt:fmtL('시즌 트레일 「{n}」',{n:TRAILS[k].name})};}
  return{txt:''};
}
function passClaim(track,i,quiet,settling){
  if(!settling)passCheck();if(!passCan(track,i))return null;const P=save.pass,R=(track==='g'?PASS.gold:PASS.free)[i];
  if(track==='g')P.cg|=passBit(i);else P.cf|=passBit(i);
  const r=passGrant(R);persist();
  if(!quiet){SFX.win();vib([20,30,40]);hypeToast(fmtL('🐟 {t}단계 · {r}',{t:i+1,r:r.txt}));$('#ptsN').textContent=save.points;}
  return r;
}
function passClaimAll(){let n=0,last=null;for(let i=0;i<PASS.tiers;i++)for(const t of['f','g'])if(passCan(t,i)){last=passClaim(t,i,true);n++;}
  if(n){SFX.win();vib([30,30,60]);hypeToast(fmtL('🐟 보상 {n}개를 받았어요',{n}));$('#ptsN').textContent=save.points;}return n;}
// season change: everything reached but not taken is handed out, then the new pass (new name) starts at 0
function passCheck(){
  const P=save.pass,now=seasonNow();if(P.s===now)return false;
  if(P.s>0&&P.s<now){let p0=save.points,c=0;
    for(let i=0;i<PASS.tiers;i++)for(const t of['f','g'])if(passCan(t,i)){const r=passClaim(t,i,true,true);if(r&&r.card)c++;}
    P.last={s:P.s,tier:passTier(),p:save.points-p0,c,seen:false};}
  P.s=now;P.xp=0;P.gold=false;P.cf=0;P.cg=0;persist();return true;
}
function passAdd(n){
  if(!(n>0))return null;passCheck();const P=save.pass,t0=passTier();P.xp=Math.min(PASS.tiers*PASS.per,P.xp+n);const t1=passTier();persist();
  return{n,t0,t1};
}
function passMatch(win,draw,ms){
  const E=PASS.earn,P=save.pass,base=win?E.win:draw?E.draw:E.loss,goals=Math.min(ms,E.goalMax)*E.goal,dn=dayNum();
  let first=0;if(win&&P.fw!==dn){first=E.first;P.fw=dn;}
  const r=passAdd(base+goals+first)||{t0:passTier(),t1:passTier()};
  return{base,goals,ms:Math.min(ms,E.goalMax),first,total:base+goals+first,t0:r.t0,t1:r.t1,win,draw};
}
function passRowHtml(R){
  const p=R&&R.pass;if(!p)return '';
  const parts=[fmtL(p.win?'승리 {n}':p.draw?'무승부 {n}':'패배 {n}',{n:p.base})];if(p.goals)parts.push(fmtL('골 {n}×{g}',{n:p.ms,g:PASS.earn.goal}));if(p.first)parts.push(fmtL('오늘 첫 승리 {f}',{f:p.first}));
  return '<div class="rs-pass"><span>🐟 '+fmtL('정어리 +{n}',{n:p.total})+' <small>('+parts.join(' · ')+')</small></span>'+(p.t1>p.t0?'<span class="rtag">'+fmtL('정어리 패스 {t}단계!',{t:p.t1})+'</span>':'<small>'+fmtL('정어리 패스 {t}단계',{t:p.t1})+'</small>')+'</div>';
}
function rulesRowHtml(){
  const R=G.rl;if(!R||!G.mine||rulesMode()==='off')return '';const a=R.st[G.mine.key],b=R.st[G.mine.opp.key];
  if(!a.pen&&!b.pen&&!R.calls.length)return '<div class="rs-stats">'+'🧑‍⚖️ 반칙 없는 깨끗한 경기!'+'</div>';
  return '<div class="rs-stats">🧑‍⚖️ '+fmtL('반칙 우리 {a} · 상대 {b}',{a:a.pen,b:b.pen})+(a.ppg?' · '+fmtL('파워플레이 골 {n}',{n:a.ppg}):'')+(a.shg?' · '+fmtL('숏핸디드 골 {n}',{n:a.shg}):'')+(a.psg?' · '+fmtL('페널티 샷 골 {n}',{n:a.psg}):'')+'</div>';
}
function passRewTxt(R,track){
  if(R.p)return '<b>⭐'+R.p+'</b><small>P</small>';
  if(R.c!=null)return '<b class="rar-t g'+R.c+'">'+GRADES[R.c].n+'</b><small>'+'카드'+'</small>';
  if(R.t){const k=passTheme(save.pass.s).t;return '<b>✨</b><small>'+TRAILS[k].name+'</small>';}
  return '';
}
function passBuy(btn){
  passCheck();const P=save.pass;if(P.gold)return false;
  if(save.points<PASS.cost){lackMsg(PASS.cost);return false;}
  if(btn&&!btn.dataset.sure){btn.dataset.sure='1';btn.textContent=fmtL('한 번 더 누르면 {p}P를 써요',{p:PASS.cost});setTimeout(()=>{if(btn.isConnected){delete btn.dataset.sure;renderPass();}},3200);return false;}
  save.points-=PASS.cost;P.gold=true;persist();SFX.champ();vib([40,40,90]);hypeToast('👑 '+'골드 패스를 열었어요!');$('#ptsN').textContent=save.points;renderPass();return true;
}
function renderPass(){
  const el=$('#psBody'),hd=$('#psHead');if(!el||!hd)return;passCheck();
  const P=save.pass,T=passTheme(P.s),tier=passTier(),cur=P.xp-tier*PASS.per,left=seasonLeft(P.s),n=passCount(),E=PASS.earn;
  hd.style.setProperty('--p1',T.c[0]);hd.style.setProperty('--p2',T.c[1]);
  hd.innerHTML='<i class="ps-e">'+T.e+'</i><div class="ps-h"><b>'+fmtL('{n} 정어리 패스',{n:T.n})+'</b><small>'+fmtL('시즌 {s} · {d}까지 · {l}일 남음',{s:P.s,d:seasonDate(P.s),l:left})+'</small></div>';
  let h='';
  if(P.last&&!P.last.seen){h+='<div class="ps-last">'+fmtL('지난 시즌 {name}: {t}단계까지 받지 않은 보상을 자동으로 받았어요 (⭐{p}P · 카드 {c}장)',{name:passName(P.last.s),t:P.last.tier,p:P.last.p,c:P.last.c})+'</div>';P.last.seen=true;persist();}
  h+='<div class="ps-prog"><div class="ps-tier"><small>'+'단계'+'</small><b>'+tier+'</b><small>/ '+PASS.tiers+'</small></div><div class="ps-bar">'
    +(tier>=PASS.tiers?'<div class="ps-bt">'+'모든 단계를 달성했어요!'+'</div><div class="pbar"><i style="width:100%"></i></div>':'<div class="ps-bt">'+fmtL('다음 단계까지 🐟 {c} / {p}',{c:cur,p:PASS.per})+'</div><div class="pbar"><i style="width:'+(cur/PASS.per*100).toFixed(1)+'%"></i></div>')
    +'<small>'+fmtL('이번 시즌 모은 정어리 {x}',{x:P.xp})+'</small></div></div>';
  h+='<div class="ps-acts">'+(P.gold?'<span class="ps-gold on">👑 '+'골드 패스 사용 중'+'</span>':'<button class="btn primary ps-gold" id="psBuy">👑 '+fmtL('골드 패스 열기 · {p}P',{p:PASS.cost})+'</button>')
    +(n?'<button class="btn ps-all" id="psAll">🎁 '+fmtL('보상 {n}개 모두 받기',{n})+'</button>':'')+'</div>';
  if(!P.gold)h+='<div class="lbl ps-note">'+'골드 칸 보상은 지금까지 올라온 단계 것까지 바로 받을 수 있어요 · 현금 결제 없음, 경기로 번 포인트만 사용'+'</div>';
  h+='<div class="ps-track" id="psTrack"><div class="ps-lab"><span>'+'무료'+'</span><span></span><span>👑 '+'골드'+'</span></div>';
  for(let i=0;i<PASS.tiers;i++){
    const reached=i<tier,cell=(t,R)=>{const got=((t==='g'?P.cg:P.cf)&passBit(i))!==0,can=passCan(t,i),gl=t==='g'&&!P.gold;
      return '<button class="ps-cell '+(t==='g'?'g':'f')+(got?' got':can?' rdy':reached?(gl?' gl':''):' lock')+'" data-pc="'+t+i+'"'+(can?'':' tabindex="-1"')+' aria-label="'+fmtL('{t}단계 {k} {s}',{t:i+1,k:t==='g'?'골드':'무료',s:got?'받음':can?'받기':''})+'">'+passRewTxt(R,t)+(got?'<i class="ps-ok">✔</i>':gl&&reached?'<i class="ps-ok">🔒</i>':'')+'</button>';};
    h+='<div class="ps-col'+(i===tier?' cur':reached?' done':'')+'">'+cell('f',PASS.free[i])+'<div class="ps-num">'+(i+1)+'</div>'+cell('g',PASS.gold[i])+'</div>';
  }
  h+='</div>';
  const pools=[0,1,2,3,4].map(g=>fmtL('{g} {n}종',{g:GRADES[g].n,n:tierTypes(g).length})).join(' · ');
  h+='<div class="odds ps-info"><b>🐟 '+'정어리 얻는 법'+'</b><br>'+fmtL('경기를 끝내면 승리 {w} · 무승부 {d} · 패배 {l}, 골마다 +{g} (최대 {m}골) · 그날 첫 승리 +{f} · 오늘의 목표 보상을 받을 때마다 +{q}',{w:E.win,d:E.draw,l:E.loss,g:E.goal,m:E.goalMax,f:E.first,q:E.daily})
    +'<br>'+fmtL('{p}마리마다 1단계 · 모두 {n}단계',{p:PASS.per,n:PASS.tiers})
    +'<br><b>🎁 '+'보상 안내'+'</b><br>'+fmtL('카드 보상은 그 등급 펭귄 중 하나가 같은 확률로 나와요 ({pools}) · 처음 얻은 펭귄은 해금, 이미 있으면 그 등급 카드로 보관 · 시즌 트레일이 이미 있으면 ⭐{d}P',{pools,d:PASS.dup})
    +'<br>'+fmtL('패스 이름은 시즌마다 바뀌어요. 시즌이 끝나면 받지 않은 보상은 자동으로 받고, 새 패스는 0단계부터 · 다음 시즌: {next}',{next:passName(P.s+1)})+'</div>';
  el.innerHTML=h;
  const b=$('#psBuy');if(b)b.onclick=()=>passBuy(b);
  const a=$('#psAll');if(a)a.onclick=()=>{passClaimAll();renderPass();hypeMenuRefresh();};
  el.querySelectorAll('[data-pc]').forEach(c=>{c.onclick=()=>{const t=c.dataset.pc[0],i=+c.dataset.pc.slice(1);if(passCan(t,i)){passClaim(t,i);renderPass();hypeMenuRefresh();}
    else if(t==='g'&&!save.pass.gold&&i<passTier())flashMsg('👑 '+'골드 패스를 열면 받을 수 있어요');else if(i>=passTier())flashMsg(fmtL('🐟 {t}단계에 도달하면 받을 수 있어요',{t:i+1}));};});
  const tr=$('#psTrack');if(tr){const col=tr.querySelectorAll('.ps-col')[Math.max(0,Math.min(PASS.tiers-1,tier)-2)];if(col)tr.scrollLeft=col.offsetLeft-tr.offsetLeft;}
  $('#ptsN').textContent=save.points;
}
function passMenu(){
  passCheck();const P=save.pass,T=passTheme(P.s),tier=passTier(),n=passCount();
  const m=$('#menuPass');if(!m)return;
  const sub=$('#psSub'),bd=$('#psBadge');
  if(sub)sub.textContent=T.n+' · '+fmtL('{t}단계',{t:tier});
  if(bd){bd.textContent=n?n:'';bd.style.display=n?'inline-block':'none';}
  m.style.setProperty('--p1',T.c[0]);m.style.setProperty('--p2',T.c[1]);
  m.setAttribute('aria-label',passName(P.s)+' '+fmtL('{t}단계',{t:tier})+(n?', '+fmtL('받을 보상 {n}개',{n}):'')+'. '+'정어리 패스 열기');
}
function howV24(){const E=PASS.earn;return fmtL('🐟 <b>정어리 패스</b>: 경기와 오늘의 목표로 정어리를 모아 {n}단계를 올라가요 (승리 {w} · 무승부 {d} · 패배 {l}, 골마다 +{g}, 그날 첫 승리 +{f}, 목표 보상마다 +{q}). 무료 칸은 누구나, 👑 골드 칸은 {p}P로 열어요. 패스 이름과 시즌 트레일은 시즌마다 바뀌어요.',{n:PASS.tiers,w:E.win,d:E.draw,l:E.loss,g:E.goal,f:E.first,q:E.daily,p:PASS.cost});}
// help line (the screen itself is static markup, next to 목표)
{const b=document.querySelector('.how-v22');if(b){const d=document.createElement('div');d.innerHTML='<h3>'+'🐟 정어리 패스'+'</h3>'+howV24();b.appendChild(d);}}
try{passCheck();}catch(e){}
