# Transcreve audio/O*.mp3 com faster-whisper (small.en) e compara com NARRACAO.txt. Uso: python transcrever_shorts.py <pasta-do-lote> [O1 ...]. Lote 0, 06/11/2026.
# Transcreve audio/O*.mp3 (faster-whisper small.en, palavras com tempo) e compara com NARRACAO.txt.
import re, json, difflib, sys
from pathlib import Path
from faster_whisper import WhisperModel
from num2words import num2words
import subprocess, numpy as np
def wav(f):
    b=subprocess.run(['ffmpeg','-v','error','-i',str(f),'-ar','16000','-ac','1','-f','s16le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(b,dtype=np.int16).astype(np.float32)/32768
base=Path(sys.argv[1]); ids=sys.argv[2:] or [f'O{i}' for i in range(1,7)]
txt=(base/'NARRACAO.txt').read_text(encoding='utf-8')
blocos=dict(re.findall(r'BLOCO (\S+)\n=====\n(.*?)\n=====',txt,re.S))
def numeros(t):
    t=re.sub(r'\b(1[0-9]{3}|20[0-9]{2})s?\b',lambda m: num2words(int(m.group(1)),to='year')+('s' if m.group(0).endswith('s') else ''),t)
    t=re.sub(r'(\d+)%',lambda m: num2words(int(m.group(1)))+' percent',t)
    return re.sub(r'\d+',lambda m: num2words(int(m.group(0))),t)
def norm(t):
    t=numeros(re.sub(r'\[[^\]]*\]',' ',t)).lower().replace('-',' ').replace(',',' ')
    return [w for w in re.sub(r"[^a-z0-9' ]",' ',t).split() if w!='and']
m=WhisperModel('small.en',device='cpu',compute_type='int8',cpu_threads=2)
res={}
for k in ids:
    segs,_=m.transcribe(wav(base/'audio'/f'{k}.mp3'),word_timestamps=True,language='en',beam_size=5)
    ws=[];falado=''
    for s in segs:
        falado+=s.text; ws+=[(w.word.strip(),round(w.start,2),round(w.end,2),round(w.probability,2)) for w in s.words]
    dif=[d for d in difflib.ndiff(norm(blocos[k]),norm(falado)) if d[0] in '+-']
    res[k]={'words':ws,'texto':falado.strip(),'dif':dif,'baixa':[(w,p) for w,_,_,p in ws if p<0.6]}
    print(k,'fim fala',ws[-1][2],'| dif:',dif,'| baixa:',res[k]['baixa']); print('   ',falado.strip()); sys.stdout.flush()
json.dump(res,open(base/'transcricao.json','w'),indent=1)
