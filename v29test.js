// v29: the referee no longer spins (turning speed, direction reversals, faces the play), smoother penguins on 최고 (segment counts)
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,step,startMatch,save}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const ang=d=>Math.atan2(Math.sin(d),Math.cos(d));
// ---- referee: an AI-vs-AI match with the rules on ----
save.set.rules='full';save.rl.intro=1;
startMatch({mode:'quick',size:3,time:90,diff:'normal',tag:'q',oppTypes:['basic','fast','strong']});
let turn=0,secs=0,rev=0,last=0,maxStep=0,face=0,faceN=0,flip=0,prevSide=null,prevH=null,hum=0;
for(let i=0;i<60*150;i++){
  if(G.player&&!G.ps)PH.setHuman(null);
  step(1/60);if(G.state==='play'&&G.player&&!G.ps)hum++;
  const r=G.ref;if(!r||r.dead)continue;if(G.state==='over')break;
  if(prevH!==null){const d=ang(r.h-prevH);turn+=Math.abs(d);secs+=1/60;maxStep=Math.max(maxStep,Math.abs(d));
    if(Math.abs(d)>.004){const s=Math.sign(d);if(last&&s!==last)rev++;last=s;}}
  if(G.state==='play'&&!(r.run>.5)){const pk=G.puck,to=Math.atan2(pk.rx-r.x,pk.rz-r.z);face+=Math.abs(ang(to-r.h));faceN++;}
  if(r.side&&prevSide&&r.side!==prevSide)flip++;if(r.side)prevSide=r.side;
  prevH=r.h;
}
ok(secs>60,'referee on the ice for '+secs.toFixed(0)+' s');
ok(hum===0,'really AI vs AI: no human steering during play ('+hum+' frames)');   // before v38 auto switching handed the blue carrier to a zero-input "human" in 43 % of play frames
const dps=turn/secs*180/Math.PI;
ok(dps<60,'referee turns '+dps.toFixed(1)+'°/s on average (was ≈930°/s: he spun)');
ok(maxStep*60*180/Math.PI<=375,'never faster than ~370°/s ('+(maxStep*60*180/Math.PI).toFixed(0)+'°/s max)');
// limit 70/min (v38): the old 40/min was measured while the blue carrier stood still (see above); with real AI-vs-AI play the
// referee follows the puck back and forth 35–50×/min (8 runs, 2026-11-09). The jitter this guards against was ≈2,200×/min.
ok(rev/secs*60<70,'turning direction changes '+(rev/secs*60).toFixed(1)+'×/min (was ≈2,200×/min: jitter)');
ok(face/faceN<.6,'while play is on he watches the puck (mean error '+(face/faceN*180/Math.PI).toFixed(0)+'°)');
ok(flip/secs*60<12,'switches sides of the puck '+(flip/secs*60).toFixed(1)+'×/min (only once the puck is clearly over, 2.5 m)');
// ---- smoother penguins on 최고 ----
save.set.quality='high';ok(PH.pkHi()===false&&PH.pkS(44)===44,'높음 keeps the current segment counts');
save.set.quality='ultra';ok(PH.pkHi()===true&&PH.pkS(44)===70&&PH.pkS(5)===8,'최고: about 1.6× the segments (44→'+PH.pkS(44)+', 5→'+PH.pkS(5)+')');
save.set.quality='low';ok(PH.pkS(28)===28,'절전 unchanged');
save.set.quality='ultra';
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
