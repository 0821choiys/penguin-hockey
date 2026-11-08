/* ================= v36: 🎮 controls — feel + your own button layout ================= */
// 1) Joystick: a faint ring shows where it rests; it follows the thumb (or stays fixed); a small push already gives full
//    acceleration (sensitivity setting), 10 % dead zone.
// 2) Shots and passes go where the stick / keys point, not where the penguin happens to face (mouse aim still wins on PC).
// 3) Input buffer: a shot or pass pressed just before the puck is in reach fires when it gets there (CTLV.buf seconds).
// 4) Easy handling (default on, always on for both players online): quicker turns that keep speed, less sideways drift,
//    shorter stops. AI skaters never get it.
// 5) Layout editor: drag every button and the joystick, size (all / each), opacity, joystick size; portrait and landscape
//    are stored separately in save.set.ctl (additive field).
// var (not const): functions here are called from code that runs earlier in the boot (loadSave, resetInput).
var CTLV={buf:.22,dz:.1,sens:{low:1,mid:.7,high:.5},R:56,
  easy:{rate:1.7,carve:3.2,grip:1.4,gripAdd:.5,brk:1.9,start:1.25,stopK:1.5,stopC:3}};
var CL={keys:['shoot','pass','dash','spec','swap'],ids:{shoot:'#tbShoot',pass:'#tbPass',dash:'#tbDash',spec:'#tbSpec',swap:'#tbSwap'},D:null};
var CJ={home:null};
var CE={on:false,work:null,sel:'shoot',drag:null,fold:false,from:''};
// save.set.ctl, sanitised (literals only: also called from loadSave before this module has run)
function ctlLoad(q){
  const d={sz:1,op:1,js:1,jm:'follow',sens:'mid',easy:true,swap:true,P:{},L:{}};
  if(!q||typeof q!=='object')return d;
  const n=(v,a,b,df)=>{v=+v;return Number.isFinite(v)?Math.round(Math.min(b,Math.max(a,v))*1000)/1000:df;};
  d.sz=n(q.sz,.7,1.5,1);d.op=n(q.op,.3,1,1);d.js=n(q.js,.7,1.5,1);
  if(q.jm==='fixed')d.jm='fixed';
  if(q.sens==='low'||q.sens==='high')d.sens=q.sens;
  if(q.easy===false)d.easy=false;
  if(q.swap===false)d.swap=false;
  for(const o of['P','L']){const src=q[o];if(!src||typeof src!=='object')continue;
    for(const k of['shoot','pass','dash','spec','swap','joy']){const e=src[k];
      if(Array.isArray(e)&&e.length>=2&&Number.isFinite(+e[0])&&Number.isFinite(+e[1]))d[o][k]=[n(e[0],0,1,.5),n(e[1],0,1,.5),n(e[2],.6,1.6,1)];}}
  return d;
}
function ctl(){let c=save.set.ctl;if(!c||typeof c!=='object'||!c.P||!c.L)c=save.set.ctl=ctlLoad(c);return c;}
function ctlEditing(){return !!CE.on;}
const ctlR3=v=>Math.round(v*1000)/1000;

/* ---- joystick ---- */
// response curve: dead zone, then linear up to `full` of the radius, full speed beyond
function ctlCurve(dx,dy,R,sens){
  const l=Math.hypot(dx,dy);if(!(l>0))return[0,0];
  const full=CTLV.sens[sens]||CTLV.sens.mid,dz=CTLV.dz,m=Math.min(1,l/R),o=m<=dz?0:Math.min(1,(m-dz)/(full-dz));
  return[dx/l*o,dy/l*o];
}
function ctlJoyR(){return CTLV.R*ctl().js;}
function ctlJoyPlace(x,y){jb.style.left=x+'px';jb.style.top=y+'px';}
function ctlJoyDown(e){
  if(CE.on||jid!==null)return;jid=e.pointerId;try{jz.setPointerCapture(jid);}catch(_){}
  const c=ctl();jo=(c.jm==='fixed'&&CJ.home)?{x:CJ.home.x,y:CJ.home.y}:{x:e.clientX,y:e.clientY};
  jb.classList.remove('idle');jb.classList.add('act');jb.style.display='block';ctlJoyPlace(jo.x,jo.y);jk.style.transform='translate(0,0)';input.joy=true;SFX.init();
  ctlJoyMove(e);   // fixed ring: the first touch already steers
}
function ctlJoyMove(e){
  if(e.pointerId!==jid)return;const c=ctl(),R=ctlJoyR();
  let dx=e.clientX-jo.x,dy=e.clientY-jo.y,l=Math.hypot(dx,dy);
  if(l>R&&c.jm!=='fixed'){const k=(l-R)/l;jo.x+=dx*k;jo.y+=dy*k;dx-=dx*k;dy-=dy*k;l=R;ctlJoyPlace(jo.x,jo.y);}   // the ring follows the thumb
  const kx=l>R?dx*R/l:dx,ky=l>R?dy*R/l:dy;jk.style.transform='translate('+kx.toFixed(1)+'px,'+ky.toFixed(1)+'px)';
  const o=ctlCurve(dx,dy,R,c.sens);input.x=o[0];input.z=o[1];
}
function ctlJoyEnd(e){if(e&&e.pointerId!==jid)return;jid=null;input.joy=null;input.x=input.z=0;ctlJoyIdle();recomputeKeys();}
function ctlJoyIdle(){
  if(!CJ||!jb||!jb.classList)return;jb.classList.remove('act');jk.style.transform='translate(0,0)';
  if(CJ.home){jb.classList.add('idle');jb.style.display='block';ctlJoyPlace(CJ.home.x,CJ.home.y);}else{jb.classList.remove('idle');jb.style.display='none';}
}

/* ---- shots / passes pressed a moment early ---- */
function ctlBuf(p){
  const b=p.bufShot,q=p.bufPass,lim=CTLV.buf;
  if(b){const age=G.t-b.at;
    if(p.fall>0||age>lim+.1||age<0)p.bufShot=null;                                   // stale (switched penguin, stoppage)
    else if(p.cd.shoot<=0&&(canHit(p)||age>=lim)){p.bufShot=null;const a=humanAim(p);performShot(p,a[0],a[1],b.c);}   // in reach → shot; too late → the normal whiff
  }
  if(q){const age=G.t-q.at;
    if(p.fall>0||age>lim+.16||age<0)p.bufPass=null;
    else if(p.cd.pass<=0&&canHit(p)){const a=humanAim(p),m=bestMate(p,a[0],a[1],false);p.bufPass=null;if(!doPass(p,m)){p.cd.pass=.15;SFX.whoosh();}}
    else if(age>=lim+.06){p.bufPass=null;p.cd.pass=.15;SFX.whoosh();}
  }
}

/* ---- easy handling (movePeng) ---- */
function ctlEasy(p){
  if(p.goalie||!(p.human||p.remote))return null;
  if(G.net)return CTLV.easy;            // online: the same handling for both players, whatever each one chose
  return ctl().easy?CTLV.easy:null;
}
// keep speed through a turn: the velocity swings toward the facing instead of only being scrubbed sideways
function ctlCarve(p,EZ,h){
  const sp=Math.hypot(p.vx,p.vz);if(sp<2)return;
  const va=Math.atan2(p.vx,p.vz),d=angDiff(va,p.heading);if(Math.abs(d)>2.1)return;   // a reversal is a brake, not a carve
  const cr=EZ.carve*CF.grip*h,na=va+clamp(d,-cr,cr);p.vx=Math.sin(na)*sp;p.vz=Math.cos(na)*sp;   // slippery rink conditions (thin ice) carve less too
}

/* ---- layout ---- */
function ctlOri(){return innerWidth>=innerHeight?'L':'P';}
// CSS layout of this screen (inline styles cleared): button centres / sizes, the joystick zone and its default resting spot
function ctlDefaults(){
  const t=$('#touch'),out={};t.classList.add('meas');t.classList.remove('jz-right');
  try{
    for(const k of CL.keys){const b=$(CL.ids[k]);b.style.cssText='';const r=b.getBoundingClientRect();
      out[k]={x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,f:(typeof getComputedStyle==='function'&&parseFloat(getComputedStyle(b).fontSize))||19};}
    const z=$('#joyZone').getBoundingClientRect();out.zone={l:z.left,t:z.top,w:z.width,h:z.height};
  }finally{t.classList.remove('meas');}
  const R=CTLV.R,Z=out.zone;
  out.joy={x:Z.l+Math.max(R*1.25+16,Z.w*.36),y:Z.t+Z.h-Math.max(R*1.25+26,Z.h*.28)};
  return out;
}
function ctlApply(c){
  const t=$('#touch');if(!t||!t.classList||!jb)return;
  c=c||ctl();const vw=innerWidth,vh=innerHeight,L=c[ctlOri()]||{},M=6,D=ctlDefaults();CL.D=D;
  if(!D.shoot||!D.shoot.w)return;     // not laid out (hidden document / test harness)
  for(const k of CL.keys){const b=$(CL.ids[k]),d=D[k],e=L[k],s=c.sz*(e?e[2]:1),w=Math.round(d.w*s);
    const x=clamp(e?e[0]*vw:d.x,w/2+M,vw-w/2-M),y=clamp(e?e[1]*vh:d.y,w/2+M,vh-w/2-M);
    Object.assign(b.style,{left:Math.round(x-w/2)+'px',top:Math.round(y-w/2)+'px',right:'auto',bottom:'auto',width:w+'px',height:w+'px',
      fontSize:Math.round(d.f*clamp(s,.8,1.35))+'px',opacity:String(c.op)});
    b.classList.toggle('ce-hidden',k==='swap'&&!c.swap);
  }
  t.style.setProperty('--js',c.js);t.style.setProperty('--op',c.op);
  // joystick: resting spot (and which half of the screen is the joystick side)
  const R=CTLV.R*c.js,j=L.joy,Z=D.zone;let hx=j?j[0]*vw:D.joy.x,hy=j?j[1]*vh:D.joy.y;
  const right=hx>vw/2;t.classList.toggle('jz-right',right);
  const zl=right?vw-Z.w:Z.l,a=R*.7;
  hx=clamp(hx,zl+a,Math.max(zl+a,zl+Z.w-a));hy=clamp(hy,Z.t+a,Math.max(Z.t+a,vh-a-M));
  CJ.home={x:Math.round(hx),y:Math.round(hy)};
  if(jid===null)ctlJoyIdle();
}
let ctlRzT=0;
function ctlResize(){clearTimeout(ctlRzT);ctlRzT=setTimeout(()=>{safe(ctlApply,CE.on?CE.work:null);if(CE.on)safe(ctlEdRender);},150);}

/* ---- cooldown rings on Dash / Skill, a pulse when the skill is ready ---- */
var CF36={dMax:0,dPrev:0,sPrev:0,dash:-1,spec:-1};
function ctlFrame(){
  if(G.view!=='game'||!document.body.classList.contains('touch'))return;
  const p=G.player;if(!p)return;
  const dc=p.cd.dash||0;if(dc>CF36.dPrev+.05)CF36.dMax=dc;CF36.dPrev=dc;
  const df=dc>0&&CF36.dMax>0?Math.min(1,dc/CF36.dMax):0,sc=p.cd.special||0,sf=sc>0?Math.min(1,sc/(p.specMax||8)):0;
  const set=(id,f,key)=>{const r=Math.round(f*50)/50;if(r===CF36[key])return;const b=$(id);if(!b)return;
    if(CF36[key]>0&&r===0){b.classList.remove('rdy');void b.offsetWidth;b.classList.add('rdy');}
    CF36[key]=r;b.classList.toggle('cd',r>0);b.style.setProperty('--cd',r);};
  set('#tbDash',df,'dash');set('#tbSpec',sf,'spec');
}

/* ---- settings row + editor ---- */
function ctlSensName(s){return s==='low'?__L('낮음'):s==='high'?__L('높음'):__L('보통');}
function ctlRow(){
  const el=$('#setList');if(!el)return;let r=$('#ctlRow');
  if(!r){r=document.createElement('div');r.id='ctlRow';r.className='setrow ctl-set';}
  const c=ctl();
  r.innerHTML='<div>🎮 '+__L('조작 설정')+'</div><div class="ctl-row"><span class="ctl-sum">'+fmtL(__L('버튼 {s}% · 감도 {g}'),{s:Math.round(c.sz*100),g:ctlSensName(c.sens)})+'</span>'
    +'<button class="btn small primary" id="ctlOpenB">'+__L('버튼 배치 · 크기')+'</button></div>';
  const first=el.firstElementChild;el.insertBefore(r,first?first.nextSibling:null);
  $('#ctlOpenB').onclick=()=>{SFX.init();SFX.ui();ctlEdOpen('set');};
}
function ctlName(k){return {shoot:__L('슛'),pass:__L('패스'),dash:__L('대시'),spec:__L('특수'),swap:__L('교체'),joy:__L('이동')}[k]||k;}
function ctlEdOpen(from){
  CE.on=true;CE.from=from||'';CE.work=JSON.parse(JSON.stringify(ctl()));CE.sel='shoot';CE.drag=null;
  resetInput();document.body.classList.add('ctledit');jb.dataset.lab=ctlName('joy');
  $('#ctlEdPanel').classList.add('on');ctlApply(CE.work);ctlEdRender();
}
function ctlEdClose(keep){
  if(!CE.on)return;
  if(keep){save.set.ctl=ctlLoad(CE.work);persist();flashMsg(__L('조작 설정을 저장했어요'));}
  CE.on=false;CE.drag=null;document.body.classList.remove('ctledit','ce-drag');$('#ctlEdPanel').classList.remove('on');
  document.querySelectorAll('.ce-sel').forEach(e=>e.classList.remove('ce-sel'));
  ctlApply();if(G.ui==='sSet')renderSettings();
}
function ctlEdMarks(){
  document.querySelectorAll('.ce-sel').forEach(e=>e.classList.remove('ce-sel'));
  const el=CE.sel==='joy'?jb:$(CL.ids[CE.sel]);if(el)el.classList.add('ce-sel');
}
function ctlEdHtml(){
  const c=CE.work,o=ctlOri(),k=CE.sel,e=c[o][k];
  const seg=(act,v,opts)=>'<div class="seg">'+opts.map(x=>'<button data-ce="'+act+'" data-v="'+x[0]+'"'+(String(v)===String(x[0])?' class="on"':'')+'>'+x[1]+'</button>').join('')+'</div>';
  const rng=(id,v,a,b,lab)=>'<label class="ce-rng"><span>'+lab+' <b>'+Math.round(v*100)+'%</b></span><input type="range" data-ce="'+id+'" min="'+a+'" max="'+b+'" step="5" value="'+Math.round(v*100)+'"></label>';
  let h='<div class="ce-head"><b>🎮 '+__L('조작 설정')+'</b><span class="ce-sel-n">'+fmtL(__L('선택: {n}'),{n:ctlName(k)})+'</span><button class="btn small" data-ce="fold" aria-label="'+(CE.fold?__L('펼치기'):__L('접기'))+'">'+(CE.fold?'▾':'▴')+'</button></div>';
  if(!CE.fold){
    h+='<div class="ce-sub">'+(o==='L'?__L('가로 화면 배치를 바꾸는 중이에요 · 세로 화면은 따로 저장돼요'):__L('세로 화면 배치를 바꾸는 중이에요 · 가로 화면은 따로 저장돼요'))+'<br>'+__L('버튼이나 조이스틱을 끌어서 옮기세요')+'</div><div class="ce-grid">'
      +(k==='joy'?'':rng('one',e?e[2]:1,60,160,fmtL(__L('「{n}」 버튼 크기'),{n:ctlName(k)})))
      +rng('sz',c.sz,70,150,__L('모든 버튼 크기'))+rng('op',c.op,30,100,__L('버튼 투명도'))+rng('js',c.js,70,150,__L('조이스틱 크기'))
      +'<div class="ce-opt"><span>'+__L('조이스틱')+'</span>'+seg('jm',c.jm,[['follow',__L('따라오기')],['fixed',__L('고정')]])+'</div>'
      +'<div class="ce-opt"><span>'+__L('조이스틱 감도')+'</span>'+seg('sens',c.sens,[['low',__L('낮음')],['mid',__L('보통')],['high',__L('높음')]])+'</div>'
      +'<div class="ce-opt"><span>'+__L('쉬운 조작')+'</span>'+seg('easy',c.easy,[[true,__L('켜기')],[false,__L('끄기')]])+'</div>'
      +'<div class="ce-opt"><span>'+__L('교체 버튼')+'</span>'+seg('swap',c.swap,[[true,__L('표시')],[false,__L('숨김')]])+'</div>'
      +'</div><div class="ce-note">'+__L('쉬운 조작: 방향을 빨리 바꾸고 덜 미끄러져요 (친구 대전에서는 두 사람 모두 켜져요)')+'<br>'
      +(c.jm==='fixed'?__L('고정: 조이스틱이 그 자리에 있어요. 조이스틱 쪽 화면 어디를 눌러도 그 방향으로 움직여요'):__L('따라오기: 누른 곳에 조이스틱이 생기고, 손가락을 멀리 끌면 따라와요'))
      +(c.swap?'':'<br>'+__L('교체 버튼을 숨겨도 퍽에 가까운 펭귄으로 자동 교체돼요'))+'</div>';
  }
  h+='<div class="row ce-btns"><button class="btn small" data-ce="def">'+__L('모두 기본값')+'</button><button class="btn small" id="ceCancel" data-ce="cancel">'+__L('취소')+'</button><button class="btn small primary" data-ce="save">'+__L('저장')+'</button></div>';
  return h;
}
function ctlEdRender(){const p=$('#ctlEdPanel');if(!p||!CE.on)return;p.innerHTML=ctlEdHtml();ctlEdMarks();}
function ctlEdAct(act,v){
  const c=CE.work;
  if(act==='fold'){CE.fold=!CE.fold;}
  else if(act==='jm')c.jm=v==='fixed'?'fixed':'follow';
  else if(act==='sens')c.sens=['low','mid','high'].includes(v)?v:'mid';
  else if(act==='easy')c.easy=v==='true';
  else if(act==='swap'){c.swap=v==='true';if(!c.swap&&CE.sel==='swap')CE.sel='shoot';}
  else if(act==='def'){CE.work=ctlLoad(null);CE.sel='shoot';}
  else if(act==='cancel'){SFX.ui();ctlEdClose(false);return;}
  else if(act==='save'){SFX.ui();ctlEdClose(true);return;}
  SFX.ui();ctlApply(CE.work);ctlEdRender();
}
function ctlEdRange(id,pct,inp){
  const c=CE.work,o=ctlOri(),v=ctlR3(pct/100);
  if(id==='sz')c.sz=clamp(v,.7,1.5);else if(id==='op')c.op=clamp(v,.3,1);else if(id==='js')c.js=clamp(v,.7,1.5);
  else if(id==='one'){const k=CE.sel,D=CL.D||ctlDefaults(),e=c[o][k];
    c[o][k]=e?[e[0],e[1],clamp(v,.6,1.6)]:[ctlR3(D[k].x/innerWidth),ctlR3(D[k].y/innerHeight),clamp(v,.6,1.6)];}
  const b=inp&&inp.closest('label')&&inp.closest('label').querySelector('b');if(b)b.textContent=Math.round(v*100)+'%';
  ctlApply(c);
}
// dragging: capture phase on window so the buttons' own handlers never fire while editing
function ctlEdDown(e){
  if(!CE.on)return;const t=e.target&&e.target.closest&&e.target.closest('#touch .tb,#joyBase');if(!t)return;
  e.preventDefault();e.stopPropagation();
  const k=t.id==='joyBase'?'joy':CL.keys.find(q=>CL.ids[q]==='#'+t.id);if(!k)return;
  const r=t.getBoundingClientRect();CE.sel=k;
  CE.drag={k,id:e.pointerId,ox:e.clientX-(r.left+r.width/2),oy:e.clientY-(r.top+r.height/2)};
  try{t.setPointerCapture(e.pointerId);}catch(_){}
  document.body.classList.add('ce-drag');ctlEdRender();
}
function ctlEdMove(e){
  const d=CE.drag;if(!CE.on||!d||e.pointerId!==d.id)return;e.preventDefault();e.stopPropagation();
  const o=ctlOri(),L=CE.work[o],prev=L[d.k];
  L[d.k]=[ctlR3(clamp((e.clientX-d.ox)/innerWidth,0,1)),ctlR3(clamp((e.clientY-d.oy)/innerHeight,0,1)),prev?prev[2]:1];
  ctlApply(CE.work);
}
function ctlEdUp(e){const d=CE.drag;if(!d||e.pointerId!==d.id)return;e.stopPropagation();CE.drag=null;document.body.classList.remove('ce-drag');}
function ctlInit(){
  if(!$('#ctlEdBg')){
    const bg=document.createElement('div');bg.id='ctlEdBg';document.body.appendChild(bg);
    const p=document.createElement('div');p.id='ctlEdPanel';p.setAttribute('role','dialog');p.setAttribute('aria-label',__L('조작 설정'));document.body.appendChild(p);
    p.addEventListener('click',e=>{const b=e.target.closest('button[data-ce]');if(b)ctlEdAct(b.dataset.ce,b.dataset.v);});
    p.addEventListener('input',e=>{const i=e.target;if(i&&i.matches&&i.matches('input[type=range][data-ce]'))ctlEdRange(i.dataset.ce,+i.value,i);});
    addEventListener('pointerdown',ctlEdDown,true);addEventListener('pointermove',ctlEdMove,true);
    addEventListener('pointerup',ctlEdUp,true);addEventListener('pointercancel',ctlEdUp,true);
    document.addEventListener('keydown',e=>{if(CE.on&&e.key==='Escape'){e.stopPropagation();e.preventDefault();ctlEdClose(false);}},true);
    // pause menu entry
    const pr=$('#pResume');if(pr&&!$('#pCtl')){const b=document.createElement('button');b.className='btn';b.id='pCtl';b.textContent='🎮 '+__L('조작 설정');
      b.onclick=()=>{SFX.ui();ctlEdOpen('pause');};pr.insertAdjacentElement('afterend',b);}
  }
  addEventListener('resize',ctlResize);addEventListener('orientationchange',ctlResize);
  ctlApply();
}
