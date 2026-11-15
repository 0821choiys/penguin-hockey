/* ================= v43: 🐧 the penguins, re-proportioned as characters (2026-11-14) ================= */
// The owner: "the 3D penguin model is really bad — raise the quality as far as you can" (style chosen: cute character).
// The modeler underneath was fine (feathered body, glossy eyes with iris and catch-lights, two-part beak), but the
// proportions made it read as an egg with a face: a 0.36 head on a 0.58 body, small side-facing eyes, a long thin beak,
// flippers like sticks. pk43 runs at the end of buildPenguin and turns that into a character:
//  · the whole head rig (head, eyes, beak, crests, hats, helmet cage, decals) is scaled up around the neck joint, so
//    everything that sits on the head keeps fitting; the scarf is rebuilt to wrap the new neck
//  · eyes moved toward the front and enlarged (the blink still works: it scales the eye group, we scale the meshes)
//  · a shorter, chunkier beak; bigger, rounder flippers and feet; soft cheek blush on light faces
// All numbers are in PKV.
var PKV={domeY:1.55,domeK:1.42,bulge:.055,bulgeY:1.4,bulgeW:.17,beakMax:.2,head:1.28,eth:.5,ey:1.44,eyeIn:.008,eye:1.16,iris:1,beakL:.74,beakW:1.38,beakH:1.22,beakY:1.37,fl:1.2,ft:1.22,
  scarfY:1.1,scarfT:.08,scarfM:.028,blush:.32,blushR:.06};
function pk43HeadR(Y){const HS=PKV.head,y=PK_NECK+(Y-PK_NECK)/HS;return pkHeadR(y)*HS;}
function pk43ScarfGeo(teamKey){const ck=(pkHi()?'U':'')+'s43'+teamKey+PKV.head+PKV.scarfY;if(pkGeoC[ck])return pkGeoC[ck];
  const tc=new T.Color(TEAM[teamKey].color),sw=typeof kitStripe==='function'?kitStripe(teamKey):[.96,.97,.98],Y=PKV.scarfY,R0=Math.max(pk43HeadR(Y),pkBodyR(Y))+PKV.scarfM;
  const g=new T.TorusGeometry(R0,PKV.scarfT,pkS(12),pkS(48));g.rotateX(Math.PI/2);g.scale(1,.82,1);g.translate(0,Y,0);
  const p=g.attributes.position,col=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const ph=Math.atan2(p.getZ(i),p.getX(i)),f=(((ph/TAU*14)%1)+1)%1,wh=f<.2?1:0;col[i*3]=lerp(tc.r,sw[0],wh);col[i*3+1]=lerp(tc.g,sw[1],wh);col[i*3+2]=lerp(tc.b,sw[2],wh);}
  g.setAttribute('color',new T.BufferAttribute(col,3));return pkGeoC[ck]=g;}
// character eyes (per species, cached): a flat white oval with a big pupil in the species' eye colour (≈ 80 % of the eye,
// so only a thin white rim shows — on a black head an all-dark eye disappears), a black centre and two catch-lights.
var PKE={w:.066,h:.08,d:.012,iw:.054,ih:.066,id:.01,in:-.006,dn:-.004,cw:.034,ch:.042,dark:.55,hl1:[.018,.026],hl1r:.02,hl2:[-.017,-.024],hl2r:.009,gz:.25};
function pk43EyeGeos(key){const ck=(pkHi()?'U':'')+'e43'+key+JSON.stringify(PKE);if(pkGeoC[ck])return pkGeoC[ck];
  const pt=TYPES[key].patch,src=PK18EYE[pt]||(pt==='rock'?0xd0182a:pt==='auk'?0x1a1410:0x2a1a12),c=pkRGB(src),lum=c[0]*.3+c[1]*.59+c[2]*.11,k=lum>.45?PKE.dark*.4:PKE.dark;
  const col=[c[0]*(1-k),c[1]*(1-k),c[2]*(1-k)],sp=(sx,sy,sz,x,y,z,n)=>{const g=new T.SphereGeometry(1,pkS(n||18),pkS(Math.round((n||18)*.7)));g.scale(sx,sy,sz);g.translate(x||0,y||0,z||0);return g;};
  const z1=PKE.d*.8,z2=z1+PKE.id*.7,z3=z2+.006;
  const R={base:pkMerge([[sp(PKE.w,PKE.h,PKE.d,0,0,0,22),[.96,.965,.98]]]),
    pupil:pkMerge([[sp(PKE.iw,PKE.ih,PKE.id,PKE.in,PKE.dn,z1,20),col],[sp(PKE.cw,PKE.ch,PKE.id*.8,PKE.in,PKE.dn,z2,16),[.01,.01,.014]]]),
    hl:pkMerge([[sp(PKE.hl1r,PKE.hl1r*1.1,.005,PKE.in+PKE.hl1[0],PKE.dn+PKE.hl1[1],z3,10),null],[sp(PKE.hl2r,PKE.hl2r,.004,PKE.in+PKE.hl2[0],PKE.dn+PKE.hl2[1],z3,8),null]])};
  return pkGeoC[ck]=R;}
var PK43_BLUSH=null,PK43_GC={},PK43_MAT={};
// a black beak on a black face disappears: the beak gets a faint cool sheen of its own, the head slightly glossier feathers
function pk43Mats(){if(PK43_MAT.beak)return PK43_MAT;
  PK43_MAT.beak=rimify(new T.MeshStandardMaterial({vertexColors:true,roughness:.26,metalness:.04,emissive:0x1c2230,emissiveIntensity:1}),.7);
  PK43_MAT.head=rimify(new T.MeshStandardMaterial({vertexColors:true,roughness:.46,metalness:0,bumpMap:PK_FEATHER,bumpScale:.01}),1.15);
  return PK43_MAT;}
// the round head: a domed crown and fuller cheeks, applied to the head and to everything glued onto it (in head space)
function pk43D(v){const y=v.y,r=Math.hypot(v.x,v.z),f=1+PKV.bulge*Math.exp(-Math.pow((y-PKV.bulgeY)/PKV.bulgeW,2));
  if(r>1e-6){v.x*=f;v.z*=f;}if(y>PKV.domeY)v.y=PKV.domeY+(y-PKV.domeY)*PKV.domeK;return v;}
function pk43Geo(g){const ck=g.uuid+'|'+PKV.domeY+PKV.domeK+PKV.bulge+PKV.bulgeY+PKV.bulgeW;if(PK43_GC[ck])return PK43_GC[ck];
  const n=g.clone(),a=n.attributes.position,nm=n.attributes.normal,v=new T.Vector3();
  for(let i=0;i<a.count;i++){v.set(a.getX(i),a.getY(i),a.getZ(i));const y0=v.y,f=1+PKV.bulge*Math.exp(-Math.pow((y0-PKV.bulgeY)/PKV.bulgeW,2));pk43D(v);a.setXYZ(i,v.x,v.y,v.z);
    if(nm){const k=y0>PKV.domeY?PKV.domeK:1,x=nm.getX(i)/f,yy=nm.getY(i)/k,z=nm.getZ(i)/f,l=Math.hypot(x,yy,z)||1;nm.setXYZ(i,x/l,yy/l,z/l);}}
  a.needsUpdate=true;if(nm)nm.needsUpdate=true;n.computeBoundingSphere();return PK43_GC[ck]=n;}
const pk43Pt=(th,y,inset)=>pk43D(pkHeadPt(th,y,inset));
function pk43(P,typeKey,teamKey,hatKey,o){
  const ty=TYPES[typeKey],auk=ty.patch==='auk';
  P.head.scale.setScalar(PKV.head);
  // round the head and what is glued onto it (the head mesh, species markings, crests); hats, eyes and the beak are groups
  for(const m of P.headAbs.children)if(m.isMesh&&m.geometry&&m.position.lengthSq()<1e-8&&!m.rotation.x&&!m.rotation.y&&!m.rotation.z)m.geometry=pk43Geo(m.geometry);
  for(const m of P.headAbs.children)if(m.isMesh&&m.material===PK_MAT.body)m.material=pk43Mats().head;
  // eyes: further forward, and character eyes instead of eyeballs (the owner: "the eyes are creepy" — white bulging
  // eyeballs with a small iris read as googly / human). Now: a flat white oval almost filled by a big pupil in the species'
  // eye colour with a black centre and two catch-lights (see PKE). The pupils stay P.pupL/R, so the gaze and the sad look
  // still move them. The size goes on the meshes, never on the eye group: the blink writes the group's scale.y every frame.
  const EG=pk43EyeGeos(typeKey);
  [P.eyeL,P.eyeR].forEach((e,i)=>{if(!e)return;const s=i?1:-1,eth=auk?.58:PKV.eth,pt=pk43Pt(s*eth,auk?1.46:PKV.ey,PKV.eyeIn);
    e.position.copy(pt);e.rotation.y=s*eth;
    for(const c of [...e.children])e.remove(c);
    e.add(new T.Mesh(EG.base,PK_MAT.eye));
    // the gaze moves the pupil up to .034 (written by animatePenguin): the big pupil would leave the white, so it moves
    // inside a holder group squeezed to PKE.gz in x / y (the pupil mesh undoes the squeeze)
    const gz=new T.Group();gz.scale.set(PKE.gz,PKE.gz,1);e.add(gz);
    const ho=new T.Group();gz.add(ho);
    const pu=new T.Mesh(EG.pupil,PK_MAT.eye);pu.add(new T.Mesh(EG.hl,PK_MAT.hl));ho.add(pu);
    e.children[0].scale.set(i?PKV.eye:-PKV.eye,PKV.eye,PKV.eye);
    pu.scale.set((i?PKV.eye:-PKV.eye)/PKE.gz,PKV.eye/PKE.gz,PKV.eye);
    if(i)P.pupR=ho;else P.pupL=ho;
    e.scale.set(1,1,1);});
  // beak: shorter and chunkier
  const bg=P.jaw&&P.jaw.parent;if(bg){if(pk43Dark(pkBeak(typeKey).up))bg.traverse(m=>{if(m.isMesh&&m.material===PK_MAT.beak)m.material=pk43Mats().beak;});const S=pkBeak(typeKey).S;bg.position.copy(pk43Pt(0,PKV.beakY,.05));bg.scale.set(PKV.beakW,PKV.beakH,Math.min(PKV.beakL,PKV.beakMax/S.L));}
  // flippers and feet
  for(const f of[P.flipL,P.flipR])if(f)f.scale.setScalar(PKV.fl);
  for(const f of[P.footL,P.footR])if(f)f.scale.setScalar(PKV.ft);
  // scarf around the new neck
  const old=pkScarfGeo(teamKey);for(const m of P.inner.children)if(m.isMesh&&m.geometry===old){m.geometry=pk43ScarfGeo(teamKey);break;}
  if(P.scarfTail)P.scarfTail.position.set(-.2,PKV.scarfY-.02,-(Math.max(pk43HeadR(PKV.scarfY),pkBodyR(PKV.scarfY))+PKV.scarfM+.02));
  // cheek blush (only where the face is light — on a black face it would look like a stain)
  if(PKV.blush>0&&!auk&&pk43Light(ty)){
    if(!PK43_BLUSH)PK43_BLUSH=new T.MeshBasicMaterial({color:0xff8aa0,transparent:true,opacity:PKV.blush,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
    for(const s of[-1,1]){const th=s*(PKV.eth+.28),y=PKV.ey-.1,pt=pk43Pt(th,y,-.004),m=new T.Mesh(new T.CircleGeometry(PKV.blushR,pkS(16)),PK43_BLUSH);
      m.position.copy(pt);m.lookAt(pt.clone().add(new T.Vector3(Math.sin(th),.1,Math.cos(th))));m.scale.y=.7;m.renderOrder=2;P.headAbs.add(m);}
  }
}
// is the cheek (below and outside the eye) light? sample the species colours there
function pk43Light(ty){const c=[0,0,0];pkCol(ty,PKV.eth+.28,PKV.ey-.1,c);return c[0]+c[1]+c[2]>1.6;}
// is this beak dark? (average vertex colour of the upper mandible)
function pk43Dark(g){if(g.userData.dark!==undefined)return g.userData.dark;const c=g.attributes.color;let t=0;for(let i=0;i<c.count;i++)t+=c.getX(i)+c.getY(i)+c.getZ(i);
  return g.userData.dark=t/Math.max(1,c.count)<.45;}
