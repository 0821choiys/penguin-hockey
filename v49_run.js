/* ================= v49 RUN: 🧊 펭귄 원정 (owner, 2026-11-18) ================= */
// "add something that makes me want to keep playing — it's not fun". The owner picked: "the match itself is flat" + "after one match there is no reason
// to play another". The game already has goal banners, replays, fever, combos, daily goals, coach levels … so more of those would not help.
// So: a run of short matches. Every win → pick 1 of 3 upgrades for your team (the next match plays differently, the team grows), every stage has its own
// twist (blizzard, golden-puck rush, start a goal down, first to 3 …), every 5th stage is a boss team, 2 lives, a best record to beat, rewards that grow.
// Points only, nothing paid; the upgrade draw is free (the rarity is named on each card). Offline only. Every number on screen comes from these tables.
const RUN={lives:2,maxLives:4,time:120,pay0:20,payK:10,bossX:2,fundK:.25,first:3,goldEvery:25,w:{c:64,r:28,e:8},
  boss:{spd:1.06,pow:1.12,chg:1.15,gk:25},endless:{spd:1.5,spdMax:15,pow:2,powMax:25},mod:{fast:8,sniper:10,sniperAim:20,wall:30}};
const RUN_STOP=[null,'펭귄 마을','유빙 해협','크릴 만','눈보라 고개','얼음 요새','오로라 평원','빙하 협곡','범고래 해안','남극점 기지','황제의 링'];
// stage twists (the three rink conditions use their own names / descriptions from COND)
const RUN_MOD={
  blizzard:{cond:'blizzard'},thin:{cond:'thin'},night:{cond:'night'},
  golden:{ico:'🥇',name:'골든 퍽 러시',desc:'골든 퍽이 경기 시작과 {s}초마다 나타나요 · 골든 퍽 골은 2점'},
  behind:{ico:'⏱️',name:'역전 드라마',desc:'상대가 1:0으로 앞선 채 시작해요'},
  first3:{ico:'⚡',name:'{n}골 먼저',desc:'시간 제한 없이 {n}골을 먼저 넣는 팀이 이겨요'},
  fast:{ico:'💨',name:'빠른 상대',desc:'상대 스케이터 속도 +{v}%'},
  sniper:{ico:'🎯',name:'저격수 상대',desc:'상대 슛 위력 +{v}% · 슛이 퍼지는 정도 -{a}%'},
  wall:{ico:'🧱',name:'철벽 골리',desc:'상대 골키퍼 반응 시간 -{v}%'}
};
// upgrades: r = rarity (c 일반 / r 희귀 / e 영웅), max = how many times it can be taken, v / w / s = the numbers on the card and in the code
const RUN_UP={
  pow:{r:'c',ico:'💥',max:3,v:8,name:'강슛',desc:'우리 팀 슛 위력 +{v}%'},
  chg:{r:'c',ico:'⚡',max:3,v:15,name:'빠른 충전',desc:'강슛 충전 속도 +{v}%'},
  aim:{r:'c',ico:'🎯',max:2,v:20,name:'정밀 조준',desc:'슛이 퍼지는 정도 -{v}%'},
  pass:{r:'c',ico:'📨',max:2,v:12,name:'칼패스',desc:'패스 속도 +{v}%'},
  dash:{r:'c',ico:'💨',max:2,v:.5,name:'대시 충전',desc:'대시 재사용 -{v}초'},
  poke:{r:'c',ico:'🧲',max:2,v:25,name:'끈질긴 수비',desc:'퍽 뺏기 성공률 +{v}%'},
  spd:{r:'r',ico:'⛸️',max:3,v:4,name:'빠른 발',desc:'스케이트 속도 +{v}%'},
  ot:{r:'r',ico:'🏒',max:2,v:10,w:.15,name:'원타이머 장인',desc:'원타이머 위력 +{v}% · 받아 치는 시간 +{w}초'},
  tech:{r:'r',ico:'🌀',max:2,v:15,name:'기술 충전',desc:'특수 기술 쿨다운 -{v}%'},
  gk:{r:'r',ico:'🧤',max:2,v:20,name:'수호신 골리',desc:'우리 골키퍼 반응 시간 -{v}%'},
  life:{r:'r',ico:'❤️',max:2,v:1,name:'여분 목숨',desc:'목숨 +{v} (최대 {m}개)'},
  fund:{r:'r',ico:'🪙',max:2,v:25,name:'원정 자금',desc:'다음 단계부터 원정 보상 +{v}%'},
  lead:{r:'e',ico:'🥅',max:1,v:1,name:'선제골',desc:'매 경기 1:0으로 앞선 채 시작'},
  ace:{r:'e',ico:'⭐',max:1,v:10,s:5,name:'에이스',desc:'캡틴 속도 +{s}% · 슛 위력 +{v}% · 충전 +{v}%'}
};
const RUN_RN={c:'일반',r:'희귀',e:'영웅'};
function runCur(){return save.run&&save.run.cur||null;}
function runBoss(s){return s%5===0;}
function runStop(s){return s<=10?RUN_STOP[s]:fmtL('끝없는 빙원 {n}',{n:s});}
function runDiff(s){return s<=2?'easy':s<=6?'normal':'hard';}
function runPay(s,c){const f=(c&&c.ups&&c.ups.fund)||0;return Math.round((RUN.pay0+RUN.payK*s)*(runBoss(s)?RUN.bossX:1)*(1+RUN.fundK*f));}
function runEndless(s){const k=Math.max(0,s-10);return {spd:Math.min(RUN.endless.spdMax,RUN.endless.spd*k),pow:Math.min(RUN.endless.powMax,RUN.endless.pow*k)};}
function runModName(k){const m=RUN_MOD[k];if(!m)return '';if(m.cond)return COND[m.cond].name;return fmtL(m.name,{n:RUN.first});}
function runModIco(k){const m=RUN_MOD[k];return m?(m.cond?COND[m.cond].ico:m.ico):'';}
function runModDesc(k){const m=RUN_MOD[k];if(!m)return '';if(m.cond)return COND[m.cond].desc;
  return fmtL(m.desc,{s:RUN.goldEvery,n:RUN.first,v:k==='fast'?RUN.mod.fast:k==='sniper'?RUN.mod.sniper:RUN.mod.wall,a:RUN.mod.sniperAim});}
function runUpDesc(k){const u=RUN_UP[k];return fmtL(u.desc,{v:u.v,w:u.w,s:u.s,m:RUN.maxLives});}
// the opponents of a stage: stronger grades the further you go (the secret 999 species never shows up)
function runOpp(s,n){
  const boss=runBoss(s),lo=boss?Math.min(4,2+Math.floor(s/10)):s<=2?0:s<=4?0:s<=7?1:2,hi=boss?4:s<=2?1:s<=4?2:s<=7?3:4;
  let pool=Object.keys(RAR).filter(k=>k!=='auk'&&TYPES[k]&&RAR[k]>=lo&&RAR[k]<=hi);if(!pool.length)pool=['basic'];
  const out=[];pool=pool.slice();while(out.length<n){if(!pool.length)pool=out.slice();const i=(Math.random()*pool.length)|0;out.push(pool.splice(i,1)[0]);}
  if(boss)out.sort((a,b)=>RAR[b]-RAR[a]);return out;}
function runModPick(s,last){if(s===1||runBoss(s))return null;const ks=Object.keys(RUN_MOD).filter(k=>k!==last);return ks[(Math.random()*ks.length)|0];}
// a stage's opponent and twist are rolled once and kept (a lost stage is replayed against the same team)
function runPrep(c){const n=Math.max(1,Math.min(4,save.set.size|0||3));
  if(!c.opp||c.opp.length!==n||!c.opp.every(k=>TYPES[k]))c.opp=runOpp(c.st,n);
  if(c.mod!==null&&c.mod!==undefined&&!RUN_MOD[c.mod])c.mod=undefined;
  if(c.mod===undefined)c.mod=runModPick(c.st,c.lastMod);
  return c;}
function runNew(){save.run.cur=runPrep({st:1,lives:RUN.lives,ups:{},earned:0,mod:undefined,opp:null,pend:null});save.run.last=null;persist();return save.run.cur;}
// draw 3 different upgrades (weighted by rarity, never one that is already at its maximum, no extra life when the hearts are full)
function runDraw(c,n){const ups=c.ups||{},pool=Object.keys(RUN_UP).filter(k=>(ups[k]||0)<RUN_UP[k].max&&(k!=='life'||c.lives<RUN.maxLives)),out=[];
  while(out.length<(n||3)&&pool.length){let t=0;for(const k of pool)t+=RUN.w[RUN_UP[k].r];let x=Math.random()*t,i=0;for(;i<pool.length-1;i++){x-=RUN.w[RUN_UP[pool[i]].r];if(x<0)break;}out.push(pool.splice(i,1)[0]);}
  return out;}
function runPick(k){const c=runCur();if(!c||!c.pend||!c.pend.includes(k)||!RUN_UP[k])return false;
  c.ups[k]=Math.min(RUN_UP[k].max,(c.ups[k]||0)+1);if(k==='life')c.lives=Math.min(RUN.maxLives,c.lives+RUN_UP.life.v);
  c.pend=null;runPrep(c);persist();return true;}
// the rolled twist of a stage survives a reload: null = no twist (stage 1, bosses), a key = that twist
function runFix(){const c=runCur();if(!c)return;for(const k in c.ups){if(!RUN_UP[k])delete c.ups[k];else c.ups[k]=Math.min(RUN_UP[k].max,c.ups[k]);}c.lives=Math.min(RUN.maxLives,c.lives);if(c.pend&&!c.pend.every(k=>RUN_UP[k]))c.pend=c.pend.filter(k=>RUN_UP[k]);if(c.pend&&!c.pend.length)c.pend=null;runPrep(c);}
function runQuit(){const c=runCur();if(!c)return;save.run.last={st:c.st,cleared:c.st-1,earned:c.earned,ups:Object.assign({},c.ups)};save.run.runs++;save.run.cur=null;persist();}
function runCfg(c){const s=c.st,boss=runBoss(s),m=c.mod,first=m==='first3',d=runDiff(s),hearts='♥'.repeat(c.lives),
    tw=boss?'👑 '+__L('보스'):m?runModIco(m)+' '+runModName(m):'';
  return {mode:'run',size:c.opp.length,time:first?0:Math.min(save.set.time||RUN.time,RUN.time),diff:d,oppTypes:c.opp.slice(),oppName:runStop(s),label:runStop(s),
    cond:m&&RUN_MOD[m].cond?RUN_MOD[m].cond:null,run:{st:s,mod:m,boss},
    tag:fmtL('🧊 원정 {s}단계',{s})+(tw?' · '+tw:'')+' · '+hearts};}
function runGo(){const c=runCur();if(!c||c.pend)return;runPrep(c);persist();SFX.init();SFX.ui();startMatch(runCfg(c));}
// in a match: the upgrades sit on top of each skater's personality / stick (multipliers multiply, ranges add), goalies get their own reflexes
function runTT(base,m){const o=Object.assign({},base||{});for(const k in m){if(k==='dashCd'||k==='otw'||k==='reach')o[k]=(o[k]||0)+m[k];else o[k]=(o[k]||1)*m[k];}return o;}
function runMine(ups,cap){const n=k=>ups[k]||0,P=(v,c)=>Math.pow(1+v/100,c),m={};
  if(n('pow')){m.pow=P(RUN_UP.pow.v,n('pow'));m.tap=m.pow;}
  if(n('chg'))m.chg=P(RUN_UP.chg.v,n('chg'));
  if(n('aim')){m.spread=Math.pow(1-RUN_UP.aim.v/100,n('aim'));m.spread80=m.spread;}
  if(n('pass'))m.pass=P(RUN_UP.pass.v,n('pass'));
  if(n('dash'))m.dashCd=-RUN_UP.dash.v*n('dash');
  if(n('poke'))m.steal=P(RUN_UP.poke.v,n('poke'));
  if(n('spd'))m.spd=P(RUN_UP.spd.v,n('spd'));
  if(n('ot')){m.ot=P(RUN_UP.ot.v,n('ot'));m.otw=RUN_UP.ot.w*n('ot');}
  if(n('tech'))m.cd=Math.pow(1-RUN_UP.tech.v/100,n('tech'));
  if(cap&&n('ace')){const A=RUN_UP.ace;m.spd=(m.spd||1)*(1+A.s/100);m.pow=(m.pow||1)*(1+A.v/100);m.tap=(m.tap||1)*(1+A.v/100);m.chg=(m.chg||1)*(1+A.v/100);}
  return m;}
function runTheirs(r){const s=r.st,m={},E=runEndless(s),mul=(k,v)=>{m[k]=(m[k]||1)*v;};
  if(r.boss){mul('spd',RUN.boss.spd);mul('pow',RUN.boss.pow);mul('tap',RUN.boss.pow);mul('chg',RUN.boss.chg);}
  if(r.mod==='fast')mul('spd',1+RUN.mod.fast/100);
  if(r.mod==='sniper'){mul('pow',1+RUN.mod.sniper/100);mul('tap',1+RUN.mod.sniper/100);mul('spread',1-RUN.mod.sniperAim/100);}
  if(E.spd)mul('spd',1+E.spd/100);if(E.pow){mul('pow',1+E.pow/100);mul('tap',1+E.pow/100);}
  return m;}
function runGk(p,react){const b=p.gkd||G.diff.gk;p.gkd=Object.assign({},b,{react:b.react*react});}   // v51: on top of the goalie card
function runMatchStart(cfg){
  G.runGT=0;if(!cfg||cfg.mode!=='run'||!cfg.run||!G.mine)return;const c=runCur(),ups=(c&&c.ups)||{},r=cfg.run;
  const mine=G.pengs.filter(p=>p.team===G.mine&&!p.goalie),theirs=G.pengs.filter(p=>p.team===G.mine.opp&&!p.goalie),cap=mine[0];
  for(const p of mine){const m=runMine(ups,p===cap);if(Object.keys(m).length)p.tt=runTT(ttOf(p),m);}
  const tm=runTheirs(r);if(Object.keys(tm).length)for(const p of theirs)p.tt=runTT(ttOf(p),tm);
  const gm=G.pengs.find(p=>p.goalie&&p.team===G.mine),go=G.pengs.find(p=>p.goalie&&p.team===G.mine.opp);
  if(gm&&ups.gk)runGk(gm,Math.pow(1-RUN_UP.gk.v/100,ups.gk));
  if(go&&(r.boss||r.mod==='wall'))runGk(go,(r.boss?1-RUN.boss.gk/100:1)*(r.mod==='wall'?1-RUN.mod.wall/100:1));
  if(ups.lead)G.mine.score+=RUN_UP.lead.v;
  if(r.mod==='behind'){G.mine.opp.score+=1;if(G.hype)G.hype.wasBehind=true;}
  if(r.mod==='golden'&&!save.set.events)G.evT=1e9;   // events switched off in 설정: only the golden pucks of this twist, no seals / gusts
  updateScoreHud();
}
function runStep(dt){const r=G.cfg&&G.cfg.mode==='run'&&G.cfg.run;if(!r||r.mod!=='golden')return;
  G.runGT-=dt;if(G.runGT<=0){G.runGT=RUN.goldEvery;if(!(G.goldenT>0))evStart('golden');}}
function runFirstDone(){const r=G.cfg&&G.cfg.mode==='run'&&G.cfg.run;return !!(r&&r.mod==='first3'&&G.mine&&(G.mine.score>=RUN.first||G.mine.opp.score>=RUN.first));}
// after the match (once per result): reward on a win, a life on a loss, the record
function runAfter(R,win,draw){
  if(R.run)return R.run;const c=runCur(),cfg=G.cfg,s=cfg&&cfg.run?cfg.run.st:0,o={st:s,win,draw,pay:0,best:false};R.run=o;
  if(!c||c.st!==s)return o;
  if(win){o.pay=runPay(s,c);c.earned+=o.pay;save.run.wins++;if(s>save.run.best){save.run.best=s;o.best=true;}
    c.lastMod=c.mod;c.st=s+1;c.mod=undefined;c.opp=null;runPrep(c);c.pend=runDraw(c,3);if(!c.pend.length)c.pend=null;o.pend=!!c.pend;}
  else if(!draw){c.lives--;o.lives=c.lives;if(c.lives<=0){o.over=true;save.run.last={st:s,cleared:s-1,earned:c.earned,ups:Object.assign({},c.ups)};save.run.runs++;save.run.cur=null;}}
  else o.lives=c.lives;
  return o;}
function runResult(R,win,draw){const o=runAfter(R,win,draw),s=o.st,boss=runBoss(s),c=runCur(),btns=[],go=()=>goScreen('sRun');
  const x={extra:o.pay,extraName:o.pay?fmtL('🧊 원정 {s}단계 보상',{s}):'',title:'',note:'',btns};
  if(win){x.title=boss?__L('👑 보스 격파!'):fmtL('🧊 {s}단계 돌파!',{s});
    x.note=(o.best?__L('🏅 최고 기록 갱신!')+' ':'')+(o.pend?fmtL('강화 하나를 고르고 {n}단계 <b>{stop}</b>(으)로!',{n:s+1,stop:runStop(s+1)}):fmtL('다음은 {n}단계 <b>{stop}</b>',{n:s+1,stop:runStop(s+1)}));
    btns.push([o.pend?__L('🎁 강화 고르기'):__L('▶ 다음 단계'),go]);}
  else if(o.over){x.title=__L('원정 끝');x.note=fmtL('{s}단계까지 왔어요 · 최고 기록 {b}단계',{s,b:save.run.best});btns.push([__L('📜 원정 결과'),go]);}
  else{x.title=draw?__L('무승부…'):fmtL('남은 목숨 {n}',{n:'♥'.repeat(Math.max(0,o.lives|0))});x.note=fmtL('<b>{stop}</b> 팀에 다시 도전해요',{stop:runStop(s)});btns.push([__L('▶ 다시 도전'),go]);}
  return x;}
// ---------- the 🧊 run screen ----------
let runQuitArm=0;
function runRoute(s){const a=Math.max(1,s-2),b=a+6;let h='<div class="run-route" aria-hidden="true">';
  for(let i=a;i<=b;i++){const cls=(i<s?'done':i===s?'cur':'lock')+(runBoss(i)?' boss':'');h+='<div class="rr-n '+cls+'"><i>'+(i<s?'✓':runBoss(i)?'👑':i)+'</i></div>';if(i<b)h+='<span class="rr-l'+(i<s?' done':'')+'"></span>';}
  return h+'</div>';}
function runUpsHtml(ups){const ks=Object.keys(ups||{}).filter(k=>ups[k]>0&&RUN_UP[k]);if(!ks.length)return '';
  return '<div class="run-ups">'+ks.map(k=>'<span class="ru r-'+RUN_UP[k].r+'" title="'+RUN_UP[k].name+'">'+RUN_UP[k].ico+(ups[k]>1?'<b>×'+ups[k]+'</b>':'')+'</span>').join('')+'</div>';}
function runCardHtml(k,c){const u=RUN_UP[k],n=(c.ups&&c.ups[k])||0;
  return '<button class="run-card r-'+u.r+'" data-up="'+k+'"><em class="rc-r">'+RUN_RN[u.r]+'</em><i class="rc-i">'+u.ico+'</i><b>'+u.name+'</b><span>'+runUpDesc(k)+'</span><small>'+fmtL('보유 {n} / {m}',{n,m:u.max})+'</small></button>';}
function runStageHtml(c){const s=c.st,boss=runBoss(s),E=runEndless(s),dn={easy:__L('쉬움'),normal:__L('보통'),hard:__L('어려움')},m=c.mod;
  let h='<div class="run-stage'+(boss?' boss':'')+'"><div class="rs-k"><b>'+fmtL('{s}단계',{s})+'</b> '+runStop(s)+(boss?' <em class="rs-boss">👑 '+__L('보스')+'</em>':'')+'</div>';
  h+='<div class="rs-opp">'+c.opp.map(k=>'<span class="ro" style="--gc:'+GRADES[RAR[k]||0].c+'">'+TYPES[k].name+'</span>').join('')+'</div>';
  if(boss)h+='<div class="rs-mod"><i>👑</i><span><b>'+__L('보스 팀')+'</b>'+fmtL('상대 속도 +{a}% · 슛 위력 +{b}% · 충전 +{c}% · 골키퍼 반응 시간 -{d}%',{a:Math.round((RUN.boss.spd-1)*100),b:Math.round((RUN.boss.pow-1)*100),c:Math.round((RUN.boss.chg-1)*100),d:RUN.boss.gk})+'</span></div>';
  if(m)h+='<div class="rs-mod"><i>'+runModIco(m)+'</i><span><b>'+runModName(m)+'</b>'+runModDesc(m)+'</span></div>';
  if(E.spd||E.pow)h+='<div class="rs-mod"><i>🌌</i><span><b>'+__L('끝없는 빙원')+'</b>'+fmtL('상대 속도 +{a}% · 슛 위력 +{b}%',{a:E.spd,b:E.pow})+'</span></div>';
  h+='<div class="rs-meta"><span>'+__L('난이도')+' <b>'+dn[runDiff(s)]+'</b></span><span>'+(m==='first3'?fmtL('{n}골 먼저',{n:RUN.first}):fmtL('{m}분 경기',{m:Math.round(Math.min(save.set.time||RUN.time,RUN.time)/60)}))+'</span><span class="rs-pay">'+fmtL('이기면 +{p} P',{p:runPay(s,c)})+'</span></div></div>';
  return h;}
function renderRun(){const el=$('#runBody'),ft=$('#runFoot');if(!el)return;const c=runCur(),R=save.run;runQuitArm=0;
  $('#runBest').innerHTML=R.best?fmtL('🏅 최고 <b>{b}</b>단계',{b:R.best}):'';
  let h='',f='';
  if(!c){
    h+='<div class="run-intro"><div class="ri-hero">🧊</div><ul>'
      +'<li>'+__L('이길 때마다 강화 3장 중 하나를 골라 팀이 점점 강해져요')+'</li>'
      +'<li>'+__L('단계마다 눈보라 · 골든 퍽 · 역전 드라마 같은 변수가 생겨요')+'</li>'
      +'<li>'+fmtL('5단계마다 보스 팀 · 목숨은 {h}',{h:'♥'.repeat(RUN.lives)})+'</li>'
      +'<li>'+fmtL('이기면 포인트 (1단계 +{a} P → 10단계 +{b} P)',{a:runPay(1,null),b:runPay(10,null)})+'</li></ul></div>';
    const L=R.last;if(L)h+='<div class="run-last"><b>'+__L('지난 원정')+'</b><span>'+fmtL('{c}단계 돌파 · +{p} P',{c:L.cleared|0,p:L.earned|0})+'</span>'+runUpsHtml(L.ups)+'</div>';
    f='<button class="btn primary" id="runStart">'+__L('▶ 원정 시작')+'</button>';
  }else{
    runPrep(c);
    h+=runRoute(c.st)+'<div class="run-st"><span class="run-h">'+'♥'.repeat(c.lives)+'<s>'+'♥'.repeat(Math.max(0,RUN.maxLives-c.lives))+'</s></span><span>'+fmtL('받은 보상 {p} P',{p:c.earned})+'</span></div>'+runUpsHtml(c.ups);
    if(c.pend){h+='<div class="run-pick-h">'+__L('🎁 강화를 하나 고르세요')+'</div><div class="run-cards">'+c.pend.map(k=>runCardHtml(k,c)).join('')+'</div>';}
    else{h+=runStageHtml(c);f='<button class="btn primary" id="runGo">'+__L('▶ 출발')+'</button><button class="btn small run-quit" id="runQuit">'+__L('원정 포기')+'</button>';}
  }
  el.innerHTML=h;ft.innerHTML=f;
  const st=$('#runStart');if(st)st.onclick=()=>{SFX.init();SFX.ui();runNew();renderRun();};
  const g=$('#runGo');if(g)g.onclick=()=>runGo();
  const q=$('#runQuit');if(q)q.onclick=()=>{SFX.ui();if(!runQuitArm){runQuitArm=1;q.textContent=__L('한 번 더 누르면 포기해요');q.classList.add('arm');return;}runQuit();renderRun();};
  el.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{if(el.classList.contains('picking'))return;const k=b.dataset.up;el.classList.add('picking');b.classList.add('picked');SFX.init();SFX.win();vib([20,30,40]);
    setTimeout(()=>{el.classList.remove('picking');if(runPick(k))hypeToast(RUN_UP[k].ico+' '+RUN_UP[k].name+' · '+runUpDesc(k));renderRun();},save.set.motion?60:520);});
  runMenu();}
// home: one card under the tiles (portrait; landscape reaches it through 모든 경기 모드)
function runMenu(){const m=$('#menuRun');if(!m)return;const c=runCur(),R=save.run;
  const sub=c?(c.pend?fmtL('{s}단계 · 강화를 골라 주세요',{s:c.st-1}):fmtL('{s}단계 {stop} · {h} · 이어하기',{s:c.st,stop:runStop(c.st),h:'♥'.repeat(c.lives)})):(R.best?fmtL('이길수록 강해지는 연속 도전 · 최고 {b}단계',{b:R.best}):__L('이길수록 강해지는 연속 도전'));
  m.innerHTML='<i class="ic">🧊</i><span class="mr-t"><b>'+__L('펭귄 원정')+'</b>'+(c?'<em>'+(c.pend?'🎁':'▶')+'</em>':'')+'</span><span class="mr-s">'+sub+'</span><i class="chev"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg></i>';
  m.classList.toggle('live',!!c);}
try{runFix();}catch(e){}
