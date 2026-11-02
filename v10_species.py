# ===== real penguin species: names + distinct 3D look + card art (internal keys unchanged for save compatibility) =====
R("  basic:{name:'기본 펭귄',cost:0,stats:{speed:3,accel:3,power:3,turn:3,body:3},scale:1.0,patch:'ear',pc:[1,.78,.22],beak:[0x24242a,0xff9a2a],special:'dash'},",
  "  basic:{name:'아델리 펭귄',cost:0,stats:{speed:3,accel:3,power:3,turn:3,body:3},scale:1.0,patch:'adelie',pc:[1,1,1],beak:[0x1c1c22,0x2a2a30],bl:.72,bw:1.08,foot:0xf2a0aa,special:'dash'},")
R("  fast:{name:'빠른 펭귄',cost:40,stats:{speed:5,accel:4,power:2,turn:4,body:2},scale:0.9,patch:'gentoo',pc:[1,1,1],beak:[0xff7d1c,0xff9a2a],special:'slide'},",
  "  fast:{name:'젠투 펭귄',cost:40,stats:{speed:5,accel:4,power:2,turn:4,body:2},scale:0.9,patch:'gentoo',pc:[1,1,1],beak:[0xff4f16,0xff7d1c],bl:1,bw:.95,foot:0xff7a1a,tail:1.6,special:'slide'},")
R("  strong:{name:'힘센 펭귄',cost:80,stats:{speed:3,accel:2,power:5,turn:2,body:4},scale:1.14,patch:'ear',pc:[1,.55,.12],beak:[0x2a2a30,0xff7a18],special:'flipper'},",
  "  strong:{name:'황제 펭귄',cost:80,stats:{speed:3,accel:2,power:5,turn:2,body:4},scale:1.14,patch:'ear',pc:[1,.7,.14],beak:[0x1a1a20,0xff8a3a],bl:1.38,bw:.78,foot:0x2b3038,special:'flipper'},")
R("  defense:{name:'방어형 펭귄',cost:80,stats:{speed:2,accel:3,power:3,turn:4,body:5},scale:1.06,patch:'chinstrap',pc:[1,1,1],beak:[0x1c1c20,0x2a2a30],special:'icebreak'},",
  "  defense:{name:'턱끈 펭귄',cost:80,stats:{speed:2,accel:3,power:3,turn:4,body:5},scale:1.06,patch:'chinstrap',pc:[1,1,1],beak:[0x1c1c20,0x2a2a30],bl:.9,bw:1,foot:0xf0a0a8,special:'icebreak'},")
R("  balanced:{name:'균형형 펭귄',cost:60,stats:{speed:4,accel:3,power:3,turn:3,body:3},scale:1.0,patch:'adelie',pc:[1,1,1],beak:[0xd9695a,0x2a2a30],special:'dash'},",
  "  balanced:{name:'바위뛰기 펭귄',cost:60,stats:{speed:4,accel:3,power:3,turn:3,body:3},scale:1.0,patch:'rock',pc:[1,.86,.1],beak:[0xd8432a,0xc0391f],bl:.78,bw:1.28,foot:0xf0a0a8,special:'dash'},")
# body pattern: Adélie / rockhopper have a black throat; emperor has a blue-grey back
R("  const headFade=1-smooth(1.16,1.26,y);","  const headFade=(ty.patch==='adelie'||ty.patch==='rock')?1-smooth(1.04,1.12,y):1-smooth(1.16,1.26,y);")
R("    const e=1-Math.hypot((a-.95)/.4,(y-1.52)/.075),f=smooth(0,.4,e);r=lerp(r,.95,f);g=lerp(g,.96,f);b=lerp(b,.98,f);","    const e=1-Math.hypot((a-.85)/.8,(y-1.535)/.1),f=smooth(0,.35,e);r=lerp(r,.95,f);g=lerp(g,.96,f);b=lerp(b,.98,f);")
R("    const pc=ty.pc,t=smooth(.8,1.2,y)*.7*wh;r=lerp(r,pc[0],t*.8);g=lerp(g,pc[1],t*.8);b=lerp(b,pc[2],t*.8);\n    const e=1-Math.hypot((a-1.5)/.42,(y-1.37)/.13)","    const pc=ty.pc,t=smooth(.8,1.15,y)*wh;r=lerp(r,pc[0],t*.85);g=lerp(g,pc[1],t*.85);b=lerp(b,pc[2],t*.85);\n    const e=1-Math.hypot((a-1.4)/.55,(y-1.37)/.17)")
R("  const back=smooth(1.2,3.1,a)*.5;r+=.02*back;g+=.03*back;b+=.055*back;",
  "  const back=smooth(1.2,3.1,a)*(ty.patch==='ear'?1.5:.5);r+=.02*back;g+=.03*back;b+=.055*back;")
# eyes: Adélie white eye-ring, rockhopper red iris
R("    const pu=ell(MAT.pupil,.062,.062,.04,0,0,.04,12);eg.add(pu);",
  "    if(ty.patch==='rock')eg.add(ell(MAT.redEye,.078,.078,.03,0,0,.03,12));\n    const pr=ty.patch==='rock'?.04:ty.patch==='adelie'?.07:.062,pu=ell(MAT.pupil,pr,pr,.04,0,0,.04,12);eg.add(pu);")
R("MAT={black:std(0x101216,.45,.1),","MAT={redEye:std(0xd0182a,.2,.1),yellow:std(0xffd21a,.5,0,{emissive:0x302400}),black:std(0x101216,.45,.1),")
# beak shape per species
R("const ug=new T.ConeGeometry(.072,.31,12);ug.scale(1.2,1,.58);const up=new T.Mesh(ug,std(ty.beak[0],.4,.1));up.rotation.x=Math.PI/2+.1;up.position.set(0,1.375,.47);",
  "const bl=ty.bl||1,bw=ty.bw||1,ug=new T.ConeGeometry(.072*bw,.31*bl,12);ug.scale(1.2,1,.58);const up=new T.Mesh(ug,std(ty.beak[0],.4,.1));up.rotation.x=Math.PI/2+.1;up.position.set(0,1.375,.47+.155*(bl-1));")
R("   const lg=new T.ConeGeometry(.056,.24,10);lg.scale(1.1,1,.5);const lo=new T.Mesh(lg,std(ty.beak[1],.4,.1));lo.rotation.x=Math.PI/2+.05;lo.position.set(0,1.335,.44);inner.add(lo);}",
  "   const lg=new T.ConeGeometry(.056*bw,.24*bl,10);lg.scale(1.1,1,.5);const lo=new T.Mesh(lg,std(ty.beak[1],.4,.1));lo.rotation.x=Math.PI/2+.05;lo.position.set(0,1.335,.44+.12*(bl-1));inner.add(lo);}")
# feet colour, tail length, crest
R("const ft=[],fm=ty.patch==='auk'?MAT.dark:MAT.orange;","const ft=[],fm=ty.patch==='auk'?MAT.dark:ty.foot?footMat(ty.foot):MAT.orange;")
R("  {const tg=new T.ConeGeometry(.14,.4,10);const t=new T.Mesh(tg,MAT.black);t.rotation.x=-Math.PI/2-.4;t.position.set(0,.14,-.52);t.castShadow=true;inner.add(t);}",
  "  {const tl=ty.tail||1,tg=new T.ConeGeometry(.14,.4*tl,10);const t=new T.Mesh(tg,MAT.black);t.rotation.x=-Math.PI/2-.4;t.position.set(0,.14-.06*(tl-1),-.52-.14*(tl-1));t.castShadow=true;inner.add(t);}\n  if(ty.patch==='rock')rockCrest(inner);")
R("function buildPenguin(typeKey,teamKey,hatKey,o){","""const footMatC={};const footMat=c=>footMatC[c]||(footMatC[c]=std(c,.5));
function rockCrest(inner){   // rockhopper: spiky yellow eyebrow plumes + black spiky crest
  for(const s of[-1,1]){
    for(let i=0;i<4;i++){const p=ell(MAT.yellow,.03,.03,.25-.025*i,0,0,0,8);p.position.set(s*(.19+.035*i),1.56+.025*i,.2-.1*i);p.rotation.set(-.35-.15*i,s*(.55+.18*i),0);inner.add(p);}
  }
  for(let i=0;i<6;i++){const c=new T.Mesh(new T.ConeGeometry(.035,.2,6),MAT.black);c.position.set((i-2.5)*.055,1.66,-.02-.04*Math.abs(i-2.5));c.rotation.set(-.5,0,(i-2.5)*.22);c.castShadow=true;inner.add(c);}
}
function buildPenguin(typeKey,teamKey,hatKey,o){""")
# grammar: (으)로 after names
R("function gName(g){const d=GDEFS[g.id];return g.t&&d.typed?TYPES[g.t].name+'로 경기 완료':d.name;}",
  "const ro=n=>{const c=n.charCodeAt(n.length-1)-0xac00;return c>=0&&c<11172&&c%28!==0&&c%28!==8?'으로':'로';};\nfunction gName(g){const d=GDEFS[g.id];return g.t&&d.typed?TYPES[g.t].name+ro(TYPES[g.t].name)+' 경기 완료':d.name;}")
R("t+='  · '+TYPES[save.type].name+'로 승리 (진행 '","t+='  · '+TYPES[save.type].name+ro(TYPES[save.type].name)+' 승리 (진행 '")
R("desc:'빠른 + 균형형 함께 출전'","desc:'젠투 + 바위뛰기 함께 출전'")
R("desc:'방어형 + 힘센 함께 출전'","desc:'턱끈 + 황제 함께 출전'")
# card art per species
i0=s.index("function pengSVG(k){");i1=s.index("function cardHtml(k,o){")
s=s[:i0]+rd('species_svg.js')+s[i1:]
