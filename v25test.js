// v25: skill cinematics — the world (and the clock) stand still, phases + timing, quick repeats, skip, settings, camera stays in the rink, saves
const {execFileSync}=require('child_process');
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {save,G,step,startMatch,CINE}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};
const W=24,D=13,CR=5;
save.rl.intro=1;save.set.rules='off';save.set.motion=false;save.set.cine='full';
function match(type,o){save.type=type||'strong';startMatch(Object.assign({mode:'quick',size:3,time:180,diff:'normal',tag:'q',oppTypes:['basic','fast','strong']},o||{}));let n=0;while(G.state!=='play'&&n++<600)step(1/60);
  for(const p of G.pengs){p.vx=p.vz=0;p.fall=0;}}
const toPlay=()=>{let n=0;while(G.state!=='play'&&n++<900)step(1/60);};
const cast=p=>{toPlay();if(p.human&&G.player!==p)p=G.player;p.cd.special=0;p.fall=0;p.getup=0;const pk=G.puck;pk.x=pk.ox=p.x+Math.sin(p.heading)*.95;pk.z=pk.oz=p.z+Math.cos(p.heading)*.95;pk.vx=pk.vz=0;return PH.useSpecial(p);};   // puck on the stick (the flipper smash needs it)
const snap=()=>JSON.stringify({t:G.timeLeft,e:G.elapsed,pk:[G.puck.x,G.puck.z,G.puck.vx],p:G.pengs.map(q=>[q.x,q.z,q.vx,q.vz,q.cd.special])});

// ---- 1. your own skill → full cut-scene, the world stands still ----
match('strong');
{const p=G.player;ok(p&&p.human&&p.type==='strong','you play the 황제 펭귄');
 const r=cast(p);ok(r&&G.cine&&G.cine.p===p&&!G.cine.quick&&G.cine.dur===CINE.full,'skill used → full cinematic starts ('+CINE.full+' s)');
 ok(p.cast&&!p.cast.whiff,'the in-world cast animation runs with it');
 step(1/60);const a=snap();run(1);const b=snap();
 ok(a===b,'1 s into the scene: match clock, puck, every penguin and every cooldown are frozen');
 ok(Math.abs(G.cine.t-(1+1/60))<.02,'the scene itself runs on real time (t = '+G.cine.t.toFixed(3)+' s)');
 const P=G.cine.P;ok(P.band<P.impact&&P.impact<P.out&&P.out<G.cine.dur,'phases in order: cut-in '+P.band+' s → portrait → impact '+P.impact+' s → return '+P.out+' s → end '+G.cine.dur+' s');
 // the strike lands on the impact beat
 const c=G.cine,H=c.H;c.t=P.impact+.06;ok(Math.abs(PH.cineCastU(c)-H)<1e-9,'the sceptre strike (cast '+H+') lands exactly .06 s after the impact beat');
 c.t=P.band;ok(PH.cineCastU(c)<.06,'… and the wind-up starts slow under the cut-in');c.t=P.out;ok(PH.cineCastU(c)===1,'… the cast is complete when the return starts');
 c.t=1+1/60;
 let n=0;while(G.cine&&n++<600)step(1/60);const real=(n+61)/60;
 ok(!G.cine&&Math.abs(real-CINE.full)<.05,'scene ends after '+real.toFixed(2)+' s of real time');
 ok(G.slow&&G.slow.t>0&&G.slow.s<1,'play resumes in slow motion for a beat');
 ok(!p.cast,'the cast animation has finished with the scene');
 const t0=G.timeLeft;run(1);ok(G.timeLeft<t0-.3,'the clock runs again afterwards');}

// ---- 2. a second skill soon after: quick version; ≥ repeat window later: full again ----
{const p=G.player;cast(p);ok(G.cine&&G.cine.quick&&G.cine.dur===CINE.quick,'another skill within '+CINE.repeat+' s of play → quick '+CINE.quick+' s version');
 let n=0;while(G.cine&&n++<300)step(1/60);ok(!G.cine&&Math.abs(n/60-CINE.quick)<.05,'quick scene lasts '+(n/60).toFixed(2)+' s');
 G.elapsed+=CINE.repeat+1;cast(p);ok(G.cine&&!G.cine.quick,'after '+CINE.repeat+' s of play the full scene comes back');PH.cineClear();}

// ---- 3. skipping ----
{const p=G.player;G.cineFull=null;cast(p);run(.2);PH.cineSkip();ok(G.cine&&G.cine.t<.3&&!G.cine.skipped,'no skip in the first '+CINE.skipAfter+' s (a held button cannot cancel it by accident)');
 run(.4);PH.cineSkip();ok(G.cine&&G.cine.skipped&&G.cine.t===G.cine.P.out&&G.cine.hit,'skip → jumps to the return; the impact still happens');
 let n=0;while(G.cine&&n++<300)step(1/60);ok(!G.cine&&n<=Math.ceil((CINE.full-CINE.P.out)*60)+1,'… and it ends '+(n/60).toFixed(2)+' s later');
 ok(!(G.slow&&G.slow.t>.3),'no slow-motion tail after a skip '+JSON.stringify(G.slow));}

// ---- 4. pause / leaving the match ----
{const p=G.player;G.cineFull=null;cast(p);run(.5);const t=G.cine.t;G.paused=true;run(1);ok(G.cine&&G.cine.t===t,'paused: the scene waits');G.paused=false;
 G.view='menu';step(1/60);ok(!G.cine&&!G.cineBlend,'leaving the game view clears the scene');G.view='game';}
{const p=G.player;G.cineFull=null;cast(p);run(.5);startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'q',oppTypes:['basic','fast','strong']});ok(!G.cine&&G.cineFull==null,'a new match starts clean');let n=0;while(G.state!=='play'&&n++<600)step(1/60);}

// ---- 5. who gets a scene ----
{const ai=G.pengs.find(q=>!q.human&&!q.goalie&&q.team===G.mine.opp);cast(ai);ok(!G.cine,'opponent / AI skills: no cut-scene (they keep the in-world animation)');run(1.5);
 const mate=G.pengs.find(q=>!q.human&&!q.goalie&&q.team===G.mine);cast(mate);ok(!G.cine,'AI team-mates: none either');run(1.5);}
{save.set.cine='short';G.cineFull=null;cast(G.player);ok(G.cine&&G.cine.quick,'setting 짧게: always the quick version');PH.cineClear();
 save.set.cine='off';run(1.5);cast(G.player);ok(!G.cine&&G.slow&&Math.abs(G.slow.s-.5)<1e-9,'setting 끄기: no scene, the old call-out banner + short slow-mo');run(1.5);
 save.set.cine='full';save.set.motion=true;cast(G.player);ok(!G.cine,'모션 줄이기 on: no scene');save.set.motion=false;run(1.5);
 save.set.cine='nonsense';ok(PH.cineMode()==='full','unknown setting value → 시네마틱');save.set.cine='full';}
{save.type='basic';startMatch({mode:'demo',demo:true,size:3,time:0,diff:'normal',teamKey:'blue'});run(.5);for(const p of G.pengs)if(!p.goalie){cast(p);}ok(!G.cine,'menu demo match: never');}
for(const t of['basic','fast','balanced','little','auk','king','galapagos']){match(t);const r=cast(G.player);ok(r&&G.cine&&G.cine.p.type===t,t+': scene starts');let n=0;while(G.cine&&n++<300)step(1/60);ok(!G.cine&&!G.player.cast,t+': ends cleanly');}

// ---- 5b. 마젤란 double dash: a second press during the scene is not lost ----
{match('magellanic');const p=G.player;cast(p);ok(G.cine&&p.dbl>0&&p.dblT>0,'마젤란: first dash → scene, second dash window open ('+p.dblT.toFixed(2)+' s, frozen)');
 const w=p.dblT;run(.6);ok(p.dblT===w,'… the window does not run out during the scene');
 PH.input.special=true;step(1/60);ok(G.cine&&G.cine.skipped&&G.cine.queued,'second press during the scene: skips to the return and is kept');
 let n=0;while(G.cine&&n++<200)step(1/60);const sp=p.cd.special;step(1/60);step(1/60);ok(!G.cine&&p.dbl===0&&p.dashT>0,'… and the second dash fires as play resumes (dashT '+p.dashT.toFixed(2)+', skill cooldown '+sp.toFixed(1)+' → '+p.cd.special.toFixed(1)+')');}

// ---- 6. the camera never leaves the rink ----
{match('strong');const p=G.player;let bad=0,tot=0;
 for(const [x,z] of[[0,0],[W-1.3,0],[-W+1.3,0],[0,D-1.2],[0,-D+1.2],[W-2.2,D-2.2],[-W+2.2,-D+2.2],[W-3,-D+1.5],[-W+1.5,D-3]])for(let h=0;h<8;h++){
   p.x=p.rx=x;p.z=p.rz=z;p.heading=h*Math.PI/4;const a=PH.cineAngle(p);
   for(const q of PH.cineShots(p,a.a,a.sd)){tot++;if(!PH.cineInside(q[0],q[1],.5))bad++;}}
 ok(bad===0,'cinematic camera stays inside the rink from the centre, the boards and the corners ('+tot+' shots checked, '+bad+' outside)');}

// ---- 7. save ----
const load=sv=>JSON.parse(execFileSync('node',['-e',"const PH=require('./harness.js');console.log(JSON.stringify(PH.save.set.cine));process.exit(0)"],{cwd:__dirname,env:Object.assign({},process.env,{SAVE:JSON.stringify(sv)})}).toString().trim().split('\n').pop());
ok(load({v:10,set:{cine:'short'}})==='short'&&load({v:10,set:{cine:'off'}})==='off','the setting survives a reload');
ok(load({v:10})==='full'&&load({v:10,set:{cine:'x'}})==='full','old saves / bad values → 시네마틱');

console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
