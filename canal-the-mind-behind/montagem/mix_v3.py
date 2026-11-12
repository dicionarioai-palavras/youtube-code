# The Mind Behind — mix v3 (EP03+): várias trilhas por trecho e efeitos ancorados em frases da narração.
# Uso: python mix_v3.py <episodio> <pasta-de-som>   (plano.json com 'trilhas' e 'efeitos'; timeline.json já gerada)
# Saídas: audio/mix/<EP>-mix-final.flac (-14 LUFS, TP -1.5) e audio/mix/trilha-cama.wav (músicas + efeitos, sem voz, para a faixa PT-BR)
import json, subprocess as sp, sys, re
from pathlib import Path
ep = Path(sys.argv[1]); SOM = Path(sys.argv[2])
P = json.loads((ep/'montagem'/'plano.json').read_text(encoding='utf-8'))
T = json.loads((ep/'montagem'/'timeline.json').read_text(encoding='utf-8'))
W = json.loads((ep/'montagem'/'transcricao-palavras.json').read_text(encoding='utf-8'))
src = open(Path(__file__).with_name('plano_v2.py'), encoding='utf-8').read()
ns = {}; exec(src.split('ep = Path(sys.argv[1])')[0], ns)  # imports + num2words
exec(src.split('W = json.loads')[1].split('FPS = 30')[0].split('\n', 1)[1], ns)  # nrm, palavras_de, tokens, achar
tokens, achar = ns['tokens'], ns['achar']
DUR = T['duracao']; INI = {b['id']: b['ini'] for b in T['blocos']}
mix = ep/'audio'/'mix'; mix.mkdir(parents=True, exist_ok=True)
tmp = Path('/tmp/mixv3'); tmp.mkdir(exist_ok=True)
nome = ep.name.split('-')[0].upper()
def run(c): sp.run(c, shell=True, check=True)
def dur(f): return float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(f)]))
def tempo(b, frase, off):
    if b == 'FIM': return DUR
    t = INI[b] + (0 if not frase else achar(tokens(W[b]['words']), frase, 0))
    return max(0.0, t + off)
def soma(lista, saida):
    ins = ''.join(f' -i "{f}"' for f, _ in lista)
    fc = ''.join(f'[{i}:a]adelay={int(s*1000)}|{int(s*1000)},apad[p{i}];' for i, (f, s) in enumerate(lista))
    fc += ''.join(f'[p{i}]' for i in range(len(lista))) + f'amix=inputs={len(lista)}:normalize=0,atrim=0:{DUR}[o]'
    run(f'ffmpeg -y -v error{ins} -filter_complex "{fc}" -map "[o]" -ar 48000 -ac 2 "{saida}"')
# 1) músicas
mus = []
for k, t in enumerate(P['trilhas']):
    a = tempo(*t['ini']); b = tempo(*t['fim']); L = b - a + (0.05 if t.get('corte') else 1.5)
    fo = 0.05 if t.get('corte') else 1.5
    f = tmp/f'm{k}.wav'
    run(f'ffmpeg -y -v error -stream_loop -1 -ss {t.get("desde",0)} -i "{SOM/t["arq"]}" -t {L:.2f} -af "aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I={-30+t.get("db",0)}:TP=-6:LRA=11,afade=t=in:d=1.2,afade=t=out:st={max(0,L-fo):.2f}:d={fo}" -ar 48000 "{f}"')
    mus.append((f, a)); print('trilha', Path(t['arq']).stem[:30], round(a,1), '→', round(b,1))
soma(mus, tmp/'musica.wav')
ab = [c for c in T['cenas'] if c['tipo'] == 'abertura']; fim = [c for c in T['cenas'] if c['tipo'] == 'final'][0]['ini']
vol = "volume='1" + ''.join(f"+1.5*between(t,{c['ini']-0.3:.2f},{c['fim']+0.3:.2f})" for c in ab) + f"+1.8*gte(t,{fim+0.5:.2f})':eval=frame"
run(f'ffmpeg -y -v error -i {tmp}/musica.wav -af "{vol},afade=t=out:st={DUR-3:.2f}:d=3" -ar 48000 -ac 2 {tmp}/musica2.wav')
# 2) efeitos
fx = []
for k, (b, frase, off, arq, db, mx) in enumerate(P['efeitos']):
    a = tempo(b, frase, off); f = tmp/f'e{k}.wav'
    L = min(mx, dur(SOM/arq))
    run(f'ffmpeg -y -v error -i "{SOM/arq}" -t {L:.2f} -af "aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I={-22+db}:TP=-3,afade=t=in:d=0.02,afade=t=out:st={max(0,L-0.4):.2f}:d=0.4" -ar 48000 "{f}"')
    fx.append((f, a))
soma(fx, tmp/'efeitos.wav')
run(f'ffmpeg -y -v error -i {tmp}/musica2.wav -i {tmp}/efeitos.wav -filter_complex "amix=inputs=2:normalize=0" -ar 48000 -ac 2 {mix}/trilha-cama.wav')
if '--so-cama' in sys.argv: sys.exit(0)
# 3) narração (-16 LUFS por bloco) e ducking só na música
parts = []
for b in T['blocos']:
    f = tmp/f"{b['id']}.wav"
    run(f'ffmpeg -y -v error -i "{ep/"audio"/(b["id"]+".mp3")}" -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -ac 1 "{f}"')
    parts.append((f, b['ini']))
soma(parts, tmp/'voz.wav')
run(f'ffmpeg -y -v error -i {tmp}/musica2.wav -i {tmp}/efeitos.wav -i {tmp}/voz.wav -filter_complex "[2:a]asplit[v][sc];[0:a][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=450[m];[m][1:a][v]amix=inputs=3:normalize=0[o]" -map "[o]" -ar 48000 -ac 2 {tmp}/pre.wav')
m = sp.run(f'ffmpeg -hide_banner -i {tmp}/pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -', shell=True, capture_output=True, text=True).stderr
j = json.loads(re.findall(r'\{[^{}]*\}', m)[-1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
saida = mix/f'{nome}-mix-final.flac'
run(f'ffmpeg -y -v error -i {tmp}/pre.wav -af "{af}" -ar 48000 -ac 2 "{saida}"')
print('mix:', saida, round(dur(saida), 2), 's')
