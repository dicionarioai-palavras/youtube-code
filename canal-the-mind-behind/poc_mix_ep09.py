# POC EP09 (10/11/2026): mixa narração + música e efeitos do ElevenLabs, com efeitos ancorados em frases (alinhamento with-timestamps).
# Uso: python3 poc_mix_ep09.py <pasta-poc> en|pt
import json, subprocess as sp, sys, unicodedata
from pathlib import Path
P = Path(sys.argv[1]); L = sys.argv[2]; A = P/('audio-'+L); S = P/'sons'; tmp = Path('/tmp/pocmix_'+L); tmp.mkdir(exist_ok=True)
def run(c): sp.run(c, shell=True, check=True)
def dur(f): return float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(f)]))
def nrm(s): return unicodedata.normalize('NFKD', s.lower()).encode('ascii','ignore').decode()
def t(bloco, frase, fim=False):
    al = json.loads((A/f'{bloco}.alinhamento.json').read_text(encoding='utf-8'))
    ch = al['characters']; txt = nrm(''.join(ch)); i = txt.find(nrm(frase))
    if i < 0: raise SystemExit(f'frase não achada: {bloco} / {frase}')
    k = i + len(frase) - 1 if fim else i
    return (al['character_end_times_seconds'] if fim else al['character_start_times_seconds'])[k]
F = {  # frases-âncora por idioma
 'en': dict(corre='comes running', nome='His name', dahmer='was Jeffrey Dahmer', porta='once the door was closed', algema='snapped a handcuff', maioria='Most of us', calmo='So Tracy stayed', desviou='And he did', gaveta='an open drawer', real='These are for real', errada='wrong victim'),
 'pt': dict(corre='vem correndo', nome='O nome dele', dahmer='era Jeffrey Dahmer', porta='a porta fechou', algema='prendeu uma algema', maioria='A gente acha', calmo='Então Tracy ficou', desviou='E desviou', gaveta='uma gaveta aberta', real='Isso aqui', errada='vítima errada')}[L]
# posições dos blocos no tempo
d0, d1, d2 = (dur(A/f'{b}.mp3') for b in ('00-intro','01-tracy-a','02-tracy-b'))
B0 = 2.0; B1 = B0 + d0 + 3.0; B2 = B1 + d1 + 1.6; FIM = B2 + d2 + 4.0
camadas = []  # (arquivo, inicio, duracao, ganho_dB, fade_in, fade_out)
def add(arq, ini, du, db, fi=0.05, fo=0.05): camadas.append((S/arq, ini, du, db, fi, fo))
# abertura: música de tema sob a introdução, riser + impacto na virada para a história
add('musica-intro.mp3', 0, B0 + d0 + 1.2, -24, 1.5, 1.2)
add('sfx-riser.mp3', B0 + d0 - 0.2, 3, -20)
add('sfx-impacto.mp3', B0 + d0 + 2.4, 5, -15, 0.01, 2)
# bloco 1: noite na rua, corrida, porta, algema
x = B1 + t('01-tracy-a', F['nome'])
add('bed-noite.mp3', B1 - 0.6, x - B1 + 3.5, -27, 0.8, 2.5)
add('sfx-corrida.mp3', B1 + t('01-tracy-a', F['corre']) - 0.2, 4, -21, 0.05, 1.0)
add('sfx-impacto.mp3', B1 + t('01-tracy-a', F['dahmer'], True) + 0.15, 5, -19, 0.01, 2.5)
add('sfx-porta.mp3', B1 + t('01-tracy-a', F['porta'], True) + 0.1, 3, -18)
add('sfx-algema.mp3', B1 + t('01-tracy-a', F['algema'], True) - 0.1, 2, -14)
# tensão: música + relógio até o "e desviou", que entra em corte seco (silêncio proposital)
m = B1 + t('01-tracy-a', F['maioria']) - 0.4; c = B1 + t('01-tracy-a', F['desviou']) - 0.25
add('musica-tensao.mp3', m, c - m, -25, 2.0, 0.04)
k = B1 + t('01-tracy-a', F['calmo']) - 0.3
add('bed-tensao.mp3', k, c - k, -29, 2.0, 0.04)
# bloco 2: fuga, gaveta, revelação, fecho
add('sfx-corrida.mp3', B2 + 0.05, 4, -19, 0.05, 1.0)
add('musica-revelacao.mp3', B2 + 1.5, FIM - B2 - 1.5, -25, 2.5, 3.5)
add('sfx-gaveta.mp3', B2 + t('02-tracy-b', F['gaveta']) - 0.1, 2, -16)
add('sfx-impacto.mp3', B2 + t('02-tracy-b', F['real']) - 0.15, 5, -14, 0.01, 2.5)
add('sfx-impacto.mp3', B2 + t('02-tracy-b', F['errada'], True) + 0.25, 5, -12, 0.01, 3.5)
# render das camadas
ins, fc = [], []
for n, (arq, ini, du, db, fi, fo) in enumerate(camadas):
    f = tmp/f'c{n}.wav'
    run(f'ffmpeg -y -v error -stream_loop -1 -i "{arq}" -t {du:.2f} -af "aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I={-16+db+16 if False else db}:TP=-2:LRA=11,afade=t=in:d={fi},afade=t=out:st={max(0,du-fo):.2f}:d={fo}" -ar 48000 "{f}"')
    ins.append(f); fc.append(int(ini*1000))
# voz
voz = []
for b, ini in (('00-intro',B0),('01-tracy-a',B1),('02-tracy-b',B2)):
    f = tmp/f'v_{b}.wav'; run(f'ffmpeg -y -v error -i "{A/(b+".mp3")}" -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -ac 2 "{f}"'); voz.append((f, ini))
def soma(lista, saida):
    i = ''.join(f' -i "{f}"' for f, _ in lista)
    g = ''.join(f'[{j}:a]adelay={int(s*1000)}|{int(s*1000)},apad[p{j}];' for j, (f, s) in enumerate(lista))
    g += ''.join(f'[p{j}]' for j in range(len(lista))) + f'amix=inputs={len(lista)}:normalize=0,atrim=0:{FIM:.2f}[o]'
    run(f'ffmpeg -y -v error{i} -filter_complex "{g}" -map "[o]" -ar 48000 -ac 2 "{saida}"')
soma(list(zip(ins, [x/1000 for x in fc])), tmp/'cama.wav'); soma(voz, tmp/'voz.wav')
out = P/f'POC-EP09-{L.upper()}-elevenlabs-v2.mp3'
run(f'ffmpeg -y -v error -i {tmp}/cama.wav -i {tmp}/voz.wav -filter_complex "[1:a]asplit[v][sc];[0:a][sc]sidechaincompress=threshold=0.03:ratio=5:attack=25:release=500[m];[m][v]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[o]" -map "[o]" -ar 48000 -b:a 192k "{out}"')
print('OK', out.name, round(dur(out),1), 's')
