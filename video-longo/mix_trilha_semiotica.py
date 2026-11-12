# Monta a trilha (música + efeitos, sem voz) de um vídeo longo a partir de plano-trilha.json, no tempo exato da narração.
# Saídas: <tema>-trilha-musica-efeitos.wav (com a música já abaixando sob a voz; pronta para o Premiere em 0:00),
#         <tema>-previa-mix-com-voz.wav (prévia para ouvir, -14 LUFS).
# Uso: python3 mix_trilha_semiotica.py <pasta audio-elevenlabs> <tema>
import json, subprocess as sp, sys, re
from pathlib import Path
D = Path(sys.argv[1]); tema = sys.argv[2]; P = json.loads((D/'plano-trilha.json').read_text(encoding='utf-8'))
S = D/'sons'; tmp = Path('/tmp/trilha_'+tema); tmp.mkdir(exist_ok=True)
VOZ = (D/P['narracao']).resolve()
def run(c): sp.run(c, shell=True, check=True)
def dur(f): return float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(f)]))
def pico(f):
    o = sp.run(['ffmpeg','-i',str(f),'-af','volumedetect','-f','null','-'], capture_output=True, text=True).stderr
    return float(re.search(r'max_volume: (-?[\d.]+)', o).group(1))
DUR = dur(VOZ)
def camada(n, arq, ini, du, ganho_af, fi, fo, desde=0):
    f = tmp/f'{n}.wav'
    loop = '-stream_loop -1 ' if du > dur(S/(arq+'.mp3')) - desde else ''
    run(f'ffmpeg -y -v error {loop}-ss {desde} -i "{S/(arq+".mp3")}" -t {du:.3f} -af "aformat=sample_rates=48000:channel_layouts=stereo,{ganho_af},afade=t=in:d={fi},afade=t=out:st={max(0,du-fo):.3f}:d={fo}" -ar 48000 "{f}"')
    return (f, ini)
def soma(lista, saida, nivel=0):
    # soma em lotes para não estourar a linha de comando
    lote = 20; parciais = []
    for k in range(0, len(lista), lote):
        part = lista[k:k+lote]; o = tmp/f'{saida.stem}_n{nivel}_p{k}.wav'
        i = ''.join(f' -i "{f}"' for f, _ in part)
        g = ''.join(f'[{j}:a]adelay={int(s*1000)}|{int(s*1000)},apad[p{j}];' for j, (f, s) in enumerate(part))
        g += ''.join(f'[p{j}]' for j in range(len(part))) + f'amix=inputs={len(part)}:normalize=0,atrim=0:{DUR:.3f}[o]'
        run(f'ffmpeg -y -v error{i} -filter_complex "{g}" -map "[o]" -ar 48000 -ac 2 "{o}"'); parciais.append((o, 0))
    if len(parciais) == 1: parciais[0][0].replace(saida)
    else: soma(parciais, saida, nivel+1)
mus = [camada(f'm{n}', m['arq'], m['ini'], m['fim']-m['ini'], f'loudnorm=I={m["lufs"]}:TP=-3:LRA=11', m['fi'], m['fo'], m.get('desde',0)) for n, m in enumerate(P['musicas'])]
efs = []
for n, e in enumerate(P['efeitos']):
    if 'pico' in e:
        g = e['pico'] - pico(S/(e['arq']+'.mp3')); du = dur(S/(e['arq']+'.mp3'))
        efs.append(camada(f'e{n}', e['arq'], e['ini'], du, f'volume={g:.2f}dB', 0.005, min(0.3, du/3)))
    else:
        efs.append(camada(f'e{n}', e['arq'], e['ini'], e['dur'], f'loudnorm=I={e["lufs"]}:TP=-6:LRA=11', e['fi'], e['fo']))
soma(mus, tmp/'musica.wav'); soma(efs, tmp/'efeitos.wav')
run(f'ffmpeg -y -v error -i "{VOZ}" -ar 48000 -ac 2 {tmp}/voz.wav')
# música abaixa sob a voz (sidechain); efeitos não abaixam
run(f'ffmpeg -y -v error -i {tmp}/musica.wav -i {tmp}/voz.wav -filter_complex "[0:a][1:a]sidechaincompress=threshold=0.05:ratio=3:attack=30:release=600:makeup=1[m]" -map "[m]" -ar 48000 {tmp}/musica_duck.wav')
saida = D/f'{tema}-trilha-musica-efeitos.wav'
run(f'ffmpeg -y -v error -i {tmp}/musica_duck.wav -i {tmp}/efeitos.wav -filter_complex "amix=inputs=2:normalize=0,alimiter=limit=0.84:level=false,atrim=0:{DUR:.3f}" -ar 48000 -ac 2 -c:a pcm_s24le "{saida}"')
prev = D/f'{tema}-previa-mix-com-voz.wav'
run(f'ffmpeg -y -v error -i "{saida}" -i {tmp}/voz.wav -filter_complex "amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -ac 2 -c:a pcm_s24le "{prev}"')
print('OK', saida.name, round(dur(saida),3), '| narração', round(DUR,3)); print('OK', prev.name)
