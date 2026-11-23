# v50: 그래픽 초고사양 / 초저사양 (owner, 2026-11-23: "low-end phones lag too much — add 초고사양 and 초저사양 to the graphics setting")
# save.set.quality keeps its three old values everywhere; save.set.qx = +1 / −1 adds 초고사양 on top of 최고 and 초저사양 under 절약 (v50_qual.js)
R("/* ================= INIT ================= */", rdm('v50_qual.js') + "\n/* ================= INIT ================= */")
_st_end50 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end50] + rd('v50_qual.css') + "\n" + s[_st_end50:]
# antialiasing is fixed when the GPU context is made (the save is loaded before): 초저사양 starts without MSAA
R("try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}",
  "try{renderer=new T.WebGLRenderer({canvas,antialias:!(save.set.qx<0&&save.set.quality==='low'),powerPreference:'high-performance'});}")
# resolution per level (×perf.scale from the automatic step-down) + the scene switches
RIN('applyQuality', "renderer.setPixelRatio((low?1:Math.min(devicePixelRatio||1,2))*perf.scale);", "renderer.setPixelRatio(gqRatio()*perf.scale);")
RIN('applyQuality', "resize();rinkQuality();gfxApply();", "resize();rinkQuality();gfxApply();gqScene();")
# 30 frames a second on 초저사양 (the fixed-step physics is untouched); the step-down judges it against that target
RIN('frame', "const now=clockT(),raw=now-lastT;lastT=now;const dt=Math.min(.05,raw);\n  perfSample(raw);",
    "const now=clockT();if(gqSkip(now)){requestAnimationFrame(frame);return;}const raw=now-lastT;lastT=now;const dt=Math.min(.05,raw);\n  perfSample(gqX()<0?raw*GQ.xlow.fps/60:raw);")
# 설정: rows know their key; the 그래픽 row is rebuilt with five steps
RIN('renderSettings', "row.innerHTML='<div>'+sd.label+'</div>';", "row.innerHTML='<div>'+sd.label+'</div>';row.dataset.k=sd.k;")   # (v16 later edits the className part)
RIN('renderSettings', "safe(ctlRow);safe(iceRow);", "safe(gqRow);safe(ctlRow);safe(iceRow);")
# the far penguin colonies can be hidden; half the particles on 초저사양
RIN('makeCrowd', "const api={", "const api={parts,")
RIN('emit', "const i=pHead;", "if(gqX()<0&&Math.random()<.5)return;const i=pHead;")
RIN('step', "safe(p3Frame);safe(mascLate);", "safe(p3Frame);safe(mascLate);safe(gqHintFrame,dt);")
# save (additive): qx −1 / 0 / 1
R("const DEF_SET={qx:0,", "const DEF_SET={qx:0,") if "const DEF_SET={qx:0," in s else R("const DEF_SET={ice:3,", "const DEF_SET={qx:0,ice:3,")
R("if(ss.quality==='high'&&s.gfx19!==true)save.set.quality='ultra';", "if(ss.quality==='high'&&s.gfx19!==true)save.set.quality='ultra';if([-1,0,1].includes(ss.qx))save.set.qx=ss.qx;")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,GQ,gqX,gqLevel,gqSet,gqName,gqDesc,gqRatio,gqScene,gqSkip,gqRow,gqHintFrame,GQH,perf,colony,lamps,sun,pkLo,rkLo,gqLastT:()=>lastT,")
