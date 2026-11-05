
function __bootGame(){
'use strict';
const T=THREE, TAU=Math.PI*2;
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:(v>b?b:v), lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const rnd=(a,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d};
const mix3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];

/* ================= CONSTANTS ================= */
const W=24,D=13,CR=5,GW=2.8,GD=2.4,PUCKR=0.42,PIV=0.62;
let IS_TOUCH=!!(window.matchMedia&&matchMedia('(pointer: coarse)').matches);
const TEAM={blue:{key:'blue',name:'BLUE',ko:__L('블루 펭귄팀'),color:0x2f7bff,dir:1},red:{key:'red',name:'RED',ko:__L('레드 펭귄팀'),color:0xff3b4e,dir:-1}};
const TYPES={
  basic:{name:__L('아델리 펭귄'),cost:0,stats:{speed:3,accel:3,power:3,turn:3,body:3},scale:1.0,patch:'adelie',pc:[1,1,1],beak:[0x1c1c22,0x2a2a30],bl:.72,bw:1.08,foot:0xf2a0aa,special:'dash'},
  fast:{name:__L('젠투 펭귄'),cost:40,stats:{speed:5,accel:4,power:2,turn:4,body:2},scale:0.9,patch:'gentoo',pc:[1,1,1],beak:[0xff4f16,0xff7d1c],bl:1,bw:.95,foot:0xff7a1a,tail:1.6,special:'slide'},
  strong:{name:__L('황제 펭귄'),cost:80,stats:{speed:3,accel:2,power:5,turn:2,body:4},scale:1.14,patch:'ear',pc:[1,.7,.14],beak:[0x1a1a20,0xff8a3a],bl:1.38,bw:.78,foot:0x2b3038,special:'flipper'},
  defense:{name:__L('턱끈 펭귄'),cost:80,stats:{speed:2,accel:3,power:3,turn:4,body:5},scale:1.06,patch:'chinstrap',pc:[1,1,1],beak:[0x1c1c20,0x2a2a30],bl:.9,bw:1,foot:0xf0a0a8,special:'icebreak'},
  balanced:{name:__L('바위뛰기 펭귄'),cost:60,stats:{speed:4,accel:3,power:3,turn:3,body:3},scale:1.0,patch:'rock',pc:[1,.86,.1],beak:[0xd8432a,0xc0391f],bl:.78,bw:1.28,foot:0xf0a0a8,special:'dash'},
  king:{name:__L('임금 펭귄'),cost:100,stats:{speed:4,accel:2,power:4,turn:2,body:4},scale:1.1,patch:'king',pc:[1,.52,.06],beak:[0x16171c,0xff7a45],bl:1.3,bw:.74,foot:0x2b3038,special:'trumpet'},
  macaroni:{name:__L('마카로니 펭귄'),cost:70,stats:{speed:3,accel:4,power:4,turn:2,body:4},scale:1.0,patch:'macaroni',pc:[1,.62,.08],beak:[0xc8562c,0xb54a26],bl:.92,bw:1.38,foot:0xf0a0a8,special:'crest'},
  royal:{name:__L('로열 펭귄'),cost:90,stats:{speed:3,accel:3,power:3,turn:4,body:3},scale:1.04,patch:'royal',pc:[1,.7,.12],beak:[0xd9784a,0xc8653c],bl:.98,bw:1.44,foot:0xf2a7ae,special:'royalpass'},
  fiordland:{name:__L('피오르드랜드 펭귄'),cost:70,stats:{speed:3,accel:3,power:2,turn:4,body:4},scale:.98,patch:'fiord',pc:[1,.88,.25],beak:[0xd2552a,0xc24a24],bl:.86,bw:1.28,foot:0xeea2a6,special:'shadow'},
  yelloweye:{name:__L('노란눈 펭귄'),cost:90,stats:{speed:3,accel:3,power:4,turn:3,body:3},scale:1.02,patch:'yeye',pc:[1,.86,.28],dk:[.08,.1,.14],beak:[0xb5644e,0xdc9e8c],bl:.95,bw:1,foot:0xf3a5a0,special:'keeneye'},
  little:{name:__L('쇠푸른 펭귄'),cost:50,stats:{speed:5,accel:4,power:2,turn:5,body:1},scale:.8,patch:'little',pc:[.4,.52,.68],dk:[.12,.22,.4],beak:[0x2a2c32,0x34363c],bl:.82,bw:.86,foot:0xf2c9cc,special:'hop'},
  african:{name:__L('아프리카 펭귄'),cost:60,stats:{speed:3,accel:3,power:3,turn:3,body:4},scale:.97,patch:'african',pc:[1,1,1],beak:[0x16171b,0x16171b],bl:.95,bw:1.12,foot:0x3a3036,special:'bray'},
  humboldt:{name:__L('훔볼트 펭귄'),cost:70,stats:{speed:4,accel:4,power:3,turn:2,body:3},scale:.96,patch:'humboldt',pc:[1,1,1],beak:[0x16171b,0x16171b],bl:1,bw:1.16,foot:0x3c3234,special:'current'},
  magellanic:{name:__L('마젤란 펭귄'),cost:70,stats:{speed:4,accel:3,power:2,turn:3,body:4},scale:.97,patch:'magellan',pc:[1,1,1],beak:[0x16171b,0x16171b],bl:.96,bw:1.1,foot:0x40363a,special:'double'},
  galapagos:{name:__L('갈라파고스 펭귄'),cost:80,stats:{speed:4,accel:4,power:3,turn:4,body:2},scale:.84,patch:'galapagos',pc:[1,1,1],beak:[0x16171b,0x16171b],bl:.86,bw:1,foot:0x3a3438,special:'sunflare'},
  auk:{name:__L('큰바다쇠오리'),cost:0,exclusive:true,stats:{speed:6.5,accel:6.5,power:6.5,turn:6,body:6},scale:1.1,patch:'auk',pc:[1,1,1],beak:[0x111216,0x111216],special:'surge'}
};
const SPECIALS={surge:__L('큰바다 돌진'),dash:__L('아이스 대시'),slide:__L('펭귄 슬라이드'),flipper:__L('강력한 플리퍼 슛'),icebreak:__L('아이스 브레이크')};
const STATN={speed:__L('속도'),accel:__L('가속도'),power:__L('퍽 타격력'),turn:__L('방향 전환'),body:__L('몸싸움')};
const HATS={none:{name:__L('없음'),cost:0},beanie:{name:__L('털모자'),cost:0},headband:{name:__L('머리띠'),cost:20},helmet:{name:__L('하키 헬멧'),cost:40},party:{name:__L('파티 모자'),cost:60},crown:{name:__L('왕관'),cost:120}};
const TRAILS={ice:{name:__L('눈꽃'),cost:0,col:[.92,.97,1]},sky:{name:__L('하늘빛'),cost:30,col:[.4,.8,1]},pink:{name:__L('핑크'),cost:50,col:[1,.55,.82]},gold:{name:__L('황금'),cost:90,col:[1,.85,.3]},rainbow:{name:__L('무지개'),cost:150,col:null},ps1:{name:__L('정어리'),cost:0,col:[0.75,0.88,0.98],pass:1},ps2:{name:__L('청어'),cost:0,col:[0.35,0.65,1],pass:1},ps3:{name:__L('광어'),cost:0,col:[0.9,0.78,0.55],pass:1},ps4:{name:__L('넙치'),cost:0,col:[0.72,0.8,0.45],pass:1},ps5:{name:__L('도다리'),cost:0,col:[0.95,0.85,0.7],pass:1},ps6:{name:__L('꽁치'),cost:0,col:[0.55,0.85,0.92],pass:1},ps7:{name:__L('고등어'),cost:0,col:[0.3,0.85,0.7],pass:1},ps8:{name:__L('갈치'),cost:0,col:[0.92,0.95,1],pass:1},ps9:{name:__L('참치'),cost:0,col:[0.95,0.35,0.4],pass:1},ps10:{name:__L('연어'),cost:0,col:[1,0.6,0.45],pass:1},ps11:{name:__L('도루묵'),cost:0,col:[0.85,0.82,0.65],pass:1},ps12:{name:__L('명태'),cost:0,col:[0.78,0.8,0.86],pass:1},ps13:{name:__L('삼치'),cost:0,col:[0.55,0.8,1],pass:1},ps14:{name:__L('전어'),cost:0,col:[1,0.88,0.55],pass:1},ps15:{name:__L('멸치'),cost:0,col:[0.85,0.93,1],pass:1},ps16:{name:__L('방어'),cost:0,col:[1,0.85,0.3],pass:1},ps17:{name:__L('참돔'),cost:0,col:[1,0.45,0.55],pass:1},ps18:{name:__L('우럭'),cost:0,col:[0.6,0.6,0.65],pass:1},ps19:{name:__L('농어'),cost:0,col:[0.6,0.82,0.7],pass:1},ps20:{name:__L('복어'),cost:0,col:[1,0.82,0.4],pass:1},ps21:{name:__L('아귀'),cost:0,col:[0.7,0.55,0.4],pass:1},ps22:{name:__L('가자미'),cost:0,col:[0.85,0.72,0.5],pass:1},ps23:{name:__L('조기'),cost:0,col:[1,0.8,0.2],pass:1},ps24:{name:__L('숭어'),cost:0,col:[0.7,0.78,0.86],pass:1},pro:{name:__L('프로 오로라'),cost:0,col:[0.72,0.55,1],pass:1}};
const DIFF={
  easy:{spd:.88,react:.5,noise:.5,aim:.5,press:.5,shootQ:.24,passP:.25,mistake:.14,slip:.07,range:19,gk:{cap:6,acc:28,react:.6,err:1.3,dive:.05,miss:.3}},
  normal:{spd:.96,react:.3,noise:.3,aim:.3,press:.8,shootQ:.26,passP:.4,mistake:.07,slip:.035,range:26,gk:{cap:7.5,acc:34,react:.42,err:.9,dive:.2,miss:.16}},
  hard:{spd:1,react:.18,noise:.14,aim:.14,press:1,shootQ:.28,passP:.5,mistake:.03,slip:.015,range:30,gk:{cap:9,acc:42,react:.25,err:.45,dive:.4,miss:.06}}
};
Object.assign(DIFF.easy,{icpt:.08,oneT:0,adapt:.1});Object.assign(DIFF.easy.gk,{read:.2,out:.35});
Object.assign(DIFF.normal,{icpt:.3,oneT:.3,adapt:.4});Object.assign(DIFF.normal.gk,{read:.22,out:.45});
Object.assign(DIFF.hard,{icpt:.55,oneT:.6,adapt:.7});Object.assign(DIFF.hard.gk,{read:.38,out:.5});
const TOUR=[
  {name:'Red Rookies',diff:'easy',types:['basic','basic','balanced'],tod:0.0},
  {name:'Chinstrap Chargers',diff:'normal',types:['defense','fast','strong'],tod:0.12},
  {name:'Frost Kings',diff:'hard',types:['king','macaroni','strong'],tod:0.28}
];
const CHALLENGES=[
  {id:'c1',name:__L('30초 안에 골 넣기'),desc:__L('골키퍼를 뚫고 30초 안에 1골!'),time:30,goal:1,kind:'goal',size:1},
  {id:'c2',name:__L('골키퍼 3번 뚫기'),desc:__L('90초 안에 3골을 넣어보세요.'),time:90,goal:3,kind:'goal',size:1},
  {id:'c3',name:__L('연속 패스 10회'),desc:__L('동료에게 끊기지 않고 10번! (8초 안에 다음 패스)'),time:90,goal:10,kind:'pass',size:3},
  {id:'c4',name:__L('강슛으로 골 넣기'),desc:__L('슛을 70% 이상 충전해서 골을 넣으세요. (톡 슛은 인정 안 돼요)'),time:60,goal:1,kind:'power',size:1,minCharge:.7},
  {id:'c5',name:__L('무실점 승리'),desc:__L('2 vs 2 · 2분 안에 한 골도 내주지 않고 이기세요. 실점하면 바로 실패!'),time:120,kind:'clean',size:2,match:true,diff:'normal',pts:50},
  {id:'c6',name:__L('역전 드라마'),desc:__L('0 : 1로 지고 있어요! 100초 안에 역전승하세요. (비기면 실패)'),time:100,kind:'comeback',size:2,match:true,diff:'normal',pts:60},
  {id:'c7',name:__L('펭귄 마스터'),desc:__L('서로 다른 주장 펭귄 3종으로 1 vs 1 승리 · 주장은 팀 편성에서 바꿔요'),time:75,kind:'types',size:1,match:true,diff:'easy',pts:60,need:3,opp:['balanced','basic','fast']}
];
const FORM={1:[[-6,0]],2:[[-5,3],[-13,-2]],3:[[-4,2],[-9,-5],[-14,3]],4:[[-4,2],[-8,-6],[-8,6],[-14,0]]};
const ROLES={1:['attacker'],2:['attacker','defender'],3:['attacker','mid','defender'],4:['attacker','mid','mid','defender']};

/* ================= SAVE ================= */
/* ---- Scout Center constants (cards / enhance / fusion) ---- */
const GRADES=[{n:__L('기본',"rar0"),c:'#9fb4c8'},{n:__L('희귀'),c:'#4aa8ff'},{n:__L('레어'),c:'#b46bff'},{n:__L('신화'),c:'#ff5a6e'},{n:__L('전설'),c:'#ffc233'}];
const RAR={basic:0,fast:0,little:0,balanced:1,african:1,humboldt:1,magellanic:1,defense:2,macaroni:2,fiordland:2,galapagos:2,royal:3,yelloweye:3,strong:4,king:4,auk:4};
const rarCls=k=>TYPES[k]&&TYPES[k].exclusive?9:RAR[k]|0;   // card frame class index
const tierTypes=g=>Object.keys(TYPES).filter(k=>!TYPES[k].exclusive&&RAR[k]===g);
const PULL_ODDS=[50,30,14,5,1],PULL_COST=40,PULL10_COST=360,PITY_AT=30,MAX_LV=10,LV_STAT=.09;
const TYPE_W={basic:12,balanced:8,fast:8,defense:7,strong:6,king:4,macaroni:7,royal:3,fiordland:6,yelloweye:3,little:8,african:8,humboldt:7,magellanic:7,galapagos:6};
const ENH_RATE=[100,100,100,85,75,65,55,45,35,25],ENH_CARD_BONUS=[0,4,8,12,16],ENH_FAIL_BONUS=8,ENH_FAIL_MAX=4;
const FUSE_DEF=[{rate:80,cost:20},{rate:60,cost:40},{rate:35,cost:80},{rate:20,cost:160}];
// gacha config: the scout UI and the roll logic both read these values (tune balance here)
const GACHA={cost1:PULL_COST,cost10:PULL10_COST,odds:PULL_ODDS,softFrom:20,softStep:6,hard:PITY_AT,tenMin:2,pickShare:70,rotOrder:['royal','little','yelloweye','african','fiordland','humboldt','galapagos','magellanic','balanced','fast','defense','basic','strong','king','macaroni'],dupCap:999,dupOverflow:[5,10,25,60,150],histMax:30};
const ENH_PITY=5;   // consecutive enhancement failures that guarantee the next attempt
const BRK={max:5,need:[3,6,10,15,24],val:[1,2,3,5,8],cost:[60,120,200,320,500],stat:.05,ovr:1.5,cd:{3:.05,5:.05}};   // breakthrough with duplicate cards
const enhCost=lv=>20+15*lv;
const RM0=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const DEF_SET={cine:'full',rules:'full',cond:true,size:3,time:180,diff:'normal',tod:'auto',aurora:true,sound:true,quality:'ultra',assist:true,arena:'auto',vol:'mid',vib:true,shake:RM0?'low':'on',flash:true,motion:RM0,items:true,events:true,fastFx:false,stick:true,lang:I18N.lang};
const save={v:10,chalTypes:[],rl:{intro:0},pass:{s:0,xp:0,gold:false,cf:0,cg:0,fw:0,last:null,pro:0,cx:0},pay:{tok:[],last:null},codes:[],ach:{},achNew:0,brk:{},brkPts:{},points:100,types:['basic'],hats:['none','beanie'],trails:['ice'],type:'basic',hat:'beanie',trail:'ice',team:'blue',cleared:{},set:Object.assign({},DEF_SET),stats:{played:0,wins:0,goals:0,tourClears:0},cards:Object.fromEntries(Object.keys(TYPES).map(k=>[k,[0,0,0,0]])),cc:Object.fromEntries(Object.keys(TYPES).map(k=>[k,[0,0,0,0,0]])),lv:Object.fromEntries(Object.keys(TYPES).map(k=>[k,0])),scout:{pulls:0,pity:0,freeDay:'',fail:{},hist:[],pickMiss:false,elog:[]},squad:[null,null,null],xp:Object.fromEntries(Object.keys(TYPES).map(k=>[k,0])),goals:{day:0,ts:0,list:[]},long:{},clk:0,growth:null,cum:{goals:0,passes:0,power:0,matches:0,wins:0,teamPlay:0,clutch:0,dailyDone:0,winHard:0,winMid:0,typeGame:0,tourWin:0,combo3:0,streak2:0,cleanWin:0,comeback:0,oneTimer:0,hatTrick:0,chainBest:0,powerGoal:0,bigHit:0,soWin:0,golden:0,steals:0,enhOk:0,brk:0,comboGoal:0,comboShot:0},rec:{maxGoals:0,maxStreak:0,maxCombo:0,maxMargin:0,maxPass:0,tourBest:0,diff:{easy:[0,0],normal:[0,0],hard:[0,0]},type:{}},tut:{done:false,asked:false},profile:{name:__L('펭귄 감독'),club:__L('펭귄 FC'),emb:'🐧',city:__L('서울'),since:0,seed:0},mgr:{r:1000,games:0,w:0,d:0,l:0,best:1000,form:[],hist:[],pending:null},mk:{salt:0,bought:[],log:[]},trial:{day:0,ts:0,used:{city:0,nat:0,world:0},run:null,titles:{city:0,nat:0,world:0},first:{city:false,nat:false,world:false},cityName:''},dev:{got:false,ts:0},season:{n:0,g:0,w:0,d:0,l:0,best:0,start:0,paid:0,last:null,hist:[]},news18:true};
const persist=()=>{try{localStorage.setItem('penguinHockey.v1',JSON.stringify(save));if(window.__phMirror)window.__phMirror();}catch(e){if(!persist.warned){persist.warned=true;console.warn('save failed',e);setTimeout(()=>{try{flashMsg(__L('저장하지 못했어요 (저장 공간·비공개 모드). 플레이는 계속할 수 있어요'));}catch(_){}},50);}}};
// load + validate + migrate old (v1) data; nothing valid is ever dropped
function loadSave(){
  let s=null;try{s=JSON.parse(localStorage.getItem('penguinHockey.v1')||'null');}catch(e){s=null;}
  if(!s||typeof s!=='object'){save.gfx19=true;return;}
  const num=(v,d)=>Number.isFinite(+v)?+v:d;
  const keep=(src,valid,base)=>{const out=base.slice();if(Array.isArray(src))for(const k of src)if(typeof k==='string'&&Object.prototype.hasOwnProperty.call(valid,k)&&!out.includes(k))out.push(k);return out;};
  save.points=Math.max(0,Math.floor(num(s.points,save.points)));
  save.types=keep(s.types,TYPES,['basic']);save.hats=keep(s.hats,HATS,['none','beanie']);save.trails=keep(s.trails,TRAILS,['ice']);
  save.type=save.types.includes(s.type)?s.type:'basic';save.hat=save.hats.includes(s.hat)?s.hat:'beanie';save.trail=save.trails.includes(s.trail)?s.trail:'ice';
  save.team=s.team==='red'?'red':'blue';
  if(s.cleared&&typeof s.cleared==='object')for(const k of Object.keys(s.cleared))if(s.cleared[k])save.cleared[k]=true;
  const ss=s.set&&typeof s.set==='object'?s.set:{};
  if([1,2,3,4].includes(+ss.size))save.set.size=+ss.size;
  if([60,120,180,300].includes(+ss.time))save.set.time=+ss.time;
  if(DIFF[ss.diff])save.set.diff=ss.diff;
  if(['auto','day','dusk','night'].includes(ss.tod))save.set.tod=ss.tod;
  if(typeof ss.aurora==='boolean')save.set.aurora=ss.aurora;
  if(typeof ss.sound==='boolean')save.set.sound=ss.sound;
  if(ss.quality==='low'||ss.quality==='high'||ss.quality==='ultra')save.set.quality=ss.quality;
  if(ss.quality==='high'&&s.gfx19!==true)save.set.quality='ultra';   // 높음 was the top tier before v19
  save.gfx19=true;
  if(typeof ss.assist==='boolean')save.set.assist=ss.assist;
  if(['auto','aurora','blizzard','sunset','final'].includes(ss.arena))save.set.arena=ss.arena;
  if(['low','mid','high'].includes(ss.vol))save.set.vol=ss.vol;
  if(['on','low','off'].includes(ss.shake))save.set.shake=ss.shake;
  for(const k of['vib','flash','motion','items','events','fastFx','stick','cond'])if(typeof ss[k]==='boolean')save.set[k]=ss[k];
  if(['full','fouls','off'].includes(ss.rules))save.set.rules=ss.rules;
  if(['full','short','off'].includes(ss.cine))save.set.cine=ss.cine;
  if(Array.isArray(s.chalTypes))save.chalTypes=s.chalTypes.filter((k,i,a)=>typeof k==='string'&&TYPES[k]&&a.indexOf(k)===i).slice(0,8);
  if(s.stats&&typeof s.stats==='object')for(const k of Object.keys(save.stats))save.stats[k]=Math.max(0,Math.floor(num(s.stats[k],0)));
  if(s.cards&&typeof s.cards==='object')for(const k of Object.keys(TYPES)){const a=s.cards[k];save.cards[k]=[0,1,2,3].map(i=>Array.isArray(a)?Math.max(0,Math.min(999,Math.floor(num(a[i],0)))):0);}

  if(s.lv&&typeof s.lv==='object')for(const k of Object.keys(TYPES))save.lv[k]=Math.max(0,Math.min(MAX_LV,Math.floor(num(s.lv[k],0))));
  if(s.scout&&typeof s.scout==='object'){const sc=s.scout;save.scout.pulls=Math.max(0,Math.floor(num(sc.pulls,0)));save.scout.pity=Math.max(0,Math.min(PITY_AT-1,Math.floor(num(sc.pity,0))));save.scout.freeDay=typeof sc.freeDay==='string'?sc.freeDay.slice(0,12):'';
    if(sc.fail&&typeof sc.fail==='object')for(const k of Object.keys(TYPES))save.scout.fail[k]=Math.max(0,Math.min(ENH_PITY,Math.floor(num(sc.fail[k],0))));
    if(Array.isArray(sc.hist))save.scout.hist=sc.hist.filter(r=>Array.isArray(r)&&TYPES[r[0]]&&!TYPES[r[0]].exclusive&&r[1]>=0&&r[1]<=3).slice(0,GACHA.histMax).map(r=>[r[0],r[1]|0,r[2]?1:0]);
    save.scout.pickMiss=sc.pickMiss===true;
    if(Array.isArray(sc.elog))save.scout.elog=sc.elog.filter(r=>Array.isArray(r)&&TYPES[r[0]]).slice(0,8).map(r=>[r[0],Math.max(0,Math.min(MAX_LV,r[1]|0)),[0,1,2].includes(r[2])?r[2]:0,Math.max(0,Math.min(3,r[3]|0))]);}
  if(s.brk&&typeof s.brk==='object')for(const k of Object.keys(TYPES))save.brk[k]=Math.max(0,Math.min(BRK.max,Math.floor(num(s.brk[k],0))));
  if(s.brkPts&&typeof s.brkPts==='object')for(const k of Object.keys(TYPES))save.brkPts[k]=Math.max(0,Math.min(999,Math.floor(num(s.brkPts[k],0))));
  rarLoad(s,num);
  if(Array.isArray(s.squad))save.squad=[0,1,2].map(i=>save.types.includes(s.squad[i])?s.squad[i]:null);
  const nz=(v,m)=>Math.max(0,Math.min(m||1e9,Math.floor(num(v,0))));
  if(s.xp&&typeof s.xp==='object')for(const k of Object.keys(TYPES))save.xp[k]=nz(s.xp[k],99999);
  if(s.rec&&typeof s.rec==='object'){
    for(const k of['maxGoals','maxStreak','maxCombo','maxMargin','maxPass','tourBest'])save.rec[k]=nz(s.rec[k],9999);
    for(const d of['easy','normal','hard']){const a=s.rec.diff&&s.rec.diff[d];if(Array.isArray(a))save.rec.diff[d]=[nz(a[0],99999),nz(a[1],99999)];}
    if(s.rec.type&&typeof s.rec.type==='object')for(const k of Object.keys(TYPES)){const a=s.rec.type[k];if(Array.isArray(a))save.rec.type[k]=[nz(a[0],99999),nz(a[1],99999)];}
  }
  if(s.cum&&typeof s.cum==='object')for(const k of Object.keys(save.cum))save.cum[k]=nz(s.cum[k],999999);
  if(s.long&&typeof s.long==='object')for(const k of Object.keys(s.long))if(s.long[k]===true&&/^L\d{1,2}$/.test(k))save.long[k]=true;
  if(s.goals&&typeof s.goals==='object'&&Array.isArray(s.goals.list))save.goals={day:nz(s.goals.day,9e6),ts:nz(s.goals.ts,9e15),list:s.goals.list.slice(0,3).filter(g=>g&&typeof g.id==='string').map(g=>({id:g.id.slice(0,24),t:(typeof g.t==='string'&&TYPES[g.t])?g.t:'',p:nz(g.p,9999),c:g.c===true}))};
  save.clk=nz(s.clk,9e15);
  if(s.growth&&typeof s.growth==='object'&&TYPES[s.growth.type])save.growth={type:s.growth.type,from:nz(s.growth.from,10),to:nz(s.growth.to,10),ov0:nz(s.growth.ov0,99),ov1:nz(s.growth.ov1,99)};
  if(s.tut&&typeof s.tut==='object'){save.tut.done=s.tut.done===true;save.tut.asked=s.tut.asked===true;}
  if(s.profile&&typeof s.profile==='object'){
    const P=s.profile,cl=v=>typeof v==='string'?v.replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,12):'';
    save.profile.name=I18N.full(cl(P.name)||save.profile.name);save.profile.club=I18N.full(cl(P.club)||save.profile.club);
    if(typeof P.emb==='string'&&P.emb.length>0&&P.emb.length<=8&&!/[<>&"']/.test(P.emb))save.profile.emb=P.emb;
    save.profile.since=nz(P.since,9e15);save.profile.seed=nz(P.seed,2147483647);
  }
  if(s.mgr&&typeof s.mgr==='object'){
    const M=s.mgr,m=save.mgr;
    m.r=Math.max(100,Math.min(4000,Math.round(num(M.r,1000))));
    for(const k of['games','w','d','l'])m[k]=nz(M[k],1e6);
    m.best=Math.max(m.r,Math.min(4000,nz(M.best,4000)));
    if(Array.isArray(M.form))m.form=M.form.filter(f=>f==='W'||f==='D'||f==='L').slice(0,5);
    if(Array.isArray(M.hist))m.hist=M.hist.filter(x=>x&&typeof x==='object').slice(0,10).map(x=>({d:Math.max(-200,Math.min(200,Math.round(num(x.d,0)))),r:Math.min(4000,nz(x.r,4000)),l:typeof x.l==='string'?I18N.norm(x.l.replace(/[<>&"']/g,'')).slice(0,48):'',ts:nz(x.ts,9e15)}));
    if(M.pending&&typeof M.pending==='object')m.pending={o:Math.min(4000,nz(M.pending.o,4000))||1120,l:typeof M.pending.l==='string'?I18N.norm(M.pending.l.replace(/[<>&"']/g,'')).slice(0,48):__L('경기'),ts:nz(M.pending.ts,9e15)};
  }
  if(s.mk&&typeof s.mk==='object'){
    save.mk.salt=nz(s.mk.salt,1e9);
    if(Array.isArray(s.mk.bought))save.mk.bought=s.mk.bought.filter(x=>typeof x==='string'&&x.length<40).slice(-40);
    if(Array.isArray(s.mk.log))save.mk.log=s.mk.log.filter(x=>x&&typeof x==='object'&&TYPES[x.type]&&(x.k==='buy'||x.k==='sell')).slice(0,15).map(x=>({k:x.k,type:x.type,g:Math.min(3,nz(x.g,3)),p:nz(x.p,1e6),ts:nz(x.ts,9e15),n:x.n===true}));
  }
  {
    const CT=[__L('서울'),__L('부산'),__L('대구'),__L('인천'),__L('광주'),__L('대전'),__L('울산'),__L('세종'),__L('수원'),__L('부천'),__L('고양'),__L('성남'),__L('창원'),__L('제주')];
    if(s.profile&&CT.includes(I18N.full(s.profile.city)))save.profile.city=I18N.full(s.profile.city);
    const T=s.trial;
    if(T&&typeof T==='object'){
      const t=save.trial;t.day=nz(T.day,9e6);t.ts=nz(T.ts,9e15);
      if(T.used&&typeof T.used==='object')t.used={city:Math.min(3,nz(T.used.city,3)),nat:Math.min(2,nz(T.used.nat,2))};
      if(T.titles&&typeof T.titles==='object')t.titles={city:nz(T.titles.city,9999),nat:nz(T.titles.nat,9999)};
      if(T.first&&typeof T.first==='object')t.first={city:T.first.city===true,nat:T.first.nat===true};
      if(CT.includes(I18N.full(T.cityName)))t.cityName=I18N.full(T.cityName);
      const R=T.run;
      if(R&&typeof R==='object'&&(R.kind==='city'||R.kind==='nat')&&Array.isArray(R.opp)){
        const n=R.kind==='city'?3:4,rd=nz(R.round,n-1);
        if(R.opp.length===n&&rd<n)t.run={kind:R.kind,round:rd,opp:R.opp.map(x=>typeof x==='string'?I18N.norm(x.replace(/[<>&"']/g,'')).slice(0,60):__L('상대 팀')),city:CT.includes(I18N.full(R.city))?I18N.full(R.city):save.profile.city};
      }
    }
  }
  {
    const T=s.trial,t=save.trial;
    if(T&&typeof T==='object'){
      t.used.world=Math.min(1,nz(T.used&&T.used.world,1));t.titles.world=nz(T.titles&&T.titles.world,9999);t.first.world=!!(T.first&&T.first.world===true);
      const R=T.run;
      if(R&&typeof R==='object'&&R.kind==='world'&&Array.isArray(R.opp)&&R.opp.length===5&&nz(R.round,4)<5)t.run={kind:'world',round:nz(R.round,4),opp:R.opp.map(x=>typeof x==='string'?I18N.norm(x.replace(/[<>&"']/g,'')).slice(0,60):__L('상대 팀')),city:t.run&&t.run.city||save.profile.city};
    }
    if(s.dev&&typeof s.dev==='object'&&s.dev.got===true){save.dev.got=true;save.dev.ts=nz(s.dev.ts,9e15);}
    if(Array.isArray(s.codes))save.codes=s.codes.filter((c,i,a)=>c==='ysgames777'&&a.indexOf(c)===i);
    if(save.types.includes('auk')&&!save.dev.got&&!save.codes.includes('ysgames777'))save.types=save.types.filter(k=>k!=='auk');   // exclusive: only through the 개발자 tier
    if((save.dev.got||save.codes.includes('ysgames777'))&&!save.types.includes('auk'))save.types.push('auk');
    if(!save.types.includes(save.type))save.type='basic';
    for(const q of save.squad.keys())if(save.squad[q]&&!save.types.includes(save.squad[q]))save.squad[q]=null;
  }
  if(s.ach&&typeof s.ach==='object')for(const k of Object.keys(s.ach).slice(0,60))if(s.ach[k]===true&&/^a_[a-z0-9]{1,12}$/.test(k))save.ach[k]=true;
  if(Number.isFinite(s.achNew))save.achNew=Math.max(0,Math.min(99,s.achNew|0));
  if(s.season&&typeof s.season==='object')seasonLoad(s.season);
  if(s.rl&&typeof s.rl==='object')save.rl.intro=s.rl.intro?1:0;
  if(s.pass&&typeof s.pass==='object')passLoad(s.pass);
  if(s.pay&&typeof s.pay==='object'){if(Array.isArray(s.pay.tok))save.pay.tok=s.pay.tok.filter(x=>typeof x==='string'&&x.length<600).slice(-30);if(s.pay.last&&typeof s.pay.last==='object')save.pay.last={s:Math.max(0,Math.floor(+s.pay.last.s||0)),t:Math.max(0,+s.pay.last.t||0)};}
  save.news18=s.news18===true;
  if(s.v!==10)persist();
}
loadSave();

/* ================= RENDERER / SCENE ================= */
const canvas=$('#c');
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}
catch(e){$('#fallback').style.display='flex';return;}
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
const scene=new T.Scene();scene.fog=new T.FogExp2(0xcfe6ff,0.0045);
const camera=new T.PerspectiveCamera(48,1,0.5,2200);
const maxAniso=Math.min(8,renderer.capabilities.getMaxAnisotropy?renderer.capabilities.getMaxAnisotropy():1);

const hemi=new T.HemisphereLight(0xcfe6ff,0xb8d4ee,0.7);scene.add(hemi);
const sun=new T.DirectionalLight(0xfff2dd,1.2);sun.castShadow=true;
sun.shadow.camera.left=-40;sun.shadow.camera.right=40;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.camera.near=1;sun.shadow.camera.far=260;
sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.04;scene.add(sun);scene.add(sun.target);

const std=(c,r=0.6,m=0,ex)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},ex||{}));

/* ---- sky ---- */
const skyU={topC:{value:new T.Color(.2,.46,.9)},midC:{value:new T.Color(.5,.76,.98)},horC:{value:new T.Color(.8,.9,1)}};
const skyMat=new T.ShaderMaterial({uniforms:skyU,side:T.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 topC,midC,horC;varying vec3 vP;void main(){float h=clamp(vP.y,-0.3,1.0);vec3 c=mix(horC,midC,smoothstep(0.0,0.2,h));c=mix(c,topC,smoothstep(0.16,0.75,h));if(vP.y<0.0)c=horC*(1.0+vP.y*0.6);gl_FragColor=vec4(c,1.0);}'});
const skyGeo=new T.SphereGeometry(1000,32,18);
const sky=new T.Mesh(skyGeo,skyMat);sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);

const starGeo=new T.BufferGeometry();{const n=1300,a=new Float32Array(n*3);for(let i=0;i<n;i++){const u=Math.random(),v=Math.random()*0.92+0.04,th=u*TAU,ph=Math.acos(v);a[i*3]=Math.sin(ph)*Math.cos(th)*900;a[i*3+1]=Math.cos(ph)*900;a[i*3+2]=Math.sin(ph)*Math.sin(th)*900;}starGeo.setAttribute('position',new T.BufferAttribute(a,3));}
const starMat=new T.PointsMaterial({color:0xffffff,size:2.3,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false,fog:false});
const stars=new T.Points(starGeo,starMat);stars.frustumCulled=false;stars.renderOrder=-9;scene.add(stars);

function glowTex(inner,outer){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,inner);g.addColorStop(.25,outer);g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c);}
const sunSpr=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(255,255,255,1)','rgba(255,230,170,.55)'),blending:T.AdditiveBlending,transparent:true,depthWrite:false,fog:false}));sunSpr.scale.set(340,340,1);sunSpr.renderOrder=-8;scene.add(sunSpr);
const moonSpr=new T.Sprite(new T.SpriteMaterial({map:glowTex('rgba(235,244,255,1)','rgba(170,200,255,.4)'),blending:T.AdditiveBlending,transparent:true,depthWrite:false,fog:false,opacity:0}));moonSpr.scale.set(110,110,1);moonSpr.renderOrder=-8;scene.add(moonSpr);

/* ---- aurora ---- */
const auroras=[];
function makeAurora(x,y,z,ry,sx,c1,c2,seed){
  const g=new T.PlaneGeometry(700,130,170,1);
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false,
    uniforms:{uT:{value:seed},uA:{value:0},c1:{value:new T.Color(c1)},c2:{value:new T.Color(c2)}},
    vertexShader:'varying vec2 vUv;uniform float uT;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*0.012+uT*0.3)*46.0+sin(p.x*0.031-uT*0.2)*16.0;p.y+=sin(p.x*0.02+uT*0.5)*8.0*uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}',
    fragmentShader:'varying vec2 vUv;uniform float uT,uA;uniform vec3 c1,c2;void main(){float r1=0.55+0.45*sin(vUv.x*95.0+uT*0.8+sin(vUv.x*23.0+uT*0.3)*2.0);float r2=0.6+0.4*sin(vUv.x*41.0-uT*0.5);float a=smoothstep(0.0,0.1,vUv.y)*pow(1.0-vUv.y,1.5);vec3 c=mix(c1,c2,smoothstep(0.25,1.0,vUv.y));gl_FragColor=vec4(c*1.5,a*r1*r2*uA);}'});
  const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);mesh.rotation.y=ry;mesh.scale.x=sx;mesh.frustumCulled=false;mesh.renderOrder=-7;scene.add(mesh);auroras.push(mesh);
}
makeAurora(0,75,-420,0,1.3,0x2bff9a,0x8a5bff,0);
makeAurora(-330,85,-330,0.7,1,0x3affc0,0x4aa0ff,3);
makeAurora(340,80,-340,-0.7,1,0x66ff88,0xc060ff,6);
makeAurora(0,90,520,Math.PI,1.2,0x3fffb0,0x9a70ff,9);

/* ---- sky state ---- */
const SKYK={
  top:[[.20,.46,.90],[.16,.18,.46],[.06,.10,.26]],mid:[[.52,.76,.98],[.92,.46,.44],[.12,.20,.42]],hor:[[.80,.91,1.0],[1.0,.70,.46],[.24,.34,.56]],
  sunC:[[1,.96,.88],[1,.62,.36],[.75,.82,1]],sunI:[1.3,1.0,1.1],hemiS:[[.78,.88,1],[.95,.8,.75],[.6,.68,.9]],hemiI:[.7,.6,1.0],el:[.95,.15,.64]
};
const pick3=(a,t)=>t<=0.5?mix3(a[0],a[1],t*2):mix3(a[1],a[2],(t-.5)*2);
const pickN=(a,t)=>t<=0.5?lerp(a[0],a[1],t*2):lerp(a[1],a[2],(t-.5)*2);
const sunDir=new T.Vector3();

/* ---- env map (reflections on ice/ocean) ---- */
let pmrem=null,envRT=null,envLastT=-9,envLastTime=-9;
const envScene=new T.Scene();
const envSky=new T.Mesh(skyGeo,skyMat);envScene.add(envSky);
const envSun=new T.Mesh(new T.SphereGeometry(46,12,8),new T.MeshBasicMaterial({color:new T.Color(6,5.4,4.6)}));envScene.add(envSun);
pmrem=null; /* PMREM environment maps render the whole scene black on some GPUs/phones: reflections are disabled */
function updateEnv(force){
  if(!pmrem)return;const now=performance.now()/1000;
  if(!force&&(Math.abs(G.tod-envLastT)<0.035||now-envLastTime<1.5))return;
  try{
    envSun.position.copy(sunDir).multiplyScalar(720);
    const sI=G.tod>0.72?0.8:6;envSun.material.color.setRGB(sI,sI*.92,sI*.8);
    const rt=pmrem.fromScene(envScene,0,1,2000);
    scene.environment=rt.texture;if(envRT)envRT.dispose();envRT=rt;envLastT=G.tod;envLastTime=now;
  }catch(e){pmrem=null;}
}

/* ---- lamps ---- */
const lamps=[];buildLampTowers(lamps);

/* ================= TERRAIN / OCEAN / ICEBERGS ================= */
const nz2=(x,z)=>Math.sin(x*.11)*Math.cos(z*.13)+.5*Math.sin(x*.27+1.7)*Math.sin(z*.23)+.25*Math.sin(x*.6+z*.5);
function heightAt(x,z){
  const dx=Math.max(Math.abs(x)-(W+1),0),dz=Math.max(Math.abs(z)-(D+1),0),d=Math.hypot(dx,dz);
  let h=-0.04+2.2*Math.exp(-Math.pow((d-7.5)/3.4,2));
  h+=nz2(x,z)*0.55*smooth(12,36,d);
  h-=smooth(52,80,d)*9.6;
  return h;
}
{
  const g=new T.PlaneGeometry(480,480,220,220);g.rotateX(-Math.PI/2);
  const p=g.attributes.position,col=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),h=heightAt(x,z);p.setY(i,h);
    const b=clamp((-h-0.4)/7,0,1),v=0.5+0.5*nz2(x*1.7,z*1.7);
    col[i*3]=lerp(0.93+0.04*v,0.55,b);col[i*3+1]=lerp(0.96,0.78,b);col[i*3+2]=lerp(1.0,0.95,b);
  }
  g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();
  const m=new T.Mesh(g,std(0xffffff,.88,0,{vertexColors:true,envMapIntensity:.35}));m.receiveShadow=true;m.userData.noRefl=1;scene.add(m);
}
const oceanGeo=new T.PlaneGeometry(2400,2400,72,72);oceanGeo.rotateX(-Math.PI/2);
const ocean=new T.Mesh(oceanGeo,std(0x0b4a73,.2,.25,{envMapIntensity:1.1}));ocean.position.y=-8.3;scene.add(ocean);
const oceanBase=Float32Array.from(oceanGeo.attributes.position.array);

function bergGeo(seed,flatTop){
  const g=new T.IcosahedronGeometry(1,3),p=g.attributes.position,v=new T.Vector3();const col=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){
    v.fromBufferAttribute(p,i);
    const f=Math.sin(v.x*1.9+seed)*Math.sin(v.y*2.3+seed*1.3)+Math.sin(v.z*2.1+seed*.7)*Math.sin(v.x*3.1+seed)+.5*Math.sin(v.x*5.3+v.z*4.1+seed*2.1);
    v.multiplyScalar(1+0.26*f);
    if(v.y<-0.05)v.y*=0.9;
    if(flatTop&&v.y>0.55)v.y=0.55+(v.y-0.55)*0.25;
    p.setXYZ(i,v.x,v.y,v.z);
    const h=clamp(v.y*0.6+0.55,0,1);col[i*3]=lerp(0.55,0.97,h);col[i*3+1]=lerp(0.78,0.99,h);col[i*3+2]=lerp(0.96,1,h);
  }
  g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();return g;
}
const bergMat=std(0xffffff,.32,0,{vertexColors:true,flatShading:true,emissive:0x16324f,emissiveIntensity:.14,envMapIntensity:.6});
const bergGeos=[bergGeo(1.3,false),bergGeo(4.1,true),bergGeo(7.7,false),bergGeo(10.2,true)];
const floaters=[];
function addBerg(x,z,size,flat,gi,bob){
  const m=new T.Mesh(bergGeos[gi%4],bergMat);m.scale.set(size,size*flat,size);m.rotation.y=rnd(TAU);
  m.position.set(x,-8.3+size*flat*0.32,z);m.castShadow=size>10;scene.add(m);if(bob)floaters.push({m,y:m.position.y,s:rnd(10),a:size*0.02});return m;
}
for(let i=0;i<20;i++){const a=rnd(TAU)*0.5+(Math.random()<0.7?Math.PI*0.75:0)+Math.random()*Math.PI*0.6,r=rnd(260,520);addBerg(Math.sin(a)*r,-Math.cos(a)*r-20,rnd(40,95),rnd(.55,.95),i,false);}
for(let i=0;i<16;i++){const a=rnd(TAU),r=rnd(110,200);addBerg(Math.sin(a)*r,-Math.cos(a)*r,rnd(9,24),rnd(.45,.8),i+1,false);}
for(let i=0;i<34;i++){const a=rnd(TAU),r=rnd(78,170);addBerg(Math.sin(a)*r,-Math.cos(a)*r,rnd(1.6,5.5),rnd(.25,.45),i+2,true);}

/* ---- clouds ---- */
const cloudTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  for(let i=0;i<14;i++){const px=30+Math.random()*68,py=40+Math.random()*50,r=18+Math.random()*26;const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);}
  return new T.CanvasTexture(c);})();
const clouds=[];
for(let i=0;i<16;i++){
  const m=new T.SpriteMaterial({map:cloudTex,transparent:true,opacity:.75,depthWrite:false,fog:false});
  const s=new T.Sprite(m);const sc=rnd(160,320);s.scale.set(sc*1.8,sc*.7,1);s.position.set(rnd(-700,700),rnd(95,190),-rnd(120,700));s.renderOrder=-6;scene.add(s);clouds.push({s,v:rnd(1.5,4)});
}

/* ---- birds ---- */
const birds=[];
for(let i=0;i<7;i++){
  const g=new T.Group();const bm=std(i%2?0x2a2f36:0xe9eef3,.8);
  const body=new T.Mesh(new T.SphereGeometry(.45,8,6),bm);body.scale.set(.7,.6,1.5);g.add(body);
  const wg=new T.PlaneGeometry(2.2,.7);wg.translate(1.1,0,0);
  const wl=new T.Mesh(wg,new T.MeshStandardMaterial({color:bm.color,side:T.DoubleSide,roughness:.8}));wl.rotation.x=-Math.PI/2;g.add(wl);
  const wg2=new T.PlaneGeometry(2.2,.7);wg2.translate(-1.1,0,0);
  const wr=new T.Mesh(wg2,new T.MeshStandardMaterial({color:bm.color,side:T.DoubleSide,roughness:.8}));wr.rotation.x=-Math.PI/2;g.add(wr);
  g.scale.setScalar(1.2);scene.add(g);birds.push({g,wl,wr,r:rnd(30,95),h:rnd(18,44),s:rnd(.08,.2),a:rnd(TAU),cx:rnd(-30,30),cz:rnd(-30,10),ph:rnd(10)});
}


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
      x.font='900 26px Arial,sans-serif';x.textAlign='center';x.fillStyle='#fff';x.fillText(TEAM[k].name,64,190,118);return new T.CanvasTexture(c);};
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

/* ================= RINK ================= */
function rrShape(w,d,r){const s=new T.Shape();s.moveTo(-w+r,-d);s.lineTo(w-r,-d);s.absarc(w-r,-d+r,r,-Math.PI/2,0,false);s.lineTo(w,d-r);s.absarc(w-r,d-r,r,0,Math.PI/2,false);s.lineTo(-w+r,d);s.absarc(-w+r,d-r,r,Math.PI/2,Math.PI,false);s.lineTo(-w,-d+r);s.absarc(-w+r,-d+r,r,Math.PI,Math.PI*1.5,false);return s;}
function iceTextureV9(){
  const cw=2048,ch=1024,c=document.createElement('canvas');c.width=cw;c.height=ch;const x=c.getContext('2d');
  const g=x.createRadialGradient(cw/2,ch/2,40,cw/2,ch/2,cw*0.62);g.addColorStop(0,'#ecf8ff');g.addColorStop(1,'#bcdef3');x.fillStyle=g;x.fillRect(0,0,cw,ch);
  for(let i=0;i<260;i++){const px=Math.random()*cw,py=Math.random()*ch,r=20+Math.random()*120,a=0.05+Math.random()*0.06;const gg=x.createRadialGradient(px,py,0,px,py,r);gg.addColorStop(0,Math.random()<.5?'rgba(255,255,255,'+a+')':'rgba(110,175,225,'+a+')');gg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gg;x.fillRect(px-r,py-r,r*2,r*2);}
  x.lineCap='round';
  for(let i=0;i<700;i++){const px=Math.random()*cw,py=Math.random()*ch,l=30+Math.random()*180,a=Math.random()*TAU;x.strokeStyle='rgba(255,255,255,'+(0.05+Math.random()*0.12)+')';x.lineWidth=0.6+Math.random()*1.2;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+Math.cos(a)*l*.5+Math.random()*20,py+Math.sin(a)*l*.5+Math.random()*20,px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke();}
  x.setTransform(cw/(2*W),0,0,ch/(2*D),cw/2,ch/2);
  const line=(x1,z1,x2,z2,col,w,dash)=>{x.strokeStyle=col;x.lineWidth=w;x.setLineDash(dash||[]);x.beginPath();x.moveTo(x1,z1);x.lineTo(x2,z2);x.stroke();x.setLineDash([]);};
  const ring=(cx,cz,r,col,w)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.arc(cx,cz,r,0,TAU);x.stroke();};
  const dot=(cx,cz,r,col)=>{x.fillStyle=col;x.beginPath();x.arc(cx,cz,r,0,TAU);x.fill();};
  const RED='rgba(214,48,70,.82)',BLU='rgba(40,110,220,.8)';
  line(0,-D,0,D,RED,.5,[1.1,.55]);line(-8,-D,-8,D,BLU,.7);line(8,-D,8,D,BLU,.7);
  line(-(W-2.4),-D+1.2,-(W-2.4),D-1.2,RED,.16);line((W-2.4),-D+1.2,(W-2.4),D-1.2,RED,.16);
  ring(0,0,4.3,BLU,.26);dot(0,0,.5,BLU);
  for(const sx of[-1,1])for(const sz of[-1,1]){const px=sx*13,pz=sz*6;ring(px,pz,3.1,RED,.14);dot(px,pz,.34,RED);}
  x.fillStyle='rgba(110,190,255,.38)';x.strokeStyle=RED;x.lineWidth=.16;
  x.beginPath();x.arc(-W,0,3.6,-Math.PI/2,Math.PI/2);x.closePath();x.fill();x.stroke();
  x.beginPath();x.arc(W,0,3.6,Math.PI/2,Math.PI*1.5);x.closePath();x.fill();x.stroke();
  x.globalAlpha=.42;x.font='4px sans-serif';x.textAlign='center';x.fillText('\uD83D\uDC27',0,1.4);x.globalAlpha=1;
  const t=new T.CanvasTexture(c);t.anisotropy=maxAniso;return t;
}
const iceGeo=new T.ShapeGeometry(rrShape(W,D,CR),28);iceGeo.rotateX(-Math.PI/2);
{const p=iceGeo.attributes.position,uv=iceGeo.attributes.uv;for(let i=0;i<p.count;i++){uv.setXY(i,(p.getX(i)+W)/(2*W),1-(p.getZ(i)+D)/(2*D)*1);}
 // z: canvas y grows with +z ; flipY texture => v = 1 - (z+D)/(2D)
}
const iceMat=std(0xffffff,.28,0,{map:iceTexture(),envMapIntensity:1.0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const ice=new T.Mesh(iceGeo,iceMat);ice.receiveShadow=true;scene.add(ice);
for(const s of[-1,1]){const pk=new T.Mesh(new T.PlaneGeometry(GD+.8,2*GW+.6),std(0xdff1fb,.3,.05,{envMapIntensity:.8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));pk.rotation.x=-Math.PI/2;pk.position.set(s*(W+(GD-.2)/2+.1),0.003,0);pk.receiveShadow=true;scene.add(pk);}

/* skid-mark overlay */
const skidC=document.createElement('canvas');skidC.width=1024;skidC.height=512;const skidX=skidC.getContext('2d');
const skidTex=new T.CanvasTexture(skidC);
const skidGeo=iceGeo.clone();
const skid=new T.Mesh(skidGeo,new T.MeshBasicMaterial({map:skidTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,fog:true}));skid.position.y=0.012;skid.renderOrder=1;scene.add(skid);
let skidDirty=false,skidFade=0,skidUp=0;
function skidLine(x1,z1,x2,z2,col,w){
  const sx=1024/(2*W),sz=512/(2*D);
  skidX.strokeStyle=col;skidX.lineWidth=w;skidX.lineCap='round';skidX.beginPath();skidX.moveTo(512+x1*sx,256+z1*sz);skidX.lineTo(512+x2*sx,256+z2*sz);skidX.stroke();skidDirty=true;
}

/* boards (instanced) */
function perimeter(){
  const P=[],st=1.1;
  const line=(ax,az,bx,bz)=>{const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/st));for(let i=0;i<n;i++)P.push([ax+(bx-ax)*i/n,az+(bz-az)*i/n]);};
  const arc=(cx,cz,a0,a1)=>{const n=Math.max(3,Math.round(CR*Math.abs(a1-a0)/st));for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/n;P.push([cx+Math.cos(a)*CR,cz+Math.sin(a)*CR]);}};
  line(-W+CR,-D,W-CR,-D);arc(W-CR,-D+CR,-Math.PI/2,0);line(W,-D+CR,W,D-CR);arc(W-CR,D-CR,0,Math.PI/2);line(W-CR,D,-W+CR,D);arc(-W+CR,D-CR,Math.PI/2,Math.PI);line(-W,D-CR,-W,-D+CR);arc(-W+CR,-D+CR,Math.PI,Math.PI*1.5);
  return P;
}
function outN(x,z){const ax=Math.abs(x),az=Math.abs(z),sx=x<0?-1:1,sz=z<0?-1:1;
  if(ax>W-CR&&az>D-CR){const dx=ax-(W-CR),dz=az-(D-CR),l=Math.hypot(dx,dz)||1;return[sx*dx/l,sz*dz/l];}
  return ax>W-0.01?[sx,0]:[0,sz];}
const RK_MATS=buildBoards();

/* goals */
const netTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=2.2;x.strokeRect(0,0,32,32);x.beginPath();x.moveTo(0,0);x.lineTo(32,32);x.stroke();const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t;})();
function quad(a,b,c,d,ru,rv){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array([...a,...b,...c,...d]),3));g.setAttribute('uv',new T.BufferAttribute(new Float32Array([0,0,ru,0,ru,rv,0,rv]),2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return g;}
const netMat=new T.MeshBasicMaterial({map:netTex,transparent:true,alphaTest:.35,side:T.DoubleSide,depthWrite:true});
function buildGoalV9(sign,colHex){
  const g=new T.Group();g.position.x=sign*W;g.rotation.y=sign>0?0:Math.PI;
  const fm=std(colHex,.35,.25,{emissive:colHex,emissiveIntensity:.2});
  for(const s of[-1,1]){
    const p=new T.Mesh(new T.CylinderGeometry(.13,.13,1.7,10),fm);p.position.set(0,.85,s*GW);p.castShadow=true;g.add(p);
    const bp=new T.Mesh(new T.CylinderGeometry(.08,.08,1.1,8),fm);bp.position.set(GD,.55,s*GW);g.add(bp);
    const rail=new T.Mesh(new T.CylinderGeometry(.07,.07,GD,8),fm);rail.rotation.z=Math.PI/2;rail.position.set(GD/2,.07,s*GW);g.add(rail);
    const L=Math.hypot(GD,.6),tr=new T.Mesh(new T.CylinderGeometry(.07,.07,L,8),fm);tr.rotation.z=Math.atan2(-GD,-.6);tr.position.set(GD/2,1.4,s*GW);g.add(tr);
    g.add(new T.Mesh(quad([0,0,s*GW],[GD,0,s*GW],[GD,1.1,s*GW],[0,1.7,s*GW],5,3),netMat));
  }
  const cb=new T.Mesh(new T.CylinderGeometry(.13,.13,2*GW,10),fm);cb.rotation.x=Math.PI/2;cb.position.set(0,1.7,0);cb.castShadow=true;g.add(cb);
  const bb=new T.Mesh(new T.CylinderGeometry(.08,.08,2*GW,8),fm);bb.rotation.x=Math.PI/2;bb.position.set(GD,1.1,0);g.add(bb);
  g.add(new T.Mesh(quad([GD,0,-GW],[GD,0,GW],[GD,1.1,GW],[GD,1.1,-GW],10,3),netMat));
  g.add(new T.Mesh(quad([0,1.7,-GW],[0,1.7,GW],[GD,1.1,GW],[GD,1.1,-GW],10,4),netMat));
  scene.add(g);
}
buildGoal(-1,0x3d8bff);buildGoal(1,0xff4d5e);

/* ================= CROWD (instanced penguins) ================= */
function makeCrowd(max,animated){
  const parts=[],O=new T.Object3D(),tmp=new T.Matrix4(),root=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),pos=new T.Vector3(),scl=new T.Vector3();
  const mk=(geo,mat,x,y,z,sx,sy,sz,rx,dyn)=>{O.position.set(x,y,z);O.rotation.set(rx||0,0,0);O.scale.set(sx,sy,sz);O.updateMatrix();
    const m=new T.InstancedMesh(geo,mat,max);m.userData.crowd=1;m.castShadow=true;m.receiveShadow=true;m.count=0;m.frustumCulled=false;scene.add(m);parts.push({m,lm:O.matrix.clone(),dyn:dyn||0,sh:[x,y,z]});return m;};
  const sp=new T.SphereGeometry(1,12,9);
  const blk=std(0x14171c,.6),wht=std(0xf2f5f9,.6),org=std(0xff8c1c,.55);
  mk(crowdBodyGeo(),new T.MeshStandardMaterial({vertexColors:true,roughness:.62}),0,0,0,1,1,1);
  const cg=new T.ConeGeometry(.06,.22,8);mk(cg,org,0,1.35,.3,1,1,1,Math.PI/2);
  mk(sp,std(0x050505,.3),-.11,1.43,.24,.05,.05,.05);mk(sp,std(0x050505,.3),.11,1.43,.24,.05,.05,.05);
  mk(sp,org,-.17,.04,.22,.12,.04,.2);mk(sp,org,.17,.04,.22,.12,.04,.2);
  const fg=new T.SphereGeometry(1,8,6);fg.scale(.07,.34,.17);fg.translate(0,-.3,0);
  mk(fg,blk,0,0,0,1,1,1,0,-1);mk(fg,blk,0,0,0,1,1,1,0,1);
  const sc=mk(new T.TorusGeometry(.3,.07,8,16),std(0xffffff,.7),0,1.14,0,1,1,1,Math.PI/2);
  parts.forEach(p=>{if(p.dyn){p.sh=[p.dyn*.5,.98,0];}});
  const items=[];const pal=[0x3d8bff,0xff4d5e,0xffffff,0xffd24a,0x4cd9a0];
  const api={
    add(x,y,z,yaw,s,col){const i=items.length;items.push({x,y,z,yaw,s,seed:Math.random()*20,cheer:0});sc.setColorAt(i,new T.Color(col!==undefined?col:pal[(Math.random()*pal.length)|0]));return i;},
    update(t,cheer,still){
      const n=items.length;
      for(let i=0;i<n;i++){
        const it=items[i];
        const c=still?0:cheer,hop=c>0.05?Math.abs(Math.sin(t*8+it.seed))*0.55*c:0,bob=still?0:Math.sin(t*1.6+it.seed)*0.025;
        e.set(0,it.yaw,still?0:(Math.sin(t*2.2+it.seed)*0.04+(c>0.05?Math.sin(t*9+it.seed)*0.18*c:0)));q.setFromEuler(e);
        pos.set(it.x,it.y+hop+bob,it.z);scl.set(it.s,it.s,it.s);root.compose(pos,q,scl);
        for(const p of parts){
          if(p.dyn){const open=0.28+(c>0.05?(1.9+Math.sin(t*12+it.seed)*0.5)*c:Math.sin(t*1.7+it.seed)*0.05);O.position.set(p.sh[0],p.sh[1],p.sh[2]);O.rotation.set(0,0,p.dyn*-1*open*-1);O.rotation.z=(p.dyn>0?1:-1)*open;O.scale.set(1,1,1);O.updateMatrix();tmp.multiplyMatrices(root,O.matrix);}
          else tmp.multiplyMatrices(root,p.lm);
          p.m.setMatrixAt(i,tmp);
        }
      }
      for(const p of parts){p.m.count=n;p.m.instanceMatrix.needsUpdate=true;}
      if(sc.instanceColor)sc.instanceColor.needsUpdate=true;
    }
  };
  return api;
}
const crowd=makeCrowd(160),colony=makeCrowd(240);
{
  const addSpec=(x,z)=>{crowd.add(x,heightAt(x,z),z,Math.atan2(-x,-z),rnd(.95,1.15));};
  for(const s of[-1,1])for(let r=0;r<2;r++){const z=s*(D+1+4.2+r*2.1);for(let x=-W-2;x<=W+2;x+=2.6+Math.random()*.8)addSpec(x+rnd(-.4,.4),z+rnd(-.3,.3));}
  for(const s of[-1,1])for(let r=0;r<2;r++){const x=s*(W+1+4.4+r*2.1);for(let z=-D+3;z<=D-3;z+=2.8)addSpec(x+rnd(-.3,.3),z+rnd(-.4,.4));}
  let placed=0;
  for(let c=0;c<14&&placed<230;c++){
    let cx,cz,tries=0;do{cx=rnd(-110,110);cz=rnd(-110,110);const dx=Math.max(Math.abs(cx)-(W+1),0),dz=Math.max(Math.abs(cz)-(D+1),0);var dd=Math.hypot(dx,dz);tries++;}while((dd<30||dd>52)&&tries<60);
    for(let k=0;k<16&&placed<230;k++){const x=cx+rnd(-6,6),z=cz+rnd(-6,6);colony.add(x,heightAt(x,z),z,rnd(TAU),rnd(1.1,1.5),0xb9c4cf);placed++;}
  }
  colony.update(0,0,true);
}

rinkDecor();

/* ================= PARTICLES ================= */
const NP=900;
const pPos=new Float32Array(NP*3),pCol=new Float32Array(NP*3),pSize=new Float32Array(NP),pAl=new Float32Array(NP),pVel=new Float32Array(NP*3),pLife=new Float32Array(NP),pMax=new Float32Array(NP),pS0=new Float32Array(NP);
let pHead=0;
const pGeo=new T.BufferGeometry();
const aPos=new T.BufferAttribute(pPos,3),aCol=new T.BufferAttribute(pCol,3),aSize=new T.BufferAttribute(pSize,1),aAl=new T.BufferAttribute(pAl,1);
[aPos,aCol,aSize,aAl].forEach(a=>a.setUsage&&a.setUsage(T.DynamicDrawUsage));
pGeo.setAttribute('position',aPos);pGeo.setAttribute('color',aCol);pGeo.setAttribute('size',aSize);pGeo.setAttribute('alpha',aAl);
const pU={uScale:{value:800}};
const pMat=new T.ShaderMaterial({uniforms:pU,transparent:true,depthWrite:false,
  vertexShader:'attribute float size;attribute float alpha;attribute vec3 color;varying vec3 vC;varying float vA;uniform float uScale;void main(){vC=color;vA=alpha;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=max(1.0,size*uScale/-mv.z);gl_Position=projectionMatrix*mv;}',
  fragmentShader:'varying vec3 vC;varying float vA;void main(){vec2 c=gl_PointCoord-0.5;float d=length(c);if(d>0.5)discard;gl_FragColor=vec4(vC,smoothstep(0.5,0.12,d)*vA);}'});
const parts=new T.Points(pGeo,pMat);parts.frustumCulled=false;parts.renderOrder=5;scene.add(parts);
for(let i=0;i<NP;i++){pPos[i*3+1]=-50;}
function emit(x,y,z,vx,vy,vz,life,size,r,g,b){
  const i=pHead;pHead=(pHead+1)%NP;
  pPos[i*3]=x;pPos[i*3+1]=y;pPos[i*3+2]=z;pVel[i*3]=vx;pVel[i*3+1]=vy;pVel[i*3+2]=vz;pLife[i]=life;pMax[i]=life;pS0[i]=size;pCol[i*3]=r;pCol[i*3+1]=g;pCol[i*3+2]=b;
}
function updateParticles(dt){
  for(let i=0;i<NP;i++){
    if(pLife[i]<=0){pAl[i]=0;continue;}
    pLife[i]-=dt;
    if(pLife[i]<=0){pAl[i]=0;pPos[i*3+1]=-50;continue;}
    const k=pLife[i]/pMax[i];
    pVel[i*3+1]-=9*dt;pPos[i*3]+=pVel[i*3]*dt;pPos[i*3+1]+=pVel[i*3+1]*dt;pPos[i*3+2]+=pVel[i*3+2]*dt;
    if(pPos[i*3+1]<0.03){pPos[i*3+1]=0.03;pVel[i*3+1]*=-0.3;pVel[i*3]*=0.7;pVel[i*3+2]*=0.7;}
    pAl[i]=Math.min(1,k*1.6);pSize[i]=pS0[i]*(0.55+0.45*k);
  }
  aPos.needsUpdate=aCol.needsUpdate=aSize.needsUpdate=aAl.needsUpdate=true;
}

/* ---- snow ---- */
const NS=2400;
const sGeo=new T.BufferGeometry(),sPos=new Float32Array(NS*3);
for(let i=0;i<NS;i++){sPos[i*3]=rnd(-50,50);sPos[i*3+1]=rnd(0,30);sPos[i*3+2]=rnd(-50,50);}
sGeo.setAttribute('position',new T.BufferAttribute(sPos,3));
const snowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32);return new T.CanvasTexture(c);})();
const snowMat=new T.PointsMaterial({color:0xffffff,size:.26,map:snowTex,transparent:true,opacity:.85,depthWrite:false,fog:false});
const snow=new T.Points(sGeo,snowMat);snow.frustumCulled=false;snow.renderOrder=6;scene.add(snow);

/* ================= PUCK + MARKERS ================= */
const puckG=new T.Group();
{
  const body=new T.Mesh(new T.CylinderGeometry(PUCKR,PUCKR,.2,28),std(0x0e1013,.28,.4,{envMapIntensity:1}));body.position.y=.1;body.castShadow=true;puckG.add(body);
  const rim=new T.Mesh(new T.TorusGeometry(PUCKR,.035,8,28),std(0x7d8794,.3,.8));rim.rotation.x=Math.PI/2;rim.position.y=.16;puckG.add(rim);
  const top=new T.Mesh(new T.CylinderGeometry(PUCKR*.62,PUCKR*.62,.01,24),new T.MeshBasicMaterial({color:0x44d0ff}));top.position.y=.205;puckG.add(top);
  scene.add(puckG);
}
const puckRing=new T.Mesh(new T.RingGeometry(.62,.78,32),new T.MeshBasicMaterial({color:0x1d5fa8,transparent:true,opacity:.75,side:T.DoubleSide,depthWrite:false}));
puckRing.rotation.x=-Math.PI/2;puckRing.position.y=.03;scene.add(puckRing);
const trailTex=(()=>{const c=document.createElement('canvas');c.width=128;c.height=32;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,128,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,.9)');x.fillStyle=g;x.fillRect(0,12,128,8);return new T.CanvasTexture(c);})();
const puckTrail=new T.Mesh(new T.PlaneGeometry(1,.5),new T.MeshBasicMaterial({map:trailTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.9}));
puckTrail.geometry.translate(-.5,0,0);puckTrail.rotation.x=-Math.PI/2;puckTrail.visible=false;scene.add(puckTrail);
const marker=new T.Group();marker.scale.setScalar(1.7);
{const cone=new T.Mesh(new T.ConeGeometry(.26,.55,4),new T.MeshBasicMaterial({color:0xffe14d}));cone.rotation.x=Math.PI;cone.position.y=0;marker.add(cone);scene.add(marker);}
const markerRing=new T.Mesh(new T.RingGeometry(1.0,1.32,36),new T.MeshBasicMaterial({color:0xffd21f,transparent:true,opacity:.95,depthTest:false,side:T.DoubleSide,depthWrite:false}));markerRing.rotation.x=-Math.PI/2;markerRing.position.y=.04;scene.add(markerRing);
const aimShape=new T.Shape();aimShape.moveTo(-.22,0);aimShape.lineTo(.22,0);aimShape.lineTo(.22,.8);aimShape.lineTo(.55,.8);aimShape.lineTo(0,1.5);aimShape.lineTo(-.55,.8);aimShape.lineTo(-.22,.8);aimShape.closePath();
const aimGeo=new T.ShapeGeometry(aimShape);aimGeo.rotateX(-Math.PI/2);
// shape y -> -z after rotate; flip so arrow points +z
aimGeo.scale(1,1,-1);
const aimArrow=new T.Mesh(aimGeo,new T.MeshBasicMaterial({color:0xffe14d,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));aimArrow.position.y=.05;aimArrow.visible=false;scene.add(aimArrow);
const passRing=new T.Mesh(new T.RingGeometry(.85,1.05,32),new T.MeshBasicMaterial({color:0x7effa8,transparent:true,opacity:.75,side:T.DoubleSide,depthWrite:false,depthTest:false}));passRing.rotation.x=-Math.PI/2;passRing.position.y=.045;passRing.visible=false;scene.add(passRing);

/* ================= PENGUIN BUILDER ================= */
const PROFILE=[[0,0],[.22,.015],[.42,.10],[.54,.28],[.58,.52],[.55,.76],[.46,.98],[.34,1.12],[.28,1.2],[.30,1.3],[.35,1.4],[.35,1.5],[.28,1.6],[.12,1.66],[0,1.68]];
const PROF_PTS=new T.SplineCurve(PROFILE.map(p=>new T.Vector2(p[0],p[1]))).getPoints(80).map(p=>new T.Vector2(Math.max(p.x,0.0006),p.y));
function featherTex(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,128,128);
  for(let row=0;row<9;row++)for(let col=0;col<9;col++){const ox=col*16+(row%2?8:0),oy=row*14;const g=x.createRadialGradient(ox,oy+3,1,ox,oy+3,11);g.addColorStop(0,'#cfcfcf');g.addColorStop(1,'#6c6c6c');x.fillStyle=g;x.beginPath();x.ellipse(ox,oy+5,8,9,0,0,TAU);x.fill();}
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(9,7);t.anisotropy=4;return t;
}
const FEATHER=featherTex();
const bodyMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.58,metalness:0,bumpMap:FEATHER,bumpScale:1.6,envMapIntensity:.5});
function bodyColor(ty,x,y,z,o){
  const th=Math.atan2(x,z),a=Math.abs(th);
  let half;if(y<0.3)half=2.3;else if(y<1.0)half=lerp(1.45,1.1,(y-.3)/.7);else half=lerp(1.1,.6,clamp((y-1)/.2,0,1));
  const headFade=(ty.patch==='adelie'||ty.patch==='rock')?1-smooth(1.04,1.12,y):1-smooth(1.16,1.26,y);
  let wh=(1-smooth(half-.14,half+.1,a))*headFade;
  if(ty.patch==='chinstrap'){
    const face=smooth(1.16,1.22,y)*(1-smooth(1.52,1.62,y)),fw=(1-smooth(1.35,1.75,a))*face;wh=Math.max(wh,fw);
    const line=smooth(1.10,1.14,y)*(1-smooth(1.2,1.25,y))*(1-smooth(1.3,1.6,a));wh*=1-line;
  }
  let r=.025,g=.03,b=.045;
  const back=smooth(1.2,3.1,a)*(ty.patch==='ear'?1.5:.5);r+=.02*back;g+=.03*back;b+=.055*back;
  r=lerp(r,.94,wh);g=lerp(g,.95,wh);b=lerp(b,.97,wh);
  if(ty.patch==='ear'){
    const pc=ty.pc,t=smooth(.8,1.15,y)*wh;r=lerp(r,pc[0],t*.85);g=lerp(g,pc[1],t*.85);b=lerp(b,pc[2],t*.85);
    const e=1-Math.hypot((a-1.4)/.55,(y-1.37)/.17),f=smooth(0,.4,e);r=lerp(r,pc[0],f);g=lerp(g,pc[1],f);b=lerp(b,pc[2],f);
  }else if(ty.patch==='auk'){   // great auk: large white oval between eye and bill
    for(const sx of[1]){const e=1-Math.hypot((a-.5)/.2,(y-1.43)/.085),f=smooth(0,.35,e);r=lerp(r,.97,f);g=lerp(g,.97,f);b=lerp(b,.99,f);}
  }else if(ty.patch==='gentoo'){
    const e=1-Math.hypot((a-.85)/.8,(y-1.535)/.1),f=smooth(0,.35,e);r=lerp(r,.95,f);g=lerp(g,.96,f);b=lerp(b,.98,f);
  }
  const sh=.9+.1*smooth(0,.5,y);o[0]=r*sh;o[1]=g*sh;o[2]=b*sh;
}
const bodyGeoCache={};
function bodyGeo(key){
  if(bodyGeoCache[key])return bodyGeoCache[key];
  const ty=TYPES[key],g=new T.LatheGeometry(PROF_PTS,56),pos=g.attributes.position,col=new Float32Array(pos.count*3),c=[0,0,0];
  for(let i=0;i<pos.count;i++){bodyColor(ty,pos.getX(i),pos.getY(i),pos.getZ(i),c);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];}
  g.setAttribute('color',new T.BufferAttribute(col,3));return bodyGeoCache[key]=g;
}
const sphC={};const sph=(s)=>sphC[s||16]||(sphC[s||16]=new T.SphereGeometry(1,s||16,Math.max(8,((s||16)*.7)|0)));
function ell(mat,sx,sy,sz,x,y,z,seg){const m=new T.Mesh(sph(seg),mat);m.scale.set(sx,sy,sz);m.position.set(x||0,y||0,z||0);m.castShadow=true;return m;}
const MAT={redEye:std(0xd0182a,.2,.1),yellow:std(0xffd21a,.5,0,{emissive:0x302400}),black:std(0x101216,.45,.1),white:std(0xf4f7fb,.5),orange:std(0xff8c1c,.5),eyeW:std(0xffffff,.25),pupil:std(0x040404,.08,.3),gold:std(0xffcf33,.3,.85,{emissive:0x3a2a00}),dark:std(0x2b3440,.4,.3)};
const teamMatC={};const teamMat=(c,r,m)=>{const k=c+'_'+(r||.65)+'_'+(m||0);return teamMatC[k]||(teamMatC[k]=std(c,r||.65,m||0,{side:T.DoubleSide}));};
function buildHat(key,col){
  const g=new T.Group(),mt=teamMat(col,.6);
  if(key==='beanie'){
    const cap=new T.Mesh(new T.SphereGeometry(.385,28,14,0,TAU,0,Math.PI*.5),mt);cap.scale.y=.66;cap.position.y=1.56;cap.castShadow=true;g.add(cap);
    const br=new T.Mesh(new T.TorusGeometry(.375,.05,10,28),MAT.white);br.rotation.x=Math.PI/2;br.position.y=1.56;g.add(br);
    g.add(ell(MAT.white,.1,.1,.1,0,1.83,0,12));
  }else if(key==='helmet'){
    const cap=new T.Mesh(new T.SphereGeometry(.4,28,14,0,TAU,0,Math.PI*.5),teamMat(col,.28,.35));cap.scale.y=.74;cap.position.y=1.55;cap.castShadow=true;g.add(cap);
    const st=new T.Mesh(new T.TorusGeometry(.4,.025,8,28,Math.PI),MAT.white);st.position.y=1.55;st.scale.y=.74;st.rotation.y=Math.PI/2;g.add(st);
    for(const s of[-1,1])g.add(ell(MAT.dark,.07,.12,.12,s*.37,1.44,0,10));
  }else if(key==='headband'){
    const b=new T.Mesh(new T.TorusGeometry(.355,.04,8,28),mt);b.rotation.x=Math.PI/2;b.position.y=1.53;g.add(b);
    g.add(ell(mt,.08,.08,.08,0,1.53,-.36,8));
    for(const s of[-1,1]){const t=new T.Mesh(new T.BoxGeometry(.07,.3,.02),mt);t.position.set(s*.06,1.4,-.4);t.rotation.x=.2;g.add(t);}
  }else if(key==='party'){
    const c=new T.Mesh(new T.ConeGeometry(.2,.46,16),teamMat(0xffd24a,.5));c.position.set(0,1.88,0);c.rotation.z=.08;c.castShadow=true;g.add(c);
    const s=new T.Mesh(new T.TorusGeometry(.14,.02,6,16),mt);s.rotation.x=Math.PI/2;s.position.y=1.82;g.add(s);
    g.add(ell(mt,.07,.07,.07,0,2.12,0,8));
  }else if(key==='crown'){
    const r=new T.Mesh(new T.CylinderGeometry(.25,.27,.12,18,1,true),MAT.gold);r.position.y=1.72;g.add(r);
    for(let i=0;i<5;i++){const a=i/5*TAU,sp=new T.Mesh(new T.ConeGeometry(.055,.2,6),MAT.gold);sp.position.set(Math.cos(a)*.26,1.87,Math.sin(a)*.26);g.add(sp);}
    g.add(ell(teamMat(0xff3b4e,.3),.04,.04,.04,0,1.76,.27,6));
  }
  return g;
}
const footMatC={};const footMat=c=>footMatC[c]||(footMatC[c]=std(c,.5));
function rockCrest(inner){   // rockhopper: spiky yellow eyebrow plumes + black spiky crest
  for(const s of[-1,1]){
    for(let i=0;i<4;i++){const p=ell(MAT.yellow,.03,.03,.25-.025*i,0,0,0,8);p.position.set(s*(.19+.035*i),1.56+.025*i,.2-.1*i);p.rotation.set(-.35-.15*i,s*(.55+.18*i),0);inner.add(p);}
  }
  for(let i=0;i<6;i++){const c=new T.Mesh(new T.ConeGeometry(.035,.2,6),MAT.black);c.position.set((i-2.5)*.055,1.66,-.02-.04*Math.abs(i-2.5));c.rotation.set(-.5,0,(i-2.5)*.22);c.castShadow=true;inner.add(c);}
}
function buildPenguinV9(typeKey,teamKey,hatKey,o){
  o=o||{};const ty=TYPES[typeKey],tc=TEAM[teamKey].color,tcol=new T.Color(tc);
  const root=new T.Group(),piv=new T.Group(),inner=new T.Group();piv.position.y=PIV;inner.position.y=-PIV;root.add(piv);piv.add(inner);
  root.scale.setScalar(ty.scale*(o.goalie?1.15:1));
  const body=new T.Mesh(bodyGeo(typeKey),bodyMat);body.castShadow=true;body.receiveShadow=true;inner.add(body);
  // jersey
  {const jp=PROF_PTS.filter(p=>p.y>=.42&&p.y<=.8).map(p=>new T.Vector2(p.x+.03,p.y)),jg=new T.LatheGeometry(jp,40),pp=jg.attributes.position,cc=new Float32Array(pp.count*3);
   for(let i=0;i<pp.count;i++){const y=pp.getY(i),st=smooth(.575,.59,y)*(1-smooth(.625,.64,y));cc[i*3]=lerp(tcol.r,1,st);cc[i*3+1]=lerp(tcol.g,1,st);cc[i*3+2]=lerp(tcol.b,1,st);}
   jg.setAttribute('color',new T.BufferAttribute(cc,3));const jm=new T.Mesh(jg,new T.MeshStandardMaterial({vertexColors:true,roughness:.7,side:T.DoubleSide,envMapIntensity:.4}));jm.castShadow=true;inner.add(jm);}
  // scarf
  const sc=new T.Mesh(new T.TorusGeometry(.325,.078,10,32),teamMat(tc,.7));sc.rotation.x=Math.PI/2;sc.position.y=1.15;sc.castShadow=true;inner.add(sc);
  const scarfTail=new T.Group();scarfTail.position.set(-.2,1.12,-.27);
  {const a=new T.Mesh(new T.BoxGeometry(.14,.44,.04),teamMat(tc,.7));a.position.y=-.22;scarfTail.add(a);const b=new T.Mesh(new T.BoxGeometry(.145,.05,.045),MAT.white);b.position.y=-.3;scarfTail.add(b);}
  inner.add(scarfTail);
  // eyes
  const eyes=[],pupils=[];
  for(const s of[-1,1]){
    const eg=new T.Group();eg.position.set(s*.235,1.43,.255);eg.rotation.y=s*.78;
    const big=ty.patch==='adelie'?1.3:1;
    eg.add(ell(MAT.eyeW,.1*big,.1*big,.06,0,0,0,14));
    if(ty.patch==='rock')eg.add(ell(MAT.redEye,.078,.078,.03,0,0,.03,12));
    const pr=ty.patch==='rock'?.04:ty.patch==='adelie'?.07:.062,pu=ell(MAT.pupil,pr,pr,.04,0,0,.04,12);eg.add(pu);
    eg.add(ell(MAT.eyeW,.02,.02,.02,.02,.025,.075,6));
    inner.add(eg);eyes.push(eg);pupils.push(pu);
  }
  // beak
  if(ty.patch==='auk')aukBeak(inner);else{const bl=ty.bl||1,bw=ty.bw||1,ug=new T.ConeGeometry(.072*bw,.31*bl,12);ug.scale(1.2,1,.58);const up=new T.Mesh(ug,std(ty.beak[0],.4,.1));up.rotation.x=Math.PI/2+.1;up.position.set(0,1.375,.47+.155*(bl-1));up.castShadow=true;inner.add(up);
   const lg=new T.ConeGeometry(.056*bw,.24*bl,10);lg.scale(1.1,1,.5);const lo=new T.Mesh(lg,std(ty.beak[1],.4,.1));lo.rotation.x=Math.PI/2+.05;lo.position.set(0,1.335,.44+.12*(bl-1));inner.add(lo);}
  // flippers
  const fl=[];
  for(const s of[-1,1]){
    const g=new T.Group();g.position.set(s*.5,.96,0);
    const f=ell(MAT.black,.075,.4,.21,0,-.36,0,14);g.add(f);
    const inn=ell(MAT.white,.02,.3,.14,-s*.055,-.38,.0,10);g.add(inn);
    const band=new T.Mesh(new T.TorusGeometry(.085,.032,8,16),teamMat(tc,.6));band.rotation.x=Math.PI/2;band.position.y=-.2;band.scale.set(1,1.3,1);g.add(band);
    g.rotation.z=s*.28;inner.add(g);fl.push(g);
  }
  // feet
  const ft=[],fm=ty.patch==='auk'?MAT.dark:ty.foot?footMat(ty.foot):MAT.orange;
  for(const s of[-1,1]){
    const g=new T.Group();g.position.set(s*.2,.05,.3);
    g.add(ell(fm,.15,.045,.26,0,0,.08,12));
    for(let i=-1;i<=1;i++)g.add(ell(fm,.045,.04,.07,i*.07,0,.32-Math.abs(i)*.03,8));
    inner.add(g);ft.push(g);
  }
  // tail
  {const tl=ty.tail||1,tg=new T.ConeGeometry(.14,.4*tl,10);const t=new T.Mesh(tg,MAT.black);t.rotation.x=-Math.PI/2-.4;t.position.set(0,.14-.06*(tl-1),-.52-.14*(tl-1));t.castShadow=true;inner.add(t);}
  if(ty.patch==='rock')rockCrest(inner);
  // hat
  const hat=buildHat(o.goalie?'helmet':hatKey,tc);inner.add(hat);
  return {root,piv,inner,body,flipL:fl[0],flipR:fl[1],footL:ft[0],footR:ft[1],eyeL:eyes[0],eyeR:eyes[1],pupL:pupils[0],pupR:pupils[1],scarfTail,hat};
}

/* ================= AUDIO ================= */
const SFX=(()=>{
  let ctx=null,master=null,nb=null,wind=null,slide=null,crowdL=null,ready=false,on=true,crowdLvl=0,vol=.7;
  function init(){
    if(ready){if(ctx&&ctx.state==='suspended')ctx.resume();return;}
    try{ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
    master=ctx.createGain();master.gain.value=on?vol:0;master.connect(ctx.destination);
    const len=ctx.sampleRate*2;nb=ctx.createBuffer(1,len,ctx.sampleRate);const d=nb.getChannelData(0);let last=0;
    for(let i=0;i<len;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=w*.6+last*3;}
    const loop=(f,type,q)=>{const s=ctx.createBufferSource();s.buffer=nb;s.loop=true;const fi=ctx.createBiquadFilter();fi.type=type;fi.frequency.value=f;fi.Q.value=q;const g=ctx.createGain();g.gain.value=0;s.connect(fi);fi.connect(g);g.connect(master);s.start();return{g,f:fi};};
    wind=loop(380,'lowpass',.7);slide=loop(2400,'bandpass',.9);crowdL=loop(900,'bandpass',.5);
    ready=true;
  }
  const ok=()=>ready&&on&&ctx;
  function tone(f,dur,type,vol,to,delay){
    if(!ok())return;const t=ctx.currentTime+(delay||0),o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);
  }
  function noise(dur,f,q,vol,type,delay){
    if(!ok())return;const t=ctx.currentTime+(delay||0),s=ctx.createBufferSource();s.buffer=nb;const fi=ctx.createBiquadFilter();fi.type=type||'bandpass';fi.frequency.value=f;fi.Q.value=q;const g=ctx.createGain();
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fi);fi.connect(g);g.connect(master);s.start(t,Math.random());s.stop(t+dur+.05);
  }
  const sm=(n,v,tc)=>{if(ok()&&n)n.g.gain.setTargetAtTime(v,ctx.currentTime,tc||.08);};
  return{
    init,setOn(v){on=v;if(master)master.gain.value=v?vol:0;},setVol(x){vol=x;if(master)master.gain.value=on?vol:0;},
    cineIn(){noise(.32,2600,.6,.16);noise(.18,700,.7,.14,'lowpass');tone(240,.28,'sawtooth',.05,960);},
    cineCharge(d){if(!ok())return;d=Math.max(.3,d);const t=ctx.currentTime,o=ctx.createOscillator(),o2=ctx.createOscillator(),fi=ctx.createBiquadFilter(),g=ctx.createGain();
      o.type='sawtooth';o2.type='square';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(660,t+d);o2.frequency.setValueAtTime(165.5,t);o2.frequency.exponentialRampToValueAtTime(990,t+d);
      fi.type='lowpass';fi.frequency.setValueAtTime(500,t);fi.frequency.exponentialRampToValueAtTime(4200,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.06,t+d*.92);g.gain.exponentialRampToValueAtTime(.0001,t+d+.05);
      o.connect(fi);o2.connect(fi);fi.connect(g);g.connect(master);o.start(t);o2.start(t);o.stop(t+d+.1);o2.stop(t+d+.1);noise(d,5200,1.2,.03);},
    cineHit(){tone(78,.7,'sine',.42,30);noise(.55,420,.6,.42,'lowpass');noise(.3,4200,.9,.2);tone(1320,.35,'triangle',.05,330);tone(660,.5,'sawtooth',.04,160,.02);},
    bray(){tone(640,.2,'sawtooth',.1,900);tone(560,.34,'sawtooth',.11,300,.22);noise(.25,900,.8,.08,'bandpass',.22);},
    fanfare(){[392,523,659].forEach((f,i)=>tone(f,.2,'square',.07,f*1.01,i*.1));tone(784,.42,'sawtooth',.07,790,.3);},
    flare(){tone(1700,.5,'sine',.07,2500);tone(2300,.4,'triangle',.05,3300,.08);noise(.45,6000,2,.05);},
    hop(){tone(300,.18,'sine',.13,760);},
    ui(){tone(720,.07,'sine',.15,900);},
    tap(){noise(.05,2200,2,.25);tone(260,.05,'sine',.15,130);},
    shot(pw){noise(.12,1100,.8,.35);tone(170,.14,'triangle',.3+pw*.15,55);if(pw>.5)noise(.06,5200,3,.3);},
    whoosh(){noise(.14,1800,.7,.12);},
    hit(v){noise(.05,3000,2,.18*v);tone(210,.06,'sine',.15*v,110);},
    bump(v){noise(.12,320,.8,.35*v,'lowpass');tone(95,.14,'sine',.3*v,50);},
    save(){tone(520,.16,'triangle',.25,780);noise(.06,2600,2,.2);},
    goal(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,.28,'square',.12,0,i*.09));noise(1.4,1200,.5,.25,'bandpass',.1);tone(130,.5,'sawtooth',.12,65,.05);},
    honk(){const f=rnd(330,460);tone(f,.2,'sawtooth',.11,f*.72);tone(f*1.5,.12,'square',.04,f);},
    whistle(){tone(2600,.38,'sine',.12,2650);tone(2640,.38,'sine',.08,2600,.04);},
    beep(h){tone(h?1320:880,h?.4:.18,'square',.13);},
    win(){[392,523,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',.18,0,i*.12));},
    lose(){[330,294,262,196].forEach((f,i)=>tone(f,.35,'triangle',.16,0,i*.18));},
    slideLvl(l,p){sm(slide,l*.16);if(ready&&slide)slide.f.frequency.setTargetAtTime(1500+p*2600,ctx.currentTime,.1);},
    windLvl(l){sm(wind,l*.2,.5);},
    crowd(l){crowdLvl=l;sm(crowdL,l*.16,.2);},
    tick(l){tone(420+l*200,.07,'square',.07+l*.02);if(l>=3)tone(1200,.12,'triangle',.08,1600,.05);},
    passOk(){tone(660,.07,'sine',.16,990);tone(990,.1,'sine',.12,1320,.07);},
    pickup(){[880,1175,1568].forEach((f,i)=>tone(f,.12,'triangle',.14,0,i*.06));},
    passBad(cut){tone(cut?250:330,.16,'triangle',.2,cut?130:220);if(cut)noise(.08,900,1,.18);},
    firework(){noise(.32,650,.5,.09,'lowpass');tone(rnd(900,1400),.22,'sine',.035,rnd(300,500));},
    champ(){[523,659,784,1047,784,1047,1319,1568].forEach((f,i)=>tone(f,.32,'triangle',.17,0,i*.13));noise(2.2,1000,.4,.22,'bandpass',.2);},
    resume(){if(ctx&&ctx.state==='suspended')ctx.resume();},
    suspend(){if(ctx&&ctx.state==='running')ctx.suspend();}
  };
})();

/* ================= GAME STATE ================= */
const G={state:'menu',view:'menu',t:0,stateT:0,paused:false,cfg:null,teams:{},pengs:[],puck:{x:0,z:0,vx:0,vz:0,last:null,lastTeam:null,spAtGoal:0,hitT:0},player:null,
  tod:0.1,todT:0.1,wx:{mode:'snow',int:.5,target:.5,t:25,wind:3},cam:{x:0,z:0,shake:0,zoom:1},mouse:{wx:0,wz:0,t:-9999,active:false},diff:DIFF.normal,
  elapsed:0,timeLeft:0,ot:false,cheer:0,pass:null,passCount:0,pending:null,switchCd:0,tour:null,show:null,showT:0,vo:0,ui:'sMenu',scoredBy:null,saveShown:0,passDone:false,over:false};
const input={x:0,z:0,shoot:false,shootPress:false,shootRel:false,pass:false,dash:false,special:false,swap:false,joy:null,keys:{}};
Object.assign(G,{acc:0,alpha:1,frame:0,chain:0,chainT:0,otLeft:0,stats:null,tstat:null,carrier:null,mine:null,result:null,resultShown:false});

/* ---- penguin entity ---- */
function makePeng(tm,role,typeKey,idx,isGoalie,hatKey){
  const ty=TYPES[typeKey],pg=buildPenguin(typeKey,tm.key,hatKey,{goalie:isGoalie,num:pkNum(tm,typeKey,isGoalie)});
  const p={team:tm,role,idx,type:typeKey,ty,goalie:isGoalie,pg,x:0,z:0,vx:0,vz:0,ix:0,iz:0,heading:0,yawRate:0,r:(isGoalie?.72:.72)*ty.scale,
    mass:isGoalie?5:1+ty.stats.body*.25,fall:0,slow:0,dashT:0,dashMul:1.7,slideT:0,shotGrace:0,charge:0,charging:false,cd:{special:0,dash:0,shoot:0,pass:0},human:false,
    seed:Math.random()*100,pose:'play',cheerKind:0,anim:{tilt:0,roll:0,phase:Math.random()*6,swing:0,blink:rnd(2,5),blinkT:0,eyeSq:0,sad:0,flap:0,acc:0,y:0},
    ai:{t:0,noise:0,plan:null,cool:rnd(.3,1),dash:rnd(1,4),slipT:0,think:rnd(0,.2),iv:.3,tx:0,tz:0,full:false,mode:'shape',slot:null,slotT:0,seenT:0,upd:0,zs:0,zt:0,fail:false},diveT:0,diveDir:0,diveCd:0,getup:0,spinRate:0,sfxT:0,hx:0,hz:0,px:0,pz:0,gvx:0,gvz:0,ox:0,oz:0,rx:0,rz:0,slideHit:false,dashSpec:false,stage:0,specMax:8,passive:false};
  scene.add(pg.root);return p;
}
function clearMatch(){for(const p of G.pengs)scene.remove(p.pg.root);G.pengs=[];G.teams={};G.player=null;}

function setupMatch(cfg){
  condClear();clearMatch();G.rl=null;G.ps=null;G.cfg=cfg;G.diff=DIFF[cfg.diff||'normal'];
  const mk=(key)=>({key,dir:TEAM[key].dir,skaters:[],goalie:null,score:0,human:null,opp:null,chaser:null,chaser2:null,noScore:false,name:TEAM[key].name});
  G.teams.blue=mk('blue');G.teams.red=mk('red');G.teams.blue.opp=G.teams.red;G.teams.red.opp=G.teams.blue;
  const mine=cfg.demo?null:G.teams[cfg.teamKey||'blue'];
  const hatsAI=['beanie','beanie','headband','helmet','none','party'];
  const matesT=['balanced','defense','fast','basic'];
  for(const key of['blue','red']){
    const tm=G.teams[key],isMine=(tm===mine);
    let n=cfg.size;if(!isMine&&cfg.noOpp)n=0;
    const roles=ROLES[Math.max(1,n)]||[],form=FORM[Math.max(1,n)];
    for(let i=0;i<n;i++){
      let type,hat;
      if(isMine){type=i===0?save.type:(save.squad[i-1]||matesT[(i-1)%matesT.length]);hat=i===0?save.hat:hatsAI[(Math.random()*hatsAI.length)|0];}
      else{const arr=(cfg.oppTypes||['strong','fast','defense','basic']);type=arr[i%arr.length];hat=hatsAI[(Math.random()*hatsAI.length)|0];if(cfg.demo)type=demo18();}
      if(cfg.demo&&!isMine&&key==='blue')type=demo18();
      const p=makePeng(tm,roles[i],type,i,false,hat);
      if(isMine){const asg=(i===0||!!save.squad[i-1]);applyLevel(p,asg);applyChem(p,asg);}
      if(cfg.passiveMates&&isMine&&i>0){p.passive=true;p.role='attacker';}
      p.hx=tm.dir*-form[i][0]*-1;p.hx=tm.dir>0?form[i][0]:-form[i][0];p.hz=tm.dir>0?form[i][1]:-form[i][1];
      tm.skaters.push(p);G.pengs.push(p);
    }
    const wantGoalie=!cfg.noGoalies&&!(cfg.goalieOnly&&isMine)&&(isMine||!cfg.noOpp||cfg.goalieOnly);
    if(wantGoalie&&!(cfg.noOpp&&!cfg.goalieOnly&&!isMine)){
      const g=makePeng(tm,'goalie',isMine?'defense':'strong',9,true,'helmet');g.hx=-tm.dir*(W-1.7);g.hz=0;tm.goalie=g;G.pengs.push(g);
    }
  }
  if(mine&&(cfg.noScoreOpp||cfg.noScoreTeam))mine.opp.noScore=true;
  if(cfg.noScoreAll){G.teams.blue.noScore=true;G.teams.red.noScore=true;}
  if(mine){G.teams[mine.key].human=null;setHuman(mine.skaters[0]);}
  G.score={blue:0,red:0};G.elapsed=0;G.timeLeft=cfg.time||0;G.ot=false;G.pass=null;G.passCount=0;G.pending=null;G.over=false;G.mine=mine;G.stats={shots:0,onTarget:0,goals:0,saves:0,passOK:0,passTry:0,bestChain:0};G.tstat={blue:{shots:0,on:0},red:{shots:0,on:0}};G.chain=0;G.chainT=0;G.otLeft=0;hypeReset();tutInit();mgrReset();
  resetPositions();
}
function setHuman(p){
  if(G.player)G.player.human=false;
  G.player=p||null;if(p){p.human=true;p.team.human=p;p.charging=false;p.charge=0;}
  for(const k of['blue','red']){const tm=G.teams[k];tm.human=tm.skaters.find(s=>s.human)||null;}
}
function resetPositions(){G.royal=null;if(G.rl&&G.rl.thaw){G.rl.thaw=false;for(const q of G.pengs)if(!q.boxed)q.frozen=false;}
  const pk=G.puck;pk.x=0;pk.z=0;pk.vx=0;pk.vz=0;pk.last=null;pk.lastTeam=null;pk.ox=0;pk.oz=0;pk.rx=0;pk.rz=0;pk.shot=null;
  for(const p of G.pengs){
    p.x=p.hx;p.z=p.hz;p.vx=p.vz=0;p.ix=p.iz=0;p.heading=p.team.dir>0?Math.PI/2:-Math.PI/2;p.fall=0;p.slow=0;p.dashT=0;p.slideT=0;p.charging=false;p.charge=0;p.pose='play';
    p.diveT=0;p.getup=0;p.hopT=0;p.ramT=0;p.dbl=0;p.otWin=0;p.anim.tilt=0;p.anim.roll=0;p.px=p.x;p.pz=p.z;p.ai.plan=null;p.shotGrace=0;p.cd.shoot=p.cd.pass=0;p.ox=p.x;p.oz=p.z;p.rx=p.x;p.rz=p.z;p.gvx=p.gvz=0;p.dashSpec=false;p.slideHit=false;p.ai.seenT=0;p.ai.zs=0;p.ai.slot=null;p.getup=0;
  }
  for(const q of G.pengs)if(q.boxed)boxPlace(q);
  G.pass=null;G.carry=null;pcReset();rulesZoneSync();
}

/* ================= PHYSICS ================= */
const posts=[[-W,-GW],[-W,GW],[W,-GW],[W,GW]];
const FIXED=1/120,PUCK_VMAX=42,REACH=2.5;
function wallRect(o,r,rest){
  const ax=Math.abs(o.x),az=Math.abs(o.z),sx=o.x<0?-1:1,sz=o.z<0?-1:1;let hit=0;
  const cx=W-CR,cz=D-CR;
  if(ax>cx&&az>cz){
    const dx=ax-cx,dz=az-cz,d=Math.hypot(dx,dz);
    if(d>CR-r){const nx=dx/d,nz=dz/d,pen=d-(CR-r);o.x-=sx*nx*pen;o.z-=sz*nz*pen;const vn=o.vx*sx*nx+o.vz*sz*nz;if(vn>0){o.vx-=(1+rest)*vn*sx*nx;o.vz-=(1+rest)*vn*sz*nz;hit=vn;}}
  }else{
    if(ax>W-r){o.x=sx*(W-r);if(o.vx*sx>0){hit=Math.max(hit,o.vx*sx);o.vx*=-rest;}}
    if(az>D-r){o.z=sz*(D-r);if(o.vz*sz>0){hit=Math.max(hit,o.vz*sz);o.vz*=-rest;}}
  }
  return hit;
}
function wallPuck(o,r,rest){
  // goal posts (circles)
  for(const q of posts){
    const dx=o.x-q[0],dz=o.z-q[1],rr=r+.14,d2=dx*dx+dz*dz;
    if(d2<rr*rr&&d2>1e-6){
      const d=Math.sqrt(d2),nx=dx/d,nz=dz/d;o.x=q[0]+nx*rr;o.z=q[1]+nz*rr;
      const vn=o.vx*nx+o.vz*nz;
      if(vn<0){o.vx-=1.55*vn*nx;o.vz-=1.55*vn*nz;if(G.puck.hitT<=0){G.puck.hitT=.12;G.cam.shake=Math.max(G.cam.shake,.1);SFX.hit(.9);if(G.cfg&&G.cfg.mode!=='demo'&&Math.hypot(o.vx,o.vz)>8)popAt(__L('땡! 골대!'),o.x,1.7,o.z);if(G.hype&&G.cfg&&G.cfg.mode!=='demo'&&((G.cfg.time&&!G.ot&&G.timeLeft<=10)||G.ot))hypeSlow(.35,.45);}}
    }
  }
  const ax=Math.abs(o.x),az=Math.abs(o.z),sx=o.x<0?-1:1,sz=o.z<0?-1:1;
  // goal mouth: puck centre between the posts is never pushed back by the end board
  if(az<GW&&ax>W-r){
    if(ax>W){
      if(az>GW-r){o.z=sz*(GW-r);if(o.vz*sz>0)o.vz*=-rest;}
      if(ax>W+GD-r){o.x=sx*(W+GD-r);if(o.vx*sx>0)o.vx*=-.3;}
    }
    return;
  }
  const hit=wallRect(o,r,rest);
  if(hit>7&&G.puck.hitT<=0){G.puck.hitT=.12;SFX.hit(clamp(hit/20,.3,1));}
}
function wallPeng(p){
  if(p.goalie){
    const lo=p.team.dir>0?-W+.9:W-3.6,hi=p.team.dir>0?-W+3.6:W-.9;p.x=clamp(p.x,lo,hi);p.z=clamp(p.z,-GW-.1,GW+.1);return;
  }
  const hit=wallRect(p,p.r,.32);
  if(hit>7&&p.sfxT<=0){
    p.sfxT=.3;SFX.bump(clamp(hit/18,.3,.8));burst(p.x,p.z,5,.8);
    // only very fast crashes (dash / slide) into the boards knock a penguin down
    if(hit>12+p.ty.stats.body*1.1&&p.fall<=0)knock(p,.55+Math.min(.5,(hit-12)/20));
  }
}
function knock(p,dur){
  if(p.goalie||p.fall>0||p.getup>0||p.shadowT>0||p.hopT>0)return false;
  p.fall=dur*(p.tr&&p.tr.tough?.7:1)*(ttOf(p).fall||1);p.spinRate=rnd(-6,6);p.charging=false;p.charge=0;p.slideT=0;p.dashT=0;p.dashSpec=false;p.ai.plan=null;p.ramT=0;p.dbl=0;
  burst(p.x,p.z,10,1.2);if(p.human)G.cam.shake=Math.max(G.cam.shake,.25);return true;
}
function burst(x,z,n,sp){const c=trailCol();for(let i=0;i<n;i++){const a=rnd(TAU),s=rnd(.4,1)*sp*3;emit(x,.15,z,Math.cos(a)*s,rnd(1.5,4.5)*sp,Math.sin(a)*s,rnd(.35,.8),rnd(.12,.28),c[0],c[1],c[2]);}}
function trailCol(){const tr=TRAILS[save.trail]||TRAILS.ice;if(tr.col)return tr.col;const h=(G.t*.5)%1,c=trailTmp.setHSL(h,.9,.65);trailArr[0]=c.r;trailArr[1]=c.g;trailArr[2]=c.b;return trailArr;return[c.r,c.g,c.b];}
// special-skill cooldowns (seconds): each has a different cost/benefit
const SPEC={surge:{cd:9},dash:{cd:8},slide:{cd:7},flipper:{cd:8},icebreak:{cd:9}};

function movePeng(p,h){
  const st=p.ty.stats,dif=p.human?1:G.diff.spd;let ix=p.ix,iz=p.iz;
  if(p.fall>0){const k=Math.exp(-1.5*h);p.vx*=k;p.vz*=k;p.heading+=p.spinRate*h;p.spinRate*=Math.exp(-2*h);}
  else if(p.goalie){
    // goalie: accelerate towards a desired velocity chosen by the goalie AI (no oscillation)
    const gk=G.diff.gk,dv=p.diveT>0,cap=(dv?15:gk.cap)*(p.slow>0?.5:1),acc=dv?95:gk.acc;
    let dvx=p.gvx,dvz=p.gvz;const dl=Math.hypot(dvx,dvz);if(dl>cap){dvx*=cap/dl;dvz*=cap/dl;}
    const ex=dvx-p.vx,ez=dvz-p.vz,el=Math.hypot(ex,ez);
    if(el>1e-5){const a=Math.min(el,acc*h);p.vx+=ex/el*a;p.vz+=ez/el*a;}
  }else{
    const slow=p.slow>0?.55:1,sp0=Math.hypot(p.vx,p.vz);
    let cap=(7+1.4*st.speed)*dif*slow,acc=(13+5*st.accel)*slow*CF.acc;
    if(p.boostT>0){cap*=1.3;acc*=1.25;}{const k=(p.rushT>0?SPX.rush:1)*(p.shadowT>0?SPX.shadow.spd:1)*(ttOf(p).spd||1);cap*=k;acc*=k;}if(G.carry===p)cap*=.93;if(G.hype&&G.hype.feverT>0&&p.team===G.mine)cap*=1.08;
    if(p.dashT>0){cap*=p.dashMul;acc*=1.8;}
    let mag=Math.hypot(ix,iz);
    const sliding=p.slideT>0;
    if(sliding){ix=Math.sin(p.heading);iz=Math.cos(p.heading);mag=1;cap=18;acc=46;}
    const spf=Math.min(1,sp0/Math.max(cap,6));
    if(mag>.05){
      const m=Math.min(mag,1),dx=ix/mag,dz=iz/mag;
      let a=acc;
      if(!sliding&&sp0>2){const dot=(p.vx*dx+p.vz*dz)/sp0;if(dot<-.2)a*=1.4*CF.brk;} // skate-brake when pushing against motion
      p.vx+=dx*m*a*h;p.vz+=dz*m*a*h;
      if(!sliding){
        const tg=Math.atan2(dx,dz),dh=angDiff(p.heading,tg);
        let rate=(4+2*st.turn)*(1.25-.6*spf);            // fast = wider turns, but never locked
        if(p.dashT>0&&p.dashSpec)rate*=.5;                // special dash is hard to steer
        p.heading+=clamp(dh,-rate*h,rate*h);
      }
    }else{
      const k=Math.exp(-.8*CF.glide*h);p.vx*=k;p.vz*=k;
      const s=Math.hypot(p.vx,p.vz);if(s>0){const ns=Math.max(0,s-1.4*CF.glide*h);p.vx*=ns/s;p.vz*=ns/s;}
    }
    const fx=Math.sin(p.heading),fz=Math.cos(p.heading);
    let vf=p.vx*fx+p.vz*fz,vs=p.vx*fz-p.vz*fx;
    const grip=sliding?2.6:(1.1+.6*st.turn)*(1-.3*spf)*CF.grip;  // sideways grip: high turn stat = better edge control
    vs*=Math.exp(-grip*h);vf*=Math.exp(-.28*CF.glide*h);
    p.vx=fx*vf+fz*vs;p.vz=fz*vf-fx*vs;
    const sp=Math.hypot(p.vx,p.vz);if(sp>cap){const k=1-Math.min(1,4*h)*(1-cap/sp);p.vx*=k;p.vz*=k;}
  }
  p.x+=p.vx*h;p.z+=p.vz*h;wallPeng(p);
}
function pengCollisions(){
  const a=G.pengs;
  for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){
    const A=a[i],B=a[j];if(A.goalie&&B.goalie||A.frozen||B.frozen||A.hopT>0||B.hopT>0)continue;
    const dx=B.x-A.x,dz=B.z-A.z,rr=A.r+B.r,d2=dx*dx+dz*dz;if(d2>=rr*rr||d2<1e-6)continue;
    const d=Math.sqrt(d2),nx=dx/d,nz=dz/d,pen=rr-d,ma=A.mass,mb=B.mass,tm=ma+mb;
    const pc=Math.min(pen,.12);A.x-=nx*pc*mb/tm;A.z-=nz*pc*mb/tm;B.x+=nx*pc*ma/tm;B.z+=nz*pc*ma/tm;
    const vn=(B.vx-A.vx)*nx+(B.vz-A.vz)*nz;
    if(vn<0){
      const j_=-(1.55)*vn/(1/ma+1/mb);A.vx-=j_*nx/ma;A.vz-=j_*nz/ma;B.vx+=j_*nx/mb;B.vz+=j_*nz/mb;
      const imp=-vn;if(imp>2.5)bumpFx(A,B,imp);
    }
  }
}
function bumpFx(A,B,imp){
  rulesContact(A,B,imp);const tm=A.mass+B.mass;let ia=imp*B.mass/tm*1.6*(ttOf(B).hit||1),ib=imp*A.mass/tm*1.6*(ttOf(A).hit||1);
  const aS=A.slideT>0,bS=B.slideT>0,aD=A.dashT>0&&A.dashSpec,bD=B.dashT>0&&B.dashSpec;
  if(bS)ia+=7;if(aS)ib+=7;           // slide tackle
  if(bD)ia+=2.2;if(aD)ib+=2.2;       // charging hit
  if(aS)ia*=.3;if(bS)ib*=.3;         // the attacker is cushioned
  if(aD)ia*=.55;if(bD)ib*=.55;
  if(A.team===B.team){ia*=.45;ib*=.45;} // friendly fire is much weaker
  if(!A.goalie&&A.fall<=0&&ia>4.8+A.ty.stats.body*.85){if(knock(A,rnd(.9,1.4))){if(bS)B.slideHit=true;bigHit(B,A);rulesFoul(B,A);}}
  if(!B.goalie&&B.fall<=0&&ib>4.8+B.ty.stats.body*.85){if(knock(B,rnd(.9,1.4))){if(aS)A.slideHit=true;bigHit(A,B);rulesFoul(A,B);}}
  if(imp>4&&A.sfxT<=0){A.sfxT=.35;B.sfxT=.35;SFX.bump(clamp(imp/16,.3,1));burst((A.x+B.x)/2,(A.z+B.z)/2,6,.8);if(A.human||B.human)G.cam.shake=Math.max(G.cam.shake,.15);}
}
function passDone(ps){
  ps.to.recvT=G.t;pcPass(ps);royal18(ps);
  G.stats&&(ps.from.team===G.mine)&&G.stats.passOK++;
  if(ps.from.team!==G.mine)return;
  tutEvent('pass');
  if(G.hype){const h=G.hype,key=ps.from.idx+'>'+ps.to.idx;h.passes++;h.recv={p:ps.to,t:G.t};gp('passes',1);
    if((ps.d||0)>=5&&!(key===h.lastPass&&G.t-h.lastPassT<3.5))cbAdd('pass','PASS');h.lastPass=key;h.lastPassT=G.t;}
  G.chain++;G.stats.bestChain=Math.max(G.stats.bestChain,G.chain);if(realMatch())save.cum.chainBest=Math.max(save.cum.chainBest,G.chain);G.chainT=8;
  popAt(pcPopText(ps),ps.to.x,2.2,ps.to.z);SFX.passOk();
  const ch=G.cfg&&G.cfg.challenge;
  if(ch&&ch.kind==='pass'){G.passCount=G.chain;updateObjective();if(G.chain>=ch.goal)challengeDone(true);}
  else updateObjective();
}
function passLost(ps,why){
  pcBreak(ps.from.team);if(G.royal&&G.royal.by===ps.from)G.royal=null;
  if(ps.from.team!==G.mine)return;
  passFeedback(ps,why);
  G.chain=0;G.chainT=0;
  if(G.cfg&&G.cfg.challenge&&G.cfg.challenge.kind==='pass'){G.passCount=0;}
  updateObjective();
}
function touchPuck(p,imp){
  const pk=G.puck,prevL=pk.last,prevT=pk.lastT;pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;pcTouch(p);
  if(imp>3&&pk.hitT<=0){pk.hitT=.1;SFX.hit(clamp(imp/18,.25,1));}
  if(G.hype&&G.mine&&G.state==='play'&&p.team===G.mine&&!p.goalie&&prevL&&prevL.team!==G.mine&&!prevL.goalie&&prevT&&G.t-prevT<1.2)cbAdd('steal','STEAL');
  const sh=pk.shot;
  if(sh){
    if(p!==sh.by)sh.deflected=true;
    else if(G.t-sh.t>.35)pk.shot=null;       // shooter re-touches the puck: the shot is over
  }
  if(p.goalie){
    if(sh&&sh.onTarget&&!sh.saved&&sh.by.team!==p.team&&imp>4){sh.saved=true;if(sh.by.team===G.mine&&G.stats){G.stats.saves++;updateObjective();}else if(p.team===G.mine){if(G.hype)G.hype.saves++;cbAdd('save','SAVE');}}
    if(imp>6&&G.saveShown<=0){G.saveShown=.8;const great=p.diveT>0||imp>16;popAt(great?'GREAT SAVE!':'SAVE!',p.x,1.6,p.z);if(great){G.cam.shake=Math.max(G.cam.shake,.3);G.cheer=1;}SFX.save();G.cam.shake=Math.max(G.cam.shake,.2);p.anim.swing=1;}
  }
  const ps=G.pass;
  if(ps&&G.state==='play'){
    if(p===ps.from){/* passer touching again: ignore */}
    else if(p.goalie){G.pass=null;if(p.team!==ps.from.team)passLost(ps,'cut');}
    else if(p.team===ps.from.team){G.pass=null;if(G.t-ps.t<3.5)passDone(ps);}
    else{G.pass=null;passLost(ps,'cut');}
  }
}
function puckStep(h){
  const pk=G.puck;carryStep(h);
  pk.x+=pk.vx*h;pk.z+=pk.vz*h;
  // ice friction: small constant drag + speed-proportional drag
  const s0=Math.hypot(pk.vx,pk.vz);
  if(s0>0){const ns=Math.max(0,s0-(.5+.22*s0)*CF.pf*h),f=ns/s0;pk.vx*=f;pk.vz*=f;}
  wallPuck(pk,PUCKR,.82);
  for(const p of G.pengs){
    if(p.shotGrace>0||p.frozen||p===G.carry||(G.royal&&p.team!==G.royal.team))continue;let rad=p.r;if(p.goalie&&p.diveT>0)rad=1.1;else if(!p.goalie&&pk.lastTeam&&pk.lastTeam!==p.team&&s0>7){const r2=ttOf(p).reach;if(r2)rad+=r2;}
    const dx=pk.x-p.x,dz=pk.z-p.z,rr=rad+PUCKR,d2=dx*dx+dz*dz;if(d2>=rr*rr)continue;
    const d=Math.sqrt(d2)||1e-3,nx=dx/d,nz=dz/d;pk.x=p.x+nx*rr;pk.z=p.z+nz*rr;
    const vn=(pk.vx-p.vx)*nx+(pk.vz-p.vz)*nz;
    if(vn<0){const e=p.goalie?.55:.16;pk.vx-=(1+e)*vn*nx;pk.vz-=(1+e)*vn*nz;touchPuck(p,-vn);}
    else{pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;}
  }
  wallPuck(pk,PUCKR,.82);
  // puck pinned between a skater and the boards: push the skater back instead of jittering
  for(const p of G.pengs){
    if(p.goalie||p.shotGrace>0||p.frozen||p===G.carry||(G.royal&&p.team!==G.royal.team))continue;
    const dx=pk.x-p.x,dz=pk.z-p.z,rr=p.r+PUCKR,d2=dx*dx+dz*dz;
    if(d2<rr*rr&&d2>1e-6){const d=Math.sqrt(d2),pen=rr-d;p.x-=dx/d*pen;p.z-=dz/d*pen;wallPeng(p);}
  }
  const sp=Math.hypot(pk.vx,pk.vz);if(sp>PUCK_VMAX){pk.vx*=PUCK_VMAX/sp;pk.vz*=PUCK_VMAX/sp;}
}

/* ================= ACTIONS ================= */
function reach(p){const pk=G.puck;return Math.hypot(pk.x-p.x,pk.z-p.z);}
function canHit(p){
  const pk=G.puck,dx=pk.x-p.x,dz=pk.z-p.z,d=Math.hypot(dx,dz);
  if(d>REACH)return false;
  if(d>1.7){const fx=Math.sin(p.heading),fz=Math.cos(p.heading);if((dx*fx+dz*fz)/d<-.35)return false;}
  return true;
}
function assistAim(p,ax,az){
  if(!save.set.assist)return[ax,az];
  const gx=p.team.dir*W,pk=G.puck,gdx=gx-pk.x,gdz=-pk.z,gl=Math.hypot(gdx,gdz)||1;
  const a1=Math.atan2(ax,az),a2=Math.atan2(gdx,gdz),d=Math.abs(angDiff(a1,a2));
  if(d<.42&&gl<26){const t=.65*(1-d/.42),a=a1+angDiff(a1,a2)*t;return[Math.sin(a),Math.cos(a)];}
  return[ax,az];
}
function registerShot(p,ax,az,charge,sp,kind){
  const pk=G.puck,gx=p.team.dir*W;let on=false;
  if(ax*p.team.dir>.05){const t=(gx-pk.x)/ax,zz=pk.z+az*t;on=Math.abs(zz)<GW-.1;}
  pk.shot={by:p,charge,spd:sp,t:G.t,onTarget:on,saved:false,deflected:false,kind:kind||'shot'};
  const ts=G.tstat&&G.tstat[p.team.key];if(ts){ts.shots++;if(on)ts.on++;}
  if(p.team===G.mine&&G.stats){G.stats.shots++;if(on)G.stats.onTarget++;updateObjective();}
  if(p.team===G.mine&&G.hype&&G.cfg&&G.cfg.mode!=='demo'){const h=G.hype;if(charge>=.6){h.power++;gp('power',1);if(on)cbAdd('power','POWER SHOT');}if(on&&h.recv&&h.recv.p===p&&G.t-h.recv.t<2.5)cbAdd('passShot','PASS → SHOT');}
  if(p.human)tutEvent('shot',charge,kind);
}
function performShot(p,ax,az,charge){
  const pk=G.puck;
  if(!canHit(p)){p.anim.swing=.55;p.cd.shoot=.18;SFX.whoosh();whiffFx(p);return false;}   // whiff: no puck in range
  p.anim.swing=1;p.cd.shoot=.32;if(G.carry)carryRelease(G.carry===p?.3:.6);
  const pw=p.ty.stats.power,tap=charge<.14;
  let sp=tap?10.5+pw*.9:lerp(15,27,charge)*(.72+.1*pw);
  const T_=ttOf(p),ow=p.otWin||0,ot=!p.goalie&&G.t-(p.recvT==null?-9:p.recvT)<(ow||OT_WIN);p.recvT=-9;p.otWin=0;
  if(!tap)sp*=(T_.pow||1);else sp*=(T_.tap||1);if(ot)sp*=1.06*(T_.ot||1)*(ow?SPX.royalpass.mul:1);
  sp*=v10ShotMul(p,tap)*pcShotMul(p);
  sp*=1-clamp((reach(p)-1.6)/3,0,.25);                 // awkward contact = a little weaker
  const l=Math.hypot(ax,az)||1;ax/=l;az/=l;
  const ke=keen18(p,ax,az);if(ke){ax=ke[0];az=ke[1];sp*=SPX.keeneye.mul;}
  // accuracy: full-power and on-the-move shots wobble a little
  let spread=(tap?.012:.012+.05*Math.max(0,charge-.8)/.2)+clamp(Math.hypot(p.vx,p.vz)/20,0,.6)*.03;
  if(!p.human)spread+=G.diff.aim*.05*CF.aim;
  if(p.tr&&p.tr.precise)spread*=.6;
  spread*=(T_.spread||1);if(ot)spread*=.55;if(ke)spread=0;
  const ang=Math.atan2(ax,az)+(Math.random()-.5)*2*spread;ax=Math.sin(ang);az=Math.cos(ang);
  pk.vx=ax*sp+p.vx*.2;pk.vz=az*sp+p.vz*.2;p.shotGrace=.12;pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;
  if(ot&&p.team===G.mine&&G.cfg&&G.cfg.mode!=='demo'){gp('oneTimer',1);cbAdd('passShot','ONE-TIMER');}
  registerShot(p,ax,az,tap?0:charge,sp,tap?'tap':'power');pcAfterShot(p);if(pk.shot){pk.shot.x0=pk.x;pk.shot.z0=pk.z;}if(ot&&pk.shot)pk.shot.oneT=true;if(p._fire&&pk.shot){pk.shot.fire=true;popAt('🔥 FIRE SHOT!',pk.x,2,pk.z);}
  burst(pk.x,pk.z,tap?3:9,tap?.5:1);
  popAt(ot?__L('원타이머!'):tap?__L('톡!'):(charge>.8?__L('쾅!!'):__L('쾅!')),pk.x,1.4,pk.z);SFX.shot(tap?0:charge);
  if(!tap&&charge>.6)G.cam.shake=Math.max(G.cam.shake,.3);
  if(p.human&&!tap){if(charge>.85)G.hitStop=Math.max(G.hitStop||0,.04);vib(12+Math.round(charge*30));}
  return true;
}
function laneBlock(ax_,az_,bx,bz,tm){
  let md=99;const dx=bx-ax_,dz=bz-az_,L2=dx*dx+dz*dz||1;
  for(const o of tm.opp.skaters){if(o.fall>0||o.frozen)continue;const t=clamp(((o.x-ax_)*dx+(o.z-az_)*dz)/L2,0,1),qx=ax_+dx*t-o.x,qz=az_+dz*t-o.z,d=Math.hypot(qx,qz);if(d<md)md=d;}
  return md;
}
function oppNear(x,z,tm){let m=99;for(const o of tm.opp.skaters){if(o.fall>0||o.frozen)continue;const d=Math.hypot(o.x-x,o.z-z);if(d<m)m=d;}return m;}
function shotQ(x,z,tm){
  const gx=tm.dir*W,dxg=(gx-x)*tm.dir;if(dxg<1)return 0;
  const gd=Math.hypot(gx-x,z),R=G.diff.range;if(gd>R)return 0;let q=1-.8*gd/R;
  q*=1-clamp(Math.atan2(Math.abs(z),dxg)/1.6,0,.8);
  const lane=laneBlock(x,z,gx,0,tm);if(lane<1.5)q*=.35;else if(lane<2.4)q*=.7;
  return clamp(q,0,1);
}
function bestMate(p,ax,az,aiMode){
  const tm=p.team,pk=G.puck;let best=null,bs=-1e9;
  for(const m of tm.skaters){
    if(m===p||m.fall>0||m.frozen)continue;const onside=rulesMateOk(m);
    const dx=m.x-pk.x,dz=m.z-pk.z,d=Math.hypot(dx,dz);if(d<2.2)continue;
    const lane=laneBlock(pk.x,pk.z,m.x,m.z,tm),open=oppNear(m.x,m.z,tm);let s=0;
    if(aiMode){
      if(d<4||d>24||!onside)continue;
      s=(m.x-pk.x)*tm.dir*.5-d*.12+Math.min(open,6)*.8+shotQ(m.x,m.z,tm)*10;
      if(lane<1.8)s-=8;else if(lane<2.6)s-=2.5;
    }else{
      const cs=(dx*ax+dz*az)/(d||1);
      s=cs*5-d*.06+Math.min(open,5)*.3;if(cs<-.2)s-=6;if(!onside)s-=4;if(lane<1.6)s-=3.5;
    }
    if(s>bs){bs=s;best=m;}
  }
  return best;
}
function doPass(p,mate){
  const pk=G.puck;if(!mate||!canHit(p))return false;
  const dx=mate.x-pk.x,dz=mate.z-pk.z,d=Math.hypot(dx,dz)||1,sp=clamp(d*1.55+7,9,26)*(ttOf(p).pass||1),tt=d/sp;
  const tx=clamp(mate.x+mate.vx*tt*.75,-W+1.5,W-1.5),tz=clamp(mate.z+mate.vz*tt*.75,-D+1.5,D-1.5),l=Math.hypot(tx-pk.x,tz-pk.z)||1;
  pk.vx=(tx-pk.x)/l*sp;pk.vz=(tz-pk.z)/l*sp;
  p.anim.swing=1;p.cd.pass=.35;p.shotGrace=.12;if(G.carry)carryRelease(G.carry===p?.3:.6);pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;pk.shot=null;
  G.pass={from:p,to:mate,t:G.t,d:d};
  if(p.team===G.mine&&G.stats){G.stats.passTry++;updateObjective();}
  if(p.human)G.pending={to:mate,t:.28};
  popAt(__L('패스!'),pk.x,1.4,pk.z);SFX.tap();return true;
}
function doDash(p){
  if(p.dbl>0&&p.dblT>0&&p.fall<=0&&!p.goalie&&!(p.slideT>0))return dbl18(p);
  if(p.cd.dash>0||p.fall>0||p.goalie||p.slideT>0)return false;
  if(!rulesPathClear(p))return false;
  const m=Math.hypot(p.ix,p.iz);let dx,dz;
  if(m>.2){dx=p.ix/m;dz=p.iz/m;}else{dx=Math.sin(p.heading);dz=Math.cos(p.heading);}
  p.dashT=.45;p.dashMul=1.5;p.dashSpec=false;p.vx+=dx*4.5;p.vz+=dz*4.5;p.cd.dash=3.2+(ttOf(p).dashCd||0);burst(p.x,p.z,8,1);SFX.whoosh();if(p.human)tutEvent('dash');return true;
}
function useSpecial(p){
  if(p.dbl>0&&p.dblT>0&&p.fall<=0&&!p.goalie)return dbl18(p);   // Magellanic: second dash
  if(p.cd.special>0||p.fall>0||p.goalie)return false;
  if(!p.human&&['dash','surge','slide','crest','double'].includes(p.ty.special)&&!rulesPathClear(p,Math.sin(p.heading),Math.cos(p.heading)))return false;
  const dx=Math.sin(p.heading),dz=Math.cos(p.heading),sp=p.ty.special;
  if(sp==='surge'){   // 큰바다 돌진: long charging dash + slows nearby opponents
    p.dashT=1.15;p.dashMul=1.95;p.dashSpec=true;p.vx+=dx*7;p.vz+=dz*7;p.specMax=SPEC.surge.cd;p.cd.special=p.specMax;
    burst(p.x,p.z,28,1.7);SFX.whoosh();popAt(castShout(p,__L('큰바다 돌진!')),p.x,2.4,p.z);G.cam.shake=Math.max(G.cam.shake,.35);
    for(const o of p.team.opp.skaters){if(Math.hypot(o.x-p.x,o.z-p.z)<4.5)o.slow=Math.max(o.slow,1.2);}
  }else if(sp==='dash'){
    p.dashT=1.0;p.dashMul=1.75;p.dashSpec=true;p.vx+=dx*6;p.vz+=dz*6;p.specMax=SPEC.dash.cd;p.cd.special=p.specMax;
    burst(p.x,p.z,18,1.4);SFX.whoosh();popAt(castShout(p,'ICE DASH!'),p.x,2.4,p.z);
  }else if(sp==='slide'){
    p.slideT=.8;p.slideHit=false;p.vx+=dx*9;p.vz+=dz*9;p.specMax=SPEC.slide.cd;p.cd.special=p.specMax;
    burst(p.x,p.z,14,1.2);SFX.whoosh();popAt(castShout(p,'SLIDE!'),p.x,2.4,p.z);
  }else if(sp==='flipper'){
    p.anim.swing=1;
    if(reach(p)<3.2&&canHit(p)){
      let ax=dx,az=dz;
      if(p.human){const a=humanAim(p);ax=a[0];az=a[1];}
      else{const pk=G.puck,l=Math.hypot(p.team.dir*W-pk.x,-pk.z)||1;ax=(p.team.dir*W-pk.x)/l;az=-pk.z/l;}
      const pk=G.puck,sp2=Math.min(PUCK_VMAX,(34*(.8+.05*p.ty.stats.power)+4)*pcShotMul(p));
      if(G.carry)carryRelease(.4);pk.vx=ax*sp2;pk.vz=az*sp2;p.shotGrace=.15;pk.last=p;pk.lastTeam=p.team;pk.lastT=G.t;
      registerShot(p,ax,az,1,sp2,'flipper');pcAfterShot(p);
      burst(pk.x,pk.z,22,1.6);G.cam.shake=Math.max(G.cam.shake,.55);SFX.shot(1);popAt(castShout(p,'FLIPPER SMASH!'),pk.x,2.2,pk.z);
      p.specMax=SPEC.flipper.cd;p.cd.special=p.specMax;
    }else{p.specMax=2.5;p.cd.special=2.5;p.slow=Math.max(p.slow,.3);SFX.whoosh();}   // whiffed: short cooldown but you are exposed
  }else if(sp==='icebreak'){
    p.specMax=SPEC.icebreak.cd;p.cd.special=p.specMax;p.slow=Math.max(p.slow,.3);
    G.cam.shake=Math.max(G.cam.shake,.5);SFX.bump(1);popAt(castShout(p,'ICE BREAK!'),p.x,2.4,p.z);
    const c=[.7,.9,1];for(let i=0;i<40;i++){const a=i/40*TAU,s=rnd(5,9);emit(p.x,.2,p.z,Math.cos(a)*s,rnd(2,5),Math.sin(a)*s,rnd(.5,.9),rnd(.2,.4),c[0],c[1],c[2]);}
    for(const o of p.team.opp.skaters){const dx2=o.x-p.x,dz2=o.z-p.z,d=Math.hypot(dx2,dz2);if(d<5.8){o.slow=2;o.vx+=dx2/(d||1)*6;o.vz+=dz2/(d||1)*6;if(d<2.8)knock(o,1.1);}}
    const pk=G.puck,dd=Math.hypot(pk.x-p.x,pk.z-p.z);if(dd<5.8){if(G.carry&&G.carry!==p)carryRelease(.6);pk.vx+=(pk.x-p.x)/(dd||1)*6;pk.vz+=(pk.z-p.z)/(dd||1)*6;}
  }else if(!spec18(p,sp,dx,dz))return false;
  {const c=ttOf(p).cd;if(c&&p.cd.special>3){p.cd.special*=c;p.specMax=p.cd.special;}}
  if(p.cdBonus&&p.cd.special>3){p.cd.special*=1-p.cdBonus;p.specMax=p.cd.special;}   // enhancement Lv5/Lv10 bonus
  if(p.human)tutEvent('special');
  castStart(p);
  return true;
}
function humanAim(p){
  let ax=Math.sin(p.heading),az=Math.cos(p.heading);
  if(!IS_TOUCH&&G.mouse.active&&performance.now()-G.mouse.t<3000){const dx=G.mouse.wx-p.x,dz=G.mouse.wz-p.z,l=Math.hypot(dx,dz);if(l>1.1){ax=dx/l;az=dz/l;}}
  return assistAim(p,ax,az);
}

/* ================= AI ================= */
function updatePhase(){
  const pk=G.puck;let c=null,cd=2.8;
  for(const p of G.pengs){if(p.fall>0)continue;const dd=Math.hypot(pk.x-p.x,pk.z-p.z)-(p.goalie?1:0);if(dd<cd){cd=dd;c=p;}}
  G.carrier=c;
  for(const k of['blue','red']){
    const tm=G.teams[k];
    if(c)tm.phase=c.team===tm?'atk':'def';
    else tm.phase=pk.last?(pk.last.team===tm?'atk':'def'):'loose';
  }
}
function teamRoles(tm){
  const pk=G.puck,d=tm.dir,pxd=pk.x*d;tm.chaser=null;tm.chaser2=null;
  const hum=tm.human,hd=hum?Math.hypot(pk.x-hum.x,pk.z-hum.z):1e9;
  let best=null,bs=1e9,bd=0;
  for(const s of tm.skaters){
    if(s.human||s.fall>0||s.passive||s.frozen)continue;
    if(s.role==='defender'&&pxd>W*.35)continue;            // defenders never rush into the attacking zone
    const dd=Math.hypot(pk.x-s.x,pk.z-s.z);let pen=0;
    if(s.role==='defender')pen=Math.max(0,pxd+1)*.55;
    else if(s.role==='mid')pen=Math.max(0,pxd-W*.45)*.3;
    else pen=Math.max(0,-pxd-W*.4)*.4;
    let sc=dd+pen;if(s===tm.lastChaser)sc-=1.4;           // hysteresis: avoid flip-flopping
    if(sc<bs){bs=sc;best=s;bd=dd;}
  }
  if(best&&!(hum&&hd<bd-.5))tm.chaser=best;
  tm.lastChaser=tm.chaser;
}
function nearestOpp(p){let m=99;for(const o of p.team.opp.skaters){if(o.fall>0||o.frozen)continue;const d=Math.hypot(o.x-p.x,o.z-p.z);if(d<m)m=d;}return m;}
function nearestOppObj(p){let m=99,r=null;for(const o of p.team.opp.skaters){if(o.fall>0||o.frozen)continue;const d=Math.hypot(o.x-p.x,o.z-p.z);if(d<m){m=d;r=o;}}return r;}
function aiShoot(p,charge){
  const pk=G.puck,tm=p.team,gx=tm.dir*W,og=tm.opp.goalie,df=G.diff;
  let side;
  if(og){const gz=og.z+og.vz*.15;side=Math.abs(gz)<.5?(Math.random()<.5?-1:1):(gz>0?-1:1);}  // far corner from the goalie
  else side=Math.random()<.5?-1:1;
  let tz=side*rnd(1.1,GW-.7)+(Math.random()-.5)*df.aim*5;
  const pl_=p.ai.lastPlanTz;if(pl_!=null){tz=pl_;p.ai.lastPlanTz=null;if(og&&Math.abs(og.z-tz)<1.3&&Math.random()<(df.adapt||0))tz=-Math.sign(tz||1)*rnd(1.1,GW-.7);}
  const ax=gx-pk.x,az=tz-pk.z,l=Math.hypot(ax,az)||1;
  performShot(p,ax/l,az/l,charge);
}
function aiCarrier(p){
  // decide what the puck carrier does: shoot, pass, clear, or keep carrying
  const tm=p.team,pk=G.puck,df=G.diff,d=tm.dir,ai=p.ai,gx=d*W;
  if(Math.random()<df.mistake){ai.cool=rnd(.25,.6);return;}    // hesitation / small mistake
  const q=shotQ(pk.x,pk.z,tm),press=nearestOpp(p),gd=Math.hypot(gx-pk.x,pk.z),own=pk.x*d<-W*.35;
  const noShoot=G.cfg&&G.cfg.noAIShoot;
  if(noShoot){ai.cool=rnd(.4,.9);return;}
  if(pcGiveGo(p))return;
  if(df.oneT&&G.t-(p.recvT==null?-9:p.recvT)<(p.otWin||.5)&&q>=df.shootQ*.7&&Math.random()<df.oneT){const c=rnd(.3,.5);ai.plan={t:.02,c,tz:aiPlanTz(p)};p.charge=c;p.charging=true;return;}
  const mate=bestMate(p,0,0,true),mq=mate?shotQ(mate.x,mate.z,tm):0;
  if(q>=df.shootQ*(pcReady(tm)?.75:1)&&Math.random()<.92){
    ai.plan={t:rnd(.08,.22),c:gd>13?rnd(.75,1):gd>7?rnd(.45,.75):rnd(.2,.5),tz:aiPlanTz(p)};ai18(p,'shoot');
  }else if(mate&&((mq>q+.12&&Math.random()<df.passP+.35)||(press<3.2&&Math.random()<df.passP+.25))){
    if(ai18(p,'pass')||doPass(p,mate)){ai.cool=rnd(.9,1.6);return;}
  }else if(own&&press<3.4&&!rulesIcingRisk(p)){
    const sg=pk.z>=0?1:-1,l=Math.hypot(d,sg*.45);performShot(p,d/l,sg*.45/l,.55);ai.cool=rnd(.8,1.4);return;
  }
  ai.cool=rnd(.05,.18);
}
function pickSlot(p,bx,bz){
  const tm=p.team;let best=null,bs=-1e9;
  for(let i=0;i<6;i++){
    const a=i/6*TAU+p.seed,rad=3.2;
    const x=clamp(bx+Math.cos(a)*rad,-W+3,W-3),z=clamp(bz+Math.sin(a)*rad*1.3,-D+2.5,D-2.5);
    let s=Math.min(oppNear(x,z,tm),7)*1.2;
    if(laneBlock(G.puck.x,G.puck.z,x,z,tm)<1.8)s-=5;
    for(const m of tm.skaters){if(m!==p&&m.fall<=0){const dm=Math.hypot(m.x-x,m.z-z);if(dm<3.5)s-=(3.5-dm)*1.5;}}
    s-=Math.hypot(p.x-x,p.z-z)*.08;s+=shotQ(x,z,tm)*4;
    if(s>bs){bs=s;best=[x,z];}
  }
  return best||[bx,bz];
}
function aiFormation(p){
  const tm=p.team,pk=G.puck,d=tm.dir,ai=p.ai,ph=G.t*.45+p.seed,phase=tm.phase,pxd=pk.x*d;
  let tx,tz;const role=p.passive?'attacker':p.role;
  if(role==='attacker'){
    if(phase==='def'&&!p.passive){tx=d*W*.12+Math.sin(ph)*2;tz=clamp(-pk.z*.6,-D+4,D-4)+Math.sin(ph*1.3)*1.5;}
    else{
      if(ai.slotT<=0||!ai.slot){ai.slotT=.7;ai.slot=pickSlot(p,d*clamp(Math.max(pxd+6,W*.42),W*.2,W-5),-pk.z*.55);}
      tx=ai.slot[0];tz=ai.slot[1];
    }
  }else if(role==='mid'){
    if(phase==='def'){
      let rec=null,rd=1e9;for(const o of tm.opp.skaters){if(o===G.carrier||o.fall>0||o.frozen)continue;const dd=Math.hypot(o.x-pk.x,o.z-pk.z);if(dd<rd){rd=dd;rec=o;}}
      if(rec){tx=(pk.x+rec.x)/2-d*1.0;tz=(pk.z+rec.z)/2;}else{tx=lerp(d*2,pk.x,.5)-d*2;tz=pk.z*.5;}
    }else{
      if(ai.slotT<=0||!ai.slot){ai.slotT=.7;ai.slot=pickSlot(p,pk.x-d*2,pk.z+(p.idx%2?5.5:-5.5));}
      tx=ai.slot[0];tz=ai.slot[1];
    }
  }else{ // defender
    if(phase==='def'){
      const og=[-d*W,0];let mark=null,md=1e9;
      for(const o of tm.opp.skaters){if(o.fall>0||o.frozen)continue;const dd=Math.hypot(o.x-og[0],o.z-og[1]);if(dd<md){md=dd;mark=o;}}
      if(mark&&md<20){const vx=og[0]-mark.x,vz=og[1]-mark.z,l=Math.hypot(vx,vz)||1;tx=mark.x+vx/l*1.8;tz=mark.z+vz/l*1.8;}   // stay goal-side of the most dangerous attacker
      else{const vx=og[0]-pk.x,vz=-pk.z,l=Math.hypot(vx,vz)||1;tx=pk.x+vx/l*5.5;tz=pk.z+vz/l*5.5;}
      if(d>0)tx=Math.max(tx,-W+3.8);else tx=Math.min(tx,W-3.8);
    }else{tx=clamp(lerp(-d*W*.5,pk.x,.35),-W*.7,W*.7);tz=clamp(pk.z*.45,-6,6)+Math.sin(ph)*1.2;}
  }
  // keep teammates from stacking on the same spot
  for(const m of tm.skaters){if(m===p||m.fall>0)continue;const dx=tx-m.x,dz=tz-m.z,dd=Math.hypot(dx,dz);if(dd<3.4&&dd>.01){tx+=dx/dd*(3.4-dd)*.7;tz+=dz/dd*(3.4-dd)*.7;}}
  ai.tx=clamp(tx,-W+3,W-3);ai.tz=clamp(tz,-D+2.5,D-2.5);ai.full=false;ai.mode='shape';
}
function aiThink(p){
  const tm=p.team,pk=G.puck,df=G.diff,d=tm.dir,ai=p.ai,gx=d*W;
  ai.noise=(Math.random()-.5)*df.noise;
  if(G.pass&&G.pass.to===p&&G.t-G.pass.t<2.4){ai.tx=pk.x+pk.vx*.3;ai.tz=pk.z+pk.vz*.3;ai.full=true;ai.mode='recv';return;}
  if(p.cd.special<=0&&SPX[p.ty.special]&&Math.random()<.5*ai.iv)ai18(p,'any');
  if(p!==tm.chaser&&aiIntercept(p))return;
  if(G.carry===p){
    ai.full=true;ai.mode='carry';let gdx=gx-p.x,gdz=-p.z;const gl=Math.hypot(gdx,gdz)||1;gdx/=gl;gdz/=gl;
    let tx=p.x+gdx*5,tz=p.z+gdz*5;const o=nearestOppObj(p);
    if(o){const ox=o.x-p.x,oz=o.z-p.z,od=Math.hypot(ox,oz);if(od<5&&(ox*gdx+oz*gdz)>-.5){const side=(ox*(-gdz)+oz*gdx)>0?-1:1;tx+=(-gdz)*side*3.2;tz+=gdx*side*3.2;}}
    ai.tx=clamp(tx,-W+2,W-2);ai.tz=clamp(tz,-D+2,D-2);
    if(p.cd.shoot<=0&&p.shotGrace<=0&&!ai.plan&&ai.cool<=0)aiCarrier(p);
    if(p.cd.special<=0&&Math.random()<.3*ai.iv&&p.ty.special==='flipper'&&shotQ(pk.x,pk.z,tm)>df.shootQ*.8)useSpecial(p);
    if(p.cd.special<=0&&SPX[p.ty.special]&&G.carry===p&&Math.random()<.35*ai.iv)ai18(p,'carry');
    return;
  }
  if(p===tm.chaser){
    ai.full=true;ai.mode='chase';
    const dist=reach(p),sp=Math.hypot(p.vx,p.vz),lead=Math.min(.5,dist/(sp+6)),px=pk.x+pk.vx*lead,pz=pk.z+pk.vz*lead,car=G.carrier;
    let behind=0;
    if(car&&car.team!==tm){
      // opponent has the puck: pressure from the goal side, not blindly through the carrier
      const ox=-d*W-px,oz=-pz,ol=Math.hypot(ox,oz)||1,gap=Math.random()<df.press?1.3:3.2;
      ai.tx=px+ox/ol*gap;ai.tz=pz+oz/ol*gap;
    }else{
      let gdx=gx-px,gdz=-pz;const gl=Math.hypot(gdx,gdz)||1;gdx/=gl;gdz/=gl;
      const rx=p.x-px,rz=p.z-pz;behind=rx*gdx+rz*gdz;
      if(behind>.2){const sgn=(rx*(-gdz)+rz*gdx)>=0?1:-1;ai.tx=px-gdx*2.4+(-gdz)*sgn*1.8;ai.tz=pz-gdz*2.4+gdx*sgn*1.8;}
      else{
        ai.tx=px-gdx*.5;ai.tz=pz-gdz*.5;
        const o=nearestOppObj(p);   // weave around a defender that stands in the way
        if(o){const ox=o.x-p.x,oz=o.z-p.z,od=Math.hypot(ox,oz);if(od<4.2&&od>.1&&(ox*gdx+oz*gdz)>0){const side=(ox*(-gdz)+oz*gdx)>0?-1:1;ai.tx+=(-gdz)*side*1.6;ai.tz+=gdx*side*1.6;}}
      }
    }
    if(dist<2.2&&canHit(p)&&behind<.9&&p.cd.shoot<=0&&p.shotGrace<=0&&!ai.plan&&ai.cool<=0)aiCarrier(p);
    if(dist>9&&ai.dash<=0&&p.cd.dash<=0&&Math.random()<.3){doDash(p);ai.dash=rnd(3,6);}
    if(p.cd.special<=0&&Math.random()<.5*ai.iv){
      const sp2=p.ty.special,gd=Math.hypot(gx-pk.x,pk.z);
      if(sp2==='flipper'){if(dist<2.6&&gd<20&&shotQ(pk.x,pk.z,tm)>df.shootQ*.8)useSpecial(p);}
      else if(sp2==='icebreak'){if(nearestOpp(p)<3.2)useSpecial(p);}
      else if(sp2==='slide'){if(((car&&car.team!==tm&&nearestOpp(p)<6)||(dist>12&&!rulesActive()))&&rulesSlideOk(p))useSpecial(p);}
      else if(SPX[sp2])ai18(p,'chase');
      else if(dist>10)useSpecial(p);
    }
  }else aiFormation(p);
}
function aiSkater(p,dt){
  const ai=p.ai,df=G.diff;
  ai.think-=dt;ai.cool-=dt;ai.dash-=dt;ai.slotT-=dt;
  if(ai.plan){   // visible wind-up before an AI shot
    ai.plan.t-=dt;p.charging=true;p.charge=Math.min(1,p.charge+dt/.45*(ttOf(p).chg||1));
    if(reach(p)>3.3||(p.fall>0)){ai.plan=null;p.charging=false;p.charge=0;}
    else if(ai.plan.t<=0&&p.charge>=Math.min(ai.plan.c,1)-.02){const c=ai.plan.c;ai.lastPlanTz=ai.plan.tz;ai.plan=null;p.charging=false;p.charge=0;aiShoot(p,c);ai.cool=rnd(.6,1.3);}
  }
  if(ai.think<=0){ai.iv=df.react*rnd(.7,1.3);ai.think=ai.iv;aiThink(p);}
  rulesAI(p);
  const dx=ai.tx-p.x,dz=ai.tz-p.z,dd=Math.hypot(dx,dz)||1,s=ai.full?1:clamp(dd/2.5,0,1);
  const ang=Math.atan2(dx,dz)+ai.noise*.6*(ai.full?.5:1);
  p.ix=Math.sin(ang)*s;p.iz=Math.cos(ang)*s;
  if(ai.plan){const k=G.carry===p?.55:.1;p.ix*=k;p.iz*=k;}
  const sp=Math.hypot(p.vx,p.vz);
  if(sp>9&&p.fall<=0&&Math.random()<df.slip*dt*(Math.abs(angDiff(Math.atan2(p.vx,p.vz),ang))>1.6?4:.4))knock(p,.9);
}
function aiGoalie(p,dt){
  const tm=p.team,pk=G.puck,d=tm.dir,gk=G.diff.gk,ai=p.ai,homeX=-d*(W-1.7);
  const spd=Math.hypot(pk.vx,pk.vz),dist=Math.hypot(pk.x-p.x,pk.z-p.z);
  const toward=pk.vx*(-d)>.5&&spd>6;
  const tt=toward?Math.abs((homeX-pk.x)/(pk.vx||1e-3)):99;
  let xt=homeX+d*clamp((14-dist)/14,0,1)*(gk.out||.4),zt;
  if(toward&&tt<2.2){
    // incoming shot: the goalie only starts reacting after a reaction delay, then predicts once and re-reads every 0.14s
    if(ai.seenT===0)ai.fail=Math.random()<gk.miss;
    ai.seenT+=dt;
    if(ai.seenT>=gk.react*CF.react*(p.dazT>0?SPX.sunflare.react:1)){
      ai.upd-=dt;
      if(ai.upd<=0){
        ai.upd=.14;
        const zp=pk.z+pk.vz*tt,wide=Math.abs(zp)>GW+.9;
        if(wide)ai.zt=clamp(zp*.35,-1.2,1.2);                  // a shot going wide is not worth chasing
        else if(ai.fail)ai.zt=p.z*.9;                           // misread: stays put
        else{const e=(Math.random()-.5)*2*gk.err*CF.gkErr*(p.dazT>0?SPX.sunflare.err:1)*clamp(tt*1.1,.25,1.3);ai.zt=clamp(zp+e,-(GW-.6),GW-.6);}
        if(!wide&&!ai.fail&&p.diveCd<=0&&spd>13&&tt<.5&&tt>.1){
          const need=ai.zt-p.z;
          if(Math.abs(need)>1&&Math.abs(need)<3.6&&Math.random()<gk.dive){p.diveT=.5;p.diveDir=Math.sign(need)||1;p.vz=p.diveDir*14;p.diveCd=1.8;}
        }
      }
      zt=ai.zt;
    }else zt=ai.zs;
  }else{
    ai.seenT=0;ai.upd=0;
    const k=dist<10?.62:.3;let tz=clamp(pk.z*k,-GW+.5,GW-.5);
    const rd=p.dazT>0?null:gkRead(p,tm);if(rd)tz=lerp(tz,rd.z,rd.w);
    ai.zs+=(tz-ai.zs)*Math.min(1,dt/(gk.react*(p.dazT>0?SPX.sunflare.react:1)+.12));            // lagging positional play
    zt=ai.zs;
  }
  if(toward&&tt<2.2&&ai.seenT>=gk.react)ai.zs=zt;
  const cap=gk.cap,ex=xt-p.x,ez=zt-p.z;
  if(p.diveT>0){p.gvz=p.diveDir*15;p.gvx=0;}
  else{
    p.gvz=Math.sign(ez)*Math.min(cap,Math.sqrt(2*gk.acc*.85*Math.abs(ez)));
    p.gvx=Math.sign(ex)*Math.min(cap*.6,Math.sqrt(2*gk.acc*.85*Math.abs(ex)));
  }
  p.heading=d*Math.PI/2;   // face the play (toward the rink), not the boards
  const crr=G.carry&&G.carry.team!==tm;
  if(dist<(crr?1.75:2.2)&&spd<(crr?14:9)&&p.cd.shoot<=0&&(!crr||Math.random()<(CARRY.poke[G.cfg&&G.cfg.diff]||1)*dt)){if(G.carry)carryRelease(.6);
    const sg=Math.sign(pk.z-p.z)||(Math.random()<.5?-1:1),l=Math.hypot(1,.6);
    pk.vx=d/l*13;pk.vz=sg*.6/l*13;pk.shot=null;
    p.anim.swing=1;p.cd.shoot=.6;p.shotGrace=.12;pk.last=p;pk.lastTeam=tm;SFX.tap();
  }
}
function humanControl(p,dt){
  p.ix=input.x;p.iz=input.z;
  if(p.fall>0){input.shootPress=input.pass=input.dash=input.special=input.shootRel=false;p.charging=false;p.charge=0;return;}
  if(input.shootPress){input.shootPress=false;if(p.cd.shoot<=0){p.charging=true;p.charge=0;p.stage=0;}}
  if(p.charging&&input.shoot){
    p.charge=Math.min(1,p.charge+dt/(.75*(p.tr&&p.tr.charge?.88:1))*(ttOf(p).chg||1));
    const sg=p.charge<.14?0:p.charge<.45?1:p.charge<.8?2:3;
    if(sg>p.stage){p.stage=sg;SFX.tick(sg);vib(8+sg*6);}
  }
  if(input.shootRel){
    input.shootRel=false;
    if(p.charging&&p.cd.shoot<=0){const a=humanAim(p);performShot(p,a[0],a[1],p.charge);}
    p.charging=false;p.charge=0;p.stage=0;
  }
  if(input.pass){input.pass=false;if(p.cd.pass<=0){const a=humanAim(p),m=bestMate(p,a[0],a[1],false);if(!doPass(p,m)){p.cd.pass=.15;SFX.whoosh();}}}
  if(input.dash){input.dash=false;doDash(p);}
  if(input.special){input.special=false;useSpecial(p);}
  if(input.swap){input.swap=false;swapNearest();}
}
function swapNearest(){
  if(G.so||G.ps)return;
  const tm=G.mine;if(!tm||!G.player)return;const pk=G.puck;let best=null,bd=1e9;
  for(const s of tm.skaters){if(s===G.player||s.fall>0||s.frozen)continue;const d=Math.hypot(pk.x-s.x,pk.z-s.z);if(d<bd){bd=d;best=s;}}
  if(best){setHuman(best);G.switchCd=.8;SFX.ui();}
}
function autoSwitch(dt){
  if(G.so||G.ps)return;
  if(G.carry&&G.mine&&G.carry.team===G.mine&&G.carry!==G.player&&!G.pending){setHuman(G.carry);G.switchCd=.6;return;}
  const tm=G.mine;if(!tm||!G.player)return;
  if(G.pending){G.pending.t-=dt;if(G.pending.t<=0){if(G.pending.to.fall<=0&&tm.skaters.includes(G.pending.to))setHuman(G.pending.to);G.pending=null;G.switchCd=.8;}return;}
  G.switchCd-=dt;if(G.switchCd>0)return;
  const pk=G.puck,dc=Math.hypot(pk.x-G.player.x,pk.z-G.player.z);if(dc<5&&G.player.fall<=0)return;
  let best=null,bd=1e9;for(const s of tm.skaters){if(s===G.player||s.fall>0||s.frozen)continue;const d=Math.hypot(pk.x-s.x,pk.z-s.z);if(d<bd){bd=d;best=s;}}
  if(best&&dc-bd>3.5){setHuman(best);G.switchCd=1;}
}

/* ================= SIMULATION (fixed 120 Hz step) ================= */
function decide(dt){
  updatePhase();
  for(const k of['blue','red'])teamRoles(G.teams[k]);
  for(const p of G.pengs){
    const c=p.cd;c.catch=Math.max(0,(c.catch||0)-dt);c.shoot=Math.max(0,c.shoot-dt);c.pass=Math.max(0,c.pass-dt);c.dash=Math.max(0,c.dash-dt);c.special=Math.max(0,c.special-dt);
    if(p.shotGrace>0)p.shotGrace-=dt;if(p.slow>0)p.slow-=dt;
    if(p.dashT>0){p.dashT-=dt;if(p.dashT<=0)p.dashSpec=false;}
    if(p.slideT>0){p.slideT-=dt;if(p.slideT<=0&&!p.slideHit)p.slow=Math.max(p.slow,.55);}   // a missed slide leaves you exposed
    if(p.diveT>0)p.diveT-=dt;p.diveCd-=dt;if(p.getup>0)p.getup-=dt;if(p.sfxT>0)p.sfxT-=dt;
    if(p.boostT>0)p.boostT-=dt;if(p.fireT>0)p.fireT-=dt;if(p.magT>0)p.magT-=dt;tick18(p,dt);
    if(p.frozen){p.ix=p.iz=0;continue;}
    if(p.fall>0){p.fall-=dt;p.ix=p.iz=0;p.gvx=p.gvz=0;if(p.fall<=0)p.getup=.6;continue;}
    if(p.human)humanControl(p,dt);else if(p.goalie)aiGoalie(p,dt);else aiSkater(p,dt);
  }
}
function simulate(h){
  decide(h);
  for(const p of G.pengs)if(!p.frozen)movePeng(p,h);
  pengCollisions();
  puckStep(h);v10Sim(h);evSim(h);sim18(h);rulesSim(h);
  G.puck.hitT-=h;G.saveShown-=h;
  if(G.pass&&(G.t-G.pass.t>3.5||(G.t-G.pass.t>1.2&&Math.hypot(G.puck.vx,G.puck.vz)<2.5))){const ps=G.pass;G.pass=null;passLost(ps,'miss');}
  if(G.chain>0&&G.cfg.challenge&&G.cfg.challenge.kind==='pass'){G.chainT-=h;if(G.chainT<=0){G.chain=0;G.passCount=0;updateObjective();popAt(__L('콤보 끊김'),G.player?G.player.x:0,2.4,G.player?G.player.z:0);}}
  if(G.state==='play')checkGoal();
}
function runPhysics(dt){
  G.acc=Math.min(G.acc+dt,FIXED*8);
  while(G.acc>=FIXED&&G.state==='play'){
    for(const p of G.pengs){p.ox=p.x;p.oz=p.z;}
    G.puck.ox=G.puck.x;G.puck.oz=G.puck.z;
    autoSwitch(FIXED);simulate(FIXED);G.acc-=FIXED;
  }
  G.alpha=G.state==='play'?clamp(G.acc/FIXED,0,1):1;
}
function checkGoal(){
  const pk=G.puck;
  if(Math.abs(pk.z)<GW-.05){
    if(pk.x>W+.25)scored(G.teams.blue);else if(pk.x<-W-.25)scored(G.teams.red);
  }
}
function scored(tm){
  if(G.so){soGoal(tm);return;}
  if(rulesScored(tm))return;
  if(tm.noScore){pk_reset();return;}
  const pk=G.puck,sh=pk.shot;
  tm.score++;G.golden2=goldenGoal(tm);G.scoredBy=tm;G.state='goal';G.stateT=G.cfg.demo?2.2:3;pk_spAtGoal();G.pass=null;
  hypeGoal(tm,sh);pcGoal(tm,sh);
  for(const p of G.pengs){
    if(p.team===tm){p.pose='cheer';p.cheerKind=(Math.random()*3)|0;}else{p.pose='sad';}p.charging=false;
  }
  const gx=tm.dir*W;for(let i=0;i<60;i++){const c=[[1,.9,.3],[.4,.8,1],[1,.5,.7],[.6,1,.7]][i%4];emit(gx,rnd(1,3),rnd(-GW,GW),rnd(-6,6),rnd(3,9),rnd(-6,6),rnd(1,1.8),rnd(.25,.5),c[0],c[1],c[2]);}
  if(G.cfg.mode!=='demo'){
    if(tm===G.mine)G.stats.goals++;
    const ch=G.cfg.challenge,kind=ch?ch.kind:null;
    if(kind==='clean'&&tm!==G.mine){updateScoreHud();challengeDone(false,__L('실점했어요! 무실점 승리 실패'));return;}
    if(kind==='goal'&&tm===G.mine){G.passCount++;updateObjective();if(G.passCount>=ch.goal)challengeDone(true);}
    else if(kind==='power'&&tm===G.mine){
      // only a real, charged shot that nobody touched on the way counts
      const ok=sh&&!sh.deflected&&sh.by.team===G.mine&&sh.charge>=ch.minCharge&&G.t-sh.t<5;
      if(ok)challengeDone(true);else showBanner(__L('70% 이상 충전한 강슛이어야 해요!'),1700,'g');
    }
    if(G.cfg.mode==='practice')updateObjective();
  }
  updateScoreHud();
}
function pk_spAtGoal(){const pk=G.puck;pk.spAtGoal=Math.hypot(pk.vx,pk.vz);}
function pk_reset(){const pk=G.puck;pk.x=0;pk.z=0;pk.vx=0;pk.vz=0;pk.ox=0;pk.oz=0;pk.shot=null;}

/* ================= GAME FLOW ================= */
function startMatch(cfg){
  resetInput();
  hideAll();document.body.classList.add('ingame');document.body.classList.remove('menuish');
  cfg.teamKey=save.team;G.mode=cfg.mode;
  cfg.final=!!((cfg.mode==='tour'&&G.tour&&G.tour.round===TOUR.length-1)||(cfg.mode==='trial'&&TRIALS[cfg.kind]&&cfg.round===TRIALS[cfg.kind].rounds.length-1));
  setupMatch(cfg);G.view='game';G.state='ready';G.stateT=3.2;G.paused=false;G.cam.zoom=1;G.cheer=0;G.acc=0;G.alpha=1;
  G.cam.x=0;G.cam.z=0;G.countN=4;G.result=null;G.resultShown=false;
  G.todMode=cfg.todFixed!==undefined?'fixed':save.set.tod;
  G.todFixed=cfg.todFixed;
  $('#modeTag').textContent=cfg.tag||'';$('#count').textContent='';
  $('#obj').style.display=(cfg.challenge||cfg.mode==='practice')?'block':'none';updateObjective();
  $('#clock').textContent=fmtTime(cfg.time||0);$('#clock').style.visibility=(cfg.mode==='practice'||cfg.mode==='free'||(!cfg.time))?'hidden':'visible';
  $('#sB').textContent='0';$('#sR').textContent='0';
  $('#board').style.display='flex';
  lastClock='';lastGauge=-1;
  hint(true);SFX.init();SFX.resume();blurUI();v10MatchStart(cfg);
}
function fmtTime(s){s=Math.max(0,Math.ceil(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function updateScoreHud(){$('#sB').textContent=G.teams.blue?G.teams.blue.score:0;$('#sR').textContent=G.teams.red?G.teams.red.score:0;}
function updateObjective(){
  const cfg=G.cfg,el=$('#obj');if(!cfg||!G.stats)return;
  if(cfg.mode==='practice'){const s=G.stats;el.textContent=__L('🥅 슛 ')+s.shots+__L(' (유효 ')+s.onTarget+__L(') · 골 ')+s.goals+__L(' · 방어 ')+s.saves+__L(' · 패스 ')+s.passOK+'/'+s.passTry;return;}
  const ch=cfg.challenge;if(!ch)return;
  let t='🎯 '+ch.name;
  if(ch.kind==='goal')t+=__L('  골 ')+G.passCount+' / '+ch.goal;
  else if(ch.kind==='pass')t+=__L('  연속 ')+G.chain+' / '+ch.goal+(G.stats.bestChain>0?__L(' · 최고 ')+G.stats.bestChain:'');
  else if(ch.kind==='power')t+=__L('  (충전 ')+Math.round(ch.minCharge*100)+__L('%↑ 슛으로 골)');
  else if(ch.kind==='clean')t+=__L('  · 실점 0 유지하고 승리');
  else if(ch.kind==='comeback')t+=__L('  · 역전승하면 클리어');
  else if(ch.kind==='types')t+='  · '+TYPES[save.type].name+ro(TYPES[save.type].name)+__L(' 승리 (진행 ')+save.chalTypes.length+'/'+ch.need+')';
  el.textContent=t;
}
function hint(on){
  const h=$('#hint');if(!on){h.classList.remove('on');return;}
  const pr=G.cfg&&G.cfg.mode==='practice';
  h.innerHTML=(pr?__L('연습 모드 · 포인트는 지급되지 않아요<br>'):'')+(IS_TOUCH?__L('왼쪽을 끌어 이동 · 오른쪽 <b>슛</b> 버튼으로 퍽을 쳐요 (길게 누르면 강슛)'):__L('<b>WASD</b> 이동 · <b>Space/클릭</b> 슛(길게=강슛) · <b>E/우클릭</b> 패스 · <b>Shift</b> 대시 · <b>Q</b> 특수 · <b>F/Tab</b> 교체 · <b>P/Esc</b> 일시정지'));
  h.classList.add('on');clearTimeout(hint.t);hint.t=setTimeout(()=>h.classList.remove('on'),4500);
}
function showBanner(txt,ms,cls){const b=$('#banner');b.textContent=txt;b.className=cls||'';void b.offsetWidth;b.classList.add('on');clearTimeout(showBanner.t);showBanner.t=setTimeout(()=>b.classList.remove('on'),ms||1500);}
const popPos=new T.Vector3();
function popAt(txt,x,y,z){
  if(G.view!=='game')return;const pops=$('#pops');if(pops.children.length>6)return;
  popPos.set(x,y,z).project(camera);if(popPos.z>1)return;
  const d=document.createElement('div');d.className='pop';d.textContent=txt;d.style.left=((popPos.x*.5+.5)*innerWidth)+'px';d.style.top=((-popPos.y*.5+.5)*innerHeight)+'px';pops.appendChild(d);{let w=d.offsetWidth;if(w>0){if(w>innerWidth-12){d.style.fontSize=Math.max(14,Math.floor(parseFloat(getComputedStyle(d).fontSize)*(innerWidth-16)/w))+'px';w=d.offsetWidth;}const L=parseFloat(d.style.left),c=clamp(L,w/2+4,innerWidth-w/2-4);if(c!==L)d.style.left=c+'px';}}setTimeout(()=>d.remove(),950);
}

function endMatch(){
  rulesEnd();
  save.mgr.pending=null;G.mgrArmed=true;
  G.state='over';G.stateT=2.6;G.over=true;
  const mine=G.mine,ms=mine?mine.score:0,os=mine?mine.opp.score:0;
  let win=ms>os,draw=false,note='';
  if(ms===os&&G.so&&G.so.done){win=G.so.s.mine>G.so.s.opp;if(win)save.cum.soWin++;draw=G.so.s.mine===G.so.s.opp;note=__L('승부차기 ')+G.so.s.mine+' : '+G.so.s.opp+(draw?__L(' · 무승부'):win?__L(' 승리!'):__L(' 패배'));}
  else if(ms===os){   // only possible when overtime ran out: decide by shots on target
    const a=G.tstat[mine.key].on,b=G.tstat[mine.opp.key].on;
    if(a>b){win=true;note=__L('연장전 무득점 · 유효 슛 ')+a+' : '+b+__L(' 으로 승리');}
    else if(a<b){win=false;note=__L('연장전 무득점 · 유효 슛 ')+a+' : '+b+__L(' 으로 패배');}
    else{draw=true;note=__L('연장전 무득점 · 무승부');}
  }
  for(const p of G.pengs){p.pose=draw?'idle':((p.team===mine)===win?'cheer':'sad');p.cheerKind=(Math.random()*3)|0;}
  if(win&&G.cfg.final){SFX.champ();hypeBanner('CHAMPION!',['🏆 '+(G.cfg.mode==='tour'?__L('토너먼트 우승'):(G.cfg.label||__L('우승')))],4,mine.key);champT=3.2;fwT=0;G.cam.shake=Math.max(G.cam.shake,.5);vib([40,40,40,40,180]);
    for(let i=0;i<160;i++){const a=rnd(TAU),s=rnd(4,12);emit(rnd(-8,8),rnd(2,6),rnd(-5,5),Math.cos(a)*s,rnd(5,12),Math.sin(a)*s,rnd(1.4,2.4),rnd(.25,.5),1,rnd(.75,.95),rnd(.2,.5));}}
  else if(win){SFX.win();const gk=(G.cfg.diff==='hard');const cm=G.hype&&G.hype.trailLate;hypeBanner(gk?'GIANT KILLER!':cm?'COMEBACK WIN!':'VICTORY! \uD83D\uDC27\uD83C\uDFC6',gk&&cm?['COMEBACK WIN!']:[],gk||cm?3:1,'');}else if(draw){SFX.whistle();showBanner('DRAW',2400,'');}else{SFX.lose();showBanner('GAME OVER',2400,'r');}
  G.result={win,draw,ms,os,note,paid:false};
}
function showResultScreen(){
  const R=G.result,cfg=G.cfg;if(!R)return;
  const win=R.win,draw=R.draw,ms=R.ms,os=R.os,h=G.hype;
  const diffKey=cfg.diff||'normal',mult={easy:.7,normal:1,hard:1.3}[diffKey]||1;
  let base=Math.round(((win?30:draw?15:10)+3*Math.min(ms,5))*mult),extra=0,extraName='',extraNote='',btns=[],title=win?'VICTORY! 🐧🏆':draw?'DRAW':'GAME OVER';
  if(cfg.mode==='tour'&&G.tour){
    const tr=G.tour;
    if(win){
      if(tr.round>=TOUR.length-1){
        let bonus=0;
        if(!tr.champPaid){tr.champPaid=true;bonus=save.cleared.tour?30:100;save.cleared.tour=true;save.stats.tourClears++;}  // paid once per run
        extra=bonus;extraName=__L('토너먼트 우승 보너스');title='CHAMPION! 🏆';extraNote=__L('토너먼트 우승!');btns.push([__L('다시 도전'),()=>startTournament()]);
      }else{extraNote=__L('다음 상대: <b>')+TOUR[tr.round+1].name+'</b>';btns.push([__L('다음 라운드'),()=>{tr.round++;showTourIntro();}]);}
    }else{
      title=draw?__L('무승부…'):__L('탈락…');extraNote=TOUR[tr.round].name+(draw?__L('와(과) 비겼어요. 다시 도전해요!'):__L('에게 패배했어요. 다음엔 이길 수 있어요!'));
      btns.push([__L('이 라운드 재도전'),()=>showTourIntro()]);btns.push([__L('처음부터'),()=>startTournament()]);
    }
  }else if(cfg.mode==='ranked'){btns.push([__L('🔁 다시 매칭'),()=>rankedStart()]);btns.push([__L('🏅 티어 게임'),()=>goRanked()]);}
  else if(cfg.mode!=='trial')btns.push([__L('다시 하기'),()=>startMatch(Object.assign({},cfg))]);
  btns.push([__L('메인 메뉴'),()=>toMenu()]);
  const cbBonus=Math.min(30,Math.round(Math.min(h.combo.max,8)*3*mult));   // capped: combos can never outweigh the match itself
  if(!R.paid){
    R.paid=true;
    if(cfg.mode==='trial'){R.tr=trialAfterMatch(win);if(R.tr&&R.tr.st==='champ'){extra+=R.tr.pts;extraName=R.tr.first?__L('첫 선발 보상'):__L('선발 보상');}}
    const fv=Math.min(20,((h.feverGoals)|0)*5);R.fv=fv;
    R.base=base;R.cb=cbBonus;R.extra=extra;R.extraName=extraName;R.cond=condBonus(base);R.condK=G.cond;R.total=base+cbBonus+extra+fv+R.cond;
    save.points+=R.total;save.stats.played++;if(win)save.stats.wins++;save.stats.goals+=ms;
    R.hy=hypeMatchEnd(win,draw,ms,os,cfg);{const ga=achCheck();R.ach=ga;R.achP=ga.reduce((s,a)=>s+a.pts,0);R.total+=R.achP;}
    R.mg=mgrMatchEnd(win,draw,cfg);
    if(cfg.mode==='tour'&&G.tour&&win&&G.tour.round+1>save.rec.tourBest)save.rec.tourBest=G.tour.round+1;
    R.pass=passMatch(win,draw,ms);
    persist();
  }
  if(cfg.mode==='trial'){
    const t=R.tr;btns=[];
    if(t&&t.st==='next'){title='✅ '+t.rn+__L(' 승리!');extraNote=t.T.icon+' '+t.T.name+__L(' · 다음은 <b>')+t.next+'</b> vs '+escH(t.opp);btns.push(['▶ '+t.next+__L(' 진행'),()=>trialPlay()]);btns.push([__L('🏅 티어 게임'),()=>goRanked()]);}
    else if(t&&t.st==='champ'){title=t.kind==='city'?'🏆 '+escH(t.city)+__L('시 대표 선발!'):__L('🇰🇷 국가대표 선발!');
      extraNote=t.T.name+__L(' 우승! ')+(t.kind==='city'?__L('이제 전국대회 대표 선발전에 도전할 수 있어요 (플래티넘 이상).'):__L('최고의 감독으로 인정받았어요!'))+(t.card?'<div style="margin:6px auto;--cw:78px;display:inline-block">'+cardHtml(t.card.k,{g:t.card.g,lv:t.card.isNew?t.card.g:0,tag:t.card.isNew?'NEW':__L('보관')})+__L('</div><br><small>보상 카드: ')+TYPES[t.card.k].name+' ('+GRADES[t.card.g].n+')</small>':'');
      btns.push([__L('🏅 티어 게임'),()=>goRanked()]);}
    else{title=draw?__L('무승부… 선발전 탈락'):__L('선발전 탈락…');extraNote=t?t.T.name+' '+t.rn+__L('에서 아쉽게 탈락했어요. 남은 도전권으로 다시 도전해요!'):'';btns.push([__L('🏅 티어 게임'),()=>goRanked()]);}
    btns.push([__L('메인 메뉴'),()=>toMenu()]);
    if(!R.celebrated&&t&&t.st==='champ'){R.celebrated=true;try{SFX.win();vib([40,40,40,40,160]);}catch(e){}}
  }else if(cfg.mode==='ranked'&&R.mg)extraNote=(extraNote?extraNote+'<br>':'')+__L('⚔️ 랭크 경기 vs ')+escH(cfg.oppName||'')+' ('+tierOf(cfg.oppR||1000).name+')';
  if(R.mg)extraNote=(extraNote?extraNote+'<br>':'')+seasonNote();
  if(R.mg&&R.mg.dev){title=__L('💻 개발자 티어 달성!');extraNote=(extraNote?extraNote+'<br>':'')+__L('최종 티어 도달! 칭호 <b>💻 개발자</b> + 최고급 캐릭터 <b>큰바다쇠오리</b> 획득');if(!R.devShown){R.devShown=true;setTimeout(devReveal,500);}}
  const hy=R.hy||{xp:[],recs:[],goalsDone:[],tags:[],next:''};
  const me=G.mine.key==='blue'?'BLUE':'RED',op=G.mine.key==='blue'?'RED':'BLUE';
  let html='<div class="rs-score">'+me+' '+ms+' : '+os+' '+op+'</div>';
  if(R.note)html+='<div class="rs-note">'+R.note+'</div>';
  if(extraNote)html+='<div class="rs-note">'+extraNote+'</div>';
  if(!win&&!draw&&os-ms===1)html+=__L('<div class="rs-note">딱 1골 차이였어요! 한 번 더 하면 이길 수 있어요 💪</div>');
  if(hy.tags.length||hy.recs.length)html+='<div class="rs-tags">'+hy.tags.map(t=>'<span class="rtag">'+t+'</span>').join('')+(hy.recs.length?'<span class="rtag newrec">NEW RECORD! '+hy.recs.slice(0,3).join(' · ')+'</span>':'')+'</div>';
  html+=__L('<div class="rs-rows"><div class="rs-row"><span>기본 보상</span><span><b class="cu" data-to="')+R.base+'">0</b> P</span></div>';
  if(R.cb>0)html+=__L('<div class="rs-row"><span>콤보 보너스 (최고 x')+h.combo.max+')</span><span><b class="cu" data-to="'+R.cb+'">0</b> P</span></div>';
  if(R.achP>0)html+=__L('<div class="rs-row"><span>🏆 업적 달성 (')+R.ach.map(a=>escH(a.name)).join(', ')+')</span><span><b class="cu" data-to="'+R.achP+'">0</b> P</span></div>';
  html+=condBonusRow(R);
  if(R.fv>0)html+=__L('<div class="rs-row"><span>🔥 피버 골 보너스 (')+h.feverGoals+__L('골)</span><span><b class="cu" data-to="')+R.fv+'">0</b> P</span></div>';
  if(R.extra>0)html+='<div class="rs-row"><span>'+R.extraName+'</span><span><b class="cu" data-to="'+R.extra+'">0</b> P</span></div>';
  html+=__L('<div class="rs-row total"><span>획득 포인트</span><span>⭐ <b class="cu" data-to="')+R.total+'">0</b> P</span></div></div>';
  html+=passRowHtml(R);
  html+='<div class="rs-xp">'+hy.xp.map(r=>{
    const pb=r.b.need?r.b.cur/r.b.need*100:100,pa=r.a.need?r.a.cur/r.a.need*100:100,lvl=r.to>r.from;
    const tr=TRAITS.filter(t=>t.lv>r.from&&t.lv<=r.to);
    return '<div class="xprow" data-lv="'+(lvl?1:0)+'" data-a="'+pa.toFixed(1)+'"><div style="--cw:50px">'+cardHtml(r.type)+'</div><div class="xi"><b>'+TYPES[r.type].name+__L('</b> <span class="xpl">숙련 Lv.')+r.from+(lvl?' → '+r.to:'')+'</span> <span class="xpg">+'+r.gain+' XP</span><div class="xpb"><i style="width:'+pb.toFixed(1)+'%"></i></div>'
      +(lvl?__L('<div class="lvfx">LEVEL UP! 전 능력치 +')+((r.to-r.from)*MS_STAT).toFixed(2)+(tr.length?__L(' · 특성 해금: ')+tr.map(t=>t.name+' ('+t.desc+')').join(', '):'')+'</div>':'')+'</div></div>';}).join('')+'</div>';
  if(R.mg)html+=__L('<div class="rs-mgr">🎖 감독 레이팅 <b>')+R.mg.to+'</b> <span class="'+(R.mg.d>=0?'up':'dn')+'">('+(R.mg.d>=0?'+':'')+R.mg.d+')</span> · <b style="color:'+R.mg.tier.c+'">'+R.mg.tier.name+'</b>'+(R.mg.up?__L(' <span class="rtag">티어 승급!</span>'):R.mg.down?__L(' <small>(티어 강등)</small>'):'')+'</div>';
  html+=rulesRowHtml();
  html+=__L('<div class="rs-stats">슛 ')+G.stats.shots+__L(' (유효 ')+G.stats.onTarget+__L(') · 패스 성공 ')+G.stats.passOK+'/'+G.stats.passTry+__L(' · 최고 콤보 x')+h.combo.max+(h.maxStreak>1?__L(' · 연속 득점 ')+h.maxStreak:'')+'</div>';
  if(hy.goalsDone.length)html+=__L('<div class="rs-goal">🎯 목표 달성! ')+hy.goalsDone.join(', ')+__L(' — 메인 메뉴의 목표에서 보상을 받으세요</div>');
  if(hy.next)html+='<div class="rs-next">'+hy.next+'</div>';
  openResult(title,html,btns);
  hypeResultAnim();
}
function openResult(title,sub,btns){
  hideAll();$('#rTitle').textContent=title;$('#rSub').innerHTML=sub;const rb=$('#rBtns');rb.innerHTML='';
  btns.forEach((b,i)=>{const e=document.createElement('button');e.className='btn'+(i===0?' primary':'');e.style.fontSize=i===0?'22px':'';e.textContent=b[0];e.onclick=()=>{SFX.ui();b[1]();};rb.appendChild(e);});
  show('sResult');document.body.classList.remove('ingame');
}
function challengeDone(ok,why){
  if(G.state==='over')return;const ch=G.cfg.challenge;G.state='over';G.stateT=2.2;G.over=true;
  const first=!save.cleared[ch.id];let pts=0,note='',part=false;
  if(ok&&ch.kind==='types'){
    const k=save.type,had=save.chalTypes.includes(k);if(!had)save.chalTypes.push(k);
    const n=save.chalTypes.length;
    if(n<ch.need&&!save.cleared[ch.id]){part=true;pts=had?5:10;note=(had?__L('이미 이긴 펭귄이에요. '):__L('새 펭귄으로 승리! '))+__L('진행 ')+n+' / '+ch.need+__L(' · 팀 편성에서 다른 펭귄을 주장으로 바꿔 도전하세요');}
  }
  if(ok&&!part){pts=first?(ch.pts||40):5;save.cleared[ch.id]=true;}
  if(ok){save.points+=pts;persist();SFX.win();showBanner(part?'MISSION '+save.chalTypes.length+'/'+ch.need:'CHALLENGE CLEAR!',2200,'g');}
  else{SFX.lose();showBanner(why?'FAILED':'TIME UP',2000,'r');note=why||'';}
  for(const p of G.pengs){p.pose=ok&&p.team===G.mine?'cheer':'sad';}
  G.result={chal:true,ok,pts,note,part};{const ga=achCheck();G.result.ach=ga;G.result.achP=ga.reduce((s,a)=>s+a.pts,0);}
}
function showChalResult(){
  const {ok,pts,note,part,achP,ach}=G.result,cfg=G.cfg,mt=cfg.challenge.match&&G.mine;
  openResult(ok?(part?__L('MISSION 진행! 🎯'):'CLEAR! 🎯'):(note?'FAILED':'TIME UP'),'<b>'+cfg.challenge.name+'</b>'+(mt?'<br>'+G.mine.score+' : '+G.mine.opp.score:'')+(ok?'<br>⭐ +'+pts+__L(' 포인트'):__L('<br>다시 도전해 보세요!'))+(achP?__L('<br>🏆 업적 ')+ach.map(a=>escH(a.name)).join(', ')+' +'+achP+'P':'')+(note?'<br><small>'+note+'</small>':''),[[__L('다시 도전'),()=>startMatch(Object.assign({},cfg))],[__L('챌린지 목록'),()=>{enterDemo();buildChal();show('sChal');}],[__L('메인 메뉴'),()=>toMenu()]]);
}
function enterDemo(){
  resetInput();
  document.body.classList.remove('ingame');document.body.classList.add('menuish');
  setupMatch({demo:true,mode:'demo',size:3,diff:'normal',time:0,teamKey:'blue'});G.view='menu';G.state='play';G.todMode='demo';G.paused=false;G.acc=0;G.alpha=1;
  $('#pts').style.display='';$('#ptsN').textContent=save.points;
  const st=save.stats;$('#menuStats').textContent=st.played>0?'🏆 '+st.wins+__L('승 / ')+st.played+__L('경기 · 골 ')+st.goals+(st.tourClears?__L(' · 토너먼트 우승 ')+st.tourClears+__L('회'):''):'';
  hypeMenuRefresh();leagueMenuRefresh();G.arena='classic';funReset();achCheck();
}
function toMenu(){G.paused=false;enterDemo();show('sMenu');SFX.crowd(0);}

/* ---- tournament ---- */
function startTournament(){G.tour={round:0,champPaid:false};showTourIntro();}
function showTourIntro(){
  const tr=G.tour,r=TOUR[tr.round];
  enterDemo();hideAll();
  tr.cond=condAllowed({mode:'tour',final:tr.round===TOUR.length-1})?condRoll():null;     // always leave any running match first
  $('#tTitle').textContent=__L('토너먼트 ')+(tr.round+1)+' / '+TOUR.length+__L(' 라운드');
  const dn={easy:__L('쉬움'),normal:__L('보통'),hard:__L('어려움')};
  const rows=TOUR.map((x,i)=>'<div style="opacity:'+(i>tr.round?.55:1)+';font-size:'+(i===tr.round?'20':'17')+'px">'+(i<tr.round?'✅':i===tr.round?'▶️':'🔒')+__L(' 라운드 ')+(i+1)+' · <b>'+x.name+'</b> <span style="font-size:14px;color:var(--ink2)">('+dn[x.diff]+')</span></div>').join('');
  $('#tBody').innerHTML=rows+__L('<div style="margin-top:10px">이번 상대: <b>')+r.name+__L('</b><br>난이도: ')+dn[r.diff]+' · '+(tr.round===TOUR.length-1?__L('🏆 결승 무대'):__L('시간대: ')+(tr.cond==='night'||r.tod>=.7?__L('밤'):r.tod<.3?__L('낮'):__L('해질녘')))+__L('</div><div style="margin-top:6px;font-size:14px;color:#ffe9a0">보상: 이길 때마다 경기 포인트 · 결승 우승 보너스 ')+(save.cleared.tour?'30P':__L('100P (첫 우승)'))+(save.cleared.tour?'':__L(' · 우승하면 설정에서 결승 무대 경기장이 열려요'))+'</div>'+condIntroHtml(tr.cond);
  $('#tGo').onclick=()=>{SFX.init();SFX.ui();startMatch({mode:'tour',cond:tr.cond,size:save.set.size,time:Math.min(save.set.time||120,120),diff:r.diff,oppTypes:r.types,todFixed:r.tod,tag:'TOURNAMENT '+(tr.round+1)+'/'+TOUR.length+' vs '+r.name});};
  $('#tBack').onclick=()=>{SFX.ui();toMenu();};
  show('sTour');
}

/* ---- mode launchers ---- */
function launch(mode){
  if(mode==='tutorial'){tutStart();return;}
  SFX.init();SFX.ui();
  const s=save.set;
  if(mode==='quick')startMatch({mode:'quick',size:s.size,time:s.time||180,diff:s.diff,tag:'QUICK MATCH',oppTypes:oppMix18()});
  else if(mode==='shootout')startMatch({mode:'shootout',size:1,time:60,diff:s.diff,soRounds:5,tag:'🥅 SHOOTOUT'});
  else if(mode==='free')startMatch({mode:'free',size:s.size,time:0,diff:s.diff,tag:'FREE PLAY',oppTypes:oppMix18()});
  else if(mode==='practice')startMatch({mode:'practice',size:2,time:0,diff:s.diff,noOpp:true,goalieOnly:true,noScoreOpp:true,passiveMates:true,tag:'PRACTICE'});
  else if(mode==='tour')startTournament();
  else if(mode==='challenge'){buildChal();show('sChal');}
}
function buildChal(){
  const el=$('#chalList');el.innerHTML='';
  CHALLENGES.forEach(c=>{const d=document.createElement('div');d.className='mode';d.innerHTML='<i>'+(save.cleared[c.id]?'✅':'🎯')+'</i><b>'+c.name+'</b><span>'+c.desc+'</span>'+chalMeta(c);
    d.onclick=()=>{SFX.init();SFX.ui();
      if(c.match){startMatch({mode:'challenge',challenge:c,size:c.size,time:c.time,diff:c.diff,tag:'🎯 MISSION · '+c.name,oppTypes:c.opp||['basic','balanced','fast']});return;}
      const cfg={mode:'challenge',challenge:c,size:c.size,time:c.time,diff:save.set.diff,tag:'CHALLENGE',oppTypes:['basic'],noOpp:true,noScoreOpp:true};
      if(c.kind==='pass'){cfg.size=3;cfg.noGoalies=true;cfg.noScoreAll=true;cfg.noAIShoot=true;}
      else{cfg.goalieOnly=true;cfg.size=1;}
      startMatch(cfg);};el.appendChild(d);});
}

/* ================= ANIMATION ================= */
function animatePenguinV9(p,dt,t){
  const a=p.anim,P=p.pg,sp=Math.hypot(p.vx,p.vz),h=p.heading,fx=Math.sin(h),fz=Math.cos(h),vs=p.vx*fz-p.vz*fx,pose=p.pose;
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
  if(pose==='idle'){hop+=Math.max(0,Math.sin(t*2.2))*.0;}
  P.root.position.set(p.rx,hop+hopY18(p),p.rz);P.root.rotation.y=p.heading;
  // acceleration flap
  const acc=Math.hypot(p.ix,p.iz)*(p.human||true?1:0)*(p.fall>0?0:1);a.acc+=(acc-a.acc)*Math.min(1,dt*6);
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
  const ox=clamp(ang*.028,-.034,.034);P.pupL.position.x=ox;P.pupR.position.x=ox;P.pupL.position.y=P.pupR.position.y=pose==='sad'?-.025:0;
}

/* ================= FX / CAMERA / ENV ================= */
let fxT=0;
function fxUpdate(dt){
  const tc=trailCol();let slideLvl=0;
  for(const p of G.pengs){
    let dh=angDiff(p.px===undefined?0:0,0);
    const sp=Math.hypot(p.vx,p.vz);
    if(sp>5&&p.fall<=0&&!p.goalie){
      const fx=Math.sin(p.heading),fz=Math.cos(p.heading),vs=p.vx*fz-p.vz*fx;
      if(Math.random()<dt*(sp*1.3+Math.abs(vs)*3)){const a=rnd(TAU);emit(p.x-fx*.5,.1,p.z-fz*.5,rnd(-1,1)-p.vx*.1,rnd(.6,1.8),rnd(-1,1)-p.vz*.1,rnd(.35,.7),rnd(.1,.22),tc[0],tc[1],tc[2]);}
      if(Math.abs(vs)>3&&Math.random()<dt*14){emit(p.x,.1,p.z,-p.vx*.2+rnd(-2,2),rnd(1.5,3.5),-p.vz*.2+rnd(-2,2),rnd(.3,.6),rnd(.12,.24),.95,.98,1);}
      slideLvl=Math.max(slideLvl,sp/16);
    }
    if(sp>3.5&&G.view==='game'&&save.set.quality!=='low'){
      const fx=Math.sin(p.heading),fz=Math.cos(p.heading),px=-fz,pz=fx;
      for(const s of[-.18,.18]){skidLine(p.px+px*s,p.pz+pz*s,p.x+px*s,p.z+pz*s,'rgba(255,255,255,'+clamp(sp/22,.12,.38)+')',1.6);}
      skidLine(p.px,p.pz,p.x,p.z,'rgba(110,160,205,.10)',3);
    }
    if(p.fall>0&&Math.random()<dt*20)emit(p.x,.2,p.z,rnd(-2,2),rnd(1,3),rnd(-2,2),.4,.18,.95,.98,1);
    if(p.charging&&p.charge>.15&&Math.random()<dt*(14+50*p.charge)){const a=rnd(TAU),cc=p.charge<.45?[.7,.95,1]:p.charge<.8?[1,.85,.4]:[1,.45,.3];emit(p.x+Math.cos(a)*.7,.5,p.z+Math.sin(a)*.7,-Math.cos(a)*1.2,rnd(.5,2),-Math.sin(a)*1.2,.4,.12+.12*p.charge,cc[0],cc[1],cc[2]);}
    // yaw rate
    const hh=p.heading;p.yawRate=angDiff(p.lastH===undefined?hh:p.lastH,hh)/Math.max(dt,1e-4);p.lastH=hh;
    p.px=p.x;p.pz=p.z;
  }
  const pk=G.puck,ps=Math.hypot(pk.vx,pk.vz);
  if(ps>14&&Math.random()<dt*40)emit(pk.x,.15,pk.z,rnd(-.5,.5),rnd(.5,1.5),rnd(-.5,.5),.3,.14,.7,.92,1);
  SFX.slideLvl(G.view==='game'&&G.state==='play'?slideLvl:0,slideLvl);
  skidFade+=dt;
  if(skidFade>.6){skidFade=0;skidX.globalCompositeOperation='destination-out';skidX.fillStyle='rgba(0,0,0,.12)';skidX.fillRect(0,0,1024,512);skidX.globalCompositeOperation='source-over';skidDirty=true;}
  skidUp+=dt;if(skidDirty&&skidUp>.1){skidUp=0;skidTex.needsUpdate=true;skidDirty=false;}
}
function updateCamera(dt){
  if(G.cine&&G.view==='game'&&cineCam())return;
  const asp=camera.aspect,t=G.t;let tx,ty,tz,px,py,pz;
  if(G.view==='menu'){
    const a=Math.sin(t*.05)*2.0,r=40;
    px=Math.sin(a)*r;py=11+Math.sin(t*.1)*2.5;pz=Math.cos(a)*r;tx=0;ty=2;tz=-2;
    camera.position.set(px,py,pz);camera.lookAt(tx,ty,tz);G.vo+=(0-G.vo)*Math.min(1,dt*4);
  }else if(G.view==='select'){
    px=0;py=2.5;pz=asp<1?9.5:7.2;camera.position.set(px,py,pz);camera.lookAt(0,1.05,0);G.vo+=(1-G.vo)*Math.min(1,dt*4);
  }else{
    const pk=G.puck,pl=G.player;let fx=pk.x,fz=pk.z;
    if(G.state==='goal'&&G.scoredBy&&!(G.replay&&G.replay.active)){let sx=0,sz=0,n=0;for(const p of G.scoredBy.skaters){sx+=p.x;sz+=p.z;n++;}if(n){fx=lerp(pk.x,sx/n,.6);fz=lerp(pk.z,sz/n,.6);}}
    else if(pl){fx=lerp(pk.x,pl.x,.4);fz=lerp(pk.z,pl.z,.4);}
    fx+=clamp(pk.vx*.12,-4,4);fx=clamp(fx,-W+9,W-9);fz=clamp(fz,-D*.35,D*.35);
    const k=1-Math.exp(-4*dt);G.cam.x+=(fx-G.cam.x)*k;G.cam.z+=(fz-G.cam.z)*k;
    let zoom=1;if(G.state==='goal')zoom=(G.replay&&G.replay.active)?.85:.62;else if(pl){const sp=Math.hypot(pk.x-pl.x,pk.z-pl.z);zoom=1+clamp((sp-8)/30,0,.25);}
    G.cam.zoom+=(zoom-G.cam.zoom)*(1-Math.exp(-2.5*dt));
    const port=asp<1?lerp(1.95,1,clamp((asp-.45)/.55,0,1)):landZoom(asp),z=G.cam.zoom*port;
    G.cam.shake=Math.max(0,G.cam.shake-dt*1.6);const sh=G.cam.shake*.35*shakeK();
    camera.position.set(G.cam.x+rnd(-sh,sh),15*z+rnd(-sh,sh)*.5,G.cam.z+13.2*z+rnd(-sh,sh));camera.lookAt(G.cam.x,0,G.cam.z-1);
    G.vo+=(0-G.vo)*Math.min(1,dt*4);
  }
  const W_=innerWidth,H_=innerHeight;
  if(G.vo>.002){const ox=asp>=1?W_*.2*G.vo:0,oy=asp<1?H_*.2*G.vo:0;camera.setViewOffset(W_,H_,ox,oy,W_,H_);}else camera.clearViewOffset();
  if(G.cineBlend&&G.view==='game')cineCamBlend();
}
function setTOD(t,dt){
  G.tod+=(t-G.tod)*Math.min(1,dt*1.5);const T_=G.tod;
  const top=pick3(SKYK.top,T_),mid=pick3(SKYK.mid,T_),hor=pick3(SKYK.hor,T_);
  skyU.topC.value.setRGB(top[0],top[1],top[2]);skyU.midC.value.setRGB(mid[0],mid[1],mid[2]);skyU.horC.value.setRGB(hor[0],hor[1],hor[2]);
  const wxI=G.wx.int;scene.fog.color.setRGB(lerp(hor[0],.75,wxI*.25),lerp(hor[1],.8,wxI*.25),lerp(hor[2],.88,wxI*.25));scene.fog.density=.0042+wxI*.0065;
  const sc=pick3(SKYK.sunC,T_),si=pickN(SKYK.sunI,T_),hs=pick3(SKYK.hemiS,T_),hi=pickN(SKYK.hemiI,T_),el=pickN(SKYK.el,T_);
  sun.color.setRGB(sc[0],sc[1],sc[2]);sun.intensity=si*(1-wxI*.2);hemi.color.setRGB(hs[0],hs[1],hs[2]);hemi.groundColor.setRGB(hor[0]*.6,hor[1]*.6,hor[2]*.7);hemi.intensity=hi;
  sunDir.set(-.45*Math.cos(el),Math.sin(el),-.85*Math.cos(el)).normalize();
  shFit();
  sunSpr.position.copy(camera.position).addScaledVector(sunDir,900);sunSpr.material.opacity=1-smooth(.55,.85,T_);sunSpr.material.color.setRGB(sc[0],sc[1],sc[2]);
  moonSpr.position.copy(camera.position).addScaledVector(sunDir,900);moonSpr.material.opacity=smooth(.7,.95,T_);
  starMat.opacity=smooth(.55,.9,T_);stars.position.copy(camera.position);sky.position.copy(camera.position);
  const AR=G.view==='game'&&ARENAS[G.arena]||{},au=smooth(.62,.9,T_)*((save.set.aurora||AR===ARENAS.aurora)?1:0)*(AR.aur||1);for(const a of auroras){a.material.uniforms.uA.value=au;a.material.uniforms.uT.value+=dt*1.0;a.visible=au>.01;}
  const nl=smooth(.35,.85,T_);arenaLamps();for(const l of lamps){l.pl.intensity=nl*1.4;l.glow.material.opacity=nl*.85;l.bulb.material.color.setRGB(1,.95,.8).multiplyScalar(.4+nl*.6);}
  const cl=pick3([[1,1,1],[1,.78,.7],[.25,.3,.5]],T_);for(const c of clouds)c.s.material.color.setRGB(cl[0],cl[1],cl[2]);
  renderer.toneMappingExposure=lerp(1.08,1.5,smooth(.7,1,T_))*((G.view==='game'&&ARENA_DECO[G.arena]&&ARENA_DECO[G.arena].exp)||1);
  condLight();
  updateEnv(false);
}
function todTarget(){
  if(G.view==='game'&&G.cond==='night')return .97;
  {const A=ARENAS[G.arena];if(G.view==='game'&&A&&A.tod!==undefined)return A.tod;}
  const m=G.todMode;
  if(m==='fixed')return G.todFixed;
  if(m==='day')return 0.02;if(m==='dusk')return .5;if(m==='night')return .95;
  if(m==='demo'||(G.cfg&&!G.cfg.time))return (Math.sin(G.t*.03-1)*.5+.5)*.28;
  if(m==='auto'&&G.cfg&&G.cfg.time)return clamp(G.elapsed/G.cfg.time,0,1)*.3;
  return .1;
}
function updateWeather(dt){
  const w=G.wx;w.t-=dt;arenaWeather(w);condWeather(w);
  if(w.t<=0){w.t=rnd(25,50);const r=Math.random();w.mode=r<.25?'clear':r<.8?'snow':'blizzard';w.target=w.mode==='clear'?.1:w.mode==='snow'?.5:1;w.wind=w.mode==='blizzard'?rnd(10,16):rnd(1,4);
    $('#wx').textContent=w.mode==='clear'?'☀️':w.mode==='snow'?'❄️':'🌨️';}
  w.int+=(w.target-w.int)*Math.min(1,dt*.4);
  const n=(NS*lerp(.12,1,w.int))|0;sGeo.setDrawRange(0,n);snowMat.opacity=.5+.4*w.int;snowMat.size=.2+.12*w.int;
  const p=sGeo.attributes.position.array,fx=G.cam.x,fz=G.cam.z,fall=lerp(2.2,7,w.int),wind=w.wind*(.4+.6*w.int);
  for(let i=0;i<n;i++){
    let x=p[i*3]+(wind+Math.sin(G.t*.7+i)*.6)*dt,y=p[i*3+1]-(fall+(i%5)*.35)*dt,z=p[i*3+2]+Math.cos(G.t*.5+i*1.3)*.4*dt;
    if(y<0){y+=30;}if(x<fx-50)x+=100;else if(x>fx+50)x-=100;if(z<fz-50)z+=100;else if(z>fz+50)z-=100;
    p[i*3]=x;p[i*3+1]=y;p[i*3+2]=z;
  }
  sGeo.attributes.position.needsUpdate=true;
  SFX.windLvl(.25+.75*w.int*(w.wind>8?1:.5));
}
function updateWorld(dt){
  const t=G.t;
  // ocean waves
  G.oceanT=(G.oceanT||0)+dt;
  if(G.oceanT>=(save.set.quality==='low'?1/12:1/30)){G.oceanT=0;G.oceanN=(G.oceanN||0)+1;const p=oceanGeo.attributes.position,b=oceanBase;for(let i=0;i<p.count;i++){const x=b[i*3],z=b[i*3+2];p.setY(i,Math.sin(x*.02+t*.8)*.5+Math.sin(z*.03+t*.6)*.4+Math.sin((x+z)*.05+t*1.3)*.2);}p.needsUpdate=true;if(G.oceanN%3===0)oceanGeo.computeVertexNormals();}
  for(const f of floaters)f.m.position.y=f.y+Math.sin(t*.6+f.s)*f.a+.1;
  for(const c of clouds){c.s.position.x+=c.v*dt;if(c.s.position.x>800)c.s.position.x=-800;}
  for(const b of birds){b.a+=b.s*dt;b.g.position.set(b.cx+Math.cos(b.a)*b.r,b.h+Math.sin(t*.4+b.ph)*3,b.cz+Math.sin(b.a)*b.r);b.g.rotation.y=-b.a;const f=Math.sin(t*7+b.ph)*.5;b.wl.rotation.z=f;b.wr.rotation.z=-f;}
  const ch=G.cheer;G.cf=(G.cf||0)+1;if(save.set.quality!=='low'||G.cf%2===0||ch>.05)crowd.update(t,ch,false);
  G.cheer=Math.max(0,G.cheer-dt*.35);SFX.crowd(.25+ch*.9);
}

/* ================= HUD ================= */
let lastClock='',lastGauge=-1;
function updateHud(){
  if(G.view!=='game')return;
  const cfg=G.cfg;
  if(G.so){}else if(cfg.time&&!G.ot){const s=fmtTime(G.timeLeft);if(s!==lastClock){lastClock=s;$('#clock').textContent=s;}}
  else if(G.ot&&lastClock!=='OT'){lastClock='OT';$('#clock').textContent='OT';}
  const pl=G.player;
  if(pl){const v=1-pl.cd.special/(pl.specMax||8),vv=Math.round(v*50)/50;if(vv!==lastGauge){lastGauge=vv;const g=$('#gauge');g.style.setProperty('--v',vv);g.classList.toggle('rdy',vv>=1);$('#gaugeT').textContent=vv>=1?SPECIALS[pl.ty.special]:__L('충전중');}
    const c=$('#charge');c.style.opacity=pl.charging?1:0;c.firstElementChild.style.width=(pl.charge*100)+'%';c.dataset.s=pl.charge<.14?0:pl.charge<.45?1:pl.charge<.8?2:3;document.body.classList.toggle('chmax',!!(pl.charging&&pl.charge>=.99));}
}

/* ================= MAIN LOOP ================= */
// on-screen error display (so rendering problems on phones can be seen and reported)
const dbgEl=document.createElement('div');
dbgEl.style.cssText='position:fixed;left:6px;bottom:6px;z-index:200;max-width:90vw;font:11px/1.3 monospace;color:#ff9;background:rgba(0,0,0,.65);padding:4px 6px;border-radius:6px;pointer-events:none;display:none;white-space:pre-wrap';
document.body.appendChild(dbgEl);
const dbgSeen={};
function dbgErr(tag,e){const m=tag+': '+((e&&e.message)||e);if(dbgSeen[m])return;dbgSeen[m]=1;console.error(e);if(Object.keys(dbgSeen).length<=3){dbgEl.textContent+=(dbgEl.textContent?'\n':'')+m.slice(0,220);dbgEl.style.display='block';}}
function safe(f,a){try{f(a);}catch(e){dbgErr(f.name||'fn',e);}}
try{renderer.debug.onShaderError=function(gl,prog){dbgErr('shader',new Error((gl.getProgramInfoLog(prog)||'compile error').slice(0,200)));};}catch(e){}
addEventListener('error',ev=>dbgErr('error',ev.error||ev.message));
const clockT=()=>performance.now()/1000;
let lastT=clockT(),showcase=null,ctxLost=false;
const perf={ema:1/60,low:0,hi:0,scale:1};
function perfSample(raw){
  if(raw>.25||raw<=0)return;
  perf.ema+=(raw-perf.ema)*.05;
  if(perf.ema>1/38){perf.low++;perf.hi=0;}else if(perf.ema<1/55){perf.hi++;perf.low=0;}else{perf.low=perf.hi=0;}
  // adaptive resolution: only affects render scale, never the saved graphics setting
  if(perf.low>120&&gfxStepDown()){perf.low=0;}
  else if(perf.low>120&&perf.scale>.6){perf.scale=Math.max(.6,perf.scale-.1);perf.low=0;applyQuality();}
  else if(perf.hi>600&&perf.scale<1){perf.scale=Math.min(1,perf.scale+.1);perf.hi=0;applyQuality();}
  else if(perf.low>240&&perf.scale<=.6&&!perf.noShadow&&G.view==='game'){perf.noShadow=true;perf.low=0;renderer.shadowMap.enabled=false;scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.needsUpdate=true;});});}   // still too slow at the lowest resolution: drop real-time shadows for this session (setting untouched)
}
function step(dt){
  if(G.paused&&G.view==='game')return;   // nothing (clock, hit-stop, slow-mo) advances while paused
  G.rdt=dt;if(G.cine){safe(cineStep,dt);if(G.cine)dt=0;}else if(G.hitStop>0){G.hitStop-=dt;dt*=.02;}else if(G.slow&&G.slow.t>0){G.slow.t-=dt;dt*=G.slow.s;}
  G.t+=dt;G.frame++;
  if(G.view==='select'){updateShowcase(dt);}
  const show=(G.view!=='select');
  puckG.visible=show;puckRing.visible=show;for(const p of G.pengs)p.pg.root.visible=show&&(!p.frozen||!!p.boxed);
  if(G.view==='select'){marker.visible=false;markerRing.visible=false;aimArrow.visible=false;passRing.visible=false;puckTrail.visible=false;}
  if(G.paused){return;}
  try{if(G.view!=='select'){
    const st=G.state;
    if(st!=='play'){input.shootPress=input.shootRel=input.pass=input.dash=input.special=input.swap=false;input.shoot=false;}
    if(st==='ready'){
      G.stateT-=dt;const n=Math.ceil(G.stateT);if(n!==G.countN&&G.stateT>0){G.countN=n;if(n<=3&&n>=1){$('#count').textContent=n;SFX.beep(false);}else $('#count').textContent='';}
      if(G.stateT<=0){G.state='play';$('#count').textContent='GO!';SFX.beep(true);SFX.whistle();setTimeout(()=>{const c=$('#count');if(c.textContent==='GO!')c.textContent='';},700);}
      for(const p of G.pengs){p.ix=p.iz=0;}
    }else if(st==='play'){
      G.elapsed+=dt;
      if(G.cfg.mode!=='demo'){
        if(G.so||G.ps){}else if(G.cfg.time&&!G.ot){
          G.timeLeft-=dt;
          if(G.timeLeft<=0){G.timeLeft=0;
            if(G.cfg.challenge){const ch=G.cfg.challenge;if(ch.match){const a=G.mine.score,b=G.mine.opp.score;challengeDone(a>b,a>b?'':a===b?__L('동점으로 끝났어요. 이겨야 클리어!'):__L('아쉽게 졌어요. 다시 도전!'));}else challengeDone(false);}
            else if(G.teams.blue.score===G.teams.red.score){G.ot=true;G.otLeft=60;showBanner('OVERTIME',1800,'g');SFX.whistle();}
            else{SFX.whistle();endMatch();}
          }
        }else if(G.ot){G.otLeft-=dt;if(G.otLeft<=0){SFX.whistle();if(soAllowed()&&G.mine.score===G.mine.opp.score)soStart();else endMatch();}}
      }
      if(G.state==='play')runPhysics(dt);
    }else if(st==='goal'){
      G.stateT-=dt;G.alpha=1;
      for(const p of G.pengs){p.ix=p.iz=0;p.gvx=p.gvz=0;}
      if(!hypeGoalStep(dt)){
        const sd=dt*.4,sub=Math.max(1,Math.ceil(sd/(1/90))),h=sd/sub;
        for(let i=0;i<sub;i++){for(const p of G.pengs){if(!p.frozen)movePeng(p,h);}puckStep(h);}
      }
      G.cheer=1;
      if(G.stateT<=0){
        if(G.cfg.mode==='demo'){resetPositions();G.state='play';}
        else if(G.ot){endMatch();}
        else if((G.cfg.challenge&&!G.cfg.challenge.match)||G.cfg.mode==='practice'){resetPositions();G.state='play';}
        else{resetPositions();G.state='ready';G.stateT=1.4;G.countN=3;showBanner('READY',800,'');}
      }
    }else if(st==='stop'){   // v22: whistle → the call is shown, everyone glides to a halt → faceoff / penalty shot
      G.stateT-=dt;G.alpha=1;for(const p of G.pengs){p.ix=p.iz=0;p.gvx=p.gvz=0;}
      const sd=dt*.6;for(const p of G.pengs)if(!p.frozen)movePeng(p,sd);{const pk=G.puck,k=Math.exp(-2.5*dt);pk.vx*=k;pk.vz*=k;}puckStep(sd);
      if(G.stateT<=0)rulesResume();
    }else if(st==='over'){
      G.stateT-=dt;G.alpha=1;for(const p of G.pengs){p.ix=p.iz=0;p.gvx=p.gvz=0;}
      const sd=dt*.5;for(const p of G.pengs)if(!p.frozen)movePeng(p,sd);puckStep(sd);G.cheer=.8;
      if(G.stateT<=0&&G.result&&!G.resultShown){G.resultShown=true;if(G.result.chal)showChalResult();else showResultScreen();}
    }
    if(st!=='over')G.resultShown=false;
    G.cheer=Math.max(G.cheer,0);
    // interpolated render positions (physics runs at a fixed step)
    const al=G.state==='play'?G.alpha:1,pk=G.puck;
    for(const p of G.pengs){p.rx=p.ox+(p.x-p.ox)*al;p.rz=p.oz+(p.z-p.oz)*al;}
    pk.rx=pk.ox+(pk.x-pk.ox)*al;pk.rz=pk.oz+(pk.z-pk.oz)*al;
    for(const p of G.pengs)animatePenguin(p,dt,G.t);
    fxUpdate(dt);
    // puck visuals
    puckG.position.set(pk.rx,0,pk.rz);puckG.rotation.y+=Math.hypot(pk.vx,pk.vz)*dt*.5;
    puckRing.position.set(pk.rx,.03,pk.rz);{const bz=G.view==='game'&&(G.arena==='blizzard'||G.wx.int>.7);puckRing.scale.setScalar(bz?1.75:1.3);puckRing.material.opacity=(bz?.85:.6)+(bz?.15:.25)*Math.sin(G.t*5);}
    const ps=Math.hypot(pk.vx,pk.vz);
    if(ps>9){puckTrail.visible=true;puckTrail.position.set(pk.rx,.06,pk.rz);puckTrail.rotation.set(0,0,0);puckTrail.rotation.x=-Math.PI/2;puckTrail.rotation.z=-Math.atan2(pk.vz,pk.vx)+Math.PI;puckTrail.scale.set(clamp(ps*.1,.5,3.2),1,1);puckTrail.material.opacity=clamp(ps/30,.2,.9);}
    else puckTrail.visible=false;
    // marker, aim arrow and pass-receiver ring
    const pl=G.player;aimLine.visible=false;aimTgt.visible=false;
    if(pl&&G.view==='game'){
      marker.visible=true;markerRing.visible=true;marker.position.set(pl.rx,2.9+Math.sin(G.t*4)*.15,pl.rz);marker.rotation.y=G.t*2;markerRing.position.set(pl.rx,.04,pl.rz);
      const c=TEAM[pl.team.key].color;marker.children[0].material.color.setHex(c===0x2f7bff?0x6fb0ff:0xff8c98);
      const near=canHit(pl);
      if(near||pl.charging){
        const a=humanAim(pl);aimArrow.visible=true;aimArrow.position.set(pl.rx,.05,pl.rz);aimArrow.rotation.y=Math.atan2(a[0],a[1]);
        const L=pl.charging?2+pl.charge*4:2;aimArrow.scale.set(1,1,L/1.5);aimArrow.material.opacity=pl.charging?.8:.3;
        const stg=pl.charging?(pl.charge<.14?0:pl.charge<.45?1:pl.charge<.8?2:3):0;aimArrow.material.color.setHex([0xffe14d,0xffc040,0xff8a3a,0xff4a3a][stg]);
        const m=(near&&!pl.charging)?bestMate(pl,a[0],a[1],false):null;
        if(m&&G.state==='play'){passRing.visible=true;passRing.position.set(m.rx,.045,m.rz);passRing.scale.setScalar(1+.08*Math.sin(G.t*8));}else passRing.visible=false;
      }else{aimArrow.visible=false;passRing.visible=false;}
      passRing.material.color.setHex(0x7effa8);
      if(G.pass&&G.pass.from.team===pl.team&&G.state==='play'){const m=G.pass.to;passRing.visible=true;passRing.position.set(m.rx,.045,m.rz);passRing.scale.setScalar(1.15+.12*Math.sin(G.t*14));passRing.material.color.setHex(0xa8fff0);}
      aimPreview(pl,pl.charging?humanAim(pl):[0,1]);
    }else{marker.visible=false;markerRing.visible=false;aimArrow.visible=false;passRing.visible=false;}
    if(G.view==='menu'){marker.visible=false;markerRing.visible=false;aimArrow.visible=false;passRing.visible=false;}
  }}catch(e){dbgErr('logic',e);}
  safe(hypeFrame,dt);safe(funFrame,dt);safe(tutFrame,dt);safe(mgrFrame,dt);safe(arenaFrame,dt);safe(v17Frame,dt);safe(v18Frame,dt);safe(v22Frame,dt);safe(v23Frame,G.cine?G.rdt:dt);
  safe(updateWeather,dt);safe(updateParticles,G.cine?G.rdt:dt);safe(updateWorld,dt);safe(()=>setTOD(todTarget(),dt));safe(updateCamera,dt);safe(updateHud);
}
function frame(){
  const now=clockT(),raw=now-lastT;lastT=now;const dt=Math.min(.05,raw);
  perfSample(raw);
  if(!ctxLost){try{step(dt);gfxRender();}catch(e){dbgErr('frame',e);}}
  requestAnimationFrame(frame);
}

/* ================= SHOWCASE (select screen) ================= */
function rebuildShowcase(){
  if(showcase){scene.remove(showcase.pg.root);}
  const tm=TEAM[save.team];showcase=makePeng({key:save.team,dir:tm.dir},'attacker',save.type,0,false,save.hat);
  showcase.x=0;showcase.z=0;showcase.heading=0.4;showcase.pose='idle';
}
function updateShowcase(dt){
  if(!showcase){rebuildShowcase();}
  const s=showcase;s.pg.root.visible=true;s.heading+=dt*.45;s.pose=(G.t%7)<1.6?'cheer':'idle';s.cheerKind=0;
  const keep=s.heading;animatePenguin(s,dt,G.t);s.heading=keep;
}


/* ================= v14 tidy: panels with a fixed header/footer and a scrolling body, points-chip docking ================= */
// Wraps everything between a panel's title (+ tab strip) and its last button row in .pbody, so long content scrolls inside the panel
// instead of being sliced by the panel edge, and the 완료 / 뒤로 / result buttons are always on screen.
const UI_PANELS=['sHow','sSelect','sScout','sSquad','sMarket','sProfile','sRanked','sGoals','sSet','sResult'];
function uiPanels(){
  try{for(const id of UI_PANELS){const scr=document.getElementById(id);if(!scr||!scr.children)continue;
    const pan=[...scr.children].find(e=>e.classList&&e.classList.contains('panel'));if(!pan||pan.classList.contains('pfix'))continue;
    const kids=[...pan.children];let a=0,b=kids.length;
    if(kids[a]&&(kids[a].tagName==='H2'||kids[a].id==='rTitle'))a++;
    if(kids[a]&&kids[a].classList.contains('seg')&&/Tabs$/.test(kids[a].id||''))a++;
    if(b>a&&(kids[b-1].classList.contains('row')||kids[b-1].id==='rBtns'))b--;
    if(b-a<1)continue;
    const body=document.createElement('div');body.className='pbody';pan.insertBefore(body,kids[a]);for(let i=a;i<b;i++)body.appendChild(kids[i]);
    pan.classList.add('pfix');body.addEventListener('scroll',()=>uiFade(body),{passive:true});
    if(window.MutationObserver)new MutationObserver(uiTidySoon).observe(body,{childList:true,subtree:true,characterData:true});}
  }catch(e){}
}
function uiFade(el){const st=el.scrollTop,max=el.scrollHeight-el.clientHeight;el.classList.toggle('fu',st>2);el.classList.toggle('fd',max-st>2);}
let uiTidyT=0;function uiTidySoon(){clearTimeout(uiTidyT);uiTidyT=setTimeout(uiTidy,30);}
function i18nFit(){   // only acts when a title overflows its card; Korean titles fit, so Korean never changes
  if(I18N.lang==='ko')return;
  document.querySelectorAll('.screen.on .mode b').forEach(b=>{b.style.fontSize='';let fs=parseFloat(getComputedStyle(b).fontSize)||17,n=0;
    while(b.scrollWidth>b.clientWidth+1&&fs>12&&n<14){fs-=1;b.style.fontSize=fs+'px';n++;}});
}
function uiTidy(){
  try{const p=document.getElementById('pts');document.querySelectorAll('.screen.ptsgap').forEach(s=>s.classList.remove('ptsgap'));
    if(p&&document.body.classList.contains('menuish')){const scr=document.querySelector('.screen.on:not(#sMenu)');
      const pan=scr&&[...scr.children].find(e=>e.classList&&(e.classList.contains('panel')||e.classList.contains('col')));
      if(pan){const a=p.getBoundingClientRect(),b=pan.getBoundingClientRect();if(a.width>0&&a.right>b.left+4&&a.left<b.right-4&&a.bottom>b.top&&a.top<b.bottom)scr.classList.add('ptsgap');}}
    document.querySelectorAll('.pbody').forEach(uiFade);i18nFit();
  }catch(e){}
}


/* ================= v15 home icon set: one stroke style (24px grid, 2px rounded strokes, currentColor) ================= */
const HM_IC={
  quick:'<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="14.5" cy="10.5" rx="6.5" ry="3"/><path d="M8 10.5v3c0 1.66 2.91 3 6.5 3s6.5-1.34 6.5-3v-3"/><path d="M2 9h3.2M3 13h3.2M4.5 17h5"/></svg>',
  tier:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 2.8h3.2L12 6l1.3-3.2h3.2l-2.6 6.3"/><circle cx="12" cy="14.6" r="6.1"/><path d="M12 11.4l1 2 2.2.32-1.6 1.56.38 2.2L12 16.44l-1.98 1.04.38-2.2-1.6-1.56 2.2-.32z"/></svg>',
  market:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 8.5h15.5"/><path d="M15.5 4.5l4 4-4 4"/><path d="M20.5 15.5H5"/><path d="M8.5 11.5l-4 4 4 4"/></svg>',
  modes:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="5"/><path d="M12 5.5v13M7.4 5.5v13M16.6 5.5v13" stroke-opacity=".45"/><circle cx="12" cy="12" r="2"/></svg>',
  scout:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8c-3.9 0-7 4.3-7 9.3 0 4.6 3 8.1 7 8.1s7-3.5 7-8.1c0-5-3.1-9.3-7-9.3z"/><path d="M5.2 11.2l2.5 1.4 2.2-1.7 2.1 1.8 2.2-1.8 2.2 1.7 2.4-1.4"/></svg>',
  squad:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 3.2 3.4 6.1l1.9 4.1 2.1-.9V20.5h9.2V9.3l2.1.9 1.9-4.1-5.2-2.9c-.4 1.5-1.8 2.5-3.4 2.5s-3-1-3.4-2.5z"/><path d="M10 12.5h4" stroke-opacity=".6"/></svg>',
  goals:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 19.5V8.2C3.5 6.7 4.7 5.5 6.2 5.5h11.6c1.5 0 2.7 1.2 2.7 2.7v11.3"/><path d="M2 19.5h20"/><path d="M8.2 5.5l1.3 14M15.8 5.5l-1.3 14M3.8 10.2h16.4M4 14.8h16" stroke-opacity=".5"/></svg>',
  profile:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.2" r="3.7"/><path d="M4.6 20.3c.9-3.9 3.9-6.1 7.4-6.1s6.5 2.2 7.4 6.1"/></svg>',
  how:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 9.2h7v3.6h-4.4"/><path d="M14.4 9.2A6 6 0 1 0 15 13"/><circle cx="8.6" cy="12.2" r="1.7"/><path d="M11.5 6.2V3.6"/></svg>',
  settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.1"/><path d="M12 2.8l1.6 2.4 2.8-.7.7 2.8 2.4 1.6-1.4 2.6 1.4 2.6-2.4 1.6-.7 2.8-2.8-.7L12 21.2l-1.6-2.4-2.8.7-.7-2.8-2.4-1.6 1.4-2.6-1.4-2.6 2.4-1.6.7-2.8 2.8.7z"/></svg>',
  rink:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V9.5l6-4.5 6 4.5V20"/><path d="M10 20v-5h4v5"/></svg>',
  medal:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l7 2.6v5.4c0 4.4-3 7.7-7 9.6-4-1.9-7-5.2-7-9.6V5.8z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.4"/></svg>',
  chev:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
  gift:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="9" width="17" height="11.5" rx="2"/><path d="M2.5 9h19M12 9v11.5"/><path d="M12 9c-1.6-3.6-6-4.4-6-1.6C6 9 9 9 12 9zm0 0c1.6-3.6 6-4.4 6-1.6C18 9 15 9 12 9z"/></svg>'
};

/* ================= UI ================= */
const screens=['sMenu','sMode','sHow','sSelect','sSet','sPause','sResult','sTour','sChal','sScout','sSquad','sGoals','sMarket','sProfile','sRanked','sPass'];
function show(id){screens.forEach(s=>$('#'+s).classList.toggle('on',s===id));G.ui=id;uiTidy();}
function hideAll(){screens.forEach(s=>$('#'+s).classList.remove('on'));}
function goScreen(id){
  if(id==='sSelect'){G.view='select';rebuildShowcase();renderSelect();}
  else{if(G.view==='select'){G.view='menu';if(showcase){showcase.pg.root.visible=false;}}}
  if(id==='sSet')renderSettings();
  if(id==='sScout')renderScout();
  if(id==='sSquad'){renderSquad();requestAnimationFrame(renderSquad);}
  if(id==='sGoals')renderGoals();
  if(id==='sMenu'){hypeMenuRefresh();leagueMenuRefresh();}
  if(id==='sMarket')renderMarket();
  if(id==='sProfile')renderProfile();
  if(id==='sRanked')renderRanked();
  if(id==='sPass')renderPass();
  show(id);$('#ptsN').textContent=save.points;
}
let msgT=0;
function lackMsg(c){flashMsg(__L('포인트가 ')+(c-save.points)+__L('P 부족해요 (필요 ')+c+__L('P · 보유 ')+save.points+'P)');}
function flashMsg(t){const m=$('#msg');m.textContent=t;m.classList.add('on');clearTimeout(msgT);msgT=setTimeout(()=>m.classList.remove('on'),1400);}
function statBars(k){const s=TYPES[k].stats;return Object.keys(s).map(n=>'<span>'+STATN[n]+'</span><div class="bar"><i style="width:'+Math.min(100,(s[n]+(save.lv[k]||0)*LV_STAT)*20)+'%"></i></div>').join('');}
function renderSelect(){
  $('#ptsN').textContent=save.points;
  document.querySelectorAll('#teamSeg button').forEach(b=>b.classList.toggle('on',b.dataset.team===save.team));
  $('#typeList').innerHTML=Object.keys(TYPES).map(k=>{const t=TYPES[k],own=save.types.includes(k);return '<div class="card '+(save.type===k?'sel':'')+' '+(own?'':'lock')+'" data-type="'+k+'"><div>'+t.name+(own&&save.lv[k]?' Lv.'+save.lv[k]:'')+'</div><div class="cs">'+(own?(save.type===k?__L('선택됨'):__L('선택')):(t.exclusive?__L('🔒 개발자 티어 보상'):'🔒 '+t.cost+'P'))+'</div></div>';}).join('');
  $('#statBars').innerHTML=statBars(save.type);
  $('#specInfo').textContent=__L('특수 기술: ')+SPECIALS[TYPES[save.type].special]+' — '+spDesc(TYPES[save.type].special);
  $('#hatList').innerHTML=Object.keys(HATS).map(k=>{const t=HATS[k],own=save.hats.includes(k);return '<div class="card '+(save.hat===k?'sel':'')+' '+(own?'':'lock')+'" data-hat="'+k+'"><div>'+t.name+'</div><div class="cs">'+(own?(save.hat===k?__L('착용중'):__L('착용')):'🔒 '+t.cost+'P')+'</div></div>';}).join('');
  $('#trailList').innerHTML=Object.keys(TRAILS).filter(k=>!TRAILS[k].pass||save.trails.includes(k)).map(k=>{const t=TRAILS[k],own=save.trails.includes(k);return '<div class="card '+(save.trail===k?'sel':'')+' '+(own?'':'lock')+'" data-trail="'+k+'"><div>'+t.name+'</div><div class="cs">'+(own?(save.trail===k?__L('사용중'):__L('사용')):'🔒 '+t.cost+'P')+'</div></div>';}).join('');
}
function tryUse(list,k,cost,apply){
  if(!save[list].includes(k)){if(save.points<cost){lackMsg(cost);return;}save.points-=cost;save[list].push(k);flashMsg(__L('해금했어요! ✨'));}
  apply();persist();renderSelect();rebuildShowcase();SFX.ui();
}
const SETDEF=[
  {k:'lang',label:__L('언어 · Language'),opts:[['ko',__L('한국어')],['en','English'],['zh','简体中文'],['ja','日本語']]},
  {k:'size',label:__L('경기 인원'),opts:[[1,'1 vs 1'],[2,'2 vs 2'],[3,'3 vs 3'],[4,'4 vs 4']]},
  {k:'time',label:__L('경기 시간'),opts:[[60,__L('1분')],[120,__L('2분')],[180,__L('3분')],[300,__L('5분')]]},
  {k:'diff',label:__L('난이도'),opts:[['easy',__L('쉬움')],['normal',__L('보통')],['hard',__L('어려움')]]},
  {k:'tod',label:__L('시간대'),opts:[['auto',__L('자동')],['day',__L('낮')],['dusk',__L('해질녘')],['night',__L('밤')]]},
  {k:'aurora',label:__L('오로라'),opts:[[true,__L('켜기')],[false,__L('끄기')]]},
  {k:'sound',label:__L('사운드'),opts:[[true,__L('켜기')],[false,__L('끄기')]]},
  {k:'quality',label:__L('그래픽'),opts:[['ultra',__L('최고')],['high',__L('높음')],['low',__L('절약')]]},
  {k:'assist',label:__L('조준 보조'),opts:[[true,__L('켜기')],[false,__L('끄기')]]},
  {k:'items',label:__L('빙판 아이템'),opts:[[true,__L('켜기')],[false,__L('끄기')]]},
  {k:'events',label:__L('깜짝 이벤트'),opts:[[true,__L('켜기')],[false,__L('끄기')]]},
  {k:'cond',label:__L('빙판 변수'),opts:[[true,__L('켜기')],[false,__L('끄기')]]},
  {k:'rules',label:__L('하키 규칙'),opts:[['full',__L('전체')],['fouls',__L('반칙만')],['off',__L('끄기')]]},
  {k:'cine',label:__L('기술 연출'),opts:[['full',__L('시네마틱')],['short',__L('짧게')],['off',__L('끄기')]]},
  {k:'stick',label:__L('하키 스틱'),opts:[[true,__L('표시')],[false,__L('숨김')]]},
  {k:'arena',label:__L('경기장'),opts:[['auto',__L('기본')],['aurora',__L('오로라 나이트')],['blizzard',__L('눈보라')],['sunset',__L('선셋 컵')],['final',__L('결승 무대')]]},
  {k:'vol',label:__L('효과음 크기'),opts:[['low',__L('작게')],['mid',__L('보통')],['high',__L('크게')]]},
  {k:'vib',label:__L('진동'),opts:[[true,__L('켜기')],[false,__L('끄기')]]},
  {k:'shake',label:__L('화면 흔들림'),opts:[['on',__L('켜기')],['low',__L('약하게')],['off',__L('끄기')]]},
  {k:'flash',label:__L('번쩍임 효과'),opts:[[true,__L('켜기')],[false,__L('끄기')]]},
  {k:'motion',label:__L('모션 줄이기'),opts:[[false,__L('끄기')],[true,__L('켜기')]]}
];
function renderSettings(){
  const el=$('#setList');el.innerHTML='';
  SETDEF.forEach(sd=>{
    const row=document.createElement('div');row.className='setrow'+(sd.k==='lang'?' set-lang':'');row.innerHTML='<div>'+sd.label+'</div>';
    const seg=document.createElement('div');seg.className='seg';
    sd.opts.forEach(o=>{const b=document.createElement('button');b.textContent=o[1];if(save.set[sd.k]===o[0])b.classList.add('on');if(sd.k==='lang')b.lang=o[0]==='zh'?'zh-CN':o[0];
      if(sd.k==='arena'&&o[0]==='final'&&!save.cleared.tour){b.textContent=__L('결승 무대 🔒');b.onclick=()=>{SFX.init();SFX.ui();flashMsg(__L('🔒 토너먼트에서 우승하면 열려요'));};seg.appendChild(b);return;}
      b.onclick=()=>{if(sd.k==='lang'){if(o[0]!==I18N.lang){save.set.lang=o[0];persist();SFX.init();SFX.ui();I18N.set(o[0]);}return;}save.set[sd.k]=o[0];persist();SFX.init();SFX.ui();if(sd.k==='sound'){SFX.setOn(o[0]);$('#bSound').textContent=o[0]?'🔊':'🔇';}if(sd.k==='quality'){GFX.drop=0;applyQuality();}if(['vol','shake','flash','motion'].includes(sd.k))applyFxSettings();renderSettings();};seg.appendChild(b);});
    row.appendChild(seg);el.appendChild(row);
  });
}
function applyQuality(){
  const low=save.set.quality==='low';
  renderer.setPixelRatio((low?1:Math.min(devicePixelRatio||1,2))*perf.scale);
  const sz=shMapSize();if(sun.shadow.mapSize.x!==sz){sun.shadow.mapSize.set(sz,sz);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
  resize();rinkQuality();gfxApply();
}
function resize(){
  const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();pU.uScale.value=h*1.1*(renderer.getPixelRatio()>1?1:1);
}

/* ================= SCOUT CENTER + SQUAD (cards / pack opening / fusion / chemistry) ================= */
// Own design. Inspired by general ideas of mobile sports games (duplicate-card growth, published odds, pity counters,
// squad building) but with penguin-themed rules; paid with in-game points only.
let scTab='pull',scLast=null,scMsg='',scFx=null,fz={g:0,sel:[]},sqSel=null;
const EGG_SVG='<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cgEgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f9ff"/><stop offset=".5" stop-color="#7fd0ff"/><stop offset="1" stop-color="#2a79d6"/></linearGradient></defs><ellipse cx="100" cy="125" rx="82" ry="108" fill="url(#cgEgg)" stroke="#fff" stroke-width="3"/><ellipse cx="70" cy="68" rx="20" ry="36" fill="rgba(255,255,255,.5)" transform="rotate(20 70 68)"/><circle cx="100" cy="132" r="38" fill="rgba(10,40,90,.55)" stroke="#e8fbff" stroke-width="3"/><text x="100" y="148" text-anchor="middle" font-size="46" fill="#fff">❄</text><path class="cr" d="M18 125 L45 118 L62 134 L84 116 L104 136 L128 114 L150 132 L172 120 L184 126" stroke="#fff" stroke-width="4" fill="none" stroke-linejoin="round"/></svg>';
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const PREF={fast:'attacker',strong:'attacker',defense:'defender',balanced:'mid',basic:null};
const POSN={attacker:__L('공격'),mid:__L('중앙'),defender:__L('수비')};
const tierOfLv=lv=>lv>=9?3:lv>=6?2:lv>=3?1:0;
const FQ=[0,1,1,2,3];   // pack-opening effect step per rarity
function cardOvr(k,lv,bk){if(k==='auk')return 999;const s=TYPES[k].stats;return Math.min(99,Math.round(40+(s.speed+s.accel+s.power+s.turn+s.body-10)*6+(lv|0)*2.7+mxInfo(k).lv*.9+(bk===undefined?((save.brk&&save.brk[k])|0):bk)*BRK.ovr));}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')';}

/* ---------- card art (inline SVG, no external assets) ---------- */
function pengSVG(k){   // card art per real species (own drawings)
  if(k==='auk')return aukSVG();
  if(SVG18[TYPES[k].patch])return pengSVG18(k);
  const t=TYPES[k],p=t.patch,D='#1d2540',Wh='#f6faff';
  const hx=c=>{let h=c.toString(16);while(h.length<6)h='0'+h;return '#'+h;};
  const bk=hx(t.beak[0]),bk2=hx(t.beak[1]),ft=hx(t.foot||0xff8c1c);
  const big=k==='strong'?1.12:k==='fast'?.92:1;
  let s='<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">';
  s+='<ellipse cx="60" cy="134" rx="30" ry="5" fill="rgba(0,0,0,.28)"/>';
  s+='<ellipse cx="46" cy="130" rx="12" ry="5" fill="'+ft+'"/><ellipse cx="74" cy="130" rx="12" ry="5" fill="'+ft+'"/>';
  if(k==='fast')s+='<path d="M6 72h20M2 84h22M8 96h18" stroke="rgba(255,255,255,.75)" stroke-width="3.2" stroke-linecap="round"/><path d="M60 118l-4 14h8z" fill="'+D+'"/>';
  s+='<g transform="translate(60 92) scale('+big+') translate(-60 -92)">';
  s+='<ellipse cx="31" cy="92" rx="7" ry="21" fill="'+D+'" transform="rotate(14 31 92)"/><ellipse cx="89" cy="92" rx="7" ry="21" fill="'+D+'" transform="rotate(-14 89 92)"/>';
  s+='<ellipse cx="60" cy="92" rx="30" ry="38" fill="'+(p==='ear'?'#2c3a55':D)+'"/><ellipse cx="60" cy="97" rx="20" ry="30" fill="'+Wh+'"/>';
  if(p==='ear')s+='<ellipse cx="60" cy="74" rx="17" ry="9" fill="#ffd45a" opacity=".75"/>';
  s+='</g>';
  // head
  s+='<circle cx="60" cy="46" r="24" fill="'+D+'"/>';
  if(p==='chinstrap')s+='<ellipse cx="60" cy="52" rx="19" ry="16" fill="#fff"/><path d="M42 54Q60 74 78 54" stroke="'+D+'" stroke-width="2.6" fill="none"/>';
  else if(p==='gentoo')s+='<path d="M38 36Q60 24 82 36Q60 31 38 36Z" fill="#fff"/><path d="M40 37Q60 27 80 37L78 41Q60 33 42 41Z" fill="#fff"/>';
  else if(p==='ear')s+='<path d="M34 46Q38 34 46 40Q42 52 38 60Q33 54 34 46Z" fill="#ffb21f"/><path d="M86 46Q82 34 74 40Q78 52 82 60Q87 54 86 46Z" fill="#ffb21f"/>';
  // eyes
  if(p==='adelie')s+='<circle cx="50" cy="45" r="8.4" fill="#fff"/><circle cx="70" cy="45" r="8.4" fill="#fff"/><circle cx="50" cy="45" r="5.8" fill="'+D+'"/><circle cx="70" cy="45" r="5.8" fill="'+D+'"/><circle cx="50.6" cy="45.6" r="3.6" fill="#10131f"/><circle cx="70.6" cy="45.6" r="3.6" fill="#10131f"/>';
  else if(p==='rock')s+='<circle cx="50" cy="46" r="5.6" fill="#e0213a"/><circle cx="70" cy="46" r="5.6" fill="#e0213a"/><circle cx="50.5" cy="46.5" r="2.6" fill="#10131f"/><circle cx="70.5" cy="46.5" r="2.6" fill="#10131f"/>';
  else s+='<circle cx="50" cy="46" r="6.4" fill="#fff"/><circle cx="70" cy="46" r="6.4" fill="#fff"/><circle cx="51" cy="47" r="3.5" fill="#10131f"/><circle cx="71" cy="47" r="3.5" fill="#10131f"/>';
  s+='<circle cx="52.2" cy="45.4" r="1.3" fill="#fff"/><circle cx="72.2" cy="45.4" r="1.3" fill="#fff"/>';
  if(p==='rock'){   // yellow eyebrow plumes + spiky black crest
    s+='<path d="M40 38Q52 36 58 40Q48 38 34 30Q42 34 40 38Z" fill="#ffd21a"/><path d="M80 38Q68 36 62 40Q72 38 86 30Q78 34 80 38Z" fill="#ffd21a"/>';
    s+='<path d="M42 37L30 24L44 33ZM78 37L90 24L76 33Z" fill="#ffd21a"/><path d="M48 26L52 14L56 24L60 10L64 24L68 14L72 26Z" fill="'+D+'"/>';
  }
  // beak
  if(p==='ear')s+='<path d="M55 54Q60 52 65 54L61 72Q60 74 59 72Z" fill="'+bk+'"/><path d="M57 60L63 60L61 70Z" fill="'+bk2+'"/>';
  else if(p==='rock')s+='<path d="M51 54Q60 49 69 54Q66 64 60 66Q54 64 51 54Z" fill="'+bk+'"/>';
  else if(p==='adelie')s+='<path d="M55 54Q60 51 65 54Q63 61 60 62Q57 61 55 54Z" fill="'+bk+'"/>';
  else s+='<path d="M53 55Q60 51 67 55Q64 65 60 67Q56 65 53 55Z" fill="'+bk+'"/>';
  s+='<ellipse cx="42" cy="57" rx="4" ry="2.6" fill="rgba(255,120,150,.55)"/><ellipse cx="78" cy="57" rx="4" ry="2.6" fill="rgba(255,120,150,.55)"/>';
  return s+'</svg>';
}
function cardHtml(k,o){
  o=o||{};const own=o.lv===undefined,lv=own?(save.lv[k]|0):o.lv,g=rarCls(k),t=TYPES[k],pref=PREF[k];
  const pos=o.role?POSN[o.role]:(pref?POSN[pref]:__L('만능')),bk=own&&save.brk?(save.brk[k]|0):0;
  const tagCls=o.tag?((o.tag===__L('보관')||o.tag.indexOf(__L('중복'))===0||o.tag.indexOf(__L('보관'))===0||o.tag.indexOf(__L('보관 가득 +'))===0)?' dup':'')+(o.tag.indexOf(__L('배치'))===0?' use':''):'';
  return '<div class="pc g'+g+(bk>=BRK.max?' b5':'')+(o.cls?' '+o.cls:'')+'"'+(o.cw?' style="--cw:'+o.cw+'px"':'')+'><i class="pc-deco"></i><div class="pc-top"><span class="pc-ovr">'+cardOvr(k,lv,own?undefined:0)+'</span><span class="pc-pos">'+pos+'</span></div><div class="pc-art">'+pengSVG(k)+'</div>'+nmTag18(t.name.replace(__L(' 펭귄'),''))+'<div class="pc-foot"><span class="pc-stars">'+(bk?'★'.repeat(bk):'')+'</span><span>Lv.'+lv+(own&&mxInfo(k).lv?' · M'+mxInfo(k).lv:'')+'</span></div>'+(o.tag?'<div class="pc-new'+tagCls+'">'+o.tag+'</div>':'')+(o.count>1?'<div class="pc-cnt">×'+o.count+'</div>':'')+'<div class="pc-foil"></div><div class="pc-holo"></div></div>';
}
const backHtml=()=>'<div class="pc-backface">❄</div>';
function slotHtml(r,cw,faceUp,delay){
  return '<div class="slot'+(faceUp?' on':'')+(delay!==undefined?' deal':'')+'" style="--cw:'+cw+'px'+(delay!==undefined?';animation-delay:'+delay+'ms':'')+'"><div class="flip"><div class="face fb">'+backHtml()+'</div><div class="face ff">'+cardHtml(r.type,{g:r.g,lv:0,tag:r.isNew?'NEW':r.ovf?__L('보관 가득 +')+r.ovf+'P':__L('중복')})+'</div></div></div>';
}

/* ---------- particle engine (one shared canvas) ---------- */
const fxP=[];let fxRaf=0,fxOn=0,fxLast=0,fxSpeed=1,fxSkip=false,fxBusy=false;
const sleep=ms=>new Promise(r=>setTimeout(r,fxSkip?Math.min(30,ms/10):ms/fxSpeed));
function fxStart(){const c=$('#fxCv');c.width=innerWidth;c.height=innerHeight;c.style.display='block';fxLast=performance.now();if(!fxRaf)fxRaf=requestAnimationFrame(fxLoop);}
function fxEmit(x,y,n,col,sp,kind,life){
  for(let i=0;i<n&&fxP.length<700;i++){const a=Math.random()*TAU,s=(.25+Math.random())*sp;
    fxP.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(kind==='c'?sp*.5:0),life:(life||1)*(.6+Math.random()*.8),t:0,col,kind:kind||'s',sz:2+Math.random()*4.5,rot:Math.random()*TAU,vr:(Math.random()-.5)*10,g:kind==='c'?420:kind==='k'?700:0});}
  if(!fxRaf)fxRaf=requestAnimationFrame(fxLoop);
}
function fxToward(x,y,tx,ty,n,col,time){
  for(let i=0;i<n&&fxP.length<700;i++)fxP.push({kind:'t',x:x+(Math.random()-.5)*70,y:y+(Math.random()-.5)*90,tx,ty,t:0,life:time*(.6+Math.random()*.6),col,sz:2+Math.random()*3,vx:0,vy:0});
  if(!fxRaf)fxRaf=requestAnimationFrame(fxLoop);
}
function fxLoop(now){
  const c=$('#fxCv'),cx=c.getContext('2d'),dt=Math.min(.05,(now-fxLast)/1000||.016);fxLast=now;
  cx.clearRect(0,0,c.width,c.height);cx.globalCompositeOperation='lighter';
  for(let i=fxP.length-1;i>=0;i--){
    const p=fxP[i];p.t+=dt;if(p.t>=p.life){fxP.splice(i,1);continue;}
    const f=p.t/p.life;
    if(p.kind==='t'){const e=f*f;p.x+=(p.tx-p.x)*Math.min(1,dt*(2+6*e));p.y+=(p.ty-p.y)*Math.min(1,dt*(2+6*e));}
    else{p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-1.2*dt;p.rot+=p.vr*dt;}
    cx.globalAlpha=Math.max(0,1-f*f);cx.fillStyle=p.col;
    if(p.kind==='k'){cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.beginPath();cx.moveTo(0,-p.sz*1.8);cx.lineTo(p.sz,p.sz);cx.lineTo(-p.sz,p.sz);cx.closePath();cx.fill();cx.restore();}
    else if(p.kind==='c'){cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.fillRect(-p.sz,-p.sz*.5,p.sz*2,p.sz);cx.restore();}
    else{cx.beginPath();cx.arc(p.x,p.y,p.sz*(p.kind==='t'?1:(1-f*.5)),0,TAU);cx.fill();}
  }
  cx.globalAlpha=1;
  if(fxP.length||fxOn)fxRaf=requestAnimationFrame(fxLoop);else{fxRaf=0;cx.clearRect(0,0,c.width,c.height);c.style.display='none';}
}
function ctr(el){const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
let tapT=null;
function waitTap(ms){return new Promise(r=>{const t=setTimeout(r,fxSkip?30:ms/fxSpeed);tapT=()=>{clearTimeout(t);r();};});}

/* ---------- pack opening ("ice capsule") ---------- */
function playPackOpen(res){
  if(window.__NOFX)return Promise.resolve('close');
  return new Promise(resolve=>{
    fxBusy=true;fxSkip=false;fxSpeed=RM?2.5:(save.set.fastFx?2:1);
    const ov=$('#packFx'),cap=$('#pkCap'),grid=$('#pkGrid'),foot=$('#pkFoot'),spot=$('#pkSpot'),aura=$('#pkAura'),ray=$('#pkRay'),ring=$('#pkRing'),flash=$('#pkFlash'),title=$('#pkTitle'),stage=$('#pkStage');
    const n=res.length,best=Math.max(...res.map(r=>r.g)),col=GRADES[best].c;
    $('#pkSkip').style.display='';title.classList.remove('sum');let order=res.map((r,i)=>i);
    cap.className='capsule';grid.className='fx-grid';grid.innerHTML='';foot.className='fx-foot';foot.innerHTML='';spot.className='fx-spot';aura.className='fx-aura';ray.className='fx-ray';ring.className='fx-ring';stage.style.display='flex';title.textContent='';
    ov.style.setProperty('--aura','#bfe6ff');ov.classList.remove('quake','legb');ov.classList.add('on');fxOn++;fxStart();
    let done=false;
    const finish=a=>{if(done)return;done=true;fxOn=Math.max(0,fxOn-1);ov.classList.remove('on');fxBusy=false;resolve(a);};
    $('#pkSkip').onclick=()=>{fxSkip=true;if(tapT){tapT();tapT=null;}};$('#pkSkip').textContent=n>1?__L('모두 공개 ▶▶'):__L('건너뛰기 ▶▶');
    $('#pkSpot').onclick=()=>{if(tapT){tapT();tapT=null;}};
    const quake=()=>{ov.classList.remove('quake');void ov.offsetWidth;ov.classList.add('quake');};
    const fl=el=>{el.classList.remove('on');void el.offsetWidth;el.classList.add('on');};
    const showFoot=()=>{
      $('#pkSkip').style.display='none';title.classList.toggle('sum',n>1);
      if(n>1){const sl=[...grid.children],bg=Math.max(...res.map(r=>r.g));if(bg>=1)sl.forEach((e,j)=>{const r=res[order[j]];if(r&&FQ[r.g]===bg){e.classList.add('best');e.style.setProperty('--bc',GRADES[bg].c);}});}
      const free=false,cost=n===1?PULL_COST:PULL10_COST,can=save.points>=cost;
      foot.innerHTML=__L('<button class="btn" id="pkOk">확인</button><button class="btn primary" id="pkAgain" style="font-size:19px;padding:10px 26px"')+(can?'':__L(' disabled title="포인트 부족"'))+'>'+(n===1?__L('1회'):__L('10회'))+__L(' 더 뽑기 · ')+cost+'P'+(can?'':' <small>('+(cost-save.points)+__L('P 부족)</small>'))+'</button>';
      foot.classList.add('on');if(res.some(r=>!r.isNew)){const eb=document.createElement('button');eb.className='btn';eb.textContent=__L('⬆ 강화·돌파');eb.onclick=()=>{SFX.ui();finish('enh');};foot.insertBefore(eb,foot.firstChild);}if(res.some(r=>r.isNew)){const sb=document.createElement('button');sb.className='btn';sb.textContent=__L('🧩 팀 편성으로');sb.onclick=()=>{SFX.ui();finish('squad');};foot.insertBefore(sb,foot.firstChild);}$('#pkOk').onclick=()=>{SFX.ui();finish('close');};$('#pkAgain').onclick=()=>{SFX.ui();finish('again');};
    };
    (async()=>{try{
      const cap0=()=>ctr(cap);
      await sleep(280);cap.classList.add('drop');SFX.whoosh();await sleep(900);
      for(let lv=1;lv<=3;lv++){
        cap.className='capsule drop sh'+lv;SFX.tick(lv-1);
        if(lv>=2){aura.classList.add('on');ov.style.setProperty('--aura',FQ[best]>=2?col:'#bfe6ff');}
        if(lv===3&&FQ[best]>=3){ray.classList.add('on');ov.classList.add('legb');vib([20,30,20,30,60]);}
        const c=cap0();fxToward(c.x+(Math.random()-.5)*300,c.y+(Math.random()-.5)*260,c.x,c.y,10+lv*8,FQ[best]>=2&&lv>=2?col:'#cfeeff',.8);
        await sleep(lv===3?1000:700);
      }
      cap.className='capsule drop cracked sh3';SFX.tick(3);await sleep(380);
      // burst
      ov.style.setProperty('--aura',col);fl(flash);fl(ring);quake();cap.className='capsule drop cracked split';
      const c=cap0();fxEmit(c.x,c.y,70+FQ[best]*25,col,560,'s',1);fxEmit(c.x,c.y,26,'#dff6ff',520,'k',1.2);
      if(FQ[best]>=2)SFX.win();else SFX.shot(1);
      await sleep(650);stage.style.display='none';aura.className='fx-aura';
      const dummy=0;
      if(n===1){
        const r=res[0],cw=Math.floor(Math.min(innerWidth*.46,(innerHeight*.64)/1.42,250));
        grid.className='fx-grid on';grid.innerHTML=slotHtml(r,cw,false);const sl=grid.firstChild;sl.classList.add('deal');
        await sleep(650);sl.classList.add('on');SFX.passOk();await sleep(280);
        const cc=ctr(sl);fl(flash);fxEmit(cc.x,cc.y,40+FQ[r.g]*25,GRADES[r.g].c,480+FQ[r.g]*60,'s',1);if(FQ[r.g]>=2)fxEmit(cc.x,cc.y,30,GRADES[r.g].c,430,'c',1.9);if(FQ[r.g]>=2)quake();
        title.textContent=r.isNew?'NEW! '+GRADES[r.g].n+' · '+TYPES[r.type].name+__L(' 해금!'):__L('중복! ')+GRADES[r.g].n+__L(' 카드로 보관 (강화·돌파·합성 재료)');vib(FQ[r.g]>=3?[30,40,30,40,120]:FQ[r.g]===2?[20,30,40]:FQ[r.g]===1?[15]:[6]);
        await sleep(600);
      }else{
        const cols=n>5?5:n,rows=Math.ceil(n/cols),gap=10,gh=innerHeight-150;
        const cw=Math.floor(Math.max(46,Math.min((innerWidth-28-gap*(cols-1))/cols,(gh-gap*(rows-1))/rows/1.42,118)));
        order=res.map((r,i)=>i).sort((a,b)=>res[a].g-res[b].g||(+res[a].isNew)-(+res[b].isNew));
        grid.style.setProperty('--gap',gap+'px');grid.className='fx-grid on';
        grid.innerHTML=order.map((i,j)=>slotHtml(res[i],cw,false,j*70)).join('');
        await sleep(70*n+620);
        const slots=[...grid.children];let spots=0;
        title.textContent=__L('카드를 확인하세요!');
        for(let j=0;j<order.length;j++){
          const r=res[order[j]],sl=slots[j];
          if(FQ[r.g]>=2&&spots<3&&(!fxSkip)){spots++;await spotlightCard(ov,r,flash);}
          sl.classList.add('on');(FQ[r.g]>=2?SFX.win():FQ[r.g]===1?SFX.passOk():SFX.tick(0));
          const cc=ctr(sl);if(FQ[r.g]>=1)fxEmit(cc.x,cc.y,FQ[r.g]===3?60:FQ[r.g]===2?40:18,GRADES[r.g].c,FQ[r.g]>=2?460:320,'s',.9);
          await sleep(FQ[r.g]>=2?520:300);
        }
        const cnt=[0,0,0,0,0],nw=res.filter(r=>r.isNew).length;res.forEach(r=>cnt[r.g]++);
        title.innerHTML='<b>'+GRADES.map((g,i)=>cnt[i]?g.n+' '+cnt[i]:'').filter(Boolean).join(' · ')+'</b>'+(nw?'NEW '+nw+__L('종 해금 · '):'')+(n-nw?__L('중복 ')+(n-nw)+__L('장 → 강화·돌파 재료'):'');
      }
    }catch(e){console.error(e);}
    showFoot();})();
  });
}
async function spotlightCard(ov,r,flash){
  const sp=$('#pkSpot'),sc=$('#pkSpotCard'),lb=$('#pkSpotLbl');
  const cw=Math.floor(Math.min(innerWidth*.5,(innerHeight*.66)/1.42,230));
  sc.innerHTML=slotHtml(r,cw,false);lb.className='sp-lbl';lb.textContent='';ov.style.setProperty('--aura',GRADES[r.g].c);
  sp.classList.toggle('leg',FQ[r.g]===3);sp.classList.toggle('epic',FQ[r.g]===2);sp.classList.add('on');const sl=sc.firstChild;sl.classList.add('deal');
  await sleep(560);ov.classList.remove('quake');void ov.offsetWidth;ov.classList.add('quake');SFX.tick(2);await sleep(420);
  sl.classList.add('on');(FQ[r.g]===3?SFX.win():SFX.passOk());vib(FQ[r.g]===3?[30,40,30,40,140]:[20,30,50]);
  const c=ctr(sl);flash.classList.remove('on');void flash.offsetWidth;flash.classList.add('on');
  fxEmit(c.x,c.y,FQ[r.g]===3?100:60,GRADES[r.g].c,FQ[r.g]===3?680:500,'s',1.1);fxEmit(c.x,c.y,FQ[r.g]===3?44:24,GRADES[r.g].c,430,'c',2);
  lb.textContent=(r.isNew?'NEW! ':'')+GRADES[r.g].n+' · '+TYPES[r.type].name;lb.className='sp-lbl on';
  await waitTap(FQ[r.g]===3?2100:1500);
  sp.classList.remove('on');await sleep(150);
}

/* ---------- fusion animation ---------- */
function playFuseFx(o){
  if(window.__NOFX)return Promise.resolve('close');
  return new Promise(resolve=>{
    fxBusy=true;fxSkip=false;fxSpeed=RM?2.5:(save.set.fastFx?2:1);
    const ov=$('#fuseFx'),field=$('#fzField'),orb=$('#fzOrb'),res=$('#fzRes'),ring=$('#fzRing'),flash=$('#fzFlash'),foot=$('#fzFoot'),title=$('#fzTitle');
    const gA=GRADES[o.g].c,gB=GRADES[o.g+1].c;
    [...field.querySelectorAll('.fz-c')].forEach(e=>e.remove());
    orb.className='fz-orb';res.className='fz-res';res.innerHTML='';ring.className='fx-ring';foot.className='fx-foot';foot.innerHTML='';title.textContent=__L('카드 합성');
    ov.style.setProperty('--aura',gA);orb.style.setProperty('--oc',gA);ov.classList.add('on');fxOn++;fxStart();
    let done=false;const finish=a=>{if(done)return;done=true;fxOn=Math.max(0,fxOn-1);ov.classList.remove('on');fxBusy=false;resolve(a);};
    $('#fzSkip').onclick=()=>{fxSkip=true;};
    const fl=el=>{el.classList.remove('on');void el.offsetWidth;el.classList.add('on');};
    const showFoot=()=>{
      const def=FUSE_DEF[o.g],can=cardTotal(o.g)>=3&&save.points>=def.cost;
      foot.innerHTML=__L('<button class="btn" id="fzOk">확인</button><button class="btn primary" id="fzAgain" style="font-size:19px;padding:10px 26px"')+(can?'':' disabled')+__L('>한 번 더 합성 · ')+def.cost+'P</button>';
      foot.classList.add('on');if(o.success&&o.out&&o.out.isNew){const sb=document.createElement('button');sb.className='btn';sb.textContent=__L('🧩 팀 편성으로');sb.onclick=()=>{SFX.ui();finish('squad');};foot.insertBefore(sb,foot.firstChild);}$('#fzOk').onclick=()=>{SFX.ui();finish('close');};$('#fzAgain').onclick=()=>{SFX.ui();finish('again');};
    };
    (async()=>{try{
      const cw=Math.floor(Math.min(innerWidth/4.2,(innerHeight*.5)/1.42,120)),dx=cw*1.25;
      o.inputs.forEach((k,i)=>{const d=document.createElement('div');d.className='fz-c';d.style.setProperty('--tx',((i-1)*dx)+'px');d.innerHTML=cardHtml(k,{g:o.g,lv:0,cw});field.appendChild(d);});
      const cs=[...field.querySelectorAll('.fz-c')];
      await sleep(250);cs.forEach((e,i)=>setTimeout(()=>{e.classList.add('in');SFX.tick(0);},i*160/fxSpeed));await sleep(1100);
      title.textContent=__L('재료 카드 3장 투입!');
      const oc=ctr(orb);cs.forEach(e=>{const c=ctr(e);fxToward(c.x,c.y,oc.x,oc.y,16,gA,.9);});
      cs.forEach(e=>e.classList.add('go'));SFX.whoosh();await sleep(900);
      orb.classList.add('on');SFX.tick(1);await sleep(450);
      for(let i=0;i<3;i++){orb.style.setProperty('--oc',i%2===0?gB:gA);orb.classList.remove('pulse');void orb.offsetWidth;orb.classList.add('pulse');SFX.tick(i);const c=ctr(orb);fxEmit(c.x,c.y,18+i*10,i%2===0?gB:gA,300+i*80,'s',.7);await sleep(560);}
      if(o.success){
        orb.style.setProperty('--oc',gB);ov.style.setProperty('--aura',gB);
        orb.classList.add('gone');fl(flash);fl(ring);ov.classList.remove('quake');void ov.offsetWidth;ov.classList.add('quake');SFX.win();
        const c=ctr(orb);fxEmit(c.x,c.y,90,gB,620,'s',1.1);fxEmit(c.x,c.y,36,gB,480,'c',2);
        const rcw=Math.floor(Math.max(70,Math.min(innerWidth*.42,(innerHeight-205)/1.42,210)));
        res.innerHTML=__L('<div class="fz-lbl">합성 성공! ')+GRADES[o.out.g].n+__L(' 카드</div>')+slotHtml(o.out,rcw,false)+'<div class="fz-sub">'+(o.out.isNew?__L('새 펭귄 해금!'):__L('카드가 보관함에 들어갔어요'))+'</div>';
        res.classList.add('on');await sleep(650);const sl=res.querySelector('.slot');sl.classList.add('on');SFX.passOk();await sleep(350);
        const cc=ctr(sl);fxEmit(cc.x,cc.y,40,gB,460,'s',1);
        title.textContent=__L('합성 완료');
      }else{
        orb.classList.add('fail');SFX.lose();await sleep(550);orb.classList.add('gone');
        const c=ctr(orb);fxEmit(c.x,c.y,40,'#8b95a1',260,'s',1.2);fxEmit(c.x,c.y,18,'#6c7682',320,'k',1.3);
        const rcw=Math.floor(Math.max(64,Math.min(innerWidth*.3,(innerHeight-215)/1.42,150)));
        res.innerHTML=__L('<div class="fz-lbl" style="color:#cfd6df">합성 실패…</div>')+'<div class="pc-wrapfail">'+cardHtml(o.refund,{g:o.g,lv:0,cw:rcw})+'</div>'+__L('<div class="fz-sub">재료 중 1장만 돌려받았어요</div>');
        res.classList.add('on');title.textContent=__L('아쉽네요… 다음엔 성공할 거예요!');await sleep(500);
      }
    }catch(e){console.error(e);}
    showFoot();})();
  });
}

/* ---------- scout logic ---------- */
function pickType(g){   // a penguin of rarity g; the weekly pickup takes pickShare% of its rarity, and a miss guarantees it next time
  const pk=pickupNow().type,sc=save.scout,ks=tierTypes(g);let t;
  if(RAR[pk]===g&&ks.includes(pk)){
    if(sc.pickMiss||Math.random()*100<GACHA.pickShare)t=pk;
    else{const o=ks.filter(k=>k!==pk);t=o[Math.floor(Math.random()*o.length)]||pk;}
    sc.pickMiss=t!==pk;
  }else t=ks[Math.floor(Math.random()*ks.length)];
  return t;
}
function rollGrade(){   // soft pity from GACHA.softFrom, hard pity at GACHA.hard (see gradeProbs)
  const p=gradeProbs(save.scout.pity),r=Math.random()*100;let acc=0,last=0;
  for(let i=0;i<5;i++){if(p[i]>0)last=i;acc+=p[i];if(r<acc)return i;}
  return last;
}
function grantCard(type){   // first copy unlocks the penguin, later copies are kept as cards of its rarity
  const g=RAR[type]|0;
  if(!save.types.includes(type)){save.types.push(type);save.lv[type]=save.lv[type]|0;return true;}
  if(save.cc[type][g]>=GACHA.dupCap){save.points+=GACHA.dupOverflow[g];return false;}   // storage full: refund instead of losing the card silently
  save.cc[type][g]++;return false;
}
function grantTier(g){const ks=tierTypes(g),k=ks[Math.floor(Math.random()*ks.length)];return {k,g,isNew:grantCard(k)};}   // reward card: any penguin of that rarity
function pullOnce(minG){
  let g=rollGrade();if(g<minG)g=minG;const sc=save.scout,type=pickType(g);
  sc.pulls++;if(g>=3)sc.pity=0;else sc.pity++;
  const p0=save.points,isNew=grantCard(type),ovf=save.points-p0;
  sc.hist.unshift([type,g,isNew?1:0]);if(sc.hist.length>GACHA.histMax)sc.hist.length=GACHA.histMax;
  return {type,g,isNew,ovf,pick:type===pickupNow().type};
}
function doPull(n){
  if(fxBusy)return;
  const sc=save.scout,free=(n===1&&sc.freeDay!==todayKey()),cost=free?0:(n===1?GACHA.cost1:GACHA.cost10);
  if(save.points<cost){lackMsg(cost);return;}
  save.points-=cost;if(free)sc.freeDay=todayKey();
  const res=[];for(let i=0;i<n;i++)res.push(pullOnce(i===9&&!res.some(r=>r.g>=GACHA.tenMin)?GACHA.tenMin:0));
  scLast=res;scMsg='';persist();$('#ptsN').textContent=save.points;
  playPackOpen(res).then(a=>{renderScout();if(a==='again')doPull(n);else if(a==='squad')goScreen('sSquad');else if(a==='enh'){scTab='enh';scMsg='';const d=res.find(r=>!r.isNew&&save.types.includes(r.type));if(d){enSel=d.type;enG=null;}renderScout();}});
}
function enhRate(type,g){
  const lv=save.lv[type];if(lv>=MAX_LV)return 0;
  if((save.scout.fail[type]|0)>=ENH_PITY)return 100;
  const f=Math.min(ENH_FAIL_MAX,save.scout.fail[type]|0)*ENH_FAIL_BONUS;
  return Math.min(100,ENH_RATE[lv]+f+ENH_CARD_BONUS[RAR[type]|0]);
}
function doEnhance(type,g){
  if(fxBusy)return;g=RAR[type]|0;const lv=save.lv[type];if(lv>=MAX_LV||!save.types.includes(type))return;
  const cost=enhCost(lv);
  if(save.cc[type][g]<1){flashMsg(__L('카드가 없어요!'));return;}
  if(save.points<cost){lackMsg(cost);return;}
  save.points-=cost;
  const rate=enhRate(type,g),ok=Math.random()*100<rate;
  if(ok){save.lv[type]=lv+1;save.cc[type][g]--;save.scout.fail[type]=0;SFX.win();scMsg='✨ '+TYPES[type].name+__L(' 강화 성공! Lv.')+(lv+1);}
  else{save.scout.fail[type]=(save.scout.fail[type]|0)+1;SFX.lose();scMsg=__L('강화 실패… 카드는 돌려받았어요. 다음 확률 +')+ENH_FAIL_BONUS+'%';}
  scLast=null;scFx={type,ok};save.scout.elog.unshift([type,lv,ok?1:0,g]);save.scout.elog.length=Math.min(save.scout.elog.length,8);if(ok)save.cum.enhOk++;
  persist();$('#ptsN').textContent=save.points;renderScout();
  if(!window.__NOFX)playEnhFx({type,from:lv,to:ok?lv+1:lv,ok,g,cost}).then(a=>{scFx=null;renderScout();if(a==='again')doEnhance(type,g);});
}
function cardTotal(g){return Object.keys(TYPES).reduce((a,k)=>a+save.cc[k][g],0);}
function autoFuseSel(g){
  if(cardTotal(g)<3)return null;const left={};for(const k in TYPES)left[k]=save.cc[k][g];const sel=[];
  for(let i=0;i<3;i++){const ks=Object.keys(left).filter(k=>left[k]>0).sort((a,b)=>left[b]-left[a]);left[ks[0]]--;sel.push(ks[0]);}
  return sel;
}
function doFuse(g,sel){
  if(fxBusy)return;
  const def=FUSE_DEF[g];
  if(!sel||sel.length!==3)sel=autoFuseSel(g);
  if(!sel){flashMsg(__L('같은 등급 펭귄 카드가 3장 필요해요!'));return;}
  const need={};sel.forEach(k=>need[k]=(need[k]||0)+1);
  for(const k in need)if(save.cc[k][g]<need[k]){flashMsg(__L('카드가 부족해요!'));return;}
  if(save.points<def.cost){lackMsg(def.cost);return;}
  save.points-=def.cost;sel.forEach(k=>save.cc[k][g]--);
  const ok=Math.random()*100<def.rate;let out=null,refund=null;
  if(ok){const t=pickType(g+1);out={type:t,g:g+1,isNew:grantCard(t)};scLast=[out];scMsg='';}
  else{refund=sel[(Math.random()*3)|0];save.cc[refund][g]++;scLast=null;scMsg='';}
  fz.sel=[];persist();$('#ptsN').textContent=save.points;
  playFuseFx({g,inputs:sel,success:ok,out,refund}).then(a=>{renderScout();if(a==='again'){const s2=autoFuseSel(g);if(s2)doFuse(g,s2);}else if(a==='squad')goScreen('sSquad');});
}
/* ---------- squad / chemistry ---------- */
const SYN=[
  {id:'speed',name:__L('번개 콤비'),desc:__L('젠투 + 바위뛰기 함께 출전'),eff:{accel:.3},need:(s)=>s.has('fast')&&s.has('balanced'),link:['fast','balanced']},
  {id:'wall',name:__L('철벽 듀오'),desc:__L('턱끈 + 황제 함께 출전'),eff:{body:.3},need:(s)=>s.has('defense')&&s.has('strong'),link:['defense','strong']},
  {id:'mix3',name:__L('다재다능'),desc:__L('서로 다른 종류 3종 이상'),eff:{all:.1},need:(s)=>s.size>=3},
  {id:'mix4',name:__L('올스타 팀'),desc:__L('서로 다른 종류 4종'),eff:{all:.1},need:(s)=>s.size>=4},
  {id:'vet',name:__L('베테랑 팀'),desc:__L('출전 선수 평균 레벨 5 이상 (2명↑)'),eff:{power:.2,speed:.1},need:(s,lv,arr)=>arr.length>=2&&lv>=5}
];
const STATK={speed:__L('속도'),accel:__L('가속도'),power:__L('타격력'),turn:__L('방향 전환'),body:__L('몸싸움')};
function squadTypes(n){const a=[save.type];for(let i=1;i<n;i++)a.push(save.squad[i-1]||null);return a;}
function computeChem(n){
  const arr=squadTypes(n).filter(Boolean),set=new Set(arr),lvAvg=arr.reduce((a,k)=>a+(save.lv[k]|0),0)/Math.max(1,arr.length);
  const bonus={speed:0,accel:0,power:0,turn:0,body:0},active=[];
  for(const s of SYN)if(s.need(set,lvAvg,arr)){active.push(s.id);for(const k in s.eff){if(k==='all'){for(const q in bonus)bonus[q]+=s.eff[k];}else bonus[k]+=s.eff[k];}}
  for(const q in bonus)bonus[q]=Math.min(.5,bonus[q]);
  return{active,bonus,set,arr};
}
function teamOvr(n){
  // each card's OVR + team chemistry (every stat point is worth ~6 OVR) + 3 OVR when standing in its preferred position
  const ty=squadTypes(n),ch=computeChem(n),roles=ROLES[n]||[];if(!ch.arr.length)return 0;
  const sumB=Object.values(ch.bonus).reduce((a,v)=>a+v,0);let tot=0,cnt=0;
  ty.forEach((k,i)=>{if(!k)return;tot+=cardOvr(k,save.lv[k])+sumB*6+((PREF[k]&&PREF[k]===roles[i])?3:0);cnt++;});
  return Math.min(99,Math.round(tot/cnt));
}
// Enhancement level bonus (own team, assigned players only): +stat per level, special cooldown bonus at Lv5 / Lv10
function applyLevel(p,asg){
  if(p.goalie||asg===false)return;
  const lv=save.lv[p.type]|0,ms=mxInfo(p.type).lv,bk=(save.brk&&save.brk[p.type])|0;if(!lv&&!ms&&!bk)return;
  const add=lv*LV_STAT+ms*MS_STAT+bk*BRK.stat,st={};for(const k in p.ty.stats)st[k]=p.ty.stats[k]+add;
  p.ty=Object.assign({},p.ty,{stats:st});p.mass=1+st.body*.25;
  p.cdBonus=(lv>=10?.2:lv>=5?.1:0)+(ms>=10?.1:ms>=5?.05:0)+(bk>=3?BRK.cd[3]:0)+(bk>=5?BRK.cd[5]:0);
  p.tr={charge:ms>=3,precise:ms>=6,tough:ms>=9};     // mastery traits
}
// Team chemistry + position-fit bonus (own team, assigned players only)
function applyChem(p,asg){
  if(!asg||p.goalie||!G.cfg)return;
  const ch=computeChem(Math.max(1,G.cfg.size|0)),st=Object.assign({},p.ty.stats);
  for(const k in st)st[k]+=ch.bonus[k]||0;
  const pref=PREF[p.type];if(pref&&p.role===pref)for(const k in st)st[k]+=.1;
  p.ty=Object.assign({},p.ty,{stats:st});p.mass=1+st.body*.25;
}
function sqSetSlot(i,k){if(i===0){if(k&&save.types.includes(k))save.type=k;}else save.squad[i-1]=k||null;}
function sqAssign(i,k){if(!save.types.includes(k))return;sqSetSlot(i,k);sqSel=null;persist();SFX.ui();renderSquad();}
function sqSwap(i,j){
  const n=save.set.size,t=squadTypes(n);
  if((i===0&&!t[j])||(j===0&&!t[i])){flashMsg(__L('주장 자리는 비울 수 없어요!'));sqSel=null;renderSquad();return;}
  const a=t[i],b=t[j];sqSetSlot(i,b);sqSetSlot(j,a);sqSel=null;persist();SFX.ui();renderSquad();
}
function sqAuto(){
  // brute force: pick the mate cards that maximise the team OVR (chemistry + position fit included)
  const n=save.set.size,owned=save.types.slice(),old=save.squad.slice();let best=null,bs=-1;
  const slots=Math.max(0,n-1),pick=[];
  (function rec(i){
    if(i===slots){save.squad=old.slice();pick.forEach((k,j)=>{save.squad[j]=k;});const sc=teamOvr(n)*1000+computeChem(n).active.length*120+pick.reduce((a,k)=>a+cardOvr(k,save.lv[k]),0);if(sc>bs){bs=sc;best=pick.slice();}return;}
    for(const k of owned){pick[i]=k;rec(i+1);}
  })(0);
  save.squad=old.slice();if(best)best.forEach((k,j)=>{save.squad[j]=k;});
  sqSel=null;persist();SFX.passOk();renderSquad();
}
function slotPos(n,i){const f=FORM[n]||FORM[1];return[8+(f[i][0]+22)/19*80,50+f[i][1]/7*34];}
function renderSquad(){
  const board=$('#sqBoard');if(!board)return;
  const n=save.set.size;$('#ptsN').textContent=save.points;
  document.querySelectorAll('#sqSize button').forEach(b=>b.classList.toggle('on',+b.dataset.n===n));
  const bw=board.clientWidth||520,bh=board.clientHeight||260,cw=Math.floor(Math.max(44,Math.min(bh/1.42/1.75,bw/9,84)));
  const ty=squadTypes(n),ch=computeChem(n),roles=ROLES[n]||[];
  let h=__L('<div class="sq-gk">GK<br>자동</div>');
  // synergy links
  let ln='';
  const idxOf=k=>ty.findIndex(t=>t===k);
  for(const s of SYN){if(!ch.active.includes(s.id))continue;
    let pts=[];if(s.link){pts=s.link.map(idxOf).filter(i=>i>=0);}else{pts=ty.map((t,i)=>t?i:-1).filter(i=>i>=0);}
    for(let a=0;a<pts.length-1;a++){const pa=slotPos(n,pts[a]),pb=slotPos(n,pts[a+1]);ln+='<line x1="'+pa[0]+'" y1="'+pa[1]+'" x2="'+pb[0]+'" y2="'+pb[1]+'" stroke="#35e08a" stroke-width="1.6" stroke-linecap="round" vector-effect="non-scaling-stroke" style="filter:drop-shadow(0 0 4px #35e08a)"/>';}
  }
  h+='<svg class="sq-links" viewBox="0 0 100 100" preserveAspectRatio="none">'+ln+'</svg>';
  for(let i=0;i<n;i++){
    const k=ty[i],pos=slotPos(n,i),role=roles[i],sel=sqSel&&sqSel.kind==='slot'&&sqSel.i===i;
    h+='<div class="sq-slot'+(sel?' sel':'')+'" data-slot="'+i+'" style="left:'+pos[0]+'%;top:'+pos[1]+'%;--cw:'+cw+'px">';
    if(k){const fit=PREF[k]&&PREF[k]===role;h+=cardHtml(k,{role})+(i===0?'<div class="sq-cap">👑</div>':'')+'<div class="sq-role'+(fit?' fit':'')+'">'+POSN[role]+(fit?' ✓':'')+'</div>';}
    else h+=__L('<div class="sq-empty"><span>AI 자동</span><small>')+POSN[role]+'</small></div>';
    h+='</div>';
  }
  board.innerHTML=h;
  $('#sqOvr').textContent=teamOvr(n);
  const eff=Object.keys(ch.bonus).filter(q=>ch.bonus[q]>0).map(q=>STATK[q]+' +'+ch.bonus[q].toFixed(2)).join(' · ');
  let fitN=0;ty.forEach((k,i)=>{if(k&&PREF[k]&&PREF[k]===roles[i])fitN++;});
  $('#sqChem').innerHTML=__L('<div class="lbl" style="margin:0">팀 케미 (')+ch.active.length+'/'+SYN.length+')</div>'+(save.growth&&TYPES[save.growth.type]?__L('<div class="sq-sum" style="border:1.5px solid #7dffb0">📈 최근 성장: <b>')+TYPES[save.growth.type].name+__L('</b> 숙련 Lv.')+save.growth.from+' → '+save.growth.to+__L('<br>전 능력치 +')+((save.growth.to-save.growth.from)*MS_STAT).toFixed(2)+__L(' · 팀 OVR ')+save.growth.ov0+' → '+save.growth.ov1+'</div>':'')+SYN.map(s=>{const on=ch.active.includes(s.id);return '<div class="syn'+(on?' on':'')+'"><b>'+s.name+'</b>'+s.desc+'<br><small>'+Object.keys(s.eff).map(q=>(q==='all'?__L('전 능력치'):STATK[q])+' +'+s.eff[q]).join(' · ')+'</small></div>';}).join('')+'<div class="sq-sum">'+(eff?__L('팀 보너스: ')+eff:__L('활성 케미 없음'))+(fitN?__L('<br>포지션 일치 ')+fitN+__L('명 (각 전 능력치 +0.10)'):'')+__L('<br><small>보너스는 편성한 내 팀에만 적용돼요. AI 자동 슬롯은 제외.</small></div>')+__L('<div class="sq-sum"><small>숙련도는 경기에서 경험치로 올라요 (능력치 +')+MS_STAT+__L('/Lv, 특성 Lv3·6·9). 카드 강화 레벨과 별개예요.</small></div>');
  const bcw=Math.min(78,Math.max(54,Math.floor(((board.parentElement.clientWidth||600)-60)/6.6)));
  $('#sqBench').innerHTML=save.types.slice().sort((a,b)=>cardOvr(b,save.lv[b])-cardOvr(a,save.lv[a])).map(k=>{
    const sel=sqSel&&sqSel.kind==='bench'&&sqSel.k===k,cnt=ty.filter(t=>t===k).length;
    return '<div data-bk="'+k+'" class="'+(sel?'sel':'')+'" style="--cw:'+bcw+'px">'+cardHtml(k,{tag:cnt?__L('배치 ')+cnt:''})+'</div>';}).join('');
  board.querySelectorAll('[data-slot]').forEach(e=>{e.onclick=()=>{
    const i=+e.dataset.slot;
    if(sqSel&&sqSel.kind==='bench')sqAssign(i,sqSel.k);
    else if(sqSel&&sqSel.kind==='slot'){if(sqSel.i===i){sqSel=null;renderSquad();}else sqSwap(sqSel.i,i);}
    else{sqSel={kind:'slot',i};SFX.ui();renderSquad();}
  };});
  $('#sqBench').querySelectorAll('[data-bk]').forEach(e=>{e.onclick=()=>{
    const k=e.dataset.bk;
    if(sqSel&&sqSel.kind==='slot')sqAssign(sqSel.i,k);
    else if(sqSel&&sqSel.kind==='bench'&&sqSel.k===k){sqSel=null;renderSquad();}
    else{sqSel={kind:'bench',k};SFX.ui();renderSquad();}
  };});
  renderSqStyle();
}
document.querySelectorAll('#sqSize button').forEach(b=>{b.onclick=()=>{save.set.size=+b.dataset.n;sqSel=null;persist();SFX.ui();renderSquad();};});
$('#sqAuto').onclick=()=>{sqAuto();};
$('#sqClear').onclick=()=>{if(sqSel&&sqSel.kind==='slot'&&sqSel.i>0){sqSetSlot(sqSel.i,null);sqSel=null;persist();SFX.ui();renderSquad();}else flashMsg(__L('비울 팀원 슬롯을 먼저 선택하세요'));};

/* ---------- team colour / hat / trail / penguin unlocks (moved here from the removed 팀 선택 screen) ---------- */
function sqBuy(list,k,cost,apply){
  if(!save[list].includes(k)){
    if(save.points<cost){flashMsg(__L('포인트가 ')+(cost-save.points)+__L('P 부족해요 (가격 ')+cost+'P)');return;}
    save.points-=cost;save[list].push(k);flashMsg(__L('구매 완료! ✨ -')+cost+'P');
  }
  if(apply)apply();persist();SFX.ui();renderSquad();$('#ptsN').textContent=save.points;
}
function renderSqStyle(){
  const el=$('#sqStyle');if(!el)return;
  const cap=TYPES[save.type]||TYPES.basic;
  const chip=(attr,k,name,own,sel,cost,lockTxt)=>'<button class="sq-chip'+(sel?' on':'')+(own?'':' lock')+'" '+attr+'="'+k+'">'+name+'<small>'+(own?(sel?__L('사용 중'):__L('사용')):(lockTxt||'🔒 '+cost+'P'))+'</small></button>';
  let h=__L('<div class="sq-st-row"><span class="sq-st-l">주장</span><span>')+cap.name+__L(' · 특수 기술 <b>')+SPECIALS[cap.special]+'</b><span class="sp-d">'+spDesc(cap.special)+'</span><br><span class="tt-line">'+ttLine(save.type)+'</span>'+statGrid(save.type)+'</span></div>';
  h+=__L('<div class="sq-st-row"><span class="sq-st-l">팀 색</span><div class="sq-chips">')+['blue','red'].map(k=>chip('data-sqteam',k,k==='blue'?__L('🔵 블루'):__L('🔴 레드'),true,save.team===k)).join('')+'</div></div>';
  h+=__L('<div class="sq-st-row"><span class="sq-st-l">모자</span><div class="sq-chips">')+Object.keys(HATS).map(k=>chip('data-sqhat',k,HATS[k].name,save.hats.includes(k),save.hat===k,HATS[k].cost)).join('')+'</div></div>';
  h+=__L('<div class="sq-st-row"><span class="sq-st-l">트레일</span><div class="sq-chips">')+Object.keys(TRAILS).filter(k=>!TRAILS[k].pass||save.trails.includes(k)).map(k=>chip('data-sqtrail',k,TRAILS[k].name,save.trails.includes(k),save.trail===k,TRAILS[k].cost)).join('')+'</div></div>';
  const locked=Object.keys(TYPES).filter(k=>!save.types.includes(k));
  if(locked.length)h+=__L('<div class="sq-st-row"><span class="sq-st-l">펭귄 해금</span><div class="sq-chips">')+locked.map(k=>TYPES[k].exclusive?chip('data-sqlock',k,TYPES[k].name,false,false,0,__L('💻 개발자 티어 보상')):chip('data-sqbuy',k,TYPES[k].name,false,false,TYPES[k].cost)).join('')+'</div></div>';
  el.innerHTML=h;
  el.querySelectorAll('[data-sqteam]').forEach(b=>{b.onclick=()=>{save.team=b.dataset.sqteam;persist();SFX.ui();renderSquad();};});
  el.querySelectorAll('[data-sqhat]').forEach(b=>{b.onclick=()=>{const k=b.dataset.sqhat;buyConfirm(b,'hats',k,HATS[k].cost,()=>{save.hat=k;});};});
  el.querySelectorAll('[data-sqtrail]').forEach(b=>{b.onclick=()=>{const k=b.dataset.sqtrail;buyConfirm(b,'trails',k,TRAILS[k].cost,()=>{save.trail=k;});};});
  el.querySelectorAll('[data-sqbuy]').forEach(b=>{b.onclick=()=>{const k=b.dataset.sqbuy;buyConfirm(b,'types',k,TYPES[k].cost,null);};});
  el.querySelectorAll('[data-sqlock]').forEach(b=>{b.onclick=()=>flashMsg(__L('🔒 개발자 티어(레이팅 2100) 달성 또는 설정의 코드 입력으로 얻을 수 있어요'));});
}


/* ---------- scout center UI ---------- */
function oddsBox(){
  const e=gachaEff(),pk=pickupNow().type,o=GACHA.odds,hi=o[3]+o[4],ls=Math.round(o[4]/hi*100);
  const tiers=GRADES.map((G_,g)=>{const ks=tierTypes(g);return '<br><b class="rar-t g'+g+'">'+G_.n+'</b> '+o[g]+'%: '+ks.map(k=>TYPES[k].name.replace(__L(' 펭귄'),'')+' '+typeRate(k).toFixed(2)+'%'+(k===pk?__L(' (픽업)'):'')).join(' · ');}).join('');
  return __L('<details class="odds"><summary>📊 확률 정보 <small>')+fmtL(__L('신화 이상 실제 {a}% · 전설 {b}% · 픽업 {c}% (눌러서 전체 보기)'),{a:(e.p[3]+e.p[4]).toFixed(2),b:e.p[4].toFixed(2),c:pickupRate().toFixed(2)})+__L('</small></summary><small>화면의 숫자와 실제 추첨이 같은 설정값을 사용해요</small>')
    +'<br>'+fmtL(__L('뽑기 1회는 먼저 등급을 정하고, 그 등급의 펭귄 중 하나가 나와요. 펭귄마다 등급이 정해져 있어요.'),{})
    +__L('<br>등급 확률(천장 전): ')+GRADES.map((g,i)=>g.n+' '+o[i]+'%').join(' · ')
    +__L('<br>천장 포함 실제 확률: ')+GRADES.map((g,i)=>g.n+' '+e.p[i].toFixed(2)+'%').join(' · ')+fmtL(__L(' · 신화 이상 평균 {n}회에 1장'),{n:e.perEpic.toFixed(1)})
    +'<br>'+fmtL(__L('천장: {a}회차부터 신화 이상 확률이 회당 +{s}%p씩 오르고, {h}회차는 신화 이상 확정 (신화 {m}% / 전설 {l}%) · 신화 이상이 나오면 0회로 초기화 · 1회/10회 뽑기 공통'),{a:GACHA.softFrom+1,s:GACHA.softStep,h:GACHA.hard,m:100-ls,l:ls})
    +__L('<br>펭귄별 확률(1회당, 천장 전):')+tiers
    +'<br>'+fmtL(__L('픽업: 픽업 펭귄은 자기 등급이 나올 때 {p}%로 나오고, 나머지는 같은 등급 펭귄이 똑같이 나눠요 · 픽업 등급이 나왔는데 픽업이 아니면 다음 그 등급은 픽업 확정 (주간 배너가 바뀌어도 유지) · 픽업은 매주 월요일 0시에 교체'),{p:GACHA.pickShare})
    +'<br>'+fmtL(__L('10회 뽑기: 앞 9장에 {r} 이상이 없으면 10번째는 {r} 이상 보장'),{r:GRADES[GACHA.tenMin].n})
    +__L('<br>중복 카드: 같은 종류 카드로 보관 → 강화·돌파·합성 재료 · 종류별 ')+GACHA.dupCap+__L('장까지 보관 (넘치면 ')+GACHA.dupOverflow.map((p,i)=>GRADES[i].n+' '+p+'P').join('·')+__L(' 자동 환급)')
    +__L('<br>처음 얻은 펭귄은 Lv0으로 해금돼요 · 현금 결제 없음, 경기로 번 포인트만 사용</details>');
}
function renderScout(){
  $('#ptsN').textContent=save.points;
  document.querySelectorAll('#scTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===scTab));
  const el=$('#scBody'),sc=save.scout;let h='';
  if(scMsg)h+='<div class="odds" style="text-align:center;font-size:15px">'+scMsg+'</div>';
  if(scTab==='pull'){
    h+=scPullHtml();
  }else if(scTab==='enh'){
    h+=scEnhHtml();
  }else if(scTab==='fuse'){
    const g=fz.g,d=FUSE_DEF[g];
    // drop selections that are no longer available
    const cnt={};fz.sel=fz.sel.filter(k=>{cnt[k]=(cnt[k]||0)+1;return cnt[k]<=save.cc[k][g];});
    h+='<div class="chips">'+[0,1,2,3].map(i=>'<button class="btn small" data-act="fzg" data-g="'+i+'" style="border-color:'+GRADES[i].c+';'+(i===g?'background:rgba(98,212,255,.35)':'')+'">'+GRADES[i].n+' → '+GRADES[i+1].n+'</button>').join('')+'</div>';
    h+='<div class="lbl" style="text-align:center">'+fmtL(__L('같은 등급 펭귄 카드 3장을 골라 합성해요 → {r} 펭귄 1장 · 성공 {p}% · {c}P · 실패하면 1장만 돌려받아요'),{r:GRADES[g+1].n,p:d.rate,c:d.cost})+'</div>';
    h+='<div class="fz-slots">'+[0,1,2].map(i=>fz.sel[i]?'<div class="fz-slot fill" data-act="fzrm" data-i="'+i+'" style="--cw:84px">'+cardHtml(fz.sel[i],{g,lv:0})+'</div>':'<div class="fz-slot" style="--cw:84px">+</div>').join('')+'</div>';
    const rem=Object.assign({},cnt);let inv='';
    for(const k of Object.keys(TYPES)){const have=save.cc[k][g]-(cnt[k]||0);if(have>0)inv+='<div data-act="fzadd" data-k="'+k+'" style="--cw:72px;cursor:pointer">'+cardHtml(k,{g,lv:0,count:have})+'</div>';}
    h+=__L('<div class="lbl" style="text-align:center">보유 ')+GRADES[g].n+__L(' 카드 (')+cardTotal(g)+__L('장) — 눌러서 재료로 넣기</div><div class="cardrow">')+(inv||__L('<small>선택 가능한 카드가 없어요 (뽑기로 모아 보세요)</small>'))+'</div>';
    h+=__L('<div class="row"><button class="btn small" data-act="fzauto">자동 선택</button><button class="btn small primary" data-act="fzgo"')+(fz.sel.length===3&&save.points>=d.cost?'':' disabled')+__L(' style="font-size:19px">✨ 합성하기</button></div>');
    h+=__L('<div class="odds"><b>합성 확률</b><br>')+FUSE_DEF.map((x,i)=>GRADES[i].n+'→'+GRADES[i+1].n+' '+x.rate+'% ('+x.cost+'P)').join(' · ')+__L('<br>새로 나오는 펭귄은 그 등급 안에서 뽑기와 같은 확률이에요 (픽업 포함).</div>');
  }else{
    h+=scDexHtml();
  }
  el.innerHTML=h;
  el.querySelectorAll('[data-act]').forEach(b=>{b.onclick=()=>{SFX.init();SFX.ui();const a=b.dataset.act;
    if(scAct(a,b))return;
    if(a==='pull1')doPull(1);else if(a==='pull10')doPull(10);
    else if(a==='enh')doEnhance(b.dataset.k,+b.dataset.g);
    else if(a==='fzg'){fz.g=+b.dataset.g;fz.sel=[];renderScout();}
    else if(a==='fzadd'){if(fz.sel.length<3){fz.sel.push(b.dataset.k);renderScout();}}
    else if(a==='fzrm'){fz.sel.splice(+b.dataset.i,1);renderScout();}
    else if(a==='fzauto'){fz.sel=autoFuseSel(fz.g)||[];if(!fz.sel.length)flashMsg(__L('같은 등급 카드가 3장 필요해요!'));renderScout();}
    else if(a==='fzgo')doFuse(fz.g,fz.sel.slice());};});
  scWire(el);
}
document.querySelectorAll('#scTabs button').forEach(b=>{b.onclick=()=>{SFX.ui();scTab=b.dataset.t;scMsg='';renderScout();};});

/* ================= HYPE: goal feel, combos, tension, replay, mastery XP, goals, records ================= */
const COMBO_T=6,CB_CD={pass:1.5,passShot:2,power:1.6,steal:2.5,save:1.5,goal:0};
const MX=10,MS_STAT=.03,XP_NEED=lv=>50+30*lv;
const TRAITS=[{lv:3,name:__L('빠른 충전'),desc:__L('슛 충전 속도 +12%')},{lv:6,name:__L('정밀 슛'),desc:__L('슛 오차 -40%')},{lv:9,name:__L('불굴'),desc:__L('넘어진 뒤 회복 -30%')}];
function mxInfo(k){let xp=(save.xp&&save.xp[k])|0,lv=0;while(lv<MX&&xp>=XP_NEED(lv)){xp-=XP_NEED(lv);lv++;}return{lv,cur:xp,need:lv>=MX?0:XP_NEED(lv)};}
function grantXp(k,amt){const b=mxInfo(k);save.xp[k]=Math.min(99999,(save.xp[k]|0)+Math.max(0,amt));const a=mxInfo(k);return{type:k,gain:amt,from:b.lv,to:a.lv,b,a};}
const vib=p=>{if(!save.set.vib)return;try{if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;if(navigator.vibrate)navigator.vibrate(p);}catch(e){}};
function hypeNew(){return{combo:{n:0,t:0,max:0},cbCd:{},streak:0,maxStreak:0,conceded:0,recv:null,rec:[],recAcc:0,passes:0,power:0,teamPlay:0,clutch:0,saves:0,trailLate:false,tl:0,lastSec:-1,otShown:false,ringT:0,scorer:null,lastPass:'',lastPassT:-9,flagC3:false,flagS2:false,doneAtStart:null};}

/* ---------- toast / big late-game number ---------- */
function hypeToast(txt){const t=$('#toast');t.textContent=txt;t.classList.remove('on');void t.offsetWidth;t.classList.add('on');clearTimeout(hypeToast.t);hypeToast.t=setTimeout(()=>t.classList.remove('on'),1800);}
function lateNum(n){const e=$('#late');e.textContent=n;e.classList.remove('on');void e.offsetWidth;e.classList.add('on');SFX.tick(n<=3?3:0);vib(n<=3?[25]:[8]);}

/* ---------- combo ---------- */
function cbAdd(kind,label){
  const h=G.hype;if(!h||!G.mine||!G.cfg||G.cfg.mode==='demo'||G.state==='over')return false;
  if(G.state!=='play'&&G.state!=='goal')return false;
  const now=G.t;if(CB_CD[kind]&&h.cbCd[kind]&&now-h.cbCd[kind]<CB_CD[kind])return false;h.cbCd[kind]=now;
  const c=h.combo;if(c.t<=0)c.n=0;c.n++;c.t=COMBO_T;c.max=Math.max(c.max,c.n);
  if(c.n>=3&&!h.flagC3){h.flagC3=true;gp('combo3',1);}
  const n=c.n,e=$('#combo');if(n>=5&&!(h.feverT>0))feverStart();
  $('#cbK').textContent=label||'';
  $('#cbN').textContent=n>=8?'MAX COMBO!':n>=5?'SUPER COMBO!':n>=2?'COMBO x'+n:'';
  e.className='on '+(n>=8?'c8':n>=5?'c5':n>=3?'c3':n>=2?'c2':'c1');void e.offsetWidth;e.classList.add('hpop');
  if(n>=2){(n>=5?SFX.shot(1):SFX.tick(Math.min(3,Math.floor(n/2))));if(n>=5)vib([20,20,30]);}
  return true;
}
function comboHide(){const e=$('#combo');e.className='';}
function comboBar(){const h=G.hype,e=$('#cbBar');if(!h)return;if(h.combo.t>0&&h.combo.n>=2)e.style.width=(h.combo.t/COMBO_T*100)+'%';}

/* ---------- goals (daily / long term) ---------- */
const GDEFS={
  match:{name:__L('경기 1회 완료'),key:'matches',n:1,pts:15,xp:20},
  pass5:{name:__L('패스 5회 성공'),key:'passes',n:5,pts:20,xp:25},
  power3:{name:__L('강슛 3회 사용'),key:'power',n:3,pts:20,xp:25},
  goal2:{name:__L('2골 이상 득점'),key:'goals',n:2,pts:25,xp:30},
  tourwin:{name:__L('토너먼트에서 한 경기 승리'),key:'tourWin',n:1,pts:30,xp:40},
  teamplay:{name:__L('패스 후 슛으로 득점 (TEAM PLAY)'),key:'teamPlay',n:1,pts:25,xp:30},
  typegame:{name:__L('지정 펭귄으로 경기 완료'),key:'typeGame',n:1,pts:20,xp:30,typed:true},
  winmid:{name:__L('보통 이상 난이도에서 승리'),key:'winMid',n:1,pts:30,xp:35},
  combo3:{name:__L('콤보 x3 달성'),key:'combo3',n:1,pts:25,xp:30},
  streak2:{name:__L('연속 2골 득점'),key:'streak2',n:1,pts:25,xp:30},
  cleanwin:{name:__L('무실점으로 승리'),key:'cleanWin',n:1,pts:30,xp:35},
  comeback:{name:__L('역전승 하기'),key:'comeback',n:1,pts:35,xp:40},
  onetimer:{name:__L('원타이머 슛 2회'),key:'oneTimer',n:2,pts:20,xp:25}
};
const LDEFS=[
  {id:'L1',name:__L('펭귄 5종 수집'),n:5,pts:100,prog:()=>save.types.filter(k=>!TYPES[k].exclusive).length},
  {id:'L2',name:__L('누적 50골 달성'),n:50,pts:60,prog:()=>save.cum.goals},
  {id:'L3',name:__L('누적 20승 달성'),n:20,pts:80,prog:()=>save.cum.wins},
  {id:'L4',name:__L('최장 콤보 8 (MAX COMBO) 달성'),n:8,pts:70,prog:()=>save.rec.maxCombo},
  {id:'L5',name:__L('숙련도 Lv10 펭귄 만들기'),n:MX,pts:100,prog:()=>Math.max(...Object.keys(TYPES).map(k=>mxInfo(k).lv))},
  {id:'L6',name:__L('토너먼트 우승 3회'),n:3,pts:120,prog:()=>save.stats.tourClears},
  {id:'L7',name:__L('CLUTCH GOAL 3회'),n:3,pts:80,prog:()=>save.cum.clutch},
  {id:'L8',name:__L('누적 패스 성공 200회'),n:200,pts:70,prog:()=>save.cum.passes},
  {id:'L9',name:__L('어려움 난이도 5승'),n:5,pts:120,prog:()=>save.cum.winHard},
  {id:'L10',name:__L('일일 목표 15개 완료'),n:15,pts:100,prog:()=>save.cum.dailyDone}
];
const ro=n=>{const c=n.charCodeAt(n.length-1)-0xac00;return c>=0&&c<11172&&c%28!==0&&c%28!==8?__L('으로'):__L('로');};
function gName(g){const d=GDEFS[g.id];return g.t&&d.typed?TYPES[g.t].name+ro(TYPES[g.t].name)+__L(' 경기 완료'):d.name;}
function dayNum(){const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);}
function goalsEnsure(){
  const g=save.goals,now=Date.now();let tamper=false,changed=false;
  if(save.clk&&now<save.clk-300000)tamper=true;                       // clock moved backwards: no refresh
  g.list=g.list.filter(x=>GDEFS[x.id]);
  const dn=dayNum();
  if(!tamper&&(g.list.length<3||(dn>g.day&&now-g.ts>=12*3600*1000))){   // new set at most once per 12h of real elapsed time
    let s=((dn+7)*2654435761)>>>0;const rnd=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
    const ids=Object.keys(GDEFS),pick=[];
    while(pick.length<3){const id=ids[Math.floor(rnd()*ids.length)];if(!pick.includes(id))pick.push(id);}
    g.list=pick.map(id=>{const o={id,t:'',p:0,c:false};if(GDEFS[id].typed){const own=save.types;o.t=own[Math.floor(rnd()*own.length)];}return o;});
    g.day=dn;g.ts=now;changed=true;
  }
  if(now>save.clk){save.clk=now;changed=true;}
  if(changed)persist();
  return{tamper};
}
function gp(key,amt,t){
  if(G.view==='game'&&G.cfg&&G.cfg.mode==='practice')return;
  amt=amt||1;if(save.cum[key]!==undefined)save.cum[key]=Math.min(999999,save.cum[key]+amt);
  goalsEnsure();
  for(const g of save.goals.list){const d=GDEFS[g.id];if(d.key!==key||g.c)continue;if(d.typed&&g.t!==t)continue;g.p=Math.min(d.n,g.p+amt);}
}
function claimGoal(i){
  goalsEnsure();const g=save.goals.list[i];if(!g)return;const d=GDEFS[g.id];
  if(g.c||g.p<d.n){return;}
  g.c=true;save.points+=d.pts;passAdd(PASS.earn.daily);const r=grantXp(save.type,d.xp);save.cum.dailyDone++;persist();SFX.win();vib([30,30,60]);
  hypeToast('+'+d.pts+'P · +'+d.xp+'XP · 🐟+'+passGain(PASS.earn.daily)+(r.to>r.from?' · LEVEL UP!':''));$('#ptsN').textContent=save.points;renderGoals();hypeMenuRefresh();
}
function claimLong(id){
  const L=LDEFS.find(x=>x.id===id);if(!L||save.long[id]||L.prog()<L.n)return;
  save.long[id]=true;save.points+=L.pts;persist();SFX.win();vib([30,30,60]);hypeToast('+'+L.pts+'P');$('#ptsN').textContent=save.points;renderGoals();hypeMenuRefresh();
}
function claimable(){goalsEnsure();let n=0;for(const g of save.goals.list)if(!g.c&&g.p>=GDEFS[g.id].n)n++;for(const L of LDEFS)if(!save.long[L.id]&&L.prog()>=L.n)n++;return n;}
function hypeMenuRefresh(){
  try{
    goalsEnsure();const n=claimable(),b=$('#goalBadge');if(b){const an=save.achNew|0;b.textContent=n?n:an?'NEW':'';b.style.display=n||an?'inline-block':'none';b.title=n?__L('받을 보상 ')+n+__L('개'):an?__L('새 업적 ')+an+__L('개'):'';}
    const m=$('#menuGoals');if(m){const L=save.goals.list,isR=g=>!g.c&&g.p>=GDEFS[g.id].n,rd=L.filter(isR).length,ach=L.filter(g=>g.c||isR(g)).length,nx=L.find(g=>!g.c&&g.p<GDEFS[g.id].n);
      m.innerHTML=L.length?'<i class="ic">'+HM_IC.goals+__L('</i><span class="mg-t"><b>오늘의 목표</b><span class="mg-seg">')+L.map(g=>{const d=GDEFS[g.id];return '<i class="'+(g.c?'d':isR(g)?'r':'p')+'" style="--w:'+Math.round(Math.min(1,g.p/d.n)*100)+'%"></i>';}).join('')+'</span></span>'
        +'<span class="mg-s">'+(rd?__L('보상을 받을 수 있어요'):nx?gName(nx)+' '+Math.min(nx.p,GDEFS[nx.id].n)+'/'+GDEFS[nx.id].n:__L('오늘 목표를 모두 끝냈어요. 내일 새 목표가 나와요'))+'</span>'
        +'<span class="mg-c'+(rd?' rdy':'')+'">'+(rd?__L('보상 받기'):ach+'/'+L.length)+'<i class="chev">'+HM_IC.chev+'</i></span>':'';
      m.setAttribute('aria-label',__L('오늘의 목표 ')+ach+'/'+L.length+__L(' 달성')+(rd?__L(', 받을 보상 ')+rd+__L('개'):'')+(nx?__L(', 다음 목표 ')+gName(nx):'')+__L('. 목표 화면 열기'));}
    passMenu();
  }catch(e){}
}

/* ---------- records ---------- */
function recUpdate(win,ms,os,cfg){
  const h=G.hype,r=save.rec,out=[];
  const chk=(k,v,label)=>{if(v>r[k]){if(v>0)out.push(label);r[k]=Math.min(9999,v);}};
  chk('maxGoals',ms,__L('최다 득점'));chk('maxStreak',h.maxStreak,__L('최다 연속 득점'));chk('maxCombo',h.combo.max,__L('최장 콤보'));chk('maxMargin',win?ms-os:0,__L('최고 득점 차이'));chk('maxPass',h.passes,__L('최다 패스 성공'));
  const d=cfg.diff||'normal';if(r.diff[d]){r.diff[d][1]++;if(win)r.diff[d][0]++;}
  const k=save.type;if(!r.type[k])r.type[k]=[0,0];r.type[k][0]++;r.type[k][1]+=ms;
  return out;
}

/* ---------- end of match: XP, goals, records ---------- */
function hypeMatchEnd(win,draw,ms,os,cfg){
  const h=G.hype,diff=cfg.diff||'normal',out={xp:[],recs:[],goalsDone:[],tags:[],cb:h.combo.max};
  const size=Math.max(1,cfg.size|0),ov0=teamOvr(size),xm={easy:.8,normal:1,hard:1.25}[diff]||1;
  const base=(win?30:draw?18:12)+ms*8+h.passes*2+Math.min(30,h.combo.max*4);
  const share={};squadTypes(size).forEach((k,i)=>{if(k)share[k]=Math.max(share[k]||0,i===0?1:.5);});
  let lead=null;
  for(const k of Object.keys(share)){const r=grantXp(k,Math.round(base*xm*share[k]));out.xp.push(r);if(r.to>r.from&&(!lead||k===save.type))lead=r;}
  if(lead)save.growth={type:lead.type,from:lead.from,to:lead.to,ov0,ov1:teamOvr(size)};
  gp('matches',1);gp('typeGame',1,save.type);
  if(win){gp('wins',1);if(diff!=='easy')gp('winMid',1);if(diff==='hard')gp('winHard',1);if(cfg.mode==='tour')gp('tourWin',1);}
  out.recs=recUpdate(win,ms,os,cfg);
  if(win&&diff==='hard')out.tags.push('GIANT KILLER!');
  if(win&&h.trailLate)out.tags.push('COMEBACK WIN!');
  if(win&&h.conceded===0&&ms>0){out.tags.push('CLEAN SHEET');gp('cleanWin',1);}
  if(win&&h.wasBehind){gp('comeback',1);if(!h.trailLate)out.tags.push('COMEBACK WIN!');}
  goalsEnsure();const before=h.doneAtStart||[];
  save.goals.list.forEach((g,i)=>{if(g.p>=GDEFS[g.id].n&&!g.c&&!before[i])out.goalsDone.push(gName(g));});
  const nx=save.goals.list.find(g=>!g.c&&g.p<GDEFS[g.id].n);
  out.next=nx?__L('다음 목표: ')+gName(nx)+' ('+nx.p+'/'+GDEFS[nx.id].n+')':__L('오늘의 목표를 모두 달성했어요! 🎉');
  return out;
}
async function hypeResultAnim(){
  try{
    const wait=ms=>new Promise(r=>setTimeout(r,ms));
    for(const e of [...document.querySelectorAll('#rSub .cu')]){
      const to=+e.dataset.to,t0=performance.now(),d=Math.min(850,280+to*9);
      await new Promise(res=>{const f=now=>{const k=Math.min(1,(now-t0)/d);e.textContent=Math.round(to*k*(2-k));if(k<1)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});
      SFX.tick(0);await wait(120);
    }
    for(const row of [...document.querySelectorAll('#rSub .xprow')]){
      const bar=row.querySelector('.xpb i'),lv=row.dataset.lv==='1',fin=+row.dataset.a;
      bar.style.width=(lv?100:fin)+'%';await wait(750);
      if(lv){const fx=row.querySelector('.lvfx');SFX.win();vib([30,30,80]);row.querySelector('.pc').classList.add('lvup');fx.classList.add('on');
        bar.style.transition='none';bar.style.width='0%';void bar.offsetWidth;bar.style.transition='';bar.style.width=fin+'%';await wait(700);}
    }
    const nr=document.querySelector('#rSub .newrec');if(nr){nr.classList.add('on');SFX.win();vib([30,40,30,40,120]);}
  }catch(e){}
}

/* ---------- goals / records screen ---------- */
let gTab='day';
function renderGoals(){
  const el=$('#gBody');if(!el)return;$('#ptsN').textContent=save.points;
  document.querySelectorAll('#gTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===gTab));
  const info=goalsEnsure();let h='';
  if(gTab==='day'){
    h+=__L('<div class="lbl" style="text-align:center">오늘의 목표 · 완료하면 아래 버튼으로 보상을 받아요 (한 번만 수령)</div>');
    save.goals.list.forEach((g,i)=>{const d=GDEFS[g.id],ok=g.p>=d.n;
      h+='<div class="grow'+(g.c?' done':ok?' rdy':'')+'"><div class="gi"><b>'+gName(g)+'</b><div class="pbar"><i style="width:'+(g.p/d.n*100)+'%"></i></div><small>'+fmtL('{p} / {n} · ⭐{a}P · {x}XP · 🐟{s}',{p:g.p,n:d.n,a:d.pts,x:d.xp,s:passGain(PASS.earn.daily)})+'</small></div>'+(g.c?__L('<span class="gbtn">수령 완료 ✔</span>'):ok?'<button class="btn small primary" data-claim="'+i+__L('">🎁 받기</button>'):__L('<span class="gbtn">진행 중</span>'))+'</div>';});
    h+=__L('<div class="odds">목표는 하루에 한 번 새로 나와요. 기기 날짜를 되돌리면 갱신되지 않아요')+(info.tamper?__L(' <b>(현재 시계가 되돌려진 것으로 감지됨)</b>'):'')+__L('.<br>오프라인 게임이라 날짜 변경을 완전히 막을 수는 없어서, 보상은 작게 설정했어요.</div>');
  }else if(gTab==='long'){
    h+=__L('<div class="lbl" style="text-align:center">장기 목표 · 천천히 도전해 보세요</div>');
    for(const L of LDEFS){const p=Math.min(L.n,L.prog()),ok=p>=L.n,c=save.long[L.id];
      h+='<div class="grow'+(c?' done':ok?' rdy':'')+'"><div class="gi"><b>'+L.name+'</b><div class="pbar"><i style="width:'+(p/L.n*100)+'%"></i></div><small>'+p+' / '+L.n+__L(' · 보상 ⭐')+L.pts+'P</small></div>'+(c?__L('<span class="gbtn">수령 완료 ✔</span>'):ok?'<button class="btn small primary" data-lclaim="'+L.id+__L('">🎁 받기</button>'):__L('<span class="gbtn">진행 중</span>'))+'</div>';}
  }else if(gTab==='ach'){h+=achHtml();if(save.achNew){save.achNew=0;persist();hypeMenuRefresh();}
  }else{
    const r=save.rec,dn={easy:__L('쉬움'),normal:__L('보통'),hard:__L('어려움')};
    h+='<div class="recgrid">'+[[__L('최다 득점'),r.maxGoals+__L('골')],[__L('최다 연속 득점'),r.maxStreak+__L('골')],[__L('최장 콤보'),'x'+r.maxCombo],[__L('최고 득점 차이'),r.maxMargin+__L('점',"m")],[__L('최다 패스 성공'),r.maxPass+__L('회')],[__L('토너먼트 최고 성적'),r.tourBest>=3?__L('우승 🏆'):r.tourBest?r.tourBest+__L('라운드 클리어'):__L('기록 없음')]].map(x=>'<div class="rec"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div>';
    h+=__L('<div class="lbl" style="text-align:center;margin-top:8px">난이도별 승률</div><div class="recgrid">')+['easy','normal','hard'].map(d=>{const a=r.diff[d];return '<div class="rec"><small>'+dn[d]+'</small><b>'+(a[1]?Math.round(a[0]/a[1]*100):0)+'%</b><small>'+a[0]+__L('승 / ')+a[1]+__L('경기</small></div>');}).join('')+'</div>';
    h+=__L('<div class="lbl" style="text-align:center;margin-top:8px">펭귄별 경기 · 득점 · 숙련도</div><div class="cardrow">')+Object.keys(TYPES).filter(k=>save.types.includes(k)).map(k=>{const a=r.type[k]||[0,0],m=mxInfo(k);return '<div style="--cw:74px;text-align:center">'+cardHtml(k)+'<div style="font-size:12px;margin-top:4px">'+a[0]+__L('경기 · ')+a[1]+__L('골<br>숙련 Lv.')+m.lv+(m.need?' ('+m.cur+'/'+m.need+')':' MAX')+'</div></div>';}).join('')+'</div>';
  }
  el.innerHTML=h;
  el.querySelectorAll('[data-claim]').forEach(b=>{b.onclick=()=>claimGoal(+b.dataset.claim);});
  el.querySelectorAll('[data-lclaim]').forEach(b=>{b.onclick=()=>claimLong(b.dataset.lclaim);});
}
document.querySelectorAll('#gTabs button').forEach(b=>{b.onclick=()=>{SFX.ui();gTab=b.dataset.t;renderGoals();};});

/* ---------- goal celebration ---------- */
let gRing=null,sRing=null;
{
  const mk=(r0,r1)=>{const m=new T.Mesh(new T.RingGeometry(r0,r1,56),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,depthTest:false,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.08;m.visible=false;scene.add(m);return m;};
  gRing=mk(.9,1.15);sRing=mk(1.0,1.35);
}
function hypeBanner(main,sub,tier,key){
  const b=$('#banner'),s=$('#bannerSub');b.textContent=main;b.className='tier'+tier+(key==='blue'?' b':key==='red'?' r':'');void b.offsetWidth;b.classList.add('on');fitBanner();
  s.innerHTML=sub.map(t=>'<span>'+t+'</span>').join('');s.className=sub.length?'on':'';
  clearTimeout(hypeBanner.t);hypeBanner.t=setTimeout(()=>{b.classList.remove('on');s.className='';},tier>=1?2800:1700);
}
function classifyGoal(tm,sh){
  const h=G.hype,pk=G.puck,cfg=G.cfg,tags=[];
  if(!G.mine||tm!==G.mine||!cfg||cfg.mode==='demo')return{tags,clutch:false,shooter:null};
  const shooter=sh&&sh.by&&sh.by.team===tm?sh.by:null,og=tm.opp.goalie;
  const fresh=!!(shooter&&G.t-sh.t<5&&!sh.deflected);
  if(fresh&&sh.charge>=.7)tags.push('POWER SHOT!');
  if(fresh&&Math.abs(pk.z)>=GW-1.05)tags.push('PERFECT AIM!');
  if(fresh&&og&&Math.abs(og.z-pk.z)>=2.1)tags.push('NICE BREAKAWAY!');
  if(fresh&&h.recv&&h.recv.p===shooter&&sh.t>=h.recv.t&&sh.t-h.recv.t<3.2)tags.push('TEAM PLAY!');
  if(fresh&&sh.oneT)tags.push('ONE-TIMER!');
  if(fresh&&sh.combo)tags.push('COMBO SHOT!');
  if(fresh&&sh.fire)tags.push('FIRE SHOT!');
  if(G.golden2)tags.push('GOLDEN +2!');
  if(h.feverT>0){tags.push('FEVER GOAL!');h.feverGoals=(h.feverGoals||0)+1;}
  if(shooter){h.sg=h.sg||{};h.sg[shooter.idx]=(h.sg[shooter.idx]||0)+1;if(h.sg[shooter.idx]===3)tags.push('HAT TRICK!');}
  if(h.wasBehind&&tm.score===tm.opp.score+1)tags.push('COMEBACK!');
  if(fresh&&sh.x0!==undefined&&Math.hypot(tm.dir*W-sh.x0,sh.z0)>16)tags.push('LONG SHOT!');
  if(h.concT&&G.t-h.concT<15)tags.push('ANSWER GOAL!');
  if(realMatch()){if(tags.includes('HAT TRICK!'))save.cum.hatTrick++;if(tags.includes('POWER SHOT!'))save.cum.powerGoal++;if(G.golden2)save.cum.golden++;}
  rulesTags(tm,tags);
  const late=!!(cfg.time&&((!G.ot&&G.timeLeft<=10)||G.ot)),clutch=late&&(tm.score-1)<=tm.opp.score;
  if(G.ot)tags.push('OT WINNER!');
  else if(clutch){tags.push('CLUTCH GOAL!');tags.push(tm.score===tm.opp.score?'EQUALIZER!':'GO-AHEAD!');}
  if(h.streak>=2)tags.push('HOT STREAK!');
  return{tags,clutch,shooter};
}
function hypeGoal(tm,sh){
  const h=G.hype,cfg=G.cfg,mine=!!(G.mine&&tm===G.mine),real=cfg&&cfg.mode!=='demo',key=tm.key;
  if(real&&G.mine){
    if(mine){h.streak++;h.maxStreak=Math.max(h.maxStreak,h.streak);}
    else{h.streak=0;h.conceded++;h.concT=G.t;if(h.combo.n>=2&&h.combo.t>0)hypeToast(__L('실점으로 콤보가 끊겼어요'));h.combo.n=0;h.combo.t=0;comboHide();if(tm.score>tm.opp.score)h.wasBehind=true;}
  }
  const info=classifyGoal(tm,sh);let main='GOAL!',sub=[],tier=0;
  const t=info.tags;
  if(t.includes('OT WINNER!')){main='OT WINNER!';sub=t.filter(x=>x!==main);tier=4;}
  else if(t.includes('EQUALIZER!')){main='EQUALIZER!';sub=t.filter(x=>x!==main);tier=Math.min(4,3+(sub.length>1?1:0));}
  else if(t.includes('CLUTCH GOAL!')){main='CLUTCH GOAL!';sub=t.filter(x=>x!==main);tier=Math.min(4,3+(sub.length>1?1:0));}
  else if(t.includes('HAT TRICK!')){main='HAT TRICK!';sub=t.filter(x=>x!==main);tier=Math.max(2,Math.min(3,1+sub.length));}
  else if(t.length>=3){main='INCREDIBLE!!';sub=t;tier=3;}
  else if(t.length===2){main='SUPER GOAL!';sub=t;tier=2;}
  else if(t.length===1){main=t[0];tier=1;}
  if(mine&&real){
    gp('goals',1);if(t.includes('TEAM PLAY!')){h.teamPlay++;gp('teamPlay',1);}if(info.clutch){h.clutch++;gp('clutch',1);}
    if(h.streak>=2&&!h.flagS2){h.flagS2=true;gp('streak2',1);}
    cbAdd('goal','GOAL');
  }
  // --- feel: hit stop, shake, flash, rings, particles, sound ---
  const oppG=!!(G.mine&&!mine&&real);
  G.hitStop=Math.max(G.hitStop||0,oppG?0:tier?.05+.035*tier:.03);
  G.cam.shake=Math.max(G.cam.shake,oppG?.3:.45+.25*tier);
  const col=key==='blue'?[.35,.65,1]:[1,.38,.45],gx=tm.dir*W;
  const fl=$('#gflash');fl.style.setProperty('--gc',key==='blue'?'rgba(80,150,255,':'rgba(255,90,110,');fl.style.setProperty('--ga',(oppG?.14:.22+.1*tier).toFixed(2));fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on');
  gRing.position.set(gx>0?W-.5:-W+.5,.08,0);gRing.material.color.setRGB(col[0],col[1],col[2]);h.ringT=.95;
  for(let i=0;i<(oppG?30:50+tier*35);i++){const a=rnd(TAU),s=rnd(3,11)+tier*1.5;emit(gx,rnd(.6,3),rnd(-GW,GW),Math.cos(a)*s*(gx>0?-1:1)*.7,rnd(2,9),Math.sin(a)*s,rnd(.8,1.6),rnd(.2,.5),col[0],col[1],col[2]);}
  SFX.bump(oppG?.6:1);if(oppG)SFX.lose();else SFX.goal();if(tier>=2)SFX.win();if(tier>=1)vib([40,30,70]);
  hypeBanner(main,sub,tier,key);
  if(real&&G.mine&&tm.score===tm.opp.score&&!t.includes('EQUALIZER!'))hypeToast(__L('⚖️ 동점! ')+tm.score+' : '+tm.opp.score);
  const scp=$(key==='blue'?'#sB':'#sR');scp.classList.remove('hpop');void scp.offsetWidth;scp.classList.add('hpop');
  if(info.shooter){h.scorer=info.shooter;popAt(TYPES[info.shooter.type].name+'!',info.shooter.x,2.8,info.shooter.z);}
  // --- slow-motion replay for special goals ---
  G.replay=null;G.goalT0=G.stateT;
  if(mine&&real&&tier>=1&&cfg.mode!=='practice'&&h.rec.length>24){
    const frames=h.rec.slice(-110);hypeSnap(frames);for(let i=0;i<12;i++)frames.push(frames[frames.length-1]);
    const speed=.55,dur=frames.length/(60*speed);
    G.replay={frames,pos:0,speed,start:.95,active:false,done:false,skip:false,dur};
    G.stateT=.95+dur+1.2;G.goalT0=G.stateT;
  }else G.stateT=real?(mine&&tier>=1?3.0:2.0):2.2;
}

/* ---------- replay recording / playback ---------- */
function hypeSnap(arr){const pk=G.puck;arr.push({k:[pk.x,pk.z],p:G.pengs.map(p=>[p.x,p.z,p.heading,p.vx,p.vz])});}
function hypeRecord(dt){
  const h=G.hype;h.recAcc+=dt;let n=0;
  while(h.recAcc>=1/60&&n<3){h.recAcc-=1/60;hypeSnap(h.rec);n++;}
  if(h.recAcc>.2)h.recAcc=0;
  if(h.rec.length>170)h.rec.splice(0,h.rec.length-150);
}
function hypeReplayApply(rp){
  const n=rp.frames.length,i=Math.min(n-1,Math.floor(rp.pos)),f=rp.pos-i,A=rp.frames[i],B=rp.frames[Math.min(n-1,i+1)],pk=G.puck;
  pk.x=A.k[0]+(B.k[0]-A.k[0])*f;pk.z=A.k[1]+(B.k[1]-A.k[1])*f;pk.vx=(B.k[0]-A.k[0])*60;pk.vz=(B.k[1]-A.k[1])*60;pk.ox=pk.x;pk.oz=pk.z;
  G.pengs.forEach((p,j)=>{const a=A.p[j],b=B.p[j];if(!a||!b)return;p.x=a[0]+(b[0]-a[0])*f;p.z=a[1]+(b[1]-a[1])*f;p.heading=a[2]+angDiff(a[2],b[2])*f;p.vx=a[3];p.vz=a[4];p.ox=p.x;p.oz=p.z;});
}
function hypeReplayEnd(){
  const rp=G.replay;if(!rp||!rp.active)return;
  const s=rp.saved,pk=G.puck;pk.x=s.k[0];pk.z=s.k[1];pk.vx=s.k[2];pk.vz=s.k[3];pk.ox=pk.x;pk.oz=pk.z;
  G.pengs.forEach((p,j)=>{const a=s.p[j];p.x=a[0];p.z=a[1];p.heading=a[2];p.vx=a[3];p.vz=a[4];p.ox=p.x;p.oz=p.z;});
  rp.active=false;rp.done=true;document.body.classList.remove('replay');$('#replayTag').classList.remove('on');
  G.stateT=Math.min(G.stateT,1.1);
}
function hypeGoalStep(dt){
  const rp=G.replay;if(!rp||rp.done)return false;
  const el=G.goalT0-G.stateT;
  if(!rp.active&&el>=rp.start){
    const pk=G.puck;rp.saved={k:[pk.x,pk.z,pk.vx,pk.vz],p:G.pengs.map(p=>[p.x,p.z,p.heading,p.vx,p.vz])};
    rp.active=true;rp.pos=0;document.body.classList.add('replay');$('#replayTag').classList.add('on');SFX.whoosh();
  }
  if(!rp.active)return false;
  rp.pos+=dt*60*rp.speed;
  if(rp.skip||rp.pos>=rp.frames.length-1){hypeReplayEnd();return false;}
  hypeReplayApply(rp);return true;
}
function hypeSkipReplay(){if(G.replay&&G.replay.active)G.replay.skip=true;}
addEventListener('keydown',hypeSkipReplay);addEventListener('pointerdown',hypeSkipReplay);

/* ---------- per-frame: recording, combo timer, tension, rings ---------- */
function hypeSlow(s,t){if(G.slow&&G.slow.t>0)return;G.slow={s,t};}
let cmbEl=null;
function hypeFrame(dt){
  const h=G.hype;if(!h||G.view!=='game')return;
  const cfg=G.cfg;
  if(!cmbEl)cmbEl=document.getElementById('combo');
  if(cmbEl)cmbEl.style.visibility=G.state==='goal'?'hidden':'visible';   // never competes with the goal banner
  if(G.state==='play'){
    hypeRecord(dt);
    const c=h.combo;if(c.t>0){c.t-=dt;if(c.t<=0){if(c.n>=3)hypeToast(__L('콤보 종료 · x')+c.n+__L(' 달성!'));c.n=0;comboHide();}else comboBar();}
    if(cfg.mode!=='demo'&&cfg.mode!=='practice'&&cfg.mode!=='free'){
      const clk=$('#clock');
      if(cfg.time&&!G.ot){
        const tl=G.timeLeft,lvl=tl<=10?2:tl<=30?1:0;
        if(lvl!==h.tl){h.tl=lvl;clk.classList.toggle('l1',lvl===1);clk.classList.toggle('l2',lvl===2);if(lvl===1)hypeToast(__L('⏱ 30초 남았어요!'));}
        const sec=Math.ceil(tl);if(tl<=10&&sec>0&&sec!==h.lastSec){h.lastSec=sec;lateNum(sec);}
        if(tl<=30&&G.mine&&G.mine.score<G.mine.opp.score)h.trailLate=true;
      }else if(G.ot&&!h.otShown){h.otShown=true;const mt=$('#modeTag');mt.textContent='⚡ SUDDEN DEATH';mt.classList.add('sd');clk.classList.remove('l1');clk.classList.add('l2');hypeToast(__L('연장전! 먼저 넣는 팀이 승리'));}
    }
  }
  if(h.ringT>0){h.ringT-=dt;const k=1-Math.max(0,h.ringT)/.95;gRing.visible=true;gRing.scale.setScalar(1+k*15);gRing.material.opacity=Math.max(0,(1-k)*.85);if(h.ringT<=0)gRing.visible=false;}
  if(G.state==='goal'&&h.scorer&&!(G.replay&&G.replay.active)){const p=h.scorer;sRing.visible=true;sRing.position.set(p.rx,.09,p.rz);const k=1+.12*Math.sin(G.t*9);sRing.scale.setScalar(k);sRing.material.color.setRGB(1,.85,.25);sRing.material.opacity=.9;}
  else sRing.visible=false;
}
function hypeReset(){
  G.hype=hypeNew();G.hitStop=0;G.slow=null;G.replay=null;cineClear();G.cineFull=null;
  document.body.classList.remove('replay','chmax');
  for(const id of['#combo','#late','#toast','#replayTag','#gflash'])try{$(id).className='';}catch(e){}
  try{$('#clock').className='';$('#modeTag').classList.remove('sd');$('#bannerSub').className='';gRing.visible=false;sRing.visible=false;}catch(e){}
  try{goalsEnsure();G.hype.doneAtStart=save.goals.list.map(g=>g.p>=GDEFS[g.id].n);}catch(e){}
}


/* ================= TUTORIAL: 8 hands-on steps, each completed by actually doing it ================= */
const TUT_REWARD=50;
const TUT_STEPS=[
  {id:'move',t:__L('이동하기'),pc:__L('<kbd>W A S D</kbd> 또는 <kbd>방향키</kbd>로 <b>주황 원</b>까지 가보세요'),mo:__L('화면 <b>왼쪽</b>을 누른 채 끌어서 <b>주황 원</b>까지 가보세요'),hl:'#joyZone'},
  {id:'get',t:__L('퍽 잡기'),pc:__L('검은 원반이 <b>퍽</b>이에요. 퍽을 향해 다가가면 <b>스틱에 붙어요</b> (드리블)'),mo:__L('검은 원반이 <b>퍽</b>이에요. 퍽을 향해 다가가면 <b>스틱에 붙어요</b> (드리블)'),hl:'#joyZone'},
  {id:'tap',t:__L('짧은 슛 · 톡!'),pc:__L('<kbd>Space</kbd>를 <b>짧게</b> 눌러 퍽을 톡 쳐보세요 (마우스 클릭도 돼요)'),mo:__L('<b>슛</b> 버튼을 <b>짧게</b> 눌러 퍽을 톡 쳐보세요'),hl:'#tbShoot',puck:true},
  {id:'power',t:__L('강슛 · 쾅!'),pc:__L('<kbd>Space</kbd>를 <b>길게</b> 눌러 게이지를 70% 이상 채운 뒤 떼세요'),mo:__L('<b>슛</b> 버튼을 <b>길게</b> 눌러 게이지를 70% 이상 채운 뒤 떼세요'),hl:'#tbShoot',puck:true},
  {id:'pass',t:__L('패스'),pc:__L('퍽 가까이에서 <kbd>E</kbd>를 눌러 <b>초록 링</b> 동료에게 패스! 받은 동료로 조작이 바뀌어요'),mo:__L('퍽 가까이에서 <b>패스</b> 버튼! 받은 동료로 조작이 바뀌어요'),hl:'#tbPass',puck:true},
  {id:'dash',t:__L('대시'),pc:__L('<kbd>Shift</kbd>로 순간 가속해 보세요'),mo:__L('<b>대시</b> 버튼으로 순간 가속해 보세요'),hl:'#tbDash'},
  {id:'special',t:__L('특수 기술'),pc:__L('<kbd>Q</kbd>로 <b>{SP}</b>을(를) 써보세요. 왼쪽 아래 게이지가 차면 다시 쓸 수 있어요'),mo:__L('<b>특수</b> 버튼으로 <b>{SP}</b>을(를) 써보세요'),hl:'#tbSpec'},
  {id:'goal',t:__L('골 넣기!'),pc:__L('배운 걸 모두 써서 골키퍼를 뚫어 보세요! <b>구석</b>을 노리면 잘 들어가요'),mo:__L('배운 걸 모두 써서 골키퍼를 뚫어 보세요! <b>구석</b>을 노리면 잘 들어가요'),hl:'#tbShoot',puck:true}
];
const TUT={active:false,i:0,t:0,wait:0,fresh:false,s0:0,hold:0,tx:0,tz:0,d0:1,finishT:0,touch:null};
let tutRing=null;
{const m=new T.Mesh(new T.RingGeometry(1.15,1.55,44),new T.MeshBasicMaterial({color:0xff8a2a,transparent:true,opacity:.95,depthWrite:false,depthTest:false,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.09;m.visible=false;scene.add(m);tutRing=m;}
function tutGlowOff(){document.querySelectorAll('.tutglow').forEach(e=>e.classList.remove('tutglow'));}
function tutStart(){
  SFX.init();SFX.ui();save.tut.asked=true;persist();$('#tutAsk').classList.remove('on');
  startMatch({mode:'practice',tutorial:true,size:2,time:0,diff:'easy',noOpp:true,goalieOnly:true,noScoreOpp:true,passiveMates:true,tag:'🎓 TUTORIAL'});
}
function tutInit(){   // runs on every match setup (from hypeReset)
  TUT.active=!!(G.cfg&&G.cfg.tutorial);tutGlowOff();if(tutRing)tutRing.visible=false;
  if(!TUT.active){$('#tut').classList.remove('on');return;}
  TUT.i=0;TUT.wait=0;TUT.finishT=0;TUT.fresh=true;
}
function tutGivePuck(say){
  const p=G.player,pk=G.puck;if(!p||Math.hypot(pk.x-p.x,pk.z-p.z)<3.5)return;
  const d=G.mine.dir;p.heading=d>0?Math.PI/2:-Math.PI/2;
  pk.x=clamp(p.x+d*1.5,-W+1,W-1);pk.z=clamp(p.z,-D+1,D-1);pk.vx=pk.vz=0;pk.ox=pk.x;pk.oz=pk.z;pk.shot=null;
  if(say)popAt(__L('퍽을 가져다 놨어요!'),pk.x,1.6,pk.z);
}
function tutRender(){
  const st=TUT_STEPS[TUT.i];$('#tut').classList.add('on');
  let sp=__L('특수 기술');try{sp=SPECIALS[G.player.ty.special]||sp;}catch(e){}
  $('#tutStep').textContent=(TUT.i+1)+' / '+TUT_STEPS.length;
  $('#tutDots').innerHTML=TUT_STEPS.map((x,i)=>'<i class="'+(i<TUT.i?'d':i===TUT.i?'c':'')+'"></i>').join('');
  $('#tutTitle').textContent=st.t;$('#tutText').innerHTML=(IS_TOUCH?st.mo:st.pc).replace('{SP}',sp);
  tutGlowOff();if(IS_TOUCH&&st.hl){const e=$(st.hl);if(e)e.classList.add('tutglow');}
  TUT.touch=IS_TOUCH;
}
function tutEnter(){
  const st=TUT_STEPS[TUT.i],p=G.player;TUT.t=0;TUT.hold=0;TUT.s0=G.mine?G.mine.score:0;
  tutRing.visible=false;$('#tutBar').style.width='0%';
  if(p&&st.id==='move'){const d=G.mine.dir;TUT.tx=clamp(p.x+d*7,-W+3,W-3);TUT.tz=4.5;tutRing.position.set(TUT.tx,.09,TUT.tz);tutRing.visible=true;TUT.d0=Math.hypot(p.x-TUT.tx,p.z-TUT.tz)||1;}
  if(p&&st.id==='get')TUT.d0=Math.max(1,Math.hypot(G.puck.x-p.x,G.puck.z-p.z)-1.6);
  if(st.puck)tutGivePuck(false);
  tutRender();
}
function tutNote(t){const n=$('#tutNote');n.textContent=t;n.classList.remove('on');void n.offsetWidth;n.classList.add('on');}
function tutOk(){
  if(TUT.wait>0||!TUT.active)return;TUT.wait=.9;SFX.passOk();vib(25);
  const el=$('#tut');el.classList.remove('ok');void el.offsetWidth;el.classList.add('ok');
  $('#tutTitle').textContent=__L('✔ 잘했어요!');$('#tutBar').style.width='100%';tutRing.visible=false;
}
function tutEvent(type,a,b){
  if(!TUT.active||TUT.wait>0||TUT.finishT>0)return;
  const id=TUT_STEPS[TUT.i].id;
  if(type==='shot'){
    if(id==='tap'){if(b==='tap')tutOk();else if(b==='power')tutNote(__L('짧게 톡! 눌렀다 바로 떼 보세요'));}
    else if(id==='power'){if(b==='power'&&a>=.7)tutOk();else if(b==='power'||b==='tap')tutNote(b==='tap'?__L('더 길게 눌러야 강슛이에요!'):__L('조금만 더 길게! (')+Math.round(a*100)+'% → 70%)');}
  }else if(type===id)tutOk();
}
function tutFrame(dt){
  if(!TUT.active)return;
  if(G.view!=='game'||!G.cfg||!G.cfg.tutorial){TUT.active=false;$('#tut').classList.remove('on');tutRing.visible=false;tutGlowOff();return;}
  if(TUT.fresh){TUT.fresh=false;hint(false);$('#obj').style.display='none';if(G.state==='ready'){G.state='play';G.stateT=0;$('#count').textContent='';}tutEnter();}
  if(TUT.touch!==IS_TOUCH)tutRender();
  if(TUT.finishT>0){TUT.finishT-=dt;if(TUT.finishT<=0)tutDone();return;}
  if(TUT.wait>0){TUT.wait-=dt;if(TUT.wait<=0){TUT.i++;tutEnter();}return;}
  const st=TUT_STEPS[TUT.i],p=G.player,pk=G.puck;if(!p)return;
  TUT.t+=dt;let prog=0;
  if(tutRing.visible)tutRing.scale.setScalar(1+.1*Math.sin(G.t*6));
  if(st.id==='move'){const d=Math.hypot(p.x-TUT.tx,p.z-TUT.tz);prog=1-Math.min(1,d/TUT.d0);if(d<1.7)tutOk();}
  else if(st.id==='get'){const d=Math.hypot(pk.x-p.x,pk.z-p.z);prog=1-Math.min(1,Math.max(0,d-1.6)/TUT.d0);if(canHit(p)){TUT.hold+=dt;if(TUT.hold>.25)tutOk();}else TUT.hold=0;}
  else if(st.id==='power')prog=p.charging?p.charge/.7:0;
  else if(st.id==='goal'&&G.mine.score>TUT.s0){$('#tutTitle').textContent=__L('🎉 골!! 튜토리얼 완료!');$('#tutBar').style.width='100%';TUT.finishT=1.8;return;}
  if(TUT.wait<=0)$('#tutBar').style.width=Math.min(100,prog*100)+'%';
  // stuck helpers: never leave a beginner hunting for the puck
  if(st.puck&&G.state==='play'&&TUT.t>11&&!canHit(p)){tutGivePuck(true);TUT.t=0;}
  if(st.id==='get'&&TUT.t>20){tutGivePuck(true);TUT.t=0;}
}
function tutDone(){
  TUT.active=false;$('#tut').classList.remove('on');tutRing.visible=false;tutGlowOff();
  const first=!save.tut.done;save.tut.done=true;save.tut.asked=true;if(first)save.points+=TUT_REWARD;persist();
  G.state='over';G.stateT=1e9;G.result=null;SFX.win();vib([30,40,80]);
  const keys=IS_TOUCH
    ?[[__L('이동'),__L('왼쪽 화면 끌기')],[__L('슛'),__L('슛 버튼 (짧게 톡 · 길게 쾅)')],[__L('패스'),__L('패스 버튼')],[__L('대시'),__L('대시 버튼')],[__L('특수 기술'),__L('특수 버튼')],[__L('선수 교체'),__L('교체 버튼')]]
    :[[__L('이동'),'W A S D'],[__L('슛'),__L('Space (짧게 톡 · 길게 쾅) / 클릭')],[__L('패스'),__L('E / 오른쪽 클릭')],[__L('대시'),'Shift'],[__L('특수 기술'),'Q'],[__L('선수 교체'),__L('F · 일시정지 P')]];
  let html=__L('<div class="rs-score">이제 실전이에요! 🐧🏒</div>');
  html+=first?__L('<div class="rs-rows"><div class="rs-row total"><span>튜토리얼 완료 보상</span><span>⭐ <b class="cu" data-to="')+TUT_REWARD+'">0</b> P</span></div></div>':__L('<div class="rs-note">완료 보상은 처음 한 번만 지급돼요.</div>');
  html+='<div class="tut-keys">'+keys.map(k=>'<div><b>'+k[0]+'</b><span>'+k[1]+'</span></div>').join('')+'</div>';
  html+=__L('<div class="rs-next">좋은 플레이를 이어가면 콤보가 쌓이고, 특별한 골은 보너스가 커져요.<br>메인 메뉴의 🎯 목표에서 오늘의 미션도 확인해 보세요!</div>');
  openResult(__L('튜토리얼 완료! 🎓'),html,[[__L('⚡ 빠른 경기 시작'),()=>launch('quick')],[__L('메인 메뉴'),()=>toMenu()]]);
  hypeResultAnim();
}
let tutAskedNow=false;
function tutMaybeAsk(){if(tutAskedNow||save.tut.done||save.tut.asked||save.stats.played>0)return;tutAskedNow=true;$('#tutAsk').classList.add('on');}
$('#tutYes').onclick=()=>tutStart();
$('#tutNo').onclick=()=>{SFX.init();SFX.ui();save.tut.asked=true;persist();$('#tutAsk').classList.remove('on');};
$('#tutSkip').onclick=()=>{SFX.ui();TUT.active=false;toMenu();};


/* ================= LEAGUE: transfer market, club value, club league, manager ranking, my profile ================= */
// Offline game: rival clubs / managers are simulated (seeded per save), not real players.
function rng32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const escH=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const cleanName=v=>typeof v==='string'?v.replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,12):'';
const EMB=['🐧','🦭','🐻‍❄️','🐋','🦅','🐺','🦊','❄️','⭐','🔥','🌊','👑'];
if(!save.profile.since)save.profile.since=Date.now();
if(!save.profile.seed)save.profile.seed=1+Math.floor(Math.random()*2e9);
persist();
const daysSince=()=>Math.max(0,Math.floor((Date.now()-save.profile.since)/86400000));
function agoTxt(ts){const s=Math.max(0,(Date.now()-ts)/1000);return s<60?__L('방금'):s<3600?Math.floor(s/60)+__L('분 전'):s<86400?Math.floor(s/3600)+__L('시간 전'):Math.floor(s/86400)+__L('일 전');}

/* ---------- transfer market ---------- */
const MK_SLOT=3*3600*1000,MK_N=6,MK_REFRESH=10;
const MK_BUY=[30,60,180,600,1500],MK_SELL=[6,15,45,150,380],MK_GW=[44,32,17,6,1];
const MK_TMUL={basic:.8,balanced:1,fast:1.1,defense:1.15,strong:1.15,auk:1.5,king:1.15,macaroni:1,royal:1.1,fiordland:1.05,yelloweye:1.2,little:.9,african:1,humboldt:1,magellanic:1,galapagos:1.05};
const mkTypes=()=>Object.keys(TYPES).filter(k=>!TYPES[k].exclusive);   // the exclusive 큰바다쇠오리 never appears on the market
// Spread guarantee: the highest possible sell price is always below the lowest possible buy price (no buy-sell money loop).
const mkSlot=()=>Math.floor(Date.now()/MK_SLOT);
const mkKey=()=>mkSlot()+':'+(save.mk.salt|0);
function mkGen(){
  const slot=mkSlot(),r=rng32((slot*7919)^((save.mk.salt|0)*104729)^(save.profile.seed|0)),types=mkTypes(),demand={};
  for(const k of types)demand[k]=+(0.8+r()*0.45).toFixed(2);
  const sale=Math.floor(r()*MK_N),list=[];
  for(let i=0;i<MK_N;i++){
    const x=r()*100;let g=4,acc=0;for(let j=0;j<5;j++){acc+=MK_GW[j];if(x<acc){g=j;break;}}
    const tt=tierTypes(g),type=tt[Math.floor(r()*tt.length)],ref=MK_BUY[g]*MK_TMUL[type];
    let price=ref*(0.85+r()*0.4);if(i===sale)price*=0.7;
    price=Math.max(5,Math.round(price/5)*5);
    list.push({i,type,g,price,sale:i===sale,trend:Math.round((price/ref-1)*100)});
  }
  return{slot,list,demand};
}
function mkSellPrice(type,g,m){m=m||mkGen();return Math.max(1,Math.round(MK_SELL[g]*(MK_TMUL[type]||1)*(m.demand[type]||1)));}
function mkLog(e){save.mk.log.unshift(e);if(save.mk.log.length>15)save.mk.log.length=15;}
function mkBuy(i){
  const m=mkGen(),L=m.list[i],key=mkKey()+':'+i;if(!L)return false;
  if(save.mk.bought.includes(key)){flashMsg(__L('이미 영입한 매물이에요'));return false;}
  if(save.points<L.price){lackMsg(L.price);return false;}
  save.points-=L.price;const isNew=grantCard(L.type);
  save.mk.bought.push(key);if(save.mk.bought.length>40)save.mk.bought.splice(0,save.mk.bought.length-40);
  mkLog({k:'buy',type:L.type,g:L.g,p:L.price,ts:Date.now(),n:isNew});persist();
  SFX.win();vib([20,30,40]);flashMsg((isNew?__L('🎉 새 펭귄 영입! '):__L('영입 완료! '))+TYPES[L.type].name+' · -'+L.price+'P');
  return true;
}
function mkSell(type,g){
  if(!save.cc[type]||save.cc[type][g]<1){flashMsg(__L('방출할 카드가 없어요'));return false;}
  const p=mkSellPrice(type,g);save.cc[type][g]--;save.points+=p;
  mkLog({k:'sell',type,g,p,ts:Date.now()});persist();SFX.passOk();flashMsg(__L('방출 완료! +')+p+'P');return true;
}
function mkRefresh(){if(save.points<MK_REFRESH){lackMsg(MK_REFRESH);return false;}save.points-=MK_REFRESH;save.mk.salt=(save.mk.salt|0)+1;persist();SFX.ui();return true;}

/* ---------- club value / club league ---------- */
function penguinValue(k){const lv=save.lv[k]|0,mx=mxInfo(k).lv,o=Math.min(99,cardOvr(k,lv));return Math.round(o*o/10*(1+lv*.25)*(1+mx*.08));}
function clubValue(){
  let players=0,cards=0;
  for(const k of save.types)players+=penguinValue(k);
  for(const k of Object.keys(TYPES))for(let g=0;g<5;g++)cards+=(save.cc[k][g]|0)*MK_SELL[g]*MK_TMUL[k];
  cards=Math.round(cards);const cash=Math.max(0,save.points|0);
  return{players,cards,cash,total:players+cards+cash};
}
const CLUB_A=[__L('빙산'),__L('오로라'),__L('블리자드'),__L('남극'),__L('북극성'),__L('눈보라'),__L('빙하'),__L('아이스'),__L('크릴'),__L('유빙'),__L('설원'),__L('극지'),__L('하얀'),__L('푸른'),__L('얼음꽃')];
const CLUB_B=[__L('유나이티드'),'FC',__L('시티'),__L('레이서스'),__L('킹스'),__L('스타즈'),__L('이글스'),__L('타이거즈'),__L('웨이브'),__L('스톰'),__L('레인저스'),__L('로열즈'),__L('기사단'),__L('원정대'),__L('해적단')];
function leagueClubs(){
  const r=rng32((save.profile.seed|0)^0x51ab),d=daysSince(),used=new Set(),out=[];
  const fixed=TOUR.map(t=>t.name);
  for(let i=0;i<49;i++){
    let name=i<fixed.length?fixed[i]:'';
    while(!name||used.has(name))name=CLUB_A[Math.floor(r()*CLUB_A.length)]+' '+CLUB_B[Math.floor(r()*CLUB_B.length)];
    used.add(name);
    const q=Math.pow(r(),1.6),base=Math.exp(Math.log(420)+(Math.log(42000)-Math.log(420))*q),grow=1+Math.min(.5,d*.008*(.4+r()));
    out.push({name,emb:EMB[Math.floor(r()*EMB.length)],v:Math.round(base*grow)});
  }
  return out;
}
function clubTable(){
  const val=clubValue(),rows=leagueClubs().map(c=>Object.assign({me:false},c));
  rows.push({name:save.profile.club,emb:save.profile.emb,v:val.total,me:true});
  rows.sort((a,b)=>b.v-a.v||(a.me?-1:b.me?1:0));rows.forEach((x,i)=>x.rank=i+1);
  return{rows,me:rows.find(x=>x.me),val};
}

/* ---------- manager rating (Elo) / ranking ---------- */
const TIERS=[{n:__L('브론즈'),min:600,c:'#d0965f'},{n:__L('실버'),min:900,c:'#cfd9e4'},{n:__L('골드'),min:1100,c:'#ffcf4a'},{n:__L('플래티넘'),min:1300,c:'#5fe0d2'},{n:__L('다이아'),min:1500,c:'#7cc4ff'},{n:__L('마스터'),min:1700,c:'#c48bff'},{n:__L('레전드'),min:1900,c:'#ff6b8a'},{n:__L('개발자'),min:2100,c:'#7df9ff'}];
function tierOf(r){
  let t=0;for(let i=0;i<TIERS.length;i++)if(r>=TIERS[i].min)t=i;
  const T_=TIERS[t],nx=TIERS[t+1];let sub='';
  if(nx){const span=(nx.min-T_.min)/3,k=Math.max(0,Math.min(2,Math.floor((r-T_.min)/span)));sub=' '+['III','II','I'][k];}
  return{i:t,name:T_.n+sub,c:T_.c,next:nx?nx.min:null,min:T_.min};
}
const MGR_A=[__L('얼음'),__L('폭풍'),__L('북극'),__L('눈보라'),__L('오로라'),__L('빙하'),__L('남극'),__L('푸른'),__L('하얀'),__L('전설의'),__L('냉철한'),__L('불꽃'),__L('번개'),__L('침착한'),__L('고요한')];
const MGR_B=[__L('감독'),__L('전술가'),__L('여우'),__L('사령관'),__L('마에스트로'),__L('곰'),__L('독수리'),__L('늑대'),__L('선장'),__L('코치'),__L('명장'),__L('지휘관')];
function mgrRivals(){
  const r=rng32((save.profile.seed|0)^0x9e37),day=Math.floor(Date.now()/86400000),rd=rng32((day*2654435761)^(save.profile.seed|0)),used=new Set(),out=[];
  for(let i=0;i<99;i++){
    let n='';while(!n||used.has(n))n=MGR_A[Math.floor(r()*MGR_A.length)]+' '+MGR_B[Math.floor(r()*MGR_B.length)]+(r()<.5?'':' '+(10+Math.floor(r()*90)));
    used.add(n);
    out.push({name:n,r:Math.round(760+1380*Math.pow(r(),1.35)+(rd()-.5)*40),emb:EMB[Math.floor(r()*EMB.length)]});
  }
  return out;
}
function mgrTable(){
  const rows=mgrRivals().map(x=>Object.assign({me:false},x));
  rows.push({name:save.profile.name+titleBadge(),r:save.mgr.r,emb:save.profile.emb,me:true});
  rows.sort((a,b)=>b.r-a.r||(a.me?-1:b.me?1:0));rows.forEach((x,i)=>x.rank=i+1);
  return{rows,me:rows.find(x=>x.me)};
}
const isRated=cfg=>!!cfg&&(cfg.mode==='ranked'||cfg.mode==='trial')&&!cfg.tutorial;   // only tier games move the rating
function oppRating(cfg){return cfg.oppR||({easy:880,normal:1120,hard:1380}[cfg.diff||'normal']||1120);}
function mgrApply(S,opp,label){
  seasonCheck();const m=save.mgr,before=m.r,E=1/(1+Math.pow(10,(opp-m.r)/400)),K=m.games<10?48:32;
  let d=Math.round(K*(S-E));if(S===1&&d<5)d=5;if(S===0&&d>-5)d=-5;
  m.r=Math.max(100,Math.min(4000,m.r+d));d=m.r-before;
  m.games++;if(S===1)m.w++;else if(S===0)m.l++;else m.d++;
  m.best=Math.max(m.best,m.r);seasonAdd(S,m.r);m.form.unshift(S===1?'W':S===0?'L':'D');if(m.form.length>5)m.form.length=5;
  m.hist.unshift({d,r:m.r,l:label,ts:Date.now()});if(m.hist.length>10)m.hist.length=10;
  const t0=tierOf(before),t1=tierOf(m.r);
  return{from:before,to:m.r,d,up:t1.i>t0.i,down:t1.i<t0.i,tier:t1};
}
function mgrMatchEnd(win,draw,cfg){if(!isRated(cfg))return null;save.mgr.pending=null;const res=mgrApply(win?1:draw?.5:0,oppRating(cfg),cfg.label||__L('티어 게임'));res.dev=devCheck();return res;}
function mgrFrame(){   // after 20s of real play, leaving the match unfinished counts as a forfeit (stops quit-to-avoid-loss)
  if(G.mgrArmed||!G.cfg||!isRated(G.cfg)||G.view!=='game'||G.state!=='play'||save.mgr.pending)return;
  if(G.elapsed>=20){G.mgrArmed=true;save.mgr.pending={o:oppRating(G.cfg),l:G.cfg.label||__L('티어 게임'),trial:G.cfg.mode==='trial',ts:Date.now()};persist();}
}
function mgrReset(){   // every match setup (also on page load): settle an abandoned armed match
  G.mgrArmed=false;const p=save.mgr.pending;if(!p)return;save.mgr.pending=null;
  const res=mgrApply(0,p.o||1120,__L('기권 · ')+(p.l||__L('경기')));let out=false;
  if(p.trial&&save.trial&&save.trial.run){save.trial.run=null;out=true;}
  persist();
  setTimeout(()=>{try{flashMsg(__L('끝내지 않은 티어 게임은 기권 패예요 (레이팅 ')+res.d+')'+(out?__L(' · 선발전 탈락'):''));}catch(e){}},600);
}

/* ---------- home summary ---------- */
function leagueMenuRefresh(){
  try{seasonCheck();seasonBadge();}catch(e){}
  seasonPopSoon();news18Soon();
  try{
    const ct=clubTable(),mt=mgrTable(),ti=tierOf(save.mgr.r),el=$('#menuRank');
    if(el){el.innerHTML='<span class="mr-club">'+escH(save.profile.emb)+' '+escH(save.profile.club)+'</span><span class="mr-rank">'+HM_IC.rink+__L('구단 <b>')+ct.me.rank+__L('위</b></span><span class="mr-tier">')+HM_IC.medal+'<b style="color:'+ti.c+'">'+ti.name+__L('</b><em class="mr-sub">감독 ')+mt.me.rank+__L('위</em></span>')+(titleText()?'<span class="mr-title">'+titleText()+'</span>':'');
      el.setAttribute('aria-label',save.profile.club+__L(', 구단 ')+ct.me.rank+__L('위, ')+ti.name+__L(', 감독 ')+mt.me.rank+__L('위. 프로필 열기'));}
    const m=mkGen(),b=$('#mkBadge');if(b){const hot=m.list.some(L=>L.sale&&!save.mk.bought.includes(mkKey()+':'+L.i));b.textContent=hot?__L('급매'):'';b.style.display=hot?'inline-block':'none';}
  }catch(e){}
}

/* ---------- market screen ---------- */
let mkTab='buy',mkShownSlot=-1;
function mkCountdown(){const left=MK_SLOT-(Date.now()%MK_SLOT),h=Math.floor(left/3600000),mi=Math.floor(left%3600000/60000),s=Math.floor(left%60000/1000);return h+':'+String(mi).padStart(2,'0')+':'+String(s).padStart(2,'0');}
function renderMarket(){
  const el=$('#mkBody');if(!el)return;$('#ptsN').textContent=save.points;
  document.querySelectorAll('#mkTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===mkTab));
  const m=mkGen(),key=mkKey();mkShownSlot=m.slot;let h='';
  h+=__L('<div class="mk-top"><span>⏱ 새 매물까지 <b id="mkCd">')+mkCountdown()+__L('</b></span><span class="mk-trend">시세 ')+mkTypes().map(k=>{const p=Math.round((m.demand[k]-1)*100);return '<i class="'+(p>=0?'up':'dn')+'">'+TYPES[k].name.replace(__L(' 펭귄'),'')+' '+(p>=0?'▲':'▼')+Math.abs(p)+'%</i>';}).join('')+'</span></div>';
  if(mkTab==='buy'){
    h+='<div class="mk-grid">'+m.list.map(L=>{
      const sold=save.mk.bought.includes(key+':'+L.i),own=save.types.includes(L.type),can=!sold&&save.points>=L.price;
      return '<div class="mk-item'+(sold?' sold':'')+(L.sale?' hot':'')+'">'+(L.sale?__L('<div class="mk-sale">🔥 급매 -30%</div>'):'')+'<div style="--cw:94px">'+cardHtml(L.type,{g:L.g,lv:own?0:L.g,tag:own?'':__L('미보유')})+'</div>'
        +'<div class="mk-meta">'+GRADES[L.g].n+__L(' 카드 · <span class="')+(L.trend>0?'pu':'pd')+'">'+(L.trend>0?'▲':'▼')+Math.abs(L.trend)+'%</span></div>'
        +'<button class="btn small'+(can?' primary':'')+'" data-buy="'+L.i+'"'+(can?'':' disabled')+'>'+(sold?__L('영입 완료 ✔'):'⭐ '+fmtN(L.price)+'P')+'</button></div>';}).join('')+'</div>';
    h+=__L('<div class="row" style="margin-top:8px"><button class="btn small" data-act="mkref">🔄 매물 새로고침 · ')+MK_REFRESH+'P</button></div>';
    h+=__L('<div class="odds">없던 펭귄을 영입하면 바로 해금돼요(희귀 Lv1 · 영웅 Lv2 · 전설 Lv3로 시작). 이미 가진 펭귄은 카드로 보관돼 강화·합성 재료가 돼요.<br>매물은 3시간마다 바뀌고, 매번 1장은 30% 할인된 급매로 나와요.</div>');
  }else if(mkTab==='sell'){
    let rows='';
    for(const k of mkTypes())for(let g=0;g<5;g++){const n=save.cc[k][g]|0;if(!n)continue;const p=mkSellPrice(k,g,m);
      rows+='<div class="mk-sell"><div style="--cw:62px">'+cardHtml(k,{g,lv:0,count:n})+'</div><div class="info"><b>'+TYPES[k].name+'</b> · '+GRADES[g].n+__L(' 카드 ×')+n+__L('<br><small>현재 시세 ')+p+__L('P (기준 ')+Math.round(MK_SELL[g]*MK_TMUL[k])+'P)</small></div><button class="btn small" data-sell="'+k+':'+g+__L('">방출 +')+p+'P</button></div>';}
    h+=rows||__L('<div class="lbl" style="text-align:center;margin:18px 0">방출할 카드가 없어요. 스카우트로 카드를 모아 보세요.</div>');
    h+=__L('<div class="odds">보관 중인 카드만 방출할 수 있어요(해금된 펭귄 자체는 팔리지 않아요). 방출가는 영입가보다 항상 낮아요.</div>');
  }else{
    h+=save.mk.log.length?save.mk.log.map(x=>'<div class="mk-log"><span class="'+(x.k==='buy'?'b':'s')+'">'+(x.k==='buy'?__L('영입'):__L('방출'))+'</span><span>'+TYPES[x.type].name+' · '+GRADES[RAR[x.type]|0].n+(x.n?__L(' · 신규'):'')+'</span><span class="'+(x.k==='buy'?'dn':'up')+'">'+(x.k==='buy'?'-':'+')+fmtN(x.p)+'P</span><small>'+agoTxt(x.ts)+'</small></div>').join(''):__L('<div class="lbl" style="text-align:center;margin:18px 0">아직 이적 기록이 없어요.</div>');
  }
  el.innerHTML=h;
  el.querySelectorAll('[data-buy]').forEach(b=>{b.onclick=()=>{if(mkBuy(+b.dataset.buy))renderMarket();};});
  el.querySelectorAll('[data-sell]').forEach(b=>{b.onclick=()=>{const a=b.dataset.sell.split(':');if(mkSell(a[0],+a[1]))renderMarket();};});
  el.querySelectorAll('[data-act="mkref"]').forEach(b=>{b.onclick=()=>{if(mkRefresh())renderMarket();};});
}
document.querySelectorAll('#mkTabs button').forEach(b=>{b.onclick=()=>{SFX.ui();mkTab=b.dataset.t;renderMarket();};});
setInterval(()=>{try{if(G.ui!=='sMarket')return;if(mkSlot()!==mkShownSlot){renderMarket();return;}const c=$('#mkCd');if(c)c.textContent=mkCountdown();}catch(e){}},1000);

/* ---------- my profile ---------- */
let pfTab='me';
function lgRows(rows,val,unit){
  return rows.map(x=>'<div class="lg-row'+(x.me?' me':'')+(x.rank<=3?' top':'')+'"><span class="rk">'+(x.rank<=3?['🥇','🥈','🥉'][x.rank-1]:x.rank)+'</span><span class="em">'+escH(x.emb)+'</span><span class="nm">'+escH(x.name)+(x.me?__L(' <small>(나)</small>'):'')+'</span><span class="vl">'+val(x)+'</span></div>').join('');
}
function renderProfile(){
  const el=$('#pfBody');if(!el)return;$('#ptsN').textContent=save.points;
  document.querySelectorAll('#pfTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===pfTab));
  const p=save.profile,m=save.mgr,ti=tierOf(m.r);let h='';
  if(pfTab==='me'){
    const ct=clubTable(),mt=mgrTable(),nxt=ct.me.rank>1?ct.rows[ct.me.rank-2].v-ct.val.total+1:0;
    h+='<div class="pf-head"><div class="pf-emb">'+escH(p.emb)+__L('</div><div class="pf-names"><label>구단 이름<input id="pfClub" maxlength="12" value="')+escH(p.club)+__L('"></label><label>감독 이름<input id="pfName" maxlength="12" value="')+escH(p.name)+__L('"></label><label>연고지<select id="pfCity">')+CITIES.map(c=>'<option'+(c===p.city?' selected':'')+'>'+c+'</option>').join('')+'</select></label></div></div>'+(titleText(true)?'<div class="pf-titles">'+titleText(true)+'</div>':'');
    h+='<div class="pf-embs">'+EMB.map(e=>'<button data-emb="'+e+'" class="'+(e===p.emb?'on':'')+'">'+e+'</button>').join('')+'</div>';
    h+='<div class="pf-grid">'
      +__L('<div class="pf-card"><small>💰 구단 총가치</small><b>')+fmtN(ct.val.total)+__L(' P</b><small>선수단 ')+fmtN(ct.val.players)+__L(' · 보관 카드 ')+fmtN(ct.val.cards)+__L(' · 포인트 ')+fmtN(ct.val.cash)+'</small></div>'
      +__L('<div class="pf-card"><small>🏟 구단 순위</small><b>')+ct.me.rank+__L('위 <span>/ ')+ct.rows.length+'</span></b><small>'+(nxt?__L('다음 순위까지 +')+fmtN(nxt)+' P':__L('리그 1위! 👑'))+'</small></div>'
      +__L('<div class="pf-card"><small>🎖 감독 랭킹</small><b>')+mt.me.rank+__L('위 <span>/ ')+mt.rows.length+__L('</span></b><small>레이팅 ')+m.r+__L(' · 최고 ')+m.best+'</small></div>'
      +__L('<div class="pf-card"><small>🏅 감독 티어</small><b style="color:')+ti.c+'">'+ti.name+'</b><small>'+(ti.next?__L('다음 티어까지 ')+(ti.next-m.r)+__L('점'):__L('최고 티어'))+'</small></div>'
      +'</div>';
    h+=__L('<div class="pf-stats">전적 ')+m.w+__L('승 ')+m.d+__L('무 ')+m.l+__L('패')+(m.games?__L(' · 승률 ')+Math.round(m.w/m.games*100)+'%':'')+(m.games<10?__L(' · 배치 경기 ')+m.games+__L('/10 (레이팅 변동 큼)'):'')
      +__L('<div class="pf-form">최근 5경기 ')+(m.form.length?m.form.map(f=>'<i class="f'+f+'">'+({W:__L('승'),D:__L('무'),L:__L('패')})[f]+'</i>').join(''):__L('<small>기록 없음</small>'))+'</div></div>';
  }else if(pfTab==='club'){
    const ct=clubTable();
    h+='<div class="lg-sum">'+escH(p.emb)+' <b>'+escH(p.club)+'</b> · <b>'+ct.me.rank+__L('위</b> / ')+ct.rows.length+__L(' · 총가치 ')+fmtN(ct.val.total)+' P</div>';
    h+='<div class="lg-list" id="lgList">'+lgRows(ct.rows,x=>fmtN(x.v)+' P')+'</div>';
    h+=__L('<div class="odds">구단 총가치 = 보유 펭귄 가치(OVR · 강화 · 숙련도) + 보관 카드 시세 + 보유 포인트. 경쟁 구단은 컴퓨터가 운영하는 가상 구단이고, 날이 지나면 조금씩 성장해요.</div>');
  }else{
    const mt=mgrTable();
    h+='<div class="lg-sum">🎖 <b style="color:'+ti.c+'">'+ti.name+__L('</b> · 레이팅 <b>')+m.r+'</b> · <b>'+mt.me.rank+__L('위</b> / ')+mt.rows.length+'</div>';
    if(ti.next){const pr=Math.max(0,Math.min(100,(m.r-ti.min)/(ti.next-ti.min)*100));h+='<div class="pbar" style="max-width:420px;margin:4px auto 8px"><i style="width:'+pr+'%"></i></div>';}
    h+='<div class="lg-list" id="lgList">'+lgRows(mt.rows,x=>{const t=tierOf(x.r);return '<b style="color:'+t.c+'">'+t.name.split(' ')[0]+'</b> '+x.r;})+'</div>';
    if(m.hist.length)h+=__L('<div class="lbl" style="margin-top:8px">최근 레이팅 변동</div>')+m.hist.slice(0,5).map(x=>'<div class="mk-log"><span>'+escH(x.l)+'</span><span class="'+(x.d>=0?'up':'dn')+'">'+(x.d>=0?'+':'')+x.d+'</span><span>→ '+x.r+'</span><small>'+agoTxt(x.ts)+'</small></div>').join('');
    h+=__L('<div class="odds">티어 게임(랭크전·선발전) 결과로만 레이팅이 바뀌어요(강한 상대일수록 이기면 더 많이 올라요). 첫 10경기는 배치 경기라 변동이 커요. 티어 게임을 시작하고 20초가 지난 뒤 중간에 나가면 기권 패예요. 다른 감독들은 컴퓨터가 운영하는 가상 감독이에요.</div>');
  }
  el.innerHTML=h;
  const L=$('#lgList');if(L){const me=L.querySelector('.me');if(me)L.scrollTop=Math.max(0,me.offsetTop-L.clientHeight/2);}
  const save_=(id,k,def)=>{const i=$(id);if(!i)return;i.onchange=()=>{const v=cleanName(i.value)||def;save.profile[k]=v;i.value=v;persist();SFX.ui();leagueMenuRefresh();};};
  save_('#pfClub','club',__L('펭귄 FC'));save_('#pfName','name',__L('펭귄 감독'));
  const cs=$('#pfCity');if(cs)cs.onchange=()=>{if(CITIES.includes(cs.value)){save.profile.city=cs.value;persist();SFX.ui();leagueMenuRefresh();}};
  el.querySelectorAll('[data-emb]').forEach(b=>{b.onclick=()=>{save.profile.emb=b.dataset.emb;persist();SFX.ui();renderProfile();leagueMenuRefresh();};});
}
document.querySelectorAll('#pfTabs button').forEach(b=>{b.onclick=()=>{SFX.ui();pfTab=b.dataset.t;renderProfile();};});


/* ================= TIER GAMES: ranked match, city trials, national trials ================= */
const CITIES=[__L('서울'),__L('부산'),__L('대구'),__L('인천'),__L('광주'),__L('대전'),__L('울산'),__L('세종'),__L('수원'),__L('부천'),__L('고양'),__L('성남'),__L('창원'),__L('제주')];
const TRIALS={
  city:{name:__L('시대회 대표 선발전'),short:__L('시대회'),icon:'🏙',rounds:[__L('8강'),__L('4강'),__L('결승')],r:[1150,1250,1350],diff:['normal','normal','hard'],
    types:[['basic','balanced','fast'],['defense','fast','strong'],['strong','fast','defense']],entries:3,needTier:2,first:300,again:80,card:2},
  nat:{name:__L('전국대회 대표 선발전'),short:__L('전국대회'),icon:'🇰🇷',rounds:[__L('16강'),__L('8강'),__L('4강'),__L('결승')],r:[1400,1500,1600,1700],diff:['hard','hard','hard','hard'],
    types:[['fast','strong','balanced'],['defense','strong','fast'],['strong','fast','defense'],['strong','strong','fast']],entries:2,needTier:3,first:1000,again:250,card:3},
  world:{name:__L('세계 대회'),short:__L('세계 대회'),icon:'🌍',rounds:[__L('32강'),__L('16강'),__L('8강'),__L('4강'),__L('결승')],r:[1750,1850,1950,2050,2150],diff:['hard','hard','hard','hard','hard'],
    types:[['fast','strong','defense'],['strong','fast','balanced'],['defense','strong','strong'],['strong','fast','fast'],['strong','strong','defense']],entries:1,needTier:4,first:3000,again:600,card:4}
};
const NATIONS=[__L('캐나다'),__L('미국'),__L('스웨덴'),__L('핀란드'),__L('체코'),__L('스위스'),__L('독일'),__L('슬로바키아'),__L('노르웨이'),__L('덴마크'),__L('라트비아'),__L('일본'),__L('오스트리아'),__L('프랑스')];
const RK_RULE={size:3,time:120};   // tier games use fixed rules so ratings stay comparable
function titleBadge(){const t=save.trial.titles;return save.dev.got?' 💻':t.world?' 🌍':t.nat?' 🇰🇷':t.city?' 🏙':'';}
function titleText(full){
  const t=save.trial.titles,a=[];
  if(save.dev.got)a.push(__L('💻 개발자'));
  if(t.world&&(full||!a.length))a.push(__L('🌍 세계 챔피언')+(full&&t.world>1?' ×'+t.world:''));
  if(t.nat&&(full||!a.length))a.push(__L('🇰🇷 국가대표')+(full&&t.nat>1?' ×'+t.nat:''));
  if(t.city&&(full||!a.length))a.push('🏙 '+escH(save.trial.cityName||save.profile.city)+__L('시 대표')+(full&&t.city>1?' ×'+t.city:''));
  return a.join(full?' · ':'');
}
function trialDayRefresh(){
  const t=save.trial,now=Date.now(),dn=dayNum();
  if(save.clk&&now<save.clk-300000)return;                       // clock moved backwards: keep today's counters
  if(!t.day||(dn>t.day&&now-t.ts>=12*3600*1000)){t.day=dn;t.ts=now;t.used={city:0,nat:0,world:0};persist();}
}
function trialLock(kind){
  const T=TRIALS[kind],ti=tierOf(save.mgr.r);
  if(ti.i<T.needTier)return TIERS[T.needTier].n+__L(' 이상 필요 (현재 ')+ti.name+')';
  if(kind==='nat'&&!save.trial.titles.city)return __L('시대회 대표가 되어야 도전할 수 있어요');
  if(kind==='world'&&!save.trial.titles.nat)return __L('국가대표가 되어야 출전할 수 있어요');
  return '';
}
const trialLeft=kind=>Math.max(0,TRIALS[kind].entries-(save.trial.used[kind]|0));

/* ---------- VS intro (matching animation) ---------- */
function vsIntro(title,op,cb){
  if(window.__NOFX){cb();return;}
  const v=$('#vsFx'),ti=tierOf(save.mgr.r),to=tierOf(op.r);
  $('#vsTitle').textContent=title;
  $('#vsMe').innerHTML='<div class="vs-emb">'+escH(save.profile.emb)+'</div><b>'+escH(save.profile.name)+titleBadge()+'</b><small>'+escH(save.profile.club)+'</small><small style="color:'+ti.c+'">'+ti.name+' · '+save.mgr.r+'</small>';
  $('#vsOp').innerHTML='<div class="vs-emb">'+escH(op.emb||'🐧')+'</div><b>'+escH(op.name)+'</b><small>'+escH(op.club||'')+'</small><small style="color:'+to.c+'">'+to.name+' · '+op.r+'</small>';
  v.classList.remove('on');void v.offsetWidth;v.classList.add('on');SFX.whoosh();
  setTimeout(()=>{SFX.beep(true);},700);
  setTimeout(()=>{v.classList.remove('on');cb();},2000);
}

/* ---------- ranked match ---------- */
function rankedDiff(r){return r<1050?'easy':r<1350?'normal':'hard';}
function rankedStart(){
  SFX.init();SFX.ui();
  const my=save.mgr.r,pool=mgrRivals().sort((a,b)=>Math.abs(a.r-my)-Math.abs(b.r-my)).slice(0,6),op=pool[Math.floor(Math.random()*pool.length)];
  const ks=Object.keys(TYPES).filter(k=>!TYPES[k].exclusive),types=[0,1,2].map(()=>ks[Math.floor(Math.random()*ks.length)]);
  const cfg={mode:'ranked',size:RK_RULE.size,time:RK_RULE.time,diff:rankedDiff(op.r),oppTypes:types,oppR:op.r,oppName:op.name,label:__L('랭크 경기 vs ')+op.name,tag:'🏅 RANKED · vs '+op.name};
  hideAll();vsIntro(__L('⚔️ 랭크 경기 매칭 완료!'),op,()=>startMatch(cfg));
}

/* ---------- trials ---------- */
function trialOppNames(kind){
  const city=save.profile.city,r=rng32((dayNum()*977)^(save.profile.seed|0)^(kind==='nat'?77:11));
  if(kind==='city')return [city+__L(' 아이스 FC'),city+__L(' 블리자드'),city+__L(' 오로라 (우승 후보)')];
  if(kind==='world'){const ns=NATIONS.slice(),o=[];while(o.length<4)o.push(ns.splice(Math.floor(r()*ns.length),1)[0]+__L(' 대표팀'));o.push(__L('남극 펭귄 연합 (디펜딩 챔피언)'));return o;}
  const others=CITIES.filter(c=>c!==city),out=[];
  while(out.length<4){const c=others[Math.floor(r()*others.length)];if(!out.some(x=>x.startsWith(c+' ')))out.push(c+__L(' 대표 · ')+c+' '+CLUB_B[Math.floor(r()*CLUB_B.length)]);}
  out[3]=out[3].replace(__L(' 대표 · '),__L(' 대표 (우승 후보) · '));
  return out;
}
function trialStart(kind){
  trialDayRefresh();const lock=trialLock(kind);
  if(lock){flashMsg('🔒 '+lock);return false;}
  if(save.trial.run&&save.trial.run.kind!==kind){flashMsg(__L('진행 중인 ')+TRIALS[save.trial.run.kind].short+__L(' 선발전을 먼저 끝내세요'));return false;}
  if(!save.trial.run){
    if(trialLeft(kind)<=0){flashMsg(__L('오늘 도전권을 모두 썼어요. 내일 다시 도전하세요!'));return false;}
    save.trial.used[kind]=(save.trial.used[kind]|0)+1;
    save.trial.run={kind,round:0,opp:trialOppNames(kind),city:save.profile.city};persist();
  }
  trialPlay();return true;
}
function trialPlay(){
  const run=save.trial.run;if(!run)return;
  const T=TRIALS[run.kind],k=run.round,opName=run.opp[k];
  const cfg={mode:'trial',kind:run.kind,round:k,size:RK_RULE.size,time:RK_RULE.time,diff:T.diff[k],oppTypes:T.types[k],oppR:T.r[k],
    label:T.short+__L(' 선발전 ')+T.rounds[k],tag:T.icon+' '+(run.kind==='city'?run.city+' ':'')+T.name+' · '+T.rounds[k]+' vs '+opName};
  SFX.init();hideAll();
  vsIntro(T.icon+' '+T.name+' · '+T.rounds[k],{name:opName,r:T.r[k],emb:run.kind==='nat'?'🇰🇷':'🏙'},()=>startMatch(cfg));
}
function trialAfterMatch(win){
  const run=save.trial.run;if(!run)return null;const T=TRIALS[run.kind],rn=T.rounds[run.round];
  if(!win){save.trial.run=null;return{st:'out',rn,T,kind:run.kind};}      // knockout: a draw also ends the run
  if(run.round<T.rounds.length-1){run.round++;return{st:'next',rn,next:T.rounds[run.round],opp:run.opp[run.round],T,kind:run.kind};}
  save.trial.run=null;save.trial.titles[run.kind]=(save.trial.titles[run.kind]|0)+1;if(run.kind==='city')save.trial.cityName=run.city;
  const first=!save.trial.first[run.kind];save.trial.first[run.kind]=true;
  const pts=first?T.first:T.again;let card=null;   // points are paid by the result screen together with the match reward
  if(run.kind==='world')save.trial.cityName=save.trial.cityName||run.city;
  if(first){card=grantTier(T.card);}
  return{st:'champ',rn,T,pts,card,first,kind:run.kind,city:run.city};
}
function goRanked(){toMenu();goScreen('sRanked');}

/* ---------- tier hub screen ---------- */
function bracketHtml(run){
  const T=TRIALS[run.kind];
  return '<div class="rk-br">'+T.rounds.map((rn,i)=>'<div class="'+(i<run.round?'done':i===run.round?'cur':'')+'"><b>'+(i<run.round?'✔ ':i===run.round?'▶ ':'')+rn+'</b><small>'+escH(run.opp[i])+'</small></div>').join('')+'</div>';
}
function renderRanked(){
  const el=$('#rkBody');if(!el)return;trialDayRefresh();seasonCheck();$('#ptsN').textContent=save.points;
  const m=save.mgr,ti=tierOf(m.r),mt=mgrTable(),run=save.trial.run;let h='';
  const pr=ti.next?Math.max(0,Math.min(100,(m.r-ti.min)/(ti.next-ti.min)*100)):100;
  h+='<div class="rk-head"><div class="rk-badge'+(ti.i===TIERS.length-1?' dev':'')+'" style="--tc:'+ti.c+'">'+TIER_IC[ti.i]+'</div><div><b style="color:'+ti.c+'">'+ti.name+__L('</b><div>레이팅 <b>')+m.r+__L('</b> · 감독 ')+mt.me.rank+__L('위 / ')+mt.rows.length+(m.games<10?__L(' · 배치 ')+m.games+'/10':'')+'</div><div class="pbar" style="width:220px;margin-top:4px"><i style="width:'+pr+'%"></i></div><small>'+(ti.next?__L('다음 티어까지 ')+(ti.next-m.r)+__L('점'):__L('최고 티어'))+'</small>'+(titleText(true)?'<div class="pf-titles">'+titleText(true)+'</div>':'')+seasonMiniHtml()+'</div></div>';
  h+='<div class="rk-cards">';
  h+=__L('<div class="rk-card"><div class="rk-ic">⚔️</div><b>랭크 경기</b><small>비슷한 레이팅의 감독과 매칭 · 3:3 · 2분<br>이기면 오르고 지면 내려가요</small><button class="btn primary" data-rk="ranked">매칭 시작</button></div>');
  for(const kind of['city','nat','world']){
    const T=TRIALS[kind],lock=trialLock(kind),mine=run&&run.kind===kind,left=trialLeft(kind);
    h+='<div class="rk-card'+(lock?' locked':'')+(mine?' live':'')+'"><div class="rk-ic">'+T.icon+'</div><b>'+(kind==='city'?escH(save.profile.city)+' ':'')+T.name+'</b>';
    h+='<small>'+T.rounds.join(' → ')+' · '+T.rounds.length+__L('연승하면 ')+TITLE_NM(kind)+__L('!<br>보상: 첫 선발 ⭐')+T.first+'P + '+GRADES[T.card].n+__L(' 카드 · 이후 ⭐')+T.again+'P</small>';
    if(lock)h+='<div class="rk-lock">🔒 '+lock+'</div>';
    else if(mine)h+=bracketHtml(run)+'<button class="btn primary" data-rk="'+kind+__L('">이어하기 · ')+T.rounds[run.round]+'</button>';
    else h+=__L('<div class="rk-ent">오늘 도전권 ')+left+' / '+T.entries+'</div><button class="btn'+(left?' primary':'')+'" data-rk="'+kind+'"'+(left?'':' disabled')+'>'+(left?__L('도전하기 (도전권 1장)'):__L('내일 다시 도전'))+'</button>';
    if(save.trial.titles[kind])h+='<div class="rk-won">🏆 '+(kind==='city'?__L('시 대표 선발'):kind==='nat'?__L('국가대표 선발'):__L('세계 대회 우승'))+' '+save.trial.titles[kind]+__L('회</div>');
    h+='</div>';
  }
  h+='</div>'+seasonBoxHtml()+devCardHtml()+__L('<div class="odds">티어 게임만 감독 레이팅에 반영돼요. 일반 게임(빠른 경기 · 토너먼트 · 연습 · 챌린지 · 자유 경기)은 레이팅이 바뀌지 않아요.<br>선발전은 한 판이라도 지거나 비기면 탈락이에요. 시작 후 20초가 지난 티어 게임을 나가면 기권 패이고, 선발전도 탈락 처리돼요.</div>');
  el.innerHTML=h;
  el.querySelectorAll('[data-rk]').forEach(b=>{b.onclick=()=>{const k=b.dataset.rk;if(k==='ranked')rankedStart();else trialStart(k);};});
}

/* ---------- final tier: 개발자 + exclusive 큰바다쇠오리 ---------- */
const TIER_IC=['🥉','🥈','🥇','💠','💎','👑','🔥','💻'];
const TITLE_NM=kind=>kind==='city'?escH(save.profile.city)+__L('시 대표'):kind==='nat'?__L('국가대표'):__L('세계 챔피언');
function devCheck(){   // first time the rating reaches the last tier: title + exclusive character (once)
  if(save.dev.got||tierOf(save.mgr.r).i!==TIERS.length-1)return false;
  save.dev.got=true;save.dev.ts=Date.now();
  if(!save.types.includes('auk'))save.types.push('auk');save.lv.auk=Math.max(save.lv.auk|0,MAX_LV);
  persist();return true;
}
function devCardHtml(){
  const T_=TIERS[TIERS.length-1],got=save.dev.got;
  return '<div class="rk-dev'+(got?' got':'')+'"><div style="--cw:86px">'+cardHtml('auk',{lv:MAX_LV,tag:got?__L('보유'):''})+__L('</div><div><b>💻 최종 티어 · 개발자</b><small>레이팅 ')+T_.min+__L(' 달성 시 지급 (한 번)<br>칭호 <b>💻 개발자</b> + 최고급 캐릭터 <b>큰바다쇠오리</b> (Lv.10 · 전용 특수기술 큰바다 돌진)</small>')+(got?__L('<div class="rk-won">✔ 획득 완료 · 팀 편성에서 주장으로 쓸 수 있어요</div>'):__L('<div class="rk-ent">현재 ')+save.mgr.r+' / '+T_.min+'</div>')+'</div></div>';
}
function devReveal(){
  if(window.__NOFX)return;
  const v=$('#devFx');$('#devCard').innerHTML='<div style="--cw:'+Math.floor(Math.min(innerWidth*.42,(innerHeight-190)/1.42,230))+'px">'+cardHtml('auk',{lv:MAX_LV,tag:'NEW'})+'</div>';
  v.classList.add('on');SFX.win();vib([40,40,40,40,200]);
  $('#devOk').onclick=()=>{SFX.ui();v.classList.remove('on');};
  $('#devUse').onclick=()=>{SFX.ui();v.classList.remove('on');save.type='auk';persist();toMenu();goScreen('sSquad');};
}
function aukBeak(inner){   // great auk: tall, laterally compressed, hooked black bill with white grooves
  const bm=std(0x111216,.28,.2),wm=MAT.white;
  const ug=new T.ConeGeometry(.12,.46,16);ug.scale(.62,1,1.35);const up=new T.Mesh(ug,bm);up.rotation.x=Math.PI/2+.16;up.position.set(0,1.385,.53);up.castShadow=true;inner.add(up);
  const lg=new T.ConeGeometry(.085,.34,14);lg.scale(.6,1,1.1);const lo=new T.Mesh(lg,bm);lo.rotation.x=Math.PI/2+.02;lo.position.set(0,1.3,.49);inner.add(lo);
  for(const z of[.5,.58])for(const s of[-1,1]){const g=new T.Mesh(new T.BoxGeometry(.006,.15,.022),wm);g.position.set(s*.043,1.36,z);g.rotation.x=.25;inner.add(g);}
  const hk=new T.Mesh(new T.ConeGeometry(.03,.09,8),bm);hk.rotation.x=Math.PI;hk.position.set(0,1.33,.75);inner.add(hk);
  const badge=new T.Mesh(new T.CylinderGeometry(.075,.075,.02,20),MAT.gold);badge.rotation.x=Math.PI/2;badge.position.set(.2,1.0,.5);badge.rotation.z=.3;inner.add(badge);
}
function aukSVG(){   // card art: great auk (큰바다쇠오리) - black back, white belly, white spot before the eye, deep hooked grooved bill
  const R='rgba(190,215,255,.75)';
  return '<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="akG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4360"/><stop offset="1" stop-color="#171b2a"/></linearGradient><radialGradient id="akH" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#4a5374"/><stop offset="1" stop-color="#181c2c"/></radialGradient></defs>'
   +'<ellipse cx="60" cy="134" rx="32" ry="5" fill="rgba(0,0,0,.35)"/>'
   +'<path d="M38 126q-9 5-2 8h18q2-5-6-8z" fill="#22252f" stroke="'+R+'" stroke-width=".8"/><path d="M72 126q-9 5-2 8h18q2-5-6-8z" fill="#22252f" stroke="'+R+'" stroke-width=".8"/>'
   +'<ellipse cx="28" cy="94" rx="7" ry="21" fill="url(#akG)" stroke="'+R+'" stroke-width="1" transform="rotate(18 28 94)"/><ellipse cx="92" cy="94" rx="7" ry="21" fill="url(#akG)" stroke="'+R+'" stroke-width="1" transform="rotate(-18 92 94)"/>'
   +'<path d="M60 56c-21 0-32 21-32 44 0 19 13 30 32 30s32-11 32-30c0-23-11-44-32-44z" fill="url(#akG)" stroke="'+R+'" stroke-width="1.2"/>'
   +'<path d="M60 70c-13 0-20 15-20 31 0 15 9 24 20 24s20-9 20-24c0-16-7-31-20-31z" fill="#f6faff"/>'
   +'<circle cx="60" cy="44" r="23" fill="url(#akH)" stroke="'+R+'" stroke-width="1.2"/>'
   +'<ellipse cx="49.5" cy="41" rx="5.6" ry="7.6" fill="#f6faff" transform="rotate(-24 49.5 41)"/><ellipse cx="70.5" cy="41" rx="5.6" ry="7.6" fill="#f6faff" transform="rotate(24 70.5 41)"/>'
   +'<circle cx="43" cy="37" r="2.9" fill="#0b0b0f" stroke="#c8d2e8" stroke-width=".8"/><circle cx="43.8" cy="36.2" r=".9" fill="#fff"/><circle cx="77" cy="37" r="2.9" fill="#0b0b0f" stroke="#c8d2e8" stroke-width=".8"/><circle cx="77.8" cy="36.2" r=".9" fill="#fff"/>'
   +'<path d="M53 43q7-5 14 0l-2.5 20q-4.5 9-9 0z" fill="#0e1016" stroke="#5a6385" stroke-width="1"/>'
   +'<path d="M57 63q3 9 6 0" fill="#0e1016" stroke="#5a6385" stroke-width=".9"/>'
   +'<path d="M54.6 50q5.4 3 10.8 0M55.4 56q4.6 2.6 9.2 0" stroke="#f6faff" stroke-width="1.7" fill="none" stroke-linecap="round"/>'
   +'<circle cx="76" cy="100" r="6.5" fill="#ffd45e" stroke="#fff3b0" stroke-width="1.2"/><text x="76" y="102.6" text-anchor="middle" font-size="6.5" font-weight="700" fill="#5a3b00">DEV</text>'
   +'</svg>';
}


/* ================= v10: penguin personalities, arenas, aim preview, comfort settings ================= */
// --- per-type personality: a clear strength AND a weakness (applies to every skater of that type, AI included) ---
const TT={
  basic:{name:__L('올라운더'),plus:__L('특수 기술 쿨다운 -12%'),minus:__L('뚜렷한 강점은 없어요'),cd:.88},
  fast:{name:__L('퀵 릴리스'),plus:__L('슛 충전 속도 +15%'),minus:__L('강슛 최대 위력 -6%'),chg:1.15,pow:.94},
  strong:{name:__L('헤비 샷'),plus:__L('강슛 위력 +6%'),minus:__L('넘어지면 회복이 25% 느려요'),pow:1.06,fall:1.25},
  defense:{name:__L('롱 스틱'),plus:__L('상대 패스·슛 가로채기 범위 +0.25m'),minus:__L('슛 정확도 -25%'),reach:.25,spread:1.25},
  balanced:{name:__L('플레이메이커'),plus:__L('패스 속도 +10% · 원타이머 위력 +5%'),minus:__L('대시 재사용 +0.4초'),pass:1.1,ot:1.05,dashCd:.4},
  auk:{name:__L('바다의 지배자'),plus:__L('능력치 999 · 모든 능력 최강'),minus:__L('없음')}
};
const ttOf=p=>(p&&!p.goalie&&TT[p.type])||{};
const ttLine=k=>{const t=TT[k];return t?'<b>'+t.name+__L('</b> · 강점: ')+t.plus+__L(' · 약점: ')+t.minus:'';};
// one-timer: shooting within this window after receiving a pass (pre-charge while the pass is coming!)
const OT_WIN=.75;

// --- comfort settings ---
function shakeK(){if(save.set.motion)return 0;const v={on:1,low:.4,off:0}[save.set.shake];return v===undefined?1:v;}
function applyFxSettings(){
  document.body.classList.toggle('noflash',!save.set.flash||save.set.motion);
  document.body.classList.toggle('rm',!!save.set.motion);
  SFX.setVol({low:.35,mid:.7,high:1}[save.set.vol]||.7);
}

// --- arenas (decorative; no stat effects) ---
const ARENAS={
  classic:{name:__L('기본 링크')},
  aurora:{name:__L('오로라 나이트'),tod:.95,wx:'clear',lamp:[.45,.95,1],aur:1.7},
  blizzard:{name:__L('눈보라 아레나'),tod:.16,wx:'blizzard',lamp:[.9,.95,1]},
  sunset:{name:__L('선셋 컵'),tod:.5,wx:'clear',lamp:[1,.7,.42]},
  final:{name:__L('결승 무대'),tod:.8,wx:'light',lamp:[1,.84,.42],aur:.9,fireworks:true,cheer:.35}
};
G.arena='classic';let arenaLampKey='',arenaWx='',fwT=0,champT=0;
function arenaPick(cfg){
  if(!cfg||cfg.demo)return 'classic';
  if(cfg.final)return 'final';
  const a=save.set.arena;if(a==='final'&&!save.cleared.tour)return 'classic';
  return ARENAS[a]&&a!=='auto'?a:'classic';
}
function arenaLamps(){
  const A=ARENAS[G.arena]||ARENAS.classic,key=G.arena;if(key===arenaLampKey)return;arenaLampKey=key;
  const c=A.lamp||[1,.94,.8];
  for(const l of lamps){l.pl.color.setRGB(c[0],c[1],c[2]);l.glow.material.color.setRGB(c[0],c[1],c[2]);}
}
function fireworkBurst(big){
  const x=rnd(-26,26),y=rnd(9,15),z=-rnd(D+5,D+11);
  const pal=[[1,.85,.3],[1,.45,.55],[.45,.85,1],[.7,1,.6],[1,1,1]],c=pal[(Math.random()*pal.length)|0];
  const n=big?80:46;
  for(let i=0;i<n;i++){const a=rnd(TAU),b=rnd(-1,1),s=rnd(6,10)*(big?1.2:1),r=Math.sqrt(1-b*b);emit(x,y,z,Math.cos(a)*r*s,b*s+4,Math.sin(a)*r*s,rnd(1,1.7),rnd(.45,.8),c[0],c[1],c[2]);}
  SFX.firework();
}
function arenaFrame(dt){
  arenaDecoFrame();nearLampFrame();rinkFrame(dt);
  if(G.view!=='game'){return;}
  const A=ARENAS[G.arena]||ARENAS.classic;
  if(A.cheer)G.cheer=Math.max(G.cheer,A.cheer);
  if(champT>0){champT-=dt;fwT-=dt;if(fwT<=0){fwT=.35;fireworkBurst(true);}return;}
  if(!A.fireworks||save.set.quality==='low'&&G.state==='play')return;
  fwT-=dt;
  const busy=G.state==='ready'||G.state==='goal';
  if(fwT<=0){fwT=busy?.7:rnd(5,8);fireworkBurst(busy);}
}

// --- arena dressing visible from the game camera: LED board strip, centre-ice logo, ice glow / sweeping spotlights ---
const ARENA_DECO={aurora:{led:[.35,1,.85],led2:[.7,.45,1],logo:'AURORA NIGHT',sym:'✦',lc:'#7ff6ff',exp:.8},
  blizzard:{led:[.4,.75,1],led2:[.85,.95,1],logo:'BLIZZARD ARENA',sym:'❄',lc:'#4f9be0',exp:1},
  sunset:{led:[1,.6,.25],logo:'SUNSET CUP',sym:'☀',lc:'#ffb15a',exp:1},
  final:{led:[1,.8,.3],led2:[1,1,1],logo:'GRAND FINAL',sym:'🏆',lc:'#ffd25a',exp:.9,spots:true}};
const arenaG=new T.Group();arenaG.visible=false;scene.add(arenaG);
const ledMat=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false});
{
  const P=perimeter(),segs=[];
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;if(Math.abs(mx)>W-0.2&&Math.abs(mz)<GW+0.1)continue;segs.push({a,b,mx,mz});}
  const led=new T.InstancedMesh(new T.BoxGeometry(1,1,1),ledMat,segs.length),o=new T.Object3D();
  segs.forEach((sg,i)=>{const dx=sg.b[0]-sg.a[0],dz=sg.b[1]-sg.a[1],L=Math.hypot(dx,dz),n=outN(sg.mx,sg.mz);o.rotation.set(0,Math.atan2(-dz,dx),0);o.position.set(sg.mx-n[0]*.008,.432,sg.mz-n[1]*.008);o.scale.set(L+.08,.05,.03);o.updateMatrix();led.setMatrixAt(i,o.matrix);});
  arenaG.add(led);
}
const logoC=document.createElement('canvas');logoC.width=logoC.height=512;const logoX=logoC.getContext('2d'),logoTex=new T.CanvasTexture(logoC);
const logo=new T.Mesh(new T.PlaneGeometry(8.6,8.6),new T.MeshBasicMaterial({map:logoTex,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
logo.rotation.x=-Math.PI/2;logo.position.y=.016;logo.renderOrder=1;arenaG.add(logo);
function drawLogo(d){
  const x=logoX;x.clearRect(0,0,512,512);x.save();x.translate(256,256);
  x.strokeStyle=d.lc;x.lineWidth=14;x.globalAlpha=.9;x.beginPath();x.arc(0,0,236,0,TAU);x.stroke();x.lineWidth=5;x.beginPath();x.arc(0,0,206,0,TAU);x.stroke();
  x.fillStyle=d.lc;x.font='bold 150px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(d.sym,0,-46);
  x.font='bold 54px sans-serif';x.fillText(d.logo,0,92,400);x.restore();logoTex.needsUpdate=true;
}
const glowM=new T.MeshBasicMaterial({map:glowTex('rgba(255,255,255,1)','rgba(255,255,255,.35)'),transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
const spots=[0,1].map(()=>{const m=new T.Mesh(new T.PlaneGeometry(13,13),glowM);m.rotation.x=-Math.PI/2;m.position.y=.02;m.renderOrder=1;arenaG.add(m);return m;});
let arenaDecoKey='';
function arenaDecoFrame(){
  const d=G.view==='game'&&ARENA_DECO[G.arena];
  if(!d){if(arenaDecoKey){arenaDecoKey='';arenaG.visible=false;}return;}
  if(arenaDecoKey!==G.arena){arenaDecoKey=G.arena;drawLogo(d);arenaG.visible=true;glowM.color.setRGB(d.led[0],d.led[1],d.led[2]);}
  const t=G.t,c2=d.led2||d.led,k=.5+.5*Math.sin(t*1.6);
  ledMat.color.setRGB(lerp(d.led[0],c2[0],k)*1.3,lerp(d.led[1],c2[1],k)*1.3,lerp(d.led[2],c2[2],k)*1.3);
  const on=d.spots||G.arena==='aurora';glowM.opacity=on?(G.arena==='aurora'?.13+.06*Math.sin(t*.7):.2):0;
  spots[0].position.x=Math.sin(t*.45)*W*.55;spots[0].position.z=Math.sin(t*.9)*D*.45;
  spots[1].position.x=-Math.sin(t*.4+1)*W*.55;spots[1].position.z=Math.cos(t*.8)*D*.45;
  spots[0].visible=spots[1].visible=on;
}

// --- shot preview: dashed line to the first board / goal it would hit (green = on frame) ---
const AIM_N=26,aimLineGeo=new T.BufferGeometry();aimLineGeo.setAttribute('position',new T.BufferAttribute(new Float32Array(AIM_N*3),3));
const aimDotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='rgba(0,40,60,.55)';x.beginPath();x.arc(32,32,30,0,Math.PI*2);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(32,32,20,0,Math.PI*2);x.fill();return new T.CanvasTexture(c);})();
const aimLine=new T.Points(aimLineGeo,new T.PointsMaterial({color:0xffffff,size:.78,map:aimDotTex,transparent:true,opacity:.9,depthTest:false,depthWrite:false,sizeAttenuation:true}));
aimLine.renderOrder=6;aimLine.frustumCulled=false;aimLine.visible=false;scene.add(aimLine);
const aimTgt=new T.Mesh(new T.RingGeometry(.32,.5,24),new T.MeshBasicMaterial({color:0x22d36a,transparent:true,opacity:.95,depthTest:false,depthWrite:false,side:T.DoubleSide}));
aimTgt.rotation.x=-Math.PI/2;aimTgt.visible=false;aimTgt.renderOrder=6;scene.add(aimTgt);
function shotPath(x0,z0,ax,az,dir){   // straight-line preview; returns end point and whether it enters the goal mouth
  let t=1e9;
  if(Math.abs(ax)>1e-4){const tx=((ax>0?W:-W)-x0)/ax;if(tx>0)t=Math.min(t,tx);}
  if(Math.abs(az)>1e-4){const tz=((az>0?D:-D)-z0)/az;if(tz>0)t=Math.min(t,tz);}
  t=Math.min(t,40);const ex=x0+ax*t,ez=z0+az*t;
  const on=ax*dir>.05&&Math.abs(ex-dir*W)<.05&&Math.abs(ez)<GW-.1;
  return{ex,ez,on,t};
}
function aimPreview(pl,a){
  const pk=G.puck,show=pl&&pl.charging&&canHit(pl)&&G.state==='play';
  if(!show){aimLine.visible=false;aimTgt.visible=false;return;}
  const r=shotPath(pk.rx,pk.rz,a[0],a[1],pl.team.dir),arr=aimLineGeo.attributes.position.array;
  // dots get denser with charge; they scroll toward the target so the direction reads at a glance
  const n=Math.max(6,Math.round(AIM_N*(.35+.65*pl.charge))),step=Math.max(.6,r.t/n),off=(G.t*3)%1;
  for(let i=0;i<AIM_N;i++){const d=i<n?Math.min(r.t,(i+off)*step+.6):-1;arr[i*3]=d<0?0:pk.rx+a[0]*d;arr[i*3+1]=d<0?-50:.08;arr[i*3+2]=d<0?0:pk.rz+a[1]*d;}
  aimLineGeo.attributes.position.needsUpdate=true;
  aimLine.material.color.setHex(r.on?0x14c864:0x2f86e0);aimLine.material.opacity=.6+.4*pl.charge;aimLine.visible=true;
  if(r.on){aimTgt.visible=true;aimTgt.position.set(r.ex-pl.team.dir*.15,.08,r.ez);aimTgt.scale.setScalar(1+.15*Math.sin(G.t*10));}else aimTgt.visible=false;
}

// --- feedback helpers ---
function passFeedback(ps,why){
  if(!G.mine||ps.from.team!==G.mine||!G.cfg||G.cfg.mode==='demo')return;
  const tgt=ps.to||ps.from;
  popAt(why==='cut'?__L('패스 차단!'):__L('패스 실패'),tgt.x,2.2,tgt.z);SFX.passBad(why==='cut');
}
function whiffFx(p){
  if(!p.human)return;
  popAt(__L('헛스윙!'),p.x,2.1,p.z);
  const fx=Math.sin(p.heading),fz=Math.cos(p.heading);for(let i=0;i<6;i++)emit(p.x+fx*.9,.25,p.z+fz*.9,fx*rnd(1,3)+rnd(-1,1),rnd(.5,1.6),fz*rnd(1,3)+rnd(-1,1),.35,.16,.8,.85,.9);
}
function fitBanner(){const b=$('#banner');b.style.fontSize='';const w=b.scrollWidth,lim=innerWidth*.94;if(w>lim){const fs=parseFloat(getComputedStyle(b).fontSize)||60;b.style.fontSize=Math.floor(fs*lim/w)+'px';}}

// --- match start hook ---
function v10MatchStart(cfg){
  G.arena=arenaPick(cfg);champT=0;fwT=1.2;arenaLampKey='';arenaWx='';
  const A=ARENAS[G.arena];
  if(G.arena!=='classic'&&!cfg.tutorial)setTimeout(()=>{if(G.view==='game'&&G.state==='ready')hypeToast((cfg.final?'🏆 ':'🏟 ')+A.name+(cfg.final?' · FINAL':''));},350);
  const ch=cfg.challenge;
  if(ch&&ch.kind==='comeback'&&G.mine){G.mine.opp.score=1;updateScoreHud();if(G.hype)G.hype.wasBehind=true;}
  aimLine.visible=false;aimTgt.visible=false;funReset();condStart(cfg);rulesReset();setTimeout(()=>{if(G.view==='game'&&G.cfg===cfg)rulesIntro();},700);
  if(cfg.mode==='shootout')soStart();
  try{clearTimeout(hypeBanner.t);clearTimeout(showBanner.t);$('#banner').className='';$('#bannerSub').className='';$('#pops').innerHTML='';}catch(e){}   // nothing from the previous match carries over
}
// --- WebGL context loss: offer a reload if the browser never restores it ---
let ctxLostT=0;
function ctxWatch(){if(!ctxLost){ctxLostT=0;return;}ctxLostT++;if(ctxLostT===6){$('#fbMsg').textContent=__L('그래픽(WebGL)이 복구되지 않았어요. 진행 상황은 저장되어 있으니 다시 불러와 주세요.');$('#fallback').style.display='flex';}}
setInterval(ctxWatch,1000);
function blurUI(){try{const a=document.activeElement;if(a&&a!==document.body&&a.blur)a.blur();}catch(e){}}
// --- AI judgement helpers ---
function gkRead(g,tm){   // a goalie reads a visible wind-up: the longer the charge, the clearer the aim. Quick releases and late aim changes beat it.
  const gk=G.diff.gk,pk=G.puck;if(!gk.read||!tm.opp)return null;let best=null;const gx=-tm.dir*W;
  for(const s of tm.opp.skaters){
    if(!s.charging||s.fall>0)continue;if(Math.hypot(pk.x-s.x,pk.z-s.z)>2.6||Math.abs(gx-pk.x)>19)continue;
    let a;if(s.human)a=humanAim(s);else{const tz=s.ai.plan&&s.ai.plan.tz!=null?s.ai.plan.tz:0,l=Math.hypot(gx-pk.x,tz-pk.z)||1;a=[(gx-pk.x)/l,(tz-pk.z)/l];}
    if(a[0]*(gx-pk.x)<=.05)continue;const z=pk.z+a[1]*((gx-pk.x)/a[0]);if(Math.abs(z)>GW+1.2)continue;
    const w=gk.read*CF.read*clamp((s.charge-.12)/.5,0,1);if(!best||w>best.w)best={z:clamp(z,-(GW-.55),GW-.55),w};
  }
  return best;
}
function aiPlanTz(p){const og=p.team.opp.goalie,df=G.diff;let side;
  if(og){const gz=og.z;side=Math.abs(gz)<.5?(Math.random()<.5?-1:1):(gz>0?-1:1);}else side=Math.random()<.5?-1:1;
  return side*rnd(1.1,GW-.7)+(Math.random()-.5)*df.aim*5;}
function aiIntercept(p){
  if(G.royal)return false;   // read an opponent pass and step into its lane (chance depends on difficulty)
  const ps=G.pass,df=G.diff;if(!ps||ps.from.team===p.team||!df.icpt||p.passive||p.fall>0)return false;
  if(p.ai.icptRoll!==ps.t){p.ai.icptRoll=ps.t;p.ai.icptOk=Math.random()<df.icpt;}
  if(!p.ai.icptOk)return false;
  const pk=G.puck,vx=pk.vx,vz=pk.vz,v2=vx*vx+vz*vz;if(v2<16)return false;
  const t=clamp(((p.x-pk.x)*vx+(p.z-pk.z)*vz)/v2,0,1.2),ix=pk.x+vx*t,iz=pk.z+vz*t;
  const d=Math.hypot(ix-p.x,iz-p.z),reachT=d/Math.max(6,(7+1.4*p.ty.stats.speed)*.8);
  if(d>5||reachT>t+.25)return false;
  p.ai.tx=clamp(ix,-W+1,W-1);p.ai.tz=clamp(iz,-D+1,D-1);p.ai.full=true;p.ai.mode='icpt';return true;
}
function arenaWeather(w){
  const A=ARENAS[G.arena];
  if(G.view!=='game'||!A||!A.wx){if(arenaWx){arenaWx='';w.t=Math.min(w.t,3);}return;}
  w.t=Math.max(w.t,5);w.target={clear:.08,light:.3,blizzard:.88}[A.wx];w.wind=A.wx==='blizzard'?13:2;
  if(arenaWx!==A.wx){arenaWx=A.wx;w.mode=A.wx==='blizzard'?'blizzard':A.wx==='clear'?'clear':'snow';$('#wx').textContent=w.mode==='clear'?'☀️':w.mode==='snow'?'❄️':'🌨️';}
}
function chalMeta(c){
  let h=__L('<small class="chal-r">보상: ')+(save.cleared[c.id]?__L('클리어 완료 · 다시 하면 5P'):__L('첫 클리어 ⭐')+(c.pts||40)+'P');
  if(c.kind==='types')h+=__L('<br>진행 ')+Math.min(c.need,save.chalTypes.length)+' / '+c.need+(save.chalTypes.length?' ('+save.chalTypes.map(k=>TYPES[k].name).join(', ')+')':'')+__L(' · 현재 주장: ')+TYPES[save.type].name;
  return h+'</small>';
}
// --- double-tap guard for actions that spend points/cards (a fast double tap on phones used to run them twice) ---
{let dupK='',dupT=0;
 document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-act="enh"],[data-act="mkref"],[data-sell],[data-sqbuy],[data-buy]');if(!b)return;
   const d=b.dataset,k=(d.act||'')+'|'+(d.k||'')+'|'+(d.g||'')+'|'+(d.sell||'')+'|'+(d.sqbuy||'')+'|'+(d.buy||''),now=performance.now();
   if(k===dupK&&now-dupT<350){e.stopImmediatePropagation();e.preventDefault();return;}dupK=k;dupT=now;},true);}
// --- redeem codes (설정 › 코드 입력) ---
function redeemCode(raw){
  const c=String(raw||'').trim().toLowerCase();
  if(!c){flashMsg(__L('코드를 입력하세요'));return false;}
  if(c!=='ysgames777'){flashMsg(__L('올바르지 않은 코드예요'));return false;}
  if(save.codes.includes(c)){flashMsg(__L('이미 사용한 코드예요'));return false;}
  const had=save.types.includes('auk');save.codes.push(c);
  if(!had)save.types.push('auk');save.lv.auk=Math.max(save.lv.auk|0,MAX_LV);persist();
  SFX.init();SFX.win();vib([30,40,30,40,120]);
  flashMsg(had?__L('코드 사용 완료! (큰바다쇠오리는 이미 가지고 있어요)'):__L('🎉 큰바다쇠오리 획득! 팀 편성에서 주장으로 쓸 수 있어요'));
  if(!had)hypeToast(__L('🎉 큰바다쇠오리 (능력치 999) 획득!'));
  return true;
}
$('#codeGo').onclick=()=>{if(redeemCode($('#codeIn').value))$('#codeIn').value='';};
$('#codeIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#codeGo').click();}});
// near-side lamp posts sit between the game camera and the rink at the ends of the ice: hide their meshes in matches (lights stay on)
const nearLampMeshes=[];for(const l of lamps){const g=l.bulb.parent;if(g&&g.position.z>0)for(const c of g.children)if(!c.isLight)nearLampMeshes.push(c);}
let nearLampOn=true;
function nearLampFrame(){const want=G.view!=='game';if(want===nearLampOn)return;nearLampOn=want;for(const m of nearLampMeshes)m.visible=want;}


/* ================= v10 fun pack: ice items, FEVER TIME, shootout ================= */
// ---------- ice items ----------
const ITEMS={
  fish:{ico:'🐟',name:__L('생선'),desc:__L('4초 스피드 업 + 특수 게이지 충전')},
  snow:{ico:'⛄',name:__L('눈덩이'),desc:__L('가장 가까운 상대를 넘어뜨려요')},
  fire:{ico:'🔥',name:__L('불꽃 퍽'),desc:__L('다음 슛 위력 +25%')},
  magnet:{ico:'🧲',name:__L('자석'),desc:__L('3초 동안 퍽을 끌어당겨요')}
};
const ITEM_KEYS=Object.keys(ITEMS);
const itemTex={};
for(const k of ITEM_KEYS){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  x.fillStyle='rgba(10,31,58,.92)';x.beginPath();x.arc(64,64,58,0,TAU);x.fill();
  x.lineWidth=7;x.strokeStyle='#ffc93c';x.beginPath();x.arc(64,64,55,0,TAU);x.stroke();
  x.font='64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(ITEMS[k].ico,64,70);
  itemTex[k]=new T.CanvasTexture(c);
}
const itemPool=[0,1,2].map(()=>{
  const g=new T.Group();
  const s=new T.Sprite(new T.SpriteMaterial({map:itemTex.fish,transparent:true,depthWrite:false}));s.scale.set(1.75,1.75,1);s.position.y=1.1;g.add(s);
  const r=new T.Mesh(new T.RingGeometry(.62,.8,28),new T.MeshBasicMaterial({color:0xffc93c,transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide}));r.rotation.x=-Math.PI/2;r.position.y=.05;g.add(r);
  g.visible=false;scene.add(g);return {g,s,r,used:false};
});
const snowMesh=new T.Mesh(new T.SphereGeometry(.22,12,8),std(0xffffff,.6));snowMesh.visible=false;snowMesh.castShadow=true;scene.add(snowMesh);
G.items=[];G.itemT=6;G.snowballs=[];
function itemsOn(){const c=G.cfg;return !!(c&&save.set.items&&G.view==='game'&&['quick','free','tour'].includes(c.mode)&&!G.so);}
function itemsClear(){for(const it of G.items){it.slot.used=false;it.slot.g.visible=false;}G.items=[];G.snowballs=[];snowMesh.visible=false;G.itemT=rnd(6,9);}
function spawnItem(k,x,z){
  const slot=itemPool.find(s=>!s.used);if(!slot)return null;
  if(x===undefined){for(let i=0;i<12;i++){x=rnd(-W+6,W-6);z=rnd(-D+3,D-3);if(Math.hypot(x-G.puck.x,z-G.puck.z)>5)break;}}
  k=k||ITEM_KEYS[(Math.random()*ITEM_KEYS.length)|0];
  slot.used=true;slot.s.material.map=itemTex[k];slot.s.material.needsUpdate=true;slot.g.position.set(x,0,z);slot.g.visible=true;
  const it={k,x,z,life:14,slot};G.items.push(it);
  for(let i=0;i<14;i++){const a=rnd(TAU);emit(x,.4,z,Math.cos(a)*3,rnd(2,4),Math.sin(a)*3,.6,.2,1,.85,.3);}
  return it;
}
function applyItem(p,k){
  const I=ITEMS[k],mine=p.team===G.mine;
  if(k==='fish'){p.boostT=4;p.cd.special=Math.max(0,p.cd.special-3);}
  else if(k==='fire'){p.fireT=8;}
  else if(k==='magnet'){p.magT=3;}
  else if(k==='snow'){
    let tg=null,bd=16;for(const o of p.team.opp.skaters){if(o.frozen||o.fall>0)continue;const d=Math.hypot(o.x-p.x,o.z-p.z);if(d<bd){bd=d;tg=o;}}
    if(tg)G.snowballs.push({x0:p.x,z0:p.z,to:tg,t:0,by:p});else p.boostT=2;
  }
  popAt(I.ico+' '+I.name+'!',p.x,2.7,p.z);SFX.pickup();burst(p.x,p.z,10,1);
  if(mine){hypeToast(I.ico+' '+I.name+' · '+I.desc);vib(15);}
}
function itemFrame(dt){
  const on=itemsOn();
  if(!on){if(G.items.length||G.snowballs.length)itemsClear();return;}
  if(G.state!=='play')return;
  G.itemT-=dt;if(G.itemT<=0){G.itemT=rnd(9,15);if(G.items.length<2)spawnItem();}
  for(let i=G.items.length-1;i>=0;i--){
    const it=G.items[i];it.life-=dt;const g=it.slot.g;
    it.slot.s.position.y=1.1+Math.sin(G.t*3+i)*.15;it.slot.r.rotation.z+=dt*2;
    g.visible=it.life>3||Math.sin(G.t*20)>0;
    let taker=null;
    for(const p of G.pengs){if(p.goalie||p.frozen||p.fall>0)continue;if(Math.hypot(p.x-it.x,p.z-it.z)<1.2){taker=p;break;}}
    if(taker||it.life<=0){it.slot.used=false;g.visible=false;G.items.splice(i,1);if(taker)applyItem(taker,it.k);}
  }
  // snowball flight
  snowMesh.visible=false;
  for(let i=G.snowballs.length-1;i>=0;i--){
    const b=G.snowballs[i];b.t+=dt/.42;const k=Math.min(1,b.t),x=lerp(b.x0,b.to.x,k),z=lerp(b.z0,b.to.z,k),y=.8+Math.sin(k*Math.PI)*2.2;
    snowMesh.visible=true;snowMesh.position.set(x,y,z);emit(x,y,z,rnd(-.5,.5),rnd(0,.5),rnd(-.5,.5),.3,.12,1,1,1);
    if(b.t>=1){G.snowballs.splice(i,1);if(!b.to.frozen&&b.to.fall<=0){knock(b.to,1.05);popAt(__L('철퍼덕!'),b.to.x,2.4,b.to.z);}SFX.bump(.7);for(let j=0;j<18;j++){const a=rnd(TAU);emit(x,.6,z,Math.cos(a)*4,rnd(1,4),Math.sin(a)*4,.6,.22,1,1,1);}}
  }
  // effect visuals
  for(const p of G.pengs){
    if(p.frozen)continue;
    if(p.boostT>0&&Math.random()<dt*30)emit(p.x,.3,p.z,-p.vx*.1,rnd(.5,1.5),-p.vz*.1,.45,.2,.45,.85,1);
    if(p.fireT>0&&Math.random()<dt*25)emit(p.x+rnd(-.3,.3),1.2,p.z+rnd(-.3,.3),0,rnd(1,2.5),0,.4,.22,1,rnd(.35,.6),.1);
    if(p.magT>0&&Math.random()<dt*25){const pk=G.puck;emit(lerp(p.x,pk.x,Math.random()),.3,lerp(p.z,pk.z,Math.random()),0,.6,0,.35,.16,.5,.9,1);}
  }
  const pk=G.puck,ps=Math.hypot(pk.vx,pk.vz);
  if(pk.shot&&pk.shot.fire&&ps>6)for(let j=0;j<3;j++)emit(pk.x,.2,pk.z,-pk.vx*.05+rnd(-1,1),rnd(.5,2),-pk.vz*.05+rnd(-1,1),.35,.28,1,rnd(.3,.6),.05);
}
function v10Sim(h){   // magnet pull (fixed step)
  const pk=G.puck;
  for(const p of G.pengs){
    if(!(p.magT>0)||p.frozen||p.fall>0)continue;
    const dx=p.x-pk.x,dz=p.z-pk.z,d=Math.hypot(dx,dz);
    if(d>1.15&&d<7&&!(G.carry&&G.carry!==p)){const f=24*h;pk.vx+=dx/d*f;pk.vz+=dz/d*f;const sp=Math.hypot(pk.vx,pk.vz);if(sp>14){pk.vx*=14/sp;pk.vz*=14/sp;}}
  }
}
function v10ShotMul(p,tap){
  let m=1;p._fire=false;
  if(p.fireT>0&&!tap){m*=1.25;p.fireT=0;p._fire=true;}
  if(G.hype&&G.hype.feverT>0&&p.team===G.mine)m*=1.08;
  return m;
}
function fxChipFrame(){
  const el=$('#fxChip');if(!el)return;const p=G.player;let t='';
  if(p&&G.view==='game'){const a=[];if(p.boostT>0)a.push('🐟 '+p.boostT.toFixed(1));if(p.fireT>0)a.push(__L('🔥 다음 슛 강화'));if(p.magT>0)a.push('🧲 '+p.magT.toFixed(1));chip18(p,a);pcChip(a);t=a.join('  ');}
  if(el.textContent!==t){el.textContent=t;el.classList.toggle('on',!!t);}
}

// ---------- FEVER TIME ----------
function feverStart(){
  const h=G.hype;if(!h||!G.mine||G.so)return;
  h.feverT=8;h.feverN=(h.feverN||0)+1;
  hypeToast(__L('🔥 FEVER TIME! 8초 동안 슛·스피드 UP'));SFX.win();G.cheer=1;vib([20,30,20,30,60]);
}
function feverFrame(dt){
  const h=G.hype,on=!!(h&&h.feverT>0&&G.view==='game'&&!G.so);
  document.body.classList.toggle('fever',on);
  const el=$('#fever');
  if(!on){if(el.className)el.className='';return;}
  if(G.state==='play'){h.feverT-=dt;if(h.feverT<=0){h.feverT=0;hypeToast(__L('피버 종료 · 다시 콤보 x5에 도전!'));}}
  const txt='🔥 FEVER '+Math.ceil(h.feverT);if(el.textContent!==txt)el.textContent=txt;el.className='on';
}

// ---------- SHOOTOUT ----------
function soAllowed(){return !!(G.mine&&G.cfg&&G.cfg.time&&!G.cfg.challenge&&G.cfg.mode!=='demo');}
function soStart(){
  rulesClearBox();if(G.rl)G.rl.thaw=false;G.so={turn:0,res:{mine:[],opp:[]},s:{mine:0,opp:0},t:0,phase:'pre',wait:0,done:false,shooterTeam:null};
  G.ot=false;itemsClear();if(G.hype){G.hype.feverT=0;G.hype.combo.n=0;G.hype.combo.t=0;}comboHide();
  $('#clock').textContent='SO';lastClock='SO';
  const mt=$('#modeTag');mt.textContent='🥅 SHOOTOUT';mt.classList.add('sd');
  hypeBanner('SHOOTOUT!',[__L('🥅 승부차기 · ')+((G.cfg&&G.cfg.soRounds)||3)+__L('번씩, 같으면 서든데스')],3,'');SFX.whistle();
  soSetup();
}
function soSetup(){
  const so=G.so,tm=so.turn%2===0?G.mine:G.mine.opp,pk=G.puck;
  for(const p of G.pengs){if(p.goalie)continue;p.frozen=true;p.x=p.ox=p.rx=0;p.z=p.oz=p.rz=-D-6;p.vx=p.vz=0;p.charging=false;p.charge=0;p.boostT=p.fireT=p.magT=0;p.rushT=p.shadowT=p.eyeT=p.hopT=p.ramT=p.dbl=p.otWin=0;}
  const s=tm.skaters[0];
  s.frozen=false;s.x=s.ox=s.rx=-tm.dir*3;s.z=s.oz=s.rz=0;s.vx=s.vz=0;s.heading=tm.dir>0?Math.PI/2:-Math.PI/2;s.fall=0;s.getup=0;s.slow=0;s.dashT=0;s.slideT=0;s.cd.shoot=s.cd.pass=0;s.ai.plan=null;s.ai.cool=0;s.pose='play';
  for(const g of[G.mine.goalie,G.mine.opp.goalie])if(g){g.x=g.ox=g.hx;g.z=g.oz=0;g.vx=g.vz=0;g.ai.zs=0;g.ai.seenT=0;g.diveT=0;g.dazT=0;g.pose='play';}
  pk.x=pk.ox=s.x+tm.dir*1.1;pk.z=pk.oz=0;pk.vx=pk.vz=0;pk.shot=null;pk.last=s;pk.lastTeam=tm;pk.lastT=G.t;G.pass=null;G.pending=null;
  setHuman(tm===G.mine?s:null);
  so.t=0;so.phase='play';so.shooterTeam=tm;
  G.state='ready';G.stateT=1.6;G.countN=3;
  showBanner(tm===G.mine?__L('내 차례! 7초 안에 슛'):__L('상대 차례 · 골키퍼를 믿어요'),1300,tm===G.mine?'g':'r');
  soHud();
}
function soGoal(tm){if(G.so&&G.so.phase==='play'&&tm===G.so.shooterTeam)soResult(true);}
function soResult(ok){
  const so=G.so,mine=so.shooterTeam===G.mine,key=mine?'mine':'opp';
  so.phase='wait';so.wait=1.6;so.res[key].push(ok);if(ok)so.s[key]++;
  if(ok){SFX.goal();G.cam.shake=Math.max(G.cam.shake,.45*shakeK());hypeBanner(mine?'GOAL!':__L('실점…'),[],mine?2:0,so.shooterTeam.key);
    const gx=so.shooterTeam.dir*W;for(let i=0;i<50;i++){const a=rnd(TAU),s=rnd(3,9);emit(gx,rnd(.6,2.5),rnd(-GW,GW),Math.cos(a)*s*.6,rnd(2,8),Math.sin(a)*s,rnd(.8,1.4),rnd(.2,.4),1,rnd(.7,1),rnd(.2,.6));}}
  else{SFX.save();hypeBanner(mine?__L('막혔다!'):'SAVE!',[],mine?0:2,mine?so.shooterTeam.opp.key:G.mine.key);}
  setHuman(null);soHud();
}
function soNext(){
  const so=G.so;so.turn++;
  const a=so.res.mine.length,b=so.res.opp.length,sa=so.s.mine,sb=so.s.opp,R=(G.cfg&&G.cfg.soRounds)||3;
  if(a<=R&&b<=R&&(sa+(R-a)<sb||sb+(R-b)<sa))return soEnd();
  if(a===b&&a>=R&&sa!==sb)return soEnd();
  if(a>=10&&b>=10)return soEnd();
  soSetup();
}
function soEnd(){
  const so=G.so;so.done=true;so.phase='done';
  for(const p of G.pengs)p.frozen=false;
  resetPositions();setHuman(G.mine.skaters[0]);soHud();
  SFX.whistle();endMatch();
}
function soFrame(dt){
  const so=G.so;if(!so||so.done||G.view!=='game')return;
  if(so.phase==='wait'){so.wait-=dt;if(so.wait<=0)soNext();return;}
  if(so.phase!=='play'||G.state!=='play')return;
  so.t+=dt;const pk=G.puck,sp=Math.hypot(pk.vx,pk.vz),def=so.shooterTeam.opp;
  const shotDone=pk.shot&&G.t-pk.shot.t>.35&&sp<2;
  const saved=pk.last&&pk.last.goalie&&pk.last.team===def;
  const wide=Math.abs(pk.x)>W-.2&&Math.abs(pk.z)>=GW-.05;
  if(so.t>7||shotDone||saved||wide)soResult(false);
}
function soHud(){
  const el=$('#soHud'),so=G.so;
  if(!so||so.done){el.className='';return;}
  const row=(nm,arr,col,me)=>{let m='';const n=Math.max(3,arr.length+(so.phase==='play'&&so.shooterTeam===(me?G.mine:G.mine.opp)?1:0));for(let i=0;i<n;i++)m+='<i class="'+(i<arr.length?(arr[i]?'g':'x'):'e')+'"></i>';return '<div class="so-r"><b style="color:'+col+'">'+nm+'</b>'+m+'</div>';};
  const mk=G.mine.key,ok=G.mine.opp.key;
  el.innerHTML=__L('<div class="so-t">🥅 승부차기 ')+so.s.mine+' : '+so.s.opp+'</div>'+row(mk==='blue'?'BLUE':'RED',so.res.mine,mk==='blue'?'#7fb6ff':'#ff8d99',true)+row(ok==='blue'?'BLUE':'RED',so.res.opp,ok==='blue'?'#7fb6ff':'#ff8d99',false);
  el.className='on';
}
function funFrame(dt){achFrame(dt);evFrame(dt);itemFrame(dt);feverFrame(dt);soFrame(dt);fxChipFrame();puckRing.material.color.setHex(G.carry&&G.view==='game'?(G.carry.team.key==='blue'?0x3d8bff:0xff4d5e):0x1d5fa8);}
function funReset(){itemsClear();evReset();G.so=null;try{$('#soHud').className='';$('#fever').className='';document.body.classList.remove('fever');}catch(e){}for(const p of G.pengs){p.frozen=false;p.boostT=p.fireT=p.magT=0;p.rushT=p.shadowT=p.eyeT=p.hopT=p.ramT=p.dbl=p.dazT=p.otWin=0;}G.royal=null;}


/* ================= v10 surprise rink events + shootout mode ================= */
const EVENTS={
  seal:{ico:'🦭',name:__L('바다표범 난입!'),desc:__L('빙판을 가로지르는 바다표범을 피하세요')},
  gust:{ico:'🌬️',name:__L('돌풍 주의!'),desc:__L('6초 동안 바람이 퍽과 펭귄을 밀어요')},
  fish:{ico:'🐟',name:__L('생선 비!'),desc:__L('관중이 아이템을 던졌어요')},
  golden:{ico:'⭐',name:__L('골든 퍽!'),desc:__L('15초 안에 넣는 다음 골은 2점')}
};
function eventsOn(){const c=G.cfg;return !!(c&&save.set.events&&G.view==='game'&&['quick','free','tour'].includes(c.mode)&&!G.so);}
// seal mesh
const seal=(()=>{const g=new T.Group(),m=std(0x8a96a3,.55,.05),d=std(0x6b7682,.55,.05);
  const b=new T.Mesh(new T.SphereGeometry(1,20,14),m);b.scale.set(.75,.55,1.35);b.position.y=.55;b.castShadow=true;g.add(b);
  const h=new T.Mesh(new T.SphereGeometry(.48,18,12),m);h.position.set(0,1.05,1.15);h.castShadow=true;g.add(h);
  const sn=new T.Mesh(new T.SphereGeometry(.24,12,8),std(0xb9c3cc,.5));sn.scale.set(1,.8,1.1);sn.position.set(0,.98,1.55);g.add(sn);
  for(const s of[-1,1]){const e=new T.Mesh(new T.SphereGeometry(.07,8,6),MAT.pupil);e.position.set(s*.2,1.18,1.52);g.add(e);
    const f=new T.Mesh(new T.SphereGeometry(1,10,8),d);f.scale.set(.42,.08,.24);f.position.set(s*.72,.25,.35);f.rotation.y=s*.5;g.add(f);}
  const tl=new T.Mesh(new T.SphereGeometry(1,10,8),d);tl.scale.set(.5,.07,.3);tl.position.set(0,.12,-1.35);g.add(tl);
  g.scale.setScalar(1.3);g.visible=false;scene.add(g);return g;})();
const puckMats=(()=>{const c=puckG.children,b=c[0].material,t=(c[2]||c[0]).material;return{b,t,bc:b.color.getHex(),tc:t.color.getHex(),be:b.emissive.getHex()};})();
function puckGold(on){puckMats.b.color.setHex(on?0xffc93c:puckMats.bc);puckMats.b.emissive.setHex(on?0x5a3a00:puckMats.be);puckMats.t.color.setHex(on?0xfff1b0:puckMats.tc);}
G.ev=null;G.evT=40;G.goldenT=0;
function evReset(){G.ev=null;G.evT=rnd(35,50);G.goldenT=0;seal.visible=false;puckGold(false);try{$('#evTag').className='';}catch(e){}}
function evStart(k){
  k=k||['seal','gust','fish','golden'][(Math.random()*4)|0];const E=EVENTS[k];
  hypeBanner(E.ico+' '+E.name,[E.desc],1,'');SFX.whistle();G.cheer=1;
  if(k==='seal'){const x=rnd(-W+8,W-8),dz=Math.random()<.5?1:-1;G.ev={k,t:0,dur:6.5,x,z:-dz*(D+1.5),dz,hitT:{}};seal.position.set(x,0,G.ev.z);seal.rotation.y=dz>0?0:Math.PI;seal.visible=true;SFX.honk();}
  else if(k==='gust'){const a=[0,Math.PI/2,Math.PI,-Math.PI/2][(Math.random()*4)|0];G.ev={k,t:0,dur:6,wx:Math.cos(a),wz:Math.sin(a)};}
  else if(k==='fish'){for(let i=0;i<3;i++)spawnItem(i===0?'fish':null);G.ev=null;}
  else if(k==='golden'){G.goldenT=15;puckGold(true);G.ev=null;}
}
function evFrame(dt){
  if(!eventsOn()){if(G.ev||G.goldenT>0||seal.visible)evReset();return;}
  if(G.state!=='play'){if(G.state==='goal'&&G.ev&&G.ev.k==='seal'){seal.visible=false;G.ev=null;}return;}
  G.evT-=dt;if(G.evT<=0&&!G.ev){G.evT=rnd(40,60);evStart();}
  if(G.goldenT>0){G.goldenT-=dt;if(G.goldenT<=0){G.goldenT=0;puckGold(false);hypeToast(__L('골든 퍽이 사라졌어요'));}
    if(Math.random()<dt*25){const pk=G.puck;emit(pk.x,.3,pk.z,rnd(-1,1),rnd(1,2.5),rnd(-1,1),.5,.2,1,.85,.3);}}
  const ev=G.ev;
  if(!ev){const el=$('#evTag'),txt=G.goldenT>0?__L('⭐ 골든 퍽 ')+Math.ceil(G.goldenT):'';if(el.textContent!==txt){el.textContent=txt;el.className=txt?'on':'';}return;}
  ev.t+=dt;
  if(ev.k==='seal'){
    const sp=(2*(D+1.5))/ev.dur;ev.z+=ev.dz*sp*dt;seal.position.set(ev.x,Math.abs(Math.sin(ev.t*5))*.12,ev.z);seal.rotation.z=Math.sin(ev.t*5)*.08;
    if(Math.random()<dt*20)emit(ev.x+rnd(-.6,.6),.15,ev.z-ev.dz*1.2,rnd(-1,1),rnd(.5,1.5),-ev.dz*rnd(.5,1.5),.5,.2,.9,.95,1);
    for(const p of G.pengs){if(p.goalie||p.frozen)continue;const dx=p.x-ev.x,dz=p.z-ev.z,d=Math.hypot(dx,dz);
      if(d<1.6&&!(ev.hitT[p.idx+p.team.key]>0)){ev.hitT[p.idx+p.team.key]=1;const l=d||1;p.vx+=dx/l*9;p.vz+=dz/l*9+ev.dz*4;if(knock(p,.8))popAt(__L('꽈당!'),p.x,2.3,p.z);SFX.bump(.8);}}
    const pk=G.puck,dx=pk.x-ev.x,dz=pk.z-ev.z,d=Math.hypot(dx,dz);
    if(d<1.5){const l=d||1;pk.vx=dx/l*12;pk.vz=dz/l*12+ev.dz*5;pk.x=ev.x+dx/l*1.55;pk.z=ev.z+dz/l*1.55;SFX.hit(.8);}
    if(ev.t>=ev.dur){seal.visible=false;G.ev=null;}
  }else if(ev.k==='gust'){
    if(Math.random()<dt*60){const cx=G.cam.x+rnd(-20,20),cz=G.cam.z+rnd(-12,12);emit(cx,rnd(.5,3),cz,ev.wx*rnd(14,22),0,ev.wz*rnd(14,22),.5,.12,.95,.98,1);}
    if(ev.t>=ev.dur)G.ev=null;
  }
  const el=$('#evTag'),txt=G.goldenT>0?__L('⭐ 골든 퍽 ')+Math.ceil(G.goldenT):(ev&&ev.k==='gust'?__L('🌬️ 돌풍 ')+Math.ceil(ev.dur-ev.t):'');
  if(el.textContent!==txt){el.textContent=txt;el.className=txt?'on':'';}
}
function evSim(h){   // gust push (fixed step)
  const ev=G.ev;if(!ev||ev.k!=='gust'||G.state!=='play')return;
  const pk=G.puck;pk.vx+=ev.wx*5*h;pk.vz+=ev.wz*5*h;
  for(const p of G.pengs){if(p.goalie||p.frozen)continue;p.vx+=ev.wx*2.6*h;p.vz+=ev.wz*2.6*h;}
}
function goldenGoal(tm){   // called from scored(): a golden-puck goal is worth 2
  if(!(G.goldenT>0))return false;
  G.goldenT=0;puckGold(false);tm.score++;$('#evTag').className='';
  return true;
}


/* ================= v10 stick-handling: carry the puck, dekes, steals, poke checks ================= */
// Measured before this change: the puck was loose 80% of the time and the average "control" lasted 0.29 s,
// because a skater could only bump the puck. Now a penguin that reaches the puck facing it keeps it on the stick.
G.carry=null;
const CARRY={catchR:.6,relMax:13,holdK:16,steal:3.0,aiSteal:{easy:.55,normal:.9,hard:1.25},poke:{easy:.6,normal:1.0,hard:1.5}};
const carryDist=p=>p.r+PUCKR+.12;
function canCarry(p){return !!p&&!p.goalie&&!p.frozen&&p.fall<=0&&p.getup<=0&&!((p.cd.catch||0)>0)&&!(p.slideT>0);}
function carryRelease(cd){const c=G.carry;if(!c)return null;G.carry=null;c.cd.catch=cd||.3;return c;}
function carryStep(h){
  const pk=G.puck;let c=G.carry;
  if(c&&(c.fall>0||c.frozen||c.goalie)){carryRelease(.6);pk.vx=c.vx*.6+rnd(-3,3);pk.vz=c.vz*.6+rnd(-3,3);if(c===G.player)popAt(__L('퍽을 놓쳤어요!'),c.x,2.3,c.z);c=null;}
  if(c){
    const f=carryDist(c),sway=Math.sin(G.t*7+c.seed)*.12*clamp(Math.hypot(c.vx,c.vz)/8,0,1);
    const fx=Math.sin(c.heading),fz=Math.cos(c.heading),tx=c.x+fx*f+fz*sway,tz=c.z+fz*f-fx*sway,ex=tx-pk.x,ez=tz-pk.z;
    if(Math.hypot(ex,ez)>1.4)carryRelease(.35);   // knocked off the stick (walls, hits)
    else{pk.vx=c.vx+ex*CARRY.holdK;pk.vz=c.vz+ez*CARRY.holdK;}
    // opponents can strip the puck by getting their stick on it (stronger / dashing defenders steal more)
    if(G.carry&&G.state==='play'&&!(c.shadowT>0||c.hopT>0))for(const o of c.team.opp.skaters){
      if(!canCarry(o))continue;const d=Math.hypot(pk.x-o.x,pk.z-o.z);if(d>o.r+PUCKR+.3)continue;
      const so=(o.ty.stats.body+o.ty.stats.turn)*(o.dashT>0?1.7:1),sc=c.ty.stats.body+c.ty.stats.turn;
      const rate=CARRY.steal*so/sc*(o.human?1.15:(CARRY.aiSteal[G.cfg&&G.cfg.diff]||.9))*(c.dashT>0?.35:1)*(ttOf(o).steal||1);
      if(Math.random()<rate*h){G.carry=o;c.cd.catch=.5;touchPuck(o,4);
        if(o.team===G.mine&&G.cfg&&G.cfg.mode!=='demo'){popAt('STEAL!',o.x,2.4,o.z);if(realMatch())save.cum.steals++;}else if(c.team===G.mine&&G.cfg&&G.cfg.mode!=='demo'){popAt(__L('빼앗겼다!'),c.x,2.3,c.z);const hh=G.hype;if(hh&&hh.combo.n>=2){hh.combo.n=0;hh.combo.t=0;comboHide();hypeToast(__L('퍽을 빼앗겨 콤보가 끊겼어요'));}}
        SFX.hit(.6);break;}
    }
  }
  if(!G.carry&&G.state==='play'){
    let best=null,bd=9;
    for(const p of G.pengs){
      if(!canCarry(p)||(G.royal&&p.team!==G.royal.team))continue;
      const dx=pk.x-p.x,dz=pk.z-p.z,d=Math.hypot(dx,dz);if(d>carryDist(p)+CARRY.catchR)continue;
      const fx=Math.sin(p.heading),fz=Math.cos(p.heading);if((dx*fx+dz*fz)/(d||1)<-.15)continue;     // must face the puck
      const rv=Math.hypot(pk.vx-p.vx,pk.vz-p.vz),recv=!!(G.pass&&G.pass.to===p);
      if(rv>(recv?30:CARRY.relMax))continue;
      if(pk.shot&&pk.shot.by.team!==p.team&&G.t-pk.shot.t<.4&&rv>9)continue;              // a fresh hard shot is blocked, not caught
      if(d<bd){bd=d;best=p;}
    }
    if(best){G.carry=best;touchPuck(best,Math.hypot(pk.vx-best.vx,pk.vz-best.vz));if(pk.shot&&pk.shot.by!==best)pk.shot=null;}
  }
}
function bigHit(hitter,victim){
  if(!G.mine||!G.cfg||G.cfg.mode==='demo'||hitter.team===victim.team)return;
  if(hitter.team===G.mine){if(realMatch())save.cum.bigHit++;popAt('BIG HIT!',victim.x,2.6,victim.z);G.cam.shake=Math.max(G.cam.shake,.45);G.hitStop=Math.max(G.hitStop||0,.05);cbAdd('hit','BIG HIT');vib(25);}
  else if(victim===G.player)G.cam.shake=Math.max(G.cam.shake,.35);
}


/* ================= v10 achievements (auto-unlock, one-time reward, saved) ================= */
const realMatch=()=>!!(G.cfg&&G.mine&&G.cfg.mode!=='demo'&&G.cfg.mode!=='practice'&&!G.cfg.tutorial);
const ACH=[
  {id:'a_win1',ico:'🏆',name:__L('첫 승리'),desc:__L('경기에서 처음 이기기'),n:1,pts:30,prog:()=>save.stats.wins},
  {id:'a_goal1',ico:'🥅',name:__L('첫 골'),desc:__L('처음으로 골 넣기'),n:1,pts:20,prog:()=>save.cum.goals},
  {id:'a_hat',ico:'🎩',name:__L('해트트릭'),desc:__L('한 경기에서 같은 펭귄으로 3골'),n:1,pts:60,prog:()=>save.cum.hatTrick},
  {id:'a_chain10',ico:'🔗',name:__L('패스 마스터'),desc:__L('끊기지 않는 연속 패스 10회'),n:10,pts:50,prog:()=>save.cum.chainBest},
  {id:'a_power',ico:'💥',name:__L('캐논 슈터'),desc:__L('강슛(충전 70%↑)으로 득점'),n:1,pts:30,prog:()=>save.cum.powerGoal},
  {id:'a_clean',ico:'🧱',name:__L('철벽'),desc:__L('무실점으로 승리'),n:1,pts:40,prog:()=>save.cum.cleanWin},
  {id:'a_tour',ico:'👑',name:__L('토너먼트 챔피언'),desc:__L('토너먼트 우승'),n:1,pts:80,prog:()=>save.stats.tourClears},
  {id:'a_allpeng',ico:'🐧',name:__L('펭귄 수집가'),desc:__L('오리지널 펭귄 5종 해금 (아델리·젠투·황제·턱끈·바위뛰기)'),n:5,pts:100,prog:()=>['basic','fast','strong','defense','balanced'].filter(k=>save.types.includes(k)).length},
  {id:'a_allpeng2',ico:'📖',name:__L('펭귄 박사'),desc:fmtL(__L('펭귄 {n}종 모두 해금 (큰바다쇠오리 제외)'),{n:Object.keys(TYPES).filter(k=>!TYPES[k].exclusive).length}),n:Object.keys(TYPES).filter(k=>!TYPES[k].exclusive).length,pts:300,prog:()=>save.types.filter(k=>!TYPES[k].exclusive).length},
  {id:'a_allhat',ico:'🧢',name:__L('패셔니스타'),desc:__L('모든 모자 해금'),n:Object.keys(HATS).length,pts:60,prog:()=>save.hats.length},
  {id:'a_allchal',ico:'🎯',name:__L('챌린지 정복'),desc:__L('모든 챌린지 클리어'),n:CHALLENGES.length,pts:120,prog:()=>CHALLENGES.filter(c=>save.cleared[c.id]).length},
  {id:'a_hit',ico:'💢',name:__L('몸싸움왕'),desc:__L('BIG HIT 10회'),n:10,pts:40,prog:()=>save.cum.bigHit},
  {id:'a_so',ico:'🥅',name:__L('승부차기의 신'),desc:__L('승부차기에서 승리'),n:1,pts:40,prog:()=>save.cum.soWin},
  {id:'a_golden',ico:'⭐',name:__L('황금의 순간'),desc:__L('골든 퍽으로 득점 (2점 골)'),n:1,pts:30,prog:()=>save.cum.golden},
  {id:'a_enh10',ico:'⬆️',name:__L('강화의 달인'),desc:__L('강화 성공 10회'),n:10,pts:50,prog:()=>save.cum.enhOk},
  {id:'a_lv10',ico:'💎',name:__L('만렙 펭귄'),desc:__L('펭귄 하나를 강화 Lv10까지'),n:1,pts:80,prog:()=>Object.keys(TYPES).some(k=>save.types.includes(k)&&(save.lv[k]|0)>=MAX_LV)?1:0},
  {id:'a_brk1',ico:'⭐',name:__L('첫 돌파'),desc:__L('중복 카드로 펭귄 돌파 1회'),n:1,pts:40,prog:()=>save.cum.brk},
  {id:'a_brk5',ico:'🌟',name:__L('각성'),desc:__L('펭귄 하나를 ★5까지 돌파'),n:1,pts:120,prog:()=>Object.keys(TYPES).some(k=>(save.brk[k]|0)>=BRK.max)?1:0},
  {id:'a_combo',ico:'⚡',name:__L('콤보 슈터'),desc:__L('패스 콤보 슛으로 5골'),n:5,pts:50,prog:()=>save.cum.comboGoal},
  {id:'a_steal',ico:'🦊',name:__L('퍽 도둑'),desc:__L('상대에게서 퍽 빼앗기 30회'),n:30,pts:40,prog:()=>save.cum.steals}
];
let achQ=[],achShowing=false,achT=0;
function achCheck(){
  const got=[];
  for(const a of ACH){if(save.ach[a.id])continue;let p=0;try{p=a.prog()|0;}catch(e){}if(p>=a.n){save.ach[a.id]=true;save.points+=a.pts;got.push(a);}}
  if(!got.length)return got;
  save.achNew=Math.min(99,(save.achNew|0)+got.length);persist();try{$('#ptsN').textContent=save.points;hypeMenuRefresh();}catch(e){}
  if(got.length>2)achQ.push({ico:'🏆',name:__L('업적 ')+got.length+__L('개 달성!'),pts:got.reduce((s,a)=>s+a.pts,0)});else achQ.push(...got);
  achNext();return got;
}
function achNext(){
  const el=$('#achPop');if(achShowing||!achQ.length||!el)return;achShowing=true;const a=achQ.shift();
  el.innerHTML='<i>'+a.ico+__L('</i><div><small>업적 달성!</small><b>')+a.name+'</b></div><span>+'+a.pts+'P</span>';
  el.className='';void el.offsetWidth;el.className='on';SFX.win();vib([20,30,40]);
  setTimeout(()=>{el.className='';setTimeout(()=>{achShowing=false;achNext();},350);},2600);
}
function achFrame(dt){achT+=dt;if(achT>=1){achT=0;achCheck();}}
function achHtml(){
  const n=ACH.filter(a=>save.ach[a.id]).length;
  let h=__L('<div class="lbl" style="text-align:center">업적 ')+n+' / '+ACH.length+__L(' · 달성하면 보상 포인트가 바로 지급돼요 (한 번만)</div><div class="ach-grid">');
  for(const a of ACH){const done=!!save.ach[a.id];let p=0;try{p=Math.min(a.n,a.prog()|0);}catch(e){}
    h+='<div class="ach'+(done?' done':'')+'"><i>'+a.ico+'</i><div class="gi"><b>'+a.name+'</b><small>'+a.desc+'</small><div class="pbar"><i style="width:'+(p/a.n*100)+'%"></i></div><small>'+(done?__L('달성 완료 ✔'):p+' / '+a.n)+' · ⭐'+a.pts+'P</small></div></div>';}
  return h+'</div>';
}
// stat bars with numbers (base + enhancement + mastery)
function statGrid(k){
  const s=TYPES[k].stats,add=(save.lv[k]|0)*LV_STAT+mxInfo(k).lv*MS_STAT+((save.brk&&save.brk[k])|0)*BRK.stat;
  return '<div class="st-grid">'+Object.keys(s).map(n=>{const v=s[n]+(save.types.includes(k)?add:0);return '<span>'+STATN[n]+'</span><div class="bar"><i style="width:'+Math.min(100,v*20)+'%"></i></div><b>'+v.toFixed(1)+'</b>';}).join('')+'</div>';
}
// rainbow trail colour without allocating every call
const trailTmp=new T.Color(),trailArr=[1,1,1];

// two-step purchase: first tap arms the chip and shows the price, second tap within 3 s buys
function buyConfirm(b,list,k,cost,apply){
  if(save[list].includes(k)||save.points<cost){sqBuy(list,k,cost,apply);return;}
  if(b.dataset.arm==='1'){delete b.dataset.arm;sqBuy(list,k,cost,apply);return;}
  document.querySelectorAll('[data-arm]').forEach(x=>{delete x.dataset.arm;x.classList.remove('arm');});
  b.dataset.arm='1';b.classList.add('arm');const sm=b.querySelector('small');if(sm)sm.textContent=__L('한 번 더 눌러 구매');
  flashMsg(cost+__L('P를 사용해 구매할까요? 한 번 더 누르면 구매해요 (보유 ')+save.points+'P)');SFX.ui();
  clearTimeout(buyConfirm.t);buyConfirm.t=setTimeout(()=>{if(b.dataset.arm){delete b.dataset.arm;b.classList.remove('arm');if(sm)sm.textContent='🔒 '+cost+'P';}},3000);
}


/* ================= v11 scout: gacha (soft pity, weekly pickup, history), enhancement, breakthrough, card detail ================= */
// ---- gacha maths: every UI number and every roll reads GACHA (config block next to PULL_ODDS) ----
function epicChance(n){            // n = position in the current streak without 신화 or better (1-based)
  const base=GACHA.odds[3]+GACHA.odds[4];
  if(n>=GACHA.hard)return 100;
  return Math.min(100,base+Math.max(0,n-GACHA.softFrom)*GACHA.softStep);
}
function gradeProbs(pity){         // % per rarity for the next pull, given the current pity counter
  const o=GACHA.odds,E=epicChance(pity+1),lo=o[0]+o[1]+o[2],hi=o[3]+o[4];
  return [(100-E)*o[0]/lo,(100-E)*o[1]/lo,(100-E)*o[2]/lo,E*o[3]/hi,E*o[4]/hi];
}
function gachaEff(){               // long-run rates including soft/hard pity (renewal chain over pity states)
  let w=1,tot=0;const acc=[0,0,0,0,0];
  for(let s=0;s<GACHA.hard;s++){const p=gradeProbs(s);for(let i=0;i<5;i++)acc[i]+=w*p[i];tot+=w;w*=1-epicChance(s+1)/100;if(w<=0)break;}
  return {p:acc.map(v=>v/tot),perEpic:tot};
}
function pickupNow(at){
  const now=at||new Date(),d=new Date(now.getFullYear(),now.getMonth(),now.getDate()),dow=(d.getDay()+6)%7;
  const mon=new Date(d.getFullYear(),d.getMonth(),d.getDate()-dow),epoch=new Date(2026,0,5);   // 2026-01-05 is a Monday
  const wk=Math.round((mon-epoch)/(7*864e5)),o=GACHA.rotOrder,type=o[((wk%o.length)+o.length)%o.length];
  return {type,wk,ends:new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+7)};
}
const pickupRate=()=>typeRate(pickupNow().type);
// base % that one pull gives penguin k (rarity rate without pity x its share of that rarity); the pickup takes pickShare% of its rarity
function typeShare(k){const g=RAR[k],ks=tierTypes(g),pk=pickupNow().type;if(TYPES[k].exclusive||!ks.includes(k))return 0;if(RAR[pk]!==g)return 100/ks.length;return k===pk?GACHA.pickShare:(100-GACHA.pickShare)/(ks.length-1);}
function typeRate(k){return GACHA.odds[RAR[k]]*typeShare(k)/100;}
function endTxt(d){
  const ms=Math.max(0,d-new Date()),dd=Math.floor(ms/864e5),hh=Math.floor(ms%864e5/36e5),mm=Math.floor(ms%36e5/6e4);
  return '⏳ '+(dd?dd+__L('일 '):'')+hh+__L('시간 ')+(dd?'':mm+__L('분 '))+__L('남음');
}
// ---- breakthrough (중복 카드 → ★) ----
function brkAvail(k){let v=save.brkPts[k]|0;for(let g=0;g<5;g++)v+=save.cc[k][g]*BRK.val[g];return v;}
function brkPlan(k){
  const b=save.brk[k]|0;if(b>=BRK.max)return{b,max:true};
  const need=BRK.need[b],use=[0,0,0,0,0];let have=save.brkPts[k]|0;
  for(let g=0;g<5&&have<need;g++)while(have<need&&save.cc[k][g]-use[g]>0){use[g]++;have+=BRK.val[g];}
  return{b,need,use,have,ok:have>=need,carry:Math.max(0,have-need),cost:BRK.cost[b],avail:brkAvail(k)};
}
function brkEffect(b){return __L('전 능력치 +')+BRK.stat.toFixed(2)+(BRK.cd[b]?__L(' · 특수기술 쿨다운 -')+Math.round(BRK.cd[b]*100)+'%':'')+(b===BRK.max?__L(' · 각성 오라'):'');}
function doBreak(k){
  if(fxBusy||!save.types.includes(k))return false;
  const pl=brkPlan(k);if(pl.max){flashMsg(__L('이미 최대 돌파(★')+BRK.max+__L(')예요'));return false;}
  if(!pl.ok){flashMsg(fmtL(__L('돌파 포인트가 {n}점 부족해요 (이 펭귄 카드 1장 = {v}점)'),{n:pl.need-pl.have,v:BRK.val[RAR[k]|0]}));return false;}
  if(save.points<pl.cost){lackMsg(pl.cost);return false;}
  save.points-=pl.cost;for(let g=0;g<5;g++)save.cc[k][g]-=pl.use[g];
  save.brk[k]=pl.b+1;save.brkPts[k]=pl.carry;save.cum.brk++;
  save.scout.elog.unshift([k,pl.b,2,0]);save.scout.elog.length=Math.min(save.scout.elog.length,8);
  persist();$('#ptsN').textContent=save.points;
  playEnhFx({type:k,brk:true,from:pl.b,to:pl.b+1,cost:pl.cost,use:pl.use}).then(()=>renderScout());
  return true;
}
async function askBreak(k){
  const pl=brkPlan(k);if(pl.max||!pl.ok||save.points<pl.cost){doBreak(k);return;}
  const used=pl.use.map((n,g)=>n?GRADES[g].n+' '+n+__L('장'):'').filter(Boolean).join(' · ');
  const ok=await askConfirm('★'+(pl.b+1)+__L(' 돌파할까요?'),
    '<div class="cf-card">'+cardHtml(k,{cw:96})+__L('</div><div class="cf-rows"><div>소모 카드: <b>')+TYPES[k].name+' '+used+__L('</b></div><div>돌파 포인트: ')+pl.have+' / '+pl.need+(pl.carry?__L(' (남는 ')+pl.carry+__L('점은 다음 돌파로 이월)'):'')+__L('</div><div>비용: <b>⭐ ')+pl.cost+__L('P</b> (보유 ')+save.points+__L('P)</div><div class="up">효과: ')+brkEffect(pl.b+1)+__L('</div><small>돌파는 실패하지 않아요. 이름·특성·강화 레벨은 그대로 유지돼요.</small></div>'),__L('돌파하기'));
  if(ok)doBreak(k);
}
// ---- generic confirm dialog (centred, title, info, primary + close) ----
function askConfirm(title,html,okLabel){
  return new Promise(res=>{const d=$('#cfmDlg');if(!d||window.__NOFX){res(true);return;}
    d.querySelector('.cd-body').innerHTML='<h3>'+title+'</h3>'+html+__L('<div class="row cf-btns"><button class="btn" data-cf="0">취소</button><button class="btn primary" data-cf="1">')+okLabel+'</button></div>';
    const done=v=>{d.classList.remove('on');d.onclick=null;document.removeEventListener('keydown',kd,true);res(v);};
    const kd=e=>{if(e.key==='Escape'){e.stopPropagation();done(false);}};document.addEventListener('keydown',kd,true);
    d.onclick=e=>{const b=e.target.closest('[data-cf]');if(b){SFX.ui();done(b.dataset.cf==='1');}else if(e.target===d||e.target.classList.contains('cd-x'))done(false);};
    d.classList.add('on');});
}
// ---- stat helpers ----
function statVal(k,n,lv,bk){return TYPES[k].stats[n]+(lv|0)*LV_STAT+mxInfo(k).lv*MS_STAT+(bk|0)*BRK.stat;}
function statCmp(k,lvA,lvB,bkA,bkB){
  return '<div class="st-cmp">'+Object.keys(TYPES[k].stats).map(n=>{const a=statVal(k,n,lvA,bkA),b=statVal(k,n,lvB,bkB),d=b-a;
    return '<span>'+STATN[n]+'</span><b>'+a.toFixed(2)+'</b><i>→</i><b class="'+(d>0?'up':'')+'">'+b.toFixed(2)+'</b><em>'+(d>0?'▲'+d.toFixed(2):'')+'</em>';}).join('')+'</div>';
}
// ---- enhancement result / breakthrough overlay ----
const efCw=m=>Math.max(64,Math.floor(Math.min(m,innerWidth*.42,(innerHeight-300)/1.42)));
function playEnhFx(o){
  if(window.__NOFX)return Promise.resolve('close');
  return new Promise(resolve=>{
    const ov=$('#enhFx');if(!ov){resolve('close');return;}
    fxBusy=true;fxOn++;fxStart();
    const k=o.type,box=ov.querySelector('.ef-box'),lvNow=save.lv[k]|0,bkNow=save.brk[k]|0;
    const col=o.ok===false?'#9fb0c2':o.brk?'#ffd45e':GRADES[Math.max(1,RAR[k]|0)].c;
    let h='';
    if(o.brk){
      h+='<div class="ef-title" style="color:'+col+__L('">돌파 성공! ★')+o.to+'</div><div class="ef-card">'+cardHtml(k,{cls:'live tilt ef-pop',cw:efCw(200)})+'</div>';
      h+='<div class="ef-rows"><div class="ef-stars">'+'★'.repeat(o.to)+'<span>'+'☆'.repeat(BRK.max-o.to)+'</span></div><div>OVR <b class="ef-cnt" data-a="'+cardOvr(k,lvNow,o.from)+'" data-b="'+cardOvr(k,lvNow,o.to)+'">'+cardOvr(k,lvNow,o.from)+'</b></div>'+statCmp(k,lvNow,lvNow,o.from,o.to)+'<div class="up">'+brkEffect(o.to)+__L('</div><small>소모: ⭐ ')+o.cost+'P · '+o.use.map((n,g)=>n?GRADES[g].n+' '+n+__L('장'):'').filter(Boolean).join(' · ')+'</small></div>';
    }else if(o.ok){
      h+='<div class="ef-title" style="color:'+col+__L('">강화 성공!</div><div class="ef-card">')+cardHtml(k,{cls:'live tilt ef-pop',cw:efCw(200)})+'</div>';
      h+='<div class="ef-rows"><div class="ef-lv">Lv.'+o.from+' <i>→</i> <b>Lv.'+o.to+'</b></div><div>OVR <b class="ef-cnt" data-a="'+cardOvr(k,o.from)+'" data-b="'+cardOvr(k,o.to)+'">'+cardOvr(k,o.from)+'</b></div>'+statCmp(k,o.from,o.to,bkNow,bkNow);
      if(o.to===5||o.to===10)h+=__L('<div class="up">⚡ 특수기술 쿨다운 -')+(o.to===10?20:10)+__L('% 해금</div>');
      h+=__L('<small>소모: ⭐ ')+o.cost+'P · '+GRADES[o.g].n+__L(' 카드 1장</small></div>');
    }else{
      const f=save.scout.fail[k]|0,next=enhRate(k,o.g);
      h+='<div class="ef-title" style="color:'+col+__L('">강화 실패</div><div class="ef-card fail">')+cardHtml(k,{cw:efCw(150)})+'</div>';
      h+=__L('<div class="ef-rows"><div>소모: <b>⭐ ')+o.cost+__L('P</b></div><div>카드: <b>돌려받았어요</b> · 레벨 하락 없음</div><div>다음 확률: <b class="up">')+next+__L('%</b> (실패 보정 +')+Math.min(ENH_FAIL_MAX,f)*ENH_FAIL_BONUS+'%)</div><div>'+(f>=ENH_PITY?__L('🎯 다음 강화는 <b class="up">성공 확정!</b>'):__L('연속 실패 ')+f+' / '+ENH_PITY+' · '+ENH_PITY+__L('회 실패하면 다음 강화 100%'))+'</div></div>';
    }
    const again=!o.brk&&(save.lv[k]|0)<MAX_LV&&save.cc[k][o.g]>0&&save.points>=enhCost(save.lv[k]|0);
    h+=__L('<div class="ef-foot"><button class="btn" data-ef="close">확인</button>')+(again?__L('<button class="btn primary" data-ef="again">다시 강화 · ⭐')+enhCost(save.lv[k]|0)+'P</button>':'')+'</div>';
    box.innerHTML=h;ov.style.setProperty('--aura',col);ov.classList.remove('fail');if(o.ok===false)ov.classList.add('fail');
    ov.classList.add('on');void box.offsetWidth;box.classList.add('in');
    let done=false;const finish=a=>{if(done)return;done=true;fxOn=Math.max(0,fxOn-1);ov.classList.remove('on');box.classList.remove('in');fxBusy=false;resolve(a);};
    ov.onclick=e=>{const b=e.target.closest('[data-ef]');if(b){SFX.ui();finish(b.dataset.ef);}else if(e.target===ov)finish('close');};
    setTimeout(()=>{
      const c=ov.querySelector('.ef-card .pc');if(!c)return;const p=ctr(c);
      if(o.ok===false){fxEmit(p.x,p.y,14,'#8b95a1',200,'s',.8);vib([12]);return;}
      const big=o.brk?3:tierOfLv(o.to);
      fxEmit(p.x,p.y,40+big*25,col,380+big*80,'s',1);if(big>=2||o.brk)fxEmit(p.x,p.y,20+big*8,col,420,'c',1.6);
      if(o.to>=6||o.brk){ov.classList.remove('quake');void ov.offsetWidth;ov.classList.add('quake');}
      if(o.brk)SFX.win();vib(o.to>=9||o.brk?[30,40,30,40,120]:[20,30,50]);
      const cnt=ov.querySelector('.ef-cnt');if(cnt){const a=+cnt.dataset.a,b=+cnt.dataset.b;let i=0;const n=14,t=setInterval(()=>{i++;cnt.textContent=Math.round(a+(b-a)*i/n);if(i>=n){clearInterval(t);if(b>a)cnt.insertAdjacentHTML('afterend',' <em class="up">▲'+(b-a)+'</em>');}},40);}
    },RM?60:280);
  });
}
// ---- card detail dialog ----
function openCard(k){
  const d=$('#cardDlg');if(!d)return;const t=TYPES[k],own=save.types.includes(k),lv=save.lv[k]|0,bk=save.brk[k]|0,m=mxInfo(k);
  let h='<div class="cd-grid"><div class="cd-l">'+(own?cardHtml(k,{cls:'live tilt',cw:Math.min(190,Math.floor(innerWidth*.4))}):sil18(k,150))+'</div><div class="cd-r">';
  h+='<h3>'+t.name+'</h3><div class="cd-sub">'+(PREF[k]?POSN[PREF[k]]:__L('만능'))+' · '+'<b class="rar-t g'+rarCls(k)+'">'+GRADES[RAR[k]].n+(t.exclusive?__L(' · 독점'):'')+'</b>'+__L(' · 특수기술 ')+SPECIALS[t.special]+'</div>';
  h+=spLine18(k);
  h+='<div class="tt-line">'+TT[k].name+'<br>▲ '+TT[k].plus+'<br>▼ '+TT[k].minus+'</div>';
  h+=fact18(k);
  if(own){
    h+=statGrid(k);
    h+=__L('<div class="cd-grow"><div><span>강화</span><b>Lv.')+lv+' / '+MAX_LV+'</b>'+(lv<MAX_LV?__L('<small>다음 OVR ')+cardOvr(k,lv+1)+'</small>':'<small>MAX</small>')+__L('</div><div><span>돌파</span><b class="pc-stars">')+('★'.repeat(bk)||'—')+'</b><small>'+(bk<BRK.max?__L('다음 ★ ')+brkPlan(k).have+'/'+BRK.need[bk]+__L('점'):__L('최대'))+__L('</small></div><div><span>숙련</span><b>M')+m.lv+'</b><small>'+(m.need?m.cur+'/'+m.need+__L(' XP (경기 출전)'):'MAX')+'</small></div></div>';
    h+='<div class="cd-mats">'+fmtL(__L('보유 카드: {n}장'),{n:'<span class="g'+rarCls(k)+'">'+save.cc[k].reduce((a,n)=>a+n,0)+'</span>'})+'<br><small>'+fmtL(__L('같은 펭귄 카드는 강화 재료(1장)와 돌파 포인트(1장 = {v}점)로 쓰여요'),{v:BRK.val[RAR[k]|0]})+'</small></div>';
    const syn=SYN.filter(s=>s.link&&s.link.includes(k)).map(s=>s.name+' ('+s.desc+')');if(syn.length)h+=__L('<div class="cd-mats">케미: ')+syn.join(' · ')+'</div>';
    h+=__L('<div class="row"><button class="btn primary" data-cd="enh">⬆ 강화·돌파</button><button class="btn" data-cd="close">닫기</button></div>');
  }else{
    const eff=typeRate(k);
    h+='<div class="cd-mats">'+(t.exclusive?__L('💻 개발자 티어(레이팅 2100) 보상 또는 설정의 코드 입력으로 얻을 수 있어요'):__L('미해금 — 스카우트 뽑기에서 얻을 수 있어요 (1회당 출현 확률 ')+eff.toFixed(2)+'%'+(pickupNow().type===k?__L(', 이번 주 픽업!'):'')+')')+__L('</div><div class="row"><button class="btn" data-cd="close">닫기</button></div>');
  }
  d.querySelector('.cd-body').innerHTML=h+'</div></div>';
  d.onclick=e=>{const b=e.target.closest('[data-cd]');if(b){SFX.ui();d.classList.remove('on');if(b.dataset.cd==='enh'){enSel=k;scTab='enh';scMsg='';if(G.ui!=='sScout')goScreen('sScout');renderScout();}}else if(e.target===d||e.target.classList.contains('cd-x'))d.classList.remove('on');};
  d.classList.add('on');
}
addEventListener('keydown',e=>{if(e.key==='Escape'){const d=$('#cardDlg');if(d&&d.classList.contains('on')){d.classList.remove('on');e.stopPropagation();}}},true);
// ---- holographic tilt for showcase cards (detail, enhance, reveal) ----
let tiltEl=null;
const tiltReset=()=>{if(tiltEl){tiltEl.style.removeProperty('--rx');tiltEl.style.removeProperty('--ry');tiltEl.style.removeProperty('--mx');tiltEl.style.removeProperty('--my');tiltEl=null;}};
addEventListener('pointermove',e=>{
  const c=e.target&&e.target.closest?e.target.closest('.pc.tilt'):null;if(c!==tiltEl)tiltReset();if(!c||RM||document.body.classList.contains('rm'))return;
  const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  c.style.setProperty('--ry',((x-.5)*18).toFixed(1)+'deg');c.style.setProperty('--rx',((.5-y)*18).toFixed(1)+'deg');c.style.setProperty('--mx',(x*100).toFixed(0)+'%');c.style.setProperty('--my',(y*100).toFixed(0)+'%');tiltEl=c;
},{passive:true});
addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')tiltReset();},{passive:true});

// ---- scout screen sections ----
let enSel=null,enG=null,dexSort='ovr',dexF='all',dexQ='';
function enAutoG(k){return RAR[k]|0;}   // a penguin's cards all have its rarity   // cheapest card first, keeps high grades
function scPullHtml(){
  const sc=save.scout,pk=pickupNow(),P=TYPES[pk.type],free=sc.freeDay!==todayKey(),c1=free?0:GACHA.cost1,c10=GACHA.cost10,n=sc.pity+1,E=epicChance(n);
  let h='<div class="gb"><div class="gb-art">'+pengSVG(pk.type)+__L('</div><div class="gb-info"><div class="gb-kick">⭐ 주간 픽업 배너</div><div class="gb-name">')+P.name+'</div><div class="gb-tt"><b class="rar-t g'+rarCls(pk.type)+'">'+GRADES[RAR[pk.type]].n+'</b> · '+TT[pk.type].name+' · '+SPECIALS[P.special]+'</div>';
  h+=__L('<div class="gb-chips"><span>픽업 확률 ')+pickupRate().toFixed(0)+'%</span><span id="gbEnd">'+endTxt(pk.ends)+'</span></div>';
  h+='<div class="gb-note">'+(sc.pickMiss?fmtL(__L('🎯 다음 {r} 펭귄은 <b>픽업 확정!</b>'),{r:GRADES[RAR[pk.type]].n}):fmtL(__L('{r} 펭귄이 나왔는데 픽업이 아니면 다음 {r} 펭귄은 픽업 확정'),{r:GRADES[RAR[pk.type]].n}))+'</div></div></div>';
  h+=__L('<div class="gpity"><div class="gpity-row"><b>신화 이상 천장</b><span>')+sc.pity+' / '+GACHA.hard+'</span></div><div class="gpity-bar"><i style="width:'+(sc.pity/GACHA.hard*100)+'%"></i><u style="left:'+(GACHA.softFrom/GACHA.hard*100)+'%"></u></div>';
  h+=__L('<div class="gpity-sub">다음 뽑기 신화 이상 <b>')+E.toFixed(1)+'%</b> · '+(n>GACHA.softFrom&&n<GACHA.hard?__L('🔥 확률 상승 중!'):n>=GACHA.hard?__L('🎯 이번 뽑기 확정!'):(GACHA.softFrom+1)+__L('회차부터 회당 +')+GACHA.softStep+'%')+' · '+GACHA.hard+__L('회차 확정</div></div>');
  const b=(act,cls,title,cost,sub)=>{const lack=save.points<cost;return '<button class="btn gb-b'+cls+(lack?' lack':'')+'" data-act="'+act+'"><b>'+title+'</b><small>'+sub+'</small>'+(lack?'<em>'+(cost-save.points)+__L('P 부족</em>'):'')+'</button>';};
  h+='<div class="gpbtn">'+b('pull1','',(free?__L('무료 1회 🎁'):__L('1회 뽑기')),c1,free?__L('오늘의 무료 뽑기'):'⭐ '+c1+'P')+b('pull10',' primary',__L('10회 뽑기'),c10,'⭐ '+c10+__L('P · 레어 이상 1장 보장'))+'</div>';
  h+=__L('<div class="gb-bal"><span>보유 ⭐ <b>')+save.points+__L('P</b></span><span>포인트는 경기·오늘의 목표·업적에서 얻어요</span><label class="gb-tog"><input type="checkbox" data-act="fastfx"')+(save.set.fastFx?' checked':'')+__L('> 빠른 연출</label></div>');
  if(scLast){const cnt=[0,0,0,0,0];scLast.forEach(r=>cnt[r.g]++);const nw=scLast.filter(r=>r.isNew).length;
    h+=__L('<div class="lbl" style="text-align:center">지난 결과 · ')+GRADES.map((g,i)=>cnt[i]?g.n+' '+cnt[i]:'').filter(Boolean).join(' · ')+(nw?' · NEW '+nw:'')+'</div><div class="cardrow">'+scLast.map(r=>'<div style="--cw:66px" data-card="'+r.type+'">'+cardHtml(r.type,{lv:0,tag:r.isNew?'NEW':__L('중복')})+'</div>').join('')+'</div>';}
  if(sc.hist.length){const c=[0,0,0,0,0];sc.hist.forEach(r=>c[r[1]]++);
    h+=__L('<div class="gh"><div class="gh-t">최근 ')+sc.hist.length+__L('회 기록 <small>(누적 ')+sc.pulls+__L('회 · ')+GRADES.map((g,i)=>g.n+' '+c[i]).join(' · ')+')</small></div><div class="gh-dots">'+sc.hist.map(r=>'<span class="g'+rarCls(r[0])+(r[2]?' nw':'')+'" title="'+GRADES[r[1]].n+' '+TYPES[r[0]].name+'">'+TYPES[r[0]].name.slice(0,2)+'</span>').join('')+'</div></div>';}
  return h+oddsBox();
}
function scEnhHtml(){
  const sc=save.scout,owned=Object.keys(TYPES).filter(k=>save.types.includes(k));
  if(!enSel||!owned.includes(enSel))enSel=owned.includes(save.type)?save.type:owned[0];
  const k=enSel,lv=save.lv[k]|0,bk=save.brk[k]|0,t=TYPES[k];
  if(enG===null||!save.cc[k][enG])enG=enAutoG(k);
  let h='<div class="en-pick">'+owned.map(q=>{const l=save.lv[q]|0,ready=l<MAX_LV&&save.cc[q][RAR[q]|0]>0&&save.points>=enhCost(l),br=brkPlan(q).ok&&!brkPlan(q).max;
    return '<button class="en-chip'+(q===k?' on':'')+'" data-act="ensel" data-k="'+q+'"><span class="dot g'+rarCls(q)+'"></span>'+TYPES[q].name.replace(__L(' 펭귄'),'')+'<small>Lv.'+l+((save.brk[q]|0)?' ★'+save.brk[q]:'')+'</small>'+(ready||br?__L('<i title="강화 또는 돌파 가능"></i>'):'')+'</button>';}).join('')+'</div>';
  h+='<div class="en-main"><div class="en-card">'+cardHtml(k,{cls:'live tilt'+(scFx&&scFx.type===k?(scFx.ok?' lvup':' shk'):''),cw:Math.min(170,Math.floor(innerWidth*.36))})+'<div class="en-nm">'+t.name+'<small>'+TT[k].name+'</small></div></div><div class="en-side">';
  // --- enhancement ---
  h+=__L('<div class="en-sec"><h4>⬆ 강화 <small>포인트와 같은 펭귄 카드 1장으로 레벨업</small></h4>');
  if(lv>=MAX_LV)h+=__L('<div class="en-max">최대 레벨 Lv.')+MAX_LV+__L(' 달성! 돌파로 더 성장할 수 있어요.</div>');
  else{
    const g=enG,rate=enhRate(k,g),cost=enhCost(lv),f=sc.fail[k]|0,has=save.cc[k][g]>0,fb=Math.min(ENH_FAIL_MAX,f)*ENH_FAIL_BONUS;
    h+='<div class="en-hd"><span>Lv.'+lv+' <i>→</i> <b>Lv.'+(lv+1)+'</b></span><span>OVR '+cardOvr(k,lv)+' <i>→</i> <b class="up">'+cardOvr(k,lv+1)+(cardOvr(k,lv+1)>cardOvr(k,lv)?' ▲'+(cardOvr(k,lv+1)-cardOvr(k,lv)):__L(' (최대)'))+'</b></span></div>';
    h+=statCmp(k,lv,lv+1,bk,bk);
    const ms=[];if(lv+1===5||lv+1===10)ms.push(__L('⚡ 특수기술 쿨다운 -')+(lv+1===10?20:10)+'%');if(ms.length)h+=__L('<div class="en-ms">다음 레벨 보너스: ')+ms.join(' · ')+'</div>';
    h+='<div class="en-mats"><button class="en-mat g'+rarCls(k)+(has?' on':'')+'" data-act="eng" data-g="'+g+'"'+(has?'':' disabled')+'><b>'+GRADES[g].n+'</b><small>'+save.cc[k][g]+__L('장</small><span>')+enhRate(k,g)+'%</span></button><small class="en-mnote">'+fmtL(__L('이 펭귄 카드 1장 사용 · {r} 등급 보너스 +{b}%'),{r:GRADES[g].n,b:ENH_CARD_BONUS[g]})+'</small></div>';
    h+=__L('<div class="en-rate"><div><span>성공 확률</span><b>')+(has?rate:0)+__L('%</b><small>기본 ')+ENH_RATE[lv]+'%'+(has&&ENH_CARD_BONUS[g]?' · '+fmtL(__L('{r} 등급 +{b}%'),{r:GRADES[g].n,b:ENH_CARD_BONUS[g]}):'')+(fb?__L(' · 실패 보정 +')+fb+'%':'')+(f>=ENH_PITY?__L(' · 🎯 확정'):'')+__L('</small></div><div><span>비용</span><b>⭐')+cost+__L('P</b><small>보유 ')+save.points+'P</small></div></div>';
    h+=__L('<div class="en-rule">성공: ')+(has?GRADES[g].n:__L('선택한'))+__L(' 카드 1장 소모 · 실패: 포인트만 소모, 카드 반환, 레벨 하락 없음, 다음 확률 +')+ENH_FAIL_BONUS+__L('% (최대 +')+ENH_FAIL_BONUS*ENH_FAIL_MAX+__L('%) · <b>연속 실패 ')+f+'/'+ENH_PITY+'</b> — '+ENH_PITY+__L('회 실패하면 다음 강화 100%<br><small>실패해도 잃는 것이 포인트뿐이라 보호 아이템은 필요 없어요.</small></div>');
    const why=!has?__L('재료 카드가 없어요 — 뽑기 중복 카드·합성·매일 무료 뽑기로 얻을 수 있어요'):save.points<cost?__L('포인트 ')+(cost-save.points)+__L('P 부족 — 경기·목표·업적으로 모을 수 있어요'):'';
    h+='<button class="btn primary en-go" data-act="enh" data-k="'+k+'" data-g="'+g+'"'+(why?' disabled':'')+__L('>✨ 강화하기 · ⭐')+cost+'P</button>'+(why?'<div class="en-why">'+why+'</div>':'');
  }
  h+='</div>';
  // --- breakthrough ---
  const pl=brkPlan(k);
  h+=__L('<div class="en-sec"><h4>★ 돌파 <small>중복 카드를 돌파 포인트로 바꿔 한계를 넘어요</small></h4><div class="en-brk"><span class="pc-stars big">')+'★'.repeat(bk)+'<u>'+'☆'.repeat(BRK.max-bk)+'</u></span>';
  if(pl.max)h+=__L('<b>최대 돌파 ★')+BRK.max+__L(' · 각성!</b></div>');
  else{
    h+='<div class="gpity-bar"><i style="width:'+Math.min(100,pl.avail/pl.need*100)+__L('%"></i></div><small>돌파 포인트 ')+Math.min(pl.avail,pl.need)+' / '+pl.need+(pl.avail>pl.need?__L(' (보유 ')+pl.avail+')':'')+' · '+fmtL(__L('이 펭귄 카드 1장 = {v}점'),{v:BRK.val[RAR[k]|0]})+'</small></div>';
    h+='<div class="en-ms">★'+(bk+1)+__L(' 효과: ')+brkEffect(bk+1)+' · OVR +'+BRK.ovr+'</div>';
    const why=!pl.ok?__L('같은 펭귄 카드가 ')+(pl.need-pl.have)+__L('점어치 더 필요해요'):save.points<pl.cost?__L('포인트 ')+(pl.cost-save.points)+__L('P 부족'):'';
    h+='<button class="btn en-go brk" data-act="brk" data-k="'+k+'"'+(why?' disabled':'')+__L('>★ 돌파하기 · ⭐')+pl.cost+'P</button>'+(why?'<div class="en-why">'+why+'</div>':'');
  }
  h+='</div>';
  if(sc.elog.length)h+=__L('<div class="en-log"><b>최근 기록</b>')+sc.elog.map(r=>'<span class="'+(r[2]===2?'brk':r[2]?'ok':'no')+'">'+TYPES[r[0]].name.replace(__L(' 펭귄'),'')+' '+(r[2]===2?'★'+(r[1]+1)+__L(' 돌파'):'Lv.'+r[1]+(r[2]?' → '+(r[1]+1)+__L(' 성공'):__L(' 실패')))+'</span>').join('')+'</div>';
  h+='</div></div>';
  h+=__L('<div class="odds"><b>강화 확률 (레벨 → 다음 레벨)</b><br>')+ENH_RATE.map((r,i)=>'Lv'+i+'→'+(i+1)+' '+r+'%').join(' · ')+__L('<br>펭귄 등급 보너스: ')+GRADES.map((g,i)=>g.n+' +'+ENH_CARD_BONUS[i]+'%').join(' · ')+__L('<br>돌파 포인트(카드 1장): ')+GRADES.map((g,i)=>g.n+' '+BRK.val[i]+__L('점')).join(' · ')+__L(' · 실패 1회마다 +')+ENH_FAIL_BONUS+__L('% (최대 +')+ENH_FAIL_BONUS*ENH_FAIL_MAX+'%) · '+ENH_PITY+__L('회 연속 실패 시 100%<br>비용: 현재 레벨 × 15P + 20P · 돌파 비용: ')+BRK.cost.map((c,i)=>'★'+(i+1)+' '+c+'P/'+BRK.need[i]+__L('점')).join(' · ')+'</div>';
  return h;
}
function scDexHtml(){
  let ks=Object.keys(TYPES);
  if(dexF==='own')ks=ks.filter(k=>save.types.includes(k));else if(dexF==='not')ks=ks.filter(k=>!save.types.includes(k));
  const ov=k=>save.types.includes(k)?cardOvr(k,save.lv[k]|0):-1;
  ks.sort(dexSort==='lv'?(a,b)=>(save.types.includes(b)?(save.lv[b]|0)+1:0)-(save.types.includes(a)?(save.lv[a]|0)+1:0):dexSort==='name'?(a,b)=>TYPES[a].name.localeCompare(TYPES[b].name,I18N.loc):(a,b)=>ov(b)-ov(a));
  const own=Object.keys(TYPES).filter(k=>save.types.includes(k)).length;
  let h='<div class="dx-ctl"><div class="chips">'+[['ovr',__L('OVR순')],['lv',__L('레벨순')],['name',__L('이름순')]].map(o=>'<button class="btn small'+(dexSort===o[0]?' on':'')+'" data-act="dxs" data-v="'+o[0]+'">'+o[1]+'</button>').join('')+'</div><div class="chips">'+[['all',__L('전체')],['own',__L('보유')],['not',__L('미보유')]].map(o=>'<button class="btn small'+(dexF===o[0]?' on':'')+'" data-act="dxf" data-v="'+o[0]+'">'+o[1]+'</button>').join('')+__L('</div><input id="dxQ" type="search" placeholder="🔍 이름 검색" value="')+escH(dexQ)+__L('" aria-label="펭귄 이름 검색"></div>');
  h+=__L('<div class="lbl" style="text-align:center">도감 ')+own+' / '+Object.keys(TYPES).length+__L(' · 카드를 누르면 상세 정보가 열려요</div><div class="cardrow dx">');
  h+=ks.map(k=>{const o=save.types.includes(k),tot=save.cc[k].reduce((a,n)=>a+n,0);
    return '<div class="dx-c" data-card="'+k+'" data-name="'+TYPES[k].name+'" style="--cw:96px">'+(o?cardHtml(k):sil18(k))+'<div class="dx-i">'+(o?'<b>'+TYPES[k].name.replace(__L(' 펭귄'),'')+'</b><small><i class="rar-t g'+rarCls(k)+'">'+GRADES[RAR[k]].n+__L('</i> · 보관 ')+tot+__L('장')+((save.brk[k]|0)?' · ★'+save.brk[k]:'')+'</small>':'<b>'+(TYPES[k].exclusive?'???':TYPES[k].name.replace(__L(' 펭귄'),''))+'</b><small>'+(TYPES[k].exclusive?__L('💻 특별 보상'):'<i class="rar-t g'+rarCls(k)+'">'+GRADES[RAR[k]].n+__L('</i> · 미해금'))+'</small>')+'</div></div>';}).join('');
  h+=__L('</div><div class="odds">누적 뽑기 ')+save.scout.pulls+__L('회 · 카드 테두리 색은 펭귄의 등급이에요 (기본 · 희귀 · 레어 · 신화 · 전설) · 별(★)은 돌파 단계예요. 카드는 강화·돌파(같은 종류)와 합성(같은 등급)에 쓰여요.</div>');
  return h;
}
function dexFilterQ(){const q=dexQ.trim();document.querySelectorAll('#scBody .dx-c').forEach(e=>{e.style.display=!q||e.dataset.name.indexOf(q)>=0?'':'none';});}
// scout extra actions (wired after renderScout's own handlers)
function scWire(el){
  el.querySelectorAll('[data-card]').forEach(c=>{c.style.cursor='pointer';c.onclick=()=>{SFX.ui();openCard(c.dataset.card);};});
  const q=el.querySelector('#dxQ');if(q){q.oninput=()=>{dexQ=q.value;dexFilterQ();};dexFilterQ();}
}
function scAct(a,b){
  if(a==='ensel'){enSel=b.dataset.k;enG=null;scMsg='';renderScout();return true;}
  if(a==='eng'){enG=+b.dataset.g;renderScout();return true;}
  if(a==='enauto'){enG=enAutoG(enSel);renderScout();flashMsg(__L('가장 낮은 등급 카드를 골랐어요 (고등급 카드는 아껴 둬요)'));return true;}
  if(a==='brk'){askBreak(b.dataset.k);return true;}
  if(a==='fastfx'){save.set.fastFx=!!b.checked;persist();return true;}
  if(a==='dxs'){dexSort=b.dataset.v;renderScout();return true;}
  if(a==='dxf'){dexF=b.dataset.v;renderScout();return true;}
  return false;
}
setInterval(()=>{try{if(G.ui==='sScout'&&scTab==='pull'){const e=$('#gbEnd');if(e)e.textContent=endTxt(pickupNow().ends);}}catch(e){}},30000);


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
function pkSurf(U,V,fn,colFn,ru,rv,poles){U=pkS(U);V=pkS(V);
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
const PK_SHAPE={basic:1.03,fast:.96,strong:.97,defense:1,balanced:1.02,auk:1,king:.95,macaroni:1.03,royal:1.02,fiordland:1,yelloweye:1,little:1.05,african:1.02,humboldt:1.03,magellanic:1,galapagos:1};
// species plumage (vertex colours)
function pkCol(ty,th,y,o){
  const a=Math.abs(th),pt=ty.patch;
  let half;if(y<0.3)half=2.3;else if(y<1.0)half=lerp(1.45,1.12,(y-.3)/.7);else half=lerp(1.12,.62,clamp((y-1)/.2,0,1));
  const darkThroat=pt==='adelie'||pt==='rock'||pt==='gentoo'||pt==='auk'||!!PK18DT[pt];
  const headFade=darkThroat?1-smooth(1.05,1.13,y):1-smooth(1.16,1.26,y);
  let wh=(1-smooth(half-.12,half+.1,a))*headFade;
  let r=.035,g=.04,b=.062;if(ty.dk){r=ty.dk[0];g=ty.dk[1];b=ty.dk[2];}const back=smooth(1.3,3.0,a)*(.6+.4*smooth(.4,1.1,y));r+=.03*back;g+=.04*back;b+=.07*back;   // blue-grey sheen on the back
  if(pt==='chinstrap'){const face=smooth(1.14,1.2,y)*(1-smooth(1.47,1.55,y)),fw=(1-smooth(1.42,1.78,a))*face;wh=Math.max(wh,fw);
    const strap=smooth(1.212,1.232,y)*(1-smooth(1.262,1.282,y))*(1-smooth(1.45,1.62,a));wh*=1-strap;}
  wh=pkW18(pt,a,th,y,wh);
  const wr=.95,wg=.955,wb=.97-.03*(1-smooth(.1,.6,y));
  r=lerp(r,wr,wh);g=lerp(g,wg,wh);b=lerp(b,wb,wh);
  if(PK18C[pt]){const q=[r,g,b];pkC18(ty,pt,a,th,y,q);r=q[0];g=q[1];b=q[2];}
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
function pkBodyGeo(key){const lo=pkLo(),ck=(pkHi()?'U':'')+'b'+key+lo;if(pkGeoC[ck])return pkGeoC[ck];
  const ty=TYPES[key],w=PK_SHAPE[key]||1;
  return pkGeoC[ck]=pkSurf(lo?28:52,lo?26:46,(u,v,p)=>{const q=PK_BC.getPointAt(v),th=u*TAU,r=Math.max(q.x,.0005)*pkBodyK(th,q.y)*w;p[0]=r*Math.sin(th);p[1]=q.y;p[2]=r*Math.cos(th);},
    (u,v,p,c)=>pkCol(ty,Math.atan2(p[0],p[2]),p[1],c),12,9,[true,true]);}
function pkHeadGeo(key){const lo=pkLo(),ck=(pkHi()?'U':'')+'h'+key+lo;if(pkGeoC[ck])return pkGeoC[ck];
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
function pkJerseyGeo(key){const lo=pkLo(),ck=(pkHi()?'U':'')+'j'+key+lo;if(pkGeoC[ck])return pkGeoC[ck];const w=PK_SHAPE[key]||1;
  return pkGeoC[ck]=pkSurf(lo?28:48,lo?8:14,(u,v,p)=>{const th=u*TAU,c=Math.cos(th),yT=.875-.075*c,y=lerp(.4,yT,v),
    r=pkBodyR(y)*pkBodyK(th,y)*w+.03+.016*(1-smooth(0,.14,v))+.006*Math.sin(th*9)*(1-smooth(0,.3,v));p[0]=r*Math.sin(th);p[1]=y;p[2]=r*Math.cos(th);},null,1,1);}
// --- scarf (knitted, striped) ---
function pkScarfGeo(teamKey){const ck=(pkHi()?'U':'')+'s'+teamKey;if(pkGeoC[ck])return pkGeoC[ck];
  const tc=new T.Color(TEAM[teamKey].color),R0=pkBodyR(1.155)+.012,g=new T.TorusGeometry(R0,.062,pkS(10),pkS(44));g.rotateX(Math.PI/2);g.translate(0,1.155,0);
  const p=g.attributes.position,col=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const ph=Math.atan2(p.getZ(i),p.getX(i)),f=(((ph/TAU*14)%1)+1)%1,wh=f<.2?1:0;col[i*3]=lerp(tc.r,.96,wh);col[i*3+1]=lerp(tc.g,.97,wh);col[i*3+2]=lerp(tc.b,.98,wh);}
  g.setAttribute('color',new T.BufferAttribute(col,3));return pkGeoC[ck]=g;}
function pkScarfTailGeo(teamKey){const ck=(pkHi()?'U':'')+'st'+teamKey;if(pkGeoC[ck])return pkGeoC[ck];
  const tc=pkRGB(TEAM[teamKey].color),wh=[.96,.97,.98],list=[];
  for(const [len,ox,rz] of[[.44,0,0],[.36,.075,.14]]){
    const n=Math.round(len/.075);for(let i=0;i<n;i++){const b=new T.BoxGeometry(.13,len/n+.002,.032);b.translate(ox,-(i+.5)*len/n,0);b.rotateZ(rz);list.push([b,i%2?wh:tc]);}
    for(let f=0;f<5;f++){const c=new T.CylinderGeometry(.008,.008,.07,pkS(4));c.translate(ox-.05+f*.025,-len-.035,0);c.rotateZ(rz);list.push([c,tc]);}
  }
  return pkGeoC[ck]=pkMerge(list);}
// --- eyes: glossy sclera, species iris, pupil, double catch-light ---
function pkEyeGeos(key){const ck=(pkHi()?'U':'')+'e'+key;if(pkGeoC[ck])return pkGeoC[ck];
  const pt=TYPES[key].patch,big=pt==='adelie'?1.24:pt==='auk'?.82:1,iris=pkRGB(PK18EYE[pt]||(pt==='rock'?0xd0182a:pt==='auk'?0x1a1410:0x2a1a12));
  const sc=new T.SphereGeometry(1,pkS(20),pkS(14));sc.scale(.085*big,.085*big,.05);
  const ir=new T.SphereGeometry(1,pkS(18),pkS(12));ir.scale(.056,.056,.024);ir.translate(0,0,.03);
  const pu=new T.SphereGeometry(1,pkS(14),pkS(10));pu.scale(.031,.031,.016);pu.translate(0,0,.043);
  const h1=new T.SphereGeometry(1,pkS(8),pkS(6));h1.scale(.016,.016,.008);h1.translate(.02,.024,.056);
  const h2=new T.SphereGeometry(1,pkS(8),pkS(6));h2.scale(.008,.008,.005);h2.translate(-.017,-.018,.055);
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
  else if(PK18BK[pt])PK18BK[pt](S);
  const wrap=(f,lower)=>(t,y,x,c)=>{f(t,y,x,c);if(inside(y,lower)&&t<.95){c[0]=lerp(c[0],mouth[0],.85);c[1]=lerp(c[1],mouth[1],.85);c[2]=lerp(c[2],mouth[2],.85);}};
  S.upW=wrap(S.up,false);S.loW=wrap(S.lo,true);return S;
}
function pkBeak(key){const ck=(pkHi()?'U':'')+'k'+key;if(pkGeoC[ck])return pkGeoC[ck];const S=pkBeakSpec(TYPES[key]);
  return pkGeoC[ck]={S,up:pkBeakGeo(S.L,S.W,S.H,S.droop,S.hook,S.upW,false),lo:pkBeakGeo(S.L*.86,S.W*.86,S.H*.62,S.droop*.8,0,S.loW,true)};}
// --- flippers: tapered paddles, black outside, white inside with a black rim, team wristband ---
function pkFlipperGeo(side,teamKey,dk){const lo=pkLo(),ck=(pkHi()?'U':'')+'f'+side+teamKey+lo+(dk?dk.join():'');if(pkGeoC[ck])return pkGeoC[ck];
  const g=new T.SphereGeometry(1,pkS(lo?12:18),pkS(lo?10:16)),p=g.attributes.position,col=new Float32Array(p.count*3),tc=new T.Color(TEAM[teamKey].color);
  const L=.45,W=.21,Th=.078;
  for(let i=0;i<p.count;i++){const nx=p.getX(i),ny=p.getY(i),nz=p.getZ(i),s=(1-ny)/2;
    const wf=Math.pow(Math.max(0,Math.sin(Math.PI*(.12+.88*s))),.55)*(1-.25*s),tf=1-.55*s,band=smooth(.13,.16,s)*(1-smooth(.21,.24,s)),puff=1+.14*band;
    p.setXYZ(i,nx*Th*.5*tf*puff,-s*L,nz*W*.5*wf*puff-.07*s*s);
    const inner=smooth(.15,.55,-side*nx)*(1-smooth(.55,.92,Math.abs(nz)))*smooth(.08,.22,s);
    let r=lerp(dk?dk[0]:.035,.93,inner),gg=lerp(dk?dk[1]:.04,.94,inner),b=lerp(dk?dk[2]:.062,.96,inner);r=lerp(r,tc.r,band);gg=lerp(gg,tc.g,band);b=lerp(b,tc.b,band);
    col[i*3]=r;col[i*3+1]=gg;col[i*3+2]=b;}
  g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();return pkGeoC[ck]=g;}
// --- webbed feet with toes and claws ---
function pkFootGeo(key){const ck=(pkHi()?'U':'')+'ft'+key;if(pkGeoC[ck])return pkGeoC[ck];
  const ty=TYPES[key],col=pkRGB(ty.patch==='auk'?0x2b3440:(ty.foot||0xff8c1c)),claw=[.1,.09,.09],list=[];
  const sole=new T.SphereGeometry(1,pkS(14),pkS(10));sole.scale(.13,.045,.16);sole.translate(0,0,.03);list.push([sole,col]);
  const web=new T.SphereGeometry(1,pkS(12),pkS(6));web.scale(.16,.022,.12);web.translate(0,-.012,.16);list.push([web,col]);
  for(const a of[-.42,0,.42]){const toe=new T.SphereGeometry(1,pkS(10),pkS(8));toe.scale(.045,.036,.13);toe.translate(0,0,.11);toe.rotateY(a);toe.translate(0,0,.07);list.push([toe,col]);
    const cl=new T.ConeGeometry(.017,.05,pkS(6));cl.rotateX(Math.PI/2);cl.translate(0,-.006,.255);cl.rotateY(a);cl.translate(0,0,.07);list.push([cl,claw]);}
  return pkGeoC[ck]=pkMerge(list);}
// --- tail: a fan of stiff feathers ---
function pkTailGeo(tl,dk){const ck=(pkHi()?'U':'')+'tl'+tl+(dk?dk.join():'');if(pkGeoC[ck])return pkGeoC[ck];const list=[];
  for(let i=-2;i<=2;i++){const c=new T.ConeGeometry(.045,.3*tl,pkS(6));c.scale(1,1,.35);c.rotateX(-Math.PI/2);c.translate(0,0,-.15*tl);c.rotateY(i*.17);list.push([c,dk||[.035,.04,.058]]);}
  return pkGeoC[ck]=pkMerge(list);}
// --- rockhopper crest: yellow plumes rooted on the head above the eyes and swept back along it, plus a short black crown tuft that lies
// flat instead of spikes standing up; a hat flattens the crest, so with a hat nothing pokes out from under the brim ---
function pkCrestGeo(){const ck='cr2';if(pkGeoC[ck])return pkGeoC[ck];const list=[],yel=pkRGB(0xffd21a),blk=[.035,.04,.058],up=new T.Vector3(0,1,0),q=new T.Quaternion();
  const feather=(b,dir,len,r,flat,col)=>{const c=new T.ConeGeometry(r,len,pkS(6));c.scale(1,1,flat);c.translate(0,len/2,0);q.setFromUnitVectors(up,dir.normalize());c.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(q));c.translate(b.x,b.y,b.z);list.push([c,col]);};
  for(const s of[-1,1])for(let i=0;i<5;i++){const th=s*(.5+.07*i),b=pkHeadPt(th,1.565+.008*i,-.004),
      tan=new T.Vector3(Math.cos(th),0,-Math.sin(th)).multiplyScalar(s),nrm=new T.Vector3(Math.sin(th),0,Math.cos(th));
    feather(b,tan.addScaledVector(nrm,.45+.06*i).add(new T.Vector3(0,-.1-.05*i,0)),.15+.015*i,.014,.6,yel);}
  for(let i=0;i<5;i++){const x=(i-2)*.045,k=Math.abs(i-2);feather(new T.Vector3(x,1.69-.01*k,.02-.02*k),new T.Vector3(x*.8,.3,-1),.12+.018*(2-k),.022,.5,blk);}
  return pkGeoC[ck]=pkMerge(list);}
// --- hockey stick (+ goalie stick with a paddle) ---
function pkStickGeo(teamKey,goalie){const ck=(pkHi()?'U':'')+'sk'+teamKey+goalie;if(pkGeoC[ck])return pkGeoC[ck];
  const L=goalie?1.03:1.2,tc=pkRGB(TEAM[teamKey].color),list=[],shaft=[.13,.14,.17],tape=[.05,.05,.06],wht=[.95,.96,.97];
  const seg=(z0,z1,w,h,col)=>{const b=new T.BoxGeometry(w,h,z1-z0);b.translate(0,0,(z0+z1)/2);list.push([b,col]);};
  seg(0,.1,.05,.04,wht);seg(.1,L*.3,.042,.03,shaft);seg(L*.3,L*.48,.043,.031,tc);seg(L*.48,L*.52,.043,.031,wht);seg(L*.52,L,.042,.03,shaft);
  if(goalie)seg(L*.58,L,.05,.1,tc);
  const bl=goalie?.36:.34,bh=goalie?.11:.075,b=new T.BoxGeometry(.02,bh,bl);b.translate(0,bh*.25,bl/2);b.rotateX(-.62);b.translate(0,0,L);list.push([b,tape]);
  const s1=new T.BoxGeometry(.022,.012,bl*.9);s1.translate(0,bh*.25,bl/2);s1.rotateX(-.62);s1.translate(0,0,L);list.push([s1,wht]);
  return pkGeoC[ck]=pkMerge(list);}
// --- improved hats (beanie, helmet + goalie cage); others keep their original pieces ---
function pkBeanie(tc){const g=new T.Group(),m=pkKnitMat(tc,[14,5]);
  const cap=new T.Mesh(new T.SphereGeometry(.39,pkS(32),pkS(16),0,TAU,0,Math.PI*.5),m);cap.scale.y=.7;cap.position.y=1.565;cap.castShadow=true;g.add(cap);
  const cuff=new T.Mesh(new T.TorusGeometry(.385,.062,pkS(12),pkS(44)),pkKnitMat(0xf2f5f9,[40,3]));cuff.rotation.x=Math.PI/2;cuff.position.y=1.57;g.add(cuff);
  const pg=new T.IcosahedronGeometry(.11,2),pp=pg.attributes.position;for(let i=0;i<pp.count;i++){const x=pp.getX(i),y=pp.getY(i),z=pp.getZ(i),k=1+(pkHash(x*41+z*7,y*37+z*13)-.5)*.32;pp.setXYZ(i,x*k,y*k,z*k);}pg.computeVertexNormals();
  const pom=new T.Mesh(pg,pkMatC.pom||(pkMatC.pom=rimify(new T.MeshStandardMaterial({color:0xf6f8fb,roughness:1}),1.2)));pom.position.y=1.86;pom.castShadow=true;g.add(pom);
  return g;}
function pkCageGeo(){if(pkGeoC.cage)return pkGeoC.cage;const list=[],c=[.86,.89,.93],R=.44;
  for(const y of[1.255,1.505]){const t=new T.TorusGeometry(R,.011,pkS(5),pkS(20),1.9);t.rotateX(Math.PI/2);t.rotateY(.95-Math.PI/2);t.translate(0,y,0);list.push([t,c]);}
  for(const a of[-.66,-.28,.28,.66]){const cy=new T.CylinderGeometry(.011,.011,.27,pkS(5));cy.translate(R*Math.sin(a),1.38,R*Math.cos(a));list.push([cy,c]);}
  return pkGeoC.cage=pkMerge(list);}
function pkHelmet(tc,goalie){const g=new T.Group(),k='hm'+tc,m=pkMatC[k]||(pkMatC[k]=rimify(new T.MeshStandardMaterial({color:tc,roughness:.22,metalness:.25}),.9));
  const shell=new T.Mesh(new T.SphereGeometry(.405,pkS(32),pkS(16),0,TAU,0,Math.PI*.53),m);shell.scale.y=.76;shell.position.y=1.545;shell.castShadow=true;g.add(shell);
  const st=new T.Mesh(new T.TorusGeometry(.405,.022,pkS(8),pkS(40),Math.PI),MAT.white);st.position.y=1.545;st.scale.y=.76;st.rotation.y=Math.PI/2;g.add(st);
  const rim=new T.Mesh(new T.TorusGeometry(.398,.02,pkS(6),pkS(40)),MAT.dark);rim.rotation.x=Math.PI/2;rim.position.y=1.535;g.add(rim);
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
function pkPadsGeo(teamKey){const ck=(pkHi()?'U':'')+'pd'+teamKey;if(pkGeoC[ck])return pkGeoC[ck];const tc=pkRGB(TEAM[teamKey].color),wh=[.94,.95,.97],list=[];
  for(const s of[-1,1]){const z=pkBodyR(.27)*pkBodyK(0,.27)+.04;const b=pkRoundBox(.21,.5,.11,.04);b.translate(s*.17,.27,z);list.push([b,wh]);
    for(const y of[.15,.36]){const st=pkRoundBox(.218,.055,.118,.02,3);st.translate(s*.17,y,z);list.push([st,tc]);}
    const kn=pkRoundBox(.2,.11,.135,.04,3);kn.translate(s*.17,.5,z+.01);list.push([kn,tc]);}
  return pkGeoC[ck]=pkMerge(list);}
function pkBlockerGeo(teamKey){const ck=(pkHi()?'U':'')+'bk'+teamKey;if(pkGeoC[ck])return pkGeoC[ck];const tc=pkRGB(TEAM[teamKey].color);
  const b=pkRoundBox(.05,.26,.2,.02,3);b.translate(.02,-.4,.02);const r=pkRoundBox(.058,.2,.14,.015,3);r.translate(.02,-.4,.02);
  return pkGeoC[ck]=pkMerge([[b,[.95,.96,.97]],[r,tc]]);}
function pkGloveGeo(teamKey){const ck=(pkHi()?'U':'')+'gv'+teamKey;if(pkGeoC[ck])return pkGeoC[ck];const tc=pkRGB(TEAM[teamKey].color);
  const m=new T.SphereGeometry(1,pkS(14),pkS(10));m.scale(.09,.15,.16);m.translate(-.03,-.42,.04);const cu=new T.TorusGeometry(.085,.02,pkS(6),pkS(16));cu.rotateX(Math.PI/2);cu.translate(-.02,-.3,.02);
  return pkGeoC[ck]=pkMerge([[m,tc],[cu,[.95,.96,.97]]]);}
// --- jersey numbers stay with the species, never clash inside a team ---
function pkNum(tm,typeKey,isGoalie){
  if(isGoalie)return tm.key==='blue'?1:30;
  let n={basic:7,fast:11,strong:88,defense:4,balanced:19,auk:99,king:8,macaroni:22,royal:10,fiordland:17,yelloweye:21,little:3,african:27,humboldt:14,magellanic:16,galapagos:5}[typeKey]||9;
  const used=new Set(G.pengs.filter(q=>q.team===tm&&q.pg&&q.pg.num).map(q=>q.pg.num));
  while(used.has(n))n=(n+10)%100||10;
  return n;
}
function buildPenguin(typeKey,teamKey,hatKey,o){
  o=o||{};const ty=TYPES[typeKey],tc=TEAM[teamKey].color,goalie=!!o.goalie,num=o.num||({basic:7,fast:11,strong:88,defense:4,balanced:19,auk:99,king:8,macaroni:22,royal:10,fiordland:17,yelloweye:21,little:3,african:27,humboldt:14,magellanic:16,galapagos:5}[typeKey]||9);
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
  {const D=decals18(typeKey);if(D){if(D.b)torso.add(new T.Mesh(D.b,PK18_DMAT));if(D.h)headAbs.add(new T.Mesh(D.h,PK18_DMAT));}}   // v18: crisp bands / patches
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
  if(ty.patch==='rock'&&(!hatKey||hatKey==='none'))headAbs.add(new T.Mesh(pkCrestGeo(),PK_MAT.vc));
  crest18(ty,goalie?'helmet':hatKey,headAbs);
  // flippers
  const fl=[];
  for(const s of[-1,1]){const g=new T.Group();g.position.set(s*.5,.96,0);const m=new T.Mesh(pkFlipperGeo(s,teamKey,ty.dk),PK_MAT.vc);m.castShadow=true;g.add(m);g.rotation.z=s*.28;inner.add(g);fl.push(g);}
  // feet
  const ft=[];
  for(const s of[-1,1]){const g=new T.Group();g.position.set(s*.2,.05,.3);g.add(new T.Mesh(pkFootGeo(typeKey),PK_MAT.vc));inner.add(g);ft.push(g);}
  // tail
  const tail=new T.Group();tail.position.set(0,.17,-.46);tail.rotation.x=.42;tail.add(new T.Mesh(pkTailGeo(ty.tail||1,ty.dk),PK_MAT.vc));inner.add(tail);
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
  P.root.position.set(p.rx,hop+hopY18(p),p.rz);P.root.rotation.y=p.heading;
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
  P.flipL.rotation.set(lx,0,lz);P.flipR.rotation.set(rx,0,rz);castFlip(p,dt);
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
      P.stick.position.copy(_pkG).addScaledVector(_pkZ,-.08);
    }
  }
  castPost(p,dt,t);
}

// --- crowd penguins: one sculpted, vertex-coloured silhouette instead of three spheres (built during start-up: only uses T) ---
function crowdBodyGeo(){
  if(crowdBodyGeo.g)return crowdBodyGeo.g;
  const cv=new T.SplineCurve([[0,0],[.27,.006],[.42,.2],[.49,.4],[.52,.66],[.495,.9],[.43,1.1],[.36,1.2],[.29,1.28],[.272,1.36],[.268,1.42],[.24,1.5],[.16,1.6],[.001,1.65]].map(q=>new T.Vector2(q[0],q[1])));
  return crowdBodyGeo.g=pkSurf(16,16,(u,v,o)=>{const q=cv.getPointAt(v),th=u*Math.PI*2,r=Math.max(q.x,.001);o[0]=r*Math.sin(th);o[1]=q.y;o[2]=r*Math.cos(th)+(q.y>1.22?.03*Math.min(1,(q.y-1.22)/.12):0);},
    (u,v,o,c)=>{const a=Math.abs(Math.atan2(o[0],o[2])),y=o[1],half=y<.3?2.4:y<1.0?1.45-(y-.3)*.45:1.13,wh=Math.min(1,Math.max(0,(half+.1-a)/.2))*(y<1.06?1:0),k=.05+.89*wh;
      c[0]=k;c[1]=k+.006*wh+.008*(1-wh);c[2]=k+.025*wh+.03*(1-wh);},1,1,[true,true]);
}

/* ---- input wiring ---- */
const KEYMAP={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
const coarseNow=()=>!!(window.matchMedia&&matchMedia('(pointer: coarse)').matches);
function setTouchMode(on){if(IS_TOUCH===on)return;IS_TOUCH=on;document.body.classList.toggle('touch',on);}
function recomputeKeys(){
  if(input.joy)return;const k=input.keys;let x=(k.right?1:0)-(k.left?1:0),z=(k.down?1:0)-(k.up?1:0);const l=Math.hypot(x,z);if(l>1){x/=l;z/=l;}input.x=x;input.z=z;
}
addEventListener('keydown',e=>{
  if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
  if(e.repeat){if(KEYMAP[e.code]&&!input.keys[KEYMAP[e.code]]){input.keys[KEYMAP[e.code]]=true;recomputeKeys();}if(['Space','Tab'].includes(e.code)||KEYMAP[e.code])e.preventDefault();return;}
  SFX.init();
  if(IS_TOUCH&&!coarseNow())setTouchMode(false);   // hybrid laptops: keyboard/mouse wins
  if(KEYMAP[e.code]){input.keys[KEYMAP[e.code]]=true;recomputeKeys();e.preventDefault();return;}
  if(G.view!=='game')return;
  switch(e.code){
    case 'Space':input.shoot=true;input.shootPress=true;e.preventDefault();break;
    case 'KeyE':input.pass=true;break;
    case 'ShiftLeft':case 'ShiftRight':input.dash=true;break;
    case 'KeyQ':input.special=true;break;
    case 'KeyF':case 'Tab':input.swap=true;e.preventDefault();break;
    case 'KeyP':case 'Escape':togglePause();break;
  }
});
addEventListener('keyup',e=>{
  if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
  if(KEYMAP[e.code]){input.keys[KEYMAP[e.code]]=false;recomputeKeys();return;}
  if(e.code==='Space'){if(input.shoot)input.shootRel=true;input.shoot=false;e.preventDefault();}
});
['pointerup','click','touchend'].forEach(ev=>addEventListener(ev,()=>{try{SFX.init();}catch(e){}},{capture:true,passive:true}));
addEventListener('blur',()=>{input.keys={};recomputeKeys();if(input.shoot){input.shootRel=true;input.shoot=false;}});
document.addEventListener('pointerdown',e=>{if((e.pointerType==='touch'||e.pointerType==='pen')&&!IS_TOUCH)setTouchMode(true);},true);
const ray=new T.Raycaster(),ndc=new T.Vector2(),gplane=new T.Plane(new T.Vector3(0,1,0),0),hitP=new T.Vector3();
canvas.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse')return;
  if(IS_TOUCH&&!coarseNow())setTouchMode(false);
  ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);
  if(ray.ray.intersectPlane(gplane,hitP)){G.mouse.wx=hitP.x;G.mouse.wz=hitP.z;G.mouse.t=performance.now();G.mouse.active=true;}
});
canvas.addEventListener('pointerdown',e=>{
  SFX.init();if(e.pointerType!=='mouse'||G.view!=='game')return;
  if(e.button===0){input.shoot=true;input.shootPress=true;}else if(e.button===2){input.pass=true;}
});
addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&e.button===0&&input.shoot){input.shootRel=true;input.shoot=false;}});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ctxLost=true;if(G.view==='game'&&!G.paused)togglePause();flashMsg(__L('그래픽을 복구하는 중이에요…'));});
canvas.addEventListener('webglcontextrestored',()=>{ctxLost=false;envLastT=-9;updateEnv(true);flashMsg(__L('복구되었어요!'));});

// touch: joystick
const jz=$('#joyZone'),jb=$('#joyBase'),jk=$('#joyKnob');let jid=null,jo={x:0,y:0};
jz.addEventListener('pointerdown',e=>{
  if(jid!==null)return;jid=e.pointerId;jz.setPointerCapture(jid);jo={x:e.clientX,y:e.clientY};const r=jz.getBoundingClientRect();
  jb.style.display='block';jb.style.left=(e.clientX-r.left)+'px';jb.style.top=(e.clientY-r.top)+'px';jk.style.transform='translate(0,0)';input.joy=true;SFX.init();
});
jz.addEventListener('pointermove',e=>{
  if(e.pointerId!==jid)return;let dx=e.clientX-jo.x,dy=e.clientY-jo.y;const l=Math.hypot(dx,dy),R=56;if(l>R){dx*=R/l;dy*=R/l;}
  jk.style.transform='translate('+dx+'px,'+dy+'px)';let x=dx/R,z=dy/R;const m=Math.hypot(x,z);if(m<.14){x=z=0;}input.x=x;input.z=z;
});
const jend=e=>{if(e.pointerId!==jid)return;jid=null;jb.style.display='none';input.joy=null;input.x=input.z=0;recomputeKeys();};
jz.addEventListener('pointerup',jend);jz.addEventListener('pointercancel',jend);jz.addEventListener('lostpointercapture',jend);
// clears every held / queued input (pause, match start, menus) so nothing fires later by accident
function resetInput(){
  input.shoot=input.shootPress=input.shootRel=input.pass=input.dash=input.special=input.swap=false;input.keys={};
  jid=null;jb.style.display='none';input.joy=null;input.x=input.z=0;
  document.querySelectorAll('.tb.down').forEach(b=>b.classList.remove('down'));
}
function bindBtn(id,down,up){
  const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('down');SFX.init();down();});
  const u=e=>{if(b.classList.contains('down')){b.classList.remove('down');if(up)up();}};
  b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u);b.addEventListener('lostpointercapture',u);
}
bindBtn('#tbShoot',()=>{input.shoot=true;input.shootPress=true;},()=>{if(input.shoot)input.shootRel=true;input.shoot=false;});
bindBtn('#tbPass',()=>{input.pass=true;});bindBtn('#tbDash',()=>{input.dash=true;});bindBtn('#tbSpec',()=>{input.special=true;});bindBtn('#tbSwap',()=>{input.swap=true;});
if(IS_TOUCH)document.body.classList.add('touch');

/* ---- pause ---- */
function togglePause(){
  if(G.view!=='game'||G.state==='over')return;
  G.paused=!G.paused;resetInput();
  if(G.paused){show('sPause');SFX.crowd(0);SFX.slideLvl(0,0);SFX.windLvl(0);}else{hideAll();blurUI();}
}
$('#bPause').onclick=()=>{SFX.ui();togglePause();};
$('#pResume').onclick=()=>{SFX.ui();togglePause();};
$('#pRestart').onclick=()=>{SFX.ui();const c=Object.assign({},G.cfg);G.paused=false;if(c.mode==='tour')showTourIntro();else startMatch(c);};
$('#pQuit').onclick=()=>{SFX.ui();toMenu();};
$('#bSound').onclick=()=>{save.set.sound=!save.set.sound;SFX.setOn(save.set.sound);$('#bSound').textContent=save.set.sound?'🔊':'🔇';persist();};
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(G.view==='game'&&!G.paused&&G.state!=='over')togglePause();SFX.suspend();}
  else SFX.resume();
});

/* ---- menus ---- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-go]');if(b){SFX.init();SFX.ui();goScreen(b.dataset.go);return;}
  const m=e.target.closest('[data-mode]');if(m){launch(m.dataset.mode);return;}
  const ty=e.target.closest('[data-type]');if(ty){const k=ty.dataset.type;if(TYPES[k].exclusive&&!save.types.includes(k)){flashMsg(__L('🔒 개발자 티어(레이팅 2100) 달성 또는 설정의 코드 입력으로 얻을 수 있어요'));return;}tryUse('types',k,TYPES[k].cost,()=>{save.type=k;});return;}
  const ht=e.target.closest('[data-hat]');if(ht){const k=ht.dataset.hat;tryUse('hats',k,HATS[k].cost,()=>{save.hat=k;});return;}
  const tr=e.target.closest('[data-trail]');if(tr){const k=tr.dataset.trail;tryUse('trails',k,TRAILS[k].cost,()=>{save.trail=k;});return;}
  const tm=e.target.closest('[data-team]');if(tm){save.team=tm.dataset.team;persist();renderSelect();rebuildShowcase();SFX.ui();return;}
});
addEventListener('resize',resize);addEventListener('resize',uiTidySoon);
addEventListener('orientationchange',()=>setTimeout(()=>{resize();uiTidy();},200));

/* ================= v17: season league · rink conditions · pass-combo shot ================= */
// One translation key per sentence: {slots} are filled after translation, so word order can change per language.
function fmtL(s,o){return String(s).replace(/\{(\w+)\}/g,(m,k)=>o&&o[k]!=null?o[k]:m);}
const nonExclTypes=()=>Object.keys(TYPES).filter(k=>!TYPES[k].exclusive);
const pct=x=>Math.round(x*100);

/* ---------- 1. season league ---------- */
// 28-day seasons on a fixed local calendar (season 1 starts Monday 2026-10-26 = local day 20752).
// A season pays once, at its end, for the best tier reached after a tier game that season, if it had >= SEASON.min tier games.
// A new season pulls ratings above the pivot back by (1-keep) of the excess.
const SEASON={days:28,epoch:20752,min:3,pivot:1200,keep:.75,hot:3,
  rew:[{p:60},{p:120},{p:200,g:2},{p:320,g:3},{p:480,g:3},{p:700,g:4},{p:1000,g:4},{p:1500,g:4}]};
function seasonNow(){return Math.max(1,Math.floor((dayNum()-SEASON.epoch)/SEASON.days)+1);}
function seasonLeft(n){return Math.max(1,SEASON.epoch+(n||save.season.n||seasonNow())*SEASON.days-dayNum());}
function seasonDate(n){const d=new Date((SEASON.epoch+n*SEASON.days-1)*86400000);try{return d.toLocaleDateString(I18N.loc,{month:'long',day:'numeric',timeZone:'UTC'});}catch(e){return (d.getUTCMonth()+1)+'/'+d.getUTCDate();}}
function seasonSoft(r){return r>SEASON.pivot?Math.round(SEASON.pivot+(r-SEASON.pivot)*SEASON.keep):r;}
function seasonRewTxt(i){const R=SEASON.rew[i];return '⭐ '+R.p+'P'+(R.g!=null?' + '+fmtL(__L('{g} 카드'),{g:GRADES[R.g].n}):'');}
// called from loadSave() (hoisted): literals only, nothing declared further down
function seasonLoad(S){
  const n=v=>Number.isFinite(+v)?Math.max(0,Math.floor(+v)):0,r=v=>Math.min(n(v),4000),s=save.season,okT=t=>Number.isFinite(+t)&&+t>=-1&&+t<=7?Math.floor(+t):-1;
  s.n=Math.min(n(S.n),99999);for(const k of['g','w','d','l'])s[k]=Math.min(n(S[k]),99999);
  s.best=r(S.best);s.start=r(S.start);s.paid=Math.min(n(S.paid),99999);
  const L=S.last;
  if(L&&typeof L==='object'){
    const c=L.card&&typeof L.card==='object'&&typeof L.card.k==='string'&&TYPES[L.card.k]&&n(L.card.g)<=4?{k:L.card.k,g:n(L.card.g),isNew:L.card.isNew===true}:null;
    s.last={n:n(L.n),g:n(L.g),w:n(L.w),d:n(L.d),l:n(L.l),best:r(L.best),t:okT(L.t),ok:L.ok===true,pts:Math.min(n(L.pts),99999),card:c,seen:L.seen!==false,r0:r(L.r0),r1:r(L.r1),quiet:L.quiet===true};
  }
  if(Array.isArray(S.hist))s.hist=S.hist.filter(h=>h&&typeof h==='object').slice(0,8).map(h=>({n:n(h.n),t:okT(h.t),ok:h.ok===true,best:r(h.best),g:n(h.g),w:n(h.w),pts:Math.min(n(h.pts),99999)}));
}
// settle the finished season (once), soft-reset the rating, start the current one. Returns true when a season ended now.
function seasonCheck(){
  const S=save.season,cur=seasonNow(),now=Date.now();
  if(save.clk&&now<save.clk-300000)return false;                 // clock moved backwards: nothing settles
  if(!S.n){S.n=cur;S.start=save.mgr.r;persist();return false;}
  if(cur<=S.n)return false;
  const m=save.mgr,r0=m.r,t=S.best>0?tierOf(S.best).i:-1,ok=S.g>=SEASON.min&&t>=0;
  const L={n:S.n,g:S.g,w:S.w,d:S.d,l:S.l,best:S.best,t,ok,pts:0,card:null,seen:false,r0,r1:r0,quiet:false};
  if(ok&&S.paid<S.n){
    const R=SEASON.rew[t];L.pts=R.p;save.points+=R.p;
    if(R.g!=null)L.card=grantTier(R.g);
    S.paid=S.n;
  }
  m.r=seasonSoft(r0);L.r1=m.r;
  if(m.r!==r0){m.hist.unshift({d:m.r-r0,r:m.r,l:__L('시즌 리셋'),ts:now});if(m.hist.length>10)m.hist.length=10;}
  L.quiet=!S.g&&m.r===r0;if(L.quiet)L.seen=true;                 // nothing happened for this player: start quietly
  if(S.g){S.hist.unshift({n:S.n,t,ok,best:S.best,g:S.g,w:S.w,pts:L.pts});if(S.hist.length>8)S.hist.length=8;}
  S.last=L;Object.assign(S,{n:cur,g:0,w:0,d:0,l:0,best:0,start:m.r});
  persist();return true;
}
function seasonAdd(sc,r){const s=save.season;if(!s.n)s.n=seasonNow();s.g++;if(sc===1)s.w++;else if(sc===0)s.l++;else s.d++;if(r>s.best)s.best=r;}
function seasonRulesTxt(){
  const ks=nonExclTypes();
  return fmtL(__L('시즌은 {w}주마다({d}일) 바뀌어요.<br>시즌 동안 랭크전·선발전 같은 티어 게임을 {m}판 이상 하면, 시즌이 끝날 때 그 시즌에 도달한 최고 티어로 보상을 받아요 (티어 게임을 마친 뒤의 레이팅 기준).<br>보상 카드는 그 등급의 펭귄 중 하나가 같은 확률로 나와요 (레어 {r2}종 · 신화 {r3}종 · 전설 {r4}종).<br>새 시즌이 시작되면 레이팅 중 {v}점을 넘는 부분이 {c}% 줄어들어요 (예: {a} → {b}).'),
    {r2:tierTypes(2).length,r3:tierTypes(3).length,r4:tierTypes(4).length,w:SEASON.days/7,d:SEASON.days,m:SEASON.min,k:ks.length,p:+(100/ks.length).toFixed(1),v:SEASON.pivot,c:pct(1-SEASON.keep),a:SEASON.pivot+400,b:seasonSoft(SEASON.pivot+400)});
}
function seasonBoxHtml(){
  const S=save.season,n=S.n||seasonNow(),left=seasonLeft(n),ti=S.best?tierOf(S.best):null,ok=S.g>=SEASON.min;
  let h='<div class="rk-season"><div class="ss-top"><b>'+fmtL(__L('🏆 시즌 {n}'),{n})+'</b><span>'+(left>1?fmtL(__L('{date}까지 · {d}일 남음'),{date:seasonDate(n),d:left}):__L('오늘 자정에 끝나요'))+'</span></div><div class="ss-row">';
  h+='<div class="ss-cell"><small>'+__L('이번 시즌 최고 티어')+'</small>'+(ti?'<b style="color:'+ti.c+'">'+TIER_IC[ti.i]+' '+ti.name+'</b><small>'+fmtL(__L('레이팅 {r}'),{r:S.best})+'</small>':'<b class="dim">—</b><small>'+__L('티어 게임을 하면 기록돼요')+'</small>')+'</div>';
  h+='<div class="ss-cell"><small>'+__L('이번 시즌 티어 게임')+'</small><b>'+fmtL(__L('{g}판'),{g:S.g})+'</b><small'+(ok?' class="ok">'+__L('✔ 보상 조건 달성'):'>'+fmtL(__L('{k}판 더 하면 보상 조건 달성'),{k:SEASON.min-S.g}))+'</small></div>';
  h+='<div class="ss-cell"><small>'+__L('지금 끝나면 받는 보상')+'</small>'+(ti&&ok?'<b>'+seasonRewTxt(ti.i)+'</b><small>&nbsp;</small>':'<b class="dim">'+__L('아직 없음')+'</b><small>'+(ti?fmtL(__L('조건을 채우면 {r}'),{r:seasonRewTxt(ti.i)}):'&nbsp;')+'</small>')+'</div>';
  h+='</div><details class="odds ss-tbl"><summary>'+__L('시즌 보상표 · 규칙')+'</summary><div class="ss-rows">'
    +TIERS.map((T_,i)=>'<div'+(ti&&ti.i===i?' class="cur"':'')+'><span style="color:'+T_.c+'">'+TIER_IC[i]+' '+T_.n+'</span><b>'+seasonRewTxt(i)+'</b></div>').join('')+'</div>'+seasonRulesTxt()+'</details>';
  if(S.hist.length)h+='<div class="ss-hist"><small>'+__L('지난 시즌')+'</small>'+S.hist.slice(0,4).map(x=>'<span>'+fmtL(__L('시즌 {n}'),{n:x.n})+' · '+(x.ok&&x.t>=0?TIER_IC[x.t]+' '+TIERS[x.t].n:__L('보상 없음'))+'</span>').join('')+'</div>';
  return h+'</div>';
}
// one line in the tier-game header; tapping it scrolls to the season box
function seasonMiniHtml(){
  const S=save.season,n=S.n||seasonNow(),left=seasonLeft(n),ok=S.g>=SEASON.min;
  return '<button type="button" class="ss-mini" data-ss-go="1">'+fmtL(__L('🏆 시즌 {n} · {left}'),{n,left:left>1?fmtL(__L('{d}일 남음'),{d:left}):__L('오늘 종료')})+' · '+(ok?__L('✔ 보상 조건 달성'):fmtL(__L('보상까지 {g}/{m}판'),{g:S.g,m:SEASON.min}))+'</button>';
}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-ss-go]');if(!b)return;const t=document.querySelector('#rkBody .rk-season');if(t){SFX.ui();t.scrollIntoView({behavior:'smooth',block:'start'});}});
function seasonNote(){
  const s=save.season,k=SEASON.min-s.g;
  if(k>0)return fmtL(__L('🏆 시즌 보상까지 티어 게임 {k}판 남았어요'),{k});
  if(k===0)return __L('🏆 시즌 보상 조건 달성! 시즌이 끝나면 이번 시즌 최고 티어로 보상을 받아요');
  const ti=tierOf(s.best);return fmtL(__L('🏆 시즌 {n} 최고 티어: {t}'),{n:s.n,t:'<b style="color:'+ti.c+'">'+ti.name+'</b>'});
}
function seasonBadge(){
  const b=$('#ssBadge');if(!b)return;const n=save.season.n||seasonNow(),left=seasonLeft(n);
  b.textContent=left>1?fmtL(__L('시즌 {n} · D-{d}'),{n,d:left}):fmtL(__L('시즌 {n} · 오늘 종료'),{n});
  b.classList.toggle('hot',left<=SEASON.hot);b.style.display='inline-block';
}
// season-end summary: shown once, on the home screen, after the reward has already been paid by seasonCheck()
function seasonPopup(){
  const S=save.season,L=S.last;if(!L||L.seen||G.view==='game'||G.ui!=='sMenu'||window.__NOFX)return false;
  const d=$('#cardDlg');if(!d||d.classList.contains('on'))return false;
  for(const id of['#tutAsk','#devFx','#cfmDlg','#enhFx'])if($(id).classList.contains('on'))return false;
  const T_=L.t>=0?TIERS[L.t]:null;
  let h='<div class="ss-pop"><h3>'+fmtL(__L('🏆 시즌 {n} 종료!'),{n:L.n})+'</h3>';
  if(T_)h+='<div class="ss-pbadge" style="--tc:'+T_.c+'">'+TIER_IC[L.t]+'</div><div class="ss-pt"><small>'+__L('시즌 최고 티어')+'</small><b style="color:'+T_.c+'">'+tierOf(L.best).name+'</b><small>'+fmtL(__L('레이팅 {r}'),{r:L.best})+'</small></div>';
  h+='<div class="ss-prec">'+fmtL(__L('티어 게임 {g}판 · {w}승 {d}무 {l}패'),L)+'</div>';
  if(L.ok)h+='<div class="ss-prew"><small>'+__L('시즌 보상')+'</small><b>⭐ '+L.pts+'P</b>'+(L.card?'<div class="ss-pcard" style="--cw:84px">'+cardHtml(L.card.k,{g:L.card.g,lv:L.card.isNew?L.card.g:0,tag:L.card.isNew?'NEW':__L('보관')})+'</div><small>'+TYPES[L.card.k].name+' · '+GRADES[L.card.g].n+'</small>':'')+'</div>';
  else h+='<div class="ss-pmiss">'+fmtL(__L('티어 게임을 {m}판 이상 한 시즌만 보상을 받아요 (이번 시즌 {g}판)'),{m:SEASON.min,g:L.g})+'</div>';
  h+='<div class="ss-pnext">'+fmtL(__L('시즌 {n} 시작!'),{n:S.n})+(L.r1!==L.r0?' '+fmtL(__L('레이팅 {a} → {b}'),{a:L.r0,b:L.r1}):'')+'</div>';
  h+='<div class="row cf-btns"><button class="btn" data-ss="ok">'+__L('확인')+'</button><button class="btn primary" data-ss="rk">'+__L('🏅 티어 게임')+'</button></div></div>';
  L.seen=true;persist();                                          // shown once, even if the page closes now
  d.querySelector('.cd-body').innerHTML=h;
  const close=go=>{d.classList.remove('on');d.onclick=null;if(go)goScreen('sRanked');};
  d.onclick=e=>{const b=e.target.closest('[data-ss]');if(b){SFX.ui();close(b.dataset.ss==='rk');}else if(e.target===d||e.target.classList.contains('cd-x'))close(false);};
  d.classList.add('on');SFX.win();vib([30,40,30,40,120]);return true;
}
function seasonPopSoon(){clearTimeout(seasonPopSoon.t);seasonPopSoon.t=setTimeout(()=>{try{seasonPopup();}catch(e){}},900);}
// a season can end while the game stays open on the home / tier screen
setInterval(()=>{try{if(G.view==='game')return;if(seasonCheck()){leagueMenuRefresh();if(G.ui==='sRanked')renderRanked();}}catch(e){}},30000);

/* ---------- 2. rink conditions ---------- */
// Rolled per match in quick / free / tournament (not the final). Both teams play under the same rule.
const COND={
  blizzard:{ico:'🌨️',name:__L('눈보라'),desc:__L('시야가 좁아지고, 쌓인 눈 때문에 퍽이 빨리 느려져요. AI 선수들의 슛도 흔들려요.'),f:{pf:1.3,aim:1.6,read:.5}},
  thin:{ico:'🧊',name:__L('얇은 얼음'),desc:__L('얼음이 매끄러워 멈추기와 방향 전환이 어려워요. 퍽도 더 멀리 미끄러져요.'),f:{grip:.5,glide:.45,acc:.85,brk:.75,pf:.62}},
  night:{ico:'🌙',name:__L('밤 경기'),desc:__L('어두운 경기장에서 조명이 퍽과 내 펭귄을 비춰요. 골키퍼 반응이 느려져 골이 더 잘 나와요.'),f:{react:1.4,gkErr:1.3,read:.6}}
};
const COND_W={none:40,blizzard:20,thin:20,night:20};      // chance per match in % (the help text is built from these numbers)
const COND_BONUS=.1,COND_MODES=['quick','free','tour'];
const CF0={grip:1,glide:1,acc:1,brk:1,pf:1,aim:1,read:1,react:1,gkErr:1},CF=Object.assign({},CF0);   // physics / AI factors of the current match
const CV={fog:0,dark:0,thin:0};                                                                       // eased visual levels
G.cond=null;
function condAllowed(cfg){return !!(cfg&&save.set.cond!==false&&COND_MODES.includes(cfg.mode)&&!cfg.final&&!cfg.tutorial&&!cfg.demo);}
function condRoll(){let x=Math.random()*100;for(const k in COND_W){x-=COND_W[k];if(x<0)return k==='none'?null:k;}return null;}
function condPick(cfg){return cfg&&cfg.cond!==undefined?(COND[cfg.cond]?cfg.cond:null):(condAllowed(cfg)?condRoll():null);}
// HUD: chip (tap = description), intro card during the countdown, screen tint, note on the pause screen
const condFx=document.createElement('div');condFx.id='condFx';
const condTag=document.createElement('button');condTag.id='condTag';condTag.type='button';
const condCard=document.createElement('div');condCard.id='condCard';condCard.setAttribute('aria-live','polite');
{const hud=$('#hud');if(hud){hud.insertBefore(condFx,hud.firstChild);hud.appendChild(condTag);hud.appendChild(condCard);}}
const pauseCond=document.createElement('div');pauseCond.id='pauseCond';pauseCond.style.display='none';
{const h2=$('#sPause h2');if(h2&&h2.parentNode)h2.parentNode.insertBefore(pauseCond,h2.nextSibling);}
condTag.onclick=e=>{e.stopPropagation();condTag.blur();if(!G.cond)return;SFX.ui();const E=COND[G.cond];hypeToast(E.ico+' '+E.name+' · '+E.desc);};
function condHud(){
  const on=!!G.cond,E=on?COND[G.cond]:null;
  condTag.textContent=on?E.ico+' '+E.name:'';condTag.classList.toggle('on',on);
  if(on)condTag.setAttribute('aria-label',fmtL(__L('빙판 변수: {n} · 설명 보기'),{n:E.name}));
  pauseCond.innerHTML=on?'<small>'+__L('이번 경기 빙판 변수')+'</small><b>'+E.ico+' '+E.name+'</b><span>'+E.desc+'</span>':'';pauseCond.style.display=on?'':'none';
  document.body.dataset.cond=on?G.cond:'';
}
function condStart(cfg){
  G.cond=condPick(cfg);Object.assign(CF,CF0,G.cond?COND[G.cond].f:null);
  if(G.cond==='thin')drawCracks();
  condHud();
  clearTimeout(condStart.t);condCard.classList.remove('on');
  if(G.cond&&!window.__NOFX){const E=COND[G.cond];
    condCard.innerHTML='<small>'+__L('빙판 변수')+'</small><b>'+E.ico+' '+E.name+'</b><span>'+E.desc+'</span>';
    void condCard.offsetWidth;condCard.classList.add('on');condStart.t=setTimeout(()=>condCard.classList.remove('on'),3600);SFX.whoosh();}
}
function condClear(){G.cond=null;Object.assign(CF,CF0);clearTimeout(condStart.t);condCard.classList.remove('on');condHud();}
function condBonus(base){return G.cond&&COND[G.cond]?Math.max(2,Math.round(base*COND_BONUS)):0;}
function condBonusRow(R){if(!(R.cond>0))return '';const E=COND[R.condK]||{ico:'',name:''};return '<div class="rs-row"><span>'+fmtL(__L('{i} 빙판 변수 보너스 ({n})'),{i:E.ico,n:E.name})+'</span><span><b class="cu" data-to="'+R.cond+'">0</b> P</span></div>';}
function condIntroHtml(k){const E=COND[k];return E?'<div class="tour-cond">'+fmtL(__L('빙판 변수: {i} {n}'),{i:E.ico,n:E.name})+'<small>'+E.desc+'</small></div>':'';}
// blizzard: heavy snow + wind (overrides the arena's weather while it lasts)
let condWx=false;
function condWeather(w){
  if(G.view!=='game'||G.cond!=='blizzard'){if(condWx){condWx=false;w.t=Math.min(w.t,3);}return;}
  w.t=Math.max(w.t,5);w.target=1;w.wind=15;if(!condWx){condWx=true;w.mode='blizzard';$('#wx').textContent='🌨️';}
}
// end of setTOD(): blizzard fog closes in, night dims the sky light (the rink floodlights stay on)
const fogWhite=new T.Color(.86,.9,.95);
function condLight(){
  if(CV.fog>.0005){scene.fog.density+=CV.fog/Math.max(1,camera.position.y/15);scene.fog.color.lerp(fogWhite,clamp(CV.fog/.024,0,1)*.75);}   // the portrait camera sits up to 2× farther: same whiteout on every screen
  if(CV.dark>.005){const k=CV.dark;hemi.intensity*=1-.6*k;sun.intensity*=1-.65*k;renderer.toneMappingExposure*=1-.28*k;for(const l of lamps)l.pl.intensity*=1-.5*k;}
}
// thin ice: crack lines drawn on an overlay of the ice (fresh pattern every thin-ice match)
const crackC=document.createElement('canvas');crackC.width=1024;crackC.height=512;const crackX=crackC.getContext('2d'),crackTex=new T.CanvasTexture(crackC);
const crackMesh=new T.Mesh(iceGeo.clone(),new T.MeshBasicMaterial({map:crackTex,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
crackMesh.position.y=.011;crackMesh.renderOrder=1;crackMesh.visible=false;scene.add(crackMesh);
function drawCracks(){
  const cx=crackX,sx=1024/(2*W),sz=512/(2*D);cx.clearRect(0,0,1024,512);cx.lineCap='round';cx.lineJoin='round';
  const seg=(px,pz,a,len,w,depth)=>{
    const pts=[[px,pz]],n=3+((Math.random()*3)|0);let x=px,z=pz;
    for(let i=0;i<n;i++){a+=rnd(-.5,.5);x+=Math.cos(a)*len/n;z+=Math.sin(a)*len/n;pts.push([x,z]);if(depth<2&&Math.random()<.35)seg(x,z,a+rnd(-1.1,1.1),len*.5,w*.7,depth+1);}
    for(const st of[['rgba(25,70,120,.5)',w*2.2],['rgba(255,255,255,.9)',w]]){cx.strokeStyle=st[0];cx.lineWidth=st[1];cx.beginPath();pts.forEach((p,i)=>{const X=512+p[0]*sx,Y=256+p[1]*sz;if(i)cx.lineTo(X,Y);else cx.moveTo(X,Y);});cx.stroke();}
  };
  for(let c=0;c<8;c++){const x0=rnd(-W+4,W-4),z0=rnd(-D+2.5,D-2.5),b=4+((Math.random()*4)|0);for(let i=0;i<b;i++)seg(x0,z0,i/b*TAU+rnd(-.3,.3),rnd(1.4,3.4),rnd(1,1.8),0);}
  crackTex.needsUpdate=true;
}
// night: two pools of light on the ice (the puck, my penguin)
const condSpotTex=glowTex('rgba(255,247,226,1)','rgba(255,238,200,.5)');
const condSpots=[11,7].map(sz=>{const m=new T.Mesh(new T.PlaneGeometry(sz,sz),new T.MeshBasicMaterial({map:condSpotTex,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.rotation.x=-Math.PI/2;m.position.y=.021;m.renderOrder=1;m.visible=false;scene.add(m);return m;});
let condTint=false;
function condFrame(dt){
  const g=G.view==='game',c=g?G.cond:null,k=Math.min(1,dt*1.6);
  if(!g){CV.fog=CV.dark=CV.thin=0;}
  else{CV.fog+=((c==='blizzard'?.024:0)-CV.fog)*k;CV.dark+=((c==='night'?1:0)-CV.dark)*k;CV.thin+=((c==='thin'?1:0)-CV.thin)*k;}
  iceMat.roughness=lerp(.28,.08,CV.thin);
  if(CV.thin>.01||CV.dark>.01||condTint){const b=lerp(1,.84,smooth(.35,.85,G.tod))*(1-.4*CV.dark);iceMat.color.setRGB(b*(1-.14*CV.thin),b*(1-.05*CV.thin),b);condTint=CV.thin>.01||CV.dark>.01;}   // same base as rinkFrame(), never compounding; night darkens the ice under the spotlights
  crackMesh.visible=CV.thin>.01;crackMesh.material.opacity=.8*CV.thin;
  const on=CV.dark>.02,pk=G.puck,pl=G.player;
  condSpots[0].visible=on;condSpots[1].visible=on&&!!pl;
  if(on){condSpots[0].position.set(pk.rx,.021,pk.rz);condSpots[0].material.opacity=.62*CV.dark;if(pl){condSpots[1].position.set(pl.rx,.022,pl.rz);condSpots[1].material.opacity=.4*CV.dark;}}
}

/* ---------- 3. pass-combo shot ---------- */
// Completed passes in a row (each within PC.win s of the last, no opponent touch, no miss) build a team combo.
// From PC.need passes the team's next shot within PC.win s is stronger. Same rule for both teams.
const PC={need:3,win:6,bonus:{3:.2,4:.25,5:.3}};
function pcBonus(n){return n>=5?PC.bonus[5]:PC.bonus[n]||0;}
function pcOn(){const c=G.cfg;return !!(c&&!c.demo&&c.mode!=='demo'&&!c.tutorial&&!(c.challenge&&c.challenge.kind==='pass'));}
function pcReset(){for(const k of['blue','red']){const tm=G.teams&&G.teams[k];if(tm)tm.pc={n:0,exp:0};}}
function pcReady(tm){const c=tm&&tm.pc;return !!(c&&c.n>=PC.need&&G.t<=c.exp&&pcOn());}
function pcBreak(tm,expired){
  const c=tm&&tm.pc;if(!c||!c.n)return;const was=c.n>=PC.need&&(expired||G.t<=c.exp);c.n=0;c.exp=0;
  if(was&&tm===G.mine&&pcOn()){const pk=G.puck;popAt(__L('콤보 끊김'),pk.x,2.4,pk.z);}
}
function pcPass(ps){
  if(!pcOn())return;const tm=ps.from.team,c=tm.pc||(tm.pc={n:0,exp:0});
  if(c.n&&G.t>c.exp)c.n=0;                                        // too slow: a new chain starts with this pass
  c.n++;c.exp=G.t+PC.win;
  if(c.n===PC.need){
    if(tm===G.mine){SFX.pickup();vib([12,30,12]);burst(ps.to.x,ps.to.z,12,1.1);}
    else if(G.mine){popAt(__L('⚠ 상대 콤보 슛!'),ps.to.x,2.7,ps.to.z);SFX.passBad(false);}
  }
  const r=ps.to;if(r&&!r.human&&!r.goalie&&r.ai){r.ai.keepT=c.n<PC.need&&Math.random()<G.diff.passP+.15?G.t+rnd(.3,.7):0;if(r.ai.keepT)r.ai.cool=Math.min(r.ai.cool,0);}
}
function pcTouch(p){const o=p&&p.team&&p.team.opp;if(o&&o.pc&&o.pc.n)pcBreak(o);}
function pcShotMul(p){
  p._combo=0;if(p.goalie||!pcReady(p.team))return 1;
  const c=p.team.pc,b=pcBonus(c.n);p._combo=c.n;c.n=0;c.exp=0;return 1+b;
}
function pcAfterShot(p){
  const pk=G.puck;if(!p._combo||!pk.shot)return;pk.shot.combo=p._combo;
  popAt(__L('⚡ 콤보 슛!'),pk.x,2.3,pk.z);burst(pk.x,pk.z,16,1.4);
  if(p.team===G.mine){G.cam.shake=Math.max(G.cam.shake,.35);if(p.human)vib(30);if(realMatch())save.cum.comboShot++;}
}
function pcGoal(tm,sh){if(sh&&sh.combo&&sh.by&&sh.by.team===tm&&tm===G.mine&&realMatch())save.cum.comboGoal++;pcReset();}
function pcPopText(ps){
  const ch=G.cfg&&G.cfg.challenge;
  if(!pcOn()||(ch&&ch.kind==='pass'))return G.chain>1?__L('패스 성공! x')+G.chain:__L('패스 성공!');
  const n=(ps.from.team.pc||{}).n||0;
  if(n>=PC.need)return fmtL(__L('⚡ 콤보 x{n} · 다음 슛 +{p}%'),{n,p:pct(pcBonus(n))});
  return n>1?__L('패스 성공! x')+n:__L('패스 성공!');
}
// AI give-and-go: an AI skater that receives a chain pass may plan to keep the chain going (chance grows with difficulty)
function pcGiveGo(p){
  const ai=p.ai,t=ai.keepT;if(!t||G.t<t)return false;ai.keepT=0;
  const tm=p.team,c=tm.pc;if(G.t-t>3||!pcOn()||!c||!c.n||c.n>=PC.need||G.t>c.exp)return false;
  const mate=bestMate(p,0,0,true);if(!mate||laneBlock(G.puck.x,G.puck.z,mate.x,mate.z,tm)<1.6)return false;
  if(doPass(p,mate)){ai.cool=rnd(.5,1);return true;}return false;
}
function pcChip(a){if(G.mine&&pcReady(G.mine)){const c=G.mine.pc;a.push(fmtL(__L('⚡ 콤보 슛 +{p}% {s}'),{p:pct(pcBonus(c.n)),s:Math.max(0,c.exp-G.t).toFixed(1)}));}}
// combo-ready marker around the puck: gold = my team's combo shot is ready, red = the opponent's
const comboRing=new T.Mesh(new T.RingGeometry(.78,1.02,40),new T.MeshBasicMaterial({color:0xffd34d,transparent:true,opacity:.92,side:T.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));
comboRing.rotation.x=-Math.PI/2;comboRing.renderOrder=2;comboRing.visible=false;scene.add(comboRing);
function pcFrame(){
  if(G.view!=='game'||!G.teams||!G.teams.blue){comboRing.visible=false;return;}
  if(G.state==='play')for(const k of['blue','red']){const tm=G.teams[k],c=tm.pc;if(c&&c.n&&G.t>c.exp)pcBreak(tm,true);}
  const m=pcReady(G.mine),o=!!G.mine&&pcReady(G.mine.opp);
  comboRing.visible=m||o;
  if(m||o){const pk=G.puck;comboRing.material.color.setHex(m?0xffd34d:0xff5a3a);comboRing.position.set(pk.rx,.035,pk.rz);comboRing.scale.setScalar(1+.12*Math.sin(G.t*12));}
  const pk=G.puck,sh=pk.shot;
  if(sh&&sh.combo&&Math.hypot(pk.vx,pk.vz)>6)for(let j=0;j<2;j++)emit(pk.x,.22,pk.z,-pk.vx*.05+rnd(-1,1),rnd(.5,2),-pk.vz*.05+rnd(-1,1),.4,.26,1,.86,.25);
}
function v17Frame(dt){condFrame(dt);pcFrame();}

/* ---------- help text (게임 방법), built from the live numbers ---------- */
function howV17(){
  const list=Object.keys(COND).map(k=>COND[k].ico+' '+COND[k].name+' '+COND_W[k]+'%').join(' · ');
  return fmtL(__L('⚡ <b>콤보 슛</b>: 패스를 {w}초 안에 이어서 {n}번 성공하면, {w}초 안에 쏘는 다음 슛 위력이 +{a}% (4번 +{b}%, 5번 이상 +{c}%). 상대 팀도 똑같아요!'),{w:PC.win,n:PC.need,a:pct(PC.bonus[3]),b:pct(PC.bonus[4]),c:pct(PC.bonus[5])})
    +'<br>'+fmtL(__L('🌨️🧊🌙 <b>빙판 변수</b>: 빠른 경기 · 자유 경기 · 토너먼트에서 경기마다 {p}% 확률로 붙어요 (토너먼트 결승은 제외 · {list}). 변수가 붙은 경기는 보상 +{b}%! 설정에서 끌 수 있어요.'),{p:100-COND_W.none,list,b:pct(COND_BONUS)})
    +'<br>'+fmtL(__L('🏆 <b>시즌 리그</b>: 시즌은 {d}일마다 바뀌어요. 티어 게임을 {m}판 이상 하면 시즌이 끝날 때 최고 티어로 보상을 받아요. 새 시즌엔 {v}점을 넘는 레이팅이 조금 내려가요.'),{d:SEASON.days,m:SEASON.min,v:SEASON.pivot});
}
{const p=$('#sHow .panel');if(p){const box=document.createElement('div');box.className='how how-v17';box.style.cssText='grid-template-columns:1fr;margin-top:12px';box.innerHTML='<div><h3>'+__L('🆕 시즌 · 빙판 변수 · 콤보 슛')+'</h3>'+howV17()+'</div>';const rows=p.querySelectorAll('.row');p.insertBefore(box,rows.length?rows[rows.length-1]:null);}}
seasonCheck();

/* ================= v18: ten more real penguin species ================= */
// 임금 · 마카로니 · 로열 · 피오르드랜드 · 노란눈 · 쇠푸른 · 아프리카 · 훔볼트 · 마젤란 · 갈라파고스 펭귄.
// Stats, prices, gacha weights, market prices and jersey numbers are in the tables patched by v18_species.py.
// This module: their special skills (+ AI use), personalities, positions, team chemistry, 3D plumage / bills / crests,
// card art, and the help texts (built from the same numbers the code uses).
const NEW18=['king','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos'];

/* ---------- special skills ---------- */
const SPX={
  trumpet:{cd:10,r:10,t:2.5,cut:3},           // King: rally the team
  crest:{cd:8,t:.6,mul:1.9,knock:1.1},        // Macaroni: head-first charge
  royalpass:{cd:8,spd:1.45,max:28,win:1.5,mul:1.12},   // Royal: pass nobody can cut + a long one-timer window
  shadow:{cd:9,t:3,spd:1.12},                 // Fiordland: can't be knocked down or stripped
  keeneye:{cd:9,t:5,mul:1.08},                // Yellow-eyed: next shot to the open corner
  hop:{cd:7,t:.5,v:11,h:.85},                 // Little: leap over sticks and bodies
  bray:{cd:9,r:7.5,t:1.4},                    // African: startle everyone nearby
  current:{cd:11,t:3},                        // Humboldt: the whole team skates faster
  double:{cd:8,t:2.5},                        // Magellanic: dash now + one free dash
  sunflare:{cd:10,t:2.5,react:1.8,err:1.6},   // Galápagos: dazzle the opposing goalie
  rush:1.2                                    // speed boost of the King's Trumpet / Humboldt Current (top speed and acceleration ×)
};
for(const k in SPX)if(SPX[k].cd)SPEC[k]={cd:SPX[k].cd};
Object.assign(SPECIALS,{trumpet:__L('킹 트럼펫'),crest:__L('크레스트 돌격'),royalpass:__L('로열 패스'),shadow:__L('숲 그림자'),keeneye:__L('골든 아이'),hop:__L('요정 점프'),bray:__L('당나귀 울음'),current:__L('훔볼트 해류'),double:__L('더블 대시'),sunflare:__L('적도의 태양')});
// one line per skill for the card detail / squad / select screens (numbers come from SPX)
function spDesc(sp){
  const X=SPX[sp]||{},P=v=>Math.round((v-1)*100);
  switch(sp){
    case 'surge':return __L('길고 강한 돌진 · 주변 상대를 느리게 해요 · 하키 규칙: 퍽 없는 상대를 넘어뜨리면 방해 반칙');
    case 'dash':return __L('빠르게 돌진해요 · 부딪힌 상대를 강하게 밀쳐요 · 하키 규칙: 퍽 없는 상대를 넘어뜨리면 방해 반칙');
    case 'slide':return __L('배로 미끄러지며 태클해요 · 빗나가면 잠깐 느려져요 · 하키 규칙: 퍽보다 선수를 먼저 넘어뜨리면 트리핑');
    case 'flipper':return __L('퍽 가까이에서 쓰면 아주 강한 슛 · 퍽이 멀면 헛스윙하고 잠깐 느려져요');
    case 'icebreak':return __L('얼음을 내려쳐 주변 상대를 밀어내고 느리게 해요 · 아주 가까운 상대는 넘어져요');
    case 'trumpet':return fmtL(__L('동료 전원의 대시를 바로 채우고 특수 기술 대기 시간을 {c}초 줄여요 · 넘어진 동료를 일으키고, {r}m 안의 우리 팀은 {t}초 동안 빨라져요'),{c:X.cut,r:X.r,t:X.t});
    case 'crest':return fmtL(__L('{t}초 동안 머리로 돌진해요 · 처음 부딪힌 상대를 넘어뜨리고 퍽을 떨어뜨리게 해요 · 하키 규칙: 퍽 없는 상대를 넘어뜨리면 방해 반칙'),{t:X.t});
    case 'royalpass':return fmtL(__L('아무도 끊을 수 없는 빠른 패스 · 받은 동료는 {w}초 안에 원타이머를 쏠 수 있어요 (위력 +{m}%) · 퍽이 멀면 헛스윙해요'),{w:X.win,m:P(X.mul)});
    case 'shadow':return fmtL(__L('{t}초 동안 넘어지지 않고 퍽을 빼앗기지 않아요 · 속도 +{s}%'),{t:X.t,s:P(X.spd)});
    case 'keeneye':return fmtL(__L('{t}초 안에 쏘는 다음 슛이 골키퍼 반대쪽 구석으로 정확히 날아가요 (위력 +{m}%)'),{t:X.t,m:P(X.mul)});
    case 'hop':return __L('높이 뛰어올라 상대를 넘어가요 · 뛰는 동안 부딪히거나 넘어지지 않고 퍽도 지켜요');
    case 'bray':return fmtL(__L('{r}m 안의 상대가 깜짝 놀라 {t}초 동안 느려지고 슛 준비가 끊겨요 · 퍽을 가진 상대는 퍽을 놓쳐요'),{r:X.r,t:X.t});
    case 'current':return fmtL(__L('우리 팀 전원이 {t}초 동안 빨라져요 (속도 +{s}%)'),{t:X.t,s:P(SPX.rush)});
    case 'double':return fmtL(__L('바로 대시하고, {t}초 안에 대시를 한 번 더 쓸 수 있어요 (대기 시간 없이)'),{t:X.t});
    case 'sunflare':return fmtL(__L('상대 골키퍼가 {t}초 동안 눈이 부셔 반응이 느려지고 슛 방향을 읽지 못해요'),{t:X.t});
  }
  return '';
}
const hopY18=p=>p.hopT>0?Math.sin(Math.PI*clamp(1-p.hopT/SPX.hop.t,0,1))*SPX.hop.h:0;
function ring18(x,z,r,c){const n=Math.min(56,Math.round(16+r*3.5)),s=r/.6;for(let i=0;i<n;i++){const a=i/n*TAU;emit(x+Math.cos(a)*.5,.55,z+Math.sin(a)*.5,Math.cos(a)*s,2.6,Math.sin(a)*s,.6,.24,c[0],c[1],c[2]);}}
function dash18(p,dx,dz){p.dashT=.45;p.dashMul=1.6;p.dashSpec=false;p.vx+=dx*5;p.vz+=dz*5;burst(p.x,p.z,9,1.1);SFX.whoosh();}
function dbl18(p){   // Magellanic: the free second dash (dash / special button, the AI fires it by itself)
  const m=Math.hypot(p.ix,p.iz);let dx,dz;if(m>.2){dx=p.ix/m;dz=p.iz/m;}else{dx=Math.sin(p.heading);dz=Math.cos(p.heading);}
  p.dbl=0;p.dblT=0;dash18(p,dx,dz);popAt('x2!',p.x,2.3,p.z);if(p.human)tutEvent('dash');return true;
}
function spec18(p,sp,dx,dz){
  const X=SPX[sp];if(!X||!X.cd)return false;
  const tm=p.team,pk=G.puck,cast=()=>{p.specMax=X.cd;p.cd.special=X.cd;};
  if(sp==='trumpet'){
    cast();
    for(const m of tm.skaters){
      if(m!==p){m.cd.dash=0;m.cd.special=Math.max(0,m.cd.special-X.cut);if(m.fall>0)m.fall=Math.min(m.fall,.08);}
      if(Math.hypot(m.x-p.x,m.z-p.z)<=X.r)m.rushT=Math.max(m.rushT||0,X.t);
    }
    ring18(p.x,p.z,X.r,[1,.83,.35]);SFX.fanfare();popAt(castShout(p,"KING'S CALL!"),p.x,2.7,p.z);
  }else if(sp==='crest'){
    cast();p.dashT=X.t;p.dashMul=X.mul;p.dashSpec=true;p.ramT=X.t;p.vx+=dx*7;p.vz+=dz*7;
    burst(p.x,p.z,16,1.3);SFX.whoosh();popAt(castShout(p,'CREST CHARGE!'),p.x,2.5,p.z);
  }else if(sp==='royalpass'){
    let mate=null;
    if(canHit(p)){if(p.human){const a=humanAim(p);mate=bestMate(p,a[0],a[1],false);}else mate=bestMate(p,0,0,true)||bestMate(p,Math.sin(p.heading),Math.cos(p.heading),false);}
    if(!mate||!doPass(p,mate)){p.specMax=2.5;p.cd.special=2.5;p.slow=Math.max(p.slow,.3);SFX.whoosh();popAt('MISS',p.x,2.2,p.z);return true;}   // no puck: short cooldown
    const v0=Math.hypot(pk.vx,pk.vz)||1,v=Math.min(X.max,v0*X.spd);pk.vx*=v/v0;pk.vz*=v/v0;
    G.royal={by:p,to:mate,team:tm,until:G.t+Math.hypot(mate.x-pk.x,mate.z-pk.z)/v+.4};
    cast();burst(pk.x,pk.z,14,1.2);SFX.passOk();popAt(castShout(p,'ROYAL PASS!'),p.x,2.6,p.z);
  }else if(sp==='shadow'){
    cast();p.shadowT=X.t;burst(p.x,p.z,12,1);SFX.whoosh();popAt(castShout(p,'SHADOW STEP!'),p.x,2.5,p.z);
    for(let i=0;i<22;i++){const a=rnd(TAU);emit(p.x,rnd(.3,1.4),p.z,Math.cos(a)*rnd(1,3),rnd(.5,2),Math.sin(a)*rnd(1,3),.6,.22,.16,.42,.22);}
  }else if(sp==='keeneye'){
    cast();p.eyeT=X.t;SFX.flare();popAt(castShout(p,'GOLDEN EYE!'),p.x,2.6,p.z);
  }else if(sp==='hop'){
    cast();p.hopT=X.t;const v=Math.max(X.v,Math.hypot(p.vx,p.vz));p.vx=dx*v;p.vz=dz*v;p.slideT=0;p.dashT=0;p.dashSpec=false;
    burst(p.x,p.z,10,1);SFX.hop();popAt(castShout(p,'FAIRY HOP!'),p.x,2.7,p.z);
  }else if(sp==='bray'){
    cast();
    for(const o of tm.opp.skaters){
      if(o.frozen||o.fall>0)continue;const d=Math.hypot(o.x-p.x,o.z-p.z);if(d>X.r)continue;
      o.slow=Math.max(o.slow,X.t);o.charging=false;o.charge=0;o.stage=0;if(o.ai)o.ai.plan=null;
      if(G.carry===o){carryRelease(.6);const l=d||1;pk.vx=o.vx*.5+(o.x-p.x)/l*3+rnd(-2,2);pk.vz=o.vz*.5+(o.z-p.z)/l*3+rnd(-2,2);}
    }
    ring18(p.x,p.z,X.r,[1,.95,.82]);SFX.bray();G.cam.shake=Math.max(G.cam.shake,.25);popAt(castShout(p,'HEE-HAW!'),p.x,2.8,p.z);
  }else if(sp==='current'){
    cast();for(const m of tm.skaters)m.rushT=Math.max(m.rushT||0,X.t);
    ring18(p.x,p.z,5,[.45,.8,1]);SFX.whoosh();popAt(castShout(p,'COLD CURRENT!'),p.x,2.6,p.z);
  }else if(sp==='double'){
    cast();dash18(p,dx,dz);p.dbl=1;p.dblT=X.t;popAt(castShout(p,'DOUBLE DASH!'),p.x,2.5,p.z);
  }else if(sp==='sunflare'){
    cast();const og=tm.opp.goalie;SFX.flare();
    if(og){og.dazT=X.t;for(let i=0;i<40;i++){const a=rnd(TAU),s=rnd(1,4);emit(og.x,1.7,og.z,Math.cos(a)*s,rnd(1,4),Math.sin(a)*s,.7,.3,1,rnd(.85,1),rnd(.4,.7));}}
    popAt(castShout(p,'SUN FLARE!'),og?og.x:p.x,2.9,og?og.z:p.z);
  }else return false;
  return true;
}
function ram18(p){   // Macaroni crest charge: the first opponent it runs into goes down
  if(p.fall>0){p.ramT=0;return;}
  for(const o of p.team.opp.skaters){
    if(o.fall>0||o.frozen)continue;if(Math.hypot(o.x-p.x,o.z-p.z)>p.r+o.r+.18)continue;
    p.ramT=0;if(knock(o,SPX.crest.knock)){bigHit(p,o);rulesFoul(p,o);}
    SFX.bump(1);burst(o.x,o.z,14,1.3);G.cam.shake=Math.max(G.cam.shake,o.human||p.human?.35:.15);break;
  }
}
function royal18(ps){const R=G.royal;if(!R||ps.from!==R.by)return;G.royal=null;ps.to.otWin=SPX.royalpass.win;}
function keen18(p,ax,az){   // Yellow-eyed golden eye: the next shot on goal flies to the corner away from the goalie
  if(!(p.eyeT>0)||p.goalie)return null;
  const pk=G.puck,tm=p.team,gx=tm.dir*W,dx=gx-pk.x,dz=-pk.z,gd=Math.hypot(dx,dz);
  if(dx*tm.dir<1.5||gd>32)return null;                     // not in front of the net: keep the aim
  if((ax*dx+az*dz)/(gd||1)<.5)return null;                 // aimed more than 60° away from the net (a pass / clear): keep it
  const og=tm.opp.goalie,gz=og?og.z:0,side=Math.abs(gz)>.25?-Math.sign(gz):(pk.z>=0?-1:1),tz=side*(GW-.55),l=Math.hypot(gx-pk.x,tz-pk.z)||1;
  p.eyeT=0;return [(gx-pk.x)/l,(tz-pk.z)/l];
}
function tick18(p,dt){
  if(p.rushT>0)p.rushT-=dt;if(p.shadowT>0)p.shadowT-=dt;if(p.eyeT>0)p.eyeT-=dt;if(p.hopT>0)p.hopT-=dt;if(p.dazT>0)p.dazT-=dt;
  if(p.ramT>0){p.ramT-=dt;if(!p.frozen)ram18(p);}
  if(p.dbl>0){p.dblT-=dt;if(p.dblT<=0)p.dbl=0;else if(!p.human&&!p.frozen&&p.fall<=0&&p.dblT<SPX.double.t-.55)dbl18(p);}
  if(p.otWin&&G.t-(p.recvT==null?-9:p.recvT)>p.otWin)p.otWin=0;
}
function sim18(h){   // the royal pass immunity ends on time, near either goal (no ghost goals) or when play stops
  const R=G.royal;if(R&&(G.state!=='play'||G.t>R.until||Math.abs(G.puck.x)>W-3.5))G.royal=null;
}
// AI use of the new skills: 'any' every think, 'carry' with the puck, 'chase' while chasing it (the old skills keep their rules)
const oppNear18=(p,r)=>p.team.opp.skaters.filter(o=>o.fall<=0&&!o.frozen&&Math.hypot(o.x-p.x,o.z-p.z)<r).length;
function oppAhead18(p,r){const fx=Math.sin(p.heading),fz=Math.cos(p.heading);return p.team.opp.skaters.some(o=>{if(o.fall>0||o.frozen)return false;const dx=o.x-p.x,dz=o.z-p.z,d=Math.hypot(dx,dz);return d<r&&(dx*fx+dz*fz)/(d||1)>.3;});}
function ai18(p,mode){
  const sp=p.ty.special,X=SPX[sp];if(!X||!X.cd||p.cd.special>0||p.fall>0||p.goalie||p.frozen||p.passive)return false;
  if(G.cfg&&(G.cfg.tutorial||G.cfg.noAIShoot))return false;
  const tm=p.team,pk=G.puck,gx=tm.dir*W,gd=Math.hypot(gx-pk.x,pk.z),press=nearestOpp(p);let go=false;
  const matesNear=r=>tm.skaters.filter(m=>m!==p&&m.fall<=0&&Math.hypot(m.x-p.x,m.z-p.z)<r).length;
  if(mode==='shoot'){        // the carrier just decided to shoot
    if(sp==='keeneye')go=Math.random()<.75;
    else if(sp==='sunflare')go=gd<17&&!!tm.opp.goalie&&Math.random()<.75;
  }else if(mode==='pass'){   // the carrier just decided to pass
    go=sp==='royalpass'&&Math.random()<.7;
  }else if(mode==='any'){
    if(sp==='trumpet'){let down=0,busy=0;for(const m of tm.skaters){if(m===p)continue;if(m.fall>.35)down++;if(m.cd.special>4)busy++;}go=down>0||(busy>=2&&Math.random()<.25);}
    else if(sp==='bray'){const c=G.carry;go=!!(c&&c.team!==tm&&Math.hypot(c.x-p.x,c.z-p.z)<X.r*.75)||oppNear18(p,X.r*.8)>=2;}
  }else if(mode==='carry'){
    if(sp==='shadow')go=press<3.2;
    else if(sp==='hop')go=press<2.6&&oppAhead18(p,3.2);
    else if(sp==='current')go=pk.x*tm.dir<0&&gd>18;
    else if(sp==='trumpet')go=pk.x*tm.dir<0&&gd>18&&matesNear(X.r)>0;
    else if(sp==='double')go=press<3||gd>16;
  }else if(mode==='chase'){
    const car=G.carrier,dist=reach(p);
    if(sp==='crest'){if(car&&car.team!==tm&&!car.goalie){const dx=car.x-p.x,dz=car.z-p.z,d=Math.hypot(dx,dz);go=d<5&&(dx*Math.sin(p.heading)+dz*Math.cos(p.heading))/(d||1)>.4;}}
    else if(sp==='bray')go=!!(car&&car.team!==tm&&!car.goalie&&Math.hypot(car.x-p.x,car.z-p.z)<X.r*.75);
    else if(sp==='trumpet')go=dist>14&&matesNear(X.r)>0;
    else if(sp==='hop'||sp==='double'||sp==='current')go=dist>10;
    else if(sp==='shadow')go=dist>12;
  }
  return go?useSpecial(p):false;
}
// status chips for the player (shown next to the item / combo chips)
function chip18(p,a){
  if(p.rushT>0)a.push('💨 '+p.rushT.toFixed(1));
  if(p.shadowT>0)a.push('🌲 '+p.shadowT.toFixed(1));
  if(p.eyeT>0)a.push('🎯 '+p.eyeT.toFixed(1));
  if(p.dbl>0)a.push('⏩ '+p.dblT.toFixed(1));
  if(p.otWin&&G.t-(p.recvT==null?-9:p.recvT)<p.otWin)a.push('👑 '+Math.max(0,p.otWin-(G.t-p.recvT)).toFixed(1));
  const og=p.team&&p.team.opp&&p.team.opp.goalie;if(og&&og.dazT>0)a.push('☀️ '+og.dazT.toFixed(1));
}
function v18Frame(dt){   // skill particles
  if(G.view!=='game')return;
  for(const p of G.pengs){
    if(p.frozen)continue;const s=p.ty.scale||1;
    if(p.shadowT>0&&Math.random()<dt*22)emit(p.x+rnd(-.5,.5),rnd(.4,1.4)*s,p.z+rnd(-.5,.5),rnd(-.6,.6),rnd(.2,1),rnd(-.6,.6),.55,.2,.16,.42,.22);
    if(p.eyeT>0&&Math.random()<dt*16)emit(p.x+rnd(-.25,.25),1.75*s,p.z+rnd(-.25,.25),0,rnd(.6,1.4),0,.4,.16,1,.85,.25);
    if(p.rushT>0&&Math.random()<dt*24)emit(p.x,.25,p.z,-p.vx*.12,rnd(.6,1.4),-p.vz*.12,.4,.18,.55,.85,1);
    if(p.hopT>0&&Math.random()<dt*40)emit(p.x,.2,p.z,rnd(-.5,.5),rnd(.5,1.2),rnd(-.5,.5),.35,.2,.85,.95,1);
    if(p.ramT>0&&Math.random()<dt*40){const fx=Math.sin(p.heading),fz=Math.cos(p.heading);emit(p.x+fx*.6,1.3*s,p.z+fz*.6,fx*2+rnd(-1,1),rnd(.5,2),fz*2+rnd(-1,1),.3,.18,1,.7,.2);}
    if(p.dazT>0&&Math.random()<dt*30){const a=G.t*6+rnd(0,1);emit(p.x+Math.cos(a)*.55,1.95,p.z+Math.sin(a)*.55,0,.4,0,.45,.2,1,.95,.5);}
    if(p.dbl>0&&Math.random()<dt*12)emit(p.x+rnd(-.3,.3),.3,p.z+rnd(-.3,.3),0,rnd(.5,1),0,.35,.15,.6,.8,1);
  }
}

/* ---------- personalities (strength + weakness), positions, team chemistry ---------- */
Object.assign(TT,{
  king:{name:__L('카리스마'),plus:__L('넘어져도 20% 빨리 일어나요'),minus:__L('슛 충전 속도 -8%'),fall:.8,chg:.92},
  macaroni:{name:__L('싸움꾼'),plus:__L('몸싸움 충돌 위력 +20%'),minus:__L('슛 정확도 -15%'),hit:1.2,spread:1.15},
  royal:{name:__L('지휘자'),plus:__L('패스 속도 +15%'),minus:__L('강슛 최대 위력 -5%'),pass:1.15,pow:.95},
  fiordland:{name:__L('숲의 파수꾼'),plus:__L('상대 패스·슛 가로채기 범위 +0.15m'),minus:__L('대시 재사용 +0.3초'),reach:.15,dashCd:.3},
  yelloweye:{name:__L('스나이퍼'),plus:__L('슛 정확도 +30%'),minus:__L('슛 충전 속도 -10%'),spread:.7,chg:.9},
  little:{name:__L('포켓 로켓'),plus:__L('대시 재사용 -0.6초'),minus:__L('강슛 최대 위력 -10%'),dashCd:-.6,pow:.9},
  african:{name:__L('퍽 사냥꾼'),plus:__L('퍽 빼앗기 확률 +25%'),minus:__L('패스 속도 -8%'),steal:1.25,pass:.92},
  humboldt:{name:__L('해류 서퍼'),plus:__L('원타이머 위력 +10%'),minus:__L('넘어지면 회복이 15% 느려요'),ot:1.1,fall:1.15},
  magellanic:{name:__L('장거리 철새'),plus:__L('최고 속도 +4%'),minus:__L('강슛 최대 위력 -5%'),spd:1.04,pow:.95},
  galapagos:{name:__L('적도의 순발력'),plus:__L('톡 슛 위력 +15%'),minus:__L('넘어지면 회복이 10% 느려요'),tap:1.15,fall:1.1}
});
Object.assign(PREF,{king:'mid',macaroni:'attacker',royal:'mid',fiordland:'defender',yelloweye:'attacker',little:'mid',african:'defender',humboldt:'mid',magellanic:'defender',galapagos:'attacker'});
// family chemistry: real penguin groups (2 of a group in the line-up)
const syn18=(ks,n)=>s=>ks.filter(k=>s.has(k)).length>=n;
SYN.push(
  {id:'brush',name:__L('남극 토박이'),desc:__L('아델리·젠투·턱끈 중 2종 출전'),eff:{turn:.1,accel:.1},need:syn18(['basic','fast','defense'],2),link:['basic','fast','defense']},
  {id:'great',name:__L('거인 형제'),desc:__L('황제 + 임금 함께 출전'),eff:{power:.3},need:syn18(['strong','king'],2),link:['strong','king']},
  {id:'crested',name:__L('노란 볏 패밀리'),desc:__L('바위뛰기·마카로니·로열·피오르드랜드 중 2종 출전'),eff:{accel:.2},need:syn18(['balanced','macaroni','royal','fiordland'],2),link:['balanced','macaroni','royal','fiordland']},
  {id:'banded',name:__L('줄무늬 패밀리'),desc:__L('아프리카·훔볼트·마젤란·갈라파고스 중 2종 출전'),eff:{speed:.2},need:syn18(['african','humboldt','magellanic','galapagos'],2),link:['african','humboldt','magellanic','galapagos']},
  {id:'kiwi',name:__L('뉴질랜드 친구들'),desc:__L('노란눈·쇠푸른·피오르드랜드 중 2종 출전'),eff:{turn:.2},need:syn18(['yelloweye','little','fiordland'],2),link:['yelloweye','little','fiordland']}
);
// a real fact per species (card detail)
const PFACT={
  basic:__L('남극 해안에 살아요. 눈 둘레의 하얀 고리가 특징이고, 돌멩이를 모아 둥지를 지어요.'),
  fast:__L('헤엄이 가장 빠른 펭귄이에요 (시속 약 36km). 눈 위의 하얀 무늬와 주황색 부리가 특징이에요.'),
  strong:__L('가장 큰 펭귄이에요 (키 약 1.1m). 남극의 한겨울에 수컷이 알을 발 위에 올려 품어요.'),
  defense:__L('턱 아래의 가는 검은 줄이 헬멧 끈처럼 보여서 붙은 이름이에요.'),
  balanced:__L('바위 사이를 두 발로 깡충깡충 뛰어다녀요. 노란 눈썹 깃과 빨간 눈이 특징이에요.'),
  auk:__L('원래 펭귄이라는 이름으로 불리던 북대서양의 날지 못하는 바닷새예요. 1844년에 멸종했어요.'),
  king:__L('두 번째로 큰 펭귄이에요. 귀 옆의 선명한 주황색 무늬가 특징이고, 둥지 없이 알을 발 위에 올려 품어요.'),
  macaroni:__L('이마에서 이어지는 주황색 장식 깃이 특징이에요. 이름은 18세기 영국에서 깃털 모자를 쓰던 멋쟁이를 부르던 말에서 왔어요.'),
  royal:__L('마카로니 펭귄과 닮았지만 얼굴이 하얘요. 남극해의 매쿼리섬 주변에서만 번식해요.'),
  fiordland:__L('뉴질랜드 남섬의 우거진 숲속에 둥지를 트는 수줍은 펭귄이에요. 눈 위로 굵은 노란 눈썹 깃이 있어요.'),
  yelloweye:__L('노란 눈과 머리를 두르는 노란 띠가 특징이에요. 뉴질랜드에만 살고, 가장 희귀한 펭귄 중 하나예요.'),
  little:__L('세계에서 가장 작은 펭귄이에요 (키 약 33cm, 몸무게 약 1kg). 푸른빛이 도는 깃털을 가졌어요.'),
  african:__L('아프리카 남부 해안에 살아요. 당나귀처럼 우는 소리 때문에 자카스 펭귄이라고도 불러요.'),
  humboldt:__L('페루와 칠레 해안에 살아요. 이 바다를 흐르는 차가운 훔볼트 해류에서 이름을 따왔어요.'),
  magellanic:__L('남아메리카 남쪽 끝에 살아요. 가슴의 검은 띠 두 줄이 특징이고, 땅굴을 파서 둥지를 지어요.'),
  galapagos:__L('적도의 갈라파고스 제도에 살아요. 야생 펭귄 중 유일하게 북반구에서도 볼 수 있어요.')
};
function spLine18(k){const sp=TYPES[k].special;return '<div class="sp-line">⚡ <b>'+SPECIALS[sp]+'</b> · '+spDesc(sp)+'</div>';}   // card detail: the skill
function fact18(k){return PFACT[k]?'<div class="fact-line"><b>'+__L('🔎 알고 있나요?')+'</b> '+PFACT[k]+'</div>':'';}            // card detail: a real fact
// unowned species: a faint silhouette instead of a plain "?" card (the exclusive one stays a secret)
function sil18(k,cw){
  if(TYPES[k].exclusive)return cw?'<div style="--cw:'+cw+'px;opacity:.6"><div class="pc-backface">?</div></div>':'<div class="pc-backface">?</div>';
  return '<div class="pc-sil"'+(cw?' style="--cw:'+cw+'px"':'')+'><div class="pc-sil-art">'+pengSVG(k)+'</div><b>?</b></div>';
}
// quick / free matches and the menu background use the whole roster
function oppMix18(){const ks=nonExclTypes();return [0,1,2,3].map(()=>ks[Math.floor(Math.random()*ks.length)]);}
function demo18(){const ks=nonExclTypes();return ks[Math.floor(Math.random()*ks.length)];}

/* ---------- 3D plumage, bills, eyes, crests ---------- */
const PK18DT={king:1,macaroni:1,fiord:1,yeye:1,african:1,humboldt:1,magellan:1,galapagos:1};   // dark chin / throat
const PK18EYE={macaroni:0xa8281f,royal:0x9a3424,fiord:0x8c2418,yeye:0xf2d23a,little:0xa3b0bd};
// Broad areas are vertex colours (royal face, little-blue body, yellow-eyed crown, king bib); fine marks (bands, face
// stripes, ear patches, bare pink skin, spots) are thin decals that follow the surface: on the body / head grids they
// would come out blocky.
function pkW18(pt,a,th,y,wh){   // white areas (before the colour mix)
  if(pt==='royal'){const top=lerp(1.5,1.3,smooth(.55,1.35,a));wh=Math.max(wh,(1-smooth(top-.025,top+.025,y))*smooth(1.0,1.08,y)*(1-smooth(1.25,1.5,a)));}
  else if(pt==='little')wh=Math.max(wh,(1-smooth(1.3,1.36,y))*smooth(1.0,1.06,y)*(1-smooth(.85,1.25,a)));
  return wh;
}
const PK18C={king:1,macaroni:1,yeye:1,little:1};
function pkC18(ty,pt,a,th,y,q){   // colour patches (after the white mix)
  const mix=(c,f)=>{if(f<=0)return;f=Math.min(1,f);q[0]=lerp(q[0],c[0],f);q[1]=lerp(q[1],c[1],f);q[2]=lerp(q[2],c[2],f);};
  if(pt==='king'){
    mix([1,.6,.12],(1-smooth(.75,1.3,a))*smooth(.86,1.04,y)*(1-smooth(1.16,1.24,y)));      // golden-orange upper breast fading into the white belly
    mix([.27,.3,.35],smooth(1.55,2.6,a)*(1-smooth(1.02,1.2,y))*smooth(.15,.5,y)*.75);       // silver-grey back
  }else if(pt==='macaroni')mix([1,.64,.1],(1-smooth(.1,.24,a))*smooth(1.55,1.58,y)*(1-smooth(1.63,1.67,y)));   // golden crest root on the forehead
  else if(pt==='yeye'){
    if(y>1.24){const top=smooth(1.36,1.5,y),sp=pkHash(Math.floor(th*26),Math.floor(y*40))>.6?.55:1;
      mix([.68*sp,.57*sp,.24*sp],top*.92);                                                    // speckled pale-yellow crown
      mix([.46,.38,.27],(1-top)*smooth(1.26,1.3,y)*(1-smooth(.5,1.0,a))*.85);}                // light brown face
  }else if(pt==='little')mix([.4,.52,.68],smooth(1.28,1.34,y)*(1-smooth(1.44,1.5,y))*smooth(.3,.6,a)*(1-smooth(1.3,1.6,a))*.5);   // blue-grey cheeks
}
const PK18_DMAT=rimify(new T.MeshStandardMaterial({vertexColors:true,roughness:.62,metalness:0,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4}),1);
const dPt18=(head,key)=>head?(th,y,o)=>pkHeadPt(th,y,-o):(th,y,o)=>pkBodyPt(key,th,y,o);
const rad18=(head,key,y)=>Math.max(.05,head?pkHeadR(y):pkBodyR(y)*(PK_SHAPE[key]||1));
function stripG18(key,head,pts,w,col,o){   // ribbon through control points [th,y]; w = half width (number or fn of 0..1)
  const cv=new T.SplineCurve(pts.map(q=>new T.Vector2(q[0],q[1]))),N=Math.max(24,pts.length*16),P=dPt18(head,key),pos=[],idx=[];
  for(let i=0;i<=N;i++){const u=i/N,c=cv.getPoint(u),n1=cv.getPoint(Math.min(1,u+.01)),n0=cv.getPoint(Math.max(0,u-.01)),r=rad18(head,key,c.y);
    const tx=(n1.x-n0.x)*r,ty=n1.y-n0.y,l=Math.hypot(tx,ty)||1,nx=-ty/l,ny=tx/l,ww=typeof w==='function'?w(u):w;
    for(const k of[-1,0,1]){const v=P(c.x+k*ww*nx/r,c.y+k*ww*ny,o||.006);pos.push(v.x,v.y,v.z);}}
  for(let i=0;i<N;i++)for(let j=0;j<2;j++){const a=i*3+j,b=a+1,c=a+3,d=c+1;idx.push(a,b,c,b,d,c);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return [g,col];
}
function blobG18(key,head,th0,y0,ra,ry,col,o){   // filled ellipse on the surface (ra, ry in metres)
  const P=dPt18(head,key),r=rad18(head,key,y0),n=22,c=P(th0,y0,o||.006),pos=[c.x,c.y,c.z],idx=[];
  for(let i=0;i<=n;i++){const a=i/n*TAU,v=P(th0+Math.cos(a)*ra/r,y0+Math.sin(a)*ry,o||.006);pos.push(v.x,v.y,v.z);}
  for(let i=1;i<=n;i++)idx.push(0,i,i+1);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return [g,col];
}
const taper18=(w,a,b)=>u=>w*Math.min(1,u/(a||.08),(1-u)/(b||.08));
function decals18(key){   // {b: body decals, h: head decals} (merged, vertex coloured) or null
  const ck='d18'+key;if(pkGeoC[ck]!==undefined)return pkGeoC[ck];
  const pt=TYPES[key].patch,B=[],H=[],blk=[.03,.034,.05],wht=[.95,.955,.97],pink=[.95,.56,.6],S=[-1,1];
  const chest=(y0,drop,w)=>B.push(stripG18(key,false,[-1.8,-1.25,-.75,-.35,0,.35,.75,1.25,1.8].map(t=>[t,y0-drop*smooth(.35,1.5,Math.abs(t))]),taper18(w,.06,.06),blk));
  const side=(pts,w,col,head)=>{for(const s of S)(head?H:B).push(stripG18(key,head,pts.map(q=>[s*q[0],q[1]]),w,col));};
  const blobs=(th,y,ra,ry,col,head)=>{for(const s of S)(head?H:B).push(blobG18(key,head,s*th,y,ra,ry,col));};
  const cPath=[[.16,1.556],[.6,1.553],[.95,1.52],[1.1,1.42],[1.08,1.3],[1.0,1.2]];   // banded penguins: brow arc + stripe down behind the cheek
  if(pt==='african'){chest(.975,.55,.034);side(cPath,taper18(.03,.1,.06),wht,true);blobs(.5,1.515,.034,.017,pink,true);
    for(const q of[[.22,.885],[-.42,.86],[.6,.92],[-.12,.9],[.34,.3],[-.25,.27],[.62,.34]])B.push(blobG18(key,false,q[0],q[1],.017,.017,blk));}
  else if(pt==='humboldt'){chest(.955,.5,.05);side(cPath,taper18(.021,.1,.06),wht,true);blobs(.3,1.41,.075,.05,pink,true);
    for(const q of[[.3,.87],[-.48,.85]])B.push(blobG18(key,false,q[0],q[1],.016,.016,blk));}
  else if(pt==='magellan'){chest(.905,.45,.03);B.push(stripG18(key,false,[-1.7,-1,0,1,1.7].map(t=>[t,1.045]),taper18(.028,.06,.06),blk));
    side(cPath,taper18(.027,.1,.06),wht,true);H.push(stripG18(key,true,[-1.05,-.5,0,.5,1.05].map(t=>[t,1.245]),taper18(.013,.1,.1),wht));blobs(.17,1.405,.03,.016,pink,true);}
  else if(pt==='galapagos'){chest(.965,.45,.02);side([[.74,1.505],[.92,1.45],[.97,1.35],[.9,1.24]],taper18(.016,.15,.08),wht,true);blobs(.2,1.37,.05,.022,[.96,.72,.7],true);}
  else if(pt==='fiord'){side([[.12,1.49],[.4,1.535],[.65,1.55],[.95,1.52],[1.3,1.47],[1.7,1.42],[2.05,1.39]],taper18(.027,.12,.3),[1,.86,.3],true);
    for(let i=0;i<3;i++)side([[.72+.12*i,1.355-.015*i],[.77+.12*i,1.3-.015*i]],taper18(.007,.3,.3),[.84,.86,.9],true);}
  else if(pt==='yeye')side([[.6,1.468],[1.2,1.47],[2,1.47],[2.7,1.47],[Math.PI,1.47]],taper18(.017,.08,.001),[1,.86,.28],true);
  else if(pt==='king')side([[1.43,1.49],[1.37,1.42],[1.26,1.34],[1.14,1.27],[1.06,1.21]],u=>lerp(.075,.024,u)*Math.min(1,u/.2+.25),[1,.52,.06],true);   // spoon-shaped ear patch running down to the neck
  else if(pt==='macaroni'||pt==='royal')blobs(.25,1.365,.03,.018,pink,true);
  return pkGeoC[ck]=(B.length||H.length)?{b:B.length?pkMerge(B):null,h:H.length?pkMerge(H):null}:null;
}
function bk18(hex,tip){const o=pkRGB(hex);return (t,y,x,c)=>{const l=smooth(.62,1,t)*(tip||0);c[0]=lerp(o[0],1,l*.55);c[1]=lerp(o[1],.8,l*.5);c[2]=lerp(o[2],.65,l*.5);};}
function bkBand18(a,b,k){return (t,y,x,c)=>{const f=smooth(a-.02,a+.02,t)*(1-smooth(b-.02,b+.02,t))*(k||.75),v=lerp(.055,.72,f);c[0]=v;c[1]=v*1.02;c[2]=v*1.06;};}
function bkBase18(hex,until){const o=pkRGB(hex);return (t,y,x,c)=>{const p=1-smooth(until-.06,until+.06,t);c[0]=lerp(.055,o[0],p);c[1]=lerp(.055,o[1],p);c[2]=lerp(.063,o[2],p);};}
const PK18BK={
  king:S=>Object.assign(S,{H:.05,droop:.42,hook:.06,lo:(t,y,x,c)=>{const pl=smooth(.06,.14,t)*(1-smooth(.66,.76,t))*smooth(.15,.45,Math.abs(x)),o=pkRGB(0xff7a45);c[0]=lerp(.055,o[0],pl);c[1]=lerp(.05,o[1],pl);c[2]=lerp(.063,o[2],pl);}}),
  macaroni:S=>Object.assign(S,{H:.085,droop:.32,hook:.18,up:bk18(0xc8562c,.2),lo:bk18(0xb54a26,0)}),
  royal:S=>Object.assign(S,{H:.09,droop:.32,hook:.18,up:bk18(0xd9784a,.22),lo:bk18(0xc8653c,0)}),
  fiord:S=>Object.assign(S,{H:.08,droop:.3,hook:.16,up:bk18(0xd2552a,.15),lo:bk18(0xc24a24,0)}),
  yeye:S=>Object.assign(S,{H:.064,droop:.24,hook:.12,up:bk18(0xb5644e,.35),lo:bk18(0xdc9e8c,0)}),
  little:S=>Object.assign(S,{H:.055,droop:.3,hook:.17,up:bk18(0x2c2e34,.1),lo:bk18(0x34363c,0)}),
  african:S=>Object.assign(S,{H:.07,droop:.28,hook:.14,up:bkBand18(.64,.74),lo:bkBand18(.6,.72)}),
  humboldt:S=>Object.assign(S,{H:.072,droop:.28,hook:.14,lo:bkBase18(0xe9a3a3,.36)}),
  magellan:S=>Object.assign(S,{H:.07,droop:.28,hook:.14,up:bkBand18(.66,.73,.55),lo:bkBand18(.62,.7,.55)}),
  galapagos:S=>Object.assign(S,{H:.062,droop:.26,hook:.12,lo:bkBase18(0xe6c08e,.56)})
};
// crests. Bare head: the full crest. Under any hat: only a few plumes behind the eyes, rooted below the brim, so nothing
// pokes out of the hat (the bare-headed rockhopper keeps its own crest from pkCrestGeo).
function pkCrest18(pt,bare){
  const ck='c18'+pt+bare;if(pkGeoC[ck]!==undefined)return pkGeoC[ck];
  const C={rock:[0xffd21a,0xffe24a],macaroni:[0xff9a14,0xffc02a,0xff7c10],royal:[0xffb21a,0xffd04a,0xff9a20],fiord:[0xffe066,0xfff08a]}[pt];
  if(!C||(bare&&pt==='rock'))return pkGeoC[ck]=null;
  const cols=C.map(pkRGB),list=[],up=new T.Vector3(0,1,0),q=new T.Quaternion(),M=new T.Matrix4();
  const cone=(b,dir,len,r,flat,col)=>{const d=dir.clone().normalize(),c=new T.ConeGeometry(r,len,6);c.scale(1,1,flat);c.translate(0,len/2,0);q.setFromUnitVectors(up,d);c.applyMatrix4(M.makeRotationFromQuaternion(q));c.translate(b.x,b.y,b.z);list.push([c,col]);return b.clone().addScaledVector(d,len*.9);};
  const tang=(th,s)=>new T.Vector3(Math.cos(th),0,-Math.sin(th)).multiplyScalar(s),nrm=th=>new T.Vector3(Math.sin(th),0,Math.cos(th));
  for(const s of[-1,1]){
    if(!bare){
      for(let i=0;i<4;i++){const th=s*(.86+.07*i),b=pkHeadPt(th,1.47-.012*i,-.006);
        cone(b,tang(th,s).addScaledVector(nrm(th),.3).add(new T.Vector3(0,-.3-.1*i,0)),.15+.022*i,.018,.55,cols[i%cols.length]);}
    }else if(pt==='fiord'){   // the brow stripe widens behind the eye into plumes that lie back and droop
      for(let i=0;i<6;i++){const th=s*(.78+.16*i),A=Math.abs(th),y=1.49+.06*smooth(.05,.6,A)-.13*smooth(.85,1.9,A),b=pkHeadPt(th,y+.008,-.004);
        cone(b,tang(th,s).addScaledVector(nrm(th),.12).add(new T.Vector3(0,-.3-.05*i,0)),.14+.012*i,.02,.38,cols[i%2]);}
    }else{   // macaroni / royal: plumes spring from one patch on the forehead, spread over the eyes and hang down behind them
      for(let i=0;i<6;i++){const th=s*(.04+.06*i),b=pkHeadPt(th,1.585+.008*i,-.004);
        const mid=cone(b,tang(th,s).addScaledVector(nrm(th),.2).add(new T.Vector3(0,.35-.04*i,0)),.13+.01*i,.02,.5,cols[i%3]);
        const th2=th+s*.42;cone(mid,tang(th2,s).multiplyScalar(.8).addScaledVector(nrm(th2),.3).add(new T.Vector3(0,-.6-.06*i,0)),.16+.025*i,.017,.5,cols[(i+1)%3]);}
    }
  }
  return pkGeoC[ck]=pkMerge(list);
}
function crest18(ty,hat,headAbs){const g=pkCrest18(ty.patch,!hat||hat==='none');if(g)headAbs.add(new T.Mesh(g,PK_MAT.vc));}

/* ---------- card art (own drawings, same frame as the other species) ---------- */
const SVG18={king:1,macaroni:1,royal:1,fiord:1,yeye:1,little:1,african:1,humboldt:1,magellan:1,galapagos:1};
function pengSVG18(k){
  const t=TYPES[k],p=t.patch,hx=c=>'#'+('00000'+(c>>>0).toString(16)).slice(-6);
  const D={little:'#3a5c8e',yeye:'#283446',king:'#1a2131'}[p]||'#1d2540',Wh='#f6faff',ft=hx(t.foot||0xff8c1c);
  const body={king:1.1,little:.9,galapagos:.92}[p]||1,all={little:.86,galapagos:.9}[p]||1;
  const sym=m=>m+'<g transform="matrix(-1 0 0 1 120 0)">'+m+'</g>';
  let s='<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg"><g transform="translate(60 134) scale('+all+') translate(-60 -134)">';
  s+='<ellipse cx="60" cy="134" rx="30" ry="5" fill="rgba(0,0,0,.28)"/>'+sym('<ellipse cx="46" cy="130" rx="12" ry="5" fill="'+ft+'"/>');
  s+='<g transform="translate(60 92) scale('+body+') translate(-60 -92)">'+sym('<ellipse cx="31" cy="92" rx="7" ry="21" fill="'+D+'" transform="rotate(14 31 92)"/>');
  s+='<ellipse cx="60" cy="92" rx="30" ry="38" fill="'+D+'"/><ellipse cx="60" cy="97" rx="20" ry="30" fill="'+Wh+'"/>';
  if(p==='king')s+='<ellipse cx="60" cy="75" rx="17" ry="10" fill="#ffae35"/><ellipse cx="60" cy="83" rx="15" ry="7" fill="#ffd47e" opacity=".7"/>';
  else if(p==='african'||p==='humboldt'){s+='<path d="M41.5 104V88Q60 68 78.5 88V104" stroke="'+D+'" stroke-width="'+(p==='african'?3.6:5.5)+'" fill="none"/>';
    s+=[[52,106],[66,101],[58,115],[69,113],[49,96]].slice(0,p==='african'?5:2).map(q=>'<circle cx="'+q[0]+'" cy="'+q[1]+'" r="1.5" fill="'+D+'"/>').join('');}
  else if(p==='magellan')s+='<path d="M41 76Q60 66 79 76" stroke="'+D+'" stroke-width="3.6" fill="none"/><path d="M41.5 104V90Q60 72 78.5 90V104" stroke="'+D+'" stroke-width="3.4" fill="none"/>';
  else if(p==='galapagos')s+='<path d="M42 84Q60 70 78 84" stroke="'+D+'" stroke-width="2.4" fill="none"/>';
  s+='</g><circle cx="60" cy="46" r="24" fill="'+D+'"/>';
  // head markings
  if(p==='king')s+=sym('<path d="M34 49Q35 37 45 40Q42 50 41 61Q35 58 34 49Z" fill="#ff9418"/><path d="M41 61Q44 66 49 69" stroke="#ff9418" stroke-width="2.6" fill="none" stroke-linecap="round"/>');
  else if(p==='royal')s+='<ellipse cx="60" cy="57" rx="20" ry="13.5" fill="#eef2f8"/>';
  else if(p==='little')s+='<ellipse cx="60" cy="63" rx="14.5" ry="8" fill="'+Wh+'"/>';
  else if(p==='yeye')s+='<path d="M36.6 43A24 24 0 0 1 83.4 43Q60 35 36.6 43Z" fill="#d6b24a"/>'+[[47,31],[55,27],[64,28],[72,32],[52,35],[66,34],[59,32]].map(q=>'<circle cx="'+q[0]+'" cy="'+q[1]+'" r="1.1" fill="#6a5524"/>').join('')+'<path d="M36.5 46Q60 40 83.5 46" stroke="#ffd83a" stroke-width="4.4" fill="none"/><ellipse cx="60" cy="58" rx="16" ry="8.5" fill="#7d6a52" opacity=".85"/>';
  else if(p==='fiord')s+=sym('<path d="M56 42Q47 33 37 37Q31 41 30 51Q34 44 39 42Q47 39 55 45Z" fill="#ffe066"/><path d="M45 56l-3.5 5.5M48 58l-2.5 5.5M51 59l-1.5 5" stroke="#e6edf5" stroke-width="1.5" stroke-linecap="round"/>');
  else if(p==='african'||p==='magellan')s+=sym('<path d="M57 34Q43 30 37 42Q34 55 46 67L49.5 65Q40 55 41 44Q45 36 57 38Z" fill="'+Wh+'"/>')+(p==='african'?sym('<ellipse cx="49" cy="40" rx="4.6" ry="2" fill="#f49aa9"/>'):'<path d="M44 64Q60 72 76 64" stroke="'+Wh+'" stroke-width="3" fill="none"/>');
  else if(p==='humboldt')s+=sym('<path d="M57 34.5Q43 31 37.5 42Q35 55 46 66L48 64.5Q40 55 40.5 44Q45 36.5 57 37Z" fill="'+Wh+'"/><ellipse cx="51" cy="51" rx="6.5" ry="3.8" fill="#f2a2a8"/>');
  else if(p==='galapagos')s+=sym('<path d="M38.5 43Q35.5 57 47.5 67" stroke="'+Wh+'" stroke-width="2.3" fill="none" stroke-linecap="round"/>');
  if(p==='macaroni'||p==='royal'){const c1=p==='royal'?'#ffbf2e':'#ffa21f',c2=p==='royal'?'#ffe07a':'#ffcf4a';
    s+=sym('<path d="M59 31Q47 22 34 28Q28 33 30 44Q33 36 40 32.5Q49 30 58.5 34.5Z" fill="'+c1+'"/><path d="M56 30Q45 25.5 36.5 31Q32.5 35 32.5 41" stroke="'+c2+'" stroke-width="1.6" fill="none" stroke-linecap="round"/>')+'<path d="M55 30Q60 22 65 30Q60 27.5 55 30Z" fill="'+c1+'"/>';}
  // eyes
  const iris={macaroni:'#b3282a',royal:'#a8322a',fiord:'#9a2a20',yeye:'#f2d23a',little:'#a8b6c4'}[p];
  if(iris)s+='<circle cx="50" cy="46" r="6" fill="#fff"/><circle cx="70" cy="46" r="6" fill="#fff"/><circle cx="50.6" cy="46.6" r="4.1" fill="'+iris+'"/><circle cx="70.6" cy="46.6" r="4.1" fill="'+iris+'"/><circle cx="50.9" cy="46.9" r="2.1" fill="#10131f"/><circle cx="70.9" cy="46.9" r="2.1" fill="#10131f"/>';
  else s+='<circle cx="50" cy="46" r="6.4" fill="#fff"/><circle cx="70" cy="46" r="6.4" fill="#fff"/><circle cx="51" cy="47" r="3.5" fill="#10131f"/><circle cx="71" cy="47" r="3.5" fill="#10131f"/>';
  s+='<circle cx="52.2" cy="45.4" r="1.3" fill="#fff"/><circle cx="72.2" cy="45.4" r="1.3" fill="#fff"/>';
  // bills
  if(p==='king')s+='<path d="M55 53Q60 50 65 53L61.6 74Q60 76 58.4 74Z" fill="#16171c"/><path d="M57.4 57L62.6 57L61.1 70.5L58.9 70.5Z" fill="#ff7a45"/>';
  else if(p==='macaroni'||p==='royal')s+='<g transform="translate(60 58) scale('+(p==='royal'?1.06:1)+') translate(-60 -58)">'+sym('<path d="M47.6 55.5L52 53.6L51.6 58.6Z" fill="#f2a0a8"/>')+'<path d="M49 54Q60 46 71 54Q68 67 60 70Q52 67 49 54Z" fill="'+(p==='royal'?'#d9784a':'#c8562c')+'"/><path d="M53 55Q60 51 67 55" stroke="rgba(255,255,255,.35)" stroke-width="1.4" fill="none"/></g>';
  else if(p==='fiord')s+='<path d="M51 54Q60 48 69 54Q66 65 60 67Q54 65 51 54Z" fill="#d2552a"/>';
  else if(p==='yeye')s+='<path d="M54 54Q60 50 66 54Q63.5 64 60 66Q56.5 64 54 54Z" fill="#b5644e"/><path d="M55.6 59.5L64.4 59.5Q63 64.5 60 66Q57 64.5 55.6 59.5Z" fill="#dc9e8c"/>';
  else if(p==='little')s+='<path d="M55.5 54Q60 51 64.5 54Q62.5 62 60 63.5Q57.5 62 55.5 54Z" fill="#2a2c32"/>';
  else{   // banded penguins: stout black bill (pink bare skin at the base for Humboldt / Magellanic / Galápagos)
    if(p!=='african')s+='<path d="M50.5 53Q60 47 69.5 53Q66 59 60 59.5Q54 59 50.5 53Z" fill="#f0a2a8"/>';
    s+='<path d="M53 55Q60 51 67 55Q64 65 60 67Q56 65 53 55Z" fill="#16171b"/>';
    if(p==='african')s+='<path d="M55.4 60.4L64.6 60.4L63.8 62.6L56.2 62.6Z" fill="#aeb6be"/>';
    if(p==='galapagos')s+='<path d="M55.2 59.5L64.8 59.5Q63 65 60 66.5Q57 65 55.2 59.5Z" fill="#e6c08e"/>';
  }
  s+='<ellipse cx="42" cy="57" rx="4" ry="2.6" fill="rgba(255,120,150,.55)"/><ellipse cx="78" cy="57" rx="4" ry="2.6" fill="rgba(255,120,150,.55)"/>';
  return s+'</g></svg>';
}

/* ---------- one-time news for players who already have a save ---------- */
function news18Html(){
  let h='<div class="nw-pop"><h3>'+fmtL(__L('🐧 새 펭귄 {n}종 합류!'),{n:NEW18.length})+'</h3><p>'+__L('모두 실제로 있는 펭귄이에요. 종마다 능력치, 성격, 특수 기술이 달라요.')+'</p>';
  h+='<div class="nw-cards">'+NEW18.map(k=>'<button class="nw-c" data-nw="'+k+'" style="--cw:62px" aria-label="'+escH(TYPES[k].name)+'">'+cardHtml(k,{lv:0,g:0})+'</button>').join('')+'</div>';
  h+='<p class="nw-how">'+__L('스카우트 뽑기, 이적 시장, 팀 편성의 펭귄 해금에서 얻을 수 있어요.')+'</p><div class="row cf-btns"><button class="btn" data-nw="ok">'+__L('확인')+'</button><button class="btn primary" data-nw="dex">'+__L('🔍 도감 보기')+'</button></div></div>';
  return h;
}
function news18Popup(){
  if(save.news18||G.view==='game'||G.ui!=='sMenu'||window.__NOFX)return false;
  const d=$('#cardDlg');if(!d||d.classList.contains('on'))return false;
  for(const id of['#tutAsk','#devFx','#cfmDlg','#enhFx']){const e=$(id);if(e&&e.classList.contains('on'))return false;}
  const h=news18Html();
  save.news18=true;persist();                                     // shown once, even if the page closes now
  d.querySelector('.cd-body').innerHTML=h;
  d.onclick=e=>{const b=e.target.closest('[data-nw]');
    if(b){SFX.ui();const v=b.dataset.nw;d.classList.remove('on');d.onclick=null;if(v==='dex'){scTab='dex';goScreen('sScout');renderScout();}else if(v!=='ok')openCard(v);}
    else if(e.target===d||e.target.classList.contains('cd-x')){d.classList.remove('on');d.onclick=null;}};
  d.classList.add('on');return true;
}
function news18Soon(n){clearTimeout(news18Soon.t);if(save.news18)return;n=n|0;news18Soon.t=setTimeout(()=>{let ok=false;try{ok=news18Popup();}catch(e){}if(!ok&&!save.news18&&n<8)news18Soon(n+1);},n?3000:1700);}

// card name that fits: full-width letters (Hangul/kana/CJK) count 1, Latin ~0.58; past 7.2 the font shrinks in proportion
function nmTag18(n){let w=0;for(const ch of n)w+=ch.codePointAt(0)>0x2e80?1:.58;
  return '<div class="pc-name"'+(w>7.2?' style="font-size:'+(1.04*7.2/w).toFixed(3)+'em"':'')+'>'+n+'</div>';}

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

/* ================= v21: fixed penguin rarity (기본 · 희귀 · 레어 · 신화 · 전설) ================= */
// save.cc[k] = spare cards of penguin k by rarity slot (only slot RAR[k] fills). Called at the end of loadSave() (hoisted):
// pre-v21 saves keep their old save.cards untouched; the same number of cards moves into save.cc once, and if those cards
// were worth more breakthrough points under the old grade values (1/2/4/8), the difference is kept in brkPts.
function rarLoad(s,num){
  const ks=Object.keys(TYPES);
  if(s.cc&&typeof s.cc==='object'){
    for(const k of ks){const a=s.cc[k];save.cc[k]=[0,1,2,3,4].map(i=>Array.isArray(a)?Math.max(0,Math.min(999,Math.floor(num(a[i],0)))):0);}
    return;
  }
  const OLD=[1,2,4,8];
  for(const k of ks){
    const a=save.cards[k]||[0,0,0,0],n=a.reduce((x,y)=>x+y,0),g=RAR[k]|0;
    save.cc[k]=[0,0,0,0,0];save.cc[k][g]=Math.min(999,n);
    const was=a.reduce((x,y,i)=>x+y*OLD[i],0),now=n*BRK.val[g];
    if(was>now)save.brkPts[k]=Math.min(999,(save.brkPts[k]|0)+was-now);
  }
}

/* ================= v22: hockey rules + referee ================= */
// 반칙(트리핑 · 방해 · 골키퍼 방해) → 퇴장과 파워플레이, 브레이크어웨이에서 뒤에서 넘어뜨리면 페널티 샷,
// 오프사이드(지연 오프사이드 포함), 아이싱, 페이스오프, 그리고 줄무늬 셔츠의 심판 펭귄.
// Every number shown on screen comes from RULE / penSecs(); the same values decide the calls.
const RULE={
  bl:8,              // blue lines at x=±8 (painted .62 wide)
  blEdge:8.31,       // the outer edge of a blue line (zone side)
  blIn:8.31+PUCKR,   // the puck is inside a zone once it has completely crossed the outer edge
  blP:8.31+.3,       // a skater is inside once both skates are past the outer edge
  gl:W-2.4,          // goal lines (the thin red lines near each end)
  dotN:6.2,dotE:13,dotZ:6,   // neutral-zone and end-zone faceoff spots
  delayMax:10,       // a delayed penalty is whistled after this many seconds at the latest
  stopT:2.7,         // whistle → call shown → faceoff
  foT:1.5,           // faceoff countdown
  hasPuck:.8,        // a skater still counts as playing the puck this long after touching it…
  near:.9,           // …or while the puck is this close (beyond touching distance)
  crease:3.6,        // goal crease radius
  psT:7              // a penalty shot must be taken within this many seconds
};
const RULE_K={
  trip:{ico:'🦵',n:__L('트리핑'),why:__L('퍽보다 선수를 먼저 넘어뜨렸어요 (슬라이드 태클은 퍽을 먼저 건드려야 해요)')},
  inter:{ico:'🙅',n:__L('방해 반칙'),why:__L('퍽을 갖지 않은 선수에게 돌진해서 넘어뜨렸어요')},
  gi:{ico:'🥅',n:__L('골키퍼 방해'),why:__L('골 크리스 안의 골키퍼에게 돌진했어요')},
  off:{ico:'🚩',n:__L('오프사이드'),why:__L('퍽보다 먼저 블루라인을 넘어 공격 지역에 들어갔어요')},
  ice:{ico:'🧊',n:__L('아이싱'),why:__L('센터 라인 뒤에서 친 퍽이 아무도 건드리지 않고 상대 골라인을 넘었어요')}
};
const RULE_MODES=['quick','ranked','tour','trial'];
function rulesMode(){
  const c=G.cfg;if(!c||c.tutorial||c.demo||!RULE_MODES.includes(c.mode))return 'off';
  const m=save.set.rules;return m==='fouls'||m==='off'?m:'full';
}
function rulesOn(full){const m=rulesMode();return m!=='off'&&(!full||m==='full');}
function rulesActive(){return !!(G.rl&&G.view==='game'&&G.state==='play'&&!G.so&&!G.ps&&rulesOn(false));}
function penFor(t){return clamp(Math.round((t||180)/9/5)*5,15,30);}   // 2 real minutes, scaled to the match length
function penSecs(){return penFor(G.cfg&&G.cfg.time);}
function boxMax(tm){const n=tm.skaters.length;return n>=2?1:0;}          // 1 vs 1: nobody can sit out → penalty shot instead
function onIce(tm){let n=0;for(const p of tm.skaters)if(!p.boxed)n++;return n;}
function shortH(tm){return onIce(tm)<onIce(tm.opp);}
function tmName(tm){return tm.key==='blue'?__L('블루'):__L('레드');}
function pkName(p){return p&&p.ty?p.ty.name.replace(__L(' 펭귄'),''):'';}
function rulesReset(){
  G.rl={log:[],box:[],delayed:null,off:null,ice:null,src:null,lastT:-9,stop:null,inZ:{blue:false,red:false},tag:null,thaw:false,warn:0,calls:[],
    st:{blue:{pen:0,pp:0,ppg:0,shg:0,ps:0,psg:0},red:{pen:0,pp:0,ppg:0,shg:0,ps:0,psg:0}}};
  G.ps=null;rulesHud(true);refSig(null);
  const l=$('#late');if(l&&l.textContent)l.textContent='';   // the previous match's last-seconds digit must not linger (it sat off-screen on landscape phones)
}
function rulesZoneSync(){const R=G.rl;if(!R)return;const pk=G.puck;for(const k of['blue','red'])R.inZ[k]=pk.x*G.teams[k].dir>RULE.blIn;R.off=null;R.ice=null;R.src=null;R.lastT=pk.lastT;}

/* ---------- penalty box (behind the far boards, next to the benches) ---------- */
function boxSpot(tm,i){return{x:(tm.key==='blue'?-1:1)*(11.6+i*1.1),z:-(D+1.45)};}
function boxPlace(p){
  const R=G.rl,mine=R?R.box.filter(e=>e.team===p.team):[],i=Math.max(0,mine.findIndex(e=>e.p===p)),s=boxSpot(p.team,i);
  p.x=p.ox=p.rx=p.px=s.x;p.z=p.oz=p.rz=p.pz=s.z;p.vx=p.vz=0;p.ix=p.iz=0;p.heading=0;p.fall=0;p.getup=0;p.charging=false;p.charge=0;
  p.dashT=p.slideT=p.ramT=p.hopT=0;p.dashSpec=false;p.pose='sad';if(p.ai){p.ai.plan=null;p.ai.slot=null;}
}
function boxSend(p,secs){
  const R=G.rl;if(G.carry===p)carryRelease(.3);
  p.boxed=true;p.frozen=true;R.box.push({p,team:p.team,t:secs,full:secs});boxPlace(p);
  if(p===G.player){const o=p.team.skaters.filter(q=>!q.boxed);setHuman(o[0]||null);}
}
function boxRelease(e,why){
  const R=G.rl,p=e.p;R.box.splice(R.box.indexOf(e),1);p.boxed=false;p.frozen=false;
  const s=boxSpot(p.team,0),x=clamp(s.x,-W+3,W-3),z=-(D-1.4);
  p.x=p.ox=p.rx=p.px=x;p.z=p.oz=p.rz=p.pz=z;p.vx=0;p.vz=2;p.heading=0;p.pose='play';
  for(const q of R.box)if(q.team===p.team)boxPlace(q.p);
  if(G.state==='play'&&G.view==='game'){popAt(why==='ppg'?__L('파워플레이 골 · 복귀'):__L('퇴장 끝 · 복귀!'),x,2.4,z);if(p.team===G.mine)SFX.ui();}
}
function rulesClearBox(){const R=G.rl;if(!R)return;for(const e of R.box.slice())boxRelease(e,'end');R.delayed=null;R.off=null;R.ice=null;}

/* ---------- fouls ---------- */
function playing(v){const pk=G.puck;return G.carry===v||(pk.last===v&&G.t-pk.lastT<RULE.hasPuck)||Math.hypot(pk.x-v.x,pk.z-v.z)<v.r+PUCKR+RULE.near;}
function foulKind(h,v){
  if(!h||!v||h.team===v.team||h.goalie||v.goalie)return null;
  if(h.slideT>0){const pk=G.puck;return h._sl&&pk.last===h&&pk.lastT>=h._sl-.02?null:'trip';}   // a slide tackle is clean only if it reached the puck first
  if(h.dashT>0||h.ramT>0)return playing(v)?null:'inter';                                         // body checks are for the puck carrier
  return null;                                                                                     // ordinary contact is never called
}
function breakaway(v,h){   // fouled from behind with only the goalie to beat → penalty shot
  const d=v.team.dir,vx=v.x*d;if(vx<0||!playing(v)||h.x*d>vx+.4)return false;
  for(const o of v.team.opp.skaters){if(o===h||o.boxed||o.frozen||o.fall>0)continue;if(o.x*d>vx-.5)return false;}
  return true;
}
function rulesFoul(h,v,kind){
  if(!rulesActive())return;const R=G.rl;if(R.delayed||R.stop)return;
  const k=kind||foulKind(h,v);if(!k)return;
  const c={k,off:h.team,by:h,vic:v,ps:k==='trip'&&breakaway(v,h),t:G.t,x:v.x,z:v.z};
  if(R.log.length<40)R.log.push({k,ht:h.type,mv:h.slideT>0?'slide':h.ramT>0?'ram':h.dashSpec?'skill':h.dashT>0?'dash':'-',hum:h.human?1:0,vp:G.carry===v?1:0,dp:+Math.hypot(G.puck.x-v.x,G.puck.z-v.z).toFixed(1)});
  R.st[h.team.key].pen++;
  if(G.carry&&G.carry.team===h.team){stopPlay('pen',c);return;}
  R.delayed=c;refSig('up');popAt(__L('반칙! 🖐'),v.x,2.6,v.z);   // delayed penalty: play on until the offending team touches the puck
}
function rulesContact(A,B,imp){   // goaltender interference: charging into a goalie inside the crease
  if(imp<5||!rulesActive())return;let g=null,s=null;
  if(A.goalie&&!B.goalie){g=A;s=B;}else if(B.goalie&&!A.goalie){g=B;s=A;}
  if(!g||s.team===g.team||!(s.dashT>0||s.slideT>0||s.ramT>0)||playing(s))return;
  if(Math.hypot(g.x+g.team.dir*W,g.z)>RULE.crease)return;
  rulesFoul(s,g,'gi');
}

/* ---------- whistle → call → restart ---------- */
function penResult(c){
  const off=c.off;if(c.ps)return 'ps';
  if(boxMax(off)<=0)return 'ps1';
  return G.rl.box.filter(e=>e.team===off).length>=boxMax(off)?'stack':'box';
}
function stopPlay(kind,d){
  const R=G.rl;R.delayed=null;R.off=null;R.ice=null;
  if(kind==='pen')d.res=penResult(d);
  G.state='stop';G.stateT=RULE.stopT;R.stop={kind,d,t:G.t};R.calls.push(kind==='pen'?d.k+(d.res==='ps'||d.res==='ps1'?'+ps':''):kind==='off'&&G.t-d.t<.05?'off!':kind);
  if(G.carry)carryRelease(.3);G.pass=null;
  SFX.whistle();if(kind==='pen')setTimeout(()=>{if(G.state==='stop')SFX.whistle();},220);
  refSig(kind==='pen'?(d.res==='ps'||d.res==='ps1'?'xhead':d.k==='trip'?'trip':'cross'):kind==='ice'?'cross':'up');
  rulesCall(kind,d);
}
function rulesResume(){
  const R=G.rl,st=R&&R.stop;if(R)R.stop=null;rulesCallHide();
  if(!st){G.state='play';return;}
  const d=st.d,sz=v=>(v>=0?1:-1)*RULE.dotZ;
  if(st.kind==='pen'){
    const off=d.off,vt=off.opp;
    if(d.res==='ps'||d.res==='ps1'){R.st[vt.key].ps++;psStart(vt,d.vic&&!d.vic.goalie?d.vic:(vt.skaters.find(p=>!p.boxed)||vt.skaters[0]),d.z);return;}   // goalie interference in 1 vs 1: a skater shoots
    if(d.res==='stack'){const e=R.box.filter(q=>q.team===off).sort((a,b)=>b.t-a.t)[0];if(e){e.t+=penSecs();e.full+=penSecs();}}
    else boxSend(d.by,penSecs());
    R.st[vt.key].pp++;
    foSetup(-off.dir*RULE.dotE,sz(d.z));
  }else if(st.kind==='off')foSetup(d.team.dir*RULE.dotN,sz(d.z));
  else if(st.kind==='ice')foSetup(-d.team.dir*RULE.dotE,sz(d.z));
  else if(st.kind==='psEnd')psEnd(false);
  else G.state='play';
}
function foPlace(p,x,z,h){p.x=p.ox=p.rx=p.px=x;p.z=p.oz=p.rz=p.pz=z;p.vx=p.vz=0;p.ix=p.iz=0;p.heading=h;p.fall=0;p.getup=0;if(p.ai){p.ai.plan=null;p.ai.slot=null;}}
function foSetup(fx,fz){
  resetPositions();
  fx=clamp(fx,-W+3,W-3);fz=clamp(fz,-D+2,D-2);
  const pk=G.puck;pk.x=pk.ox=pk.rx=fx;pk.z=pk.oz=pk.rz=fz;pk.vx=pk.vz=0;
  for(const k of['blue','red']){
    const tm=G.teams[k],d=tm.dir,sk=tm.skaters.filter(p=>!p.boxed&&!p.frozen);if(!sk.length)continue;
    let c=tm===G.mine&&G.player&&sk.includes(G.player)?G.player:null;
    if(!c)c=sk.reduce((a,b)=>Math.hypot(b.hx-fx,b.hz-fz)<Math.hypot(a.hx-fx,a.hz-fz)?b:a);
    const face=d>0?Math.PI/2:-Math.PI/2;foPlace(c,fx-d*1.15,fz,face);
    const slots=[[2.8,3.4],[2.8,-3.4],[7,0]];
    sk.filter(p=>p!==c).forEach((p,i)=>{const o=slots[i%3];foPlace(p,clamp(fx-d*o[0],-W+2.6,W-2.6),clamp(fz+o[1],-D+1.6,D-1.6),face);});
    if(tm===G.mine)setHuman(c);
  }
  rulesZoneSync();
  G.state='ready';G.stateT=RULE.foT;G.countN=3;showBanner(__L('페이스오프'),900,'');
  const r=G.ref;if(r){r.fo={x:fx,z:fz};refSig('drop');}
}

/* ---------- penalty shot (uses the shootout rules: one attempt, RULE.psT seconds) ---------- */
function psStart(tm,shooter,z){
  const pk=G.puck;G.ps={tm,s:shooter,t:0,phase:'play',z:z||0};
  for(const p of G.pengs){if(p.goalie||p.boxed)continue;p.frozen=true;p.x=p.ox=p.rx=0;p.z=p.oz=p.rz=-D-6;p.vx=p.vz=0;p.charging=false;p.charge=0;p.dashT=p.slideT=p.ramT=0;p.dashSpec=false;}
  const s=shooter;s.frozen=false;foPlace(s,-tm.dir*3,0,tm.dir>0?Math.PI/2:-Math.PI/2);s.slow=0;s.cd.shoot=s.cd.pass=0;s.pose='play';
  for(const g of[tm.goalie,tm.opp.goalie])if(g){g.x=g.ox=g.hx;g.z=g.oz=0;g.vx=g.vz=0;g.ai.zs=0;g.ai.seenT=0;g.diveT=0;g.dazT=0;}
  pk.x=pk.ox=s.x+tm.dir*1.1;pk.z=pk.oz=0;pk.vx=pk.vz=0;pk.shot=null;pk.last=s;pk.lastTeam=tm;pk.lastT=G.t;G.pass=null;G.pending=null;G.carry=null;
  setHuman(tm===G.mine?s:null);
  G.state='ready';G.stateT=1.8;G.countN=3;
  showBanner(tm===G.mine?fmtL(__L('페널티 샷! {t}초 안에 슛'),{t:RULE.psT}):__L('상대 페널티 샷 · 골키퍼를 믿어요'),1500,tm===G.mine?'g':'r');
  refSig('xhead');
}
function psFrame(dt){
  const ps=G.ps;if(!ps||ps.phase!=='play'||G.state!=='play'||G.view!=='game')return;
  ps.t+=dt;const pk=G.puck,sp=Math.hypot(pk.vx,pk.vz),def=ps.tm.opp;
  const shotDone=pk.shot&&G.t-pk.shot.t>.35&&sp<2,saved=pk.last&&pk.last.goalie&&pk.last.team===def,wide=Math.abs(pk.x)>W-.2&&Math.abs(pk.z)>=GW-.05;
  if(ps.t>RULE.psT||shotDone||saved||wide){
    const mine=ps.tm===G.mine;ps.phase='done';SFX.save();hypeBanner(mine?__L('막혔다!'):'SAVE!',[],mine?0:2,mine?def.key:G.mine?G.mine.key:'');
    setHuman(null);G.state='stop';G.stateT=1.6;G.rl.stop={kind:'psEnd',d:ps,t:G.t};
  }
}
function psEnd(goal){
  const ps=G.ps;if(!ps)return;G.ps=null;
  if(goal)G.rl.thaw=true;                         // keep the others off the ice until the goal celebration ends
  else for(const p of G.pengs)if(!p.boxed)p.frozen=false;
  if(G.mine&&(!G.player||G.player.boxed||G.player.frozen&&!goal)){const o=G.mine.skaters.filter(p=>!p.boxed);setHuman(o[0]||null);}
  if(goal&&G.mine&&!G.player){const o=G.mine.skaters.filter(p=>!p.boxed);setHuman(o[0]||null);}
  if(!goal)foSetup(ps.tm.dir*RULE.dotE,(ps.z>=0?1:-1)*RULE.dotZ);
}

/* ---------- goals: penalty-shot goals, power plays, disallowed goals ---------- */
function rulesScored(tm){   // true = the goal does not count
  const R=G.rl;if(!R)return false;R.tag=null;
  if(G.ps){if(G.ps.phase!=='play'||tm!==G.ps.tm){pk_reset();return true;}psEnd(true);R.tag='ps';R.st[tm.key].psg++;}
  const c=R.delayed;
  if(c&&c.off===tm&&c.k==='gi'){c.noGoal=true;stopPlay('pen',c);return true;}   // no goal: the goalie was run over
  if(c&&c.off!==tm){R.delayed=null;refSig(null);R.tag=R.tag||'dly';}             // scored on the delayed penalty: the minor is wiped out
  else if(c)R.delayed=null;
  R.off=null;R.ice=null;
  if(!R.tag||R.tag==='dly'){const a=onIce(tm),b=onIce(tm.opp);
    if(a>b){const e=R.box.filter(q=>q.team===tm.opp).sort((x,y)=>x.t-y.t)[0];if(e)boxRelease(e,'ppg');R.st[tm.key].ppg++;R.tag='pp';}
    else if(a<b){R.st[tm.key].shg++;R.tag='sh';}}
  refSig('point',tm);
  return false;
}
function rulesTags(tm,tags){const t=G.rl&&G.rl.tag;if(t==='pp')tags.push('POWER PLAY GOAL!');else if(t==='sh')tags.push('SHORTHANDED GOAL!');else if(t==='ps')tags.push('PENALTY SHOT GOAL!');}
function rulesEnd(){const R=G.rl;if(!R)return;if(G.ps){G.ps=null;}R.thaw=false;for(const p of G.pengs)if(!p.boxed)p.frozen=false;rulesClearBox();R.stop=null;rulesCallHide();refSig(null);}

/* ---------- per physics step: offside, icing, delayed calls, box clocks ---------- */
function rulesSim(h){
  const R=G.rl;if(!R||!rulesActive())return;
  const pk=G.puck;
  for(const p of G.pengs){if(p.slideT>0){if(!p._sl)p._sl=G.t;}else p._sl=0;}
  if(pk.lastT!==R.lastT){R.lastT=pk.lastT;R.src=pk.last?{team:pk.lastTeam,p:pk.last,x:pk.x,z:pk.z,t:pk.lastT}:null;}
  else if(G.carry&&R.src&&R.src.p===G.carry){R.src.x=pk.x;R.src.z=pk.z;}   // icing counts from where a carried puck was last on the stick
  for(const e of R.box.slice()){e.t-=h;if(e.t<=0)boxRelease(e,'time');}
  if(R.delayed){const c=R.delayed;if((pk.lastT>c.t&&pk.lastTeam===c.off)||(G.carry&&G.carry.team===c.off)||G.t-c.t>RULE.delayMax){stopPlay('pen',c);return;}}
  if(!rulesOn(true))return;
  // --- offside: the puck must enter the attacking zone before (or with) the attackers ---
  for(const k of['blue','red']){
    const T=G.teams[k],d=T.dir,inZ=pk.x*d>RULE.blIn,was=R.inZ[k];R.inZ[k]=inZ;
    if(!inZ||was||R.off||pk.lastTeam!==T)continue;
    const offs=T.skaters.filter(p=>!p.boxed&&!p.frozen&&p!==G.carry&&p.x*d>RULE.blP);
    if(!offs.length)continue;
    const info={team:T,offs,z:pk.z,t:G.t};
    if(G.carry&&G.carry.team===T){stopPlay('off',info);return;}   // carried in with a teammate already inside: whistle now
    R.off=info;refSig('up');                                        // shot / passed in: delayed offside until they tag up
  }
  if(R.off){
    const T=R.off.team,d=T.dir;
    if(pk.x*d<RULE.blEdge-PUCKR){R.off=null;refSig('wash');}
    else if(T.skaters.every(p=>p.boxed||p.frozen||p.x*d<=RULE.blP)){R.off=null;refSig('wash');popAt(__L('태그업 · 오프사이드 해제'),RULE.bl*d,2.2,0);}
    else if(pk.lastT>R.off.t&&pk.lastTeam===T){stopPlay('off',R.off);return;}
  }
  // --- icing: shot from behind the centre line, untouched past the far goal line ---
  const S=R.src;
  if(!R.ice&&S&&S.t===pk.lastT&&!S.p.goalie){
    const T=S.team,d=T.dir;
    if(S.x*d<0&&pk.x*d>RULE.gl&&!shortH(T)){R.ice={team:T,z:S.z,t:G.t,srcT:S.t};refSig('up');}
  }
  if(R.ice){
    const I=R.ice,T=I.team,d=T.dir;
    if(pk.lastT!==I.srcT){
      if(pk.last&&(pk.last.team===T||pk.last.goalie)){R.ice=null;refSig('wash');}   // an attacker got there first / the goalie played it
      else{stopPlay('ice',I);return;}
    }else if(pk.vx*d<=0||Math.hypot(pk.vx,pk.vz)<2.5){
      if(Math.abs(pk.z)<GW-.05){if(pk.x*d<W-.3){R.ice=null;refSig(null);}}   // between the posts: it is a shot on the net (a goal, or it never crossed the line)
      else{stopPlay('ice',I);return;}}
  }
}

/* ---------- AI: stay onside, tag up, no icing at even strength, cleaner tackles ---------- */
function rulesAI(p){
  if(!rulesActive()||!rulesOn(true)||p.goalie)return;
  const R=G.rl,tm=p.team,d=tm.dir,pk=G.puck,ai=p.ai;if(G.carry===p)return;
  const flagged=R.off&&R.off.team===tm;
  if(flagged&&p.x*d>RULE.blP-.4){ai.tx=d*(RULE.bl-1.2);ai.full=true;return;}           // tag up
  if(pk.x*d<=RULE.blIn&&!(G.pass&&G.pass.to===p)){   // wait at the blue line for the puck (brake early: momentum must not carry them over)
    const ahead=(p.x+p.vx*.45)*d;if(ai.tx*d>RULE.bl-1.2||ahead>RULE.bl-.6){ai.tx=d*(ahead>RULE.bl-.6?RULE.bl-2.5:RULE.bl-1.2);ai.full=false;}}
}
function rulesMateOk(m){   // passing to a teammate who is already inside the zone ahead of the puck would be offside
  if(!rulesActive()||!rulesOn(true))return true;const d=m.team.dir;return !(G.puck.x*d<=RULE.blIn&&m.x*d>RULE.blP);
}
function rulesIcingRisk(p){return rulesActive()&&rulesOn(true)&&!shortH(p.team)&&G.puck.x*p.team.dir<0;}
function rulesPathClear(p,dx,dz){   // AI only: no dash / charge / slide through a player who is not playing the puck, or into the goalie's crease
  if(!p||p.human||!rulesActive())return true;
  if(dx===undefined){const m=Math.hypot(p.ix,p.iz);if(m>.2){dx=p.ix/m;dz=p.iz/m;}else{dx=Math.sin(p.heading);dz=Math.cos(p.heading);}}
  for(const o of p.team.opp.skaters){if(o.frozen||o.fall>0||o===G.carry||playing(o))continue;const rx=o.x-p.x,rz=o.z-p.z,al=rx*dx+rz*dz;if(al<-.5||al>10)continue;if(Math.abs(rx*dz-rz*dx)<2.4)return false;}
  const g=p.team.opp.goalie;if(g){const rx=g.x-p.x,rz=g.z-p.z,al=rx*dx+rz*dz;if(al>0&&al<9&&Math.abs(rx*dz-rz*dx)<1.9&&Math.hypot(g.x+g.team.dir*W,g.z)<RULE.crease+.5)return false;}
  return true;
}
function rulesSlideOk(p){
  if(!rulesActive())return true;
  const pk=G.puck,dx=pk.x-p.x,dz=pk.z-p.z,dd=Math.hypot(dx,dz)||1,fx=Math.sin(p.heading),fz=Math.cos(p.heading);
  if(dd<5.5&&(dx*fx+dz*fz)/dd>.9){                                                // lined up with the puck, and no body between the slider and the puck
    const ap=dx*fx+dz*fz;let clear=true;
    for(const o of p.team.opp.skaters){if(o.frozen||o.fall>0)continue;const rx=o.x-p.x,rz=o.z-p.z,ao=rx*fx+rz*fz,lo=Math.abs(rx*fz-rz*fx);if(ao>0&&ao<ap+.2&&lo<o.r+p.r+.1){clear=false;break;}}
    if(clear)return true;}
  return Math.random()<({easy:.1,normal:.05,hard:.03}[G.cfg&&G.cfg.diff]||.05);  // sometimes the AI dives in anyway (and may be called)
}

/* ---------- referee penguin ---------- */
function refBuild(){
  const pg=buildPenguin('basic','blue','none',{num:0});
  const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');
  for(let i=0;i<16;i++){x.fillStyle=i%2?'#14161a':'#f4f6f8';x.fillRect(i*16,0,16,64);}
  const tx=new T.CanvasTexture(c);tx.wrapS=tx.wrapT=T.RepeatWrapping;
  const jer=pg.torso.children[1];if(jer)jer.material=new T.MeshStandardMaterial({map:tx,roughness:.75});
  const sc=pg.inner.children[1];if(sc&&sc.isMesh)sc.visible=false;   // the team scarf
  pg.scarfTail.visible=false;pg.stick.visible=false;
  const dark=new T.MeshStandardMaterial({color:0x15171b,roughness:.6}),orange=new T.MeshStandardMaterial({color:0xff7a1a,roughness:.5,emissive:0x331400});
  for(const f of[pg.flipL,pg.flipR]){const m=f.children[0];if(m)m.material=dark;const band=new T.Mesh(new T.CylinderGeometry(.13,.13,.12,14,1,true),orange);band.position.set(0,-.16,0);band.scale.set(1,1,.55);f.add(band);}
  const helm=pkHat('helmet',0x16181c,false);pg.headAbs.remove(pg.hat);pg.headAbs.add(helm);pg.hat=helm;
  const wh=new T.Mesh(new T.CylinderGeometry(.035,.035,.14,10),new T.MeshStandardMaterial({color:0xd8dde3,metalness:.8,roughness:.25}));wh.rotation.x=Math.PI/2;wh.position.copy(pkHeadPt(.12,1.3,.09));pg.headAbs.add(wh);
  pg.root.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  scene.add(pg.root);pg.root.visible=false;
  return{pg,x:0,z:-(D-1.4),h:0,v:0,sig:null,sigT:0,tm:null,fo:null,ph:0,ry:0,fl:[0,-.28,0,.28]};
}
function refSig(k,tm){const r=G.ref;if(!r)return;r.sig=k;r.sigT=0;r.tm=tm||null;}
function refFrame(dt){
  const show=G.view==='game'&&rulesOn(false);
  if(!show){if(G.ref)G.ref.pg.root.visible=false;return;}
  if(!G.ref){try{G.ref=refBuild();}catch(e){dbgErr('ref',e);G.ref={pg:{root:new T.Group()},dead:true};return;}}
  const r=G.ref;if(r.dead)return;r.pg.root.visible=true;r.sigT+=dt;
  const pk=G.puck,R=G.rl||{};let tx,tz,face=null;
  if(G.state==='stop'&&R.stop&&R.stop.d){const d=R.stop.d;tx=clamp((d.x!==undefined?d.x:pk.x)+3,-W+4,W-4);tz=-(D-2.6);face=0;}
  else if(G.state==='ready'&&r.fo){tx=r.fo.x+.4;tz=r.fo.z-1.7;face=0;}
  else{r.fo=null;const off=pk.z<-6?7:5;r.side=pk.rx<-2.5?1:pk.rx>2.5?-1:(r.side||1);tx=clamp(pk.rx+r.side*off,-W+4,W-4);tz=-(D-1.4);}   // switch sides only once the puck is clearly over
  if(r.sig==='drop'&&G.state==='play'&&r.sigT>.4)r.sig=null;
  if((r.sig==='wash'||r.sig==='point')&&r.sigT>1.8)r.sig=null;
  if(r.sig==='up'&&!(R.delayed||R.off||R.ice))r.sig=null;
  if((r.sig==='trip'||r.sig==='cross'||r.sig==='xhead')&&G.state==='play'&&!G.ps)r.sig=null;
  const dx=tx-r.x,dz=tz-r.z,dd=Math.hypot(dx,dz),vmax=G.state==='play'?8:11,v=Math.min(vmax,dd*2.2);
  if(dd>.05){r.x+=dx/dd*v*dt;r.z+=dz/dd*v*dt;}
  r.v+=(v-r.v)*Math.min(1,dt*5);
  // a referee skates sideways / backward watching the play; only a long sprint turns him toward the run (with hysteresis)
  if(dd>4&&v>5)r.run=Math.min(1,(r.run||0)+dt*3);else if(dd<2||v<3)r.run=Math.max(0,(r.run||0)-dt*3);
  const toPk=Math.atan2(pk.rx-r.x,pk.rz-r.z);
  const want=face!==null?face:((r.run||0)>.5?Math.atan2(dx,dz):toPk);
  {const d=angDiff(r.h,want)*Math.min(1,dt*5),mx=dt*6.5;r.h+=clamp(d,-mx,mx);}   // angDiff(from,to); at most ~370°/s, eased
  const P=r.pg,sf=clamp(r.v/6,0,1);r.ph+=dt*(4+r.v*1.4);
  P.root.position.set(r.x,0,r.z);P.root.rotation.y=r.h;
  P.piv.rotation.x=.18*sf;P.piv.rotation.z=Math.sin(r.ph)*.1*sf;
  P.footL.rotation.x=Math.sin(r.ph)*.6*sf;P.footR.rotation.x=-Math.sin(r.ph)*.6*sf;
  if(P.head){const ya=clamp(angDiff(r.h,toPk)*.6,-.7,.7);P.head.rotation.set(-.05,face!==null?0:ya,0,'YXZ');}
  // signals (NHL style): arm up = delayed call, slap the leg = tripping, crossed arms = interference / icing,
  // crossed above the head = penalty shot, sweeping arms = wash-out, point = goal, low arm = faceoff drop
  const t=G.t,s=r.sig;let lx=Math.sin(r.ph+Math.PI)*.35*sf,lz=-.28,rx=Math.sin(r.ph)*.35*sf,rz=.28;
  if(s==='up'){rz=2.95;rx=0;}
  else if(s==='trip'){rx=-.35+Math.sin(t*9)*.45;rz=.05;lz=-.35;}
  else if(s==='cross'){lx=-1.35;lz=.75;rx=-1.35;rz=-.75;}
  else if(s==='xhead'){lx=-.35;lz=-2.55;rx=-.35;rz=2.55;}
  else if(s==='wash'){const w=Math.sin(t*10)*.5;lz=-1.5;rz=1.5;lx=w;rx=w;}
  else if(s==='point'){rx=-1.45;rz=.35;}
  else if(s==='drop'){rx=-1.05;rz=.12;}
  const k=Math.min(1,dt*10),F=r.fl;F[0]+=(lx-F[0])*k;F[1]+=(lz-F[1])*k;F[2]+=(rx-F[2])*k;F[3]+=(rz-F[3])*k;
  P.flipL.rotation.set(F[0],0,F[1]);P.flipR.rotation.set(F[2],0,F[3]);
  if(P.jaw)P.jaw.rotation.x=(G.state==='stop'&&r.sigT<.6)||s==='point'&&r.sigT<.5?.12:0;
}

/* ---------- HUD: call card, power-play / box clocks, delayed calls ---------- */
function rulesCall(kind,d){
  const el=$('#rlCall');if(!el)return;
  let ico,title,line,why,cls='';
  if(kind==='pen'){
    const K=RULE_K[d.k],off=d.off,vt=off.opp;ico=K.ico;title=K.n;why=K.why;cls=off.key;
    const who=tmName(off)+' '+pkName(d.by);
    if(d.noGoal)line=fmtL(__L('{w} · 골은 무효 (노골)'),{w:who})+' · ';else line=who+' · ';
    if(d.res==='ps')line+=fmtL(__L('브레이크어웨이에서 반칙 → {t} 페널티 샷'),{t:tmName(vt)});
    else if(d.res==='ps1')line+=fmtL(__L('1 대 1이라 퇴장 대신 {t} 페널티 샷'),{t:tmName(vt)});
    else if(d.res==='stack')line+=fmtL(__L('이미 퇴장 중이라 퇴장 시간 +{s}초 → {t} 파워플레이'),{s:penSecs(),t:tmName(vt)});
    else line+=fmtL(__L('{s}초 퇴장 → {t} 파워플레이'),{s:penSecs(),t:tmName(vt)});
  }else if(kind==='off'){const K=RULE_K.off;ico=K.ico;title=K.n;why=K.why;cls=d.team.key;line=fmtL(__L('{t} · 중립 지역에서 페이스오프'),{t:tmName(d.team)});}
  else if(kind==='ice'){const K=RULE_K.ice;ico=K.ico;title=K.n;why=K.why;cls=d.team.key;line=fmtL(__L('{t} · 자기 진영에서 페이스오프'),{t:tmName(d.team)});}
  else if(kind==='intro'){ico='🧑‍⚖️';title=__L('심판 입장!');cls='';line=__L('반칙 · 오프사이드 · 아이싱을 심판이 직접 불어요');why=d;}
  el.className='on '+cls;
  el.innerHTML='<i class="rc-i">'+ico+'</i><div class="rc-t"><b>'+title+'</b><span>'+line+'</span><small>'+why+'</small></div>';
  clearTimeout(rulesCall.t);rulesCall.t=setTimeout(rulesCallHide,kind==='intro'?5200:9000);   // a call is hidden when play resumes (rulesResume); the timer is only a fallback
}
function rulesCallHide(){const el=$('#rlCall');if(el&&el.className)el.className='';}
function rulesIntro(){
  if(!G.rl||!rulesOn(false)||save.rl.intro)return;save.rl.intro=1;persist();
  const m=rulesMode();
  rulesCall('intro',m==='full'?fmtL(__L('반칙하면 {s}초 퇴장 · 설정 → 하키 규칙에서 바꿀 수 있어요'),{s:penSecs()}):fmtL(__L('지금은 반칙만 불어요 · 반칙하면 {s}초 퇴장'),{s:penSecs()}));
}
let rulesHudKey='';
function rulesHud(force){
  const el=$('#rlHud');if(!el)return;const R=G.rl;
  if(!R||G.view!=='game'||!rulesOn(false)||G.state==='over'){if(rulesHudKey!==''||force){rulesHudKey='';el.innerHTML='';el.className='';}return;}
  const rows=[],fm=v=>{v=Math.max(0,Math.ceil(v));return '0:'+(v<10?'0':'')+v;};
  if(G.ps)rows.push(['ps '+G.ps.tm.key,fmtL(__L('🎯 {t} 페널티 샷'),{t:tmName(G.ps.tm)})]);
  for(const k of['blue','red']){const tm=G.teams[k];if(!tm)continue;
    const es=R.box.filter(e=>e.team===tm);if(!es.length)continue;
    const a=onIce(tm.opp),b=onIce(tm);rows.push([tm.opp.key,a>b?fmtL(__L('⚡ {t} 파워플레이 {a} 대 {b}'),{t:tmName(tm.opp),a,b}):fmtL(__L('{a} 대 {b}'),{a,b})]);
    for(const e of es)rows.push([k+' bx','⏱ '+tmName(tm)+' '+pkName(e.p)+' '+fm(e.t)]);}
  if(R.delayed)rows.push([R.delayed.off.key+' dl',fmtL(__L('🖐 지연 반칙 · {t}가 퍽을 만지면 휘슬'),{t:tmName(R.delayed.off)})]);
  if(R.off)rows.push([R.off.team.key+' dl',__L('🚩 오프사이드 대기 · 블루라인 밖으로!')]);
  const pl=G.player,pk=G.puck;
  if(!R.off&&pl&&rulesOn(true)&&G.state==='play'&&!G.ps){const d=pl.team.dir;
    if(pk.x*d<=RULE.blIn&&pk.x*d>0&&pl.x*d>RULE.blP&&G.carry!==pl&&(G.carry?G.carry.team===pl.team:pk.lastTeam===pl.team))rows.push(['warn',__L('⚠ 오프사이드 위치 · 퍽보다 먼저 들어가면 안 돼요')]);}
  const key=rows.map(r=>r.join(':')).join('|');if(key===rulesHudKey)return;rulesHudKey=key;
  el.className=rows.length?'on':'';el.innerHTML=rows.map(r=>'<div class="rl-c '+r[0]+'">'+r[1]+'</div>').join('');
}
function v22Frame(dt){psFrame(dt);refFrame(dt);rulesHud();if(G.view!=='game'||G.state==='over')rulesCallHide();}

/* ---------- help text ---------- */
function howV22(){
  return fmtL(__L('🧑‍⚖️ <b>심판과 하키 규칙</b>: 빠른 경기 · 토너먼트 · 티어 게임에서 심판이 직접 불어요. 설정의 <b>하키 규칙</b>에서 전체 / 반칙만 / 끄기를 고를 수 있어요.'),{})
    +'<br>'+fmtL(__L('🦵 <b>트리핑</b>: 슬라이드 태클은 퍽을 먼저 건드려야 해요. 선수를 먼저 넘어뜨리면 반칙 · 🙅 <b>방해 반칙</b>: 대시·돌진은 퍽을 가진 선수에게만 · 🥅 <b>골키퍼 방해</b>: 골 크리스 안의 골키퍼에게 돌진하면 반칙 (그때 들어간 골은 노골)'),{})
    +'<br>'+fmtL(__L('⏱ <b>퇴장과 파워플레이</b>: 반칙한 펭귄은 퇴장해요. 경기 시간 1분 {a}초 · 2분 {b}초 · 3분 {c}초 · 5분 {d}초 (실제 하키의 2분을 경기 길이에 맞춘 시간) · 그동안 상대 팀은 한 명 많은 파워플레이 · 파워플레이 골이 나면 바로 복귀 · 한 팀은 한 명까지만 퇴장하고, 더 반칙하면 퇴장 시간이 늘어나요 · 1 대 1 경기에서는 퇴장 대신 페널티 샷'),{a:penFor(60),b:penFor(120),c:penFor(180),d:penFor(300)})
    +'<br>'+fmtL(__L('🖐 <b>지연 반칙</b>: 반칙당한 팀이 퍽을 갖고 있으면 심판이 손을 들고 기다려요. 반칙한 팀이 퍽을 만지거나 {d}초가 지나면 휘슬 · 그 사이에 골을 넣으면 퇴장은 취소돼요'),{d:RULE.delayMax})
    +'<br>'+fmtL(__L('🎯 <b>페널티 샷</b>: 골키퍼만 남은 브레이크어웨이에서 뒤에서 넘어뜨리면, 반칙당한 펭귄이 골키퍼와 1 대 1로 {t}초 안에 슛해요'),{t:RULE.psT})
    +'<br>'+fmtL(__L('🚩 <b>오프사이드</b>: 공격 팀 펭귄은 퍽보다 먼저 상대 블루라인을 넘으면 안 돼요. 퍽을 차 넣었을 때는 모두 블루라인 밖으로 나가면(태그업) 계속할 수 있어요 · 🧊 <b>아이싱</b>: 센터 라인 뒤에서 친 퍽이 아무도 안 건드리고 상대 골라인을 넘으면 휘슬, 자기 진영에서 페이스오프 (퇴장으로 인원이 적은 팀은 괜찮아요)'),{});
}

{const p=$('#sHow .panel');if(p){const box=document.createElement('div');box.className='how how-v17 how-v22';box.style.cssText='grid-template-columns:1fr;margin-top:12px';box.innerHTML='<div><h3>'+__L('🧑‍⚖️ 심판 · 하키 규칙')+'</h3>'+howV22()+'</div>';const rows=p.querySelectorAll('.row');p.insertBefore(box,rows.length?rows[rows.length-1]:null);}}

/* ================= v23: skill cast animations (one per species, from the name) ================= */
// 황제 펭귄은 황제의 홀을 얼음에 내려치며 "I'M KING!", 임금 펭귄은 황금 트럼펫, 젠투는 어뢰처럼, 쇠푸른(요정) 펭귄은 요정 날개…
// Purely visual: the skill itself still fires at once (no input delay). Your own casts also get a big call-out banner.
const CAST={
  strong:{shout:"I'M KING!",ico:'👑',c:['#fff1a8','#ffb21f'],dur:.8},          // 황제: emperor's sceptre slam + crown
  king:{shout:"KING'S CALL!",ico:'🎺',c:['#fff1a8','#ffc93c'],dur:.95},        // 임금: golden fanfare trumpet
  basic:{shout:'ADÉLIE DASH!',ico:'💨',c:['#ffffff','#9fd8ff'],dur:.5},        // 아델리: feisty sprinter crouch
  balanced:{shout:'ROCK HOP!',ico:'🪨',c:['#ffe2a8','#ff9a3c'],dur:.6},        // 바위뛰기: two hops off the rocks
  fast:{shout:'GENTOO TORPEDO!',ico:'🌊',c:['#d8f4ff','#3db7ff'],dur:.7},     // 젠투: fastest swimmer, belly torpedo + spray
  defense:{shout:'CHINSTRAP SLAM!',ico:'🪖',c:['#e8f6ff','#7cc4ff'],dur:.7},  // 턱끈: two-flipper hammer, the ice cracks
  macaroni:{shout:'CREST CHARGE!',ico:'🔥',c:['#fff0a0','#ff8a1a'],dur:.65},  // 마카로니: golden crest blazes
  royal:{shout:'ROYAL PASS!',ico:'💎',c:['#fff1a8','#c58bff'],dur:.8},        // 로열: royal crown + golden carpet to the mate
  fiordland:{shout:'FOREST SHADOW!',ico:'🌲',c:['#d6ffd8','#2e8b57'],dur:.85}, // 피오르드랜드: rainforest leaves swirl
  yelloweye:{shout:'GOLDEN EYE!',ico:'👁️',c:['#fff6b8','#ffd21f'],dur:.8},    // 노란눈: eyes glow gold
  little:{shout:'FAIRY HOP!',ico:'🧚',c:['#e4f6ff','#7fd6ff'],dur:.6},        // 쇠푸른(요정): fairy wings + sparkles
  african:{shout:'HEE-HAW!',ico:'📣',c:['#fff2d6','#ff9c5a'],dur:.85},        // 아프리카(당나귀 펭귄): head back, bray
  humboldt:{shout:'HUMBOLDT CURRENT!',ico:'🌀',c:['#d8f4ff','#2fa6ff'],dur:.85}, // 훔볼트: swim strokes, ocean swirl
  magellanic:{shout:"MAGELLAN'S ROUTE!",ico:'🧭',c:['#fff1c4','#e0a83c'],dur:.65}, // 마젤란: navigator's compass rose
  galapagos:{shout:'SUN FLARE!',ico:'☀️',c:['#fff6c4','#ffb21f'],dur:.85},    // 갈라파고스: equator sun overhead
  auk:{shout:'GREAT SEA SURGE!',ico:'🌊',c:['#d8f4ff','#2b7bff'],dur:.85}      // 큰바다쇠오리: a great wave behind
};
function castShout(p,def){const c=p&&CAST[p.type];return c?c.shout:def;}
const CX={};   // shared meshes / textures (built on first use)
function cxMat(){if(!CX.gold){CX.gold=new T.MeshStandardMaterial({color:0xffc93c,metalness:.85,roughness:.28,emissive:0x3a2600});
  CX.ruby=new T.MeshStandardMaterial({color:0xe0213c,metalness:.3,roughness:.2,emissive:0x400008});CX.saph=new T.MeshStandardMaterial({color:0x8a4bff,metalness:.3,roughness:.2,emissive:0x1c0840});}return CX;}
function cxTex(kind){
  if(CX['t'+kind])return CX['t'+kind];
  const c=document.createElement('canvas'),S=c.width=c.height=128,x=c.getContext('2d');x.translate(64,64);
  if(kind==='note'){x.shadowColor='rgba(60,30,0,.9)';x.shadowBlur=6;x.fillStyle='#ffd34d';x.strokeStyle='#ffd34d';x.lineWidth=9;x.beginPath();x.ellipse(-14,26,20,14,-.4,0,TAU);x.fill();x.beginPath();x.moveTo(4,22);x.lineTo(4,-44);x.stroke();x.beginPath();x.moveTo(4,-44);x.quadraticCurveTo(34,-34,30,-6);x.stroke();}
  else if(kind==='star'){x.shadowColor='rgba(120,80,0,.85)';x.shadowBlur=5;x.fillStyle='#fff';for(let i=0;i<4;i++){x.rotate(Math.PI/2);x.beginPath();x.moveTo(0,0);x.lineTo(10,-10);x.lineTo(0,-58);x.lineTo(-10,-10);x.closePath();x.fill();}const g=x.createRadialGradient(0,0,0,0,0,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(-64,-64,128,128);}
  else if(kind==='leaf'){x.rotate(.5);x.fillStyle='#1f5e3a';x.beginPath();x.ellipse(0,0,22,50,0,0,TAU);x.fill();x.strokeStyle='#7fd39a';x.lineWidth=4;x.beginPath();x.moveTo(0,-46);x.lineTo(0,46);x.stroke();}
  else if(kind==='sun'){const g=x.createRadialGradient(0,0,0,0,0,64);g.addColorStop(0,'rgba(255,255,230,1)');g.addColorStop(.32,'rgba(255,214,80,1)');g.addColorStop(.5,'rgba(255,170,40,.55)');g.addColorStop(1,'rgba(255,150,30,0)');x.fillStyle=g;x.fillRect(-64,-64,128,128);
    x.strokeStyle='rgba(255,230,140,.9)';x.lineWidth=5;for(let i=0;i<12;i++){x.rotate(TAU/12);x.beginPath();x.moveTo(0,-30);x.lineTo(0,-60);x.stroke();}}
  else if(kind==='wing'){x.translate(-64,-64);const gr=x.createLinearGradient(0,0,128,0);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(150,215,255,.65)');x.fillStyle=gr;
    x.beginPath();x.moveTo(4,70);x.bezierCurveTo(30,8,104,0,124,26);x.bezierCurveTo(128,60,90,96,4,78);x.closePath();x.fill();x.strokeStyle='rgba(90,170,235,.95)';x.lineWidth=3;x.stroke();
    x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=2;for(const [a,b] of[[60,22],[96,30],[110,52]]){x.beginPath();x.moveTo(6,72);x.quadraticCurveTo(a*.5,b+20,a,b);x.stroke();}}
  else if(kind==='glow'){const g=x.createRadialGradient(0,0,0,0,0,64);g.addColorStop(0,'rgba(255,250,200,1)');g.addColorStop(.3,'rgba(255,210,40,.9)');g.addColorStop(1,'rgba(255,200,0,0)');x.fillStyle=g;x.fillRect(-64,-64,128,128);}
  else if(kind==='crack'){x.strokeStyle='rgba(235,250,255,.95)';x.lineCap='round';
    for(let i=0;i<11;i++){let a=i/11*TAU+Math.sin(i*7)*.2,r=6,px=0,py=0;x.lineWidth=5;x.beginPath();x.moveTo(0,0);
      while(r<60){const nx=Math.cos(a)*r,ny=Math.sin(a)*r;x.lineTo(nx,ny);if(r>24&&Math.sin(i*13+r)>.6){x.moveTo(nx,ny);x.lineTo(nx+Math.cos(a+1.1)*10,ny+Math.sin(a+1.1)*10);x.moveTo(nx,ny);}px=nx;py=ny;a+=Math.sin(i*3.1+r)*.35;r+=9;x.lineWidth=Math.max(1.5,x.lineWidth-.5);}x.stroke();}
    x.strokeStyle='rgba(150,210,255,.6)';x.lineWidth=3;x.beginPath();x.arc(0,0,22,0,TAU);x.stroke();}
  else if(kind==='compass'){x.strokeStyle='rgba(255,214,110,.95)';x.fillStyle='rgba(255,201,60,.9)';x.lineWidth=3;x.beginPath();x.arc(0,0,56,0,TAU);x.stroke();x.beginPath();x.arc(0,0,46,0,TAU);x.stroke();
    for(let i=0;i<8;i++){const L=i%2?30:52;x.save();x.rotate(i*TAU/8);x.beginPath();x.moveTo(0,-L);x.lineTo(7,-7);x.lineTo(0,0);x.lineTo(-7,-7);x.closePath();x.fillStyle=i===0?'rgba(255,90,90,.95)':i%2?'rgba(255,230,160,.85)':'rgba(255,201,60,.95)';x.fill();x.restore();}}
  const t=new T.CanvasTexture(c);CX['t'+kind]=t;return t;
}
/* --- sprites (notes, sparkles, leaves) and ice decals (cracks, compass rose) --- */
const cxS=[],cxD=[];
function cxSprite(kind,x,y,z,vx,vy,vz,life,size,col){
  if(save.set.quality==='low'&&Math.random()<.5)return;
  let o=cxS.find(q=>q.life<=0);
  if(!o){if(cxS.length>=64)return;const m=new T.Sprite(new T.SpriteMaterial({transparent:true,depthWrite:false,fog:false}));scene.add(m);o={m,life:0};cxS.push(o);}
  o.m.material.map=cxTex(kind);o.m.material.blending=T.NormalBlending;o.m.material.color.set(col||0xffffff);o.m.material.needsUpdate=true;
  o.m.position.set(x,y,z);o.vx=vx;o.vy=vy;o.vz=vz;o.life=o.max=life;o.size=size;o.spin=rnd(-3,3);o.grav=kind==='leaf'?-1.2:kind==='note'?-.3:0;o.m.visible=true;
}
function cxDecal(kind,x,z,size,life,rot,spin){
  let o=cxD.find(q=>q.life<=0&&q.kind===kind);
  if(!o){if(cxD.length>=10)return null;const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:cxTex(kind),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));m.rotation.x=-Math.PI/2;m.renderOrder=2;scene.add(m);o={m,kind,life:0};cxD.push(o);}
  o.m.position.set(x,.025,z);o.m.rotation.z=rot||0;o.size=size;o.life=o.max=life;o.spin=spin||0;o.m.visible=true;o.m.scale.setScalar(.01);return o;
}
function castFrame(dt){
  for(const o of cxS){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}
    o.vy+=o.grav*dt;o.m.position.x+=o.vx*dt;o.m.position.y+=o.vy*dt;o.m.position.z+=o.vz*dt;const k=o.life/o.max;
    o.m.material.opacity=Math.min(1,k*2.2);o.m.material.rotation+=o.spin*dt;o.m.scale.setScalar(o.size*(.6+.4*Math.min(1,(1-k)*5)));}
  for(const o of cxD){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}
    const k=o.life/o.max,g=Math.min(1,(1-k)*6);o.m.scale.setScalar(o.size*(.3+.7*g));o.m.material.opacity=Math.min(1,k*2.5);o.m.rotation.z+=o.spin*dt;}
  if(G.view!=='game'){for(const o of cxS)if(o.life>0){o.life=0;o.m.visible=false;}for(const o of cxD)if(o.life>0){o.life=0;o.m.visible=false;}}
}
/* --- props attached to a penguin (built once per penguin, on its first cast) --- */
function castProps(p){
  const P=p.pg;if(P.cx)return P.cx;const M=cxMat(),cx={};
  const k=p.type;
  if(k==='strong'){   // sceptre (held upright, butt end strikes the ice) + crown
    const g=new T.Group(),rod=new T.Mesh(new T.CylinderGeometry(.045,.058,1.75,12),M.gold);rod.position.y=.875;g.add(rod);
    const orb=new T.Mesh(new T.SphereGeometry(.17,18,14),M.gold);orb.position.y=1.9;g.add(orb);
    const gem=new T.Mesh(new T.SphereGeometry(.075,12,10),M.ruby);gem.position.set(0,1.9,.14);g.add(gem);const gem2=gem.clone();gem2.position.set(0,1.9,-.14);g.add(gem2);
    const cr=new T.Mesh(new T.CylinderGeometry(.02,.02,.26,6),M.gold);cr.position.y=2.17;g.add(cr);const cr2=cr.clone();cr2.rotation.z=Math.PI/2;cr2.scale.y=.6;cr2.position.y=2.18;g.add(cr2);
    for(const y of[.12,1.25,1.62]){const b=new T.Mesh(new T.TorusGeometry(.072,.026,8,16),M.gold);b.rotation.x=Math.PI/2;b.position.y=y;g.add(b);}
    g.visible=false;P.inner.add(g);cx.sceptre=g;
  }
  if(k==='strong'||k==='royal'){
    const g=new T.Group(),band=new T.Mesh(new T.CylinderGeometry(.2,.22,.12,22,1,true),M.gold);band.material.side=T.DoubleSide;g.add(band);
    for(let i=0;i<5;i++){const a=i/5*TAU,sp=new T.Mesh(new T.ConeGeometry(.045,.16,8),M.gold);sp.position.set(Math.sin(a)*.2,.13,Math.cos(a)*.2);g.add(sp);
      const gm=new T.Mesh(new T.SphereGeometry(.03,8,6),k==='royal'?M.saph:M.ruby);gm.position.set(Math.sin(a)*.215,0,Math.cos(a)*.215);g.add(gm);}
    g.position.y=1.9;g.visible=false;P.headAbs.add(g);cx.crown=g;
  }
  if(k==='king'){   // fanfare trumpet at the beak
    const g=new T.Group(),tube=new T.Mesh(new T.CylinderGeometry(.028,.028,.5,10),M.gold);tube.rotation.x=Math.PI/2;tube.position.z=.25;g.add(tube);
    const bell=new T.Mesh(new T.CylinderGeometry(.15,.035,.22,18,1,true),M.gold);bell.material=M.gold.clone();bell.material.side=T.DoubleSide;bell.rotation.x=Math.PI/2;bell.position.z=.6;g.add(bell);
    for(const z of[.16,.24,.32]){const v=new T.Mesh(new T.CylinderGeometry(.018,.018,.09,8),M.gold);v.position.set(0,.06,z);g.add(v);}
    const flag=new T.Mesh(new T.PlaneGeometry(.26,.18),new T.MeshStandardMaterial({color:0xd22a3c,side:T.DoubleSide,roughness:.7}));flag.position.set(0,-.12,.32);g.add(flag);
    g.position.copy(pkHeadPt(0,1.36,-.02));g.rotation.x=-.35;g.visible=false;P.headAbs.add(g);cx.trumpet=g;
  }
  if(k==='little'){  // fairy wings on the back
    const mat=new T.MeshBasicMaterial({map:cxTex('wing'),transparent:true,side:T.DoubleSide,depthWrite:false});
    const geo=new T.PlaneGeometry(.95,.62);geo.translate(.47,.12,0);
    const g=new T.Group(),wl=new T.Mesh(geo,mat),wr=new T.Mesh(geo,mat);wr.scale.x=-1;
    const pl=new T.Group(),pr=new T.Group();pl.add(wr);pr.add(wl);pl.position.x=-.08;pr.position.x=.08;g.add(pl,pr);g.position.set(0,1.0,-.38);g.visible=false;P.inner.add(g);cx.wings=g;cx.wl=pl;cx.wr=pr;
  }
  if(k==='yelloweye'){
    const mk=()=>{const s=new T.Sprite(new T.SpriteMaterial({map:cxTex('glow'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));s.scale.setScalar(.26);s.visible=false;return s;};
    cx.eyeL=mk();cx.eyeR=mk();P.eyeL.add(cx.eyeL);P.eyeR.add(cx.eyeR);
  }
  if(k==='galapagos'){const s=new T.Sprite(new T.SpriteMaterial({map:cxTex('sun'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));s.position.y=2.7;s.visible=false;P.root.add(s);cx.sun=s;}
  sigProps(p,cx);P.cx=cx;return cx;
}
/* --- start a cast (called after the skill really fired) --- */
function castStart(p){
  const C=CAST[p.type];if(!C||!p.pg||G.view!=='game')return;
  const whiff=(p.specMax||0)<=2.6;   // a whiffed flipper smash / royal pass with no puck: small version, no banner
  if(p.cast)sigEnd(p,p.cast);
  p.cast={k:p.type,t:0,dur:C.dur*(whiff?.6:1),hit:false,whiff,hx:p.x,hz:p.z,h:p.heading,to:G.royal&&G.royal.by===p?G.royal.to:null};
  castProps(p);
  if(p.human&&!whiff&&!cineStart(p)){castBanner(p,C);if(!save.set.motion&&G.cfg&&G.cfg.mode!=='demo')G.slow={t:.18,s:.5};}
}
function castBanner(p,C){
  const el=$('#castBan');if(!el)return;const sp=p.ty.special;
  el.style.setProperty('--c1',C.c[0]);el.style.setProperty('--c2',C.c[1]);
  el.innerHTML='<b>'+C.shout+'</b><small>'+C.ico+' '+p.ty.name+' · '+(SPECIALS[sp]||'')+'</small>';
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(castBanner.t);castBanner.t=setTimeout(()=>el.classList.remove('on'),1250);
}
const ez=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
const seg=(u,a,b)=>clamp((u-a)/(b-a),0,1);
// flippers + body (runs right after animatePenguin set the normal flipper pose)
function castFlip(p,dt){
  const c=p.cast;if(!c)return;const P=p.pg,u=c.t/c.dur,L=P.flipL.rotation,Rr=P.flipR.rotation,k=c.k;
  if(k==='strong'){   // both flippers lift the sceptre high … and drive it down into the ice
    const up=ez(seg(u,0,.45)),dn=ez(seg(u,.5,.6)),back=seg(u,.85,1),ax=lerp(lerp(-.9,-2.25,up),-1.05,dn),w=Math.min(1,u*6)*(1-back);
    L.set(lerp(L.x,ax,w),0,lerp(L.z,.32,w));Rr.set(lerp(Rr.x,ax,w),0,lerp(Rr.z,-.32,w));P.piv.rotation.x+=lerp(-.2*up,.28,dn)*(1-back);
  }else if(k==='king'){const w=ez(seg(u,0,.25))*(1-seg(u,.85,1));Rr.set(lerp(Rr.x,-1.55,w),0,lerp(Rr.z,-.45,w));L.set(lerp(L.x,-1.2,w),0,lerp(L.z,.35,w));}
  else if(k==='basic'){const w=1-seg(u,.6,1);L.set(lerp(L.x,1.3,w),0,lerp(L.z,-.5,w));Rr.set(lerp(Rr.x,1.3,w),0,lerp(Rr.z,.5,w));P.piv.rotation.x+=.35*w;}
  else if(k==='balanced'){const w=1-seg(u,.75,1);L.set(L.x,0,lerp(L.z,-1.25,w));Rr.set(Rr.x,0,lerp(Rr.z,1.25,w));}
  else if(k==='fast'){const w=1-seg(u,.8,1);L.set(lerp(L.x,1.45,w),0,lerp(L.z,-.08,w));Rr.set(lerp(Rr.x,1.45,w),0,lerp(Rr.z,.08,w));}
  else if(k==='defense'){   // both flippers overhead, then down together
    if(u<.42){const w=ez(seg(u,0,.38));L.set(lerp(L.x,-.5,w),0,lerp(L.z,-2.7,w));Rr.set(lerp(Rr.x,-.5,w),0,lerp(Rr.z,2.7,w));P.piv.rotation.x-=.2*w;}
    else{const w=ez(seg(u,.42,.55)),b=seg(u,.8,1);L.set(lerp(-.5,-1.25,w)*(1-b)+L.x*b,0,lerp(-2.7,-.25,w)*(1-b)+L.z*b);Rr.set(lerp(-.5,-1.25,w)*(1-b)+Rr.x*b,0,lerp(2.7,.25,w)*(1-b)+Rr.z*b);P.piv.rotation.x+=.35*w*(1-b);}
  }else if(k==='macaroni'){const w=1-seg(u,.8,1);L.set(lerp(L.x,1.2,w),0,L.z);Rr.set(lerp(Rr.x,1.2,w),0,Rr.z);P.piv.rotation.x+=.3*w;}
  else if(k==='royal'){const w=ez(seg(u,0,.25))*(1-seg(u,.8,1));Rr.set(lerp(Rr.x,-1.45,w),0,lerp(Rr.z,.15,w));}
  else if(k==='fiordland'){const w=1-seg(u,.8,1),s=Math.sin(c.t*12);L.set(lerp(L.x,-.6+s*.3,w),0,lerp(L.z,-1.0,w));Rr.set(lerp(Rr.x,-.6-s*.3,w),0,lerp(Rr.z,1.0,w));}
  else if(k==='yelloweye'){const w=ez(seg(u,0,.3))*(1-seg(u,.8,1));Rr.set(lerp(Rr.x,-1.6,w),0,lerp(Rr.z,-.55,w));}
  else if(k==='little'){const s=Math.sin(c.t*30)*.4;L.set(L.x,0,-1.1+s);Rr.set(Rr.x,0,1.1-s);}
  else if(k==='african'){const w=ez(seg(u,0,.2))*(1-seg(u,.85,1));L.set(lerp(L.x,.6,w),0,lerp(L.z,-1.35,w));Rr.set(lerp(Rr.x,.6,w),0,lerp(Rr.z,1.35,w));P.piv.rotation.x-=.25*w;}
  else if(k==='humboldt'){const w=1-seg(u,.85,1),a=c.t*11;L.set(lerp(L.x,Math.sin(a)*1.6,w),0,lerp(L.z,-.6-Math.cos(a)*.4,w));Rr.set(lerp(Rr.x,Math.sin(a+Math.PI)*1.6,w),0,lerp(Rr.z,.6+Math.cos(a)*.4,w));}
  else if(k==='magellanic'){const w=ez(seg(u,0,.25))*(1-seg(u,.8,1));Rr.set(lerp(Rr.x,-1.5,w),0,lerp(Rr.z,.1,w));}
  else if(k==='galapagos'){const w=ez(seg(u,0,.3))*(1-seg(u,.85,1));L.set(lerp(L.x,-.25,w),0,lerp(L.z,-2.55,w));Rr.set(lerp(Rr.x,-.25,w),0,lerp(Rr.z,2.55,w));P.piv.rotation.x-=.15*w;}
  else if(k==='auk'){const w=1-seg(u,.8,1);L.set(lerp(L.x,1.25,w),0,lerp(L.z,-.4,w));Rr.set(lerp(Rr.x,1.25,w),0,lerp(Rr.z,.4,w));P.piv.rotation.x+=.4*w;}
}
// head, beak, hops, props and effects (runs at the end of animatePenguin)
function castPost(p,dt,t){
  if(G.cine&&G.cine.p===p){dt=G.rdt;t=G.t+G.cine.t;}
  const P=p.pg,cx=P.cx;
  // lasting looks while the skill itself is active
  if(cx){
    if(cx.eyeL){const on=p.eyeT>0||!!(p.cast&&p.cast.k==='yelloweye');cx.eyeL.visible=cx.eyeR.visible=on;if(on){const s=.24+.05*Math.sin(t*9);cx.eyeL.scale.setScalar(s);cx.eyeR.scale.setScalar(s);}}
    if(cx.wings){const on=p.hopT>0||!!(p.cast&&p.cast.k==='little');cx.wings.visible=on;if(on){const f=Math.sin(t*38)*.35;cx.wl.rotation.set(0,1.05+f,.35);cx.wr.rotation.set(0,-1.05-f,-.35);}}
  }
  if(p.shadowT>0&&p.type==='fiordland'&&Math.random()<dt*9)cxSprite('leaf',p.rx+rnd(-.8,.8),rnd(.3,1.6),p.rz+rnd(-.8,.8),rnd(-1,1),rnd(.2,1),rnd(-1,1),rnd(.6,1),rnd(.25,.4));
  const c=p.cast;if(!c)return;
  if(!(G.cine&&G.cine.p===p))c.t+=dt;const u=Math.min(1,c.t/c.dur),k=c.k,x=p.rx,z=p.rz,fx=Math.sin(p.heading),fz=Math.cos(p.heading),near=p.human||p.team===G.mine;
  const once=(f,at)=>{if(!c[f]&&u>=at){c[f]=true;return true;}return false;};
  if(k==='strong'){
    const s=cx.sceptre;s.visible=true;if(P.stick)P.stick.visible=false;
    const up=ez(seg(u,0,.45)),dn=seg(u,.5,.6);s.position.set(0,lerp(lerp(.25,.95,up),-.02,dn*dn),.66);s.rotation.set(0,0,0);s.scale.setScalar(Math.min(1,u*8)*(1-seg(u,.9,1))+.001);
    if(once('hit',.6)&&!c.whiff){const ix=x+fx*.9,iz=z+fz*.9;ring18(ix,iz,4,[1,.84,.3]);for(let i=0;i<26;i++){const a=rnd(TAU),v=rnd(2,6);emit(ix,.2,iz,Math.cos(a)*v,rnd(2,6),Math.sin(a)*v,rnd(.5,.9),rnd(.15,.3),1,rnd(.75,.95),rnd(.2,.5));}
      cxDecal('crack',ix,iz,3.2,1.4,rnd(TAU));for(let i=0;i<6;i++)cxSprite('star',ix+rnd(-1,1),rnd(.6,2),iz+rnd(-1,1),rnd(-1,1),rnd(1,2.5),rnd(-1,1),.7,.5,0xffe27a);
      if(near||Math.hypot(x-G.cam.x,z-G.cam.z)<14)G.cam.shake=Math.max(G.cam.shake,.4);SFX.bump(1);}
    const cr=cx.crown;cr.visible=c.hit&&!c.whiff;if(cr.visible){const a=c.t-c.dur*.6,pop=a<.18?a/.18*1.25:a<.3?1.25-(a-.18)/.12*.25:1;cr.scale.setScalar(Math.max(.01,pop*(1-seg(u,.92,1))));cr.rotation.y=t*2;cr.position.y=1.6+Math.sin(t*6)*.02;}
  }else if(k==='king'){
    const tr=cx.trumpet;tr.visible=u<.92;if(P.stick)P.stick.visible=false;if(P.head)P.head.rotation.x-=.3*Math.sin(Math.PI*u);
    tr.scale.setScalar((tr.userData.s||1)*(1+.05*Math.sin(t*30)*(u>.2?1:0)));
    if(u>.2&&Math.random()<dt*14){const bx=x+fx*1.1,bz=z+fz*1.1;cxSprite('note',bx,rnd(1.6,2.1),bz,fx*rnd(.6,1.4)+rnd(-.6,.6),rnd(.8,1.6),fz*rnd(.6,1.4)+rnd(-.6,.6),rnd(.8,1.2),rnd(.35,.5),0xffd34d);}
  }else if(k==='basic'){
    if(u>.25&&Math.random()<dt*40)emit(x-fx*.7+rnd(-.3,.3),rnd(.3,1.1),z-fz*.7+rnd(-.3,.3),-fx*rnd(4,8),rnd(0,.5),-fz*rnd(4,8),rnd(.2,.35),rnd(.1,.18),.95,.98,1);
  }else if(k==='balanced'){
    const hp=u<.7?Math.abs(Math.sin(u/.7*Math.PI*2))*.55:0;P.root.position.y+=hp;
    if(once('h1',.35)||once('h2',.7))for(let i=0;i<8;i++){const a=rnd(TAU),v=rnd(1.5,3.5);emit(x,.1,z,Math.cos(a)*v,rnd(1.5,3.5),Math.sin(a)*v,rnd(.4,.7),rnd(.1,.2),.55,.5,.46);}
  }else if(k==='fast'){
    if(Math.random()<dt*50){const a=rnd(TAU);emit(x+rnd(-.4,.4),.15,z+rnd(-.4,.4),-fx*rnd(1,3)+Math.cos(a)*1.5,rnd(1.5,4),-fz*rnd(1,3)+Math.sin(a)*1.5,rnd(.35,.6),rnd(.1,.22),.75,.9,1);}
  }else if(k==='defense'){
    if(once('hit',.5)){cxDecal('crack',x+fx*.7,z+fz*.7,5.5,1.7,rnd(TAU));if(near||Math.hypot(x-G.cam.x,z-G.cam.z)<14)G.cam.shake=Math.max(G.cam.shake,.45);
      for(let i=0;i<20;i++){const a=rnd(TAU),v=rnd(2,5);emit(x,.2,z,Math.cos(a)*v,rnd(3,6),Math.sin(a)*v,rnd(.5,.9),rnd(.12,.26),.85,.95,1);}}
    if(P.head)P.head.rotation.x+=u<.5?-.2:.15;
  }else if(k==='macaroni'){
    if(P.head)P.head.rotation.x+=.45*(1-seg(u,.8,1));
    if(Math.random()<dt*45){const hy=1.7*(P.root.scale.y||1);emit(x+fx*.15,hy,z+fz*.15,-fx*rnd(2,4)+rnd(-.5,.5),rnd(.5,1.8),-fz*rnd(2,4)+rnd(-.5,.5),rnd(.3,.5),rnd(.12,.22),1,rnd(.55,.85),.15);}
  }else if(k==='royal'){
    const cr=cx.crown;cr.visible=u<.97;cr.scale.setScalar(Math.max(.01,Math.min(1,u*5)*(1-seg(u,.85,1))));cr.rotation.y=t*2;
    const to=c.to;if(to&&once('carpet',.05)){const pk=G.puck,n=14;for(let i=0;i<=n;i++){const w=i/n;cxSprite('star',lerp(pk.x,to.x,w),.25,lerp(pk.z,to.z,w),0,rnd(.2,.6),0,.9+w*.3,.45,0xffd34d);}}
  }else if(k==='fiordland'){
    if(Math.random()<dt*30){const a=c.t*8+rnd(TAU),r=rnd(.8,1.3);cxSprite('leaf',x+Math.cos(a)*r,rnd(.3,1.7),z+Math.sin(a)*r,-Math.sin(a)*2,rnd(.3,1),Math.cos(a)*2,rnd(.6,.9),rnd(.3,.45));}
  }else if(k==='yelloweye'){
    if(P.head)P.head.rotation.y=clamp(angDiff(p.heading,Math.atan2(p.team.dir*W-x,-z)),-.7,.7);   // angDiff(from,to): look at the goal
    if(once('hit',.15))for(let i=0;i<8;i++)cxSprite('star',x+fx*.4+rnd(-.3,.3),rnd(1.3,1.7),z+fz*.4+rnd(-.3,.3),rnd(-1.2,1.2),rnd(.4,1.4),rnd(-1.2,1.2),.6,.35,0xffe14d);
  }else if(k==='little'){
    if(Math.random()<dt*30)cxSprite('star',x+rnd(-.5,.5),rnd(.5,1.8)+(p.hopT>0?.6:0),z+rnd(-.5,.5),rnd(-.6,.6),rnd(.2,1),rnd(-.6,.6),rnd(.5,.8),rnd(.25,.4),0x9fe4ff);
  }else if(k==='african'){
    if(P.head)P.head.rotation.x-=.5*Math.sin(Math.PI*Math.min(1,u*1.2));if(P.jaw)P.jaw.rotation.x=Math.max(P.jaw.rotation.x,.55*Math.sin(Math.PI*u));
    if(once('w1',.2)||once('w2',.45)||once('w3',.7))ring18(x,z,2.5,[1,.85,.65]);
  }else if(k==='humboldt'){
    if(Math.random()<dt*40){const a=c.t*7+rnd(TAU),r=rnd(1,1.6);emit(x+Math.cos(a)*r,rnd(.2,1.2),z+Math.sin(a)*r,-Math.sin(a)*3,rnd(.5,2),Math.cos(a)*3,rnd(.4,.7),rnd(.12,.22),.3,.7,1);}
  }else if(k==='magellanic'){
    if(once('hit',.02)){const d=cxDecal('compass',x,z,3.6,1.3,-p.heading,0);}
    if(Math.random()<dt*25)emit(x-fx*.6,rnd(.2,.8),z-fz*.6,-fx*3,rnd(0,.6),-fz*3,rnd(.3,.5),rnd(.1,.18),1,.85,.45);
  }else if(k==='galapagos'){
    const s=cx.sun;s.visible=u<.98&&!cx.sun3;const g=Math.min(1,u*3.5)*(1-seg(u,.82,1));s.scale.setScalar(Math.max(.01,1.8*g));s.material.rotation=t*.8;
    if(once('hit',.45)){const og=p.team.opp.goalie;if(og){const n=14;for(let i=0;i<n;i++){const w=i/n;emit(lerp(x,og.x,w),lerp(2.6,1.6,w),lerp(z,og.z,w),rnd(-.4,.4),rnd(-.2,.4),rnd(-.4,.4),.35+w*.25,.28,1,.9,.45);}}}
  }else if(k==='auk'){
    if(u<.85)for(let j=0;j<3;j++)if(Math.random()<dt*60){const a=rnd(-1.4,1.4),side=-fz*Math.sin(a),sz=fx*Math.sin(a),h=Math.cos(a),wh=Math.random()<.35;emit(x-fx*1.2+side*1.4,.2+h*.6,z-fz*1.2+sz*1.4,fx*rnd(3,5.5)+side,rnd(4,7.5)*h,fz*rnd(3,5.5)+sz,rnd(.55,.9),rnd(.18,.34),wh?.92:.25,wh?.97:.55,1);}
  }
  sigFrame(p,c,dt,t);
  if(c.t>=c.dur){sigEnd(p,c);p.cast=null;if(cx){if(cx.sceptre)cx.sceptre.visible=false;if(cx.crown)cx.crown.visible=false;if(cx.trumpet)cx.trumpet.visible=false;if(cx.sun)cx.sun.visible=false;}}
}
function v23Frame(dt){castFrame(dt);sgWorld(dt);}

/* ================= v24: fish pass (정어리 패스 → 청어 패스 → 광어 패스 …) — a new fish every season ================= */
// 경기와 오늘의 목표로 그 시즌의 생선(🐟)을 모아 30단계를 올라가요. 무료 칸은 누구나, 골드 칸 · 프로 칸은 프로 패스(v27, 시즌마다 1회 결제)로 열어요.
// Seasons follow the league season (SEASON: 28 days). Every number on screen comes from PASS.
const PASS={
  tiers:30,per:100,dup:150,
  earn:{win:24,draw:16,loss:10,goal:3,goalMax:5,first:30,daily:40},
  // the pass is named after a fish, a new one every season: 정어리 → 청어 → 광어 → 넙치 → 도다리 → 꽁치 → … (24, then it starts over)
  themes:[
    {n:__L('정어리'),e:'🐟',c:['#cfe6f5','#3b6e9e'],t:'ps1'},
    {n:__L('청어'),e:'🐟',c:['#7fc8ff','#1f4f9a'],t:'ps2'},
    {n:__L('광어'),e:'🐟',c:['#e8d2a6','#7a5a32'],t:'ps3'},
    {n:__L('넙치'),e:'🐟',c:['#cbd89a','#55652a'],t:'ps4'},
    {n:__L('도다리'),e:'🐟',c:['#f0dcc0','#8a6a4a'],t:'ps5'},
    {n:__L('꽁치'),e:'🐟',c:['#bfe8ef','#2c5f74'],t:'ps6'},
    {n:__L('고등어'),e:'🐟',c:['#7fe0c8','#1d5f6a'],t:'ps7'},
    {n:__L('갈치'),e:'🐟',c:['#f2f6fa','#7a8ea6'],t:'ps8'},
    {n:__L('참치'),e:'🐟',c:['#ff8a8a','#1b2c5a'],t:'ps9'},
    {n:__L('연어'),e:'🐟',c:['#ffb38a','#d4573a'],t:'ps10'},
    {n:__L('도루묵'),e:'🐟',c:['#e6e0c8','#6a6450'],t:'ps11'},
    {n:__L('명태'),e:'🐟',c:['#d8dde4','#5a6472'],t:'ps12'},
    {n:__L('삼치'),e:'🐟',c:['#a8d8ff','#2a5a8a'],t:'ps13'},
    {n:__L('전어'),e:'🐟',c:['#ffe3a6','#7a6a3a'],t:'ps14'},
    {n:__L('멸치'),e:'🐟',c:['#e6f4ff','#6f93b8'],t:'ps15'},
    {n:__L('방어'),e:'🐟',c:['#ffe066','#2a4f8a'],t:'ps16'},
    {n:__L('참돔'),e:'🐟',c:['#ff9aa8','#c4304a'],t:'ps17'},
    {n:__L('우럭'),e:'🐟',c:['#b8b8b8','#3a3a42'],t:'ps18'},
    {n:__L('농어'),e:'🐟',c:['#c8e0d0','#3f6a58'],t:'ps19'},
    {n:__L('복어'),e:'🐡',c:['#ffe08a','#6a5a2a'],t:'ps20'},
    {n:__L('아귀'),e:'🐟',c:['#c8a882','#4a3a2a'],t:'ps21'},
    {n:__L('가자미'),e:'🐟',c:['#e0c8a0','#6a5030'],t:'ps22'},
    {n:__L('조기'),e:'🐟',c:['#ffd34d','#a8761c'],t:'ps23'},
    {n:__L('숭어'),e:'🐟',c:['#d0dce6','#4a5f72'],t:'ps24'}
  ],
  // p: points · c: a penguin card of that rarity (0 기본 … 4 전설) · t: the season's exclusive skating trail
  free:[{p:40},{p:40},{c:0},{p:50},{c:1},{p:50},{p:60},{c:0},{p:60},{c:2},{p:60},{p:70},{c:1},{p:70},{c:2},{p:70},{p:80},{c:1},{p:80},{c:3},{p:80},{p:90},{c:2},{p:90},{c:3},{p:90},{p:100},{c:2},{p:100},{c:3}],
  gold:[{t:1},{p:80},{c:1},{p:90},{c:2},{p:100},{c:1},{p:100},{c:2},{c:3},{p:110},{c:2},{p:110},{c:2},{c:3},{p:120},{c:2},{p:120},{c:3},{c:4},{p:130},{c:2},{p:130},{c:3},{c:3},{p:140},{c:3},{p:150},{c:3},{c:4}]
};
// v27 💎 Pro Pass — the only real-money item: bought once per pass season through Google Play (no auto-renewal).
// It opens the whole gold track, the Pro track below it, and +bonus fish. Price shown = Play's price for the product, or `price` (KRW) when Play gives none.
const PRO={price:8900,cur:'KRW',sku:'pro_pass',bonus:.25,
  track:(()=>{const a=new Array(30).fill(null);a[0]={tp:'pro'};a[4]={p:150};a[9]={h:'crown'};a[14]={p:200};a[19]={p:250};a[24]={p:300};a[29]={p:500};return a;})()};
var BILL={kind:'',price:'',busy:false,err:'',svc:null};   // var: read by help text that runs at load, before v27 sets it up
// called from loadSave() (hoisted, runs before this module's constants exist): literals only
function passLoad(S){
  const P=save.pass,n=(v,max)=>Number.isFinite(+v)?Math.max(0,Math.min(max,Math.floor(+v))):0;
  P.s=n(S.s,99999);P.xp=n(S.xp,3000);P.gold=S.gold===true;P.cf=n(S.cf,0x3fffffff)&0x3fffffff;P.cg=n(S.cg,0x3fffffff)&0x3fffffff;P.fw=n(S.fw,9999999);
  P.pro=n(S.pro,99999);P.cx=n(S.cx,0x3fffffff)&0x3fffffff;   // v27: the season the Pro Pass was bought for · claimed Pro-track cells
  P.last=S.last&&typeof S.last==='object'?{s:n(S.last.s,99999),tier:n(S.last.tier,30),p:n(S.last.p,999999),c:n(S.last.c,99),seen:S.last.seen===true}:null;
}
function passTheme(n){const L=PASS.themes;return L[((Math.max(1,n||1)-1)%L.length+L.length)%L.length];}
function passTitle(n){return fmtL(__L('{n} 패스'),{n:passTheme(n).n});}
function passName(n){return passTheme(n).e+' '+passTitle(n);}
function passTier(){return Math.min(PASS.tiers,Math.floor(save.pass.xp/PASS.per));}
function passBit(i){return 1<<i;}
function passProOn(){const P=save.pass;return P.pro>0&&P.pro===P.s;}
function passGoldOn(){return save.pass.gold||passProOn();}   // gold opened with points before v27 stays open for that season
const passBits=t=>t==='g'?'cg':t==='x'?'cx':'cf';
function passReward(t,i){return t==='g'?PASS.gold[i]:t==='x'?PRO.track[i]:PASS.free[i];}
function passCan(track,i){const P=save.pass;if(i<0||i>=PASS.tiers||i>=passTier())return false;if(track==='g'&&!passGoldOn())return false;if(track==='x'&&(!passProOn()||!PRO.track[i]))return false;return !(P[passBits(track)]&passBit(i));}
function passCount(){let n=0;for(let i=0;i<PASS.tiers;i++)for(const t of['f','g','x'])if(passCan(t,i))n++;return n;}
function passGrant(R,quiet){   // → {txt, card}
  const P=save.pass;
  if(R.p){save.points+=R.p;return{txt:'⭐'+R.p+'P'};}
  if(R.c!=null){const c=grantTier(R.c);return{txt:fmtL(__L('{g} 카드 · {n}'),{g:GRADES[c.g].n,n:TYPES[c.k].name})+(c.isNew?' 🎉':''),card:c};}
  if(R.t){const k=passTheme(P.s).t;if(save.trails.includes(k)){save.points+=PASS.dup;return{txt:fmtL(__L('트레일은 이미 있어서 ⭐{p}P'),{p:PASS.dup})};}save.trails.push(k);return{txt:fmtL(__L('시즌 트레일 「{n}」'),{n:TRAILS[k].name})};}
  if(R.tp){if(save.trails.includes(R.tp)){save.points+=PASS.dup;return{txt:fmtL(__L('트레일은 이미 있어서 ⭐{p}P'),{p:PASS.dup})};}save.trails.push(R.tp);return{txt:fmtL(__L('프로 트레일 「{n}」'),{n:TRAILS[R.tp].name})};}
  if(R.h){if(save.hats.includes(R.h)){save.points+=PASS.dup;return{txt:fmtL(__L('모자는 이미 있어서 ⭐{p}P'),{p:PASS.dup})};}save.hats.push(R.h);return{txt:fmtL(__L('모자 「{n}」'),{n:HATS[R.h].name})};}
  return{txt:''};
}
function passClaim(track,i,quiet,settling){
  if(!settling)passCheck();if(!passCan(track,i))return null;const P=save.pass,R=passReward(track,i);
  P[passBits(track)]|=passBit(i);
  const r=passGrant(R);persist();
  if(!quiet){SFX.win();vib([20,30,40]);hypeToast(fmtL(__L('🐟 {t}단계 · {r}'),{t:i+1,r:r.txt}));$('#ptsN').textContent=save.points;}
  return r;
}
function passClaimAll(){let n=0,last=null;for(let i=0;i<PASS.tiers;i++)for(const t of['f','g','x'])if(passCan(t,i)){last=passClaim(t,i,true);n++;}
  if(n){SFX.win();vib([30,30,60]);hypeToast(fmtL(__L('🐟 보상 {n}개를 받았어요'),{n}));$('#ptsN').textContent=save.points;}return n;}
// season change: everything reached but not taken is handed out, then the new pass (new name) starts at 0
function passCheck(){
  const P=save.pass,now=seasonNow();if(P.s===now||P.s>now)return false;   // a clock moved backwards never wipes progress
  if(P.s>0&&P.s<now){let p0=save.points,c=0;
    for(let i=0;i<PASS.tiers;i++)for(const t of['f','g','x'])if(passCan(t,i)){const r=passClaim(t,i,true,true);if(r&&r.card)c++;}
    P.last={s:P.s,tier:passTier(),p:save.points-p0,c,seen:false};}
  P.s=now;P.xp=0;P.gold=false;P.cf=0;P.cg=0;P.cx=0;persist();return true;
}
function passGain(n){return passProOn()?Math.round(n*(1+PRO.bonus)):n;}   // 프로 패스: 생선 +PRO.bonus
function passAdd(n){
  if(!(n>0))return null;passCheck();const P=save.pass,t0=passTier(),g=passGain(n);P.xp=Math.min(PASS.tiers*PASS.per,P.xp+g);const t1=passTier();persist();
  return{n:g,base:n,bonus:g-n,t0,t1};
}
function passMatch(win,draw,ms){
  const E=PASS.earn,P=save.pass,base=win?E.win:draw?E.draw:E.loss,goals=Math.min(ms,E.goalMax)*E.goal,dn=dayNum();
  let first=0;if(win&&P.fw!==dn){first=E.first;P.fw=dn;}
  const r=passAdd(base+goals+first)||{t0:passTier(),t1:passTier(),bonus:0};
  return{base,goals,ms:Math.min(ms,E.goalMax),first,pro:r.bonus||0,total:base+goals+first+(r.bonus||0),t0:r.t0,t1:r.t1,win,draw};
}
function passRowHtml(R){
  const p=R&&R.pass;if(!p)return '';
  const parts=[fmtL(p.win?__L('승리 {n}'):p.draw?__L('무승부 {n}'):__L('패배 {n}'),{n:p.base})];if(p.goals)parts.push(fmtL(__L('골 {n}×{g}'),{n:p.ms,g:PASS.earn.goal}));if(p.first)parts.push(fmtL(__L('오늘 첫 승리 {f}'),{f:p.first}));if(p.pro)parts.push(fmtL(__L('프로 +{b}'),{b:p.pro}));
  return '<div class="rs-pass"><span>🐟 '+fmtL('{f} +{n}',{f:passTheme(save.pass.s).n,n:p.total})+' <small>('+parts.join(' · ')+')</small></span>'+(p.t1>p.t0?'<span class="rtag">'+fmtL(__L('{p} {t}단계!'),{p:passTitle(save.pass.s),t:p.t1})+'</span>':'<small>'+fmtL(__L('{p} {t}단계'),{p:passTitle(save.pass.s),t:p.t1})+'</small>')+'</div>';
}
function rulesRowHtml(){
  const R=G.rl;if(!R||!G.mine||rulesMode()==='off')return '';const a=R.st[G.mine.key],b=R.st[G.mine.opp.key];
  if(!a.pen&&!b.pen&&!R.calls.length)return '<div class="rs-stats">'+__L('🧑‍⚖️ 반칙 없는 깨끗한 경기!')+'</div>';
  return '<div class="rs-stats">🧑‍⚖️ '+fmtL(__L('반칙 우리 {a} · 상대 {b}'),{a:a.pen,b:b.pen})+(a.ppg?' · '+fmtL(__L('파워플레이 골 {n}'),{n:a.ppg}):'')+(a.shg?' · '+fmtL(__L('숏핸디드 골 {n}'),{n:a.shg}):'')+(a.psg?' · '+fmtL(__L('페널티 샷 골 {n}'),{n:a.psg}):'')+'</div>';
}
function passRewTxt(R,track){
  if(R.p)return '<b>⭐'+R.p+'</b><small>P</small>';
  if(R.c!=null)return '<b class="rar-t g'+R.c+'">'+GRADES[R.c].n+'</b><small>'+__L('카드')+'</small>';
  if(R.t){const k=passTheme(save.pass.s).t;return '<b>✨</b><small>'+TRAILS[k].name+'</small>';}
  if(R.tp)return '<b>✨</b><small>'+TRAILS[R.tp].name+'</small>';
  if(R.h)return '<b>🎩</b><small>'+HATS[R.h].name+'</small>';
  return '';
}
function passBuy(){return proBuy();}   // v27: the gold track is no longer sold for points — it comes with the Pro Pass
function renderPass(){
  const el=$('#psBody'),hd=$('#psHead');if(!el||!hd)return;passCheck();
  const P=save.pass,T=passTheme(P.s),tier=passTier(),cur=P.xp-tier*PASS.per,left=seasonLeft(P.s),n=passCount(),E=PASS.earn;
  hd.style.setProperty('--p1',T.c[0]);hd.style.setProperty('--p2',T.c[1]);
  hd.innerHTML='<i class="ps-e">'+T.e+'</i><div class="ps-h"><b>'+passTitle(P.s)+'</b><small>'+fmtL(__L('시즌 {s} · {d}까지 · {l}일 남음'),{s:P.s,d:seasonDate(P.s),l:left})+'</small></div>';
  let h='';
  if(P.last&&!P.last.seen){h+='<div class="ps-last">'+fmtL(__L('지난 시즌 {name}: {t}단계까지 받지 않은 보상을 자동으로 받았어요 (⭐{p}P · 카드 {c}장)'),{name:passName(P.last.s),t:P.last.tier,p:P.last.p,c:P.last.c})+'</div>';P.last.seen=true;persist();}
  h+='<div class="ps-prog"><div class="ps-tier"><small>'+__L('단계')+'</small><b>'+tier+'</b><small>/ '+PASS.tiers+'</small></div><div class="ps-bar">'
    +(tier>=PASS.tiers?'<div class="ps-bt">'+__L('모든 단계를 달성했어요!')+'</div><div class="pbar"><i style="width:100%"></i></div>':'<div class="ps-bt">'+fmtL(__L('다음 단계까지 🐟 {c} / {p}'),{c:cur,p:PASS.per})+'</div><div class="pbar"><i style="width:'+(cur/PASS.per*100).toFixed(1)+'%"></i></div>')
    +'<small>'+fmtL(__L('이번 시즌 모은 {f} {x}마리'),{f:T.n,x:P.xp})+'</small></div></div>';
  h+='<div class="ps-acts">'+proBtnHtml()
    +(n?'<button class="btn ps-all" id="psAll">🎁 '+fmtL(__L('보상 {n}개 모두 받기'),{n})+'</button>':'')+'</div>';
  h+=proNoteHtml();
  h+='<div class="ps-track" id="psTrack"><div class="ps-lab"><span>'+__L('무료')+'</span><span></span><span>👑 '+__L('골드')+'</span><span>💎 '+__L('프로')+'</span></div>';
  for(let i=0;i<PASS.tiers;i++){
    const reached=i<tier,cell=(t,R)=>{if(!R)return '<div class="ps-cell x none"></div>';const got=(P[passBits(t)]&passBit(i))!==0,can=passCan(t,i),gl=(t==='g'&&!passGoldOn())||(t==='x'&&!passProOn());
      return '<button class="ps-cell '+t+(got?' got':can?' rdy':reached?(gl?' gl':''):' lock')+'" data-pc="'+t+i+'"'+(can?'':' tabindex="-1"')+' aria-label="'+fmtL(__L('{t}단계 {k} {s}'),{t:i+1,k:t==='g'?__L('골드'):t==='x'?__L('프로'):__L('무료'),s:got?__L('받음'):can?__L('받기'):''})+'">'+passRewTxt(R,t)+(got?'<i class="ps-ok">✔</i>':gl&&reached?'<i class="ps-ok">🔒</i>':'')+'</button>';};
    h+='<div class="ps-col'+(i===tier?' cur':reached?' done':'')+'">'+cell('f',PASS.free[i])+'<div class="ps-num">'+(i+1)+'</div>'+cell('g',PASS.gold[i])+cell('x',PRO.track[i])+'</div>';
  }
  h+='</div>';
  const pools=[0,1,2,3,4].map(g=>{const k=tierTypes(g).length;return fmtL(__L('{g} {n}종 각 {p}%'),{g:GRADES[g].n,n:k,p:k?+(100/k).toFixed(2):0});}).join(' · ');
  h+='<div class="odds ps-info"><b>'+T.e+' '+fmtL(__L('{f} 얻는 법'),{f:T.n})+'</b><br>'+fmtL(__L('경기를 끝내면 승리 {w} · 무승부 {d} · 패배 {l}, 골마다 +{g} (최대 {m}골) · 그날 첫 승리 +{f} · 오늘의 목표 보상을 받을 때마다 +{q}'),{w:E.win,d:E.draw,l:E.loss,g:E.goal,m:E.goalMax,f:E.first,q:E.daily})
    +'<br>'+fmtL(__L('{p}마리마다 1단계 · 모두 {n}단계'),{p:PASS.per,n:PASS.tiers})
    +'<br><b>🎁 '+__L('보상 안내')+'</b><br>'+fmtL(__L('카드 보상은 그 등급 펭귄 중 하나가 같은 확률로 나와요 ({pools}) · 처음 얻은 펭귄은 해금, 이미 있으면 그 등급 카드로 보관 · 시즌 트레일이 이미 있으면 ⭐{d}P'),{pools,d:PASS.dup})
    +'<br>'+fmtL(__L('패스 이름은 시즌마다 바뀌어요. 시즌이 끝나면 받지 않은 보상은 자동으로 받고, 새 패스는 0단계부터 · 다음 시즌: {next}'),{next:passName(P.s+1)})+'</div>';
  el.innerHTML=h;
  const b=$('#psBuy');if(b)b.onclick=()=>proBuy();
  const a=$('#psAll');if(a)a.onclick=()=>{passClaimAll();renderPass();hypeMenuRefresh();};
  el.querySelectorAll('[data-pc]').forEach(c=>{c.onclick=()=>{const t=c.dataset.pc[0],i=+c.dataset.pc.slice(1);if(passCan(t,i)){passClaim(t,i);renderPass();hypeMenuRefresh();}
    else if((t==='g'&&!passGoldOn()||t==='x'&&!passProOn())&&i<passTier())flashMsg('💎 '+__L('프로 패스를 사면 받을 수 있어요'));else if(i>=passTier())flashMsg(fmtL(__L('🐟 {t}단계에 도달하면 받을 수 있어요'),{t:i+1}));};});
  const tr=$('#psTrack');if(tr){const col=tr.querySelectorAll('.ps-col')[Math.max(0,Math.min(PASS.tiers-1,tier)-2)];if(col){const lab=tr.querySelector('.ps-lab');tr.scrollLeft=Math.max(0,col.offsetLeft-tr.offsetLeft-(lab?lab.offsetWidth+6:0));}}   // keep the column clear of the sticky track labels
  $('#ptsN').textContent=save.points;
}
function passMenu(){
  passCheck();const P=save.pass,T=passTheme(P.s),tier=passTier(),n=passCount();
  const m=$('#menuPass');if(!m)return;
  const sub=$('#psSub'),bd=$('#psBadge');
  const tt=$('#psTitle');if(tt)tt.textContent=passTitle(P.s);
  if(sub)sub.textContent=fmtL(__L('{t}단계 · D-{d}'),{t:tier,d:seasonLeft(P.s)})+(passProOn()?' · PRO':'');m.classList.toggle('pro',passProOn());
  const ic=m.querySelector('.ps-ic');if(ic)ic.textContent=T.e;
  if(bd){bd.textContent=n?n:'';bd.style.display=n?'inline-block':'none';}
  m.style.setProperty('--p1',T.c[0]);m.style.setProperty('--p2',T.c[1]);
  m.setAttribute('aria-label',passName(P.s)+' '+fmtL(__L('{t}단계'),{t:tier})+(n?', '+fmtL(__L('받을 보상 {n}개'),{n}):'')+'. '+__L('패스 열기'));
}
function howV24(){const E=PASS.earn,L=PASS.themes;return fmtL(__L('🐟 <b>생선 패스</b>: 시즌마다 패스 이름이 다른 생선으로 바뀌어요 ({list} → … 모두 {n}가지, 그다음 처음부터). 경기와 오늘의 목표로 그 시즌의 생선을 모아 {t}단계를 올라가요 (승리 {w} · 무승부 {d} · 패배 {l}, 골마다 +{g}, 그날 첫 승리 +{f}, 목표 보상마다 +{q}). 무료 칸은 누구나 받아요. 💎 프로 패스({price}, 그 시즌 한 번 결제, 자동 갱신 없음)를 사면 👑 골드 칸 전체와 💎 프로 칸이 열리고 생선을 {b}% 더 모아요. 골드 1단계는 그 생선 이름의 시즌 트레일이에요.'),{list:L.slice(0,6).map(x=>x.n).join(' → '),n:L.length,t:PASS.tiers,w:E.win,d:E.draw,l:E.loss,g:E.goal,f:E.first,q:E.daily,price:proPriceTxt(),b:Math.round(PRO.bonus*100)});}
// help line (the screen itself is static markup, next to 목표)
{const b=document.querySelector('.how-v22');if(b){const d=document.createElement('div');d.innerHTML='<h3>'+__L('🐟 생선 패스')+'</h3>'+howV24();b.appendChild(d);}}
try{passCheck();}catch(e){}

/* ================= v25: skill cinematics (기술 시네마틱) ================= */
// Your own special skill now gets a real cut-scene, built the way fighting-game super moves and mobile hero games do it:
//  ① cut-in: the world freezes (match clock too), letterbox bars snap in, the camera whips from the game view to a low hero shot
//  ② portrait: a diagonal band with the card art + skill name slashes across, focus lines, the camera orbits the penguin
//     while it winds up (its own v23 animation, slowed down), energy streams into a glowing rune circle under its feet
//  ③ impact: impact frame (flash + inverted frame), the shout stamped huge, shock-wave, the camera punches in then pulls out wide
//  ④ return: bars retract, the camera glides back to the game view and play resumes in slow motion for a beat.
// The skill's effect is already decided when the scene starts; nothing advances in the world while it plays (fair: no free time).
// Full scene ≈2.5 s the first time and whenever ≥25 s of play passed since the last full one, otherwise a 1.2 s quick version.
// Any button / a tap skips to the return. Settings → 기술 연출: 시네마틱 / 짧게 (always quick) / 끄기 (the old call-out banner).
// 모션 줄이기 (reduced motion) also falls back to the banner.
const CINE={full:2.5,quick:1.2,repeat:25,skipAfter:.4,
  P:{band:.32,impact:1.42,out:2.02},   // phase starts, full version
  Q:{band:.14,impact:.62,out:.92},     // quick version
  HIT:{strong:.6,defense:.5,galapagos:.45,african:.45,king:.4,yelloweye:.3,magellanic:.3}};
function cineMode(){const m=save.set.cine;return m==='short'||m==='off'?m:'full';}
function cineOk(p){return !!(p&&p.human&&G.view==='game'&&G.state==='play'&&!G.paused&&!save.set.motion&&cineMode()!=='off'&&G.cfg&&G.cfg.mode!=='demo'&&CAST[p.type]&&p.cast&&!p.cast.whiff);}
// keep the cinematic camera inside the rink (rounded rectangle) so the boards never block the shot
function cineInside(x,z,m){const ax=Math.abs(x),az=Math.abs(z);if(ax>W-m||az>D-m)return false;if(ax>W-CR&&az>D-CR)return Math.hypot(ax-(W-CR),az-(D-CR))<CR-m;return true;}
function cineNear(p){const s=(p.pg&&p.pg.root.scale.x)||1,h=1.73*s,sc=(typeof SIGCAM!=='undefined'&&SIGCAM[p.type])||{},d=sc.d||1;   // penguin height ≈ 1.73 m × scale (measured in the browser)
  return{s,h,sc,a:(innerWidth<innerHeight&&sc.ta!=null?sc.ta:sc.a)||0,near:(innerWidth<innerHeight?4.1:2.9)*h*d,far:(innerWidth<innerHeight?6.4:4.4)*h*Math.max(1,d*.9)};}   // portrait: farther, so props beside / above the penguin stay in the narrow frame
// the ground positions the camera passes through for a given base angle / orbit direction
function cineShots(p,a,sd){const {near,far}=cineNear(p),x=p.rx,z=p.rz,at=(o,d)=>[x+Math.sin(a+sd*o)*d,z+Math.cos(a+sd*o)*d];
  return[at(.55,near*1.05),at(.1,near),at(-.3,near*.92),at(-.3,near*.74),at(0,far*.6),at(.25,far)];}
function cineAngle(p){
  const a0=p.heading+cineNear(p).a;let best=null,bm=-1e9;   // v26: start from the angle that shows the species' centre-piece
  for(const o of[0,.35,-.35,.7,-.7,1.05,-1.05,1.45,-1.45,1.9,-1.9,2.4,-2.4,Math.PI])for(const sd of[1,-1]){
    const pts=cineShots(p,a0+o,sd);if(pts.every(q=>cineInside(q[0],q[1],.7)))return{a:a0+o,sd};
    // nothing fully inside (deep in a corner): keep the angle whose worst point sticks out least
    let m=1e9;for(const q of pts){let d=Math.min(W-Math.abs(q[0]),D-Math.abs(q[1]));m=Math.min(m,d);}if(m>bm){bm=m;best={a:a0+o,sd};}}
  return best;
}
function cineStart(p){
  if(!cineOk(p)||G.cine)return false;
  const C=CAST[p.type],short=cineMode()==='short';
  const quick=short||(G.cineFull!=null&&G.elapsed-G.cineFull<CINE.repeat);
  if(!quick)G.cineFull=G.elapsed;
  const P=quick?CINE.Q:CINE.P,an=cineAngle(p);
  G.cine={p,t:0,dur:quick?CINE.quick:CINE.full,P,quick,hit:false,ph:'',a:an.a,sd:an.sd,H:CINE.HIT[p.type]||.55,fov:camera.fov||48,
    from:{x:camera.position.x,y:camera.position.y,z:camera.position.z,lx:G.cam.x,ly:0,lz:G.cam.z-1},look:null};
  G.slow=null;   // the scene replaces any slow-motion that was still pending
  cineDom(p,C,quick);document.body.classList.add('cine');
  SFX.cineIn();vib(16);
  return true;
}
function cineDom(p,C,quick){
  const el=$('#cine');if(!el)return;const sp=p.ty.special,tc=p.team.key==='blue'?'#2f7bff':'#ff3b4e',g=GRADES[RAR[p.type]||0];
  el.style.setProperty('--c1',C.c[0]);el.style.setProperty('--c2',C.c[1]);el.style.setProperty('--tc',tc);el.style.setProperty('--gc',g.c);el.style.setProperty('--sl',Math.max(8,C.shout.length));
  el.innerHTML='<i class="cn-bar t"></i><i class="cn-bar b"></i><div class="cn-dim"></div><div class="cn-lines"></div>'
    +'<div class="cn-band"><div class="cn-bg"></div><div class="cn-art">'+pengSVG(p.type)+'</div>'
    +'<div class="cn-txt"><small>'+C.ico+' SPECIAL MOVE</small><b>'+(SPECIALS[sp]||'')+'</b><em><i>'+g.n+'</i>'+p.ty.name+'</em></div></div>'
    +'<div class="cn-burst"></div><div class="cn-shout"><b data-t="'+C.shout.replace(/"/g,'&quot;')+'">'+C.shout+'</b></div><div class="cn-flash"></div>'
    +'<div class="cn-skip">'+__L('탭하면 건너뛰기')+' ▸▸</div>';
  el.className='on p0'+(quick?' quick':'');
}
function cineSkip(){const c=G.cine;if(c&&c.t>CINE.skipAfter&&c.t<c.P.out){if(!c.hit){c.hit=true;cineImpact(c,true);}c.t=c.P.out;c.skipped=true;}}
// cast progress (0..1): a slow wind-up under the portrait band, the strike lands exactly on the impact beat, then the follow-through
function cineCastU(c){
  const P=c.P,t=c.t,H=c.H;
  if(t<P.band)return .04*t/P.band;
  if(t<P.impact){const u=(t-P.band)/(P.impact-P.band);return .04+(H-.12)*(1-Math.pow(1-u,2));}
  const k=t-P.impact;if(k<.06)return H-.08+.08*k/.06;
  return Math.min(1,H+(1-H)*(k-.06)/Math.max(.1,P.out-P.impact-.06));
}
function cineStep(rdt){
  const c=G.cine;if(!c)return;
  if(G.view!=='game'||G.state!=='play'||!c.p||!G.pengs.includes(c.p)){cineClear();return;}
  if(input.shootPress||input.pass||input.dash||input.special||input.swap){
    if((input.special||input.dash)&&c.p&&c.p.dbl>0&&c.p.dblT>0)c.queued=input.special?'special':'dash';   // 마젤란: the second-dash press is kept and fires when play resumes
    cineSkip();input.shootPress=input.pass=input.dash=input.special=input.swap=false;input.shootRel=false;}
  c.t+=rdt;const P=c.P,el=$('#cine'),p=c.p,C=CAST[p.type];
  const ph=c.t<P.band?'p0':c.t<P.impact?'p1':c.t<P.out?'p2':'p3';
  if(ph!==c.ph){c.ph=ph;if(el)el.className='on '+ph+(c.quick?' quick':'')+(c.skipped?' skipped':'');
    if(ph==='p1'){SFX.flare();SFX.cineCharge(P.impact-P.band);}
    if(ph==='p2'&&!c.hit){c.hit=true;cineImpact(c,false);}
    if(ph==='p3'){document.body.classList.remove('cine');SFX.whoosh();}}
  if(p.cast)p.cast.t=cineCastU(c)*p.cast.dur;
  cineWorld(c,rdt,C);
  if(c.t>=c.dur)cineEnd();
}
// in-world dressing while time is stopped: rune circle under the feet, a halo behind, energy streaming in, rising aura
function cineWorld(c,rdt,C){
  const p=c.p,P=c.P,t=c.t,x=p.rx,z=p.rz,o=cineObjs(),col=new T.Color(C.c[1]),s=(p.pg&&p.pg.root.scale.x)||1;
  const fadeIn=Math.min(1,t/.25),fadeOut=t>P.out?Math.max(0,1-(t-P.out)/.35):1,k=fadeIn*fadeOut,boom=c.hit?Math.max(0,1-(t-P.impact)/.35):0;
  o.rune.visible=k>0;o.rune.position.set(x,.035,z);o.rune.rotation.z=t*(c.hit?2.6:1.2);o.rune.material.color.copy(col);o.rune.material.opacity=.95*k;
  o.rune.scale.setScalar((c.quick?2.6:3.4)*s*(t<P.band?.4+.6*Math.pow(t/P.band,.5):1)*(1+boom*.9));
  o.rune2.visible=k>0;o.rune2.position.set(x,.04,z);o.rune2.rotation.z=-t*1.8;o.rune2.material.color.set(C.c[0]);o.rune2.material.opacity=.7*k*(t<P.band?0:1);o.rune2.scale.setScalar((c.quick?1.7:2.2)*s*(1+boom*1.6));
  // halo: a big soft glow behind the penguin, on the far side from the camera
  const dx=x-camera.position.x,dz=z-camera.position.z,dl=Math.hypot(dx,dz)||1;
  o.halo.visible=k>0;o.halo.position.set(x+dx/dl*.7,1.05*s,z+dz/dl*.7);o.halo.material.color.copy(col);o.halo.material.opacity=k*(.55+.25*Math.sin(t*14))+boom*.4;o.halo.scale.setScalar((2.8+boom*3)*s);
  if(save.set.quality==='low'&&Math.random()<.5)return;
  if(c.ph==='p1'){
    const n=Math.random()<rdt*70?2:0;   // energy streams in from all around …
    for(let i=0;i<n;i++){const a=rnd(TAU),r=rnd(2.6,3.6),l=rnd(.3,.45);emit(x+Math.cos(a)*r,rnd(.2,2),z+Math.sin(a)*r,-Math.cos(a)*r/l,rnd(-.5,.5),-Math.sin(a)*r/l,l,rnd(.08,.14),col.r,col.g,col.b);}
    if(Math.random()<rdt*45){const a=rnd(TAU),r=rnd(.5,.9);emit(x+Math.cos(a)*r,.1,z+Math.sin(a)*r,0,rnd(2.5,4.5),0,rnd(.5,.8),rnd(.1,.18),1,1,1);}   // … and rises around it
  }
}
function cineImpact(c,skip){
  const p=c.p,C=CAST[p.type],fx=save.set.flash!==false&&!save.set.motion,cv=$('#c');
  SFX.cineHit();vib([40,30,70]);c.shake=.32;
  if(fx&&cv&&!skip){cv.style.filter='invert(1) hue-rotate(180deg) contrast(1.6)';setTimeout(()=>{cv.style.filter='contrast(1.45) saturate(1.6) brightness(1.15)';},55);setTimeout(()=>{cv.style.filter='';},170);}
  if(p){const col=new T.Color(C.c[1]),hi=new T.Color(C.c[0]);
    for(let i=0;i<44;i++){const a=rnd(TAU),v=rnd(4,11),w=Math.random()<.4?hi:col;emit(p.rx,rnd(.2,1.4),p.rz,Math.cos(a)*v,rnd(1.5,6),Math.sin(a)*v,rnd(.5,1),rnd(.14,.3),w.r,w.g,w.b);}
    ring18(p.rx,p.rz,5,[hi.r,hi.g,hi.b]);ring18(p.rx,p.rz,2.6,[col.r,col.g,col.b]);}
}
function cineEnd(){
  const c=G.cine;if(!c)return;G.cine=null;
  const q=camera.quaternion&&camera.quaternion.clone?camera.quaternion.clone():null;
  G.cineBlend={t:0,d:.45,x:camera.position.x,y:camera.position.y,z:camera.position.z,q,fov:camera.fov,fov0:c.fov};
  cineHide();
  if(c.queued)input[c.queued]=true;
  if(!c.skipped)G.slow={t:.4,s:.4};   // the world comes back in slow motion for a beat
}
function cineHide(){const el=$('#cine');if(el){el.className='';el.innerHTML='';}document.body.classList.remove('cine');const cv=$('#c');if(cv)cv.style.filter='';
  const o=CX.cine;if(o){o.rune.visible=o.rune2.visible=o.halo.visible=false;}}
function cineClear(){const had=G.cine||G.cineBlend;if(G.cine&&G.cine.fov&&camera.fov!==G.cine.fov){camera.fov=G.cine.fov;camera.updateProjectionMatrix();}
  G.cine=null;G.cineBlend=null;if(had)cineHide();}
function cineTex(){
  if(CX.tRune)return CX.tRune;const c=document.createElement('canvas'),S=c.width=c.height=256,x=c.getContext('2d');x.translate(128,128);
  x.strokeStyle='#fff';x.fillStyle='#fff';x.shadowColor='#fff';x.shadowBlur=8;
  x.lineWidth=5;x.beginPath();x.arc(0,0,120,0,TAU);x.stroke();x.lineWidth=2.5;x.beginPath();x.arc(0,0,106,0,TAU);x.stroke();
  for(let i=0;i<48;i++){x.save();x.rotate(i*TAU/48);x.fillRect(-1.5,-118,3,i%4?7:13);x.restore();}
  x.lineWidth=3;x.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/3;x[i?'lineTo':'moveTo'](Math.sin(a)*100,-Math.cos(a)*100);}x.stroke();
  x.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/3+Math.PI;x[i?'lineTo':'moveTo'](Math.sin(a)*100,-Math.cos(a)*100);}x.stroke();
  x.lineWidth=2;x.beginPath();x.arc(0,0,50,0,TAU);x.stroke();
  for(let i=0;i<6;i++){x.save();x.rotate(i*TAU/6+TAU/12);x.beginPath();x.arc(0,-78,9,0,TAU);x.stroke();x.restore();}
  return CX.tRune=new T.CanvasTexture(c);
}
function cineObjs(){
  if(CX.cine)return CX.cine;
  const mk=sc=>{const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:cineTex(),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));m.rotation.x=-Math.PI/2;m.renderOrder=3;m.visible=false;m.scale.setScalar(sc);scene.add(m);return m;};
  const halo=new T.Sprite(new T.SpriteMaterial({map:cxTex('glow'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));halo.visible=false;scene.add(halo);
  return CX.cine={rune:mk(3),rune2:mk(2),halo};
}
// camera: whip from the game view into a low hero shot → slow orbit + push-in → punch-in on the hit → pull out wide.
// While the penguin powers up, the arena dissolves into a coloured void (dense fog + sky in the skill's colour) and comes back on the hit.
function cineCam(){
  const c=G.cine;if(!c||!c.p)return false;
  const p=c.p,P=c.P,t=c.t,sd=c.sd,W_=innerWidth,H_=innerHeight;
  let a,dist,y,ly,fov=c.fov,off=0,void_=0;const ez3=u=>1-Math.pow(1-u,3),sm=u=>u*u*(3-2*u);
  const {h,near,far,sc}=cineNear(p),hy=(sc.ly||.52)*h,OF=W_<H_?.11:.1,yA=(sc.y||0)*h;
  if(t<P.band){const u=t/P.band;a=c.a+sd*.55;dist=near*1.05;y=.36*h+yA;ly=hy;off=OF*ez3(u);void_=ez3(u);}
  else if(t<P.impact){const u=(t-P.band)/(P.impact-P.band),e=sm(u);a=c.a+sd*lerp(.55,-.3,e);dist=lerp(near*1.05,near*.92,e);y=lerp(.36,.46,e)*h+yA;ly=hy;fov=lerp(c.fov,c.fov-5,e);off=OF;void_=1;}
  else{const k=t-P.impact,pi=k<.09;   // .09 s punch-in, then the pull-out
    const u=pi?0:ez3(Math.min(1,(k-.09)/Math.max(.2,P.out-P.impact-.09)));
    a=c.a+sd*lerp(-.3,.25,u);dist=pi?near*.74:lerp(near*.74,far,u);y=(pi?.46*h:lerp(.46*h,1.6*h,u))+yA;ly=lerp(hy,.45*h,u);fov=pi?c.fov-10:lerp(c.fov+6,c.fov,u);
    off=OF*(pi?1:Math.max(0,1-u*3));void_=pi?1:Math.max(0,1-u*2.2);}
  let px=p.rx+Math.sin(a)*dist,pz=p.rz+Math.cos(a)*dist;
  if(t<P.band){   // whip-in from wherever the game camera was
    const u=ez3(t/P.band),f=c.from;px=lerp(f.x,px,u);y=lerp(f.y,y,u);pz=lerp(f.z,pz,u);
    c.lk=[lerp(f.lx,p.rx,u),lerp(f.ly,ly,u),lerp(f.lz,p.rz,u)];
  }else c.lk=[p.rx,ly,p.rz];
  let sh=0;if(c.shake>0){sh=c.shake*shakeK();c.shake=Math.max(0,c.shake-(G.rdt||.016)*1.2);}
  camera.position.set(px+rnd(-sh,sh),y+rnd(-sh,sh)*.6,pz+rnd(-sh,sh));camera.lookAt(c.lk[0],c.lk[1],c.lk[2]);
  cineClearView(p);
  if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
  // shift the picture up a little while the portrait band covers the bottom (keeps the penguin clear of it)
  if(off>.002)camera.setViewOffset(W_,H_,0,H_*off,W_,H_);else camera.clearViewOffset();
  void_*=sc.v==null?1:sc.v;   // v26: a big centre-piece (the auk's wave) keeps more of the arena visible
  c.void=void_;
  if(void_>0&&scene.fog){   // setTOD rewrites fog + sky every frame, so this needs no restore
    if(!c.fogC){c.fogC=new T.Color(0x060b1e).lerp(new T.Color(CAST[p.type].c[1]),.3);}
    scene.fog.color.lerp(c.fogC,void_);scene.fog.density=lerp(scene.fog.density,.6/(near+5),void_);   // the penguin (and its centre-piece) stay clear, the arena behind dissolves
    for(const k of['topC','midC','horC'])skyU[k].value.lerp(c.fogC,void_*.92);
  }
  return true;
}
// nothing may stand between the camera and the star: penguins (and the referee) in the line of sight or right at the lens are hidden
// for the frame, and the puck stays out of the close-up until the hit (step() makes them visible again every frame)
function cineClearView(p){
  const c=G.cine,cx=camera.position.x,cz=camera.position.z,vx=p.rx-cx,vz=p.rz-cz,L=Math.hypot(vx,vz)||1,ux=vx/L,uz=vz/L;
  const blocks=(x,z,r)=>{const wx=x-cx,wz=z-cz,al=wx*ux+wz*uz,pe=Math.abs(wx*uz-wz*ux);return(al>-.6&&al<L-.2&&pe<r)||Math.hypot(wx,wz)<2.6;};
  for(const q of G.pengs)if(q!==p&&q.pg&&q.pg.root.visible&&blocks(q.rx,q.rz,1.25*((q.pg.root.scale&&q.pg.root.scale.x)||1)))q.pg.root.visible=false;
  const R=G.ref;if(R&&R.pg&&R.pg.root.visible&&R.pg.root.position&&blocks(R.pg.root.position.x,R.pg.root.position.z,1.2))R.pg.root.visible=false;
  marker.visible=markerRing.visible=aimArrow.visible=passRing.visible=aimLine.visible=aimTgt.visible=false;   // your own HUD rings / aim arrow
  if(c&&(c.ph==='p0'||c.ph==='p1')){puckG.visible=false;puckRing.visible=false;puckTrail.visible=false;}
}
// after the scene the gameplay camera takes over smoothly from where the cinematic camera stopped
function cineCamBlend(){
  const b=G.cineBlend;if(!b)return;b.t+=G.rdt||.016;const k=Math.min(1,b.t/b.d),e=k*k*(3-2*k);
  camera.position.set(lerp(b.x,camera.position.x,e),lerp(b.y,camera.position.y,e),lerp(b.z,camera.position.z,e));
  if(b.q&&camera.quaternion.slerp){const g=camera.quaternion.clone();camera.quaternion.copy(b.q).slerp(g,e);}
  const f=lerp(b.fov,b.fov0,e);if(camera.fov!==f){camera.fov=f;camera.updateProjectionMatrix();}
  if(k>=1)G.cineBlend=null;
}
{const el=$('#cine');if(el)el.addEventListener('pointerdown',e=>{cineSkip();e.preventDefault();});}

/* ================= v26: signature props & effects (대표 소품 · 효과) ================= */
// Every species' skill gets a recognisable, modelled centre-piece instead of a few dots:
// 황제 = jewelled sceptre + crown + golden light pillar · 임금 = herald trumpet with banner + sound rings · 큰바다쇠오리 = a real breaking wave ·
// 턱끈 = ice crystals erupting · 바위뛰기 = rocks · 마카로니 = flame crest · 로열 = red carpet · 피오르드랜드 = leaf whirlwind ·
// 노란눈 = eye beams · 쇠푸른 = fairy wings · 아프리카 = bray rings · 훔볼트 = water vortex · 마젤란 = compass rose · 갈라파고스 = the sun ·
// 젠투 = water torpedo jet · 아델리 = wind rings. All geometry is built in code (no downloads, a few KB).
// The cinematic camera (v25) frames each one so the centre-piece is in shot (SIGCAM).
const SIGCAM={   // a: camera angle around the penguin (0 = in front, ±π/2 = side, π = behind) · d: distance × · y / ly: camera / look height (× penguin height)
  king:{a:1.2,ta:.9,d:.92,ly:.66},little:{a:2.55,d:1.1,ly:.6},auk:{a:.3,d:1.75,y:.5,ly:.95,v:.3},fast:{a:1.35,d:1.15},galapagos:{a:.35,d:1.3,y:.3,ly:.85},
  defense:{a:.45,d:1.3},balanced:{a:.5,d:1.25},royal:{a:.75,d:1.15,ly:.62},humboldt:{a:.4,d:1.35},magellanic:{a:.3,d:1.35,y:1.3,ly:.3},
  yelloweye:{a:.55,d:1.1,ly:.62},strong:{a:.75,d:1.1,ly:.62},fiordland:{a:.4,d:1.3},african:{a:1.0,d:1.05,ly:.62},macaroni:{a:.5,d:1.05,ly:.62},basic:{a:1.2,d:1.15}};
const SG={};   // shared materials, geometries, pools
function sgMat(){
  if(SG.gold)return SG;
  const std=o=>new T.MeshStandardMaterial(o);
  SG.gold=std({color:0xffc43d,metalness:1,roughness:.22,emissive:0x5a3a00,envMapIntensity:1.7});
  SG.goldD=std({color:0xd99a1c,metalness:1,roughness:.32,emissive:0x2a1800,envMapIntensity:1.3});
  SG.ruby=std({color:0xff1f45,metalness:.2,roughness:.08,emissive:0x5a0010,envMapIntensity:2});
  SG.saph=std({color:0x4a7dff,metalness:.2,roughness:.08,emissive:0x0a1a5a,envMapIntensity:2});
  SG.amet=std({color:0xa45bff,metalness:.2,roughness:.08,emissive:0x2a0a5a,envMapIntensity:2});
  SG.pearl=std({color:0xfff6ea,metalness:.1,roughness:.25,emissive:0x221d18});
  SG.velvet=std({color:0xb0102a,metalness:0,roughness:.85,side:T.DoubleSide});
  SG.velvetP=std({color:0x5a1aa0,metalness:0,roughness:.85,side:T.DoubleSide});
  SG.ermine=std({color:0xf4f6fa,metalness:0,roughness:.9});
  SG.ice=std({color:0xbfe9ff,metalness:.1,roughness:.04,transparent:true,opacity:.82,emissive:0x1b4f7a,envMapIntensity:2,flatShading:true});
  SG.stone=std({color:0x7d7468,metalness:0,roughness:.95,flatShading:true});
  SG.leaf=std({color:0x2f9a4f,metalness:0,roughness:.6,side:T.DoubleSide,emissive:0x07240f});
  SG.leaf2=std({color:0x8fd14f,metalness:0,roughness:.6,side:T.DoubleSide,emissive:0x15300a});
  return SG;
}
const sgAdd=(col,op)=>new T.MeshBasicMaterial({color:col,transparent:true,opacity:op==null?1:op,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false});
function sgCanvas(S,draw){const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');draw(x,S);const t=new T.CanvasTexture(c);return t;}
function sgTex(k){
  const K='t_'+k;if(SG[K])return SG[K];let t;
  if(k==='banner')t=sgCanvas(128,(x,S)=>{const g=x.createLinearGradient(0,0,0,S);g.addColorStop(0,'#e01b3a');g.addColorStop(1,'#8c0a20');x.fillStyle=g;x.fillRect(0,0,S,S);
    x.strokeStyle='#ffd04a';x.lineWidth=7;x.strokeRect(8,8,S-16,S-28);x.fillStyle='#ffd04a';for(let i=0;i<8;i++){x.beginPath();x.moveTo(i*16,S-18);x.lineTo(i*16+16,S-18);x.lineTo(i*16+8,S);x.fill();}
    x.translate(S/2,S/2-8);x.fillStyle='#ffd04a';x.beginPath();x.moveTo(-30,14);x.lineTo(-34,-18);x.lineTo(-17,-4);x.lineTo(0,-26);x.lineTo(17,-4);x.lineTo(34,-18);x.lineTo(30,14);x.closePath();x.fill();
    x.fillRect(-30,16,60,8);x.fillStyle='#fff';for(const a of[-34,0,34])x.beginPath(),x.arc(a,a?-18:-26,5,0,TAU),x.fill();});
  else if(k==='carpet')t=sgCanvas(128,(x,S)=>{x.fillStyle='#b3122d';x.fillRect(0,0,S,S);x.fillStyle='#ffcf4a';x.fillRect(0,0,14,S);x.fillRect(S-14,0,14,S);x.fillStyle='#7a0a1e';x.fillRect(16,0,5,S);x.fillRect(S-21,0,5,S);
    x.fillStyle='rgba(255,207,74,.55)';for(let y=0;y<S;y+=32){x.beginPath();x.moveTo(S/2,y+4);x.lineTo(S/2+10,y+16);x.lineTo(S/2,y+28);x.lineTo(S/2-10,y+16);x.fill();}});
  else if(k==='flow')t=sgCanvas(64,(x,S)=>{for(let y=0;y<S;y++){const a=.5+.5*Math.sin(y/S*TAU*2);x.fillStyle='rgba(255,255,255,'+(.25+.75*a*a).toFixed(3)+')';x.fillRect(0,y,S,1);}});
  else if(k==='rays')t=sgCanvas(256,(x,S)=>{x.translate(S/2,S/2);for(let i=0;i<16;i++){x.rotate(TAU/16);const L=i%2?.62:.98,g=x.createLinearGradient(0,0,0,-S/2*L);g.addColorStop(0,'rgba(255,240,170,1)');g.addColorStop(1,'rgba(255,170,40,0)');x.fillStyle=g;x.beginPath();x.moveTo(-14,0);x.lineTo(0,-S/2*L);x.lineTo(14,0);x.fill();}
    const g=x.createRadialGradient(0,0,0,0,0,S*.3);g.addColorStop(0,'rgba(255,255,235,1)');g.addColorStop(.45,'rgba(255,220,90,.9)');g.addColorStop(1,'rgba(255,180,40,0)');x.fillStyle=g;x.fillRect(-S/2,-S/2,S,S);});
  else if(k==='wing2')t=sgCanvas(256,(x,S)=>{
    const lobe=(cx,cy,rx,ry,rot,a,b)=>{x.save();x.translate(cx,cy);x.rotate(rot);const g=x.createLinearGradient(-rx,0,rx,0);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.beginPath();x.ellipse(0,0,rx,ry,0,0,TAU);x.fill();
      x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=3;x.stroke();x.strokeStyle='rgba(120,200,255,.7)';x.lineWidth=1.5;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(-rx*.9,0);x.quadraticCurveTo(0,i*ry*.35,rx*.95,i*ry*.3);x.stroke();}x.restore();};
    lobe(140,92,110,52,-.42,'rgba(190,240,255,.85)','rgba(255,190,250,.75)');lobe(118,176,82,36,.32,'rgba(170,230,255,.85)','rgba(200,170,255,.75)');
    for(let i=0;i<40;i++){x.fillStyle='rgba(255,255,255,'+(.4+.6*Math.random()).toFixed(2)+')';x.beginPath();x.arc(40+Math.random()*200,40+Math.random()*170,1+Math.random()*2.2,0,TAU);x.fill();}});
  SG[K]=t;return t;
}
/* ---------- props (attached to the penguin; replace the v23 placeholders) ---------- */
function lathe(pts,seg){return new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg||24);}
function sgSceptre(){
  const M=sgMat(),g=new T.Group();
  const rod=lathe([[0,0],[.075,.0],[.085,.04],[.06,.08],[.05,.1],[.072,.13],[.05,.16],[.042,.2],[.038,.6],[.06,.63],[.07,.66],[.06,.69],[.038,.72],[.036,1.18],[.065,1.22],[.08,1.26],[.065,1.3],[.04,1.34],[.04,1.55],[.07,1.6],[.13,1.68],[.15,1.72],[.11,1.74],[0,1.75]],20);
  g.add(new T.Mesh(rod,M.gold));
  const orb=new T.Mesh(new T.SphereGeometry(.17,28,20),M.gold);orb.position.y=1.9;g.add(orb);
  const band=new T.Mesh(new T.TorusGeometry(.172,.02,8,40),M.goldD);band.position.y=1.9;band.rotation.x=Math.PI/2;g.add(band);
  const mer=new T.Mesh(new T.TorusGeometry(.172,.018,8,40),M.goldD);mer.position.y=1.9;g.add(mer);
  const cv=new T.Mesh(new T.BoxGeometry(.045,.24,.045),M.gold);cv.position.y=2.17;g.add(cv);const ch=new T.Mesh(new T.BoxGeometry(.16,.045,.045),M.gold);ch.position.y=2.2;g.add(ch);
  for(const [y,s,m] of[[1.9,.06,M.ruby],[1.26,.045,M.saph],[.66,.035,M.ruby]])for(const a of[0,Math.PI]){const gm=new T.Mesh(new T.SphereGeometry(s,14,10),m);gm.position.set(Math.sin(a)*(y>1.8?.175:y>1?.08:.07),y,Math.cos(a)*(y>1.8?.175:y>1?.08:.07));g.add(gm);}
  for(let i=0;i<6;i++){const a=i/6*TAU,gm=new T.Mesh(new T.SphereGeometry(.022,8,6),i%2?M.saph:M.ruby);gm.position.set(Math.sin(a)*.14,1.7,Math.cos(a)*.14);g.add(gm);}
  return g;
}
function sgCrown(royal){
  const M=sgMat(),g=new T.Group();
  const band=lathe([[.2,0],[.215,.0],[.215,.02],[.205,.05],[.21,.1],[.225,.12],[.2,.12]],32);band.computeVertexNormals();
  const bm=new T.Mesh(band,M.gold);bm.material=M.gold.clone();bm.material.side=T.DoubleSide;g.add(bm);
  const rim=new T.Mesh(new T.TorusGeometry(.212,.028,8,36),M.ermine);rim.rotation.x=Math.PI/2;rim.position.y=-.005;g.add(rim);
  const cap=new T.Mesh(new T.SphereGeometry(.19,20,12,0,TAU,0,Math.PI/2),royal?M.velvetP:M.velvet);cap.position.y=.06;cap.scale.y=1.05;g.add(cap);
  for(let i=0;i<8;i++){const a=i/8*TAU,big=i%2===0;
    const pt=new T.Mesh(new T.ConeGeometry(big?.045:.03,big?.16:.1,6),M.gold);pt.position.set(Math.sin(a)*.21,.12+(big?.08:.05),Math.cos(a)*.21);g.add(pt);
    const ball=new T.Mesh(new T.SphereGeometry(big?.028:.02,10,8),M.pearl);ball.position.set(Math.sin(a)*.21,.12+(big?.17:.105),Math.cos(a)*.21);g.add(ball);
    const gm=new T.Mesh(new T.SphereGeometry(.026,10,8),royal?(big?M.amet:M.saph):(big?M.ruby:M.saph));gm.position.set(Math.sin(a)*.222,.06,Math.cos(a)*.222);gm.scale.z=.6;gm.lookAt(0,.06,0);g.add(gm);}
  for(const r of[0,Math.PI/2]){const ar=new T.Mesh(new T.TorusGeometry(.2,.016,8,24,Math.PI),M.gold);ar.position.y=.12;ar.rotation.y=r;ar.scale.y=.85;g.add(ar);}
  const orb=new T.Mesh(new T.SphereGeometry(.04,14,10),M.gold);orb.position.y=.31;g.add(orb);
  const cv=new T.Mesh(new T.BoxGeometry(.018,.08,.018),M.gold);cv.position.y=.37;g.add(cv);const chh=new T.Mesh(new T.BoxGeometry(.055,.018,.018),M.gold);chh.position.y=.38;g.add(chh);
  g.scale.setScalar(1.05);return g;
}
function sgTrumpet(){
  const M=sgMat(),g=new T.Group();
  const mouth=lathe([[0,0],[.03,0],[.032,.012],[.02,.03],[.012,.06],[.012,.08]],16);mouth.rotateX(Math.PI/2);g.add(new T.Mesh(mouth,M.gold));
  const pipe=new T.Mesh(new T.CylinderGeometry(.014,.014,.62,12),M.gold);pipe.rotation.x=Math.PI/2;pipe.position.z=.08+.31;g.add(pipe);
  const pts=[];for(let i=0;i<=26;i++){const t=i/26;pts.push([.014+.19*Math.pow(t,3.4)+.004*t,.0+.32*t]);}pts.push([.205,.322],[.2,.318]);
  const bell=lathe(pts,32);bell.rotateX(Math.PI/2);bell.translate(0,0,.62);const bm=new T.Mesh(bell,M.gold.clone());bm.material.side=T.DoubleSide;g.add(bm);
  const lip=new T.Mesh(new T.TorusGeometry(.203,.008,6,40),M.goldD);lip.position.z=.942;g.add(lip);
  // valve block + finger buttons, the tuning loop under the pipe
  for(let i=0;i<3;i++){const z=.24+i*.055,v=new T.Mesh(new T.CylinderGeometry(.022,.022,.12,12),M.goldD);v.position.set(0,-.02,z);g.add(v);
    const cap=new T.Mesh(new T.CylinderGeometry(.026,.026,.012,12),M.gold);cap.position.set(0,.045,z);g.add(cap);const bt=new T.Mesh(new T.CylinderGeometry(.016,.016,.03,10),M.pearl);bt.position.set(0,.065,z);g.add(bt);}
  const path=new T.CatmullRomCurve3([new T.Vector3(0,-.07,.22),new T.Vector3(0,-.12,.18),new T.Vector3(0,-.15,.32),new T.Vector3(0,-.12,.5),new T.Vector3(0,-.04,.56),new T.Vector3(0,0,.6)]);
  g.add(new T.Mesh(new T.TubeGeometry(path,24,.012,8,false),M.gold));
  for(const z of[.2,.48]){const ring=new T.Mesh(new T.TorusGeometry(.019,.006,6,14),M.goldD);ring.position.z=z;g.add(ring);}
  // the banner: a little grid that waves (vertices moved every frame)
  const bg=new T.PlaneGeometry(.34,.3,8,5);bg.translate(0,-.15,0);const ban=new T.Mesh(bg,new T.MeshStandardMaterial({map:sgTex('banner'),side:T.DoubleSide,roughness:.75,metalness:0}));
  ban.rotation.y=Math.PI/2;ban.position.set(0,-.012,.48);g.add(ban);g.userData.ban=ban;g.userData.b0=Float32Array.from(bg.attributes.position.array);
  const bar=new T.Mesh(new T.CylinderGeometry(.008,.008,.36,8),M.gold);bar.rotation.x=Math.PI/2;bar.position.set(0,-.012,.48);g.add(bar);
  return g;
}
function sgBannerWave(g,t){const ban=g.userData.ban;if(!ban)return;const a=ban.geometry.attributes.position,b=g.userData.b0;
  for(let i=0;i<a.count;i++){const x=b[i*3],y=b[i*3+1],k=(x+.17)/.34;a.array[i*3+2]=Math.sin(t*9+k*5+y*6)*.025*k+Math.sin(t*5+y*9)*.01;}a.needsUpdate=true;}
/* called by castProps (v23) once per penguin: swap the placeholder props for the modelled ones and add the per-species pieces */
function sigProps(p,cx){
  const P=p.pg,k=p.type;sgMat();
  const swap=(o,n)=>{if(!o)return;for(const ch of[...o.children])o.remove(ch);for(const ch of[...n.children])o.add(ch);};
  try{
    if(cx.sceptre)swap(cx.sceptre,sgSceptre());
    if(cx.crown){swap(cx.crown,sgCrown(k==='royal'));cx.crown.position.y=1.6;}   // sits on the head (head top ≈ 1.71)
    if(cx.trumpet){const n=sgTrumpet();swap(cx.trumpet,n);cx.trumpet.userData=n.userData;cx.trumpet.position.copy(pkHeadPt(0,1.37,-.03));cx.trumpet.rotation.set(-.22,0,0);cx.trumpet.userData.s=1.3;}
    if(cx.wings){for(const w of[cx.wl,cx.wr]){const m=w.children[0];m.material=new T.MeshBasicMaterial({map:sgTex('wing2'),transparent:true,side:T.DoubleSide,depthWrite:false});m.scale.set(1.45,1.45,1);}}
    if(k==='macaroni'){const g=new T.Group();const fl=lathe([[0,0],[.06,.04],[.075,.12],[.05,.26],[.02,.4],[0,.5]],12);for(let i=0;i<7;i++){const out=new T.Mesh(fl,sgAdd(i%2?0xff3a0a:0xff7a10,.75)),core=new T.Mesh(fl,sgAdd(0xffe27a,.9));core.scale.setScalar(.55);core.position.y=.02;out.add(core);
        out.position.set((i-3)*.06,0,-.05*Math.abs(i-3));out.rotation.z=(i-3)*-.24;out.rotation.x=-.75;const sc=1.6-.18*Math.abs(i-3);out.scale.setScalar(sc);out.userData.s=sc;g.add(out);}
      g.position.copy(pkHeadPt(0,1.72,-.05));g.visible=false;P.headAbs.add(g);cx.flames=g;}
    if(k==='yelloweye'){const mk=()=>{const geo=new T.CylinderGeometry(.02,.3,1,14,1,true);geo.translate(0,.5,0);const m=new T.Mesh(geo,sgAdd(0xffd84a,.6));m.visible=false;m.frustumCulled=false;scene.add(m);return m;};cx.beamL=mk();cx.beamR=mk();}
    if(k==='galapagos'){const g=new T.Group(),core=new T.Mesh(new T.SphereGeometry(.26,24,16),new T.MeshBasicMaterial({color:0xfff6c8,fog:false}));g.add(core);
      const rays=new T.Sprite(new T.SpriteMaterial({map:sgTex('rays'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));rays.scale.setScalar(2.4);g.add(rays);cx.sunRays=rays;
      const glow=new T.Sprite(new T.SpriteMaterial({map:cxTex('glow'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,color:0xffc040}));glow.scale.setScalar(3.4);g.add(glow);
      g.position.y=2.9;g.visible=false;P.root.add(g);cx.sun3=g;if(cx.sun)cx.sun.visible=false;}
  }catch(e){dbgErr('sigProps',e);}
}
/* ---------- world effects: pooled ---------- */
const sgP={rings:[],shards:[],rocks:[],leaves:[],beams:[],waves:[],carpets:[],vort:[],rose:[],discs:[]};
function sgGet(kind,make){const L=sgP[kind];let o=L.find(q=>q.life<=0);if(!o){if(L.length>=({rings:14,shards:16,rocks:16,leaves:18,beams:3,waves:2,carpets:2,vort:2,rose:2,discs:4}[kind]))return null;o={m:make(),life:0};scene.add(o.m);L.push(o);}o.m.visible=true;o.seen=G.frame;return o;}
function sgRing(x,y,z,dx,dy,dz,col,r0,r1,life,tube){
  const o=sgGet('rings',()=>new T.Mesh(new T.TorusGeometry(1,.06,10,56),sgAdd(0xffffff,1)));if(!o)return;
  o.m.position.set(x,y,z);o.m.lookAt(x+dx,y+dy,z+dz);o.m.material.color.set(col);o.r0=r0;o.r1=r1;o.life=o.max=life;o.tube=tube||1;o.vx=dx*1.6;o.vy=dy*1.6;o.vz=dz*1.6;
}
function sgDisc(x,z,col,r1,life){   // flat shock-wave on the ice
  const o=sgGet('discs',()=>{const m=new T.Mesh(new T.RingGeometry(.86,1,64),sgAdd(0xffffff,1));m.rotation.x=-Math.PI/2;return m;});if(!o)return;
  o.m.position.set(x,.06,z);o.m.material.color.set(col);o.r1=r1;o.life=o.max=life;
}
function sgCrystalGeo(){if(!SG.crys){const g=lathe([[0,0],[.16,0],[.2,.15],[.16,.72],[0,1]],6);g.computeVertexNormals();SG.crys=g;}return SG.crys;}
function sgShards(x,z,n,r0,r1,h){
  for(let i=0;i<n;i++){const o=sgGet('shards',()=>new T.Mesh(sgCrystalGeo(),sgMat().ice));if(!o)return;
    const a=i/n*TAU+rnd(-.2,.2),r=rnd(r0,r1),sx=x+Math.cos(a)*r,sz=z+Math.sin(a)*r;o.m.position.set(sx,-.05,sz);
    o.m.rotation.set(0,0,0);o.m.rotateY(-a);o.m.rotateZ(-rnd(.25,.6));o.h=h*rnd(.6,1.25)*(1-.25*(r-r0)/(r1-r0+.01));o.w=rnd(.8,1.3);o.life=o.max=rnd(1.3,1.7);o.delay=r*.06;o.m.scale.set(.001,.001,.001);}
}
function sgRock(x,y,z){const o=sgGet('rocks',()=>{const g=new T.DodecahedronGeometry(.18,0),a=g.attributes.position;for(let i=0;i<a.count;i++)a.setXYZ(i,a.getX(i)*rnd(.7,1.25),a.getY(i)*rnd(.6,1.1),a.getZ(i)*rnd(.7,1.25));g.computeVertexNormals();return new T.Mesh(g,sgMat().stone);});if(!o)return;
  const a=rnd(TAU),v=rnd(1.5,3.5);o.m.position.set(x,y,z);o.vx=Math.cos(a)*v;o.vz=Math.sin(a)*v;o.vy=rnd(3.5,6);o.sp=[rnd(-8,8),rnd(-8,8)];o.life=o.max=rnd(.9,1.3);o.m.scale.setScalar(rnd(.7,1.6));}
function sgLeaf(p,i,n){const o=sgGet('leaves',()=>{const s=new T.Shape();s.moveTo(0,-.2);s.quadraticCurveTo(.13,-.05,0,.22);s.quadraticCurveTo(-.13,-.05,0,-.2);return new T.Mesh(new T.ShapeGeometry(s,6),Math.random()<.5?sgMat().leaf:sgMat().leaf2);});if(!o)return;
  o.p=p;o.ph=i/n*TAU;o.r=rnd(.9,1.4);o.hy=rnd(.1,.5);o.vy=rnd(.6,1.3);o.life=o.max=rnd(1.2,1.6);o.m.scale.setScalar(rnd(1,1.6));}
function sgBeam(x0,y0,z0,x1,y1,z1,col,life,w){const o=sgGet('beams',()=>{const g=new T.CylinderGeometry(1,1,1,16,1,true);g.translate(0,.5,0);return new T.Mesh(g,sgAdd(0xffffff,.8));});if(!o)return;
  const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.hypot(dx,dy,dz)||1;o.m.position.set(x0,y0,z0);o.m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(dx/L,dy/L,dz/L));o.L=L;o.w=w||.25;o.m.material.color.set(col);o.life=o.max=life;}
/* the wave: a swept surface (profile × width) rebuilt every frame from a rise / crash parameter */
const WAVE={NX:40,NV:24,W:7.5,
  swell:[[-3,0],[-2.2,.05],[-1.5,.15],[-.8,.3],[-.2,.42],[.4,.5],[1,.48],[1.5,.38],[1.9,.22],[2.1,.1],[2.2,0]],
  full:[[-3,0],[-1.9,.3],[-1,1],[-.3,2],[.25,3],[.75,3.75],[1.35,3.98],[1.95,3.62],[2.3,2.95],[2.2,2.3],[1.85,1.98]],
  crash:[[-3,0],[-2.2,.2],[-1.4,.5],[-.6,.85],[.2,1.15],[1,1.25],[1.8,1.15],[2.5,.9],[3.1,.55],[3.5,.25],[3.8,0]]};
function waveProfile(k){   // 0 = swell, 1 = full breaking wave, 2 = crashed forward
  const A=k<=1?WAVE.swell:WAVE.full,B=k<=1?WAVE.full:WAVE.crash,f=k<=1?k:k-1,e=f*f*(3-2*f);
  return new T.CatmullRomCurve3(A.map((a,i)=>new T.Vector3(lerp(a[0],B[i][0],e),lerp(a[1],B[i][1],e),0)));
}
function sgWaveMake(){
  const NX=WAVE.NX,NV=WAVE.NV,n=(NX+1)*(NV+1),g=new T.BufferGeometry(),pos=new Float32Array(n*3),col=new Float32Array(n*3),idx=[];
  for(let i=0;i<NX;i++)for(let j=0;j<NV;j++){const a=i*(NV+1)+j,b=a+NV+1;idx.push(a,b,a+1,b,b+1,a+1);}
  g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setIndex(idx);
  const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:0,transparent:true,opacity:.96,side:T.DoubleSide,envMapIntensity:.35,emissive:0x03203d,depthWrite:true}));
  m.frustumCulled=false;return m;
}
function sgWaveSet(o,k,t,alpha){
  const NX=WAVE.NX,NV=WAVE.NV,g=o.m.geometry,pos=g.attributes.position.array,col=g.attributes.color.array,cv=waveProfile(k),pts=cv.getPoints(NV);
  for(let i=0;i<=NX;i++){const u=i/NX,x=(u-.5)*WAVE.W,bell=Math.pow(Math.cos((u-.5)*Math.PI),.9),amp=.22+.78*bell,fwd=.45*bell;
    for(let j=0;j<=NV;j++){const v=j/NV,P=pts[j],q=(i*(NV+1)+j)*3,rip=.07*Math.sin(x*2.3-t*5+v*5)+.04*Math.sin(x*5.1+t*7);
      pos[q]=x;pos[q+1]=Math.max(0,P.y*amp+rip*v);pos[q+2]=P.x*(.8+.2*amp)+fwd*v*v;
      // colour: deep blue at the base → turquoise face → pale crest → white foam on the lip (foam patches vary across the width)
      const foam=clamp((v-.8)/.12+.4*Math.sin(x*3.7+t*2)*(v>.7?1:0),0,1),face=clamp(v/.7,0,1);
      const crest=clamp((v-.55)/.25,0,1),streak=.5+.5*Math.sin(x*4.3+v*9-t*3);let r=lerp(0,.02,face),gg=lerp(.08,.36,face),b=lerp(.26,.66,face);r=lerp(r,.28,crest*.85);gg=lerp(gg,.78,crest*.85);b=lerp(b,.95,crest*.85);
      const fm=Math.min(1,foam+(v>.45&&v<.7?.18*streak*streak:0));r=lerp(r,.97,fm);gg=lerp(gg,.99,fm);b=lerp(b,1,fm);
      col[q]=r;col[q+1]=gg;col[q+2]=b;}}
  g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;g.computeVertexNormals();o.m.material.opacity=.93*alpha;
  return pts;
}
function sgCarpet(){const o=sgGet('carpets',()=>{const g=new T.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);g.translate(0,0,.5);const tx=sgTex('carpet');tx.wrapT=T.RepeatWrapping;
  const m=new T.Mesh(g,new T.MeshStandardMaterial({map:tx,roughness:.9,metalness:0,polygonOffset:true,polygonOffsetFactor:-4}));const roll=new T.Mesh(new T.CylinderGeometry(.13,.13,1,16),new T.MeshStandardMaterial({color:0xb3122d,roughness:.8}));roll.rotation.z=Math.PI/2;m.add(roll);m.userData.roll=roll;return m;});return o;}
function sgVortex(){return sgGet('vort',()=>{const g=new T.Group(),tx=sgTex('flow');tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(1,6);
  for(let s=0;s<3;s++){const pts=[];for(let i=0;i<=60;i++){const t=i/60,a=t*TAU*1.6+s*TAU/3,r=lerp(1.35,.55,t);pts.push(new T.Vector3(Math.cos(a)*r,.1+t*2.3,Math.sin(a)*r));}
    const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),80,.07+s*.015,8,false),new T.MeshBasicMaterial({map:tx,color:s===1?0x9fe8ff:0x2fa6ff,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false,fog:false}));g.add(m);}
  g.userData.tx=tx;return g;});}
function sgRose(){return sgGet('rose',()=>{const g=new T.Group(),M=sgMat(),s=new T.Shape();for(let i=0;i<16;i++){const a=i/16*TAU,r=i%4===0?1.5:i%2===0?.85:.32;s[i?'lineTo':'moveTo'](Math.sin(a)*r,Math.cos(a)*r);}s.closePath();
  const st=new T.Mesh(new T.ExtrudeGeometry(s,{depth:.05,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:1}),M.gold);st.rotation.x=-Math.PI/2;g.add(st);
  const n=new T.Shape();n.moveTo(0,1.55);n.lineTo(.16,.3);n.lineTo(-.16,.3);n.closePath();const nm=new T.Mesh(new T.ExtrudeGeometry(n,{depth:.06,bevelEnabled:false}),sgMat().ruby);nm.rotation.x=-Math.PI/2;nm.position.y=.04;g.add(nm);
  const rg=new T.Mesh(new T.TorusGeometry(1.75,.045,8,64),M.gold);rg.rotation.x=Math.PI/2;g.add(rg);const rg2=new T.Mesh(new T.TorusGeometry(1.6,.02,6,64),M.goldD);rg2.rotation.x=Math.PI/2;g.add(rg2);
  for(let i=0;i<4;i++){const b=new T.Mesh(new T.SphereGeometry(.07,10,8),i?M.saph:M.ruby);b.position.set(Math.sin(i*Math.PI/2)*1.75,.02,Math.cos(i*Math.PI/2)*1.75);g.add(b);}
  return g;});}
function sgWorld(dt){
  for(const o of sgP.rings){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}const k=1-o.life/o.max,e=1-Math.pow(1-k,2);
    o.m.scale.set(lerp(o.r0,o.r1,e),lerp(o.r0,o.r1,e),o.tube*(1-k*.6));o.m.position.x+=o.vx*dt;o.m.position.y+=o.vy*dt;o.m.position.z+=o.vz*dt;o.m.material.opacity=Math.min(1,(1-k)*1.6);}
  for(const o of sgP.discs){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}const k=1-o.life/o.max;o.m.scale.setScalar(.2+o.r1*(1-Math.pow(1-k,3)));o.m.material.opacity=(1-k)*.9;}
  for(const o of sgP.shards){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}const age=o.max-o.life-o.delay;if(age<0){o.m.scale.setScalar(.001);continue;}
    const up=age<.14?Math.pow(age/.14,.5)*1.12:age<.24?1.12-(age-.14)/.1*.12:1,out=o.life<.45?o.life/.45:1;o.m.scale.set(o.w*up,o.h*up*out+.001,o.w*up);}
  for(const o of sgP.rocks){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}o.vy-=14*dt;o.m.position.x+=o.vx*dt;o.m.position.z+=o.vz*dt;o.m.position.y+=o.vy*dt;
    if(o.m.position.y<.12){o.m.position.y=.12;o.vy*=-.35;o.vx*=.6;o.vz*=.6;}o.m.rotation.x+=o.sp[0]*dt;o.m.rotation.z+=o.sp[1]*dt;if(o.life<.25)o.m.scale.multiplyScalar(.9);}
  for(const o of sgP.leaves){if(o.life<=0)continue;o.life-=dt;if(o.life<=0||!o.p){o.m.visible=false;o.life=0;continue;}const k=1-o.life/o.max;o.ph+=dt*(4.5-k*2);o.hy+=o.vy*dt;
    const r=o.r*(1+k*.6);o.m.position.set(o.p.rx+Math.cos(o.ph)*r,o.hy,o.p.rz+Math.sin(o.ph)*r);o.m.rotation.set(o.ph*2,o.ph,o.ph*.7);const s=o.life<.3?o.life/.3:1;o.m.scale.setScalar(Math.max(.01,s*1.3));}
  for(const o of sgP.beams){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.m.visible=false;continue;}const k=1-o.life/o.max,w=o.w*(k<.15?k/.15:1)*(1-k*.5);o.m.scale.set(w,o.L,w);o.m.material.opacity=(1-k)*.85;}
  for(const kk of['waves','carpets','vort','rose'])for(const o of sgP[kk])if(o.life>0&&G.frame-(o.seen||0)>20){o.life=0;o.m.visible=false;}   // a cast that ended without sigEnd
  if(G.view!=='game')for(const L of Object.values(sgP))for(const o of L)if(o.life>0){o.life=0;o.m.visible=false;}
}
/* ---------- per-cast driver: called from castPost every frame while p.cast is alive (u = 0..1) ---------- */
function sigFrame(p,c,dt,t){
  const P=p.pg,cx=P.cx||{},k=c.k,u=Math.min(1,c.t/c.dur),x=p.rx,z=p.rz,fx=Math.sin(p.heading),fz=Math.cos(p.heading),s=P.root.scale.x||1,big=!c.whiff;
  const once=(f,at)=>{if(!c['s_'+f]&&u>=at){c['s_'+f]=true;return true;}return false;};
  if(k==='strong'){
    if(once('hit',.6)&&big){const ix=x+fx*.9,iz=z+fz*.9;sgDisc(ix,iz,0xffd76a,6,.7);sgDisc(ix,iz,0xffffff,3.5,.45);sgBeam(ix,0,iz,ix,9,iz,0xffd24a,1.1,.55);sgBeam(ix,0,iz,ix,9,iz,0xffffff,.6,.22);}
  }else if(k==='king'){
    const tr=cx.trumpet;if(tr&&tr.visible){sgBannerWave(tr,t);
      if(u>.22&&u<.9&&Math.floor(c.t*7)!==c.rk){c.rk=Math.floor(c.t*7);tr.updateMatrixWorld(true);const b=new T.Vector3(0,0,.95).applyMatrix4(tr.matrixWorld),d=new T.Vector3(0,0,1).transformDirection(tr.matrixWorld);sgRing(b.x,b.y,b.z,d.x,d.y,d.z,0xffc21a,.25,1.6,.75,1.8);}}
  }else if(k==='auk'){
    if(!c.wave&&big){c.wave=sgGet('waves',sgWaveMake);if(c.wave){c.wave.life=1;c.wx=x-fx*2.3;c.wz=z-fz*2.3;c.wh=p.heading;}}
    const o=c.wave;if(o){const rise=clamp((u-.04)/.46,0,1),crash=clamp((u-.55)/.35,0,1),kk=crash>0?1+crash:rise*rise*(3-2*rise),al=u>.85?Math.max(0,1-(u-.85)/.15):1;
      o.m.position.set(c.wx,0,c.wz);o.m.rotation.y=c.wh;o.m.scale.setScalar(s*1.05);const pts=sgWaveSet(o,kk,c.t,al);
      if(Math.random()<dt*(crash>0?120:50)*(save.set.quality==='low'?.4:1)){const j=(Math.random()*.25+.75)*WAVE.NV|0,P2=pts[Math.min(WAVE.NV,j)],xx=rnd(-3,3),cs=Math.cos(c.wh),sn=Math.sin(c.wh),lz=P2.x,ly=P2.y*(.45+.55*Math.cos(xx/WAVE.W*Math.PI));
        emit(c.wx+xx*cs+lz*sn,ly,c.wz-xx*sn+lz*cs,sn*rnd(1,4)+rnd(-1,1),rnd(.5,3),cs*rnd(1,4)+rnd(-1,1),rnd(.4,.8),rnd(.16,.32),.92,.97,1);}
      if(once('crash',.62)){for(let i=0;i<30;i++){const a=rnd(TAU),v=rnd(3,8);emit(x+fx*.8,rnd(.2,1),z+fz*.8,Math.cos(a)*v,rnd(3,7),Math.sin(a)*v,rnd(.5,1),rnd(.2,.36),.85,.95,1);}sgDisc(x,z,0x9fe0ff,5,.7);}}
  }else if(k==='defense'){if(once('hit',.5))sgShards(x+fx*.7,z+fz*.7,big?11:6,.6,2.4,1.3*s);}
  else if(k==='balanced'){if(once('r1',.35)||once('r2',.7))for(let i=0;i<5;i++)sgRock(x+rnd(-.4,.4),.2,z+rnd(-.4,.4));}
  else if(k==='macaroni'){const f=cx.flames;if(f){f.visible=u<.92;const fl=Math.min(1,u*6)*(1-seg(u,.8,.92));f.children.forEach((m,i)=>{const q=m.userData.s||1;m.scale.set(q*fl*(.9+.2*Math.sin(t*23+i)),q*fl*(1+.35*Math.sin(t*31+i*2)),q*fl);});
    if(Math.random()<dt*30){const hp=pkHeadPt(0,1.8,0).applyMatrix4(P.headAbs.matrixWorld);emit(hp.x,hp.y+.2,hp.z,-fx*rnd(1,3),rnd(1.5,3),-fz*rnd(1,3),rnd(.3,.5),rnd(.18,.3),1,rnd(.4,.7),.1);}}}
  else if(k==='royal'){const to=c.to;if(to&&big){if(!c.rugO){c.rugO=sgCarpet();if(c.rugO){c.rugO.life=1;c.cx0=G.puck.rx||x;c.cz0=G.puck.rz||z;}}
      const o=c.rugO;if(o){const dx=to.rx-c.cx0,dz=to.rz-c.cz0,L=Math.hypot(dx,dz)||1,e=clamp(u/.6,0,1),f=u>.85?(1-u)/.15:1;o.m.position.set(c.cx0,.035,c.cz0);o.m.rotation.y=Math.atan2(dx,dz);o.m.scale.set(1.05*Math.max(.01,f),1,Math.max(.01,L*(1-Math.pow(1-e,2))));
        o.m.material.map.repeat.set(1,Math.max(1,L/1.2));o.m.userData.roll.position.set(0,.13,1);o.m.userData.roll.scale.set(1,1,1/Math.max(.01,L*(1-Math.pow(1-e,2))));o.m.userData.roll.visible=e<1;}}}
  else if(k==='fiordland'){if(Math.random()<dt*26*(save.set.quality==='low'?.5:1))sgLeaf(p,Math.random()*16|0,16);}
  else if(k==='yelloweye'){const on=u>.12&&u<.92,L=on?(u<.3?(u-.12)/.18:1)*9:0,gx=p.team.dir*W,gy=1.2,gz=0,_v=SG._v||(SG._v=new T.Vector3()),_d=SG._d||(SG._d=new T.Vector3()),up=SG._u||(SG._u=new T.Vector3(0,1,0));
    [[cx.beamL,P.eyeL],[cx.beamR,P.eyeR]].forEach(([b,e])=>{if(!b)return;b.visible=on;if(!on)return;e.updateMatrixWorld(true);_v.setFromMatrixPosition(e.matrixWorld);_d.set(gx-_v.x,gy-_v.y,gz-_v.z).normalize();
      b.position.copy(_v);b.quaternion.setFromUnitVectors(up,_d);const w=1+.18*Math.sin(t*40);b.scale.set(w,Math.max(.01,L),w);b.material.opacity=.5+.2*Math.sin(t*25);});}
  else if(k==='african'){if(once('w1',.2)||once('w2',.42)||once('w3',.64)){P.headAbs.updateMatrixWorld(true);const b=pkHeadPt(0,1.4,-.1).applyMatrix4(P.headAbs.matrixWorld);sgRing(b.x,b.y,b.z,fx,.25,fz,0xffb070,.25,2.2,.8,1.5);sgRing(b.x,b.y,b.z,fx,.25,fz,0xffffff,.15,1.4,.55,1);}}
  else if(k==='humboldt'){if(!c.vort&&big){c.vort=sgVortex();if(c.vort)c.vort.life=1;}const o=c.vort;if(o){const e=Math.min(1,u*4)*(u>.85?(1-u)/.15:1);o.m.position.set(x,0,z);o.m.rotation.y=-c.t*5;o.m.scale.set(e*s,(.3+.7*e)*s,e*s);o.m.userData.tx.offset.y=-c.t*2.5;}}
  else if(k==='magellanic'){if(!c.rose&&big){c.rose=sgRose();if(c.rose){c.rose.life=1;c.rh=Math.atan2(p.team.dir*W-x,-z);}}const o=c.rose;if(o){const e=Math.min(1,u*5),f=u>.85?(1-u)/.15:1;o.m.position.set(x,.03,z);o.m.scale.setScalar(Math.max(.01,e*f*s));o.m.rotation.y=c.rh+(1-Math.min(1,u*1.6))*5;}}
  else if(k==='galapagos'){const g=cx.sun3;if(g){g.visible=u<.97;const e=Math.min(1,u*3.5)*(1-seg(u,.85,.97));g.scale.setScalar(Math.max(.01,e));if(cx.sunRays)cx.sunRays.material.rotation=t*.9;
      if(once('beam',.45)&&big){const og=p.team.opp.goalie;if(og){g.updateMatrixWorld(true);const sp=new T.Vector3().setFromMatrixPosition(g.matrixWorld);sgBeam(sp.x,sp.y,sp.z,og.rx,1,og.rz,0xffd76a,.9,.3);sgBeam(sp.x,sp.y,sp.z,og.rx,1,og.rz,0xffffff,.6,.1);}}}}
  else if(k==='fast'){if(Math.floor(c.t*10)!==c.rk&&u<.85){c.rk=Math.floor(c.t*10);sgRing(x-fx*.7,.45*s,z-fz*.7,-fx,0,-fz,0x7fd4ff,.35,.9,.45,1.4);}}
  else if(k==='basic'){if(Math.floor(c.t*9)!==c.rk&&u>.15&&u<.8){c.rk=Math.floor(c.t*9);sgRing(x-fx*.5,.8*s,z-fz*.5,-fx,0,-fz,0xffffff,.55,1.25,.4,.8);}}
  else if(k==='little'){if(cx.wings&&cx.wings.visible){const fl=Math.sin(t*26)*.45;cx.wl.rotation.set(0,1.0+fl,.4);cx.wr.rotation.set(0,-1.0-fl,-.4);}}
  for(const kk of['wave','rugO','vort','rose'])if(c[kk]){c[kk].seen=G.frame;if(c[kk].life<=0){c[kk].life=1;c[kk].m.visible=true;}}
}
function sigEnd(p,c){const cx=p.pg&&p.pg.cx;if(cx){if(cx.flames)cx.flames.visible=false;if(cx.beamL)cx.beamL.visible=cx.beamR.visible=false;if(cx.sun3)cx.sun3.visible=false;}
  for(const kk of['wave','rugO','vort','rose'])if(c&&c[kk]){c[kk].life=0;c[kk].m.visible=false;}}
// pre-compile every effect material once after start-up, so the first skill of a match does not stutter while shaders compile
function sigWarm(){
  try{
    if(!renderer||!renderer.compile)return;const M=sgMat(),geo=new T.BoxGeometry(.01,.01,.01),g=new T.Group(),add=m=>g.add(new T.Mesh(geo,m));
    [M.gold,M.goldD,M.ruby,M.saph,M.pearl,M.velvet,M.ermine,M.ice,M.stone,M.leaf].forEach(add);add(sgAdd(0xffffff,1));
    g.add(sgWaveMake());add(new T.MeshStandardMaterial({map:sgTex('carpet'),roughness:.9,metalness:0,polygonOffset:true,polygonOffsetFactor:-4}));
    add(new T.MeshStandardMaterial({map:sgTex('banner'),side:T.DoubleSide,roughness:.75,metalness:0}));
    add(new T.MeshBasicMaterial({map:sgTex('flow'),transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false}));
    add(new T.MeshBasicMaterial({map:sgTex('wing2'),transparent:true,side:T.DoubleSide,depthWrite:false}));
    g.add(new T.Sprite(new T.SpriteMaterial({map:sgTex('rays'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false})));
    g.position.set(0,-40,0);scene.add(g);renderer.compile(scene,camera);scene.remove(g);
  }catch(e){}
}
setTimeout(sigWarm,1200);

/* ================= v27: 💎 Pro Pass — Google Play billing ================= */
// One purchase per pass season (a consumable Play product `pro_pass`, no auto-renewal). Two ways to reach Google Play:
//  · Trusted Web Activity: the Digital Goods API + Payment Request (`https://play.google.com/billing`)
//  · the Android wrapper app: a JS bridge `window.PHBilling` {price(sku)→Promise<{value,currency}|string>, buy(sku)→Promise<{token}>,
//    consume(token)→Promise, list()→Promise<[{sku,token}]>} implemented with Play Billing Library on the native side.
// Anywhere else (a plain browser) the button explains that it can only be bought in the Play Store app — nothing is ever granted without Play.
// A purchase token is granted once (save.pay.tok), then consumed so the pass can be bought again next season; unconsumed purchases are restored at start.
function proFmt(v,cur){try{return new Intl.NumberFormat(I18N.loc||'ko-KR',{style:'currency',currency:cur||PRO.cur,maximumFractionDigits:cur==='KRW'||!cur?0:2}).format(+v);}catch(e){return (+v).toLocaleString()+' '+(cur||PRO.cur);}}
function proPriceTxt(){return (BILL&&BILL.price)||proFmt(PRO.price,PRO.cur);}
async function billInit(){
  BILL.err='';
  try{
    if(window.PHBilling&&typeof window.PHBilling.buy==='function'){BILL.kind='native';
      try{const p=await window.PHBilling.price(PRO.sku);if(p)BILL.price=typeof p==='string'?p:proFmt(p.value,p.currency);}catch(e){}}
    else if('getDigitalGoodsService' in window&&window.PaymentRequest){
      BILL.svc=await window.getDigitalGoodsService('https://play.google.com/billing');BILL.kind=BILL.svc?'play':'none';
      if(BILL.svc){try{const d=await BILL.svc.getDetails([PRO.sku]);if(d&&d[0]&&d[0].price)BILL.price=proFmt(d[0].price.value,d[0].price.currency);}catch(e){}}}
    else BILL.kind='none';
    await proRestore();
  }catch(e){BILL.kind=BILL.kind||'none';BILL.err=String(e&&e.message||e);}
  try{if(G.ui==='sPass')renderPass();passMenu();}catch(e){}
}
async function proList(){
  if(BILL.kind==='native')return ((await window.PHBilling.list())||[]).map(x=>({sku:x.sku,token:x.token}));
  if(BILL.kind==='play')return ((await BILL.svc.listPurchases())||[]).map(x=>({sku:x.itemId,token:x.purchaseToken}));
  return [];
}
async function proConsume(tok){try{if(BILL.kind==='native')await window.PHBilling.consume(tok);else if(BILL.kind==='play')await BILL.svc.consume(tok);}catch(e){}}
// grant the current season's Pro Pass for one purchase token (idempotent)
function proGrant(tok){
  if(!tok||typeof tok!=='string')return false;const PY=save.pay;if(PY.tok.includes(tok))return false;
  passCheck();const P=save.pass;PY.tok.push(tok);if(PY.tok.length>30)PY.tok.splice(0,PY.tok.length-30);
  const was=passProOn();P.pro=P.s;PY.last={s:P.s,t:Date.now()};persist();
  if(!was){SFX.champ();vib([40,40,90]);hypeToast('💎 '+fmtL(__L('{p} 프로 패스를 열었어요!'),{p:passTitle(P.s)}));}
  try{if(G.ui==='sPass')renderPass();passMenu();}catch(e){}
  return true;
}
async function proRestore(){
  if(BILL.kind!=='native'&&BILL.kind!=='play')return 0;let n=0;
  for(const p of await proList())if(p.sku===PRO.sku&&p.token){if(proGrant(p.token))n++;await proConsume(p.token);}
  return n;
}
async function proBuy(){
  passCheck();
  if(passProOn()){flashMsg('💎 '+__L('이번 시즌 프로 패스를 이미 갖고 있어요'));return false;}
  if(BILL.busy)return false;
  if(BILL.kind!=='native'&&BILL.kind!=='play'){flashMsg('💎 '+__L('프로 패스는 Play 스토어 앱에서 살 수 있어요'));return false;}
  BILL.busy=true;try{if(G.ui==='sPass')renderPass();}catch(e){}
  let ok=false;
  try{
    if(BILL.kind==='native'){const r=await window.PHBilling.buy(PRO.sku);if(r&&r.token){ok=proGrant(r.token)||passProOn();await proConsume(r.token);}}
    else{
      const req=new PaymentRequest([{supportedMethods:'https://play.google.com/billing',data:{sku:PRO.sku}}],{total:{label:'Total',amount:{currency:PRO.cur,value:'0'}}});
      const res=await req.show();const tok=res&&res.details&&res.details.purchaseToken;
      if(tok){ok=proGrant(tok)||passProOn();await proConsume(tok);}
      try{await res.complete(ok?'success':'fail');}catch(e){}
    }
  }catch(e){const m=String(e&&e.name||e);if(m==='Pending')flashMsg('💎 '+__L('결제 승인을 기다리고 있어요. 승인되면 프로 패스가 열려요'));else if(!/Abort|cancel/i.test(m))flashMsg('💎 '+__L('결제를 끝내지 못했어요. 잠시 후 다시 해 주세요'));}
  BILL.busy=false;try{if(G.ui==='sPass')renderPass();passMenu();}catch(e){}
  return ok;
}
function proBtnHtml(){
  if(passProOn())return '<span class="ps-gold on pro">💎 '+__L('프로 패스 사용 중')+'</span>';
  const can=BILL.kind==='native'||BILL.kind==='play';
  return (save.pass.gold?'<span class="ps-gold on">👑 '+__L('골드 칸 열림')+'</span>':'')
    +'<button class="btn primary ps-gold ps-pro" id="psBuy"'+(can&&!BILL.busy?'':' aria-disabled="true"')+'>💎 '+fmtL(__L('프로 패스 · {p}'),{p:proPriceTxt()})+(BILL.busy?' …':'')+'</button>';
}
function proNoteHtml(){
  if(passProOn())return '<div class="lbl ps-note">'+fmtL(__L('💎 프로: 👑 골드 칸 전체 + 💎 프로 칸 + 생선 {b}% 더 · {f} 패스 시즌이 끝날 때까지'),{b:Math.round(PRO.bonus*100),f:passTheme(save.pass.s).n})+'</div>';
  const can=BILL.kind==='native'||BILL.kind==='play',l=seasonLeft(save.pass.s);
  return '<div class="lbl ps-note ps-pronote">'+fmtL(__L('💎 프로 패스 {p}: 👑 골드 칸 전체 + 💎 프로 칸(프로 트레일 · 모자 · 포인트) + 생선 {b}% 더 · 지금까지 올라온 단계 보상도 바로 받아요'),{p:proPriceTxt(),b:Math.round(PRO.bonus*100)})
    +'<br>'+fmtL(__L('이번 {f} 패스 시즌에만 유효 (남은 {l}일) · 한 번 결제, 자동 갱신 없음 · 결제는 Google Play로 처리돼요 · 보상을 받은 뒤에는 청약철회가 제한될 수 있고, 환불은 Google Play 환불 정책을 따라요'),{f:passTheme(save.pass.s).n,l})
    +(can?'':'<br><b>'+__L('Play 스토어 앱에서만 살 수 있어요 (이 브라우저에서는 결제할 수 없어요)')+'</b>')+'</div>';
}
setTimeout(()=>{billInit();},0);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&(BILL.kind==='native'||BILL.kind==='play'))proRestore().catch(()=>{});});

/* ================= v28: Android app shell (Play Store build) ================= */
// The Android app (android/) loads this file from its assets and injects `window.PHAndroid` — a WebView web-message
// listener (androidx.webkit addWebMessageListener, allowed only for the app's own origin). Messages are JSON:
//   game → app  {id,op,arg}            op: price · buy · consume · list (Google Play Billing), vib, save, exit
//   app → game  {id,ok,data|err,name}  replies;  {ev:'purchase'} when Play reports a purchase while the game runs
// From that the game builds `window.PHBilling` (the contract v27 already uses), so the Pro Pass works in the app.
// The app also calls phBack() for the Android back button, phPause()/phResume() when it goes to the background.
// In a plain browser PHAndroid does not exist and nothing here changes how the game runs.
const APP={on:false,seq:0,cb:{},backT:0,mirT:0};
function appPost(o){try{window.PHAndroid.postMessage(JSON.stringify(o));return true;}catch(e){return false;}}
function appCall(op,arg){
  return new Promise((res,rej)=>{const id=++APP.seq;APP.cb[id]={res,rej};
    if(!appPost({id,op,arg})){delete APP.cb[id];rej(new Error('bridge'));}});
}
function appMsg(raw){
  let m;try{m=JSON.parse(typeof raw==='string'?raw:raw&&raw.data);}catch(e){return;}
  if(!m)return;
  if(m.ev==='purchase'){try{proRestore().catch(()=>{});}catch(e){}return;}
  const c=APP.cb[m.id];if(!c)return;delete APP.cb[m.id];
  if(m.ok)c.res(m.data);else{const er=new Error(m.err||'error');er.name=m.name||'Error';c.rej(er);}
}
// the save is mirrored to the app's own storage (Android Auto Backup keeps it across reinstall / new phone)
function appMirror(now){
  if(!APP.on)return;const t=Date.now();
  if(!now&&t-APP.mirT<4000){clearTimeout(appMirror.t);appMirror.t=setTimeout(()=>appMirror(true),4000-(t-APP.mirT));return;}
  APP.mirT=t;clearTimeout(appMirror.t);
  try{appPost({op:'save',arg:{save:localStorage.getItem('penguinHockey.v1')||'',lang:localStorage.getItem('penguinHockey.lang')||''}});}catch(e){}
}
function appInit(){
  const P=window.PHAndroid;if(!P||typeof P.postMessage!=='function')return false;
  APP.on=true;
  if('onmessage' in P||!P.addEventListener)P.onmessage=appMsg;else P.addEventListener('message',appMsg);
  window.PHBilling={price:sku=>appCall('price',sku),buy:sku=>appCall('buy',sku),consume:tok=>appCall('consume',tok),list:()=>appCall('list')};
  try{Object.defineProperty(navigator,'vibrate',{configurable:true,value:p=>{appPost({op:'vib',arg:Array.isArray(p)?p.map(x=>Math.max(0,Math.min(1000,x|0))):[Math.max(0,Math.min(1000,p|0))]});return true;}});}catch(e){}
  try{document.documentElement.classList.add('in-app');}catch(e){}
  window.__phMirror=()=>appMirror(false);
  return true;
}
// ---- Android back button: close the top overlay → leave the screen → pause the match; on the home screen a second press within 2 s exits ----
function appVis(e){if(!e)return false;const cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&e.getClientRects().length>0;}   // not opacity: dialogs fade in
const APP_OV=['#cfmDlg','#cardDlg','#enhFx','#packFx','#fuseFx','#devFx','#tutAsk','#vsFx'];
const APP_OVBTN=['[data-cf="0"]','[data-ef="close"]','.cd-x','#pkOk','#fzOk','#devOk','#tutNo','#pkSkip','#fzSkip'];
function appOverlay(){
  for(const id of APP_OV){const e=document.querySelector(id);if(e&&e.classList.contains('on')&&appVis(e))return e;}
  return null;
}
function phBack(){
  try{
    const ov=appOverlay();
    if(ov){for(const s of APP_OVBTN){const b=ov.querySelector(s);if(b&&appVis(b)&&!b.disabled){b.click();return 'ok';}}return 'ok';}   // mid-animation: swallow
    if(G.cine){cineSkip();return 'ok';}
    if(G.view==='game'&&G.state!=='over'){
      togglePause();return 'ok';   // playing → pause menu; pause menu → back to the match
    }
    const ui=G.ui;
    if(ui==='sResult'){SFX.ui();toMenu();return 'ok';}
    if(ui==='sTour'){const b=$('#tBack');if(b){b.click();return 'ok';}}
    if(ui&&ui!=='sMenu'){
      const sc=document.getElementById(ui),bs=sc?[...sc.querySelectorAll('button[data-go]')].filter(appVis):[];
      const b=bs[bs.length-1];
      if(b){b.click();return 'ok';}
      SFX.ui();goScreen('sMenu');return 'ok';
    }
    const now=Date.now();
    if(now-APP.backT<2000){APP.backT=0;appMirror(true);return 'exit';}
    APP.backT=now;flashMsg(__L(__L('한 번 더 누르면 게임을 끝내요')));return 'ok';
  }catch(e){return 'ok';}
}
function phPause(){
  try{if(G.view==='game'&&!G.paused&&G.state!=='over')togglePause();}catch(e){}
  try{SFX.suspend();}catch(e){}
  appMirror(true);
}
function phResume(){
  try{SFX.resume();}catch(e){}
  try{if(BILL.kind==='native')proRestore().catch(()=>{});}catch(e){}
}
window.phBack=phBack;window.phPause=phPause;window.phResume=phResume;   // the app calls these by name (evaluateJavascript)
appInit();

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

/* ================= v30: landscape tablets — the match camera pulls back on squarer landscape screens ================= */
// The match camera's distance did not depend on the screen shape in landscape, so on a 4:3 tablet held sideways
// (aspect 1.33) it showed much less of the rink side to side than on a PC (1.6) or a phone (2.2): big penguins, little ice.
// Between aspect 1.0 and 1.6 it now backs off by up to 15 % (most at 1.3, a tent so 1.0 and 1.6 stay as they were).
function landZoom(asp){
  if(asp<1||asp>=1.6)return 1;
  return 1+.15*Math.max(0,1-Math.abs(asp-1.3)/.3);
}

/* ================= INIT ================= */
SFX.setOn(save.set.sound);$('#bSound').textContent=save.set.sound?'🔊':'🔇';applyFxSettings();uiPanels();
applyQuality();
enterDemo();setTOD(.1,10);updateEnv(true);tutMaybeAsk();
document.body.classList.add('menuish');$('#ptsN').textContent=save.points;
window.__PH={trialOppNames,doPull,pullOnce,landZoom,shFit,shState,shMapSize,pkHi,pkS,APP,appInit,appMsg,appCall,phBack,phPause,phResume,appOverlay,PRO,BILL,billInit,proBuy,proGrant,proRestore,proBtnHtml,proNoteHtml,proPriceTxt,proFmt,passProOn,passGoldOn,passGain,passReward,input,SIGCAM,SG,sgP,sigFrame,sigProps,sigEnd,sgWorld,sgWaveSet,waveProfile,CINE,cineMode,cineOk,cineStart,cineStep,cineSkip,cineCastU,cineEnd,cineClear,cineCam,cineCamBlend,cineAngle,cineShots,cineInside,cineWorld,PASS,passLoad,passTheme,passName,passTier,passCan,passCount,passGrant,passClaim,passClaimAll,passCheck,passAdd,passMatch,passRowHtml,rulesRowHtml,passBuy,renderPass,passMenu,howV24,claimGoal,renderGoals,goalsEnsure,showResultScreen,hypeMenuRefresh,goScreen,seasonNow,TRAILS,CAST,castShout,castStart,castFlip,castPost,castFrame,castProps,cxS,cxD,setHuman,autoSwitch,teamRoles,aiFormation,bestMate,RULE,RULE_K,rulesMode,rulesOn,rulesActive,penSecs,penFor,boxMax,onIce,shortH,rulesReset,boxSend,boxRelease,boxPlace,foulKind,breakaway,rulesFoul,rulesContact,stopPlay,rulesResume,foSetup,psStart,psFrame,psEnd,rulesScored,rulesSim,rulesAI,rulesMateOk,rulesIcingRisk,rulesSlideOk,rulesPathClear,rulesHud,rulesCall,refFrame,refSig,howV22,v22Frame,playing,checkGoal,bumpFx,ram18,useSpecial,resetPositions,endMatch,scored,RAR,rarCls,tierTypes,typeRate,typeShare,grantTier,grantCard,rarLoad,MK_BUY,MK_SELL,MK_GW,ENH_CARD_BONUS,BRK,epicChance,gradeProbs,gachaEff,pickType,gfxRender,gfxTier,gfxApply,gfxStepDown,GFX,RFL,PP,CSH,GLOW_L,iceMat,updateCamera,perfSample,perf,applyQuality,SPX,NEW18,spec18,spDesc,PFACT,ai18,keen18,royal18,tick18,sim18,dbl18,ram18,hopY18,pengSVG18,pkCrest18,pkW18,pkC18,decals18,sil18,news18Popup,news18Html,news18Soon,oppMix18,demo18,chip18,spLine18,fact18,PREF,SPECIALS,SPEC,STATK,TYPE_W,SEASON,seasonLoad,seasonBadge,seasonNow,seasonLeft,seasonDate,seasonSoft,seasonCheck,seasonAdd,seasonRulesTxt,seasonBoxHtml,seasonMiniHtml,seasonNote,seasonPopup,seasonRewTxt,COND,COND_W,COND_BONUS,CF,CF0,CV,condAllowed,condRoll,condPick,condStart,condClear,condBonus,condBonusRow,condIntroHtml,condFrame,PC,pcBonus,pcOn,pcReady,pcGiveGo,pcPass,pcShotMul,pcReset,pcBreak,pcPopText,howV17,fmtL,movePeng,puckStep,aiCarrier,aiGoalie,showTourIntro,showResultScreen,renderSettings,SETDEF,todTarget,setTOD,v17Frame,passDone,toMenu,enterDemo,doEnhance,doFuse,enhRate,cardTotal,applyLevel,renderScout,TYPES,renderSqStyle,sqBuy,devCheck,devReveal,aukSVG,TIER_IC,NATIONS,useSpecial,rankedStart,rankedDiff,trialStart,trialPlay,trialAfterMatch,trialLock,trialLeft,trialDayRefresh,TRIALS,titleText,renderRanked,goRanked,mgrRivals,mkGen,mkBuy,mkSell,mkRefresh,mkSellPrice,mkKey,MK_BUY,MK_SELL,MK_TMUL,MK_SLOT,clubValue,clubTable,penguinValue,mgrTable,mgrApply,mgrMatchEnd,mgrReset,mgrFrame,oppRating,tierOf,TIERS,isRated,renderMarket,renderProfile,leagueMenuRefresh,escH,cleanName,TUT,TUT_STEPS,tutStart,tutEvent,tutFrame,tutMaybeAsk,hypeNew,cbAdd,hypeGoal,classifyGoal,mxInfo,grantXp,goalsEnsure,gp,claimGoal,claimLong,GDEFS,LDEFS,TRAITS,recUpdate,hypeMatchEnd,renderGoals,hypeFrame,hypeReset,rollGrade,playPackOpen,playFuseFx,renderSquad,computeChem,applyChem,teamOvr,cardOvr,cardHtml,SYN,autoFuseSel,squadTypes,sqAuto,sqAssign,PULL_ODDS,PITY_AT,FUSE_DEF,ENH_RATE,GRADES,G,step,input,startMatch,launch,setupMatch,TOUR,CHALLENGES,save,frame:step,HM_IC,hypeMenuRefresh,leagueMenuRefresh,RK,RK_MATS,RK_AD,RK_BAY,rinkLoop,uiPanels,uiTidy,applyQuality,iceMat,rinkPath,rinkRuns,lamps,renderer,buildPenguin,pkNum,setTOD,PK_MAT,pkGeoC,crowdBodyGeo,buildPenguinV9,animatePenguin,makePeng,TEAM,sun,hemi,GACHA,BRK,ENH_PITY,epicChance,gradeProbs,gachaEff,pickupNow,pickupRate,pickType,rollGrade,grantCard,brkPlan,brkAvail,doBreak,askBreak,openCard,scPullHtml,scEnhHtml,scDexHtml,statVal,cardOvr,oddsBox,playEnhFx,lackMsg,hypeMenuRefresh,achCheck,buyConfirm,sqBuy,persist,ACH,achHtml,statGrid,realMatch,trailCol,autoSwitch,carryStep,carryRelease,bigHit,CARRY,evStart,evFrame,eventsOn,EVENTS,spawnItem,applyItem,itemFrame,itemsOn,feverStart,soStart,soResult,soFrame,soAllowed,funReset,ITEMS,redeemCode,buildPenguin,scene,camera,pengSVG,simulate,resetPositions,checkGoal,aiShoot,FIXED,DIFF,gkRead,challengeDone,TT,arenaPick,ARENAS,passLost,touchPuck,pengCollisions,doDash,humanControl,shakeK,togglePause,aiIntercept,updateObjective,buildChal,chalMeta,performShot,doPass,useSpecial,knock,swapNearest,endMatch,scored};
requestAnimationFrame(frame);
}
__loadThree(function(ok){
  if(ok){__bootGame();}
  else{document.getElementById('fbMsg').textContent=__L('3D 라이브러리(Three.js)를 불러오지 못했어요. 인터넷 연결을 확인한 뒤 다시 불러와 주세요.');document.getElementById('fallback').style.display='flex';}
});
