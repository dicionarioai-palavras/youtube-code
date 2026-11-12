# Faixa PT-BR v2 (EP05+): quando o texto PT é bem mais curto que o inglês, divide cada bloco PT nas pausas
# (silencedetect) e espalha os trechos pelo tempo do bloco em inglês, para a fala acompanhar as cenas
# e não deixar um silêncio longo no fim de cada parte. Nunca acelera nem estica a voz.
# Uso: python faixa_pt_br_v2.py <pasta-do-episodio>
import json, re, subprocess as sp, sys
from pathlib import Path
ns={}; src=open(Path(__file__).with_name('faixa_pt_br.py')).read().split('# ---- longo ----')[0]; exec(src,ns)
run,dur,prep,mixar=ns['run'],ns['dur'],ns['prep'],ns['mixar']
EP=Path(sys.argv[1]); T=ns['T']; B=T['blocos']; DUR=T['duracao']; A=ns['A']; OUT=ns['OUT']; NOME=ns['NOME']
W=json.load(open(EP/'montagem'/'transcricao-palavras.json'))
def pausas(f):
    e=sp.run(f'ffmpeg -hide_banner -i "{f}" -af silencedetect=noise=-38dB:d=0.4 -f null -',shell=True,capture_output=True,text=True).stderr
    s=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',e)]; t=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',e)]
    return list(zip(s,t))
parts=[]; rel=[]; pos=0
for i,b in enumerate(B):
    p=f'/tmp/pt/{b["id"]}.prep.wav'; prep(A+b['id']+'.mp3',p); d=dur(p)
    en_fala=W[b['id']]['words'][-1][2]
    k=max(1.0,en_fala/d)
    cortes=[0.0]+[(a+z)/2 for a,z in pausas(p) if z-a>=0.4 and 0.5<a<d-0.5]+[d]
    for n in range(len(cortes)-1):
        a,z=cortes[n],cortes[n+1]; f=f'/tmp/pt/{b["id"]}.{n:02d}.wav'
        run(f'ffmpeg -y -v error -ss {a:.3f} -t {z-a:.3f} -i "{p}" -af "asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0,z-a-0.04):.3f}:d=0.04" -ar 48000 -ac 1 "{f}"')
        ini=max(b['ini']+a*k,pos); parts.append((f,ini)); pos=ini+(z-a)
    rel.append(dict(bloco=b['id'],inicio_en=round(b['ini'],2),fala_en_s=round(en_fala,2),fala_pt_s=round(d,2),espalhado=round(k,3),trechos=len(cortes)-1,fim_pt=round(pos,2)))
# Correção 08/11/2026 (faixas do EP05–EP07 saíram quase mudas): o -ss depois do -i mantinha o tempo original de cada trecho,
# e o afade de saída (contado a partir de 0) zerava quase todos os trechos. Agora o corte é feito antes do -i, com asetpts.
# A voz também passou a ser montada numa linha de tempo única em numpy antes da mixagem.
import numpy as np, soundfile as sf
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
