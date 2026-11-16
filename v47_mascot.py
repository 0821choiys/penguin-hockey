# v47: 3D mascots with entrance / victory / defeat cut-scenes (v47_mascot.js / .css)
R("/* ================= INIT ================= */", "/*MSC:js*/" + rd('v47_mascot.js') + "/*MSC:jsend*/\n/* ================= INIT ================= */")
_st_end47 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end47] + rd('v47_mascot.css') + "\n" + s[_st_end47:]
# the world stands still while a scene plays (like the skill cinematics); particles and the camera keep the real clock
R("G.rdt=dt;if(G.cine){safe(cineStep,dt);if(G.cine)dt=0;}", "G.rdt=dt;if(G.masc){safe(mascStep,dt);if(G.masc)dt=0;}else if(G.cine){safe(cineStep,dt);if(G.cine)dt=0;}")
R("safe(v23Frame,G.cine?G.rdt:dt);", "safe(v23Frame,(G.cine||G.masc)?G.rdt:dt);")
R("safe(updateParticles,G.cine?G.rdt:dt)", "safe(updateParticles,(G.cine||G.masc)?G.rdt:dt)")
R("function updateCamera(dt){\n  if(G.cine&&G.view==='game'&&cineCam())return;", "function updateCamera(dt){\n  if(G.masc&&mascCam())return;\n  if(G.cine&&G.view==='game'&&cineCam())return;")
R("safe(lxFrame,dt);safe(p3Frame);", "safe(lxFrame,dt);safe(p3Frame);safe(mascLate);")
# entrance after the match is set up; end scene before the result screen; a new match / the menu clears any scene
RIN('startMatch', "v10MatchStart(cfg);", "v10MatchStart(cfg);safe(()=>mascIntro(cfg));")
R("if(G.stateT<=0&&G.result&&!G.resultShown){G.resultShown=true;if(G.result.chal)showChalResult();else showResultScreen();}",
  "if(G.stateT<=0&&G.result&&!G.resultShown){G.resultShown=true;const go=()=>{if(G.result.chal)showChalResult();else showResultScreen();};if(G.result.chal||!mascOutro(go))go();}")
# achievement pop-ups wait until a mascot scene is over (they would be hidden under it)
RIN('achNext', "const el=$('#achPop');if(achShowing", "if(typeof G!=='undefined'&&G.masc){clearTimeout(achNext.w);achNext.w=setTimeout(achNext,400);return;}const el=$('#achPop');if(achShowing")
R("cineClear();G.cineFull=null;", "cineClear();G.cineFull=null;mascClear();")
# setting: 마스코트 연출 (전체 / 짧게 / 끄기)
R("  {k:'cine',label:'기술 연출',opts:[['full','시네마틱'],['short','짧게'],['off','끄기']]},",
  "  {k:'cine',label:'기술 연출',opts:[['full','시네마틱'],['short','짧게'],['off','끄기']]},\n  {k:'masc',label:'마스코트 연출',opts:[['full','전체'],['short','짧게'],['off','끄기']]},")
R("const DEF_SET={cine:'full',", "const DEF_SET={masc:'full',cine:'full',")
R("if(['full','short','off'].includes(ss.cine))save.set.cine=ss.cine;", "if(['full','short','off'].includes(ss.cine))save.set.cine=ss.cine;if(['full','short','off'].includes(ss.masc))save.set.masc=ss.masc;")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,MSC,MS_SP,MS_WL,MS_RIG,mBody,mPose,mPlace,mascCan,mascPair,mascStart,mascEnd,mascClear,mascIntro,mascOutro,mascStep,mascShot,mascMode,mascPreview,")
