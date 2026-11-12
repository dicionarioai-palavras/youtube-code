# Capas verticais (1080x1920) dos cortes Palavras de Inveja — rodada 2 (01/11/2026): mesma-dor-dois-caminhos, tô-com-inveja, calculadora-do-almoço.
# Mesmos 4 estilos e funções da rodada 31/10 (capas_cortes_inveja.py); quadros do vídeo exportado em 01/11 (inveja-final-novos-audios.mp4).
# 4 estilos por corte: M (Bebas + marca-texto), E1 colagem, E2 meio rosto, E3 foto real
# (regras: _esteiras/cortes-redes-sociais/CAPAS.md e identidade-visual/palavras/04-sistema-visual/base-existente/CAPAS-EDITORIAIS-v1.md).
# Uso: python capas_cortes_inveja.py <pasta-quadros> <pasta-fontes-e-marca> <saida>
import base64, io, os, sys
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
from playwright.sync_api import sync_playwright
Q, A, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
b64f = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
def uri(im, q=90):
    buf = io.BytesIO(); im.convert('RGB').save(buf, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
def crop916(nome, cx=.5, zoom=1.0):
    im = Image.open(os.path.join(Q, nome)).convert('RGB'); W, H = im.size
    h = H / zoom; w = h * 9 / 16; x = min(max(cx * W - w / 2, 0), W - w); y = (H - h) / 2
    return im.crop((int(x), int(y), int(x + w), int(y + h))).resize((1080, 1920), Image.LANCZOS)
def frag(nome, box):
    im = Image.open(os.path.join(Q, nome)).convert('RGB'); W, H = im.size
    return ImageEnhance.Contrast(ImageOps.grayscale(im.crop(tuple(int(v * (W if i % 2 == 0 else H)) for i, v in enumerate(box))))).enhance(1.3)
def sepia(im):
    g = ImageOps.grayscale(im); s = ImageOps.colorize(g, '#140B06', '#F2DCC0', mid='#8A5A36')
    return Image.blend(s, im, .25)
FONTS = ''.join(f"@font-face{{font-family:{n};{w}src:url(data:font/woff2;base64,{b64f(os.path.join(A, f))})}}" for n, w, f in [
    ('Bebas', '', 'BebasNeue.woff2'), ('Playfair', 'font-weight:900;', 'PlayfairDisplay-900.woff2'),
    ('Cormorant', 'font-weight:500;', 'CormorantGaramond-500-normal.woff2'), ('Cormorant', 'font-weight:500;font-style:italic;', 'CormorantGaramond-500-italic.woff2'),
    ('Inter', 'font-weight:500;', 'Inter-500.woff2')])
LOGO = lambda c: 'data:image/svg+xml;base64,' + b64f(os.path.join(A, f'palavras-logo-{c}.svg'))
ICON = lambda c: 'data:image/svg+xml;base64,' + b64f(os.path.join(A, f'palavras-icone-{c}.svg'))
GRAO = '<svg class="a" style="left:0;top:0;opacity:.13;mix-blend-mode:multiply" width="1080" height="1920"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>'
def page(bg, body): return f'<!doctype html><html><head><meta charset="utf-8"><style>{FONTS}*{{margin:0;padding:0;box-sizing:border-box}}body{{width:1080px;height:1920px;overflow:hidden;background:{bg};position:relative}}.a{{position:absolute}}</style></head><body>{body}</body></html>'
def L(t): return t.split('|')

def M(c):
    l1, l2 = L(c['titulo'])
    return page('#111', f'''<img class="a" src="{uri(c['m_bg'])}" style="left:0;top:0;width:1080px;height:1920px;filter:contrast(1.08) brightness(.82)">
<div class="a" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,0) 62%,rgba(0,0,0,.6) 100%)"></div>
<div class="a" style="left:70px;top:300px;font-family:Inter;font-size:30px;letter-spacing:9px;color:#E9B48F">INVEJA · PALAVRAS</div>
<div class="a" style="left:60px;top:360px;font-family:Bebas;font-size:168px;line-height:1.02">
<span style="background:#F3E9D5;color:#15161A;padding:0 22px;box-decoration-break:clone">{l1}</span><br>
<span style="background:#C46D45;color:#15161A;padding:0 22px">{l2}</span></div>
<img class="a" src="{LOGO('osso')}" style="left:70px;bottom:250px;height:70px">''')

def E1(c):
    l1, l2 = L(c['titulo']); f = c['frags']
    imgs = ''.join(f'<div class="a" style="left:{x}px;top:{y}px;transform:rotate({r}deg);background:#F3E9D5;padding:14px;box-shadow:0 12px 24px rgba(0,0,0,.25)"><img src="{uri(im)}" style="display:block;width:{w}px"></div>' for im, x, y, w, r in f)
    return page('#EBDFC9', f'''{GRAO}
<div class="a" style="left:-60px;top:1180px;width:760px;height:320px;background:#B04B29;transform:rotate(-6deg);clip-path:polygon(0 8%,96% 0,100% 88%,4% 100%)"></div>
<div class="a" style="left:520px;top:1420px;width:640px;height:260px;background:#C48843;transform:rotate(4deg);clip-path:polygon(3% 0,100% 10%,97% 100%,0 92%)"></div>
<div class="a" style="left:640px;top:260px;width:360px;height:360px;border-radius:50%;background:#C48843;opacity:.85"></div>
{imgs}
<div class="a" style="left:80px;top:300px;font-family:Inter;font-size:30px;letter-spacing:9px;color:#C46D45">INVESTIGAÇÃO</div>
<div class="a" style="left:76px;top:350px;font-family:Playfair;font-weight:900;font-size:118px;line-height:1.02;color:#1B1B1B">{l1}<br>{l2}</div>
<div class="a" style="left:80px;top:610px;font-family:Cormorant;font-style:italic;font-size:58px;color:#1B1B1B">{c['apoio']}</div>
<div class="a" style="left:70px;bottom:230px;background:#F3E9D5;padding:16px 22px;box-shadow:0 6px 14px rgba(0,0,0,.2);transform:rotate(-2deg)"><img src="{LOGO('grafite')}" style="height:56px;display:block"></div>''')

def E2(c):
    l1, l2 = L(c['titulo'])
    return page('#F3E9D5', f'''{GRAO}
<div class="a" style="left:300px;top:520px;width:860px;height:860px;border-radius:50%;background:#B3603C"></div>
<img class="a" src="{uri(c['e2_img'])}" style="left:{c.get('e2_x',300)}px;top:{c.get('e2_y',420)}px;height:{c.get('e2_h',840)}px;max-width:{1080-c.get('e2_x',300)}px;object-fit:cover;object-position:50% 20%">
<img class="a" src="{LOGO('grafite')}" style="left:70px;top:250px;height:58px">
<div class="a" style="left:70px;top:1290px;width:120px;height:6px;background:#B3603C"></div>
<div class="a" style="left:60px;top:1320px;font-family:Playfair;font-weight:900;font-size:112px;line-height:1.05;color:#1B1B1B">
<span style="background:rgba(243,233,213,.88);padding:0 14px">{l1}</span><br><span style="background:rgba(243,233,213,.88);padding:0 14px">{l2}</span></div>
<div class="a" style="left:74px;top:1580px;font-family:Cormorant;font-size:62px;color:#5E5852">{c['apoio']}</div>''')

def E3(c):
    l1, l2 = L(c['titulo']); im = c['e3_img']
    bg = sepia(im.filter(ImageFilter.GaussianBlur(9)))
    return page('#140B06', f'''<img class="a" src="{uri(bg)}" style="left:0;top:0;width:1080px;height:1920px">
<img class="a" src="{uri(sepia(im))}" style="left:0;top:0;width:1080px;height:1920px;-webkit-mask-image:radial-gradient(ellipse 70% 45% at 50% {c.get('e3_foco','40%')},#000 55%,transparent 100%)">
<div class="a" style="left:0;top:900px;width:1080px;height:1020px;background:linear-gradient(180deg,rgba(20,11,6,0),rgba(20,11,6,.92) 45%)"></div>
<img class="a" src="{LOGO('osso')}" style="left:80px;top:1220px;height:60px">
<div class="a" style="left:80px;top:1310px;width:90px;height:5px;background:#DE973C"></div>
<div class="a" style="left:76px;top:1335px;font-family:Cormorant;font-weight:500;font-size:{min(132, int(132*10/max(len(l1),len(l2))))}px;line-height:1.0;letter-spacing:3px;color:#FAEFDA">{l1.title() if False else l1}<br>{l2}</div>
<div class="a" style="left:80px;top:1610px;font-family:Cormorant;font-style:italic;font-size:56px;color:#FAEFDA">{c['apoio']}</div>''')

def pb(nome, box):
    im = Image.open(os.path.join(Q, nome)).convert('RGB'); W, H = im.size
    return ImageEnhance.Contrast(ImageOps.grayscale(im.crop((int(W*box[0]), int(H*box[1]), int(W*box[2]), int(H*box[3]))))).enhance(1.3)
CORTES = {
 'mesma-dor-dois-caminhos': dict(titulo='A MESMA DOR|LEVA AONDE?', apoio='uma dor, duas direções',
   m_bg=crop916('r0111-q-517.4.jpg', .5),
   frags=[(frag('r0111-q-517.4.jpg', (.1, .05, .9, .95)), 90, 760, 560, -4), (frag('r0111-q-523.0.jpg', (.33, .25, .62, .98)), 600, 920, 360, 5), (frag('r0111-q-527.2.jpg', (.15, .1, .85, .9)), 140, 1260, 470, 3)],
   e2_img=pb('r0111-q-523.0.jpg', (.33, .22, .64, 1.0)), e2_x=380, e2_y=400, e3_img=crop916('r0111-q-523.0.jpg', .48, 1.0), e3_foco='38%'),
 'to-com-inveja': dict(titulo='VOCÊ CHAMOU|PELO NOME?', apoio='às vezes, ela fala de você',
   m_bg=crop916('r0111-q-403.05.jpg', .6),
   frags=[(frag('r0111-q-386.9.jpg', (.22, .0, .52, 1.0)), 100, 760, 420, -4), (frag('r0111-q-389.45.jpg', (.22, .0, .52, 1.0)), 600, 900, 380, 5), (frag('r0111-q-403.05.jpg', (.45, .0, .78, 1.0)), 180, 1240, 420, 3)],
   e2_img=pb('r0111-q-403.05.jpg', (.42, .0, .82, 1.0)), e2_x=360, e2_y=400, e3_img=crop916('r0111-q-392.0.jpg', .6, 1.0), e3_foco='42%'),
 'calculadora-do-almoco': dict(titulo='O QUE A CONTA|ESCONDE?', apoio='“só pra equilibrar”',
   m_bg=crop916('r0111-q-41.1.jpg', .60),
   frags=[(frag('r0111-q-41.1.jpg', (.42, .3, .8, .82)), 90, 760, 560, -4), (frag('r0111-q-6.0.jpg', (.5, .0, .85, .75)), 600, 920, 380, 5), (frag('r0111-q-51.9.jpg', (.5, .3, .95, .85)), 140, 1260, 470, 3)],
   e2_img=pb('r0111-q-6.0.jpg', (.47, .0, .84, 1.0)), e2_x=360, e2_y=400, e3_img=crop916('r0111-q-6.0.jpg', .66, 1.0), e3_foco='28%'),
}
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    for nome, c in CORTES.items():
        for est, fn in (('m', M), ('e1-colagem', E1), ('e2-meio-rosto', E2), ('e3-foto-real', E3)):
            pg.set_content(fn(c)); pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(OUT, f'{nome}-capa-palavras-{est}.png'))
    b.close()
# folha comparativa: tamanho de tela (270x480) e teste reduzido (90x160)
for nome in CORTES:
    ims = [Image.open(os.path.join(OUT, f'{nome}-capa-palavras-{e}.png')) for e in ('m', 'e1-colagem', 'e2-meio-rosto', 'e3-foto-real')]
    folha = Image.new('RGB', (4 * 300 + 30 + 4 * 100, 540), (38, 38, 38))
    for i, im in enumerate(ims):
        folha.paste(im.resize((270, 480), Image.LANCZOS), (15 + i * 300, 30))
        folha.paste(im.resize((90, 160), Image.LANCZOS), (1230 + i * 100, 30))
    folha.save(os.path.join(OUT, f'_folha-capas-{nome}.jpg'), quality=90)
print('ok')
