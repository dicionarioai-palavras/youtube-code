# Ciúme · S03–S05 (0:28,75 → 0:66,68 da narração final). Vídeo MUDO, 1920x1080, 30 fps.
# Uso: python3 s03_s05.py <pasta-imagens> <pasta-fontes> <saida.mp4> [quadro_ini quadro_fim]
# Tempos ancorados na transcrição do Premiere e nos sons que já existem na trilha ElevenLabs v2
# (mensagens 37,70 / 40,70 / 41,95; cliques do zoom 46,65 / 47,35 / 47,90; bar 51,50–57,50).
import sys, os, math, random, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

IMG, FON, SAIDA = sys.argv[1], sys.argv[2], sys.argv[3]
W, H, FPS = 1920, 1080, 30
T0, T1 = 28.75, 66.68
N = round((T1 - T0) * FPS)
QI, QF = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 5 else (0, N)

CREME = (251, 233, 194); TERRA = (196, 109, 69); NOITE = (21, 23, 28)
def cl(x): return max(0.0, min(1.0, x))
def sm(x): x = cl(x); return x * x * x * (x * (6 * x - 15) + 10)
def ss(x): x = cl(x); return x * x * (3 - 2 * x)
def lerp(a, b, k): return a + (b - a) * k
def f32(im): return np.asarray(im, dtype=np.float32)
def pil(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

bebas = lambda s: ImageFont.truetype(os.path.join(FON, 'BebasNeue.ttf'), s)
inter = lambda s, w='500': ImageFont.truetype(os.path.join(FON, f'Inter-{w}.ttf'), s)

def carrega(n):
    return Image.open(os.path.join(IMG, n)).convert('RGB')
PREDIO, QUADRA, BAR, CLOSE = (carrega(n) for n in ['S3-1-predio.png', 'S3-2-quadra.png', 'S4-1-bar.png', 'S5-1-close.png'])

def video(n):
    p = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', os.path.join(IMG, n), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                       capture_output=True, check=True).stdout
    a = np.frombuffer(p, np.uint8).reshape(-1, 720, 1280, 3)
    return a
SOFA, PALCO = video('S3-3-sofa.mp4'), video('S4-2-palco.mp4')
def quadro_video(v, s):        # s em segundos do vídeo (24 fps)
    i = int(round(cl(s / (len(v) / 24.0)) * (len(v) - 1)))
    return Image.fromarray(v[i])

def enquadra(img, z, cx, cy):
    iw, ih = img.size
    fw = iw / z; fh = fw * H / W
    if fh > ih: fh = ih / z; fw = fh * W / H
    cx = min(max(cx, fw / 2), iw - fw / 2); cy = min(max(cy, fh / 2), ih - fh / 2)
    return img.transform((W, H), Image.EXTENT, (cx - fw / 2, cy - fh / 2, cx + fw / 2, cy + fh / 2), Image.BICUBIC)

def desfoca(im, r):
    if r < 0.4: return im
    p = im.resize((W // 2, H // 2), Image.BILINEAR).filter(ImageFilter.GaussianBlur(r / 2))
    return p.resize((W, H), Image.BICUBIC)

def borrao_h(a, k):            # borrão horizontal (chicote)
    k = int(k)
    if k < 2: return a
    s = a[::2, ::2]
    c = np.cumsum(np.pad(s, ((0, 0), (k, k), (0, 0)), mode='edge'), axis=1)
    b = (c[:, 2 * k:] - c[:, :-2 * k]) / (2 * k)
    b = b[:, :s.shape[1]]
    return np.asarray(Image.fromarray(np.clip(b, 0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIN = np.clip(1.18 - 0.6 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2), 0.5, 1.0)[..., None]
rng = np.random.default_rng(11); GRAO = [rng.normal(0, 5.0, (H, W, 1)).astype(np.float32) for _ in range(6)]

# ---------- chuva (prédio e bar) ----------
random.seed(5)
GOTAS = [dict(x=random.uniform(-200, W + 200), y=random.uniform(0, H), v=random.uniform(1500, 2300),
              l=random.uniform(18, 46), a=random.uniform(40, 110)) for _ in range(260)]
def chuva(t, ang=0.18, forca=1.0):
    L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L)
    for g in GOTAS:
        y = (g['y'] + g['v'] * t) % (H + 100) - 50; x = g['x'] + ang * y
        d.line([(x, y), (x + ang * g['l'], y + g['l'])], fill=int(g['a'] * forca), width=1)
    return f32(L.filter(ImageFilter.GaussianBlur(0.7)))[..., None] / 255.0

# ---------- poeira/neblina ----------
random.seed(9)
POE = [dict(x=random.uniform(0, W), y=random.uniform(0, H), r=random.uniform(1.0, 3.2), vx=random.uniform(-8, 8),
            vy=random.uniform(-14, -3), f=random.uniform(0, 6.3), a=random.uniform(.2, .6)) for _ in range(110)]
def poeira(t):
    L = Image.new('L', (W, H), 0); d = ImageDraw.Draw(L)
    for p in POE:
        x = (p['x'] + p['vx'] * t + 8 * math.sin(t * .6 + p['f'])) % W; y = (p['y'] + p['vy'] * t) % H
        a = p['a'] * (.6 + .4 * math.sin(t * 1.4 + p['f']))
        d.ellipse([x - p['r'], y - p['r'], x + p['r'], y + p['r']], fill=int(255 * a))
    return f32(L.filter(ImageFilter.GaussianBlur(1.2)))[..., None] / 255.0
NEB = f32(Image.effect_noise((W // 8, H // 8), 60).filter(ImageFilter.GaussianBlur(6)).resize((W * 2, H), Image.BICUBIC)) / 255.0
def neblina(t, vel=40):
    o = int(t * vel) % W
    return NEB[:, o:o + W][..., None]

# ================= CENAS =================
T_CHICOTE, T_CASA, T_CHAT, T_MAPA, T_ALF = 31.80, 33.90, 37.70, 44.44, 44.56
CLIQUES = [46.65, 47.35, 47.90]
T_BAR, T_PALCO, T_CLOSE, T_IMAG, T_IMAG_FIM, T_APAGA, T_PERGUNTA = 48.40, 50.12, 52.80, 55.28, 57.20, 61.72, 63.84

def c_predio(t):
    k = sm((t - T0) / 3.6)
    im = f32(enquadra(PREDIO, 1.06 + 0.30 * k, lerp(1376, 1700, k), lerp(768, 420, k)))
    # poste piscando e reflexo da poça tremendo
    pisca = 1.0 - 0.10 * (math.sin(t * 37) > 0.93)
    im = im * pisca
    faixa = im[int(H * .70):].copy()
    desl = (6 * np.sin(np.arange(faixa.shape[0])[:, None] * 0.09 + t * 6.0)).astype(int)
    idx = (np.arange(W)[None, :] + desl) % W
    im[int(H * .70):] = faixa[np.arange(faixa.shape[0])[:, None], idx]
    im = im + (np.array([210, 225, 235], np.float32) - im) * chuva(t, 0.12, 0.9) * 0.55
    # legenda de tempo
    a = sm((t - 29.30) / 0.6) * (1 - sm((t - 31.25) / 0.45))
    if a > 0:
        L = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(L)
        d.text((118, 878), 'SEXTA · 22:58', font=bebas(78), fill=CREME + (int(235 * a),))
        d.line([(120, 966), (120 + 300 * sm((t - 29.4) / 0.8), 966)], fill=TERRA + (int(255 * a),), width=5)
        im = f32(Image.alpha_composite(pil(im).convert('RGBA'), L).convert('RGB'))
    return im

def c_quadra(t):
    k = sm((t - T_CHICOTE) / 2.4)
    im = f32(enquadra(QUADRA, 1.08 + 0.12 * k, lerp(1300, 1376, k), lerp(820, 760, k)))
    flick = 1 + 0.06 * math.sin(t * 50) * (math.sin(t * 7) > 0.6)
    im = im * flick + neblina(t, 90) * 38
    return im

def c_sofa(t):
    v = t - T_CASA + 0.9
    fr = quadro_video(SOFA, min(v, 4.7))
    k = sm((t - T_CASA) / 3.8)
    im = enquadra(fr, 1.0 + 0.06 * k, 640, 360)
    return f32(im)

# --- conversa (estilo neutro, sem marca de app) ---
F_BOLHA, F_HORA = inter(54), inter(28, '400')
BOLHAS = [('eu', 'Me passa a tua localização?', 37.70), ('ele', 'Pra quê?', 40.70), ('eu', 'Ué, pra eu ficar tranquila.', 41.95)]
DIGITANDO = (38.90, 40.62)
def caixa(txt):
    w = F_BOLHA.getlength(txt); return int(w + 2 * 44), 114
def layout(t):
    itens = [(q, txt, ta) for q, txt, ta in BOLHAS if t >= ta]
    if DIGITANDO[0] <= t < DIGITANDO[1]: itens.append(('dig', '', DIGITANDO[0]))
    alt = [114 + 62 for _ in itens]
    tot = sum(alt) - 28
    y = H / 2 - tot / 2; pos = {}
    for (q, txt, ta), h in zip(itens, alt): pos[(q, ta)] = y; y += h
    return pos
MUDANCAS = sorted([b[2] for b in BOLHAS] + list(DIGITANDO))
def c_chat(t):
    base = quadro_video(SOFA, 4.7)
    kb = sm((t - (T_CHAT - 0.3)) / 0.7)
    k = sm((t - T_CASA) / 3.8)
    bg = enquadra(base, 1.06 + 0.10 * sm((t - T_CHAT) / 6.7), 700, 330)
    bg = desfoca(bg, 30 * kb)
    im = f32(bg) * (1 - 0.55 * kb)
    if t < T_CHAT - 0.05: return im
    # posições com deslize suave entre layouts
    ult = max([m for m in MUDANCAS if m <= t] + [T_CHAT])
    ant = layout(ult - 0.001); atu = layout(t); kk = sm((t - ult) / 0.38)
    saida = sm((t - (T_MAPA - 0.42)) / 0.3)          # bolhas sobem e somem antes do mapa
    L = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(L)
    col_x0, col_x1 = W / 2 - 520, W / 2 + 520
    for (q, ta), y in atu.items():
        y0 = ant.get((q, ta), y + 40); y = lerp(y0, y, kk) - 160 * saida
        e = sm((t - ta) / 0.42)                       # entrada fluida
        a = e * (1 - saida)
        if a <= 0: continue
        y += 26 * (1 - e)
        if q == 'dig':
            bw, bh = 150, 84; x = col_x0
            d.rounded_rectangle([x, y, x + bw, y + bh], 40, fill=(43, 46, 53, int(235 * a)))
            for i in range(3):
                pulo = 8 * max(0, math.sin((t * 6) - i * 0.8))
                d.ellipse([x + 38 + i * 30 - 9, y + bh / 2 - 9 - pulo, x + 38 + i * 30 + 9, y + bh / 2 + 9 - pulo], fill=CREME + (int(200 * a),))
            continue
        txt = [b[1] for b in BOLHAS if b[0] == q and b[2] == ta][0]
        bw, bh = caixa(txt)
        if q == 'eu':
            x = col_x1 - bw; cor = TERRA
        else:
            x = col_x0; cor = (43, 46, 53)
        esc = 0.92 + 0.08 * e
        cx, cy = x + bw / 2, y + bh / 2
        bw2, bh2 = bw * esc, bh * esc
        d.rounded_rectangle([cx - bw2 / 2, cy - bh2 / 2, cx + bw2 / 2, cy + bh2 / 2], 46, fill=cor + (int(240 * a),))
        d.text((cx - bw2 / 2 + 44 * esc, cy - 33 * esc), txt, font=F_BOLHA, fill=CREME + (int(255 * a),))
        hora = '22:58' if q == 'eu' and ta < 41 else '22:59'
        hx = x + bw - F_HORA.getlength(hora) - 8 if q == 'eu' else x + 8
        d.text((hx, y + bh + 10), hora, font=F_HORA, fill=(200, 190, 170, int(170 * a)))
    sombra = L.split()[3].filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * .45))
    base_rgba = pil(im).convert('RGBA')
    base_rgba.paste((0, 0, 0, 255), (0, 12), sombra)
    return f32(Image.alpha_composite(base_rgba, L).convert('RGB'))

# --- mapa estilizado (sem marca de app) ---
random.seed(21)
RUAS, AVS = [], []
def rua(fixo, horiz, passo=380, amp=38):
    pts = []
    for j in range(-18, 19):
        u = j * passo; v = fixo + random.uniform(-amp, amp)
        pts.append((u, v) if horiz else (v, u))
    return pts
for i in range(-46, 47):
    RUAS.append(rua(i * 140 + random.uniform(-25, 25), True))
    RUAS.append(rua(i * 140 + random.uniform(-25, 25), False))
for _ in range(60):   # ruelas diagonais curtas
    c = (random.uniform(-5000, 5000), random.uniform(-4000, 4000)); a = random.uniform(0, math.pi); L = random.uniform(300, 900)
    RUAS.append([(c[0] - L * math.cos(a), c[1] - L * math.sin(a)), (c[0] + L * math.cos(a), c[1] + L * math.sin(a))])
for _ in range(7):
    a = random.uniform(0, math.pi); c = (random.uniform(-2500, 2500), random.uniform(-2500, 2500))
    AVS.append([(c[0] + k * 700 * math.cos(a) + 60 * math.sin(k), c[1] + k * 700 * math.sin(a) + 60 * math.cos(k * 1.3)) for k in range(-11, 12)])
PARQUES = []
for _ in range(16):
    c = (random.uniform(-5000, 5000), random.uniform(-3500, 3500)); r = random.uniform(160, 420)
    PARQUES.append([(c[0] + r * (1 + .25 * math.sin(3 * q + c[0])) * math.cos(q), c[1] + r * .75 * (1 + .2 * math.cos(2 * q)) * math.sin(q)) for q in np.linspace(0, 2 * math.pi, 24)])
PARQUES = [pq for pq in PARQUES if math.dist(np.mean(pq, axis=0), (34, -20)) > 1100]
RIO = [(-7000 + i * 140, 1350 + 260 * math.sin(i * 0.18) + 90 * math.sin(i * 0.55)) for i in range(101)]
PIN_MUNDO = (34, -20)

def zoom_mapa(t):
    z = 0.42
    for c in CLIQUES: z *= 1 + 1.15 * sm((t - c) / 0.24)
    z *= 1 + 2.6 * (sm((t - 48.10) / 0.5) ** 1.6)     # mergulho final rumo ao bar
    return z
def desenha_mapa(t, z, pino_a=1.0, queda=1.0, pulso=None, sc=2):
    w, h = W * sc, H * sc
    im = Image.new('RGB', (w, h), (19, 21, 26)); d = ImageDraw.Draw(im)
    cx, cy = PIN_MUNDO
    def P(p): return ((p[0] - cx) * z * sc + w / 2, (p[1] - cy) * z * sc + h / 2)
    for pq in PARQUES: d.polygon([P(p) for p in pq], fill=(30, 44, 35))
    d.line([P(p) for p in RIO], fill=(28, 42, 60), width=max(3, int(110 * z * sc)))
    for r in RUAS: d.line([P(p) for p in r], fill=(46, 50, 60), width=max(1, int(10 * z * sc)))
    for a in AVS: d.line([P(p) for p in a], fill=(84, 72, 62), width=max(2, int(26 * z * sc)))
    im = im.resize((W, H), Image.LANCZOS)
    # alfinete (tamanho fixo na tela)
    L = Image.new('RGBA', (W, H)); dd = ImageDraw.Draw(L)
    px, py = W / 2, H / 2
    if pulso is not None:
        for k in pulso:
            r = 30 + 170 * k; dd.ellipse([px - r, py - r * .5, px + r, py + r * .5], outline=TERRA + (int(200 * (1 - k)),), width=4)
    if pino_a > 0:
        q = 1 - queda
        bounce = abs(math.sin(queda * math.pi * 1.5)) * (1 - queda) * 40
        yoff = -420 * (q ** 2) - bounce
        dd.ellipse([px - 26, py - 10, px + 26, py + 10], fill=(0, 0, 0, int(120 * pino_a * queda)))
        topo = py - 110 + yoff
        dd.ellipse([px - 46, topo - 46, px + 46, topo + 46], fill=TERRA + (int(255 * pino_a),))
        dd.polygon([(px - 40, topo + 22), (px + 40, topo + 22), (px, py + yoff)], fill=TERRA + (int(255 * pino_a),))
        dd.ellipse([px - 17, topo - 17, px + 17, topo + 17], fill=CREME + (int(255 * pino_a),))
    im = Image.alpha_composite(im.convert('RGBA'), L).convert('RGB')
    return f32(im)
def c_mapa(t):
    z = zoom_mapa(t)
    queda = sm((t - T_ALF) / 0.5) if t >= T_ALF else 0.0
    an = [cl((t - T_ALF - 0.45 - i * 0.25) / 0.9) for i in range(2)] if t > T_ALF + 0.45 else None
    an = [k for k in an if 0 < k < 1] if an else None
    m = desenha_mapa(t, z, pino_a=1.0 if t >= T_ALF else 0.0, queda=queda, pulso=an)
    fade = sm((t - (T_MAPA - 0.18)) / 0.3)
    return m * fade

def c_bar(t):
    k = sm((t - (T_BAR - 0.25)) / 2.0)
    z = 1.9 - 0.75 * k      # entra de perto (fim do mergulho) e abre
    im = f32(enquadra(BAR, z, lerp(1360, 1376, k), lerp(560, 700, k)))
    # neon do violão piscando
    nx, ny = 1382, 505
    cxs = (nx - 1376) * (W / (2752 / z)) + W / 2; cys = (ny - lerp(560, 700, k)) * (W / (2752 / z)) + H / 2
    neon = 1 + 0.35 * (0.5 + 0.5 * math.sin(t * 23)) * (math.sin(t * 5.3) > -0.3)
    g = np.exp(-(((xx - cxs) / (260 * z / 1.3)) ** 2 + ((yy - cys) / (170 * z / 1.3)) ** 2))[..., None]
    im = im + np.array([255, 90, 50], np.float32) * g * 0.22 * neon
    im = im + (np.array([200, 210, 225], np.float32) - im) * chuva(t, 0.22, 0.8) * 0.5
    return im

def c_palco(t, s=None):
    s = (t - T_PALCO) * 0.96 if s is None else s
    fr = quadro_video(PALCO, s)
    k = sm((t - T_PALCO) / 2.7)
    im = f32(enquadra(fr, 1.03 + 0.05 * k, 640, 360))
    im = im + neblina(t, 25) * 30 + poeira(t) * np.array([255, 200, 140], np.float32) * 0.35
    return im

def c_close(t):
    k = sm((t - T_CLOSE) / (T_APAGA + 1.2 - T_CLOSE))
    im = f32(enquadra(CLOSE, 1.04 + 0.42 * k, lerp(1376, 1376, k), lerp(768, 640, k)))
    # "cuidado ou fiscalização": a faixa de luz da persiana sobe e desce sobre os olhos
    osc = sm((t - 57.28) / 0.6) * (1 - sm((t - 61.2) / 0.6))
    if osc > 0:
        fase = math.sin((t - 57.28) * 2 * math.pi / 1.6)          # ida e volta
        desloc = 120 * fase
        sombra = 1 - 0.45 * osc
        band = np.exp(-((yy - (H * 0.46 + desloc)) / 70.0) ** 2)[..., None]
        quente = 0.5 + 0.5 * fase
        cor = np.array([255, 170, 110], np.float32) * quente + np.array([140, 180, 255], np.float32) * (1 - quente)
        im = im * sombra + (cor - im * sombra) * band * 0.38 * osc
    # "Às vezes nem ela": a tela apaga
    ap = sm((t - T_APAGA) / 1.25)
    im = im * (1 - 0.94 * ap)
    return im

def c_final(t):
    an = [((t - T_PERGUNTA) / 1.4 + i / 2) % 1 for i in range(2)]
    m = desenha_mapa(t, 0.9 + 0.02 * sm((t - T_PERGUNTA) / 2.8), pulso=an)
    m = m * sm((t - T_PERGUNTA) / 0.5)
    a = sm((t - (T_PERGUNTA + 0.15)) / 0.6)
    if a > 0:
        L = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(L)
        txt = 'E VOCÊ, PASSARIA A LOCALIZAÇÃO?'; f = bebas(92)
        d.text(((W - f.getlength(txt)) / 2, H / 2 + 120 + 16 * (1 - a)), txt, font=f, fill=CREME + (int(255 * a),))
        m = f32(Image.alpha_composite(pil(m).convert('RGBA'), L).convert('RGB'))
    return m

# ================= LINHA DO TEMPO =================
def quadro(t):
    foto = True
    if t < T_CHICOTE - 0.15:
        im = c_predio(t)
    elif t < T_CHICOTE + 0.15:                            # chicote prédio → quadra
        p = sm((t - (T_CHICOTE - 0.15)) / 0.3)
        a, b = c_predio(t), c_quadra(t)
        sh = int(p * W)
        im = np.concatenate([a[:, sh:], b[:, :sh]], axis=1) if sh > 0 else a
        im = borrao_h(im, 140 * math.sin(p * math.pi) + 1)
    elif t < T_CASA - 0.2:
        im = c_quadra(t)
    elif t < T_CASA + 0.25:                               # refletor estoura → abajur
        p = sm((t - (T_CASA - 0.2)) / 0.45)
        im = c_quadra(t) * (1 - p) + c_sofa(t) * p
        im = im + 255 * 0.35 * math.sin(p * math.pi)
    elif t < T_CHAT - 0.3:
        im = c_sofa(t)
    elif t < T_MAPA - 0.18:
        im = c_chat(t)
    elif t < T_MAPA + 0.12:
        p = sm((t - (T_MAPA - 0.18)) / 0.3)
        im = c_chat(t) * (1 - p) + c_mapa(t) * p; foto = False
    elif t < T_BAR - 0.25:
        im = c_mapa(t); foto = False
    elif t < T_BAR + 0.2:                                 # mergulho do mapa para a fachada
        p = sm((t - (T_BAR - 0.25)) / 0.45)
        a = f32(desfoca(pil(c_mapa(t)), 14 * p)); b = f32(desfoca(pil(c_bar(t)), 14 * (1 - p)))
        im = a * (1 - p) + b * p
    elif t < T_PALCO - 0.12:
        im = c_bar(t)
    elif t < T_PALCO + 0.2:                               # vazamento de luz quente
        p = sm((t - (T_PALCO - 0.12)) / 0.32)
        im = c_bar(t) * (1 - p) + c_palco(t) * p
        im = im + np.array([255, 170, 90], np.float32) * 0.55 * math.sin(p * math.pi) * np.exp(-((xx - W * .7) / 700) ** 2)[..., None]
    elif t < T_CLOSE:
        im = c_palco(t)
    elif t < T_PERGUNTA - 0.2:
        im = c_close(t)
        # "quem é que tá cantando": o palco aparece por dentro dela (dupla exposição fria)
        de = sm((t - (T_IMAG - 0.1)) / 0.45) * (1 - sm((t - T_IMAG_FIM) / 0.45))
        if de > 0:
            p = c_palco(t, s=2.6 + (t - T_IMAG) * 0.9)
            fria = p * np.array([0.55, 0.75, 1.15], np.float32)
            im = 255 - (255 - im) * (255 - fria * de * 0.85) / 255
    elif t < T_PERGUNTA:
        im = c_close(t)
    else:
        im = c_final(t); foto = False
    g = GRAO[int(t * FPS) % 6]
    im = im * VIN + (g if foto else g * 0.5)
    return im

if __name__ == '__main__':
    if len(sys.argv) > 6 and sys.argv[6] == 'png':
        for n in range(QI, QF):
            pil(quadro(T0 + n / FPS)).save(SAIDA.replace('.png', f'-{n:04d}.png'))
        sys.exit()
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', SAIDA], stdin=subprocess.PIPE)
    for n in range(QI, min(QF, N)):
        p.stdin.write(np.clip(quadro(T0 + n / FPS), 0, 255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait(); print('ok', QI, QF)
