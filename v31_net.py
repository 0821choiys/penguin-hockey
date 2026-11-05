# v31: 👥 friend code 1v1 online — Firebase signalling + WebRTC (database relay fallback), host-authoritative
import json as _json31, os as _os31
_cfg31 = 'null'
if _os31.path.exists('firebase-config.json'):
    _c = _json31.load(open('firebase-config.json', encoding='utf-8'))
    _cfg31 = _json31.dumps({k: _c[k] for k in ('apiKey', 'dbUrl', 'webClientId', 'ice') if k in _c}, ensure_ascii=False)
R("/* ================= INIT ================= */", rd('v31_net.js').replace('/*NETCFG*/null', _cfg31) + "\n/* ================= INIT ================= */")
_st_end31 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end31] + rd('v31_net.css') + "\n" + s[_st_end31:]

# ---- the screen and its entry in 경기 모드 ----
R('<div class="mode" data-mode="shootout"><i>🥅</i><b>승부차기</b><span>5번씩 차서 승부</span></div>',
  '<div class="mode" data-mode="shootout"><i>🥅</i><b>승부차기</b><span>5번씩 차서 승부</span></div>\n      <div class="mode" data-go="sFriend" id="modeFriend"><i>👥</i><b>친구 대전</b><span>친구 코드로 1대1</span></div>')
R('<div class="screen" id="sSet">', '<div class="screen" id="sFriend">\n  <div class="panel pfix fr-panel"><h2>친구 대전</h2><div class="pbody" id="frBody"></div><div class="row"><button class="btn small" data-go="sMode" id="frBack">뒤로</button></div></div>\n</div>\n\n<div class="screen" id="sSet">')
R("'sProfile','sRanked','sPass'];", "'sProfile','sRanked','sPass','sFriend'];")
R("  if(id==='sPass')renderPass();", "  if(id==='sPass')renderPass();\n  if(id==='sFriend')frRender();")

# ---- match setup: fixed sides, flat (fair) teams ----
R("cfg.teamKey=save.team;G.mode=cfg.mode;", "cfg.teamKey=cfg.netTeam||save.team;G.mode=cfg.mode;G.net=cfg.net||'';")
RIN('setupMatch', "if(isMine){const asg=(i===0||!!save.squad[i-1]);applyLevel(p,asg);applyChem(p,asg);}",
    "if(isMine&&!cfg.flat){const asg=(i===0||!!save.squad[i-1]);applyLevel(p,asg);applyChem(p,asg);}")
RIN('setupMatch', "const g=makePeng(tm,'goalie',isMine?'defense':'strong',9,true,'helmet');",
    "const g=makePeng(tm,'goalie',(isMine||cfg.flat)?'defense':'strong',9,true,'helmet');")

# ---- the second human (host side): any input object, remote aim, auto switching ----
_hc31 = FN('humanControl')
_hc31n = _hc31.replace('function humanControl(p,dt){', 'function humanControl(p,dt,inp){inp=inp||input;', 1).replace('input.', 'inp.')
_hc31n = _hc31n.replace('if(inp.swap){inp.swap=false;swapNearest();}', 'if(inp.swap){inp.swap=false;if(inp===input)swapNearest();else netSwapNearest(p);}')
if 'netSwapNearest' not in _hc31n: raise SystemExit('v31: humanControl swap not found')
RF('humanControl', _hc31n)
RIN('humanAim', "let ax=Math.sin(p.heading),az=Math.cos(p.heading);",
    "let ax=Math.sin(p.heading),az=Math.cos(p.heading);if(p.remote&&p.raim&&(p.raim[0]||p.raim[1]))return assistAim(p,p.raim[0],p.raim[1]);")
RIN('humanAim', "if(!IS_TOUCH&&G.mouse.active", "if(p.human&&!IS_TOUCH&&G.mouse.active")
RIN('decide', "if(p.human)humanControl(p,dt);else if(p.goalie)", "if(p.human)humanControl(p,dt);else if(p.remote)remoteControl(p,dt);else if(p.goalie)")
RIN('runPhysics', "autoSwitch(FIXED);simulate(FIXED);", "autoSwitch(FIXED);if(G.net==='host')netAutoSwitch(FIXED);simulate(FIXED);")

# ---- the friend's device does not simulate: it shows the host's snapshots ----
RIN('step', "      if(G.cfg.mode!=='demo'){\n        if(G.so||G.ps){}", "      if(G.cfg.mode!=='demo'&&G.net!=='guest'){\n        if(G.so||G.ps){}")
RIN('step', "      if(G.state==='play')runPhysics(dt);", "      if(G.state==='play'){if(G.net==='guest')netGuestApply();else runPhysics(dt);}")
RIN('step', "      if(!hypeGoalStep(dt)){", "      if(G.net==='guest')netGuestApply();else if(!hypeGoalStep(dt)){")
RIN('step', "      G.cheer=1;\n      if(G.stateT<=0){", "      G.cheer=1;\n      if(G.stateT<=0&&G.net!=='guest'){")
RIN('step', "      const sd=dt*.5;for(const p of G.pengs)if(!p.frozen)movePeng(p,sd);puckStep(sd);G.cheer=.8;",
    "      const sd=dt*.5;if(G.net==='guest')netGuestApply();else{for(const p of G.pengs)if(!p.frozen)movePeng(p,sd);puckStep(sd);}G.cheer=.8;")
RIN('step', "safe(v23Frame,G.cine?G.rdt:dt);", "safe(v23Frame,G.cine?G.rdt:dt);safe(netFrame,dt);")

# ---- events from the host: goals and skills ----
RIN('scored', "hypeGoal(tm,sh);pcGoal(tm,sh);", "hypeGoal(tm,sh);pcGoal(tm,sh);if(G.net==='host')netEv('g',{t:tm.key,s:[G.teams.blue.score,G.teams.red.score]});")
RIN('castStart', "const C=CAST[p.type];if(!C||!p.pg||G.view!=='game')return;",
    "const C=CAST[p.type];if(!C||!p.pg||G.view!=='game')return;if(G.net==='host')netEv('c',{i:G.pengs.indexOf(p),w:(p.specMax||0)<=2.6?1:0});")
# the full-screen skill cinematic freezes one device's world only: off in friend matches
R("function cineOk(p){return !!(p&&p.human&&G.view==='game'", "function cineOk(p){return !!(p&&p.human&&!G.net&&G.view==='game'")

# ---- leaving, the result screen ----
RIN('togglePause', "if(G.view!=='game'||G.state==='over')return;", "if(G.view!=='game'||G.state==='over')return;\n  if(G.net&&!G.paused){netLeaveAsk();return;}")
R("  else if(cfg.mode!=='trial')btns.push(['다시 하기',()=>startMatch(Object.assign({},cfg))]);",
  "  else if(cfg.mode==='friend'){btns.push(['👥 '+__L('친구 대전'),()=>{netClose();G.net='';goScreen('sFriend');}]);NET.st='done';setTimeout(()=>netShut(true),2500);}\n  else if(cfg.mode!=='trial')btns.push(['다시 하기',()=>startMatch(Object.assign({},cfg))]);")
R("function toMenu(){G.paused=false;", "function toMenu(){if(NET.st!=='idle'&&NET.st!=='done')netClose();G.paused=false;")

R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,NET,FB,fbOn,fbToken,dbReq,netHost,netJoin,netClose,netSnap,netGuestApply,netBegin,frRender,remoteControl,NETCFG,")
