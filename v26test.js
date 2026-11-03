// v26: every species' skill brings its own centre-piece (prop or world effect), pools are released, the cinematic frames it
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {save,G,step,startMatch,sgP,SIGCAM}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
save.rl.intro=1;save.set.rules='off';save.set.cine='off';
const ALL=['strong','king','basic','balanced','fast','defense','macaroni','royal','fiordland','yelloweye','little','african','humboldt','magellanic','galapagos','auk'];
const live=k=>sgP[k].filter(o=>o.life>0).length;
function cast(k){save.type=k;save.squad=['basic',null,null];startMatch({mode:'quick',size:2,time:180,diff:'easy',tag:'T',oppTypes:['basic','basic']});let n=0;while(G.state!=='play'&&n++<600)step(1/60);
  const p=G.player,m=p.team.skaters.find(q=>q!==p);for(const q of G.pengs){q.vx=q.vz=0;q.fall=0;}if(m){m.x=m.ox=p.x+5;m.z=m.oz=p.z;}
  p.heading=Math.PI/2;p.cd.special=0;const pk=G.puck;pk.x=pk.ox=p.x+.95;pk.z=pk.oz=p.z;pk.vx=pk.vz=0;G.carry=p;PH.useSpecial(p);return p;}
const seen={};
for(const k of ALL){
  const p=cast(k),c=p.cast;ok(!!c&&!c.whiff,k+': skill fired with its cast');
  const got=new Set();let n=0;
  while(p.cast&&n++<200){step(1/60);const cx=p.pg.cx||{},cc=p.cast||{};
    if(cc.wave)got.add('wave');if(cc.rugO)got.add('carpet');if(cc.vort)got.add('vortex');if(cc.rose)got.add('compass');
    if(live('shards'))got.add('shards');if(live('rocks'))got.add('rocks');if(live('leaves'))got.add('leaves');if(live('rings'))got.add('rings');if(live('beams'))got.add('beam');if(live('discs'))got.add('shock');
    if(cx.flames&&cx.flames.visible)got.add('flames');if(cx.beamL&&cx.beamL.visible)got.add('eyebeams');if(cx.sun3&&cx.sun3.visible)got.add('sun');if(cx.trumpet&&cx.trumpet.visible)got.add('trumpet');
    if(cx.sceptre&&cx.sceptre.visible)got.add('sceptre');if(cx.crown&&cx.crown.visible)got.add('crown');if(cx.wings&&cx.wings.visible)got.add('wings');}
  seen[k]=[...got];
}
const NEED={strong:['sceptre','crown','beam','shock'],king:['trumpet','rings'],auk:['wave'],defense:['shards'],balanced:['rocks'],macaroni:['flames'],royal:['crown','carpet'],
  fiordland:['leaves'],yelloweye:['eyebeams'],little:['wings'],african:['rings'],humboldt:['vortex'],magellanic:['compass'],galapagos:['sun','beam'],fast:['rings'],basic:['rings']};
for(const k of ALL)ok(NEED[k].every(x=>seen[k].includes(x)),k+': '+NEED[k].join(' + ')+' appear ('+seen[k].join(', ')+')');
// after every cast ended, the one-per-cast pieces are back in their pools (no leak: 20 more waves still work)
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};run(2);
ok(['waves','carpets','vort','rose'].every(k=>live(k)===0),'one-per-cast pieces (wave, carpet, vortex, compass) are released when the cast ends');
{let made=0;for(let i=0;i<6;i++){const p=cast('auk');let n=0;while(p.cast&&n++<200){step(1/60);if(p.cast&&p.cast.wave){made++;break;}}run(1.5);}ok(made===6&&sgP.waves.length<=2,'six waves in a row: every one appears, the pool stays at '+sgP.waves.length);}
// cinematic framing table: every species has an entry, camera stays in the rink with it
ok(ALL.every(k=>SIGCAM[k]),'every species has a cinematic framing');
{const p=cast('auk');let bad=0,tot=0;for(const [x,z] of[[0,0],[20,8],[-20,-8],[0,11],[10,-11]])for(let h=0;h<8;h++){p.x=p.rx=x;p.z=p.rz=z;p.heading=h*Math.PI/4;const a=PH.cineAngle(p);for(const q of PH.cineShots(p,a.a,a.sd)){tot++;if(!PH.cineInside(q[0],q[1],.4))bad++;}}
 ok(bad<=tot*.02,'큰바다쇠오리 wide framing still keeps the camera in the rink ('+(tot-bad)+'/'+tot+')');}
// cinematic on: the wave rises during the wind-up and crashes on the impact beat
{save.set.cine='full';const p=cast('auk');ok(!!G.cine,'cinematic plays for the auk');const P=G.cine.P;let kAtImpact=null,maxK=0;
 while(G.cine&&G.cine.t<P.out){step(1/60);const c=p.cast;if(!c)break;const u=c.t/c.dur;if(G.cine&&G.cine.t>=P.impact&&kAtImpact===null)kAtImpact=u;}
 ok(kAtImpact!==null&&kAtImpact>=.45&&kAtImpact<=.6,'the wave has (almost) fully risen when the impact beat lands and crashes right after (cast '+(kAtImpact||0).toFixed(2)+'; full at .50, crash from .55)');
 let n=0;while(G.cine&&n++<300)step(1/60);save.set.cine='off';}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
