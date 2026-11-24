# v48: 🧊 how slippery the ice is (owner, 2026-11-17: "too slippery — lower it a little, just enough to feel, and make it a setting")
# v48_ice.js / .css: ICE steps (3 = standard, a bit grippier than before; 4 = the old ice), iceK() read by the skating physics, the 설정 row
R("/* ================= INIT ================= */", rdm('v48_ice.js') + "\n/* ================= INIT ================= */")
_st_end48 = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end48] + rd('v48_ice.css') + "\n" + s[_st_end48:]
# skating: sideways grip, stopping after letting go, braking against the motion (top speed / acceleration untouched); online = step 3
RIN('movePeng', "const slow=p.slow>0?.55:1,sp0=Math.hypot(p.vx,p.vz),EZ=ctlEasy(p);", "const slow=p.slow>0?.55:1,sp0=Math.hypot(p.vx,p.vz),EZ=ctlEasy(p),IK=iceK();")
RIN('movePeng', "if(dot<-.2)a*=(EZ?EZ.brk:1.4)*CF.brk;", "if(dot<-.2)a*=(EZ?EZ.brk:1.4)*CF.brk*IK.brk;")
RIN('movePeng', "const k=Math.exp(-(EZ?EZ.stopK:.8)*CF.glide*h);", "const k=Math.exp(-(EZ?EZ.stopK:.8)*CF.glide*IK.stop*h);")
RIN('movePeng', "s-(EZ?EZ.stopC:1.4)*CF.glide*h", "s-(EZ?EZ.stopC:1.4)*CF.glide*IK.stop*h")
RIN('movePeng', "*CF.grip*(EZ&&mag>.05?EZ.grip:1)+(EZ&&mag>.05?EZ.gripAdd*CF.grip:0)", "*CF.grip*IK.grip*(EZ&&mag>.05?EZ.grip:1)+(EZ&&mag>.05?EZ.gripAdd*CF.grip*IK.grip:0)")
RIN('ctlCarve', "const cr=EZ.carve*CF.grip*h,", "const cr=EZ.carve*CF.grip*iceK().grip*h,")
# save: set.ice (1–5, default 3) — literals only (loadSave runs before the feature modules)
R("const DEF_SET={masc:'full',", "const DEF_SET={ice:3,masc:'full',")
R("if(['full','short','off'].includes(ss.masc))save.set.masc=ss.masc;", "if(['full','short','off'].includes(ss.masc))save.set.masc=ss.masc;if([1,2,3,4,5].includes(ss.ice))save.set.ice=ss.ice;")
# 설정: the row sits right under 조작 설정
RIN('renderSettings', "safe(ctlRow);safe(accRow);", "safe(ctlRow);safe(iceRow);safe(accRow);")
R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,ICE,iceSet,iceLv,iceK,iceName,iceRow,")
