# CAPAS DO PERFIL LUIZ — quatro modelos aprovados em 20/10/2026 (L-EDI, L-TEA, L-COT, L-EXP).
# Regras: identidade-visual\luiz\04-sistema-visual\LUIZ-APLICACAO-REDES-PROPOSTA-v1.md
#   imagem real primeiro; texto opcional em Barlow Condensed 800 (+ Inter); um acento quente; sem logo do Palavras.
# Uso: python capas_luiz.py <pasta-saida> <pasta-com-quadros 4K *.jpg> [peça,peça,...]
# Saída: <peça>__capa-luiz-l-edi.png, -l-tea.png, -l-cot.png, -l-exp.png
import base64, io, os, random, sys
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from playwright.sync_api import sync_playwright

RAIZ = os.environ.get('PUBLIC') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public')
QUADROS = sys.argv[2]
def b64f(p): return base64.b64encode(open(p, 'rb').read()).decode()
def b64img(im, q=90):
    buf = io.BytesIO(); im.convert('RGB').save(buf, 'JPEG', quality=q)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
FONTS = (f"@font-face{{font-family:Barlow;font-weight:800;src:url(data:font/woff2;base64,{b64f(RAIZ + '/fonts/BarlowCondensed-800.woff2')})}}"
         f"@font-face{{font-family:Inter;font-weight:400;src:url(data:font/woff2;base64,{b64f(RAIZ + '/fonts/Inter-400.woff2')})}}"
         f"@font-face{{font-family:Inter;font-weight:500;src:url(data:font/woff2;base64,{b64f(RAIZ + '/fonts/Inter-500.woff2')})}}")
# cores (leitura das referências): tinta quase preta, osso, acentos
C = dict(tinta='#11130D', osso='#F1ECE4', laranja='#BB3E0C', vermelho='#A3221C', grafite='#2D2C2D')
BASE = lambda corpo: (f'<!doctype html><html><head><meta charset="utf-8"><style>{FONTS}*{{margin:0;padding:0;box-sizing:border-box}}'
                      f'body{{width:1080px;height:1920px;overflow:hidden;background:#000;position:relative}}.abs{{position:absolute}}</style></head><body>{corpo}</body></html>')

_sess = None
def mascara(im):
    global _sess
    from rembg import remove, new_session
    from scipy import ndimage
    _sess = _sess or new_session('u2net_human_seg')
    pq = im.resize((im.width // 4, im.height // 4))
    m = np.array(remove(pq, session=_sess, only_mask=True)) > 128
    lab, n = ndimage.label(m)
    if n > 1: m = lab == (1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1)))))
    return m  # em 1/4 da escala

def recorte(im, cx, cy, zoom):
    """recorte 9:16 centrado em (cx, cy) (frações do quadro); zoom 1 = maior recorte possível."""
    W, H = im.size
    h = min(H, W * 16 / 9) / zoom; w = h * 9 / 16
    x0 = min(max(0, cx * W - w / 2), W - w); y0 = min(max(0, cy * H - h / 2), H - h)
    return (x0, y0, x0 + w, y0 + h)

def gancho_html(texto, apoio, y, cor, acento, alinha='left', tam=None):
    linhas = texto.split('|'); n = max(len(l) for l in linhas)
    t = tam or int(min(160, 940 / (n * .47)))
    destaque = linhas[:-1] + [f'<span style="border-bottom:10px solid {acento};padding-bottom:2px">{linhas[-1]}</span>']
    sombra = 'text-shadow:0 2px 18px rgba(0,0,0,.35);' if cor == C['osso'] else ''
    h = (f'<div class="abs" style="left:70px;right:70px;top:{y}px;text-align:{alinha};font:800 {t}px/1.02 Barlow;letter-spacing:.5px;'
         f'text-transform:uppercase;color:{cor};{sombra}">{"<br>".join(destaque)}</div>')
    if apoio:
        h += (f'<div class="abs" style="left:74px;right:74px;top:{y + len(linhas) * t * 1.02 + 34:.0f}px;text-align:{alinha};'
              f'font:500 44px/1.25 Inter;color:{cor};{sombra}">{apoio}</div>')
    return h

def luz_media(im, caixa):
    return float(np.asarray(ImageOps.grayscale(im.crop(caixa))).mean())

# ---------- L-EDI: foto real, correção fiel, gancho numa área vazia da própria foto (acento laranja)
def l_edi(q, cfg):
    im = q['im']; c = im.crop(recorte(im, *cfg['enq'])).resize((1080, 1920), Image.LANCZOS)
    c = ImageEnhance.Contrast(c).enhance(1.06)
    y = cfg.get('y', 260)
    cor = C[cfg['cor']] if cfg.get('cor') else (C['tinta'] if luz_media(c, (60, y, 1020, y + 360)) > 140 else C['osso'])
    return BASE(f'<img class="abs" src="{b64img(c)}" style="left:0;top:0;width:1080px;height:1920px">'
                + gancho_html(cfg['gancho'], cfg.get('apoio'), y, cor, C['laranja']))

# ---------- L-TEA: luz recortada, fundo afundado no escuro, uma palavra ou nenhuma
def l_tea(q, cfg):
    im = q['im']; box = recorte(im, *cfg['enq'])
    c = im.crop(box).resize((1080, 1920), Image.LANCZOS)
    m = Image.fromarray((q['m'] * 255).astype('uint8')).resize(im.size).crop(box).resize((1080, 1920)).filter(ImageFilter.MinFilter(15)).filter(ImageFilter.GaussianBlur(8))
    sujeito = ImageEnhance.Contrast(ImageEnhance.Color(c).enhance(.55)).enhance(1.35)
    fundo = ImageEnhance.Brightness(ImageOps.grayscale(c).convert('RGB')).enhance(.13)
    comp = Image.composite(sujeito, fundo, m)
    # luz lateral: escurece o lado oposto ao rosto
    g = np.linspace(1.0, .45, 1080) if cfg.get('luz', 'e') == 'e' else np.linspace(.45, 1.0, 1080)
    comp = Image.fromarray((np.asarray(comp).astype(float) * g[None, :, None]).clip(0, 255).astype('uint8'))
    palavra = cfg.get('palavra')
    txt = (f'<div class="abs" style="left:0;right:0;top:1560px;text-align:center;font:800 120px/1 Barlow;letter-spacing:6px;color:{C["osso"]}">'
           f'{palavra}<span style="color:{C["laranja"]}">.</span></div>') if palavra else ''
    return BASE(f'<img class="abs" src="{b64img(comp)}" style="left:0;top:0;width:1080px;height:1920px">'
                '<div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 42%,transparent 45%,rgba(0,0,0,.65))"></div>' + txt)

# ---------- L-COT: quadro espontâneo, detalhe (mão, objeto), sem texto
def l_cot(q, cfg):
    im = q['im']; c = im.crop(recorte(im, *cfg['enq'])).resize((1080, 1920), Image.LANCZOS)
    c = ImageEnhance.Contrast(c).enhance(1.04)
    return BASE(f'<img class="abs" src="{b64img(c)}" style="left:0;top:0;width:1080px;height:1920px">')

# ---------- L-EXP: foto P&B + uma técnica: contorno à mão em vermelho-tinta
def contorno_svg(mask_box, seed):
    """contorno à mão: segue a silhueta, abre o traço onde ela encosta na borda do quadro (sem linha reta de fechamento)."""
    from skimage import measure
    r = random.Random(seed); paths = []
    H, W = mask_box.shape
    cs = sorted(measure.find_contours(np.pad(mask_box, 1), .5), key=len, reverse=True)[:1]
    segs = []
    for cont in cs:
        cont = cont - 1; atual = []
        for y, x in cont[::max(1, len(cont) // 220)]:
            if x < 4 or y < 4 or x > W - 5 or y > H - 5:
                if len(atual) > 3: segs.append(atual)
                atual = []
            else: atual.append((x, y))
        if len(atual) > 3: segs.append(atual)
    for k in range(2):  # duas passadas, como traço à mão
        for seg in segs:
            d = 'M' + ' L'.join(f'{x + r.uniform(-6, 6) + k * 6:.0f} {y + r.uniform(-6, 6) - k * 4:.0f}' for x, y in seg)
            paths.append(f'<path d="{d}" fill="none" stroke="{C["vermelho"]}" stroke-width="{8 - 3 * k}" stroke-linejoin="round" stroke-linecap="round" opacity="{.95 - .25 * k}"/>')
    return '<svg class="abs" style="left:0;top:0" width="1080" height="1920">' + ''.join(paths) + '</svg>'

def l_exp(q, cfg):
    im = q['im']; box = recorte(im, *cfg['enq'])
    c = ImageEnhance.Contrast(ImageOps.grayscale(im.crop(box).resize((1080, 1920), Image.LANCZOS))).enhance(1.2).convert('RGB')
    m = Image.fromarray((q['m'] * 255).astype('uint8')).resize(im.size).crop(box).resize((270, 480)).filter(ImageFilter.GaussianBlur(2))
    ma = np.asarray(m) / 255.0
    from scipy import ndimage
    ma = ndimage.zoom(ma, 4, order=1)
    y = cfg.get('y', 260)
    cor = C[cfg['cor']] if cfg.get('cor') else (C['tinta'] if luz_media(c, (60, y, 1020, y + 360)) > 140 else C['osso'])
    txt = gancho_html(cfg['gancho'], None, y, cor, C['vermelho']) if cfg.get('gancho') else ''
    return BASE(f'<img class="abs" src="{b64img(c)}" style="left:0;top:0;width:1080px;height:1920px">' + contorno_svg(ma, cfg.get('seed', 3)) + txt)

MODELOS = [('l-edi', l_edi), ('l-tea', l_tea), ('l-cot', l_cot), ('l-exp', l_exp)]

# peça -> configuração por modelo. enq = (centro x, centro y, zoom) em frações do quadro.
# Ganchos: propostas para aprovação do Luiz (curiosidade, sem entregar o final).
PECAS = {
  'aquecendo-a-voz-pb': {
    'l-edi': dict(q='aq_44', enq=(.36, .5, 1.25), gancho='Antes de|gravar, eu…', apoio='o ritual que ninguém vê', y=1240, cor='osso'),
    'l-tea': dict(q='aq_47', enq=(.34, .48, 1.45), palavra='ANTES', luz='d'),
    'l-cot': dict(q='aq_44', enq=(.47, .6, 2.1)),
    'l-exp': dict(q='aq_38', enq=(.34, .5, 1.25), gancho='Ninguém|vê isso', y=1300, cor='osso', seed=4)},
  'cantando-sem-audio-pb': {
    'l-edi': dict(q='ca_8', enq=(.5, .55, 1.0), gancho='O estúdio|virou…', apoio='entre uma tomada e outra', y=230),
    'l-tea': dict(q='ca_5', enq=(.6, .45, 1.35), palavra=None, luz='d'),
    'l-cot': dict(q='ca_11', enq=(.62, .72, 1.9)),
    'l-exp': dict(q='ca_8', enq=(.55, .5, 1.1), gancho='Sem som.|Mas…', y=220, seed=7)},
  'aqui-e-bastidor': {
    'l-edi': dict(q='bs_100', enq=(.5, .55, 1.0), gancho='Eu e essa|câmera…', apoio='uma relação complicada', y=220),
    'l-tea': dict(q='bs_96', enq=(.62, .4, 1.35), palavra=None, luz='d'),
    'l-cot': dict(q='bs_102', enq=(.45, .62, 1.9)),
    'l-exp': dict(q='bs_98', enq=(.55, .52, 1.05), gancho='Corta|isso aí', y=230, seed=9)},
  'nao-conhecia-anafora': {
    'l-edi': dict(q='aq_38', enq=(.36, .5, 1.25), gancho='Escrevo há|anos e…', apoio='a IA viu o que eu não via', y=1240, cor='osso'),
    'l-tea': dict(q='ue_48', enq=(.62, .45, 1.3), palavra='ANOS', luz='d'),
    'l-cot': dict(q='ue_32', enq=(.45, .66, 1.8)),
    'l-exp': dict(q='ue_38', enq=(.6, .5, 1.1), gancho='Tinha|nome?', y=230, seed=11)},
  'desejo-mesquinho': {
    'l-edi': dict(q='de_43', enq=(.55, .5, 1.0), gancho='Tomara que|o dele…', apoio='me peguei no flagra', y=220, cor='tinta'),
    'l-tea': dict(q='de_38', enq=(.6, .4, 1.4), palavra='TOMARA', luz='d'),
    'l-cot': dict(q='de_35', enq=(.35, .6, 1.9)),
    'l-exp': dict(q='de_41', enq=(.6, .5, 1.1), gancho='Pensei.|Falei.', y=220, cor='tinta', seed=13)},
  'botao-da-foto-pb': {
    'l-edi': dict(q='bf_6.8', enq=(.5, .5, 1.0), gancho='Gravei 10|minutos e…', apoio='o bastidor que ninguém mostra', y=1350),
    'l-tea': dict(q='bf_7.2', enq=(.7, .35, 1.5), palavra=None, luz='d'),
    'l-cot': dict(q='bf_10.8', enq=(.3, .62, 2.0)),
    'l-exp': dict(q='bf_6.8', enq=(.6, .45, 1.15), gancho='10|minutos', y=1400, seed=15)},
  'montagem-bastidores-inveja': {
    'l-edi': dict(q='bf_10.8', enq=(.5, .5, 1.0), gancho='Eu achei|que sabia…', apoio='os bastidores do primeiro vídeo', y=1350),
    'l-tea': dict(q='bs_96', enq=(.62, .38, 1.5), palavra='PRIMEIRO', luz='d'),
    'l-cot': dict(q='ue_46', enq=(.45, .7, 1.8)),
    'l-exp': dict(q='ca_11', enq=(.5, .5, 1.05), gancho='Primeiro|vídeo', y=230, seed=17)},
}

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    so = set(sys.argv[3].split(',')) if len(sys.argv) > 3 else None
    cache = {}
    def quadro(nome):
        if nome not in cache:
            im = Image.open(os.path.join(QUADROS, nome + '.jpg')).convert('RGB')
            cache[nome] = dict(im=im, m=mascara(im))
        return cache[nome]
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        for peca, cfgs in PECAS.items():
            if so and peca not in so: continue
            for nome, fn in MODELOS:
                cfg = cfgs[nome]
                pg.set_content(fn(quadro(cfg['q']), cfg)); pg.wait_for_timeout(300)
                pg.screenshot(path=f'{out}/{peca}__capa-luiz-{nome}.png')
            print('ok', peca, flush=True)
        b.close()
