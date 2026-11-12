# Faixa PT-BR v5 (10/11/2026) — sem picote. Correção de Luiz (10/11 19h): a v4 do EP03 foi ACEITA; só a v4 do EP04 foi recusada.
# Suspeita: 'Rotator - The Grey Room' (está no EP04 e nos EP05–08, não no EP03). Aceitação da v5 ainda não confirmada.
# Histórico: v1 (07/11) e v4 (10/11) foram recusadas ("conteúdo protegido diferente da faixa original"): a música abaixava
# conforme a voz em PORTUGUÊS, então o desenho da música ficava diferente do original e o Content ID "ouvia" trechos
# que no original estão cobertos. A v2 (09/11) passou porque partia do mix em inglês, mas tentava apagar a voz inglesa
# por cima — daí os pulos e cortes.
# v5: reconstrói a música EXATAMENTE como no original (ducking pela voz em INGLÊS, mesmos parâmetros do mix_v3:
# threshold 0,02, ratio 8, attack 20, release 450; correlação 0,999 com o mix final em inglês no EP03), efeitos iguais,
# e só então soma a voz em português. O envelope da música é suavizado (mínimo móvel 8 s + média 1 s), sempre ≤ o original:
# some o vai e vem guiado pela voz inglesa que não se ouve, sem a música ficar mais alta que no original em nenhum instante.
# Loudnorm em duas passadas, linear. Encaixe da voz PT igual à v3 (bloco inteiro no início do bloco em inglês, máx. 3%).
# Requer audio/mix/trilha-musica.wav e trilha-efeitos.wav (mix_v3.py <ep> <som> --so-cama; copiar /tmp/mixv3/musica2.wav e efeitos.wav).
# Uso: python faixa_pt_br_v5.py <pasta-do-episodio>
import json, re, subprocess as sp, sys
from pathlib import Path
src = open(Path(__file__).with_name('faixa_pt_br_v3.py'), encoding='utf-8').read()
exec(src.split("wav=f'/tmp/pt/{NOME}-audio-pt-br.wav'")[0])   # encaixe da v3 → /tmp/pt/narr-total.wav
MIX = EP/'audio'/'mix'
# --musica <arquivo em audio/mix> troca a cama de música (ex.: EP04 sem 'Rotator', reivindicada só na faixa PT); --sufixo muda o nome da saída
MUS = MIX/(sys.argv[sys.argv.index('--musica')+1] if '--musica' in sys.argv else 'trilha-musica.wav')
SUF = sys.argv[sys.argv.index('--sufixo')+1] if '--sufixo' in sys.argv else 'v5'
# voz em inglês no tempo original (só para guiar a música, não entra na faixa)
partes = []
for b in B:
    f = f"/tmp/pt/en_{b['id']}.wav"
    run(f'ffmpeg -y -v error -i "{EP/"audio"/(b["id"]+".mp3")}" -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -ac 1 "{f}"'); partes.append((f, b['ini']))
ins = ''.join(f' -i "{f}"' for f, _ in partes)
g = ''.join(f'[{i}:a]adelay={int(s*1000)}|{int(s*1000)},apad[p{i}];' for i, (f, s) in enumerate(partes))
g += ''.join(f'[p{i}]' for i in range(len(partes))) + f'amix=inputs={len(partes)}:normalize=0,atrim=0:{DUR:.3f}[o]'
run(f'ffmpeg -y -v error{ins} -filter_complex "{g}" -map "[o]" -ar 48000 -ac 1 /tmp/pt/voz-en.wav')
# 1) música abaixada exatamente como no original (guia: voz em inglês)
run(f'ffmpeg -y -v error -i "{MUS}" -i /tmp/pt/voz-en.wav -filter_complex '
    '"[1:a]aformat=channel_layouts=stereo[en];[0:a][en]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=450[m]" '
    f'-map "[m]" -ar 48000 -ac 2 /tmp/pt/m-en.wav')
# 2) envelope suavizado que NUNCA passa do original: ganho por quadro de 20 ms → mínimo móvel de 8 s → média móvel de 1 s
#    (a média de mínimos com janela maior fica sempre ≤ o ganho original), aplicado à música crua
import numpy as np, soundfile as sf
def rms(f):
    x = np.frombuffer(sp.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','8000','-f','f32le','-'],capture_output=True).stdout, np.float32)
    w = 160; n = len(x)//w; return np.sqrt((x[:n*w].reshape(n,w)**2).mean(1))
r0 = rms(str(MUS)); r1 = rms('/tmp/pt/m-en.wav'); n = min(len(r0), len(r1))
gan = np.where(r0[:n] > 1e-4, np.clip(r1[:n]/np.maximum(r0[:n],1e-9), 0, 1), 1.0)
from numpy.lib.stride_tricks import sliding_window_view as swv
k = 200; gp = np.pad(gan, (k, k), mode='edge'); gmin = swv(gp, 2*k+1).min(axis=1)
a = 25; gs = np.convolve(np.pad(gmin, (a, a), mode='edge'), np.ones(2*a+1)/(2*a+1), mode='valid')
tq = (np.arange(len(gs))+0.5)*0.02
with sf.SoundFile(str(MUS)) as fin, sf.SoundFile('/tmp/pt/m-suave.wav','w',48000,2,'PCM_24') as fout:
    pos = 0
    for blk in fin.blocks(blocksize=48000*10, dtype='float32', always_2d=True):
        t_ = (pos + np.arange(len(blk)))/48000; g_ = np.interp(t_, tq, gs).astype(np.float32)
        fout.write(blk*g_[:,None]); pos += len(blk)
# 3) música suavizada + efeitos (iguais ao original) + voz em português
run(f'ffmpeg -y -v error -i /tmp/pt/m-suave.wav -i "{MIX/"trilha-efeitos.wav"}" -i /tmp/pt/narr-total.wav -filter_complex '
    f'"[2:a]aformat=channel_layouts=stereo[pt];[0:a][1:a][pt]amix=inputs=3:normalize=0,atrim=0:{DUR:.3f}[o]" -map "[o]" -ar 48000 -ac 2 /tmp/pt/pre.wav')
m = sp.run('ffmpeg -hide_banner -i /tmp/pt/pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -', shell=True, capture_output=True, text=True).stderr
j = json.loads(re.findall(r'\{[^{}]*\}', m)[-1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
saida = OUT/f'{NOME}-audio-pt-br-{SUF}.mp3'
run(f'ffmpeg -y -v error -i /tmp/pt/pre.wav -af "{af},alimiter=limit=0.89:level=false" -c:a libmp3lame -b:a 192k "{saida}"')
json.dump(rel, open(EP/'montagem'/'encaixe-pt-br-v5.json', 'w'), indent=1)
print('OK', saida.name, round(dur(str(saida)), 2), 's')
