# Faixa PT-BR v3 (EP08+, regra de Luiz de 08/11/2026: "adaptado ao português, mesmo que com menos ideias, mas com fluidez no ritmo").
# Cada bloco PT entra inteiro, na sua fala natural, no início do bloco em inglês (sem espalhar trechos pelo tempo, como fazia a v2,
# que quebrava o ritmo). Sobra de tempo vira folga no fim do bloco. Aceleração só se precisar, e no máximo 3%.
# Voz montada numa linha de tempo única em numpy (correção de 08/11/2026) e mixada com a mesma cama de trilha e efeitos.
# Uso: python faixa_pt_br_v3.py <pasta-do-episodio>
import json, subprocess as sp, sys
from pathlib import Path
import numpy as np, soundfile as sf
ns={}; src=open(Path(__file__).with_name('faixa_pt_br.py')).read().split('# ---- longo ----')[0]; exec(src,ns)
run,dur,prep,tempo,mixar=ns['run'],ns['dur'],ns['prep'],ns['tempo'],ns['mixar']
EP=Path(sys.argv[1]); T=ns['T']; B=T['blocos']; DUR=T['duracao']; A=ns['A']; OUT=ns['OUT']; CAP=ns['CAP']
NOME=EP.name.split('-')[0].upper()+'-'+'-'.join(EP.name.split('-')[1:])
# Âncoras opcionais (montagem/ancoras-pt.json): {"bloco": [[segundo_no_pt, "frase do inglês"], ...]} — divide o bloco PT
# numa pausa de parágrafo e põe o trecho seguinte junto da frase equivalente do inglês (uma ou duas por bloco, nunca em toda pausa).
AP=json.load(open(EP/'montagem'/'ancoras-pt.json')) if (EP/'montagem'/'ancoras-pt.json').exists() else {}
Wd=json.load(open(EP/'montagem'/'transcricao-palavras.json'))
def en_t(b, frase):
    q=frase.lower().split(); ws=[w[0].strip('.,?!"').lower() for w in Wd[b]['words']]
    for i in range(len(ws)):
        if ws[i:i+len(q)]==q: return Wd[b]['words'][i][1]
    raise SystemExit('frase não achada: '+frase)
pos=0.0; parts=[]; rel=[]
for i,b in enumerate(B):
    p=f'/tmp/pt/{b["id"]}.prep.wav'; prep(A+b['id']+'.mp3',p); d=dur(p)
    ini=max(b['ini'],pos)
    prox=B[i+1]['ini'] if i+1<len(B) else DUR-ns['FINAL']+8
    cart=[c['ini'] for c in T['cenas'] if c['tipo'] in ('capitulo','abertura') and b['ini']<c['ini']<prox]
    fim_slot=(min(cart) if cart else prox)-0.3
    precisa=d/max(1,fim_slot-ini)
    if precisa>CAP: raise SystemExit(f'{b["id"]}: precisaria acelerar {precisa:.2f}x (máx. {CAP}). Enxugar o bloco PT (cortar uma ideia inteira, não as ligações).')
    r=max(1.0,precisa); f=f'/tmp/pt/{b["id"]}.fit.wav'; tempo(p,f,r); df=dur(f)
    if b['id'] in AP:
        cortes=[0.0]+[c*1.0/r for c,_ in AP[b['id']]]+[df]; alvos=[ini]+[b['ini']+en_t(b['id'],fr) for _,fr in AP[b['id']]]
        for k in range(len(cortes)-1):
            g=f'/tmp/pt/{b["id"]}.anc{k}.wav'; a,z=cortes[k],cortes[k+1]
            run(f'ffmpeg -y -v error -ss {a:.3f} -t {z-a:.3f} -i "{f}" -af "asetpts=PTS-STARTPTS" -ar 48000 -ac 1 "{g}"')
            st=max(alvos[k],pos); parts.append((g,st)); pos=st+(z-a)
        df=pos-ini; pos+=0.3
    else:
        parts.append((f,ini)); pos=ini+df+0.3
    rel.append(dict(bloco=b['id'],inicio_pt=round(ini,2),fala_pt_s=round(df,2),acelerado=round(r,3),folga_no_fim_s=round(fim_slot-(ini+df),2)))
buf=np.zeros(int((DUR+1)*48000),dtype=np.float32)
for f,ini in parts:
    x,sr=sf.read(f,dtype='float32'); assert sr==48000
    if x.ndim>1: x=x.mean(axis=1)
    i=int(ini*48000); j=min(len(buf),i+len(x)); buf[i:j]+=x[:j-i]
sf.write('/tmp/pt/narr-total.wav',buf[:int(DUR*48000)],48000)
wav=f'/tmp/pt/{NOME}-audio-pt-br.wav'; mixar([('/tmp/pt/narr-total.wav',0)],0,DUR,wav)
run(f'ffmpeg -y -v error -i "{wav}" -c:a libmp3lame -b:a 192k "{OUT}/{NOME}-audio-pt-br.mp3"')
json.dump(rel,open(EP/'montagem'/'encaixe-pt-br.json','w'),indent=1)
[print(x) for x in rel]
