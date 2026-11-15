/* ================= v46: 👕 team kit designer — colours, pattern, mascot, crest (2026-11-14) ================= */
// The owner: "let the player design our team's uniform — pick the colours and the mascot and customise it". So:
//  · save.kit: main colour, accent colour, pattern (6), mascot (12, drawn as crest art), crest shape (3); on / off
//  · the player's team wears it everywhere the team colour shows: jersey (pattern + crest on the chest + number on the back),
//    scarf stripes, hats, flippers, stick band, goalie gear, the score board, card portraits, the goal light
//  · the other team keeps its colour unless the two would look alike — then it changes to the most different spare colour
//  · online friend matches: each player brings their own kit (sent with the player info); both devices pick the same colours
//  · nothing to buy: every colour, pattern and mascot is free
var KIT_DEF={blue:0x2f7bff,red:0xff3b4e};
var KIT={
  c1:['#2f7bff','#ff3b4e','#0d2f6b','#00a3e0','#14b8a6','#18a058','#0f5a3c','#f59e0b','#ff7a1a','#c8102e','#e8266f','#8a4dff','#4b2a7b','#7a1f3d','#5b6b80','#1f2329'],
  c2:['#ffffff','#ffd24a','#0b1e33','#c9d2db','#9be7ff','#ff8fb1','#ff7a1a','#35e08a','#ff3b4e','#2f7bff'],
  alt:[0xff3b4e,0x2f7bff,0x18a058,0x8a4dff,0xff7a1a,0x1f2329],
  pat:['classic','hoops','stripes','sash','split','chevron'],crest:['circle','shield','hex'],
  mas:['peng','orca','bear','seal','walrus','fox','owl','fish','narwhal','flake','berg','bolt'],
  clash:150
};
var KIT_PATN={classic:__L('클래식'),hoops:__L('가로 줄무늬'),stripes:__L('세로 줄무늬'),sash:__L('어깨띠'),split:__L('반반'),chevron:__L('브이 라인')};
var KIT_CRN={circle:__L('원형'),shield:__L('방패'),hex:__L('육각형')};
var KIT_MASN={peng:__L('펭귄'),orca:__L('범고래'),bear:__L('북극곰'),seal:__L('물범'),walrus:__L('바다코끼리'),fox:__L('북극여우'),owl:__L('흰올빼미'),fish:__L('정어리'),narwhal:__L('일각고래'),flake:__L('눈꽃'),berg:__L('빙산'),bolt:__L('번개')};
// mascot art in a 100×100 box: d = the dark silhouette, h = cut-outs in the crest field colour, x = accent parts, k = dark details on top
function kitFlake(){let d='';for(let i=0;i<6;i++){const a=i*Math.PI/3,c=Math.cos(a),s=Math.sin(a),P=(x,y)=>(50+x*c-y*s).toFixed(1)+' '+(50+x*s+y*c).toFixed(1);
  d+='M'+P(-3.2,0)+'L'+P(-3.2,-36)+'L'+P(0,-40)+'L'+P(3.2,-36)+'L'+P(3.2,0)+'Z';
  d+='M'+P(1.5,-20)+'L'+P(13,-31)+'L'+P(15.5,-28.5)+'L'+P(4,-17)+'Z'+'M'+P(-1.5,-20)+'L'+P(-13,-31)+'L'+P(-15.5,-28.5)+'L'+P(-4,-17)+'Z';
  d+='M'+P(1.5,-9)+'L'+P(8,-15.5)+'L'+P(10,-13.5)+'L'+P(3.5,-7)+'Z'+'M'+P(-1.5,-9)+'L'+P(-8,-15.5)+'L'+P(-10,-13.5)+'L'+P(-3.5,-7)+'Z';}
  return d+'M50 41a9 9 0 1 0 .01 0Z';}
var KIT_ART={
  peng:{d:'M50 11C63.5 11 72.5 21.5 72.5 34.5C72.5 39.5 71.6 43.6 70.3 47C78.8 53.6 84.5 64.6 84.5 76.5C84.5 88.5 74.5 94 61 94H39C25.5 94 15.5 88.5 15.5 76.5C15.5 64.6 21.2 53.6 29.7 47C28.4 43.6 27.5 39.5 27.5 34.5C27.5 21.5 36.5 11 50 11Z',
    h:'M50 45C39.5 45 33 55.5 33 69C33 82.5 40 90 50 90C60 90 67 82.5 67 69C67 55.5 60.5 45 50 45ZM36.5 31.5a6 6.5 0 1 0 12 0a6 6.5 0 1 0-12 0ZM51.5 31.5a6 6.5 0 1 0 12 0a6 6.5 0 1 0-12 0Z',
    x:'M43.5 39.5C45.5 37.5 54.5 37.5 56.5 39.5C55 43 52.5 45.5 50 46.5C47.5 45.5 45 43 43.5 39.5ZM33 91.5C34.5 87 43 86.5 46 91.5ZM54 91.5C57 86.5 65.5 87 67 91.5Z',
    k:'M40 32.5a3.4 3.8 0 1 0 6.8 0a3.4 3.8 0 1 0-6.8 0ZM53.2 32.5a3.4 3.8 0 1 0 6.8 0a3.4 3.8 0 1 0-6.8 0Z',
    w:'M44.2 30.6a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0ZM57.4 30.6a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0-2.6 0Z'},
  orca:{d:'M8 63C15 44 33 32 55 31C68 30.5 79 35 86 43C90 47.5 92.5 52.5 92 57C91.5 61 87.5 62 84 60.5C81 59 77.5 58.5 74 59.5C66 67 54.5 72 42 73.5C38 79.5 32 84.5 24.5 87.5C27.5 81.5 29.5 77 30 72.5C22.5 70.5 14.5 67.5 8 63ZM47 32.5C48.5 21 53 12 60.5 6C60 15 60.5 24.5 63 32Z',
    h:'M68 42.5C71.5 39.5 77 39.5 80 42.5C77.5 45.5 72 46 68 42.5ZM28.5 67C41 67.5 55 65 66.5 58.5C61 66.5 51 71 39.5 71.5C34.5 71 30.5 69.5 28.5 67Z',
    x:'M10 63.5L1.5 54.5C5.5 56 9.5 57.5 12.5 60ZM10 63.5L3 73.5C7 72 10.5 70 13.5 67Z'},
  bear:{d:'M27 17a10 10 0 1 0 .01 0ZM73 17a10 10 0 1 0 .01 0ZM50 20C67 20 80 31 81.5 46C83 59 77 71 66.5 77.5C62 80.5 56.5 82 50 82C43.5 82 38 80.5 33.5 77.5C23 71 17 59 18.5 46C20 31 33 20 50 20Z',
    h:'M27 22.5a5 5 0 1 0 .01 0ZM73 22.5a5 5 0 1 0 .01 0ZM50 51C59.5 51 66 57 66 64.5C66 72 59 77 50 77C41 77 34 72 34 64.5C34 57 40.5 51 50 51ZM35 44a4.2 4.6 0 1 0 8.4 0a4.2 4.6 0 1 0-8.4 0ZM56.6 44a4.2 4.6 0 1 0 8.4 0a4.2 4.6 0 1 0-8.4 0Z',
    k:'M42.5 57.5C43 54 57 54 57.5 57.5C58 61 53.5 64.5 50 64.5C46.5 64.5 42 61 42.5 57.5ZM49 64h2v4.5c2.5 2.5 5.5 3 8 1.5l.9 1.6c-3.2 1.9-7 1.4-9.9-1.1c-2.9 2.5-6.7 3-9.9 1.1l.9-1.6c2.5 1.5 5.5 1 8-1.5ZM37.5 45a2.4 2.7 0 1 0 4.8 0a2.4 2.7 0 1 0-4.8 0ZM57.7 45a2.4 2.7 0 1 0 4.8 0a2.4 2.7 0 1 0-4.8 0Z'},
  seal:{d:'M50 18C69 18 83 32 83 51C83 70 69 84 50 84C31 84 17 70 17 51C17 32 31 18 50 18Z',
    h:'M41.5 55C48 55 51 59 51 64C51 69.5 46.5 73 41 73C35 73 31 69.5 31 64.5C31 59 35 55 41.5 55ZM58.5 55C65 55 69 59 69 64.5C69 69.5 65 73 59 73C53.5 73 49 69.5 49 64C49 59 52 55 58.5 55ZM29.5 45a7.5 8.5 0 1 0 15 0a7.5 8.5 0 1 0-15 0ZM55.5 45a7.5 8.5 0 1 0 15 0a7.5 8.5 0 1 0-15 0Z',
    k:'M31.5 46a5.8 6.8 0 1 0 11.6 0a5.8 6.8 0 1 0-11.6 0ZM56.9 46a5.8 6.8 0 1 0 11.6 0a5.8 6.8 0 1 0-11.6 0ZM45 56.5C45 53.5 55 53.5 55 56.5C55 59.5 52 62 50 62C48 62 45 59.5 45 56.5ZM37 63a1.4 1.4 0 1 0 .01 0ZM42 66.5a1.4 1.4 0 1 0 .01 0ZM63 63a1.4 1.4 0 1 0 .01 0ZM58 66.5a1.4 1.4 0 1 0 .01 0Z',
    w:'M35 43.5a2 2.3 0 1 0 4 0a2 2.3 0 1 0-4 0ZM60.4 43.5a2 2.3 0 1 0 4 0a2 2.3 0 1 0-4 0Z'},
  walrus:{d:'M50 16C68 16 81 28.5 81 45C81 55 75.5 62 68.5 64.5C66.5 71 59.5 75.5 50 75.5C40.5 75.5 33.5 71 31.5 64.5C24.5 62 19 55 19 45C19 28.5 32 16 50 16ZM38.2 64L35.5 97.5L48 94L49.6 65.5ZM61.8 64L64.5 97.5L52 94L50.4 65.5Z',
    h:'M41 49C50 49 52.5 54 52.5 59.5C52.5 65.5 47.5 69 41.5 69C34.5 69 30 65 30 59C30 53 33.5 49 41 49ZM59 49C66.5 49 70 53 70 59C70 65 65.5 69 58.5 69C52.5 69 47.5 65.5 47.5 59.5C47.5 54 50 49 59 49ZM40.6 67L38.4 94.2L45.8 92L47.2 68.2ZM59.4 67L61.6 94.2L54.2 92L52.8 68.2ZM34 38a3.6 3.9 0 1 0 7.2 0a3.6 3.9 0 1 0-7.2 0ZM58.8 38a3.6 3.9 0 1 0 7.2 0a3.6 3.9 0 1 0-7.2 0Z',
    k:'M43.5 50.5C43.5 47.5 56.5 47.5 56.5 50.5C56.5 53.5 53 55.5 50 55.5C47 55.5 43.5 53.5 43.5 50.5ZM36 58.5a1.4 1.4 0 1 0 .01 0ZM40.5 62a1.4 1.4 0 1 0 .01 0ZM45 58.5a1.4 1.4 0 1 0 .01 0ZM64 58.5a1.4 1.4 0 1 0 .01 0ZM59.5 62a1.4 1.4 0 1 0 .01 0ZM55 58.5a1.4 1.4 0 1 0 .01 0ZM35.8 38.6a1.9 2.1 0 1 0 3.8 0a1.9 2.1 0 1 0-3.8 0ZM60.6 38.6a1.9 2.1 0 1 0 3.8 0a1.9 2.1 0 1 0-3.8 0Z'},
  fox:{d:'M50 85C39.5 85 29.5 77.5 23.5 67L12.5 27C11.5 19 18.5 17 24 22.5L38 36.5C42 35 46 34.3 50 34.3C54 34.3 58 35 62 36.5L76 22.5C81.5 17 88.5 19 87.5 27L76.5 67C70.5 77.5 60.5 85 50 85Z',
    h:'M23 58C32 55.5 42.5 60 50 70.5C57.5 60 68 55.5 77 58C72.5 72.5 62 82.5 50 85C38 82.5 27.5 72.5 23 58ZM19.5 28.5L32.5 41L25.5 46.5ZM80.5 28.5L67.5 41L74.5 46.5Z',
    x:'M32.5 51.5C35.5 47 41.5 46.5 45.5 50C42 54 36.5 55 32.5 51.5ZM67.5 51.5C64.5 47 58.5 46.5 54.5 50C58 54 63.5 55 67.5 51.5Z',
    k:'M45.5 72.5C45.5 70 54.5 70 54.5 72.5C54.5 75 52 77.5 50 77.5C48 77.5 45.5 75 45.5 72.5ZM37 51a2.3 2.3 0 1 0 .01 0ZM63 51a2.3 2.3 0 1 0 .01 0Z'},
  owl:{d:'M50 12C35 12 23.5 22 21 36L17 30C16 37 17 41 19.5 45C18 60 23 75 34 84C38.5 88 44 90 50 90C56 90 61.5 88 66 84C77 75 82 60 80.5 45C83 41 84 37 83 30L79 36C76.5 22 65 12 50 12Z',
    h:'M37.5 28C46 28 51.5 35 50 44C51.5 35 54 28 62.5 28C71.5 28 77.5 35.5 77.5 44C77.5 53 71 59 62.5 59C56.5 59 52 56 50 51C48 56 43.5 59 37.5 59C29 59 22.5 53 22.5 44C22.5 35.5 28.5 28 37.5 28ZM36 68l4 3 4-3v2.6l-4 3-4-3ZM46 68l4 3 4-3v2.6l-4 3-4-3ZM56 68l4 3 4-3v2.6l-4 3-4-3ZM41 77l4 3 4-3v2.6l-4 3-4-3ZM51 77l4 3 4-3v2.6l-4 3-4-3Z',
    x:'M29.5 44a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0ZM53.5 44a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0Z',
    k:'M33 44a5 5 0 1 0 10 0a5 5 0 1 0-10 0ZM57 44a5 5 0 1 0 10 0a5 5 0 1 0-10 0ZM45.5 51.5L54.5 51.5L50 61Z',
    w:'M38.6 41.6a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0ZM62.6 41.6a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0Z'},
  fish:{d:'M15 50C26 34 47 27.5 67 32.5C76 35 83 41 88 48.5C83 56 76 61.5 67 64C47 69 26 63.5 15 50ZM18 50L4 34C7 43 7 57 4 66Z',
    h:'M70.5 46a5 5 0 1 0 10 0a5 5 0 1 0-10 0ZM61 37.5C65 43.5 65 53 61 59C62.5 52.5 62.5 44 61 37.5ZM24 55C37 61.5 55 62 70 57C56 64 37 64 24 55Z',
    x:'M28 45.5a3 3 0 1 0 6 0a3 3 0 1 0-6 0ZM38 43a3 3 0 1 0 6 0a3 3 0 1 0-6 0ZM48 42a3 3 0 1 0 6 0a3 3 0 1 0-6 0ZM40 34L48 22L58 31C52 30.5 46 31.5 40 34ZM44 64L50 74L58 64.5C53 65.5 48.5 65.5 44 64Z',
    k:'M73 46.3a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0-5.6 0Z'},
  narwhal:{d:'M12 62C17 48 33 39 54 39C67 39 77.5 44.5 82 52.5C84 56.5 82 61 77.5 62.5C65.5 68.5 46.5 70.5 30 68.5C24.5 74.5 18 77 11 79C13.5 73 15.5 68.5 17.5 64.5C15.5 64 13.5 63 12 62Z',
    h:'M70 50a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0-6.8 0ZM30 65C44 66 60 64.5 73 60C62 66.5 45 68.5 32 67.5Z',
    x:'M79.5 47.5L98.5 27.5L83 51ZM14 64L4 55C7.5 56 11.5 57.5 15 60.5ZM14 64L6 73.5C9.5 72 13 70 16 67ZM38 48a2.2 2.2 0 1 0 .01 0ZM46 45a2.2 2.2 0 1 0 .01 0ZM54 47.5a2.2 2.2 0 1 0 .01 0ZM44 54a2.2 2.2 0 1 0 .01 0ZM60 43.5a2 2 0 1 0 .01 0Z',
    k:'M72 50.3a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z'},
  flake:{d:kitFlake(),h:'M50 45.5L53.9 47.75V52.25L50 54.5L46.1 52.25V47.75Z'},
  berg:{d:'M8 72L32 30L42 42L56 17L92 72Z',
    h:'M56 17L65.5 31.5L59 29.5L53 37L48.5 32ZM32 30L39 39.5L35 38.5L31 43L28.5 37Z',
    x:'M4 79C12 74.5 20 83.5 28 79S44 74.5 52 79S68 83.5 76 79S92 74.5 96 77.5V86H4ZM10 90C18 86.5 26 93.5 34 90S50 86.5 58 90S74 93.5 82 90S94 87.5 96 89V94H10Z'},
  bolt:{d:'M60 6L20 57H45L36 94L80 39H54L66 6Z',x:'M60 6L66 6L54 39H48ZM45 57L36 94L41 87L49 57Z'}
};
var KIT_SHAPE={circle:'M50 2a48 48 0 1 0 .01 0Z',shield:'M50 2L93 13.5V47C93 72 75 89.5 50 98C25 89.5 7 72 7 47V13.5Z',hex:'M50 2L91.6 26V74L50 98L8.4 74V26Z'};
const kitHex=n=>'#'+(n>>>0).toString(16).padStart(6,'0').slice(-6),kitNum=h=>parseInt(String(h).slice(1),16)>>>0;
function kitRGB(h){const n=typeof h==='number'?h:kitNum(h);return [(n>>16)&255,(n>>8)&255,n&255];}
function kitLum(h){const c=kitRGB(h);return (c[0]*.299+c[1]*.587+c[2]*.114)/255;}
function kitDist(a,b){const p=kitRGB(a),q=kitRGB(b),r=(p[0]+q[0])/2,dr=p[0]-q[0],dg=p[1]-q[1],db=p[2]-q[2];return Math.sqrt((2+r/256)*dr*dr+4*dg*dg+(2+(255-r)/256)*db*db);}
function kitMix(a,b,t){const p=kitRGB(a),q=kitRGB(b);return '#'+p.map((v,i)=>Math.round(v+(q[i]-v)*t).toString(16).padStart(2,'0')).join('');}
const KIT_FIELD='#f7fafd',KIT_INK='#0b1e33';
// the accent used on the white crest field / the jersey: the chosen one, unless it would not show there
function kitAcc(k){return kitLum(k.c2)>.8||kitDist(k.c2,KIT_INK)<90?k.c1:k.c2;}
// a clean copy of any kit (own save, or what a friend sent): unknown values fall back to the defaults
function kitClean(q){q=q&&typeof q==='object'?q:{};const hx=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():null;
  return {on:q.on?1:0,c1:KIT.c1.includes(hx(q.c1))?hx(q.c1):KIT.c1[0],c2:KIT.c2.includes(hx(q.c2))?hx(q.c2):KIT.c2[0],
    pat:KIT.pat.includes(q.pat)?q.pat:'classic',crest:KIT.crest.includes(q.crest)?q.crest:'circle',mas:KIT.mas.includes(q.mas)?q.mas:'peng'};}
function kit(){const k=kitClean(save.kit);save.kit=k;return k;}
function kitSig(k){return k?[k.c1,k.c2,k.pat,k.crest,k.mas].join(''):'';}
// the crest (shape + rings + mascot) as SVG
function kitCrestSvg(k,sz,cls){
  const A=KIT_ART[k.mas]||KIT_ART.peng,S=KIT_SHAPE[k.crest]||KIT_SHAPE.circle,acc=kitAcc(k),sc=k.crest==='shield'?.68:k.crest==='hex'?.68:.72;
  const t=s=>'translate(50 50) scale('+s+') translate(-50 -50)',ring2=kitLum(k.c2)>.8&&kitLum(k.c1)>.6?KIT_INK:k.c2;
  return '<svg class="kit-crest'+(cls?' '+cls:'')+'" viewBox="-3 -3 106 106"'+(sz?' width="'+sz+'" height="'+sz+'"':'')+' aria-hidden="true">'
    +'<path d="'+S+'" fill="'+k.c1+'" stroke="#fff" stroke-width="3"/><path d="'+S+'" fill="'+ring2+'" transform="'+t(.88)+'"/><path d="'+S+'" fill="'+KIT_FIELD+'" transform="'+t(.82)+'"/>'
    +'<g transform="'+t(sc)+(k.crest==='shield'?' translate(0 -2)':'')+'"><path d="'+A.d+'" fill="'+KIT_INK+'"/>'+(A.h?'<path d="'+A.h+'" fill="'+KIT_FIELD+'"/>':'')+(A.x?'<path d="'+A.x+'" fill="'+acc+'"/>':'')+(A.k?'<path d="'+A.k+'" fill="'+KIT_INK+'"/>':'')+(A.w?'<path d="'+A.w+'" fill="'+KIT_FIELD+'"/>':'')+'</g>'
    +'<path d="'+S+'" fill="none" stroke="'+kitMix(k.c1,'#000000',.35)+'" stroke-width="1.2" transform="'+t(.82)+'"/></svg>';
}
// --- the jersey, as an SVG sweater (front / back) for the designer ---
const KIT_SW='M38 10L50 6C54 12 66 12 70 6L82 10L110 30Q114 33 112 37L100 58Q98 61 95 59L88 54V112Q88 116 84 116H36Q32 116 32 112V54L25 59Q22 61 20 58L8 37Q6 33 10 30Z';
function kitPatSvg(k,back){const a=k.c2,dk=kitMix(k.c1,'#000000',.38),p=k.pat;
  if(p==='classic')return '<path d="M0 0H120V22H0Z" fill="'+dk+'"/><path d="M0 22H120V25H0Z" fill="'+a+'"/><path d="M0 94H120V99H0ZM0 106H120V110H0Z" fill="'+a+'"/><path d="M0 99H120V106H0Z" fill="'+dk+'"/><path d="M8 37L20 58L26 54L14 33ZM112 37L100 58L94 54L106 33Z" fill="'+a+'"/>';
  if(p==='hoops')return '<path d="M0 36H120V46H0ZM0 60H120V70H0ZM0 84H120V94H0Z" fill="'+a+'"/><path d="M0 0H120V14H0Z" fill="'+dk+'"/>';
  if(p==='stripes'){let d='';for(let x=4;x<120;x+=12)d+='M'+x+' 0h3.4v124H'+x+'Z';return '<path d="'+d+'" fill="'+a+'"/><path d="M0 0H120V12H0Z" fill="'+dk+'"/>';}
  if(p==='sash')return back?'<path d="M90 8L106 8L44 124L28 124Z" fill="'+a+'"/><path d="M0 104H120V110H0Z" fill="'+dk+'"/>':'<path d="M30 8L46 8L108 124L92 124Z" fill="'+a+'"/><path d="M0 104H120V110H0Z" fill="'+dk+'"/>';
  if(p==='split')return '<path d="M60 0H120V124H60Z" fill="'+a+'"/><path d="M0 0H120V12H0Z" fill="'+dk+'" opacity=".85"/><path d="M58.5 0h3v124h-3Z" fill="'+dk+'"/>';
  if(p==='chevron')return back?'<path d="M0 100H120V108H0Z" fill="'+a+'"/><path d="M0 0H120V14H0Z" fill="'+dk+'"/>':'<path d="M18 24L60 62L102 24V38L60 76L18 38Z" fill="'+a+'"/><path d="M0 0H120V14H0Z" fill="'+dk+'"/><path d="M0 100H120V108H0Z" fill="'+a+'"/>';
  return '';}
function kitJerseySvg(k,back,num,club){
  const u='kj'+(++stkUid),lite=kitMix(k.c1,'#ffffff',.16),dk=kitMix(k.c1,'#000000',.38),n=String(num==null?7:num),nc=kitLum(k.c2)>.8||kitDist(k.c2,k.c1)>200?k.c2:'#ffffff';
  let h='<svg class="kit-jer" viewBox="0 0 120 124" aria-hidden="true"><defs><clipPath id="'+u+'c"><path d="'+KIT_SW+'"/></clipPath><linearGradient id="'+u+'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+lite+'"/><stop offset="1" stop-color="'+k.c1+'"/></linearGradient>'
    +'<linearGradient id="'+u+'s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>'
    +'<pattern id="'+u+'k" patternUnits="userSpaceOnUse" width="3" height="3"><path d="M0 0l1.5 3L3 0" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width=".6"/></pattern></defs>'
    +'<g clip-path="url(#'+u+'c)"><rect width="120" height="124" fill="url(#'+u+'g)"/>'+kitPatSvg(k,back)+'<rect width="120" height="124" fill="url(#'+u+'k)"/><rect width="120" height="124" fill="url(#'+u+'s)"/></g>';
  h+=back?'<path d="M50 6C54 10 66 10 70 6" fill="none" stroke="'+dk+'" stroke-width="3"/>':'<path d="M50 6C53 13 67 13 70 6L66 5.4C63 10 57 10 54 5.4Z" fill="'+dk+'"/><path d="M50 6C53 13 67 13 70 6" fill="none" stroke="'+k.c2+'" stroke-width="1.4"/>';
  h+='<path d="'+KIT_SW+'" fill="none" stroke="#06121f" stroke-opacity=".55" stroke-width="1.2"/>';
  if(back){if(club)h+='<text x="60" y="38" text-anchor="middle" font-size="9" font-weight="900" fill="'+nc+'" stroke="'+dk+'" stroke-width="2" paint-order="stroke" font-family="Arial,sans-serif">'+String(club).replace(/[<>&"]/g,'').slice(0,12).toUpperCase()+'</text>';
    h+='<text x="60" y="80" text-anchor="middle" font-size="40" font-weight="900" fill="'+nc+'" stroke="'+dk+'" stroke-width="4.5" paint-order="stroke" font-family="Arial Black,Arial,sans-serif">'+n+'</text>';}
  else h+='<g transform="translate(43 30) scale(.34)">'+kitCrestSvg(k).replace('<svg ','<svg width="100" height="100" ')+'</g>';
  return h+'</svg>';
}
// --- the jersey in 3D: same canvas layout as pkJerseyMat (front centre at x = 0 / 512, back at 256, neck at the top) ---
function kitCrestDraw(x,k,cx,cy,r,ry){ry=ry||r;
  if(typeof Path2D==='undefined')return;const A=KIT_ART[k.mas]||KIT_ART.peng,S=new Path2D(KIT_SHAPE[k.crest]||KIT_SHAPE.circle),acc=kitAcc(k),
    sc=k.crest==='shield'?.68:k.crest==='hex'?.68:.72,ring2=kitLum(k.c2)>.8&&kitLum(k.c1)>.6?KIT_INK:k.c2;
  x.save();x.translate(cx-r,cy-ry);x.scale(r/50,ry/50);
  x.fillStyle='#ffffff';x.save();x.translate(50,50);x.scale(1.07,1.07);x.translate(-50,-50);x.fill(S);x.restore();
  x.fillStyle=k.c1;x.fill(S);
  const sub=(s,col)=>{x.save();x.translate(50,50);x.scale(s,s);x.translate(-50,-50);x.fillStyle=col;x.fill(S);x.restore();};
  sub(.88,ring2);sub(.82,KIT_FIELD);
  x.translate(50,50);x.scale(sc,sc);x.translate(-50,k.crest==='shield'?-52:-50);
  for(const [p,c] of[[A.d,KIT_INK],[A.h,KIT_FIELD],[A.x,acc],[A.k,KIT_INK],[A.w,KIT_FIELD]])if(p){x.fillStyle=c;x.fill(new Path2D(p));}
  x.restore();
}
function kitPaint(x,k,num){
  const c1=k.c1,a=k.c2,dk=kitMix(c1,'#000000',.4),lite=kitMix(c1,'#ffffff',.16),p=k.pat;
  const gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,lite);gr.addColorStop(1,c1);x.fillStyle=gr;x.fillRect(0,0,512,256);
  const band=(y,h,c)=>{x.fillStyle=c;x.fillRect(0,y,512,h);},twice=f=>{for(const o of[0,512]){x.save();x.translate(o,0);f();x.restore();}};
  if(p==='classic'){band(0,40,dk);band(40,7,a);band(192,15,a);band(211,11,dk);band(226,9,a);}
  else if(p==='hoops'){band(0,26,dk);band(66,22,a);band(116,22,a);band(196,22,a);}
  else if(p==='stripes'){band(0,24,dk);x.fillStyle=a;for(let i=0;i<512;i+=32)x.fillRect(i+11,24,10,232);}
  else if(p==='sash'){band(212,12,dk);x.fillStyle=a;twice(()=>{x.beginPath();x.moveTo(-96,0);x.lineTo(-40,0);x.lineTo(120,256);x.lineTo(64,256);x.closePath();x.fill();});}
  else if(p==='split'){x.fillStyle=a;x.fillRect(256,0,256,256);band(0,24,dk);x.fillStyle=dk;x.fillRect(253,0,6,256);x.fillRect(0,0,3,256);x.fillRect(509,0,3,256);}
  else if(p==='chevron'){band(0,26,dk);band(206,14,a);x.fillStyle=a;twice(()=>{x.beginPath();x.moveTo(-170,44);x.lineTo(0,150);x.lineTo(170,44);x.lineTo(170,76);x.lineTo(0,182);x.lineTo(-170,76);x.closePath();x.fill();});}
  x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
  const nc=kitLum(a)>.8||kitDist(a,c1)>200?a:'#ffffff';
  x.font='900 100px "Arial Black",Arial,sans-serif';x.lineWidth=14;x.strokeStyle=dk;x.strokeText(String(num),256,124);x.fillStyle=nc;x.fillText(String(num),256,124);
  // the texture wraps round the body: ~3.2× more pixels per unit up than across, so the crest is drawn tall to look round
  for(const cx of[0,512])kitCrestDraw(x,k,cx,112,20,64);
}
function kitJerseyMat(teamKey,num,k){const lo=pkLo(),key='jk'+teamKey+num+lo+kitSig(k);if(pkMatC[key])return pkMatC[key];
  const c=document.createElement('canvas');c.width=lo?256:512;c.height=lo?128:256;const x=c.getContext('2d');if(lo)x.scale(.5,.5);
  kitPaint(x,k,num);
  for(let i=0;i<1400;i++){x.fillStyle='rgba(255,255,255,'+(pkRand()*.05)+')';x.fillRect(pkRand()*512,pkRand()*256,2,1);}
  const t=new T.CanvasTexture(c);t.anisotropy=Math.min(4,maxAniso||1);
  return pkMatC[key]=rimify(new T.MeshStandardMaterial({map:t,roughness:.82,side:T.DoubleSide}),.9);
}
// --- which kit each side wears right now, and the colours that go with it ---
const KIT_CUR={blue:null,red:null,net:null,sig:''};
function kitFor(teamKey){return KIT_CUR[teamKey]||null;}
function kitPick(other,used){let best=KIT.alt[0],bd=-1;for(const c of KIT.alt){const d=Math.min(kitDist(c,other),used!=null?kitDist(c,used):1e9);if(d>=KIT.clash)return c;if(d>bd){bd=d;best=c;}}return best;}
// cfg: the match being set up (or none for the menus). Online, cfg.net + NET.peer.kit give both sides their owner's kit
function kitSync(cfg){
  const own=(cfg&&cfg.netTeam)||save.team||'blue',k=kit(),mine=k.on?k:null,kits={blue:null,red:null};
  if(cfg&&cfg.net){const pk=typeof NET!=='undefined'&&NET.peer&&NET.peer.kit?kitClean(NET.peer.kit):null,host=cfg.net==='host';
    kits.blue=host?mine:(pk&&pk.on?pk:null);kits.red=host?(pk&&pk.on?pk:null):mine;}
  else kits[own]=mine;
  const col={blue:kits.blue?kitNum(kits.blue.c1):KIT_DEF.blue,red:kits.red?kitNum(kits.red.c1):KIT_DEF.red};
  if(kitDist(col.blue,col.red)<KIT.clash){
    // the side without a custom kit gives way; with two custom kits the red side (the guest online) does
    const side=kits.red&&!kits.blue?'blue':'red',oth=side==='blue'?'red':'blue',kk=kits[side];
    if(kk&&kitDist(kitNum(kk.c2),col[oth])>=KIT.clash&&kitLum(kk.c2)<.8){col[side]=kitNum(kk.c2);kits[side]=Object.assign({},kk,{c1:kk.c2,c2:kk.c1});}
    else{col[side]=kitPick(col[oth]);if(kk)kits[side]=Object.assign({},kk,{c1:kitHex(col[side])});}
  }
  const sig=kitHex(col.blue)+kitHex(col.red)+kitSig(kits.blue)+'|'+kitSig(kits.red);
  KIT_CUR.blue=kits.blue;KIT_CUR.red=kits.red;
  if(sig!==KIT_CUR.sig){KIT_CUR.sig=sig;TEAM.blue.color=col.blue;TEAM.red.color=col.red;kitPurge();}
  kitBoard();return col;
}
// cached meshes that baked the old team colours
// (what nothing on screen uses any more is disposed, so changing the kit many times does not pile up GPU memory)
function kitPurge(){
  const used=new Set();try{scene.traverse(o=>{if(o.isMesh){used.add(o.geometry);for(const m of[].concat(o.material))used.add(m);}});}catch(e){}
  for(const C of[pkGeoC,pkMatC])for(const key of Object.keys(C))if(/blue|red/.test(key)){const v=C[key];delete C[key];
    if(v&&!used.has(v))try{if(v.map&&v.map.dispose)v.map.dispose();if(v.dispose)v.dispose();}catch(e){}}
  try{if(typeof P3!=='undefined'&&P3){P3.url={};P3.team=null;}}catch(e){}
}
// the score board halves in the teams' colours
function kitBoard(){
  for(const [sel,key,dir] of[['#board .tm.b','blue',90],['#board .tm.r','red',270]]){const e=document.querySelector(sel);if(!e||!e.style)continue;const c=TEAM[key].color;
    if(c===KIT_DEF[key]){e.style.background='';continue;}
    const h=kitHex(c);e.style.background='radial-gradient(circle,rgba(255,255,255,.1) 0 .6px,transparent .75px) 0 0/3px 3px,linear-gradient('+dir+'deg,'+kitMix(h,'#ffffff',.08)+','+kitMix(h,'#000000',.3)+')';}
}
// what goes to a friend with the player info (online)
function kitNet(){const k=kit();return {on:k.on,c1:k.c1,c2:k.c2,pat:k.pat,crest:k.crest,mas:k.mas};}
// ---------------- the 👕 유니폼 디자인 screen ----------------
let kitTab='col',kitShotT=0,kitShotUrl='',kitShotSig='';
function kitClub(){return String((save.profile&&save.profile.club)||'').slice(0,12);}
function kitNumOf(){try{return pkNum({key:save.team||'blue'},save.type,false);}catch(e){return 7;}}
function kitSet(ch){const k=Object.assign(kit(),ch);if(!('on' in ch))k.on=1;save.kit=kitClean(k);persist();kitSync();kitRender();kitShotSoon();}
function kitShotSoon(){clearTimeout(kitShotT);if(window.__NOFX||typeof p3Shot!=='function')return;kitShotT=setTimeout(kitShot,380);}
function kitShot(){const sig=kitSig(kit())+kit().on+save.team+save.type;if(sig===kitShotSig&&kitShotUrl){kitImg();return;}
  let u='';try{u=p3Shot(save.type)||'';}catch(e){u='';}kitShotUrl=u;kitShotSig=sig;kitImg();}
function kitImg(){const e=$('#kit3d');if(!e)return;e.innerHTML=kitShotUrl?'<img alt="" src="'+kitShotUrl+'">':'<span class="kit-wait">🐧</span>';}
function kitRender(){
  const el=$('#kitBody');if(!el)return;$('#ptsN').textContent=save.points;const k=kit(),on=!!k.on,num=kitNumOf();
  let h='<div class="kit-prev'+(on?'':' off')+'"><div class="kit-jw">'+kitJerseySvg(k,false,num)+'<small>'+__L('앞')+'</small></div><div class="kit-jw">'+kitJerseySvg(k,true,num,kitClub())+'<small>'+__L('뒤')+'</small></div>'
    +'<div class="kit-3w"><div id="kit3d" class="kit-3d"></div><small>'+fmtL(__L('주장 {n}'),{n:TYPES[save.type].name})+'</small></div></div>';
  h+='<div class="kit-on"><label class="gb-tog"><input type="checkbox" data-kt="on"'+(on?' checked':'')+'> '+__L('경기에서 이 유니폼 입기')+'</label>'
    +'<small>'+(on?__L('우리 팀 색이 이 유니폼으로 바뀌어요 · 상대 팀 색이 비슷하면 상대가 다른 색을 입어요'):__L('지금은 기본 팀 색(블루/레드)으로 경기해요'))+'</small></div>';
  h+='<div class="seg kit-tabs" id="kitTabs">'+[['col',__L('색깔')],['pat',__L('무늬')],['mas',__L('마스코트')],['crest',__L('엠블럼')]].map(t=>'<button data-kt="tab" data-v="'+t[0]+'"'+(kitTab===t[0]?' class="on"':'')+'>'+t[1]+'</button>').join('')+'</div>';
  if(kitTab==='col'){
    h+='<div class="lbl">'+__L('메인 색')+'</div><div class="kit-sw">'+KIT.c1.map(c=>'<button class="kit-c'+(c===k.c1?' on':'')+'" data-kt="c1" data-v="'+c+'" style="--c:'+c+'"><i></i></button>').join('')+'</div>';
    h+='<div class="lbl">'+__L('포인트 색')+'</div><div class="kit-sw">'+KIT.c2.map(c=>'<button class="kit-c'+(c===k.c2?' on':'')+'" data-kt="c2" data-v="'+c+'" style="--c:'+c+'"><i></i></button>').join('')+'</div>';
  }else if(kitTab==='pat'){
    h+='<div class="kit-grid">'+KIT.pat.map(p=>'<button class="kit-opt'+(p===k.pat?' on':'')+'" data-kt="pat" data-v="'+p+'">'+kitJerseySvg(Object.assign({},k,{pat:p}),false,num)+'<b>'+KIT_PATN[p]+'</b></button>').join('')+'</div>';
  }else if(kitTab==='mas'){
    h+='<div class="kit-grid mas">'+KIT.mas.map(m=>'<button class="kit-opt'+(m===k.mas?' on':'')+'" data-kt="mas" data-v="'+m+'">'+kitCrestSvg(Object.assign({},k,{mas:m}))+'<b>'+KIT_MASN[m]+'</b></button>').join('')+'</div>';
  }else{
    h+='<div class="kit-grid cr">'+KIT.crest.map(c=>'<button class="kit-opt'+(c===k.crest?' on':'')+'" data-kt="crest" data-v="'+c+'">'+kitCrestSvg(Object.assign({},k,{crest:c}))+'<b>'+KIT_CRN[c]+'</b></button>').join('')+'</div>';
  }
  h+='<div class="row kit-acts"><button class="btn small" data-kt="reset">'+__L('처음 디자인으로')+'</button><button class="btn small" data-kt="rand">🎲 '+__L('랜덤 디자인')+'</button></div>';
  h+='<div class="lbl kit-note">'+__L('모든 색·무늬·마스코트는 무료예요 · 친구 대전에서는 서로의 유니폼이 보여요')+'</div>';
  el.innerHTML=h;kitImg();
  el.querySelectorAll('[data-kt]').forEach(b=>{const f=()=>{try{SFX.init();SFX.ui();}catch(e){}kitAct(b.dataset.kt,b);};if(b.tagName==='INPUT')b.onchange=f;else b.onclick=f;});
  if(!kitShotUrl||kitShotSig!==kitSig(k)+k.on+save.team+save.type)kitShotSoon();
}
function kitAct(a,b){const v=b.dataset.v;
  if(a==='tab'){kitTab=v;kitRender();return;}
  if(a==='on'){kitSet({on:b.checked?1:0});return;}
  if(a==='c1'||a==='c2'||a==='pat'||a==='mas'||a==='crest'){kitSet({[a]:v});return;}
  if(a==='reset'){kitSet({c1:KIT.c1[save.team==='red'?1:0],c2:KIT.c2[0],pat:'classic',crest:'circle',mas:'peng'});return;}
  if(a==='rand'){const r=l=>l[Math.floor(Math.random()*l.length)];let c1=r(KIT.c1),c2=r(KIT.c2);for(let i=0;i<20&&kitDist(c1,c2)<120;i++)c2=r(KIT.c2);
    kitSet({c1,c2,pat:r(KIT.pat),crest:r(KIT.crest),mas:r(KIT.mas)});return;}
}
// the white stripes of the scarf take the accent colour of a custom kit
function kitStripe(teamKey){const k=KIT_CUR[teamKey];if(!k)return [.96,.97,.98];const c=kitRGB(k.c2);return [c[0]/255,c[1]/255,c[2]/255];}
// effects that used fixed blue / red: the same values while the colours are standard, the real team colour (a little lighter) otherwise
function kitC3(key,def){const c=TEAM[key]&&TEAM[key].color;if(c==null||c===KIT_DEF[key])return def;const r=kitRGB(kitMix(kitHex(c),'#ffffff',.25));return [r[0]/255,r[1]/255,r[2]/255];}
function kitCssC(key,def){const c=TEAM[key]&&TEAM[key].color;return c==null||c===KIT_DEF[key]?def:kitMix(kitHex(c),'#ffffff',.25);}
function kitRgba(key,def){const c=TEAM[key]&&TEAM[key].color;if(c==null||c===KIT_DEF[key])return def;const r=kitRGB(kitMix(kitHex(c),'#ffffff',.2));return 'rgba('+r.join(',')+',';}
function kitHexN(key,def){const c=TEAM[key]&&TEAM[key].color;return c==null||c===KIT_DEF[key]?def:c;}
