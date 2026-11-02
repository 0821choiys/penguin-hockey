const fs=require('fs');
function mk(){
  const f=function(){};
  const p=new Proxy(f,{
    get(t,k){
      if(k===Symbol.toPrimitive)return()=>0;
      if(typeof k==='symbol')return undefined;
      if(k==='then')return undefined;
      if(k==='length'||k==='count')return 0;
      if(k==='style'||k==='dataset')return t[k]||(t[k]=Object.assign({setProperty(){}},{}));
      if(k==='children')return [mk()];
      if(k==='classList')return {add(){},remove(){},toggle(){},contains(){return false}};
      if(k==='getContext')return()=>mk();
      if(k==='getBoundingClientRect')return()=>({left:0,top:0,width:0,height:0});
      if(Object.prototype.hasOwnProperty.call(t,k)&&!['name','prototype','arguments','caller'].includes(k))return t[k];
      return mk();
    },
    set(t,k,v){t[k]=v;return true},
    apply(){return mk()},
    construct(){return mk()}
  });
  return p;
}
const store={};
global.window=global;global.__NOFX=true;
global.localStorage={getItem:k=>store[k]===undefined?null:store[k],setItem:(k,v)=>{store[k]=String(v)}};
if(process.env.SAVE)store['penguinHockey.v1']=process.env.SAVE;
global.THREE=mk();
global.matchMedia=q=>({matches:!!(process.env.COARSE&&/coarse/.test(String(q)))});   // COARSE=1: a phone / tablet (touch-first pointer)
global.innerWidth=1280;global.innerHeight=720;global.devicePixelRatio=1;
global.document={querySelector:()=>mk(),querySelectorAll:()=>[],getElementById:()=>mk(),createElement:()=>mk(),addEventListener(){},head:mk(),body:mk()};
global.addEventListener=()=>{};
global.requestAnimationFrame=()=>{};
global.AudioContext=undefined;
global.location={search:'?lang='+(process.env.PH_LANG||'ko'),href:'file:///x'};
(0,eval)(fs.readFileSync(__dirname+'/i18n.js','utf8'));
(0,eval)(fs.readFileSync(__dirname+'/loader.js','utf8'));
(0,eval)(fs.readFileSync(__dirname+'/main.js','utf8'));
module.exports=window.__PH;
