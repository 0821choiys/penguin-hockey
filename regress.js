// Regression suite for pre-existing systems.
const PH=require('./harness.js');
const {save,G,step,startMatch,pullOnce,doEnhance,doFuse,enhRate,PULL_ODDS,PITY_AT,GRADES,FUSE_DEF,CHALLENGES,TOUR,performShot,doPass,computeChem,sqAuto,teamOvr}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60)};

// gacha odds & pity
const N=200000,cnt=[0,0,0,0,0];let gap=0,maxGap=0;save.scout.pity=0;
for(let i=0;i<N;i++){const r=pullOnce(0);cnt[r.g]++;if(r.g>=3){maxGap=Math.max(maxGap,gap);gap=0;}else gap++;}
const pct=cnt.map(c=>c/N*100);
const effP=PH.gachaEff().p;ok(pct.every((v,i)=>Math.abs(v-effP[i])<.6),'grade distribution matches the published rates incl. pity: '+pct.map(v=>v.toFixed(2)).join('/')+' vs '+effP.map(v=>v.toFixed(2)).join('/'));
ok(maxGap<=PITY_AT-1,'pity: never more than '+(PITY_AT-1)+' pulls without 신화+ (longest '+maxGap+')');
let viol=0;for(let t=0;t<20000;t++){save.scout.pity=0;const res=[];for(let i=0;i<10;i++)res.push(pullOnce(i===9&&!res.some(r=>r.g>=2)?2:0));if(!res.some(r=>r.g>=2))viol++;}
ok(viol===0,'10-pull always contains 레어+');

// enhancement
for(const k of['fast','strong','defense','balanced'])if(!save.types.includes(k))save.types.push(k);
// v21: a penguin's cards all have its rarity (basic 기본, defense 레어, strong 전설) — the rarity bonus is part of the shown rate
for(const [type,lvl,g] of [['basic',3,0],['defense',6,2],['strong',9,4]]){
  save.lv[type]=lvl;save.scout.fail[type]=0;const exp=enhRate(type,g);let s=0,T=20000;
  for(let i=0;i<T;i++){save.lv[type]=lvl;save.cc[type][g]=1;save.scout.fail[type]=0;save.points=1e9;doEnhance(type,g);if(save.lv[type]>lvl)s++;}
  ok(Math.abs(s/T*100-exp)<1.2,'enhance Lv'+lvl+' '+GRADES[g].n+': shown '+exp+'% measured '+(s/T*100).toFixed(1)+'%');
}
save.lv.basic=9;save.scout.fail.basic=0;let refundOk=true;
for(let i=0;i<200&&save.lv.basic===9;i++){save.cc.basic[0]=1;save.points=1000;doEnhance('basic',0);if(save.lv.basic===9&&save.cc.basic[0]!==1)refundOk=false;}
ok(refundOk,'failed enhancement refunds the card');

// fusion (animation disabled in harness)
// v21: 3 cards of one rarity -> a penguin of the next rarity (unlock or stored card); one penguin per rarity as material
const FZK=['basic','balanced','defense','royal'],own0=save.types.slice();
for(let g=0;g<4;g++){let up=0,T=20000;for(let i=0;i<T;i++){for(const k in save.cc)save.cc[k]=[0,0,0,0,0];save.types=own0.slice();save.cc[FZK[g]][g]=3;save.points=1e9;
  const nt=save.types.length,hi=Object.keys(save.cc).reduce((a,k)=>a+save.cc[k][g+1],0);doFuse(g);if(save.types.length>nt||Object.keys(save.cc).reduce((a,k)=>a+save.cc[k][g+1],0)>hi)up++;}
  ok(Math.abs(up/T*100-FUSE_DEF[g].rate)<1.2,'fusion '+GRADES[g].n+'->'+GRADES[g+1].n+': shown '+FUSE_DEF[g].rate+'% measured '+(up/T*100).toFixed(1)+'%');}

// challenges
function chal(i){const c=CHALLENGES[i];const cfg={mode:'challenge',challenge:c,size:c.size,time:c.time,diff:'easy',tag:'c',oppTypes:['basic'],noOpp:true,noScoreOpp:true};
  if(c.kind==='pass'){cfg.size=3;cfg.noGoalies=true;cfg.noScoreAll=true;cfg.noAIShoot=true;}else{cfg.goalieOnly=true;cfg.size=1;}startMatch(cfg);run(4);}
function shootAt(charge,tz){const p=G.player,pk=G.puck,gk=G.mine.opp.goalie,dir=G.mine.dir;gk.z=-2.2;gk.ai.zs=-2.2;p.x=7*dir;p.z=0;p.heading=dir>0?Math.PI/2:-Math.PI/2;p.vx=p.vz=0;p.fall=0;pk.x=8.2*dir;pk.z=0;pk.vx=pk.vz=0;pk.shot=null;p.cd.shoot=0;p.shotGrace=0;const ax=24*dir-pk.x,az=tz-pk.z,l=Math.hypot(ax,az);performShot(p,ax/l,az/l,charge);}
save.team='blue';delete save.cleared.c4;chal(3);shootAt(.05,1.4);run(3);ok(!save.cleared.c4,'power challenge: tap shot does not clear');
for(let k=0;k<8&&G.state!=='over';k++){if(G.state!=='play')run(4);shootAt(1,1.6);run(3);}
ok(save.cleared.c4&&G.result&&G.result.ok,'power challenge: charged shot clears');
chal(2);const mates=G.mine.skaters;
for(let k=0;k<30&&G.state==='play';k++){const p=G.player,pk=G.puck;p.cd.pass=0;p.shotGrace=0;pk.x=p.x+1.1*Math.sin(p.heading);pk.z=p.z+1.1*Math.cos(p.heading);pk.vx=pk.vz=0;doPass(p,mates.find(q=>q!==p));run(1.2);}
ok(G.stats.passOK>=10&&G.state==='over','pass challenge counts real passes and clears ('+G.stats.passOK+')');

// red team practice scoring
save.team='red';startMatch({mode:'practice',size:2,time:0,diff:'normal',noOpp:true,goalieOnly:true,noScoreOpp:true,passiveMates:true});run(4);
let goals=0;for(let k=0;k<20;k++){const p=G.player,pk=G.puck,dir=G.mine.dir,gk=G.mine.opp.goalie;G.state='play';for(const m of G.mine.skaters)if(m!==p){m.x=-20*dir;m.z=10;}
  gk.z=3;gk.ai.zs=3;gk.ai.seenT=0;p.x=8*dir;p.z=-1;p.heading=dir>0?Math.PI/2:-Math.PI/2;p.vx=p.vz=0;p.fall=0;pk.x=p.x+dir*1.2;pk.z=-1;pk.vx=pk.vz=0;pk.shot=null;p.cd.shoot=0;p.shotGrace=0;
  const b=G.mine.score;performShot(p,dir,-.1,1);for(let i=0;i<180&&G.state==='play';i++)step(1/60);if(G.mine.score>b)goals++;let g=0;while(G.state==='goal'&&g<2000){step(1/30);g++;}}
ok(goals>=5,'red-team practice goals count ('+goals+'/20)');save.team='blue';

// tournament champion bonus once
startMatch({mode:'tour',size:3,time:30,diff:'easy',oppTypes:TOUR[0].types,todFixed:0,tag:'t'});G.tour={round:2,champPaid:false};run(4);
const p0=save.points;G.mine.score=6;G.mine.opp.score=0;run(31);run(14);
ok(G.state==='over'&&G.result&&G.result.win,'tournament final won');
const gained=save.points-p0;PH.G.resultShown=false;run(3);ok(save.points-p0===gained,'tournament reward not paid twice ('+gained+'P)');

// squad / chemistry
save.type='fast';save.squad=['balanced',null,null];ok(computeChem(4).active.includes('speed'),'fast + balanced -> 번개 콤비 chemistry');
save.type='basic';save.squad=[null,null,null];save.set.size=4;sqAuto();{const best=teamOvr(4),pick=save.squad.slice();let beat=false;const own=save.types;
  for(const a of own)for(const b of own)for(const c of own){save.squad=[a,b,c];if(teamOvr(4)>best)beat=true;}save.squad=pick;
  ok(pick.every(Boolean)&&!beat,'auto squad fills all slots with the highest-OVR lineup ('+pick.join(',')+' OVR '+best+')');}

console.log('\nTOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
