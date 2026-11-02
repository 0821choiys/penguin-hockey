# v17: season league, rink conditions (빙판 변수), pass-combo shot (콤보 슛)
#  - game code: v17_feat.js (inserted before INIT), styles: v17_feat.css
#  - hooks below; every anchor must match exactly once (R() aborts the build otherwise)

# ---- module + styles ----
R("/* ================= INIT ================= */", rd('v17_feat.js') + "\n/* ================= INIT ================= */")
_st_end17 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end17] + rd('v17_feat.css') + "\n" + s[_st_end17:]

# ---- save: season record, combo counters, setting ----
R("golden:0,steals:0,enhOk:0,brk:0}", "golden:0,steals:0,enhOk:0,brk:0,comboGoal:0,comboShot:0}")
R("dev:{got:false,ts:0}};", "dev:{got:false,ts:0},season:{n:0,g:0,w:0,d:0,l:0,best:0,start:0,paid:0,last:null,hist:[]}};")
R("if(Number.isFinite(s.achNew))save.achNew=Math.max(0,Math.min(99,s.achNew|0));",
  "if(Number.isFinite(s.achNew))save.achNew=Math.max(0,Math.min(99,s.achNew|0));\n  if(s.season&&typeof s.season==='object')seasonLoad(s.season);")
R("const DEF_SET={size:3,", "const DEF_SET={cond:true,size:3,")   # (v16 patches the end of this line)
R("for(const k of['vib','flash','motion','items','events','fastFx','stick'])if(typeof ss[k]==='boolean')save.set[k]=ss[k];",
  "for(const k of['vib','flash','motion','items','events','fastFx','stick','cond'])if(typeof ss[k]==='boolean')save.set[k]=ss[k];")
R("  {k:'events',label:'깜짝 이벤트',opts:[[true,'켜기'],[false,'끄기']]},",
  "  {k:'events',label:'깜짝 이벤트',opts:[[true,'켜기'],[false,'끄기']]},\n  {k:'cond',label:'빙판 변수',opts:[[true,'켜기'],[false,'끄기']]},")

# ---- 1. season league ----
# every rated result (match end and forfeit) goes through mgrApply: settle a finished season first, then count the game
R("function mgrApply(S,opp,label){\n  const m=save.mgr,", "function mgrApply(S,opp,label){\n  seasonCheck();const m=save.mgr,")
R("m.best=Math.max(m.best,m.r);", "m.best=Math.max(m.best,m.r);seasonAdd(S,m.r);")
R("function leagueMenuRefresh(){\n  try{", "function leagueMenuRefresh(){\n  try{seasonCheck();seasonBadge();}catch(e){}\n  seasonPopSoon();\n  try{")
R("const el=$('#rkBody');if(!el)return;trialDayRefresh();", "const el=$('#rkBody');if(!el)return;trialDayRefresh();seasonCheck();")
R("+(titleText(true)?'<div class=\"pf-titles\">'+titleText(true)+'</div>':'')+'</div></div>';\n  h+='<div class=\"rk-cards\">';",
  "+(titleText(true)?'<div class=\"pf-titles\">'+titleText(true)+'</div>':'')+seasonMiniHtml()+'</div></div>';\n  h+='<div class=\"rk-cards\">';")   # one season line under the rating
R("  h+='</div>'+devCardHtml()+", "  h+='</div>'+seasonBoxHtml()+devCardHtml()+")   # the season box (table, rules, history) below the game cards
R("if(R.mg&&R.mg.dev){", "if(R.mg)extraNote=(extraNote?extraNote+'<br>':'')+seasonNote();\n  if(R.mg&&R.mg.dev){")
R("<span class=\"tx\"><b>티어 게임</b><small>랭크전과 선발전</small></span>",
  "<span class=\"tx\"><b>티어 게임<span id=\"ssBadge\"></span></b><small>랭크전과 선발전</small></span>")

# ---- 2. rink conditions ----
# match setup clears the previous match's condition; the match-start hook rolls the new one (or takes the tournament's)
R("clearMatch();G.cfg=cfg;G.diff=DIFF[cfg.diff||'normal'];", "condClear();clearMatch();G.cfg=cfg;G.diff=DIFF[cfg.diff||'normal'];")
R("  aimLine.visible=false;aimTgt.visible=false;funReset();\n  if(cfg.mode==='shootout')soStart();",
  "  aimLine.visible=false;aimTgt.visible=false;funReset();condStart(cfg);\n  if(cfg.mode==='shootout')soStart();")
# physics: skaters (acceleration, braking, glide, edge grip), goalies (reaction, reading), puck (friction), AI aim
R("let cap=(7+1.4*st.speed)*dif*slow,acc=(13+5*st.accel)*slow;", "let cap=(7+1.4*st.speed)*dif*slow,acc=(13+5*st.accel)*slow*CF.acc;")
R("if(dot<-.2)a*=1.4;}", "if(dot<-.2)a*=1.4*CF.brk;}")
R("const k=Math.exp(-.8*h);p.vx*=k;p.vz*=k;\n      const s=Math.hypot(p.vx,p.vz);if(s>0){const ns=Math.max(0,s-1.4*h);",
  "const k=Math.exp(-.8*CF.glide*h);p.vx*=k;p.vz*=k;\n      const s=Math.hypot(p.vx,p.vz);if(s>0){const ns=Math.max(0,s-1.4*CF.glide*h);")
R("const grip=sliding?2.6:(1.1+.6*st.turn)*(1-.3*spf);", "const grip=sliding?2.6:(1.1+.6*st.turn)*(1-.3*spf)*CF.grip;")
R("vs*=Math.exp(-grip*h);vf*=Math.exp(-.28*h);", "vs*=Math.exp(-grip*h);vf*=Math.exp(-.28*CF.glide*h);")
R("if(ai.seenT>=gk.react){", "if(ai.seenT>=gk.react*CF.react){")
R("const e=(Math.random()-.5)*2*gk.err*clamp(tt*1.1,.25,1.3);", "const e=(Math.random()-.5)*2*gk.err*CF.gkErr*clamp(tt*1.1,.25,1.3);")
R("const w=gk.read*clamp((s.charge-.12)/.5,0,1);", "const w=gk.read*CF.read*clamp((s.charge-.12)/.5,0,1);")
R("const ns=Math.max(0,s0-(.5+.22*s0)*h),f=ns/s0;", "const ns=Math.max(0,s0-(.5+.22*s0)*CF.pf*h),f=ns/s0;")
R("if(!p.human)spread+=G.diff.aim*.05;", "if(!p.human)spread+=G.diff.aim*.05*CF.aim;")
# visuals: night overrides the time of day, blizzard the weather; fog / darkness applied after setTOD; per-frame effects
R("function todTarget(){\n", "function todTarget(){\n  if(G.view==='game'&&G.cond==='night')return .97;\n")
R("const w=G.wx;w.t-=dt;arenaWeather(w);", "const w=G.wx;w.t-=dt;arenaWeather(w);condWeather(w);")
R("  updateEnv(false);\n}\nfunction todTarget", "  condLight();\n  updateEnv(false);\n}\nfunction todTarget")
R("safe(arenaFrame,dt);", "safe(arenaFrame,dt);safe(v17Frame,dt);")
# reward: +10% of the base reward for a match played under a condition
R("R.base=base;R.cb=cbBonus;R.extra=extra;R.extraName=extraName;R.total=base+cbBonus+extra+fv;",
  "R.base=base;R.cb=cbBonus;R.extra=extra;R.extraName=extraName;R.cond=condBonus(base);R.condK=G.cond;R.total=base+cbBonus+extra+fv+R.cond;")
R("if(R.fv>0)html+=", "html+=condBonusRow(R);\n  if(R.fv>0)html+=")
# tournament: the round's condition is rolled on the intro screen and shown there (never in the final)
R("  const tr=G.tour,r=TOUR[tr.round];\n  enterDemo();hideAll();",
  "  const tr=G.tour,r=TOUR[tr.round];\n  enterDemo();hideAll();\n  tr.cond=condAllowed({mode:'tour',final:tr.round===TOUR.length-1})?condRoll():null;")
R("(tr.round===TOUR.length-1?'🏆 결승 무대':'시간대: '+(r.tod<.3?'낮':r.tod<.7?'해질녘':'밤'))",
  "(tr.round===TOUR.length-1?'🏆 결승 무대':'시간대: '+(tr.cond==='night'||r.tod>=.7?'밤':r.tod<.3?'낮':'해질녘'))")
R("(save.cleared.tour?'':' · 우승하면 설정에서 결승 무대 경기장이 열려요')+'</div>';",
  "(save.cleared.tour?'':' · 우승하면 설정에서 결승 무대 경기장이 열려요')+'</div>'+condIntroHtml(tr.cond);")
R("$('#tGo').onclick=()=>{SFX.init();SFX.ui();startMatch({mode:'tour',size:save.set.size,time:Math.min(save.set.time||120,120),diff:r.diff,oppTypes:r.types,todFixed:r.tod,tag:",
  "$('#tGo').onclick=()=>{SFX.init();SFX.ui();startMatch({mode:'tour',cond:tr.cond,size:save.set.size,time:Math.min(save.set.time||120,120),diff:r.diff,oppTypes:r.types,todFixed:r.tod,tag:")

# ---- 3. pass-combo shot ----
R("function passDone(ps){\n  ps.to.recvT=G.t;\n", "function passDone(ps){\n  ps.to.recvT=G.t;pcPass(ps);\n")
R("popAt(G.chain>1?'패스 성공! x'+G.chain:'패스 성공!',ps.to.x,2.2,ps.to.z);SFX.passOk();", "popAt(pcPopText(ps),ps.to.x,2.2,ps.to.z);SFX.passOk();")
R("function passLost(ps,why){\n", "function passLost(ps,why){\n  pcBreak(ps.from.team);\n")
R("function touchPuck(p,imp){\n  const pk=G.puck,prevL=pk.last,prevT=pk.lastT;pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;",
  "function touchPuck(p,imp){\n  const pk=G.puck,prevL=pk.last,prevT=pk.lastT;pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;pcTouch(p);")
R("sp*=v10ShotMul(p,tap);", "sp*=v10ShotMul(p,tap)*pcShotMul(p);")
R("registerShot(p,ax,az,tap?0:charge,sp,tap?'tap':'power');", "registerShot(p,ax,az,tap?0:charge,sp,tap?'tap':'power');pcAfterShot(p);")
R("const pk=G.puck,sp2=Math.min(PUCK_VMAX,34*(.8+.05*p.ty.stats.power)+4);", "const pk=G.puck,sp2=Math.min(PUCK_VMAX,(34*(.8+.05*p.ty.stats.power)+4)*pcShotMul(p));")
R("registerShot(p,ax,az,1,sp2,'flipper');", "registerShot(p,ax,az,1,sp2,'flipper');pcAfterShot(p);")
R("  hypeGoal(tm,sh);\n", "  hypeGoal(tm,sh);pcGoal(tm,sh);\n")
R("  G.pass=null;G.carry=null;\n}", "  G.pass=null;G.carry=null;pcReset();\n}")
R("if(q>=df.shootQ&&Math.random()<.92){", "if(q>=df.shootQ*(pcReady(tm)?.75:1)&&Math.random()<.92){")   # a team with a combo shot ready shoots more readily
R("  if(noShoot){ai.cool=rnd(.4,.9);return;}\n", "  if(noShoot){ai.cool=rnd(.4,.9);return;}\n  if(pcGiveGo(p))return;\n")   # ... and may keep its pass chain going (give-and-go)
R("if(p.magT>0)a.push('🧲 '+p.magT.toFixed(1));t=a.join('  ');", "if(p.magT>0)a.push('🧲 '+p.magT.toFixed(1));pcChip(a);t=a.join('  ');")
R("if(fresh&&sh.oneT)tags.push('ONE-TIMER!');", "if(fresh&&sh.oneT)tags.push('ONE-TIMER!');\n  if(fresh&&sh.combo)tags.push('COMBO SHOT!');")
R("  {id:'a_steal',", "  {id:'a_combo',ico:'⚡',name:'콤보 슈터',desc:'패스 콤보 슛으로 5골',n:5,pts:50,prog:()=>save.cum.comboGoal},\n  {id:'a_steal',")

# vibration before the first tap is blocked by browsers (and logged as an intervention): skip it until the page has been touched
R("const vib=p=>{if(!save.set.vib)return;try{", "const vib=p=>{if(!save.set.vib)return;try{if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;")

# floating texts near a screen edge (long ones like the combo popup) are kept fully on screen
R("pops.appendChild(d);setTimeout(()=>d.remove(),950);", "pops.appendChild(d);{let w=d.offsetWidth;if(w>0){if(w>innerWidth-12){d.style.fontSize=Math.max(14,Math.floor(parseFloat(getComputedStyle(d).fontSize)*(innerWidth-16)/w))+'px';w=d.offsetWidth;}const L=parseFloat(d.style.left),c=clamp(L,w/2+4,innerWidth-w/2-4);if(c!==L)d.style.left=c+'px';}}setTimeout(()=>d.remove(),950);")

# ---- test exports ----
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,SEASON,seasonLoad,seasonBadge,seasonNow,seasonLeft,seasonDate,seasonSoft,seasonCheck,seasonAdd,seasonRulesTxt,seasonBoxHtml,seasonMiniHtml,seasonNote,seasonPopup,seasonRewTxt,COND,COND_W,COND_BONUS,CF,CF0,CV,condAllowed,condRoll,condPick,condStart,condClear,condBonus,condBonusRow,condIntroHtml,condFrame,PC,pcBonus,pcOn,pcReady,pcGiveGo,pcPass,pcShotMul,pcReset,pcBreak,pcPopText,howV17,fmtL,movePeng,puckStep,aiCarrier,aiGoalie,showTourIntro,showResultScreen,renderSettings,SETDEF,todTarget,setTOD,v17Frame,passDone,toMenu,enterDemo,")
