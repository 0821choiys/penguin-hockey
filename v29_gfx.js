/* ================= v29: graphics spec up — sharper shadows, smoother penguins ================= */
// Shadows: the sun's shadow camera used to cover a fixed 80×64 m square around the camera with one 2048² map (≈4 cm per
// shadow texel: blocky, blotchy edges). Now the map is 4096² on 최고 / 3072² on 높음 / 1024² on 절전 (capped by the GPU), and
// the shadow camera covers only what the camera sees of the rink, boards, benches and spectator rows:
//  · the view's ground footprint (screen rays → y=0 and y=top of the box, clamped to the box) seen from the sun,
//  · a square of one of a few fixed sizes (so texels keep their size while the camera pans: no shimmering),
//    grown at once when needed, shrunk only after ~0.5 s; its centre snapped to whole texels,
//  · depth range from the whole box, so everything that can throw a shadow into the view still does.
const SH_BOX={x:W+9.6,z:D+9.4,y:5.5};   // spectators stand up to |x|≈W+8.5, |z|≈D+8.3; skill props reach ~5 m up
const SH_LV=[16,22,30,40,54,72,96];
function shMapSize(){
  const q=save.set.quality,mx=(renderer.capabilities&&renderer.capabilities.maxTextureSize)||4096;
  let z=q==='low'?1024:q==='ultra'?4096:3072;
  if(typeof perf!=='undefined'&&perf.scale<.85)z=Math.max(1024,z/2);   // the device is struggling (auto step-down): half the shadow map too
  return Math.min(mx,z);
}
function shState(){return shState.s||(shState.s={key:'',inv:new T.Matrix4(),v:new T.Vector3(),d:new T.Vector3(),o:new T.Vector3(),
  full:null,L:0,shrink:0,texel:0,size:0,cx:0,cy:0});}
function shFoot(S){   // light-space bbox of the visible part of the box, or null
  const v=S.v,d=S.d,o=S.o,inv=S.inv;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,n=0;
  camera.updateMatrixWorld();o.setFromMatrixPosition(camera.matrixWorld);
  for(let i=0;i<=4;i++)for(let j=0;j<=4;j++){
    d.set(i/2-1,j/2-1,.5).unproject(camera).sub(o).normalize();
    for(const py of[0,SH_BOX.y]){
      let t;if(d.y<-1e-4)t=(py-o.y)/d.y;else t=-1;
      if(!(t>0))t=160;   // looking above the horizon: go out to the far edge of the box
      v.copy(o).addScaledVector(d,Math.min(t,160));
      v.x=clamp(v.x,-SH_BOX.x,SH_BOX.x);v.z=clamp(v.z,-SH_BOX.z,SH_BOX.z);v.y=py;
      v.applyMatrix4(inv);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);n++;}
  }
  return n?{x0,x1,y0,y1}:null;
}
function shFit(){
  const S=shState(),c=sun.shadow.camera,ms=sun.shadow.mapSize.x;
  sun.target.position.set(0,0,0);sun.position.copy(sunDir).multiplyScalar(100);
  const key=sunDir.x.toFixed(3)+','+sunDir.y.toFixed(3)+','+sunDir.z.toFixed(3);
  if(key!==S.key){   // the sun moved: new light orientation, whole-box extents and depth range
    S.key=key;c.position.copy(sun.position);c.lookAt(sun.target.position);c.updateMatrixWorld(true);S.inv.copy(c.matrixWorldInverse);
    const v=S.v;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
    for(const x of[-SH_BOX.x,SH_BOX.x])for(const y of[0,SH_BOX.y])for(const z of[-SH_BOX.z,SH_BOX.z]){
      v.set(x,y,z).applyMatrix4(S.inv);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);z0=Math.min(z0,v.z);z1=Math.max(z1,v.z);}
    S.full={x0,x1,y0,y1};c.near=Math.max(.5,-z1-8);c.far=-z0+8;S.L=0;
  }
  const F=S.full,fullSz=Math.max(F.x1-F.x0,F.y1-F.y0)+1;
  let b=G.view==='game'?shFoot(S):null;if(!b)b=F;
  const need=Math.max(b.x1-b.x0,b.y1-b.y0)*1.08+1.5;
  let L=SH_LV.find(l=>l>=need)||fullSz;L=Math.min(L,fullSz);
  if(L>S.L||!S.L){S.L=L;S.shrink=0;}else if(L<S.L){if(++S.shrink>30){S.L=L;S.shrink=0;}}else S.shrink=0;
  const size=S.L,tx=size/ms;
  // centre on the view, kept inside the box where possible, snapped to whole texels
  let cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;
  if(size<F.x1-F.x0)cx=clamp(cx,F.x0+size/2,F.x1-size/2);else cx=(F.x0+F.x1)/2;
  if(size<F.y1-F.y0)cy=clamp(cy,F.y0+size/2,F.y1-size/2);else cy=(F.y0+F.y1)/2;
  cx=Math.round(cx/tx)*tx;cy=Math.round(cy/tx)*tx;
  if(size!==S.size||cx!==S.cx||cy!==S.cy){S.size=size;S.cx=cx;S.cy=cy;
    c.left=cx-size/2;c.right=cx+size/2;c.bottom=cy-size/2;c.top=cy+size/2;c.updateProjectionMatrix();}
  S.texel=tx;
  // finer texels need less push: about 1.5 texels along the normal, a tiny depth bias
  sun.shadow.normalBias=Math.max(.008,tx*1.5);sun.shadow.bias=-.0003;
}

// Smoother penguins on 최고: every curved part of the penguin model (body, head, sweater, scarf, hats, beak, eyes, feet …)
// gets about 1.6× the segments. Geometry is cached per quality, so 높음 / 절전 keep their current meshes.
function pkHi(){return save.set.quality==='ultra';}
function pkS(n){return pkHi()?Math.max(n+2,Math.round(n*1.6)):n;}
