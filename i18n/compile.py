# Builds the runtime i18n data from the translation tables and validates it.
import json,re,glob,runpy,os
H=os.path.dirname(os.path.abspath(__file__))
HAN=re.compile('[가-힣ㄱ-ㆎ]')
LANGS=('en','zh','ja')
def load():
    U=json.load(open(H+'/uniq.json',encoding='utf-8'))
    EN,ZH,JA={},{},{}
    for f in sorted(glob.glob(H+'/en/*.py')):
        b=os.path.basename(f)
        if b in('extra.py','loader.py') or b.startswith('x'):continue
        d=runpy.run_path(f)
        EN.update(d.get('T',{}));EN.update(d.get('EN',{}));ZH.update(d.get('ZH',{}));JA.update(d.get('JA',{}))
    tab={}
    for o in U:
        i,v=o['i'],o['v']
        tab[v]=(EN.get(i),ZH.get(i),JA.get(i))
    ld=runpy.run_path(H+'/en/loader.py')['LD']
    tab.update(ld)
    ex=runpy.run_path(H+'/en/extra.py')
    tab.update(ex['X'])
    for f in sorted(glob.glob(H+'/en/x*.py')):tab.update(runpy.run_path(f)['X'])   # strings added after the first translation pass (v17: x17.py)
    st=runpy.run_path(H+'/st/static.py')
    return tab,ex['CTX'],ex['KEEP'],st['S'],st['B']
TAG=re.compile(r'<[^<>]*>')
ATTR=re.compile(r'((?:title|aria-label|placeholder|alt)=")[^"]*(")')
def shape(t):
    t=ATTR.sub(r'\1\2',t)
    return (sorted(TAG.findall(t)),t.count('<'),t.count('>'),t.count('"'),t.count('{SP}'))
def digits(t):
    return sorted(re.findall(r'\d+(?:\.\d+)?',t))
def check_pair(k,v,lang,keep,errs,warns):
    if v is None:errs.append('missing %s: %r'%(lang,k));return
    if HAN.search(v) and k not in keep:errs.append('hangul left in %s: %r -> %r'%(lang,k,v))
    if shape(k)!=shape(v):errs.append('markup differs %s: %r -> %r'%(lang,k,v))
    if digits(k)!=digits(v):warns.append('digits %s: %r -> %r'%(lang,k,v))
PARTS={
 'city':['서울','부산','대구','인천','광주','대전','울산','세종','수원','부천','고양','성남','창원','제주'],
 'clubA':['빙산','오로라','블리자드','남극','북극성','눈보라','빙하','아이스','크릴','유빙','설원','극지','하얀','푸른','얼음꽃'],
 'clubB':['유나이티드','시티','레이서스','킹스','스타즈','이글스','타이거즈','웨이브','스톰','레인저스','로열즈','기사단','원정대','해적단'],
 'mgrA':['얼음','폭풍','북극','전설의','냉철한','불꽃','번개','침착한','고요한'],
 'mgrB':['감독','전술가','여우','사령관','마에스트로','곰','독수리','늑대','선장','코치','명장','지휘관'],
 'nation':['캐나다','미국','스웨덴','핀란드','체코','스위스','독일','슬로바키아','노르웨이','덴마크','라트비아','일본','오스트리아','프랑스'],
 'trial':[' 아이스 FC',' 블리자드',' 오로라 (우승 후보)',' 대표팀','남극 펭귄 연합 (디펜딩 챔피언)',' 대표 · ',' 대표 (우승 후보) · ',
          '랭크 경기 vs ',' 선발전 ','기권 · ','티어 게임','경기','상대 팀','시대회 대표 선발전','시대회','전국대회 대표 선발전','전국대회','세계 대회',
          '8강','4강','결승','16강','32강','시즌 리셋'],
}
FULL=['펭귄 감독','펭귄 FC']+PARTS['city']
def build(used_keys,static_used=None,strict=True):
    tab,ctx,keep,S,B=load()
    errs,warns=[],[]
    keys=sorted(set(used_keys),key=lambda k:(len(k),k))
    for k in keys:
        if k not in tab:errs.append('no entry for %r'%k);continue
        for li,lang in enumerate(LANGS):check_pair(k,tab[k][li],lang,keep,errs,warns)
    for (ko,before,cid,tr) in ctx:
        for li,lang in enumerate(LANGS):check_pair(ko,tr[li],lang,keep,errs,warns)
    for k,v in S.items():
        for li,lang in enumerate(LANGS):check_pair(k,v[li],lang,keep,errs,warns)
    for (sel,ix,ko,*tr) in B:
        for li,lang in enumerate(LANGS):check_pair(ko,tr[li],lang,keep,errs,warns)
    # name parts: every part must exist, and no string may stand for two different keys
    allparts=sorted({p for L in PARTS.values() for p in L}|set(FULL))
    owner={}
    for p in allparts:
        if p not in tab:errs.append('part without entry %r'%p);continue
        for v in (p,)+tuple(tab[p]):
            if v in owner and owner[v]!=p:errs.append('part collision %r: %r vs %r'%(v,owner[v],p))
            owner[v]=p
    if strict and errs and not __import__('os').environ.get('I18N_LAX'):
        raise SystemExit('I18N BUILD ERRORS:\n'+'\n'.join(errs[:80]))
    keys=[k for k in keys if k in tab]   # (I18N_LAX=1 dev builds only: untranslated strings fall back to Korean)
    K=keys+[cid+'\u0001'+ko for (ko,b,cid,tr) in ctx]
    T={lang:[tab[k][li] for k in keys]+[tr[li] for (ko,b,cid,tr) in ctx] for li,lang in enumerate(LANGS)}
    SK=list(S.keys());ST={lang:[S[k][li] for k in SK] for li,lang in enumerate(LANGS)}
    BL=[[sel,ix]+list(tr) for (sel,ix,ko,*tr) in B]
    P=[[p]+list(tab[p]) for p in sorted({p for L in PARTS.values() for p in L}) if p in tab]
    F=[[p]+list(tab[p]) for p in FULL if p in tab]
    data={'K':K,'T':T,'SK':SK,'ST':ST,'B':BL,'P':P,'F':F}
    return data,errs,warns,[ (ko,b,cid) for (ko,b,cid,tr) in ctx],B,S
if __name__=='__main__':
    U=json.load(open(H+'/uniq.json',encoding='utf-8'))
    data,errs,warns,_,_,_=build([o['v'] for o in U],strict=False)
    print('errors',len(errs));print('\n'.join(errs[:60]))
    print('warnings',len(warns));print('\n'.join(warns[:200]))
