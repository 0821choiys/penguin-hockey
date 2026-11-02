const {execFileSync}=require('child_process');
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const probe=(save,expr)=>JSON.parse(execFileSync('node',['-e',`const PH=require('./harness.js');const s=PH.save;console.log(JSON.stringify(${expr}));process.exit(0);`],{env:Object.assign({},process.env,{SAVE:typeof save==='string'?save:JSON.stringify(save)}),cwd:__dirname}).toString().trim().split('\n').pop());
// old v10 save without any v11 fields
const v10={v:10,points:900,types:['basic','fast'],type:'fast',lv:{fast:5},cards:{fast:[2,1,0,0]},scout:{pulls:12,pity:7,freeDay:'',fail:{fast:3}}};
const a=probe(v10,"{brk:s.brk,brkPts:s.brkPts,hist:s.scout.hist,pm:s.scout.pickMiss,elog:s.scout.elog,pity:s.scout.pity,fail:s.scout.fail.fast,lv:s.lv.fast,cards:s.cards.fast,fx:s.set.fastFx,pts:s.points}");
ok(Object.keys(a.brk).length===0&&a.hist.length===0&&a.pm===false&&a.elog.length===0&&a.fx===false,'old save loads with empty breakthrough / history and default settings');
ok(a.pity===7&&a.fail===3&&a.lv===5&&a.cards.join()==='2,1,0,0','pity, fail counter, level and cards kept');
// v11 save round trip
const v11=Object.assign({},v10,{brk:{fast:3,basic:1},brkPts:{fast:2},scout:{pulls:40,pity:12,freeDay:'',fail:{fast:5},hist:[['fast',2,1],['basic',0,0]],pickMiss:true,elog:[['fast',4,1,0],['fast',4,2,0]]},set:{fastFx:true}});
const b=probe(v11,"{brk:s.brk,brkPts:s.brkPts.fast,hist:s.scout.hist,pm:s.scout.pickMiss,elog:s.scout.elog,fail:s.scout.fail.fast,fx:s.set.fastFx}");
ok(b.brk.fast===3&&b.brk.basic===1&&b.brkPts===2&&b.hist.length===2&&b.pm===true&&b.elog.length===2&&b.fail===5&&b.fx===true,'breakthrough, history, pickup guarantee, log and fast-FX setting round-trip');
// corrupted values
const bad=Object.assign({},v10,{brk:{fast:99,basic:-4,auk:'x'},brkPts:{fast:1e9},scout:{pulls:1,pity:999,fail:{fast:77},hist:[['nope',1,0],['fast',9,1],'x',['auk',3,1],['fast',1,1]],pickMiss:'yes',elog:'bad'}});
const c=probe(bad,"{brk:s.brk,bp:s.brkPts.fast,hist:s.scout.hist,pm:s.scout.pickMiss,elog:s.scout.elog,pity:s.scout.pity,fail:s.scout.fail.fast}");
ok(c.brk.fast===5&&c.brk.basic===0&&c.bp===99&&c.hist.length===1&&c.hist[0][0]==='fast'&&c.pm===false&&Array.isArray(c.elog)&&c.pity===29&&c.fail===5,'corrupted v11 fields are clamped / dropped without a crash '+JSON.stringify(c).slice(0,140));
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
