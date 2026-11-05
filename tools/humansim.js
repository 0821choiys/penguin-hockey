// A human who always pushes the stick toward the puck (or the goal when carrying) through a whole match:
// finds stretches where play is on, the stick is pushed, but the human's penguin does not move. usage: MODE=ranked N=2 node tools/humansim.js
const PH=require(require('path').join(__dirname,'..','harness.js'));const {G,step,startMatch,save,input}=PH;
const MODE=process.env.MODE||'ranked',N=+(process.env.N||2);
let stuck=[],playFrames=0,still=0;
for(let m=0;m<N;m++){
  const cfg=MODE==='ranked'?{mode:'ranked',size:3,time:120,diff:'normal',oppTypes:['basic','fast','strong'],oppR:1000,oppName:'X',label:'r',tag:'r'}
                            :{mode:'quick',size:3,time:120,diff:'normal',oppTypes:['basic','fast','strong'],tag:'q'};
  startMatch(cfg);let run=0,runInfo=null;
  for(let i=0;i<60*400&&G.state!=='over';i++){
    const p=G.player;
    if(p&&G.state==='play'){const tx=G.carry===p?p.team.dir*20:G.puck.rx,tz=G.carry===p?0:G.puck.rz;let dx=tx-p.rx,dz=tz-p.rz;const l=Math.hypot(dx,dz)||1;input.x=dx/l;input.z=dz/l;}
    else{input.x=input.z=0;}
    const x0=p&&p.rx,z0=p&&p.rz;
    step(1/60);
    const q=G.player;
    if(q&&q===p&&G.state==='play'&&!G.paused&&(input.x||input.z)){playFrames++;
      const mv=Math.hypot(q.rx-x0,q.rz-z0);
      if(mv<0.004){still++;run++;if(!runInfo)runInfo={t:+G.elapsed.toFixed(1),who:q.type,goalie:!!q.goalie,frozen:!!q.frozen,boxed:!!q.boxed,fall:+(q.fall||0).toFixed(2),getup:+(q.getup||0).toFixed(2),cast:!!q.cast,ps:!!G.ps,stun:+(q.stun||0).toFixed(2),pose:q.pose,carry:G.carry===q,x:+q.rx.toFixed(1),z:+q.rz.toFixed(1),hit:+(q.hitT||0).toFixed(2),rl:G.rl&&G.rl.stop?G.rl.stop.kind:null};}
      else{if(run>60)stuck.push(Object.assign({frames:run},runInfo));run=0;runInfo=null;}
    }
  }
  if(run>60)stuck.push(Object.assign({frames:run},runInfo));
}
console.log(JSON.stringify({mode:MODE,playFrames,stillPct:+(still/playFrames*100).toFixed(1),stuck:stuck.slice(0,12),nStuck:stuck.length}));
process.exit(0);
