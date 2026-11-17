// v48 ice slipperiness (owner, 2026-11-17: "too slippery — lower it a little, just enough to feel, and make it a setting")
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save}=PH;const cp=require('child_process');
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
save.set.rules='off';save.set.items=false;save.set.events=false;save.set.cond=false;
const ICE=PH.ICE,L=[1,2,3,4,5];
// ---------- the steps ----------
ok(ICE.lv.length===6&&L.every(i=>['grip','stop','brk'].every(k=>ICE.lv[i][k]>0)),'five steps, each with grip / stopping / braking factors');
ok(ICE.lv[4].grip===1&&ICE.lv[4].stop===1&&ICE.lv[4].brk===1&&ICE.old===4,'step 4 is exactly the ice of v1.6.4 and earlier');
ok(ICE.def===3&&save.set.ice===3&&PH.iceLv()===3,'the standard is step 3 and a new save starts on it (the 설정 text says “친구 대전은 … 3단계”, ICE.def = '+ICE.def+')');
ok([1,2,3,4].every(i=>['grip','stop','brk'].every(k=>ICE.lv[i][k]>ICE.lv[i+1][k])),'each step up is more slippery in every factor');
ok(ICE.lv[3].grip>1.1&&ICE.lv[3].grip<1.4&&ICE.lv[3].stop>1.1&&ICE.lv[3].stop<1.4,'the new standard is only a little grippier than before (grip ×'+ICE.lv[3].grip+', stopping ×'+ICE.lv[3].stop+', braking ×'+ICE.lv[3].brk+')');
ok(L.every(i=>typeof PH.iceName(i)==='string'&&PH.iceName(i).length>0)&&new Set(L.map(PH.iceName)).size===5,'every step has its own name ('+L.map(i=>i+' '+PH.iceName(i)).join(' / ')+')');
// ---------- where it acts ----------
{const mp=PH.movePeng.toString(),gk=mp.slice(mp.indexOf('p.goalie'),mp.indexOf('}else{',mp.indexOf('p.goalie')));
 ok(/IK=iceK\(\)/.test(mp)&&/CF\.brk\*IK\.brk/.test(mp)&&(mp.match(/IK\.stop/g)||[]).length===2&&(mp.match(/IK\.grip/g)||[]).length===2,'skating reads the ice: sideways grip, stopping after letting go (both terms) and braking against the motion');
 ok(!/IK\./.test(gk),'goalies are not changed');
 ok(/iceK\(\)\.grip/.test(PH.ctlCarve.toString()),'the easy-handling carve follows the ice grip too');}
// ---------- what it feels like (a human with easy handling = the default, and an AI skater) ----------
PH.startMatch({mode:'quick',size:3,time:60,diff:'normal',oppTypes:['basic','fast','king'],tag:'q',oppName:'R',label:'R'});
const h=1/120;let Z=0;
const hu=G.pengs.find(p=>p.human&&!p.goalie),ai=G.pengs.find(p=>!p.human&&!p.goalie);
function step(p,ix,iz){p.ix=ix;p.iz=iz;p.x=0;p.z=0;PH.movePeng(p,h);Z+=p.z;}
function top(p){p.fall=0;p.slow=0;p.boostT=0;p.dashT=0;p.slideT=0;p.rushT=0;p.shadowT=0;p.heading=0;p.vx=0;p.vz=0;if(G.carry===p)G.carry=null;for(let t=0;t<3;t+=h)step(p,0,1);Z=0;return Math.hypot(p.vx,p.vz);}
function feel(p){const o={top:top(p)};let t=0;while(Math.hypot(p.vx,p.vz)>.5&&t<20){step(p,0,0);t+=h;}o.stop=Z;o.stopT=t;
  top(p);let zm=0;for(t=0;t<3;t+=h){step(p,1,0);zm=Math.max(zm,Z);}o.turn=zm;top(p);zm=0;for(t=0;t<3;t+=h){step(p,0,-1);zm=Math.max(zm,Z);}o.rev=zm;return o;}
const F={},FA={};for(const i of L){save.set.ice=i;F[i]=feel(hu);FA[i]=feel(ai);}save.set.ice=3;
const f2=x=>x.toFixed(2);
console.log('  human (easy handling): '+L.map(i=>i+': stop '+f2(F[i].stop)+' m / '+f2(F[i].stopT)+' s, turn drift '+f2(F[i].turn)+' m, reverse '+f2(F[i].rev)+' m').join(' | '));
console.log('  AI: '+L.map(i=>i+': stop '+f2(FA[i].stop)+' m, turn drift '+f2(FA[i].turn)+' m').join(' | '));
ok([1,2,3,4].every(i=>F[i].stop<F[i+1].stop&&F[i].turn<F[i+1].turn&&F[i].rev<F[i+1].rev),'every step up glides further, drifts wider in a turn and takes longer to reverse');
const d34=1-F[3].stop/F[4].stop,t34=1-F[3].turn/F[4].turn,r34=1-F[3].rev/F[4].rev;
ok(d34>.1&&d34<.25&&t34>.07&&t34<.25&&r34>.07&&r34<.25,'standard vs the old ice: noticeable but small — stopping '+Math.round(d34*100)+' % shorter, turn drift '+Math.round(t34*100)+' %, reversing '+Math.round(r34*100)+' % shorter');
ok(L.every(i=>Math.abs(F[i].top/F[4].top-1)<.005)&&L.every(i=>Math.abs(FA[i].top/FA[4].top-1)<.005),'top speed stays the same on every step ('+f2(F[4].top)+' m/s)');
ok(FA[3].stop<FA[4].stop&&FA[3].turn<FA[4].turn,'the AI skates on the same ice (it is the rink, not a handicap)');
// ---------- online: the standard for both players ----------
save.set.ice=5;G.net='host';const on=PH.iceLv(),kOn=PH.iceK();G.net='guest';const on2=PH.iceLv();G.net='';const off=PH.iceLv();save.set.ice=3;
ok(on===3&&on2===3&&kOn===ICE.lv[3]&&off===5,'online friend matches skate on step 3 whatever each player set (offline it was '+off+')');
// ---------- save ----------
const load=s=>+cp.execFileSync(process.execPath,['-e',"const P=require('./harness.js');process.stdout.write(String(P.save.set.ice));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(s)}),encoding:'utf8',stdio:['ignore','pipe','ignore']});
const base={v:10,tut:{done:true,asked:true}};
const r=[load(Object.assign({set:{ice:2}},base)),load(Object.assign({set:{ice:5}},base)),load(Object.assign({set:{ice:9}},base)),load(Object.assign({set:{ice:'2'}},base)),load(Object.assign({set:{ice:2.5}},base)),load(Object.assign({set:{sound:false}},base))];
ok(r[0]===2&&r[1]===5,'a saved step loads back ('+r[0]+', '+r[1]+')');
ok(r[2]===3&&r[3]===3&&r[4]===3&&r[5]===3,'a broken value or an old save without the field gets the standard step 3 ('+r.slice(2).join(', ')+')');
ok(errs.length===0,'no errors '+errs.slice(0,3).join(' | '));
console.log('TOTAL v48test: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
