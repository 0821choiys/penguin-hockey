# ===== v12: upgraded penguin models (keeps the old builders as *V9 for reference) =====
R("function buildPenguin(typeKey,teamKey,hatKey,o){","function buildPenguinV9(typeKey,teamKey,hatKey,o){")
R("function animatePenguin(p,dt,t){","function animatePenguinV9(p,dt,t){")
R("const ty=TYPES[typeKey],pg=buildPenguin(typeKey,tm.key,hatKey,{goalie:isGoalie});","const ty=TYPES[typeKey],pg=buildPenguin(typeKey,tm.key,hatKey,{goalie:isGoalie,num:pkNum(tm,typeKey,isGoalie)});")
# crowd: sculpted silhouette replaces body + belly + head spheres
R("mk(sp,blk,0,.66,0,.52,.78,.46);mk(sp,wht,0,.64,.17,.42,.64,.34);mk(sp,blk,0,1.38,.03,.27,.27,.27);",
  "mk(crowdBodyGeo(),new T.MeshStandardMaterial({vertexColors:true,roughness:.62}),0,0,0,1,1,1);")
# settings: hockey stick on/off
R("items:true,events:true,fastFx:false};","items:true,events:true,fastFx:false,stick:true};")
R("for(const k of['vib','flash','motion','items','events','fastFx'])","for(const k of['vib','flash','motion','items','events','fastFx','stick'])")
R("  {k:'events',label:'깜짝 이벤트',opts:[[true,'켜기'],[false,'끄기']]},","  {k:'events',label:'깜짝 이벤트',opts:[[true,'켜기'],[false,'끄기']]},\n  {k:'stick',label:'하키 스틱',opts:[[true,'표시'],[false,'숨김']]},")
R("/* ---- input wiring ---- */",rd('v12_peng.js')+"\n/* ---- input wiring ---- */")
