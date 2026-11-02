import re,json,subprocess,sys,os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src=open('apply_v10.py',encoding='utf-8').read()
cut=src.index("exec(open('v16_i18n.py'")
g={}
exec(compile(src[:cut],'apply_pre16','exec'),g)
s=g['s']
open('tools/pre16b.html','w',encoding='utf-8').write(s)
sys.path.insert(0,'i18n');import compile as C
scr=list(re.finditer(r'<script>(.*?)</script>',s,re.S))
used=set()
for m in scr:
    open('i18n/_in.js','w',encoding='utf-8').write(m.group(1))
    r=subprocess.run(['node','i18n/wrap.js','i18n/_in.js','i18n/_out.js','i18n/_ov.json'],capture_output=True,text=True)
    if r.returncode:print(r.stderr);sys.exit(1)
    used|=set(json.loads(r.stdout)['keys'])
tab=C.load()[0]
miss=sorted([k for k in used if k not in tab],key=len)
json.dump(miss,open('tools/miss.json','w',encoding='utf-8'),ensure_ascii=False,indent=0)
print('missing',len(miss))
for k in miss:print(repr(k))
