# helpers for the v21+ patch files (exec'd into apply_v10.py's globals; they edit the global build string s)
import re as _re

def _js_block_end(src, i):
    """src[i] == '{' : return the index just past its matching '}' (skips strings, templates, comments, regex literals)."""
    depth = 0; n = len(src); j = i; prev = ''          # prev = last significant (non-space) character
    tmpl = []                                          # stack: brace depth at which a template ${ } started
    while j < n:
        c = src[j]
        if c in ' \t\r\n':
            j += 1; continue
        if c == '/' and j + 1 < n and src[j+1] == '/':
            j = src.find('\n', j); j = n if j < 0 else j; continue
        if c == '/' and j + 1 < n and src[j+1] == '*':
            j = src.find('*/', j + 2) + 2; continue
        if c in '\'"':
            q = c; j += 1
            while j < n and src[j] != q:
                j += 2 if src[j] == '\\' else 1
            j += 1; prev = q; continue
        if c == '`':
            j += 1
            while j < n and src[j] != '`':
                if src[j] == '\\': j += 2; continue
                if src[j] == '$' and j + 1 < n and src[j+1] == '{':
                    tmpl.append(depth); depth += 1; j += 2; break
                j += 1
            else:
                j += 1; prev = '`'; continue
            if j <= n and src[j-1] == '`': prev = '`'; continue
            prev = '{'; continue
        if c == '/' and (prev == '' or prev in '(,=:[!&|?{};+-*%<>~^' ):
            j += 1; cls = False
            while j < n:
                d = src[j]
                if d == '\\': j += 2; continue
                if d == '[': cls = True
                elif d == ']': cls = False
                elif d == '/' and not cls: break
                j += 1
            j += 1
            while j < n and src[j].isalpha(): j += 1
            prev = '/'; continue
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if tmpl and depth == tmpl[-1]:
                tmpl.pop(); j += 1
                while j < n and src[j] != '`':          # back inside the template literal
                    if src[j] == '\\': j += 2; continue
                    if src[j] == '$' and j + 1 < n and src[j+1] == '{':
                        tmpl.append(depth); depth += 1; j += 1; break
                    j += 1
                j += 1; prev = '`'; continue
            if depth == 0:
                return j + 1
        prev = c; j += 1
    raise ValueError('unbalanced block')

def RF(name, new, cnt=1):
    """replace the whole 'function name(...){...}' declaration"""
    global s
    hits = [m.start() for m in _re.finditer(r'(?<![\w$.])function ' + _re.escape(name) + r'\(', s)]
    if len(hits) != cnt:
        print('FUNCTION MISMATCH (%d != %d): %s' % (len(hits), cnt, name)); raise SystemExit(1)
    for st in reversed(hits):
        b = s.index('{', s.index(')', st))
        # parameters may contain default values with parens: find the brace that opens the body
        depth = 0; k = s.index('(', st)
        while True:
            if s[k] == '(': depth += 1
            elif s[k] == ')':
                depth -= 1
                if depth == 0: break
            k += 1
        b = s.index('{', k)
        e = _js_block_end(s, b)
        s = s[:st] + new + s[e:]

def FN(name):
    """current text of a function declaration (for inspection / partial edits)"""
    st = _re.search(r'(?<![\w$.])function ' + _re.escape(name) + r'\(', s).start()
    depth = 0; k = s.index('(', st)
    while True:
        if s[k] == '(': depth += 1
        elif s[k] == ')':
            depth -= 1
            if depth == 0: break
        k += 1
    b = s.index('{', k)
    return s[st:_js_block_end(s, b)]

def RIN(fname, old, new, cnt=1):
    """replace text inside one function only"""
    global s
    f = FN(fname)
    if f.count(old) != cnt:
        print('ANCHOR MISMATCH in %s (%d != %d): %r' % (fname, f.count(old), cnt, old[:100])); raise SystemExit(1)
    s = s.replace(f, f.replace(old, new), 1)
