const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,step,startMatch,performShot,input}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};
const setup=()=>{startMatch({mode:'free',size:1,time:0,diff:'normal',noOpp:true,goalieOnly:true});run(3.4);};
setup();
{const p=G.player,pk=G.puck;p.x=0;p.z=0;p.heading=Math.PI/2;p.vx=p.vz=0;pk.x=1.5;pk.z=0;pk.vx=pk.vz=0;run(.1);
 ok(G.carry===p,'skating up to the puck (facing it) puts it on your stick');
 input.x=0;input.z=1;run(.8);input.z=0;const d=Math.hypot(pk.x-p.x,pk.z-p.z);ok(G.carry===p&&d<1.6&&d>.9,'the puck stays on the stick in front of you while you skate and turn ('+d.toFixed(2)+' m)');
 const dir=G.mine.dir;p.cd.shoot=0;performShot(p,dir,0,.6);ok(G.carry===null&&Math.hypot(pk.vx,pk.vz)>15,'shooting releases the puck at full speed');
 run(.15);ok(G.carry!==p,'you do not instantly re-catch your own shot');}
setup();
{const p=G.player,pk=G.puck;p.x=0;p.z=0;p.heading=-Math.PI/2;p.vx=p.vz=0;pk.x=1.5;pk.z=0;run(.1);ok(G.carry!==p,'a puck behind you is not picked up');}
const stealTest=dash=>{startMatch({mode:'quick',size:2,time:120,diff:'normal'});run(3.4);
  let n=0;for(let k=0;k<20;k++){const c=G.mine.skaters[0],o=G.mine.opp.skaters[0],pk=G.puck;G.carry=c;c.fall=0;c.getup=0;o.fall=0;o.getup=0;o.cd.catch=0;c.cd.catch=0;
    c.x=0;c.z=0;c.heading=Math.PI/2;c.vx=c.vz=0;pk.x=c.x+c.r+.54;pk.z=0;o.x=pk.x+.5;o.z=.4;o.vx=o.vz=0;c.dashT=dash?1:0;o.dashT=0;
    PH.carryStep(1/120);for(let i=0;i<60;i++){c.dashT=dash?1:0;o.x=pk.x+.4;o.z=.3;PH.carryStep(1/120);}if(G.carry!==c)n++;}
  return n;};
{const a=stealTest(false),b=stealTest(true);ok(a>=8,'a defender on your stick steals the puck most of the time in 0.5 s ('+a+'/20)');ok(b<a,'dashing with the puck (deke) is much harder to strip ('+b+'/20 vs '+a+'/20)');}
{startMatch({mode:'quick',size:3,time:120,diff:'normal'});run(3.4);const me=G.player,m=G.mine.skaters.find(s=>s!==G.player);G.carry=m;G.pending=null;
 PH.save.set.ctl.auto=false;PH.autoSwitch(1/120);ok(G.player===me,'v38 (default, buttons only): a team-mate getting the puck does not take your penguin away');
 PH.save.set.ctl.auto=true;PH.autoSwitch(1/120);ok(G.player===m,'v38 auto switching setting: a team-mate gets the puck → you take control of them');PH.save.set.ctl.auto=false;}
{const c=G.player;G.carry=c;PH.knock(c,1);PH.carryStep(1/120);ok(G.carry===null,'getting knocked down drops the puck');}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
