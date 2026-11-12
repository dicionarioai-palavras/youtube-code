import json,re
d=json.load(open('/tmp/mont/timeline.json')); W=json.load(open('/tmp/ep/words.json'))
ini={b['id']:b['ini'] for b in d['blocos']}
words=[]
for b in [x['id'] for x in d['blocos']]:
    for w,s,e in W[b]['words']: words.append((w,round(ini[b]+s,2),round(ini[b]+e,2)))
N=lambda x: re.sub(r"[^a-z0-9']","",x.lower())
def at(phrase,after=0):
    q=[N(x) for x in phrase.split()]
    for i,(w,s,e) in enumerate(words):
        if s<after or i+len(q)>len(words): continue
        if all(N(words[i+k][0])==q[k] for k in range(len(q))): return i
    raise SystemExit('nao achei '+phrase)
specs=[
 ('s1-38-witnesses','38 WITNESSES?',"It's three",'useful than "people are cowards."'),
 ('s2-where-did-38-come-from','WHERE DID "38" COME FROM?','Notice something?','would anyone come?'),
 ('s3-would-you-help','WOULD YOU HELP?','So in','like they should.'),
 ('s4-she-didnt-die-alone',"SHE DIDN'T DIE ALONE",'And one neighbour','case famous.'),
]
shorts=[]
for sid,gancho,a,z in specs:
    i=at(a); j=at(z,words[i][1])+len(z.split())-1
    t0=max(0,words[i][1]-0.2); t1=words[j][2]+0.4
    cen=[dict(c) for c in d['cenas'] if c['tipo']=='img' and c['fim']>t0 and c['ini']<t1]
    if not cen: cen=[dict([c for c in d['cenas'] if c['tipo']=='img' and c['ini']<t0][-1])]
    for c in cen: c['ini']=round(max(c['ini'],t0)-t0,2); c['fim']=round(min(c['fim'],t1)-t0,2)
    for k in range(len(cen)-1): cen[k]['fim']=cen[k+1]['ini']
    cen[0]['ini']=0; cen[-1]['fim']=round(t1-t0+2.0,2)
    pal=[]
    for w,s,e in words[i:j+1]:
        if pal and (w.startswith('.') or w.startswith('%') or w.startswith('-')) and w not in ('-',):
            pal[-1]['w']+=w; pal[-1]['e']=round(e-t0,2); continue
        pal.append({'w':w,'s':round(s-t0,2),'e':round(e-t0,2)})
    shorts.append({'id':sid,'gancho':gancho,'t0':round(t0,2),'t1':round(t1,2),'dur':round(t1-t0+2.0,2),'cenas':cen,'palavras':pal})
    print(sid, round(t1-t0,1),'s', [c['src'] for c in cen])
json.dump(shorts,open('/tmp/mont/shorts.json','w'),indent=1)
