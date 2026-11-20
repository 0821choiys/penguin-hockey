# v49: 🧊 펭귄 원정 — a run of short matches: pick 1 of 3 upgrades after every win, a twist per stage, a boss every 5th stage, 2 lives, a best record
# (owner, 2026-11-18: "add something that makes me want to keep playing — it's not fun"; picked "the match is flat" + "no reason to play another")
R("/* ================= INIT ================= */", rdm('v49_run.js') + "\n/* ================= INIT ================= */")
_st_end49 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end49] + rd('v49_run.css') + "\n" + s[_st_end49:]
# screens: the run screen, an entry in 모든 경기 모드, a card on the home under the tiles
R('<div class="screen" id="sSet">', '<div class="screen" id="sRun">\n  <div class="panel pfix run-panel"><div class="run-head"><h2>🧊 펭귄 원정</h2><span id="runBest"></span></div><div class="pbody" id="runBody"></div><div id="runFoot"></div><div class="row" style="margin-top:8px"><button class="btn small" data-go="sMenu">뒤로</button></div></div>\n</div>\n\n<div class="screen" id="sSet">')
R('<div class="mode" data-mode="tour"><i>🏆</i><b>토너먼트</b><span>3개 팀을 차례로 격파</span></div>',
  '<div class="mode" data-mode="tour"><i>🏆</i><b>토너먼트</b><span>3개 팀을 차례로 격파</span></div>\n      <div class="mode" data-go="sRun" id="modeRun"><i>🧊</i><b>펭귄 원정</b><span>이길수록 강해지는 연속 도전</span></div>')
R('<button id="menuGoals" data-go="sGoals" aria-label="오늘의 목표"></button>', '<button id="menuRun" data-go="sRun" aria-label="펭귄 원정"></button><button id="menuGoals" data-go="sGoals" aria-label="오늘의 목표"></button>')
R("'sPass','sFriend','sStick','sKit'];", "'sPass','sFriend','sStick','sKit','sRun'];")
R("  if(id==='sKit')kitRender();", "  if(id==='sKit')kitRender();\n  if(id==='sRun')renderRun();")
RIN('leagueMenuRefresh', "try{coachRow();}catch(e){}", "try{coachRow();}catch(e){}try{runMenu();}catch(e){}")
# a run match plays like a quick match: referee, items, events as set in 설정 (the golden-puck twist brings its own pucks even with events off)
RIN('eventsOn', "return !!(c&&save.set.events&&G.view==='game'&&['quick','free','tour'].includes(c.mode)&&!G.so);",
    "return !!(c&&(save.set.events||(c.run&&c.run.mod==='golden'))&&G.view==='game'&&['quick','free','tour','run'].includes(c.mode)&&!G.so);")
RIN('itemsOn', "['quick','free','tour'].includes(c.mode)", "['quick','free','tour','run'].includes(c.mode)")
R("RULE_MODES=['quick','ranked','tour','trial']", "RULE_MODES=['quick','ranked','tour','trial','run']")
# in the match: upgrades / boss / twists at the start, golden pucks on a timer, first to 3 ends the match after the goal show
R("blurUI();v10MatchStart(cfg);safe(()=>mascIntro(cfg));", "blurUI();v10MatchStart(cfg);safe(()=>runMatchStart(cfg));safe(()=>mascIntro(cfg));")
RIN('step', "G.elapsed+=dt;", "G.elapsed+=dt;runStep(dt);")
RIN('step', "else if(G.ot){endMatch();}", "else if(G.ot||runFirstDone()){endMatch();}")
# goalies can carry their own reflexes (our 🧤 upgrade, the boss / 🧱 twist on theirs); everyone else keeps the difficulty's
RIN('movePeng', "const gk=G.diff.gk,dv=p.diveT>0", "const gk=p.gkd||G.diff.gk,dv=p.diveT>0")
RIN('aiGoalie', "gk=G.diff.gk,ai=p.ai", "gk=p.gkd||G.diff.gk,ai=p.ai")
RIN('gkRead', "const gk=G.diff.gk,pk=G.puck;", "const gk=g.gkd||G.diff.gk,pk=G.puck;")
# result: the stage reward is paid like the tournament bonus (shown row = paid), buttons lead back to the run screen
RIN('showResultScreen', "  }else if(cfg.mode==='ranked'){",
    "  }else if(cfg.mode==='run'){const x=runResult(R,win,draw);extra=x.extra;extraName=x.extraName;if(x.title)title=x.title;extraNote=x.note;btns.push(...x.btns);\n  }else if(cfg.mode==='ranked'){")
# save (additive) + sanitised load (literals only: loadSave runs before the feature modules)
R("const save={v:10,", "const save={v:10,run:{best:0,runs:0,wins:0,cur:null,last:null},")
R("if(s.pass&&typeof s.pass==='object')passLoad(s.pass);",
  "if(s.pass&&typeof s.pass==='object')passLoad(s.pass);\n  if(s.run&&typeof s.run==='object'){const q=s.run,n=(v,a,b)=>Math.max(a,Math.min(b,Math.floor(+v)||0)),U=['pow','chg','aim','pass','dash','poke','spd','ot','tech','gk','life','fund','lead','ace'],"
  "ups=o=>{const r={};if(o&&typeof o==='object')for(const k of U)if(o[k])r[k]=n(o[k],0,3);return r;},c=q.cur&&typeof q.cur==='object'?q.cur:null,L=q.last&&typeof q.last==='object'?q.last:null;"
  "save.run={best:n(q.best,0,9999),runs:n(q.runs,0,99999),wins:n(q.wins,0,999999),"
  "cur:c&&n(c.st,0,9999)>=1&&n(c.lives,0,4)>=1?{st:n(c.st,1,9999),lives:n(c.lives,1,4),ups:ups(c.ups),earned:n(c.earned,0,9999999),mod:typeof c.mod==='string'&&c.mod.length<10?c.mod:null,"
  "opp:Array.isArray(c.opp)?c.opp.filter(x=>typeof x==='string'&&x.length<16).slice(0,4):null,pend:Array.isArray(c.pend)?c.pend.filter(x=>U.includes(x)).slice(0,3):null}:null,"
  "last:L?{st:n(L.st,0,9999),cleared:n(L.cleared,0,9999),earned:n(L.earned,0,9999999),ups:ups(L.ups)}:null};}")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,RULE_MODES,RUN,RUN_UP,RUN_MOD,RUN_STOP,RUN_RN,runCur,runBoss,runStop,runDiff,runPay,runEndless,runOpp,runModPick,runPrep,runNew,runDraw,runPick,runQuit,runFix,runCfg,runGo,runTT,runMine,runTheirs,runGk,runMatchStart,runStep,runFirstDone,runAfter,runResult,renderRun,runMenu,runModName,runModIco,runModDesc,runUpDesc,")
