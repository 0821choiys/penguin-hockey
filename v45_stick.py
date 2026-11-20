# v45: 🏒 stick workshop (v45_stick.js / .css) — materials drawn with points (odds on screen), crafting, abilities, upgrades
R("/* ================= INIT ================= */", rdm('v45_stick.js') + "\n/* ================= INIT ================= */")
_st_end45 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end45] + rd('v45_stick.css') + "\n" + s[_st_end45:]
# the stick's numbers sit on top of the penguin's personality (TT): ttOf reads the merged table when the skater carries a stick
R("const ttOf=p=>(p&&!p.goalie&&TT[p.type])||{};", "const ttOf=p=>(p&&!p.goalie&&(p.tt||TT[p.type]))||{};")
RIN('performShot', "if(!tap)sp*=(T_.pow||1);else sp*=(T_.tap||1);", "if(!tap)sp*=(T_.pow||1);else sp*=(T_.tap||1);if(!tap&&charge>=.8)sp*=(T_.pow80||1);")
RIN('performShot', "<(ow||OT_WIN);", "<(ow||OT_WIN+(T_.otw||0));")
RIN('performShot', "spread*=(T_.spread||1);", "spread*=(T_.spread||1);if(!tap&&charge>=.8)spread*=(T_.spread80||1);")
# the captain carries the equipped stick (offline; online friend matches are flat)
RIN('setupMatch', "applyLevel(p,asg);applyChem(p,asg);}", "applyLevel(p,asg);applyChem(p,asg);}\n      if(isMine&&i===0&&!cfg.flat&&!cfg.demo)stkApply(p,cfg);")
# screen + home tile
R('<div class="screen" id="sSet">', '<div class="screen" id="sStick">\n  <div class="panel pfix stk-panel"><h2>🏒 스틱 공방</h2><div class="seg" id="stkTabs"><button data-t="pull">재료 뽑기</button><button data-t="craft">제작</button><button data-t="mine">내 스틱</button></div><div class="pbody" id="stkBody"></div><div class="row" style="margin-top:8px"><button class="btn small" data-go="sMenu">완료</button></div></div>\n</div>\n\n<div class="screen" id="sSet">')
R("'sProfile','sRanked','sPass','sFriend'];", "'sProfile','sRanked','sPass','sFriend','sStick'];")
R("  if(id==='sFriend')frRender();", "  if(id==='sFriend')frRender();\n  if(id==='sStick')stkRender();")
R('<small id="psSub"></small></span></button>', '<small id="psSub"></small></span></button>\n      <button class="btn hm-stk hm-b hm-tile" data-go="sStick"><i class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3l9.6 13.4c.5.7 1.2 1.1 2.1 1.1H21v3h-6.4c-1.6 0-3-.8-3.9-2.1L2 4.2z"/><path d="M6.5 6.4l2-1.4M10 11.3l2-1.4"/></svg></i><span class="tx"><b>스틱 공방<span id="stkBadge"></span></b><small>뽑기 · 제작 · 강화</small></span></button>')
R("document.querySelectorAll('#scTabs button').forEach(b=>{b.onclick=", "document.querySelectorAll('#stkTabs button').forEach(b=>{b.onclick=()=>{try{SFX.ui();}catch(e){}stkTab=b.dataset.t;stkMsg='';stkRender();};});\ndocument.querySelectorAll('#scTabs button').forEach(b=>{b.onclick=")
RIN('leagueMenuRefresh', "  seasonPopSoon();news18Soon();", "  seasonPopSoon();news18Soon();try{stkBadge();}catch(e){}")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,STK,STK_M,STK_AB,STK_ST,STK_PART,stk,stkGet,stkEq,stkGrade,stkCalc,stkTT,stkApply,stkGeo,stkProbs,stkMatRate,stkEff,stkRoll,stkDraw,stkDrawOnce,stkFreeReady,stkCraft,stkCraftCost,stkCanCraft,stkEnhCost,stkEnhRate,stkEnhance,stkEquip,stkBreak,stkSell,stkAbDesc,stkSvg,stkSwatch,stkRender,stkOddsBox,stkPullHtml,stkCraftHtml,stkMineHtml,stkBadge,ttOf,performShot,")
# save (additive) + sanitised load (literals only: loadSave runs before the feature modules)
R("const save={v:10,", "const save={v:10,stk:{m:{s0:1,b2:1},seen:{s0:1,b2:1},list:[],eq:0,nu:1,pity:{s:0,b:0},pulls:0,free:'',hist:[]},")
R("if(s.pass&&typeof s.pass==='object')passLoad(s.pass);",
  "if(s.pass&&typeof s.pass==='object')passLoad(s.pass);\n  if(s.stk&&typeof s.stk==='object'){const q=s.stk,o={m:{},seen:{},list:[],eq:0,nu:1,pity:{s:0,b:0},pulls:0,free:'',hist:[]},okId=x=>typeof x==='string'&&/^[sb][0-9]$/.test(x);"
  "if(q.m&&typeof q.m==='object')for(const k in q.m)if(okId(k))o.m[k]=Math.max(0,Math.min(99,q.m[k]|0));"
  "if(q.seen&&typeof q.seen==='object')for(const k in q.seen)if(okId(k)&&q.seen[k])o.seen[k]=1;"
  "if(Array.isArray(q.list))for(const x of q.list.slice(0,12))if(x&&okId(x.s)&&okId(x.b)&&x.s[0]==='s'&&x.b[0]==='b'&&(x.u|0)>0&&!o.list.some(y=>y.u===(x.u|0)))o.list.push({u:x.u|0,s:x.s,b:x.b,lv:Math.max(0,Math.min(10,x.lv|0)),f:Math.max(0,Math.min(99,x.f|0))});"
  "o.nu=Math.max(1,Math.min(1e9,q.nu|0),...o.list.map(x=>x.u+1));o.eq=o.list.some(x=>x.u===(q.eq|0))?(q.eq|0):0;"
  "if(q.pity&&typeof q.pity==='object'){o.pity.s=Math.max(0,Math.min(29,q.pity.s|0));o.pity.b=Math.max(0,Math.min(29,q.pity.b|0));}"
  "o.pulls=Math.max(0,Math.min(1e9,q.pulls|0));o.free=(typeof q.free==='string'&&q.free.length<12)?q.free:'';"
  "if(Array.isArray(q.hist))o.hist=q.hist.filter(r=>Array.isArray(r)&&okId(r[0])).slice(0,30).map(r=>[r[0],Math.max(0,Math.min(4,r[1]|0))]);save.stk=o;}")
