# ===== v13: refined rink (keeps the old builders as *V9) =====
# module first, right before the RINK section, so its constants exist before the ice / boards / goals are built
R("/* ================= RINK ================= */",rd('v13_rink.js')+"\n/* ================= RINK ================= */")
R("function iceTexture(){\n  const cw=2048,ch=1024","function iceTextureV9(){\n  const cw=2048,ch=1024")
R("const iceMat=std(0xffffff,.13,.12,{map:iceTexture(),","const iceMat=std(0xffffff,.28,0,{map:iceTexture(),")
R("function buildGoal(sign,colHex){\n  const g=new T.Group();g.position.x=sign*W;g.rotation.y=sign>0?0:Math.PI;\n  const fm=std(colHex,.35,.25,","function buildGoalV9(sign,colHex){\n  const g=new T.Group();g.position.x=sign*W;g.rotation.y=sign>0?0:Math.PI;\n  const fm=std(colHex,.35,.25,")
# boards: the instanced boxes become sculpted boards + glass (perimeter()/outN() stay for the LED strip)
_a=s.index("  const P=perimeter(),segs=[];\n  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;\n    if(")
_a=s.rindex("{\n",0,_a)
_b=s.index("/* goals */",_a)
s=s[:_a]+"const RK_MATS=buildBoards();\n\n"+s[_b:]
# floodlight towers
_a=s.index("/* ---- lamps ---- */\nconst lamps=[];\n{")
_b=s.index("/* ================= TERRAIN / OCEAN / ICEBERGS ================= */",_a)
s=s[:_a]+"/* ---- lamps ---- */\nconst lamps=[];buildLampTowers(lamps);\n\n"+s[_b:]
# decor after the crowd exists
R("/* ================= PARTICLES ================= */","rinkDecor();\n\n/* ================= PARTICLES ================= */")
# per-frame hook + LED ribbon sits on the boards' top band
R("function arenaFrame(dt){\n  arenaDecoFrame();nearLampFrame();","function arenaFrame(dt){\n  arenaDecoFrame();nearLampFrame();rinkFrame(dt);")
R("o.position.set(sg.mx-n[0]*.005,.4,sg.mz-n[1]*.005);o.scale.set(L+.08,.09,.03);","o.position.set(sg.mx-n[0]*.008,.432,sg.mz-n[1]*.008);o.scale.set(L+.08,.05,.03);")
R("  resize();\n}\nfunction resize(){","  resize();rinkQuality();\n}\nfunction resize(){")
