# v40: 🤝 AI team-mates of a human player are playmakers — a call for the pass is always answered, they look for the player first
# and shoot only as a last resort (v40_mate.js). Opponents, the demo match and auto-switching teams are unchanged.
R("/* ================= INIT ================= */", rd('v40_mate.js') + "\n/* ================= INIT ================= */")
RF('hkCallPress', "function hkCallPress(p,inp){return mtCallPress(p,inp);}")
RF('hkCallPass', "function hkCallPass(p){mtCallPass(p);}")
RIN('aiCarrier', "  if(noShoot){ai.cool=rnd(.4,.9);return;}\n", "  if(noShoot){ai.cool=rnd(.4,.9);return;}\n  if(mtMate(p)){mtCarrier(p);return;}   // v40: a mate of a human player is a playmaker\n")
RIN('aiSkater', "ai.think-=dt;ai.cool-=dt;ai.dash-=dt;ai.slotT-=dt;hkCallPass(p);", "p.mtCar=G.carry===p?(p.mtCar||0)+dt:Math.max(0,(p.mtCar||0)-dt*3);ai.think-=dt;ai.cool-=dt;ai.dash-=dt;ai.slotT-=dt;hkCallPass(p);")
RIN('aiThink', "    ai.tx=clamp(tx,-W+2,W-2);ai.tz=clamp(tz,-D+2,D-2);\n    if(p.cd.shoot<=0&&p.shotGrace<=0&&!ai.plan&&ai.cool<=0)aiCarrier(p);",
  "    ai.tx=clamp(tx,-W+2,W-2);ai.tz=clamp(tz,-D+2,D-2);mtCarry(p);\n    if(p.cd.shoot<=0&&p.shotGrace<=0&&!ai.plan&&ai.cool<=0)aiCarrier(p);")
# shooting skills (flipper shot) are not for a human player's mates
RIN('aiThink', "    if(p.cd.special<=0&&Math.random()<.3*ai.iv&&p.ty.special==='flipper'&&shotQ(pk.x,pk.z,tm)>df.shootQ*.8)useSpecial(p);",
  "    if(!mtMate(p)&&p.cd.special<=0&&Math.random()<.3*ai.iv&&p.ty.special==='flipper'&&shotQ(pk.x,pk.z,tm)>df.shootQ*.8)useSpecial(p);")
RIN('aiThink', "      if(sp2==='flipper'){if(dist<2.6&&gd<20&&shotQ(pk.x,pk.z,tm)>df.shootQ*.8)useSpecial(p);}",
  "      if(sp2==='flipper'){if(!mtMate(p)&&dist<2.6&&gd<20&&shotQ(pk.x,pk.z,tm)>df.shootQ*.8)useSpecial(p);}")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,MT,mtHuman,mtMate,mtOpen,mtCalled,mtCarrier,mtCarry,mtPace,mtCallPress,mtCallPass,aiCarrier,aiThink,shotQ,")
# the waiting loop is skated at MT.pace of the normal top speed
RIN('aiSkater', "  if(ai.plan){const k=G.carry===p?.55:.1;p.ix*=k;p.iz*=k;}", "  if(ai.plan){const k=G.carry===p?.55:.1;p.ix*=k;p.iz*=k;}\n  mtPace(p);")
RIN('movePeng', "if(G.carry===p)cap*=.93;", "if(G.carry===p)cap*=.93*(p.ai&&p.ai.mtSlow?MT.pace:1);")
