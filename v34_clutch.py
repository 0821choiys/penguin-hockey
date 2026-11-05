# v34: 🔥 comeback drama — chase in the last 30 s while trailing, gold EQUALIZER! / COMEBACK! goals, COMEBACK WIN!
R("/* ================= INIT ================= */", rd('v34_clutch.js') + "\n/* ================= INIT ================= */")
_st_end34 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end34] + rd('v34_clutch.css') + "\n" + s[_st_end34:]
R('<div id="gflash"></div>', '<div id="gflash"></div><div id="chaseFx"></div>')
# heartbeat
R("    hop(){tone(300,.18,'sine',.13,760);},", "    heart(v){tone(64,.15,'sine',.55*v,46);tone(58,.2,'sine',.4*v,42,.19);},\n    hop(){tone(300,.18,'sine',.13,760);},")
# every frame of a match (after the hype frame), the goal moment, reset
RIN('hypeFrame', "  if(h.ringT>0){", "  safe(clutchFrame,dt);\n  if(h.ringT>0){")
# the last-10-s countdown number must not sit on top of the goal banner
RIN('hypeGoal', "  const info=classifyGoal(tm,sh);", "  {const lt=$('#late');if(lt)lt.classList.remove('on');}\n  const info=classifyGoal(tm,sh);")
RIN('hypeGoal', "  const scp=$(key==='blue'?'#sB':'#sR');", "  if(real)G.cbLast=clutchGoal(tm,main);\n  const scp=$(key==='blue'?'#sB':'#sR');")
RIN('hypeReset', "  G.hype=hypeNew();", "  clutchClear();document.body.classList.remove('cbhit');G.cbLast=null;\n  G.hype=hypeNew();")
# goals end the chase at once (the frame only runs in play)
RIN('scored', "hypeGoal(tm,sh);pcGoal(tm,sh);", "clutchClear();hypeGoal(tm,sh);pcGoal(tm,sh);")
# a win after trailing at any point is a comeback win
R("const cm=G.hype&&G.hype.trailLate;", "const cm=G.hype&&(G.hype.trailLate||G.hype.wasBehind);")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,SFX,CLUTCH,clutchOn,clutchFrame,clutchGoal,clutchClear,hypeGoal,")
