# v36: 🎮 controls — joystick feel, aim where you push, input buffer, easy handling, cooldown rings, custom button layout
R("/* ================= INIT ================= */", rd('v36_ctl.js') + "\n/* ================= INIT ================= */")
_st_end36 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end36] + rd('v36_ctl.css') + "\n" + s[_st_end36:]
# joystick handlers → v36 (follow / fixed ring, response curve, resting ring)
R("""jz.addEventListener('pointerdown',e=>{
  if(jid!==null)return;jid=e.pointerId;jz.setPointerCapture(jid);jo={x:e.clientX,y:e.clientY};const r=jz.getBoundingClientRect();
  jb.style.display='block';jb.style.left=(e.clientX-r.left)+'px';jb.style.top=(e.clientY-r.top)+'px';jk.style.transform='translate(0,0)';input.joy=true;SFX.init();
});
jz.addEventListener('pointermove',e=>{
  if(e.pointerId!==jid)return;let dx=e.clientX-jo.x,dy=e.clientY-jo.y;const l=Math.hypot(dx,dy),R=56;if(l>R){dx*=R/l;dy*=R/l;}
  jk.style.transform='translate('+dx+'px,'+dy+'px)';let x=dx/R,z=dy/R;const m=Math.hypot(x,z);if(m<.14){x=z=0;}input.x=x;input.z=z;
});
const jend=e=>{if(e.pointerId!==jid)return;jid=null;jb.style.display='none';input.joy=null;input.x=input.z=0;recomputeKeys();};""",
"""jz.addEventListener('pointerdown',e=>ctlJoyDown(e));   // v36: follow / fixed ring, response curve (ctlJoy*)
jz.addEventListener('pointermove',e=>ctlJoyMove(e));
const jend=e=>ctlJoyEnd(e);""")
R("  jid=null;jb.style.display='none';input.joy=null;input.x=input.z=0;\n", "  jid=null;input.joy=null;input.x=input.z=0;ctlJoyIdle();\n")
# buttons: nothing fires while the layout editor is open; a short tick of vibration on press
R("const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('down');SFX.init();down();});",
  "const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();if(ctlEditing())return;b.setPointerCapture(e.pointerId);b.classList.add('down');SFX.init();vib(8);down();});")
# shots / passes go where the stick points
RIN('humanAim', "if(l>1.1){ax=dx/l;az=dz/l;}}\n",
  "if(l>1.1){ax=dx/l;az=dz/l;}}\n  else{const m=Math.hypot(p.ix||0,p.iz||0);if(m>.3){ax=p.ix/m;az=p.iz/m;}}   // v36: the stick direction, not the facing\n")
# input buffer (shot / pass pressed just before the puck is in reach)
RIN('humanControl', "if(p.charging&&p.cd.shoot<=0){const a=humanAim(p);performShot(p,a[0],a[1],p.charge);}",
  "if(p.charging&&p.cd.shoot<=0){if(!canHit(p))p.bufShot={at:G.t,c:p.charge};else{const a=humanAim(p);performShot(p,a[0],a[1],p.charge);}}")
RIN('humanControl', "if(inp.pass){inp.pass=false;if(p.cd.pass<=0){",
  "if(inp.pass){inp.pass=false;if(p.cd.pass<=0&&!canHit(p))p.bufPass={at:G.t};else if(p.cd.pass<=0){")
RIN('humanControl', "  if(inp.dash){inp.dash=false;doDash(p);}", "  ctlBuf(p);\n  if(inp.dash){inp.dash=false;doDash(p);}")
# easy handling for human-controlled skaters (AI unchanged)
RIN('movePeng', "const slow=p.slow>0?.55:1,sp0=Math.hypot(p.vx,p.vz);", "const slow=p.slow>0?.55:1,sp0=Math.hypot(p.vx,p.vz),EZ=ctlEasy(p);")
RIN('movePeng', "if(dot<-.2)a*=1.4*CF.brk;}", "if(dot<-.2)a*=(EZ?EZ.brk:1.4)*CF.brk;}\n      if(EZ&&!sliding&&sp0<cap*.5)a*=EZ.start;")
RIN('movePeng', "if(p.dashT>0&&p.dashSpec)rate*=.5;", "if(p.dashT>0&&p.dashSpec)rate*=.5;if(EZ)rate*=EZ.rate;")
RIN('movePeng', "        p.heading+=clamp(dh,-rate*h,rate*h);\n", "        p.heading+=clamp(dh,-rate*h,rate*h);\n        if(EZ)ctlCarve(p,EZ,h);\n")
RIN('movePeng', "const k=Math.exp(-.8*CF.glide*h);p.vx*=k;p.vz*=k;", "const k=Math.exp(-(EZ?EZ.stopK:.8)*CF.glide*h);p.vx*=k;p.vz*=k;")
RIN('movePeng', "const ns=Math.max(0,s-1.4*CF.glide*h);", "const ns=Math.max(0,s-(EZ?EZ.stopC:1.4)*CF.glide*h);")
RIN('movePeng', "const grip=sliding?2.6:(1.1+.6*st.turn)*(1-.3*spf)*CF.grip;",
  "const grip=sliding?2.6:(1.1+.6*st.turn)*(1-.3*spf)*CF.grip*(EZ&&mag>.05?EZ.grip:1)+(EZ&&mag>.05?EZ.gripAdd*CF.grip:0);")
# save (additive field set.ctl, sanitised with literals only)
R("const ss=s.set&&typeof s.set==='object'?s.set:{};", "const ss=s.set&&typeof s.set==='object'?s.set:{};\n  save.set.ctl=ctlLoad(ss.ctl);")
# hooks: cooldown rings every frame, layout when a match starts, settings row, init
R("safe(updateCamera,dt);safe(updateHud);", "safe(updateCamera,dt);safe(updateHud);safe(ctlFrame);")
R("hideAll();document.body.classList.add('ingame');document.body.classList.remove('menuish');",
  "hideAll();document.body.classList.add('ingame');document.body.classList.remove('menuish');safe(ctlApply);")
RIN('renderSettings', "safe(accRow);", "safe(ctlRow);safe(accRow);")
R("safe(accInit);safe(dlyInit);safe(dlyAuto);", "safe(accInit);safe(dlyInit);safe(dlyAuto);safe(ctlInit);")
# Android back closes the editor (= cancel)
R("const APP_OV=['#accDlg',", "const APP_OV=['#ctlEdPanel','#accDlg',")
R("const APP_OVBTN=[", "const APP_OVBTN=['#ceCancel',")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,CTLV,CL,CJ,CE,ctl,ctlLoad,ctlCurve,ctlEasy,ctlCarve,ctlBuf,ctlApply,ctlDefaults,ctlFrame,ctlRow,ctlEdOpen,ctlEdClose,ctlEdAct,ctlEdRange,ctlEdHtml,ctlEditing,ctlJoyIdle,ctlJoyDown,ctlJoyMove,ctlJoyEnd,humanAim,canHit,")
