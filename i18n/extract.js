// Extract every Hangul string literal / template from the game scripts with its syntactic context.
// usage: node extract.js <script.js> <out.json>
const fs=require('fs'),acorn=require('acorn'),walk=require('acorn-walk');
const src=fs.readFileSync(process.argv[2],'utf8');
const HAN=/[가-힣ㄱ-ㆎ]/;
const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'script',allowHashBang:true});
const out=[];
const ctxOf=(node,anc)=>{
  const p=anc[anc.length-2],gp=anc[anc.length-3];
  if(!p)return 'top';
  if(p.type==='Property'&&p.key===node&&!p.computed)return 'key';
  if(p.type==='Property'&&p.value===node)return 'value';
  if(p.type==='BinaryExpression'&&['===','!==','==','!='].includes(p.operator))return 'compare';
  if(p.type==='BinaryExpression'&&p.operator==='in')return 'in';
  if(p.type==='SwitchCase')return 'case';
  if(p.type==='MemberExpression'&&p.property===node)return 'member';
  if(p.type==='CallExpression'||p.type==='NewExpression'){
    const c=p.callee;let name=c.type==='Identifier'?c.name:c.type==='MemberExpression'?(c.property.name||c.property.value):'?';
    return 'arg:'+name+(p.arguments.indexOf(node)>=0?'#'+p.arguments.indexOf(node):'');}
  if(p.type==='BinaryExpression'&&p.operator==='+')return 'concat';
  if(p.type==='ArrayExpression')return 'array';
  return p.type;
};
walk.fullAncestor(ast,(node,state,anc)=>{
  if(node.type==='Literal'&&typeof node.value==='string'&&HAN.test(node.value)){
    out.push({kind:'lit',value:node.value,start:node.start,end:node.end,ctx:ctxOf(node,anc),snip:src.slice(Math.max(0,node.start-70),Math.min(src.length,node.end+50))});}
  else if(node.type==='TemplateLiteral'&&node.quasis.some(q=>HAN.test(q.value.cooked||''))){
    out.push({kind:'tpl',value:src.slice(node.start,node.end),start:node.start,end:node.end,ctx:ctxOf(node,anc),snip:src.slice(Math.max(0,node.start-70),Math.min(src.length,node.end+50))});}
});
fs.writeFileSync(process.argv[3],JSON.stringify(out,null,0));
const ctx={};for(const o of out)ctx[o.ctx.split(':')[0]+(o.ctx.startsWith('arg:')?':'+o.ctx.split(':')[1].split('#')[0]:'')]=(ctx[o.ctx.split(':')[0]+(o.ctx.startsWith('arg:')?':'+o.ctx.split(':')[1].split('#')[0]:'')]||0)+1;
console.log('items',out.length,'unique',new Set(out.map(o=>o.value)).size,'templates',out.filter(o=>o.kind==='tpl').length);
console.log(Object.entries(ctx).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+'='+e[1]).join('  '));
