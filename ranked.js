
/* ================= TIER GAMES: ranked match, city trials, national trials ================= */
const CITIES=['서울','부산','대구','인천','광주','대전','울산','세종','수원','부천','고양','성남','창원','제주'];
const TRIALS={
  city:{name:'시대회 대표 선발전',short:'시대회',icon:'🏙',rounds:['8강','4강','결승'],r:[1150,1250,1350],diff:['normal','normal','hard'],
    types:[['basic','balanced','fast'],['defense','fast','strong'],['strong','fast','defense']],entries:3,needTier:2,first:300,again:80,card:2},
  nat:{name:'전국대회 대표 선발전',short:'전국대회',icon:'🇰🇷',rounds:['16강','8강','4강','결승'],r:[1400,1500,1600,1700],diff:['hard','hard','hard','hard'],
    types:[['fast','strong','balanced'],['defense','strong','fast'],['strong','fast','defense'],['strong','strong','fast']],entries:2,needTier:3,first:1000,again:250,card:3},
  world:{name:'세계 대회',short:'세계 대회',icon:'🌍',rounds:['32강','16강','8강','4강','결승'],r:[1750,1850,1950,2050,2150],diff:['hard','hard','hard','hard','hard'],
    types:[['fast','strong','defense'],['strong','fast','balanced'],['defense','strong','strong'],['strong','fast','fast'],['strong','strong','defense']],entries:1,needTier:4,first:3000,again:600,card:3}
};
const NATIONS=['캐나다','미국','스웨덴','핀란드','체코','스위스','독일','슬로바키아','노르웨이','덴마크','라트비아','일본','오스트리아','프랑스'];
const RK_RULE={size:3,time:120};   // tier games use fixed rules so ratings stay comparable
function titleBadge(){const t=save.trial.titles;return save.dev.got?' 💻':t.world?' 🌍':t.nat?' 🇰🇷':t.city?' 🏙':'';}
function titleText(full){
  const t=save.trial.titles,a=[];
  if(save.dev.got)a.push('💻 개발자');
  if(t.world&&(full||!a.length))a.push('🌍 세계 챔피언'+(full&&t.world>1?' ×'+t.world:''));
  if(t.nat&&(full||!a.length))a.push('🇰🇷 국가대표'+(full&&t.nat>1?' ×'+t.nat:''));
  if(t.city&&(full||!a.length))a.push('🏙 '+escH(save.trial.cityName||save.profile.city)+'시 대표'+(full&&t.city>1?' ×'+t.city:''));
  return a.join(full?' · ':'');
}
function trialDayRefresh(){
  const t=save.trial,now=Date.now(),dn=dayNum();
  if(save.clk&&now<save.clk-300000)return;                       // clock moved backwards: keep today's counters
  if(!t.day||(dn>t.day&&now-t.ts>=12*3600*1000)){t.day=dn;t.ts=now;t.used={city:0,nat:0,world:0};persist();}
}
function trialLock(kind){
  const T=TRIALS[kind],ti=tierOf(save.mgr.r);
  if(ti.i<T.needTier)return TIERS[T.needTier].n+' 이상 필요 (현재 '+ti.name+')';
  if(kind==='nat'&&!save.trial.titles.city)return '시대회 대표가 되어야 도전할 수 있어요';
  if(kind==='world'&&!save.trial.titles.nat)return '국가대표가 되어야 출전할 수 있어요';
  return '';
}
const trialLeft=kind=>Math.max(0,TRIALS[kind].entries-(save.trial.used[kind]|0));

/* ---------- VS intro (matching animation) ---------- */
function vsIntro(title,op,cb){
  if(window.__NOFX){cb();return;}
  const v=$('#vsFx'),ti=tierOf(save.mgr.r),to=tierOf(op.r);
  $('#vsTitle').textContent=title;
  $('#vsMe').innerHTML='<div class="vs-emb">'+escH(save.profile.emb)+'</div><b>'+escH(save.profile.name)+titleBadge()+'</b><small>'+escH(save.profile.club)+'</small><small style="color:'+ti.c+'">'+ti.name+' · '+save.mgr.r+'</small>';
  $('#vsOp').innerHTML='<div class="vs-emb">'+escH(op.emb||'🐧')+'</div><b>'+escH(op.name)+'</b><small>'+escH(op.club||'')+'</small><small style="color:'+to.c+'">'+to.name+' · '+op.r+'</small>';
  v.classList.remove('on');void v.offsetWidth;v.classList.add('on');SFX.whoosh();
  setTimeout(()=>{SFX.beep(true);},700);
  setTimeout(()=>{v.classList.remove('on');cb();},2000);
}

/* ---------- ranked match ---------- */
function rankedDiff(r){return r<1050?'easy':r<1350?'normal':'hard';}
function rankedStart(){
  SFX.init();SFX.ui();
  const my=save.mgr.r,pool=mgrRivals().sort((a,b)=>Math.abs(a.r-my)-Math.abs(b.r-my)).slice(0,6),op=pool[Math.floor(Math.random()*pool.length)];
  const ks=Object.keys(TYPES).filter(k=>!TYPES[k].exclusive),types=[0,1,2].map(()=>ks[Math.floor(Math.random()*ks.length)]);
  const cfg={mode:'ranked',size:RK_RULE.size,time:RK_RULE.time,diff:rankedDiff(op.r),oppTypes:types,oppR:op.r,oppName:op.name,label:'랭크 경기 vs '+op.name,tag:'🏅 RANKED · vs '+op.name};
  hideAll();vsIntro('⚔️ 랭크 경기 매칭 완료!',op,()=>startMatch(cfg));
}

/* ---------- trials ---------- */
function trialOppNames(kind){
  const city=save.profile.city,r=rng32((dayNum()*977)^(save.profile.seed|0)^(kind==='nat'?77:11));
  if(kind==='city')return [city+' 아이스 FC',city+' 블리자드',city+' 오로라 (우승 후보)'];
  if(kind==='world'){const ns=NATIONS.slice(),o=[];while(o.length<4)o.push(ns.splice(Math.floor(r()*ns.length),1)[0]+' 대표팀');o.push('남극 펭귄 연합 (디펜딩 챔피언)');return o;}
  const others=CITIES.filter(c=>c!==city),out=[];
  while(out.length<4){const c=others[Math.floor(r()*others.length)];if(!out.some(x=>x.startsWith(c+' ')))out.push(c+' 대표 · '+c+' '+CLUB_B[Math.floor(r()*CLUB_B.length)]);}
  out[3]=out[3].replace(' 대표 · ',' 대표 (우승 후보) · ');
  return out;
}
function trialStart(kind){
  trialDayRefresh();const lock=trialLock(kind);
  if(lock){flashMsg('🔒 '+lock);return false;}
  if(save.trial.run&&save.trial.run.kind!==kind){flashMsg('진행 중인 '+TRIALS[save.trial.run.kind].short+' 선발전을 먼저 끝내세요');return false;}
  if(!save.trial.run){
    if(trialLeft(kind)<=0){flashMsg('오늘 도전권을 모두 썼어요. 내일 다시 도전하세요!');return false;}
    save.trial.used[kind]=(save.trial.used[kind]|0)+1;
    save.trial.run={kind,round:0,opp:trialOppNames(kind),city:save.profile.city};persist();
  }
  trialPlay();return true;
}
function trialPlay(){
  const run=save.trial.run;if(!run)return;
  const T=TRIALS[run.kind],k=run.round,opName=run.opp[k];
  const cfg={mode:'trial',kind:run.kind,round:k,size:RK_RULE.size,time:RK_RULE.time,diff:T.diff[k],oppTypes:T.types[k],oppR:T.r[k],
    label:T.short+' 선발전 '+T.rounds[k],tag:T.icon+' '+(run.kind==='city'?run.city+' ':'')+T.name+' · '+T.rounds[k]+' vs '+opName};
  SFX.init();hideAll();
  vsIntro(T.icon+' '+T.name+' · '+T.rounds[k],{name:opName,r:T.r[k],emb:run.kind==='nat'?'🇰🇷':'🏙'},()=>startMatch(cfg));
}
function trialAfterMatch(win){
  const run=save.trial.run;if(!run)return null;const T=TRIALS[run.kind],rn=T.rounds[run.round];
  if(!win){save.trial.run=null;return{st:'out',rn,T,kind:run.kind};}      // knockout: a draw also ends the run
  if(run.round<T.rounds.length-1){run.round++;return{st:'next',rn,next:T.rounds[run.round],opp:run.opp[run.round],T,kind:run.kind};}
  save.trial.run=null;save.trial.titles[run.kind]=(save.trial.titles[run.kind]|0)+1;if(run.kind==='city')save.trial.cityName=run.city;
  const first=!save.trial.first[run.kind];save.trial.first[run.kind]=true;
  const pts=first?T.first:T.again;let card=null;   // points are paid by the result screen together with the match reward
  if(run.kind==='world')save.trial.cityName=save.trial.cityName||run.city;
  if(first){const ks=Object.keys(TYPES).filter(k=>!TYPES[k].exclusive),k=ks[Math.floor(Math.random()*ks.length)];card={k,g:T.card,isNew:grantCard(k,T.card)};}
  return{st:'champ',rn,T,pts,card,first,kind:run.kind,city:run.city};
}
function goRanked(){toMenu();goScreen('sRanked');}

/* ---------- tier hub screen ---------- */
function bracketHtml(run){
  const T=TRIALS[run.kind];
  return '<div class="rk-br">'+T.rounds.map((rn,i)=>'<div class="'+(i<run.round?'done':i===run.round?'cur':'')+'"><b>'+(i<run.round?'✔ ':i===run.round?'▶ ':'')+rn+'</b><small>'+escH(run.opp[i])+'</small></div>').join('')+'</div>';
}
function renderRanked(){
  const el=$('#rkBody');if(!el)return;trialDayRefresh();$('#ptsN').textContent=save.points;
  const m=save.mgr,ti=tierOf(m.r),mt=mgrTable(),run=save.trial.run;let h='';
  const pr=ti.next?Math.max(0,Math.min(100,(m.r-ti.min)/(ti.next-ti.min)*100)):100;
  h+='<div class="rk-head"><div class="rk-badge'+(ti.i===TIERS.length-1?' dev':'')+'" style="--tc:'+ti.c+'">'+TIER_IC[ti.i]+'</div><div><b style="color:'+ti.c+'">'+ti.name+'</b><div>레이팅 <b>'+m.r+'</b> · 감독 '+mt.me.rank+'위 / '+mt.rows.length+(m.games<10?' · 배치 '+m.games+'/10':'')+'</div><div class="pbar" style="width:220px;margin-top:4px"><i style="width:'+pr+'%"></i></div><small>'+(ti.next?'다음 티어까지 '+(ti.next-m.r)+'점':'최고 티어')+'</small>'+(titleText(true)?'<div class="pf-titles">'+titleText(true)+'</div>':'')+'</div></div>';
  h+='<div class="rk-cards">';
  h+='<div class="rk-card"><div class="rk-ic">⚔️</div><b>랭크 경기</b><small>비슷한 레이팅의 감독과 매칭 · 3:3 · 2분<br>이기면 오르고 지면 내려가요</small><button class="btn primary" data-rk="ranked">매칭 시작</button></div>';
  for(const kind of['city','nat','world']){
    const T=TRIALS[kind],lock=trialLock(kind),mine=run&&run.kind===kind,left=trialLeft(kind);
    h+='<div class="rk-card'+(lock?' locked':'')+(mine?' live':'')+'"><div class="rk-ic">'+T.icon+'</div><b>'+(kind==='city'?escH(save.profile.city)+' ':'')+T.name+'</b>';
    h+='<small>'+T.rounds.join(' → ')+' · '+T.rounds.length+'연승하면 '+TITLE_NM(kind)+'!<br>보상: 첫 선발 ⭐'+T.first+'P + '+GRADES[T.card].n+' 카드 · 이후 ⭐'+T.again+'P</small>';
    if(lock)h+='<div class="rk-lock">🔒 '+lock+'</div>';
    else if(mine)h+=bracketHtml(run)+'<button class="btn primary" data-rk="'+kind+'">이어하기 · '+T.rounds[run.round]+'</button>';
    else h+='<div class="rk-ent">오늘 도전권 '+left+' / '+T.entries+'</div><button class="btn'+(left?' primary':'')+'" data-rk="'+kind+'"'+(left?'':' disabled')+'>'+(left?'도전하기 (도전권 1장)':'내일 다시 도전')+'</button>';
    if(save.trial.titles[kind])h+='<div class="rk-won">🏆 '+(kind==='city'?'시 대표 선발':kind==='nat'?'국가대표 선발':'세계 대회 우승')+' '+save.trial.titles[kind]+'회</div>';
    h+='</div>';
  }
  h+='</div>'+devCardHtml()+'<div class="odds">티어 게임만 감독 레이팅에 반영돼요. 일반 게임(빠른 경기 · 토너먼트 · 연습 · 챌린지 · 자유 경기)은 레이팅이 바뀌지 않아요.<br>선발전은 한 판이라도 지거나 비기면 탈락이에요. 시작 후 20초가 지난 티어 게임을 나가면 기권 패이고, 선발전도 탈락 처리돼요.</div>';
  el.innerHTML=h;
  el.querySelectorAll('[data-rk]').forEach(b=>{b.onclick=()=>{const k=b.dataset.rk;if(k==='ranked')rankedStart();else trialStart(k);};});
}

/* ---------- final tier: 개발자 + exclusive 큰바다쇠오리 ---------- */
const TIER_IC=['🥉','🥈','🥇','💠','💎','👑','🔥','💻'];
const TITLE_NM=kind=>kind==='city'?escH(save.profile.city)+'시 대표':kind==='nat'?'국가대표':'세계 챔피언';
function devCheck(){   // first time the rating reaches the last tier: title + exclusive character (once)
  if(save.dev.got||tierOf(save.mgr.r).i!==TIERS.length-1)return false;
  save.dev.got=true;save.dev.ts=Date.now();
  if(!save.types.includes('auk'))save.types.push('auk');save.lv.auk=Math.max(save.lv.auk|0,MAX_LV);
  persist();return true;
}
function devCardHtml(){
  const T_=TIERS[TIERS.length-1],got=save.dev.got;
  return '<div class="rk-dev'+(got?' got':'')+'"><div style="--cw:86px">'+cardHtml('auk',{lv:MAX_LV,tag:got?'보유':''})+'</div><div><b>💻 최종 티어 · 개발자</b><small>레이팅 '+T_.min+' 달성 시 지급 (한 번)<br>칭호 <b>💻 개발자</b> + 최고급 캐릭터 <b>큰바다쇠오리</b> (Lv.10 · 전용 특수기술 큰바다 돌진)</small>'+(got?'<div class="rk-won">✔ 획득 완료 · 팀 편성에서 주장으로 쓸 수 있어요</div>':'<div class="rk-ent">현재 '+save.mgr.r+' / '+T_.min+'</div>')+'</div></div>';
}
function devReveal(){
  if(window.__NOFX)return;
  const v=$('#devFx');$('#devCard').innerHTML='<div style="--cw:'+Math.floor(Math.min(innerWidth*.42,(innerHeight-190)/1.42,230))+'px">'+cardHtml('auk',{lv:MAX_LV,tag:'NEW'})+'</div>';
  v.classList.add('on');SFX.win();vib([40,40,40,40,200]);
  $('#devOk').onclick=()=>{SFX.ui();v.classList.remove('on');};
  $('#devUse').onclick=()=>{SFX.ui();v.classList.remove('on');save.type='auk';persist();toMenu();goScreen('sSquad');};
}
function aukBeak(inner){   // great auk: tall, laterally compressed, hooked black bill with white grooves
  const bm=std(0x111216,.28,.2),wm=MAT.white;
  const ug=new T.ConeGeometry(.12,.46,16);ug.scale(.62,1,1.35);const up=new T.Mesh(ug,bm);up.rotation.x=Math.PI/2+.16;up.position.set(0,1.385,.53);up.castShadow=true;inner.add(up);
  const lg=new T.ConeGeometry(.085,.34,14);lg.scale(.6,1,1.1);const lo=new T.Mesh(lg,bm);lo.rotation.x=Math.PI/2+.02;lo.position.set(0,1.3,.49);inner.add(lo);
  for(const z of[.5,.58])for(const s of[-1,1]){const g=new T.Mesh(new T.BoxGeometry(.006,.15,.022),wm);g.position.set(s*.043,1.36,z);g.rotation.x=.25;inner.add(g);}
  const hk=new T.Mesh(new T.ConeGeometry(.03,.09,8),bm);hk.rotation.x=Math.PI;hk.position.set(0,1.33,.75);inner.add(hk);
  const badge=new T.Mesh(new T.CylinderGeometry(.075,.075,.02,20),MAT.gold);badge.rotation.x=Math.PI/2;badge.position.set(.2,1.0,.5);badge.rotation.z=.3;inner.add(badge);
}
function aukSVG(){   // card art: great auk (큰바다쇠오리) - black back, white belly, white spot before the eye, deep hooked grooved bill
  const R='rgba(190,215,255,.75)';
  return '<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="akG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4360"/><stop offset="1" stop-color="#171b2a"/></linearGradient><radialGradient id="akH" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#4a5374"/><stop offset="1" stop-color="#181c2c"/></radialGradient></defs>'
   +'<ellipse cx="60" cy="134" rx="32" ry="5" fill="rgba(0,0,0,.35)"/>'
   +'<path d="M38 126q-9 5-2 8h18q2-5-6-8z" fill="#22252f" stroke="'+R+'" stroke-width=".8"/><path d="M72 126q-9 5-2 8h18q2-5-6-8z" fill="#22252f" stroke="'+R+'" stroke-width=".8"/>'
   +'<ellipse cx="28" cy="94" rx="7" ry="21" fill="url(#akG)" stroke="'+R+'" stroke-width="1" transform="rotate(18 28 94)"/><ellipse cx="92" cy="94" rx="7" ry="21" fill="url(#akG)" stroke="'+R+'" stroke-width="1" transform="rotate(-18 92 94)"/>'
   +'<path d="M60 56c-21 0-32 21-32 44 0 19 13 30 32 30s32-11 32-30c0-23-11-44-32-44z" fill="url(#akG)" stroke="'+R+'" stroke-width="1.2"/>'
   +'<path d="M60 70c-13 0-20 15-20 31 0 15 9 24 20 24s20-9 20-24c0-16-7-31-20-31z" fill="#f6faff"/>'
   +'<circle cx="60" cy="44" r="23" fill="url(#akH)" stroke="'+R+'" stroke-width="1.2"/>'
   +'<ellipse cx="49.5" cy="41" rx="5.6" ry="7.6" fill="#f6faff" transform="rotate(-24 49.5 41)"/><ellipse cx="70.5" cy="41" rx="5.6" ry="7.6" fill="#f6faff" transform="rotate(24 70.5 41)"/>'
   +'<circle cx="43" cy="37" r="2.9" fill="#0b0b0f" stroke="#c8d2e8" stroke-width=".8"/><circle cx="43.8" cy="36.2" r=".9" fill="#fff"/><circle cx="77" cy="37" r="2.9" fill="#0b0b0f" stroke="#c8d2e8" stroke-width=".8"/><circle cx="77.8" cy="36.2" r=".9" fill="#fff"/>'
   +'<path d="M53 43q7-5 14 0l-2.5 20q-4.5 9-9 0z" fill="#0e1016" stroke="#5a6385" stroke-width="1"/>'
   +'<path d="M57 63q3 9 6 0" fill="#0e1016" stroke="#5a6385" stroke-width=".9"/>'
   +'<path d="M54.6 50q5.4 3 10.8 0M55.4 56q4.6 2.6 9.2 0" stroke="#f6faff" stroke-width="1.7" fill="none" stroke-linecap="round"/>'
   +'<circle cx="76" cy="100" r="6.5" fill="#ffd45e" stroke="#fff3b0" stroke-width="1.2"/><text x="76" y="102.6" text-anchor="middle" font-size="6.5" font-weight="700" fill="#5a3b00">DEV</text>'
   +'</svg>';
}
