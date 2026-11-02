# v14: tidy pass - UI panels never spill or slice content, Korean words stay whole, points chip docks clear of panels
R("</style>",rd('v14_clean.css')+"</style>")
R("/* ================= UI ================= */",rd('v14_clean.js')+"\n/* ================= UI ================= */")
R("function show(id){screens.forEach(s=>$('#'+s).classList.toggle('on',s===id));G.ui=id;}","function show(id){screens.forEach(s=>$('#'+s).classList.toggle('on',s===id));G.ui=id;uiTidy();}")
R("addEventListener('resize',resize);\naddEventListener('orientationchange',()=>setTimeout(resize,200));","addEventListener('resize',resize);addEventListener('resize',uiTidySoon);\naddEventListener('orientationchange',()=>setTimeout(()=>{resize();uiTidy();},200));")
R("SFX.setOn(save.set.sound);$('#bSound').textContent=save.set.sound?'🔊':'🔇';applyFxSettings();\napplyQuality();","SFX.setOn(save.set.sound);$('#bSound').textContent=save.set.sound?'🔊':'🔇';applyFxSettings();uiPanels();\napplyQuality();")
