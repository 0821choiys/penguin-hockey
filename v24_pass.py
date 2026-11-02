# v24: Sardine Pass (정어리 패스) — 30 tiers, free + gold track (in-game points only), a new name and trail every season
R("/* ================= INIT ================= */", rd('v24_pass.js') + "\n/* ================= INIT ================= */")
_st_end24 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end24] + rd('v24_pass.css') + "\n" + s[_st_end24:]

# ---- save (additive) ----
R("const save={v:10,chalTypes:[],rl:{intro:0},", "const save={v:10,chalTypes:[],rl:{intro:0},pass:{s:0,xp:0,gold:false,cf:0,cg:0,fw:0,last:null},")
R("if(s.rl&&typeof s.rl==='object')save.rl.intro=s.rl.intro?1:0;",
  "if(s.rl&&typeof s.rl==='object')save.rl.intro=s.rl.intro?1:0;\n  if(s.pass&&typeof s.pass==='object')passLoad(s.pass);")
# season trails exist before loadSave() validates the owned list; they are never for sale (only shown once owned)
R("rainbow:{name:'무지개',cost:150,col:null}};",
  "rainbow:{name:'무지개',cost:150,col:null},ps1:{name:'오로라 빛',cost:0,col:[.45,1,.78],pass:1},ps2:{name:'빙하 청록',cost:0,col:[.3,.95,.95],pass:1},ps3:{name:'크릴 레드',cost:0,col:[1,.42,.38],pass:1},ps4:{name:'해적 브론즈',cost:0,col:[.85,.55,.2],pass:1},ps5:{name:'은하수 보라',cost:0,col:[.72,.55,1],pass:1},ps6:{name:'왕국 루비',cost:0,col:[.95,.25,.45],pass:1},ps7:{name:'눈보라 은빛',cost:0,col:[.78,.84,.95],pass:1},ps8:{name:'심해 파랑',cost:0,col:[.15,.45,1],pass:1}};")
R("Object.keys(TRAILS).map(", "Object.keys(TRAILS).filter(k=>!TRAILS[k].pass||save.trails.includes(k)).map(", 2)

# ---- home entry: a tile next to "모든 경기 모드" (same row, so the home needs no extra height on any screen) ----
R('<span class="tx"><b>모든 경기 모드</b></span>', '<span class="tx"><b>모든 경기 모드</b></span>')
_i24 = s.index('<button class="btn hm-modes hm-b hm-row" data-go="sMode">')
_j24 = s.index('</button>', _i24) + len('</button>')
s = s[:_j24] + '\n      <button class="btn hm-pass hm-b hm-tile" data-go="sPass" id="menuPass" aria-label="정어리 패스"><i class="ic ps-ic">🐟</i><span class="tx"><b>정어리 패스<span id="psBadge"></span></b><small id="psSub"></small></span></button>' + s[_j24:]

R('<div class="screen" id="sSet">', '<div class="screen" id="sPass">\n  <div class="panel pp-panel"><div id="psHead"></div><div id="psBody"></div><div class="row" style="margin-top:10px"><button class="btn small" data-go="sMenu">완료</button></div></div>\n</div>\n\n<div class="screen" id="sSet">')
R("'sProfile','sRanked'];", "'sProfile','sRanked','sPass'];")
R("if(id==='sRanked')renderRanked();", "if(id==='sRanked')renderRanked();\n  if(id==='sPass')renderPass();")
RIN('hypeMenuRefresh', "  }catch(e){}", "    passMenu();\n  }catch(e){}")

# ---- earning: every finished match (result screen) and every claimed daily goal ----
R("    if(cfg.mode==='tour'&&G.tour&&win&&G.tour.round+1>save.rec.tourBest)save.rec.tourBest=G.tour.round+1;\n    persist();",
  "    if(cfg.mode==='tour'&&G.tour&&win&&G.tour.round+1>save.rec.tourBest)save.rec.tourBest=G.tour.round+1;\n    R.pass=passMatch(win,draw,ms);\n    persist();")
R("  html+='<div class=\"rs-xp\">'+hy.xp.map(", "  html+=passRowHtml(R);\n  html+='<div class=\"rs-xp\">'+hy.xp.map(")
R("  html+='<div class=\"rs-stats\">슛 '", "  html+=rulesRowHtml();\n  html+='<div class=\"rs-stats\">슛 '")
R("g.c=true;save.points+=d.pts;const r=grantXp(save.type,d.xp);", "g.c=true;save.points+=d.pts;passAdd(PASS.earn.daily);const r=grantXp(save.type,d.xp);")
R("hypeToast('+'+d.pts+'P · +'+d.xp+'XP'+(r.to>r.from?' · LEVEL UP!':''));", "hypeToast('+'+d.pts+'P · +'+d.xp+'XP · 🐟+'+PASS.earn.daily+(r.to>r.from?' · LEVEL UP!':''));")
R("' · 보상 ⭐'+d.pts+'P + '+d.xp+'XP</small></div>'", "' · 보상 ⭐'+d.pts+'P + '+d.xp+'XP + 🐟'+PASS.earn.daily+'</small></div>'")

R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,PASS,passLoad,passTheme,passName,passTier,passCan,passCount,passGrant,passClaim,passClaimAll,passCheck,passAdd,passMatch,passRowHtml,rulesRowHtml,passBuy,renderPass,passMenu,howV24,claimGoal,renderGoals,goalsEnsure,showResultScreen,hypeMenuRefresh,goScreen,seasonNow,TRAILS,")
