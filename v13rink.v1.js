const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,save,step,startMatch}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};
const W=24,D=13,CR=5,GW=2.8;
// board path follows the rink exactly
{const rp=PH.rinkPath(),exp=2*2*(W-CR)+2*2*(D-CR)+4*CR*Math.PI/2;ok(Math.abs(rp.total-exp)<1e-9,'board path length matches the rink outline ('+rp.total.toFixed(2)+' m)');
 let onEdge=true;for(let s=0;s<rp.total;s+=.37){const p=rp.at(s),ax=Math.abs(p.x),az=Math.abs(p.z);
   const inCorner=ax>W-CR&&az>D-CR,d=inCorner?Math.hypot(ax-(W-CR),az-(D-CR))-CR:Math.max(ax-W,az-D);if(Math.abs(d)>1e-6&&!(Math.abs(ax-W)<1e-6||Math.abs(az-D)<1e-6))onEdge=false;}
 ok(onEdge,'every path sample lies on the rink edge');}
{const runs=PH.rinkRuns(.25),all=runs.flat();
 ok(runs.length===2,'boards split into 2 runs around the two goal mouths');
 ok(!all.some(p=>Math.abs(p.x)>W-.01&&Math.abs(p.z)<GW+.1),'no board in front of either goal mouth');
 ok(all.length>500,'boards sampled every 25 cm ('+all.length+' points)');}
// decor exists
ok(PH.RK&&PH.RK.crest&&PH.RK.goalLights.length===2&&PH.RK.sb&&PH.RK.bulbs.length===2&&PH.RK.flags.length===8,'crest, goal lights, scoreboard, festoon and flags built');
ok(PH.lamps.length===4&&PH.lamps.every(l=>l.pl&&l.glow&&l.bulb&&l.cone),'4 floodlight towers keep the lamp contract (+ beams)');
// goal light: only the net that was scored on lights up
startMatch({mode:'quick',size:2,time:120,diff:'normal'});run(3.6);
{G.state='goal';G.scoredBy=G.teams.blue;G.stateT=5;run(.05);ok(PH.RK.goalSide===1,'blue goal lights the lamp behind the +x net');
 G.scoredBy=G.teams.red;run(.05);ok(PH.RK.goalSide===-1,'red goal lights the -x net');
 G.state='play';G.scoredBy=null;run(.05);ok(PH.RK.goalSide===0,'lights go off when play resumes');}
// scoreboard follows the score / clock, theme key follows the arena
{G.teams.blue.score=3;G.teams.red.score=1;run(.4);ok(/^true\|3\|1\|/.test(PH.RK.sbKey),'scoreboard shows the live score ('+PH.RK.sbKey+')');}
save.cleared.tour=true;for(const a of['aurora','final']){save.set.arena=a;startMatch({mode:'quick',size:1,time:60,diff:'easy'});run(.3);ok(PH.RK.key===a,'board trim switches to the '+a+' theme');}
save.set.arena='auto';
// graphics toggle (높음/절약) applies to the rink live: flags hide/show without a reload
{save.set.quality='low';PH.applyQuality();run(.1);ok(PH.RK.flagLo===true,'절약 mode hides the team flags immediately');
 save.set.quality='high';PH.applyQuality();run(.1);ok(PH.RK.flagLo===false,'높음 mode brings them back');}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
