# v25: skill cinematics — your own special skill plays a real cut-scene (freeze · letterbox · hero camera · portrait band · impact frame)
#  - game code: v25_cine.js (inserted before INIT), styles: v25_cine.css
R("/* ================= INIT ================= */", rd('v25_cine.js') + "\n/* ================= INIT ================= */")
_st_end25 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end25] + rd('v25_cine.css') + "\n" + s[_st_end25:]
R('  <button class="tb" id="tbSwap">교체</button>\n</div>', '  <button class="tb" id="tbSwap">교체</button>\n</div>\n<div id="cine" aria-hidden="true"></div>')

# sounds: cut-in swish, a rising charge under the portrait, a deep impact boom
R("    bray(){tone(640,", """    cineIn(){noise(.32,2600,.6,.16);noise(.18,700,.7,.14,'lowpass');tone(240,.28,'sawtooth',.05,960);},
    cineCharge(d){if(!ok())return;d=Math.max(.3,d);const t=ctx.currentTime,o=ctx.createOscillator(),o2=ctx.createOscillator(),fi=ctx.createBiquadFilter(),g=ctx.createGain();
      o.type='sawtooth';o2.type='square';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(660,t+d);o2.frequency.setValueAtTime(165.5,t);o2.frequency.exponentialRampToValueAtTime(990,t+d);
      fi.type='lowpass';fi.frequency.setValueAtTime(500,t);fi.frequency.exponentialRampToValueAtTime(4200,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.06,t+d*.92);g.gain.exponentialRampToValueAtTime(.0001,t+d+.05);
      o.connect(fi);o2.connect(fi);fi.connect(g);g.connect(master);o.start(t);o2.start(t);o.stop(t+d+.1);o2.stop(t+d+.1);noise(d,5200,1.2,.03);},
    cineHit(){tone(78,.7,'sine',.42,30);noise(.55,420,.6,.42,'lowpass');noise(.3,4200,.9,.2);tone(1320,.35,'triangle',.05,330);tone(660,.5,'sawtooth',.04,160,.02);},
    bray(){tone(640,""")

# time stops while the scene plays (the caster still animates on real time)
R("if(G.hitStop>0){G.hitStop-=dt;dt*=.02;}else if(G.slow",
  "G.rdt=dt;if(G.cine){safe(cineStep,dt);if(G.cine)dt=0;}else if(G.hitStop>0){G.hitStop-=dt;dt*=.02;}else if(G.slow")
R("safe(v22Frame,dt);safe(v23Frame,dt);", "safe(v22Frame,dt);safe(v23Frame,G.cine?G.rdt:dt);")
R("safe(updateParticles,dt)", "safe(updateParticles,G.cine?G.rdt:dt)")
RIN('castPost', "  const P=p.pg,cx=P.cx;", "  if(G.cine&&G.cine.p===p){dt=G.rdt;t=G.t+G.cine.t;}\n  const P=p.pg,cx=P.cx;")
RIN('castPost', "  c.t+=dt;const u=", "  if(!(G.cine&&G.cine.p===p))c.t+=dt;const u=")
# camera: the cinematic camera takes over, then blends back
R("function updateCamera(dt){", "function updateCamera(dt){\n  if(G.cine&&G.view==='game'&&cineCam())return;")
R("camera.setViewOffset(W_,H_,ox,oy,W_,H_);}else camera.clearViewOffset();",
  "camera.setViewOffset(W_,H_,ox,oy,W_,H_);}else camera.clearViewOffset();\n  if(G.cineBlend&&G.view==='game')cineCamBlend();")
# your own casts: the cinematic (or, when it is off / reduced motion, the v23 call-out banner)
RIN('castStart', "if(p.human&&!whiff){castBanner(p,C);", "if(p.human&&!whiff&&!cineStart(p)){castBanner(p,C);")
R("G.hype=hypeNew();G.hitStop=0;G.slow=null;G.replay=null;", "G.hype=hypeNew();G.hitStop=0;G.slow=null;G.replay=null;cineClear();G.cineFull=null;")

# setting: 기술 연출 (cinematic / short / off), saved additively in save.set.cine
R("const DEF_SET={rules:'full',", "const DEF_SET={cine:'full',rules:'full',")
R("if(['full','fouls','off'].includes(ss.rules))save.set.rules=ss.rules;",
  "if(['full','fouls','off'].includes(ss.rules))save.set.rules=ss.rules;\n  if(['full','short','off'].includes(ss.cine))save.set.cine=ss.cine;")
R("  {k:'rules',label:'하키 규칙',opts:[['full','전체'],['fouls','반칙만'],['off','끄기']]},",
  "  {k:'rules',label:'하키 규칙',opts:[['full','전체'],['fouls','반칙만'],['off','끄기']]},\n  {k:'cine',label:'기술 연출',opts:[['full','시네마틱'],['short','짧게'],['off','끄기']]},")

R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,CINE,cineMode,cineOk,cineStart,cineStep,cineSkip,cineCastU,cineEnd,cineClear,cineCam,cineCamBlend,cineAngle,cineShots,cineInside,cineWorld,")
