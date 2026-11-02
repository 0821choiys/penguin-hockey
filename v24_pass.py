# v24: fish pass (정어리 → 청어 → 광어 → 넙치 → 도다리 → 꽁치 → …) — 30 tiers, free + gold track (in-game points only), a new fish name and trail every season
R("/* ================= INIT ================= */", rd('v24_pass.js') + "\n/* ================= INIT ================= */")
_st_end24 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end24] + rd('v24_pass.css') + "\n" + s[_st_end24:]

# ---- save (additive) ----
R("const save={v:10,chalTypes:[],rl:{intro:0},", "const save={v:10,chalTypes:[],rl:{intro:0},pass:{s:0,xp:0,gold:false,cf:0,cg:0,fw:0,last:null},")
R("if(s.rl&&typeof s.rl==='object')save.rl.intro=s.rl.intro?1:0;",
  "if(s.rl&&typeof s.rl==='object')save.rl.intro=s.rl.intro?1:0;\n  if(s.pass&&typeof s.pass==='object')passLoad(s.pass);")
# season trails exist before loadSave() validates the owned list; they are never for sale (only shown once owned)
R("rainbow:{name:'무지개',cost:150,col:null}};",
  "rainbow:{name:'무지개',cost:150,col:null},ps1:{name:'정어리',cost:0,col:[0.75,0.88,0.98],pass:1},ps2:{name:'청어',cost:0,col:[0.35,0.65,1],pass:1},ps3:{name:'광어',cost:0,col:[0.9,0.78,0.55],pass:1},ps4:{name:'넙치',cost:0,col:[0.72,0.8,0.45],pass:1},ps5:{name:'도다리',cost:0,col:[0.95,0.85,0.7],pass:1},ps6:{name:'꽁치',cost:0,col:[0.55,0.85,0.92],pass:1},ps7:{name:'고등어',cost:0,col:[0.3,0.85,0.7],pass:1},ps8:{name:'갈치',cost:0,col:[0.92,0.95,1],pass:1},ps9:{name:'참치',cost:0,col:[0.95,0.35,0.4],pass:1},ps10:{name:'연어',cost:0,col:[1,0.6,0.45],pass:1},ps11:{name:'도루묵',cost:0,col:[0.85,0.82,0.65],pass:1},ps12:{name:'명태',cost:0,col:[0.78,0.8,0.86],pass:1},ps13:{name:'삼치',cost:0,col:[0.55,0.8,1],pass:1},ps14:{name:'전어',cost:0,col:[1,0.88,0.55],pass:1},ps15:{name:'멸치',cost:0,col:[0.85,0.93,1],pass:1},ps16:{name:'방어',cost:0,col:[1,0.85,0.3],pass:1},ps17:{name:'참돔',cost:0,col:[1,0.45,0.55],pass:1},ps18:{name:'우럭',cost:0,col:[0.6,0.6,0.65],pass:1},ps19:{name:'농어',cost:0,col:[0.6,0.82,0.7],pass:1},ps20:{name:'복어',cost:0,col:[1,0.82,0.4],pass:1},ps21:{name:'아귀',cost:0,col:[0.7,0.55,0.4],pass:1},ps22:{name:'가자미',cost:0,col:[0.85,0.72,0.5],pass:1},ps23:{name:'조기',cost:0,col:[1,0.8,0.2],pass:1},ps24:{name:'숭어',cost:0,col:[0.7,0.78,0.86],pass:1}};")
R("Object.keys(TRAILS).map(", "Object.keys(TRAILS).filter(k=>!TRAILS[k].pass||save.trails.includes(k)).map(", 2)

# ---- home entry: a tile next to "모든 경기 모드" (same row, so the home needs no extra height on any screen) ----
R('<span class="tx"><b>모든 경기 모드</b></span>', '<span class="tx"><b>모든 경기 모드</b></span>')
_i24 = s.index('<button class="btn hm-modes hm-b hm-row" data-go="sMode">')
_j24 = s.index('</button>', _i24) + len('</button>')
s = s[:_j24] + '\n      <button class="btn hm-pass hm-b hm-tile" data-go="sPass" id="menuPass" aria-label="정어리 패스"><i class="ic ps-ic">🐟</i><span class="tx"><b><span id="psTitle">정어리 패스</span><span id="psBadge"></span></b><small id="psSub"></small></span></button>' + s[_j24:]

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
R("<small>'+g.p+' / '+d.n+' · 보상 ⭐'+d.pts+'P + '+d.xp+'XP</small></div>'", "<small>'+fmtL('{p} / {n} · ⭐{a}P · {x}XP · 🐟{s}',{p:g.p,n:d.n,a:d.pts,x:d.xp,s:PASS.earn.daily})+'</small></div>'")

R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,PASS,passLoad,passTheme,passName,passTier,passCan,passCount,passGrant,passClaim,passClaimAll,passCheck,passAdd,passMatch,passRowHtml,rulesRowHtml,passBuy,renderPass,passMenu,howV24,claimGoal,renderGoals,goalsEnsure,showResultScreen,hypeMenuRefresh,goScreen,seasonNow,TRAILS,")
