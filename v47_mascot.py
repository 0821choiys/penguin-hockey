# v47: 3D mascots (real animals + 3 elements) with entrance / victory / defeat cut-scenes (v47_mascot.js / .css)
# the module goes in minified (terser via tools/minjs.js: comments / whitespace out, local names shortened, top-level names and
# string quotes kept) so the game stays under 2 MB; the readable source is v47_mascot.js. Without node or terser the build stops
# with the reason (install once: cd tools && npm ci). The labs (br/msclab.js, br/msccut.js) swap the readable source in between the markers.
import subprocess as _sp47
_src47 = rd('v47_mascot.js')
try:
    _js47 = _sp47.run(['node', 'tools/minjs.js'], input=_src47.encode('utf-8'), capture_output=True, check=True).stdout.decode('utf-8')
    assert len(_js47) > 1000
except Exception as _e47:
    raise SystemExit('v47: could not minify v47_mascot.js (cd tools && npm ci): %s' % getattr(_e47, 'stderr', _e47))
R("/* ================= INIT ================= */", "/*MSC:js*/" + _js47 + "/*MSC:jsend*/\n/* ================= INIT ================= */")
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
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,MSC,MS_SP,MS_M,MS_RIG,mSmooth,mSkin,MS_THICK,mTouchTo,mascSpots,mascGap,mBody,mPose,mPlace,mascCan,mascPair,mascStart,mascEnd,mascClear,mascIntro,mascOutro,mascStep,mascShot,mascMode,mascPreview,")
# the mascots' voices and the sea / sky sounds (splash, thunder, ice cracking, roar, hoot…) — built from the same tone / noise helpers
R("    bray(){tone(640,.2,'sawtooth',.1,900);",
  "    msc(k){const f={splash(){noise(.5,900,.5,.32,'lowpass');noise(.35,2400,.8,.16,'bandpass',.04);noise(.22,5200,1,.08,'highpass',.1);},"
  "plop(){tone(520,.12,'sine',.12,180);noise(.1,1400,1,.08);},"
  "thunder(){noise(.09,6000,.7,.45,'highpass');noise(1.7,170,.4,.62,'lowpass',.03);noise(1.1,520,.5,.3,'lowpass',.18);tone(50,1.2,'sine',.3,30,.02);},"
  "crack(){noise(.06,3800,2,.38);noise(.25,900,.8,.24,'bandpass',.03);tone(140,.18,'square',.05,60);},"
  "roar(){tone(110,.9,'sawtooth',.13,68);tone(166,.8,'sawtooth',.07,90,.03);noise(.9,600,.6,.24);},"
  "hoot(){tone(420,.22,'sine',.14,380);tone(420,.42,'sine',.14,350,.32);},"
  "blow(){noise(.55,1400,.6,.18);noise(.4,500,.6,.12,'lowpass',.05);},"
  "zap(){noise(.2,4000,1.5,.2);tone(1200,.18,'sawtooth',.05,300);},"
  "chime(){[1568,2093,2637].forEach((q,i)=>tone(q,.4,'sine',.05,q,i*.07));},"
  "yip(){tone(700,.08,'triangle',.1,1100);tone(900,.1,'triangle',.08,1300,.12);},"
  "growl(){noise(.6,300,1.5,.2);tone(80,.6,'sawtooth',.06,60);},"
  "sob(){tone(520,.25,'sine',.08,380);tone(480,.32,'sine',.07,330,.3);},"
  "boop(){tone(660,.08,'sine',.12,880);tone(990,.12,'sine',.07,1320,.06);}};if(f[k])f[k]();else if(this[k])this[k](1);},\n    bray(){tone(640,.2,'sawtooth',.1,900);")
