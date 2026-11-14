# v44: coach level, win streaks, first win of the day (v44_fun.js), points only, nothing random
R("/* ================= INIT ================= */", rd('v44_fun.js') + "\n/* ================= INIT ================= */")
_st_end44 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end44] + rd('v44_fun.css') + "\n" + s[_st_end44:]
RIN('showResultScreen', "    R.pass=passMatch(win,draw,ms);", "    R.pass=passMatch(win,draw,ms);\n    R.co=coachMatch(R,cfg,win,draw,ms);")
RIN('showResultScreen', "  html+=condBonusRow(R);", "  html+=condBonusRow(R);html+=coachRowsHtml(R);")
RIN('showResultScreen', "  html+=passRowHtml(R)+bondRowHtml(R);", "  html+=passRowHtml(R)+bondRowHtml(R)+coachBarHtml(R);")
RIN('showResultScreen', "  hypeResultAnim();\n}", "  hypeResultAnim();coachResultAnim(R);\n}")
RIN('leagueMenuRefresh', "  seasonPopSoon();news18Soon();", "  seasonPopSoon();news18Soon();try{coachRow();}catch(e){}")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,CO,coach,coachNeed,coachReward,coachStreakBonus,coachFwReady,coachMatch,coachRowsHtml,coachBarHtml,coachLevelUp,coachRow,coachPlace,showResultScreen,leagueMenuRefresh,")
# save (additive) + sanitised load (literals only: loadSave runs before the feature modules)
R("const save={v:10,", "const save={v:10,coach:{lv:1,xp:0,streak:0,best:0,fw:''},")
R("if(s.pass&&typeof s.pass==='object')passLoad(s.pass);",
  "if(s.pass&&typeof s.pass==='object')passLoad(s.pass);\n  if(s.coach&&typeof s.coach==='object'){const q=s.coach;save.coach={lv:Math.max(1,Math.min(99,(q.lv|0)||1)),xp:Math.max(0,Math.min(100000,q.xp|0)),streak:Math.max(0,Math.min(9999,q.streak|0)),best:Math.max(0,Math.min(9999,q.best|0)),fw:(typeof q.fw==='string'&&q.fw.length<12)?q.fw:''};}")
