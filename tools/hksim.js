// A scripted human against the AI. usage: N=4 node tools/hksim.js        (PHDIR=<folder with another build's harness.js> to compare builds)
//  old  = auto switching on (pre-v38 behaviour), the bot never presses Switch / Pass to call (it did not exist)
//  new  = buttons only: the bot presses Switch when a team-mate is much nearer the puck, pokes, calls for the pass
// Reports goals for / against per match, how much of the time your penguin carries the puck, why your penguin changed
// (Switch press / your pass / penalty box / other = automatic), how often each button fired, and — since v40 —
// who shoots and scores on your team (the penguin you control at that moment, or an AI team-mate) and how the calls go
// (a call = Pass pressed while an AI team-mate carries; answered = that mate passes to you within 2.4 s).
const PH=require(require('path').join(process.env.PHDIR||require('path').join(__dirname,'..'),'harness.js'));const {G,step,startMatch,save,input,HK}=PH;
const N=+(process.env.N||4),W=24,CALLWIN=2.4;
save.set.rules='full';save.set.items=true;save.set.events=true;
function bot(mode,st){
  const p=G.player;input.x=input.z=0;if(!p||G.state!=='play')return;
  const pk=G.puck,c=G.carry,dir=p.team.dir,gx=dir*W;let tx=pk.x,tz=pk.z;
  const press=k=>{if(k==='shoot'){input.shoot=true;input.shootPress=true;st.rel=2;}else input[k]=true;st.n[k]=(st.n[k]||0)+1;};
  if(st.rel>0){st.rel--;if(st.rel===0){input.shoot=false;input.shootRel=true;}}
  st.cd-=1/60;
  if(c===p){
    tx=gx;tz=0;const gd=Math.hypot(gx-p.x,p.z);
    if(gd<13&&st.cd<=0){press('shoot');st.cd=.6;}
    else{let near=99;for(const o of p.team.opp.skaters){const d=Math.hypot(o.x-p.x,o.z-p.z);if(d<near)near=d;}
      if(near<2.6&&st.cd<=0){const m=p.team.skaters.find(s=>s!==p);if(m){const dx=m.x-p.x,dz=m.z-p.z,l=Math.hypot(dx,dz)||1;input.x=dx/l;input.z=dz/l;press('pass');st.cd=.8;return;}}}
  }else if(c&&c.team===p.team){
    tx=c.x+dir*7;tz=-c.z*.6;
    if(mode==='new'&&st.cd<=0&&Math.hypot(c.x-p.x,c.z-p.z)>5){press('pass');st.cd=1.6;if(!c.goalie){st.n.call=(st.n.call||0)+1;st.call={t:G.t,from:c};}}
  }else{
    if(c&&c.team!==p.team){tx=c.x-dir*1.2;tz=c.z;if(Math.hypot(pk.x-p.x,pk.z-p.z)<2.3&&st.cd<=0){press('shoot');st.cd=.5;}}
    if(mode==='new'&&st.sw<=0){const dp=Math.hypot(pk.x-p.x,pk.z-p.z),t=PH.hkSwapTarget(p);
      if(t&&dp>9&&Math.hypot(pk.x-t.x,pk.z-t.z)<dp-4){press('swap');st.sw=.7;}}
  }
  st.sw-=1/60;const dx=tx-p.x,dz=tz-p.z,l=Math.hypot(dx,dz)||1;input.x=dx/l;input.z=dz/l;
}
function play(mode){
  const R={gf:0,ga:0,carry:0,mateCarry:0,play:0,why:{swap:0,pass:0,box:0,other:0},n:{},shots:{you:0,mate:0},goals:{you:0,mate:0,other:0},callOk:0,callT:0,matePass:0};
  for(let m=0;m<N;m++){
    save.set.ctl=PH.ctlLoad({auto:mode==='old'});
    startMatch({mode:'quick',size:3,time:120,diff:'normal',tag:'q',oppTypes:['basic','fast','strong']});
    const st={cd:0,sw:0,rel:0,n:R.n,call:null};let last=G.player,seen=null,seenYou=false,seenPass=null,gf=0;
    for(let i=0;i<60*400&&G.state!=='over';i++){
      const before=st.n.swap||0,ctl0=G.player;bot(mode,st);const pend=G.pending&&G.pending.to;step(1/60);
      const me=G.mine,sh=G.puck.shot,ps=G.pass;
      if(G.state==='play'){R.play++;if(G.carry&&G.carry===G.player)R.carry++;else if(G.carry&&G.carry.team===me&&!G.carry.goalie)R.mateCarry++;}
      if(sh&&sh!==seen){seen=sh;seenYou=sh.by===ctl0;if(sh.by&&sh.by.team===me&&!sh.by.goalie)R.shots[seenYou?'you':'mate']++;}
      if(ps&&ps!==seenPass){seenPass=ps;
        if(ps.from.team===me&&ps.from!==ctl0&&!ps.from.goalie&&ps.to===ctl0){R.matePass++;
          if(st.call&&G.t-st.call.t<=CALLWIN){R.callOk++;R.callT+=G.t-st.call.t;st.call=null;}}}
      if(st.call&&G.t-st.call.t>CALLWIN)st.call=null;
      if(me.score>gf){gf=me.score;R.goals[seen&&seen.by&&seen.by.team===me?(seenYou?'you':'mate'):'other']++;seen=null;}
      if(G.player!==last){const w=(st.n.swap||0)!==before?'swap':G.player===pend?'pass':last&&last.boxed?'box':input.swap?'swapLate':'other';R.why[w]=(R.why[w]||0)+1;last=G.player;}
    }
    const me=G.mine,op=me.opp;R.gf+=me.score;R.ga+=op.score;
  }
  const calls=R.n.call||0,per=v=>+(v/N).toFixed(2);
  for(const k of['shoot','pass','swap','call'])R.n[k]=+((R.n[k]||0)/N).toFixed(1);
  return {mode,gfPerMatch:per(R.gf),gaPerMatch:per(R.ga),
    goalsBy:{you:per(R.goals.you),mate:per(R.goals.mate),other:per(R.goals.other),matePct:+(R.goals.mate/Math.max(1,R.gf)*100).toFixed(0)},
    shotsBy:{you:per(R.shots.you),mate:per(R.shots.mate)},
    calls:{perMatch:per(calls),answeredPct:+(R.callOk/Math.max(1,calls)*100).toFixed(0),avgWait:+(R.callT/Math.max(1,R.callOk)).toFixed(2)},matePassesToYou:per(R.matePass),
    youCarryPct:+(R.carry/R.play*100).toFixed(1),mateCarryPct:+(R.mateCarry/R.play*100).toFixed(1),
    switchesPerMatch:Object.fromEntries(Object.entries(R.why).map(([k,v])=>[k,+(v/N).toFixed(1)])),pressesPerMatch:R.n};
}
const modes=(process.env.MODES||'old,new').split(',');
for(const m of modes)console.log(JSON.stringify(play(m)));
process.exit(0);
