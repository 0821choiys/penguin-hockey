// AI vs AI with the referee: how much does the referee turn? (sum of |heading change| per second, big flips, back-and-forth)
const PH=require(require('path').join(__dirname,'..','harness.js'));const {G,step,startMatch,save}=PH;
const N=+(process.env.N||2),time=+(process.env.TIME||120);
save.set.rules='full';save.rl.intro=1;
let turn=0,secs=0,flips=0,rev=0,lastSign=0,crossings=0,maxRate=0;
for(let m=0;m<N;m++){
  startMatch({mode:'quick',size:3,time,diff:'normal',tag:'q',oppTypes:['basic','fast','strong','macaroni']});
  let prevH=null,prevX=null,win=[];
  for(let i=0;i<60*(time+200);i++){
    if(G.player&&!G.ps)PH.setHuman(null);
    step(1/60);
    const r=G.ref;if(!r||r.dead||G.state==='over'){if(G.state==='over'&&G.resultShown)break;continue;}
    if(prevH!==null){let d=r.h-prevH;d=Math.atan2(Math.sin(d),Math.cos(d));turn+=Math.abs(d);secs+=1/60;
      win.push(d);if(win.length>30)win.shift();const w=win.reduce((a,b)=>a+Math.abs(b),0);maxRate=Math.max(maxRate,w*2);   // rad/s over 0.5 s
      const sg=Math.sign(d);if(Math.abs(d)>.004){if(lastSign&&sg!==lastSign)rev++;lastSign=sg;}
      if(Math.abs(d)>.12)flips++;}
    if(prevX!==null&&Math.sign(r.x)!==Math.sign(prevX))crossings++;
    prevH=r.h;prevX=r.x;
    if(G.state==='over'&&G.resultShown)break;
  }
}
console.log(JSON.stringify({sec:+secs.toFixed(0),turnDegPerSec:+(turn/secs*180/Math.PI).toFixed(1),maxDegPerSec:+(maxRate*180/Math.PI).toFixed(0),dirReversalsPerMin:+(rev/secs*60).toFixed(1),bigFramesPerMin:+(flips/secs*60).toFixed(1),centreCrossingsPerMin:+(crossings/secs*60).toFixed(1)}));
process.exit(0);
