// Every species as the human's penguin in a ranked match: does it move when the stick is pushed?
const PH=require(require('path').join(__dirname,'..','harness.js'));const {G,step,startMatch,save,input,TYPES}=PH;
const out=[];
for(const k of Object.keys(TYPES)){
  save.type=k;if(save.owned&&!save.owned.includes(k))save.owned.push(k);
  startMatch({mode:'ranked',size:3,time:120,diff:'normal',oppTypes:['basic','fast','strong'],oppR:1000,oppName:'X',label:'r',tag:'r'});
  for(let i=0;i<60*4;i++)step(1/60);
  const p=G.player;if(!p){out.push(k+': NO PLAYER');continue;}
  const x0=p.rx,z0=p.rz;for(let i=0;i<60;i++){input.x=1;input.z=0;step(1/60);}input.x=0;
  const q=G.player,d=Math.hypot(q.rx-x0,q.rz-z0);
  out.push((d>1?'ok   ':'STUCK')+' '+k.padEnd(12)+' type='+p.type+' moved '+d.toFixed(2)+' m'+(q!==p?' (control switched)':'')+' spd='+(TYPES[k].spd!==undefined?TYPES[k].spd:'?')+' state='+G.state);
}
console.log(out.join('\n'));process.exit(0);
