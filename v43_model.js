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
var PKV={domeY:1.55,domeK:1.42,bulge:.055,bulgeY:1.4,bulgeW:.17,beakMax:.2,head:1.28,eth:.5,ey:1.44,eyeIn:.03,eye:1.16,iris:1.32,beakL:.74,beakW:1.38,beakH:1.22,beakY:1.37,fl:1.2,ft:1.22,
  scarfY:1.1,scarfT:.08,scarfM:.028,blush:.32,blushR:.06};
function pk43HeadR(Y){const HS=PKV.head,y=PK_NECK+(Y-PK_NECK)/HS;return pkHeadR(y)*HS;}
function pk43ScarfGeo(teamKey){const ck=(pkHi()?'U':'')+'s43'+teamKey+PKV.head+PKV.scarfY;if(pkGeoC[ck])return pkGeoC[ck];
  const tc=new T.Color(TEAM[teamKey].color),Y=PKV.scarfY,R0=Math.max(pk43HeadR(Y),pkBodyR(Y))+PKV.scarfM;
  const g=new T.TorusGeometry(R0,PKV.scarfT,pkS(12),pkS(48));g.rotateX(Math.PI/2);g.scale(1,.82,1);g.translate(0,Y,0);
  const p=g.attributes.position,col=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const ph=Math.atan2(p.getZ(i),p.getX(i)),f=(((ph/TAU*14)%1)+1)%1,wh=f<.2?1:0;col[i*3]=lerp(tc.r,.96,wh);col[i*3+1]=lerp(tc.g,.97,wh);col[i*3+2]=lerp(tc.b,.98,wh);}
  g.setAttribute('color',new T.BufferAttribute(col,3));return pkGeoC[ck]=g;}
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
  // eyes: further forward, bigger
  [P.eyeL,P.eyeR].forEach((e,i)=>{if(!e)return;const s=i?1:-1,eth=auk?.58:PKV.eth,pt=pk43Pt(s*eth,auk?1.46:PKV.ey,PKV.eyeIn);
    e.position.copy(pt);e.rotation.y=s*eth;for(const m of e.children)m.scale.setScalar(PKV.eye*(m===P.pupL||m===P.pupR?PKV.iris:1));});
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
