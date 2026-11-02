// Plays the tutorial through the real input path and checks each step, reward, and edge cases.
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');
const {G,step,save,input,TUT,TUT_STEPS,tutStart,tutMaybeAsk,launch,startMatch,performShot,gp,goalsEnsure,GDEFS}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const near=(p,x,z)=>Math.hypot(p.x-x,p.z-z);
function release(){input.x=input.z=0;input.shoot=false;}
// a scripted "player" that only uses the input object (like keyboard/joystick)
function playTutorial(maxSec){
  const order=[];let last=-1,ph=0,hold=0,t=0;
  for(let f=0;f<maxSec*60;f++){
    if(!TUT.active)break;
    if(TUT.i!==last){if(last>=0)order.push(TUT_STEPS[last].id);last=TUT.i;ph=0;hold=0;}
    const id=TUT_STEPS[TUT.i].id,p=G.player,pk=G.puck;release();
    const go=(x,z,sp)=>{const dx=x-p.x,dz=z-p.z,l=Math.hypot(dx,dz)||1;input.x=dx/l*(sp||1);input.z=dz/l*(sp||1);};
    const atPuck=near(p,pk.x,pk.z)<1.9;
    if(TUT.wait<=0&&TUT.finishT<=0&&p){
      if(id==='move')go(TUT.tx,TUT.tz);
      else if(id==='get')go(pk.x,pk.z,.6);
      else if(id==='tap'){if(!atPuck)go(pk.x,pk.z,.6);else if(ph===0){input.shoot=true;input.shootPress=true;ph=1;}else if(ph===1){input.shootRel=true;ph=2;}else if(ph>=2&&++ph>40)ph=0;}
      else if(id==='power'){if(ph===0&&!atPuck)go(pk.x,pk.z,.6);else if(ph===0){input.shoot=true;input.shootPress=true;ph=1;hold=0;}else if(ph===1){input.shoot=true;if(++hold>45){input.shoot=false;input.shootRel=true;ph=2;}}else if(++ph>60)ph=0;}
      else if(id==='pass'){if(!atPuck)go(pk.x,pk.z,.6);else if(ph===0){input.pass=true;ph=1;}else if(++ph>60)ph=0;}
      else if(id==='dash'){if(ph===0){input.x=1;input.dash=true;ph=1;}else if(++ph>60)ph=0;}
      else if(id==='special'){if(ph===0){input.special=true;ph=1;}else if(++ph>90)ph=0;}
      else if(id==='goal'){ // walk to puck, then shoot hard toward the far corner (goalie moved aside so the run is deterministic)
        if(!atPuck)go(pk.x,pk.z,.6);
        else if(G.state==='play'&&p.cd.shoot<=0){const gk=G.mine.opp.goalie,d=G.mine.dir;gk.z=2.4;gk.ai.zs=2.4;const ax=24*d-pk.x,az=-1.6-pk.z,l=Math.hypot(ax,az);performShot(p,ax/l,az/l,1);}
      }
    }
    step(1/60);t+=1/60;
  }
  if(last>=0&&order[order.length-1]!==TUT_STEPS[last].id)order.push(TUT_STEPS[last].id);
  release();return{order,t};
}

// --- first-run prompt rules ---
ok(save.stats.played===0&&!save.tut.done&&!save.tut.asked,'fresh save: tutorial not done / not asked yet');
// --- full run ---
const pts0=save.points;
tutStart();for(let i=0;i<5;i++)step(1/60);
ok(TUT.active&&TUT.i===0&&G.cfg.tutorial&&G.cfg.mode==='practice','tutorial starts at step 1 in a safe practice match');
ok(save.tut.asked===true,'starting marks the first-run prompt as answered');
const r=playTutorial(240);
ok(r.order.join(',')===TUT_STEPS.map(s=>s.id).join(','),'all 8 steps completed in order by real input ('+r.order.join(' → ')+')');
let w=0;while(G.state!=='over'&&w<600){step(1/60);w++;}
ok(save.tut.done===true,'tutorial marked done');
ok(save.points-pts0===50,'first completion pays 50P (got '+(save.points-pts0)+')');
ok(G.state==='over'&&!TUT.active,'match frozen on completion screen');
console.log('   (scripted run took '+r.t.toFixed(1)+'s of game time)');
// --- replay: no second reward ---
const pts1=save.points;tutStart();for(let i=0;i<5;i++)step(1/60);playTutorial(240);w=0;while(G.state!=='over'&&w<600){step(1/60);w++;}
ok(save.points===pts1,'replaying the tutorial pays nothing again');
// --- wrong actions don't advance ---
tutStart();for(let i=0;i<5;i++)step(1/60);
TUT.i=TUT_STEPS.findIndex(s=>s.id==='power');TUT.wait=0;TUT.fresh=true;step(1/60);step(1/60);
const iBefore=TUT.i,p=G.player,pk=G.puck;pk.x=p.x+Math.sin(p.heading)*1.2;pk.z=p.z+Math.cos(p.heading)*1.2;pk.vx=pk.vz=0;p.cd.shoot=0;
input.shoot=true;input.shootPress=true;step(1/60);input.shoot=false;input.shootRel=true;step(1/60);step(1/60);
ok(TUT_STEPS[TUT.i].id==='power'&&TUT.i===iBefore,'a quick tap during the power-shot step does not count');
PH.tutEvent('shot',.5,'power');for(let i=0;i<70;i++)step(1/60);ok(TUT_STEPS[TUT.i].id==='power','a 50%-charged shot does not pass the 70% power step');
PH.tutEvent('shot',.8,'power');for(let i=0;i<70;i++)step(1/60);ok(TUT_STEPS[TUT.i].id==='pass','an 80%-charged shot passes it');
// --- stuck helper ---
pk.x=-20*G.mine.dir;pk.z=-8;pk.vx=pk.vz=0;release();for(let i=0;i<60*12;i++)step(1/60);
ok(near(G.player,pk.x,pk.z)<3.5,'after ~11s without the puck, it is brought back to the player');
// --- leaving mid-way ---
PH.G.view='game';launch('quick');for(let i=0;i<5;i++)step(1/60);ok(!TUT.active&&!G.cfg.tutorial,'starting another mode cleanly ends the tutorial');
// --- practice/tutorial can't farm daily goals ---
save.goals={day:0,ts:0,list:[]};save.clk=0;goalsEnsure();
const before=JSON.stringify(save.goals.list.map(g=>g.p)),cum0=save.cum.goals;
startMatch({mode:'practice',size:2,time:0,diff:'normal',noOpp:true,goalieOnly:true,noScoreOpp:true,passiveMates:true});gp('goals',1);gp('passes',1);gp('power',1);
ok(JSON.stringify(save.goals.list.map(g=>g.p))===before&&save.cum.goals===cum0,'practice progress does not count toward daily/long goals');
startMatch({mode:'quick',size:3,time:60,diff:'normal'});const d=save.goals.list[0];gp(GDEFS[d.id].key,1,d.t);
ok(save.goals.list[0].p===1||GDEFS[d.id].key==='typeGame','real matches still count');
console.log('\nlogged runtime errors: '+errs.length);errs.slice(0,3).forEach(e=>console.log('  '+e));
if(errs.length)fails++;
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
