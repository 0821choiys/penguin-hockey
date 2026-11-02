// run: node v10mig.js  (spawns the harness with different stored saves)
const {execFileSync}=require('child_process');
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const probe=(save,expr)=>JSON.parse(execFileSync('node',['-e',`const PH=require('./harness.js');const s=PH.save;console.log(JSON.stringify(${expr}));process.exit(0);`],{env:Object.assign({},process.env,{SAVE:typeof save==='string'?save:JSON.stringify(save)}),cwd:__dirname}).toString().trim().split('\n').pop());
// a realistic v9 save
const v9={v:9,points:1234,types:['basic','fast','strong','auk'],type:'fast',hat:'crown',hats:['none','beanie','crown'],trail:'gold',trails:['ice','gold'],team:'red',cleared:{c1:true,tour:true},
  set:{size:2,time:120,diff:'hard',tod:'night',aurora:false,sound:false,quality:'low',assist:false},stats:{played:40,wins:22,goals:90,tourClears:2},
  cards:{basic:[3,1,0,0],fast:[2,0,1,0],strong:[0,0,0,1],defense:[0,0,0,0],balanced:[0,0,0,0],auk:[0,0,0,0]},lv:{basic:2,fast:6,strong:3},scout:{pulls:55,pity:12,freeDay:'2026-10-22',fail:{fast:2}},
  squad:['strong','basic',null],xp:{fast:400},mgr:{r:1520,games:30,w:18,d:2,l:10,best:1600,form:['W','L'],hist:[],pending:null},dev:{got:true,ts:5},
  trial:{day:3,ts:9,used:{city:1,nat:0,world:0},run:null,titles:{city:1,nat:1,world:0},first:{city:true,nat:true,world:false},cityName:'부산'},profile:{name:'감독님',club:'얼음 FC',emb:'🐧',city:'부산',since:1,seed:42}};
const r=probe(v9,"{v:s.v,points:s.points,types:s.types,type:s.type,hat:s.hat,trail:s.trail,team:s.team,cleared:s.cleared,set:s.set,cards:s.cards.fast,lv:s.lv.fast,pity:s.scout.pity,mgr:s.mgr.r,dev:s.dev.got,titles:s.trial.titles,name:s.profile.name,chal:s.chalTypes,cum:s.cum.oneTimer,ap:PH.ACH.filter(a=>s.ach[a.id]).reduce((t,a)=>t+a.pts,0),ach:Object.keys(s.ach)}");
ok(r.v===10,'v9 save migrates to v10');
ok(r.ach.includes('a_tour')&&r.ap>0,'existing progress earns its achievements once on first load (+'+r.ap+'P: '+r.ach.join(',')+')');
ok(r.points-r.ap===1234&&r.types.join()==='basic,fast,strong,auk'&&r.type==='fast'&&r.hat==='crown'&&r.trail==='gold'&&r.team==='red','points, penguins, captain, cosmetics, team kept');
ok(r.cleared.c1&&r.cleared.tour,'cleared challenges / tournament kept');
ok(r.set.size===2&&r.set.diff==='hard'&&r.set.tod==='night'&&r.set.aurora===false&&r.set.sound===false&&r.set.quality==='low'&&r.set.assist===false,'old settings kept');
ok(r.set.arena==='auto'&&r.set.vol==='mid'&&r.set.vib===true&&r.set.shake==='on'&&r.set.flash===true&&r.set.motion===false,'new settings get safe defaults');
ok(r.cards.join()==='2,0,1,0'&&r.lv===6&&r.pity===12&&r.mgr===1520&&r.dev===true&&r.titles.city===1&&r.name==='감독님','cards, levels, pity, rating, titles, profile kept');
ok(Array.isArray(r.chal)&&r.chal.length===0&&r.cum===0,'new mission progress / counters start empty');
// v10 save with new fields round-trips; junk values are rejected
const v10=Object.assign({},v9,{v:10,chalTypes:['fast','basic','fast','nope'],set:Object.assign({},v9.set,{arena:'sunset',vol:'low',vib:false,shake:'low',flash:false,motion:true})});
const r2=probe(v10,"{set:s.set,chal:s.chalTypes}");
ok(r2.set.arena==='sunset'&&r2.set.vol==='low'&&r2.set.vib===false&&r2.set.shake==='low'&&r2.set.flash===false&&r2.set.motion===true,'v10 settings round-trip');
ok(r2.chal.join()==='fast,basic','mission progress de-duplicated, unknown penguins dropped');
const bad=Object.assign({},v10,{set:{arena:'moon',vol:9,vib:'yes',shake:'max',flash:1,motion:'x'},chalTypes:'oops',points:-50});
const r3=probe(bad,"{set:s.set,chal:s.chalTypes,points:s.points,ap:PH.ACH.filter(a=>s.ach[a.id]).reduce((t,a)=>t+a.pts,0)}");
ok(r3.set.arena==='auto'&&r3.set.vol==='mid'&&r3.set.vib===true&&r3.set.shake==='on'&&r3.set.flash===true&&r3.set.motion===false&&r3.chal.length===0&&r3.points-r3.ap===0,'corrupted values fall back to defaults (no crash)');
const r4=probe('{not json',"{v:s.v,points:s.points}");ok(r4.v===10&&r4.points===100,'unreadable save -> fresh defaults, no crash');
const r5=probe(Object.assign({},v9,{v:10,dev:{got:false},codes:['ysgames777','x']}),"{has:s.types.includes('auk'),codes:s.codes}");ok(r5.has&&r5.codes.join()==='ysgames777','code-redeemed 큰바다쇠오리 survives reload (without 개발자 tier)');
const r6=probe(Object.assign({},v9,{v:10,dev:{got:false},codes:[]}),"s.types.includes('auk')");ok(r6===false,'큰바다쇠오리 without tier or code is still removed');
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
