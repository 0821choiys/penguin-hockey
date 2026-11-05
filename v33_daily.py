# v33: 📅 7-day attendance — one reward per calendar day (days need not be consecutive), day 7 = attendance trail
R("/* ================= INIT ================= */", rd('v33_daily.js') + "\n/* ================= INIT ================= */")
_st_end33 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end33] + rd('v33_daily.css') + "\n" + s[_st_end33:]
# the attendance-only trail (in the shop list only once owned, like the pass trails)
R("ps1:{name:'정어리',cost:0,col:[0.75,0.88,0.98],pass:1},", "dly:{name:'출석 오로라',cost:0,col:[0.55,1,0.82],pass:1},ps1:{name:'정어리',cost:0,col:[0.75,0.88,0.98],pass:1},")
# save (additive) + sanitised load (literals only)
R("const save={v:10,bond:{},", "const save={v:10,login:{d:0,last:0,cyc:0,tot:0},bond:{},")
R("if(s.pass&&typeof s.pass==='object')passLoad(s.pass);",
  "if(s.pass&&typeof s.pass==='object')passLoad(s.pass);\n  if(s.login&&typeof s.login==='object'){const q=s.login;save.login={d:Math.max(0,Math.min(6,q.d|0)),last:Math.max(0,q.last|0),cyc:Math.max(0,q.cyc|0),tot:Math.max(0,q.tot|0)};}")
# entry points: 오늘의 목표 tab card, the goals badge, once a day on the home screen
RIN('renderGoals', "  if(gTab==='day'){\n", "  if(gTab==='day'){\n    h+=dlyCardHtml();\n")
R("function claimable(){goalsEnsure();let n=0;", "function claimable(){goalsEnsure();let n=(typeof dlyCan==='function'&&dlyCan())?1:0;")
R("  if(id==='sMenu'){hypeMenuRefresh();leagueMenuRefresh();}", "  if(id==='sMenu'){hypeMenuRefresh();leagueMenuRefresh();dlyAuto();}")
R("enterDemo();setTOD(.1,10);updateEnv(true);tutMaybeAsk();", "enterDemo();setTOD(.1,10);updateEnv(true);tutMaybeAsk();safe(dlyInit);safe(dlyAuto);")
# Android back closes the dialog
R("const APP_OV=['#cfmDlg','#cardDlg',", "const APP_OV=['#dlyDlg','#cfmDlg','#cardDlg',")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,DLY,DLY_DUP,dlyDay,dlyCan,dlyClaim,dlyNext,dlyBody,dlyCardHtml,dlyOpen,dlyAuto,claimable,")
