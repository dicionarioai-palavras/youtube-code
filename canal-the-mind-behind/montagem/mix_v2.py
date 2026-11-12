# The Mind Behind — mix do áudio de um episódio a partir da timeline (montagem v2, EP02 em diante).
# Narração por bloco em -16 LUFS posta no tempo de cada bloco da timeline; trilha em loop com ducking (sidechain) sob a voz,
# mais alta na abertura (vinheta) e na tela final; ambiente opcional bem baixo; master em -14 LUFS / TP -1 (loudnorm em 2 passos).
# Uso: python mix_v2.py <pasta-do-episodio> <trilha.mp3> [ambiente.mp3] [--idioma pt-br]
#   sem --idioma: usa audio/<bloco>.mp3 e grava audio/mix/<EP>-mix-final.flac e audio/mix/trilha-cama.wav
#   --idioma pt-br: só monta a cama (a faixa PT-BR usa faixa_pt_br.py, que reaproveita audio/mix/trilha-cama.wav)
import json, subprocess as sp, sys, re
from pathlib import Path
ep = Path(sys.argv[1]); trilha = sys.argv[2]
amb = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith('--') else None
T = json.loads((ep / 'montagem' / 'timeline.json').read_text(encoding='utf-8'))
DUR = T['duracao']; B = T['blocos']
mix = ep / 'audio' / 'mix'; mix.mkdir(parents=True, exist_ok=True)
tmp = Path('/tmp/mixv2'); tmp.mkdir(exist_ok=True)
nome = ep.name.split('-')[0].upper()
def run(c): sp.run(c, shell=True, check=True)
def dur(f): return float(sp.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)]))

# 1) cama: trilha em loop (fusão de 4 s entre voltas) até a duração do vídeo, em -30 LUFS; sobe na vinheta e na tela final
d = dur(trilha); voltas = int(DUR // (d - 4)) + 2
ins = ' '.join(f'-i "{trilha}"' for _ in range(voltas))
fc = ''.join(f'[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo[a{i}];' for i in range(voltas))
cur = 'a0'
for i in range(1, voltas):
    fc += f'[{cur}][a{i}]acrossfade=d=4:c1=tri:c2=tri[x{i}];'; cur = f'x{i}'
run(f'ffmpeg -y -v error {ins} -filter_complex "{fc}[{cur}]atrim=0:{DUR},loudnorm=I=-30:TP=-6:LRA=11[o]" -map "[o]" -ar 48000 {tmp}/loop.wav')
ab = [c for c in T['cenas'] if c['tipo'] == 'abertura']
fim = [c for c in T['cenas'] if c['tipo'] == 'final'][0]['ini']
vol = "volume='1"
for c in ab:  # +8 dB na vinheta de abertura
    vol += f"+1.5*between(t,{c['ini']-0.3:.2f},{c['fim']+0.3:.2f})"
vol += f"+1.8*gte(t,{fim+0.5:.2f})':eval=frame"
run(f'ffmpeg -y -v error -i {tmp}/loop.wav -af "{vol},afade=t=in:d=2,afade=t=out:st={DUR-3:.2f}:d=3" -ar 48000 -ac 2 {mix}/trilha-cama.wav')
if amb:  # ambiente (vento) bem baixo, por baixo de tudo
    run(f'ffmpeg -y -v error -stream_loop -1 -i "{amb}" -t {DUR} -af "aformat=channel_layouts=stereo,loudnorm=I=-40:TP=-9,afade=t=in:d=3,afade=t=out:st={DUR-4:.2f}:d=4" -ar 48000 {tmp}/amb.wav')
    run(f'ffmpeg -y -v error -i {mix}/trilha-cama.wav -i {tmp}/amb.wav -filter_complex "amix=inputs=2:normalize=0" -ar 48000 {tmp}/cama2.wav && cp {tmp}/cama2.wav {mix}/trilha-cama.wav')
if '--idioma' in sys.argv: sys.exit(0)

# 2) narração: cada bloco em -16 LUFS, no início do bloco na timeline
parts = []
for b in B:
    f = tmp / f"{b['id']}.wav"
    run(f'ffmpeg -y -v error -i "{ep / "audio" / (b["id"] + ".mp3")}" -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -ac 1 "{f}"')
    parts.append((f, b['ini']))
ins = ''.join(f' -i "{f}"' for f, _ in parts)
fc = ''.join(f'[{i+1}:a]adelay={int(s*1000)}|{int(s*1000)},apad[n{i}];' for i, (f, s) in enumerate(parts))
fc += ''.join(f'[n{i}]' for i in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,atrim=0:{DUR},asplit[v][sc];'
fc += '[0:a][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=450[m];[m][v]amix=inputs=2:normalize=0[o]'
run(f'ffmpeg -y -v error -i {mix}/trilha-cama.wav{ins} -filter_complex "{fc}" -map "[o]" -ar 48000 -ac 2 {tmp}/pre.wav')
# 3) master -14 LUFS / TP -1, dois passos
m = sp.run(f'ffmpeg -hide_banner -i {tmp}/pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -', shell=True, capture_output=True, text=True).stderr
j = json.loads(re.findall(r'\{[^{}]*\}', m)[-1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
saida = mix / f'{nome}-mix-final.flac'
run(f'ffmpeg -y -v error -i {tmp}/pre.wav -af "{af}" -ar 48000 -ac 2 "{saida}"')
print('mix:', saida, round(dur(saida), 2), 's')
