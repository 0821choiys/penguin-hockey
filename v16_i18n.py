# v16: language switch (한국어 / English / 简体中文 / 日本語)
#  1. Korean-side fixes and hooks (settings row, save normalisation, caps sized for longer languages)
#  2. every Hangul string literal of the loader and game scripts is routed through __L() (i18n/wrap.js, acorn)
#  3. the translation tables (i18n/compile.py, validated: coverage, markup parity, no Hangul left) go into a <head> bootstrap
import json as _json, subprocess as _sp, sys as _sys, re as _re2
from html.parser import HTMLParser as _HP
_sys.path.insert(0, 'i18n')
import compile as _i18c

# ---- 1. Korean-side fixes ----
# the profile's rating note still said quick matches and tournaments move the rating; only tier games do (isRated)
R("빠른 경기와 토너먼트 결과로 레이팅이 바뀌어요(강한 상대일수록 이기면 더 많이 올라요). 첫 10경기는 배치 경기라 변동이 커요. 시작 후 20초가 지난 경기를 중간에 나가면 기권 패예요. 다른 감독들은 컴퓨터가 운영하는 가상 감독이에요.",
  "티어 게임(랭크전·선발전) 결과로만 레이팅이 바뀌어요(강한 상대일수록 이기면 더 많이 올라요). 첫 10경기는 배치 경기라 변동이 커요. 티어 게임을 시작하고 20초가 지난 뒤 중간에 나가면 기권 패예요. 다른 감독들은 컴퓨터가 운영하는 가상 감독이에요.")
# the welcome card pointed at a '게임 시작' button that no longer exists (the tutorial lives in 게임 방법 / 경기 모드)
R("나중에 '게임 방법'이나 '게임 시작'에서 언제든 다시 할 수 있어요.", "나중에 '게임 방법'이나 '경기 모드'에서 언제든 다시 할 수 있어요.")
# card tag styling: the 'storage full' tag may not start with the translated '보관' word
R("(o.tag==='보관'||o.tag.indexOf('중복')===0||o.tag.indexOf('보관')===0)",
  "(o.tag==='보관'||o.tag.indexOf('중복')===0||o.tag.indexOf('보관')===0||o.tag.indexOf('보관 가득 +')===0)")
# stored names: cities / default club and coach names / generated opponent names and match labels follow the current language
R("if(s.profile&&CT.includes(s.profile.city))save.profile.city=s.profile.city;",
  "if(s.profile&&CT.includes(I18N.full(s.profile.city)))save.profile.city=I18N.full(s.profile.city);")
R("if(CT.includes(T.cityName))t.cityName=T.cityName;", "if(CT.includes(I18N.full(T.cityName)))t.cityName=I18N.full(T.cityName);")
R("opp:R.opp.map(x=>typeof x==='string'?x.replace(/[<>&\"']/g,'').slice(0,30):'상대 팀'),city:CT.includes(R.city)?R.city:save.profile.city}",
  "opp:R.opp.map(x=>typeof x==='string'?I18N.norm(x.replace(/[<>&\"']/g,'')).slice(0,60):'상대 팀'),city:CT.includes(I18N.full(R.city))?I18N.full(R.city):save.profile.city}")
R("opp:R.opp.map(x=>typeof x==='string'?x.replace(/[<>&\"']/g,'').slice(0,30):'상대 팀'),city:t.run&&t.run.city||save.profile.city}",
  "opp:R.opp.map(x=>typeof x==='string'?I18N.norm(x.replace(/[<>&\"']/g,'')).slice(0,60):'상대 팀'),city:t.run&&t.run.city||save.profile.city}")
R("save.profile.name=cl(P.name)||save.profile.name;save.profile.club=cl(P.club)||save.profile.club;",
  "save.profile.name=I18N.full(cl(P.name)||save.profile.name);save.profile.club=I18N.full(cl(P.club)||save.profile.club);")
R("M.pending.l.replace(/[<>&\"']/g,'').slice(0,12):'경기'", "I18N.norm(M.pending.l.replace(/[<>&\"']/g,'')).slice(0,48):'경기'")
R("x.l.replace(/[<>&\"']/g,'').slice(0,20):''", "I18N.norm(x.l.replace(/[<>&\"']/g,'')).slice(0,48):''")
# settings: language row (first), applied by a reload
R("motion:RM0,items:true,events:true,fastFx:false,stick:true};", "motion:RM0,items:true,events:true,fastFx:false,stick:true,lang:I18N.lang};")
R("const SETDEF=[", "const SETDEF=[\n  {k:'lang',label:'언어 · Language',opts:[['ko','한국어'],['en','English'],['zh','简体中文'],['ja','日本語']]},")
R("const row=document.createElement('div');row.className='setrow';row.innerHTML='<div>'+sd.label+'</div>';",
  "const row=document.createElement('div');row.className='setrow'+(sd.k==='lang'?' set-lang':'');row.innerHTML='<div>'+sd.label+'</div>';")
R("sd.opts.forEach(o=>{const b=document.createElement('button');b.textContent=o[1];if(save.set[sd.k]===o[0])b.classList.add('on');",
  "sd.opts.forEach(o=>{const b=document.createElement('button');b.textContent=o[1];if(save.set[sd.k]===o[0])b.classList.add('on');if(sd.k==='lang')b.lang=o[0]==='zh'?'zh-CN':o[0];")
R("b.onclick=()=>{save.set[sd.k]=o[0];persist();",
  "b.onclick=()=>{if(sd.k==='lang'){if(o[0]!==I18N.lang){save.set.lang=o[0];persist();SFX.init();SFX.ui();I18N.set(o[0]);}return;}save.set[sd.k]=o[0];persist();")
# collection sort by name follows the current language's collation
R("localeCompare(TYPES[b].name,'ko')", "localeCompare(TYPES[b].name,I18N.loc)")
# crowd-flag team name: squeeze long names into the 128 px flag instead of clipping them
R("x.fillText(TEAM[k].name,64,190);", "x.fillText(TEAM[k].name,64,190,118);")
R("window.__PH={doPull,", "window.__PH={trialOppNames,doPull,")   # test export
# game-mode titles: a single word too long for its card (narrow landscape grid) is shrunk to fit instead of being split mid-word
R("document.querySelectorAll('.pbody').forEach(uiFade);", "document.querySelectorAll('.pbody').forEach(uiFade);i18nFit();")
R("function uiTidy(){", """function i18nFit(){   // only acts when a title overflows its card; Korean titles fit, so Korean never changes
  if(I18N.lang==='ko')return;
  document.querySelectorAll('.screen.on .mode b').forEach(b=>{b.style.fontSize='';let fs=parseFloat(getComputedStyle(b).fontSize)||17,n=0;
    while(b.scrollWidth>b.clientWidth+1&&fs>12&&n<14){fs-=1;b.style.fontSize=fs+'px';n++;}});
}
function uiTidy(){""")
# CSS
_st_end = s.rfind("</style>", 0, s.find("</head>"))
s = s[:_st_end] + rd('v16_i18n.css') + "\n" + s[_st_end:]

# ---- 2. wrap Hangul literals of the loader and game scripts ----
_scr = list(_re2.finditer(r'<script>(.*?)</script>', s, _re2.S))
assert len(_scr) == 2 and 'window.__loadThree' in _scr[0].group(1) and '__bootGame' in _scr[1].group(1), 'unexpected script layout'
_ov = [{'v': ko, 'before': b, 'ctx': c} for (ko, b, c, tr) in _i18c.load()[1]]
open('i18n/_ov.json', 'w', encoding='utf-8').write(_json.dumps(_ov, ensure_ascii=False))
_used = set(); _ovhits = {}
_parts = []
for _m in _scr:
    open('i18n/_in.js', 'w', encoding='utf-8').write(_m.group(1))
    _r = _sp.run(['node', 'i18n/wrap.js', 'i18n/_in.js', 'i18n/_out.js', 'i18n/_ov.json'], capture_output=True, text=True)
    if _r.returncode != 0:
        print(_r.stderr); _sys.exit(1)
    _info = _json.loads(_r.stdout); _used |= set(_info['keys'])
    for _k, _v in _info['ov'].items(): _ovhits[_k] = _ovhits.get(_k, 0) + _v
    _parts.append(open('i18n/_out.js', encoding='utf-8').read())
for (_ko, _b, _c, _tr) in _i18c.load()[1]:
    if _ovhits.get(_c) != 1: print('I18N context override %r matched %r times' % (_c, _ovhits.get(_c))); _sys.exit(1)
s = s[:_scr[0].start(1)] + _parts[0] + s[_scr[0].end(1):_scr[1].start(1)] + _parts[1] + s[_scr[1].end(1):]

# ---- 3. static markup coverage, data, bootstrap ----
_data, _errs, _warns, _ctx, _B, _S = _i18c.build(_used)
_body = _re2.sub(r'<script[^>]*>.*?</script>', '', s[s.find('<body'):s.rfind('</body>')], flags=_re2.S)
for (_sel, _ix, _ko, *_tr) in _B:
    if _body.count(_ko) != 1: print('I18N block not found once:', _sel, _ix); _sys.exit(1)
    _body = _body.replace(_ko, '')
class _Scan(_HP):
    def __init__(self): super().__init__(convert_charrefs=True); self.miss = []; self.skip = 0
    def handle_starttag(self, t, a):
        if t in ('script', 'style'): self.skip += 1
        for k, v in a:
            if k in ('aria-label', 'placeholder', 'title', 'alt') and v and _re2.search('[가-힣]', v) and v not in _S: self.miss.append(v)
    def handle_endtag(self, t):
        if t in ('script', 'style'): self.skip -= 1
    def handle_data(self, d):
        if self.skip: return
        d = d.strip()
        if d and _re2.search('[가-힣]', d) and d not in _S: self.miss.append(d)
_sc = _Scan(); _sc.feed(_body)
if _sc.miss: print('I18N static text without translation:', _sc.miss[:20]); _sys.exit(1)
_js = _json.dumps(_data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
_boot = rd('v16_i18n.js').replace('/*I18N_DATA*/null', _js)
assert '/*I18N_DATA*/' not in _boot
R("</head>", "<script>" + _boot + "</script>\n</head>")
# after the last markup (the dialogs follow the game script); the game itself boots later, once three.js has loaded
_be = s.rfind('</body>')
s = s[:_be] + "<script>I18N.dom();</script>\n" + s[_be:]
print('i18n: %d literals wrapped (%d keys), %d static strings, %d blocks, %d digit notes' % (sum(1 for _ in _re2.finditer(r'__L\(', s)), len(_used), len(_S), len(_B), len(_warns)))
