# a conservative CSS minifier for the <style> blocks of the finished page (runs in v20_bundle.py, after every anchor patch):
# comments out, whitespace runs → one space, no space around { } ; , > and before !important, no ';' before '}'.
# Strings ('…' / "…") are copied untouched; nothing else is rewritten (no colour / unit / selector changes).
import re
def cssmin(css):
    out=[];i=0;n=len(css)
    while i<n:
        c=css[i]
        if c in '"\'':
            j=i+1
            while j<n and css[j]!=c:
                j+=2 if css[j]=='\\' else 1
            out.append(css[i:j+1]);i=j+1;continue
        if c=='/' and i+1<n and css[i+1]=='*':
            j=css.find('*/',i+2);i=n if j<0 else j+2;out.append(' ');continue
        if c.isspace():
            j=i
            while j<n and css[j].isspace():j+=1
            out.append(' ');i=j;continue
        out.append(c);i+=1
    s=''.join(out)
    # tighten around punctuation, outside strings only (split keeps the strings as odd pieces)
    parts=re.split(r'("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\')',s)
    for k in range(0,len(parts),2):
        p=parts[k]
        p=re.sub(r'\s*([{};,>])\s*',r'\1',p)
        p=re.sub(r'\s+!important','!important',p)
        p=p.replace(';}','}')
        parts[k]=p
    return ''.join(parts).strip()
def minify_styles(html):
    return re.sub(r'(<style[^>]*>)(.*?)(</style>)',lambda m:m.group(1)+cssmin(m.group(2))+m.group(3),html,flags=re.S)
