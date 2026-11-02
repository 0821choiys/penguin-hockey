
/* ================= HYPE: goal feel, combos, tension, replay, mastery XP, goals, records ================= */
const COMBO_T=6,CB_CD={pass:1.5,passShot:2,power:1.6,steal:2.5,save:1.5,goal:0};
const MX=10,MS_STAT=.03,XP_NEED=lv=>50+30*lv;
const TRAITS=[{lv:3,name:'빠른 충전',desc:'슛 충전 속도 +12%'},{lv:6,name:'정밀 슛',desc:'슛 오차 -40%'},{lv:9,name:'불굴',desc:'넘어진 뒤 회복 -30%'}];
function mxInfo(k){let xp=(save.xp&&save.xp[k])|0,lv=0;while(lv<MX&&xp>=XP_NEED(lv)){xp-=XP_NEED(lv);lv++;}return{lv,cur:xp,need:lv>=MX?0:XP_NEED(lv)};}
function grantXp(k,amt){const b=mxInfo(k);save.xp[k]=Math.min(99999,(save.xp[k]|0)+Math.max(0,amt));const a=mxInfo(k);return{type:k,gain:amt,from:b.lv,to:a.lv,b,a};}
const vib=p=>{try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}};
function hypeNew(){return{combo:{n:0,t:0,max:0},cbCd:{},streak:0,maxStreak:0,conceded:0,recv:null,rec:[],recAcc:0,passes:0,power:0,teamPlay:0,clutch:0,saves:0,trailLate:false,tl:0,lastSec:-1,otShown:false,ringT:0,scorer:null,lastPass:'',lastPassT:-9,flagC3:false,flagS2:false,doneAtStart:null};}

/* ---------- toast / big late-game number ---------- */
function hypeToast(txt){const t=$('#toast');t.textContent=txt;t.classList.remove('on');void t.offsetWidth;t.classList.add('on');clearTimeout(hypeToast.t);hypeToast.t=setTimeout(()=>t.classList.remove('on'),1800);}
function lateNum(n){const e=$('#late');e.textContent=n;e.classList.remove('on');void e.offsetWidth;e.classList.add('on');SFX.tick(n<=3?3:0);vib(n<=3?[25]:[8]);}

/* ---------- combo ---------- */
function cbAdd(kind,label){
  const h=G.hype;if(!h||!G.mine||!G.cfg||G.cfg.mode==='demo'||G.state==='over')return false;
  if(G.state!=='play'&&G.state!=='goal')return false;
  const now=G.t;if(CB_CD[kind]&&h.cbCd[kind]&&now-h.cbCd[kind]<CB_CD[kind])return false;h.cbCd[kind]=now;
  const c=h.combo;if(c.t<=0)c.n=0;c.n++;c.t=COMBO_T;c.max=Math.max(c.max,c.n);
  if(c.n>=3&&!h.flagC3){h.flagC3=true;gp('combo3',1);}
  const n=c.n,e=$('#combo');
  $('#cbK').textContent=label||'';
  $('#cbN').textContent=n>=8?'MAX COMBO!':n>=5?'SUPER COMBO!':n>=2?'COMBO x'+n:'';
  e.className='on '+(n>=8?'c8':n>=5?'c5':n>=3?'c3':n>=2?'c2':'c1');void e.offsetWidth;e.classList.add('hpop');
  if(n>=2){(n>=5?SFX.shot(1):SFX.tick(Math.min(3,Math.floor(n/2))));if(n>=5)vib([20,20,30]);}
  return true;
}
function comboHide(){const e=$('#combo');e.className='';}
function comboBar(){const h=G.hype,e=$('#cbBar');if(!h)return;if(h.combo.t>0&&h.combo.n>=2)e.style.width=(h.combo.t/COMBO_T*100)+'%';}

/* ---------- goals (daily / long term) ---------- */
const GDEFS={
  match:{name:'경기 1회 완료',key:'matches',n:1,pts:15,xp:20},
  pass5:{name:'패스 5회 성공',key:'passes',n:5,pts:20,xp:25},
  power3:{name:'강슛 3회 사용',key:'power',n:3,pts:20,xp:25},
  goal2:{name:'2골 이상 득점',key:'goals',n:2,pts:25,xp:30},
  tourwin:{name:'토너먼트에서 한 경기 승리',key:'tourWin',n:1,pts:30,xp:40},
  teamplay:{name:'패스 후 슛으로 득점 (TEAM PLAY)',key:'teamPlay',n:1,pts:25,xp:30},
  typegame:{name:'지정 펭귄으로 경기 완료',key:'typeGame',n:1,pts:20,xp:30,typed:true},
  winmid:{name:'보통 이상 난이도에서 승리',key:'winMid',n:1,pts:30,xp:35},
  combo3:{name:'콤보 x3 달성',key:'combo3',n:1,pts:25,xp:30},
  streak2:{name:'연속 2골 득점',key:'streak2',n:1,pts:25,xp:30}
};
const LDEFS=[
  {id:'L1',name:'펭귄 5종 모두 수집',n:5,pts:100,prog:()=>save.types.length},
  {id:'L2',name:'누적 50골 달성',n:50,pts:60,prog:()=>save.cum.goals},
  {id:'L3',name:'누적 20승 달성',n:20,pts:80,prog:()=>save.cum.wins},
  {id:'L4',name:'최장 콤보 8 (MAX COMBO) 달성',n:8,pts:70,prog:()=>save.rec.maxCombo},
  {id:'L5',name:'숙련도 Lv10 펭귄 만들기',n:MX,pts:100,prog:()=>Math.max(...Object.keys(TYPES).map(k=>mxInfo(k).lv))},
  {id:'L6',name:'토너먼트 우승 3회',n:3,pts:120,prog:()=>save.stats.tourClears},
  {id:'L7',name:'CLUTCH GOAL 3회',n:3,pts:80,prog:()=>save.cum.clutch},
  {id:'L8',name:'누적 패스 성공 200회',n:200,pts:70,prog:()=>save.cum.passes},
  {id:'L9',name:'어려움 난이도 5승',n:5,pts:120,prog:()=>save.cum.winHard},
  {id:'L10',name:'일일 목표 15개 완료',n:15,pts:100,prog:()=>save.cum.dailyDone}
];
function gName(g){const d=GDEFS[g.id];return g.t&&d.typed?TYPES[g.t].name+'로 경기 완료':d.name;}
function dayNum(){const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);}
function goalsEnsure(){
  const g=save.goals,now=Date.now();let tamper=false,changed=false;
  if(save.clk&&now<save.clk-300000)tamper=true;                       // clock moved backwards: no refresh
  g.list=g.list.filter(x=>GDEFS[x.id]);
  const dn=dayNum();
  if(!tamper&&(g.list.length<3||(dn>g.day&&now-g.ts>=12*3600*1000))){   // new set at most once per 12h of real elapsed time
    let s=((dn+7)*2654435761)>>>0;const rnd=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
    const ids=Object.keys(GDEFS),pick=[];
    while(pick.length<3){const id=ids[Math.floor(rnd()*ids.length)];if(!pick.includes(id))pick.push(id);}
    g.list=pick.map(id=>{const o={id,t:'',p:0,c:false};if(GDEFS[id].typed){const own=save.types;o.t=own[Math.floor(rnd()*own.length)];}return o;});
    g.day=dn;g.ts=now;changed=true;
  }
  if(now>save.clk){save.clk=now;changed=true;}
  if(changed)persist();
  return{tamper};
}
function gp(key,amt,t){
  amt=amt||1;if(save.cum[key]!==undefined)save.cum[key]=Math.min(999999,save.cum[key]+amt);
  goalsEnsure();
  for(const g of save.goals.list){const d=GDEFS[g.id];if(d.key!==key||g.c)continue;if(d.typed&&g.t!==t)continue;g.p=Math.min(d.n,g.p+amt);}
}
function claimGoal(i){
  goalsEnsure();const g=save.goals.list[i];if(!g)return;const d=GDEFS[g.id];
  if(g.c||g.p<d.n){return;}
  g.c=true;save.points+=d.pts;const r=grantXp(save.type,d.xp);save.cum.dailyDone++;persist();SFX.win();vib([30,30,60]);
  hypeToast('+'+d.pts+'P · +'+d.xp+'XP'+(r.to>r.from?' · LEVEL UP!':''));$('#ptsN').textContent=save.points;renderGoals();hypeMenuRefresh();
}
function claimLong(id){
  const L=LDEFS.find(x=>x.id===id);if(!L||save.long[id]||L.prog()<L.n)return;
  save.long[id]=true;save.points+=L.pts;persist();SFX.win();vib([30,30,60]);hypeToast('+'+L.pts+'P');$('#ptsN').textContent=save.points;renderGoals();hypeMenuRefresh();
}
function claimable(){goalsEnsure();let n=0;for(const g of save.goals.list)if(!g.c&&g.p>=GDEFS[g.id].n)n++;for(const L of LDEFS)if(!save.long[L.id]&&L.prog()>=L.n)n++;return n;}
function hypeMenuRefresh(){
  try{
    goalsEnsure();const n=claimable(),b=$('#goalBadge');if(b){b.textContent=n?n:'';b.style.display=n?'inline-block':'none';}
    const m=$('#menuGoals');if(m)m.innerHTML=save.goals.list.map(g=>{const d=GDEFS[g.id];return '<span class="gchip'+(g.c?' done':g.p>=d.n?' rdy':'')+'">'+(g.c?'✔ ':g.p>=d.n?'🎁 ':'')+gName(g)+' '+g.p+'/'+d.n+'</span>';}).join('');
  }catch(e){}
}

/* ---------- records ---------- */
function recUpdate(win,ms,os,cfg){
  const h=G.hype,r=save.rec,out=[];
  const chk=(k,v,label)=>{if(v>r[k]){if(v>0)out.push(label);r[k]=Math.min(9999,v);}};
  chk('maxGoals',ms,'최다 득점');chk('maxStreak',h.maxStreak,'최다 연속 득점');chk('maxCombo',h.combo.max,'최장 콤보');chk('maxMargin',win?ms-os:0,'최고 득점 차이');chk('maxPass',h.passes,'최다 패스 성공');
  const d=cfg.diff||'normal';if(r.diff[d]){r.diff[d][1]++;if(win)r.diff[d][0]++;}
  const k=save.type;if(!r.type[k])r.type[k]=[0,0];r.type[k][0]++;r.type[k][1]+=ms;
  return out;
}

/* ---------- end of match: XP, goals, records ---------- */
function hypeMatchEnd(win,draw,ms,os,cfg){
  const h=G.hype,diff=cfg.diff||'normal',out={xp:[],recs:[],goalsDone:[],tags:[],cb:h.combo.max};
  const size=Math.max(1,cfg.size|0),ov0=teamOvr(size),xm={easy:.8,normal:1,hard:1.25}[diff]||1;
  const base=(win?30:draw?18:12)+ms*8+h.passes*2+Math.min(30,h.combo.max*4);
  const share={};squadTypes(size).forEach((k,i)=>{if(k)share[k]=Math.max(share[k]||0,i===0?1:.5);});
  let lead=null;
  for(const k of Object.keys(share)){const r=grantXp(k,Math.round(base*xm*share[k]));out.xp.push(r);if(r.to>r.from&&(!lead||k===save.type))lead=r;}
  if(lead)save.growth={type:lead.type,from:lead.from,to:lead.to,ov0,ov1:teamOvr(size)};
  gp('matches',1);gp('typeGame',1,save.type);
  if(win){gp('wins',1);if(diff!=='easy')gp('winMid',1);if(diff==='hard')gp('winHard',1);if(cfg.mode==='tour')gp('tourWin',1);}
  out.recs=recUpdate(win,ms,os,cfg);
  if(win&&diff==='hard')out.tags.push('GIANT KILLER!');
  if(win&&h.trailLate)out.tags.push('COMEBACK WIN!');
  if(win&&h.conceded===0&&ms>0)out.tags.push('CLEAN SHEET');
  goalsEnsure();const before=h.doneAtStart||[];
  save.goals.list.forEach((g,i)=>{if(g.p>=GDEFS[g.id].n&&!g.c&&!before[i])out.goalsDone.push(gName(g));});
  const nx=save.goals.list.find(g=>!g.c&&g.p<GDEFS[g.id].n);
  out.next=nx?'다음 목표: '+gName(nx)+' ('+nx.p+'/'+GDEFS[nx.id].n+')':'오늘의 목표를 모두 달성했어요! 🎉';
  return out;
}
async function hypeResultAnim(){
  try{
    const wait=ms=>new Promise(r=>setTimeout(r,ms));
    for(const e of [...document.querySelectorAll('#rSub .cu')]){
      const to=+e.dataset.to,t0=performance.now(),d=Math.min(850,280+to*9);
      await new Promise(res=>{const f=now=>{const k=Math.min(1,(now-t0)/d);e.textContent=Math.round(to*k*(2-k));if(k<1)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});
      SFX.tick(0);await wait(120);
    }
    for(const row of [...document.querySelectorAll('#rSub .xprow')]){
      const bar=row.querySelector('.xpb i'),lv=row.dataset.lv==='1',fin=+row.dataset.a;
      bar.style.width=(lv?100:fin)+'%';await wait(750);
      if(lv){const fx=row.querySelector('.lvfx');SFX.win();vib([30,30,80]);row.querySelector('.pc').classList.add('lvup');fx.classList.add('on');
        bar.style.transition='none';bar.style.width='0%';void bar.offsetWidth;bar.style.transition='';bar.style.width=fin+'%';await wait(700);}
    }
    const nr=document.querySelector('#rSub .newrec');if(nr){nr.classList.add('on');SFX.win();vib([30,40,30,40,120]);}
  }catch(e){}
}

/* ---------- goals / records screen ---------- */
let gTab='day';
function renderGoals(){
  const el=$('#gBody');if(!el)return;$('#ptsN').textContent=save.points;
  document.querySelectorAll('#gTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===gTab));
  const info=goalsEnsure();let h='';
  if(gTab==='day'){
    h+='<div class="lbl" style="text-align:center">오늘의 목표 · 완료하면 아래 버튼으로 보상을 받아요 (한 번만 수령)</div>';
    save.goals.list.forEach((g,i)=>{const d=GDEFS[g.id],ok=g.p>=d.n;
      h+='<div class="grow'+(g.c?' done':ok?' rdy':'')+'"><div class="gi"><b>'+gName(g)+'</b><div class="pbar"><i style="width:'+(g.p/d.n*100)+'%"></i></div><small>'+g.p+' / '+d.n+' · 보상 ⭐'+d.pts+'P + '+d.xp+'XP</small></div>'+(g.c?'<span class="gbtn">수령 완료 ✔</span>':ok?'<button class="btn small primary" data-claim="'+i+'">🎁 받기</button>':'<span class="gbtn">진행 중</span>')+'</div>';});
    h+='<div class="odds">목표는 하루에 한 번 새로 나와요. 기기 날짜를 되돌리면 갱신되지 않아요'+(info.tamper?' <b>(현재 시계가 되돌려진 것으로 감지됨)</b>':'')+'.<br>오프라인 게임이라 날짜 변경을 완전히 막을 수는 없어서, 보상은 작게 설정했어요.</div>';
  }else if(gTab==='long'){
    h+='<div class="lbl" style="text-align:center">장기 목표 · 천천히 도전해 보세요</div>';
    for(const L of LDEFS){const p=Math.min(L.n,L.prog()),ok=p>=L.n,c=save.long[L.id];
      h+='<div class="grow'+(c?' done':ok?' rdy':'')+'"><div class="gi"><b>'+L.name+'</b><div class="pbar"><i style="width:'+(p/L.n*100)+'%"></i></div><small>'+p+' / '+L.n+' · 보상 ⭐'+L.pts+'P</small></div>'+(c?'<span class="gbtn">수령 완료 ✔</span>':ok?'<button class="btn small primary" data-lclaim="'+L.id+'">🎁 받기</button>':'<span class="gbtn">진행 중</span>')+'</div>';}
  }else{
    const r=save.rec,dn={easy:'쉬움',normal:'보통',hard:'어려움'};
    h+='<div class="recgrid">'+[['최다 득점',r.maxGoals+'골'],['최다 연속 득점',r.maxStreak+'골'],['최장 콤보','x'+r.maxCombo],['최고 득점 차이',r.maxMargin+'점'],['최다 패스 성공',r.maxPass+'회'],['토너먼트 최고 성적',r.tourBest>=3?'우승 🏆':r.tourBest?r.tourBest+'라운드 클리어':'기록 없음']].map(x=>'<div class="rec"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div>';
    h+='<div class="lbl" style="text-align:center;margin-top:8px">난이도별 승률</div><div class="recgrid">'+['easy','normal','hard'].map(d=>{const a=r.diff[d];return '<div class="rec"><small>'+dn[d]+'</small><b>'+(a[1]?Math.round(a[0]/a[1]*100):0)+'%</b><small>'+a[0]+'승 / '+a[1]+'경기</small></div>';}).join('')+'</div>';
    h+='<div class="lbl" style="text-align:center;margin-top:8px">펭귄별 경기 · 득점 · 숙련도</div><div class="cardrow">'+Object.keys(TYPES).filter(k=>save.types.includes(k)).map(k=>{const a=r.type[k]||[0,0],m=mxInfo(k);return '<div style="--cw:74px;text-align:center">'+cardHtml(k)+'<div style="font-size:12px;margin-top:4px">'+a[0]+'경기 · '+a[1]+'골<br>숙련 Lv.'+m.lv+(m.need?' ('+m.cur+'/'+m.need+')':' MAX')+'</div></div>';}).join('')+'</div>';
  }
  el.innerHTML=h;
  el.querySelectorAll('[data-claim]').forEach(b=>{b.onclick=()=>claimGoal(+b.dataset.claim);});
  el.querySelectorAll('[data-lclaim]').forEach(b=>{b.onclick=()=>claimLong(b.dataset.lclaim);});
}
document.querySelectorAll('#gTabs button').forEach(b=>{b.onclick=()=>{SFX.ui();gTab=b.dataset.t;renderGoals();};});

/* ---------- goal celebration ---------- */
let gRing=null,sRing=null;
{
  const mk=(r0,r1)=>{const m=new T.Mesh(new T.RingGeometry(r0,r1,56),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,depthTest:false,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.08;m.visible=false;scene.add(m);return m;};
  gRing=mk(.9,1.15);sRing=mk(1.0,1.35);
}
function hypeBanner(main,sub,tier,key){
  const b=$('#banner'),s=$('#bannerSub');b.textContent=main;b.className='tier'+tier+(key==='blue'?' b':key==='red'?' r':'');void b.offsetWidth;b.classList.add('on');
  s.innerHTML=sub.map(t=>'<span>'+t+'</span>').join('');s.className=sub.length?'on':'';
  clearTimeout(hypeBanner.t);hypeBanner.t=setTimeout(()=>{b.classList.remove('on');s.className='';},tier>=1?2800:1700);
}
function classifyGoal(tm,sh){
  const h=G.hype,pk=G.puck,cfg=G.cfg,tags=[];
  if(!G.mine||tm!==G.mine||!cfg||cfg.mode==='demo')return{tags,clutch:false,shooter:null};
  const shooter=sh&&sh.by&&sh.by.team===tm?sh.by:null,og=tm.opp.goalie;
  const fresh=!!(shooter&&G.t-sh.t<5&&!sh.deflected);
  if(fresh&&sh.charge>=.7)tags.push('POWER SHOT!');
  if(fresh&&Math.abs(pk.z)>=GW-1.05)tags.push('PERFECT AIM!');
  if(fresh&&og&&Math.abs(og.z-pk.z)>=2.1)tags.push('NICE BREAKAWAY!');
  if(fresh&&h.recv&&h.recv.p===shooter&&sh.t>=h.recv.t&&sh.t-h.recv.t<3.2)tags.push('TEAM PLAY!');
  const late=!!(cfg.time&&((!G.ot&&G.timeLeft<=10)||G.ot)),clutch=late&&(tm.score-1)<=tm.opp.score;
  if(clutch)tags.push('CLUTCH GOAL!');
  if(h.streak>=2)tags.push('HOT STREAK!');
  return{tags,clutch,shooter};
}
function hypeGoal(tm,sh){
  const h=G.hype,cfg=G.cfg,mine=!!(G.mine&&tm===G.mine),real=cfg&&cfg.mode!=='demo',key=tm.key;
  if(real&&G.mine){
    if(mine){h.streak++;h.maxStreak=Math.max(h.maxStreak,h.streak);}
    else{h.streak=0;h.conceded++;h.combo.n=0;h.combo.t=0;comboHide();}
  }
  const info=classifyGoal(tm,sh);let main='GOAL!',sub=[],tier=0;
  const t=info.tags;
  if(t.includes('CLUTCH GOAL!')){main='CLUTCH GOAL!';sub=t.filter(x=>x!==main);tier=Math.min(4,3+(sub.length?1:0));}
  else if(t.length>=3){main='INCREDIBLE!!';sub=t;tier=3;}
  else if(t.length===2){main='SUPER GOAL!';sub=t;tier=2;}
  else if(t.length===1){main=t[0];tier=1;}
  if(mine&&real){
    gp('goals',1);if(t.includes('TEAM PLAY!')){h.teamPlay++;gp('teamPlay',1);}if(info.clutch){h.clutch++;gp('clutch',1);}
    if(h.streak>=2&&!h.flagS2){h.flagS2=true;gp('streak2',1);}
    cbAdd('goal','GOAL');
  }
  // --- feel: hit stop, shake, flash, rings, particles, sound ---
  G.hitStop=Math.max(G.hitStop||0,.05+.035*tier);
  G.cam.shake=Math.max(G.cam.shake,.6+.25*tier);
  const col=key==='blue'?[.35,.65,1]:[1,.38,.45],gx=tm.dir*W;
  const fl=$('#gflash');fl.style.setProperty('--gc',key==='blue'?'rgba(80,150,255,':'rgba(255,90,110,');fl.style.setProperty('--ga',(.28+.1*tier).toFixed(2));fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on');
  gRing.position.set(gx>0?W-.5:-W+.5,.08,0);gRing.material.color.setRGB(col[0],col[1],col[2]);h.ringT=.95;
  for(let i=0;i<50+tier*35;i++){const a=rnd(TAU),s=rnd(3,11)+tier*1.5;emit(gx,rnd(.6,3),rnd(-GW,GW),Math.cos(a)*s*(gx>0?-1:1)*.7,rnd(2,9),Math.sin(a)*s,rnd(.8,1.6),rnd(.2,.5),col[0],col[1],col[2]);}
  SFX.bump(1);SFX.goal();if(tier>=2)SFX.win();if(tier>=1)vib([40,30,70]);
  hypeBanner(main,sub,tier,key);
  const scp=$(key==='blue'?'#sB':'#sR');scp.classList.remove('hpop');void scp.offsetWidth;scp.classList.add('hpop');
  if(info.shooter){h.scorer=info.shooter;popAt(TYPES[info.shooter.type].name+'!',info.shooter.x,2.8,info.shooter.z);}
  // --- slow-motion replay for special goals ---
  G.replay=null;G.goalT0=G.stateT;
  if(mine&&real&&tier>=1&&cfg.mode!=='practice'&&h.rec.length>24){
    const frames=h.rec.slice(-110);hypeSnap(frames);for(let i=0;i<12;i++)frames.push(frames[frames.length-1]);
    const speed=.55,dur=frames.length/(60*speed);
    G.replay={frames,pos:0,speed,start:.95,active:false,done:false,skip:false,dur};
    G.stateT=.95+dur+1.2;G.goalT0=G.stateT;
  }else G.stateT=real?(mine&&tier>=1?3.2:2.6):2.2;
}

/* ---------- replay recording / playback ---------- */
function hypeSnap(arr){const pk=G.puck;arr.push({k:[pk.x,pk.z],p:G.pengs.map(p=>[p.x,p.z,p.heading,p.vx,p.vz])});}
function hypeRecord(dt){
  const h=G.hype;h.recAcc+=dt;let n=0;
  while(h.recAcc>=1/60&&n<3){h.recAcc-=1/60;hypeSnap(h.rec);n++;}
  if(h.recAcc>.2)h.recAcc=0;
  if(h.rec.length>170)h.rec.splice(0,h.rec.length-150);
}
function hypeReplayApply(rp){
  const n=rp.frames.length,i=Math.min(n-1,Math.floor(rp.pos)),f=rp.pos-i,A=rp.frames[i],B=rp.frames[Math.min(n-1,i+1)],pk=G.puck;
  pk.x=A.k[0]+(B.k[0]-A.k[0])*f;pk.z=A.k[1]+(B.k[1]-A.k[1])*f;pk.vx=(B.k[0]-A.k[0])*60;pk.vz=(B.k[1]-A.k[1])*60;pk.ox=pk.x;pk.oz=pk.z;
  G.pengs.forEach((p,j)=>{const a=A.p[j],b=B.p[j];if(!a||!b)return;p.x=a[0]+(b[0]-a[0])*f;p.z=a[1]+(b[1]-a[1])*f;p.heading=a[2]+angDiff(a[2],b[2])*f;p.vx=a[3];p.vz=a[4];p.ox=p.x;p.oz=p.z;});
}
function hypeReplayEnd(){
  const rp=G.replay;if(!rp||!rp.active)return;
  const s=rp.saved,pk=G.puck;pk.x=s.k[0];pk.z=s.k[1];pk.vx=s.k[2];pk.vz=s.k[3];pk.ox=pk.x;pk.oz=pk.z;
  G.pengs.forEach((p,j)=>{const a=s.p[j];p.x=a[0];p.z=a[1];p.heading=a[2];p.vx=a[3];p.vz=a[4];p.ox=p.x;p.oz=p.z;});
  rp.active=false;rp.done=true;document.body.classList.remove('replay');$('#replayTag').classList.remove('on');
  G.stateT=Math.min(G.stateT,1.1);
}
function hypeGoalStep(dt){
  const rp=G.replay;if(!rp||rp.done)return false;
  const el=G.goalT0-G.stateT;
  if(!rp.active&&el>=rp.start){
    const pk=G.puck;rp.saved={k:[pk.x,pk.z,pk.vx,pk.vz],p:G.pengs.map(p=>[p.x,p.z,p.heading,p.vx,p.vz])};
    rp.active=true;rp.pos=0;document.body.classList.add('replay');$('#replayTag').classList.add('on');SFX.whoosh();
  }
  if(!rp.active)return false;
  rp.pos+=dt*60*rp.speed;
  if(rp.skip||rp.pos>=rp.frames.length-1){hypeReplayEnd();return false;}
  hypeReplayApply(rp);return true;
}
function hypeSkipReplay(){if(G.replay&&G.replay.active)G.replay.skip=true;}
addEventListener('keydown',hypeSkipReplay);addEventListener('pointerdown',hypeSkipReplay);

/* ---------- per-frame: recording, combo timer, tension, rings ---------- */
function hypeSlow(s,t){if(G.slow&&G.slow.t>0)return;G.slow={s,t};}
let cmbEl=null;
function hypeFrame(dt){
  const h=G.hype;if(!h||G.view!=='game')return;
  const cfg=G.cfg;
  if(!cmbEl)cmbEl=document.getElementById('combo');
  if(cmbEl)cmbEl.style.visibility=G.state==='goal'?'hidden':'visible';   // never competes with the goal banner
  if(G.state==='play'){
    hypeRecord(dt);
    const c=h.combo;if(c.t>0){c.t-=dt;if(c.t<=0){c.n=0;comboHide();}else comboBar();}
    if(cfg.mode!=='demo'&&cfg.mode!=='practice'&&cfg.mode!=='free'){
      const clk=$('#clock');
      if(cfg.time&&!G.ot){
        const tl=G.timeLeft,lvl=tl<=10?2:tl<=30?1:0;
        if(lvl!==h.tl){h.tl=lvl;clk.classList.toggle('l1',lvl===1);clk.classList.toggle('l2',lvl===2);if(lvl===1)hypeToast('⏱ 30초 남았어요!');}
        const sec=Math.ceil(tl);if(tl<=10&&sec>0&&sec!==h.lastSec){h.lastSec=sec;lateNum(sec);}
        if(tl<=30&&G.mine&&G.mine.score<G.mine.opp.score)h.trailLate=true;
      }else if(G.ot&&!h.otShown){h.otShown=true;const mt=$('#modeTag');mt.textContent='⚡ SUDDEN DEATH';mt.classList.add('sd');clk.classList.remove('l1');clk.classList.add('l2');hypeToast('연장전! 먼저 넣는 팀이 승리');}
    }
  }
  if(h.ringT>0){h.ringT-=dt;const k=1-Math.max(0,h.ringT)/.95;gRing.visible=true;gRing.scale.setScalar(1+k*15);gRing.material.opacity=Math.max(0,(1-k)*.85);if(h.ringT<=0)gRing.visible=false;}
  if(G.state==='goal'&&h.scorer&&!(G.replay&&G.replay.active)){const p=h.scorer;sRing.visible=true;sRing.position.set(p.rx,.09,p.rz);const k=1+.12*Math.sin(G.t*9);sRing.scale.setScalar(k);sRing.material.color.setRGB(1,.85,.25);sRing.material.opacity=.9;}
  else sRing.visible=false;
}
function hypeReset(){
  G.hype=hypeNew();G.hitStop=0;G.slow=null;G.replay=null;
  document.body.classList.remove('replay','chmax');
  for(const id of['#combo','#late','#toast','#replayTag','#gflash'])try{$(id).className='';}catch(e){}
  try{$('#clock').className='';$('#modeTag').classList.remove('sd');$('#bannerSub').className='';gRing.visible=false;sRing.visible=false;}catch(e){}
  try{goalsEnsure();G.hype.doneAtStart=save.goals.list.map(g=>g.p>=GDEFS[g.id].n);}catch(e){}
}
