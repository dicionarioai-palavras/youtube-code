"""Destaque automático do trecho mencionado: quando a fala cita uma palavra que está VISÍVEL na tela
(gravação do site), acha a linha na imagem por OCR e cria um momento 'spot' (zoom + desfoque no resto).
Uso: python3 spots.py <raiz do projeto>  (lê e atualiza src/montagem.json)"""
import json, re, subprocess, sys, unicodedata
import pytesseract
from PIL import Image
R = sys.argv[1]; P = f'{R}/src/montagem.json'; m = json.load(open(P))
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
PARAR = {'quando', 'porque', 'entao', 'assim', 'agora', 'aqui', 'isso', 'esse', 'essa', 'mesmo', 'ainda', 'depois', 'sobre', 'muito'}
spots, ultimo = [], -99
for c in [c for c in m['clips'] if c.get('layout') == 'tela' and 'regiaoAnim' not in c]:
    for w in [w for w in m['palavras'] if c['inicio'] <= w['t0'] < c['inicio'] + c['dur']]:
        alvo = norm(w['texto'])
        if len(alvo) < 6 or alvo in PARAR or w['t0'] - ultimo < 3.5: continue
        loc = w['t0'] - c['inicio'] + 0.2
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{loc:.2f}', '-i', f"{R}/public/{c['src']}", '-frames:v', '1', '-vf', 'scale=2560:1440', '/tmp/ocr.png'], check=True)
        d = pytesseract.image_to_data(Image.open('/tmp/ocr.png'), lang='por', output_type=pytesseract.Output.DICT)
        linhas = {}
        for i, txt in enumerate(d['text']):
            if not txt.strip(): continue
            k = (d['block_num'][i], d['par_num'][i], d['line_num'][i])
            linhas.setdefault(k, []).append(i)
        for k, idx in linhas.items():
            hit = [j for j, i in enumerate(idx) if norm(d['text'][i]) == alvo]
            if not hit: continue
            idx = sorted(idx, key=lambda i: d['left'][i]); j = [n for n, i in enumerate(idx) if norm(d['text'][i]) == alvo][0]
            h = d['height'][idx[j]]; a = b = j
            while a > 0 and d['left'][idx[a]] - (d['left'][idx[a-1]] + d['width'][idx[a-1]]) < 2.5 * h: a -= 1
            while b < len(idx) - 1 and d['left'][idx[b+1]] - (d['left'][idx[b]] + d['width'][idx[b]]) < 2.5 * h: b += 1
            sel = idx[a:b+1]
            x0 = min(d['left'][i] for i in sel); y0 = min(d['top'][i] for i in sel)
            x1 = max(d['left'][i] + d['width'][i] for i in sel); y1 = max(d['top'][i] + d['height'][i] for i in sel)
            if y0 / 1440 < 0.2: continue  # cabeçalho/abas: ignora
            pad = 0.6 * h
            box = [round((x0 - pad) / 2560, 4), round((y0 - pad) / 1440, 4), round((x1 - x0 + 2 * pad) / 2560, 4), round((y1 - y0 + 2 * pad) / 1440, 4)]
            spots.append({'t': round(w['t0'], 3), 'tipo': 'spot', 'dur': 2.4, 'box': box, 'palavra': w['texto']}); ultimo = w['t0']
            print(f"spot '{w['texto']}' em {w['t0']:.2f}s -> {' '.join(d['text'][i] for i in sel)[:90]} box={box}")
            break
        if len(spots) >= 4: break
m['momentos'] = sorted([x for x in m['momentos'] if x['tipo'] != 'spot'] + spots, key=lambda x: x['t'])
json.dump(m, open(P, 'w'), ensure_ascii=False, indent=1); print(f'{len(spots)} spots')
