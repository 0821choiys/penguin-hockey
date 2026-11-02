const errs=[];const ce=console.error;console.error=(...a)=>{errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));};
const PH=require('./harness.js');const {G,step,startMatch,setupMatch,save,TOUR}=PH;
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60)};
const modes=[
 ['quick easy',{mode:'quick',size:3,time:90,diff:'easy'}],
 ['quick hard 4v4',{mode:'quick',size:4,time:90,diff:'hard'}],
 ['tour',{mode:'tour',size:3,time:60,diff:'normal',oppTypes:TOUR[1].types,todFixed:.1}],
 ['practice',{mode:'practice',size:2,time:0,diff:'normal',noOpp:true,goalieOnly:true,noScoreOpp:true,passiveMates:true}],
 ['free',{mode:'free',size:2,time:0,diff:'normal'}],
];
for(const [name,cfg] of modes){
  if(cfg.mode==='tour')G.tour={round:1,champPaid:false};
  startMatch(Object.assign({tag:name},cfg));
  let goals=0,last=0;
  for(let i=0;i<60*150;i++){
    // drive the human like a player would: chase the puck, shoot/pass now and then
    const p=G.player;if(p&&G.state==='play'){const dx=G.puck.x-p.x,dz=G.puck.z-p.z,l=Math.hypot(dx,dz)||1;PH.input.x=dx/l;PH.input.z=dz/l;
      if(i%90===0){PH.input.shoot=true;PH.input.shootPress=true;}if(i%90===40){PH.input.shoot=false;PH.input.shootRel=true;}if(i%211===0)PH.input.pass=true;if(i%600===0)PH.input.special=true;}
    step(1/60);
    const sc=G.teams.blue.score+G.teams.red.score;if(sc>last){goals+=sc-last;last=sc;}
    if(G.state==='over'&&G.resultShown)break;
  }
  const bad=G.pengs.some(p=>!isFinite(p.x)||!isFinite(p.z))||!isFinite(G.puck.x);
  console.log(name.padEnd(16),'state',G.state.padEnd(5),'goals',goals,'maxCombo',G.hype.combo.max,'replays?',!!G.replay,'NaN',bad,'resultPaid',!!(G.result&&G.result.paid));
}
// menu demo
setupMatch({demo:true,mode:'demo',size:3,diff:'normal',time:0,teamKey:'blue'});G.view='menu';G.state='play';run(120);
console.log('demo 2min         goals',G.teams.blue.score+G.teams.red.score,'combo (must stay 0)',G.hype.combo.max);
console.log('\nlogged errors:',errs.length);errs.slice(0,5).forEach(e=>console.log('  ',e));
process.exit(errs.length?1:0);
