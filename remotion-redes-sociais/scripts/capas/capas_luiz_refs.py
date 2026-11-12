# CAPAS DO PERFIL LUIZ A PARTIR DAS REFERÊNCIAS ARTÍSTICAS (20/10/2026)
# Pedido do Luiz: "uma versão de cada possibilidade da referência artística", não várias da mesma.
# Cada técnica abaixo nasce de uma referência de identidade-visual\luiz\01-referencias\ (leitura em LUIZ-LEITURA-DAS-REFERENCIAS-v1.md)
# e é usada uma vez só nesta rodada. Base sempre é um quadro real do vídeo (nada de cenário inventado por IA).
# Texto só onde a referência usa texto como matéria da cena (placa, fita); sem logo do Palavras.
# Uso: python capas_luiz_refs.py <pasta-saida> <pasta-com-quadros 4K *.jpg>
import base64, io, os, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps, ImageChops
from scipy import ndimage

RAIZ = os.environ.get('PUBLIC') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public')
QUADROS = sys.argv[2]
W, H = 1080, 1920
C = dict(tinta=(17, 19, 13), osso=(241, 236, 228), vermelho=(163, 34, 28), laranja=(187, 62, 12), cinza=(188, 187, 185),
         areia=(211, 196, 180), petroleo=(31, 41, 49), vinho=(83, 51, 55))

_sess = None; _cache = {}
def quadro(nome):
    """quadro + máscara da pessoa (alfa suave, escala cheia) + medidas da cabeça."""
    global _sess
    if nome in _cache: return _cache[nome]
    from rembg import remove, new_session
    _sess = _sess or new_session('u2net_human_seg')
    im = Image.open(os.path.join(QUADROS, nome + '.jpg')).convert('RGB')
    pq = im.resize((im.width // 4, im.height // 4))
    m = np.array(remove(pq, session=_sess, only_mask=True)) > 128
    lab, n = ndimage.label(m)
    if n > 1: m = lab == (1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1)))))
    ys, xs = np.nonzero(m); top = ys.min()
    cab = m[top:top + max(8, int((ys.max() - top) * .12))]
    hw = float(np.median(cab.sum(1)[cab.sum(1) > 0])) * 4
    cx = float(np.mean(np.nonzero(cab)[1])) * 4
    alfa = Image.fromarray((m * 255).astype('uint8')).resize(im.size).filter(ImageFilter.GaussianBlur(3))
    _cache[nome] = dict(im=im, a=alfa, top=top * 4, hw=hw, cx=cx, bbox=(xs.min() * 4, top * 4, xs.max() * 4, ys.max() * 4))
    return _cache[nome]

def corte(im, cx, cy, h):
    """recorte 9:16 de altura h (px do quadro) centrado em (cx, cy) px."""
    w = h * 9 / 16; x0 = min(max(0, cx - w / 2), im.width - w); y0 = min(max(0, cy - h / 2), im.height - h)
    return (int(x0), int(y0), int(x0 + w), int(y0 + h))

def corte_frac(im, fx, fy, fh):
    return corte(im, fx * im.width, fy * im.height, fh * im.height)

def grao(im, forca=14, seed=1):
    r = np.random.default_rng(seed); a = np.asarray(im).astype(float)
    n = r.normal(0, forca, a.shape[:2])[..., None]
    return Image.fromarray((a + n).clip(0, 255).astype('uint8'))

def duotone(im, escuro, claro, meio=None):
    return ImageOps.colorize(ImageOps.grayscale(im), escuro, claro, mid=meio)

def vinheta(im, forca=.6, cx=.5, cy=.45):
    yy, xx = np.mgrid[0:im.height, 0:im.width]
    d = np.sqrt(((xx / im.width - cx) / .75) ** 2 + ((yy / im.height - cy) / .9) ** 2)
    g = (1 - forca * np.clip(d - .25, 0, 1) ** 1.3)[..., None]
    return Image.fromarray((np.asarray(im).astype(float) * g).clip(0, 255).astype('uint8'))

def recorte_pessoa(q, escala):
    im, a = q['im'], q['a']; x0, y0, x1, y1 = q['bbox']
    pe = im.crop((x0, y0, x1, y1)); al = a.crop((x0, y0, x1, y1))
    s = (int(pe.width * escala), int(pe.height * escala))
    pe = pe.resize(s, Image.LANCZOS).convert('RGBA'); pe.putalpha(al.resize(s, Image.LANCZOS)); return pe

def fundo(cor, ruido=6, seed=2):
    b = Image.new('RGB', (W, H), cor)
    return grao(vinheta(b, .25), ruido, seed)

# ---------- texto como matéria da cena (placa, fita) via navegador, com as fontes aprovadas
def com_texto(base, html):
    from playwright.sync_api import sync_playwright
    def b64f(p): return base64.b64encode(open(p, 'rb').read()).decode()
    buf = io.BytesIO(); base.save(buf, 'JPEG', quality=92)
    fonts = (f"@font-face{{font-family:Barlow;font-weight:800;src:url(data:font/woff2;base64,{b64f(RAIZ + '/fonts/BarlowCondensed-800.woff2')})}}"
             f"@font-face{{font-family:Inter;font-weight:500;src:url(data:font/woff2;base64,{b64f(RAIZ + '/fonts/Inter-500.woff2')})}}")
    doc = (f'<!doctype html><html><head><meta charset="utf-8"><style>{fonts}*{{margin:0;padding:0;box-sizing:border-box}}'
           f'body{{width:{W}px;height:{H}px;overflow:hidden;position:relative;background:url(data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()})}}'
           f'.abs{{position:absolute}}</style></head><body>{html}</body></html>')
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': W, 'height': H}); pg.set_content(doc); pg.wait_for_timeout(300)
        png = pg.screenshot(); b.close()
    return Image.open(io.BytesIO(png)).convert('RGB')

# ================= técnicas (uma por referência) =================

# A · estúdio cinza com humor seco (ref. 31 placa "CASTING Hollywood", 2 e 32 moda de estúdio):
#     pessoa recortada sobre cinza liso + uma placa que conta a piada.
def a_estudio_placa(q, placa):
    b = fundo(C['cinza']); p = recorte_pessoa(q, 2150 / (q['bbox'][3] - q['bbox'][1]))
    x = (W - p.width) // 2 + 150; y = H - p.height + 420
    sombra = Image.new('L', (W, H), 0); ImageDraw.Draw(sombra).ellipse((x + 40, H - 70, x + p.width - 40, H + 40), fill=110)
    b = Image.composite(Image.new('RGB', (W, H), (90, 88, 86)), b, sombra.filter(ImageFilter.GaussianBlur(30)))
    b.paste(p, (x, y), p)
    l1, l2, l3 = placa
    html = (f'<div class="abs" style="left:0;top:470px;width:120px;height:5px;background:linear-gradient(90deg,#999,#ddd);transform:rotate(-4deg)"></div>'
            f'<div class="abs" style="left:100px;top:380px;padding:14px 22px 16px;background:#A3221C;transform:rotate(-4deg);box-shadow:0 10px 18px rgba(0,0,0,.35);text-align:center;color:#EEE">'
            f'<div style="font:500 26px/1 Inter;letter-spacing:4px">{l1}</div><div style="font:500 24px/1.3 Inter;letter-spacing:3px">{l2}</div>'
            f'<div style="font:800 92px/1 Barlow;letter-spacing:2px">{l3}</div></div>')
    return com_texto(b, html)

# D · escala e absurdo tratado com naturalidade (ref. 25 sombra em círculo, 24 cabeça de nuvem):
#     pessoa pequena num campo vazio, saindo de um buraco preto. Campo chapado (gráfico), não paisagem inventada.
def d_buraco(q):
    b = Image.new('RGB', (W, H)); g = np.linspace(0, 1, H)[:, None, None]
    ceu = np.array((83, 124, 151)); chao = np.array((120, 128, 72))
    arr = np.where(np.arange(H)[:, None, None] < 1050, ceu * (.8 + g * .45), chao * (1 - (g - .55) * .4))
    b = grao(Image.fromarray(np.broadcast_to(arr, (H, W, 3)).astype('uint8')), 7)
    d = ImageDraw.Draw(b); cx, cy, rx, ry = 540, 1380, 330, 95
    d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(14, 14, 12))
    p = recorte_pessoa(q, 760 / (q['bbox'][3] - q['bbox'][1]))
    b.paste(p, (cx - p.width // 2, cy - p.height + 30), p)
    frente = Image.new('L', (W, H), 0); ImageDraw.Draw(frente).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
    ImageDraw.Draw(frente).rectangle((0, 0, W, cy), fill=0)
    b = Image.composite(Image.new('RGB', (W, H), (14, 14, 12)), b, frente)
    return b

# C · cena de cinema saturada, "antes de algo acontecer" (ref. 10-13 Alex Prager): cor de filme, sombras azuladas.
def c_cinema(q):
    im = q['im']; c = im.crop(corte(im, q['cx'], q['top'] + q['hw'] * 2.6, im.height * .88)).resize((W, H), Image.LANCZOS)
    a = np.asarray(ImageEnhance.Color(c).enhance(1.55)).astype(float) / 255
    lum = a.mean(2, keepdims=True)
    a = a + (1 - lum) * np.array([-.06, .02, .10]) * 1.4 + lum * np.array([.08, .03, -.06])
    c = ImageEnhance.Contrast(Image.fromarray((a.clip(0, 1) * 255).astype('uint8'))).enhance(1.15)
    return grao(vinheta(c, .45), 6)

# E4 · silhueta recortada e preenchida (ref. 28 mushroom trip): fundo dividido petróleo/vermelho,
#      a silhueta vira janela para a própria foto em P&B, com uma sombra deslocada em laranja.
def e_silhueta(q):
    im, a = q['im'], q['a']; box = corte(im, q['cx'], q['top'] + q['hw'] * 2.4, im.height * .8)
    c = im.crop(box).resize((W, H), Image.LANCZOS); al = a.crop(box).resize((W, H)).point(lambda v: 255 if v > 120 else 0)
    b = Image.new('RGB', (W, H), C['petroleo']); ImageDraw.Draw(b).rectangle((560, 0, W, H), fill=C['vermelho'])
    b = grao(b, 8)
    sombra = ImageChops.offset(al, 34, 26)
    b = Image.composite(Image.new('RGB', (W, H), C['laranja']), b, sombra)
    pbw = ImageEnhance.Contrast(ImageOps.grayscale(c)).enhance(1.4).convert('RGB')
    b = Image.composite(pbw, b, al)
    return b

# F · silhueta contra a janela (ref. 14 silhueta no ônibus): só a luz da janela, a pessoa vira forma preta.
def f_silhueta_janela(q):
    im, a = q['im'], q['a']; box = corte_frac(im, .6, .36, .6)
    c = ImageOps.grayscale(im.crop(box).resize((W, H), Image.LANCZOS)); al = a.crop(box).resize((W, H))
    c = c.point(lambda v: min(255, int(v * 1.7 + 30)))
    preto = Image.new('L', (W, H), 8)
    c = Image.composite(preto, c, al.filter(ImageFilter.GaussianBlur(2)))
    return grao(c.convert('RGB'), 16)

# F2 · detalhe silencioso: mãos no lugar do rosto, P&B granulado, vazio grande (ref. 7 mãos, 27 sapato na janela).
def f_maos(q, cx, cy, h):
    im = q['im']; c = im.crop(corte(im, cx * im.width, cy * im.height, h * im.height)).resize((W, H), Image.LANCZOS)
    c = ImageEnhance.Contrast(ImageOps.grayscale(c)).enhance(1.35).convert('RGB')
    return grao(c, 18)

# E3 · colagem com fita (ref. 1 "PORTRAIT OF A LADY"): fragmentos do próprio vídeo, papel vermelho e uma fita com a frase.
def e_colagem_fita(qs, fita):
    r = random.Random(5); b = grao(Image.new('RGB', (W, H), (26, 24, 24)), 8)
    def frag(q, fx, fy, fh, tam, pos, rot, pb=True):
        im = q['im']; c = im.crop(corte(im, fx, fy, fh)); c = c.resize((tam[0], int(tam[0] * c.height / c.width)))
        c = c.crop((0, (c.height - tam[1]) // 2, tam[0], (c.height - tam[1]) // 2 + tam[1]))
        if pb: c = ImageEnhance.Contrast(ImageOps.grayscale(c)).enhance(1.3).convert('RGB')
        c = c.convert('RGBA').rotate(rot, expand=True, resample=Image.BICUBIC); b.paste(c, pos, c)
    q1, q2 = qs
    ImageDraw.Draw(b).rectangle((620, 0, 668, H), fill=C['vermelho'])
    frag(q1, q1['cx'], q1['top'] + q1['hw'] * .55, q1['hw'] * 1.6, (620, 330), (60, 160), 2)            # olhos
    rosa = Image.new('RGBA', (520, 420), (196, 58, 74, 255)).rotate(-3, expand=True); b.paste(rosa, (470, 470), rosa)
    frag(q1, q1['cx'], q1['top'] + q1['hw'] * 1.05, q1['hw'] * 1.3, (560, 380), (90, 560), -2, pb=False)  # boca, em cor
    frag(q2, q2['im'].width * .45, q2['im'].height * .66, q2['im'].height * .3, (640, 520), (360, 1000), 3)  # mãos no teclado
    frag(q1, q1['cx'], q1['top'] + q1['hw'] * 2.6, q1['hw'] * 2.4, (420, 560), (50, 1080), -4)            # ombro e camisa
    html = (f'<div class="abs" style="left:120px;top:1560px;padding:16px 28px;background:#E9E2D2;transform:rotate(-3deg);'
            f'box-shadow:0 6px 12px rgba(0,0,0,.4);font:500 40px/1 Inter;letter-spacing:6px;color:{"#%02x%02x%02x" % C["vermelho"]}">{fita}</div>')
    return com_texto(b, html)

# B · retrato direto e dramático (ref. 8 retrato com olhar fixo, 15 e 30 luz de fim de tarde):
#     rosto encarando a lente, fundo afundado em vinho escuro, luz de lado, tons quentes.
def b_retrato(q):
    im, a = q['im'], q['a']; box = corte(im, q['cx'], q['top'] + q['hw'] * 1.25, q['hw'] * 3.4)
    c = im.crop(box).resize((W, H), Image.LANCZOS); al = a.crop(box).resize((W, H)).filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(10))
    rosto = duotone(c, (20, 12, 8), (246, 226, 200), (140, 92, 62)); rosto = Image.blend(rosto, c, .35)
    rosto = ImageEnhance.Contrast(rosto).enhance(1.2)
    fundo_ = Image.new('RGB', (W, H), (40, 22, 24))
    b = Image.composite(rosto, fundo_, al)
    g = np.linspace(1.08, .55, W)[None, :, None]
    b = Image.fromarray((np.asarray(b).astype(float) * g).clip(0, 255).astype('uint8'))
    return grao(vinheta(b, .5), 9)

# B2 · retrato sépia com a mão no rosto (ref. 29): pensamento flagrado, sépia e grão de filme.
def b_sepia_mao(q):
    im = q['im']; c = im.crop(corte_frac(im, .7, .36, .48)).resize((W, H), Image.LANCZOS)
    c = duotone(ImageEnhance.Contrast(c).enhance(1.25), (24, 16, 10), (236, 222, 200), (128, 104, 82))
    return grao(vinheta(c, .7, .55, .4), 12)

# E2 · retrato trançado em tiras (ref. 18-19 Tek Suan Chen): duas fotos do mesmo momento tecidas num xadrez.
def e_trama(qa, qb):
    def alvo(q):
        im = q['im']; c = im.crop(corte_frac(im, .66, .4, .58)).resize((W, H), Image.LANCZOS)
        return ImageEnhance.Contrast(ImageOps.grayscale(c)).enhance(1.25)
    def alvo_cor(q):
        im = q['im']; return ImageEnhance.Contrast(im.crop(corte_frac(im, .66, .4, .58)).resize((W, H), Image.LANCZOS)).enhance(1.15)
    A = duotone(alvo(qa), (22, 20, 18), (232, 226, 214)); B = ImageEnhance.Color(alvo_cor(qb)).enhance(1.3)
    n = 6; t = W // n; m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for i in range(n):
        for j in range(H // t + 1):
            if (i + j) % 2 == 0: d.rectangle((i * t, j * t, i * t + t, j * t + t), fill=255)
    b = Image.composite(A, B, m)
    d = ImageDraw.Draw(b)
    for i in range(1, n): d.line((i * t, 0, i * t, H), fill=(10, 10, 10), width=3)
    for j in range(1, H // t + 1): d.line((0, j * t, W, j * t), fill=(10, 10, 10), width=3)
    sh = np.zeros((H, W));
    for i in range(n):
        for j in range(H // t + 1):
            sh[j * t:j * t + 14, i * t:i * t + t] += .18 if (i + j) % 2 else 0
    b = Image.fromarray((np.asarray(b).astype(float) * (1 - sh[..., None])).clip(0, 255).astype('uint8'))
    return grao(b, 7)

# E1 · contorno vermelho à mão sobre foto P&B (ref. 17 Laura Chen) — o gesto mais simples do acervo.
def e_contorno(q):
    from skimage import measure
    im, a = q['im'], q['a']; box = corte(im, q['cx'], q['top'] + q['hw'] * 2.2, im.height * .85)
    c = ImageEnhance.Contrast(ImageOps.grayscale(im.crop(box).resize((W, H), Image.LANCZOS))).enhance(1.2).convert('RGB')
    ma = np.asarray(a.crop(box).resize((W // 2, H // 2))) / 255.0
    r = random.Random(3); d = ImageDraw.Draw(c)
    for cont in sorted(measure.find_contours(np.pad(ma, 1), .5), key=len, reverse=True)[:1]:
        seg = []; segs = []
        for y, x in (cont - 1)[::max(1, len(cont) // 260)]:
            if x < 3 or y < 3 or x > W // 2 - 4 or y > H // 2 - 4:
                if len(seg) > 3: segs.append(seg)
                seg = []
            else: seg.append((x * 2, y * 2))
        if len(seg) > 3: segs.append(seg)
        for k, (wd, dx) in enumerate([(7, 0), (3, 7)]):
            for s in segs:
                d.line([(x + r.uniform(-5, 5) + dx, y + r.uniform(-5, 5) - dx) for x, y in s], fill=C['vermelho'], width=wd, joint='curve')
    return c

# ================= distribuição: cada técnica uma vez =================
TRABALHOS = [
  ('aquecendo-a-voz-pb', 'ref-a-estudio-placa', lambda: a_estudio_placa(quadro('aq_41'), ('BASTIDOR', 'Nº 01', 'AQUECENDO'))),
  ('aquecendo-a-voz-pb', 'ref-d-escala-buraco', lambda: d_buraco(quadro('aq_44'))),
  ('cantando-sem-audio-pb', 'ref-c-cinema', lambda: c_cinema(quadro('ca_8'))),
  ('cantando-sem-audio-pb', 'ref-e-silhueta-recortada', lambda: e_silhueta(quadro('ca_5'))),
  ('aqui-e-bastidor', 'ref-f-silhueta-janela', lambda: f_silhueta_janela(quadro('bs_96'))),
  ('nao-conhecia-anafora', 'ref-f-detalhe-maos', lambda: f_maos(quadro('ue_32'), .42, .55, .62)),
  ('nao-conhecia-anafora', 'ref-e-colagem-fita', lambda: e_colagem_fita((quadro('aq_38'), quadro('ue_32')), 'TINHA NOME?')),
  ('desejo-mesquinho', 'ref-b-sepia-mao', lambda: b_sepia_mao(quadro('de_38'))),
  ('desejo-mesquinho', 'ref-e-trama', lambda: e_trama(quadro('de_43'), quadro('de_41'))),
  ('botao-da-foto-pb', 'ref-e-contorno', lambda: e_contorno(quadro('bf_6.8'))),
  ('montagem-bastidores-inveja', 'ref-b-retrato-direto', lambda: b_retrato(quadro('bf_10.8'))),
]

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    so = set(sys.argv[3].split(',')) if len(sys.argv) > 3 else None
    for peca, nome, fn in TRABALHOS:
        if so and nome not in so: continue
        fn().save(f'{out}/{peca}__capa-luiz-{nome}.png'); print('ok', peca, nome, flush=True)
