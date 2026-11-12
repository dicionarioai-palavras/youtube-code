# MATRIZ DE CAPAS DO PERFIL LUIZ: todas as técnicas das referências em todos os vídeos (pedido do Luiz, 20/10/2026:
# "use tudo que gerou de exemplo, tudo de tudo, quero ter várias referências").
# As técnicas estão em capas_luiz_refs.py (uma por referência artística); aqui elas rodam em cada vídeo com enquadramento
# automático pela máscara da pessoa. Não sobrescreve capas que já existem na pasta de saída (as ajustadas à mão ficam).
# Uso: python capas_luiz_matriz.py <pasta-saida> <pasta-com-quadros 4K *.jpg>
import os, sys
import capas_luiz_refs as R
from PIL import Image, ImageDraw, ImageEnhance, ImageOps, ImageChops, ImageFilter
import numpy as np, random

# altura da cabeça como fração da altura do quadro (estimada nos quadros; o boné engana a medida automática)
CABECA = {'aq': .16, 'ca': .10, 'de': .10, 'ue': .10, 'bs': .11, 'bs_96': .13, 'bf_10.8': .20, 'bf_6.8': .15, 'bf_7.2': .15}
def hh(nome, q): return q['im'].height * CABECA.get(nome, CABECA.get(nome.split('_')[0], .11))
def caixa_rosto(nome, q):
    h = hh(nome, q); return R.corte(q['im'], q['cx'], q['top'] + h * .9, min(q['im'].height, h * 3.4))
def caixa_media(nome, q):
    h = hh(nome, q); return R.corte(q['im'], q['cx'], q['top'] + h * 2.6, min(q['im'].height, h * 7.5))

def c_cinema(nome, q):
    c = q['im'].crop(caixa_media(nome, q)).resize((R.W, R.H), Image.LANCZOS)
    a = np.asarray(ImageEnhance.Color(c).enhance(1.55)).astype(float) / 255; lum = a.mean(2, keepdims=True)
    a = a + (1 - lum) * np.array([-.06, .02, .10]) * 1.4 + lum * np.array([.08, .03, -.06])
    return R.grao(R.vinheta(ImageEnhance.Contrast(Image.fromarray((a.clip(0, 1) * 255).astype('uint8'))).enhance(1.15), .45), 6)

def e_silhueta(nome, q):
    box = caixa_media(nome, q); c = q['im'].crop(box).resize((R.W, R.H), Image.LANCZOS)
    al = q['a'].crop(box).resize((R.W, R.H)).point(lambda v: 255 if v > 120 else 0)
    b = Image.new('RGB', (R.W, R.H), R.C['petroleo']); ImageDraw.Draw(b).rectangle((560, 0, R.W, R.H), fill=R.C['vermelho']); b = R.grao(b, 8)
    b = Image.composite(Image.new('RGB', (R.W, R.H), R.C['laranja']), b, ImageChops.offset(al, 34, 26))
    return Image.composite(ImageEnhance.Contrast(ImageOps.grayscale(c)).enhance(1.4).convert('RGB'), b, al)

def f_silhueta_janela(nome, q):
    box = caixa_media(nome, q); c = ImageOps.grayscale(q['im'].crop(box).resize((R.W, R.H), Image.LANCZOS))
    al = q['a'].crop(box).resize((R.W, R.H)); c = c.point(lambda v: min(255, int(v * 1.7 + 30)))
    return R.grao(Image.composite(Image.new('L', (R.W, R.H), 8), c, al.filter(ImageFilter.GaussianBlur(2))).convert('RGB'), 16)

def b_sepia(nome, q):
    c = q['im'].crop(caixa_rosto(nome, q)).resize((R.W, R.H), Image.LANCZOS)
    c = R.duotone(ImageEnhance.Contrast(c).enhance(1.25), (24, 16, 10), (236, 222, 200), (128, 104, 82))
    return R.grao(R.vinheta(c, .7, .55, .4), 12)

def b_retrato(nome, q):
    box = caixa_rosto(nome, q); c = q['im'].crop(box).resize((R.W, R.H), Image.LANCZOS)
    al = q['a'].crop(box).resize((R.W, R.H)).filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(10))
    rosto = ImageEnhance.Contrast(Image.blend(R.duotone(c, (20, 12, 8), (246, 226, 200), (140, 92, 62)), c, .35)).enhance(1.2)
    b = Image.composite(rosto, Image.new('RGB', (R.W, R.H), (40, 22, 24)), al)
    g = np.linspace(1.08, .55, R.W)[None, :, None]
    return R.grao(R.vinheta(Image.fromarray((np.asarray(b).astype(float) * g).clip(0, 255).astype('uint8')), .5), 9)

def e_trama(na, qa, nb, qb):
    A = R.duotone(ImageEnhance.Contrast(ImageOps.grayscale(qa['im'].crop(caixa_rosto(na, qa)).resize((R.W, R.H), Image.LANCZOS))).enhance(1.25), (22, 20, 18), (232, 226, 214))
    B = ImageEnhance.Color(ImageEnhance.Contrast(qb['im'].crop(caixa_rosto(nb, qb)).resize((R.W, R.H), Image.LANCZOS)).enhance(1.15)).enhance(1.3)
    n = 6; t = R.W // n; m = Image.new('L', (R.W, R.H), 0); d = ImageDraw.Draw(m)
    for i in range(n):
        for j in range(R.H // t + 1):
            if (i + j) % 2 == 0: d.rectangle((i * t, j * t, i * t + t, j * t + t), fill=255)
    b = Image.composite(A, B, m); d = ImageDraw.Draw(b)
    for i in range(1, n): d.line((i * t, 0, i * t, R.H), fill=(10, 10, 10), width=3)
    for j in range(1, R.H // t + 1): d.line((0, j * t, R.W, j * t), fill=(10, 10, 10), width=3)
    return R.grao(b, 7)

def e_contorno(nome, q):
    from skimage import measure
    box = caixa_media(nome, q); W, H = R.W, R.H
    c = ImageEnhance.Contrast(ImageOps.grayscale(q['im'].crop(box).resize((W, H), Image.LANCZOS))).enhance(1.2).convert('RGB')
    ma = np.asarray(q['a'].crop(box).resize((W // 2, H // 2))) / 255.0; r = random.Random(3); d = ImageDraw.Draw(c)
    for cont in sorted(measure.find_contours(np.pad(ma, 1), .5), key=len, reverse=True)[:1]:
        seg, segs = [], []
        for y, x in (cont - 1)[::max(1, len(cont) // 260)]:
            if x < 3 or y < 3 or x > W // 2 - 4 or y > H // 2 - 4:
                if len(seg) > 3: segs.append(seg)
                seg = []
            else: seg.append((x * 2, y * 2))
        if len(seg) > 3: segs.append(seg)
        for wd, dx in [(7, 0), (3, 7)]:
            for s in segs: d.line([(x + r.uniform(-5, 5) + dx, y + r.uniform(-5, 5) - dx) for x, y in s], fill=R.C['vermelho'], width=wd, joint='curve')
    return c

def e_colagem(nr, qr, maos, fita):
    W, H = R.W, R.H; b = R.grao(Image.new('RGB', (W, H), (26, 24, 24)), 8)
    def frag(im, box, tam, pos, rot, pb=True):
        c = im.crop(box); c = c.resize((tam[0], int(tam[0] * c.height / c.width)))
        y0 = max(0, (c.height - tam[1]) // 2); c = c.crop((0, y0, tam[0], y0 + tam[1]))
        if pb: c = ImageEnhance.Contrast(ImageOps.grayscale(c)).enhance(1.3).convert('RGB')
        c = c.convert('RGBA').rotate(rot, expand=True, resample=Image.BICUBIC); b.paste(c, pos, c)
    h = hh(nr, qr); im = qr['im']; cx, top = qr['cx'], qr['top']
    ImageDraw.Draw(b).rectangle((620, 0, 668, H), fill=R.C['vermelho'])
    frag(im, (int(cx - h * .9), int(top + h * .3), int(cx + h * .9), int(top + h * .8)), (620, 330), (60, 160), 2)
    rosa = Image.new('RGBA', (520, 420), (196, 58, 74, 255)).rotate(-3, expand=True); b.paste(rosa, (470, 470), rosa)
    frag(im, (int(cx - h * .7), int(top + h * .65), int(cx + h * .7), int(top + h * 1.15)), (560, 380), (90, 560), -2, pb=False)
    qm, fx, fy, fh = maos; frag(qm['im'], R.corte_frac(qm['im'], fx, fy, fh * .55), (640, 520), (360, 1000), 3)
    frag(im, R.corte(im, cx, top + h * 2.6, h * 2.6), (420, 560), (50, 1080), -4)
    html = (f'<div class="abs" style="left:120px;top:1560px;padding:16px 28px;background:#E9E2D2;transform:rotate(-3deg);'
            f'box-shadow:0 6px 12px rgba(0,0,0,.4);font:500 40px/1 Inter;letter-spacing:6px;color:#A3221C">{fita}</div>')
    return R.com_texto(b, html)

# papéis de quadro por vídeo, mãos (quadro, x, y, altura em frações), texto da placa (A) e da fita (E3)
VIDEOS = {
  'aquecendo-a-voz-pb': dict(rosto='aq_47', corpo='aq_41', alt='aq_38', perfil='aq_44', maos=('aq_38', .17, .8, .45), placa=('BASTIDOR', 'Nº 01', 'AQUECENDO'), fita='ANTES DE GRAVAR, EU…'),
  'cantando-sem-audio-pb': dict(rosto='ca_8', corpo='ca_8', alt='ca_5', perfil='ca_5', maos=('ca_11', .62, .72, .35), placa=('BASTIDOR', 'Nº 02', 'SEM SOM'), fita='O ESTÚDIO VIROU…'),
  'aqui-e-bastidor': dict(rosto='bs_100', corpo='bs_98', alt='bs_102', perfil='bs_96', maos=('bs_102', .45, .62, .4), placa=('BASTIDOR', 'Nº 03', 'CORTA!'), fita='EU E ESSA CÂMERA…'),
  'nao-conhecia-anafora': dict(rosto='aq_38', corpo='aq_41', alt='aq_47', perfil='ue_48', maos=('ue_32', .42, .55, .62), placa=('BASTIDOR', 'Nº 04', 'ESCRITOR?'), fita='TINHA NOME?'),
  'desejo-mesquinho': dict(rosto='de_43', corpo='de_41', alt='de_38', perfil='de_38', maos=('de_35', .35, .6, .45), placa=('BASTIDOR', 'Nº 05', 'FLAGRA'), fita='TOMARA QUE O DELE…'),
  'botao-da-foto-pb': dict(rosto='bf_6.8', corpo='bf_7.2', alt='bf_10.8', perfil='bf_7.2', maos=('bf_10.8', .35, .68, .35), placa=('BASTIDOR', 'Nº 06', '10 MINUTOS'), fita='GRAVEI 10 MINUTOS E…'),
  'montagem-bastidores-inveja': dict(rosto='bf_10.8', corpo='ca_11', alt='bs_100', perfil='bs_96', maos=('ue_46', .45, .7, .45), placa=('BASTIDOR', 'Nº 07', '1º VÍDEO'), fita='EU ACHEI QUE SABIA…'),
}
TECNICAS = [
  ('ref-a-estudio-placa', lambda v, Q: R.a_estudio_placa(Q(v['corpo']), v['placa'])),
  ('ref-d-escala-buraco', lambda v, Q: R.d_buraco(Q(v['corpo']))),
  ('ref-c-cinema', lambda v, Q: c_cinema(v['rosto'], Q(v['rosto']))),
  ('ref-e-silhueta-recortada', lambda v, Q: e_silhueta(v['perfil'], Q(v['perfil']))),
  ('ref-f-silhueta-janela', lambda v, Q: f_silhueta_janela(v['perfil'], Q(v['perfil']))),
  ('ref-f-detalhe-maos', lambda v, Q: R.f_maos(Q(v['maos'][0]), *v['maos'][1:])),
  ('ref-e-colagem-fita', lambda v, Q: e_colagem(v['rosto'], Q(v['rosto']), (Q(v['maos'][0]),) + v['maos'][1:], v['fita'])),
  ('ref-b-sepia-mao', lambda v, Q: b_sepia(v['alt'], Q(v['alt']))),
  ('ref-e-trama', lambda v, Q: e_trama(v['rosto'], Q(v['rosto']), v['alt'], Q(v['alt']))),
  ('ref-e-contorno', lambda v, Q: e_contorno(v['rosto'], Q(v['rosto']))),
  ('ref-b-retrato-direto', lambda v, Q: b_retrato(v['rosto'], Q(v['rosto']))),
]

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for peca, v in VIDEOS.items():
        for nome, fn in TECNICAS:
            arq = f'{out}/{peca}__capa-luiz-{nome}.png'
            if os.path.exists(arq): continue
            fn(v, R.quadro).save(arq); print('ok', peca, nome, flush=True)
