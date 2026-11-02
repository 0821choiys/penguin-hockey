/* ================= v17: season league · rink conditions · pass-combo shot ================= */
// One translation key per sentence: {slots} are filled after translation, so word order can change per language.
function fmtL(s,o){return String(s).replace(/\{(\w+)\}/g,(m,k)=>o&&o[k]!=null?o[k]:m);}
const nonExclTypes=()=>Object.keys(TYPES).filter(k=>!TYPES[k].exclusive);
const pct=x=>Math.round(x*100);

/* ---------- 1. season league ---------- */
// 28-day seasons on a fixed local calendar (season 1 starts Monday 2026-10-26 = local day 20752).
// A season pays once, at its end, for the best tier reached after a tier game that season, if it had >= SEASON.min tier games.
// A new season pulls ratings above the pivot back by (1-keep) of the excess.
const SEASON={days:28,epoch:20752,min:3,pivot:1200,keep:.75,hot:3,
  rew:[{p:60},{p:120},{p:200,g:1},{p:320,g:2},{p:480,g:2},{p:700,g:3},{p:1000,g:3},{p:1500,g:3}]};
function seasonNow(){return Math.max(1,Math.floor((dayNum()-SEASON.epoch)/SEASON.days)+1);}
function seasonLeft(n){return Math.max(1,SEASON.epoch+(n||save.season.n||seasonNow())*SEASON.days-dayNum());}
function seasonDate(n){const d=new Date((SEASON.epoch+n*SEASON.days-1)*86400000);try{return d.toLocaleDateString(I18N.loc,{month:'long',day:'numeric',timeZone:'UTC'});}catch(e){return (d.getUTCMonth()+1)+'/'+d.getUTCDate();}}
function seasonSoft(r){return r>SEASON.pivot?Math.round(SEASON.pivot+(r-SEASON.pivot)*SEASON.keep):r;}
function seasonRewTxt(i){const R=SEASON.rew[i];return '⭐ '+R.p+'P'+(R.g!=null?' + '+fmtL('{g} 카드',{g:GRADES[R.g].n}):'');}
// called from loadSave() (hoisted): literals only, nothing declared further down
function seasonLoad(S){
  const n=v=>Number.isFinite(+v)?Math.max(0,Math.floor(+v)):0,r=v=>Math.min(n(v),4000),s=save.season,okT=t=>Number.isFinite(+t)&&+t>=-1&&+t<=7?Math.floor(+t):-1;
  s.n=Math.min(n(S.n),99999);for(const k of['g','w','d','l'])s[k]=Math.min(n(S[k]),99999);
  s.best=r(S.best);s.start=r(S.start);s.paid=Math.min(n(S.paid),99999);
  const L=S.last;
  if(L&&typeof L==='object'){
    const c=L.card&&typeof L.card==='object'&&typeof L.card.k==='string'&&TYPES[L.card.k]&&n(L.card.g)<=3?{k:L.card.k,g:n(L.card.g),isNew:L.card.isNew===true}:null;
    s.last={n:n(L.n),g:n(L.g),w:n(L.w),d:n(L.d),l:n(L.l),best:r(L.best),t:okT(L.t),ok:L.ok===true,pts:Math.min(n(L.pts),99999),card:c,seen:L.seen!==false,r0:r(L.r0),r1:r(L.r1),quiet:L.quiet===true};
  }
  if(Array.isArray(S.hist))s.hist=S.hist.filter(h=>h&&typeof h==='object').slice(0,8).map(h=>({n:n(h.n),t:okT(h.t),ok:h.ok===true,best:r(h.best),g:n(h.g),w:n(h.w),pts:Math.min(n(h.pts),99999)}));
}
// settle the finished season (once), soft-reset the rating, start the current one. Returns true when a season ended now.
function seasonCheck(){
  const S=save.season,cur=seasonNow(),now=Date.now();
  if(save.clk&&now<save.clk-300000)return false;                 // clock moved backwards: nothing settles
  if(!S.n){S.n=cur;S.start=save.mgr.r;persist();return false;}
  if(cur<=S.n)return false;
  const m=save.mgr,r0=m.r,t=S.best>0?tierOf(S.best).i:-1,ok=S.g>=SEASON.min&&t>=0;
  const L={n:S.n,g:S.g,w:S.w,d:S.d,l:S.l,best:S.best,t,ok,pts:0,card:null,seen:false,r0,r1:r0,quiet:false};
  if(ok&&S.paid<S.n){
    const R=SEASON.rew[t];L.pts=R.p;save.points+=R.p;
    if(R.g!=null){const ks=nonExclTypes(),k=ks[Math.floor(Math.random()*ks.length)];L.card={k,g:R.g,isNew:grantCard(k,R.g)};}
    S.paid=S.n;
  }
  m.r=seasonSoft(r0);L.r1=m.r;
  if(m.r!==r0){m.hist.unshift({d:m.r-r0,r:m.r,l:'시즌 리셋',ts:now});if(m.hist.length>10)m.hist.length=10;}
  L.quiet=!S.g&&m.r===r0;if(L.quiet)L.seen=true;                 // nothing happened for this player: start quietly
  if(S.g){S.hist.unshift({n:S.n,t,ok,best:S.best,g:S.g,w:S.w,pts:L.pts});if(S.hist.length>8)S.hist.length=8;}
  S.last=L;Object.assign(S,{n:cur,g:0,w:0,d:0,l:0,best:0,start:m.r});
  persist();return true;
}
function seasonAdd(sc,r){const s=save.season;if(!s.n)s.n=seasonNow();s.g++;if(sc===1)s.w++;else if(sc===0)s.l++;else s.d++;if(r>s.best)s.best=r;}
function seasonRulesTxt(){
  const ks=nonExclTypes();
  return fmtL('시즌은 {w}주마다({d}일) 바뀌어요.<br>시즌 동안 랭크전·선발전 같은 티어 게임을 {m}판 이상 하면, 시즌이 끝날 때 그 시즌에 도달한 최고 티어로 보상을 받아요 (티어 게임을 마친 뒤의 레이팅 기준).<br>보상 카드는 일반 펭귄 {k}종 중 하나가 무작위로 나와요 (각 {p}%).<br>새 시즌이 시작되면 레이팅 중 {v}점을 넘는 부분이 {c}% 줄어들어요 (예: {a} → {b}).',
    {w:SEASON.days/7,d:SEASON.days,m:SEASON.min,k:ks.length,p:+(100/ks.length).toFixed(1),v:SEASON.pivot,c:pct(1-SEASON.keep),a:SEASON.pivot+400,b:seasonSoft(SEASON.pivot+400)});
}
function seasonBoxHtml(){
  const S=save.season,n=S.n||seasonNow(),left=seasonLeft(n),ti=S.best?tierOf(S.best):null,ok=S.g>=SEASON.min;
  let h='<div class="rk-season"><div class="ss-top"><b>'+fmtL('🏆 시즌 {n}',{n})+'</b><span>'+(left>1?fmtL('{date}까지 · {d}일 남음',{date:seasonDate(n),d:left}):'오늘 자정에 끝나요')+'</span></div><div class="ss-row">';
  h+='<div class="ss-cell"><small>'+'이번 시즌 최고 티어'+'</small>'+(ti?'<b style="color:'+ti.c+'">'+TIER_IC[ti.i]+' '+ti.name+'</b><small>'+fmtL('레이팅 {r}',{r:S.best})+'</small>':'<b class="dim">—</b><small>'+'티어 게임을 하면 기록돼요'+'</small>')+'</div>';
  h+='<div class="ss-cell"><small>'+'이번 시즌 티어 게임'+'</small><b>'+fmtL('{g}판',{g:S.g})+'</b><small'+(ok?' class="ok">'+'✔ 보상 조건 달성':'>'+fmtL('{k}판 더 하면 보상 조건 달성',{k:SEASON.min-S.g}))+'</small></div>';
  h+='<div class="ss-cell"><small>'+'지금 끝나면 받는 보상'+'</small>'+(ti&&ok?'<b>'+seasonRewTxt(ti.i)+'</b><small>&nbsp;</small>':'<b class="dim">'+'아직 없음'+'</b><small>'+(ti?fmtL('조건을 채우면 {r}',{r:seasonRewTxt(ti.i)}):'&nbsp;')+'</small>')+'</div>';
  h+='</div><details class="odds ss-tbl"><summary>'+'시즌 보상표 · 규칙'+'</summary><div class="ss-rows">'
    +TIERS.map((T_,i)=>'<div'+(ti&&ti.i===i?' class="cur"':'')+'><span style="color:'+T_.c+'">'+TIER_IC[i]+' '+T_.n+'</span><b>'+seasonRewTxt(i)+'</b></div>').join('')+'</div>'+seasonRulesTxt()+'</details>';
  if(S.hist.length)h+='<div class="ss-hist"><small>'+'지난 시즌'+'</small>'+S.hist.slice(0,4).map(x=>'<span>'+fmtL('시즌 {n}',{n:x.n})+' · '+(x.ok&&x.t>=0?TIER_IC[x.t]+' '+TIERS[x.t].n:'보상 없음')+'</span>').join('')+'</div>';
  return h+'</div>';
}
// one line in the tier-game header; tapping it scrolls to the season box
function seasonMiniHtml(){
  const S=save.season,n=S.n||seasonNow(),left=seasonLeft(n),ok=S.g>=SEASON.min;
  return '<button type="button" class="ss-mini" data-ss-go="1">'+fmtL('🏆 시즌 {n} · {left}',{n,left:left>1?fmtL('{d}일 남음',{d:left}):'오늘 종료'})+' · '+(ok?'✔ 보상 조건 달성':fmtL('보상까지 {g}/{m}판',{g:S.g,m:SEASON.min}))+'</button>';
}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-ss-go]');if(!b)return;const t=document.querySelector('#rkBody .rk-season');if(t){SFX.ui();t.scrollIntoView({behavior:'smooth',block:'start'});}});
function seasonNote(){
  const s=save.season,k=SEASON.min-s.g;
  if(k>0)return fmtL('🏆 시즌 보상까지 티어 게임 {k}판 남았어요',{k});
  if(k===0)return '🏆 시즌 보상 조건 달성! 시즌이 끝나면 이번 시즌 최고 티어로 보상을 받아요';
  const ti=tierOf(s.best);return fmtL('🏆 시즌 {n} 최고 티어: {t}',{n:s.n,t:'<b style="color:'+ti.c+'">'+ti.name+'</b>'});
}
function seasonBadge(){
  const b=$('#ssBadge');if(!b)return;const n=save.season.n||seasonNow(),left=seasonLeft(n);
  b.textContent=left>1?fmtL('시즌 {n} · D-{d}',{n,d:left}):fmtL('시즌 {n} · 오늘 종료',{n});
  b.classList.toggle('hot',left<=SEASON.hot);b.style.display='inline-block';
}
// season-end summary: shown once, on the home screen, after the reward has already been paid by seasonCheck()
function seasonPopup(){
  const S=save.season,L=S.last;if(!L||L.seen||G.view==='game'||G.ui!=='sMenu'||window.__NOFX)return false;
  const d=$('#cardDlg');if(!d||d.classList.contains('on'))return false;
  for(const id of['#tutAsk','#devFx','#cfmDlg','#enhFx'])if($(id).classList.contains('on'))return false;
  const T_=L.t>=0?TIERS[L.t]:null;
  let h='<div class="ss-pop"><h3>'+fmtL('🏆 시즌 {n} 종료!',{n:L.n})+'</h3>';
  if(T_)h+='<div class="ss-pbadge" style="--tc:'+T_.c+'">'+TIER_IC[L.t]+'</div><div class="ss-pt"><small>'+'시즌 최고 티어'+'</small><b style="color:'+T_.c+'">'+tierOf(L.best).name+'</b><small>'+fmtL('레이팅 {r}',{r:L.best})+'</small></div>';
  h+='<div class="ss-prec">'+fmtL('티어 게임 {g}판 · {w}승 {d}무 {l}패',L)+'</div>';
  if(L.ok)h+='<div class="ss-prew"><small>'+'시즌 보상'+'</small><b>⭐ '+L.pts+'P</b>'+(L.card?'<div class="ss-pcard" style="--cw:84px">'+cardHtml(L.card.k,{g:L.card.g,lv:L.card.isNew?L.card.g:0,tag:L.card.isNew?'NEW':'보관'})+'</div><small>'+TYPES[L.card.k].name+' · '+GRADES[L.card.g].n+'</small>':'')+'</div>';
  else h+='<div class="ss-pmiss">'+fmtL('티어 게임을 {m}판 이상 한 시즌만 보상을 받아요 (이번 시즌 {g}판)',{m:SEASON.min,g:L.g})+'</div>';
  h+='<div class="ss-pnext">'+fmtL('시즌 {n} 시작!',{n:S.n})+(L.r1!==L.r0?' '+fmtL('레이팅 {a} → {b}',{a:L.r0,b:L.r1}):'')+'</div>';
  h+='<div class="row cf-btns"><button class="btn" data-ss="ok">'+'확인'+'</button><button class="btn primary" data-ss="rk">'+'🏅 티어 게임'+'</button></div></div>';
  L.seen=true;persist();                                          // shown once, even if the page closes now
  d.querySelector('.cd-body').innerHTML=h;
  const close=go=>{d.classList.remove('on');d.onclick=null;if(go)goScreen('sRanked');};
  d.onclick=e=>{const b=e.target.closest('[data-ss]');if(b){SFX.ui();close(b.dataset.ss==='rk');}else if(e.target===d||e.target.classList.contains('cd-x'))close(false);};
  d.classList.add('on');SFX.win();vib([30,40,30,40,120]);return true;
}
function seasonPopSoon(){clearTimeout(seasonPopSoon.t);seasonPopSoon.t=setTimeout(()=>{try{seasonPopup();}catch(e){}},900);}
// a season can end while the game stays open on the home / tier screen
setInterval(()=>{try{if(G.view==='game')return;if(seasonCheck()){leagueMenuRefresh();if(G.ui==='sRanked')renderRanked();}}catch(e){}},30000);

/* ---------- 2. rink conditions ---------- */
// Rolled per match in quick / free / tournament (not the final). Both teams play under the same rule.
const COND={
  blizzard:{ico:'🌨️',name:'눈보라',desc:'시야가 좁아지고, 쌓인 눈 때문에 퍽이 빨리 느려져요. AI 선수들의 슛도 흔들려요.',f:{pf:1.3,aim:1.6,read:.5}},
  thin:{ico:'🧊',name:'얇은 얼음',desc:'얼음이 매끄러워 멈추기와 방향 전환이 어려워요. 퍽도 더 멀리 미끄러져요.',f:{grip:.5,glide:.45,acc:.85,brk:.75,pf:.62}},
  night:{ico:'🌙',name:'밤 경기',desc:'어두운 경기장에서 조명이 퍽과 내 펭귄을 비춰요. 골키퍼 반응이 느려져 골이 더 잘 나와요.',f:{react:1.4,gkErr:1.3,read:.6}}
};
const COND_W={none:40,blizzard:20,thin:20,night:20};      // chance per match in % (the help text is built from these numbers)
const COND_BONUS=.1,COND_MODES=['quick','free','tour'];
const CF0={grip:1,glide:1,acc:1,brk:1,pf:1,aim:1,read:1,react:1,gkErr:1},CF=Object.assign({},CF0);   // physics / AI factors of the current match
const CV={fog:0,dark:0,thin:0};                                                                       // eased visual levels
G.cond=null;
function condAllowed(cfg){return !!(cfg&&save.set.cond!==false&&COND_MODES.includes(cfg.mode)&&!cfg.final&&!cfg.tutorial&&!cfg.demo);}
function condRoll(){let x=Math.random()*100;for(const k in COND_W){x-=COND_W[k];if(x<0)return k==='none'?null:k;}return null;}
function condPick(cfg){return cfg&&cfg.cond!==undefined?(COND[cfg.cond]?cfg.cond:null):(condAllowed(cfg)?condRoll():null);}
// HUD: chip (tap = description), intro card during the countdown, screen tint, note on the pause screen
const condFx=document.createElement('div');condFx.id='condFx';
const condTag=document.createElement('button');condTag.id='condTag';condTag.type='button';
const condCard=document.createElement('div');condCard.id='condCard';condCard.setAttribute('aria-live','polite');
{const hud=$('#hud');if(hud){hud.insertBefore(condFx,hud.firstChild);hud.appendChild(condTag);hud.appendChild(condCard);}}
const pauseCond=document.createElement('div');pauseCond.id='pauseCond';pauseCond.style.display='none';
{const h2=$('#sPause h2');if(h2&&h2.parentNode)h2.parentNode.insertBefore(pauseCond,h2.nextSibling);}
condTag.onclick=e=>{e.stopPropagation();condTag.blur();if(!G.cond)return;SFX.ui();const E=COND[G.cond];hypeToast(E.ico+' '+E.name+' · '+E.desc);};
function condHud(){
  const on=!!G.cond,E=on?COND[G.cond]:null;
  condTag.textContent=on?E.ico+' '+E.name:'';condTag.classList.toggle('on',on);
  if(on)condTag.setAttribute('aria-label',fmtL('빙판 변수: {n} · 설명 보기',{n:E.name}));
  pauseCond.innerHTML=on?'<small>'+'이번 경기 빙판 변수'+'</small><b>'+E.ico+' '+E.name+'</b><span>'+E.desc+'</span>':'';pauseCond.style.display=on?'':'none';
  document.body.dataset.cond=on?G.cond:'';
}
function condStart(cfg){
  G.cond=condPick(cfg);Object.assign(CF,CF0,G.cond?COND[G.cond].f:null);
  if(G.cond==='thin')drawCracks();
  condHud();
  clearTimeout(condStart.t);condCard.classList.remove('on');
  if(G.cond&&!window.__NOFX){const E=COND[G.cond];
    condCard.innerHTML='<small>'+'빙판 변수'+'</small><b>'+E.ico+' '+E.name+'</b><span>'+E.desc+'</span>';
    void condCard.offsetWidth;condCard.classList.add('on');condStart.t=setTimeout(()=>condCard.classList.remove('on'),3600);SFX.whoosh();}
}
function condClear(){G.cond=null;Object.assign(CF,CF0);clearTimeout(condStart.t);condCard.classList.remove('on');condHud();}
function condBonus(base){return G.cond&&COND[G.cond]?Math.max(2,Math.round(base*COND_BONUS)):0;}
function condBonusRow(R){if(!(R.cond>0))return '';const E=COND[R.condK]||{ico:'',name:''};return '<div class="rs-row"><span>'+fmtL('{i} 빙판 변수 보너스 ({n})',{i:E.ico,n:E.name})+'</span><span><b class="cu" data-to="'+R.cond+'">0</b> P</span></div>';}
function condIntroHtml(k){const E=COND[k];return E?'<div class="tour-cond">'+fmtL('빙판 변수: {i} {n}',{i:E.ico,n:E.name})+'<small>'+E.desc+'</small></div>':'';}
// blizzard: heavy snow + wind (overrides the arena's weather while it lasts)
let condWx=false;
function condWeather(w){
  if(G.view!=='game'||G.cond!=='blizzard'){if(condWx){condWx=false;w.t=Math.min(w.t,3);}return;}
  w.t=Math.max(w.t,5);w.target=1;w.wind=15;if(!condWx){condWx=true;w.mode='blizzard';$('#wx').textContent='🌨️';}
}
// end of setTOD(): blizzard fog closes in, night dims the sky light (the rink floodlights stay on)
const fogWhite=new T.Color(.86,.9,.95);
function condLight(){
  if(CV.fog>.0005){scene.fog.density+=CV.fog/Math.max(1,camera.position.y/15);scene.fog.color.lerp(fogWhite,clamp(CV.fog/.024,0,1)*.75);}   // the portrait camera sits up to 2× farther: same whiteout on every screen
  if(CV.dark>.005){const k=CV.dark;hemi.intensity*=1-.6*k;sun.intensity*=1-.65*k;renderer.toneMappingExposure*=1-.28*k;for(const l of lamps)l.pl.intensity*=1-.5*k;}
}
// thin ice: crack lines drawn on an overlay of the ice (fresh pattern every thin-ice match)
const crackC=document.createElement('canvas');crackC.width=1024;crackC.height=512;const crackX=crackC.getContext('2d'),crackTex=new T.CanvasTexture(crackC);
const crackMesh=new T.Mesh(iceGeo.clone(),new T.MeshBasicMaterial({map:crackTex,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
crackMesh.position.y=.011;crackMesh.renderOrder=1;crackMesh.visible=false;scene.add(crackMesh);
function drawCracks(){
  const cx=crackX,sx=1024/(2*W),sz=512/(2*D);cx.clearRect(0,0,1024,512);cx.lineCap='round';cx.lineJoin='round';
  const seg=(px,pz,a,len,w,depth)=>{
    const pts=[[px,pz]],n=3+((Math.random()*3)|0);let x=px,z=pz;
    for(let i=0;i<n;i++){a+=rnd(-.5,.5);x+=Math.cos(a)*len/n;z+=Math.sin(a)*len/n;pts.push([x,z]);if(depth<2&&Math.random()<.35)seg(x,z,a+rnd(-1.1,1.1),len*.5,w*.7,depth+1);}
    for(const st of[['rgba(25,70,120,.5)',w*2.2],['rgba(255,255,255,.9)',w]]){cx.strokeStyle=st[0];cx.lineWidth=st[1];cx.beginPath();pts.forEach((p,i)=>{const X=512+p[0]*sx,Y=256+p[1]*sz;if(i)cx.lineTo(X,Y);else cx.moveTo(X,Y);});cx.stroke();}
  };
  for(let c=0;c<8;c++){const x0=rnd(-W+4,W-4),z0=rnd(-D+2.5,D-2.5),b=4+((Math.random()*4)|0);for(let i=0;i<b;i++)seg(x0,z0,i/b*TAU+rnd(-.3,.3),rnd(1.4,3.4),rnd(1,1.8),0);}
  crackTex.needsUpdate=true;
}
// night: two pools of light on the ice (the puck, my penguin)
const condSpotTex=glowTex('rgba(255,247,226,1)','rgba(255,238,200,.5)');
const condSpots=[11,7].map(sz=>{const m=new T.Mesh(new T.PlaneGeometry(sz,sz),new T.MeshBasicMaterial({map:condSpotTex,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.rotation.x=-Math.PI/2;m.position.y=.021;m.renderOrder=1;m.visible=false;scene.add(m);return m;});
let condTint=false;
function condFrame(dt){
  const g=G.view==='game',c=g?G.cond:null,k=Math.min(1,dt*1.6);
  if(!g){CV.fog=CV.dark=CV.thin=0;}
  else{CV.fog+=((c==='blizzard'?.024:0)-CV.fog)*k;CV.dark+=((c==='night'?1:0)-CV.dark)*k;CV.thin+=((c==='thin'?1:0)-CV.thin)*k;}
  iceMat.roughness=lerp(.28,.08,CV.thin);
  if(CV.thin>.01||CV.dark>.01||condTint){const b=lerp(1,.84,smooth(.35,.85,G.tod))*(1-.4*CV.dark);iceMat.color.setRGB(b*(1-.14*CV.thin),b*(1-.05*CV.thin),b);condTint=CV.thin>.01||CV.dark>.01;}   // same base as rinkFrame(), never compounding; night darkens the ice under the spotlights
  crackMesh.visible=CV.thin>.01;crackMesh.material.opacity=.8*CV.thin;
  const on=CV.dark>.02,pk=G.puck,pl=G.player;
  condSpots[0].visible=on;condSpots[1].visible=on&&!!pl;
  if(on){condSpots[0].position.set(pk.rx,.021,pk.rz);condSpots[0].material.opacity=.62*CV.dark;if(pl){condSpots[1].position.set(pl.rx,.022,pl.rz);condSpots[1].material.opacity=.4*CV.dark;}}
}

/* ---------- 3. pass-combo shot ---------- */
// Completed passes in a row (each within PC.win s of the last, no opponent touch, no miss) build a team combo.
// From PC.need passes the team's next shot within PC.win s is stronger. Same rule for both teams.
const PC={need:3,win:6,bonus:{3:.2,4:.25,5:.3}};
function pcBonus(n){return n>=5?PC.bonus[5]:PC.bonus[n]||0;}
function pcOn(){const c=G.cfg;return !!(c&&!c.demo&&c.mode!=='demo'&&!c.tutorial&&!(c.challenge&&c.challenge.kind==='pass'));}
function pcReset(){for(const k of['blue','red']){const tm=G.teams&&G.teams[k];if(tm)tm.pc={n:0,exp:0};}}
function pcReady(tm){const c=tm&&tm.pc;return !!(c&&c.n>=PC.need&&G.t<=c.exp&&pcOn());}
function pcBreak(tm,expired){
  const c=tm&&tm.pc;if(!c||!c.n)return;const was=c.n>=PC.need&&(expired||G.t<=c.exp);c.n=0;c.exp=0;
  if(was&&tm===G.mine&&pcOn()){const pk=G.puck;popAt('콤보 끊김',pk.x,2.4,pk.z);}
}
function pcPass(ps){
  if(!pcOn())return;const tm=ps.from.team,c=tm.pc||(tm.pc={n:0,exp:0});
  if(c.n&&G.t>c.exp)c.n=0;                                        // too slow: a new chain starts with this pass
  c.n++;c.exp=G.t+PC.win;
  if(c.n===PC.need){
    if(tm===G.mine){SFX.pickup();vib([12,30,12]);burst(ps.to.x,ps.to.z,12,1.1);}
    else if(G.mine){popAt('⚠ 상대 콤보 슛!',ps.to.x,2.7,ps.to.z);SFX.passBad(false);}
  }
  const r=ps.to;if(r&&!r.human&&!r.goalie&&r.ai){r.ai.keepT=c.n<PC.need&&Math.random()<G.diff.passP+.15?G.t+rnd(.3,.7):0;if(r.ai.keepT)r.ai.cool=Math.min(r.ai.cool,0);}
}
function pcTouch(p){const o=p&&p.team&&p.team.opp;if(o&&o.pc&&o.pc.n)pcBreak(o);}
function pcShotMul(p){
  p._combo=0;if(p.goalie||!pcReady(p.team))return 1;
  const c=p.team.pc,b=pcBonus(c.n);p._combo=c.n;c.n=0;c.exp=0;return 1+b;
}
function pcAfterShot(p){
  const pk=G.puck;if(!p._combo||!pk.shot)return;pk.shot.combo=p._combo;
  popAt('⚡ 콤보 슛!',pk.x,2.3,pk.z);burst(pk.x,pk.z,16,1.4);
  if(p.team===G.mine){G.cam.shake=Math.max(G.cam.shake,.35);if(p.human)vib(30);if(realMatch())save.cum.comboShot++;}
}
function pcGoal(tm,sh){if(sh&&sh.combo&&sh.by&&sh.by.team===tm&&tm===G.mine&&realMatch())save.cum.comboGoal++;pcReset();}
function pcPopText(ps){
  const ch=G.cfg&&G.cfg.challenge;
  if(!pcOn()||(ch&&ch.kind==='pass'))return G.chain>1?'패스 성공! x'+G.chain:'패스 성공!';
  const n=(ps.from.team.pc||{}).n||0;
  if(n>=PC.need)return fmtL('⚡ 콤보 x{n} · 다음 슛 +{p}%',{n,p:pct(pcBonus(n))});
  return n>1?'패스 성공! x'+n:'패스 성공!';
}
// AI give-and-go: an AI skater that receives a chain pass may plan to keep the chain going (chance grows with difficulty)
function pcGiveGo(p){
  const ai=p.ai,t=ai.keepT;if(!t||G.t<t)return false;ai.keepT=0;
  const tm=p.team,c=tm.pc;if(G.t-t>3||!pcOn()||!c||!c.n||c.n>=PC.need||G.t>c.exp)return false;
  const mate=bestMate(p,0,0,true);if(!mate||laneBlock(G.puck.x,G.puck.z,mate.x,mate.z,tm)<1.6)return false;
  if(doPass(p,mate)){ai.cool=rnd(.5,1);return true;}return false;
}
function pcChip(a){if(G.mine&&pcReady(G.mine)){const c=G.mine.pc;a.push(fmtL('⚡ 콤보 슛 +{p}% {s}',{p:pct(pcBonus(c.n)),s:Math.max(0,c.exp-G.t).toFixed(1)}));}}
// combo-ready marker around the puck: gold = my team's combo shot is ready, red = the opponent's
const comboRing=new T.Mesh(new T.RingGeometry(.78,1.02,40),new T.MeshBasicMaterial({color:0xffd34d,transparent:true,opacity:.92,side:T.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));
comboRing.rotation.x=-Math.PI/2;comboRing.renderOrder=2;comboRing.visible=false;scene.add(comboRing);
function pcFrame(){
  if(G.view!=='game'||!G.teams||!G.teams.blue){comboRing.visible=false;return;}
  if(G.state==='play')for(const k of['blue','red']){const tm=G.teams[k],c=tm.pc;if(c&&c.n&&G.t>c.exp)pcBreak(tm,true);}
  const m=pcReady(G.mine),o=!!G.mine&&pcReady(G.mine.opp);
  comboRing.visible=m||o;
  if(m||o){const pk=G.puck;comboRing.material.color.setHex(m?0xffd34d:0xff5a3a);comboRing.position.set(pk.rx,.035,pk.rz);comboRing.scale.setScalar(1+.12*Math.sin(G.t*12));}
  const pk=G.puck,sh=pk.shot;
  if(sh&&sh.combo&&Math.hypot(pk.vx,pk.vz)>6)for(let j=0;j<2;j++)emit(pk.x,.22,pk.z,-pk.vx*.05+rnd(-1,1),rnd(.5,2),-pk.vz*.05+rnd(-1,1),.4,.26,1,.86,.25);
}
function v17Frame(dt){condFrame(dt);pcFrame();}

/* ---------- help text (게임 방법), built from the live numbers ---------- */
function howV17(){
  const list=Object.keys(COND).map(k=>COND[k].ico+' '+COND[k].name+' '+COND_W[k]+'%').join(' · ');
  return fmtL('⚡ <b>콤보 슛</b>: 패스를 {w}초 안에 이어서 {n}번 성공하면, {w}초 안에 쏘는 다음 슛 위력이 +{a}% (4번 +{b}%, 5번 이상 +{c}%). 상대 팀도 똑같아요!',{w:PC.win,n:PC.need,a:pct(PC.bonus[3]),b:pct(PC.bonus[4]),c:pct(PC.bonus[5])})
    +'<br>'+fmtL('🌨️🧊🌙 <b>빙판 변수</b>: 빠른 경기 · 자유 경기 · 토너먼트에서 경기마다 {p}% 확률로 붙어요 (토너먼트 결승은 제외 · {list}). 변수가 붙은 경기는 보상 +{b}%! 설정에서 끌 수 있어요.',{p:100-COND_W.none,list,b:pct(COND_BONUS)})
    +'<br>'+fmtL('🏆 <b>시즌 리그</b>: 시즌은 {d}일마다 바뀌어요. 티어 게임을 {m}판 이상 하면 시즌이 끝날 때 최고 티어로 보상을 받아요. 새 시즌엔 {v}점을 넘는 레이팅이 조금 내려가요.',{d:SEASON.days,m:SEASON.min,v:SEASON.pivot});
}
{const p=$('#sHow .panel');if(p){const box=document.createElement('div');box.className='how how-v17';box.style.cssText='grid-template-columns:1fr;margin-top:12px';box.innerHTML='<div><h3>'+'🆕 시즌 · 빙판 변수 · 콤보 슛'+'</h3>'+howV17()+'</div>';const rows=p.querySelectorAll('.row');p.insertBefore(box,rows.length?rows[rows.length-1]:null);}}
seasonCheck();
