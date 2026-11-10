# v39: finer UI detail (v39_luxe.css, second pass after the gold look was rejected) + the match show on the ice (v39_luxe.js) — visual only, no rule / number changes
R("/* ================= INIT ================= */", rd('v39_luxe.js') + "\n/* ================= INIT ================= */")
_st_end39 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end39] + rd('v39_luxe.css') + "\n" + s[_st_end39:]
# goal show: host / offline, the friend's side of an online match, and shoot-out goals
RIN('scored', "clutchClear();hypeGoal(tm,sh);pcGoal(tm,sh);", "clutchClear();hypeGoal(tm,sh);pcGoal(tm,sh);lxGoal(tm);")
R("    try{hypeGoal(tm,null);}catch(e){}\n", "    try{hypeGoal(tm,null);}catch(e){}\n    lxGoal(tm);\n")
RF('soGoal', "function soGoal(tm){if(G.so&&G.so.phase==='play'&&tm===G.so.shooterTeam){lxGoal(tm);soResult(true);}}")
# big hit: impact ring + sparks (both ways, not for friendly bumps)
RIN('bigHit', "  if(!G.mine||!G.cfg||G.cfg.mode==='demo'||hitter.team===victim.team)return;",
  "  lxHit(hitter,victim);\n  if(!G.mine||!G.cfg||G.cfg.mode==='demo'||hitter.team===victim.team)return;")
# the old puck trail was drawn AHEAD of the puck (its bright end at the puck, the fading end pointing where the puck goes):
# white on white ice, so nobody saw it. It now trails behind.
R("puckTrail.rotation.z=-Math.atan2(pk.vz,pk.vx)+Math.PI;", "puckTrail.rotation.z=-Math.atan2(pk.vz,pk.vx);")
# every frame
R("safe(ctlFrame);safe(hkFrame);", "safe(ctlFrame);safe(hkFrame);safe(lxFrame,dt);")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,applyFxSettings,LX,LXV,lxr,lxOn,lxNight,lxBuild,lxRing,lxGoal,lxHit,lxRays,lxFrame,scored,bigHit,")
