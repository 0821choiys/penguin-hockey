// stdin → minified JS on stdout (comments and whitespace out, local names shortened; top-level names, string quotes and Korean literals kept for the i18n pass;
// evaluate:false so 'a'+'b' is never folded into one string — the i18n keys are the separate literals)
const {minify}=require('terser');let s='';process.stdin.on('data',d=>s+=d);
process.stdin.on('end',async()=>{try{const r=await minify(s,{ecma:2020,compress:{passes:2,keep_fargs:true,keep_infinity:true,evaluate:false},mangle:{toplevel:false},format:{quote_style:3,ascii_only:false,comments:false}});process.stdout.write(r.code);}catch(e){console.error(e.message);process.exit(1);}});
