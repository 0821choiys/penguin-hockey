# Builds ovf.js (overflow / overlap scanner) from design.js's screen navigation.
src=open('/home/claude/work/br/design.js').read()
scan=r'''
    const vw=innerWidth,vh=innerHeight,res=[];
    const isVis=e=>{const dd=e.closest("details");if(dd&&!dd.open&&!e.closest("summary")&&e!==dd)return false;let x=e;while(x&&x!==document.documentElement){const cs=getComputedStyle(x);if(cs.display==="none"||cs.visibility==="hidden"||parseFloat(cs.opacity)<0.05)return false;x=x.parentElement;}return true;};
    const nm=e=>{let s=e.tagName.toLowerCase();if(e.id)s+="#"+e.id;const c=typeof e.className==="string"?e.className.trim():"";if(c)s+="."+c.split(/\s+/).slice(0,2).join(".");return s;};
    const tx=e=>(e.innerText||e.textContent||"").trim().replace(/\s+/g," ").slice(0,28);
    const scrollAnc=e=>{let x=e.parentElement;while(x&&x!==document.body){const cs=getComputedStyle(x);if(/(auto|scroll)/.test(cs.overflowY+" "+cs.overflowX))return x;x=x.parentElement;}return null;};
    const clipAnc=(e,r)=>{let x=e.parentElement;while(x&&x!==document.body){const cs=getComputedStyle(x);if(/(hidden|clip|auto|scroll)/.test(cs.overflowX+" "+cs.overflowY)){const q=x.getBoundingClientRect();if(r.left<q.left-1||r.right>q.right+1||r.top<q.top-1||r.bottom>q.bottom+1)return true;}x=x.parentElement;}return false;};
    const boxy=cs=>(cs.backgroundColor&&!/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor))||cs.backgroundImage!=="none"||parseFloat(cs.borderTopWidth)>0||cs.boxShadow!=="none";
    const midBreak=e=>{let prevTop=null,prevCh="";for(const n of e.childNodes){if(n.nodeType===1&&n.tagName==="BR"){prevTop=null;continue;}if(n.nodeType!==3)continue;for(let i=0;i<n.length;i++){const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);const q=r.getClientRects()[0];if(!q)continue;const t=Math.round(q.top);if(prevTop!==null&&t>prevTop+2&&!/[\s·,\/\-(→]/.test(prevCh)&&!/[\s→]/.test(n.data[i]))return n.data.slice(Math.max(0,i-3),i)+"|"+n.data.slice(i,i+3);prevTop=t;prevCh=n.data[i];}}return "";};
    const els=[...document.querySelectorAll("body *")].filter(e=>{if(/^(SCRIPT|STYLE|CANVAS|BR)$/.test(e.tagName)||e.closest("svg")&&e.tagName!=="svg")return false;if(e.closest("#achPop"))return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&isVis(e);});
    for(const e of els){const r=e.getBoundingClientRect(),cs=getComputedStyle(e);
      if(/(hidden|clip)/.test(cs.overflowX)&&e.scrollWidth>e.clientWidth+2&&cs.textOverflow!=="ellipsis"&&e.clientWidth>0&&!/pc-art|pc /.test(" "+e.className+" "))res.push("clipX "+nm(e)+" ["+tx(e)+"] "+e.scrollWidth+">"+e.clientWidth);
      if(/(visible)/.test(cs.overflowX)&&e.childElementCount===0&&e.scrollWidth>e.clientWidth+2&&e.clientWidth>0&&cs.display!=="inline")res.push("spillX "+nm(e)+" ["+tx(e)+"] "+e.scrollWidth+">"+e.clientWidth);
      const sa=scrollAnc(e);
      if(!sa&&cs.position!=="fixed"&&(r.left<-1||r.right>vw+1||r.top<-1||r.bottom>vh+1)&&!clipAnc(e,r))res.push("offscreen "+nm(e)+" ["+tx(e)+"] ("+Math.round(r.left)+","+Math.round(r.top)+","+Math.round(r.right)+","+Math.round(r.bottom)+")");
      if(cs.position==="fixed"&&(r.left<-1||r.right>vw+1||r.top<-1||r.bottom>vh+1)&&r.width<vw*1.5&&!e.classList.contains("screen"))res.push("fixedOff "+nm(e)+" ["+tx(e)+"] ("+Math.round(r.left)+","+Math.round(r.top)+","+Math.round(r.right)+","+Math.round(r.bottom)+")");
      const t=tx(e);if(t.length>1&&t.length<=30&&[...e.childNodes].some(n=>n.nodeType===3&&n.data.trim())){const lh=parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.25;if(r.height>lh*1.6){const mb=midBreak(e);if(mb)res.push("midBreak "+nm(e)+" ["+t+"] at "+mb);}}
      if(boxy(cs)&&!/(hidden|clip|auto|scroll)/.test(cs.overflowX+cs.overflowY)&&e.tagName!=="BODY"&&e.tagName!=="HTML")for(const c of e.children){const q=c.getBoundingClientRect();if(q.width<1||q.height<1||!isVis(c))continue;const cc=getComputedStyle(c);if(cc.position==="fixed")continue;
        const o=Math.max(r.left-q.left,q.right-r.right,r.top-q.top,q.bottom-r.bottom);if(o>3)res.push("stickOut "+nm(c)+" ["+tx(c)+"] out of "+nm(e)+" by "+Math.round(o)+"px");}
      if(e.matches(".screen.on .panel,.screen.on .col")&&!e.parentElement.closest(".panel")){const p=document.getElementById("pts");if(p&&getComputedStyle(p).display!=="none"){const q=p.getBoundingClientRect();if(q.right>r.left+4&&q.left<r.right-4&&q.bottom>r.top&&q.top<r.bottom)res.push("ptsOverlap "+nm(e));}}
    }
    const vr=e=>{let r=e.getBoundingClientRect(),L=r.left,T=r.top,Rr=r.right,B=r.bottom;let x=e.parentElement;while(x&&x!==document.body){const cs=getComputedStyle(x);if(/(hidden|clip|auto|scroll)/.test(cs.overflowX+" "+cs.overflowY)){const q=x.getBoundingClientRect();L=Math.max(L,q.left);T=Math.max(T,q.top);Rr=Math.min(Rr,q.right);B=Math.min(B,q.bottom);}x=x.parentElement;}return Rr-L>1&&B-T>1?{left:L,top:T,right:Rr,bottom:B}:null;};
    {const I=els.filter(e=>e.matches("button,[data-go],[data-mode],[data-act],input,summary,a,#pts")&&!(e.parentElement&&e.parentElement.closest("button")));
      for(let i=0;i<I.length;i++)for(let j=i+1;j<I.length;j++){const a=I[i],b=I[j];if(a.contains(b)||b.contains(a))continue;const p=vr(a),q=vr(b);if(!p||!q)continue;
        const w=Math.min(p.right,q.right)-Math.max(p.left,q.left),h=Math.min(p.bottom,q.bottom)-Math.max(p.top,q.top);if(w>2&&h>2)res.push("overlap "+nm(a)+" ["+tx(a)+"] x "+nm(b)+" ["+tx(b)+"] "+Math.round(w)+"x"+Math.round(h));}}
    return [...new Set(res)];'''
assert "'" not in scan, 'scan must only use double quotes'
src=src.replace("  await page.evaluateOnNewDocument(s=>{localStorage.setItem('penguinHockey.v1',s);},process.env.SAVE||SAVE);",
 "  await page.evaluateOnNewDocument(s=>{localStorage.setItem('penguinHockey.v1',s);},process.env.SAVE||SAVE);\n  await page.evaluateOnNewDocument('window.__scan=()=>{'+"+repr(scan)+"+'};');",1)
src=src.replace("const shot=async n=>{await wait(350);await page.screenshot({path:'shots/'+pre+'_'+mode+'_'+n+'.jpg',type:'jpeg',quality:74});};",
 "const shot=async n=>{await wait(350);await page.evaluate(()=>{try{document.getAnimations().forEach(a=>{try{if(a.effect&&a.effect.getTiming().iterations!==Infinity)a.finish()}catch(e){}})}catch(e){}});const r=await page.evaluate(()=>window.__scan());console.log('### '+n+' ('+r.length+')');r.forEach(x=>console.log('   '+x));if(process.env.SHOTS)await page.screenshot({path:'shots/'+pre+'_'+mode+'_'+n+'.jpg',type:'jpeg',quality:74});};")
assert 'window.__scan' in src and "window.__scan())" in src
open('/home/claude/work/br/ovf.js','w').write(src)
print('ovf.js written')
