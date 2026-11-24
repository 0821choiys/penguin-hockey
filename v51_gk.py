# v51: 🥅 goalie draw + 내 포지션 (owner, 2026-11-24: "add a goalie draw to the penguin draw and let me pick my position (2 or more a side);
# I can play goalie too, but only with characters from the goalie draw") — v51_gk.js / .css
R("/* ================= INIT ================= */", rdm('v51_gk.js') + "\n/* ================= INIT ================= */")
_st_end51 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end51] + rd('v51_gk.css') + "\n" + s[_st_end51:]
# the match: the captain takes the chosen slot (roles + formation), our goalie is the equipped goalie card
RIN('setupMatch', "const roles=ROLES[Math.max(1,n)]||[],form=FORM[Math.max(1,n)];", "const roles=gkRoleArr(isMine,n,cfg),form=gkFormArr(isMine,n,cfg);")
RIN('setupMatch', "const g=makePeng(tm,'goalie',(isMine||cfg.flat)?'defense':'strong',9,true,'helmet');",
    "const g=makePeng(tm,'goalie',gkSp(isMine,cfg),9,true,'helmet');if(isMine)gkPrep(g,cfg);else G.gkNum=0;")
# goalie skills: 철벽 makes the save radius bigger, 쏙 캐치 kills the rebound; a goalie card's 퍽 처리 sets how far saves bounce
RIN('puckStep', "let rad=p.r;if(p.goalie&&p.diveT>0)rad=1.1;", "let rad=p.r;if(p.goalie&&p.diveT>0)rad=p.human?p.r*GKD.dr:1.1;if(p.gkW>0)rad*=GKS.wall.k;")   # your dive reaches the exact spot, so it gets the pads, not the AI's lunge
RIN('puckStep', "if(vn<0){const e=p.goalie?.55:.16;pk.vx-=(1+e)*vn*nx;pk.vz-=(1+e)*vn*nz;touchPuck(p,-vn);}",
    "if(vn<0){const e=p.goalie?(p.gkEv||.55):.16;pk.vx-=(1+e)*vn*nx;pk.vz-=(1+e)*vn*nz;touchPuck(p,-vn);if(p.gkC>0)gkCatch(p);}")
# a human goalie's dive speed comes from its 다이빙 stat (+ 번개 반사); the AI keeps 15
RIN('movePeng', "cap=(dv?15:gk.cap)", "cap=(dv?(p.diveV||15):gk.cap)")
RIN('updateHud', "SPECIALS[pl.ty.special]", "gkSpName(pl)")
RIN('updateCamera', "fx=clamp(fx,-W+9,W-9);", "fx=clamp(fx,-W+gkCamM(),W-gkCamM());")
RIN('step', "G.elapsed+=dt;runStep(dt);", "G.elapsed+=dt;runStep(dt);gkStep(dt);")
# 팀 편성: our goalie card on the board (tap = choose), the captain drawn in the chosen slot, 내 포지션 under the size row
RIN('renderSquad', "let h='<div class=\"sq-gk\">GK<br>자동</div>';", "let h=gkSqBox(n,cw);")
RIN('renderSquad', "const ty=squadTypes(n),ch=computeChem(n),roles=ROLES[n]||[];", "const ty=squadTypes(n),ch=computeChem(n),roles=gkRolesSq(n),pm=gkPerm(n);")
RIN('renderSquad', "const pa=slotPos(n,pts[a]),pb=slotPos(n,pts[a+1]);", "const pa=slotPos(n,pm[pts[a]]),pb=slotPos(n,pm[pts[a+1]]);")
RIN('renderSquad', "pos=slotPos(n,i)", "pos=slotPos(n,pm[i])")
RIN('renderSquad', "renderSqStyle();", "renderSqStyle();gkSqRow(n);")
R('<div class="sq-wrap"><div class="sq-board" id="sqBoard"></div>', '<div id="sqPos"></div>\n    <div class="sq-wrap"><div class="sq-board" id="sqBoard"></div>')
# 뽑기 tab: 🐧 펭귄 / 🥅 골키퍼
RIN('renderScout', "h+=scPullHtml();", "h+=gkKindSeg()+(gkKind==='g'?gkPullHtml():scPullHtml());")
# save (additive) + sanitised load (literals only: loadSave runs before the feature modules)
R("const DEF_SET={qx:0,", "const DEF_SET={pos:'attacker',qx:0,")
R("if([-1,0,1].includes(ss.qx))save.set.qx=ss.qx;", "if([-1,0,1].includes(ss.qx))save.set.qx=ss.qx;if(['attacker','mid','defender','gk'].includes(ss.pos))save.set.pos=ss.pos;")
R("const save={v:10,", "const save={v:10,gk:{own:{},eq:'',pity:0,pulls:0,free:'',hist:[]},")
R("if(s.pass&&typeof s.pass==='object')passLoad(s.pass);",
  "if(s.pass&&typeof s.pass==='object')passLoad(s.pass);\n  if(s.gkTip)save.gkTip=1;"
  "if(s.gk&&typeof s.gk==='object'){const q=s.gk,o={own:{},eq:'',pity:0,pulls:0,free:'',hist:[]},ok=x=>typeof x==='string'&&/^g[0-9]$/.test(x);"
  "if(q.own&&typeof q.own==='object')for(const k in q.own)if(ok(k))o.own[k]=Math.max(0,Math.min(5,q.own[k]|0));"
  "o.eq=ok(q.eq)&&Object.prototype.hasOwnProperty.call(o.own,q.eq)?q.eq:'';o.pity=Math.max(0,Math.min(29,q.pity|0));o.pulls=Math.max(0,Math.min(1e9,q.pulls|0));"
  "o.free=(typeof q.free==='string'&&q.free.length<12)?q.free:'';"
  "if(Array.isArray(q.hist))o.hist=q.hist.filter(r=>Array.isArray(r)&&ok(r[0])).slice(0,30).map(r=>[r[0],Math.max(0,Math.min(4,r[1]|0))]);save.gk=o;}")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,GKD,GKS,GKT,GKC,GKST,gkS,gkIds,gkHas,gkLv,gkEq,gkEquip,gkStats,gkOvr,gkSkT,gkProbs,gkRate,gkEff,gkRoll,gkGrant,gkDraw,gkDrawOnce,gkFreeReady,gkParams,gkBounce,gkCardOK,gkPosOK,gkPos,gkPerm,gkRolesSq,gkRoleArr,gkFormArr,gkInc,gkHuman,gkDive,gkClear,gkPass,gkSkill,gkMods,gkCatch,gkTick,gkAi,gkStep,gkFrame,gkCard,gkSkDesc,gkPullHtml,gkOddsBox,gkDetail,gkSqRow,gkPick,gkGo,gkUrl,gkSpName,gkCamM,GKM,setHuman,humanControl,setupMatch,canHit,bestMate,ROLES,FORM,setGkKind:v=>{gkKind=v;},getGkKind:()=>gkKind,GW,W,PUCKR,P3,p3Shot,")
