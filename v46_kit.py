# v46: 👕 team kit designer (v46_kit.js / .css) — colours, pattern, mascot crest, crest shape; free, applied wherever the team colour shows
R("/* ================= INIT ================= */", rd('v46_kit.js') + "\n/* ================= INIT ================= */")
_st_end46 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end46] + rd('v46_kit.css') + "\n" + s[_st_end46:]
# the jersey of a side that wears a custom kit
RIN('pkJerseyMat', "const lo=pkLo(),k='j'+teamKey+num+lo;", "{const kk=kitFor(teamKey);if(kk)return kitJerseyMat(teamKey,num,kk);}const lo=pkLo(),k='j'+teamKey+num+lo;")
# scarf tail stripes in the accent colour too
RIN('pkScarfTailGeo', "const tc=pkRGB(TEAM[teamKey].color),wh=[.96,.97,.98],list=[];", "const tc=pkRGB(TEAM[teamKey].color),wh=kitStripe(teamKey),list=[];")
# colours are settled for every match (online: both players' kits) and on every screen change (menus, showcase, cards)
RIN('setupMatch', "  condClear();clearMatch();", "  try{kitSync(cfg);}catch(e){}\n  condClear();clearMatch();")
R("function goScreen(id){\n", "function goScreen(id){\n  try{kitSync();}catch(e){}\n")
# the human marker and the skill cut-in follow the real team colour
R("marker.children[0].material.color.setHex(c===0x2f7bff?0x6fb0ff:0xff8c98);", "marker.children[0].material.color.setHex(parseInt(kitMix(kitHex(c),'#ffffff',.35).slice(1),16));")
R("tc=p.team.key==='blue'?'#2f7bff':'#ff3b4e',g=GRADES[RAR[p.type]||0];", "tc=kitHex(TEAM[p.team.key].color),g=GRADES[RAR[p.type]||0];")
# online: the kit travels with the player info
R("ty:[0,1,2].map(i=>i===0?save.type:(save.squad[i-1]||mt[(i-1)%mt.length])),n:String((save.profile&&save.profile.name)||'').slice(0,16)};",
  "ty:[0,1,2].map(i=>i===0?save.type:(save.squad[i-1]||mt[(i-1)%mt.length])),n:String((save.profile&&save.profile.name)||'').slice(0,16),kit:kitNet()};")
# screen + home tile
R('<div class="screen" id="sSet">', '<div class="screen" id="sKit">\n  <div class="panel pfix kit-panel"><h2>👕 유니폼 디자인</h2><div class="pbody" id="kitBody"></div><div class="row" style="margin-top:8px"><button class="btn small" data-go="sMenu">완료</button></div></div>\n</div>\n\n<div class="screen" id="sSet">')
R("'sPass','sFriend','sStick'];", "'sPass','sFriend','sStick','sKit'];")
R("  if(id==='sStick')stkRender();", "  if(id==='sStick')stkRender();\n  if(id==='sKit')kitRender();")
R('<span class="tx"><b>스틱 공방<span id="stkBadge"></span></b><small>뽑기 · 제작 · 강화</small></span></button>', '<span class="tx"><b>스틱 공방<span id="stkBadge"></span></b><small>뽑기 · 제작 · 강화</small></span></button>\n      <button class="btn hm-kit hm-b hm-tile" data-go="sKit"><i class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 3.2 3.4 6.1l1.9 4.1 2.1-.9V20.5h9.2V9.3l2.1.9 1.9-4.1-5.2-2.9c-.4 1.5-1.8 2.5-3.4 2.5s-3-1-3.4-2.5z"/><circle cx="12" cy="12.5" r="2.6"/></svg></i><span class="tx"><b>유니폼<span id="kitBadge"></span></b><small>색 · 무늬 · 마스코트</small></span></button>')
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,KIT,KIT_ART,KIT_CUR,KIT_DEF,kit,kitClean,kitSig,kitSync,kitFor,kitPick,kitDist,kitLum,kitAcc,kitHex,kitMix,kitCrestSvg,kitJerseySvg,kitJerseyMat,kitPaint,kitPurge,kitBoard,kitNet,kitStripe,kitRender,kitSet,TEAM,pkJerseyMat,netInfo,setupMatch,NET,pkGeoC,pkMatC,")
R("const save={v:10,", "const save={v:10,kit:{on:0,c1:'#2f7bff',c2:'#ffffff',pat:'classic',crest:'circle',mas:'peng'},")
R("if(s.pass&&typeof s.pass==='object')passLoad(s.pass);",
  "if(s.pass&&typeof s.pass==='object')passLoad(s.pass);\n  if(s.kit&&typeof s.kit==='object'){const q=s.kit,hx=v=>(typeof v==='string'&&/^#[0-9a-fA-F]{6}$/.test(v))?v.toLowerCase():null,w=(v,d)=>(typeof v==='string'&&/^[a-z]{2,10}$/.test(v))?v:d;"
  "save.kit={on:q.on?1:0,c1:hx(q.c1)||'#2f7bff',c2:hx(q.c2)||'#ffffff',pat:w(q.pat,'classic'),crest:w(q.crest,'circle'),mas:w(q.mas,'peng')};}")
# goal flash, goal particles, v39 goal rings / rays, the puck ring of the carrier: the real team colour
R("const col=key==='blue'?[.35,.65,1]:[1,.38,.45],gx=tm.dir*W;", "const col=kitC3(key,key==='blue'?[.35,.65,1]:[1,.38,.45]),gx=tm.dir*W;")
R("fl.style.setProperty('--gc',key==='blue'?'rgba(80,150,255,':'rgba(255,90,110,');", "fl.style.setProperty('--gc',kitRgba(key,key==='blue'?'rgba(80,150,255,':'rgba(255,90,110,'));")
R("const c=tm.key==='blue'?[.3,.68,1]:[1,.34,.42];", "const c=kitC3(tm.key,tm.key==='blue'?[.3,.68,1]:[1,.34,.42]);")
R("lxRays(mine?'mine':'theirs',tm.key==='blue'?'#58b8ff':'#ff6a7c');", "lxRays(mine?'mine':'theirs',kitCssC(tm.key,tm.key==='blue'?'#58b8ff':'#ff6a7c'));")
R("(G.carry.team.key==='blue'?0x3d8bff:0xff4d5e)", "kitHexN(G.carry.team.key,G.carry.team.key==='blue'?0x3d8bff:0xff4d5e)")
# switching sides (blue / red) moves the kit with the player at once
R("el.querySelectorAll('[data-sqteam]').forEach(b=>{b.onclick=()=>{save.team=b.dataset.sqteam;persist();SFX.ui();renderSquad();};});",
  "el.querySelectorAll('[data-sqteam]').forEach(b=>{b.onclick=()=>{save.team=b.dataset.sqteam;persist();try{kitSync();}catch(e){}SFX.ui();renderSquad();};});")
R("if(tm){save.team=tm.dataset.team;persist();renderSelect();rebuildShowcase();SFX.ui();return;}", "if(tm){save.team=tm.dataset.team;persist();try{kitSync();}catch(e){}renderSelect();rebuildShowcase();SFX.ui();return;}")
