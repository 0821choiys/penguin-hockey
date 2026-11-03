const fs=require('fs');
const src=fs.readFileSync('/home/claude/work/species_svg.js','utf8');
const i=src.indexOf('function pengSVG(k)');let j=i,d=0,started=false;
for(;j<src.length;j++){const c=src[j];if(c==='{'){d++;started=true;}else if(c==='}'){d--;if(started&&d===0){j++;break;}}}
global.TYPES={fast:{patch:'gentoo',beak:[0xff4f16,0xff7d1c],foot:0xff7a1a}};
const peng=(0,eval)('('+src.slice(i,j)+')');
let p=peng('fast');
const inner=p.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
// foreground: penguin + stick + puck inside the 66/108 safe zone, transparent background
const fg=(bg)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="432" height="432">
${bg?`<defs><radialGradient id="g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#5fc3ff"/><stop offset=".55" stop-color="#1667b8"/><stop offset="1" stop-color="#0a2c5c"/></radialGradient></defs>
<rect width="108" height="108" fill="url(#g)"/>
<ellipse cx="54" cy="96" rx="64" ry="24" fill="#e8f6ff" opacity=".92"/>
<path d="M-8 90 Q54 74 116 90" stroke="#ff5a6e" stroke-width="2.2" fill="none" opacity=".85"/>
`:''}
${bg===2?'':`<g transform="translate(28.5 21) scale(.44)">
 <path d="M104 30 L94 118 Q93 128 82 128 L56 128" stroke="#3b2414" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M104 30 L94 118 Q93 128 82 128 L56 128" stroke="#c98a4b" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 ${inner}
 <ellipse cx="34" cy="133" rx="14" ry="5" fill="#111"/><ellipse cx="34" cy="131" rx="14" ry="5" fill="#2a2a2e"/>
</g>`}
</svg>`;
fs.writeFileSync('fg.svg',fg(0));fs.writeFileSync('bg.svg',fg(2));fs.writeFileSync('full.svg',fg(1));
