# CAPAS EDITORIAIS DO PALAVRAS (opção aprovada em 19/10/2026). Referências e tokens:
#   identidade-visual\palavras\04-sistema-visual\base-existente\CAPAS-EDITORIAIS-v1.md  (estilos E1 colagem, E2 meio rosto, E3 foto real)
# Uso: python capas_editoriais.py <pasta-saida> <pasta-com-quadros 4K *.jpg> [peça,peça,...]
# Cada peça vira 3 capas: capa-<marca>-e1-colagem.png, -e2-meio-rosto.png, -e3-foto-real.png
# Regra fixa: o logo do Palavras (completo ou só o ícone) aparece em toda capa.
import base64, io, os, random, sys
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from playwright.sync_api import sync_playwright

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public')
QUADROS = sys.argv[2]
def b64f(p): return base64.b64encode(open(p, 'rb').read()).decode()
def b64img(im, fmt='JPEG', q=88):
    buf = io.BytesIO(); im.save(buf, fmt, quality=q) if fmt == 'JPEG' else im.save(buf, fmt); return f'data:image/{fmt.lower()};base64,' + base64.b64encode(buf.getvalue()).decode()
FONTE = lambda n: f"{RAIZ}/fonts/{n}"
FONTS = f"""
@font-face{{font-family:Playfair;font-weight:900;src:url(data:font/woff2;base64,{b64f(FONTE('PlayfairDisplay-900.woff2'))})}}
@font-face{{font-family:Playfair;font-weight:700;src:url(data:font/woff2;base64,{b64f(FONTE('PlayfairDisplay-700.woff2'))})}}
@font-face{{font-family:Cormorant;font-weight:500;src:url(data:font/woff2;base64,{b64f(FONTE('CormorantGaramond-500-normal.woff2'))})}}
@font-face{{font-family:Cormorant;font-weight:500;font-style:italic;src:url(data:font/woff2;base64,{b64f(FONTE('CormorantGaramond-500-italic.woff2'))})}}
@font-face{{font-family:Cormorant;font-weight:600;src:url(data:font/woff2;base64,{b64f(FONTE('CormorantGaramond-600-normal.woff2'))})}}
@font-face{{font-family:Inter;font-weight:500;src:url(data:font/woff2;base64,{b64f(FONTE('Inter-500.woff2'))})}}
"""
# tokens editoriais (medidos nas 3 referências; ver CAPAS-EDITORIAIS-v1.md)
T = dict(papel='#EBDFC9', papel2='#F3E9D5', tinta='#1B1B1B', terracota='#B04B29', terracota2='#B3603C', ocre='#C48843',
         sub='#5E5852', creme='#FAEFDA', fio='#DE973C', rotulo='#C46D45')
LOGO = lambda cor: 'data:image/svg+xml;base64,' + b64f(f'{RAIZ}/marca/palavras-logo-{cor}.svg')
ICONE = lambda cor: 'data:image/svg+xml;base64,' + b64f(f'{RAIZ}/marca/palavras-icone-{cor}.svg')
GRAO = '<svg class="abs" style="opacity:.13;mix-blend-mode:multiply" width="1080" height="1920"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>'
BASE = lambda bg, corpo: f'''<!doctype html><html><head><meta charset="utf-8"><style>{FONTS}
*{{margin:0;padding:0;box-sizing:border-box}} body{{width:1080px;height:1920px;overflow:hidden;background:{bg};position:relative}}
.abs{{position:absolute}}</style></head><body>{corpo}</body></html>'''

# ---------- rosto: máscara (rembg em escala reduzida) e medidas da cabeça no quadro inteiro
_sess = None
def rosto(nome):
    global _sess
    from rembg import remove, new_session
    from scipy import ndimage
    _sess = _sess or new_session('u2net_human_seg')
    im = Image.open(os.path.join(QUADROS, nome + '.jpg')).convert('RGB')
    pq = im.resize((im.width // 4, im.height // 4))
    m = np.array(remove(pq, session=_sess, only_mask=True)) > 128
    lab, n = ndimage.label(m)
    if n > 1: m = lab == (1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1)))))
    ys, xs = np.nonzero(m); top = ys.min(); H = ys.max() - top
    faixa = m[top:top + int(H * .12)]; w = faixa.sum(1); w = w[w > 0]
    hw = float(np.median(w[len(w) // 3:])) * 4
    cx = float(np.mean(np.nonzero(m[top:top + int(H * .1)])[1])) * 4
    mask = Image.fromarray((m * 255).astype('uint8')).resize(im.size).filter(ImageFilter.GaussianBlur(6))
    return dict(im=im, mask=mask, top=top * 4, hw=hw, cx=cx)

def pb(im, c=1.25): return ImageEnhance.Contrast(ImageOps.grayscale(im)).enhance(c)

# título = gancho de curiosidade (CAPAS.md): 2 linhas separadas por '|'; corpo ajustado à linha mais longa
def tam(titulo, em, maximo, largura=950):
    n = max(len(l) for l in titulo.split('|'))
    return int(min(maximo, largura / (n * em)))
def linhas(titulo): return titulo.replace('|', '<br>')

# ---------- E1 colagem editorial (papel rasgado + fragmentos P&B + blocos terracota/ocre/preto)
def rasgo(x, y, w, h, seed, amp=10):
    r = random.Random(seed); pts = []
    for i in range(13): pts.append((x + w * i / 12, y + r.uniform(-amp, amp)))
    for i in range(1, 13): pts.append((x + w + r.uniform(-amp, amp), y + h * i / 12))
    for i in range(1, 13): pts.append((x + w - w * i / 12, y + h + r.uniform(-amp, amp)))
    for i in range(1, 12): pts.append((x + r.uniform(-amp, amp), y + h - h * i / 12))
    return 'polygon(' + ','.join(f'{a:.0f}px {b:.0f}px' for a, b in pts) + ')'

def frag_foto(R, faixa, x, y, w, h, rot, seed):
    hw, cx, top = R['hw'], R['cx'], R['top']
    y0 = top + hw * {'olho': .42, 'boca': .98, 'rosto': .05}[faixa]
    hh = hw * {'olho': .42, 'boca': .42, 'rosto': 1.5}[faixa]
    ww = hh * w / h
    crop = pb(R['im']).crop((int(cx - ww / 2), int(y0), int(cx + ww / 2), int(y0 + hh))).resize((w, h))
    return (f'<div class="abs" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;transform:rotate({rot}deg);'
            f'clip-path:{rasgo(0, 0, w, h, seed, 9)};background:url({b64img(crop)}) center/cover;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35))"></div>'
            f'<div class="abs" style="left:{x-6}px;top:{y-6}px;width:{w+12}px;height:{h+12}px;transform:rotate({rot}deg);z-index:-1;clip-path:{rasgo(0,0,w+12,h+12,seed+7,9)};background:{T["papel2"]}"></div>')

def bloco(cor, x, y, w, h, rot, seed, extra=''):
    return f'<div class="abs" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:{cor};transform:rotate({rot}deg);clip-path:{rasgo(0,0,w,h,seed,6)};{extra}"></div>'

def e1(R, kicker, sub, marca):
    corpo = (GRAO +
      f'<div class="abs" style="left:560px;top:110px;width:520px;height:520px;border-radius:50%;background:{T["ocre"]};opacity:.92"></div>' +
      bloco(T['terracota'], 780, 0, 300, 520, 0, 1) + '<div class="abs" style="left:0;top:90px;width:1080px;height:1920px">' + bloco(T['tinta'], 330, 640, 760, 360, -4, 2) +
      bloco(T['terracota'], 0, 1100, 470, 520, 3, 3) + bloco(T['ocre'], 430, 1420, 420, 500, -6, 4) + bloco(T['tinta'], 760, 1260, 320, 660, 0, 5) +
      frag_foto(R, 'olho', 410, 690, 640, 330, -3, 11) + frag_foto(R, 'boca', 560, 1330, 520, 300, 2, 12) +
      frag_foto(R, 'rosto', 60, 1140, 380, 560, 0, 13) + '</div>' +
      f'<svg class="abs" width="1080" height="1920"><line x1="60" y1="200" x2="170" y2="200" stroke="{T["terracota"]}" stroke-width="5"/>'
      f'<line x1="40" y1="1700" x2="420" y2="1700" stroke="{T["tinta"]}" stroke-width="2"/><line x1="140" y1="1560" x2="140" y2="1900" stroke="{T["tinta"]}" stroke-width="2"/>'
      f'<line x1="1000" y1="40" x2="1000" y2="1880" stroke="{T["ocre"]}" stroke-width="3"/></svg>' +
      f'<div class="abs" style="left:62px;top:250px;font:500 36px/1 Inter;letter-spacing:9px;color:{T["terracota"]}">{kicker}</div>' +
      f'<div class="abs" style="left:52px;top:292px;font:900 {tam(sub[0], .56, 165)}px/.95 Playfair;color:{T["tinta"]};letter-spacing:-1px">{linhas(sub[0])}</div>' +
      f'<div class="abs" style="left:62px;top:{300 + 2 * .95 * tam(sub[0], .56, 165) + 16:.0f}px;width:640px;font:italic 500 58px/1.05 Cormorant;color:{T["tinta"]}">{sub[1]}</div>' +
      f'<div class="abs" style="left:50px;top:1760px;padding:18px 26px;background:{T["papel2"]};box-shadow:0 6px 18px rgba(0,0,0,.25)"><img src="{LOGO("grafite")}" style="height:62px;display:block"></div>')
    return BASE(T['papel'], corpo)

# ---------- E2 meio rosto (papel claro, círculo terracota, meio rosto P&B na borda direita)
def e2(R, kicker, sub, marca):
    im = pb(R['im'], 1.3).convert('RGBA'); im.putalpha(R['mask'])
    s = 860 / R['hw']; W, H = int(im.width * s), int(im.height * s)
    face = im.resize((W, H))
    left = int(1080 + .12 * 860 - R['cx'] * s); top = int(640 - (R['top'] + .62 * R['hw']) * s)
    corpo = (GRAO +
      f'<div class="abs" style="left:430px;top:70px;width:660px;height:660px;border-radius:50%;background:{T["terracota2"]}"></div>' +
      f'<img class="abs" src="{b64img(face, "PNG")}" style="left:{left}px;top:{top}px;width:{W}px;height:{H}px">' +
      f'<div class="abs" style="left:66px;top:95px"><img src="{LOGO("grafite")}" style="height:58px;display:block"></div>' +
      f'<div class="abs" style="left:76px;top:190px;width:76px;height:6px;background:{T["terracota2"]}"></div>' +
      (f'<div class="abs" style="left:70px;top:226px;font:500 38px/1 Inter;letter-spacing:9px;color:{T["terracota2"]}">{kicker}</div>' if marca != 'palavras' else '') +
      f'<div class="abs" style="left:60px;top:740px;font:900 {tam(sub[0], .56, 165)}px/.95 Playfair;color:{T["tinta"]};letter-spacing:-1px"><span style="background:{T["papel2"]}E6;padding:0 14px;box-decoration-break:clone;-webkit-box-decoration-break:clone">{linhas(sub[0])}</span></div>' +
      f'<div class="abs" style="left:70px;top:{750 + 2 * .95 * tam(sub[0], .56, 165) + 18:.0f}px;width:620px;font:500 64px/1.05 Cormorant;color:{T["sub"]}"><span style="background:{T["papel2"]}E6;padding:0 14px;box-decoration-break:clone;-webkit-box-decoration-break:clone">{sub[1]}</span></div>' +
      f'<div class="abs" style="left:76px;top:1250px;width:136px;height:6px;background:{T["terracota2"]}"></div>')
    return BASE(T['papel2'], corpo)

# ---------- E3 foto real (cenário real em sépia quente, fundo desfocado, texto embaixo)
def e3(R, kicker, sub, marca):
    im = R['im']; sc = 1920 / im.height; W = int(im.width * sc)
    big = im.resize((W, 1920)); mk = R['mask'].resize((W, 1920))
    cx = int(R['cx'] * sc); x0 = max(0, min(W - 1080, cx - 600))
    big = big.crop((x0, 0, x0 + 1080, 1920)); mk = mk.crop((x0, 0, x0 + 1080, 1920))
    fundo = big.filter(ImageFilter.GaussianBlur(9))
    comp = Image.composite(big, fundo, mk)
    g = ImageOps.grayscale(comp); sep = ImageOps.colorize(g, '#140b06', '#f2dcc0', mid='#8a5a36')
    sep = Image.blend(sep, comp, .25); sep = ImageEnhance.Contrast(sep).enhance(1.1)
    rot = f'<div class="abs" style="left:86px;top:1136px;font:500 40px/1 Inter;letter-spacing:10px;color:{T["rotulo"]}">{kicker}</div>' if kicker else ''
    corpo = (f'<img class="abs" src="{b64img(sep)}" style="left:0;top:0;width:1080px;height:1920px">' +
      '<div class="abs" style="left:0;top:900px;width:1080px;height:1020px;background:linear-gradient(transparent,rgba(10,6,4,.55) 35%,rgba(10,6,4,.92))"></div>' +
      (f'<div class="abs" style="left:86px;top:1090px"><img src="{LOGO("osso")}" style="height:56px;display:block;opacity:.95"></div>' if marca == 'palavras' else rot) +
      f'<div class="abs" style="left:88px;top:1190px;width:84px;height:5px;background:{T["fio"]}"></div>' +
      f'<div class="abs" style="left:80px;top:1228px;font:500 {tam(sub[0], .47, 165)}px/1 Cormorant;letter-spacing:4px;color:{T["creme"]}">{linhas(sub[0])}</div>' +
      f'<div class="abs" style="left:86px;top:{1240 + 2 * tam(sub[0], .47, 165) + 14:.0f}px;width:900px;font:italic 500 56px/1.1 Cormorant;letter-spacing:3px;color:{T["creme"]}">{sub[1]}</div>' +
      (f'<img class="abs" src="{ICONE("osso")}" style="right:70px;bottom:90px;width:92px;opacity:.9">' if marca != 'palavras' else ''))
    return BASE('#000', corpo)

# peça: (pasta da peça, marca, quadro, chamada, (título-gancho em 2 linhas 'a|b', linha de apoio que não entrega o final))
PECAS = [
  ('aquecendo-a-voz-pb', 'luiz', 'aq_44', 'BASTIDORES', ('Antes de|gravar, eu…', 'o ritual que ninguém vê')),
  ('cantando-sem-audio-pb', 'luiz', 'ca_8', 'BASTIDORES', ('O estúdio|virou…', 'entre uma tomada e outra')),
  ('aqui-e-bastidor', 'luiz', 'bs_100', 'BASTIDORES', ('Eu e essa|câmera…', 'uma relação complicada')),
  ('nao-conhecia-anafora', 'luiz', 'aq_38', 'BASTIDORES', ('Escrevo há|anos e…', 'a IA viu o que eu não via')),
  ('nao-conhecia-anafora', 'palavras', 'aq_38', 'INVESTIGAÇÃO', ('Escrevo há|anos e…', 'a IA viu o que eu não via')),
  ('desejo-mesquinho', 'luiz', 'de_43', 'BASTIDORES', ('Tomara que|o dele…', 'me peguei no flagra')),
  ('ela-nao-fere-ela-localiza', 'palavras', 'aq_41', 'INVESTIGAÇÃO', ('Ela não fere.|Ela…', 'o que a inveja faz em silêncio')),
  ('botao-da-foto-pb', 'luiz', 'bf_6.8', 'BASTIDORES', ('Gravei 10|minutos e…', 'o bastidor que ninguém mostra')),
  ('frase-escolhida', 'palavras', 'bf_7.2', 'BASTIDORES', ('A IA me deu|opções…', 'qual você escolheria?')),
  ('montagem-bastidores-inveja', 'palavras', 'bf_10.8', 'BASTIDORES', ('Eu achei|que sabia…', 'os bastidores do primeiro vídeo')),
  ('montagem-bastidores-inveja', 'luiz', 'bf_10.8', 'BASTIDORES', ('Eu achei|que sabia…', 'os bastidores do primeiro vídeo')),
  ('entre-ele-e-mim', 'palavras', 'bs_96', 'INVESTIGAÇÃO', ('Uma ordem|dói mais…', 'a mesma frase, outro peso')),
]
ESTILOS = [('e1-colagem', e1), ('e2-meio-rosto', e2), ('e3-foto-real', e3)]

if __name__ == '__main__':
    out = sys.argv[1]; cache = {}
    so = set(sys.argv[3].split(',')) if len(sys.argv) > 3 else None  # opcional: só estas peças
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        for peca, marca, q, kick, sub in PECAS:
            if so and peca not in so: continue
            R = cache.setdefault(q, rosto(q))
            for nome, fn in ESTILOS:
                pg.set_content(fn(R, kick, sub, marca)); pg.wait_for_timeout(500)
                pg.screenshot(path=f'{out}/{peca}__capa-{marca}-{nome}.png')
            print('ok', peca, marca)
        b.close()
