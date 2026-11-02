
/* ================= v13 rink: painted ice, dasher boards with ads, glass, goal lights, light towers, scoreboard, benches, flags ================= */
// Everything here is either a hoisted function or runs from rinkDecor() after the crowd exists, so the start-up order stays valid.
var RK;   // filled by rinkDecor()
const rkLo=()=>save.set.quality==='low';
let rkSeed=11;const rkR=()=>{rkSeed=(rkSeed*16807)%2147483647;return rkSeed/2147483647;};
// ---- path around the boards: rounded rectangle, parameterised by arc length (far side first, like perimeter()) ----
function rinkPath(){
  const L1=2*(W-CR),L2=2*(D-CR),LA=CR*Math.PI/2,P=[[0,L1],[1,LA],[2,L2],[3,LA],[4,L1],[5,LA],[6,L2],[7,LA]],total=2*L1+2*L2+4*LA;
  function at(s){s=((s%total)+total)%total;for(const [k,len] of P){if(s<=len+1e-9){return piece(k,s);}s-=len;}return piece(7,LA);}
  function piece(k,s){
    if(k===0)return{x:-W+CR+s,z:-D,nx:0,nz:-1};
    if(k===2)return{x:W,z:-D+CR+s,nx:1,nz:0};
    if(k===4)return{x:W-CR-s,z:D,nx:0,nz:1};
    if(k===6)return{x:-W,z:D-CR-s,nx:-1,nz:0};
    const c=k===1?[W-CR,-D+CR,-Math.PI/2]:k===3?[W-CR,D-CR,0]:k===5?[-W+CR,D-CR,Math.PI/2]:[-W+CR,-D+CR,Math.PI];
    const a=c[2]+s/CR,nx=Math.cos(a),nz=Math.sin(a);return{x:c[0]+nx*CR,z:c[1]+nz*CR,nx,nz};
  }
  return{total,at};
}
// ---- board loop: the rink outline with a goal bay wrapped around each net, so the boards never stop at a loose end ----
// bay side walls run at |z|=zi just outside the posts, the back wall at |x|=W+xb just behind the net; samples closer than 'cut' to a
// concave corner are dropped so the thick board profile never folds over itself (corners use a mitre vector mx/mz for offsets)
const RK_BAY={zi:GW+.2,xb:GD+.25,cut:.62};
function rinkLoop(ds){
  const rp=rinkPath(),pts=[],zi=RK_BAY.zi,xb=W+RK_BAY.xb,cut=RK_BAY.cut;
  const push=(x,z,nx,nz,mx,mz,bay,cor)=>{const q=pts[pts.length-1],s=q?q.s+Math.hypot(x-q.x,z-q.z):0;pts.push({x,z,nx,nz,mx:mx==null?nx:mx,mz:mz==null?nz:mz,s,bay:!!bay,cor:!!cor});};
  const line=(x0,z0,x1,z1,n,c0,c1)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.max(c0,ds*.5),b=L-Math.max(c1,ds*.5);if(b<a)return;const k=Math.max(1,Math.round((b-a)/ds));
    for(let i=0;i<=k;i++){const t=(a+(b-a)*i/k)/L;push(x0+(x1-x0)*t,z0+(z1-z0)*t,n[0],n[1],null,null,true);}};
  const corner=(x,z,n1,n2)=>{const mx=n1[0]+n2[0],mz=n1[1]+n2[1];push(x,z,n1[0],n1[1],mx,mz,true,true);push(x,z,n2[0],n2[1],mx,mz,true,true);};
  const bay=sx=>{const xm=sx*W,xo=sx*xb,z0=-sx*zi,z1=sx*zi,nm=[sx,0],nA=[0,-sx],nB=[0,sx];
    corner(xm,z0,nm,nA);line(xm,z0,xo,z0,nA,cut,0);corner(xo,z0,nA,nm);line(xo,z0,xo,z1,nm,0,0);corner(xo,z1,nm,nB);line(xo,z1,xm,z1,nB,0,cut);corner(xm,z1,nB,nm);};
  const n=Math.ceil(rp.total/ds),done={};
  for(let i=0;i<=n;i++){const s=Math.min(i*ds,rp.total),p=rp.at(s);
    if(Math.abs(p.x)>W-.01&&Math.abs(p.z)<zi+cut){const sx=p.x>0?1:-1;if(!done[sx]){done[sx]=1;bay(sx);}continue;}
    push(p.x,p.z,p.nx,p.nz);}
  return pts;
}
function rinkRuns(ds){return [rinkLoop(ds)];}   // kept for callers/tests: the boards are now a single closed run
// extrude a profile [[offset,y],...] along runs; one smooth strip per profile edge
function rinkExtrude(runs,prof,uvFn){
  const pos=[],nor=[],uv=[],idx=[];
  for(const run of runs)for(let f=0;f<prof.length-1;f++){
    const a=prof[f],b=prof[f+1],base=pos.length/3,dy=b[1]-a[1],doff=b[0]-a[0],l=Math.hypot(dy,doff)||1;
    // face normal in (offset,y) space: the profile edge rotated by +90deg (profiles run inner -> outer)
    const fo=-dy/l,fy=doff/l;
    for(let i=0;i<run.length;i++){const p=run[i];
      for(const q of[a,b]){pos.push(p.x+(p.mx!=null?p.mx:p.nx)*q[0],q[1],p.z+(p.mz!=null?p.mz:p.nz)*q[0]);nor.push(p.nx*fo,fy,p.nz*fo);uv.push(uvFn?uvFn(p,q,i):p.s/4,q[1]);}}
    for(let i=0;i<run.length-1;i++){const k=base+i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);
  return g;
}
// ---- ice: crisp hockey markings under a light ice layer, soft shade along the boards ----
function iceTexture(){
  const lo=rkLo(),cw=lo?1024:2048,ch=lo?512:1024,c=document.createElement('canvas');c.width=cw;c.height=ch;const x=c.getContext('2d'),k=cw/2048;
  const g=x.createRadialGradient(cw/2,ch/2,40*k,cw/2,ch/2,cw*.6);g.addColorStop(0,'#f4fbff');g.addColorStop(1,'#e2eff8');x.fillStyle=g;x.fillRect(0,0,cw,ch);
  for(let i=0;i<150;i++){const px=rkR()*cw,py=rkR()*ch,r=(50+rkR()*170)*k,a=.02+rkR()*.03;const gg=x.createRadialGradient(px,py,0,px,py,r);
    gg.addColorStop(0,rkR()<.55?'rgba(255,255,255,'+a+')':'rgba(140,190,228,'+a+')');gg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gg;x.fillRect(px-r,py-r,2*r,2*r);}
  // resurfacing sheen: long soft ovals left by the ice machine
  x.save();x.translate(cw/2,ch/2);for(let i=0;i<5;i++){x.strokeStyle='rgba(255,255,255,'+(.05+.02*i)+')';x.lineWidth=(60-i*8)*k;x.beginPath();x.ellipse(0,0,cw*(.18+.06*i),ch*(.12+.07*i),0,0,TAU);x.stroke();}x.restore();
  x.setTransform(cw/(2*W),0,0,ch/(2*D),cw/2,ch/2);
  const RED='#cf2b40',BLU='#1f5fc8',RED2='rgba(207,43,64,.9)';
  const line=(x1,z1,x2,z2,col,w)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(x1,z1);x.lineTo(x2,z2);x.stroke();};
  const ring=(cx,cz,r,col,w)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.arc(cx,cz,r,0,TAU);x.stroke();};
  const dot=(cx,cz,r,col)=>{x.fillStyle=col;x.beginPath();x.arc(cx,cz,r,0,TAU);x.fill();};
  const rr=(w,d,r)=>{x.beginPath();x.moveTo(-w+r,-d);x.lineTo(w-r,-d);x.arc(w-r,-d+r,r,-Math.PI/2,0);x.lineTo(w,d-r);x.arc(w-r,d-r,r,0,Math.PI/2);x.lineTo(-w+r,d);x.arc(-w+r,d-r,r,Math.PI/2,Math.PI);x.lineTo(-w,-d+r);x.arc(-w+r,-d+r,r,Math.PI,Math.PI*1.5);x.closePath();};
  // shade where the boards meet the ice
  for(let i=0;i<7;i++){rr(W-.05,D-.05,CR);x.strokeStyle='rgba(95,130,165,'+(.035)+')';x.lineWidth=1.6-i*.21;x.stroke();}
  // centre line: red with white check marks
  line(0,-D,0,D,RED,.32);x.fillStyle='rgba(255,255,255,.92)';for(let z=-D;z<D;z+=1.1)x.fillRect(-.05,z+.15,.1,.5);
  for(const s of[-1,1]){line(s*8,-D,s*8,D,BLU,.62);line(s*(W-2.4),-D+1.6,s*(W-2.4),D-1.6,RED2,.1);}
  // centre circle + spot
  ring(0,0,4.3,BLU,.14);dot(0,0,.32,BLU);
  // neutral-zone spots
  for(const sx of[-1,1])for(const sz of[-1,1]){dot(sx*6.2,sz*6,.3,RED);dot(sx*6.2,sz*6,.13,'#fff');dot(sx*6.2,sz*6,.06,RED);}
  // end-zone circles with hash marks, spot and L marks
  for(const sx of[-1,1])for(const sz of[-1,1]){const px=sx*13,pz=sz*6,r=3.1;ring(px,pz,r,RED,.12);
    for(const hz of[-1,1])for(const hx of[-.55,.55])line(px+hx,pz+hz*r,px+hx,pz+hz*(r+.55),RED,.1);
    dot(px,pz,.34,RED);dot(px,pz,.2,'#fff');x.fillStyle=RED;x.fillRect(px-.2,pz-.05,.4,.1);
    for(const lx of[-1,1])for(const lz of[-1,1]){const ax=px+lx*.45,az=pz+lz*.35;line(ax,az,ax+lx*.45,az,RED,.08);line(ax,az,ax,az+lz*.4,RED,.08);}}
  // goal creases
  x.fillStyle='rgba(120,190,245,.55)';x.strokeStyle=RED;x.lineWidth=.12;
  x.beginPath();x.arc(-W,0,3.6,-Math.PI/2,Math.PI/2);x.closePath();x.fill();x.stroke();
  x.beginPath();x.arc(W,0,3.6,Math.PI/2,Math.PI*1.5);x.closePath();x.fill();x.stroke();
  for(const s of[-1,1])for(const z of[-1.5,1.5])line(s*(W-3.1),z,s*(W-3.1)+s*.0,z+(z>0?-.4:.4),RED,.08);
  // referee crease (near side)
  x.strokeStyle=RED2;x.lineWidth=.1;x.beginPath();x.arc(0,D,2.2,Math.PI,0);x.stroke();
  // the ice layer over the paint, then skate scratches
  x.setTransform(1,0,0,1,0,0);x.fillStyle='rgba(236,246,253,.08)';x.fillRect(0,0,cw,ch);
  x.lineCap='round';
  for(let i=0;i<520;i++){const px=rkR()*cw,py=rkR()*ch,l=(30+rkR()*200)*k,a=(rkR()<.6?(rkR()-.5)*.7:rkR()*TAU);x.strokeStyle=rkR()<.8?'rgba(255,255,255,'+(.05+rkR()*.1)+')':'rgba(130,170,205,'+(.04+rkR()*.05)+')';
    x.lineWidth=(.5+rkR()*1.1)*k;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+Math.cos(a)*l*.5+rkR()*18,py+Math.sin(a)*l*.5+rkR()*18,px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke();}
  const t=new T.CanvasTexture(c);t.anisotropy=maxAniso;return t;
}
// centre-ice crest for the classic rink (themed rinks paint their own logo)
function rinkCrestTex(){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.translate(256,256);
  x.fillStyle='rgba(18,38,74,.92)';x.beginPath();x.arc(0,0,236,0,TAU);x.fill();
  x.strokeStyle='#e9f4ff';x.lineWidth=10;x.beginPath();x.arc(0,0,216,0,TAU);x.stroke();
  x.fillStyle='#f4f9ff';x.beginPath();x.arc(0,0,150,0,TAU);x.fill();
  x.strokeStyle='#cf2b40';x.lineWidth=8;x.beginPath();x.arc(0,0,150,0,TAU);x.stroke();
  // crossed sticks
  x.save();for(const s of[-1,1]){x.save();x.rotate(s*.62);x.fillStyle='#1d2b44';x.fillRect(-9,-150,18,236);x.fillStyle='#1d2b44';x.beginPath();x.moveTo(-9,86);x.lineTo(s*-58,104);x.lineTo(s*-58,124);x.lineTo(9,110);x.closePath();x.fill();x.restore();}x.restore();
  // penguin
  x.fillStyle='#141a27';x.beginPath();x.ellipse(0,26,66,86,0,0,TAU);x.fill();x.beginPath();x.arc(0,-66,52,0,TAU);x.fill();
  x.fillStyle='#fff';x.beginPath();x.ellipse(0,40,44,66,0,0,TAU);x.fill();
  for(const s of[-1,1]){x.fillStyle='#fff';x.beginPath();x.arc(s*20,-70,13,0,TAU);x.fill();x.fillStyle='#141a27';x.beginPath();x.arc(s*20+3,-68,6,0,TAU);x.fill();}
  x.fillStyle='#ff8c1c';x.beginPath();x.moveTo(-12,-52);x.lineTo(12,-52);x.lineTo(0,-34);x.closePath();x.fill();
  x.fillStyle='#2f7bff';x.fillRect(-60,-14,120,22);x.fillStyle='#fff';x.fillRect(-60,-4,120,4);
  // ring text
  const arcText=(txt,rad,top)=>{x.save();x.font='bold 34px Arial,sans-serif';x.fillStyle='#e9f4ff';x.textAlign='center';x.textBaseline='middle';const n=txt.length,span=top?2.2:1.9;
    for(let i=0;i<n;i++){const a=(top?-Math.PI/2:Math.PI/2)+(top?1:-1)*(i-(n-1)/2)*(span/(n-1||1));x.save();x.rotate(a+(top?Math.PI/2:-Math.PI/2));x.translate(0,top?-rad:rad);x.fillText(txt[i],0,0);x.restore();}x.restore();};
  arcText('PENGUIN HOCKEY',183,true);arcText('ANTARCTIC ICE',183,false);
  for(const s of[-1,1]){x.fillStyle='#ffd25a';x.save();x.translate(s*183,0);x.rotate(Math.PI/4);x.fillRect(-7,-7,14,14);x.restore();}
  const t=new T.CanvasTexture(c);t.anisotropy=maxAniso;return t;
}
// ---- dasher boards: yellow kick plate, sponsor panels, navy cap rail, glass with stanchions ----
const RK_ADS=[['PENGUIN HOCKEY','#ffffff','#14284a','#cf2b40'],['KRILL BAR','#cf2b40','#ffffff','#ffd25a'],['POLAR BANK','#ffffff','#1f5fc8','#1f5fc8'],['SNOW COLA','#1f5fc8','#ffffff','#9fd8ff'],
  ['AURORA AIR','#ffffff','#0e8a8a','#0e8a8a'],['ICE FISH CO.','#14284a','#ffffff','#ff8c1c'],['FROSTY MART','#ffffff','#cf2b40','#14284a'],['ANTARCTIC TV','#ffd25a','#14284a','#14284a']];
function rinkAdTex(){
  const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');
  RK_ADS.forEach((ad,i)=>{const col=i%2,row=i>>1,ox=col*512,oy=row*128;
    x.fillStyle=ad[1];x.fillRect(ox,oy,512,128);
    x.fillStyle='#f2c230';x.fillRect(ox,oy+109,512,19);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(ox,oy+109,512,2);   // kick plate
    x.fillStyle='#ffffff';x.fillRect(ox,oy,512,15);x.fillStyle='rgba(0,0,0,.1)';x.fillRect(ox,oy+15,512,2);          // top band
    x.fillStyle=ad[3];x.fillRect(ox+18,oy+44,10,40);x.fillRect(ox+484,oy+44,10,40);
    x.fillStyle=ad[2];x.font='900 52px "Arial Black",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(ad[0],ox+256,oy+64,430);
  });
  const t=new T.CanvasTexture(c);t.anisotropy=maxAniso;return t;
}
// plain board face for the goal bays: white panel, same yellow kick plate and white top band as the ads
function rinkPlainTex(){const c=document.createElement('canvas');c.width=8;c.height=128;const x=c.getContext('2d');
  x.fillStyle='#f3f6f9';x.fillRect(0,0,8,128);x.fillStyle='#f2c230';x.fillRect(0,109,8,19);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,109,8,2);
  x.fillStyle='#ffffff';x.fillRect(0,0,8,15);x.fillStyle='rgba(0,0,0,.1)';x.fillRect(0,15,8,2);return new T.CanvasTexture(c);}
var RK_AD=[];   // ad runs: {sa,sb,n,Lad} (filled by buildBoards)
function buildBoards(){
  const loop=rinkLoop(.25),runs=[loop],mats={},rp=rinkPath(),zi=RK_BAY.zi;
  // sponsor panels: each straight-to-bay run gets a whole (odd) number of equal panels, PENGUIN HOCKEY in the middle, none cut at a bay
  {const pos=[],nor=[],uv=[],idx=[],L1=2*(W-CR),L2=2*(D-CR),LA=CR*Math.PI/2,s2=L1+LA,s6=2*L1+L2+3*LA,h=D-CR;RK_AD=[];
    for(const [sa,sb] of[[s2+zi+h,s6+h-zi],[s6+h+zi,s2+h-zi+rp.total]]){let n=Math.max(1,Math.round((sb-sa)/4.2));if(n%2===0)n++;const Lad=(sb-sa)/n,mid=(n-1)/2;RK_AD.push({sa,sb,n,Lad,mid});
      for(let c=0;c<n;c++){const ad=(((c-mid)%8)+8)%8,col=ad%2,row=ad>>1,v0=1-(row+1)*.25,v1=1-row*.25,cs=sa+c*Lad,m=16;
        for(let j=0;j<m;j++){const a=rp.at(cs+Lad*j/m),b=rp.at(cs+Lad*(j+1)/m),k=pos.length/3;
          for(const [p,u,y,v] of[[a,j/m,0,v0],[b,(j+1)/m,0,v0],[b,(j+1)/m,.46,v1],[a,j/m,.46,v1]]){pos.push(p.x,y,p.z);nor.push(-p.nx,0,-p.nz);uv.push(col*.5+u*.5,v);}
          idx.push(k,k+1,k+2,k,k+2,k+3);}}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);
    const m=new T.Mesh(g,mats.ads=std(0xffffff,.45,0,{map:rinkAdTex(),side:T.DoubleSide}));m.receiveShadow=true;scene.add(m);}
  // goal bay inner faces (plain panels)
  {const pos=[],nor=[],uv=[],idx=[];
    for(let i=0;i<loop.length-1;i++){const a=loop[i],b=loop[i+1];if(!(a.bay&&b.bay)||Math.hypot(a.x-b.x,a.z-b.z)<1e-6)continue;const k=pos.length/3;
      for(const [p,y,v] of[[a,0,0],[b,0,0],[b,.46,1],[a,.46,1]]){pos.push(p.x,y,p.z);nor.push(-b.nx,0,-b.nz);uv.push(p.s/2,v);}
      idx.push(k,k+1,k+2,k,k+2,k+3);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);
    const m=new T.Mesh(g,mats.bay=std(0xffffff,.45,0,{map:rinkPlainTex(),side:T.DoubleSide}));m.receiveShadow=true;scene.add(m);}
  // board body behind the panels and the cap rail on top: one closed run, so there are no open board ends anywhere
  const body=new T.Mesh(rinkExtrude(runs,[[.02,.46],[.56,.46],[.56,0]]),mats.body=std(0xeef4f9,.5,0));body.castShadow=true;body.receiveShadow=true;scene.add(body);
  const cap=new T.Mesh(rinkExtrude(runs,[[-.035,.455],[-.035,.53],[.585,.53],[.585,.44]]),mats.cap=std(0x1c2c48,.32,.25));cap.castShadow=true;scene.add(cap);
  // glass all the way round (bays included) + a soft top edge
  const glass=new T.Mesh(rinkExtrude(runs,[[.09,.53],[.09,1.56]]),mats.glass=new T.MeshStandardMaterial({color:0xd6f1ff,roughness:.04,metalness:0,transparent:true,opacity:.18,depthWrite:false,side:T.DoubleSide}));glass.renderOrder=2;scene.add(glass);
  const edge=new T.Mesh(rinkExtrude(runs,[[.075,1.556],[.075,1.572],[.105,1.572],[.105,1.556]]),new T.MeshBasicMaterial({color:0xeef9ff,transparent:true,opacity:.6,depthWrite:false}));edge.renderOrder=2;scene.add(edge);
  // glass joints: slim, light seams flush with the glass (no dark posts sticking up), one every 2.4 m, kept clear of the bay corners
  const parts=[],seam=[.84,.89,.93];let next=1.2;
  for(let i=0;i<loop.length;i++){const p=loop[i];if(p.s<next||p.cor)continue;let near=false;for(let j=Math.max(0,i-4);j<Math.min(loop.length,i+5);j++)if(loop[j].cor&&Math.abs(loop[j].s-p.s)<.45)near=true;if(near)continue;
    next=p.s+2.4;const b=new T.BoxGeometry(.04,1.02,.03);b.rotateY(Math.atan2(p.nx,p.nz));b.translate(p.x+p.nx*.09,1.045,p.z+p.nz*.09);parts.push([b,seam]);}
  for(let i=0;i<loop.length;i+=1){const p=loop[i];if(!p.cor||(i>0&&loop[i-1].cor&&Math.hypot(loop[i-1].x-p.x,loop[i-1].z-p.z)<1e-6))continue;
    const b=new T.BoxGeometry(.05,1.02,.05);b.translate(p.x+p.mx*.09,1.045,p.z+p.mz*.09);parts.push([b,seam]);}
  const st=new T.Mesh(pkMerge(parts),new T.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.15}));scene.add(st);
  return mats;
}
// ---- goals: diamond netting, red frame with white base pads ----
function rinkNetTex(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=2.4;
  x.beginPath();x.moveTo(0,32);x.lineTo(32,0);x.lineTo(64,32);x.lineTo(32,64);x.closePath();x.stroke();
  x.fillStyle='#fff';for(const [px,py] of[[0,32],[32,0],[64,32],[32,64]]){x.beginPath();x.arc(px,py,3,0,TAU);x.fill();}
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(4,maxAniso||1);return t;}
function buildGoal(sign,colHex){
  const g=new T.Group();g.position.x=sign*W;g.rotation.y=sign>0?0:Math.PI;
  const fm=std(colHex,.3,.3,{emissive:colHex,emissiveIntensity:.18}),pad=std(0xf3f6fa,.55,0),nm=new T.MeshBasicMaterial({map:rinkNetTex(),transparent:true,alphaTest:.3,side:T.DoubleSide});
  const cyl=(r,h,mat,seg)=>new T.Mesh(new T.CylinderGeometry(r,r,h,seg||12),mat);
  for(const s of[-1,1]){
    const p=cyl(.12,1.7,fm,14);p.position.set(0,.85,s*GW);p.castShadow=true;g.add(p);
    const bp=cyl(.075,1.1,pad,10);bp.position.set(GD,.55,s*GW);g.add(bp);
    const rail=cyl(.09,GD,pad,10);rail.rotation.z=Math.PI/2;rail.position.set(GD/2,.09,s*GW);g.add(rail);
    const L=Math.hypot(GD,.6),tr=cyl(.06,L,fm,10);tr.rotation.z=Math.atan2(-GD,-.6);tr.position.set(GD/2,1.4,s*GW);g.add(tr);
    g.add(new T.Mesh(quad([0,0,s*GW],[GD,0,s*GW],[GD,1.1,s*GW],[0,1.7,s*GW],8,5),nm));
    const foot=new T.Mesh(new T.SphereGeometry(.16,12,8,0,TAU,0,Math.PI/2),fm);foot.position.set(0,0,s*GW);g.add(foot);
  }
  const cb=new T.Mesh(new T.CylinderGeometry(.12,.12,2*GW,14),fm);cb.rotation.x=Math.PI/2;cb.position.set(0,1.7,0);cb.castShadow=true;g.add(cb);
  const bb=new T.Mesh(new T.CylinderGeometry(.075,.075,2*GW,10),pad);bb.rotation.x=Math.PI/2;bb.position.set(GD,1.1,0);g.add(bb);
  const br=new T.Mesh(new T.CylinderGeometry(.09,.09,2*GW,10),pad);br.rotation.x=Math.PI/2;br.position.set(GD,.09,0);g.add(br);
  g.add(new T.Mesh(quad([GD,0,-GW],[GD,0,GW],[GD,1.1,GW],[GD,1.1,-GW],16,5),nm));
  g.add(new T.Mesh(quad([0,1.7,-GW],[0,1.7,GW],[GD,1.1,GW],[GD,1.1,-GW],16,6),nm));
  scene.add(g);
}
// ---- floodlight towers (same lamps[] contract: {pl, glow, bulb}, bulb is a direct child of the tower group) ----
function rinkConeTex(){const c=document.createElement('canvas');c.width=4;c.height=128;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(.5,'rgba(255,255,255,.22)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,4,128);return new T.CanvasTexture(c);}
function buildLampTowers(lamps){
  const poleM=std(0xd2dae3,.36,.55),bankM=std(0xbcc6d1,.42,.45),coneTex=rinkConeTex();
  for(const sx of[-14,14])for(const sz of[-1,1]){
    const g=new T.Group();g.position.set(sx,0,sz*(D+2.6));const face=Math.atan2(-sx,-sz*(D+2.6));
    const pole=new T.Mesh(new T.CylinderGeometry(.085,.16,10,12),poleM);pole.position.y=5;pole.castShadow=true;g.add(pole);
    const base=new T.Mesh(new T.CylinderGeometry(.3,.36,.24,12),poleM);base.position.y=.12;g.add(base);
    const arm=new T.Mesh(new T.BoxGeometry(.09,.09,1.3),poleM);arm.position.set(0,9.75,0);arm.rotation.y=face;arm.translateZ(.45);g.add(arm);
    // light bank tilted toward centre ice: frame + 2x4 glowing lenses (the lens mesh is the 'bulb')
    const bank=new T.Mesh(new T.BoxGeometry(2.3,1.08,.22),bankM);bank.position.set(0,10.15,0);bank.rotation.set(0,face,0);bank.translateZ(.9);bank.rotateX(.55);g.add(bank);
    const lg=[];for(let r=0;r<2;r++)for(let c=0;c<4;c++){const d=new T.CylinderGeometry(.21,.21,.05,14);d.rotateX(Math.PI/2);d.translate(-.84+c*.56,-.27+r*.54,.15);lg.push([d,null]);}
    const bulb=new T.Mesh(pkMerge(lg),new T.MeshBasicMaterial({color:0xfff2cc}));bulb.position.copy(bank.position);bulb.quaternion.copy(bank.quaternion);g.add(bulb);
    const glow=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(255,244,210,1)','rgba(255,225,160,.45)'),blending:T.AdditiveBlending,transparent:true,depthWrite:false,fog:false,opacity:0}));glow.scale.set(7,7,1);glow.position.copy(bank.position);g.add(glow);
    // soft beam toward the ice (night only)
    const cone=new T.Mesh(new T.CylinderGeometry(.9,6.5,10.5,20,1,true),new T.MeshBasicMaterial({map:coneTex,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false}));
    const tgt=new T.Vector3(-sx+sx*.35,0,-sz*(D+2.6)+sz*(D+2.6)*.2),top=bank.position.clone(),dir=tgt.clone().sub(top),len=Math.hypot(dir.x,dir.y,dir.z)||1;cone.position.copy(top).addScaledVector(dir,.5);cone.quaternion.setFromUnitVectors(new T.Vector3(0,-1,0),dir.normalize());cone.scale.y=len/10.5;cone.renderOrder=3;g.add(cone);
    const pl=new T.PointLight(0xfff0cc,0,70,1.5);pl.position.set(0,9.4,-sz*1.2);g.add(pl);
    scene.add(g);lamps.push({pl,glow,bulb,cone});
  }
}
// flag cloth: back faces sample the texture mirrored, so BLUE / RED read correctly from both sides of the flag
function rkFlagFlip(sh){sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',T.ShaderChunk.map_fragment.replace('texture2D( map, vUv )','texture2D( map, gl_FrontFacing ? vUv : vec2( 1.0 - vUv.x, vUv.y ) )'));}
// ---- decor that needs the crowd: team benches, centre crest, goal lights, scoreboard, flags, string lights ----
function rinkDecor(){
  RK={t:0,key:'',sbKey:'',flags:[],goalLights:[]};
  const lo=rkLo();
  // centre crest (classic rink)
  RK.crest=new T.Mesh(new T.PlaneGeometry(7.4,7.4),new T.MeshBasicMaterial({map:rinkCrestTex(),transparent:true,opacity:.88,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
  RK.crest.rotation.x=-Math.PI/2;RK.crest.position.y=.014;RK.crest.renderOrder=1;scene.add(RK.crest);
  // team benches behind the far boards (players waiting their shift)
  {const parts=[];
    for(const [x0,col] of[[-5,TEAM.blue.color],[5,TEAM.red.color]]){const tc=new T.Color(col),cc=[tc.r,tc.g,tc.b];
      const fl=new T.BoxGeometry(5.6,.06,1.7);fl.translate(x0,.03,-D-1.45);parts.push([fl,[.12,.13,.15]]);
      const seat=new T.BoxGeometry(5.4,.1,.42);seat.translate(x0,.42,-D-1.95);parts.push([seat,[.62,.45,.3]]);
      for(const lx of[-2.4,0,2.4]){const leg=new T.BoxGeometry(.08,.4,.3);leg.translate(x0+lx,.2,-D-1.95);parts.push([leg,[.2,.2,.22]]);}
      const wall=new T.BoxGeometry(5.8,1.15,.12);wall.translate(x0,.58,-D-2.35);parts.push([wall,cc]);
      const stripe=new T.BoxGeometry(5.82,.1,.13);stripe.translate(x0,.95,-D-2.35);parts.push([stripe,[.95,.96,.97]]);
      for(let i=0;i<5;i++)crowd.add(x0-2+i,0,-D-1.25+(i%2)*.15,0,rnd(.86,.96),col);}
    const m=new T.Mesh(pkMerge(parts),new T.MeshStandardMaterial({vertexColors:true,roughness:.6}));m.castShadow=true;m.receiveShadow=true;scene.add(m);}
  // goal judge lights: a compact housing on top of the glass behind each net (lights up red when a goal goes in)
  for(const s of[-1,1]){const g=new T.Group();g.position.set(s*(W+RK_BAY.xb+.09),1.572,0);
    const housing=new T.Mesh(new T.BoxGeometry(.3,.1,.3),std(0x1d2633,.5,.4));housing.position.y=.05;g.add(housing);
    const dome=new T.Mesh(new T.SphereGeometry(.15,16,10,0,TAU,0,Math.PI/2),new T.MeshBasicMaterial({color:0x5a1018}));dome.position.y=.1;g.add(dome);
    const glow=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(255,120,100,1)','rgba(255,30,30,.65)'),blending:T.AdditiveBlending,transparent:true,depthWrite:false,opacity:0,fog:false}));glow.scale.set(5,5,1);glow.position.y=.3;g.add(glow);
    scene.add(g);RK.goalLights.push({side:s,dome,glow});}
  // scoreboard on the far ridge
  {const c=document.createElement('canvas');c.width=1024;c.height=416;RK.sbC=c;RK.sbX=c.getContext('2d');RK.sbT=new T.CanvasTexture(c);RK.sbT.anisotropy=Math.min(4,maxAniso||1);
    const z=-(D+15),y0=Math.max(0,heightAt(0,z)),g=new T.Group();g.position.set(0,y0,z);
    const legM=std(0x2c3a4a,.45,.6);for(const lx of[-3.4,3.4]){const l=new T.Mesh(new T.BoxGeometry(.35,6,.35),legM);l.position.set(lx,3,0);l.castShadow=true;g.add(l);}
    const box=new T.Mesh(new T.BoxGeometry(10.4,4.6,.6),std(0x141b26,.45,.4));box.position.y=8.1;box.castShadow=true;g.add(box);
    const scr=new T.Mesh(new T.PlaneGeometry(9.9,4.0),new T.MeshBasicMaterial({map:RK.sbT,toneMapped:false}));scr.position.set(0,8.1,.31);g.add(scr);
    const trim=new T.Mesh(new T.BoxGeometry(10.6,.16,.7),std(0xffd25a,.3,.7));trim.position.y=10.45;g.add(trim);
    scene.add(g);RK.sb=g;}
  // team flags around the ridge
  {const flagTex=k=>{const c=document.createElement('canvas');c.width=128;c.height=256;const x=c.getContext('2d'),tc='#'+new T.Color(TEAM[k].color).getHexString();
      x.fillStyle=tc;x.fillRect(0,0,128,256);x.fillStyle='rgba(255,255,255,.95)';x.fillRect(0,26,128,10);x.fillRect(0,220,128,10);
      x.fillStyle='#fff';x.beginPath();x.arc(64,118,40,0,TAU);x.fill();x.fillStyle='#141a27';x.beginPath();x.ellipse(64,128,20,26,0,0,TAU);x.fill();x.beginPath();x.arc(64,96,15,0,TAU);x.fill();
      x.fillStyle='#fff';x.beginPath();x.ellipse(64,132,12,19,0,0,TAU);x.fill();x.fillStyle='#ff8c1c';x.beginPath();x.moveTo(59,100);x.lineTo(69,100);x.lineTo(64,107);x.fill();
      x.font='900 26px Arial,sans-serif';x.textAlign='center';x.fillStyle='#fff';x.fillText(TEAM[k].name,64,190);return new T.CanvasTexture(c);};
    const tex={blue:flagTex('blue'),red:flagTex('red')},poleM=std(0xd9e2ea,.35,.7);
    let i=0;for(const sz of[-1])for(const fx of[-19,-7,7,19]){const z=sz*(D+12),x0=fx,y0=heightAt(x0,z),k=(i++%2)?'red':'blue';
      const g=new T.Group();g.position.set(x0,y0,z);   // every flag faces +z: the side the menu camera orbits on
      const pole=new T.Mesh(new T.CylinderGeometry(.05,.07,6.4,8),poleM);pole.position.y=3.2;g.add(pole);
      const bar=new T.Mesh(new T.CylinderGeometry(.035,.035,1.5,6),poleM);bar.rotation.z=Math.PI/2;bar.position.set(.75,6.2,0);g.add(bar);
      const geo=new T.PlaneGeometry(1.4,2.6,6,10);geo.translate(.75,6.2-1.3,0);const fm=new T.MeshStandardMaterial({map:tex[k],side:T.DoubleSide,roughness:.8});fm.onBeforeCompile=rkFlagFlip;fm.customProgramCacheKey=()=>'rkFlag';
      const m=new T.Mesh(geo,fm);m.castShadow=true;g.add(m);
      g.visible=!lo;scene.add(g);RK.flags.push({g,m,base:Float32Array.from(geo.attributes.position.array),ph:rkR()*6});}}
  // festoon string lights between the light towers (one mesh per side: the near one hides during matches)
  {RK.bulbs=[];const pal=[[1,.85,.55],[1,.6,.4],[.6,.85,1],[1,.95,.75]],mat=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}),geo=new T.SphereGeometry(.09,8,6),o=new T.Object3D(),cc=new T.Color();
    for(const sz of[-1]){const z=sz*(D+2.6),pts=[];for(let i=0;i<=34;i++){const t=i/34;pts.push(new T.Vector3(lerp(-14,14,t),9.1-Math.sin(t*Math.PI)*2.2,z));}
      const im=new T.InstancedMesh(geo,mat,pts.length);pts.forEach((p,i)=>{o.position.copy(p);o.updateMatrix();im.setMatrixAt(i,o.matrix);const c=pal[i%4];cc.setRGB(c[0],c[1],c[2]);im.setColorAt(i,cc);});
      const ln=new T.Line(new T.BufferGeometry().setFromPoints(pts.map(p=>p.clone().setY(p.y+.06))),new T.LineBasicMaterial({color:0x2a3340}));
      const g=new T.Group();g.add(im,ln);scene.add(g);RK.bulbs.push({g,near:sz>0});}
    RK.bulbMat=mat;}
}
// scoreboard face (redrawn only when something on it changes)
function rinkScoreboard(force){
  if(!RK||!RK.sbX)return;
  const inGame=!!(G.view==='game'&&G.teams&&G.teams.blue),b=inGame?G.teams.blue.score:0,r=inGame?G.teams.red.score:0,
    tl=inGame&&G.cfg&&G.cfg.time?Math.max(0,Math.ceil(G.timeLeft)):-1,clock=tl>=0?(Math.floor(tl/60)+':'+String(tl%60).padStart(2,'0')):(inGame?'∞':''),
    ar=inGame?((ARENAS[G.arena]||ARENAS.classic).name):'',key=[inGame,b,r,clock,ar].join('|');
  if(!force&&key===RK.sbKey)return;RK.sbKey=key;
  const x=RK.sbX;x.fillStyle='#070b12';x.fillRect(0,0,1024,416);
  x.fillStyle='#0f1c30';x.fillRect(12,12,1000,392);
  x.textAlign='center';x.textBaseline='middle';
  if(!inGame){const cr=RK.crest&&RK.crest.material&&RK.crest.material.map&&RK.crest.material.map.image;if(cr)x.drawImage(cr,512-170,208-170,340,340);
    x.fillStyle='#2f7bff';x.fillRect(70,205,230,6);x.fillStyle='#ff3b4e';x.fillRect(724,205,230,6);}
  else{x.fillStyle='#2f7bff';x.fillRect(40,40,300,70);x.fillStyle='#ff3b4e';x.fillRect(684,40,300,70);x.fillStyle='#fff';x.font='900 48px Arial,sans-serif';x.fillText('BLUE',190,76);x.fillText('RED',834,76);
    x.font='900 190px "Arial Black",Arial,sans-serif';x.fillStyle='#ffffff';x.fillText(String(b),190,250);x.fillText(String(r),834,250);
    x.fillStyle='#ffd25a';x.font='900 96px "Arial Black",Arial,sans-serif';x.fillText(clock,512,200);x.fillStyle='#9fd8ff';x.font='700 34px Arial,sans-serif';x.fillText(ar,512,320);}
  RK.sbT.needsUpdate=true;
}
// called from applyQuality(): the ice paint follows the 높음/절약 setting without a reload
function rinkQuality(){
  if(!iceMat.map)return;const want=rkLo()?1024:2048,img=iceMat.map.image;
  if(img&&img.width!==want){const old=iceMat.map;iceMat.map=iceTexture();old.dispose();}
}
const RK_CAP={classic:0x1c2c48,aurora:0x0f5f6e,blizzard:0x2a4f7a,sunset:0x7a3a1c,final:0x8a6a1e};
function rinkFrame(dt){
  if(!RK)return;RK.t+=dt;const t=RK.t,key=(G.view==='game'?G.arena:'menu');
  if(key!==RK.key){RK.key=key;if(RK_MATS&&RK_MATS.cap){RK_MATS.cap.color.setHex(RK_CAP[G.view==='game'?G.arena:'classic']||RK_CAP.classic);RK_MATS.cap.metalness=G.view==='game'&&G.arena==='final'?.7:.25;}}
  RK.crest.visible=!arenaG.visible;
  // goal light on the net that was just scored on
  const side=G.state==='goal'&&G.scoredBy?(G.scoredBy.dir>0?1:-1):0;RK.goalSide=side;
  for(const L of RK.goalLights){const on=L.side===side,f=on?.65+.35*Math.sin(t*14):0;L.dome.material.color.setRGB(.35+.65*f+(on?.3:0),.06+.12*f,.08+.1*f);L.glow.material.opacity=Math.min(1,f*1.3);L.glow.scale.setScalar(4+2*f);}
  // night: beams and festoon lights
  const nl=smooth(.35,.85,G.tod);
  for(const l of lamps)if(l.cone)l.cone.material.opacity=nl*.085;
  iceMat.color.setScalar(lerp(1,.84,nl));   // keep the paint readable under the night floodlights
  if(RK.bulbMat){const k=.35+nl*.9;RK.bulbMat.color.setRGB(k,k,k);for(const b of RK.bulbs)b.g.visible=!(b.near&&G.view==='game');}
  const lo=rkLo();if(RK.flags.length&&RK.flagLo!==lo){RK.flagLo=lo;for(const f of RK.flags)f.g.visible=!lo;}
  if(RK.flags.length&&!lo){RK.fT=(RK.fT||0)+dt;if(RK.fT>1/30){RK.fT=0;const w=.5+.5*G.wx.int;
    for(const f of RK.flags){const p=f.m.geometry.attributes.position,b=f.base;for(let i=0;i<p.count;i++){const bx=b[i*3],by=b[i*3+1],d=Math.max(0,bx);p.setZ(i,Math.sin(t*3.2+bx*2.4+f.ph+by*.3)*.16*d*w);p.setX(i,bx-Math.abs(Math.sin(t*1.7+f.ph))*.04*d);}p.needsUpdate=true;f.m.geometry.computeVertexNormals();}}}
  RK.sbAcc=(RK.sbAcc||0)+dt;if(RK.sbAcc>.25){RK.sbAcc=0;rinkScoreboard(false);}
}
