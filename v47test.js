// v47 mascot cut-scenes: when they play, who meets whom, the setting, and that matches still run normally around them
const errs=[];console.error=(...a)=>errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));
const PH=require('./harness.js');const {G,save,step,startMatch}=PH;
let fails=0,passes=0;const ok=(c,m)=>{if(c)passes++;else fails++;console.log((c?'PASS ':'FAIL ')+m);};
save.set.rules='off';save.set.items=false;save.set.events=false;
// ---------- the cast ----------
const sp=Object.keys(PH.MS_SP),km=PH.KIT.mas;
ok(sp.length===12&&km.every(m=>sp.includes(m))&&sp.every(m=>km.includes(m)),'a 3D mascot for every kit mascot ('+sp.join(', ')+')');
const F=['build','idle','enter','touch','bow','wave','win','lose'];
ok(sp.every(m=>F.every(f=>typeof PH.MS_SP[m][f]==='function')&&['ice','water','air'].includes(PH.MS_SP[m].med)),'every mascot has its own body, entrance, greeting, bow, wave, victory and defeat ('+F.join(', ')+')');
ok(new Set(sp.map(m=>PH.MS_SP[m].win.toString())).size===12&&new Set(sp.map(m=>PH.MS_SP[m].lose.toString())).size===12,'12 different victory acts and 12 different defeat acts');
const med=m=>PH.MS_SP[m].med;ok(['orca','narwhal','fish','berg'].every(m=>med(m)==='water')&&['peng','bear','seal','walrus','fox','owl'].every(m=>med(m)==='ice')&&['flake','bolt'].every(m=>med(m)==='air'),'animals, not costumes: the sea animals + iceberg live in the water, the rest on the ice, the snowflake and the bolt in the air');
ok(PH.MSC.intro>PH.MSC.introQ&&PH.MSC.introQ>=3&&PH.MSC.end>=5&&PH.MSC.end<=7,'timing: entrance '+PH.MSC.intro+' s (short '+PH.MSC.introQ+' s), end scene '+PH.MSC.end+' s');
// ---------- the setting ----------
const s0=save.set.masc;ok(PH.mascMode()==='full','the setting starts at 전체 (full)');
save.set.masc='short';const a1=PH.mascMode();save.set.masc='off';const a2=PH.mascMode();save.set.masc='bogus';const a3=PH.mascMode();save.set.masc=s0;
ok(a1==='short'&&a2==='off'&&a3==='full','짧게 / 끄기 read back; a broken value counts as 전체');
// ---------- when a scene plays ----------
ok(PH.mascCan({mode:'quick'})===false,'the Node harness never plays a scene (__NOFX)');
{const nf=window.__NOFX;window.__NOFX=false;const W=global.WebGLRenderingContext;global.WebGLRenderingContext=function(){};
 const can=c=>PH.mascCan(c);const r={quick:can({mode:'quick'}),season:can({mode:'season'}),friend:can({mode:'friend',net:'host'}),tut:can({mode:'quick',tutorial:true}),demo:can({mode:'demo'}),practice:can({mode:'practice'}),free:can({mode:'free'}),
   chalNo:can({mode:'chal',challenge:{}}),chalMatch:can({mode:'chal',challenge:{match:1}})};
 save.set.motion=true;r.motion=can({mode:'quick'});save.set.motion=false;save.set.masc='off';r.off=can({mode:'quick'});save.set.masc='short';r.short=can({mode:'quick'});save.set.masc=s0;
 window.__NOFX=nf;global.WebGLRenderingContext=W;
 ok(r.quick&&r.season&&r.friend&&r.chalMatch&&r.short,'scenes play in real matches (quick, season, friend, match challenges; also on 짧게) '+JSON.stringify(r));
 ok(!r.tut&&!r.demo&&!r.practice&&!r.free&&!r.chalNo&&!r.motion&&!r.off,'no scene in the tutorial, demo, practice, free skating, non-match challenges, with reduced motion or with 끄기');}
// ---------- who meets whom ----------
{const k0=JSON.stringify(save.kit||null);save.kit=Object.assign({},save.kit||{},{mas:'narwhal'});
 let same=0,stable=0;const seen=new Set();for(let i=0;i<200;i++){const c={oppName:'Team '+i,oppTypes:['basic','fast']};const a=PH.mascPair(c),b=PH.mascPair(c);if(a.op===a.my)same++;if(a.op===b.op)stable++;seen.add(a.op);}
 ok(PH.mascPair({}).my==='narwhal'&&same===0&&stable===200&&seen.size===11,'offline: my mascot is my kit’s; the other side’s comes from its name — never mine, always the same for a name, all 11 others appear');
 const NET=PH.NET;if(NET){const p0=NET.peer;NET.peer={kit:{on:1,c1:'#0d2f6b',c2:'#ffd24a',pat:'chevron',crest:'shield',mas:'owl'}};const a=PH.mascPair({mode:'friend',net:'guest',oppName:'X'});
   NET.peer={kit:{mas:'narwhal'}};const b=PH.mascPair({mode:'friend',net:'guest',oppName:'X'});NET.peer={kit:{mas:'<script>'}};const c=PH.mascPair({mode:'friend',net:'guest',oppName:'X'});NET.peer=p0;
   ok(a.op==='owl'&&b.op!=='narwhal'&&km.includes(c.op)&&c.op!=='narwhal','online: the friend’s own mascot; a clash or a broken value falls back to a valid other mascot ('+a.op+', '+b.op+', '+c.op+')');}
 else ok(false,'NET is exported for the online check');
 save.kit=JSON.parse(k0)||save.kit;}
// ---------- a match runs normally around the scenes ----------
{startMatch({mode:'quick',size:3,time:60,diff:'normal',oppTypes:['basic','fast','king'],tag:'q',oppName:'Polar Pals'});
 ok(!G.masc,'no scene in the harness: the match starts as before');let n=0;while(G.state!=='play'&&n<600){step(1/60);n++;}
 ok(G.state==='play','…and reaches play after the faceoff countdown ('+(n/60).toFixed(1)+' s)');
 PH.mascClear();ok(!G.masc,'mascClear is safe without a scene');}
ok(errs.length===0,'no errors '+errs.slice(0,2).join(' | '));
console.log('TOTAL v47test: '+passes+' passed, '+fails+' failed');process.exit(fails?1:0);
