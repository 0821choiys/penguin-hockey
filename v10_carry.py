# ===== stick-handling (carry) + faster restarts + big hits =====
R("/* ---- input wiring ---- */",rd('v10_carry.js')+"\n/* ---- input wiring ---- */")
R("function puckStep(h){\n  const pk=G.puck;\n","function puckStep(h){\n  const pk=G.puck;carryStep(h);\n")
R("    if(p.shotGrace>0||p.frozen)continue;let rad=p.r;","    if(p.shotGrace>0||p.frozen||p===G.carry)continue;let rad=p.r;")
R("    if(p.goalie||p.shotGrace>0||p.frozen)continue;","    if(p.goalie||p.shotGrace>0||p.frozen||p===G.carry)continue;")
R("  }\n  G.pass=null;\n}","  }\n  G.pass=null;G.carry=null;\n}")
R("const c=p.cd;c.shoot=Math.max(0,c.shoot-dt);","const c=p.cd;c.catch=Math.max(0,(c.catch||0)-dt);c.shoot=Math.max(0,c.shoot-dt);")
# release on shots, passes, specials, goalie clears
R("  p.anim.swing=1;p.cd.shoot=.32;","  p.anim.swing=1;p.cd.shoot=.32;if(G.carry)carryRelease(G.carry===p?.3:.6);")
R("  p.anim.swing=1;p.cd.pass=.35;p.shotGrace=.12;","  p.anim.swing=1;p.cd.pass=.35;p.shotGrace=.12;if(G.carry)carryRelease(G.carry===p?.3:.6);")
R("      pk.vx=ax*sp2;pk.vz=az*sp2;p.shotGrace=.15;","      if(G.carry)carryRelease(.4);pk.vx=ax*sp2;pk.vz=az*sp2;p.shotGrace=.15;")
R("    const pk=G.puck,dd=Math.hypot(pk.x-p.x,pk.z-p.z);if(dd<5.8){","    const pk=G.puck,dd=Math.hypot(pk.x-p.x,pk.z-p.z);if(dd<5.8){if(G.carry&&G.carry!==p)carryRelease(.6);")
R("  if(dist<2.2&&spd<9&&p.cd.shoot<=0){","  const crr=G.carry&&G.carry.team!==tm;\n  if(dist<(crr?1.75:2.2)&&spd<(crr?14:9)&&p.cd.shoot<=0&&(!crr||Math.random()<(CARRY.poke[G.cfg&&G.cfg.diff]||1)*dt)){if(G.carry)carryRelease(.6);")
# carrying slows you a little (so defence can catch up)
R("    if(p.boostT>0){cap*=1.3;acc*=1.25;}","    if(p.boostT>0){cap*=1.3;acc*=1.25;}if(G.carry===p)cap*=.93;")
# AI carrier: skate at goal, weave around the nearest defender, decide shoot/pass
R("  if(p!==tm.chaser&&aiIntercept(p))return;","""  if(p!==tm.chaser&&aiIntercept(p))return;
  if(G.carry===p){
    ai.full=true;ai.mode='carry';let gdx=gx-p.x,gdz=-p.z;const gl=Math.hypot(gdx,gdz)||1;gdx/=gl;gdz/=gl;
    let tx=p.x+gdx*5,tz=p.z+gdz*5;const o=nearestOppObj(p);
    if(o){const ox=o.x-p.x,oz=o.z-p.z,od=Math.hypot(ox,oz);if(od<5&&(ox*gdx+oz*gdz)>-.5){const side=(ox*(-gdz)+oz*gdx)>0?-1:1;tx+=(-gdz)*side*3.2;tz+=gdx*side*3.2;}}
    ai.tx=clamp(tx,-W+2,W-2);ai.tz=clamp(tz,-D+2,D-2);
    if(p.cd.shoot<=0&&p.shotGrace<=0&&!ai.plan&&ai.cool<=0)aiCarrier(p);
    if(p.cd.special<=0&&Math.random()<.3*ai.iv&&p.ty.special==='flipper'&&shotQ(pk.x,pk.z,tm)>df.shootQ*.8)useSpecial(p);
    return;
  }""")
# AI carrier wind-up: keep skating (only slow a little) - the old code nearly stopped the shooter
R("  if(ai.plan){p.ix*=.1;p.iz*=.1;}","  if(ai.plan){const k=G.carry===p?.55:.1;p.ix*=k;p.iz*=k;}")
# magnet can't rip the puck off a stick
R("    if(d>1.15&&d<7){const f=24*h;","    if(d>1.15&&d<7&&!(G.carry&&G.carry!==p)){const f=24*h;")
# big hits feel big
R("if(knock(A,rnd(.9,1.4))&&bS)B.slideHit=true;","if(knock(A,rnd(.9,1.4))){if(bS)B.slideHit=true;bigHit(B,A);}")
R("if(knock(B,rnd(.9,1.4))&&aS)A.slideHit=true;","if(knock(B,rnd(.9,1.4))){if(aS)A.slideHit=true;bigHit(A,B);}")
# less dead time after goals
R("        else{resetPositions();G.state='ready';G.stateT=2.2;G.countN=3;showBanner('READY',1000,'');}","        else{resetPositions();G.state='ready';G.stateT=1.4;G.countN=3;showBanner('READY',800,'');}")
R("  }else G.stateT=real?(mine&&tier>=1?3.2:2.6):2.2;","  }else G.stateT=real?(mine&&tier>=1?3.0:2.0):2.2;")

# you always control your team's puck carrier; dashing with the puck is a deke (much harder to strip)
R("function autoSwitch(dt){\n  if(G.so)return;\n","function autoSwitch(dt){\n  if(G.so)return;\n  if(G.carry&&G.mine&&G.carry.team===G.mine&&G.carry!==G.player&&!G.pending){setHuman(G.carry);G.switchCd=.6;return;}\n")

R("{id:'get',t:'퍽 잡기',pc:'검은 원반이 <b>퍽</b>이에요. 퍽에 바짝 다가가 보세요',mo:'검은 원반이 <b>퍽</b>이에요. 퍽에 바짝 다가가 보세요',hl:'#joyZone'}",
  "{id:'get',t:'퍽 잡기',pc:'검은 원반이 <b>퍽</b>이에요. 퍽을 향해 다가가면 <b>스틱에 붙어요</b> (드리블)',mo:'검은 원반이 <b>퍽</b>이에요. 퍽을 향해 다가가면 <b>스틱에 붙어요</b> (드리블)',hl:'#joyZone'}")
R("🦭🌬️⭐ <b>깜짝 이벤트</b>","🏒 <b>드리블</b>: 퍽을 향해 다가가면 퍽이 스틱에 붙고, 우리 팀이 퍽을 잡으면 그 펭귄을 자동으로 조작해요. 상대가 붙으면 빼앗길 수 있으니 <b>대시</b>로 제치세요 (대시 중엔 잘 안 뺏겨요). 대시로 상대를 들이받으면 <b>BIG HIT!</b><br>🦭🌬️⭐ <b>깜짝 이벤트</b>")
