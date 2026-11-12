# Ciúme · S06–S12 (1:06,68 → 4:16,68 da narração final). Vídeo MUDO, 1920x1080, 30 fps.
# Uso: python3 s06_s12.py <pasta-midias> <pasta-fontes> <saida.mp4> [quadro_ini quadro_fim]
# Tempos ancorados na transcrição do Premiere e nos sons já existentes na trilha ElevenLabs v2
# (lápis 1:43,40 · estojo 2:51,45 · máquina de escrever 3:33,00).
import sys, os, math, random, subprocess
from functools import lru_cache
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

M, FON, SAIDA = sys.argv[1], sys.argv[2], sys.argv[3]
W, H, FPS = 1920, 1080, 30
T0, T1 = 66.68, 256.68
N = round((T1 - T0) * FPS)
QI, QF = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 5 else (0, N)

CREME = (251, 233, 194); TERRA = (196, 109, 69); NOITE = (21, 23, 28); GRAF = (26, 27, 32); PAPEL = (243, 231, 207)
def cl(x): return max(0.0, min(1.0, x))
def sm(x): x = cl(x); return x * x * x * (x * (6 * x - 15) + 10)
def lerp(a, b, k): return a + (b - a) * k
def f32(im): return np.asarray(im, dtype=np.float32)
def pil(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
@lru_cache(None)
def fonte(nome, tam): return ImageFont.truetype(os.path.join(FON, nome), tam)
BEB = lambda s: fonte('BebasNeue.ttf', s)
INT = lambda s: fonte('Inter-500.ttf', s)
INT4 = lambda s: fonte('Inter-400.ttf', s)
ITA = lambda s: fonte('CormorantGaramond-500-italic.ttf', s)
GRE = lambda s: fonte('FreeSerifItalic.ttf', s)
PLA = lambda s: fonte('PlayfairDisplay-700.ttf', s)
COU = lambda s: fonte('CourierPrime-Bold.ttf', s)

@lru_cache(None)
def foto(n): return Image.open(os.path.join(M, n)).convert('RGB')
@lru_cache(maxsize=3)
def video(n):
    p = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', os.path.join(M, n), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                       capture_output=True, check=True).stdout
    return np.frombuffer(p, np.uint8).reshape(-1, 720, 1280, 3)
def qv(n, s):
    v = video(n); i = int(round(cl(s / (len(v) / 24.0)) * (len(v) - 1)))
    return Image.fromarray(v[i])

def enquadra(img, z, fx, fy):            # fx, fy: centro em fração da imagem
    iw, ih = img.size
    fw = iw / z; fh = fw * H / W
    if fh > ih: fh = ih / z; fw = fh * W / H
    cx = min(max(fx * iw, fw / 2), iw - fw / 2); cy = min(max(fy * ih, fh / 2), ih - fh / 2)
    return img.transform((W, H), Image.EXTENT, (cx - fw / 2, cy - fh / 2, cx + fw / 2, cy + fh / 2), Image.BICUBIC)
def kb(img, t, a, b, z0, z1, c0, c1, ease=sm):  # Ken Burns
    k = ease((t - a) / max(0.01, b - a))
    return f32(enquadra(img, lerp(z0, z1, k), lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k)))
def desfoca(a, r):
    if r < 0.4: return a
    p = pil(a).resize((W // 2, H // 2), Image.BILINEAR).filter(ImageFilter.GaussianBlur(r / 2))
    return f32(p.resize((W, H), Image.BICUBIC))

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIN = np.clip(1.18 - 0.6 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2), 0.5, 1.0)[..., None]
rng = np.random.default_rng(11); GRAO = [rng.normal(0, 5.0, (H, W, 1)).astype(np.float32) for _ in range(6)]

def camada(im, fn):            # desenha texto/forma por cima (RGBA) de um array
    L = Image.new('RGBA', (W, H)); fn(ImageDraw.Draw(L), L)
    return f32(Image.alpha_composite(pil(im).convert('RGBA'), L).convert('RGB'))
def texto_sombra(im, fn, blur=14, forca=.55):
    L = Image.new('RGBA', (W, H)); fn(ImageDraw.Draw(L), L)
    sh = L.split()[3].filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * forca))
    b = pil(im).convert('RGBA'); b.paste((0, 0, 0, 255), (0, 6), sh)
    return f32(Image.alpha_composite(b, L).convert('RGB'))

def rotulo(im, t, ta, tb, txt, linha=True):          # mesmo estilo do "SEXTA · 22:58" do S03
    a = sm((t - ta) / 0.5) * (1 - sm((t - (tb - 0.4)) / 0.4))
    if a <= 0: return im
    def f(d, L):
        d.text((118, 880), txt, font=BEB(70), fill=CREME + (int(240 * a),))
        if linha: d.line([(120, 962), (120 + 300 * sm((t - ta - .1) / .8), 962)], fill=TERRA + (int(255 * a),), width=5)
    return texto_sombra(im, f)

# ---------- partículas ----------
random.seed(9)
FAG = [dict(x=random.uniform(0, W), y=random.uniform(0, H), r=random.uniform(1.0, 3.4), vx=random.uniform(-10, 10),
            vy=random.uniform(-70, -20), f=random.uniform(0, 6.3), a=random.uniform(.3, .9)) for _ in range(120)]
def particulas(t, cor, forca=1.0, sobe=True):
    L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L)
    for p in FAG:
        x = (p['x'] + p['vx'] * t + 10 * math.sin(t * .8 + p['f'])) % W
        y = (p['y'] + (p['vy'] if sobe else -p['vy'] * .15) * t) % H
        a = p['a'] * (.55 + .45 * math.sin(t * 2.1 + p['f']))
        d.ellipse([x - p['r'], y - p['r'], x + p['r'], y + p['r']], fill=int(255 * a * forca))
    m = f32(L.filter(ImageFilter.GaussianBlur(1.3)))[..., None] / 255.0
    return m * np.array(cor, np.float32)

# ---------- fundo das cartelas: a própria imagem desfocada (regra de Luiz, 11/11/2026) ----------
def fundo_foco(base, t, entra=None, sai=None, r=30, esc=0.5):
    # entra=(t0,t1): a imagem perde o foco; sai=(t0,t1): recupera o foco. Retorna (imagem, força 0..1)
    k = 1.0
    if entra: k = min(k, sm((t - entra[0]) / (entra[1] - entra[0])))
    if sai: k = min(k, 1 - sm((t - sai[0]) / (sai[1] - sai[0])))
    return desfoca(base, r * k) * (1 - esc * k), k

# ================= CENAS =================
SOFA_Q = 'S3-3-sofa-quadro.jpg'

# A · 1:06,68 — callback da conversa; "tranquila" grifada
BOLHAS = [('eu', 'Me passa a tua localização?'), ('ele', 'Pra quê?'), ('eu', 'Ué, pra eu ficar tranquila.')]
def c_conversa(t):
    bg = kb(foto(SOFA_Q), t, 66.68, 72.6, 1.10, 1.22, (.5, .45), (.52, .42))
    bg = desfoca(bg, 30) * 0.42
    a = sm((t - 66.68) / 0.35)
    f = INT(54); y0 = H / 2 - (3 * 176 - 62) / 2
    def d_(d, L):
        y = y0
        for q, txt in BOLHAS:
            bw = f.getlength(txt) + 88; bh = 114
            x = W / 2 + 520 - bw if q == 'eu' else W / 2 - 520
            cor = TERRA if q == 'eu' else (43, 46, 53)
            d.rounded_rectangle([x, y, x + bw, y + bh], 46, fill=cor + (int(240 * a),))
            d.text((x + 44, y + bh / 2 - 33), txt, font=f, fill=CREME + (int(255 * a),))
            if txt.startswith('Ué'):
                k = sm((t - 70.88) / 0.5)               # "tranquila" (1:10,88)
                if k > 0:
                    x1 = x + 44 + f.getlength('Ué, pra eu ficar ')
                    x2 = x1 + f.getlength('tranquila') * k
                    d.line([(x1, y + bh - 22), (x2, y + bh - 22)], fill=CREME + (int(255 * a),), width=6)
            y += 176
    return texto_sombra(bg, d_)

# B · janela (rack focus em "Mas quando é o nosso", 1:17,56)
def c_janela(t):
    s = 0.0 if t < 73.0 else (t - 73.0) * 0.72
    fr = qv('S6-1-janela.mp4', s)
    return f32(enquadra(fr, 1.04 + 0.05 * sm((t - 72.28) / 7), .5, .5))

# C · paletó
def c_paleto(t):
    fr = qv('S6-2-paleto.mp4', 0.5 + (t - 79.36) * 1.45)
    return f32(enquadra(fr, 1.03, .5, .5))

# D · pergunta
PERG = [('POR', 82.84), ('QUE', 83.08), ('O', 83.24), ('CIÚME', 83.32), ('VIVE', 83.72), ('ASSIM?', 84.04)]
def c_pergunta(t):
    im, kf = fundo_foco(c_mesa(t), t, None, (84.40, 84.90))
    f = BEB(150); esp = f.getlength(' ')
    tot = sum(f.getlength(w) for w, _ in PERG) + esp * (len(PERG) - 1); x = (W - tot) / 2
    def d_(d, L):
        nonlocal x
        for w, ta in PERG:
            k = sm((t - ta + 0.05) / 0.35) * kf
            if k > 0:
                cor = TERRA if w == 'CIÚME' else CREME
                d.text((x, H / 2 - 95 + 18 * (1 - k)), w, font=f, fill=cor + (int(255 * k),))
            x += f.getlength(w) + esp
    return texto_sombra(im, d_, 20, .6)

# E · mesa de bar (câmera na mão)
def c_mesa(t):
    k = sm((t - 82.36) / 5.4)
    jx = 0.004 * math.sin(t * 7.3) + 0.003 * math.sin(t * 13.1); jy = 0.004 * math.sin(t * 6.1 + 1)
    im = f32(enquadra(foto('S7-1-mesa-bar.jpg'), lerp(1.06, 1.16, k), .5 + jx, .48 + jy))
    return im * (1 + 0.05 * math.sin(t * 19) * (math.sin(t * 3) > .5))

# F · porta
def c_porta(t):
    im = kb(foto('S7-2-porta.jpg'), t, 87.72, 94.7, 1.05, 1.40, (.5, .5), (.42, .64))
    pis = 1 + 0.25 * (math.sin(t * 4.0) > 0.2) * sm((t - 88.9) / .3)      # a luz sob a porta se mexe
    band = np.exp(-((yy - H * .70) / 40.0) ** 2)[..., None] * np.exp(-((xx - W * .47) / 330.0) ** 2)[..., None]
    return im * (1 + band * (pis - 1))

# G · "A resposta começa na palavra" → linha do tempo
def c_palavra(t):
    im, kf = fundo_foco(c_porta(t), t, (90.60, 91.10))
    def d_(d, L):
        a = sm((t - 90.75) / .5) * kf; f = BEB(230)
        w = f.getlength('CIÚME'); x = W / 2 - w / 2 - 280 * sm((t - 93.0) / .9)
        d.text((x, H / 2 - 140), 'CIÚME', font=f, fill=CREME + (int(255 * a),))
        k = sm((t - 93.28) / 1.2)
        if k > 0:
            x0 = x + w + 40; x1 = x0 + (W - 120 - x0) * k
            d.line([(x0, H / 2 - 10), (x1, H / 2 - 10)], fill=TERRA + (255,), width=6)
            for i in range(3):
                px = x0 + (W - 120 - x0) * (0.2 + 0.32 * i)
                if px < x1: d.ellipse([px - 14, H / 2 - 24, px + 14, H / 2 + 4], fill=TERRA + (255,))
    return texto_sombra(im, d_, 20, .6)

def c_fosforo(t, s0, t0, vel=1.0):
    fr = qv('S7-3-fosforo.mp4', s0 + (t - t0) * vel)
    return f32(enquadra(fr, 1.04, .5, .5))
def c_supremo(t): return kb(foto('S7-4-supremo.jpg'), t, 96.2, 98.1, 1.08, 1.22, (.5, .5), (.47, .62))
def c_livro(t):
    im = kb(foto('S7-5-livro.jpg'), t, 98.0, 101.5, 1.04, 1.30, (.5, .55), (.68, .30))
    return im * (1 - 0.9 * sm((t - 101.0) / .7))

# J · currículo com "zeloso" escrito em 1:43,40
CUR = None
def curriculo_com_palavra(k):
    global CUR
    if CUR is None: CUR = Image.open(os.path.join(M, 'S2.1.png')).convert('RGB')
    if k <= 0: return CUR
    L = Image.new('RGBA', (700, 260)); d = ImageDraw.Draw(L)
    d.text((40, 30), 'zeloso', font=ITA(170), fill=(176, 70, 40, 235))
    m = Image.new('L', (700, 260), 0); ImageDraw.Draw(m).rectangle([0, 0, int(40 + 520 * k), 260], fill=255)
    L.putalpha(Image.fromarray(np.minimum(np.asarray(L.split()[3]), np.asarray(m))))
    L = L.rotate(9, resample=Image.BICUBIC, expand=True)
    out = CUR.copy(); out.paste(L, (1380 - L.size[0] // 2, 805 - L.size[1] // 2), L)
    return out
def c_curriculo(t):
    k = sm((t - 103.30) / 0.9)
    img = curriculo_com_palavra(round(k * 12) / 12)
    return kb(img, t, 101.84, 104.6, 1.15, 1.75, (.5, .52), (.5, .525))

def c_sindico(t): return kb(foto('S8-1-sindico.jpg'), t, 104.56, 106.8, 1.06, 1.22, (.55, .45), (.62, .40))
def c_enfermeira(t): return kb(foto('S8-2-enfermeira.jpg'), t, 106.68, 108.9, 1.06, 1.20, (.55, .45), (.62, .38))

# M · cartela de etimologia
def c_etimo(t):
    base = kb(foto('S8-3-maternidade.jpg'), t, 108.84, 116.04, 1.02, 1.05, (.5, .55), (.5, .55))
    im, kf = fundo_foco(base, t, None, (115.55, 116.05), r=34, esc=.55)
    def d_(d, L):
        top = (W / 2, 250); mid = (W * .30, 520); esq = (W * .22, 790); dir_ = (W * .78, 790)
        def linha(p, q, k):
            if k > 0: d.line([p, (lerp(p[0], q[0], k), lerp(p[1], q[1], k))], fill=TERRA + (int(255 * kf),), width=5)
        def palavra(p, txt, f, cor, ta, rot=None):
            a = sm((t - ta) / .45) * kf
            if a <= 0: return
            w = f.getlength(txt); asc, ds = f.getmetrics()
            d.text((p[0] - w / 2, p[1] - (asc + ds) / 2 + 14 * (1 - a)), txt, font=f, fill=cor + (int(255 * a),))
            if rot: d.text((p[0] - INT4(30).getlength(rot) / 2, p[1] + (asc + ds) / 2 + 2), rot, font=INT4(30), fill=(170, 160, 140, int(220 * a)))
        palavra(esq, 'CIÚME', BEB(170), CREME, 109.0)
        palavra(mid, 'zelumen', ITA(120), CREME, 110.55, 'latim')
        palavra(top, 'zelus', ITA(140), TERRA, 112.45, 'latim')
        linha((top[0] - 60, top[1] + 90), (mid[0] + 110, mid[1] - 70), sm((t - 112.8) / .6))
        linha((mid[0] - 30, mid[1] + 80), (esq[0] + 20, esq[1] - 95), sm((t - 113.2) / .5))
        linha((top[0] + 60, top[1] + 90), (dir_[0] - 40, dir_[1] - 95), sm((t - 114.0) / 1.0))
        palavra(dir_, 'ZELO', BEB(170), CREME, 115.1)
        a = sm((t - 112.6) / .6) * kf
        d.text((W - 640, H - 70), 'Fonte: Ciberdúvidas da Língua Portuguesa (Houaiss)', font=INT4(26), fill=(200, 190, 170, int(220 * a)))
    return texto_sombra(im, d_, 20, .6)

# N · maternidade com as plaquinhas
def c_maternidade(t, ta, tb, z0, z1, c0, c1, cart_t=0):
    im = kb(foto('S8-3-maternidade.jpg'), t, ta, tb, z0, z1, c0, c1)
    return im
MAT = None
def maternidade_rotulada():
    global MAT
    if MAT is None:
        img = foto('S8-3-maternidade.jpg').copy(); d = ImageDraw.Draw(img)
        for (x0, x1), w in [((700, 968), 'CIÚME'), ((2148, 2416), 'ZELO')]:
            f = BEB(150); tw = f.getlength(w)
            d.text(((x0 + x1) / 2 - tw / 2, 1100), w, font=f, fill=(40, 38, 40))
        MAT = img
    return MAT
def c_mat(t, ta, tb, z0, z1, c0, c1, rotulos_desde):
    img = maternidade_rotulada() if t >= rotulos_desde else foto('S8-3-maternidade.jpg')
    im = kb(img, t, ta, tb, z0, z1, c0, c1)
    if t >= rotulos_desde and t < rotulos_desde + 0.4:
        base = kb(foto('S8-3-maternidade.jpg'), t, ta, tb, z0, z1, c0, c1); k = sm((t - rotulos_desde) / .4)
        im = base * (1 - k) + im * k
    return im

# O · fio + ζῆλος
def grego(im, t, ta, tb, sub='zêlos · grego', y=200, extra=None, cx=W / 2):
    a = sm((t - ta) / .6) * (1 - sm((t - (tb - .4)) / .4))
    if a <= 0: return im
    def d_(d, L):
        f = GRE(150); w = f.getlength('ζῆλος')
        d.text((cx - w / 2, y), 'ζῆλος', font=f, fill=CREME + (int(250 * a),))
        g = INT4(32); d.text((cx - g.getlength(sub) / 2, y + 190), sub, font=g, fill=(225, 210, 180, int(220 * a)))
        if extra:
            txt, te = extra; b = sm((t - te) / .5) * a
            if b > 0:
                h = BEB(96); d.text((cx - h.getlength(txt) / 2, y + 260 + 14 * (1 - b)), txt, font=h, fill=TERRA + (int(255 * b),))
    return texto_sombra(im, d_, 22, .7)
def c_fio(t):
    fr = qv('S9-1-fio.mp4', (t - 119.92) * 0.95)
    return grego(f32(enquadra(fr, 1.04, .5, .5)), t, 122.6, 125.4)

def c_oficina(t):
    im = kb(foto('S9-2-oficina.jpg'), t, 125.24, 133.3, 1.04, 1.38, (.5, .5), (.38, .40))
    fogo = 1 + 0.05 * math.sin(t * 11) + 0.03 * math.sin(t * 23)
    lx = np.exp(-((xx - W * 0.05) / 900.0) ** 2)[..., None]
    im = im * (1 + (fogo - 1) * 2 * lx)
    return im + particulas(t, (255, 150, 60), .55)

def c_chama(t, ta, tb, z0, z1):
    s = 3.6 + 1.3 * cl((t - ta) / max(.1, tb - ta))
    fr = qv('S7-3-fosforo.mp4', s)
    k = sm((t - ta) / max(.1, tb - ta))
    return f32(enquadra(fr, lerp(z0, z1, k), .5, .42))

def c_festa(t, s0, ta, vel=1.0, z=1.03, c=(.5, .5)):
    fr = qv('S9-4-menina.mp4', s0 + (t - ta) * vel)
    return f32(enquadra(fr, z, c[0], c[1]))
def c_menina_dia(t):     # "no dia seguinte aparece com um cabo de vassoura no colo…" (vídeo do Runway, em câmera levemente lenta)
    fr = qv('S9-4-menina-vassoura.mp4', (t - 141.24) * 0.75)
    k = sm((t - 141.24) / 6.72)
    im = f32(enquadra(fr, lerp(1.03, 1.14, k), .5, lerp(.5, .42, k)))
    im = im + particulas(t, (255, 210, 150), .25, sobe=False)
    return rotulo(im, t, 141.5, 144.2, 'NO DIA SEGUINTE')

def c_vela(t):
    s = 0 if t < 158.2 else (t - 158.2)
    fr = qv('S10-1-vela.mp4', s)
    return f32(enquadra(fr, 1.04 + 0.06 * sm((t - 157.6) / 5.8), .5, .5))
def c_estojo(t):
    fr = qv('S10-2-estojo.mp4', 0.35 + (t - 167.80))
    return f32(enquadra(fr, 1.04, .5, .5))

def c_lisboa(t):
    im = kb(foto('S11-1-lisboa.jpg'), t, 175.0, 186.4, 1.04, 1.45, (.5, .55), (.74, .30))
    return rotulo(im, t, 175.24, 179.76, 'PORTUGAL · ZELOS = CIÚME')

# AA · verbete (Infopédia)
def c_verbete(t):
    base = kb(foto('S11-1-lisboa.jpg'), t, 175.0, 186.4, 1.04, 1.45, (.5, .55), (.74, .30))
    im, kf = fundo_foco(base, t, (179.76, 180.30), r=34, esc=.6)
    def d_(d, L):
        a = sm((t - 179.85) / .45)
        d.text((260, 200), 'ze·lo·so', font=PLA(130), fill=CREME + (int(255 * a),))
        d.text((260, 375), 'adjetivo', font=ITA(56), fill=(225, 210, 185, int(255 * a)))
        d.line([(260, 455), (1660, 455)], fill=(225, 210, 185, int(160 * a)), width=2)
        for i, (w, ta) in enumerate([('cuidadoso', 183.32), ('diligente', 184.28), ('ciumento', 185.44)]):
            k = sm((t - ta) / .4)
            if k <= 0: continue
            y = 520 + i * 120
            if w == 'ciumento':
                mk = sm((t - ta - .2) / .5)
                d.rectangle([330, y + 6, 330 + (INT(76).getlength('3. ciumento') + 30) * mk, y + 98], fill=TERRA + (int(210 * k),))
            d.text((350, y + 14 * (1 - k)), f'{i + 1}. {w}', font=INT(76), fill=CREME + (int(255 * k),))
        d.text((260, H - 90), 'Fonte: Infopédia, verbete "zeloso"', font=INT4(28), fill=(210, 200, 180, int(220 * a)))
    return texto_sombra(im, d_, 20, .6)

# AB · candidato manda o currículo
FRASE_EMAIL = 'Sou proativo, pontual e extremamente zeloso.'
def c_email(t):
    im = kb(foto('S11-2-candidato-email.jpg'), t, 186.4, 193.0, 1.04, 1.18, (.5, .5), (.62, .40))
    a = sm((t - 189.2) / .4)
    if a <= 0: return im
    n = int(len(FRASE_EMAIL) * cl((t - 189.48) / (192.6 - 189.48)))
    def d_(d, L):
        f = INT(46); txt = FRASE_EMAIL[:n]
        bw = f.getlength(FRASE_EMAIL) + 100; x = 110; y = 760
        d.rounded_rectangle([x, y, x + bw, y + 170], 22, fill=(255, 255, 255, int(235 * a)))
        d.text((x + 50, y + 22), 'Carta de apresentação', font=INT4(28), fill=(120, 120, 130, int(255 * a)))
        d.text((x + 50, y + 74), txt, font=f, fill=(30, 30, 36, int(255 * a)))
        if (t * 2) % 1 < .55 or n < len(FRASE_EMAIL):
            cx = x + 52 + f.getlength(txt); d.line([(cx, y + 78), (cx, y + 132)], fill=(30, 30, 36, int(255 * a)), width=3)
        if n == len(FRASE_EMAIL):
            k = sm((t - 192.3) / .4); x1 = x + 50 + f.getlength('Sou proativo, pontual e extremamente '); x2 = x1 + f.getlength('zeloso') * k
            d.line([(x1, y + 136), (x2, y + 136)], fill=TERRA + (255,), width=6)
    return texto_sombra(im, d_, 20, .5)

def c_recr(t, ta, tb, z0, z1, c0, c1): return kb(foto('S11-3-recrutador.jpg'), t, ta, tb, z0, z1, c0, c1)
def c_cand(t, ta, tb, z0, z1, c0, c1): return kb(foto('S11-4-candidato-entrevista.jpg'), t, ta, tb, z0, z1, c0, c1)

# AE · anotação na máquina de escrever (som da trilha em 3:33,00)
NOTA = [('Ótimo funcionário.', 213.08), ('Péssimo namorado.', 214.28), ('Contratar pra segurança.', 215.72)]
def c_nota(t):
    bg = desfoca(kb(foto('S11-3-recrutador.jpg'), t, 212.0, 217.0, 1.3, 1.4, (.5, .62), (.5, .64)), 26) * .55
    a = sm((t - 212.0) / .4)
    card = Image.new('RGBA', (1180, 560), (0, 0, 0, 0)); d = ImageDraw.Draw(card)
    d.rectangle([0, 0, 1180, 560], fill=PAPEL + (255,))
    for y in range(140, 560, 92): d.line([(40, y), (1140, y)], fill=(200, 185, 160, 255), width=2)
    d.text((60, 40), 'Candidato: brasileiro, "zeloso"', font=COU(38), fill=(110, 100, 90, 255))
    for i, (txt, ta) in enumerate(NOTA):
        n = int(len(txt) * cl((t - ta) / (0.055 * len(txt))))
        d.text((60, 160 + i * 110), txt[:n], font=COU(68), fill=GRAF + (255,) if i < 2 else (150, 60, 30, 255))
    card = card.rotate(-2.5, resample=Image.BICUBIC, expand=True)
    sh = card.split()[3].filter(ImageFilter.GaussianBlur(20))
    base = pil(bg).convert('RGBA'); x = (W - card.size[0]) // 2; y = (H - card.size[1]) // 2 + int(30 * (1 - a))
    base.paste((0, 0, 0, int(160 * a)), (x + 10, y + 20), sh.point(lambda v: int(v * .6 * a)))
    card.putalpha(card.split()[3].point(lambda v: int(v * a)))
    base.alpha_composite(card, (x, y))
    return f32(base.convert('RGB'))

def c_binoculo(t):
    im = kb(foto('A1-binoculo.jpg'), t, 216.9, 222.7, 1.04, 1.35, (.5, .45), (.47, .38))
    return rotulo(im, t, 218.4, 222.56, 'NO VÍDEO SOBRE INVEJA')
def c_linguista(t):
    im = kb(foto('S12-1-linguista.jpg'), t, 222.56, 250.7, 1.04, 1.55, (.5, .5), (.56, .36))
    return rotulo(im, t, 222.8, 228.12, 'CARL DARLING BUCK · LINGUISTA')

# AH–AJ · quadro INVEJA × CIÚME
def c_quadro(t):
    base = kb(foto('S12-1-linguista.jpg'), t, 222.56, 250.7, 1.04, 1.55, (.5, .5), (.56, .36))
    im, kf = fundo_foco(base, t, (228.12, 228.70), r=36, esc=.6)
    def d_(d, L):
        col = [W * .27, W * .73]
        def item(x, y, txt, f, cor, ta):
            a = sm((t - ta) / .4)
            if a > 0: d.text((x - f.getlength(txt) / 2, y + 12 * (1 - a)), txt, font=f, fill=cor + (int(255 * a),))
        a = sm((t - 228.1) / .5)
        d.line([(W / 2, 170), (W / 2, 900)], fill=(225, 210, 185, int(150 * a)), width=2)
        item(col[0], 170, 'INVEJA', BEB(150), CREME, 229.0)
        item(col[0], 380, 'olhar com maldade', ITA(80), (230, 220, 200), 232.25)
        item(col[0], 480, 'não amar', ITA(80), (230, 220, 200), 233.65)
        item(col[1], 170, 'CIÚME', BEB(150), TERRA, 235.75)
        item(col[1], 380, 'zelo', ITA(80), (230, 220, 200), 239.40)
        item(col[1], 480, 'emulação', ITA(80), (230, 220, 200), 239.85)
        item(col[1], 585, 'vontade de fazer igual a quem você admira', INT4(32), (190, 180, 160), 240.9)
        # nasceu de cara feia / de boa intenção
        for c, txt, ta, cor in [(0, 'NASCEU DE CARA FEIA', 244.9, CREME), (1, 'NASCEU DE BOA INTENÇÃO', 247.55, CREME)]:
            k = sm((t - ta) / .45)
            if k > 0:
                f = BEB(70); w = f.getlength(txt); x = col[c] - w / 2; y = 720
                d.rectangle([x - 24, y - 6, x - 24 + (w + 48) * sm((t - ta) / .6), y + 84], fill=(TERRA if c else (60, 62, 70)) + (int(235 * k),))
                d.text((x, y), txt, font=f, fill=cor + (int(255 * k),))
        d.text((W / 2 - INT4(26).getlength('Fonte: C. D. Buck, A Dictionary of Selected Synonyms in the Principal Indo-European Languages (1949), via Etymonline') / 2, H - 70),
               'Fonte: C. D. Buck, A Dictionary of Selected Synonyms in the Principal Indo-European Languages (1949), via Etymonline',
               font=INT4(26), fill=(210, 200, 180, int(220 * a)))
    return texto_sombra(im, d_, 20, .6)

def c_virtude(t): return kb(foto('S6-2-paleto-quadro.jpg'), t, 250.2, 252.9, 1.05, 1.22, (.5, .45), (.52, .35))
def c_flores(t):
    fr = qv('S12-2-flores.mp4', 0.4 + (t - 252.84) * 1.2)
    return f32(enquadra(fr, 1.04, .5, .5))

# ================= LINHA DO TEMPO =================
# (início, render, transição de entrada, duração da transição)
SHOTS = [
    (66.68, c_conversa, 'corte', 0),
    (72.28, c_janela, 'fade', .5),
    (79.36, c_paleto, 'corte', 0),
    (82.20, lambda t: c_paleto(t) * 0.25, 'fade', .12),
    (82.36, c_pergunta, 'corte', 0),
    (84.90, c_mesa, 'corte', 0),
    (87.72, c_porta, 'corte', 0),
    (90.60, c_palavra, 'corte', 0),
    (94.66, lambda t: rotulo(c_fosforo(t, 0.95, 94.66), t, 94.84, 96.2, '01 · UM FOGO ANTIGO'), 'corte', 0),
    (96.20, lambda t: rotulo(c_supremo(t), t, 96.3, 98.0, '02 · UM JULGAMENTO NO SUPREMO'), 'corte', 0),
    (98.00, lambda t: rotulo(c_livro(t), t, 98.1, 100.9, '03 · O CIUMENTO MAIS FAMOSO DO BRASIL'), 'corte', 0),
    (101.84, c_curriculo, 'fade', .4),
    (104.56, c_sindico, 'corte', 0),
    (106.68, c_enfermeira, 'corte', 0),
    (108.84, c_etimo, 'fade', .4),
    (116.04, lambda t: c_mat(t, 116.04, 119.9, 1.05, 1.25, (.5, .55), (.5, .62), 116.28), 'corte', 0),
    (119.92, c_fio, 'preto', .5),
    (125.24, c_oficina, 'fade', .5),
    (133.24, lambda t: c_chama(t, 133.24, 136.5, 1.1, 1.3), 'fade', .5),
    (136.48, lambda t: c_festa(t, 0.1, 136.48, 1.0), 'luz', .5),
    (141.24, c_menina_dia, 'luz', .6),
    (147.96, lambda t: grego(c_chama(t, 147.96, 151.5, 1.05, 1.35), t, 148.0, 157.9, y=330, cx=W * .22), 'fade', .4),
    (151.48, lambda t: grego(c_chama(t, 151.48, 157.6, 1.35, 1.45), t, 148.0, 157.9, y=330, cx=W * .22, extra=('TAMBÉM: CIÚME', 156.5)), 'corte', 0),
    (157.60, c_vela, 'fade', .6),
    (163.40, lambda t: c_festa(t, 0.4, 163.4, 0.5, 1.9, (.40, .62)), 'luz', .5),
    (167.80, c_estojo, 'fade', .5),
    (171.56, lambda t: c_mat(t, 171.56, 175.1, 1.25, 1.85, (.5, .6), (.5, .45), 0), 'fade', .4),
    (175.00, c_lisboa, 'fade', .4),
    (179.76, c_verbete, 'corte', 0),
    (186.40, c_email, 'fade', .35),
    (192.96, lambda t: c_recr(t, 192.96, 199.2, 1.04, 1.18, (.5, .45), (.5, .40)), 'corte', 0),
    (199.16, lambda t: c_recr(t, 199.16, 201.2, 1.75, 1.85, (.5, .33), (.5, .33)), 'corte', 0),
    (201.16, lambda t: c_cand(t, 201.16, 203.0, 1.55, 1.65, (.36, .30), (.36, .30)), 'corte', 0),
    (203.00, lambda t: c_recr(t, 203.0, 204.4, 1.85, 1.95, (.5, .33), (.5, .33)), 'corte', 0),
    (204.32, lambda t: c_cand(t, 204.32, 206.5, 1.05, 1.15, (.45, .5), (.42, .45)), 'corte', 0),
    (206.48, lambda t: c_cand(t, 206.48, 208.7, 1.6, 2.4, (.40, .55), (.40, .78)), 'corte', 0),
    (208.68, lambda t: c_recr(t, 208.68, 212.0, 1.9, 2.25, (.5, .33), (.5, .30)), 'corte', 0),
    (212.00, c_nota, 'fade', .3),
    (216.92, c_binoculo, 'preto', .6),
    (222.56, c_linguista, 'fade', .4),
    (228.12, c_quadro, 'corte', 0),
    (250.20, c_virtude, 'fade', .5),
    (252.84, c_flores, 'corte', 0),
]
ALIAS = {}
def quadro(t):
    i = max(j for j, s in enumerate(SHOTS) if s[0] <= t + 1e-6)
    ini, fn, tr, d = SHOTS[i]
    im = fn(t)
    if tr != 'corte' and d > 0 and i > 0 and t < ini + d:
        p = sm((t - ini) / d)
        ant = SHOTS[i - 1][1](t)
        if tr == 'fade': im = ant * (1 - p) + im * p
        elif tr == 'preto': im = ant * max(0, 1 - 2 * p) + im * max(0, 2 * p - 1)
        elif tr == 'luz':
            im = ant * (1 - p) + im * p
            im = im + np.array([255, 190, 120], np.float32) * 0.45 * math.sin(p * math.pi)
    cartela = False
    g = GRAO[int(t * FPS) % 6]
    im = im * (VIN if not cartela else (0.55 + 0.45 * VIN)) + (g * 0.5 if cartela else g)
    return im

if __name__ == '__main__':
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', SAIDA], stdin=subprocess.PIPE)
    for n in range(QI, min(QF, N)):
        p.stdin.write(np.clip(quadro(T0 + n / FPS), 0, 255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait(); print('ok', QI, QF)
