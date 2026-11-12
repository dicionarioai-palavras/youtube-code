"""Laboratório: monta a composição 'Montagem' (bastidores do Inveja) testando todas as hipóteses.
Gera clipes, stills, SFX e o JSON de props. Uso: python3 montagem_inveja.py <raiz do projeto>"""
import json, os, re, subprocess, sys, statistics
R = sys.argv[1]
UP = '/mnt/user-data/uploads/Redes-sociais'
VID = f'{UP}/midias-compartilhadas/palavras/youtube/inveja/videos'
PUB = f'{R}/public'; OUT = 'temas/palavras/inveja/montagem'; D = f'{PUB}/{OUT}'
os.makedirs(D, exist_ok=True)
FF = ['ffmpeg', '-nostdin', '-v', 'error', '-y']

def palavras(jp, desloc=0.0):
    d = json.load(open(jp, encoding='utf-8-sig')); out = []
    for s in d.get('transcription', []):
        a, b = s['offsets']['from']/1000, s['offsets']['to']/1000
        toks = [t for t in s.get('tokens', []) if not t['text'].startswith('[_')]
        if not toks: continue
        t0 = toks[0]['offsets']['from']; t1 = max(toks[-1]['offsets']['to'], t0+1); k = (b-a)/((t1-t0)/1000)
        m = lambda ms: a + (ms-t0)/1000*k; cur = None
        for t in toks:
            if cur is None or t['text'].startswith(' '):
                if cur and cur[2].strip(): out.append(cur)
                cur = [m(t['offsets']['from']), m(t['offsets']['to']), t['text'].strip()]
            else: cur[1] = m(t['offsets']['to']); cur[2] += t['text']
        if cur and cur[2].strip(): out.append(cur)
    return [(a-desloc, b-desloc, w) for a, b, w in out if re.search(r'\w', w)]

def intervalos_fala(ws, ini, fim, pad=0.12, junta=0.35):
    """corte seco automático: mantém só os trechos com fala (remove silêncios)"""
    iv = []
    for a, b, w in ws:
        if a >= ini - 0.05 and a < fim:
            a2, b2 = max(ini, a-pad), min(fim, b+pad)
            if iv and a2 - iv[-1][1] < junta: iv[-1][1] = max(iv[-1][1], b2)
            else: iv.append([a2, b2])
    return iv

clips, ws_out, momentos, sfx, mutes = [], [], [], [], []
t = 0.0; n = 0
def add_video(fonte, a, b, ws, layout, extra, rot=None, escala='1080:1920'):
    global t, n
    n += 1; nome = f'c{n:02d}.mp4'
    vf = f'scale={escala}:force_original_aspect_ratio=increase,crop={escala.replace(":", ":")},fps=30,format=yuv420p' if layout == 'camera' else 'fps=30,format=yuv420p'
    subprocess.run(FF + ['-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', fonte, '-vf', vf, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
                         '-c:a', 'aac', '-ar', '48000', '-b:a', '192k', f'{D}/{nome}'], check=True)
    if layout == 'tela':
        subprocess.run(FF + ['-i', f'{D}/{nome}', '-vn', '-ac', '1', '-ar', '22050', f'{D}/c{n:02d}.wav'], check=True)
    dur = b - a
    clip = {'tipo': 'video', 'src': f'{OUT}/{nome}', 'inicio': round(t, 3), 'dur': round(dur, 3), 'layout': layout, **extra}
    if layout == 'tela': clip['onda'] = f'{OUT}/c{n:02d}.wav'
    clips.append(clip)
    for wa, wb, w in ws:
        if wa >= a - 0.05 and wa < b:
            ws_out.append({'t0': round(t + max(wa, a) - a, 3), 't1': round(t + min(wb, b) - a, 3), 'texto': w})
    t += dur

def add_still(fonte, em, dur, extra):
    global t, n
    n += 1; nome = f's{n:02d}.jpg'
    subprocess.run(FF + ['-ss', f'{em:.3f}', '-i', fonte, '-frames:v', '1', '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920', '-q:v', '2', f'{D}/{nome}'], check=True)
    clips.append({'tipo': 'still', 'src': f'{OUT}/{nome}', 'inicio': round(t, 3), 'dur': dur, **extra}); t += dur

# ---------- SFX sintetizados (livres de direitos; troque por uma biblioteca real depois)
def gera(nome, filtro, dur):
    subprocess.run(FF + ['-f', 'lavfi', '-i', filtro, '-t', str(dur), '-ac', '2', '-ar', '48000', f'{D}/{nome}'], check=True)
gera('whoosh.wav', "anoisesrc=color=pink:amplitude=0.6,bandpass=f=1200:width_type=o:w=2,afade=t=in:d=0.18,afade=t=out:st=0.2:d=0.25", 0.45)
gera('pop.wav', "sine=f=880,volume=0.5,afade=t=out:st=0.02:d=0.12", 0.15)
gera('beep.wav', "sine=f=1000,volume=0.35", 0.45)
gera('boom.wav', "sine=f=55,volume=0.9,afade=t=out:st=0.05:d=0.6", 0.7)
gera('tick.wav', "anoisesrc=color=white:amplitude=0.35,highpass=f=2500,afade=t=out:st=0.005:d=0.03", 0.04)
gera('trilha-teste.wav', "aevalsrc='0.08*sin(2*PI*220*t)*(0.6+0.4*sin(2*PI*2*t))+0.06*sin(2*PI*277*t)+0.05*sin(2*PI*330*t)':s=48000,lowpass=f=1800", 60)

# ---------- S0: abertura com zoom na barra do navegador (palavras.co), depois afasta para a página inteira
F0 = f'{UP}/code/remotion-redes-sociais/_fontes/tela_url_46.mp4'
add_video(F0, 2.0, 5.2, [], 'tela', {'regiaoAnim': {'de': [0.035, 0.065, 0.24, 0.05], 'para': [0.0, 0.0, 1.0, 1.0], 'segura': 1.1, 'anima': 1.4}})
clips[-1].pop('onda', None)  # abertura sem fala: sem onda de voz
sfx.append({'t': 1.1, 'src': f'{OUT}/whoosh.wav', 'vol': 0.6})
sfx.append({'t': t - 0.15, 'src': f'{OUT}/whoosh.wav', 'vol': 0.8}); momentos.append({'t': t, 'tipo': 'transicao'})

# ---------- S1: botão da foto (selfie vertical) + gancho + ERRO congelado
F1 = f'{UP}/midias-compartilhadas/palavras/youtube/inveja/videos/20261010_231243/20261010_231243.mp4'
w1 = palavras(F1.replace('.mp4', '.json'))
add_video(F1, 0.0, 6.3, w1, 'camera', {'foco': [0.5, 0.4]})
burro = next(w for w in w1 if w[2].lower().startswith('burro'))
add_video(F1, 9.8, burro[1] + 0.15, w1, 'camera', {'foco': [0.5, 0.4]})
momentos.append({'t': ws_out[-1]['t0'], 'tipo': 'zoom', 'forca': 1.25})
add_still(F1, burro[1] + 0.1, 1.0, {'carimbo': 'ERRO #1', 'tremida': True})
sfx.append({'t': clips[-1]['inicio'], 'src': f'{OUT}/boom.wav', 'vol': 0.9})

# ---------- S2: desejo mesquinho (corte seco automático, censura, sticker)
sfx.append({'t': t - 0.15, 'src': f'{OUT}/whoosh.wav', 'vol': 0.8}); momentos.append({'t': t, 'tipo': 'transicao'})
F2 = f'{UP}/code/remotion-redes-sociais/_fontes/desejo_23.mp4'
w2 = palavras(f'{VID}/20261010_215543/20261010_215543.json', desloc=23.0)
face = json.load(open('/tmp/claude-0/face_desejo.json'))
fx = statistics.median([f[1] for f in face]) if face else 0.5
fy = statistics.median([f[2] for f in face]) if face else 0.45
ini_s2 = t
for a, b in intervalos_fala(w2, 24.0 - 23.0, 43.5 - 23.0):
    add_video(F2, a, b, w2, 'camera', {'foco': [round(fx, 3), round(fy, 3)]})
for w in ws_out:
    if w['t0'] >= ini_s2 and re.sub(r'\W', '', w['texto'].lower()) == 'mesquinho':
        momentos.append({'t': w['t0'], 'tipo': 'sticker', 'texto': 'DESEJO MESQUINHO', 'dur': 1.6}); momentos.append({'t': w['t0'], 'tipo': 'zoom', 'forca': 1.15})
        sfx.append({'t': w['t0'], 'src': f'{OUT}/pop.wav', 'vol': 0.8})
    if w['t0'] >= ini_s2 and re.sub(r'\W', '', w['texto'].lower()) in ('merda', 'porra', 'bosta'):
        mutes.append({'t0': w['t0'], 't1': w['t1']}); sfx.append({'t': w['t0'], 'src': f'{OUT}/beep.wav', 'vol': 0.6}); w['censura'] = True

# ---------- S3: tela do Palavras AI (anáfora) + cartão de etimologia + onda de voz
sfx.append({'t': t - 0.15, 'src': f'{OUT}/whoosh.wav', 'vol': 0.8}); momentos.append({'t': t, 'tipo': 'transicao'})
F3 = f'{UP}/code/remotion-redes-sociais/_fontes/tela_anafora_530.mp4'
w3 = palavras(f'{VID}/2026-10-10 22-46-03/2026-10-10 22-46-03.json', desloc=530.0)
ini_s3 = t
for a, b in [(531, 538.5), (570, 580), (592, 603)]:
    for x, y in intervalos_fala(w3, a - 530, b - 530):
        add_video(F3, x, y, w3, 'tela', {'regiao': [0.29, 0.14, 0.66, 0.62]})
prim = [w for w in ws_out if w['t0'] >= ini_s3 and 'anáfora' in w['texto'].lower()][-1]  # quando ele abre o verbete no dicionário
momentos.append({'t': prim['t0'], 'tipo': 'zoom', 'forca': 1.12})
momentos.append({'t': prim['t0'] + 0.6, 'tipo': 'etimologia', 'dur': 5.0,
  'palavra': 'anáfora', 'classe': 'substantivo feminino',
  'origem': 'do grego anaphorá, “ação de levar de volta, repetição”',
  'partes': [['ana-', 'de novo, para trás'], ['phérein', 'levar']],
  'fonte': 'palavras.co (texto provisório: na versão real vem do verbete)'})
sfx.append({'t': prim['t0'] + 0.6, 'src': f'{OUT}/pop.wav', 'vol': 0.7})

# transição zoom + desfoque entre blocos (site -> vídeo, vídeo -> site)
for mt in [x['t'] for x in momentos if x['tipo'] == 'transicao']:
    for c in clips:
        if abs(c['inicio'] + c['dur'] - mt) < 0.01: c['sai'] = True
        if abs(c['inicio'] - mt) < 0.01: c['entra'] = True
dur_total = round(t + 3.2, 3)  # +3.2 s de CTA/engajamento e loop
props = {'id': 'montagem-bastidores-inveja', 'marca': 'palavras', 'duracao': dur_total, 'clips': clips, 'palavras': ws_out,
  'momentos': sorted(momentos, key=lambda m: m['t']), 'sfx': sfx, 'mutes': mutes,
  'gancho': {'texto': 'Os bastidores do meu primeiro vídeo', 'ate': 3.0, 'tick': f'{OUT}/tick.wav'},
  'cta': {'texto': 'A investigação inteira está no canal Palavras', 'engajamento': 'Comenta: qual palavra você usa sem saber o nome?'},
  'trilha': {'src': f'{OUT}/trilha-teste.wav', 'volume': 0.22}, 'loop': clips[0]['src']}
json.dump(props, open(f'{R}/src/montagem.json', 'w'), ensure_ascii=False, indent=1)
print(f'OK: {len(clips)} clipes, {len(ws_out)} palavras, {len(momentos)} momentos, {len(sfx)} sfx, {len(mutes)} censuras, {dur_total}s')
print('mutes', mutes, 'foco', fx, fy)
