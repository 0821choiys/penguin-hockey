# v22: hockey rules + referee (반칙 · 퇴장/파워플레이 · 페널티 샷 · 오프사이드 · 아이싱 · 페이스오프)
#  - game code: v22_rules.js (inserted before INIT), styles: v22_rules.css
#  - runs after v21 and before v16 (raw Korean strings; v16 wraps them for translation)

R("/* ================= INIT ================= */", rd('v22_rules.js') + "\n/* ================= INIT ================= */")
_st_end22 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end22] + rd('v22_rules.css') + "\n" + s[_st_end22:]

# ---- HUD ----
R('<div id="fxChip"></div>', '<div id="fxChip"></div><div id="rlHud" aria-live="polite"></div><div id="rlCall" role="status"></div>')

# ---- save + setting (additive) ----
R("const save={v:10,chalTypes:[],", "const save={v:10,chalTypes:[],rl:{intro:0},")
R("if(s.season&&typeof s.season==='object')seasonLoad(s.season);",
  "if(s.season&&typeof s.season==='object')seasonLoad(s.season);\n  if(s.rl&&typeof s.rl==='object')save.rl.intro=s.rl.intro?1:0;")
R("const DEF_SET={cond:true,size:3,", "const DEF_SET={rules:'full',cond:true,size:3,")
R("for(const k of['vib','flash','motion','items','events','fastFx','stick','cond'])if(typeof ss[k]==='boolean')save.set[k]=ss[k];",
  "for(const k of['vib','flash','motion','items','events','fastFx','stick','cond'])if(typeof ss[k]==='boolean')save.set[k]=ss[k];\n  if(['full','fouls','off'].includes(ss.rules))save.set.rules=ss.rules;")
R("  {k:'cond',label:'빙판 변수',opts:[[true,'켜기'],[false,'끄기']]},",
  "  {k:'cond',label:'빙판 변수',opts:[[true,'켜기'],[false,'끄기']]},\n  {k:'rules',label:'하키 규칙',opts:[['full','전체'],['fouls','반칙만'],['off','끄기']]},")

# ---- match flow ----
R("condClear();clearMatch();G.cfg=cfg;", "condClear();clearMatch();G.rl=null;G.ps=null;G.cfg=cfg;")
R("funReset();condStart(cfg);", "funReset();condStart(cfg);rulesReset();setTimeout(()=>{if(G.view==='game'&&G.cfg===cfg)rulesIntro();},700);")
R("function endMatch(){", "function endMatch(){\n  rulesEnd();")
RIN('soStart', "G.so={turn:0,", "rulesClearBox();if(G.rl)G.rl.thaw=false;G.so={turn:0,")
R("if(G.so){soGoal(tm);return;}", "if(G.so){soGoal(tm);return;}\n  if(rulesScored(tm))return;")
R("  const late=!!(cfg.time&&", "  rulesTags(tm,tags);\n  const late=!!(cfg.time&&")
R("function resetPositions(){G.royal=null;",
  "function resetPositions(){G.royal=null;if(G.rl&&G.rl.thaw){G.rl.thaw=false;for(const q of G.pengs)if(!q.boxed)q.frozen=false;}")
R("  G.pass=null;G.carry=null;pcReset();", "  for(const q of G.pengs)if(q.boxed)boxPlace(q);\n  G.pass=null;G.carry=null;pcReset();rulesZoneSync();")

# step(): boxed penguins stay visible, the clock stops for penalty shots, nobody frozen is moved, the whistle state
R("p.pg.root.visible=show&&!p.frozen", "p.pg.root.visible=show&&(!p.frozen||!!p.boxed)")
R("if(G.so){}else if(G.cfg.time&&!G.ot){", "if(G.so||G.ps){}else if(G.cfg.time&&!G.ot){")
R("for(let i=0;i<sub;i++){for(const p of G.pengs){movePeng(p,h);}puckStep(h);}",
  "for(let i=0;i<sub;i++){for(const p of G.pengs){if(!p.frozen)movePeng(p,h);}puckStep(h);}")
R("const sd=dt*.5;for(const p of G.pengs)movePeng(p,sd);puckStep(sd);",
  "const sd=dt*.5;for(const p of G.pengs)if(!p.frozen)movePeng(p,sd);puckStep(sd);")
R("    }else if(st==='over'){",
  """    }else if(st==='stop'){   // v22: whistle → the call is shown, everyone glides to a halt → faceoff / penalty shot
      G.stateT-=dt;G.alpha=1;for(const p of G.pengs){p.ix=p.iz=0;p.gvx=p.gvz=0;}
      const sd=dt*.6;for(const p of G.pengs)if(!p.frozen)movePeng(p,sd);{const pk=G.puck,k=Math.exp(-2.5*dt);pk.vx*=k;pk.vz*=k;}puckStep(sd);
      if(G.stateT<=0)rulesResume();
    }else if(st==='over'){""")
R("safe(v17Frame,dt);safe(v18Frame,dt);", "safe(v17Frame,dt);safe(v18Frame,dt);safe(v22Frame,dt);")
R("puckStep(h);v10Sim(h);evSim(h);sim18(h);", "puckStep(h);v10Sim(h);evSim(h);sim18(h);rulesSim(h);")

# ---- fouls ----
R("const tm=A.mass+B.mass;let ia=", "rulesContact(A,B,imp);const tm=A.mass+B.mass;let ia=")
R("if(knock(A,rnd(.9,1.4))){if(bS)B.slideHit=true;bigHit(B,A);}", "if(knock(A,rnd(.9,1.4))){if(bS)B.slideHit=true;bigHit(B,A);rulesFoul(B,A);}")
R("if(knock(B,rnd(.9,1.4))){if(aS)A.slideHit=true;bigHit(A,B);}", "if(knock(B,rnd(.9,1.4))){if(aS)A.slideHit=true;bigHit(A,B);rulesFoul(A,B);}")
R("p.ramT=0;if(knock(o,SPX.crest.knock))bigHit(p,o);", "p.ramT=0;if(knock(o,SPX.crest.knock)){bigHit(p,o);rulesFoul(p,o);}")

# ---- AI and switching ----
R("if(ai.think<=0){ai.iv=df.react*rnd(.7,1.3);ai.think=ai.iv;aiThink(p);}", "if(ai.think<=0){ai.iv=df.react*rnd(.7,1.3);ai.think=ai.iv;aiThink(p);}\n  rulesAI(p);")
R("}else if(own&&press<3.4){", "}else if(own&&press<3.4&&!rulesIcingRisk(p)){")
R("else if(sp2==='slide'){if((car&&car.team!==tm&&nearestOpp(p)<6)||dist>12)useSpecial(p);}",
  "else if(sp2==='slide'){if(((car&&car.team!==tm&&nearestOpp(p)<6)||(dist>12&&!rulesActive()))&&rulesSlideOk(p))useSpecial(p);}")
RIN('bestMate', "if(m===p||m.fall>0)continue;", "if(m===p||m.fall>0||m.frozen)continue;const onside=rulesMateOk(m);")
R("if(d<4||d>24)continue;", "if(d<4||d>24||!onside)continue;")
R("if(cs<-.2)s-=6;", "if(cs<-.2)s-=6;if(!onside)s-=4;")
R("if(o===G.carrier||o.fall>0)continue;", "if(o===G.carrier||o.fall>0||o.frozen)continue;")
RIN('autoSwitch', "if(G.so)return;", "if(G.so||G.ps)return;")
RIN('autoSwitch', "for(const s of tm.skaters){if(s===G.player||s.fall>0)continue;", "for(const s of tm.skaters){if(s===G.player||s.fall>0||s.frozen)continue;")
RIN('swapNearest', "if(G.so)return;", "if(G.so||G.ps)return;")
RIN('swapNearest', "if(s===G.player||s.fall>0)continue;", "if(s===G.player||s.fall>0||s.frozen)continue;")

RIN('doDash', "if(p.cd.dash>0||p.fall>0||p.goalie||p.slideT>0)return false;", "if(p.cd.dash>0||p.fall>0||p.goalie||p.slideT>0)return false;\n  if(!rulesPathClear(p))return false;")
RIN('useSpecial', "if(p.cd.special>0||p.fall>0||p.goalie)return false;", "if(p.cd.special>0||p.fall>0||p.goalie)return false;\n  if(!p.human&&['dash','surge','slide','crest','double'].includes(p.ty.special)&&!rulesPathClear(p,Math.sin(p.heading),Math.cos(p.heading)))return false;")

# ---- skill texts mention the rule (the dash / slide / charge skills are body contact) ----
RIN('spDesc', "case 'slide':return '배로 미끄러지며 태클해요 · 빗나가면 잠깐 느려져요';",
    "case 'slide':return '배로 미끄러지며 태클해요 · 빗나가면 잠깐 느려져요 · 하키 규칙: 퍽보다 선수를 먼저 넘어뜨리면 트리핑';")
RIN('spDesc', "case 'dash':return '빠르게 돌진해요 · 부딪힌 상대를 강하게 밀쳐요';",
    "case 'dash':return '빠르게 돌진해요 · 부딪힌 상대를 강하게 밀쳐요 · 하키 규칙: 퍽 없는 상대를 넘어뜨리면 방해 반칙';")
RIN('spDesc', "case 'crest':return fmtL('{t}초 동안 머리로 돌진해요 · 처음 부딪힌 상대를 넘어뜨리고 퍽을 떨어뜨리게 해요',{t:X.t});",
    "case 'crest':return fmtL('{t}초 동안 머리로 돌진해요 · 처음 부딪힌 상대를 넘어뜨리고 퍽을 떨어뜨리게 해요 · 하키 규칙: 퍽 없는 상대를 넘어뜨리면 방해 반칙',{t:X.t});")

RIN('spDesc', "case 'surge':return '길고 강한 돌진 · 주변 상대를 느리게 해요';",
    "case 'surge':return '길고 강한 돌진 · 주변 상대를 느리게 해요 · 하키 규칙: 퍽 없는 상대를 넘어뜨리면 방해 반칙';")

# ---- test exports ----
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,setHuman,autoSwitch,teamRoles,aiFormation,bestMate,RULE,RULE_K,rulesMode,rulesOn,rulesActive,penSecs,penFor,boxMax,onIce,shortH,rulesReset,boxSend,boxRelease,boxPlace,foulKind,breakaway,rulesFoul,rulesContact,stopPlay,rulesResume,foSetup,psStart,psFrame,psEnd,rulesScored,rulesSim,rulesAI,rulesMateOk,rulesIcingRisk,rulesSlideOk,rulesPathClear,rulesHud,rulesCall,refFrame,refSig,howV22,v22Frame,playing,checkGoal,bumpFx,ram18,useSpecial,resetPositions,endMatch,scored,")
