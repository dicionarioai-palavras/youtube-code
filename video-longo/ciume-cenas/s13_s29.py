# Ciúme · S13–S29 (4:16,68 → 14:21,42 da narração final). Vídeo MUDO, 1920x1080, 30 fps.
# Uso: python3 s13_s29.py <pasta-midias> <pasta-fontes> <saida.mp4> <t_ini> <t_fim>      (render de um trecho)
#      python3 s13_s29.py <pasta-midias> <pasta-fontes> <saida.png> quadros t1,t2,...      (quadros soltos para aprovação)
# Regras: texto sempre sobre a imagem desfocada (foco/desfoco); vídeo sem áudio; aparições de Luiz só com luz quente.
import sys, os, math, random, subprocess
from functools import lru_cache
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

M, FON, SAIDA = sys.argv[1], sys.argv[2], sys.argv[3]
W, H, FPS = 1920, 1080, 30
CREME = (251, 233, 194); TERRA = (196, 109, 69); NOITE = (21, 23, 28); GRAF = (26, 27, 32); VERM = (205, 55, 45)
def cl(x): return max(0.0, min(1.0, x))
def sm(x): x = cl(x); return x * x * x * (x * (6 * x - 15) + 10)
def lerp(a, b, k): return a + (b - a) * k
def f32(im): return np.asarray(im, dtype=np.float32)
def pil(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
@lru_cache(None)
def fonte(nome, tam): return ImageFont.truetype(os.path.join(FON, nome), tam)
BEB = lambda s: fonte('BebasNeue.ttf', s); INT = lambda s: fonte('Inter-500.ttf', s); INT4 = lambda s: fonte('Inter-400.ttf', s)
ITA = lambda s: fonte('CormorantGaramond-500-italic.ttf', s); PLA = lambda s: fonte('PlayfairDisplay-700.ttf', s); COU = lambda s: fonte('CourierPrime-Bold.ttf', s)

@lru_cache(None)
def foto(n):
    im = Image.open(os.path.join(M, n)).convert('RGB')
    if im.width > 3072: im.thumbnail((3072, 3072))
    return im
CACHE = os.environ.get('VCACHE', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vcache'))
@lru_cache(None)
def video(n):                                   # quadros 1280x720 em disco (memmap), para não estourar a RAM
    os.makedirs(CACHE, exist_ok=True); arq = os.path.join(CACHE, n + '.rgb')
    if not os.path.exists(arq):
        tmp = arq + f'.{os.getpid()}.tmp'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(M, n), '-vf', 'scale=1280:720', '-f', 'rawvideo', '-pix_fmt', 'rgb24', tmp], check=True)
        os.replace(tmp, arq)
    return np.memmap(arq, np.uint8, 'r').reshape(-1, 720, 1280, 3)
@lru_cache(None)
def fps_de(n):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', os.path.join(M, n)], capture_output=True, text=True).stdout.strip()
    a, b = r.split('/'); return float(a) / float(b)
def qv(n, s, pingpong=False):
    v = video(n); dur = len(v) / fps_de(n)
    if pingpong:
        s = s % (2 * dur); s = s if s < dur else 2 * dur - s
    i = int(round(cl(s / dur) * (len(v) - 1)))
    return Image.fromarray(v[i])

def enquadra(img, z, fx, fy):
    iw, ih = img.size
    fw = iw / z; fh = fw * H / W
    if fh > ih: fh = ih / z; fw = fh * W / H
    cx = min(max(fx * iw, fw / 2), iw - fw / 2); cy = min(max(fy * ih, fh / 2), ih - fh / 2)
    return img.transform((W, H), Image.EXTENT, (cx - fw / 2, cy - fh / 2, cx + fw / 2, cy + fh / 2), Image.BICUBIC)
def kb(img, t, a, b, z0, z1, c0, c1):
    k = sm((t - a) / max(0.01, b - a))
    return f32(enquadra(img, lerp(z0, z1, k), lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k)))
def kbv(n, s, t, a, b, z0, z1, c0=(.5, .5), c1=(.5, .5), pingpong=False):
    return kb(qv(n, s, pingpong), t, a, b, z0, z1, c0, c1)
def desfoca(a, r):
    if r < 0.4: return a
    p = pil(a).resize((W // 2, H // 2), Image.BILINEAR).filter(ImageFilter.GaussianBlur(r / 2))
    return f32(p.resize((W, H), Image.BICUBIC))
def foco(a, t, entra=None, sai=None, r=30, esc=.45):
    k = 1.0
    if entra: k = min(k, sm((t - entra[0]) / (entra[1] - entra[0])))
    if sai: k = min(k, 1 - sm((t - sai[0]) / (sai[1] - sai[0])))
    return desfoca(a, r * k) * (1 - esc * k), k

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIN = np.clip(1.18 - 0.6 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2), 0.5, 1.0)[..., None]
rng = np.random.default_rng(11); GRAO = [rng.normal(0, 5.0, (H, W, 1)).astype(np.float32) for _ in range(6)]
def listras(t, periodo=120, vel=6.0, ang=0.18, fase=0.0):
    return (0.5 + 0.5 * np.sin(2 * np.pi * (yy + ang * xx + vel * t + fase) / periodo))[..., None]

def sombra_txt(im, fn, blur=16, forca=.6):
    L = Image.new('RGBA', (W, H)); fn(ImageDraw.Draw(L), L)
    sh = L.split()[3].filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * forca))
    b = pil(im).convert('RGBA'); b.paste((0, 0, 0, 255), (0, 6), sh)
    return f32(Image.alpha_composite(b, L).convert('RGB'))
def txt_c(d, x, y, s, f, cor, a, anc='mm'):
    if a > 0: d.text((x, y), s, font=f, fill=tuple(cor) + (int(255 * cl(a)),), anchor=anc)
def entra(t, ta, d=.45): return sm((t - ta) / d)
def rotulo(im, t, ta, tb, txt):
    a = sm((t - ta) / .5) * (1 - sm((t - (tb - .4)) / .4))
    if a <= 0: return im
    def f(d, L):
        d.text((118, 880), txt, font=BEB(66), fill=CREME + (int(240 * a),))
        d.line([(120, 958), (120 + 300 * sm((t - ta - .1) / .8), 958)], fill=TERRA + (int(255 * a),), width=5)
    return sombra_txt(im, f)
def fonte_rodape(im, t, ta, tb, txt):
    a = sm((t - ta) / .6) * (1 - sm((t - (tb - .3)) / .3))
    if a <= 0: return im
    return sombra_txt(im, lambda d, L: d.text((W - 80, H - 60), txt, font=INT4(26), fill=(225, 215, 195, int(220 * a)), anchor='rs'), 10, .6)

random.seed(9)
FAG = [dict(x=random.uniform(0, W), y=random.uniform(0, H), r=random.uniform(1.0, 3.2), vx=random.uniform(-10, 10),
            vy=random.uniform(-60, -15), f=random.uniform(0, 6.3), a=random.uniform(.3, .9)) for _ in range(110)]
def poeira(t, cor=(255, 215, 160), forca=.35):
    L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L)
    for p in FAG:
        x = (p['x'] + p['vx'] * t + 10 * math.sin(t * .8 + p['f'])) % W; y = (p['y'] + p['vy'] * .25 * t) % H
        a = p['a'] * (.55 + .45 * math.sin(t * 2.1 + p['f']))
        d.ellipse([x - p['r'], y - p['r'], x + p['r'], y + p['r']], fill=int(255 * a))
    return f32(L.filter(ImageFilter.GaussianBlur(1.2)))[..., None] / 255.0 * np.array(cor, np.float32) * forca

# ---------- logo oficial do Palavras (SVG de identidade-visual/…/logos-producao) ----------
@lru_cache(None)
def logo_png(cor, larg):
    im = Image.open(os.path.join(M, f'logo-{cor}.png')).convert('RGBA'); im = im.crop(im.getbbox())
    return im.resize((larg, int(im.height * larg / im.width)), Image.LANCZOS)
def poe_logo(im, cx, cy, larg, a, cor='osso'):
    if a <= 0: return im
    lg = logo_png(cor, int(larg)); al = lg.split()[3].point(lambda v: int(v * cl(a)))
    b = pil(im).convert('RGBA'); x, y = int(cx - lg.width / 2), int(cy - lg.height / 2)
    sh = al.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * .55)); b.paste((0, 0, 0, 255), (x, y + 6), sh)
    lg.putalpha(al); b.alpha_composite(lg, (x, y))
    return f32(b.convert('RGB'))

# ---------- Luiz (brutos com luz quente, sem sincronia) ----------
def luiz(n, t, ta, vel=1.0, z0=1.10, z1=1.22, c=(.5, .40), pingpong=False, faixa=True):
    s = (t - ta) * vel
    im = kbv(n + '.mp4', s, t, ta, ta + 6, z0, z1, c, c, pingpong)
    im = im * np.array([1.06, 1.0, 0.92], np.float32)                    # grade quente
    if faixa:                                                           # listras de persiana no rosto
        im = im * (0.80 + 0.32 * listras(t, 150, 4.0, 0.12))
    return im

# ---------- mapa (MAPA01) ----------
random.seed(21)
RUAS = []
for i in range(-40, 41):
    for horiz in (True, False):
        o = i * 140 + random.uniform(-25, 25)
        pts = [((j * 380, o + random.uniform(-38, 38)) if horiz else (o + random.uniform(-38, 38), j * 380)) for j in range(-16, 17)]
        RUAS.append(pts)
AVS = []
for _ in range(7):
    a = random.uniform(0, math.pi); c = (random.uniform(-2500, 2500), random.uniform(-2500, 2500))
    AVS.append([(c[0] + k * 700 * math.cos(a), c[1] + k * 700 * math.sin(a)) for k in range(-11, 12)])
@lru_cache(maxsize=8)
def mapa_base(zq):
    z = zq / 100; sc = 2; w, h = W * sc, H * sc
    im = Image.new('RGB', (w, h), (19, 21, 26)); d = ImageDraw.Draw(im)
    P = lambda p: ((p[0] - 34) * z * sc + w / 2, (p[1] + 20) * z * sc + h / 2)
    for r in RUAS: d.line([P(p) for p in r], fill=(46, 50, 60), width=max(1, int(10 * z * sc)))
    for a in AVS: d.line([P(p) for p in a], fill=(84, 72, 62), width=max(2, int(26 * z * sc)))
    return f32(im.resize((W, H), Image.LANCZOS))
def mapa(t, z=0.9, aneis=None, cadeado=0.0):
    rua = desfoca(kb(foto('S17-3-rua.jpg'), t, 0, 1, 1.15, 1.15, (.5, .5), (.5, .5)), 18) * .62
    im = rua * .62 + mapa_base(int(z * 100)) * .9
    L = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(L); px, py = W / 2, H / 2
    for k in (aneis or []):
        r = 30 + 260 * k; d.ellipse([px - r, py - r * .5, px + r, py + r * .5], outline=TERRA + (int(220 * (1 - k)),), width=4)
    topo = py - 110
    d.ellipse([px - 26, py - 10, px + 26, py + 10], fill=(0, 0, 0, 120))
    d.ellipse([px - 46, topo - 46, px + 46, topo + 46], fill=TERRA + (255,))
    d.polygon([(px - 40, topo + 22), (px + 40, topo + 22), (px, py)], fill=TERRA + (255,))
    d.ellipse([px - 17, topo - 17, px + 17, topo + 17], fill=CREME + (255,))
    if cadeado > 0:                                   # cadeado de brincadeira sobre o alfinete
        a = int(255 * cadeado); cy = topo - 10 + 30 * (1 - cadeado)
        d.rounded_rectangle([px - 34, cy - 4, px + 34, cy + 50], 8, fill=(240, 200, 90, a))
        d.arc([px - 24, cy - 40, px + 24, cy + 8], 180, 360, fill=(240, 200, 90, a), width=9)
        d.ellipse([px - 7, cy + 14, px + 7, cy + 28], fill=(60, 50, 40, a))
    return f32(Image.alpha_composite(pil(im).convert('RGBA'), L).convert('RGB'))
def aneis_t(t, t0, per=1.4): return [((t - t0) / per + i / 3) % 1 for i in range(3)] if t >= t0 else None

# ---------- bolhas de conversa ----------
def bolhas(im, t, itens, cx=W / 2, larg=1040, fs=50, saida=None):
    # itens: (lado 'eu'|'ele'|'mae', texto, t_entra, cor)
    vis = [it for it in itens if t >= it[2] - .05]
    if not vis: return im
    f = INT(fs); hb = fs + 64; gap = 22
    tot = len(vis) * (hb + gap) - gap; y0 = H / 2 - tot / 2
    sa = sm((t - saida) / .35) if saida else 0
    def d_(d, L):
        y = y0 - 120 * sa
        for lado, txt, ta, cor in vis:
            e = sm((t - ta) / .38) * (1 - sa)
            bw = f.getlength(txt) + 88
            x = cx + larg / 2 - bw if lado == 'eu' else cx - larg / 2
            yy_ = y + 24 * (1 - e)
            d.rounded_rectangle([x, yy_, x + bw, yy_ + hb], hb / 2.4, fill=tuple(cor) + (int(240 * e),))
            tc = GRAF if sum(cor) > 500 else CREME
            d.text((x + 44, yy_ + hb / 2), txt, font=f, fill=tc + (int(255 * e),), anchor='lm')
            y += hb + gap
    return sombra_txt(im, d_)

# ================= CENAS =================
# S13
def s13_dic(t):
    base = kb(foto('S13-1-dicionarios.jpg'), t, 256.68, 265.2, 1.04, 1.12, (.5, .5), (.5, .48))
    # pingue-pongue: um jura (esq), o outro jura (dir), palavra no meio
    if t >= 265.2:
        k1 = sm((t - 265.2) / .35); k2 = sm((t - 267.3) / .35); k3 = sm((t - 269.8) / .6)
        fx = lerp(lerp(.5, .27, k1), .73, k2); fx = lerp(fx, .5, k3)
        z = 1.12 + .45 * k1 * (1 - k3) + .25 * k3
        base = f32(enquadra(foto('S13-1-dicionarios.jpg'), z, fx, lerp(.5, .45, k3)))
    im, kf = foco(base, t, (258.4, 258.9), (264.6, 265.1), r=26, esc=.5)
    def d_(d, L):
        a = entra(t, 258.6) * kf; b = entra(t, 261.5) * kf
        txt_c(d, W * .27, H * .42, 'zelo = inveja', ITA(84), CREME, a); txt_c(d, W * .27, H * .42 + 80, 'um dicionário', INT4(30), (220, 205, 180), a)
        txt_c(d, W * .73, H * .42, 'ciúme amoroso, desejo', ITA(76), CREME, b); txt_c(d, W * .73, H * .42 + 80, 'Houaiss', INT4(30), (220, 205, 180), b)
    return sombra_txt(im, d_)
def s13_natal(t):
    if t < 279.2:
        return kbv('S13-2-natal.mp4', (t - 272.4) * .72, t, 272.4, 279.2, 1.03, 1.10, (.5, .45), (.5, .40))
    base = kbv('S13-2-natal.mp4', 4.9, t, 272.4, 281.0, 1.03, 1.12, (.5, .45), (.5, .40))
    im, kf = foco(base, t, (279.2, 279.7))
    def d_(d, L):
        a = entra(t, 279.2) * kf
        txt_c(d, W / 2, H / 2 - 30, 'zēlus', ITA(190), TERRA, a); txt_c(d, W / 2, H / 2 + 100, 'cabia tudo isso', INT4(38), CREME, entra(t, 279.6) * kf)
    return sombra_txt(im, d_, 22, .7)
# S14
def s14_porta(t): return kbv('S12-2-flores.mp4', .6 + (t - 280.96), t, 280.96, 284.1, 1.03, 1.08)
def s14_coluna(t):
    im = kb(foto('S14-1-coluna.jpg'), t, 284.1, 287.6, 1.05, 1.25, (.5, .65), (.5, .40))
    pos = lerp(H * 1.1, -H * .1, sm((t - 285.9) / 1.6))                # a luz sobe pela coluna
    banda = np.exp(-((yy - pos) / 90) ** 2)[..., None] * np.exp(-((xx - W * .5) / 380) ** 2)[..., None]
    return im + (np.array([255, 200, 140], np.float32) - im) * banda * .45
def s14_barriga(t):
    im = kb(foto('S14-2-barriga.jpg'), t, 287.5, 290.4, 1.05, 1.22, (.52, .5), (.55, .5))
    k = sm((t - 287.6) / 1.8); r = 150 + 1300 * k
    g = np.clip(1 - np.sqrt((xx - W * .55) ** 2 + (yy - H * .5) ** 2) / r, 0, 1)[..., None]
    fria = im.mean(2, keepdims=True) * np.array([.75, .9, 1.25], np.float32)
    return im * (1 - g * .7) + fria * g * .7
def s14_congela(t):
    if t < 292.8: s = 2.2 + (t - 290.3)
    else: s = 4.7
    return kbv('S14-3-congela.mp4', s, t, 290.3, 295.7, 1.03, 1.25, (.5, .5), (.5, .42))
def s14_paz(t):
    base = kb(foto('S14-4-casal-paz.jpg'), t, 295.7, 305.0, 1.04, 1.16, (.5, .5), (.55, .45))
    im, kf = foco(base, t, (300.4, 300.9), r=24, esc=.45)
    def d_(d, L):
        a = entra(t, 300.6) * kf
        if a <= 0: return
        x0, x1, y0 = W * .2, W * .8, H * .5 - 30; tot = x1 - x0
        k9 = sm((t - 301.0) / .9); k1 = sm((t - 303.4) / .6)
        d.rounded_rectangle([x0, y0, x1, y0 + 60], 30, outline=CREME + (int(160 * a),), width=3)
        d.rounded_rectangle([x0 + 6, y0 + 6, x0 + 6 + (tot * .9 - 12) * k9, y0 + 54], 24, fill=CREME + (int(235 * a),))
        if k1 > 0: d.rounded_rectangle([x0 + tot * .9, y0 + 6, x0 + tot * .9 + (tot * .1 - 6) * k1, y0 + 54], 24, fill=TERRA + (int(250 * a),))
        txt_c(d, x0 + tot * .45, y0 - 70, '90% ZELO', BEB(90), CREME, a * k9)
        txt_c(d, x0 + tot * .95, y0 + 140, '10% CIÚME', BEB(70), TERRA, a * k1)
    return sombra_txt(im, d_)
# S15 · o som da palavra, sobre Luiz desfocado (L23)
def s15(t):
    base = luiz('L23', t, 305.0, vel=.35, z0=1.15, z1=1.3, pingpong=True)
    im, kf = foco(base, t, (305.9, 306.5), (324.7, 325.5), r=30, esc=.5)
    def d_(d, L):
        # CI-Ú-ME, o Ú se fecha (308,5–313,8)
        sai1 = 1 - entra(t, 313.9, .4)
        sil = [('CI', 306.3), ('Ú', 306.9), ('ME', 307.5)]; f = BEB(260)
        aperta = sm((t - 308.7) / 2.0) * (1 - sm((t - 312.8) / 1.0) * .3)
        xs = [W / 2 - 330, W / 2, W / 2 + 330]
        for (s, ta), x in zip(sil, xs):
            a = entra(t, ta, .3) * sai1
            if s == 'Ú':
                fs = int(260 * (1 - .45 * aperta)); cor = TERRA if aperta > .1 else CREME
                txt_c(d, x, H / 2 - 40, s, BEB(max(40, fs)), cor, a)
                if aperta > .05:
                    w_ = 120 * (1 - .4 * aperta)
                    d.rectangle([x - w_, H / 2 - 40 - 150 * (1 - .4 * aperta), x + w_, H / 2 - 40 + 150 * (1 - .4 * aperta)], outline=TERRA + (int(220 * a * aperta),), width=6)
            else:
                txt_c(d, x + (60 * aperta if s == 'CI' else -60 * aperta), H / 2 - 40, s, f, CREME, a)
        # ZELO se abre (314,3–317,5)
        az = entra(t, 314.9, .4) * (1 - entra(t, 317.6, .35)); ab = sm((t - 315.4) / 1.6)
        for i, c in enumerate('ZELO'):
            txt_c(d, W / 2 + (i - 1.5) * (150 + 120 * ab), H / 2 - 40, c, BEB(250), CREME, az)
        # ciúmes leve (317,8–322)
        al = entra(t, 318.5, .5) * (1 - entra(t, 321.9, .4))
        txt_c(d, W / 2, H / 2 - 60 * sm((t - 318.5) / 3.0), 'ciúmes', ITA(150), CREME, al)
        txt_c(d, W / 2, H / 2 + 120, 'quase uma brincadeira', INT4(36), (220, 205, 180), al * entra(t, 320.3))
        # o meu ciúme pesa (322,3–325,48)
        ap = entra(t, 323.0, .2)
        if ap > 0:
            cai = sm((t - 323.0) / .35); bounce = 22 * math.sin(min(1, (t - 323.35) / .4) * math.pi) * (t > 323.35)
            txt_c(d, W / 2, lerp(-100, H / 2 - 20, cai) - bounce, 'O MEU CIÚME', BEB(220), TERRA, ap)
            txt_c(d, W / 2, H / 2 + 130, 'a palavra pesa', INT4(38), CREME, entra(t, 324.2))
    return sombra_txt(im, d_, 22, .7)
# S16
def s16_menina(t): return kbv('S9-4-menina-vassoura.mp4', 2.0 + (t - 325.84) * .6, t, 325.84, 329.6, 1.05, 1.18, (.5, .4), (.5, .35)) * 1.04 + 8
def s16_maos(t): return kbv('S16-1-maos.mp4', .6 + (t - 329.6), t, 329.6, 333.12, 1.03, 1.15)
# S17
def s17_persiana(t):
    base = kbv('S17-1-persiana.mp4', (t - 333.12) * .9, t, 333.12, 343.7, 1.02, 1.12, pingpong=True)
    if t < 338.3: return base
    im, kf = foco(base, t, (338.2, 338.7), (343.2, 343.7), r=24, esc=.5)
    def d_(d, L):
        txt_c(d, W / 2, H / 2 - 60, 'jalousie', ITA(200), CREME, entra(t, 338.6) * kf)
        txt_c(d, W / 2 - 230, H / 2 + 110, '= ciúme', BEB(90), TERRA, entra(t, 339.5) * kf)
        txt_c(d, W / 2 + 230, H / 2 + 110, '= persiana', BEB(90), CREME, entra(t, 342.3) * kf)
        txt_c(d, W / 2, H / 2 - 210, 'em francês', INT4(34), (220, 205, 180), entra(t, 337.5) * kf)
    return sombra_txt(im, d_, 20, .7)
def s17_rua(t):
    im = kb(foto('S17-3-rua.jpg'), t, 343.7, 349.4, 1.05, 1.22, (.5, .55), (.55, .62))
    return im * (0.88 + 0.14 * listras(t, 140, 0, 0.02))
def s17_fresta(t):
    if t < 352.6: return kb(foto('S17-2-fresta-quadro.jpg'), t, 349.2, 352.6, 1.04, 1.14, (.5, .5), (.42, .5))
    return kbv('S17-2-fresta.mp4', min(4.9, t - 352.6), t, 352.6, 358.5, 1.14, 1.32, (.42, .5), (.42, .5))
# S18
def s18_bolso(t):
    im = kb(foto('S18-1-bolso.jpg'), t, 358.52, 370.3, 1.04, 1.30, (.5, .5), (.55, .55))
    k = sm((t - 362.4) / 1.2)                                      # a persiana fecha sobre o celular
    if 362.2 < t < 364.6:
        per = 64.0; m = ((yy % per) < per * (k if t < 363.6 else 1 - sm((t - 363.6) / 1.0))).astype(np.float32)[..., None]
        im = im * (1 - m) + np.array([16, 14, 13], np.float32) * m
    if t < 364.3: return im
    im, kf = foco(im, t, (364.3, 364.8), r=26, esc=.55)
    itens = [('visto por último às 23:12', 364.5, 'olho'), ('localização compartilhada', 366.3, 'pino'), ('quem viu o seu story', 368.0, 'story')]
    def d_(d, L):
        for i, (s, ta, ic) in enumerate(itens):
            a = entra(t, ta, .35) * kf; y = H / 2 - 170 + i * 150
            if a <= 0: continue
            x = W / 2 - 420 + 30 * (1 - a)
            d.rounded_rectangle([x, y, x + 840, y + 110], 30, fill=(32, 34, 40, int(230 * a)))
            cx, cy = x + 66, y + 55
            if ic == 'olho':
                d.ellipse([cx - 30, cy - 18, cx + 30, cy + 18], outline=CREME + (int(255 * a),), width=4); d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=CREME + (int(255 * a),))
            elif ic == 'pino':
                d.ellipse([cx - 20, cy - 34, cx + 20, cy + 6], fill=TERRA + (int(255 * a),)); d.polygon([(cx - 17, cy - 6), (cx + 17, cy - 6), (cx, cy + 28)], fill=TERRA + (int(255 * a),))
            else:
                for j in range(3): d.ellipse([cx - 36 + j * 22, cy - 18, cx - 2 + j * 22, cy + 16], outline=CREME + (int(255 * a),), width=3, fill=(60 + j * 30, 60, 70, int(255 * a)))
            d.text((x + 130, cy), s, font=INT(44), fill=CREME + (int(255 * a),), anchor='lm')
    return sombra_txt(im, d_)
# S19
def s19_sofa(t):
    if t < 374.6: return kb(foto('S19-1-sofa-quadro.jpg'), t, 370.32, 374.6, 1.04, 1.12, (.5, .5), (.5, .5))
    return kbv('S19-1-sofa.mp4', t - 374.6, t, 374.6, 379.7, 1.12, 1.22, (.5, .5), (.62, .45))
def s19_ele(t, ta, tb, z0, z1):
    im = kb(foto('S19-2-ele-close.jpg'), t, ta, tb, z0, z1, (.5, .45), (.52, .40))
    return im * (1 + 0.06 * math.sin(t * 17) * (math.sin(t * 5) > 0))
def s19_ela(t): return kb(foto('S19-3-ela-reacao.jpg'), t, 381.3, 383.9, 1.08, 1.18, (.5, .45), (.45, .42))
ANOS = ['2024', '2023', '2022', '2021', '2020', '2019']
FEED_FOTOS = ['S14-4-casal-paz.jpg', 'S17-3-rua.jpg', 'S13-2-natal-quadro.jpg', 'S20-2-novela.jpg', 'S24-3-mae.jpg']
@lru_cache(None)
def card_feed(i, pw):
    n = 'S19-4-praia-2019.jpg' if i == 5 else FEED_FOTOS[i]
    c = enquadra(foto(n), 1.0, .5, .5).resize((pw - 40, int((pw - 40) * 9 / 16)), Image.LANCZOS)
    return c if i == 5 else c.filter(ImageFilter.GaussianBlur(3))
def s19_feed(t):
    base = desfoca(kb(foto('S19-1-sofa-quadro.jpg'), t, 380, 400, 1.2, 1.3, (.5, .5), (.5, .5)), 30) * .55
    pw, passo, topo = 720, 470, 250
    k = sm((t - 386.9) / 1.7)                                     # rola de 2024 até 2019
    rol = k * 5 * passo
    L = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(L); x0 = W / 2 - pw / 2
    for i, ano in enumerate(ANOS):
        y = topo + i * passo - rol
        if y > H or y < -470: continue
        d.rounded_rectangle([x0, y, x0 + pw, y + 450], 26, fill=(38, 40, 46, 245))
        L.paste(card_feed(i, pw).convert('RGBA'), (int(x0 + 20), int(y + 60)))
        d.text((x0 + 26, y + 30), ano, font=INT(32), fill=CREME + (230,), anchor='lm')
        if i == 5 and t > 388.6:                                  # o coração na foto da praia
            hk = sm((t - 388.6) / .25); pul = 1 + .25 * math.sin(min(1, (t - 388.6) / .5) * math.pi)
            cx, cy, r = x0 + pw - 70, y + 30, 22 * hk * pul
            d.ellipse([cx - r, cy - r, cx, cy], fill=(230, 60, 70, 255)); d.ellipse([cx, cy - r, cx + r, cy], fill=(230, 60, 70, 255))
            d.polygon([(cx - r * .97, cy - r * .35), (cx + r * .97, cy - r * .35), (cx, cy + r)], fill=(230, 60, 70, 255))
    im = f32(Image.alpha_composite(pil(base).convert('RGBA'), L).convert('RGB'))
    if t > 392.1:                                                  # "5 anos de feed": o contador volta no tempo
        def d_(d, L2):
            a = entra(t, 392.1)
            ano = ANOS[min(5, int(sm((t - 392.3) / 2.6) * 5.99))]
            txt_c(d, W * .17, H / 2 - 40, ano, BEB(150), TERRA, a); txt_c(d, W * .17, H / 2 + 70, '5 anos de feed', INT4(36), CREME, a)
        im = sombra_txt(im, d_)
    return im
def s19_dedicacao(t):
    base = kb(foto('S19-2-ele-close.jpg'), t, 396.3, 402.2, 1.25, 1.45, (.52, .40), (.52, .38))
    if t < 399.0 or t > 401.0: return base
    im, kf = foco(base, t, (399.0, 399.4), (400.6, 401.0))
    def d_(d, L):
        txt_c(d, W / 2, H / 2 - 70, 'distração', ITA(110), (200, 190, 175), entra(t, 399.1) * kf)
        d.line([(W / 2 - 240, H / 2 - 64), (W / 2 + 240, H / 2 - 64)], fill=VERM + (int(255 * entra(t, 399.3) * kf),), width=8)
        txt_c(d, W / 2, H / 2 + 70, 'DEDICAÇÃO', BEB(170), TERRA, entra(t, 399.4) * kf)
    return sombra_txt(im, d_)
def s19_vao(t):
    return kb(foto('S19-5-sofa-vao.jpg'), t, 402.1, 409.3, 1.04, 1.75, (.5, .5), (.5, .66))
# S20
def s20_dado(t):
    base = kb(foto('S19-5-sofa-vao.jpg'), t, 409.28, 420.4, 1.10, 1.22, (.5, .6), (.5, .62))
    im, kf = foco(base, t, (409.3, 409.8), (419.9, 420.4), r=26, esc=.42)
    def d_(d, L):
        a = entra(t, 412.0) * kf; b = entra(t, 417.3) * kf
        txt_c(d, W / 2, H * .30, 'MAIS DA METADE', BEB(130), CREME, a)
        txt_c(d, W / 2, H * .30 + 90, 'diz que quem ama de verdade sente ciúme', INT4(40), (230, 215, 190), a)
        txt_c(d, W / 2, H * .62, 'SÓ 1 EM CADA 10', BEB(130), TERRA, b)
        txt_c(d, W / 2, H * .62 + 90, 'admite sentir com frequência', INT4(40), (230, 215, 190), b)
        for i in range(10):
            x = W / 2 - 405 + i * 90; y = H * .62 - 170; c = TERRA if i == 0 else (120, 115, 105)
            aa = b * entra(t, 418.0 + i * .04, .2)
            d.ellipse([x - 16, y - 16, x + 16, y + 16], fill=c + (int(255 * aa),)); d.rounded_rectangle([x - 24, y + 20, x + 24, y + 70], 14, fill=c + (int(255 * aa),))
    im = sombra_txt(im, d_)
    return fonte_rodape(im, t, 412.0, 420.4, 'Fonte: Instituto Locomotiva / QuestionPro, via Metrópoles (2024)')
def s20_mesa(t): return kb(foto('S7-1-mesa-bar.jpg'), t, 420.4, 424.0, 1.08, 1.2, (.5, .5), (.48, .46))
def s20_botija(t): return kbv('S20-1-botija.mp4', 1.45 + (t - 424.0), t, 424.0, 426.2, 1.05, 1.12)
def s20_novela(t):
    im = kb(foto('S20-2-novela.jpg'), t, 426.2, 432.6, 1.04, 1.28, (.5, .5), (.62, .38))
    return im * (1 + 0.05 * math.sin(t * 31) + 0.03 * (math.sin(t * 7) > .7))
def s20_vinil(t): return kbv('S20-3-vinil.mp4', (t - 432.6) * .74, t, 432.6, 439.4, 1.03, 1.12)
def s20_sertanejo(t):
    im = kb(foto('S20-4-sertanejo.jpg'), t, 439.4, 443.4, 1.04, 1.18, (.5, .45), (.5, .40))
    fl = np.exp(-((xx - (W * .2 + W * .6 * sm((t - 439.6) / 3.2))) / 260) ** 2)[..., None] * np.exp(-((yy - H * .25) / 300) ** 2)[..., None]
    return im + np.array([255, 190, 110], np.float32) * fl * .35 * (1 + .3 * math.sin(t * 9))
def s20_posto(t):
    im = kb(foto('S20-5-posto.jpg'), t, 443.4, 448.3, 1.04, 1.55, (.55, .45), (.66, .40))
    return im * (1 - 0.06 * (math.sin(t * 43) > .85))
# S21
def s21_livro(t): return kb(foto('S7-5-livro.jpg'), t, 448.2, 451.7, 1.04, 1.2, (.5, .55), (.6, .45))
def s21_bentinho(t):
    im = kb(foto('S21-1-bentinho.jpg'), t, 451.6, 457.8, 1.04, 1.32, (.55, .45), (.62, .32))
    im = im * (1 + .04 * math.sin(t * 7.3))                                  # lamparina
    return rotulo(im, t, 452.6, 457.5, 'DOM CASMURRO · MACHADO DE ASSIS (1899)')
def s21_capitu(t): return kb(foto('S21-2-capitu-escobar.jpg'), t, 457.7, 464.1, 1.04, 1.55, (.5, .5), (.55, .38))
def s21_paginas(t, ta, s0=0, vel=.55): return kbv('S21-3-paginas.mp4', s0 + (t - ta) * vel, t, ta, ta + 9, 1.03, 1.15, pingpong=True)
def s21_bar(t): return kb(foto('S21-4-marido-bar.jpg'), t, 473.3, 480.7, 1.04, 1.6, (.45, .45), (.73, .22))
def s21_estante(t, ta=480.6, tb=483.5): return kb(foto('S21-5-estante.jpg'), t, ta, tb, 1.04, 1.18, (.4, .5), (.6, .5))
def s21_pesq(t):
    base = kb(foto('S21-6-pesquisadora.jpg'), t, 483.4, 491.8, 1.04, 1.25, (.5, .5), (.62, .45))
    im, kf = foco(base, t, (484.6, 485.1), (490.6, 491.2))
    def d_(d, L):
        txt_c(d, W / 2, H / 2 - 110, '1960', BEB(180), TERRA, entra(t, 484.9) * kf)
        txt_c(d, W / 2, H / 2 + 20, 'Helen Caldwell', PLA(84), CREME, entra(t, 487.6) * kf)
        txt_c(d, W / 2, H / 2 + 110, '"O Otelo brasileiro de Machado de Assis"', ITA(56), (230, 215, 190), entra(t, 488.6) * kf)
    return sombra_txt(im, d_)
def s21_narrador(t):
    im = kb(foto('S21-1-bentinho.jpg'), t, 495.7, 502.6, 1.35, 1.85, (.62, .32), (.62, .27))
    k = sm((t - 498.3) / .5)                                                     # anel vermelho do dossiê no narrador
    if k > 0:
        def d_(d, L):
            r = 230; cx, cy = W * .5, H * .44
            d.arc([cx - r, cy - r * 1.15, cx + r, cy + r * 1.15], -90, -90 + 360 * k, fill=VERM + (235,), width=8)
            txt_c(d, cx - r - 50, cy - 40, 'INVESTIGAR', BEB(96), CREME, sm((t - 499.6) / .4), 'rm'); txt_c(d, cx - r - 50, cy + 50, 'O NARRADOR', BEB(96), CREME, sm((t - 499.8) / .4), 'rm')
            d.line([(cx - r - 50 - 380 * sm((t - 500.0) / .5), cy + 110), (cx - r - 50, cy + 110)], fill=VERM + (235,), width=6)
        im = sombra_txt(im, d_, 10, .5)
    return im
def s21_gota(t):
    im = kb(foto('S21-7-gota.jpg'), t, 502.5, 510.4, 1.04, 1.45, (.5, .5), (.5, .45))
    return fonte_rodape(im, t, 503.0, 510.2, 'Fontes: Franchetti (Estudos Avançados/USP, 2009); Chagas & Batistela (Eutomia, 2023)')
def s21_olha(t): return kbv('S21-8-bentinho-olha.mp4', .3 + (t - 510.3) * .9, t, 510.3, 516.1, 1.03, 1.15, (.55, .4), (.58, .32))
# S22 · sóbrio
def s22_trib(t, ta, tb, z0, z1): return kb(foto('S7-4-supremo.jpg'), t, ta, tb, z0, z1, (.5, .5), (.5, .52)) * 1.12
def s22_martelo(t):
    base = kb(foto('S22-1-martelo.jpg'), t, 520.4, 534.1, 1.04, 1.22, (.5, .5), (.52, .55))
    if t < 528.2: return base
    im, kf = foco(base, t, (528.2, 528.7), (533.5, 534.0), r=20, esc=.35)
    def d_(d, L):
        txt_c(d, W / 2, H / 2 - 30, '"LEGÍTIMA DEFESA DA HONRA"', BEB(110), (235, 235, 235), entra(t, 528.4) * kf)
        txt_c(d, W / 2, H / 2 + 70, 'a tese que jogava na vítima a culpa pela própria morte', INT4(36), (200, 200, 200), entra(t, 530.6) * kf)
    return sombra_txt(im, d_)
def s22_decisao(t):
    base = s22_trib(t, 534.0, 550.5, 1.1, 1.2)
    im, kf = foco(base, t, (534.0, 534.5), (550.0, 550.4), r=20, esc=.35)
    def d_(d, L):
        a = entra(t, 535.3) * kf * (1 - entra(t, 544.6, .3)); b = entra(t, 544.8) * kf
        txt_c(d, W / 2, H * .32, 'STF · 1º DE AGOSTO DE 2023', BEB(84), (235, 235, 235), a)
        txt_c(d, W / 2, H * .45, 'UNANIMIDADE: INCONSTITUCIONAL', BEB(110), (235, 235, 235), a * entra(t, 538.6))
        txt_c(d, W / 2, H * .60, '"recurso odioso, desumano e cruel"', ITA(76), (215, 215, 215), a * entra(t, 541.0))
        txt_c(d, W / 2, H / 2 - 20, '2023', BEB(260), (235, 235, 235), b)
        txt_c(d, W / 2, H / 2 + 140, 'foi ontem.', ITA(70), (215, 215, 215), b * entra(t, 549.0))
    im = sombra_txt(im, d_)
    return fonte_rodape(im, t, 535.5, 550.4, 'Fontes: Conjur e IBDFAM (08/2023) · ADPF 779')
def s22_pix(t):
    base = kb(foto('S22-2-pagamento.jpg'), t, 550.4, 557.8, 1.04, 1.18, (.5, .5), (.6, .45))
    im, kf = foco(base, t, (553.0, 553.5), (557.2, 557.7), r=24, esc=.45)
    def d_(d, L):
        x0, x1, y = W * .22, W * .78, H / 2
        k = sm((t - 555.8) / 1.4)
        d.line([(x0, y), (lerp(x0, x1, k), y)], fill=(230, 230, 230, int(255 * kf)), width=5)
        a = entra(t, 553.4) * kf; b = entra(t, 557.0) * kf
        d.ellipse([x0 - 16, y - 16, x0 + 16, y + 16], fill=(230, 230, 230, int(255 * a)))
        txt_c(d, x0, y - 80, '2020', BEB(90), (235, 235, 235), a); txt_c(d, x0, y + 70, 'dinheiro em 3 segundos', INT4(34), (210, 210, 210), a)
        d.ellipse([x1 - 16, y - 16, x1 + 16, y + 16], fill=(230, 230, 230, int(255 * b)))
        txt_c(d, x1, y - 80, '2023', BEB(90), (235, 235, 235), b); txt_c(d, x1, y + 70, 'a honra deixa de ser desculpa', INT4(34), (210, 210, 210), b)
    im = sombra_txt(im, d_)
    return fonte_rodape(im, t, 553.5, 557.7, 'Pix: Banco Central do Brasil (16/11/2020)')
def s22_cadeira(t):
    im = s22_trib(t, 557.7, 566.0, 1.15, 1.6)
    return im * (1 - .85 * sm((t - 565.2) / .6))
# S23
def s23_chama(t, ta, tb, z0, z1, s0=3.6, s1=4.9):
    s = lerp(s0, s1, cl((t - ta) / max(.1, tb - ta)))
    return kbv('S7-3-fosforo.mp4', s, t, ta, tb, z0, z1, (.5, .42), (.5, .42))
def s23_lab(t):
    if t < 571.0: im = kb(foto('S23-1-laboratorio-quadro.jpg'), t, 569.0, 571.0, 1.04, 1.1, (.5, .5), (.5, .5))
    else: im = kbv('S23-1-laboratorio.mp4', min(4.95, (t - 572.2) + 2.0 if t > 572.2 else (t - 571) * 1.6), t, 571.0, 584.4, 1.0, 1.15)
    if 582.2 < t < 584.4:                                                             # alarme
        p = .5 + .5 * math.sin((t - 582.2) * 2 * math.pi * 2.2)
        im = im + np.array([200, 20, 20], np.float32) * p * .25 * (1 - VIN[..., 0:1]) * 3
        im = sombra_txt(im, lambda d, L: txt_c(d, W / 2, H * .18, 'UM ALARME PARA PROTEGER O CASAL', BEB(84), CREME, entra(t, 582.3)))
    return rotulo(im, t, 569.2, 575.0, 'DAVID BUSS · 1992')
def s23_debate(t): return kb(foto('S23-2-debate.jpg'), t, 584.4, 595.9, 1.12, 1.25, (.30, .5), (.62, .45))
def s23_usp(t):
    base = kb(foto('S23-3-multidao.jpg'), t, 595.8, 612.5, 1.05, 1.4, (.5, .5), (.5, .5))
    im, kf = foco(base, t, (596.6, 597.1), (611.9, 612.4), r=26, esc=.45)
    def d_(d, L):
        a = entra(t, 597.4) * kf * (1 - entra(t, 607.2, .3)); b = entra(t, 607.6) * kf
        txt_c(d, W / 2, H * .27, 'USP', BEB(110), TERRA, a)
        txt_c(d, W / 2, H * .38, '1.744 PESSOAS', BEB(130), CREME, a * entra(t, 598.2))
        txt_c(d, W / 2, H * .47, 'Brasil, Portugal e Chile', INT4(38), (225, 210, 185), a * entra(t, 598.8))
        txt_c(d, W / 2, H * .62, 'o ciúme mira mais o rival do mesmo sexo', ITA(70), CREME, a * entra(t, 601.4))
        txt_c(d, W / 2, H * .72, 'héteros · gays · bissexuais', INT4(36), (225, 210, 185), a * entra(t, 605.4))
        txt_c(d, W / 2, H * .40, 'homem desconfia de homem', BEB(110), CREME, b)
        txt_c(d, W / 2, H * .58, 'mulher desconfia de mulher', BEB(110), TERRA, b * entra(t, 609.8))
    im = sombra_txt(im, d_)
    return fonte_rodape(im, t, 597.5, 612.4, 'Fonte: Valentova et al., Archives of Sexual Behavior · via Revista Pesquisa FAPESP')
DOS = [(612.4, 1.10, (.45, .5)), (614.2, 2.3, (.20, .17)), (616.4, 2.3, (.27, .43)), (618.6, 2.2, (.21, .62))]
def s23_dossie(t):
    pts = [p for p in DOS if p[0] <= t] or DOS[:1]; i = len(pts) - 1
    prev = DOS[max(0, i - 1)]; cur = DOS[i]; k = sm((t - cur[0]) / .55)
    z = lerp(prev[1], cur[1], k); c = (lerp(prev[2][0], cur[2][0], k), lerp(prev[2][1], cur[2][1], k))
    return f32(enquadra(foto('S23-4-dossie.jpg'), z * (1 + .02 * (t - cur[0])), c[0], c[1]))
def s23_sozinha(t): return kb(foto('S23-5-namorada-sozinha.jpg'), t, 620.6, 624.7, 1.04, 1.18, (.45, .5), (.42, .45))
def s23_concorrencia(t):
    base = kb(foto('S23-4-dossie.jpg'), t, 624.6, 630.7, 1.15, 1.45, (.4, .45), (.27, .43))
    if t < 629.3: return base
    im, kf = foco(base, t, (629.3, 629.6), r=20, esc=.45)
    def d_(d, L):
        a = entra(t, 629.4, .2) * kf; s = 1 + .4 * (1 - sm((t - 629.4) / .25))
        L2 = Image.new('RGBA', (900, 220)); d2 = ImageDraw.Draw(L2)
        d2.rectangle([10, 10, 890, 210], outline=VERM + (int(255 * a),), width=10)
        d2.text((450, 112), 'CONCORRÊNCIA', font=BEB(150), fill=VERM + (int(255 * a),), anchor='mm')
        L2 = L2.rotate(-8, resample=Image.BICUBIC, expand=True).resize((int(L2.width * s * .98), int(L2.height * s * .98)))
        L.alpha_composite(L2, (int(W / 2 - L2.width / 2), int(H / 2 - L2.height / 2)))
    return sombra_txt(im, d_, 8, .4)
# S24
def s24_chama(t):
    base = s23_chama(t, 630.6, 641.0, 1.1, 1.3, 2.4, 4.9)
    if t < 638.6: return base
    im, kf = foco(base, t, (638.6, 639.2), (640.6, 641.0), r=24, esc=.5)
    return sombra_txt(im, lambda d, L: txt_c(d, W / 2, H / 2, 'cuidado.', ITA(190), CREME, entra(t, 639.8) * kf), 22, .7)
@lru_cache(None)
def maternidade_rot():
    img = foto('S8-3-maternidade.jpg').copy(); d = ImageDraw.Draw(img)
    for (x0, x1), w in [((700, 968), 'CIÚME'), ((2148, 2416), 'ZELO')]:
        d.text(((x0 + x1) / 2, 1172), w, font=BEB(150), fill=(40, 38, 40), anchor='mm')
    return img
def s24_mat(t): return kb(maternidade_rot(), t, 641.0, 648.0, 1.05, 1.22, (.5, .55), (.5, .6))
def s24_gaveta(t): return kbv('S24-1-gaveta.mp4', 1.0 + (t - 647.9) * 1.0, t, 647.9, 651.1, 1.03, 1.12)
def s24_vela(t): return kbv('S10-1-vela.mp4', (t - 650.6), t, 651.0, 654.3, 1.06, 1.15)
def s24_mapa(t):
    im = mapa(t, .9, aneis_t(t, 656.4))
    im, kf = foco(im, t, (654.2, 654.5), (660.4, 660.8), r=10, esc=.25)
    def d_(d, L):
        txt_c(d, W / 2, H * .20, 'o zelo quer saber se você está bem', ITA(80), CREME, entra(t, 654.4) * kf * (1 - entra(t, 656.4, .3)))
        txt_c(d, W / 2, H * .20, 'o ciúme quer saber se ainda é o centro do seu mundo', ITA(80), TERRA, entra(t, 656.6) * kf)
    return sombra_txt(im, d_)
MAE = [('mae', 'Chegou bem, filho?', 662.9, CREME), ('mae', 'Me avisa, viu?', 664.4, CREME), ('mae', 'E leva um casaco, que vai esfriar.', 665.5, CREME)]
CIU = [('eu', 'Chegou?', 669.4, TERRA), ('eu', 'Tá com quem?', 670.2, TERRA), ('eu', 'Manda uma foto.', 671.5, TERRA),
       ('eu', 'Não.', 672.6, TERRA), ('eu', 'Foto sua não.', 673.4, TERRA), ('eu', 'Foto do lugar.', 674.6, TERRA)]
def s24_mae(t):
    base = kb(foto('S24-3-mae.jpg'), t, 660.8, 668.0, 1.04, 1.15, (.5, .5), (.55, .45))
    im, kf = foco(base, t, (662.2, 662.7), (667.4, 667.9), r=26, esc=.5)
    return bolhas(im, t, MAE, saida=667.4) if t >= 662.6 else im
def s24_ciu(t):
    base = kb(foto('S24-4-ciumento-chat.jpg'), t, 667.9, 675.9, 1.04, 1.2, (.5, .5), (.6, .4))
    im, kf = foco(base, t, (668.8, 669.2), (675.4, 675.8), r=26, esc=.5)
    return bolhas(im, t, CIU, fs=46, saida=675.4) if t >= 669.2 else im
def s24_split(t):
    a = desfoca(kb(foto('S24-3-mae.jpg'), t, 675.8, 684, 1.15, 1.2, (.55, .45), (.55, .45)), 26) * .5
    b = desfoca(kb(foto('S24-4-ciumento-chat.jpg'), t, 675.8, 684, 1.2, 1.25, (.6, .4), (.6, .4)), 26) * .5
    k = sm((t - 675.8) / .6); im = a.copy(); half = int(W / 2)
    im[:, half:] = b[:, half:] * k + a[:, half:] * (1 - k)
    def d_(d, L):
        d.line([(half, 80), (half, H - 80)], fill=CREME + (int(120 * k),), width=2)
        txt_c(d, W * .25, H * .2, 'mãe', INT4(36), (225, 210, 185), k); txt_c(d, W * .75, H * .2, 'ciúme', INT4(36), (225, 210, 185), k)
        e = entra(t, 681.6, .4)
        if e > 0:
            f = INT(64); bw = f.getlength('chegou?') + 110
            d.rounded_rectangle([W / 2 - bw / 2, H / 2 - 60, W / 2 + bw / 2, H / 2 + 60], 55, fill=CREME + (int(245 * e),))
            d.text((W / 2, H / 2), 'chegou?', font=f, fill=GRAF + (int(255 * e),), anchor='mm')
            txt_c(d, W / 2, H / 2 + 110, '23:00', INT4(34), (225, 210, 185), e * entra(t, 682.7))
    return sombra_txt(im, d_)
def s24_notif(t):
    im = kb(foto('S24-5-notificacao.jpg'), t, 684.0, 691.3, 1.04, 1.5, (.55, .55), (.66, .72))
    return im * (1 + .12 * (.5 + .5 * math.sin(t * 2.3)))
def s24_sabe(t): return kb(foto('S24-4-ciumento-chat.jpg'), t, 691.2, 692.8, 1.7, 1.95, (.6, .35), (.6, .33))
# S25
def s25_menina(t): return kbv('S9-4-menina-vassoura.mp4', .5 + (t - 692.76), t, 692.76, 695.3, 1.05, 1.12)
def s25_tia(t): return kbv('S9-4-menina.mp4', (t - 695.2), t, 695.2, 698.7, 1.6, 1.75, (.62, .55), (.62, .52))
def s25_armario(t): return kbv('S25-1-armario.mp4', (t - 698.6) * .81, t, 698.6, 704.9, 1.03, 1.12)
def s25_fresta(t): return kb(foto('S25-2-bentinho-fresta.jpg'), t, 704.8, 708.9, 1.04, 1.4, (.5, .5), (.62, .42))
def s25_contador(t):
    base = kb(foto('S7-5-livro.jpg'), t, 708.8, 718.1, 1.2, 1.35, (.55, .5), (.55, .5))
    im, kf = foco(base, t, (708.8, 709.2), (717.6, 718.0), r=26, esc=.4)
    def d_(d, L):
        n = int(round(1 + 147 * sm((t - 709.0) / 2.3)))
        a = entra(t, 708.9) * kf * (1 - entra(t, 714.6, .3))
        txt_c(d, W / 2, H / 2 - 40, str(n), BEB(300), CREME, a); txt_c(d, W / 2, H / 2 + 130, 'CAPÍTULOS', BEB(80), TERRA, a)
        for i, (s, ta) in enumerate([('sem um bilhete', 715.4), ('sem um print', 717.0)]):
            b = entra(t, ta, .3) * kf; y = H / 2 - 70 + i * 140
            txt_c(d, W / 2, y, s, ITA(100), CREME, b)
            k = sm((t - ta - .3) / .3)
            if k > 0: d.line([(W / 2 - 300, y + 6), (W / 2 - 300 + 600 * k, y + 6)], fill=VERM + (int(255 * b),), width=8)
    return sombra_txt(im, d_)
def s25_estante(t): return s21_estante(t, 718.0, 722.6)
# S26
def s26_pergunta(t):
    a_ = kb(foto('S7-1-mesa-bar.jpg'), t, 722.56, 729.7, 1.1, 1.2, (.5, .5), (.5, .45))
    b_ = kb(foto('S7-2-porta.jpg'), t, 722.56, 729.7, 1.1, 1.2, (.5, .55), (.45, .6))
    k = sm((t - 727.3) / .8); base = a_ * (1 - k) + b_ * k
    im, kf = foco(base, t, (722.6, 723.0), (729.1,729.6), r=28, esc=.55)
    def d_(d, L):
        txt_c(d, W / 2, H * .30, 'POR QUE O CIÚME VIVE ASSIM HOJE?', BEB(110), CREME, entra(t, 722.8) * kf)
        txt_c(d, W / 2, H * .52, 'exibido como prova de amor', ITA(80), CREME, entra(t, 725.4) * kf)
        txt_c(d, W / 2, H * .66, 'escondido como defeito', ITA(80), TERRA, entra(t, 727.5) * kf)
    return sombra_txt(im, d_)
def s26_luiz(t): return luiz('L16', t, 729.6, vel=1.0, z0=1.12, z1=1.25, c=(.5, .38))
def s26_bolso(t):
    im = kb(foto('S18-1-bolso.jpg'), t, 735.3, 739.1, 1.1, 1.3, (.5, .5), (.55, .55))
    return im * (0.82 + 0.25 * listras(t, 90, 12, 0.0))
def s26_zelo_vigia(t):
    a = kb(foto('S24-3-mae.jpg'), t, 739.0, 748.1, 1.15, 1.25, (.55, .45), (.55, .45))
    b = kb(foto('S24-4-ciumento-chat.jpg'), t, 739.0, 748.1, 1.2, 1.3, (.6, .4), (.6, .38))
    half = int(W / 2); im = a.copy(); im[:, half:] = b[:, half:]
    im, kf = foco(im, t, (740.6, 741.0), r=20, esc=.45)
    def d_(d, L):
        d.line([(half, 60), (half, H - 60)], fill=CREME + (140,), width=2)
        txt_c(d, W * .25, H * .42, 'ZELO', BEB(170), CREME, entra(t, 741.2) * kf); txt_c(d, W * .75, H * .42, 'VIGIA', BEB(170), TERRA, entra(t, 742.8) * kf)
        txt_c(d, W * .25, H * .60, '"é amor"', ITA(76), CREME, entra(t, 744.6) * kf); txt_c(d, W * .75, H * .60, '"eu só perguntei"', ITA(76), TERRA, entra(t, 746.3) * kf)
    return sombra_txt(im, d_)
RUIDO_CAFE = None
def s26_cafe(t):
    global RUIDO_CAFE
    real = kb(foto('S26-1-cafe-real.jpg'), t, 748.0, 758.4, 1.04, 1.15, (.5, .5), (.45, .55))
    pint = kb(foto('S26-2-cafe-pintado.jpg'), t, 748.0, 758.4, 1.04, 1.15, (.5, .5), (.45, .55))
    lam = np.clip((listras(t, 96, 3.0, 0.0) - .35) * 3.0, 0, 1)                     # o que a persiana deixa ver (bordas macias)
    if RUIDO_CAFE is None:
        RUIDO_CAFE = np.asarray(Image.effect_noise((W // 24, H // 24), 90).resize((W, H), Image.BICUBIC), np.float32)[..., None] / 255
    k = sm((t - 752.4) / 5.0)                                                        # a neurose pinta as frestas
    pinta = np.clip((k * 1.5 - RUIDO_CAFE * .8) * 2.4, 0, 1)
    fresta = desfoca(real, 10) * .30
    fresta = fresta * (1 - pinta) + pint * pinta
    vis = real * lam + fresta * (1 - lam)
    full = sm((t - 756.6) / 1.2)
    return vis * (1 - full) + pint * full
# S27 · a confissão (Luiz, sem sincronia)
def s27_a(t): return luiz('L13', t, 758.32, vel=1.0, z0=1.15, z1=1.3, c=(.5, .36))
def s27_b(t): return luiz('L11', t, 761.2, vel=.7, z0=1.2, z1=1.35, c=(.5, .38))
def s27_c(t): return luiz('L14', t, 766.0, vel=.9, z0=1.25, z1=1.4, c=(.5, .38))
def s27_mesa(t):
    base = kb(foto('S27-1-celular-mesa.jpg'), t, 770.6, 777.0, 1.04, 1.3, (.5, .55), (.42, .62))
    im, kf = foco(base, t, (770.8, 771.2), (776.3, 776.8), r=18, esc=.4)
    m = int(sm((t - 771.2) / 3.0) * 20); hh = f'{22 + (41 + m) // 60}:{(41 + m) % 60:02d}'
    def d_(d, L):
        txt_c(d, W / 2, H * .40, hh, BEB(220), CREME, entra(t, 771.0) * kf)
        txt_c(d, W / 2, H * .58, 'visualizada. sem resposta.', INT4(40), (225, 210, 185), entra(t, 773.6) * kf)
        txt_c(d, W / 2, H * .68, '"ela tá no trânsito"', ITA(64), (150, 145, 135), entra(t, 775.5) * kf)
        if t > 775.9:
            k = sm((t - 775.9) / .3); d.line([(W / 2 - 250, H * .68 + 4), (W / 2 - 250 + 500 * k, H * .68 + 4)], fill=VERM + (int(255 * kf),), width=6)
    return sombra_txt(im, d_)
def s27_cinema(t):
    im = kb(foto('S27-2-cinema.jpg'), t, 776.9, 782.8, 1.04, 1.35, (.5, .55), (.5, .45))
    flick = 1 + .07 * math.sin(t * 24) + .05 * (math.sin(t * 9) > .8)
    im = im * flick
    def d_(d, L):
        for i, (s, ta) in enumerate([('ROTEIRO', 779.4), ('TRILHA DE SUSPENSE', 780.4), ('FINAL', 782.0)]):
            txt_c(d, W / 2, H * .13, s, BEB(96), CREME, entra(t, ta, .25) * (1 - entra(t, ta + .9, .25)))
    return sombra_txt(im, d_)
def s27_fim(t):
    im = luiz('L24', t, 782.7, vel=1.0, z0=1.18, z1=1.3, c=(.5, .36))
    if 784.7 < t < 785.6:                                                            # cartela "FIM" de cinema antigo, rápida
        k = sm((t - 784.7) / .2) * (1 - sm((t - 785.35) / .25))
        bl = desfoca(im, 20) * (1 - .6 * k) + im * 0
        im = im * (1 - k) + bl * k
        im = sombra_txt(im, lambda d, L: txt_c(d, W / 2, H / 2, 'Fim', PLA(160), CREME, k), 18, .7)
    return im
# S28
def s28_chama(t):
    im = s23_chama(t, 785.84, 791.3, 1.25, 1.1, 4.9, 3.0)
    return im * (1 - .35 * sm((t - 789.0) / 2.2))
def s28_polegar(t): return kbv('S28-1-polegar.mp4', (t - 791.2) * .96, t, 791.2, 796.5, 1.03, 1.15)
def s28_luiz(t): return luiz('L08', t, 796.4, vel=1.0, z0=1.2, z1=1.32, c=(.5, .36))
BOL_S3 = [('eu', 'Me passa a tua localização?', 800.9, TERRA), ('eu', 'Ué, pra eu ficar tranquila.', 802.4, TERRA)]
def s28_bolhas(t):
    base = desfoca(kb(foto('S3-3-sofa-quadro.jpg'), t, 800.4, 803.6, 1.1, 1.18, (.5, .45), (.52, .42)), 26) * .62
    return bolhas(base, t, BOL_S3)
def s28_frase(t):
    base = kb(foto('S1.jpg'), t, 803.5, 813.2, 1.05, 1.5, (.5, .5), (.38, .58))
    im, kf = foco(base, t, None, (808.6, 809.4), r=36, esc=.5)
    def d_(d, L):
        f = BEB(150); txt_c(d, W / 2, H / 2 - 40, 'NÃO É CIÚME, É CUIDADO.', f, CREME, entra(t, 803.6) * kf)
        txt_c(d, W / 2, H / 2 + 90, 'zelo · ciúme · zēlus', ITA(60), (225, 210, 185), entra(t, 806.0) * kf)
    return sombra_txt(im, d_)
def s28_maos(t):
    im = kb(foto('S28-2-maos-celular.jpg'), t, 813.1, 817.5, 1.04, 1.25, (.55, .5), (.6, .5))
    return im * (1 - sm((t - 817.0) / .45))
# S29 · CTA
def s29_luiz(t):
    base = luiz('L12', t, 817.6, vel=.75, z0=1.15, z1=1.25, c=(.5, .36))
    if t < 819.4: return base
    im, kf = foco(base, t, (819.4, 819.9), (823.9, 824.5), r=28, esc=.55)
    def d_(d, L):
        txt_c(d, W / 2, H * .30, '4 JEITOS DE AJUDAR O', BEB(110), CREME, entra(t, 819.6) * kf)
        txt_c(d, W / 2, H * .66, 'do mais rápido ao mais generoso', ITA(70), TERRA, entra(t, 822.0) * kf)
    im = sombra_txt(im, d_)
    return poe_logo(im, W / 2, H * .47, 620, entra(t, 820.1) * kf)
# animação de inscrição estilo YouTube (genérica, sem logo de terceiros): like, comentário, inscrever-se, sininho, com cursor clicando
YT_CLIQUES = [('like', 825.0), ('inscrever', 825.75), ('sino', 826.35), ('coment', 826.95)]
def yt_widget(im, t, t0, t1):
    a = sm((t - t0) / .4) * (1 - sm((t - (t1 - .35)) / .35))
    if a <= 0: return im
    ck = {n: t >= tc for n, tc in YT_CLIQUES}
    pop = {n: 1 + .22 * math.sin(cl((t - tc) / .3) * math.pi) * (t >= tc) for n, tc in YT_CLIQUES}
    pw, ph = 1180, 150; x0 = W / 2 - pw / 2; y0 = H - 250 + 40 * (1 - a)
    def d_(d, L):
        A = lambda v: int(v * a)
        d.rounded_rectangle([x0, y0, x0 + pw, y0 + ph], 75, fill=(18, 18, 20, A(225)), outline=(255, 255, 255, A(40)), width=2)
        # like
        cx, cy = x0 + 120, y0 + ph / 2; s_ = 34 * pop['like']; cor = (255, 255, 255) if not ck['like'] else CREME
        pts = [(cx - s_ * .9, cy - s_ * .05), (cx - s_ * .35, cy - s_ * .05), (cx - s_ * .05, cy - s_ * .95), (cx + s_ * .2, cy - s_ * .8),
               (cx + s_ * .05, cy - s_ * .15), (cx + s_ * .85, cy - s_ * .15), (cx + s_ * .7, cy + s_ * .85), (cx - s_ * .9, cy + s_ * .85)]
        if ck['like']: d.polygon(pts, fill=CREME + (A(255),))
        else: d.polygon(pts, outline=cor + (A(255),), width=5)
        d.line([(cx - s_ * .35, cy - s_ * .05), (cx - s_ * .35, cy + s_ * .85)], fill=(18, 18, 20, A(255)) if ck['like'] else cor + (A(255),), width=4)
        n = '1,2 mil' if not ck['like'] else '1,2 mil'
        d.text((cx + 60, cy), 'Gostei' if not ck['like'] else 'Gostei!', font=INT(36), fill=cor + (A(255),), anchor='lm')
        # comentário
        cx = x0 + 400; s_ = 32 * pop['coment']; cor = CREME if ck['coment'] else (255, 255, 255)
        d.rounded_rectangle([cx - s_, cy - s_ * .8, cx + s_, cy + s_ * .55], 12, outline=cor + (A(255),), width=5, fill=cor + (A(255),) if ck['coment'] else None)
        d.polygon([(cx - s_ * .45, cy + s_ * .5), (cx - s_ * .1, cy + s_ * .5), (cx - s_ * .55, cy + s_ * 1.0)], fill=cor + (A(255),))
        d.text((cx + 52, cy), 'Comentar', font=INT(36), fill=cor + (A(255),), anchor='lm')
        # inscrever-se
        bx = x0 + 690; bw_, bh_ = 300 * pop['inscrever'] ** .3, 84
        ins = ck['inscrever']; fundo = (62, 62, 66) if ins else (225, 40, 40)
        d.rounded_rectangle([bx, cy - bh_ / 2, bx + bw_, cy + bh_ / 2], bh_ / 2, fill=fundo + (A(255),))
        d.text((bx + bw_ / 2, cy), 'Inscrito' if ins else 'Inscrever-se', font=INT(36), fill=(255, 255, 255, A(255)), anchor='mm')
        # sininho
        cx = x0 + 1080; ang = 18 * math.sin((t - 826.35) * 28) * math.exp(-(t - 826.35) * 3) if t >= 826.35 else 0
        S = Image.new('RGBA', (120, 120)); ds = ImageDraw.Draw(S); c = CREME if ck['sino'] else (255, 255, 255)
        ds.pieslice([24, 18, 96, 96], 180, 360, fill=c + (A(255),)); ds.rectangle([24, 56, 96, 82], fill=c + (A(255),))
        ds.polygon([(16, 86), (104, 86), (96, 78), (24, 78)], fill=c + (A(255),)); ds.ellipse([50, 88, 70, 106], fill=c + (A(255),)); ds.ellipse([54, 8, 66, 22], fill=c + (A(255),))
        if ck['sino']:
            for k in (-1, 1): ds.arc([60 + k * 44 - 16, 30, 60 + k * 44 + 16, 70], 300 if k > 0 else 120, 60 if k > 0 else 240, fill=c + (A(255),), width=4)
        S = S.rotate(ang, resample=Image.BICUBIC, center=(60, 14))
        L.alpha_composite(S, (int(cx - 60), int(cy - 60)))
        # cursor percorrendo os botões
        alvos = [(x0 + 120, cy, 824.5), (x0 + 120, cy, 825.0), (x0 + 840, cy, 825.75), (x0 + 1080, cy, 826.35), (x0 + 400, cy, 826.95)]
        px, py = alvos[0][0] + 120, alvos[0][1] + 160
        for (ax, ay, ta), (bx_, by_, tb) in zip(alvos, alvos[1:]):
            if t >= ta - .45:
                k = sm((t - (tb - .45)) / .4); px, py = lerp(ax, bx_, k), lerp(ay, by_, k)
        if t < 825.0 - .45: k = sm((t - t0) / .5); px, py = lerp(x0 + 240, x0 + 120, k), lerp(cy + 160, cy, k)
        px += 14; py += 14
        clique = any(0 <= t - tc < .15 for _, tc in YT_CLIQUES); sc = .85 if clique else 1
        cur = [(px, py), (px, py + 46 * sc), (px + 12 * sc, py + 35 * sc), (px + 22 * sc, py + 56 * sc), (px + 31 * sc, py + 52 * sc), (px + 21 * sc, py + 31 * sc), (px + 36 * sc, py + 31 * sc)]
        d.polygon(cur, fill=(255, 255, 255, A(255)), outline=(20, 20, 20, A(255)))
        for _, tc in YT_CLIQUES:                                           # anel do clique
            if 0 <= t - tc < .4:
                r = 10 + 60 * (t - tc) / .4; d.ellipse([px - r, py - r, px + r, py + r], outline=(255, 255, 255, A(200 * (1 - (t - tc) / .4))), width=3)
    return sombra_txt(im, d_, 18, .6)
def s29_like(t):
    if t < 827.3:                                                      # você, nítido, pedindo like/inscrição
        im = luiz('L12', t, 817.6, vel=.75, z0=1.15, z1=1.25, c=(.5, .36))
        return yt_widget(im, t, 824.6, 827.4)
    im = mapa(t, .9, aneis_t(t, 827.3), cadeado=sm((t - 827.6) / .5))
    k = sm((t - 827.3) / .35)
    if k < 1: im = im * k + luiz('L12', t, 817.6, vel=.75, z0=1.15, z1=1.25, c=(.5, .36)) * (1 - k)
    return sombra_txt(im, lambda d, L: txt_c(d, W / 2, H * .80, 'prometo não pedir a sua localização', ITA(70), CREME, entra(t, 827.7)))
# gravação do site (1914x948): recortes reordenados e acelerados, como uma janela flutuando sobre o fundo desfocado
CTA_SEG = [  # (t_ini_seq, t_fim_seq, t_ini_clip, velocidade)
    (829.55, 830.25, 0.2, 1.4),      # home: logo e "Por que essa palavra…"
    (830.25, 831.70, 8.6, 5.6),      # busca "ciúme"
    (831.70, 833.00, 17.6, 1.8),     # o verbete abre
    (833.00, 836.20, 31.0, 6.0),     # Sem Disfarce: e-mail
    (836.20, 839.10, 52.0, 6.0),     # Sem Disfarce: WhatsApp e "Assinar a carta"
    (839.10, 841.20, 76.0, 2.0),     # /apoie · Insistir
    (841.20, 843.60, 81.0, 2.4),     # recompensas (R$ 20)
    (843.60, 846.16, 90.0, 2.6),     # apoia.se
]
def cta_frame(t):
    for a, b, s0, v in CTA_SEG:
        if a <= t < b: return qv('S29-CTA.mp4', s0 + (t - a) * v), a, b
    a, b, s0, v = CTA_SEG[-1]; return qv('S29-CTA.mp4', s0 + (b - a) * v), a, b
def s29_site(t):
    fundo = desfoca(f32(enquadra(foto('S17-3-rua.jpg'), 1.2, .5, .5)), 30) * .55
    fundo = fundo * (0.85 + 0.2 * listras(t, 120, 5, 0.0))
    fr, a, b = cta_frame(t)
    fr = fr.resize((1280, 720))                                   # vídeo já em 1280x720 (ajustado)
    k = sm((t - a) / .25) * (1 - sm((t - (b - .2)) / .2)) if a > 829.6 else sm((t - 829.55) / .35)
    escala = 0.80 + 0.03 * sm((t - a) / max(.1, b - a))
    fw, fh = int(W * escala), int(W * escala * 948 / 1914)
    big = fr.resize((fw, fh), Image.BICUBIC)
    base = pil(fundo).convert('RGBA'); x = (W - fw) // 2; y = (H - fh) // 2 + 20
    sh = Image.new('L', (fw + 120, fh + 120), 0); ImageDraw.Draw(sh).rounded_rectangle([60, 60, fw + 60, fh + 60], 26, fill=200)
    sh = sh.filter(ImageFilter.GaussianBlur(30))
    base.paste((0, 0, 0, 255), (x - 60, y - 40), sh)
    m = Image.new('L', (fw, fh), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, fw, fh], 22, fill=255)
    base.paste(big, (x, y), m)
    im = f32(base.convert('RGB'))
    def d_(d, L):
        lab = {829.55: 'palavras.co', 831.70: 'palavras.co', 833.00: 'Sem Disfarce · a carta gratuita', 836.20: 'por e-mail ou WhatsApp',
               839.10: 'apoia.se/palavrasco', 841.20: 'apoia.se/palavrasco', 843.60: 'apoia.se/palavrasco'}
        s = lab.get(a, 'palavras.co')
        txt_c(d, W / 2, 70, s, INT(44), CREME, sm((t - a) / .3))
    return sombra_txt(im, d_, 12, .5)
def s29_fecho(t):
    base = kb(foto('S1.jpg'), t, 846.0, 849.0, 1.4, 1.5, (.38, .58), (.38, .58))
    im = desfoca(base, 32) * .5
    def d_(d, L):
        f = BEB(150); a = entra(t, 846.1, .3)
        k = sm((t - 846.9) / .45)                                     # "cuidado" sai, "zelo" entra
        txt_c(d, W / 2 - 210, H / 2 - 40, 'NÃO É CIÚME, É', f, CREME, a)
        txt_c(d, W / 2 + 330, H / 2 - 40 - 60 * k, 'CUIDADO.', f, (200, 190, 175), a * (1 - k))
        txt_c(d, W / 2 + 270, H / 2 - 40 + 60 * (1 - k), 'ZELO.', f, TERRA, a * k)
        txt_c(d, W / 2, H / 2 + 110, 'Do bom.', ITA(90), CREME, entra(t, 848.0))
    return sombra_txt(im, d_)
def s29_final(t):
    base = kbv('S17-1-persiana.mp4', (t - 848.8) * .5, t, 848.8, 861.42, 1.1, 1.2, pingpong=True)
    im = desfoca(base, 22) * .55
    def d_(d, L):
        a = entra(t, 849.0, .8)
        txt_c(d, W / 2, H * .16 + 92, 'toda palavra é um disfarce', ITA(48), (225, 210, 185), a)
    im = sombra_txt(im, d_)
    return poe_logo(im, W / 2, H * .16, 560, entra(t, 849.0, .8))

# ================= LINHA DO TEMPO =================
SHOTS = [
    (256.68, s13_dic, 'fade', .4), (272.40, s13_natal, 'luz', .4),
    (280.96, s14_porta, 'fade', .3), (284.10, s14_coluna, 'fade', .3), (287.50, s14_barriga, 'corte', 0), (290.30, s14_congela, 'corte', 0),
    (295.70, s14_paz, 'luz', .6),
    (305.00, s15, 'fade', .5),
    (325.84, s16_menina, 'fade', .5), (329.60, s16_maos, 'fade', .3),
    (333.12, s17_persiana, 'preto', .5), (343.70, s17_rua, 'fade', .4), (349.20, s17_fresta, 'corte', 0),
    (358.52, s18_bolso, 'fade', .3),
    (370.32, s19_sofa, 'fade', .4), (379.70, lambda t: s19_ele(t, 379.7, 381.3, 1.05, 1.35), 'corte', 0),
    (381.30, s19_ela, 'corte', 0), (383.90, lambda t: s19_ele(t, 383.9, 386.8, 1.3, 1.45), 'corte', 0),
    (386.70, s19_feed, 'fade', .3), (396.30, s19_dedicacao, 'corte', 0), (402.10, s19_vao, 'fade', .4),
    (409.28, s20_dado, 'corte', 0), (420.40, s20_mesa, 'fade', .3), (424.00, s20_botija, 'corte', 0), (426.20, s20_novela, 'fade', .3),
    (432.60, s20_vinil, 'fade', .4), (439.40, s20_sertanejo, 'luz', .4), (443.40, s20_posto, 'fade', .4),
    (448.20, s21_livro, 'preto', .5), (451.60, s21_bentinho, 'fade', .4), (457.70, s21_capitu, 'fade', .4),
    (464.00, lambda t: s21_paginas(t, 464.0), 'fade', .4), (473.30, s21_bar, 'fade', .3), (480.60, s21_estante, 'fade', .4),
    (483.40, s21_pesq, 'fade', .4), (491.70, lambda t: s21_paginas(t, 491.7, 2.0, .7), 'fade', .3), (495.70, s21_narrador, 'fade', .3),
    (502.50, s21_gota, 'fade', .4), (510.30, s21_olha, 'fade', .4),
    (516.08, lambda t: s22_trib(t, 516.08, 520.5, 1.05, 1.12), 'preto', .7), (520.40, s22_martelo, 'fade', .6),
    (534.00, s22_decisao, 'fade', .6), (550.40, s22_pix, 'fade', .5), (557.70, s22_cadeira, 'fade', .6),
    (565.88, lambda t: s23_chama(t, 565.88, 569.1, 1.1, 1.25), 'preto', .5), (569.00, s23_lab, 'fade', .4),
    (584.40, s23_debate, 'fade', .4), (595.80, s23_usp, 'fade', .4), (612.40, s23_dossie, 'fade', .4),
    (620.60, s23_sozinha, 'fade', .5), (624.60, s23_concorrencia, 'fade', .4),
    (630.60, s24_chama, 'preto', .4), (641.00, s24_mat, 'fade', .4), (647.90, s24_gaveta, 'fade', .3), (651.00, s24_vela, 'fade', .3),
    (654.20, s24_mapa, 'fade', .3), (660.80, s24_mae, 'fade', .4), (667.90, s24_ciu, 'corte', 0), (675.80, s24_split, 'fade', .3),
    (684.00, s24_notif, 'fade', .4), (691.20, s24_sabe, 'corte', 0),
    (692.76, s25_menina, 'fade', .4), (695.20, s25_tia, 'luz', .4), (698.60, s25_armario, 'fade', .4), (704.80, s25_fresta, 'fade', .3),
    (708.80, s25_contador, 'fade', .3), (718.00, s25_estante, 'fade', .4),
    (722.56, s26_pergunta, 'fade', .4), (729.60, s26_luiz, 'fade', .5), (735.30, s26_bolso, 'fade', .3), (739.00, s26_zelo_vigia, 'fade', .3),
    (748.00, s26_cafe, 'fade', .4),
    (758.32, s27_a, 'preto', .4), (761.20, s27_b, 'fade', .3), (766.00, s27_c, 'fade', .3), (770.60, s27_mesa, 'fade', .3),
    (776.90, s27_cinema, 'fade', .3), (782.70, s27_fim, 'fade', .3),
    (785.84, s28_chama, 'preto', .4), (791.20, s28_polegar, 'fade', .4), (796.40, s28_luiz, 'fade', .3), (800.40, s28_bolhas, 'fade', .3),
    (803.50, s28_frase, 'fade', .4), (813.10, s28_maos, 'fade', .4),
    (817.60, s29_luiz, 'preto', .3), (824.50, s29_like, 'fade', .3), (829.55, s29_site, 'fade', .3), (846.00, s29_fecho, 'fade', .3),
    (848.80, s29_final, 'fade', .5),
]
T0, TFIM = 256.68, 861.42
def quadro(t):
    i = max(j for j, s in enumerate(SHOTS) if s[0] <= t + 1e-6)
    ini, fn, tr, d = SHOTS[i]
    im = fn(t)
    if tr != 'corte' and d > 0 and i > 0 and t < ini + d:
        p = sm((t - ini) / d); ant = SHOTS[i - 1][1](t)
        if tr == 'fade': im = ant * (1 - p) + im * p
        elif tr == 'preto': im = ant * max(0, 1 - 2 * p) + im * max(0, 2 * p - 1)
        elif tr == 'luz':
            im = ant * (1 - p) + im * p + np.array([255, 190, 120], np.float32) * .42 * math.sin(p * math.pi)
    return im * VIN + GRAO[int(t * FPS) % 6]

if __name__ == '__main__':
    if sys.argv[4] == 'quadros':
        for tt in sys.argv[5].split(','):
            t = float(tt); pil(quadro(t)).save(SAIDA.replace('.png', f'-{t:07.2f}.png'))
        sys.exit()
    ta, tb = float(sys.argv[4]), float(sys.argv[5])
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', SAIDA], stdin=subprocess.PIPE)
    n0, n1 = round((ta - T0) * FPS), round((tb - T0) * FPS)
    for n in range(n0, n1):
        p.stdin.write(np.clip(quadro(T0 + n / FPS), 0, 255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait(); print('ok', ta, tb)
