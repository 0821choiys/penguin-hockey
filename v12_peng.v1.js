
/* ================= v12 penguin models: sculpted body + head rig, species detail, hockey kit, rim light ================= */
const PK_NECK=1.18;
// --- rim light shared by every penguin material (makes dark feathers read against the bright ice) ---
const PRIM={c:{value:new T.Color(.6,.75,1)},s:{value:.5},t:-1};
function rimify(m,k){
  const kk=(k===undefined?1:k).toFixed(2);
  m.onBeforeCompile=sh=>{sh.uniforms.uRimC=PRIM.c;sh.uniforms.uRimS=PRIM.s;
    sh.fragmentShader='uniform vec3 uRimC;\nuniform float uRimS;\n'+sh.fragmentShader.replace('#include <tonemapping_fragment>',
      'float pkR=1.0-clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0);gl_FragColor.rgb+=uRimC*(uRimS*'+kk+')*pkR*pkR*pkR;\n#include <tonemapping_fragment>');};
  m.customProgramCacheKey=()=>'pkRim'+kk;
  return m;
}
function pkRimUpdate(t){
  if(PRIM.t===t)return;PRIM.t=t;
  const h=hemi.color;PRIM.c.value.setRGB(lerp(h.r,1,.3)*.95,lerp(h.g,1,.3)*.97,lerp(h.b,1,.3));
  PRIM.s.value=clamp(.3+hemi.intensity*.3,.3,.7);
}
// --- small deterministic helpers ---
const pkHash=(x,y)=>{const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s);};
let pkSeed=7;const pkRand=()=>{pkSeed=(pkSeed*16807)%2147483647;return pkSeed/2147483647;};
const pkRGB=h=>{const c=new T.Color(h);return [c.r,c.g,c.b];};
function pkTex(n,draw,rep){
  const c=document.createElement('canvas');c.width=c.height=n;draw(c.getContext('2d'),n);
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(4,maxAniso||1);if(rep)t.repeat.set(rep[0],rep[1]);return t;
}
// soft overlapping feather scales (bump): much finer and gentler than the old golf-ball pattern
const PK_FEATHER=pkTex(256,(x,N)=>{
  x.fillStyle='#787878';x.fillRect(0,0,N,N);
  for(let row=0;row<24;row++)for(let col=0;col<18;col++){
    const cx=(col+(row%2?.5:0))*N/18+(pkRand()-.5)*5,cy=row*N/24+(pkRand()-.5)*4,w=N/18*.62,hh=N/24*1.4;
    for(const ox of[-N,0,N])for(const oy of[-N,0,N]){const X=cx+ox,Y=cy+oy;if(X<-24||X>N+24||Y<-24||Y>N+24)continue;
      const g=x.createLinearGradient(X,Y-hh,X,Y+hh*.7);g.addColorStop(0,'rgba(150,150,150,0)');g.addColorStop(.55,'rgba(166,166,166,.7)');g.addColorStop(1,'rgba(92,92,92,.85)');
      x.fillStyle=g;x.beginPath();x.ellipse(X,Y,w,hh,0,0,TAU);x.fill();}
  }
});
// knitted wool (bump) for scarves and beanies
const PK_KNIT=pkTex(64,(x,N)=>{
  x.fillStyle='#808080';x.fillRect(0,0,N,N);
  for(let i=0;i<4;i++)for(let j=0;j<8;j++){const cx=i*N/4+N/8,cy=j*N/8;
    for(const s of[-1,1]){const g=x.createLinearGradient(cx,cy,cx+s*N/8,cy+N/8);g.addColorStop(0,'#b4b4b4');g.addColorStop(1,'#5c5c5c');x.fillStyle=g;x.beginPath();x.ellipse(cx+s*N/17,cy+N/16,N/19,N/11,s*.6,0,TAU);x.fill();}}
});
// --- parametric surface (u around, v up) with seam / pole normal fixes ---
function pkSurf(U,V,fn,colFn,ru,rv,poles){
  const n=(U+1)*(V+1),pos=new Float32Array(n*3),uv=new Float32Array(n*2),col=colFn?new Float32Array(n*3):null,idx=[],p=[0,0,0],c=[1,1,1];let k=0;
  for(let j=0;j<=V;j++)for(let i=0;i<=U;i++){const u=i/U,v=j/V;fn(u,v,p);pos[k*3]=p[0];pos[k*3+1]=p[1];pos[k*3+2]=p[2];uv[k*2]=u*(ru||1);uv[k*2+1]=v*(rv||1);
    if(col){colFn(u,v,p,c);col[k*3]=c[0];col[k*3+1]=c[1];col[k*3+2]=c[2];}k++;}
  for(let j=0;j<V;j++)for(let i=0;i<U;i++){const a=j*(U+1)+i,b=a+1,cc=a+U+1,d=cc+1;idx.push(a,b,cc,b,d,cc);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));
  if(col)g.setAttribute('color',new T.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  const nm=g.attributes.normal;
  for(let j=0;j<=V;j++){const a=j*(U+1),b=a+U;const x=nm.getX(a)+nm.getX(b),y=nm.getY(a)+nm.getY(b),z=nm.getZ(a)+nm.getZ(b),l=Math.hypot(x,y,z)||1;nm.setXYZ(a,x/l,y/l,z/l);nm.setXYZ(b,x/l,y/l,z/l);}
  if(poles){if(poles[0])for(let i=0;i<=U;i++)nm.setXYZ(i,0,-1,0);if(poles[1])for(let i=0;i<=U;i++)nm.setXYZ(V*(U+1)+i,0,1,0);}
  return g;
}
// --- merge small parts into one vertex-coloured geometry (fewer draw calls) ---
function pkMerge(list){
  let nv=0,ni=0;for(const it of list){const g=it[0];nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
  const P=new Float32Array(nv*3),N=new Float32Array(nv*3),C=new Float32Array(nv*3),I=new (nv>65000?Uint32Array:Uint16Array)(ni);let vo=0,io=0;
  for(const it of list){const g=it[0],col=it[1];if(!g.attributes.normal)g.computeVertexNormals();
    const p=g.attributes.position,nn=g.attributes.normal,cc=g.attributes.color,cnt=p.count;
    for(let i=0;i<cnt;i++){P[(vo+i)*3]=p.getX(i);P[(vo+i)*3+1]=p.getY(i);P[(vo+i)*3+2]=p.getZ(i);N[(vo+i)*3]=nn.getX(i);N[(vo+i)*3+1]=nn.getY(i);N[(vo+i)*3+2]=nn.getZ(i);
      if(col){C[(vo+i)*3]=col[0];C[(vo+i)*3+1]=col[1];C[(vo+i)*3+2]=col[2];}else if(cc){C[(vo+i)*3]=cc.getX(i);C[(vo+i)*3+1]=cc.getY(i);C[(vo+i)*3+2]=cc.getZ(i);}else{C[(vo+i)*3]=C[(vo+i)*3+1]=C[(vo+i)*3+2]=1;}}
    if(g.index){const ix=g.index;for(let i=0;i<ix.count;i++)I[io++]=ix.getX(i)+vo;}else for(let i=0;i<cnt;i++)I[io++]=vo+i;
    vo+=cnt;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('normal',new T.BufferAttribute(N,3));g.setAttribute('color',new T.BufferAttribute(C,3));g.setIndex(new T.BufferAttribute(I,1));
  return g;
}
// --- sculpted silhouettes: body and head are separate so the head can turn (seam hidden under the scarf) ---
const PK_BODY_P=[[0,0],[.2,.012],[.4,.085],[.52,.24],[.575,.45],[.565,.62],[.52,.8],[.445,.96],[.36,1.08],[.3,1.17],[.24,1.24],[.001,1.275]];
const PK_HEAD_P=[[.255,1.04],[.29,1.13],[.318,1.22],[.343,1.31],[.358,1.4],[.36,1.47],[.348,1.54],[.318,1.6],[.268,1.648],[.2,1.682],[.12,1.7],[.001,1.708]];
const pkCurve=pts=>new T.SplineCurve(pts.map(p=>new T.Vector2(p[0],p[1])));
const PK_BC=pkCurve(PK_BODY_P),PK_HC=pkCurve(PK_HEAD_P);
const pkTab=cv=>{const a=[];for(let i=0;i<=240;i++){const p=cv.getPoint(i/240);a.push([p.y,p.x]);}a.sort((m,n)=>m[0]-n[0]);return a;};
const PK_BTAB=pkTab(PK_BC),PK_HTAB=pkTab(PK_HC);
function pkLook(a,y){if(!a.length||y<=a[0][0])return a.length?a[0][1]:0;for(let i=1;i<a.length;i++)if(a[i][0]>=y){const t=(y-a[i-1][0])/Math.max(1e-6,a[i][0]-a[i-1][0]);return lerp(a[i-1][1],a[i][1],t);}return 0;}
const pkBodyR=y=>pkLook(PK_BTAB,y),pkHeadR=y=>pkLook(PK_HTAB,y);
function pkBodyK(th,y){const c=Math.cos(th),F=c>0?c*c:0,B=c<0?c*c:0;   // round belly in front, flatter back
  return 1+.1*F*smooth(.08,.42,y)*(1-smooth(.72,1.08,y))-.05*B*smooth(.15,.45,y)*(1-smooth(.9,1.12,y));}
function pkHeadK(th,y){const c=Math.cos(th),F=c>0?c*c:0;return 1+.07*F*smooth(1.22,1.33,y)*(1-smooth(1.5,1.63,y));}   // face / cheeks
const PK_SHAPE={basic:1.03,fast:.96,strong:.97,defense:1,balanced:1.02,auk:1};
// species plumage (vertex colours)
function pkCol(ty,th,y,o){
  const a=Math.abs(th),pt=ty.patch;
  let half;if(y<0.3)half=2.3;else if(y<1.0)half=lerp(1.45,1.12,(y-.3)/.7);else half=lerp(1.12,.62,clamp((y-1)/.2,0,1));
  const darkThroat=pt==='adelie'||pt==='rock'||pt==='gentoo'||pt==='auk';
  const headFade=darkThroat?1-smooth(1.05,1.13,y):1-smooth(1.16,1.26,y);
  let wh=(1-smooth(half-.12,half+.1,a))*headFade;
  let r=.035,g=.04,b=.062;const back=smooth(1.3,3.0,a)*(.6+.4*smooth(.4,1.1,y));r+=.03*back;g+=.04*back;b+=.07*back;   // blue-grey sheen on the back
  if(pt==='chinstrap'){const face=smooth(1.14,1.2,y)*(1-smooth(1.47,1.55,y)),fw=(1-smooth(1.42,1.78,a))*face;wh=Math.max(wh,fw);
    const strap=smooth(1.212,1.232,y)*(1-smooth(1.262,1.282,y))*(1-smooth(1.45,1.62,a));wh*=1-strap;}
  const wr=.95,wg=.955,wb=.97-.03*(1-smooth(.1,.6,y));
  r=lerp(r,wr,wh);g=lerp(g,wg,wh);b=lerp(b,wb,wh);
  if(pt==='ear'){const pc=ty.pc,tt=smooth(.82,1.16,y)*wh*(1-smooth(1.3,1.45,y));
    r=lerp(r,lerp(1,pc[0],.6),tt*.7);g=lerp(g,lerp(1,pc[1],.55),tt*.7);b=lerp(b,lerp(1,pc[2],.4),tt*.7);
    const e=1-Math.hypot((a-1.38)/.5,(y-1.36)/.16),f=smooth(0,.45,e);r=lerp(r,pc[0],f);g=lerp(g,pc[1],f);b=lerp(b,pc[2],f);
    const e2=1-Math.hypot((a-.95)/.42,(y-1.25)/.07),f2=smooth(0,.6,e2)*.8;r=lerp(r,pc[0],f2);g=lerp(g,pc[1]*.95,f2);b=lerp(b,pc[2],f2);}
  else if(pt==='auk'){const e=1-Math.hypot((a-.5)/.2,(y-1.43)/.085),f=smooth(0,.35,e);r=lerp(r,.97,f);g=lerp(g,.97,f);b=lerp(b,.99,f);}
  else if(pt==='gentoo'){const band=smooth(1.5,1.53,y)*(1-smooth(1.6,1.63,y))*smooth(.32,.42,a)*(1-smooth(1.62,1.75,a));
    const eyeP=smooth(0,.35,1-Math.hypot((a-.6)/.22,(y-1.505)/.06)),f=Math.max(band,eyeP);r=lerp(r,.95,f);g=lerp(g,.96,f);b=lerp(b,.98,f);}
  const n=(pkHash(th*7.3,y*11.1)-.5)*.03,sh=.9+.1*smooth(0,.5,y);
  o[0]=Math.max(0,(r+n)*sh);o[1]=Math.max(0,(g+n)*sh);o[2]=Math.max(0,(b+n)*sh);
}
const pkGeoC={};
const pkLo=()=>save.set.quality==='low';
function pkBodyGeo(key){const lo=pkLo(),ck='b'+key+lo;if(pkGeoC[ck])return pkGeoC[ck];
  const ty=TYPES[key],w=PK_SHAPE[key]||1;
  return pkGeoC[ck]=pkSurf(lo?28:52,lo?26:46,(u,v,p)=>{const q=PK_BC.getPointAt(v),th=u*TAU,r=Math.max(q.x,.0005)*pkBodyK(th,q.y)*w;p[0]=r*Math.sin(th);p[1]=q.y;p[2]=r*Math.cos(th);},
    (u,v,p,c)=>pkCol(ty,Math.atan2(p[0],p[2]),p[1],c),12,9,[true,true]);}
function pkHeadGeo(key){const lo=pkLo(),ck='h'+key+lo;if(pkGeoC[ck])return pkGeoC[ck];
  const ty=TYPES[key];
  return pkGeoC[ck]=pkSurf(lo?24:44,lo?16:28,(u,v,p)=>{const q=PK_HC.getPointAt(v),th=u*TAU,r=Math.max(q.x,.0005)*pkHeadK(th,q.y);p[0]=r*Math.sin(th);p[1]=q.y;p[2]=r*Math.cos(th);},
    (u,v,p,c)=>pkCol(ty,Math.atan2(p[0],p[2]),p[1],c),10,5,[false,true]);}
// a point on the head / body surface (inner coordinates)
function pkHeadPt(th,y,inset){const r=pkHeadR(y)*pkHeadK(th,y)-(inset||0);return new T.Vector3(r*Math.sin(th),y,r*Math.cos(th));}
function pkBodyPt(key,th,y,out){const r=pkBodyR(y)*pkBodyK(th,y)*(PK_SHAPE[key]||1)+(out||0);return new T.Vector3(r*Math.sin(th),y,r*Math.cos(th));}
// --- materials (shared) ---
const PK_MAT={
  body:rimify(new T.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:0,bumpMap:PK_FEATHER,bumpScale:.012}),1),
  vc:rimify(new T.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:0}),.8),
  beak:rimify(new T.MeshStandardMaterial({vertexColors:true,roughness:.3,metalness:.04}),.45),
  eye:new T.MeshStandardMaterial({vertexColors:true,roughness:.07,metalness:0}),
  hl:new T.MeshBasicMaterial({color:0xffffff}),
  stick:new T.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.05}),
  metal:new T.MeshStandardMaterial({vertexColors:true,roughness:.25,metalness:.8})
};
const pkMatC={};
function pkKnitMat(col,rep){const k='k'+col+'_'+rep;if(pkMatC[k])return pkMatC[k];const t=PK_KNIT.clone();t.needsUpdate=true;t.repeat.set(rep[0],rep[1]);
  return pkMatC[k]=rimify(new T.MeshStandardMaterial({color:col,roughness:.95,bumpMap:t,bumpScale:.03}),1.1);}
function pkKnitVC(rep){const k='kv'+rep;if(pkMatC[k])return pkMatC[k];const t=PK_KNIT.clone();t.needsUpdate=true;t.repeat.set(rep[0],rep[1]);
  return pkMatC[k]=rimify(new T.MeshStandardMaterial({vertexColors:true,roughness:.95,bumpMap:t,bumpScale:.03}),1.1);}
// --- hockey sweater: canvas texture with yoke, hem stripes, crest and a back number ---
function pkJerseyMat(teamKey,num){const lo=pkLo(),k='j'+teamKey+num+lo;if(pkMatC[k])return pkMatC[k];
  const tc=new T.Color(TEAM[teamKey].color),hx=c=>'#'+c.getHexString(),dark=tc.clone().multiplyScalar(.6),lite=tc.clone().lerp(new T.Color(1,1,1),.16);
  const c=document.createElement('canvas');c.width=lo?256:512;c.height=lo?128:256;const x=c.getContext('2d');if(lo)x.scale(.5,.5);   // half-size texture in battery-saver graphics
  const gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,hx(lite));gr.addColorStop(1,hx(tc));x.fillStyle=gr;x.fillRect(0,0,512,256);
  x.fillStyle=hx(dark);x.fillRect(0,0,512,40);x.fillStyle='#fff';x.fillRect(0,40,512,7);
  x.fillStyle='#fff';x.fillRect(0,192,512,15);x.fillStyle=hx(dark);x.fillRect(0,211,512,11);x.fillStyle='#fff';x.fillRect(0,226,512,9);
  x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
  x.font='900 100px "Arial Black",Arial,sans-serif';x.lineWidth=14;x.strokeStyle=hx(dark);x.strokeText(String(num),256,120);x.fillStyle='#fff';x.fillText(String(num),256,120);
  for(const cx of[0,512]){x.fillStyle='#fff';x.beginPath();x.arc(cx,112,30,0,TAU);x.fill();x.fillStyle=hx(dark);x.beginPath();x.arc(cx,112,24,0,TAU);x.fill();
    x.fillStyle='#fff';x.font='900 30px Arial,sans-serif';x.fillText(teamKey==='blue'?'B':'R',cx,114);}
  for(let i=0;i<1400;i++){x.fillStyle='rgba(255,255,255,'+(pkRand()*.05)+')';x.fillRect(pkRand()*512,pkRand()*256,2,1);}   // knit grain
  const t=new T.CanvasTexture(c);t.anisotropy=Math.min(4,maxAniso||1);
  return pkMatC[k]=rimify(new T.MeshStandardMaterial({map:t,roughness:.82,side:T.DoubleSide}),.9);
}
function pkJerseyGeo(key){const lo=pkLo(),ck='j'+key+lo;if(pkGeoC[ck])return pkGeoC[ck];const w=PK_SHAPE[key]||1;
  return pkGeoC[ck]=pkSurf(lo?28:48,lo?8:14,(u,v,p)=>{const th=u*TAU,c=Math.cos(th),yT=.875-.075*c,y=lerp(.4,yT,v),
    r=pkBodyR(y)*pkBodyK(th,y)*w+.03+.016*(1-smooth(0,.14,v))+.006*Math.sin(th*9)*(1-smooth(0,.3,v));p[0]=r*Math.sin(th);p[1]=y;p[2]=r*Math.cos(th);},null,1,1);}
// --- scarf (knitted, striped) ---
function pkScarfGeo(teamKey){const ck='s'+teamKey;if(pkGeoC[ck])return pkGeoC[ck];
  const tc=new T.Color(TEAM[teamKey].color),R0=pkBodyR(1.155)+.012,g=new T.TorusGeometry(R0,.062,10,44);g.rotateX(Math.PI/2);g.translate(0,1.155,0);
  const p=g.attributes.position,col=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const ph=Math.atan2(p.getZ(i),p.getX(i)),f=(((ph/TAU*14)%1)+1)%1,wh=f<.2?1:0;col[i*3]=lerp(tc.r,.96,wh);col[i*3+1]=lerp(tc.g,.97,wh);col[i*3+2]=lerp(tc.b,.98,wh);}
  g.setAttribute('color',new T.BufferAttribute(col,3));return pkGeoC[ck]=g;}
function pkScarfTailGeo(teamKey){const ck='st'+teamKey;if(pkGeoC[ck])return pkGeoC[ck];
  const tc=pkRGB(TEAM[teamKey].color),wh=[.96,.97,.98],list=[];
  for(const [len,ox,rz] of[[.44,0,0],[.36,.075,.14]]){
    const n=Math.round(len/.075);for(let i=0;i<n;i++){const b=new T.BoxGeometry(.13,len/n+.002,.032);b.translate(ox,-(i+.5)*len/n,0);b.rotateZ(rz);list.push([b,i%2?wh:tc]);}
    for(let f=0;f<5;f++){const c=new T.CylinderGeometry(.008,.008,.07,4);c.translate(ox-.05+f*.025,-len-.035,0);c.rotateZ(rz);list.push([c,tc]);}
  }
  return pkGeoC[ck]=pkMerge(list);}
// --- eyes: glossy sclera, species iris, pupil, double catch-light ---
function pkEyeGeos(key){const ck='e'+key;if(pkGeoC[ck])return pkGeoC[ck];
  const pt=TYPES[key].patch,big=pt==='adelie'?1.24:pt==='auk'?.82:1,iris=pkRGB(pt==='rock'?0xd0182a:pt==='auk'?0x1a1410:0x2a1a12);
  const sc=new T.SphereGeometry(1,20,14);sc.scale(.085*big,.085*big,.05);
  const ir=new T.SphereGeometry(1,18,12);ir.scale(.056,.056,.024);ir.translate(0,0,.03);
  const pu=new T.SphereGeometry(1,14,10);pu.scale(.031,.031,.016);pu.translate(0,0,.043);
  const h1=new T.SphereGeometry(1,8,6);h1.scale(.016,.016,.008);h1.translate(.02,.024,.056);
  const h2=new T.SphereGeometry(1,8,6);h2.scale(.008,.008,.005);h2.translate(-.017,-.018,.055);
  return pkGeoC[ck]={sclera:pkMerge([[sc,[.97,.975,.99]]]),iris:pkMerge([[ir,iris],[pu,[.01,.01,.012]]]),hl:pkMerge([[h1,null],[h2,null]])};}
// --- beaks: curved upper + lower mandible (the lower one can open), species colours ---
function pkBeakGeo(L,W,H,droop,hook,colFn,lower){
  const N=12,M=14,pos=[],col=[],idx=[],c=[0,0,0];
  for(let i=0;i<=N;i++){const t=i/N,z=t*L,yc=-droop*L*t*t-(t>.72?hook*H*(t-.72)/.28:0),w=Math.max(.004,W*(1-Math.pow(t,1.25)*.94)),h=Math.max(.004,H*(1-Math.pow(t,1.15)*.9));
    for(let j=0;j<=M;j++){const ph=j/M*TAU,cs=Math.cos(ph),sn=Math.sin(ph),yy=lower?(sn>0?sn*.45:sn):(sn>0?sn:sn*.35);pos.push(cs*w,yc+yy*h,z);colFn(t,yy,cs,c);col.push(c[0],c[1],c[2]);}}
  const tip=pos.length/3;pos.push(0,-droop*L-hook*H,L+.006);colFn(1,0,0,c);col.push(c[0],c[1],c[2]);
  for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=i*(M+1)+j,b=a+1,cc=a+M+1,d=cc+1;idx.push(a,b,cc,b,d,cc);}
  for(let j=0;j<M;j++){const a=N*(M+1)+j;idx.push(a,a+1,tip);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
function pkBeakSpec(ty){
  const pt=ty.patch,bl=ty.bl||1,bw=ty.bw||1,blk=(t,y,x,c)=>{const k=t<.18?.09:.055;c[0]=k;c[1]=k;c[2]=k*1.15;},mouth=[.62,.28,.33];
  const inside=(y,lower)=>lower?y>.3:y<-.2;
  const S={L:.3*bl,W:.072*bw,H:.06,droop:.28,hook:.12,up:blk,lo:blk};
  if(pt==='gentoo'){Object.assign(S,{droop:.18,hook:.08,up:(t,y,x,c)=>{const b=t>.84||y>.78;const o=pkRGB(0xff5418);c[0]=b?.06:o[0];c[1]=b?.06:o[1];c[2]=b?.07:o[2];},lo:(t,y,x,c)=>{const o=pkRGB(0xff7d1c);const b=t>.88;c[0]=b?.06:o[0];c[1]=b?.06:o[1];c[2]=b?.07:o[2];}});}
  else if(pt==='rock'){Object.assign(S,{H:.072,droop:.3,hook:.16,up:(t,y,x,c)=>{const o=pkRGB(0xd8432a);const l=smooth(.6,1,t)*.25;c[0]=lerp(o[0],1,l);c[1]=lerp(o[1],.75,l);c[2]=lerp(o[2],.6,l);},lo:(t,y,x,c)=>{const o=pkRGB(0xc0391f);c[0]=o[0];c[1]=o[1];c[2]=o[2];}});}
  else if(pt==='ear'){Object.assign(S,{H:.05,droop:.42,hook:.06,lo:(t,y,x,c)=>{const pl=smooth(.08,.16,t)*(1-smooth(.62,.72,t))*smooth(.2,.5,Math.abs(x));const o=pkRGB(0xff8a3a);c[0]=lerp(.055,o[0],pl);c[1]=lerp(.055,o[1],pl);c[2]=lerp(.063,o[2],pl);}});}
  else if(pt==='adelie'){Object.assign(S,{droop:.22,hook:.12,H:.062});}
  const wrap=(f,lower)=>(t,y,x,c)=>{f(t,y,x,c);if(inside(y,lower)&&t<.95){c[0]=lerp(c[0],mouth[0],.85);c[1]=lerp(c[1],mouth[1],.85);c[2]=lerp(c[2],mouth[2],.85);}};
  S.upW=wrap(S.up,false);S.loW=wrap(S.lo,true);return S;
}
function pkBeak(key){const ck='k'+key;if(pkGeoC[ck])return pkGeoC[ck];const S=pkBeakSpec(TYPES[key]);
  return pkGeoC[ck]={S,up:pkBeakGeo(S.L,S.W,S.H,S.droop,S.hook,S.upW,false),lo:pkBeakGeo(S.L*.86,S.W*.86,S.H*.62,S.droop*.8,0,S.loW,true)};}
// --- flippers: tapered paddles, black outside, white inside with a black rim, team wristband ---
function pkFlipperGeo(side,teamKey){const lo=pkLo(),ck='f'+side+teamKey+lo;if(pkGeoC[ck])return pkGeoC[ck];
  const g=new T.SphereGeometry(1,lo?12:18,lo?10:16),p=g.attributes.position,col=new Float32Array(p.count*3),tc=new T.Color(TEAM[teamKey].color);
  const L=.45,W=.21,Th=.078;
  for(let i=0;i<p.count;i++){const nx=p.getX(i),ny=p.getY(i),nz=p.getZ(i),s=(1-ny)/2;
    const wf=Math.pow(Math.max(0,Math.sin(Math.PI*(.12+.88*s))),.55)*(1-.25*s),tf=1-.55*s,band=smooth(.13,.16,s)*(1-smooth(.21,.24,s)),puff=1+.14*band;
    p.setXYZ(i,nx*Th*.5*tf*puff,-s*L,nz*W*.5*wf*puff-.07*s*s);
    const inner=smooth(.15,.55,-side*nx)*(1-smooth(.55,.92,Math.abs(nz)))*smooth(.08,.22,s);
    let r=lerp(.035,.93,inner),gg=lerp(.04,.94,inner),b=lerp(.062,.96,inner);r=lerp(r,tc.r,band);gg=lerp(gg,tc.g,band);b=lerp(b,tc.b,band);
    col[i*3]=r;col[i*3+1]=gg;col[i*3+2]=b;}
  g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();return pkGeoC[ck]=g;}
// --- webbed feet with toes and claws ---
function pkFootGeo(key){const ck='ft'+key;if(pkGeoC[ck])return pkGeoC[ck];
  const ty=TYPES[key],col=pkRGB(ty.patch==='auk'?0x2b3440:(ty.foot||0xff8c1c)),claw=[.1,.09,.09],list=[];
  const sole=new T.SphereGeometry(1,14,10);sole.scale(.13,.045,.16);sole.translate(0,0,.03);list.push([sole,col]);
  const web=new T.SphereGeometry(1,12,6);web.scale(.16,.022,.12);web.translate(0,-.012,.16);list.push([web,col]);
  for(const a of[-.42,0,.42]){const toe=new T.SphereGeometry(1,10,8);toe.scale(.045,.036,.13);toe.translate(0,0,.11);toe.rotateY(a);toe.translate(0,0,.07);list.push([toe,col]);
    const cl=new T.ConeGeometry(.017,.05,6);cl.rotateX(Math.PI/2);cl.translate(0,-.006,.255);cl.rotateY(a);cl.translate(0,0,.07);list.push([cl,claw]);}
  return pkGeoC[ck]=pkMerge(list);}
// --- tail: a fan of stiff feathers ---
function pkTailGeo(tl){const ck='tl'+tl;if(pkGeoC[ck])return pkGeoC[ck];const list=[];
  for(let i=-2;i<=2;i++){const c=new T.ConeGeometry(.045,.3*tl,6);c.scale(1,1,.35);c.rotateX(-Math.PI/2);c.translate(0,0,-.15*tl);c.rotateY(i*.17);list.push([c,[.035,.04,.058]]);}
  return pkGeoC[ck]=pkMerge(list);}
// --- rockhopper crest: swept-back yellow plumes + black spikes ---
function pkCrestGeo(withSpikes){const ck='cr'+withSpikes;if(pkGeoC[ck])return pkGeoC[ck];const list=[],yel=pkRGB(0xffd21a),blk=[.035,.04,.058];
  for(const s of[-1,1])for(let i=0;i<6;i++){const len=.2+.03*i,c=new T.ConeGeometry(.017,len,5);c.translate(0,len/2,0);c.rotateX(-1.22-.08*i);c.rotateZ(-s*(.5+.07*i));c.translate(s*(.17+.018*i),1.535+.012*i,.23-.035*i);list.push([c,yel]);}
  if(withSpikes)for(let i=0;i<7;i++){const h=.15+.05*(1-Math.abs(i-3)/3),c=new T.ConeGeometry(.03,h,6);c.translate(0,h/2,0);c.rotateX(-.45);c.rotateZ((i-3)*.2);c.translate((i-3)*.045,1.63,-.03-.03*Math.abs(i-3));list.push([c,blk]);}
  return pkGeoC[ck]=pkMerge(list);}
// --- hockey stick (+ goalie stick with a paddle) ---
function pkStickGeo(teamKey,goalie){const ck='sk'+teamKey+goalie;if(pkGeoC[ck])return pkGeoC[ck];
  const L=goalie?1.25:1.42,tc=pkRGB(TEAM[teamKey].color),list=[],shaft=[.13,.14,.17],tape=[.05,.05,.06],wht=[.95,.96,.97];
  const seg=(z0,z1,w,h,col)=>{const b=new T.BoxGeometry(w,h,z1-z0);b.translate(0,0,(z0+z1)/2);list.push([b,col]);};
  seg(0,.1,.05,.04,wht);seg(.1,L*.3,.042,.03,shaft);seg(L*.3,L*.48,.043,.031,tc);seg(L*.48,L*.52,.043,.031,wht);seg(L*.52,L,.042,.03,shaft);
  if(goalie)seg(L*.58,L,.05,.1,tc);
  const bl=goalie?.36:.34,bh=goalie?.11:.075,b=new T.BoxGeometry(.02,bh,bl);b.translate(0,bh*.25,bl/2);b.rotateX(-.62);b.translate(0,0,L);list.push([b,tape]);
  const s1=new T.BoxGeometry(.022,.012,bl*.9);s1.translate(0,bh*.25,bl/2);s1.rotateX(-.62);s1.translate(0,0,L);list.push([s1,wht]);
  return pkGeoC[ck]=pkMerge(list);}
// --- improved hats (beanie, helmet + goalie cage); others keep their original pieces ---
function pkBeanie(tc){const g=new T.Group(),m=pkKnitMat(tc,[14,5]);
  const cap=new T.Mesh(new T.SphereGeometry(.39,32,16,0,TAU,0,Math.PI*.5),m);cap.scale.y=.7;cap.position.y=1.565;cap.castShadow=true;g.add(cap);
  const cuff=new T.Mesh(new T.TorusGeometry(.385,.062,12,44),pkKnitMat(0xf2f5f9,[40,3]));cuff.rotation.x=Math.PI/2;cuff.position.y=1.57;g.add(cuff);
  const pg=new T.IcosahedronGeometry(.11,2),pp=pg.attributes.position;for(let i=0;i<pp.count;i++){const x=pp.getX(i),y=pp.getY(i),z=pp.getZ(i),k=1+(pkHash(x*41+z*7,y*37+z*13)-.5)*.32;pp.setXYZ(i,x*k,y*k,z*k);}pg.computeVertexNormals();
  const pom=new T.Mesh(pg,pkMatC.pom||(pkMatC.pom=rimify(new T.MeshStandardMaterial({color:0xf6f8fb,roughness:1}),1.2)));pom.position.y=1.86;pom.castShadow=true;g.add(pom);
  return g;}
function pkCageGeo(){if(pkGeoC.cage)return pkGeoC.cage;const list=[],c=[.86,.89,.93],R=.44;
  for(const y of[1.255,1.505]){const t=new T.TorusGeometry(R,.011,5,20,1.9);t.rotateX(Math.PI/2);t.rotateY(.95-Math.PI/2);t.translate(0,y,0);list.push([t,c]);}
  for(const a of[-.66,-.28,.28,.66]){const cy=new T.CylinderGeometry(.011,.011,.27,5);cy.translate(R*Math.sin(a),1.38,R*Math.cos(a));list.push([cy,c]);}
  return pkGeoC.cage=pkMerge(list);}
function pkHelmet(tc,goalie){const g=new T.Group(),k='hm'+tc,m=pkMatC[k]||(pkMatC[k]=rimify(new T.MeshStandardMaterial({color:tc,roughness:.22,metalness:.25}),.9));
  const shell=new T.Mesh(new T.SphereGeometry(.405,32,16,0,TAU,0,Math.PI*.53),m);shell.scale.y=.76;shell.position.y=1.545;shell.castShadow=true;g.add(shell);
  const st=new T.Mesh(new T.TorusGeometry(.405,.022,8,40,Math.PI),MAT.white);st.position.y=1.545;st.scale.y=.76;st.rotation.y=Math.PI/2;g.add(st);
  const rim=new T.Mesh(new T.TorusGeometry(.398,.02,6,40),MAT.dark);rim.rotation.x=Math.PI/2;rim.position.y=1.535;g.add(rim);
  for(const s of[-1,1]){const ear=new T.Mesh(sph(12),MAT.dark);ear.scale.set(.06,.11,.12);ear.position.set(s*.375,1.44,0);g.add(ear);}
  if(goalie)g.add(new T.Mesh(pkCageGeo(),PK_MAT.metal));
  return g;}
function pkHat(key,tc,goalie){if(key==='beanie')return pkBeanie(tc);if(key==='helmet'||goalie)return pkHelmet(tc,goalie);return buildHat(key,tc);}
// rounded box (goalie pads, blocker): subdivided box pushed onto rounded edges
function pkRoundBox(w,h,d,r,seg){const g=new T.BoxGeometry(w,h,d,seg||4,seg||6,seg||3),p=g.attributes.position,hx=w/2-r,hy=h/2-r,hz=d/2-r;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),qx=clamp(x,-hx,hx),qy=clamp(y,-hy,hy),qz=clamp(z,-hz,hz),nx=x-qx,ny=y-qy,nz=z-qz,l=Math.hypot(nx,ny,nz);
    if(l>1e-6)p.setXYZ(i,qx+nx/l*r,qy+ny/l*r,qz+nz/l*r);}
  g.computeVertexNormals();return g;}
// --- goalie gear: leg pads, blocker, catching glove ---
function pkPadsGeo(teamKey){const ck='pd'+teamKey;if(pkGeoC[ck])return pkGeoC[ck];const tc=pkRGB(TEAM[teamKey].color),wh=[.94,.95,.97],list=[];
  for(const s of[-1,1]){const z=pkBodyR(.27)*pkBodyK(0,.27)+.04;const b=pkRoundBox(.21,.5,.11,.04);b.translate(s*.17,.27,z);list.push([b,wh]);
    for(const y of[.15,.36]){const st=pkRoundBox(.218,.055,.118,.02,3);st.translate(s*.17,y,z);list.push([st,tc]);}
    const kn=pkRoundBox(.2,.11,.135,.04,3);kn.translate(s*.17,.5,z+.01);list.push([kn,tc]);}
  return pkGeoC[ck]=pkMerge(list);}
function pkBlockerGeo(teamKey){const ck='bk'+teamKey;if(pkGeoC[ck])return pkGeoC[ck];const tc=pkRGB(TEAM[teamKey].color);
  const b=pkRoundBox(.05,.26,.2,.02,3);b.translate(.02,-.4,.02);const r=pkRoundBox(.058,.2,.14,.015,3);r.translate(.02,-.4,.02);
  return pkGeoC[ck]=pkMerge([[b,[.95,.96,.97]],[r,tc]]);}
function pkGloveGeo(teamKey){const ck='gv'+teamKey;if(pkGeoC[ck])return pkGeoC[ck];const tc=pkRGB(TEAM[teamKey].color);
  const m=new T.SphereGeometry(1,14,10);m.scale(.09,.15,.16);m.translate(-.03,-.42,.04);const cu=new T.TorusGeometry(.085,.02,6,16);cu.rotateX(Math.PI/2);cu.translate(-.02,-.3,.02);
  return pkGeoC[ck]=pkMerge([[m,tc],[cu,[.95,.96,.97]]]);}
// --- jersey numbers stay with the species, never clash inside a team ---
function pkNum(tm,typeKey,isGoalie){
  if(isGoalie)return tm.key==='blue'?1:30;
  let n={basic:7,fast:11,strong:88,defense:4,balanced:19,auk:99}[typeKey]||9;
  const used=new Set(G.pengs.filter(q=>q.team===tm&&q.pg&&q.pg.num).map(q=>q.pg.num));
  while(used.has(n))n=(n+10)%100||10;
  return n;
}
function buildPenguin(typeKey,teamKey,hatKey,o){
  o=o||{};const ty=TYPES[typeKey],tc=TEAM[teamKey].color,goalie=!!o.goalie,num=o.num||({basic:7,fast:11,strong:88,defense:4,balanced:19,auk:99}[typeKey]||9);
  const root=new T.Group(),piv=new T.Group(),inner=new T.Group();piv.position.y=PIV;inner.position.y=-PIV;root.add(piv);piv.add(inner);
  root.scale.setScalar(ty.scale*(goalie?1.15:1));
  // torso (breathes): body + sweater
  const torso=new T.Group();inner.add(torso);
  const body=new T.Mesh(pkBodyGeo(typeKey),PK_MAT.body);body.castShadow=true;body.receiveShadow=true;torso.add(body);
  const jer=new T.Mesh(pkJerseyGeo(typeKey),pkJerseyMat(teamKey,num));jer.receiveShadow=true;torso.add(jer);
  // scarf
  const sc=new T.Mesh(pkScarfGeo(teamKey),pkKnitVC([30,2]));sc.castShadow=true;inner.add(sc);
  const scarfTail=new T.Group();scarfTail.position.set(-.17,1.13,-.27);scarfTail.add(new T.Mesh(pkScarfTailGeo(teamKey),pkKnitVC([3,6])));inner.add(scarfTail);
  // head rig: everything on the head lives in headAbs (inner coordinates) so it turns with the head
  const head=new T.Group();head.position.y=PK_NECK;inner.add(head);
  const headAbs=new T.Group();headAbs.position.y=-PK_NECK;head.add(headAbs);
  const hm=new T.Mesh(pkHeadGeo(typeKey),PK_MAT.body);hm.castShadow=true;hm.receiveShadow=true;headAbs.add(hm);
  // eyes
  const eg=pkEyeGeos(typeKey),eyes=[],pupils=[],ey=ty.patch==='auk'?1.46:1.45,eth=ty.patch==='auk'?.66:.6;
  for(const s of[-1,1]){
    const e=new T.Group(),pt=pkHeadPt(s*eth,ey,.026);e.position.copy(pt);e.rotation.y=s*eth;
    e.add(new T.Mesh(eg.sclera,PK_MAT.eye));
    const ir=new T.Mesh(eg.iris,PK_MAT.eye);e.add(ir);ir.add(new T.Mesh(eg.hl,PK_MAT.hl));
    headAbs.add(e);eyes.push(e);pupils.push(ir);
  }
  // beak (the great auk keeps its own grooved bill)
  let jaw=null;
  if(ty.patch==='auk'){aukBeak(headAbs);const bd=headAbs.children[headAbs.children.length-1];   // its chest badge belongs on the body, not on the head
    if(bd&&bd.geometry&&bd.geometry.type==='CylinderGeometry'){headAbs.remove(bd);const w=new T.Group();w.position.copy(pkBodyPt(typeKey,.42,.9,.04));w.rotation.y=.42;bd.position.set(0,0,0);bd.rotation.set(Math.PI/2,0,0);w.add(bd);torso.add(w);}}
  else{const bk=pkBeak(typeKey),base=pkHeadPt(0,1.38,.05),bg=new T.Group();bg.position.copy(base);bg.rotation.x=.1;
    const up=new T.Mesh(bk.up,PK_MAT.beak);up.castShadow=true;bg.add(up);
    jaw=new T.Group();jaw.position.y=-bk.S.H*.32;jaw.add(new T.Mesh(bk.lo,PK_MAT.beak));bg.add(jaw);headAbs.add(bg);}
  if(ty.patch==='rock')headAbs.add(new T.Mesh(pkCrestGeo(!hatKey||hatKey==='none'),PK_MAT.vc));
  // flippers
  const fl=[];
  for(const s of[-1,1]){const g=new T.Group();g.position.set(s*.5,.96,0);const m=new T.Mesh(pkFlipperGeo(s,teamKey),PK_MAT.vc);m.castShadow=true;g.add(m);g.rotation.z=s*.28;inner.add(g);fl.push(g);}
  // feet
  const ft=[];
  for(const s of[-1,1]){const g=new T.Group();g.position.set(s*.2,.05,.3);g.add(new T.Mesh(pkFootGeo(typeKey),PK_MAT.vc));inner.add(g);ft.push(g);}
  // tail
  const tail=new T.Group();tail.position.set(0,.17,-.46);tail.rotation.x=.42;tail.add(new T.Mesh(pkTailGeo(ty.tail||1),PK_MAT.vc));inner.add(tail);
  // hat
  const hat=pkHat(goalie?'helmet':hatKey,tc,goalie);headAbs.add(hat);
  // goalie gear
  if(goalie){const pads=new T.Mesh(pkPadsGeo(teamKey),PK_MAT.vc);pads.castShadow=true;inner.add(pads);fl[1].add(new T.Mesh(pkBlockerGeo(teamKey),PK_MAT.vc));fl[0].add(new T.Mesh(pkGloveGeo(teamKey),PK_MAT.vc));}
  // stick (aimed every frame in animatePenguin)
  const stick=new T.Group();stick.add(new T.Mesh(pkStickGeo(teamKey,goalie),PK_MAT.stick));stick.children[0].castShadow=true;inner.add(stick);
  return {root,piv,inner,torso,body,head,headAbs,jaw,tail,stick,flipL:fl[0],flipR:fl[1],footL:ft[0],footR:ft[1],eyeL:eyes[0],eyeR:eyes[1],pupL:pupils[0],pupR:pupils[1],scarfTail,hat,num};
}
// --- animation (same body motion as before + head, beak, tail, breathing, stick) ---
const _pkM=new T.Matrix4(),_pkB=new T.Matrix4(),_pkV=new T.Vector3(),_pkG=new T.Vector3(),_pkU=new T.Vector3(),_pkX=new T.Vector3(),_pkY=new T.Vector3(),_pkZ=new T.Vector3();
function animatePenguin(p,dt,t){
  pkRimUpdate(t);
  const a=p.anim,P=p.pg,sp=Math.hypot(p.vx,p.vz),h=p.heading,fx=Math.sin(h),fz=Math.cos(h),vs=p.vx*fz-p.vz*fx,pose=p.pose;
  if(a.hy===undefined){a.hy=a.hp=a.hr=a.mo=0;a.stk=new T.Vector3(.24,.03,1);}
  let slide=p.goalie?0:smooth(2.6,7.5,sp);if(p.slideT>0)slide=1.1;
  let tg=slide*1.25;if(p.fall>0)tg=1.48;else if(pose==='sad')tg=.5;else if(pose==='cheer')tg=0;
  a.tilt+=(tg-a.tilt)*Math.min(1,dt*9);
  const lean=pose==='play'?clamp(-p.yawRate*.045*clamp(sp/8,0,1.2)-vs*.045,-.55,.55):0;
  let rollT=lean;if(p.goalie&&p.diveT>0)rollT=-p.diveDir*(h>0?-1:1)*1.35;
  a.roll+=(rollT-a.roll)*Math.min(1,dt*(p.diveT>0?14:8));
  const waddle=(1-slide)*clamp(sp/2,0,1)*(p.fall>0?0:1);
  a.phase+=(sp*dt*2.2+dt*(pose==='sad'?1:0));
  const ph=a.phase;
  P.piv.rotation.x=a.tilt+a.swing*.2;
  P.piv.rotation.z=a.roll+Math.sin(ph)*.14*waddle+(pose==='sad'?Math.sin(t*1.5+p.seed)*.04:0);
  P.piv.position.y=lerp(PIV,.55,clamp(a.tilt/1.3,0,1));
  let hop=Math.abs(Math.sin(ph))*.05*waddle;
  if(pose==='cheer'){hop+=Math.abs(Math.sin(t*8+p.seed))*.85;if(p.cheerKind===1)p.heading+=dt*9;}
  P.root.position.set(p.rx,hop,p.rz);P.root.rotation.y=p.heading;
  const acc=Math.hypot(p.ix,p.iz)*(p.fall>0?0:1);a.acc+=(acc-a.acc)*Math.min(1,dt*6);
  // feet
  const fw=p.fall>0?1:waddle,fa=p.fall>0?Math.sin(t*22+p.seed)*.9:Math.sin(ph)*.7*fw;
  P.footL.rotation.x=fa-slide*.2;P.footR.rotation.x=-fa-slide*.2;P.footL.position.y=.05+Math.max(0,Math.sin(ph))*.1*waddle;P.footR.position.y=.05+Math.max(0,-Math.sin(ph))*.1*waddle;
  // flippers
  a.swing=Math.max(0,a.swing-dt*3.4);
  let lx=0,rx=0,lz=-.28,rz=.28;
  const idle=Math.sin(t*1.6+p.seed)*.05;lz-=idle;rz+=idle;
  lx=Math.sin(ph+Math.PI)*.45*waddle;rx=Math.sin(ph)*.45*waddle;
  const back=slide*.45+a.acc*.5*(1-slide*.4);lx+=back;rx+=back;lz-=slide*.55;rz+=slide*.55;
  if(p.fall>0){lx=Math.sin(t*20+p.seed)*1.2;rx=Math.cos(t*20+p.seed)*1.2;lz=-1.2;rz=1.2;}
  if(p.charging){rx=1.1+p.charge*.6;rz=.5;}
  if(a.swing>0)rx=-1.9*Math.pow(a.swing,.6);
  if(pose==='cheer'){const o=2.2+Math.sin(t*14+p.seed)*.5;lz=-o;rz=o;lx=0;rx=0;}
  if(pose==='sad'){lz=-.12;rz=.12;lx=.2;rx=.2;}
  if(p.goalie&&p.diveT>0){lz=-2.2;rz=2.2;}
  P.flipL.rotation.set(lx,0,lz);P.flipR.rotation.set(rx,0,rz);
  // scarf
  const sN=clamp(sp/10,0,1);P.scarfTail.rotation.x=.15+sN*1.15+Math.sin(t*9+p.seed)*.12*sN;P.scarfTail.rotation.z=Math.sin(t*6+p.seed)*.1*sN;
  // eyes
  a.blink-=dt;if(a.blink<=0){a.blinkT=.13;a.blink=rnd(2.5,6);}if(a.blinkT>0)a.blinkT-=dt;
  const sq=pose==='cheer'?.45:(p.fall>0?.35:1);a.eyeSq+=(sq-a.eyeSq)*Math.min(1,dt*10);
  const bl=a.blinkT>0?.1:1,es=a.eyeSq*bl;P.eyeL.scale.y=P.eyeR.scale.y=es;
  const tilt=pose==='sad'?.35:0;P.eyeL.rotation.z=tilt;P.eyeR.rotation.z=-tilt;
  const pk=G.puck,dx=pk.x-p.x,dz=pk.z-p.z,lat=dx*fz-dz*fx,fwd=dx*fx+dz*fz,ang=Math.atan2(lat,fwd);
  // head: follows the puck, counters the waddle, looks up when cheering / down when sad, keeps the face forward while belly-sliding
  if(P.head){
    let yaw=0,pitch=-a.tilt*.42,rl=-Math.sin(ph)*.1*waddle;
    if(p.fall>0){yaw=Math.sin(t*13+p.seed)*.45;pitch=.25;}
    else if(pose==='cheer'){pitch=-.34+Math.sin(t*10+p.seed)*.07;yaw=Math.sin(t*3+p.seed)*.2;}
    else if(pose==='sad'){pitch=.36;rl+=.14;}
    else if(pose==='idle'){yaw=Math.sin(t*.55+p.seed)*.38;pitch+=Math.sin(t*.8+p.seed*2)*.05;}
    else yaw=clamp(ang*.6,-.62,.62);
    const k=Math.min(1,dt*7);a.hy+=(yaw-a.hy)*k;a.hp+=(pitch-a.hp)*k;a.hr+=(rl-a.hr)*k;
    P.head.rotation.set(a.hp,a.hy,a.hr,'YXZ');
  }
  const ox=clamp((ang-(P.head?a.hy:0))*.028,-.034,.034);P.pupL.position.x=ox;P.pupR.position.x=ox;P.pupL.position.y=P.pupR.position.y=pose==='sad'?-.025:0;
  // beak: open when cheering, shouting while charging, gasping when falling
  if(P.jaw){let open=0;if(pose==='cheer')open=.34+Math.sin(t*16+p.seed)*.12;else if(p.fall>0)open=.28;else if(p.charging)open=.1*p.charge;
    a.mo+=(open-a.mo)*Math.min(1,dt*12);P.jaw.rotation.x=a.mo;}
  // tail wag + breathing
  if(P.tail)P.tail.rotation.y=Math.sin(ph*2)*.22*waddle+Math.sin(t*2.3+p.seed)*.06;
  if(P.torso){const br=1+Math.sin(t*2.1+p.seed)*(sp<1?.014:.005);P.torso.scale.set(br,1,br);}
  // hockey stick: grip at the right flipper tip, blade aimed at a target on the ice (stays on the ice while sliding)
  if(P.stick){
    const show=save.set.stick!==false;P.stick.visible=show;
    if(show){
      const s=P.root.scale.x||1;let tx=.24,ty=.03,tz=1.0;
      if(p.goalie){tx=.04;tz=.8;}
      else if(G.carry===p){tx=.06;tz=(p.r+.54)/s-.16;}
      if(p.charging){const c=clamp(p.charge,0,1),w=.4+.6*c;tx=lerp(tx,.75,w);ty=lerp(ty,1.05,w);tz=lerp(tz,-.45,w);}
      if(a.swing>0){const w=Math.pow(a.swing,.6);tx=lerp(tx,-.25,w);ty=lerp(ty,.55,w);tz=lerp(tz,1.45,w);}
      if(pose==='cheer'){tx=.25;ty=2.6;tz=.35;}else if(pose==='sad'){tx=.3;ty=.03;tz=.7;}
      if(p.fall>0){tx=1.4;ty=.03;tz=1.1;}
      const k=Math.min(1,dt*14);a.stk.x+=(tx-a.stk.x)*k;a.stk.y+=(ty-a.stk.y)*k;a.stk.z+=(tz-a.stk.z)*k;
      P.piv.updateMatrix();P.inner.updateMatrix();P.flipR.updateMatrix();
      _pkM.multiplyMatrices(P.piv.matrix,P.inner.matrix).invert();
      _pkV.copy(a.stk).applyMatrix4(_pkM);
      _pkU.set(0,1,0).transformDirection(_pkM);
      _pkG.set(0,-.34,.03).applyMatrix4(P.flipR.matrix);
      _pkZ.subVectors(_pkV,_pkG);if(_pkZ.lengthSq()<1e-6)_pkZ.set(0,-.6,.8);_pkZ.normalize();
      _pkY.copy(_pkU).addScaledVector(_pkZ,-_pkU.dot(_pkZ));if(_pkY.lengthSq()<1e-6)_pkY.set(0,0,-1);_pkY.normalize();
      _pkX.crossVectors(_pkY,_pkZ);
      _pkB.makeBasis(_pkX,_pkY,_pkZ);P.stick.quaternion.setFromRotationMatrix(_pkB);
      P.stick.position.copy(_pkG).addScaledVector(_pkZ,-.3);
    }
  }
}

// --- crowd penguins: one sculpted, vertex-coloured silhouette instead of three spheres (built during start-up: only uses T) ---
function crowdBodyGeo(){
  if(crowdBodyGeo.g)return crowdBodyGeo.g;
  const cv=new T.SplineCurve([[0,0],[.27,.006],[.42,.2],[.49,.4],[.52,.66],[.495,.9],[.43,1.1],[.36,1.2],[.29,1.28],[.272,1.36],[.268,1.42],[.24,1.5],[.16,1.6],[.001,1.65]].map(q=>new T.Vector2(q[0],q[1])));
  return crowdBodyGeo.g=pkSurf(16,16,(u,v,o)=>{const q=cv.getPointAt(v),th=u*Math.PI*2,r=Math.max(q.x,.001);o[0]=r*Math.sin(th);o[1]=q.y;o[2]=r*Math.cos(th)+(q.y>1.22?.03*Math.min(1,(q.y-1.22)/.12):0);},
    (u,v,o,c)=>{const a=Math.abs(Math.atan2(o[0],o[2])),y=o[1],half=y<.3?2.4:y<1.0?1.45-(y-.3)*.45:1.13,wh=Math.min(1,Math.max(0,(half+.1-a)/.2))*(y<1.06?1:0),k=.05+.89*wh;
      c[0]=k;c[1]=k+.006*wh+.008*(1-wh);c[2]=k+.025*wh+.03*(1-wh);},1,1,[true,true]);
}
