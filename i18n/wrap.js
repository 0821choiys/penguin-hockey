// Build step: route every Hangul string literal of a game script through the runtime translator.
// usage: node wrap.js <in.js> <out.js> [overrides.json]
//   overrides.json: [{"v":"점","before":"r.maxMargin+","ctx":"m"}] -> that one occurrence becomes __L('점',"m")
// prints JSON {n, keys, ov} (number of wrapped literals, distinct Korean keys, override hits)
const fs = require('fs'), acorn = require('acorn'), walk = require('acorn-walk');
const [, , inp, out, ovf] = process.argv;
const src = fs.readFileSync(inp, 'utf8');
const OV = ovf ? JSON.parse(fs.readFileSync(ovf, 'utf8')) : [];
const HAN = /[가-힣ㄱ-ㆎ]/;
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true });
const reps = [], keys = new Set(), ovHit = {};
walk.fullAncestor(ast, (node, st, anc) => {
  if (node.type === 'TemplateLiteral' && node.quasis.some(q => HAN.test(q.value.cooked || '')))
    throw new Error('Hangul template literal at ' + node.start + ' (not supported by the i18n build)');
  if (node.type !== 'Literal' || typeof node.value !== 'string' || !HAN.test(node.value)) return;
  const p = anc[anc.length - 2];
  if (p && p.type === 'Property' && p.key === node && !p.computed) throw new Error('Hangul property key at ' + node.start);
  if (p && p.type === 'MemberExpression' && p.property === node) throw new Error('Hangul member key at ' + node.start);
  if (p && p.type === 'SwitchCase') throw new Error('Hangul case label at ' + node.start);
  if (p && p.type === 'ExpressionStatement' && p.directive) return;
  let ctx = null;
  for (const o of OV) {
    if (o.v === node.value && src.slice(Math.max(0, node.start - o.before.length), node.start) === o.before) {
      ctx = o.ctx; ovHit[o.ctx] = (ovHit[o.ctx] || 0) + 1;
    }
  }
  reps.push([node.start, node.end, ctx]); keys.add(node.value);
});
reps.sort((a, b) => b[0] - a[0]);
let s = src;
for (const [a, b, c] of reps) s = s.slice(0, a) + '__L(' + s.slice(a, b) + (c ? ',"' + c + '"' : '') + ')' + s.slice(b);
// the result must still parse
acorn.parse(s, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true });
fs.writeFileSync(out, s);
process.stdout.write(JSON.stringify({ n: reps.length, keys: [...keys], ov: ovHit }));
