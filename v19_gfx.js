/* ================= v19 graphics: mirror ice, light bloom + colour grade, contact shadows, automatic step-down ================= */
// 설정 › 그래픽
//   최고 (ultra) : ice reflections at ½ resolution + glow bloom, colour grade and vignette through an anti-aliased off-screen buffer
//   높음 (high)  : ice reflections at ⅓ resolution, drawn straight to the screen
//   절약 (low)   : no extra passes (the v18 image)
// A device that keeps running below ~38 fps steps down by itself (최고 → 높음 → no reflections) before the older resolution /
// shadow fallbacks start; the saved setting is never changed by that. If an off-screen buffer reads back black (some GPUs fail
// there), that effect switches itself off for the session.
const GFX={drop:0,bad:{},chk:{},n:0,tier:-1,sceneN:-1,tagT:0};
const gfxWant=()=>save.set.quality==='ultra'?2:save.set.quality==='high'?1:0;
function gfxTier(){return Math.max(0,gfxWant()-GFX.drop);}
const GLOW_L=3;   // render layer of things that shine: lamp lenses, goal lights, string lights, LED ribbons, scoreboard, aurora, sun/moon

/* ---------- 1. mirror ice: the scene seen from below the ice plane, blended into the ice with a Fresnel term ---------- */
const RFL={rt:null,cam:new T.PerspectiveCamera(),hide:[],used:0,
  u:{tRefl:{value:null},uRM:{value:new T.Matrix4()},uRK:{value:0},uRPx:{value:new T.Vector2(1/512,1/512)},uNP:{value:0}},
  cp:new T.Vector3(),la:new T.Vector3(),up:new T.Vector3(0,1,0),rot:new T.Matrix4(),pl:new T.Plane(),clip:new T.Vector4(),q:new T.Vector4(),bb:new T.Box3(),sz:new T.Vector2(),
  iceW:new T.Color(1.0,1.04,1.1),iceN:new T.Color(.88,.92,1.0),tw:new T.Color(),bias:new T.Matrix4().set(.5,0,0,.5, 0,.5,0,.5, 0,0,.5,.5, 0,0,0,1)};
{const d=new T.DataTexture(new Uint8Array([214,230,245,255]),1,1,T.RGBAFormat);d.needsUpdate=true;RFL.dummy=d;RFL.u.tRefl.value=d;}
// the ice keeps its own look; the reflection is mixed in after tone mapping (the reflection buffer is already tone-mapped)
const ICE_RFL_FRAG=`
#ifdef ICE_RFL
{
  vec2 ruv=vRP.xy/vRP.w;
  // skate-scuffed ice is never a perfect mirror: a soft world-space ripple plus a 5-tap blur
  vec2 wob=vec2(sin(vIW.x*6.3+vIW.y*2.9)+sin(vIW.y*12.7-vIW.x*4.1),cos(vIW.y*5.7-vIW.x*2.3)+sin(vIW.x*10.9+vIW.y*7.7))*uRPx*1.1;
  vec2 o=uRPx*1.6;
  vec3 rc=texture2D(tRefl,ruv+wob).rgb*.36
    +(texture2D(tRefl,ruv+wob+vec2(o.x,o.y)).rgb+texture2D(tRefl,ruv+wob+vec2(-o.x,o.y)).rgb
     +texture2D(tRefl,ruv+wob+vec2(o.x,-o.y)).rgb+texture2D(tRefl,ruv+wob+vec2(-o.x,-o.y)).rgb)*.16;
  float cs=clamp(dot(normalize(vViewPosition),normalize(normal)),0.0,1.0);
  float fr=uRK*(.52+.48*pow(1.0-cs,1.6));
  gl_FragColor.rgb=mix(gl_FragColor.rgb,rc,fr);
  // night: the four floodlights aim near centre ice, so the ends of the rink fall off into softer light
  if(uNP>0.0){float pl=0.0;
    pl+=exp(-dot(vIW-vec2( 4.9, 3.1),vIW-vec2( 4.9, 3.1))*.0062);pl+=exp(-dot(vIW-vec2(-4.9, 3.1),vIW-vec2(-4.9, 3.1))*.0062);
    pl+=exp(-dot(vIW-vec2( 4.9,-3.1),vIW-vec2( 4.9,-3.1))*.0062);pl+=exp(-dot(vIW-vec2(-4.9,-3.1),vIW-vec2(-4.9,-3.1))*.0062);
    gl_FragColor.rgb*=mix(1.0,.84+.2*clamp(pl*.42,0.0,1.0),uNP);}
}
#endif
`;
iceMat.onBeforeCompile=sh=>{
  sh.uniforms.tRefl=RFL.u.tRefl;sh.uniforms.uRM=RFL.u.uRM;sh.uniforms.uRK=RFL.u.uRK;sh.uniforms.uRPx=RFL.u.uRPx;sh.uniforms.uNP=RFL.u.uNP;
  sh.vertexShader='uniform mat4 uRM;\nvarying vec4 vRP;\nvarying vec2 vIW;\n'+sh.vertexShader.replace('#include <fog_vertex>',
    '#include <fog_vertex>\n{vec4 iw=modelMatrix*vec4(transformed,1.0);vRP=uRM*iw;vIW=iw.xz;}');
  sh.fragmentShader='uniform sampler2D tRefl;\nuniform float uRK,uNP;\nuniform vec2 uRPx;\nvarying vec4 vRP;\nvarying vec2 vIW;\n'+
    sh.fragmentShader.replace('#include <tonemapping_fragment>','#include <tonemapping_fragment>\n'+ICE_RFL_FRAG);
};
iceMat.customProgramCacheKey=()=>'ice19';
// what the mirror leaves out: everything lying flat on the ice (it would only cover its own reflection; the puck stays), the far landscape and
// the crowd (half of all triangles, mostly hidden behind the boards in the mirror image anyway)
function rflHideList(){
  const out=[],bb=RFL.bb;
  scene.traverse(o=>{
    if(o===scene||!(o.isMesh||o.isSprite||o.isPoints||o.isLine))return;
    if(o.isPoints){out.push(o);return;}   // snow, sparks and stars: tiny points smear into blotches in the blurred mirror
    if(o.userData.noRefl||o.userData.crowd||o===ocean||o.material===bergMat){out.push(o);return;}
    if(o.isMesh&&!o.isInstancedMesh&&o.geometry){   // flat decals / rings (measured once per object: they only ever slide over the ice)
      let fl=o.userData.__flat;if(fl===undefined){bb.setFromObject(o);fl=o.userData.__flat=(bb.max.y-bb.min.y<.035&&bb.max.y<.1&&bb.min.y>-.6);}
      if(fl)out.push(o);}
  });
  out.push(aimLine);
  for(const f of floaters)if(f.m&&!out.includes(f.m))out.push(f.m);
  for(const c of clouds)if(c.s&&!out.includes(c.s))out.push(c.s);
  RFL.hide=out;
}
function rflPass(tier){
  const cp=RFL.cp.setFromMatrixPosition(camera.matrixWorld);
  if(cp.y<=.05){RFL.u.uRK.value=0;return;}
  renderer.getDrawingBufferSize(RFL.sz);
  const k=tier>=2?.5:.34,w=Math.max(8,Math.round(RFL.sz.x*k)),h=Math.max(8,Math.round(RFL.sz.y*k));
  if(!RFL.rt){RFL.rt=new T.WebGLRenderTarget(w,h,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat,stencilBuffer:false});RFL.rt.texture.generateMipmaps=false;}
  else if(RFL.rt.width!==w||RFL.rt.height!==h)RFL.rt.setSize(w,h);
  RFL.u.tRefl.value=RFL.rt.texture;RFL.u.uRPx.value.set(1/w,1/h);
  // virtual camera mirrored in y=0 (same construction as three's Reflector, plane normal +y)
  const C=RFL.cam;RFL.rot.extractRotation(camera.matrixWorld);
  const la=RFL.la.set(0,0,-1).applyMatrix4(RFL.rot).add(cp);
  C.position.set(cp.x,-cp.y,cp.z);C.up.set(0,1,0).applyMatrix4(RFL.rot);C.up.y=-C.up.y;C.lookAt(la.x,-la.y,la.z);
  C.far=camera.far;C.near=camera.near;C.updateMatrixWorld();C.matrixWorldInverse.copy(C.matrixWorld).invert();C.projectionMatrix.copy(camera.projectionMatrix);
  RFL.u.uRM.value.copy(RFL.bias).multiply(C.projectionMatrix).multiply(C.matrixWorldInverse);
  // oblique near plane = the ice, so nothing under the ice ends up in the mirror
  RFL.pl.set(RFL.up,-.004).applyMatrix4(C.matrixWorldInverse);
  const cl=RFL.clip.set(RFL.pl.normal.x,RFL.pl.normal.y,RFL.pl.normal.z,RFL.pl.constant),P=C.projectionMatrix.elements,q=RFL.q;
  q.x=(Math.sign(cl.x)+P[8])/P[0];q.y=(Math.sign(cl.y)+P[9])/P[5];q.z=-1;q.w=(1+P[10])/P[14];
  cl.multiplyScalar(2/cl.dot(q));P[2]=cl.x;P[6]=cl.y;P[10]=cl.z+1;P[14]=cl.w;
  // draw (shadows are reused from the previous frame)
  const hide=RFL.hide;for(const o of hide){o.userData.__v=o.visible;o.visible=false;}
  const sv=sunSpr.visible;sunSpr.visible=false;   // the sun's halo would only smear a hazy patch over the ice
  // the mirrored sky is pulled toward the colour of lit ice (white by day, floodlit blue-grey by night), so open ice stays
  // clean and only the things above it (skaters, goals, boards, lamps, aurora) really show in the mirror
  const night=smooth(.45,.85,G.tod),sk=RFL.sk||(RFL.sk=[new T.Color(),new T.Color(),new T.Color()]),SU=[skyU.topC.value,skyU.midC.value,skyU.horC.value];
  RFL.tw.copy(RFL.iceW).lerp(RFL.iceN,night);const amt=lerp(.78,.62,night);
  for(let i=0;i<3;i++){sk[i].copy(SU[i]);SU[i].lerp(RFL.tw,amt);}
  const sm=renderer.shadowMap,au=sm.autoUpdate;sm.autoUpdate=false;sm.needsUpdate=false;
  renderer.setRenderTarget(RFL.rt);renderer.clear();renderer.render(scene,C);renderer.setRenderTarget(null);
  sm.autoUpdate=au;for(const o of hide)o.visible=o.userData.__v;sunSpr.visible=sv;
  for(let i=0;i<3;i++)SU[i].copy(sk[i]);
  // strength: glassier on thin ice (빙판 변수)
  const thin=CV?CV.thin:0;
  RFL.u.uRK.value=(tier>=2?.4:.34)*(1+.5*thin);RFL.u.uNP.value=smooth(.55,.92,G.tod)*(G.view==='game'?1:.6);
  RFL.used++;
}

/* ---------- 2. contact shadows: a soft dark pool under every skater and the puck (one instanced draw) ---------- */
const CSH={m:null,o:new T.Object3D(),c:new T.Color()};
{const geo=new T.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);
  const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,fog:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,
    uniforms:{uO:{value:.5}},
    vertexShader:'varying vec2 vUv;varying float vK;void main(){vUv=uv;vK=1.0;\n#ifdef USE_INSTANCING_COLOR\nvK=instanceColor.r;\n#endif\n#ifdef USE_INSTANCING\ngl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);\n#else\ngl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);\n#endif\n}',
    fragmentShader:'uniform float uO;varying vec2 vUv;varying float vK;void main(){float d=length(vUv-.5)*2.0;float a=1.0-smoothstep(0.0,1.0,d);a=a*a*(.55+.45*a);gl_FragColor=vec4(.02,.05,.09,a*uO*vK);}'});
  CSH.m=new T.InstancedMesh(geo,mat,24);CSH.m.count=0;CSH.m.frustumCulled=false;CSH.m.renderOrder=1;CSH.m.userData.noRefl=1;
  CSH.m.setColorAt(0,CSH.c.setRGB(1,1,1));scene.add(CSH.m);}
function cshFrame(on){
  const m=CSH.m;m.visible=on&&G.view!=='select';if(!m.visible)return;
  let n=0;const o=CSH.o;
  const put=(x,z,s,k)=>{if(n>=24||k<=.02)return;o.position.set(x,.011,z);o.rotation.set(0,0,0);o.scale.set(s,1,s);o.updateMatrix();m.setMatrixAt(n,o.matrix);m.setColorAt(n,CSH.c.setRGB(k,k,k));n++;};
  for(const p of G.pengs){if(!p.pg||!p.pg.root.visible||p.frozen)continue;const up=Math.max(0,p.pg.root.position.y);
    put(p.rx,p.rz,(p.r||.5)*3.1*(1+up*.4),(p.fall>0?.75:1)*(1-clamp(up/1.3,0,.85)));}
  if(G.puck&&puckG.visible)put(G.puck.rx,G.puck.rz,1.05,.8);
  m.count=n;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;
  // darker pools at night when the moon shadow is faint
  m.material.uniforms.uO.value=lerp(.42,.6,smooth(.4,.9,G.tod));
}

/* ---------- 3. post: MSAA scene buffer -> glow bloom (lights only) -> grade, vignette, dither ---------- */
const PP={rt:null,g1:null,g2:null,g3:null,g4:null,w:0,h:0,used:0,cam:new T.OrthographicCamera(-1,1,1,-1,0,1),sc:new T.Scene(),sz:new T.Vector2(),cc:new T.Color(),ms:false};
const PP_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
PP.blur=new T.ShaderMaterial({uniforms:{tD:{value:null},uDir:{value:new T.Vector2()}},vertexShader:PP_VS,depthTest:false,depthWrite:false,toneMapped:false,
  fragmentShader:'uniform sampler2D tD;uniform vec2 uDir;varying vec2 vUv;void main(){vec3 c=texture2D(tD,vUv).rgb*.2270270;'+
    'c+=(texture2D(tD,vUv+uDir*1.3846154).rgb+texture2D(tD,vUv-uDir*1.3846154).rgb)*.3162162;'+
    'c+=(texture2D(tD,vUv+uDir*3.2307692).rgb+texture2D(tD,vUv-uDir*3.2307692).rgb)*.0702703;gl_FragColor=vec4(c,1.0);}'});
PP.comp=new T.ShaderMaterial({uniforms:{tS:{value:null},tA:{value:null},tB:{value:null},uPx:{value:new T.Vector2()},uBK:{value:.5},uVig:{value:.22},uSat:{value:1.08},uCon:{value:.16}},
  vertexShader:PP_VS,depthTest:false,depthWrite:false,toneMapped:false,
  fragmentShader:`uniform sampler2D tS,tA,tB;uniform vec2 uPx;uniform float uBK,uVig,uSat,uCon;varying vec2 vUv;
#ifdef PP_FXAA
vec3 fxaa(vec2 uv){   // WebGL1 has no MSAA buffers: classic FXAA on the scene image instead
  vec3 L=vec3(.299,.587,.114);
  vec3 nw=texture2D(tS,uv+vec2(-1.,-1.)*uPx).rgb,ne=texture2D(tS,uv+vec2(1.,-1.)*uPx).rgb,sw=texture2D(tS,uv+vec2(-1.,1.)*uPx).rgb,se=texture2D(tS,uv+vec2(1.,1.)*uPx).rgb,m=texture2D(tS,uv).rgb;
  float a=dot(nw,L),b=dot(ne,L),c=dot(sw,L),d=dot(se,L),e=dot(m,L),lo=min(e,min(min(a,b),min(c,d))),hi=max(e,max(max(a,b),max(c,d)));
  vec2 dir=vec2(-((a+b)-(c+d)),((a+c)-(b+d)));float red=max((a+b+c+d)*.03125,1./128.),rcp=1./(min(abs(dir.x),abs(dir.y))+red);
  dir=clamp(dir*rcp,-8.,8.)*uPx;
  vec3 A=.5*(texture2D(tS,uv+dir*(1./3.-.5)).rgb+texture2D(tS,uv+dir*(2./3.-.5)).rgb);
  vec3 B=A*.5+.25*(texture2D(tS,uv-dir*.5).rgb+texture2D(tS,uv+dir*.5).rgb);float lb=dot(B,L);
  return (lb<lo||lb>hi)?A:B;}
#endif
void main(){
#ifdef PP_FXAA
  vec3 c=fxaa(vUv);
#else
  vec3 c=texture2D(tS,vUv).rgb;
#endif
  vec3 g=texture2D(tA,vUv).rgb*.7+texture2D(tB,vUv).rgb*1.1;
  c+=g*uBK*(1.0-.45*c);                                        // light bloom, softer on already-bright pixels
  float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,uSat);   // a little more colour
  c=clamp(c,0.0,1.0);c=mix(c,c*c*(3.0-2.0*c),uCon);              // gentle S-curve contrast
  vec2 q=vUv-.5;c*=1.0-uVig*smoothstep(.12,.55,dot(q,q)*1.8);     // vignette
  c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.0;   // dither (no banding in sky gradients)
  gl_FragColor=vec4(c,1.0);
}`});
PP.quad=new T.Mesh(new T.PlaneGeometry(2,2),PP.comp);PP.quad.frustumCulled=false;PP.sc.add(PP.quad);
function ppFree(){for(const k of['rt','g1','g2','g3','g4'])if(PP[k]){PP[k].dispose();PP[k]=null;}PP.w=PP.h=0;}
function ppAlloc(w,h){
  ppFree();PP.w=w;PP.h=h;const o={minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat,stencilBuffer:false};
  PP.ms=!!(renderer.capabilities.isWebGL2&&T.WebGLMultisampleRenderTarget);
  PP.rt=PP.ms?new T.WebGLMultisampleRenderTarget(w,h,o):new T.WebGLRenderTarget(w,h,o);if(PP.ms)PP.rt.samples=4;PP.rt.texture.generateMipmaps=false;
  const q=(d)=>{const r=new T.WebGLRenderTarget(Math.max(4,Math.round(w/d)),Math.max(4,Math.round(h/d)),Object.assign({depthBuffer:false},o));r.texture.generateMipmaps=false;return r;};
  PP.g1=q(4);PP.g2=q(4);PP.g3=q(8);PP.g4=q(8);
  const fx=!PP.ms;if(fx!==('PP_FXAA' in PP.comp.defines)){if(fx)PP.comp.defines.PP_FXAA='';else delete PP.comp.defines.PP_FXAA;PP.comp.needsUpdate=true;}
}
function ppPass(mat,target){PP.quad.material=mat;renderer.setRenderTarget(target);renderer.render(PP.sc,PP.cam);}
function ppRender(){
  renderer.getDrawingBufferSize(PP.sz);const w=PP.sz.x,h=PP.sz.y;
  if(!PP.rt||PP.w!==w||PP.h!==h)ppAlloc(w,h);
  renderer.setRenderTarget(PP.rt);renderer.render(scene,camera);
  // glow pass: only the GLOW_L layer, quarter resolution, on black
  const sm=renderer.shadowMap,au=sm.autoUpdate;sm.autoUpdate=false;sm.needsUpdate=false;
  const mask=camera.layers.mask;camera.layers.set(GLOW_L);renderer.getClearColor(PP.cc);const ca=renderer.getClearAlpha();renderer.setClearColor(0x000000,1);
  renderer.setRenderTarget(PP.g1);renderer.clear();renderer.render(scene,camera);
  camera.layers.mask=mask;renderer.setClearColor(PP.cc,ca);sm.autoUpdate=au;
  const B=PP.blur.uniforms;
  B.tD.value=PP.g1.texture;B.uDir.value.set(1/PP.g1.width,0);ppPass(PP.blur,PP.g2);
  B.tD.value=PP.g2.texture;B.uDir.value.set(0,1/PP.g1.height);ppPass(PP.blur,PP.g1);
  B.tD.value=PP.g1.texture;B.uDir.value.set(2/PP.g1.width,0);ppPass(PP.blur,PP.g3);
  B.tD.value=PP.g3.texture;B.uDir.value.set(0,1/PP.g3.height);ppPass(PP.blur,PP.g4);
  const U=PP.comp.uniforms,night=smooth(.4,.9,G.tod);
  U.tS.value=PP.rt.texture;U.tA.value=PP.g1.texture;U.tB.value=PP.g4.texture;U.uPx.value.set(1/w,1/h);
  U.uBK.value=lerp(.45,.9,night);U.uVig.value=lerp(.2,.3,night);U.uCon.value=lerp(.16,.22,night);
  ppPass(PP.comp,null);
  PP.used++;return true;
}
// glow layer membership (rebuilt when the scene changes: arena decor, new match)
function gfxTag(){
  const add=o=>{if(o)o.layers.enable(GLOW_L);};
  for(const l of lamps)add(l.bulb);   // the lens only: its sprite halo is already a glow
  if(RK){for(const g of RK.goalLights){add(g.dome);add(g.glow);}
    for(const b of RK.bulbs||[])b.g.traverse(o=>{if(o.isInstancedMesh)add(o);});
    if(RK.sb)RK.sb.traverse(o=>{if(o.isMesh&&o.material&&o.material.map===RK.sbT)add(o);});}
  add(sunSpr);add(moonSpr);   // (the aurora stays out: as a glow it hazes the whole sky)
  arenaG.traverse(o=>{if(o.isInstancedMesh&&o.material===ledMat)add(o);});
  add(puckTrail);
}

/* ---------- 4. tier switching, safety check, the frame ---------- */
function gfxApply(){
  const t=gfxTier();GFX.tier=t;
  const rf=t>=1&&!GFX.bad.refl,has='ICE_RFL' in iceMat.defines;
  if(rf!==has){if(rf)iceMat.defines.ICE_RFL='';else delete iceMat.defines.ICE_RFL;iceMat.needsUpdate=true;}
  if(!rf){RFL.u.tRefl.value=RFL.dummy;if(RFL.rt){RFL.rt.dispose();RFL.rt=null;}}
  if(t<2||GFX.bad.post)ppFree();
}
function gfxStepDown(){if(gfxTier()<=0)return false;GFX.drop++;gfxApply();return true;}
function rtLit(rt){   // false = the buffer came back black where the sky / ice must be
  try{const b=new Uint8Array(4);let lit=0;for(const [fx,fy] of[[.5,.5],[.3,.7],[.7,.3],[.5,.85],[.5,.15]]){renderer.readRenderTargetPixels(rt,Math.floor(rt.width*fx),Math.floor(rt.height*fy),1,1,b);if(b[0]+b[1]+b[2]>6)lit++;}return lit>0;}catch(e){return true;}}
function gfxCheck(){
  if(!GFX.chk.refl&&RFL.rt&&RFL.used>=3){GFX.chk.refl=1;if(!rtLit(RFL.rt)){GFX.bad.refl=true;gfxApply();}}
  if(!GFX.chk.post&&PP.rt&&PP.used>=3){GFX.chk.post=1;if(!rtLit(PP.rt)){GFX.bad.post=true;gfxApply();}}
}
function gfxRender(){
  const t=gfxTier();if(t!==GFX.tier)gfxApply();
  GFX.n++;
  if(t>=1&&(scene.children.length!==GFX.sceneN||GFX.n-GFX.tagT>90)){GFX.sceneN=scene.children.length;GFX.tagT=GFX.n;rflHideList();gfxTag();}
  cshFrame(t>=1);
  // night: the floodlit ice no longer washes out (a little less exposure; the bloom and mirror carry the lights instead)
  const ex=renderer.toneMappingExposure;if(t>=1)renderer.toneMappingExposure=ex*(1-.08*smooth(.6,.95,G.tod));
  camera.updateMatrixWorld();
  if(t>=1&&!GFX.bad.refl)rflPass(t);
  if(!(t>=2&&!GFX.bad.post&&ppRender())){renderer.setRenderTarget(null);renderer.render(scene,camera);}
  renderer.toneMappingExposure=ex;   // setTOD owns the base value
  gfxCheck();
}
