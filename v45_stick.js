/* ================= v45: 🏒 stick workshop — draw materials, craft your own stick, upgrade it (2026-11-14) ================= */
// The owner: "draw the materials yourself and build your own hockey stick — two kinds of material, ten each, graded like the
// penguins; every combination has its own ability, and it can be upgraded". So:
//  · two parts, 샤프트 (shaft) and 블레이드 (blade), ten materials each, in the five penguin grades (3 기본 · 3 희귀 · 2 레어 · 1 신화 · 1 전설)
//  · every material has a style (파워 / 스피드 / 컨트롤); the shaft's style × the blade's style picks one of nine abilities,
//    and the two materials' grades + the stick's level decide how strong the stats and the ability are (100 combinations)
//  · materials come from a points-only draw (no real money). The odds on screen are the numbers below; a hard pity and a
//    10-draw guarantee as in the scout centre; a free draw every day
//  · 강화 +1 … +10 with points: the success rate on screen is the one the code rolls (fail bonus, a guaranteed try after 5 fails,
//    a failure never lowers the level)
//  · the captain (first skater of the player's team) carries the equipped stick in offline matches; online friend matches stay
//    flat (no stick stats), exactly like card levels
// Every number that reaches the screen comes from stkCalc / stkProbs, which are what the game uses.
var STK={cost1:30,cost10:270,odds:[50,30,14,5,1],tenMin:2,hard:30,cap:99,refund:[3,6,15,40,100],craft:[10,20,35,60,100],max:12,
  lvMax:10,enh:[100,95,90,80,70,60,50,40,35,30],enhG:[0,3,6,9,12],failB:8,failMax:4,pity:5,enhC0:25,enhCK:20,
  main:[2,3,4,5,6],off:[1,1,2,2,3],lvAdd:.4,k:{pow:.6,chg:1.2,spr:2,pass:.6},histMax:30};
// style: P 파워 · S 스피드 · C 컨트롤; art: base colour, accent, texture
var STK_ST={P:{n:__L('파워'),i:'💥',c:'#ff7a59'},S:{n:__L('스피드'),i:'⚡',c:'#ffd34d'},C:{n:__L('컨트롤'),i:'🎯',c:'#5fd0ff'}};
var STK_M={
  s0:{n:__L('자작나무'),g:0,st:'P',c:'#ece4d2',a:'#3b3530',t:'birch'},
  s1:{n:__L('대나무'),g:0,st:'S',c:'#cfc66a',a:'#6f7f22',t:'bamboo'},
  s2:{n:__L('알루미늄'),g:0,st:'C',c:'#c9d2db',a:'#7d8a98',t:'metal'},
  s3:{n:__L('참나무'),g:1,st:'P',c:'#a8743f',a:'#5e3b1a',t:'grain'},
  s4:{n:__L('유리섬유'),g:1,st:'S',c:'#e6f0f3',a:'#93b2c0',t:'weave'},
  s5:{n:__L('흑단'),g:1,st:'C',c:'#2f2724',a:'#6a564c',t:'grain'},
  s6:{n:__L('티타늄'),g:2,st:'P',c:'#9aa7bc',a:'#4b5870',t:'metal'},
  s7:{n:__L('카본'),g:2,st:'S',c:'#2a2d33',a:'#545b65',t:'carbon'},
  s8:{n:__L('오로라 크리스탈'),g:3,st:'C',c:'#5ee7d0',a:'#8a5cff',t:'aurora'},
  s9:{n:__L('운석'),g:4,st:'P',c:'#3b3431',a:'#ff8a3d',t:'meteor'},
  b0:{n:__L('무쇠'),g:0,st:'P',c:'#50565f',a:'#2a2d33',t:'hammer'},
  b1:{n:__L('고무'),g:0,st:'S',c:'#30353b',a:'#5d6670',t:'dots'},
  b2:{n:__L('포플러'),g:0,st:'C',c:'#efe2c4',a:'#b39b6e',t:'grain'},
  b3:{n:__L('흑요석'),g:1,st:'P',c:'#1f1d27',a:'#7a68a6',t:'glass'},
  b4:{n:__L('빙하 얼음'),g:1,st:'S',c:'#c4ebff',a:'#4fa9dd',t:'ice'},
  b5:{n:__L('산호'),g:1,st:'C',c:'#ff8f7d',a:'#ffd6c0',t:'coral'},
  b6:{n:__L('그래핀'),g:2,st:'S',c:'#2a3038',a:'#7fd3ff',t:'hex'},
  b7:{n:__L('진주'),g:2,st:'C',c:'#f5f2ec',a:'#c6b4e8',t:'pearl'},
  b8:{n:__L('심해 사파이어'),g:3,st:'P',c:'#2050d8',a:'#86c6ff',t:'gem'},
  b9:{n:__L('북극성 조각'),g:4,st:'S',c:'#fff3c4',a:'#ffc233',t:'star'}
};
var STK_PART={s:{n:__L('샤프트'),sub:__L('스틱 자루')},b:{n:__L('블레이드'),sub:__L('스틱 날')}};
// abilities: shaft style + blade style → [key, name, base, per grade, per level]
var STK_AB={
  PP:{k:'cannon',n:__L('대포알 슛'),v:[3,1,.4]},
  PS:{k:'onetime',n:__L('원타이머 장인'),v:[4,1.5,.5],w:[.1,.05]},
  PC:{k:'wrist',n:__L('손목 스냅'),v:[6,2,.6]},
  SP:{k:'quick',n:__L('퀵 릴리스'),v:[5,2,.6]},
  SS:{k:'bolt',n:__L('번개 패스'),v:[5,2,.6]},
  SC:{k:'reach',n:__L('긴 팔'),v:[.1,.04,.015]},
  CP:{k:'sniper',n:__L('스나이퍼'),v:[15,4,1.5]},
  CS:{k:'poke',n:__L('포크 체크'),v:[6,2,.8]},
  CC:{k:'tech',n:__L('테크니션'),v:[4,1.5,.5]}
};
function stkAbDesc(ab){const v=ab.v,w=ab.w;switch(ab.k){
  case 'cannon':return fmtL(__L('80% 이상 충전한 강슛 위력 +{v}%'),{v});
  case 'onetime':return fmtL(__L('원타이머 위력 +{v}% · 원타이머 시간 +{w}초'),{v,w});
  case 'wrist':return fmtL(__L('톡 슛(짧게 누른 슛) 위력 +{v}%'),{v});
  case 'quick':return fmtL(__L('슛 충전 속도 +{v}%'),{v});
  case 'bolt':return fmtL(__L('패스 속도 +{v}%'),{v});
  case 'reach':return fmtL(__L('상대 패스·슛 가로채기 범위 +{v}m'),{v});
  case 'sniper':return fmtL(__L('80% 이상 충전한 강슛 오차 -{v}%'),{v});
  case 'poke':return fmtL(__L('뺏기 성공률 +{v}%'),{v});
  case 'tech':return fmtL(__L('특수 기술 쿨다운 -{v}%'),{v});}return '';}
const stkR1=x=>Math.round(x*10)/10,stkR2=x=>Math.round(x*100)/100;
function stkIds(part){return Object.keys(STK_M).filter(k=>k[0]===part);}
function stkGradeIds(part,g){return stkIds(part).filter(k=>STK_M[k].g===g);}
// --- save (save.stk is created by the save default / loader; this keeps it whole) ---
function stk(){const o=save.stk||(save.stk={});if(!o.m||typeof o.m!=='object')o.m={};if(!Array.isArray(o.list))o.list=[];if(!(o.nu>=1))o.nu=1;
  if(!o.pity||typeof o.pity!=='object')o.pity={s:0,b:0};if(!(o.pulls>=0))o.pulls=0;if(typeof o.free!=='string')o.free='';if(!Array.isArray(o.hist))o.hist=[];
  if(o.list.length&&!o.list.some(x=>x.u===o.eq))o.eq=0;return o;}
function stkGet(u){return stk().list.find(x=>x.u===u)||null;}
function stkEq(){const o=stk();return o.eq?stkGet(o.eq):null;}
// --- one stick's numbers (the screen and the game both read this) ---
function stkGrade(s,b){return Math.round((STK_M[s].g+STK_M[b].g)/2);}
function stkCalc(x){
  const S=STK_M[x.s],B=STK_M[x.b],lv=Math.max(0,Math.min(STK.lvMax,x.lv|0)),g=stkGrade(x.s,x.b),pt={P:0,S:0,C:0};
  for(const m of[S,B])for(const k of['P','S','C'])pt[k]+=k===m.st?STK.main[m.g]:STK.off[m.g];
  for(const k of['P','S','C'])pt[k]=stkR1(pt[k]+STK.lvAdd*lv);
  const fx={pow:stkR1(pt.P*STK.k.pow),chg:stkR1(pt.S*STK.k.chg),spr:stkR1(pt.C*STK.k.spr),pass:stkR1(pt.C*STK.k.pass)};
  const A=STK_AB[S.st+B.st],v=A.v,ab={k:A.k,n:A.n,key:S.st+B.st,v:(A.k==='reach'?stkR2:stkR1)(v[0]+v[1]*g+v[2]*lv)};
  if(A.w)ab.w=stkR2(A.w[0]+A.w[1]*g);
  return {g,lv,pt,fx,ab,name:fmtL(__L('{a} 스틱'),{a:A.n}),mats:fmtL(__L('{s} 샤프트 · {b} 블레이드'),{s:S.n,b:B.n})};
}
// the stick on top of the penguin's own personality (TT): multipliers multiply, ranges add
function stkTT(type,c){
  const o=Object.assign({},TT[type]||{}),mul=(k,v)=>{o[k]=(o[k]||1)*v;},f=c.fx,a=c.ab;
  mul('pow',1+f.pow/100);mul('tap',1+f.pow/100);mul('chg',1+f.chg/100);mul('spread',1-f.spr/100);mul('pass',1+f.pass/100);
  if(a.k==='cannon')mul('pow80',1+a.v/100);else if(a.k==='onetime'){mul('ot',1+a.v/100);o.otw=(o.otw||0)+a.w;}
  else if(a.k==='wrist')mul('tap',1+a.v/100);else if(a.k==='quick')mul('chg',1+a.v/100);else if(a.k==='bolt')mul('pass',1+a.v/100);
  else if(a.k==='reach')o.reach=(o.reach||0)+a.v;else if(a.k==='sniper')mul('spread80',1-a.v/100);
  else if(a.k==='poke')mul('steal',1+a.v/100);else if(a.k==='tech')mul('cd',1-a.v/100);
  return o;
}
// in a match: the captain carries the equipped stick (stats offline only; online friend matches are flat)
function stkApply(p,cfg){
  const x=stkEq();if(!p||p.goalie||!x)return false;
  p.stk=x;p.stkC=stkCalc(x);if(!(cfg&&cfg.flat))p.tt=stkTT(p.type,p.stkC);
  try{stkLook(p.pg,p.team.key,x);}catch(e){}
  return true;
}
// --- the 3D stick in the materials' colours (same shape as pkStickGeo; the team band stays) ---
function stkGeo(teamKey,x){const ck=(pkHi()?'U':'')+'skc'+teamKey+TEAM[teamKey].color+x.s+x.b;if(pkGeoC[ck])return pkGeoC[ck];
  const L=1.2,tc=pkRGB(TEAM[teamKey].color),list=[],sh=pkRGB(parseInt(STK_M[x.s].c.slice(1),16)),sa=pkRGB(parseInt(STK_M[x.s].a.slice(1),16)),
    bl=pkRGB(parseInt(STK_M[x.b].c.slice(1),16)),ba=pkRGB(parseInt(STK_M[x.b].a.slice(1),16)),tape=[.05,.05,.06],wht=[.95,.96,.97];
  const seg=(z0,z1,w,h,col)=>{const b=new T.BoxGeometry(w,h,z1-z0);b.translate(0,0,(z0+z1)/2);list.push([b,col]);};
  seg(0,.1,.05,.04,tape);seg(.1,L*.3,.042,.03,sh);seg(L*.3,L*.34,.043,.031,sa);seg(L*.34,L*.46,.043,.031,tc);seg(L*.46,L*.5,.043,.031,sa);seg(L*.5,L,.042,.03,sh);
  const bln=.34,bh=.075,b=new T.BoxGeometry(.02,bh,bln);b.translate(0,bh*.25,bln/2);b.rotateX(-.62);b.translate(0,0,L);list.push([b,bl]);
  const s1=new T.BoxGeometry(.022,.014,bln*.9);s1.translate(0,bh*.25,bln/2);s1.rotateX(-.62);s1.translate(0,0,L);list.push([s1,ba]);
  return pkGeoC[ck]=pkMerge(list);}
function stkLook(P,teamKey,x){if(!P||!P.stick||!x)return;const m=P.stick.children[0];if(m&&m.isMesh)m.geometry=stkGeo(teamKey,x);}
// --- the draw: grade first (STK.odds), then one material of that grade in the chosen part, all equally likely ---
// hard pity: the STK.hard-th draw of a part since its last 신화 or better is 신화 or better (신화 : 전설 = their odds);
// 10 draws: when the first nine have nothing of STK.tenMin or better, the tenth is at least that (odds renormalised)
function stkProbs(part,minG){
  const o=STK.odds.slice(),pity=(stk().pity[part]|0)+1>=STK.hard;let lo=minG|0;if(pity)lo=Math.max(lo,3);
  for(let i=0;i<lo;i++)o[i]=0;const s=o.reduce((a,v)=>a+v,0);return o.map(v=>v/s*100);
}
function stkMatRate(id,minG){const m=STK_M[id];return stkProbs(id[0],minG)[m.g]/stkGradeIds(id[0],m.g).length;}
// long-run rates with the pity included, drawing one at a time (exact: the pity counter is a Markov chain)
function stkEff(){const o=STK.odds,hi=(o[3]+o[4])/100;let e=0,q=1;for(let k=0;k<STK.hard;k++){e+=q;q*=k===STK.hard-1?0:(1-hi);}
  const ph=1/e,lo=o[0]+o[1]+o[2];return [o[0]/lo*(1-ph)*100,o[1]/lo*(1-ph)*100,o[2]/lo*(1-ph)*100,o[3]/(o[3]+o[4])*ph*100,o[4]/(o[3]+o[4])*ph*100];}
function stkRoll(part,minG){
  const p=stkProbs(part,minG),r=Math.random()*100;let acc=0,g=4;
  for(let i=0;i<5;i++){acc+=p[i];if(p[i]>0&&r<acc){g=i;break;}}
  const ids=stkGradeIds(part,g);return ids[Math.floor(Math.random()*ids.length)]||ids[0];
}
function stkGrant(id){const o=stk(),n=o.m[id]|0;if(n>=STK.cap){save.points+=STK.refund[STK_M[id].g];return {id,isNew:false,ovf:STK.refund[STK_M[id].g]};}
  o.m[id]=n+1;const isNew=!o.seen||!o.seen[id];(o.seen||(o.seen={}))[id]=1;return {id,isNew,ovf:0};}
function stkDrawOnce(part,minG){
  const o=stk(),id=stkRoll(part,minG),g=STK_M[id].g;o.pulls++;
  if(g>=3)o.pity[part]=0;else o.pity[part]=(o.pity[part]|0)+1;
  const r=stkGrant(id);o.hist.unshift([id,g]);if(o.hist.length>STK.histMax)o.hist.length=STK.histMax;r.g=g;return r;
}
function stkFreeReady(){return stk().free!==todayKey();}
// n = 1 or 10; returns the results (or null when the points are short)
function stkDraw(part,n){
  if(part!=='s'&&part!=='b')return null;const o=stk(),free=n===1&&stkFreeReady(),cost=free?0:n===1?STK.cost1:STK.cost10;
  if(save.points<cost){lackMsg(cost);return null;}
  save.points-=cost;if(free)o.free=todayKey();
  const res=[];for(let i=0;i<n;i++)res.push(stkDrawOnce(part,i===9&&!res.some(r=>r.g>=STK.tenMin)?STK.tenMin:0));
  persist();return res;
}
// --- craft / upgrade / equip / take apart ---
function stkCraftCost(s,b){return STK.craft[stkGrade(s,b)];}
function stkCanCraft(s,b){const o=stk();return !!(STK_M[s]&&STK_M[b]&&s[0]==='s'&&b[0]==='b'&&(o.m[s]|0)>0&&(o.m[b]|0)>0&&o.list.length<STK.max);}
function stkCraft(s,b){
  const o=stk();if(!stkCanCraft(s,b))return null;const c=stkCraftCost(s,b);if(save.points<c){lackMsg(c);return null;}
  save.points-=c;o.m[s]--;o.m[b]--;const x={u:o.nu++,s,b,lv:0,f:0};o.list.push(x);if(!o.eq)o.eq=x.u;persist();return x;
}
function stkEnhCost(lv){return STK.enhC0+STK.enhCK*lv;}
function stkEnhRate(x){if(x.lv>=STK.lvMax)return 0;if((x.f|0)>=STK.pity)return 100;
  return Math.min(100,STK.enh[x.lv]+STK.enhG[stkGrade(x.s,x.b)]+Math.min(STK.failMax,x.f|0)*STK.failB);}
function stkEnhance(u){
  const x=stkGet(u);if(!x||x.lv>=STK.lvMax)return null;const c=stkEnhCost(x.lv);if(save.points<c){lackMsg(c);return null;}
  save.points-=c;const rate=stkEnhRate(x),ok=Math.random()*100<rate;
  if(ok){x.lv++;x.f=0;}else x.f=(x.f|0)+1;persist();return {ok,rate,lv:x.lv,cost:c};
}
function stkEquip(u){const o=stk();if(u&&!stkGet(u))return false;o.eq=u|0;persist();return true;}
// taking a stick apart gives both materials back (when there is room) — its level is lost
function stkBreak(u){const o=stk(),i=o.list.findIndex(x=>x.u===u);if(i<0)return null;const x=o.list[i];o.list.splice(i,1);if(o.eq===u)o.eq=0;
  let pts=0;for(const id of[x.s,x.b]){if((o.m[id]|0)>=STK.cap){pts+=STK.refund[STK_M[id].g];}else o.m[id]=(o.m[id]|0)+1;}save.points+=pts;persist();return {x,pts};}
// spare materials → points
function stkSell(id,n){const o=stk(),have=o.m[id]|0;n=Math.max(0,Math.min(have,n|0));if(!n||!STK_M[id])return 0;o.m[id]=have-n;const p=n*STK.refund[STK_M[id].g];save.points+=p;persist();return p;}
// --- art: every material has its own texture (SVG pattern), used on the swatches and on the stick drawing ---
var stkUid=0;
function stkPat(id,pid){
  const m=STK_M[id],c=m.c,a=m.a,P=(w,h,body,extra)=>'<pattern id="'+pid+'" patternUnits="userSpaceOnUse" width="'+w+'" height="'+h+'"'+(extra||'')+'><rect width="'+w+'" height="'+h+'" fill="'+c+'"/>'+body+'</pattern>';
  switch(m.t){
    case 'birch':return P(44,14,'<rect x="3" y="3" width="8" height="1.7" rx=".85" fill="'+a+'" opacity=".85"/><rect x="22" y="9" width="5" height="1.5" rx=".75" fill="'+a+'" opacity=".75"/><rect x="33" y="4.5" width="3" height="1.2" rx=".6" fill="'+a+'" opacity=".6"/><rect x="14" y="11.5" width="11" height=".7" fill="#b9ad98" opacity=".7"/><rect x="0" y="7" width="44" height=".5" fill="#fff" opacity=".35"/>');
    case 'bamboo':return P(46,14,'<rect x="0" y="0" width="1.6" height="14" fill="'+a+'"/><rect x="1.6" y="0" width="1.2" height="14" fill="#f4f0b0" opacity=".8"/><rect x="2.8" y="0" width=".8" height="14" fill="'+a+'" opacity=".5"/><path d="M8 4h14M26 10h12" stroke="'+a+'" stroke-width=".6" opacity=".35"/>');
    case 'metal':return P(30,6,'<path d="M0 1.5h30M0 3.5h30M0 5h30" stroke="#fff" stroke-width=".35" opacity=".35"/><path d="M0 2.5h30M0 4.3h30" stroke="'+a+'" stroke-width=".35" opacity=".3"/>');
    case 'grain':return P(64,12,'<path d="M0 3c10-2 20 2 32 0s22-2 32 0M0 7.5c12 1.5 22-1.5 34 0s20 1.5 30 0M0 10.5c8-1 18 1 30-.5s24 1 34 .5" fill="none" stroke="'+a+'" stroke-width=".8" opacity=".55"/><ellipse cx="44" cy="5.2" rx="3.2" ry="1.1" fill="none" stroke="'+a+'" stroke-width=".6" opacity=".45"/>');
    case 'weave':return P(8,8,'<rect width="4" height="4" fill="#fff" opacity=".55"/><rect x="4" y="4" width="4" height="4" fill="#fff" opacity=".55"/><path d="M0 2h4M4 6h4M6 0v4M2 4v4" stroke="'+a+'" stroke-width=".5" opacity=".7"/>');
    case 'carbon':return P(8,8,'<rect width="4" height="4" fill="'+a+'"/><rect x="4" y="4" width="4" height="4" fill="'+a+'"/><path d="M0 .8h4M4 4.8h4" stroke="#8a929c" stroke-width=".5" opacity=".6"/><path d="M4.8 0v4M.8 4v4" stroke="#11141a" stroke-width=".6" opacity=".7"/>');
    case 'aurora':return '<linearGradient id="'+pid+'" x1="0" y1="0" x2="1" y2=".35"><stop offset="0" stop-color="'+c+'"/><stop offset=".45" stop-color="#7fb8ff"/><stop offset=".7" stop-color="'+a+'"/><stop offset="1" stop-color="'+c+'"/></linearGradient>';
    case 'meteor':return P(26,14,'<circle cx="5" cy="4" r="1.3" fill="'+a+'"/><circle cx="5" cy="4" r="2.6" fill="'+a+'" opacity=".25"/><circle cx="17" cy="10" r=".9" fill="#ffc06b"/><circle cx="21" cy="3" r=".6" fill="'+a+'" opacity=".8"/><path d="M8 8l4 1.5 3-2.5M1 12l3-1" stroke="'+a+'" stroke-width=".6" fill="none" opacity=".8"/><circle cx="12" cy="2" r="1.6" fill="#2a2523"/>');
    case 'hammer':return P(10,10,'<circle cx="3" cy="3" r="2.2" fill="'+a+'" opacity=".55"/><circle cx="2.4" cy="2.4" r="1.2" fill="#8a929c" opacity=".35"/><circle cx="8" cy="8" r="2" fill="'+a+'" opacity=".5"/><circle cx="7.5" cy="7.4" r="1" fill="#8a929c" opacity=".3"/>');
    case 'dots':return P(5,5,'<circle cx="1.25" cy="1.25" r=".6" fill="'+a+'"/><circle cx="3.75" cy="3.75" r=".6" fill="'+a+'"/>');
    case 'glass':return '<linearGradient id="'+pid+'" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="'+c+'"/><stop offset=".38" stop-color="'+c+'"/><stop offset=".5" stop-color="'+a+'"/><stop offset=".6" stop-color="'+c+'"/><stop offset="1" stop-color="#0c0b10"/></linearGradient>';
    case 'ice':return P(40,16,'<rect width="40" height="5" fill="#fff" opacity=".35"/><path d="M4 16l5-7 6 2 4-8M24 0l3 6 7 1 3 9M15 11l-3 5" fill="none" stroke="#fff" stroke-width=".7" opacity=".9"/><path d="M9 9l-2-4" stroke="'+a+'" stroke-width=".5" opacity=".6"/>');
    case 'coral':return P(10,10,'<circle cx="2.5" cy="2.5" r="1.3" fill="'+a+'" opacity=".8"/><circle cx="7.5" cy="7" r="1.6" fill="'+a+'" opacity=".7"/><circle cx="7.8" cy="2" r=".6" fill="#e2604f" opacity=".6"/><circle cx="2" cy="8" r=".7" fill="#e2604f" opacity=".5"/>');
    case 'hex':return P(12,20.78,'<path d="M3 0l-3 5.2 3 5.2h6l3-5.2L9 0M3 10.4l-3 5.2 3 5.2M9 10.4l3 5.2-3 5.2M3 20.78h6M3 10.4h6" fill="none" stroke="'+a+'" stroke-width=".55" opacity=".65"/>',' patternTransform="scale(.7)"');
    case 'pearl':return '<linearGradient id="'+pid+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#f7ecff"/><stop offset=".55" stop-color="#e6f5ff"/><stop offset=".8" stop-color="#fff0ee"/><stop offset="1" stop-color="'+a+'"/></linearGradient>';
    case 'gem':return P(16,12,'<path d="M0 0l8 6L0 12z" fill="#163a9e" opacity=".55"/><path d="M8 6l8-6v12z" fill="'+a+'" opacity=".35"/><path d="M0 0h16L8 6z" fill="#fff" opacity=".18"/><path d="M0 0l8 6 8-6M0 12l8-6 8 6" fill="none" stroke="#bfe0ff" stroke-width=".4" opacity=".7"/>');
    case 'star':return P(22,16,'<rect width="22" height="16" fill="'+a+'" opacity=".22"/><path d="M6 3l.8 2.2L9 6l-2.2.8L6 9l-.8-2.2L3 6l2.2-.8z" fill="#fff"/><path d="M16 9.5l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5z" fill="'+a+'"/><circle cx="17" cy="3" r=".7" fill="#fff"/><circle cx="2" cy="13" r=".5" fill="#fff"/>');
  }
  return '';
}
function stkTeamHex(){try{return '#'+(TEAM[save.team||'blue'].color>>>0).toString(16).padStart(6,'0');}catch(e){return '#2f7bff';}}
// a material swatch (square tile)
function stkSwatch(id,sz){
  const u='sp'+(++stkUid),m=STK_M[id];sz=sz||48;
  return '<svg class="stk-sw" viewBox="0 0 48 48" width="'+sz+'" height="'+sz+'" aria-hidden="true"><defs>'+stkPat(id,u)+'<linearGradient id="'+u+'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient></defs>'
    +'<rect x="2" y="2" width="44" height="44" rx="10" fill="'+m.c+'"/><rect x="2" y="2" width="44" height="44" rx="10" fill="url(#'+u+')"/><rect x="2" y="2" width="44" height="44" rx="10" fill="url(#'+u+'g)"/>'
    +'<rect x="2.6" y="2.6" width="42.8" height="42.8" rx="9.5" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".9"/>'
    +'<path d="M6 12c10-6 26-7 36-2" stroke="#fff" stroke-opacity=".28" stroke-width="2.2" stroke-linecap="round" fill="none"/>'
    +'</svg>';
}
// the whole stick (o.hi = 's' | 'b' dims the other part; o.dim draws a silhouette)
function stkSvg(x,o){
  o=o||{};const u='sk'+(++stkUid),S=STK_M[x.s],B=STK_M[x.b],tc=o.team||stkTeamHex(),c=x.s&&x.b?stkCalc(x):null,gc=c?GRADES[c.g].c:'#9fb4c8';
  const ds=o.hi==='b'?' opacity=".32"':'',db=o.hi==='s'?' opacity=".32"':'';
  const glow=c&&c.g>=3&&!o.dim?' filter="url(#'+u+'f)"':'';
  const bp='M198 57 C207 62 214 68 222 69 L280 69 C291 69 296 73 295 79 C294 84 288 86 281 86 L226 86 C214 86 204 80 199 70 C196 64 195 60 198 57 Z';
  let h='<svg class="stk-svg" viewBox="0 0 300 92" aria-hidden="true"><defs>'+stkPat(x.s,u+'s')+stkPat(x.b,u+'b')
    +'<linearGradient id="'+u+'l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".42" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>'
    +'<linearGradient id="'+u+'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>'
    +'<pattern id="'+u+'t" patternUnits="userSpaceOnUse" width="5" height="12" patternTransform="rotate(28)"><rect width="5" height="12" fill="#15181d"/><rect width="1" height="12" fill="#3a3f47"/></pattern>'
    +'<clipPath id="'+u+'c"><path d="'+bp+'"/></clipPath><pattern id="'+u+'w" patternUnits="userSpaceOnUse" width="4" height="40" patternTransform="rotate(-24)"><rect width="4" height="40" fill="#f4f6f9"/><rect width=".9" height="40" fill="#c3ccd6"/></pattern>'
    +(glow?'<filter id="'+u+'f" x="-10%" y="-40%" width="120%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="2.4" flood-color="'+gc+'" flood-opacity=".9"/></filter>':'')
    +'</defs><g'+glow+'>';
  // shaft: drawn flat, then tilted 15.3° from the butt (16,12) — it ends at the heel (~214,66)
  h+='<g transform="translate(16,14) rotate(15.3)"'+ds+'>'
    +'<rect x="0" y="-6" width="206" height="12" rx="3" fill="'+(o.dim?'#7b8fa6':S.c)+'"/>'
    +(o.dim?'':'<rect x="0" y="-6" width="206" height="12" rx="3" fill="url(#'+u+'s)"/>')
    +'<rect x="94" y="-6.3" width="30" height="12.6" fill="'+(o.dim?'#8da0b6':tc)+'"/><rect x="94" y="-6.3" width="2" height="12.6" fill="'+(o.dim?'#a7b6c8':S.a)+'"/><rect x="122" y="-6.3" width="2" height="12.6" fill="'+(o.dim?'#a7b6c8':S.a)+'"/>'
    +'<rect x="0" y="-6.4" width="30" height="12.8" rx="3" fill="url(#'+u+'t)"/><rect x="-1" y="-6.6" width="5" height="13.2" rx="2.4" fill="#0f1216"/>'
    +'<rect x="0" y="-6" width="206" height="12" rx="3" fill="url(#'+u+'l)"/>'
    +'<rect x="0" y="-6" width="206" height="12" rx="3" fill="none" stroke="#06121f" stroke-opacity=".55" stroke-width=".8"/>'
    +'</g>';
  // blade: heel under the shaft end, flat to a rounded toe
  h+='<g'+db+'><path d="'+bp+'" fill="'+(o.dim?'#7b8fa6':B.c)+'"/>'+(o.dim?'':'<path d="'+bp+'" fill="url(#'+u+'b)"/>')
    +(o.dim?'':'<path d="M222 69 L280 69 C288 69 293 71 294.5 75" fill="none" stroke="'+B.a+'" stroke-width="1.6" opacity=".9"/>')
    +'<path d="'+bp+'" fill="url(#'+u+'k)"/><path d="'+bp+'" fill="none" stroke="#06121f" stroke-opacity=".55" stroke-width=".8"/>'
    +'<g clip-path="url(#'+u+'c)" opacity="'+(o.dim?'.3':'1')+'"><rect x="196" y="54" width="26" height="36" fill="url(#'+u+'w)"/><rect x="221" y="54" width="1.2" height="36" fill="#9aa7b4"/></g>'
    +'</g></g></svg>';
  return h;
}
// ---------------- the 🏒 스틱 공방 screen ----------------
let stkTop=false,stkTab='',stkPart='s',stkSelS=null,stkSelB=null,stkSel=0,stkMsg='',stkLast=null,stkFxOn=false,stkHit=null;
const stkGradeChip=g=>'<b class="stk-g" style="--gc:'+GRADES[g].c+'">'+GRADES[g].n+'</b>';
const stkPct=v=>(Math.round(v*100)/100).toFixed(2)+'%';
function stkStatsHtml(c,nx){
  const row=(k,v,txt,nv)=>'<div class="stk-st"><span class="stk-sn">'+STK_ST[k].i+' '+STK_ST[k].n+'</span><i class="stk-bar"><u style="width:'+Math.min(100,v/14*100).toFixed(1)+'%;background:'+STK_ST[k].c+'"></u></i><b>'+v.toFixed(1)+(nv!=null&&nv!==v?'<em>→'+nv.toFixed(1)+'</em>':'')+'</b><small>'+txt+'</small></div>';
  return '<div class="stk-stats">'+row('P',c.pt.P,fmtL(__L('슛 위력 +{v}%'),{v:c.fx.pow}),nx&&nx.pt.P)+row('S',c.pt.S,fmtL(__L('충전 속도 +{v}%'),{v:c.fx.chg}),nx&&nx.pt.S)
    +row('C',c.pt.C,fmtL(__L('슛 오차 -{v}% · 패스 +{p}%'),{v:c.fx.spr,p:c.fx.pass}),nx&&nx.pt.C)+'</div>';
}
function stkAbHtml(c,nx){const k=c.ab.key;
  return '<div class="stk-ab"><span class="stk-abk">'+STK_ST[k[0]].i+STK_ST[k[1]].i+'</span><div><b>'+c.ab.n+'</b><small>'+stkAbDesc(c.ab)+'</small>'
    +(nx&&nx.ab.v!==c.ab.v?'<small class="stk-nx">'+fmtL(__L('다음 단계: {d}'),{d:stkAbDesc(nx.ab)})+'</small>':'')+'</div></div>';}
function stkPullHtml(){
  const o=stk(),part=stkPart,free=stkFreeReady(),n=(o.pity[part]|0)+1,P=stkProbs(part,0),hi=P[3]+P[4];
  const demo={s:part==='s'?'s7':'s1',b:part==='b'?'b6':'b2'};
  let h='<div class="stk-parts">'+['s','b'].map(p=>'<button class="stk-part'+(p===part?' on':'')+'" data-sk="part" data-p="'+p+'">'+stkSvg({s:p==='s'?'s7':'s2',b:p==='b'?'b6':'b1'},{hi:p})
    +'<b>'+STK_PART[p].n+'</b><small>'+STK_PART[p].sub+' · '+fmtL(__L('{n}종'),{n:stkIds(p).length})+'</small></button>').join('')+'</div>';
  h+='<div class="gpity"><div class="gpity-row"><b>'+fmtL(__L('{p} 신화 이상 천장'),{p:STK_PART[part].n})+'</b><span>'+(o.pity[part]|0)+' / '+STK.hard+'</span></div><div class="gpity-bar"><i style="width:'+((o.pity[part]|0)/STK.hard*100).toFixed(1)+'%"></i></div>'
    +'<div class="gpity-sub">'+(n>=STK.hard?__L('🎯 이번 뽑기 신화 이상 확정!'):fmtL(__L('다음 뽑기 신화 이상 {p}'),{p:'<b>'+stkPct(hi)+'</b>'})+' · '+fmtL(__L('{h}회차 확정'),{h:STK.hard}))+'</div></div>';
  const b=(act,cls,title,cost,sub)=>{const lack=save.points<cost;return '<button class="btn gb-b'+cls+(lack?' lack':'')+'" data-sk="'+act+'"><b>'+title+'</b><small>'+sub+'</small>'+(lack?'<em>'+fmtL(__L('{p}P 부족'),{p:cost-save.points})+'</em>':'')+'</button>';};
  h+='<div class="gpbtn">'+b('d1','',free?__L('무료 1회 🎁'):__L('1회 뽑기'),free?0:STK.cost1,free?__L('오늘의 무료 뽑기'):'⭐ '+STK.cost1+'P')
    +b('d10',' primary',__L('10회 뽑기'),STK.cost10,'⭐ '+fmtL(__L('{c}P · {r} 이상 1개 보장'),{c:STK.cost10,r:GRADES[STK.tenMin].n}))+'</div>';
  h+='<div class="gb-bal"><span>'+fmtL(__L('보유 ⭐ {p}P'),{p:'<b>'+save.points+'</b>'})+'</span><span>'+__L('현금 결제 없이 포인트로만 뽑아요')+'</span></div>';
  if(stkLast&&stkLast.part===part)h+='<div class="lbl" style="text-align:center">'+__L('지난 결과')+'</div><div class="stk-res">'+stkLast.res.map(r=>stkTile(r.id,{tag:r.isNew?'NEW':''})).join('')+'</div>';
  h+='<div class="lbl">'+fmtL(__L('{p} 도감 ({a}/{b})'),{p:STK_PART[part].n,a:stkIds(part).filter(k=>o.seen&&o.seen[k]).length,b:stkIds(part).length})+'</div><div class="stk-col">'+stkIds(part).map(k=>stkTile(k,{dex:1})).join('')+'</div>';
  return h+stkOddsBox(part);
}
function stkOddsBox(part){
  const o=STK.odds,e=stkEff(),hi=o[3]+o[4],ten=stkProbs(part,STK.tenMin),pp=[0,0,0,o[3]/hi*100,o[4]/hi*100];
  return '<details class="odds stk-odds"><summary>📊 '+__L('확률 정보')+' <small>'+fmtL(__L('신화 이상 {a} · 전설 {b} (눌러서 전체 보기)'),{a:stkPct(hi),b:stkPct(o[4])})+'</small></summary><small>'
    +__L('화면의 숫자는 게임이 실제로 쓰는 값이에요.')+'<br>'+__L('뽑기 1회는 먼저 등급을 정하고, 고른 부위(샤프트 또는 블레이드)에서 그 등급 재료 중 하나가 똑같은 확률로 나와요.')
    +'<br>'+__L('등급 확률: ')+GRADES.map((g,i)=>g.n+' '+o[i]+'%').join(' · ')
    +'<br><b>'+fmtL(__L('{p} 재료별 확률 (1회당)'),{p:STK_PART[part].n})+'</b>'
    +GRADES.map((G_,g)=>'<br>'+stkGradeChip(g)+' '+stkGradeIds(part,g).map(k=>STK_M[k].n+' '+stkPct(o[g]/stkGradeIds(part,g).length)).join(' · ')).join('')
    +'<br>'+fmtL(__L('천장: 부위마다 신화 이상이 {h}회 연속 안 나오면 {h}번째는 신화 이상 확정 (신화 {m} / 전설 {l}) · 신화 이상이 나오면 0으로 돌아가요'),{h:STK.hard,m:stkPct(pp[3]),l:stkPct(pp[4])})
    +'<br>'+fmtL(__L('천장 포함 실제 확률 (1회씩 뽑을 때): {r}'),{r:GRADES.map((g,i)=>g.n+' '+stkPct(e[i])).join(' · ')})
    +'<br>'+fmtL(__L('10회 뽑기: 앞 9개에 {r} 이상이 없으면 10번째는 {r} 이상 보장 ({a})'),{r:GRADES[STK.tenMin].n,a:[2,3,4].map(g=>GRADES[g].n+' '+stkPct(ten[g])).join(' · ')})
    +'<br>'+fmtL(__L('재료는 종류별 {n}개까지 보관 (넘치면 {r} 자동 환급)'),{n:STK.cap,r:STK.refund.map((p,i)=>GRADES[i].n+' '+p+'P').join(' · ')})
    +'<br>'+__L('오늘의 무료 뽑기는 하루 1번, 샤프트·블레이드 중 원하는 쪽에 써요.')+'</small></details>';
}
// a material tile: swatch, name, grade, count
function stkTile(id,op){op=op||{};const o=stk(),m=STK_M[id],n=o.m[id]|0,seen=o.seen&&o.seen[id],hide=op.dex&&!seen;
  return '<div class="stk-tile'+(op.on?' on':'')+(hide?' unk':'')+(op.act?' act':'')+'" style="--gc:'+GRADES[m.g].c+'"'+(op.act?' data-sk="'+op.act+'" data-id="'+id+'"':'')+'>'
    +(hide?'<span class="stk-q">?</span>':stkSwatch(id,op.sz||44))+'<b>'+(hide?'???':m.n)+'</b><small>'+GRADES[m.g].n+(hide?'':' · '+STK_ST[m.st].i+STK_ST[m.st].n)+'</small>'
    +(op.tag?'<em>'+op.tag+'</em>':(!op.dex&&!op.noN?'<i>×'+n+'</i>':(op.dex&&seen?'<i>×'+n+'</i>':'')))+'</div>';}
function stkCraftHtml(){
  const o=stk(),s=stkSelS&&(o.m[stkSelS]|0)>0?stkSelS:null,b=stkSelB&&(o.m[stkSelB]|0)>0?stkSelB:null;stkSelS=s;stkSelB=b;
  let h='<div class="stk-bench"><div class="stk-prev">'+(s&&b?stkSvg({s,b,lv:0}):stkSvg({s:s||'s2',b:b||'b1'},{dim:!(s||b),hi:s&&!b?'s':!s&&b?'b':''}))+'</div>';
  h+='<div class="stk-slots">'+['s','b'].map(p=>{const id=p==='s'?s:b;return '<div class="stk-slot'+(id?' fill':'')+'"'+(id?' style="--gc:'+GRADES[STK_M[id].g].c+'"':'')+'>'+(id?stkSwatch(id,40)+'<b>'+STK_M[id].n+'</b><small>'+STK_PART[p].n+'</small>':'<span class="stk-q">+</span><b>'+STK_PART[p].n+'</b><small>'+__L('아래에서 골라요')+'</small>')+'</div>';}).join('<span class="stk-x">×</span>')+'</div>';
  if(s&&b){const c=stkCalc({s,b,lv:0}),cost=stkCraftCost(s,b),full=o.list.length>=STK.max;
    h+='<div class="stk-nm">'+stkGradeChip(c.g)+' <b>'+c.name+'</b><small>'+c.mats+'</small></div>'+stkStatsHtml(c)+stkAbHtml(c);
    h+='<div class="row"><button class="btn primary stk-go" data-sk="craft"'+(full||save.points<cost?' disabled':'')+'>🔨 '+fmtL(__L('스틱 만들기 · {c}P'),{c:cost})+'</button></div>';
    if(full)h+='<div class="lbl" style="text-align:center">'+fmtL(__L('스틱은 {n}개까지 가질 수 있어요 · 내 스틱에서 분해해 자리를 만들어요'),{n:STK.max})+'</div>';
    else h+='<div class="lbl" style="text-align:center">'+__L('만들면 재료 1개씩 써요 · 스틱 등급은 두 재료 등급의 평균(반올림)')+'</div>';}
  h+='</div>';
  for(const p of['s','b']){const own=stkIds(p).filter(k=>(o.m[k]|0)>0),sel=p==='s'?s:b;
    h+='<div class="lbl">'+fmtL(__L('보유 {p}'),{p:STK_PART[p].n})+'</div><div class="stk-col">'+(own.length?own.map(k=>stkTile(k,{act:'pick',on:k===sel})).join(''):'<small class="stk-none">'+__L('재료 뽑기에서 모아 보세요')+'</small>')+'</div>';}
  h+=stkComboBox();
  return h;
}
function stkComboBox(){const ks=['P','S','C'];
  return '<details class="odds stk-combo"><summary>🧩 '+__L('조합표 — 샤프트 스타일 × 블레이드 스타일 = 능력')+'</summary><div class="stk-grid"><span></span>'
    +ks.map(k=>'<span class="hd">'+fmtL(__L('블레이드 {s}'),{s:STK_ST[k].i+STK_ST[k].n})+'</span>').join('')
    +ks.map(a=>'<span class="hd">'+fmtL(__L('샤프트 {s}'),{s:STK_ST[a].i+STK_ST[a].n})+'</span>'+ks.map(b=>'<span><b>'+STK_AB[a+b].n+'</b></span>').join('')).join('')
    +'</div><small>'+__L('재료 등급이 높을수록, 강화할수록 능력치와 능력이 커져요.')+'</small></details>';}
function stkMineHtml(){
  const o=stk();if(!o.list.length)return '<div class="stk-empty">'+stkSvg({s:'s2',b:'b1'},{dim:true})+'<b>'+__L('아직 만든 스틱이 없어요')+'</b><small>'+__L('재료 뽑기로 샤프트와 블레이드를 모은 뒤 제작에서 만들어요')+'</small><button class="btn primary" data-sk="tab" data-t="craft">🔨 '+__L('제작하러 가기')+'</button></div>';
  if(!stkGet(stkSel))stkSel=o.eq||o.list[o.list.length-1].u;
  const x=stkGet(stkSel),c=stkCalc(x),eq=o.eq===x.u,mx=x.lv>=STK.lvMax,nx=mx?null:stkCalc(Object.assign({},x,{lv:x.lv+1})),rate=stkEnhRate(x),cost=stkEnhCost(x.lv);
  let h='<div class="stk-list">'+o.list.map(q=>{const cq=stkCalc(q);return '<button class="stk-row'+(q.u===x.u?' on':'')+'" data-sk="sel" data-u="'+q.u+'" style="--gc:'+GRADES[cq.g].c+'">'+stkSvg(q)+'<span><b>'+cq.ab.n+'</b><small>'+GRADES[cq.g].n+' · +'+q.lv+'</small></span>'+(o.eq===q.u?'<em>'+__L('장착중')+'</em>':'')+'</button>';}).join('')+'</div>';
  h+='<div class="stk-detail'+(stkHit&&stkHit.u===x.u?(stkHit.ok?' up':' shk'):'')+'"><div class="stk-prev big">'+stkSvg(x)+'<i class="stk-lv">+'+x.lv+'</i></div>';
  h+='<div class="stk-nm">'+stkGradeChip(c.g)+' <b>'+c.name+'</b><small>'+c.mats+'</small></div>'+stkStatsHtml(c,nx)+stkAbHtml(c,nx);
  h+='<div class="stk-who">'+(eq?fmtL(__L('🏒 주장 {n}이(가) 경기에서 들어요 (친구 대전 제외)'),{n:TYPES[save.type].name}):__L('장착하면 주장 펭귄이 경기에서 들어요'))+'</div>';
  h+='<div class="stk-acts"><button class="btn small" data-sk="eq">'+(eq?__L('장착 해제'):__L('장착'))+'</button>'
    +(mx?'<button class="btn small" disabled>'+fmtL(__L('최대 강화 +{n}'),{n:STK.lvMax})+'</button>':'<button class="btn primary stk-up" data-sk="up"'+(save.points<cost?' disabled':'')+'>⬆ '+fmtL(__L('강화 +{a}→+{b} · 성공 {r}% · {c}P'),{a:x.lv,b:x.lv+1,r:rate,c:cost})+'</button>')
    +'<button class="btn small" data-sk="brk">'+__L('분해')+'</button></div>';
  if(!mx)h+='<div class="lbl" style="text-align:center">'+fmtL(__L('실패해도 단계는 내려가지 않아요 · 실패할 때마다 +{b}%p (최대 {m}번) · {p}번 연속 실패하면 다음은 100%'),{b:STK.failB,m:STK.failMax,p:STK.pity})+((x.f|0)?' · '+fmtL(__L('지금 연속 실패 {n}번'),{n:x.f|0}):'')+'</div>';
  h+='<details class="odds"><summary>📊 '+__L('강화 확률표')+'</summary><small>'+fmtL(__L('기본 성공률: {r}'),{r:STK.enh.map((r,i)=>'+'+i+'→+'+(i+1)+' '+r+'%').join(' · ')})+'<br>'
    +fmtL(__L('스틱 등급 보너스: {r}'),{r:GRADES.map((g,i)=>g.n+' +'+STK.enhG[i]+'%p').join(' · ')})+'<br>'+fmtL(__L('강화 비용: {a}P부터 단계마다 +{b}P · 단계마다 모든 능력치 +{s}'),{a:STK.enhC0,b:STK.enhCK,s:STK.lvAdd})+'</small></details></div>';
  return h;
}
function stkRender(){
  const el=$('#stkBody');if(!el)return;$('#ptsN').textContent=save.points;
  if(!stkTab)stkTab=stk().list.length?'mine':'pull';
  document.querySelectorAll('#stkTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===stkTab));
  let h=stkMsg?'<div class="odds stk-msg">'+stkMsg+'</div>':'';
  h+=stkTab==='pull'?stkPullHtml():stkTab==='craft'?stkCraftHtml():stkMineHtml();
  const keep=stkRender.tab===stkTab?el.scrollTop:0;stkRender.tab=stkTab;el.innerHTML=h;el.scrollTop=stkTop?0:keep;stkTop=false;
  el.querySelectorAll('[data-sk]').forEach(b=>{b.onclick=()=>{try{SFX.init();SFX.ui();}catch(e){}stkAct(b.dataset.sk,b);};});
}
async function stkAct(a,b){
  const o=stk();stkMsg='';stkHit=null;
  if(a==='tab'){stkTab=b.dataset.t;}
  else if(a==='part'){stkPart=b.dataset.p;stkLast=null;}
  else if(a==='d1'||a==='d10'){if(stkFxOn)return;const part=stkPart,res=stkDraw(part,a==='d1'?1:10);if(!res)return;stkLast={part,res};stkRender();stkReveal(part,res,a);return;}
  else if(a==='pick'){const id=b.dataset.id;if(id[0]==='s')stkSelS=stkSelS===id?null:id;else stkSelB=stkSelB===id?null:id;}
  else if(a==='craft'){const x=stkCraft(stkSelS,stkSelB);if(x){const c=stkCalc(x);stkSel=x.u;stkTab='mine';stkTop=true;stkMsg='🔨 '+fmtL(__L('{n} 완성!'),{n:c.name})+(o.eq===x.u?' '+__L('바로 장착했어요.'):'');try{SFX.win();}catch(e){}stkSelS=stkSelB=null;}}
  else if(a==='sel'){stkSel=+b.dataset.u;}
  else if(a==='eq'){const x=stkGet(stkSel);if(x){stkEquip(o.eq===x.u?0:x.u);stkMsg=o.eq?fmtL(__L('{n} 장착!'),{n:stkCalc(x).name}):__L('기본 팀 스틱으로 바꿨어요');}}
  else if(a==='up'){const x=stkGet(stkSel);if(!x)return;const r=stkEnhance(x.u);if(!r)return;stkHit={u:x.u,ok:r.ok};
    if(r.ok){stkMsg='✨ '+fmtL(__L('강화 성공! +{n}'),{n:r.lv});try{SFX.win();vib([30,30,60]);}catch(e){}}
    else{stkMsg=fmtL(__L('강화 실패… 단계는 그대로예요. 다음 성공률 {r}%'),{r:stkEnhRate(x)});try{SFX.lose();}catch(e){}}}
  else if(a==='brk'){const x=stkGet(stkSel);if(!x)return;const c=stkCalc(x);
    const ok=await askConfirm(__L('스틱 분해'),'<p>'+fmtL(__L('{n} (+{l})을(를) 분해하면 {s}와(과) {b}을(를) 돌려받아요. 강화 단계는 사라져요.'),{n:c.name,l:x.lv,s:STK_M[x.s].n,b:STK_M[x.b].n})+'</p>',__L('분해'));
    if(!ok)return;const r=stkBreak(x.u);if(r){stkSel=0;stkMsg=__L('분해했어요 · 재료를 돌려받았어요')+(r.pts?' (+'+r.pts+'P)':'');}}
  stkRender();
}
// the draw reveal: tiles flip in one by one, the best grade last; skips the motion with 움직임 줄이기
function stkReveal(part,res,again){
  let el=$('#stkFx');if(!el){el=document.createElement('div');el.id='stkFx';document.body.appendChild(el);}
  if(window.__NOFX){return;}
  stkFxOn=true;const best=Math.max(...res.map(r=>r.g)),calm=save.set.motion||RM0,flash=save.set.flash!==false&&!calm;
  el.className='on g'+best+(flash?' fl':'')+(calm?' calm':'')+(res.length>1?' ten':'');
  el.innerHTML='<div class="stk-fxp"><div class="stk-fxt">'+fmtL(__L('{p} 뽑기 결과'),{p:STK_PART[part].n})+'</div><div class="stk-fxg">'
    +res.map((r,i)=>'<div class="stk-fxc" style="--d:'+(calm?0:(i*.09+(r.g===best&&best>=3?.35:0))).toFixed(2)+'s;--gc:'+GRADES[r.g].c+'">'+stkSwatch(r.id,56)+'<b>'+STK_M[r.id].n+'</b><small>'+GRADES[r.g].n+'</small>'+(r.isNew?'<em>NEW</em>':'')+(r.ovf?'<em>+'+r.ovf+'P</em>':'')+'</div>').join('')
    +'</div><div class="row"><button class="btn small" id="stkAgain">'+__L('한 번 더')+'</button><button class="btn primary" id="stkOk">'+__L('확인')+'</button></div></div>';
  try{best>=3?SFX.fanfare():SFX.win();if(best>=3)vib([30,40,80]);}catch(e){}
  const close=()=>{el.className='';stkFxOn=false;stkRender();};
  $('#stkOk').onclick=()=>{try{SFX.ui();}catch(e){}close();};
  $('#stkAgain').onclick=()=>{try{SFX.ui();}catch(e){}close();stkAct(again,{dataset:{}});};
}
// the Android back button closes the draw reveal (v28 overlay list)
if(typeof APP_OV!=='undefined'){APP_OV.push('#stkFx');APP_OVBTN.push('#stkOk');}
// the home tile badge: the free draw of the day
function stkBadge(){const e=$('#stkBadge');if(e)e.textContent=stkFreeReady()?__L('무료'):'';}
