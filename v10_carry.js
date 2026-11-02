
/* ================= v10 stick-handling: carry the puck, dekes, steals, poke checks ================= */
// Measured before this change: the puck was loose 80% of the time and the average "control" lasted 0.29 s,
// because a skater could only bump the puck. Now a penguin that reaches the puck facing it keeps it on the stick.
G.carry=null;
const CARRY={catchR:.6,relMax:13,holdK:16,steal:3.0,aiSteal:{easy:.55,normal:.9,hard:1.25},poke:{easy:.6,normal:1.0,hard:1.5}};
const carryDist=p=>p.r+PUCKR+.12;
function canCarry(p){return !!p&&!p.goalie&&!p.frozen&&p.fall<=0&&p.getup<=0&&!((p.cd.catch||0)>0)&&!(p.slideT>0);}
function carryRelease(cd){const c=G.carry;if(!c)return null;G.carry=null;c.cd.catch=cd||.3;return c;}
function carryStep(h){
  const pk=G.puck;let c=G.carry;
  if(c&&(c.fall>0||c.frozen||c.goalie)){carryRelease(.6);pk.vx=c.vx*.6+rnd(-3,3);pk.vz=c.vz*.6+rnd(-3,3);if(c===G.player)popAt('퍽을 놓쳤어요!',c.x,2.3,c.z);c=null;}
  if(c){
    const f=carryDist(c),sway=Math.sin(G.t*7+c.seed)*.12*clamp(Math.hypot(c.vx,c.vz)/8,0,1);
    const fx=Math.sin(c.heading),fz=Math.cos(c.heading),tx=c.x+fx*f+fz*sway,tz=c.z+fz*f-fx*sway,ex=tx-pk.x,ez=tz-pk.z;
    if(Math.hypot(ex,ez)>1.4)carryRelease(.35);   // knocked off the stick (walls, hits)
    else{pk.vx=c.vx+ex*CARRY.holdK;pk.vz=c.vz+ez*CARRY.holdK;}
    // opponents can strip the puck by getting their stick on it (stronger / dashing defenders steal more)
    if(G.carry&&G.state==='play')for(const o of c.team.opp.skaters){
      if(!canCarry(o))continue;const d=Math.hypot(pk.x-o.x,pk.z-o.z);if(d>o.r+PUCKR+.3)continue;
      const so=(o.ty.stats.body+o.ty.stats.turn)*(o.dashT>0?1.7:1),sc=c.ty.stats.body+c.ty.stats.turn;
      const rate=CARRY.steal*so/sc*(o.human?1.15:(CARRY.aiSteal[G.cfg&&G.cfg.diff]||.9))*(c.dashT>0?.35:1);
      if(Math.random()<rate*h){G.carry=o;c.cd.catch=.5;touchPuck(o,4);
        if(o.team===G.mine&&G.cfg&&G.cfg.mode!=='demo')popAt('STEAL!',o.x,2.4,o.z);else if(c.team===G.mine&&G.cfg&&G.cfg.mode!=='demo')popAt('빼앗겼다!',c.x,2.3,c.z);
        SFX.hit(.6);break;}
    }
  }
  if(!G.carry&&G.state==='play'){
    let best=null,bd=9;
    for(const p of G.pengs){
      if(!canCarry(p))continue;
      const dx=pk.x-p.x,dz=pk.z-p.z,d=Math.hypot(dx,dz);if(d>carryDist(p)+CARRY.catchR)continue;
      const fx=Math.sin(p.heading),fz=Math.cos(p.heading);if((dx*fx+dz*fz)/(d||1)<-.15)continue;     // must face the puck
      const rv=Math.hypot(pk.vx-p.vx,pk.vz-p.vz),recv=!!(G.pass&&G.pass.to===p);
      if(rv>(recv?30:CARRY.relMax))continue;
      if(pk.shot&&pk.shot.by.team!==p.team&&G.t-pk.shot.t<.4&&rv>9)continue;              // a fresh hard shot is blocked, not caught
      if(d<bd){bd=d;best=p;}
    }
    if(best){G.carry=best;touchPuck(best,Math.hypot(pk.vx-best.vx,pk.vz-best.vz));if(pk.shot&&pk.shot.by!==best)pk.shot=null;}
  }
}
function bigHit(hitter,victim){
  if(!G.mine||!G.cfg||G.cfg.mode==='demo'||hitter.team===victim.team)return;
  if(hitter.team===G.mine){popAt('BIG HIT!',victim.x,2.6,victim.z);G.cam.shake=Math.max(G.cam.shake,.45);G.hitStop=Math.max(G.hitStop||0,.05);cbAdd('hit','BIG HIT');vib(25);}
  else if(victim===G.player)G.cam.shake=Math.max(G.cam.shake,.35);
}
