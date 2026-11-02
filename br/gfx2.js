// More graphics captures: themed arenas, rink conditions, the team-select showcase. usage: QUALITY=ultra node gfx2.js <prefix> [pc|tall] [scenes]
const src=require('fs').readFileSync(__dirname+'/gfx.js','utf8');
eval(src.replace(/  const reseed=[\s\S]*$/,`
  const reseed=()=>E(()=>{let seed=777;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};});
  const arena=(a,cond,tod)=>{const P=window.__PH;P.save.cleared.tour=true;P.save.set.arena=a;P.save.set.cond=!!cond;P.save.set.events=false;P.save.set.items=false;
    P.startMatch({mode:'quick',size:3,time:180,diff:'normal',tag:'Q',cond:cond||undefined,todFixed:tod,final:a==='final',oppTypes:['king','macaroni','little']});
    document.querySelectorAll('.screen').forEach(e=>e.classList.remove('on'));const G=P.G;G.state='play';G.stateT=0;document.getElementById('count').textContent='';
    for(let i=0;i<300;i++)P.step(1/60);const c=document.getElementById('condIntro');if(c)c.classList.remove('on');};
  const low=()=>{const P=window.__PH,G=P.G,c=P.camera;c.clearViewOffset();c.position.set(-5,1.7,8.5);c.lookAt(3,1,-2);};
  for(const [n,a,cond,tod,lo] of [['aurora','aurora',null,undefined,1],['final','final',null,undefined,1],['sunset','sunset',null,undefined,1],['blizzard','blizzard',null,undefined,0],['thin','auto','thin',.1,1],['condnight','auto','night',undefined,0]]){
    await reseed();await shot(n,()=>{});
    if(!only.length||only.includes(n)){await E(arena,a,cond,tod);if(lo)await E(low);
      if(process.env.PAIR){await E(()=>{window.__PH.GFX.drop=9;});await snap(n,pre+'0');await E(()=>{window.__PH.GFX.drop=0;});}
      await snap(n,pre);console.log(n,'ok');}
  }
  if(!only.length||only.includes('select')){await E(()=>{const b=document.createElement('button');b.dataset.go='sSelect';document.body.appendChild(b);b.click();b.remove();});
    await E(()=>{const P=window.__PH;for(let i=0;i<120;i++)P.step(1/60);});await draw();await wait(200);
    await page.screenshot({path:path.join(__dirname,'shots','gfx_'+pre+'_'+mode+'_select.jpg'),type:'jpeg',quality:88});console.log('select ok');}
  console.log(pre,mode,logs.length?logs.slice(0,5).join(' | '):'no page errors');await browser.close();process.exit(0);
})().catch(e=>{console.log('CRASH',e.message);process.exit(2);});`).replace("const shot=async(n,setup)=>{if(only.length&&!only.includes(n))return;","const shot=async(n,setup)=>{return;"));
