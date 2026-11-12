"""Thumb de Inveja — v5 (08/11/2026, estudo "Por que alguém clica": título novo "Por que a conquista de um amigo dói mais que a de um milionário?"; texto "É INVEJA." completa o título; primo mais desfocado para 1 foco só). Base: v3/v4.
Thumb de Inveja — v3 (orientação do vidIQ: recorte mais fechado no assunto, fundo mais limpo).
Recompõe a v2 (code/remotion-redes-sociais/src/inveja-thumb/index.tsx, ThumbV2) em Python/PIL,
com as mesmas camadas, cores e texto. Saída em 3840x2160 (escala 2 da composição 1920x1080).
Uso: python3 compor.py <pasta-camadas> <pasta-saida> <variante: v2|foco|limpa>
"""
import sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont

S = 2                      # escala (1920 -> 3840)
W, H = 1920 * S, 1080 * S
OSSO, TERRA, TINTA = (243, 233, 213), (196, 109, 69), (21, 22, 26)

src, out, var = sys.argv[1], sys.argv[2], sys.argv[3]
U = src
BG_PATH = f'{U}/canais/palavras/episodios/ep01-inveja/videos/imagens/S15-16-17-18/CAMPEONADO_NA_CABECA.png'
BIN_PATH = f'{U}/canais/palavras/episodios/ep01-inveja/thumb/_trabalho/A1-recorte.png'
REFL = {'prato': f'{U}/canais/palavras/episodios/ep01-inveja/thumb/_trabalho/refl-prato.png',
        'chave': f'{U}/canais/palavras/episodios/ep01-inveja/thumb/_trabalho/refl-chave.png'}
FONT, ICON = 'Bebas.ttf', 'icone.png'

# parâmetros por variante (coordenadas na escala 1920)
P = {
    'v2':    dict(bg='primo', blur=9,  bright=1.12, sat=0.95, K=0.72, OX=-60, OY=30),
    'foco':  dict(bg='primo', blur=14, bright=0.70, sat=0.30, K=0.88, OX=-90, OY=-55),
    'limpa': dict(bg='liso',  blur=0,  bright=1.0,  sat=1.0,  K=0.88, OX=-90, OY=-55),
    # v4 (01/11/2026): v2-fio + o que a IA do vidIQ mudou (texto maior, mais cor e contraste, binóculo um pouco maior)
    'v4':    dict(bg='primo', blur=5,  bright=1.08, sat=0.95, K=0.76, OX=-40, OY=5),
    'v5':    dict(bg='primo', blur=12, bright=0.92, sat=0.80, K=0.76, OX=-40, OY=5),
}[var]
TXT = dict(v4=dict(f1=194, f2=270, x=62, b1=712, box=(760, 992), b2=962), v5=dict(f1=230, f2=232, x=54, b1=600, box=(668, 912), b2=882)).get(var,
      dict(f1=176, f2=200, x=84, b1=726, box=(778, 942), b2=922))


def css_contrast(im, c):
    a = np.asarray(im).astype(np.float32)
    rgb = (a[..., :3] / 255 - 0.5) * c + 0.5
    a[..., :3] = np.clip(rgb, 0, 1) * 255
    return Image.fromarray(a.astype(np.uint8), im.mode)


def fundo():
    canvas = Image.new('RGB', (W, H), (32, 24, 15))
    if P['bg'] == 'primo':
        k, ox, oy = 0.75, -100, -40
        bg = Image.open(BG_PATH).convert('RGB').transpose(Image.FLIP_LEFT_RIGHT)
        bg = bg.resize((round(2752 * k * S), round(1536 * k * S)), Image.LANCZOS)
        if P['blur']:
            bg = bg.filter(ImageFilter.GaussianBlur(P['blur'] * S))   # CSS blur(px) = sigma
        bg = ImageEnhance.Brightness(bg).enhance(P['bright'])
        bg = ImageEnhance.Color(bg).enhance(P['sat'])
        bg = css_contrast(bg, 0.98)
        canvas.paste(bg, (ox * S, oy * S))
        # aquecimento leve
        warm = Image.new('RGB', (W, H), (255, 214, 160))
        canvas = Image.blend(canvas, warm, 0.04)
    else:
        # fundo liso escuro e quente, com um halo terroso atrás das lentes
        y, x = np.mgrid[0:H, 0:W].astype(np.float32)
        base = np.array([22, 17, 13], np.float32)
        cx, cy = 1320 * S, 520 * S
        d = np.sqrt(((x - cx) / (900 * S)) ** 2 + ((y - cy) / (620 * S)) ** 2)
        glow = np.clip(1 - d, 0, 1)[..., None] ** 1.6
        arr = base + glow * (np.array([86, 52, 34], np.float32))
        canvas = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB')
    return canvas


def grad_overlays(canvas):
    a = np.asarray(canvas).astype(np.float32)
    h, w = a.shape[:2]
    yy = np.linspace(1, 0, h)[:, None]           # 0deg: de baixo (1) para cima (0)
    # base escura embaixo (0%: .82, 26%: .45, 46%: 0)
    t = 1 - yy  # 0 embaixo
    t = np.linspace(0, 1, h)[::-1][:, None]      # 0 no fundo da imagem
    alpha = np.interp(t, [0, 0.26, 0.46, 1], [0.82, 0.45, 0, 0])
    a = a * (1 - alpha[..., None]) + np.array([12, 9, 7]) * alpha[..., None]
    xx = np.linspace(0, 1, w)[None, :]
    alpha2 = np.interp(xx, [0, 0.40, 1], [0.25, 0, 0])
    a = a * (1 - alpha2[..., None]) + np.array([12, 9, 7]) * alpha2[..., None]
    if var == 'foco':
        # vinheta para empurrar o olhar para o binóculo
        y, x = np.mgrid[0:h, 0:w].astype(np.float32)
        d = np.sqrt(((x - 0.62 * w) / (0.62 * w)) ** 2 + ((y - 0.48 * h) / (0.62 * h)) ** 2)
        v = np.clip((d - 0.55) / 0.6, 0, 1)[..., None] * 0.55
        a = a * (1 - v)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGB')


def binoculo(canvas):
    K, OX, OY = P['K'], P['OX'], P['OY']
    b = Image.open(BIN_PATH).convert('RGBA').resize((round(2752 * K * S), round(1536 * K * S)), Image.LANCZOS)
    b = css_contrast(b, 1.1)
    rgb = ImageEnhance.Brightness(b.convert('RGB')).enhance(1.04)
    if var != 'v2':
        rgb = rgb.filter(ImageFilter.UnsharpMask(radius=2 * S, percent=60, threshold=2))   # nitidez ("sharp and crisp")
    b = Image.merge('RGBA', (*rgb.split(), b.split()[3]))
    # sombra (drop-shadow 0 30 60 rgba(0,0,0,.45))
    sh = Image.new('RGBA', b.size, (0, 0, 0, 0))
    sh.putalpha(b.split()[3].point(lambda v: int(v * 0.45)))
    sh = sh.filter(ImageFilter.GaussianBlur(30 * S))
    canvas = canvas.convert('RGBA')
    canvas.alpha_composite(sh, (OX * S, OY * S + 30 * S)) if OX >= 0 and OY >= 0 else _paste(canvas, sh, OX * S, OY * S + 30 * S)
    _paste(canvas, b, OX * S, OY * S)
    # lentes
    for (lx, ly, rx, ry, key, rot) in [(1265, 690, 108, 168, 'prato', -4), (1942, 725, 128, 188, 'chave', 3)]:
        cx, cy = (lx * K + OX) * S, (ly * K + OY) * S
        lente(canvas, cx, cy, rx * K * S, ry * K * S, REFL[key], rot)
    return canvas


def _paste(canvas, layer, x, y):
    # alpha_composite com deslocamento negativo
    x0, y0 = max(0, -x), max(0, -y)
    crop = layer.crop((x0, y0, min(layer.width, canvas.width - x), min(layer.height, canvas.height - y)))
    canvas.alpha_composite(crop, (max(0, x), max(0, y)))


def lente(canvas, cx, cy, rx, ry, refl, rot):
    w, h = round(rx * 2), round(ry * 2)
    tile = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    r = Image.open(refl).convert('RGBA')
    tw, th = round(w * 1.16), round(h * 1.08)
    sc = max(tw / r.width, th / r.height)                   # object-fit: cover
    r = r.resize((math.ceil(r.width * sc), math.ceil(r.height * sc)), Image.LANCZOS)
    r = r.crop(((r.width - tw) // 2, (r.height - th) // 2, (r.width - tw) // 2 + tw, (r.height - th) // 2 + th))
    rgb = ImageEnhance.Color(r.convert('RGB')).enhance(1.05)
    r = Image.merge('RGBA', (*css_contrast(rgb, 1.08).split(), r.split()[3].point(lambda v: int(v * 0.82))))
    tile.alpha_composite(r, (round(-w * 0.08), round(-h * 0.04))) if False else _paste(tile, r, round(-w * 0.08), round(-h * 0.04))
    a = np.asarray(tile).astype(np.float32)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / math.sqrt(2) * 1.0
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)   # 1 na borda da elipse
    al = np.interp(d, [0, 0.45, 0.78, 1.0, 9], [0, 0, 0.55, 0.92, 0.92])
    col = np.where(d[..., None] < 0.9, np.array([4, 8, 14]), np.array([0, 0, 0]))
    rgb = a[..., :3] * (1 - al[..., None]) + col * al[..., None]
    rgb = 255 - (255 - rgb) * (1 - 0.10 * np.array([40, 70, 95]) / 255)      # screen leve e frio
    # brilho superior
    hx, hy, hw, hh = 0.14 * w + 0.23 * w, 0.08 * h + 0.15 * h, 0.23 * w, 0.15 * h
    hd = np.sqrt(((x - hx) / hw) ** 2 + ((y - hy) / hh) ** 2)
    rgb = rgb + (255 - rgb) * (np.clip(1 - hd / 0.7, 0, 1) * 0.38)[..., None]
    a[..., :3] = np.clip(rgb, 0, 255)
    a[..., 3] = 255
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, w - 1, h - 1), fill=255)
    tile = Image.fromarray(a.astype(np.uint8), 'RGBA')
    tile.putalpha(mask)
    tile = tile.rotate(-rot, resample=Image.BICUBIC, expand=True)
    canvas.alpha_composite(tile, (round(cx - tile.width / 2), round(cy - tile.height / 2)))


L1, L2 = ('', 'É INVEJA.') if var == 'v5' else ('TÁ OLHANDO', 'O QUÊ?')

def texto(canvas):
    f1 = ImageFont.truetype(FONT, TXT['f1'] * S)
    f2 = ImageFont.truetype(FONT, TXT['f2'] * S)
    X = TXT['x']

    def spaced(draw, xy, txt, font, fill):
        x, y = xy
        for ch in txt:
            draw.text((x, y), ch, font=font, fill=fill, anchor='ls')
            x += draw.textlength(ch, font=font) + 2 * S

    # sombra da linha 1
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    spaced(ImageDraw.Draw(sh), (X * S, TXT['b1'] * S + 6 * S), L1, f1, (0, 0, 0, 180))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(15 * S)))
    d = ImageDraw.Draw(canvas)
    spaced(d, (X * S, TXT['b1'] * S), L1, f1, OSSO)
    # faixa terracota girada (-1.6deg) atrás de "O QUÊ?"
    tw = sum(d.textlength(c, font=f2) + 2 * S for c in L2)
    bx0, by0, bx1, by1 = (X - 22) * S, TXT['box'][0] * S, X * S + tw + 26 * S, TXT['box'][1] * S
    band = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    bd.rectangle((bx0, by0, bx1, by1), fill=TERRA + (255,))
    band = band.rotate(1.6, center=((bx0 + bx1) / 2, (by0 + by1) / 2), resample=Image.BICUBIC)
    shb = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    shb.putalpha(band.split()[3].point(lambda v: int(v * 0.45)))
    canvas.alpha_composite(shb.filter(ImageFilter.GaussianBlur(15 * S)).transform(canvas.size, Image.AFFINE, (1, 0, 0, 0, 1, -10 * S)))
    canvas.alpha_composite(band)
    spaced(ImageDraw.Draw(canvas), ((X + 4) * S, TXT['b2'] * S), L2, f2, TINTA)


def icone(canvas):
    ic = Image.open(ICON).convert('RGBA').resize((78 * S, 78 * S), Image.LANCZOS)
    ic.putalpha(ic.split()[3].point(lambda v: int(v * 0.95)))
    sh = Image.new('RGBA', ic.size, (0, 0, 0, 0)); sh.putalpha(ic.split()[3].point(lambda v: int(v * 0.5)))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(4 * S)), (72 * S, 62 * S))
    canvas.alpha_composite(ic, (72 * S, 60 * S))


def fio(canvas):
    # fio terracota pontilhado: o olhar do primo até a lente (como na v2-fio)
    K, OX, OY = P['K'], P['OX'], P['OY']
    ex, ey = 1265 * K + OX, (690 - 168) * K + OY - 14
    p0, p1, p2, p3 = (735, 300), (800, 285), (ex - 7, ey - 72), (ex, ey)
    pts = []
    for i in range(400):
        t = i / 399
        x = (1-t)**3*p0[0] + 3*(1-t)**2*t*p1[0] + 3*(1-t)*t**2*p2[0] + t**3*p3[0]
        y = (1-t)**3*p0[1] + 3*(1-t)**2*t*p1[1] + 3*(1-t)*t**2*p2[1] + t**3*p3[1]
        pts.append((x, y))
    d = ImageDraw.Draw(canvas); acc, last = 0, pts[0]
    for q in pts[1:]:
        acc += math.dist(q, last); last = q
        if acc >= 18:
            acc = 0; r = 3.5 * S
            d.ellipse((q[0]*S - r, q[1]*S - r, q[0]*S + r, q[1]*S + r), fill=TERRA)
    d.line([((ex-15)*S, (ey-20)*S), (ex*S, (ey+6)*S), ((ex+15)*S, (ey-21)*S)], fill=TERRA, width=7*S, joint='curve')


def gradacao(canvas, sat=1.18, con=1.10):
    rgb = canvas.convert('RGB')
    rgb = ImageEnhance.Color(rgb).enhance(sat)
    rgb = css_contrast(rgb, con)
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.5 * S, percent=40, threshold=2))
    return rgb.convert('RGBA')


img = fundo()
img = grad_overlays(img)
img = binoculo(img)
if var in ('v4', 'v5'):
    img = gradacao(img)
    fio(img)
texto(img)
icone(img)
img = img.convert('RGB')
nome = {'v2': 'controle-v2', 'foco': 'v3-foco', 'limpa': 'v3-limpa', 'v4': 'v4', 'v5': 'v5'}[var]
img.save(f'{out}/inveja-thumb-youtube-{nome}-3840x2160.jpg', quality=90, optimize=True)
img.resize((1920, 1080), Image.LANCZOS).save(f'{out}/inveja-thumb-youtube-{nome}-1920x1080.jpg', quality=90, optimize=True)
img.resize((1280, 720), Image.LANCZOS).save(f'{out}/inveja-thumb-youtube-{nome}-1280x720.jpg', quality=90, optimize=True)
print('ok', nome)
