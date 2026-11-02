# v19: graphics upgrade — mirror ice reflections, light bloom + colour grade + vignette (MSAA off-screen buffer, FXAA on WebGL1),
# contact shadows, a third graphics tier (최고) and an automatic step-down on slow devices.
#  - code: v19_gfx.js (inserted before INIT, after v18); runs before v16 (raw Korean, no __L yet)
#  - save: set.quality accepts 'ultra'; old saves on 'high' (the previous top tier) move up to 'ultra' once (save.gfx19 flag, additive)

R("/* ================= INIT ================= */", rd('v19_gfx.js') + "\n/* ================= INIT ================= */")

# every frame goes through the tiered renderer
R("if(!ctxLost){try{step(dt);renderer.render(scene,camera);}catch(e){dbgErr('frame',e);}}",
  "if(!ctxLost){try{step(dt);gfxRender();}catch(e){dbgErr('frame',e);}}")
# slow device: drop a graphics tier first, then the older resolution / shadow fallbacks
R("if(perf.low>120&&perf.scale>.6){perf.scale=Math.max(.6,perf.scale-.1);perf.low=0;applyQuality();}",
  "if(perf.low>120&&gfxStepDown()){perf.low=0;}\n  else if(perf.low>120&&perf.scale>.6){perf.scale=Math.max(.6,perf.scale-.1);perf.low=0;applyQuality();}")
R("resize();rinkQuality();\n}", "resize();rinkQuality();gfxApply();\n}")
# settings: 최고 / 높음 / 절약 (choosing one again clears any automatic step-down)
R("{k:'quality',label:'그래픽',opts:[['high','높음'],['low','절약']]},",
  "{k:'quality',label:'그래픽',opts:[['ultra','최고'],['high','높음'],['low','절약']]},")
R("if(sd.k==='quality')applyQuality();", "if(sd.k==='quality'){GFX.drop=0;applyQuality();}")
# defaults: PC starts on 최고, phones / tablets on 높음 (was 절약); both step down by themselves when too slow
R("quality:'high',assist:true,arena:'auto'", "quality:'ultra',assist:true,arena:'auto'")
R("if(!s||typeof s!=='object'){if(window.matchMedia&&matchMedia('(pointer: coarse)').matches)save.set.quality='low';return;}",
  "if(!s||typeof s!=='object'){if(window.matchMedia&&matchMedia('(pointer: coarse)').matches)save.set.quality='high';save.gfx19=true;return;}")
R("if(ss.quality==='low'||ss.quality==='high')save.set.quality=ss.quality;",
  "if(ss.quality==='low'||ss.quality==='high'||ss.quality==='ultra')save.set.quality=ss.quality;\n"
  "  if(ss.quality==='high'&&s.gfx19!==true)save.set.quality='ultra';   // 높음 was the top tier before v19\n"
  "  save.gfx19=true;")
# tags the mirror pass uses: the crowd and the landscape stay out of the reflection
R("const m=new T.InstancedMesh(geo,mat,max);m.castShadow=true;", "const m=new T.InstancedMesh(geo,mat,max);m.userData.crowd=1;m.castShadow=true;")
R("const m=new T.Mesh(g,std(0xffffff,.88,0,{vertexColors:true,envMapIntensity:.35}));m.receiveShadow=true;scene.add(m);",
  "const m=new T.Mesh(g,std(0xffffff,.88,0,{vertexColors:true,envMapIntensity:.35}));m.receiveShadow=true;m.userData.noRefl=1;scene.add(m);")

R("window.__PH={doPull,pullOnce,SPX,", "window.__PH={doPull,pullOnce,gfxRender,gfxTier,gfxApply,gfxStepDown,GFX,RFL,PP,CSH,GLOW_L,iceMat,updateCamera,perfSample,perf,applyQuality,SPX,")
