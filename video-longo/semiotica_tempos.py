# Lê o estudo semiótico (S01..Snn, "Fala: “A” até “B”") e acha início/fim de cada cena na transcrição do Premiere.
# Uso: python3 semiotica_tempos.py <estudo.txt> <transcricao.json> <saida.json>
import json, re, sys, unicodedata
def n(s): return re.sub(r'[^a-z0-9 ]','',unicodedata.normalize('NFKD',s.lower()).encode('ascii','ignore').decode())
est=open(sys.argv[1],encoding='utf-8').read(); d=json.load(open(sys.argv[2],encoding='utf-8'))
W=[w for s in d['segments'] for w in s['words'] if w.get('type','word')=='word']
tok=[n(w['text']) for w in W]
def achar(frase, desde, fim=False):
    f=[x for x in n(frase).split() if x][:6] if not fim else [x for x in n(frase).split() if x][-6:]
    best=None
    for i in range(desde, len(tok)-len(f)+1):
        sc=sum(1 for a,b in zip(f,tok[i:i+len(f)]) if a==b)
        if best is None or sc>best[0]: best=(sc,i)
        if sc==len(f): break
    i=best[1]; return (i+len(f)-1 if fim else i), best[0]/len(f)
cenas=[]; pos=0
for m in re.finditer(r'^(S\d+) — (.*?)\nFala: “(.*?)” até “(.*?)”', est, re.M):
    i,q1=achar(m.group(3),pos); j,q2=achar(m.group(4),i,True); pos=j
    som=re.search(r'^Som: (.*)$', est[m.end():].split('\nS')[0] if True else '', re.M)
    bloco=est[m.start():]; nx=re.search(r'\n(S\d+) — ', bloco[3:]); bloco=bloco[:nx.start()+3] if nx else bloco
    som=re.search(r'^Som: (.*)$', bloco, re.M)
    cenas.append(dict(id=m.group(1), titulo=m.group(2), ini=round(W[i]['start'],2), fim=round(W[j]['start']+W[j]['duration'],2), conf=round(min(q1,q2),2), som=som.group(1) if som else ''))
json.dump(cenas, open(sys.argv[3],'w',encoding='utf-8'), ensure_ascii=False, indent=1)
for c in cenas: print(c['id'], c['ini'], c['fim'], c['conf'], c['titulo'][:40])
