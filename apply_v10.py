import re,sys
SRC='v9.html';OUT='penguin-hockey-improved.html'
s=open(SRC,encoding='utf-8').read()
def R(old,new,cnt=1):
    global s
    c=s.count(old)
    if c!=cnt:
        print('ANCHOR MISMATCH (%d != %d): %r'%(c,cnt,old[:120]));sys.exit(1)
    s=s.replace(old,new)
def rd(f):return open(f,encoding='utf-8').read()

# ===== B1: the game clock (G.t) kept running while paused -> passes in flight were counted as lost, combo/shot timers expired =====
R("""function step(dt){
  if(G.hitStop>0)""","""function step(dt){
  if(G.paused&&G.view==='game')return;   // nothing (clock, hit-stop, slow-mo) advances while paused
  if(G.hitStop>0)""")


# ===== v10 core module (personalities, arenas, aim preview, comfort settings) =====
R("/* ---- input wiring ---- */",rd('v10_core.js')+"\n/* ---- input wiring ---- */")

# ----- save / settings -----
R("const DEF_SET={size:3,time:180,diff:'normal',tod:'auto',aurora:true,sound:true,quality:'high',assist:true};",
  "const RM0=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);\nconst DEF_SET={size:3,time:180,diff:'normal',tod:'auto',aurora:true,sound:true,quality:'high',assist:true,arena:'auto',vol:'mid',vib:true,shake:RM0?'low':'on',flash:true,motion:RM0};")
R("const save={v:9,","const save={v:10,chalTypes:[],")
R("combo3:0,streak2:0}","combo3:0,streak2:0,cleanWin:0,comeback:0,oneTimer:0}")
R("  if(typeof ss.assist==='boolean')save.set.assist=ss.assist;",
  """  if(typeof ss.assist==='boolean')save.set.assist=ss.assist;
  if(['auto','aurora','blizzard','sunset','final'].includes(ss.arena))save.set.arena=ss.arena;
  if(['low','mid','high'].includes(ss.vol))save.set.vol=ss.vol;
  if(['on','low','off'].includes(ss.shake))save.set.shake=ss.shake;
  for(const k of['vib','flash','motion'])if(typeof ss[k]==='boolean')save.set[k]=ss[k];
  if(Array.isArray(s.chalTypes))save.chalTypes=s.chalTypes.filter((k,i,a)=>typeof k==='string'&&TYPES[k]&&a.indexOf(k)===i).slice(0,8);""")
R("  if(s.v!==9)persist();","  if(s.v!==10)persist();")
R("""  {k:'assist',label:'조준 보조',opts:[[true,'켜기'],[false,'끄기']]}
];""","""  {k:'assist',label:'조준 보조',opts:[[true,'켜기'],[false,'끄기']]},
  {k:'arena',label:'경기장',opts:[['auto','기본'],['aurora','오로라 나이트'],['blizzard','눈보라'],['sunset','선셋 컵'],['final','결승 무대']]},
  {k:'vol',label:'효과음 크기',opts:[['low','작게'],['mid','보통'],['high','크게']]},
  {k:'vib',label:'진동',opts:[[true,'켜기'],[false,'끄기']]},
  {k:'shake',label:'화면 흔들림',opts:[['on','켜기'],['low','약하게'],['off','끄기']]},
  {k:'flash',label:'번쩍임 효과',opts:[[true,'켜기'],[false,'끄기']]},
  {k:'motion',label:'모션 줄이기',opts:[[false,'끄기'],[true,'켜기']]}
];""")
R("if(save.set[sd.k]===o[0])b.classList.add('on');",
  "if(save.set[sd.k]===o[0])b.classList.add('on');\n      if(sd.k==='arena'&&o[0]==='final'&&!save.cleared.tour){b.textContent='결승 무대 🔒';b.onclick=()=>{SFX.init();SFX.ui();flashMsg('🔒 토너먼트에서 우승하면 열려요');};seg.appendChild(b);return;}")
R("if(sd.k==='quality')applyQuality();renderSettings();","if(sd.k==='quality')applyQuality();if(['vol','shake','flash','motion'].includes(sd.k))applyFxSettings();renderSettings();")
R("SFX.setOn(save.set.sound);$('#bSound').textContent=save.set.sound?'🔊':'🔇';\napplyQuality();","SFX.setOn(save.set.sound);$('#bSound').textContent=save.set.sound?'🔊':'🔇';applyFxSettings();\napplyQuality();")
R("const vib=p=>{try{","const vib=p=>{if(!save.set.vib)return;try{")
R("G.cam.shake=Math.max(0,G.cam.shake-dt*1.6);const sh=G.cam.shake*.35;","G.cam.shake=Math.max(0,G.cam.shake-dt*1.6);const sh=G.cam.shake*.35*shakeK();")

# ----- audio: volume level + new cues -----
R("let ctx=null,master=null,nb=null,wind=null,slide=null,crowdL=null,ready=false,on=true,crowdLvl=0;","let ctx=null,master=null,nb=null,wind=null,slide=null,crowdL=null,ready=false,on=true,crowdLvl=0,vol=.7;")
R("master=ctx.createGain();master.gain.value=on?.7:0;","master=ctx.createGain();master.gain.value=on?vol:0;")
R("init,setOn(v){on=v;if(master)master.gain.value=v?.7:0;},","init,setOn(v){on=v;if(master)master.gain.value=v?vol:0;},setVol(x){vol=x;if(master)master.gain.value=on?vol:0;},")
R("    resume(){if(ctx&&ctx.state==='suspended')ctx.resume();},",
  """    pickup(){[880,1175,1568].forEach((f,i)=>tone(f,.12,'triangle',.14,0,i*.06));},
    passBad(cut){tone(cut?250:330,.16,'triangle',.2,cut?130:220);if(cut)noise(.08,900,1,.18);},
    firework(){noise(.32,650,.5,.09,'lowpass');tone(rnd(900,1400),.22,'sine',.035,rnd(300,500));},
    champ(){[523,659,784,1047,784,1047,1319,1568].forEach((f,i)=>tone(f,.32,'triangle',.17,0,i*.13));noise(2.2,1000,.4,.22,'bandpass',.2);},
    resume(){if(ctx&&ctx.state==='suspended')ctx.resume();},""")

# ----- input: held keys survive pause/match start (key-repeat restores them); UI focus never eats game keys -----
R("  if(e.repeat){if(['Space','Tab'].includes(e.code))e.preventDefault();return;}",
  "  if(e.repeat){if(KEYMAP[e.code]&&!input.keys[KEYMAP[e.code]]){input.keys[KEYMAP[e.code]]=true;recomputeKeys();}if(['Space','Tab'].includes(e.code)||KEYMAP[e.code])e.preventDefault();return;}")
R("  hint(true);SFX.init();SFX.resume();\n}","  hint(true);SFX.init();SFX.resume();blurUI();v10MatchStart(cfg);\n}")
R("  if(G.paused){show('sPause');}else{hideAll();}","  if(G.paused){show('sPause');}else{hideAll();blurUI();}")
R("  cfg.teamKey=save.team;G.mode=cfg.mode;",
  "  cfg.teamKey=save.team;G.mode=cfg.mode;\n  cfg.final=!!((cfg.mode==='tour'&&G.tour&&G.tour.round===TOUR.length-1)||(cfg.mode==='trial'&&TRIALS[cfg.kind]&&cfg.round===TRIALS[cfg.kind].rounds.length-1));")
R("  hypeMenuRefresh();leagueMenuRefresh();\n}\nfunction toMenu(){","  hypeMenuRefresh();leagueMenuRefresh();G.arena='classic';\n}\nfunction toMenu(){")

# ----- DIFF: tactical differences (reading, interceptions, one-timers, adapting the aim), not just raw speed -----
R("const TOUR=[","""Object.assign(DIFF.easy,{icpt:.08,oneT:0,adapt:.1});Object.assign(DIFF.easy.gk,{read:.2,out:.35});
Object.assign(DIFF.normal,{icpt:.3,oneT:.3,adapt:.4});Object.assign(DIFF.normal.gk,{read:.22,out:.45});
Object.assign(DIFF.hard,{icpt:.55,oneT:.6,adapt:.7});Object.assign(DIFF.hard.gk,{read:.38,out:.5});
const TOUR=[""")

# ----- shots: whiff, personality, one-timer -----
R("  if(!canHit(p)){p.anim.swing=.55;p.cd.shoot=.18;SFX.whoosh();return false;}","  if(!canHit(p)){p.anim.swing=.55;p.cd.shoot=.18;SFX.whoosh();whiffFx(p);return false;}")
R("  let sp=tap?10.5+pw*.9:lerp(15,27,charge)*(.72+.1*pw);",
  "  let sp=tap?10.5+pw*.9:lerp(15,27,charge)*(.72+.1*pw);\n  const T_=ttOf(p),ot=!p.goalie&&G.t-(p.recvT==null?-9:p.recvT)<OT_WIN;p.recvT=-9;\n  if(!tap)sp*=(T_.pow||1);if(ot)sp*=1.06*(T_.ot||1);")
R("  if(p.tr&&p.tr.precise)spread*=.6;\n","  if(p.tr&&p.tr.precise)spread*=.6;\n  spread*=(T_.spread||1);if(ot)spread*=.55;\n")
R("  registerShot(p,ax,az,tap?0:charge,sp,tap?'tap':'power');",
  "  if(ot&&p.team===G.mine&&G.cfg&&G.cfg.mode!=='demo'){gp('oneTimer',1);cbAdd('passShot','ONE-TIMER');}\n  registerShot(p,ax,az,tap?0:charge,sp,tap?'tap':'power');if(ot&&pk.shot)pk.shot.oneT=true;")
R("  popAt(tap?'톡!':(charge>.8?'쾅!!':'쾅!'),pk.x,1.4,pk.z);","  popAt(ot?'원타이머!':tap?'톡!':(charge>.8?'쾅!!':'쾅!'),pk.x,1.4,pk.z);")
R("p.charge=Math.min(1,p.charge+dt/(.75*(p.tr&&p.tr.charge?.88:1)));","p.charge=Math.min(1,p.charge+dt/(.75*(p.tr&&p.tr.charge?.88:1))*(ttOf(p).chg||1));")
R("p.charging=true;p.charge=Math.min(1,p.charge+dt/.45);","p.charging=true;p.charge=Math.min(1,p.charge+dt/.45*(ttOf(p).chg||1));")
R("p.fall=dur*(p.tr&&p.tr.tough?.7:1);","p.fall=dur*(p.tr&&p.tr.tough?.7:1)*(ttOf(p).fall||1);")
R("if(p.shotGrace>0)continue;let rad=p.r;if(p.goalie&&p.diveT>0)rad=1.1;",
  "if(p.shotGrace>0)continue;let rad=p.r;if(p.goalie&&p.diveT>0)rad=1.1;else if(!p.goalie&&pk.lastTeam&&pk.lastTeam!==p.team&&s0>7){const r2=ttOf(p).reach;if(r2)rad+=r2;}")
R("sp=clamp(d*1.55+7,9,26),tt=d/sp;","sp=clamp(d*1.55+7,9,26)*(ttOf(p).pass||1),tt=d/sp;")
R("p.cd.dash=3.2;burst(","p.cd.dash=3.2+(ttOf(p).dashCd||0);burst(")
R("  if(p.cdBonus&&p.cd.special>3){","  {const c=ttOf(p).cd;if(c&&p.cd.special>3){p.cd.special*=c;p.specMax=p.cd.special;}}\n  if(p.cdBonus&&p.cd.special>3){")
R("function passDone(ps){\n","function passDone(ps){\n  ps.to.recvT=G.t;\n")

# ----- passes: clear success / cut / miss feedback everywhere, target ring during the flight -----
R("  if(G.chain>0&&G.cfg&&G.cfg.challenge&&G.cfg.challenge.kind==='pass')popAt(why==='cut'?'패스 차단!':'패스 실패',ps.from.x,2.2,ps.from.z);","  passFeedback(ps,why);")
R("    else if(p.goalie){G.pass=null;}","    else if(p.goalie){G.pass=null;if(p.team!==ps.from.team)passLost(ps,'cut');}")
R("  if(G.pass&&G.t-G.pass.t>3.5){","  if(G.pass&&(G.t-G.pass.t>3.5||(G.t-G.pass.t>1.2&&Math.hypot(G.puck.vx,G.puck.vz)<2.5))){")
R("      }else{aimArrow.visible=false;passRing.visible=false;}\n",
  "      }else{aimArrow.visible=false;passRing.visible=false;}\n      passRing.material.color.setHex(0x7effa8);\n      if(G.pass&&G.pass.from.team===pl.team&&G.state==='play'){const m=G.pass.to;passRing.visible=true;passRing.position.set(m.rx,.045,m.rz);passRing.scale.setScalar(1.15+.12*Math.sin(G.t*14));passRing.material.color.setHex(0xa8fff0);}\n      aimPreview(pl,pl.charging?humanAim(pl):[0,1]);\n")
R("    const pl=G.player;\n    if(pl&&G.view==='game'){","    const pl=G.player;aimLine.visible=false;aimTgt.visible=false;\n    if(pl&&G.view==='game'){")

# ----- collisions: limit the per-step push-out so overlapping penguins never "pop" (measured: up to 0.47 m in one step) -----
R("A.x-=nx*pen*mb/tm;A.z-=nz*pen*mb/tm;B.x+=nx*pen*ma/tm;B.z+=nz*pen*ma/tm;","const pc=Math.min(pen,.12);A.x-=nx*pc*mb/tm;A.z-=nz*pc*mb/tm;B.x+=nx*pc*ma/tm;B.z+=nz*pc*ma/tm;")

# ----- AI: goalie reads wind-ups & cuts angles; skaters intercept passes, one-time, adapt their aim -----
R("    const k=dist<10?.62:.3,tz=clamp(pk.z*k,-GW+.5,GW-.5);","    const k=dist<10?.62:.3;let tz=clamp(pk.z*k,-GW+.5,GW-.5);\n    const rd=gkRead(p,tm);if(rd)tz=lerp(tz,rd.z,rd.w);")
R("let xt=homeX+d*clamp((14-dist)/14,0,1)*.4,zt;","let xt=homeX+d*clamp((14-dist)/14,0,1)*(gk.out||.4),zt;")
R("    ai.plan={t:rnd(.08,.22),c:gd>13?rnd(.75,1):gd>7?rnd(.45,.75):rnd(.2,.5)};","    ai.plan={t:rnd(.08,.22),c:gd>13?rnd(.75,1):gd>7?rnd(.45,.75):rnd(.2,.5),tz:aiPlanTz(p)};")
R("{const c=ai.plan.c;ai.plan=null;p.charging=false;p.charge=0;aiShoot(p,c);","{const c=ai.plan.c;ai.lastPlanTz=ai.plan.tz;ai.plan=null;p.charging=false;p.charge=0;aiShoot(p,c);")
R("  const tz=side*rnd(1.1,GW-.7)+(Math.random()-.5)*df.aim*5;",
  "  let tz=side*rnd(1.1,GW-.7)+(Math.random()-.5)*df.aim*5;\n  const pl_=p.ai.lastPlanTz;if(pl_!=null){tz=pl_;p.ai.lastPlanTz=null;if(og&&Math.abs(og.z-tz)<1.3&&Math.random()<(df.adapt||0))tz=-Math.sign(tz||1)*rnd(1.1,GW-.7);}")
R("  if(noShoot){ai.cool=rnd(.4,.9);return;}",
  "  if(noShoot){ai.cool=rnd(.4,.9);return;}\n  if(df.oneT&&G.t-(p.recvT==null?-9:p.recvT)<.5&&q>=df.shootQ*.7&&Math.random()<df.oneT){const c=rnd(.3,.5);ai.plan={t:.02,c,tz:aiPlanTz(p)};p.charge=c;p.charging=true;return;}")
R("  if(p===tm.chaser){\n    ai.full=true;ai.mode='chase';","  if(p!==tm.chaser&&aiIntercept(p))return;\n  if(p===tm.chaser){\n    ai.full=true;ai.mode='chase';")

# ----- goal presentation: more situations, graded intensity, opponent goals calmer -----
R("  if(fresh&&h.recv&&h.recv.p===shooter&&sh.t>=h.recv.t&&sh.t-h.recv.t<3.2)tags.push('TEAM PLAY!');",
  """  if(fresh&&h.recv&&h.recv.p===shooter&&sh.t>=h.recv.t&&sh.t-h.recv.t<3.2)tags.push('TEAM PLAY!');
  if(fresh&&sh.oneT)tags.push('ONE-TIMER!');
  if(shooter){h.sg=h.sg||{};h.sg[shooter.idx]=(h.sg[shooter.idx]||0)+1;if(h.sg[shooter.idx]===3)tags.push('HAT TRICK!');}
  if(h.wasBehind&&tm.score===tm.opp.score+1)tags.push('COMEBACK!');""")
R("  if(clutch)tags.push('CLUTCH GOAL!');","  if(G.ot)tags.push('OT WINNER!');\n  else if(clutch){tags.push('CLUTCH GOAL!');tags.push(tm.score===tm.opp.score?'EQUALIZER!':'GO-AHEAD!');}")
R("  if(t.includes('CLUTCH GOAL!')){main='CLUTCH GOAL!';sub=t.filter(x=>x!==main);tier=Math.min(4,3+(sub.length?1:0));}",
  """  if(t.includes('OT WINNER!')){main='OT WINNER!';sub=t.filter(x=>x!==main);tier=4;}
  else if(t.includes('EQUALIZER!')){main='EQUALIZER!';sub=t.filter(x=>x!==main);tier=Math.min(4,3+(sub.length>1?1:0));}
  else if(t.includes('CLUTCH GOAL!')){main='CLUTCH GOAL!';sub=t.filter(x=>x!==main);tier=Math.min(4,3+(sub.length>1?1:0));}
  else if(t.includes('HAT TRICK!')){main='HAT TRICK!';sub=t.filter(x=>x!==main);tier=Math.max(2,Math.min(3,1+sub.length));}""")
R("    else{h.streak=0;h.conceded++;h.combo.n=0;h.combo.t=0;comboHide();}",
  "    else{h.streak=0;h.conceded++;if(h.combo.n>=2&&h.combo.t>0)hypeToast('실점으로 콤보가 끊겼어요');h.combo.n=0;h.combo.t=0;comboHide();if(tm.score>tm.opp.score)h.wasBehind=true;}")
R("  G.hitStop=Math.max(G.hitStop||0,.05+.035*tier);\n  G.cam.shake=Math.max(G.cam.shake,.6+.25*tier);",
  "  const oppG=!!(G.mine&&!mine&&real);\n  G.hitStop=Math.max(G.hitStop||0,oppG?0:tier?.05+.035*tier:.03);\n  G.cam.shake=Math.max(G.cam.shake,oppG?.3:.45+.25*tier);")
R("fl.style.setProperty('--ga',(.28+.1*tier).toFixed(2));","fl.style.setProperty('--ga',(oppG?.14:.22+.1*tier).toFixed(2));")
R("  for(let i=0;i<50+tier*35;i++){const a=rnd(TAU)","  for(let i=0;i<(oppG?30:50+tier*35);i++){const a=rnd(TAU)")
R("  SFX.bump(1);SFX.goal();if(tier>=2)SFX.win();","  SFX.bump(oppG?.6:1);if(oppG)SFX.lose();else SFX.goal();if(tier>=2)SFX.win();")
R("b.textContent=main;b.className='tier'+tier+(key==='blue'?' b':key==='red'?' r':'');void b.offsetWidth;b.classList.add('on');",
  "b.textContent=main;b.className='tier'+tier+(key==='blue'?' b':key==='red'?' r':'');void b.offsetWidth;b.classList.add('on');fitBanner();")
R("const c=h.combo;if(c.t>0){c.t-=dt;if(c.t<=0){c.n=0;comboHide();}else comboBar();}",
  "const c=h.combo;if(c.t>0){c.t-=dt;if(c.t<=0){if(c.n>=3)hypeToast('콤보 종료 · x'+c.n+' 달성!');c.n=0;comboHide();}else comboBar();}")
R("  if(win){SFX.win();const gk=(G.cfg.diff==='hard');",
  "  if(win&&G.cfg.final){SFX.champ();hypeBanner('CHAMPION!',['🏆 '+(G.cfg.mode==='tour'?'토너먼트 우승':(G.cfg.label||'우승'))],4,mine.key);champT=3.2;fwT=0;G.cam.shake=Math.max(G.cam.shake,.5);vib([40,40,40,40,180]);\n    for(let i=0;i<160;i++){const a=rnd(TAU),s=rnd(4,12);emit(rnd(-8,8),rnd(2,6),rnd(-5,5),Math.cos(a)*s,rnd(5,12),Math.sin(a)*s,rnd(1.4,2.4),rnd(.25,.5),1,rnd(.75,.95),rnd(.2,.5));}}\n  else if(win){SFX.win();const gk=(G.cfg.diff==='hard');")
R("  if(win&&h.conceded===0&&ms>0)out.tags.push('CLEAN SHEET');","  if(win&&h.conceded===0&&ms>0){out.tags.push('CLEAN SHEET');gp('cleanWin',1);}\n  if(win&&h.wasBehind){gp('comeback',1);if(!h.trailLate)out.tags.push('COMEBACK WIN!');}")
R("  streak2:{name:'연속 2골 득점',key:'streak2',n:1,pts:25,xp:30}\n};",
  "  streak2:{name:'연속 2골 득점',key:'streak2',n:1,pts:25,xp:30},\n  cleanwin:{name:'무실점으로 승리',key:'cleanWin',n:1,pts:30,xp:35},\n  comeback:{name:'역전승 하기',key:'comeback',n:1,pts:35,xp:40},\n  onetimer:{name:'원타이머 슛 2회',key:'oneTimer',n:2,pts:20,xp:25}\n};")

# ----- missions: clean-sheet win, comeback, win with 3 different captains -----
R("  {id:'c4',name:'강슛으로 골 넣기',desc:'슛을 70% 이상 충전해서 골을 넣으세요. (톡 슛은 인정 안 돼요)',time:60,goal:1,kind:'power',size:1,minCharge:.7}\n];",
  """  {id:'c4',name:'강슛으로 골 넣기',desc:'슛을 70% 이상 충전해서 골을 넣으세요. (톡 슛은 인정 안 돼요)',time:60,goal:1,kind:'power',size:1,minCharge:.7},
  {id:'c5',name:'무실점 승리',desc:'2 vs 2 · 2분 안에 한 골도 내주지 않고 이기세요. 실점하면 바로 실패!',time:120,kind:'clean',size:2,match:true,diff:'normal',pts:50},
  {id:'c6',name:'역전 드라마',desc:'0 : 1로 지고 있어요! 100초 안에 역전승하세요. (비기면 실패)',time:100,kind:'comeback',size:2,match:true,diff:'normal',pts:60},
  {id:'c7',name:'펭귄 마스터',desc:'서로 다른 주장 펭귄 3종으로 1 vs 1 승리 · 주장은 팀 편성에서 바꿔요',time:75,kind:'types',size:1,match:true,diff:'easy',pts:60,need:3,opp:['balanced','basic','fast']}
];""")
R("d.innerHTML='<i>'+(save.cleared[c.id]?'✅':'🎯')+'</i><b>'+c.name+'</b><span>'+c.desc+'</span>';",
  "d.innerHTML='<i>'+(save.cleared[c.id]?'✅':'🎯')+'</i><b>'+c.name+'</b><span>'+c.desc+'</span>'+chalMeta(c);")
R("    d.onclick=()=>{SFX.init();SFX.ui();\n",
  "    d.onclick=()=>{SFX.init();SFX.ui();\n      if(c.match){startMatch({mode:'challenge',challenge:c,size:c.size,time:c.time,diff:c.diff,tag:'🎯 MISSION · '+c.name,oppTypes:c.opp||['basic','balanced','fast']});return;}\n")
R("""function challengeDone(ok){
  if(G.state==='over')return;const ch=G.cfg.challenge;G.state='over';G.stateT=2.2;G.over=true;
  const first=!save.cleared[ch.id];let pts=0;
  if(ok){pts=first?40:5;save.cleared[ch.id]=true;save.points+=pts;persist();SFX.win();showBanner('CHALLENGE CLEAR!',2200,'g');}
  else{SFX.lose();showBanner('TIME UP',2000,'r');}
  for(const p of G.pengs){p.pose=ok&&p.team===G.mine?'cheer':'sad';}
  G.result={chal:true,ok,pts};
}""","""function challengeDone(ok,why){
  if(G.state==='over')return;const ch=G.cfg.challenge;G.state='over';G.stateT=2.2;G.over=true;
  const first=!save.cleared[ch.id];let pts=0,note='',part=false;
  if(ok&&ch.kind==='types'){
    const k=save.type,had=save.chalTypes.includes(k);if(!had)save.chalTypes.push(k);
    const n=save.chalTypes.length;
    if(n<ch.need&&!save.cleared[ch.id]){part=true;pts=had?5:10;note=(had?'이미 이긴 펭귄이에요. ':'새 펭귄으로 승리! ')+'진행 '+n+' / '+ch.need+' · 팀 편성에서 다른 펭귄을 주장으로 바꿔 도전하세요';}
  }
  if(ok&&!part){pts=first?(ch.pts||40):5;save.cleared[ch.id]=true;}
  if(ok){save.points+=pts;persist();SFX.win();showBanner(part?'MISSION '+save.chalTypes.length+'/'+ch.need:'CHALLENGE CLEAR!',2200,'g');}
  else{SFX.lose();showBanner(why?'FAILED':'TIME UP',2000,'r');note=why||'';}
  for(const p of G.pengs){p.pose=ok&&p.team===G.mine?'cheer':'sad';}
  G.result={chal:true,ok,pts,note,part};
}""")
R("  const {ok,pts}=G.result,cfg=G.cfg;\n  openResult(ok?'CLEAR! 🎯':'TIME UP','<b>'+cfg.challenge.name+'</b>'+(ok?'<br>⭐ +'+pts+' 포인트':'<br>다시 도전해 보세요!'),",
  "  const {ok,pts,note,part}=G.result,cfg=G.cfg,mt=cfg.challenge.match&&G.mine;\n  openResult(ok?(part?'MISSION 진행! 🎯':'CLEAR! 🎯'):(note?'FAILED':'TIME UP'),'<b>'+cfg.challenge.name+'</b>'+(mt?'<br>'+G.mine.score+' : '+G.mine.opp.score:'')+(ok?'<br>⭐ +'+pts+' 포인트':'<br>다시 도전해 보세요!')+(note?'<br><small>'+note+'</small>':''),")
R("            if(G.cfg.challenge)challengeDone(false);",
  "            if(G.cfg.challenge){const ch=G.cfg.challenge;if(ch.match){const a=G.mine.score,b=G.mine.opp.score;challengeDone(a>b,a>b?'':a===b?'동점으로 끝났어요. 이겨야 클리어!':'아쉽게 졌어요. 다시 도전!');}else challengeDone(false);}")
R("        else if(G.cfg.challenge||G.cfg.mode==='practice'){resetPositions();G.state='play';}","        else if((G.cfg.challenge&&!G.cfg.challenge.match)||G.cfg.mode==='practice'){resetPositions();G.state='play';}")
R("    if(kind==='goal'&&tm===G.mine){","    if(kind==='clean'&&tm!==G.mine){updateScoreHud();challengeDone(false,'실점했어요! 무실점 승리 실패');return;}\n    if(kind==='goal'&&tm===G.mine){")
R("  else if(ch.kind==='power')t+='  (충전 '+Math.round(ch.minCharge*100)+'%↑ 슛으로 골)';",
  "  else if(ch.kind==='power')t+='  (충전 '+Math.round(ch.minCharge*100)+'%↑ 슛으로 골)';\n  else if(ch.kind==='clean')t+='  · 실점 0 유지하고 승리';\n  else if(ch.kind==='comeback')t+='  · 역전승하면 클리어';\n  else if(ch.kind==='types')t+='  · '+TYPES[save.type].name+'로 승리 (진행 '+save.chalTypes.length+'/'+ch.need+')';")

R("setTimeout(()=>{if(G.state==='play')$('#count').textContent='';},700);","setTimeout(()=>{const c=$('#count');if(c.textContent==='GO!')c.textContent='';},700);")
R("  else if(perf.hi>600&&perf.scale<1){perf.scale=Math.min(1,perf.scale+.1);perf.hi=0;applyQuality();}",
  "  else if(perf.hi>600&&perf.scale<1){perf.scale=Math.min(1,perf.scale+.1);perf.hi=0;applyQuality();}\n  else if(perf.low>240&&perf.scale<=.6&&!perf.noShadow&&G.view==='game'){perf.noShadow=true;perf.low=0;renderer.shadowMap.enabled=false;scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.needsUpdate=true;});});}   // still too slow at the lowest resolution: drop real-time shadows for this session (setting untouched)")
# ----- arenas -----
R("function todTarget(){\n  const m=G.todMode;","function todTarget(){\n  {const A=ARENAS[G.arena];if(G.view==='game'&&A&&A.tod!==undefined)return A.tod;}\n  const m=G.todMode;")
R("  const w=G.wx;w.t-=dt;","  const w=G.wx;w.t-=dt;arenaWeather(w);")
R("const au=smooth(.62,.9,T_)*(save.set.aurora?1:0);","const AR=G.view==='game'&&ARENAS[G.arena]||{},au=smooth(.62,.9,T_)*((save.set.aurora||AR===ARENAS.aurora)?1:0)*(AR.aur||1);")
R("for(const l of lamps){l.pl.intensity=nl*1.4;","arenaLamps();for(const l of lamps){l.pl.intensity=nl*1.4;")
R("renderer.toneMappingExposure=lerp(1.08,1.5,smooth(.7,1,T_));","renderer.toneMappingExposure=lerp(1.08,1.5,smooth(.7,1,T_))*((G.view==='game'&&ARENA_DECO[G.arena]&&ARENA_DECO[G.arena].exp)||1);")
R("safe(hypeFrame,dt);safe(tutFrame,dt);safe(mgrFrame,dt);","safe(hypeFrame,dt);safe(tutFrame,dt);safe(mgrFrame,dt);safe(arenaFrame,dt);")
R("puckRing.scale.setScalar(1.3);puckRing.material.opacity=.6+.25*Math.sin(G.t*5);",
  "{const bz=G.view==='game'&&(G.arena==='blizzard'||G.wx.int>.7);puckRing.scale.setScalar(bz?1.75:1.3);puckRing.material.opacity=(bz?.85:.6)+(bz?.15:.25)*Math.sin(G.t*5);}")
R("'</b><br>난이도: '+dn[r.diff]+' · 시간대: '+(r.tod<.3?'낮':r.tod<.7?'해질녘':'밤')+'</div>';",
  "'</b><br>난이도: '+dn[r.diff]+' · '+(tr.round===TOUR.length-1?'🏆 결승 무대':'시간대: '+(r.tod<.3?'낮':r.tod<.7?'해질녘':'밤'))+'</div><div style=\"margin-top:6px;font-size:14px;color:#ffe9a0\">보상: 이길 때마다 경기 포인트 · 결승 우승 보너스 '+(save.cleared.tour?'30P':'100P (첫 우승)')+(save.cleared.tour?'':' · 우승하면 설정에서 결승 무대 경기장이 열려요')+'</div>';")

# ----- new penguin -> straight to squad -----
R("foot.classList.add('on');$('#pkOk').onclick=()=>{SFX.ui();finish('close');};",
  "foot.classList.add('on');if(res.some(r=>r.isNew)){const sb=document.createElement('button');sb.className='btn';sb.textContent='🧩 팀 편성으로';sb.onclick=()=>{SFX.ui();finish('squad');};foot.insertBefore(sb,foot.firstChild);}$('#pkOk').onclick=()=>{SFX.ui();finish('close');};")
R("playPackOpen(res).then(a=>{renderScout();if(a==='again')doPull(n);});","playPackOpen(res).then(a=>{renderScout();if(a==='again')doPull(n);else if(a==='squad')goScreen('sSquad');});")
R("foot.classList.add('on');$('#fzOk').onclick=",
  "foot.classList.add('on');if(o.success&&o.out&&o.out.isNew){const sb=document.createElement('button');sb.className='btn';sb.textContent='🧩 팀 편성으로';sb.onclick=()=>{SFX.ui();finish('squad');};foot.insertBefore(sb,foot.firstChild);}$('#fzOk').onclick=")
R("if(a==='again'){const s2=autoFuseSel(g);if(s2)doFuse(g,s2);}});","if(a==='again'){const s2=autoFuseSel(g);if(s2)doFuse(g,s2);}else if(a==='squad')goScreen('sSquad');});")

# ----- personality shown where players are chosen -----
R("let h='<div class=\"sq-st-row\"><span class=\"sq-st-l\">주장</span><span>'+cap.name+' · 특수 기술 <b>'+SPECIALS[cap.special]+'</b></span></div>';",
  "let h='<div class=\"sq-st-row\"><span class=\"sq-st-l\">주장</span><span>'+cap.name+' · 특수 기술 <b>'+SPECIALS[cap.special]+'</b><br><span class=\"tt-line\">'+ttLine(save.type)+'</span></span></div>';")
R("return own?'<div style=\"--cw:96px\">'+cardHtml(k)+'<div style=\"font-size:12px;margin-top:4px\">'+SPECIALS[TYPES[k].special]+'<br>",
  "return own?'<div style=\"--cw:96px\">'+cardHtml(k)+'<div style=\"font-size:12px;margin-top:4px\">'+SPECIALS[TYPES[k].special]+'<br><span class=\"tt-line\">'+TT[k].name+'<br>▲ '+TT[k].plus+'<br>▼ '+TT[k].minus+'</span><br>")

# ----- hints / how-to match the real key bindings -----
R("'<b>WASD</b> 이동 · <b>Space/클릭</b> 슛(길게=강슛) · <b>E</b> 패스 · <b>Shift</b> 대시 · <b>Q</b> 특수'",
  "'<b>WASD</b> 이동 · <b>Space/클릭</b> 슛(길게=강슛) · <b>E/우클릭</b> 패스 · <b>Shift</b> 대시 · <b>Q</b> 특수 · <b>F/Tab</b> 교체 · <b>P/Esc</b> 일시정지'")
R("        <kbd>F</kbd> 펭귄 교체 &nbsp; <kbd>P</kbd> 일시정지<br>","        <kbd>F</kbd>/<kbd>Tab</kbd> 펭귄 교체 &nbsp; <kbd>P</kbd>/<kbd>Esc</kbd> 일시정지 &nbsp; 마우스 <b>오른쪽 클릭</b> 패스<br>")
R("이기면 포인트를 얻어 새 펭귄·모자·꼬리 효과를 해금할 수 있어요.</div>",
  "이기면 포인트를 얻어 새 펭귄·모자·꼬리 효과를 해금할 수 있어요 (팀 편성 화면).<br>⚡ <b>원타이머</b>: 패스가 오는 동안 슛을 미리 모아 두었다가 받자마자 쏘면 더 빠르고 정확해요. 충전 중에는 예상 경로가 보이고, 골문 안으로 향하면 <b style=\"color:#7dffb0\">초록색</b>이에요.<br>🐧 펭귄마다 <b>강점과 약점</b>이 있어요 (스카우트 › 도감).</div>")

# ----- CSS -----
R("</style>","""body.noflash #gflash,body.noflash #pkFlash,body.noflash #fzFlash{display:none!important}
body.rm #banner,body.rm #combo,body.rm .pop,body.rm #late,body.rm #toast{transition:none!important;animation:none!important}
#banner{white-space:nowrap}
#chalList .mode{background:linear-gradient(180deg,rgba(8,34,70,.72),rgba(10,50,95,.62))!important;text-shadow:0 1px 3px rgba(0,0,0,.6)}
#chalList .mode span{color:#e3f3ff}
.mode small.chal-r{display:block;font-size:12px;color:#ffe9a0;margin-top:4px;line-height:1.35}
.tt-line{font-size:12px;color:#d9f1ff;line-height:1.35}
#sSet .panel,#sChal .col,#sPause .panel,#sTour .panel{margin:auto}
#loading{position:fixed;inset:0;z-index:95;display:flex;align-items:center;justify-content:center;text-align:center;font-size:22px;color:#fff;background:linear-gradient(#4f9fe0,#bfe3ff);text-shadow:0 2px 6px rgba(0,30,60,.6);padding:20px}
#loading small{display:block;font-size:15px;margin-top:10px;opacity:.9}
@media (orientation:portrait){
  body.touch #joyZone{width:min(50%,calc(100% - 186px));top:30%}
  #tbShoot{right:calc(env(safe-area-inset-right,0px) + 16px);bottom:calc(env(safe-area-inset-bottom,0px) + 26px);width:88px;height:88px;font-size:23px}
  #tbSpec{right:calc(env(safe-area-inset-right,0px) + 28px);bottom:calc(env(safe-area-inset-bottom,0px) + 128px);width:64px;height:64px}
  #tbPass{right:calc(env(safe-area-inset-right,0px) + 116px);bottom:calc(env(safe-area-inset-bottom,0px) + 22px);width:62px;height:62px}
  #tbDash{right:calc(env(safe-area-inset-right,0px) + 112px);bottom:calc(env(safe-area-inset-bottom,0px) + 98px);width:58px;height:58px}
  #tbSwap{right:calc(env(safe-area-inset-right,0px) + 118px);bottom:calc(env(safe-area-inset-bottom,0px) + 168px);width:46px;height:46px;font-size:14px}
  body.touch #charge{bottom:calc(env(safe-area-inset-bottom,0px) + 206px);right:calc(env(safe-area-inset-right,0px) + 16px);width:96px}
}
@media (max-width:480px){
  .tm{min-width:0;padding:4px 9px;gap:6px}.tm .nm{display:none}.tm b{font-size:26px}
  #clock{font-size:19px;min-width:60px;padding:3px 8px}
  #wx{display:none}.hb{width:40px;height:40px;font-size:17px}
  #modeTag{top:calc(env(safe-area-inset-top,0px) + 54px);font-size:13px;max-width:92vw;overflow:hidden;text-overflow:ellipsis}
  body.touch #gauge{top:calc(env(safe-area-inset-top,0px) + 60px);width:56px;height:56px;font-size:11px}
  #hint{top:calc(env(safe-area-inset-top,0px) + 126px);font-size:13px}
  #obj{font-size:14px;white-space:normal;max-width:92vw;text-align:center;top:calc(env(safe-area-inset-top,0px) + 76px)}
}
</style>""")

R('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n','')   # was parser-blocking: a hung CDN froze the page with dead menu buttons; now loaded by __loadThree with timeouts + fallbacks
# ----- Three.js loading: visible progress, per-CDN timeout, slow-network message -----
R('<div id="fallback">','<div id="loading"><div>🐧 경기장을 준비하는 중…<small id="loadSub">3D 엔진을 불러오고 있어요</small></div></div>\n<div id="fallback">')
R("""window.__loadThree=function(cb){
  var srcs=['https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js','https://unpkg.com/three@0.128.0/build/three.min.js'],i=0;
  (function next(){
    if(window.THREE)return cb(true);
    if(i>=srcs.length)return cb(false);
    var el=document.createElement('script');el.src=srcs[i++];el.onload=next;el.onerror=next;document.head.appendChild(el);
  })();
};""","""window.__loadThree=function(cb){
  var srcs=['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js','https://unpkg.com/three@0.128.0/build/three.min.js'],i=0,done=false;
  var sub=document.getElementById('loadSub'),slow=setTimeout(function(){if(sub)sub.textContent='인터넷 연결이 느려요. 조금만 기다려 주세요…';},6000);
  function fin(ok){if(done)return;done=true;clearTimeout(slow);var l=document.getElementById('loading');if(l)l.style.display='none';cb(ok);}
  (function next(){
    if(done)return;if(window.THREE)return fin(true);
    if(i>=srcs.length)return fin(false);
    var el=document.createElement('script'),t=setTimeout(function(){el.onload=el.onerror=null;if(sub)sub.textContent='다른 서버에서 다시 불러오는 중…';next();},15000);
    el.src=srcs[i++];el.onload=el.onerror=function(){clearTimeout(t);next();};document.head.appendChild(el);
  })();
};""")

exec(open('v10_species.py',encoding='utf-8').read())
# ===== goalie faced its own goal / the boards (heading sign was inverted) =====
R("  p.heading=-d*Math.PI/2;","  p.heading=d*Math.PI/2;   // face the play (toward the rink), not the boards")
exec(open('v10_auk.py',encoding='utf-8').read())
exec(open('v10_design.py',encoding='utf-8').read())
exec(open('v10_fun.py',encoding='utf-8').read())
exec(open('v10_events.py',encoding='utf-8').read())
exec(open('v10_carry.py',encoding='utf-8').read())
exec(open('v10_ach.py',encoding='utf-8').read())
exec(open('v10_polish.py',encoding='utf-8').read())
exec(open('v11_scout.py',encoding='utf-8').read())
exec(open('v12_peng.py',encoding='utf-8').read())
exec(open('v13_rink.py',encoding='utf-8').read())
exec(open('v14_clean.py',encoding='utf-8').read())
exec(open('v15_home.py',encoding='utf-8').read())
# ===== test exports =====
R("frame:step,performShot,","frame:step,HM_IC,hypeMenuRefresh,leagueMenuRefresh,RK,RK_MATS,RK_AD,RK_BAY,rinkLoop,uiPanels,uiTidy,applyQuality,iceMat,rinkPath,rinkRuns,lamps,renderer,buildPenguin,pkNum,setTOD,PK_MAT,pkGeoC,crowdBodyGeo,buildPenguinV9,animatePenguin,makePeng,TEAM,sun,hemi,GACHA,BRK,ENH_PITY,epicChance,gradeProbs,gachaEff,pickupNow,pickupRate,pickType,rollGrade,grantCard,brkPlan,brkAvail,doBreak,askBreak,openCard,scPullHtml,scEnhHtml,scDexHtml,statVal,cardOvr,oddsBox,playEnhFx,lackMsg,hypeMenuRefresh,achCheck,buyConfirm,sqBuy,persist,ACH,achHtml,statGrid,realMatch,trailCol,autoSwitch,carryStep,carryRelease,bigHit,CARRY,evStart,evFrame,eventsOn,EVENTS,spawnItem,applyItem,itemFrame,itemsOn,feverStart,soStart,soResult,soFrame,soAllowed,funReset,ITEMS,redeemCode,buildPenguin,scene,camera,pengSVG,simulate,resetPositions,checkGoal,aiShoot,FIXED,DIFF,gkRead,challengeDone,TT,arenaPick,ARENAS,passLost,touchPuck,pengCollisions,doDash,humanControl,shakeK,togglePause,aiIntercept,updateObjective,buildChal,chalMeta,performShot,")

exec(open('v17_feat.py',encoding='utf-8').read())
exec(open('v18_species.py',encoding='utf-8').read())
exec(open('v19_gfx.py',encoding='utf-8').read())
exec(open('patchlib.py',encoding='utf-8').read())
exec(open('v21_rarity.py',encoding='utf-8').read())
exec(open('v22_rules.py',encoding='utf-8').read())
exec(open('v23_cast.py',encoding='utf-8').read())
exec(open('v24_pass.py',encoding='utf-8').read())
exec(open('v25_cine.py',encoding='utf-8').read())
exec(open('v26_sig.py',encoding='utf-8').read())
exec(open('v27_pro.py',encoding='utf-8').read())
exec(open('v28_app.py',encoding='utf-8').read())
exec(open('v29_gfx.py',encoding='utf-8').read())
exec(open('v30_land.py',encoding='utf-8').read())
exec(open('v16_i18n.py',encoding='utf-8').read())
exec(open('v20_bundle.py',encoding='utf-8').read())

import os as _os
open(OUT+'.tmp','w',encoding='utf-8').write(s);_os.replace(OUT+'.tmp',OUT)   # atomic: captures may be reading OUT
scripts=re.findall(r'<script>(.*?)</script>',s,re.S)
open('main.js','w',encoding='utf-8').write([x for x in scripts if '__bootGame' in x][0]);open('loader.js','w',encoding='utf-8').write([x for x in scripts if 'window.__loadThree' in x][0])
open('i18n.js','w',encoding='utf-8').write([x for x in scripts if 'window.I18N=' in x][0])
print('built',len(s),'bytes')
