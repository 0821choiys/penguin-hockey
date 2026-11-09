# v37: weekly fixes 2026-11-09 — a finished fish pass no longer shows fish it cannot take
R("/* ================= INIT ================= */", rd('v37_weekly.js') + "\n/* ================= INIT ================= */")
# daily goals: the claim toast and the reward line only mention fish while the pass can still take them
R("hypeToast('+'+d.pts+'P · +'+d.xp+'XP · 🐟+'+passGain(PASS.earn.daily)+(r.to>r.from?' · LEVEL UP!':''));",
  "hypeToast('+'+d.pts+'P · +'+d.xp+'XP'+goalFishTxt()+(r.to>r.from?' · LEVEL UP!':''));")
R("fmtL('{p} / {n} · ⭐{a}P · {x}XP · 🐟{s}',{p:g.p,n:d.n,a:d.pts,x:d.xp,s:passGain(PASS.earn.daily)})",
  "(passFull()?fmtL('{p} / {n} · ⭐{a}P · {x}XP',{p:g.p,n:d.n,a:d.pts,x:d.xp}):fmtL('{p} / {n} · ⭐{a}P · {x}XP · 🐟{s}',{p:g.p,n:d.n,a:d.pts,x:d.xp,s:passGain(PASS.earn.daily)}))")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,passFull,goalFishTxt,")   # test exports (keeps the "window.__PH={doPull," anchor for v16)
_st_end37 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end37] + rd('v37_weekly.css') + "\n" + s[_st_end37:]
RIN('ctlApply', "  if(jid===null)ctlJoyIdle();\n", "  if(jid===null)ctlJoyIdle();\n  ctlFitAll();   // v37: one-line labels\n")
RIN('ctlInit', "addEventListener('resize',ctlResize);", "addEventListener('resize',ctlResize);try{document.fonts.ready.then(()=>safe(ctlApply));}catch(_){}")
