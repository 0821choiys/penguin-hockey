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
{const runs=PH.rinkRuns(.25),loop=runs[0],GD=2.4;
 ok(runs.length===1&&Math.hypot(loop[0].x-loop[loop.length-1].x,loop[0].z-loop[loop.length-1].z)<1e-6,'boards form one closed loop (no loose board ends)');
 ok(!loop.some(p=>Math.abs(p.x)>W-.01&&Math.abs(p.x)<W+GD+.1&&Math.abs(p.z)<GW+.05),'no board inside either goal (mouth and net stay clear)');
 const bay=loop.filter(p=>p.bay);ok(bay.some(p=>p.x>W+GD+.1)&&bay.some(p=>p.x<-W-GD-.1)&&bay.every(p=>Math.abs(p.z)>=GW+.15||Math.abs(p.x)>=W+GD+.2),'a board bay wraps around each net (sides outside the posts, back behind the net)');
 ok(loop.length>500,'boards sampled every 25 cm ('+loop.length+' points)');
 let fold=0;for(let i=1;i<loop.length;i++){const a=loop[i-1],b=loop[i];if(Math.hypot(a.x-b.x,a.z-b.z)<1e-6)continue;for(const o of[.585,.56,.09]){const ax=a.x+a.mx*o,az=a.z+a.mz*o,bx=b.x+b.mx*o,bz=b.z+b.mz*o;if((bx-ax)*(b.x-a.x)+(bz-az)*(b.z-a.z)<0)fold++;}}
 ok(fold===0,'thick board profile never folds back at the bay corners ('+fold+')');
 const ad=PH.RK_AD;ok(ad.length===2&&ad.every(r=>r.n%2===1&&Math.abs(r.n*r.Lad-(r.sb-r.sa))<1e-6&&r.Lad>3.5&&r.Lad<5),'sponsor panels fit each run exactly (odd count, none cut at a bay): '+ad.map(r=>r.n+' x '+r.Lad.toFixed(2)+' m').join(', '));}
// decor exists
ok(PH.RK&&PH.RK.crest&&PH.RK.goalLights.length===2&&PH.RK.sb&&PH.RK.bulbs.length===1&&PH.RK.flags.length===4,'crest, goal lights, scoreboard, far string lights and far flags built');
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
