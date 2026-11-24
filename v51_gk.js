/* ================= v51: 🥅 goalie draw + positions (owner, 2026-11-24) ================= */
// "Add a goalie draw to the penguin draw and let me pick my position (2 or more a side). I can play goalie too, but only
// with a character from the goalie draw." So:
//  · 10 goalie characters: a species model in goalie gear, 5 goalie stats, one save skill; graded like the penguins (3·3·2·1·1)
//  · a points-only draw on the 뽑기 tab (🐧 펭귄 / 🥅 골키퍼 switch): the odds on screen are GKD, a hard pity, a 10-draw
//    guarantee, a free draw every day; a duplicate raises that goalie's level (max GKD.lvMax), after that it refunds points
//  · the equipped goalie guards your net in offline matches: its stats tune the goalie AI from the difficulty's baseline
//    (gkParams). Without one the old default goalie plays exactly as before
//  · 팀 편성 → 내 포지션 (2 or more a side): 공격 / 중앙 (3+) / 수비 = the captain lines up in that slot (roles + formation
//    swap, gkPerm); 골키퍼 (needs an equipped goalie) = you control the goalie the whole match, every skater is AI
//  · playing goalie: let go of the stick and the goalie holds the angle by itself; Shoot = dive toward where the shot is going
//    (or clear the puck when it is at your stick), Pass = pass it out, Special = the goalie's skill; the game slows down for a
//    moment when a shot comes at your net (G.slow), and a ring on the goal line shows where it is going
// Online friend matches stay as they were (default goalies, everyone plays a skater).
var GKD={cost1:40,cost10:360,odds:[50,30,14,5,1],hard:30,tenMin:2,lvMax:5,lvAdd:.2,refund:[5,10,25,60,150],histMax:30,
  slow:.6,slowT:.9,diveT:.38,flyT:.3,diveCd:.8,dv0:10,reach:1.6,dr:1.05,idle:1.6,ang:[.35,.18],lag:.4,mask:[-.3,.2,.08]};
// skills: durations per grade (GKT), cooldown, strength. Every number on screen is read from here.
var GKS={wall:{n:__L('철벽'),i:'🧱',cd:14,k:1.35},reflex:{n:__L('번개 반사'),i:'⚡',cd:12,r:.35,dv:1.25},
  catch:{n:__L('쏙 캐치'),i:'🧤',cd:12},read:{n:__L('슛 읽기'),i:'👁️',cd:14,e:.3}};
var GKT={t:[2.5,2.8,3.2,3.6,4.2],c:[4,4.5,5,5.5,6]};
var GKST=['ref','pos','agi','dive','hand'];
var GKSN={ref:__L('반사신경'),pos:__L('위치 선정'),agi:__L('순발력'),dive:__L('다이빙'),hand:__L('퍽 처리')};
var GKC={
  g0:{n:__L('든든 아델리'),sp:'basic',g:0,sk:'wall',num:30,st:[3,3,3,2,3]},
  g1:{n:__L('날쌘 쇠푸른'),sp:'little',g:0,sk:'reflex',num:31,st:[4,2,4,3,2]},
  g2:{n:__L('꼼꼼 젠투'),sp:'fast',g:0,sk:'read',num:35,st:[3,4,3,2,3]},
  g3:{n:__L('바위벽 턱끈'),sp:'defense',g:1,sk:'wall',num:1,st:[3,4,3,3,4]},
  g4:{n:__L('번개손 바위뛰기'),sp:'balanced',g:1,sk:'reflex',num:33,st:[5,3,4,4,2]},
  g5:{n:__L('집게손 훔볼트'),sp:'humboldt',g:1,sk:'catch',num:40,st:[4,3,3,3,5]},
  g6:{n:__L('눈치 피오르드랜드'),sp:'fiordland',g:2,sk:'read',num:29,st:[5,5,4,4,4]},
  g7:{n:__L('다이빙 마카로니'),sp:'macaroni',g:2,sk:'reflex',num:37,st:[5,4,5,5,3]},
  g8:{n:__L('수호신 로열'),sp:'royal',g:3,sk:'catch',num:39,st:[6,5,5,5,6]},
  g9:{n:__L('얼음성벽 황제'),sp:'strong',g:4,sk:'wall',num:70,st:[6,6,5,6,6]}
};
// ---- the collection ----
function gkS(){let o=save.gk;if(!o||typeof o!=='object')o=save.gk={};if(!o.own||typeof o.own!=='object')o.own={};if(!Array.isArray(o.hist))o.hist=[];
  o.pity=o.pity|0;o.pulls=o.pulls|0;if(typeof o.eq!=='string')o.eq='';if(typeof o.free!=='string')o.free='';return o;}
function gkIds(g){return Object.keys(GKC).filter(k=>g==null||GKC[k].g===g);}
function gkHas(id){return !!GKC[id]&&Object.prototype.hasOwnProperty.call(gkS().own,id);}
function gkLv(id){return gkHas(id)?Math.max(0,Math.min(GKD.lvMax,gkS().own[id]|0)):0;}
function gkEq(){const o=gkS();return o.eq&&gkHas(o.eq)?o.eq:'';}
function gkEquip(id){const o=gkS();if(id&&!gkHas(id))return false;o.eq=id||'';persist();return true;}
function gkStats(id,lv){const c=GKC[id],a=lv==null?gkLv(id):lv,r={};GKST.forEach((k,i)=>{r[k]=c.st[i]+a*GKD.lvAdd;});return r;}
function gkOvr(id,lv){const s=gkStats(id,lv);let t=0;for(const k of GKST)t+=s[k];return Math.min(99,Math.round(52+(t-12)*2.4));}
function gkSkT(sk,g){return (sk==='catch'?GKT.c:GKT.t)[g|0];}
const gkPct=v=>(Math.round(v*100)/100).toFixed(2)+'%';
// ---- the draw: grade first (GKD.odds), then one goalie of that grade, all equally likely ----
// hard pity: the GKD.hard-th draw since the last 신화 or better is 신화 or better (신화 : 전설 = their odds);
// 10 draws: when the first nine have nothing of GKD.tenMin or better, the tenth is at least that (odds renormalised)
function gkProbs(minG){const o=GKD.odds.slice(),pity=(gkS().pity|0)+1>=GKD.hard;let lo=minG|0;if(pity)lo=Math.max(lo,3);
  for(let i=0;i<lo;i++)o[i]=0;const s=o.reduce((a,v)=>a+v,0);return o.map(v=>v/s*100);}
function gkRate(id,minG){const g=GKC[id].g;return gkProbs(minG)[g]/gkIds(g).length;}
// long-run rates with the pity included, drawing one at a time (the pity counter is a Markov chain)
function gkEff(){const o=GKD.odds,hi=(o[3]+o[4])/100;let e=0,q=1;for(let k=0;k<GKD.hard;k++){e+=q;q*=k===GKD.hard-1?0:(1-hi);}
  const ph=1/e,lo=o[0]+o[1]+o[2];return [o[0]/lo*(1-ph)*100,o[1]/lo*(1-ph)*100,o[2]/lo*(1-ph)*100,o[3]/(o[3]+o[4])*ph*100,o[4]/(o[3]+o[4])*ph*100];}
function gkRoll(minG){const p=gkProbs(minG),r=Math.random()*100;let acc=0,g=4;
  for(let i=0;i<5;i++){acc+=p[i];if(p[i]>0&&r<acc){g=i;break;}}
  const ids=gkIds(g);return ids[Math.floor(Math.random()*ids.length)]||ids[0];}
// new → joins at Lv.0 (the first goalie is equipped at once); duplicate → level +1; at the top level → points back
function gkGrant(id){const o=gkS(),c=GKC[id];
  if(!gkHas(id)){o.own[id]=0;if(!gkEq())o.eq=id;return {id,g:c.g,isNew:true,up:0,ovf:0};}
  const lv=o.own[id]|0;if(lv<GKD.lvMax){o.own[id]=lv+1;return {id,g:c.g,isNew:false,up:lv+1,ovf:0};}
  save.points+=GKD.refund[c.g];return {id,g:c.g,isNew:false,up:0,ovf:GKD.refund[c.g]};}
function gkDrawOnce(minG){const o=gkS(),id=gkRoll(minG),g=GKC[id].g;o.pulls++;o.pity=g>=3?0:(o.pity|0)+1;
  const r=gkGrant(id);o.hist.unshift([id,g]);if(o.hist.length>GKD.histMax)o.hist.length=GKD.histMax;return r;}
function gkFreeReady(){return gkS().free!==todayKey();}
function gkDraw(n){if(n!==1&&n!==10)return null;const o=gkS(),free=n===1&&gkFreeReady(),cost=free?0:n===1?GKD.cost1:GKD.cost10;
  if(save.points<cost){lackMsg(cost);return null;}
  save.points-=cost;if(free)o.free=todayKey();
  const res=[];for(let i=0;i<n;i++)res.push(gkDrawOnce(i===9&&!res.some(r=>r.g>=GKD.tenMin)?GKD.tenMin:0));
  persist();return res;}
// ---- stats → goalie AI numbers (from the difficulty's baseline; stat 3 = the baseline) ----
function gkParams(b,s){const q=v=>v-3,c=(v,a,z)=>Math.max(a,Math.min(z,v));
  return Object.assign({},b,{react:b.react*c(1-.06*q(s.ref),.6,1.2),miss:b.miss*c(1-.12*q(s.ref),.25,1.3),err:b.err*c(1-.07*q(s.pos),.55,1.2),
    out:(b.out||.4)+.03*q(s.pos),read:(b.read||.2)+.03*q(s.pos),cap:b.cap+.4*q(s.agi),acc:b.acc+3*q(s.agi),dive:c(b.dive+.06*q(s.dive),0,.85)});}
function gkBounce(s){return Math.max(.3,Math.min(.65,.55-.04*(s.hand-3)));}
// ---- which matches: the card in every offline match of these modes; the position also needs 2+ a side ----
const GK_MODES=['quick','free','tour','trial','ranked','run'];
function gkCardOK(cfg){return !!cfg&&!cfg.flat&&!cfg.demo&&!cfg.net&&!cfg.tutorial&&(GK_MODES.includes(cfg.mode)||cfg.mode==='shootout');}
function gkPosOK(cfg){return gkCardOK(cfg)&&GK_MODES.includes(cfg.mode)&&(cfg.size|0)>=2&&!cfg.noOpp;}
function gkPos(n){const p=save.set.pos;if(n<2)return 'attacker';if(p==='gk')return gkEq()?'gk':'attacker';if(p==='mid'&&n<3)return 'attacker';
  return p==='mid'||p==='defender'?p:'attacker';}
// the captain (slot 0) swaps role + formation spot with the first slot of the chosen role
function gkPerm(n){const r=ROLES[n]||[],a=r.map((_,i)=>i),p=gkPos(n);if(p==='gk'||p==='attacker')return a;const j=r.indexOf(p);if(j>0){a[0]=j;a[j]=0;}return a;}
function gkRolesSq(n){const r=ROLES[n]||[];return gkPerm(n).map(i=>r[i]);}
function gkRoleArr(isMine,n,cfg){const k=Math.max(1,n),r=ROLES[k]||[];return isMine&&gkPosOK(cfg)?gkPerm(k).map(i=>r[i]):r;}
function gkFormArr(isMine,n,cfg){const k=Math.max(1,n),f=FORM[k];return isMine&&gkPosOK(cfg)?gkPerm(k).map(i=>f[i]):f;}
// our goalie's species + number (setupMatch), then its numbers
function gkSp(isMine,cfg){if(isMine&&gkCardOK(cfg)){const id=gkEq();if(id){G.gkNum=GKC[id].num;return GKC[id].sp;}}G.gkNum=0;return (isMine||cfg.flat)?'defense':'strong';}
function gkPrep(g,cfg){G.gkNum=0;const id=gkCardOK(cfg)?gkEq():'';if(!id)return;const c=GKC[id],st=gkStats(id);
  g.gkId=id;g.gkSk=c.sk;g.gkG=c.g;g.gkSt=st;g.gkd=gkParams(G.diff.gk,st);g.gkEv=gkBounce(st);g.specMax=GKS[c.sk].cd;g.cd.special=0;}
{const o=setupMatch;setupMatch=function(cfg){G.gkMode=!!(cfg&&gkPosOK(cfg)&&gkPos(cfg.size|0)==='gk');G.gkShot=-1;try{document.body.classList.toggle('gk-mode',G.gkMode);}catch(e){}return o.apply(this,arguments);};}
{const o=pkNum;pkNum=function(tm,k,g){if(g&&G.gkNum)return G.gkNum;return o.apply(this,arguments);};}
// playing goalie: whoever the game hands the puck to (face-offs, the box, resets), you stay in net; in a shootout / penalty
// shot you shoot on your turn and guard the net on theirs
{const o=setHuman;setHuman=function(p){
  if(G.gkMode&&!G.net){if(p&&!p.goalie&&p.team&&p.team.goalie&&!G.so&&!G.ps)p=p.team.goalie;else if(!p&&(G.so||G.ps)&&G.mine&&G.mine.goalie)p=G.mine.goalie;}
  return o.call(this,p);};}
{const o=humanControl;humanControl=function(p,dt,inp){if(p&&p.goalie)return gkHuman(p,dt,inp);return o.apply(this,arguments);};}
{const o=hkSwap;hkSwap=function(){if(G.player&&G.player.goalie)return;return o.apply(this,arguments);};}
{const o=hkAutoSwitch;hkAutoSwitch=function(){if(G.player&&G.player.goalie){G.pending=null;return;}return o.apply(this,arguments);};}
{const o=hkRingFrame;hkRingFrame=function(){if(G.player&&G.player.goalie){if(HKR.ring)HKR.ring.visible=false;HKR.tgt=null;return;}return o.apply(this,arguments);};}
{const o=hkCamW;hkCamW=function(pl){if(pl&&pl.goalie)return G.puck.x*pl.team.dir<0?.42:.14;return o.apply(this,arguments);};}
{const o=hkLabels;hkLabels=function(){const p=G.player;if(G.view==='game'&&p&&p.goalie){hkLab('#tbShoot',canHit(p)?__L('걷어내기'):__L('다이브'),'');hkLab('#tbPass',__L('패스'),'');return;}return o.apply(this,arguments);};}
{const o=hkFrame;hkFrame=function(){o.apply(this,arguments);gkFrame();};}
{const o=goScreen;goScreen=function(){try{document.body.classList.remove('gk-mode');}catch(e){}return o.apply(this,arguments);};}
function gkCamM(){const p=G.player;return p&&p.goalie&&G.view==='game'?(camera.aspect<1?6:8):9;}
function gkSpName(p){return p&&p.goalie&&p.gkSk?GKS[p.gkSk].i+' '+GKS[p.gkSk].n:SPECIALS[p.ty.special];}
// ---- in the net ----
// a puck coming at p's goal: time to the goal line + where it crosses
function gkInc(p){const pk=G.puck,d=p.team.dir,homeX=-d*(W-1.7),spd=Math.hypot(pk.vx,pk.vz);
  if(!(pk.vx*(-d)>.5&&spd>6))return null;const tt=Math.abs((homeX-pk.x)/(pk.vx||1e-3));if(tt>2.2)return null;return {tt,zp:pk.z+pk.vz*tt,spd};}
function gkHuman(p,dt,inp){inp=inp||input;
  const tm=p.team,d=tm.dir,gk=p.gkd||G.diff.gk,pk=G.puck,st=p.gkSt||{ref:3,pos:3,agi:3,dive:3,hand:3},homeX=-d*(W-1.7);
  p.heading=d*Math.PI/2;p.ix=inp.x;p.iz=inp.z;inp.dash=false;inp.swap=false;
  const play=G.state==='play',near=canHit(p),inc=gkInc(p),opp=!!(pk.lastTeam&&pk.lastTeam!==tm);
  if(inp.shootPress){inp.shootPress=false;if(play&&near&&p.cd.shoot<=0)gkClear(p,inp);else if(play)gkDive(p,inp,inc);}
  inp.shootRel=false;p.charging=false;p.charge=0;
  if(inp.pass){inp.pass=false;if(play&&near&&p.cd.pass<=0)gkPass(p,inp)||gkClear(p,inp);}
  if(inp.special){inp.special=false;gkSkill(p);}
  // 슛 읽기: the goalie throws itself to where the shot is going
  if(play&&p.gkE>0&&inc&&opp&&inc.tt<.35&&Math.abs(inc.zp-p.z)>.7)gkDive(p,{z:0},inc);
  // a puck resting at your stick goes out by itself after a moment (no stalling)
  if(play&&near&&!G.carry&&Math.hypot(pk.vx,pk.vz)<4){p.gkIdle=(p.gkIdle||0)+dt;if(p.gkIdle>GKD.idle){p.gkIdle=0;gkPass(p,inp)||gkClear(p,inp);}}else p.gkIdle=0;
  const mag=Math.hypot(inp.x,inp.z);if(p.gkZs==null||!play)p.gkZs=p.z;
  if(p.diveT>0){const tz=p.gkAim;p.gvx=0;p.gvz=tz==null?p.diveDir*p.diveV:clamp((tz-p.z)*14,-p.diveV,p.diveV);p.gkZs=p.z;}
  else if(mag>.15){p.gvz=inp.z*gk.cap;p.gvx=inp.x*gk.cap*.6;p.gkZs=p.z;}
  else{   // hands off: hold the angle between the puck and the middle of the net (like the goalie AI, without reading shots)
    const dist=Math.hypot(pk.x-p.x,pk.z-p.z),xt=homeX+d*clamp((14-dist)/14,0,1)*(gk.out||.4);
    let zt=clamp(pk.z*(dist<10?GKD.ang[0]:GKD.ang[1]),-GW+.5,GW-.5);if(p.gkE>0&&inc&&opp)zt=clamp(inc.zp,-(GW-.6),GW-.6);
    p.gkZs+=(zt-p.gkZs)*Math.min(1,dt/Math.max(.1,GKD.lag*(1-.08*(st.pos-3))));
    const ez=p.gkZs-p.z,ex=xt-p.x;
    p.gvz=Math.sign(ez)*Math.min(gk.cap,Math.sqrt(2*gk.acc*.85*Math.abs(ez)));p.gvx=Math.sign(ex)*Math.min(gk.cap*.6,Math.sqrt(2*gk.acc*.85*Math.abs(ex)));}
}
// dive: toward the stick's side; stick centred → toward the spot where a shot on target crosses the goal line (a lunge of at most
// GKD.reach m: a far corner needs the goalie already on its angle), or (a shot going wide,
// nothing coming) a butterfly drop on the spot — pads down, the bigger save area, no step away from the net
function gkDive(p,inp,inc){if(p.diveT>0||p.diveCd>0)return false;const st=p.gkSt||{dive:3},rf=p.gkR>0,z=Math.abs(inp.z||0)>.25?Math.sign(inp.z):0;
  let aim=null,dir=z,t=GKD.diveT+.03*(st.dive-3);
  if(!z){if(inc&&Math.abs(inc.zp)<GW+.3){const L=GKD.reach+.15*(st.dive-3);aim=p.z+clamp(clamp(inc.zp,-GW+.3,GW-.3)-p.z,-L,L);dir=Math.sign(aim-p.z)||1;}else{aim=p.z;dir=Math.sign(G.puck.z-p.z)||1;t=GKD.flyT;}}
  p.diveDir=dir;p.gkAim=aim;p.diveT=t;p.diveV=Math.min(19,(GKD.dv0+.6*(st.dive-3))*(rf?GKS.reflex.dv:1));p.diveCd=rf?.3:GKD.diveCd;if(aim==null||aim!==p.z)p.vz=dir*p.diveV*.7;
  try{SFX.whoosh();}catch(e){}return true;}
function gkClear(p,inp){const pk=G.puck,d=p.team.dir,st=p.gkSt||{hand:3};if(G.carry){if(G.carry.team===p.team)return false;carryRelease(.6);}
  const iz=inp.z||0,az=clamp(iz*.9+(Math.abs(iz)<.2?(Math.sign(pk.z-p.z)||(Math.random()<.5?-1:1))*.45:0),-.95,.95),l=Math.hypot(1,az),sp=13+.8*(st.hand-3);
  pk.vx=d/l*sp;pk.vz=az/l*sp;pk.shot=null;pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;p.anim.swing=1;p.cd.shoot=.5;p.shotGrace=.12;p.gkIdle=0;try{SFX.tap();}catch(e){}return true;}
function gkPass(p,inp){if(G.carry&&G.carry.team!==p.team)carryRelease(.6);const ax=inp.x||0,az=inp.z||0,a=Math.hypot(ax,az)>.2?[ax,az]:[p.team.dir,0];
  const m=bestMate(p,a[0],a[1],false);if(!m||!doPass(p,m))return false;G.pending=null;p.gkIdle=0;return true;}
// the skill (your button, or the goalie AI when it sees a wind-up / a shot coming)
function gkSkill(p){if(!p||!p.gkSk||p.cd.special>0||G.state!=='play')return false;const s=GKS[p.gkSk],t=gkSkT(p.gkSk,p.gkG);
  if(p.gkSk==='wall')p.gkW=t;else if(p.gkSk==='reflex')p.gkR=t;else if(p.gkSk==='read')p.gkE=t;else p.gkC=t;
  p.cd.special=s.cd;p.specMax=s.cd;gkMods(p);popAt(s.i+' '+s.n,p.x,2.7,p.z);try{SFX.whoosh();}catch(e){}if(p.human)vib(20);return true;}
function gkMods(p){if(!p.gkd0)p.gkd0=p.gkd||G.diff.gk;const b=p.gkd0,m={};let n=0;
  if(p.gkR>0){m.react=b.react*GKS.reflex.r;m.miss=0;n++;}if(p.gkE>0){m.err=b.err*GKS.read.e;m.read=Math.max(b.read||0,.6);n++;}
  if(n)p.gkd=Object.assign({},b,m);else{p.gkd=b;p.gkd0=null;}}
function gkCatch(p){const pk=G.puck,d=p.team.dir;pk.vx=pk.vz=0;pk.x=p.x+d*(p.r+PUCKR+.15);pk.z=clamp(p.z,-GW,GW);pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;pk.shot=null;
  p.gkC=0;p.cd.shoot=Math.max(p.cd.shoot,.55);gkMods(p);popAt(GKS.catch.i+' '+__L('캐치!'),p.x,2.4,p.z);try{SFX.save();}catch(e){}}
function gkTick(p,dt){let ch=false;for(const k of['gkW','gkR','gkE','gkC'])if(p[k]>0){p[k]-=dt;if(p[k]<=0){p[k]=0;ch=true;}}if(ch)gkMods(p);gkFx(p);}
function gkAi(p){if(p.cd.special>0||G.state!=='play')return;const c=G.carry,gx=-p.team.dir*W,inc=gkInc(p);
  const wind=!!(c&&c.team!==p.team&&c.charging&&Math.abs(c.x-gx)<13),shot=!!(inc&&inc.tt<.7&&inc.spd>11&&Math.abs(inc.zp)<GW+.4&&G.puck.lastTeam!==p.team);
  if(wind||shot)gkSkill(p);}
// a ring on the ice while a skill is on (a child of the model, so it goes with the match)
function gkFx(p){const on=p.gkW>0||p.gkR>0||p.gkE>0||p.gkC>0;
  if(!p.gkRing){if(!on||typeof T==='undefined'||!T.RingGeometry)return;const m=new T.Mesh(new T.RingGeometry(.9,1.05,40),new T.MeshBasicMaterial({color:0x9fe4ff,transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false}));
    m.rotation.x=-Math.PI/2;m.renderOrder=3;p.pg.root.add(m);p.gkRing=m;}
  const m=p.gkRing;m.visible=on;if(!on)return;const sc=p.pg.root.scale.x||1,r=(p.gkW>0?p.r*GKS.wall.k+PUCKR:p.r+.35)/sc;
  m.scale.set(r,r,r);m.position.set(0,.045/sc,0);m.material.opacity=.55+.3*Math.sin(G.t*9);m.material.color.setHex(p.gkW>0?0x9fe4ff:p.gkR>0?0xd8f6ff:p.gkE>0?0xc7b8ff:0x9effd2);}
// every step in play: skills of carded goalies, the save moment, the first-time tip
function gkStep(dt){
  for(const k of['blue','red']){const tm=G.teams[k],g=tm&&tm.goalie;if(!g||!g.gkSk)continue;gkTick(g,dt);if(!g.human)gkAi(g);}
  const p=G.player;if(!p||!p.goalie||G.net)return;
  if(!save.gkTip){save.gkTip=1;persist();gkTip();}
  const pk=G.puck,inc=gkInc(p);
  if(inc&&pk.lastTeam&&pk.lastTeam!==p.team&&inc.spd>11&&inc.tt<1.1&&Math.abs(inc.zp)<GW+1.2&&G.gkShot!==pk.lastT&&!(G.slow&&G.slow.t>0)){
    G.gkShot=pk.lastT;const s=clamp(GKD.slow-.025*(((p.gkSt&&p.gkSt.ref)||3)-3),.3,.5);G.slow={t:Math.min(GKD.slowT,inc.tt/s+.12),s};}
}
// every frame: the body class (hides Dash / Switch), the ring on the goal line where a shot at your net is going
var GKM={m:null},gkLast=null,gkKind='p',gkSel='';
function gkFrame(){const p=G.player,on=!!(G.view==='game'&&p&&p.goalie);
  if(document.body&&document.body.classList)document.body.classList.toggle('gk-mode',on);
  const pk=G.puck,inc=on&&G.state==='play'?gkInc(p):null,show=!!(inc&&pk.lastTeam&&pk.lastTeam!==p.team&&inc.spd>8&&Math.abs(inc.zp)<GW+1.5);
  let m=GKM.m;
  if(!m){if(!show||typeof T==='undefined'||!T.RingGeometry||!scene)return;
    const mk=(a,b,c,o)=>{const x=new T.Mesh(new T.RingGeometry(a,b,32),new T.MeshBasicMaterial({color:c,transparent:true,opacity:o,side:T.DoubleSide,depthWrite:false,depthTest:false}));x.rotation.x=-Math.PI/2;x.renderOrder=9;return x;};
    m=GKM.m=new T.Group();m.add(mk(.46,.58,0x14304d,.6));m.add(mk(.3,.46,0xffffff,.95));scene.add(m);}
  m.visible=show;if(!show)return;
  m.position.set(-p.team.dir*(W-.3),.05,clamp(inc.zp,-GW-.8,GW+.8));m.children[1].material.opacity=Math.abs(inc.zp)<GW?.95:.35;m.scale.setScalar(1+.12*Math.sin(G.t*14));}
function gkCtlTxt(){return IS_TOUCH?__L('손을 떼면 각도를 알아서 잡아요 · 슛 = 다이브 · 퍽이 앞에 있으면 슛 = 걷어내기, 패스 = 패스 · 특수 = 골키퍼 기술'):__L('키를 떼면 각도를 알아서 잡아요 · Space = 다이브 · 퍽이 앞에 있으면 Space = 걷어내기, E = 패스 · Q = 골키퍼 기술');}
// the match-start control hint speaks for the goalie in net (the first match has the bigger tip instead)
{const o=hint;hint=function(on){if(on&&G.gkMode){if(!save.gkTip)return;const h=$('#hint');h.innerHTML='🥅 '+gkCtlTxt();h.classList.add('on');clearTimeout(hint.t);hint.t=setTimeout(()=>h.classList.remove('on'),4500);return;}return o.apply(this,arguments);};}
function gkTip(){try{const el=document.createElement('div');el.id='gkTip';
  el.innerHTML='<b>🥅 '+__L('골키퍼로 뛰어요')+'</b><span>'+gkCtlTxt()+'</span>';
  document.body.appendChild(el);el.onclick=()=>el.remove();setTimeout(()=>{try{el.remove();}catch(e){}},7500);}catch(e){}}
// ---- cards + portraits (the species' real model in goalie gear; the drawing is the no-WebGL fallback) ----
function gkUrl(sp){if(!TYPES[sp]||typeof p3Can!=='function'||!p3Can())return '';const tm=save.team||'blue';if(P3.gkt!==tm){P3.gkt=tm;P3.gk={};}
  if(P3.gk[sp])return P3.gk[sp];const id=Object.keys(GKC).find(k=>GKC[k].sp===sp),u=p3Shot(sp,{g:id?GKC[id].g:0});if(!u)return '';P3.gk[sp]=u;p3Rule('gk-'+sp,u);return u;}
function p3GkGear(P,team){try{const pads=new T.Mesh(pkPadsGeo(team),PK_MAT.vc);P.inner.add(pads);P.flipR.add(new T.Mesh(pkBlockerGeo(team),PK_MAT.vc));P.flipL.add(new T.Mesh(pkGloveGeo(team),PK_MAT.vc));
  const m=P.stick&&P.stick.children[0];if(m&&m.isMesh)m.geometry=pkStickGeo(team,true);
  const h=pkHelmet(TEAM[team].color,true);h.rotation.x=GKD.mask[0];h.position.set(0,GKD.mask[1],GKD.mask[2]);P.headAbs.add(h);}catch(e){}}   // the mask pushed up on the head
function gkUrlC(sp){return P3.gk&&P3.gkt===(save.team||'blue')?P3.gk[sp]||'':'';}
function gkArt(sp){return gkUrlC(sp)?'<i class="p3 p3-gk-'+sp+'"></i>':'<span class="gk-svg" data-gks="'+sp+'">'+pengSVG(sp)+'</span>';}
var GKW={t:0};
function gkWarm(){if(GKW.t)return;const run=()=>{GKW.t=0;const e=document.querySelector('.gk-svg[data-gks]');if(!e)return;const sp=e.dataset.gks,u=gkUrl(sp);
    document.querySelectorAll('.gk-svg[data-gks="'+sp+'"]').forEach(x=>{if(u)x.outerHTML='<i class="p3 p3-gk-'+sp+'"></i>';else x.removeAttribute('data-gks');});GKW.t=setTimeout(run,40);};
  GKW.t=setTimeout(run,60);}
function gkCard(id,o){o=o||{};const c=GKC[id],lv=o.lv!=null?o.lv:gkLv(id);
  return '<div class="pc g'+c.g+' gkpc'+(o.cls?' '+o.cls:'')+'"'+(o.cw?' style="--cw:'+o.cw+'px"':'')+'><i class="pc-deco"></i><div class="pc-top"><span class="pc-ovr">'+gkOvr(id,lv)+'</span><span class="pc-pos">GK</span></div><div class="pc-art">'+gkArt(c.sp)+'</div>'
    +nmTag18(c.n)+'<div class="pc-foot"><span class="pc-stars">'+GKS[c.sk].i+'</span><span>Lv.'+lv+'</span></div>'+(o.tag?'<div class="pc-new">'+o.tag+'</div>':'')+'<div class="pc-foil"></div><div class="pc-holo"></div></div>';}
function gkSkDesc(sk,g){const t=String(Math.round(gkSkT(sk,g)*10)/10);
  if(sk==='wall')return fmtL(__L('{t}초 동안 막는 범위 +{k}%'),{t,k:Math.round((GKS.wall.k-1)*100)});
  if(sk==='reflex')return fmtL(__L('{t}초 동안 반응 시간 -{r}% · 다이브 속도 +{d}%'),{t,r:Math.round((1-GKS.reflex.r)*100),d:Math.round((GKS.reflex.dv-1)*100)});
  if(sk==='catch')return fmtL(__L('{t}초 안에 막은 퍽이 튕기지 않고 스틱 앞에 멈춰요'),{t});
  return fmtL(__L('{t}초 동안 슛 방향 오차 -{e}% · 직접 뛸 땐 슛이 올 곳으로 몸을 날려요'),{t,e:Math.round((1-GKS.read.e)*100)});}
// ---- the 🥅 side of the 뽑기 tab ----
function gkKindSeg(){return '<div class="seg gk-kind"><button data-act="gkkind" data-k="p" class="'+(gkKind==='g'?'':'on')+'">🐧 '+__L('펭귄 뽑기')+'</button><button data-act="gkkind" data-k="g" class="'+(gkKind==='g'?'on':'')+'">🥅 '+__L('골키퍼 뽑기')+(gkFreeReady()?'<i class="gk-free">'+__L('무료')+'</i>':'')+'</button></div>';}
function gkPullHtml(){
  const o=gkS(),free=gkFreeReady(),n=(o.pity|0)+1,P=gkProbs(0),hi=P[3]+P[4],c=GKC.g9,own=gkIds().filter(gkHas);
  let h='<div class="gb gk-ban"><div class="gb-art">'+gkArt(c.sp)+'</div><div class="gb-info"><div class="gb-kick">🥅 '+__L('골키퍼 뽑기')+'</div><div class="gb-name">'+c.n+'</div><div class="gb-tt">'+GRADES[c.g].n+' · '+GKS[c.sk].i+' '+GKS[c.sk].n+'</div>'
    +'<div class="gb-chips"><span>'+GRADES[4].n+' '+gkPct(P[4])+'</span><span>'+fmtL(__L('골키퍼 {n}명'),{n:gkIds().length})+'</span></div><div class="gb-note">'+__L('뽑은 골키퍼가 우리 골문을 지키고, 팀 편성에서 직접 골키퍼로 뛸 수도 있어요')+'</div></div></div>';
  h+='<div class="gpity"><div class="gpity-row"><b>'+__L('신화 이상 천장')+'</b><span>'+(o.pity|0)+' / '+GKD.hard+'</span></div><div class="gpity-bar"><i style="width:'+((o.pity|0)/GKD.hard*100).toFixed(1)+'%"></i></div>'
    +'<div class="gpity-sub">'+(n>=GKD.hard?__L('🎯 이번 뽑기 신화 이상 확정!'):fmtL(__L('다음 뽑기 신화 이상 {p}'),{p:'<b>'+gkPct(hi)+'</b>'})+' · '+fmtL(__L('{h}회차 확정'),{h:GKD.hard}))+'</div></div>';
  const b=(act,cls,title,cost,sub)=>{const lack=save.points<cost;return '<button class="btn gb-b'+cls+(lack?' lack':'')+'" data-act="'+act+'"><b>'+title+'</b><small>'+sub+'</small>'+(lack?'<em>'+fmtL(__L('{p}P 부족'),{p:cost-save.points})+'</em>':'')+'</button>';};
  h+='<div class="gpbtn">'+b('gk1','',free?__L('무료 1회 🎁'):__L('1회 뽑기'),free?0:GKD.cost1,free?__L('오늘의 무료 뽑기'):'⭐ '+GKD.cost1+'P')
    +b('gk10',' primary',__L('10회 뽑기'),GKD.cost10,'⭐ '+fmtL(__L('{c}P · {r} 이상 1개 보장'),{c:GKD.cost10,r:GRADES[GKD.tenMin].n}))+'</div>';
  h+='<div class="gb-bal"><span>'+fmtL(__L('보유 ⭐ {p}P'),{p:'<b>'+save.points+'</b>'})+'</span><span>'+__L('현금 결제 없이 포인트로만 뽑아요')+'</span></div>';
  if(gkLast)h+='<div class="lbl" style="text-align:center">'+__L('지난 결과')+'</div><div class="cardrow">'+gkLast.map(r=>'<div style="--cw:66px" data-act="gksel" data-k="'+r.id+'">'+gkCard(r.id)+'</div>').join('')+'</div>';
  if(!gkSel||!GKC[gkSel])gkSel=gkEq()||own[0]||'g9';
  h+='<div class="lbl">'+fmtL(__L('내 골키퍼 ({a}/{b})'),{a:own.length,b:gkIds().length})+'</div><div class="gk-col">'+gkIds().map(k=>{const has=gkHas(k);
    return '<button class="gk-t'+(k===gkSel?' on':'')+(has?'':' unk')+'" data-act="gksel" data-k="'+k+'" style="--gc:'+GRADES[GKC[k].g].c+'">'+(has?gkCard(k,{cw:74}):'<div class="pc-backface" style="--cw:74px">?</div>')
      +'<small>'+(has?(k===gkEq()?'✓ '+__L('장착 중'):'Lv.'+gkLv(k)):GRADES[GKC[k].g].n)+'</small></button>';}).join('')+'</div>';
  return h+gkDetail(gkSel)+gkOddsBox();
}
function gkDetail(id){const c=GKC[id],has=gkHas(id),lv=gkLv(id),s=gkStats(id,lv);
  let h='<div class="gk-det" style="--gc:'+GRADES[c.g].c+'"><div class="gk-dc">'+gkCard(id,{cw:118})+'</div><div class="gk-di"><b>'+c.n+'</b><small>'+GRADES[c.g].n+' · '+TYPES[c.sp].name+' · #'+c.num+'</small><div class="gk-st">'
    +GKST.map(k=>'<span>'+GKSN[k]+'</span><i><u style="width:'+Math.min(100,s[k]/7*100).toFixed(0)+'%"></u></i><b>'+(Math.round(s[k]*10)/10)+'</b>').join('')+'</div>'
    +'<div class="gk-sk"><b>'+GKS[c.sk].i+' '+GKS[c.sk].n+'</b> '+gkSkDesc(c.sk,c.g)+' · '+fmtL(__L('재사용 {c}초'),{c:GKS[c.sk].cd})+'</div>'
    +'<div class="gk-lv">'+fmtL(__L('Lv.{l} / {m} · 같은 골키퍼가 또 나오면 레벨 +1 (능력치 +{a})'),{l:lv,m:GKD.lvMax,a:GKD.lvAdd})+'</div>';
  h+=has?(id===gkEq()?'<button class="btn small" disabled>✓ '+__L('장착 중')+'</button>':'<button class="btn small primary" data-act="gkeq" data-k="'+id+'">'+__L('장착')+'</button>'):'<div class="gk-lv">'+__L('뽑기로 데려올 수 있어요')+'</div>';
  return h+'</div></div>';}
function gkOddsBox(){const o=GKD.odds,e=gkEff(),hi=o[3]+o[4],ten=gkProbs(GKD.tenMin),pp=[0,0,0,o[3]/hi*100,o[4]/hi*100];
  return '<details class="odds stk-odds gk-odds"><summary>📊 '+__L('확률 정보')+' <small>'+fmtL(__L('신화 이상 {a} · 전설 {b} (눌러서 전체 보기)'),{a:gkPct(hi),b:gkPct(o[4])})+'</small></summary><small>'
    +__L('화면의 숫자는 게임이 실제로 쓰는 값이에요.')+'<br>'+__L('뽑기 1회는 먼저 등급을 정하고, 그 등급 골키퍼 중 하나가 똑같은 확률로 나와요.')
    +'<br>'+__L('등급 확률: ')+GRADES.map((g,i)=>g.n+' '+o[i]+'%').join(' · ')
    +'<br><b>'+__L('골키퍼별 확률 (1회당)')+'</b>'+GRADES.map((G_,g)=>'<br>'+stkGradeChip(g)+' '+gkIds(g).map(k=>GKC[k].n+' '+gkPct(o[g]/gkIds(g).length)).join(' · ')).join('')
    +'<br>'+fmtL(__L('천장: 신화 이상이 {h}회 연속 안 나오면 {h}번째는 신화 이상 확정 (신화 {m} / 전설 {l}) · 신화 이상이 나오면 0으로 돌아가요'),{h:GKD.hard,m:gkPct(pp[3]),l:gkPct(pp[4])})
    +'<br>'+fmtL(__L('천장 포함 실제 확률 (1회씩 뽑을 때): {r}'),{r:GRADES.map((g,i)=>g.n+' '+gkPct(e[i])).join(' · ')})
    +'<br>'+fmtL(__L('10회 뽑기: 앞 9개에 {r} 이상이 없으면 10번째는 {r} 이상 보장 ({a})'),{r:GRADES[GKD.tenMin].n,a:[2,3,4].map(g=>GRADES[g].n+' '+gkPct(ten[g])).join(' · ')})
    +'<br>'+fmtL(__L('같은 골키퍼가 또 나오면 레벨 +1 (최대 Lv.{m}), 최대 레벨이면 {r} 환급'),{m:GKD.lvMax,r:GKD.refund.map((p,i)=>GRADES[i].n+' '+p+'P').join(' · ')})
    +'<br>'+__L('오늘의 무료 뽑기는 하루 1번이에요.')+'</small></details>';}
function gkGo(n){const r=gkDraw(n);if(!r)return;gkLast=r;gkSel=r.reduce((a,x)=>GKC[x.id].g>GKC[a.id].g?x:a,r[0]).id;try{$('#ptsN').textContent=save.points;}catch(e){}gkReveal(r,n);}
function gkReveal(res,n){let el=$('#gkFx');if(!el){el=document.createElement('div');el.id='gkFx';document.body.appendChild(el);}
  if(window.__NOFX){renderScout();return;}
  const best=Math.max(...res.map(r=>r.g)),calm=save.set.motion||RM0||save.set.fastFx,flash=save.set.flash!==false&&!calm;
  el.className='on g'+best+(flash?' fl':'')+(calm?' calm':'')+(res.length>1?' ten':'');
  el.innerHTML='<div class="stk-fxp"><div class="stk-fxt">🥅 '+__L('골키퍼 뽑기 결과')+'</div><div class="gk-fxg">'
    +res.map((r,i)=>'<div class="gk-fxc" style="--d:'+(calm?0:(i*.09+(r.g===best&&best>=3?.35:0))).toFixed(2)+'s">'+gkCard(r.id,{cw:res.length>1?84:150,tag:r.isNew?'NEW':r.up?'▲ Lv.'+r.up:r.ovf?'+'+r.ovf+'P':''})+'</div>').join('')
    +'</div><div class="row"><button class="btn small" id="gkAgain">'+__L('한 번 더')+'</button><button class="btn primary" id="gkOk">'+__L('확인')+'</button></div></div>';
  try{best>=3?SFX.fanfare():SFX.win();if(best>=3)vib([30,40,80]);}catch(e){}
  const close=()=>{el.className='';renderScout();};
  $('#gkOk').onclick=()=>{try{SFX.ui();}catch(e){}close();};
  $('#gkAgain').onclick=()=>{try{SFX.ui();}catch(e){}close();gkGo(n);};
  gkWarm();}
if(typeof APP_OV!=='undefined'){APP_OV.push('#gkFx','#gkDlg');APP_OVBTN.push('#gkOk','#gkDlgOk');}
{const o=scAct;scAct=function(a,b){
  if(a==='gkkind'){gkKind=b.dataset.k==='g'?'g':'p';scMsg='';renderScout();return true;}
  if(a==='gk1'||a==='gk10'){gkGo(a==='gk1'?1:10);return true;}
  if(a==='gksel'){gkSel=b.dataset.k;renderScout();return true;}
  if(a==='gkeq'){gkEquip(b.dataset.k);renderScout();return true;}
  return o.apply(this,arguments);};}
{const o=scWire;scWire=function(el){o.apply(this,arguments);if(scTab==='pull'&&gkKind==='g')gkWarm();};}
// ---- 팀 편성: our goalie on the board + 내 포지션 ----
function gkSqBox(n,cw){const id=gkEq(),me=gkPos(n)==='gk';
  return '<div class="sq-gkc'+(me?' me':'')+'" data-gkslot="1" style="--cw:'+Math.round(cw*.9)+'px">'+(id?gkCard(id):'<div class="sq-empty"><span>'+__L('기본 골키퍼')+'</span><small>GK</small></div>')+'<div class="sq-role">GK'+(me?' · 🎮':'')+'</div></div>';}
function gkSqRow(n){const el=$('#sqPos');if(!el)return;const cur=gkPos(n),has=!!gkEq();
  const opts=[['attacker',POSN.attacker],['mid',POSN.mid],['defender',POSN.defender],['gk','🥅 '+__L('골키퍼')]];
  el.innerHTML='<span class="sq-st-l">'+__L('내 포지션')+'</span><div class="seg sq-pos">'+opts.map(x=>{const k=x[0],off=(n<2&&k!=='attacker')||(k==='mid'&&n<3),lock=k==='gk'&&!has;
    return '<button data-pos="'+k+'" class="'+(cur===k?'on':'')+(lock?' lock':'')+'"'+(off?' disabled':'')+'>'+x[1]+(lock?' 🔒':'')+'</button>';}).join('')+'</div><small>'
    +(n<2?__L('2명 이상 경기에서 포지션을 고를 수 있어요'):cur==='gk'?__L('경기 내내 골키퍼를 직접 조종해요 · 펭귄 팀원은 모두 AI'):fmtL(__L('주장이 {r} 자리에서 시작해요'),{r:POSN[cur]})+(has?'':' · '+__L('골키퍼로 뛰려면 골키퍼 뽑기에서 골키퍼가 필요해요')))+'</small>';
  el.querySelectorAll('[data-pos]').forEach(b=>{b.onclick=()=>{const k=b.dataset.pos;try{SFX.ui();}catch(e){}if(k==='gk'&&!gkEq()){flashMsg(__L('골키퍼로 뛰려면 골키퍼 뽑기에서 골키퍼가 필요해요'));gkPick();return;}save.set.pos=k;persist();sqSel=null;renderSquad();};});
  const g=document.querySelector('#sqBoard [data-gkslot]');if(g)g.onclick=()=>{try{SFX.ui();}catch(e){}gkPick();};
  gkWarm();}
function gkPick(){let el=$('#gkDlg');if(!el){el=document.createElement('div');el.id='gkDlg';document.body.appendChild(el);}
  const ids=gkIds().filter(gkHas),eq=gkEq();
  el.innerHTML='<div class="gk-dlg"><h3>🥅 '+__L('우리 팀 골키퍼')+'</h3><div class="gk-pk">'+(ids.length?ids.map(k=>'<button class="gk-pkc'+(k===eq?' on':'')+'" data-gkp="'+k+'">'+gkCard(k,{cw:76})+'</button>').join(''):'<p>'+__L('아직 골키퍼가 없어요. 없으면 기본 골키퍼가 지켜요.')+'</p>')
    +'</div><div class="row"><button class="btn small" id="gkGoDraw">🥅 '+__L('골키퍼 뽑기')+'</button><button class="btn small primary" id="gkDlgOk">'+__L('확인')+'</button></div></div>';
  el.className='on';const close=()=>{el.className='';if(G.ui==='sSquad')renderSquad();};
  el.querySelectorAll('[data-gkp]').forEach(b=>{b.onclick=()=>{try{SFX.ui();}catch(e){}gkEquip(b.dataset.gkp);close();};});
  $('#gkDlgOk').onclick=()=>{try{SFX.ui();}catch(e){}close();};
  $('#gkGoDraw').onclick=()=>{try{SFX.ui();}catch(e){}el.className='';gkKind='g';scTab='pull';goScreen('sScout');};
  el.onclick=e=>{if(e.target===el)close();};gkWarm();}
