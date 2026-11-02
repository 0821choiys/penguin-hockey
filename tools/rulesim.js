// AI vs AI matches with rules on: how often does the referee stop play?
const errs=[];const ce=console.error;console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require(require('path').join(__dirname,'..','harness.js'));const {G,step,startMatch,save}=PH;
const N=+(process.env.N||6),size=+(process.env.SIZE||3),diff=process.env.DIFF||'normal',time=+(process.env.TIME||180);
save.set.rules=process.env.RULES||'full';save.rl.intro=1;
const tot={},LOG=[];let goals=0,stopT=0,ppg=0,psg=0,ps=0,matches=0,stuck=0,boxT=0;
for(let m=0;m<N;m++){
  startMatch({mode:'quick',size,time,diff,tag:'q',oppTypes:['basic','fast','strong','macaroni']});
  let i=0;const cap=60*(time+400);
  for(;i<cap;i++){
    if(G.player&&!G.ps)PH.setHuman(null);
    step(1/60);
    if(G.state==='stop')stopT+=1/60;
    if(G.rl&&G.rl.box.length)boxT+=1/60;
    if(G.state==='over'&&G.resultShown)break;
    const bad=G.pengs.some(p=>!isFinite(p.x)||!isFinite(p.z))||!isFinite(G.puck.x);if(bad){console.log('NaN!');break;}
  }
  if(G.state!=='over')stuck++;
  matches++;goals+=G.teams.blue.score+G.teams.red.score;
  for(const c of G.rl?G.rl.calls:[])tot[c]=(tot[c]||0)+1;
  if(G.rl)for(const l of G.rl.log)LOG.push(l);
  for(const k of['blue','red']){const s=G.rl?G.rl.st[k]:{};ppg+=s.ppg||0;psg+=s.psg||0;ps+=s.ps||0;}
}
console.log(JSON.stringify({matches,size,diff,time,rules:save.set.rules,callsPerMatch:Object.fromEntries(Object.entries(tot).map(([k,v])=>[k,+(v/matches).toFixed(2)])),goalsPerMatch:+(goals/matches).toFixed(2),stopSecPerMatch:+(stopT/matches).toFixed(1),boxSecPerMatch:+(boxT/matches).toFixed(1),ppg,ps,psg,stuck,errs:errs.length}));
if(errs.length)console.log(errs.slice(0,5).join('\n'));
console.log(JSON.stringify(LOG));
process.exit(0);
