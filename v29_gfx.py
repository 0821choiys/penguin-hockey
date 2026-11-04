# v29: graphics spec up — sun shadow fitted to the rink + spectators with a bigger map, smoother penguin models on 최고
import re as _re29
R("/* ================= INIT ================= */", rd('v29_gfx.js') + "\n/* ================= INIT ================= */")

# the sun follows the rink, not the camera, and its shadow camera is fitted to what can cast / receive shadows
R("sun.position.set(G.cam.x+sunDir.x*100,sunDir.y*100,G.cam.z+sunDir.z*100);sun.target.position.set(G.cam.x,0,G.cam.z);", "shFit();")
# shadow map size per quality (4096 / 3072 / 1024)
RIN('applyQuality', "const sz=low?1024:2048;", "const sz=shMapSize();")

# penguin models (the v12 builder, from pkSurf up to the next section): more segments on 최고
_a29 = s.index("function pkSurf(U,V,fn,colFn,ru,rv,poles){")
_b29 = s.index("/* ================= ", _a29)
_seg29 = s[_a29:_b29]
_n29 = {'surf': 0, 'geo': 0, 'key': 0}

def _args29(txt, i):
    """split the argument list starting at txt[i]=='(' → (args, end index after ')')"""
    depth, cur, out, j = 0, '', [], i
    while True:
        ch = txt[j]
        if ch in '([{':
            depth += 1
            if depth == 1: j += 1; continue
        elif ch in ')]}':
            depth -= 1
            if depth == 0:
                out.append(cur); return out, j + 1
        elif ch == ',' and depth == 1:
            out.append(cur); cur = ''; j += 1; continue
        cur += ch; j += 1

# which constructor arguments are segment counts
_SEGARGS29 = {'SphereGeometry': (1, 2), 'TorusGeometry': (2, 3), 'ConeGeometry': (2,), 'CylinderGeometry': (3,)}

def _wrap29(seg):
    out, i = '', 0
    for m in _re29.finditer(r"new T\.(SphereGeometry|TorusGeometry|ConeGeometry|CylinderGeometry)\(", seg):
        if m.start() < i: continue
        args, end = _args29(seg, m.end() - 1)
        for k in _SEGARGS29[m.group(1)]:
            if k < len(args) and args[k].strip():
                args[k] = 'pkS(' + args[k].strip() + ')'
        out += seg[i:m.start()] + 'new T.' + m.group(1) + '(' + ','.join(args) + ')'
        i = end; _n29['geo'] += 1
    return out + seg[i:]

_seg29 = _wrap29(_seg29)
# pkSurf grids (body, head, sweater, beak …)
_seg29 = _seg29.replace("function pkSurf(U,V,fn,colFn,ru,rv,poles){", "function pkSurf(U,V,fn,colFn,ru,rv,poles){U=pkS(U);V=pkS(V);", 1); _n29['surf'] = 1
# geometry caches are per quality tier
_seg29, _n29['key'] = _re29.subn(r"ck='([a-z]+)'\+", r"ck=(pkHi()?'U':'')+'\1'+", _seg29)
if _n29['geo'] < 20 or _n29['key'] < 8:
    raise SystemExit('v29: penguin builder not patched as expected %r' % _n29)
s = s[:_a29] + _seg29 + s[_b29:]

# a first start on a touch device now begins on 최고 too (the automatic step-down still lowers it on a slow device)
R("if(window.matchMedia&&matchMedia('(pointer: coarse)').matches)save.set.quality='high';", "")

R("window.__PH={doPull,pullOnce,", "window.__PH={doPull,pullOnce,shFit,shState,shMapSize,pkHi,pkS,")
