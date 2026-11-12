# Faixa PT-BR: encaixa cada bloco da narração em português no tempo do bloco em inglês e mixa com a mesma trilha.
# Uso (EP02 em diante): python faixa_pt_br.py <pasta-do-episodio>
#   lê montagem/timeline.json, audio/pt-br/<bloco>.mp3 e a cama audio/mix/trilha-cama.wav (gerada por mix_v2.py);
#   grava final/pt-br/<EPNN>-<caso>-audio-pt-br.mp3 e montagem/encaixe-pt-br.json.
# Sem argumento: comportamento original do EP01 (caminhos em /tmp/mont e /mnt/user-data/uploads).
import json, subprocess as sp, os, sys
from pathlib import Path
if len(sys.argv) > 1:
    EP=Path(sys.argv[1]); A=str(EP/'audio'/'pt-br')+'/'
    T=json.load(open(EP/'montagem'/'timeline.json',encoding='utf-8')); CAMA=str(EP/'audio'/'mix'/'trilha-cama.wav')
    OUT=EP/'final'/'pt-br'; OUT.mkdir(parents=True,exist_ok=True); NOME=EP.name.split('-')[0].upper()+'-'+'-'.join(EP.name.split('-')[1:])
else:
    EP=None; A='/mnt/user-data/uploads/Redes-sociais/canais/the-mind-behind/episodios/ep01-kitty-genovese/audio/pt-br/'
    T=json.load(open('/tmp/mont/timeline.json')); CAMA='/tmp/mont/musica.wav'; OUT=Path('/tmp/pt/out'); NOME='EP01'
os.makedirs('/tmp/pt',exist_ok=True)
B=T['blocos']; DUR=T['duracao']; FINAL=20
CAP=1.03   # acima disso a voz metaliza (EP01, 05/11/2026). Se um bloco precisar de mais, o texto PT está longo: voltar ao orcamento_pt_br.py
def run(c): sp.run(c,shell=True,check=True)
def dur(f): return float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
def prep(src,dst):  # 48k mono, corta silêncio das pontas, nível -16 LUFS
    run(f'ffmpeg -y -v error -i "{src}" -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -ac 1 "{dst}"')
def tempo(src,dst,r):
    if r<=1.0005: run(f'cp "{src}" "{dst}"'); return
    run(f'ffmpeg -y -v error -i "{src}" -af "rubberband=tempo={r:.4f}:pitchq=quality:formant=preserved:transients=smooth,aresample=48000" -ac 1 "{dst}"')
def bed(t0,d,out):
    run(f'ffmpeg -y -v error -ss {t0} -t {d} -i "{CAMA}" -ar 48000 -ac 2 "{out}"')
def mixar(narr_parts,t0,d,out,fade=False):
    # narr_parts: [(arquivo, inicio_em_s)]
    ins=''.join(f' -i "{f}"' for f,_ in narr_parts)
    fc=''.join(f'[{i+1}:a]adelay={int(s*1000)}|{int(s*1000)},apad[n{i}];' for i,(f,s) in enumerate(narr_parts))
    fc+=''.join(f'[n{i}]' for i in range(len(narr_parts)))+f'amix=inputs={len(narr_parts)}:normalize=0,atrim=0:{d},asplit[v][sc];'
    fc+='[0:a][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=450[m];[m][v]amix=inputs=2:normalize=0,'
    fc+=f'atrim=0:{d},loudnorm=I=-14:TP=-1:LRA=11'+ (f',afade=t=in:d=0.15,afade=t=out:st={d-1.5:.2f}:d=1.5' if fade else '')+'[o]'
    bed(t0,d,'/tmp/pt/bed.wav')
    run(f'ffmpeg -y -v error -i /tmp/pt/bed.wav{ins} -filter_complex "{fc}" -map "[o]" -ar 48000 -ac 2 "{out}"')

# ---- longo ----
pos=0.0; parts=[]; rel=[]
for i,b in enumerate(B):
    p=f'/tmp/pt/{b["id"]}.prep.wav'; prep(A+b['id']+'.mp3',p); d=dur(p)
    ini=max(b['ini'],pos)
    prox=B[i+1]['ini'] if i+1<len(B) else DUR-FINAL+8
    cart=[c['ini'] for c in T['cenas'] if c['tipo'] in ('capitulo','abertura') and b['ini']<c['ini']<prox]
    fim_slot=(min(cart) if cart else prox)-0.3   # termina antes da cartela de capítulo seguinte
    precisa=d/max(1,fim_slot-ini)
    if precisa>CAP: raise SystemExit(f'{b["id"]}: precisaria acelerar {precisa:.2f}x (máx. {CAP}). Enxugar o texto PT deste bloco e gerar de novo (com o ok de Luiz).')
    r=max(1.0,precisa)
    f=f'/tmp/pt/{b["id"]}.fit.wav'; tempo(p,f,r); df=dur(f)
    parts.append((f,ini)); pos=ini+df+0.3
    rel.append(dict(bloco=b['id'],inicio_en=round(b['ini'],2),inicio_pt=round(ini,2),fala_pt_s=round(df,2),acelerado=round(r,3),fim_pt=round(ini+df,2)))
wav=f'/tmp/pt/{NOME}-audio-pt-br.wav'; mixar(parts,0,DUR,wav)
if EP:
    run(f'ffmpeg -y -v error -i "{wav}" -c:a libmp3lame -b:a 192k "{OUT}/{NOME}-audio-pt-br.mp3"')
    json.dump(rel,open(EP/'montagem'/'encaixe-pt-br.json','w'),indent=1)
else:
    os.makedirs('/tmp/pt/out',exist_ok=True); run(f'cp "{wav}" /tmp/pt/out/EP01-audio-pt-br.wav'); json.dump(rel,open('/tmp/pt/out/encaixe.json','w'),indent=1)
[print(x) for x in rel]
