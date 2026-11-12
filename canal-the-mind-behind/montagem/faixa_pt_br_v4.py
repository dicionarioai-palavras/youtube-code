# Faixa PT-BR v4 (10/11/2026) — corrige o "picote" das faixas PT dos EP03/EP04 (música e efeitos subindo e descendo sem motivo).
# Causas na v1–v3: (1) o ducking agia sobre a cama inteira (música + efeitos) com ratio 8, então os efeitos também afundavam
# a cada fala; (2) loudnorm em modo dinâmico (uma passada) num arquivo de 13 min fica corrigindo o volume o tempo todo.
# v4: encaixe da voz igual à v3 (bloco inteiro no início do bloco em inglês, aceleração máx. 3%); ducking SUAVE só na música
# (audio/mix/trilha-musica.wav); efeitos (audio/mix/trilha-efeitos.wav) intactos; loudnorm em duas passadas, modo linear.
# Camas: geradas por mix_v3.py <ep> <pasta-de-som> --so-cama, copiando /tmp/mixv3/musica2.wav e efeitos.wav para audio/mix/.
# Uso: python faixa_pt_br_v4.py <pasta-do-episodio>
import json, re, subprocess as sp, sys
from pathlib import Path
src = open(Path(__file__).with_name('faixa_pt_br_v3.py'), encoding='utf-8').read()
exec(src.split("wav=f'/tmp/pt/{NOME}-audio-pt-br.wav'")[0])   # encaixe da v3 → /tmp/pt/narr-total.wav
MIX = EP/'audio'/'mix'
run(f'ffmpeg -y -v error -i "{MIX/"trilha-musica.wav"}" -i /tmp/pt/narr-total.wav -filter_complex '
    f'"[1:a]aformat=channel_layouts=stereo,asplit[v][sc];[0:a][sc]sidechaincompress=threshold=0.05:ratio=3:attack=40:release=700[m];'
    f'[2:a]anull[fx];[m][fx][v]amix=inputs=3:normalize=0,atrim=0:{DUR:.3f}[o]" -i "{MIX/"trilha-efeitos.wav"}" -map "[o]" -ar 48000 -ac 2 /tmp/pt/pre.wav'
    .replace(' -i "'+str(MIX/"trilha-efeitos.wav")+'"', '').replace('-filter_complex', f'-i "{MIX/"trilha-efeitos.wav"}" -filter_complex', 1))
m = sp.run('ffmpeg -hide_banner -i /tmp/pt/pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -', shell=True, capture_output=True, text=True).stderr
j = json.loads(re.findall(r'\{[^{}]*\}', m)[-1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
saida = OUT/f'{NOME}-audio-pt-br-v4.mp3'
run(f'ffmpeg -y -v error -i /tmp/pt/pre.wav -af "{af},alimiter=limit=0.89:level=false" -c:a libmp3lame -b:a 192k "{saida}"')
json.dump(rel, open(EP/'montagem'/'encaixe-pt-br-v4.json', 'w'), indent=1)
print('OK', saida.name, round(dur(str(saida)), 2), 's'); [print(x) for x in rel]
