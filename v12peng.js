const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,240));
const PH=require('./harness.js');const {G,save,step,startMatch}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
const run=s=>{for(let i=0;i<Math.round(s*60);i++)step(1/60);};
// every species / team / hat / goalie builds and exposes the rig the animation needs
const need=['root','piv','inner','torso','body','head','headAbs','tail','stick','flipL','flipR','footL','footR','eyeL','eyeR','pupL','pupR','scarfTail','hat'];
let okAll=true;for(const k of Object.keys(PH.TYPES))for(const tm of['blue','red'])for(const h of['none','beanie','helmet','headband','party','crown']){const pg=PH.buildPenguin(k,tm,h);if(!need.every(n=>pg[n]))okAll=false;}
ok(okAll,'all species × teams × hats build with the full rig');
{const g=PH.buildPenguin('defense','blue','helmet',{goalie:true,num:1});ok(g.num===1&&g.stick&&g.hat,'goalie builds with gear, stick and number');}
// jersey numbers: species based, unique inside a team
startMatch({mode:'quick',size:4,time:120,diff:'normal',oppTypes:['basic','basic','basic','basic']});run(.2);
{const nums=t=>G.pengs.filter(p=>p.team===t).map(p=>p.pg.num);const opp=nums(G.mine.opp),mine=nums(G.mine);
 ok(new Set(opp).size===opp.length&&opp.includes(7)&&opp.includes(17),'same species on one team get different numbers ('+opp.join(',')+')');
 ok(new Set(mine).size===mine.length&&mine.includes(save.type==='basic'?7:mine[0]),'own team numbers are unique ('+mine.join(',')+')');
 ok(G.mine.goalie.pg.num===(G.mine.key==='blue'?1:30),'goalie wears 1 / 30');}
// the stick setting exists, defaults on, and survives the loader
ok(save.set.stick===true,'hockey stick shown by default');
{save.set.stick=false;run(.1);ok(G.pengs.every(p=>p.pg.stick.visible===false),'stick setting hides every stick');save.set.stick=true;run(.1);ok(G.pengs.every(p=>p.pg.stick.visible!==false),'and shows them again');}
// animation keeps running for every pose without errors
{const p=G.player;for(const pose of['play','idle','cheer','sad']){p.pose=pose;run(.2);}p.pose='play';p.fall=1;run(.3);p.fall=0;p.charging=true;p.charge=.8;run(.2);p.charging=false;p.anim.swing=1;run(.2);ok(errs.length===0,'all poses animate (head, beak, tail, stick) without errors');}
console.log('runtime errors: '+errs.length);if(errs.length){fails++;errs.slice(0,5).forEach(e=>console.log(e));}
console.log('TOTAL: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
