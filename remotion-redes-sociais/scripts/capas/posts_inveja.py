# Peças de texto do Palavras para Inveja (31/10/2026): carrossel Instagram (4:5), post único (4:5),
# stories (9:16), capa do destaque, carrossel TikTok (9:16) e imagem do post da comunidade do YouTube (1:1).
# Textos: palavras/youtube/peças/inveja/redes/final/*.txt (aprovados). Uso: python posts_inveja.py <assets> <olho.jpg> <saida>
import base64, os, sys
from playwright.sync_api import sync_playwright
A, OLHO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
F = ''.join(f"@font-face{{font-family:{n};{w}src:url(data:font/woff2;base64,{b64(os.path.join(A, f))})}}" for n, w, f in [
    ('Bebas', '', 'BebasNeue.woff2'), ('Inter', 'font-weight:500;', 'Inter-500.woff2'), ('Cormorant', 'font-style:italic;', 'CormorantGaramond-500-italic.woff2')])
LOGO = lambda c: 'data:image/svg+xml;base64,' + b64(os.path.join(A, f'palavras-logo-{c}.svg'))
EYE = 'data:image/jpeg;base64,' + b64(OLHO)
CR, TI, TE, OC, AZ = '#F3E9D5', '#15161A', '#C46D45', '#DB9B5B', '#8F9DA3'

def page(w, h, bg, body):
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>{F}*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{w}px;height:{h}px;overflow:hidden;background:{bg};position:relative;font-family:Inter;color:{TI}}}.a{{position:absolute}}
.h{{font-family:Bebas;line-height:.95;letter-spacing:1px}} .mt{{background:{TE};color:{TI};padding:0 14px}} .mc{{background:{CR};color:{TI};padding:0 14px}}
.lat{{font-family:Cormorant;font-style:italic}}</style></head><body>{body}</body></html>'''

def frag(w, h):  # fragmentos geométricos discretos da identidade no rodapé
    return f'''<svg class="a" style="left:0;bottom:0" width="{w}" height="160"><polygon points="0,160 0,70 240,120 330,160" fill="{TE}" opacity=".9"/>
<polygon points="250,160 420,60 560,160" fill="{OC}" opacity=".85"/><polygon points="{w},160 {w},40 {w-260},160" fill="{AZ}" opacity=".7"/></svg>'''

def slide(w, h, n, total, titulo, corpo='', rotulo='', fonte='', bg=CR, escuro=False):
    cor = CR if escuro else TI
    return page(w, h, bg, f'''{'' if escuro else frag(w, h)}
<div class="a" style="left:80px;top:90px;font-size:26px;letter-spacing:8px;color:{TE}">{rotulo}</div>
<div class="a" style="right:80px;top:90px;font-size:26px;color:{cor};opacity:.6">{n}/{total}</div>
<div class="a h" style="left:76px;top:{int(h*.2)}px;right:76px;font-size:{120 if len(titulo) < 40 else 96}px;color:{cor}">{titulo}</div>
<div class="a" style="left:80px;right:90px;top:{int(h*.55)}px;font-size:44px;line-height:1.35;color:{cor}">{corpo}</div>
<div class="a" style="left:80px;right:80px;bottom:{190 if not escuro else 90}px;font-size:24px;color:{cor};opacity:.65">{fonte}</div>
<img class="a" src="{LOGO('osso' if escuro else 'grafite')}" style="left:80px;bottom:{110 if not escuro else 40}px;height:{44}px">''')

def capa_olho(w, h, l1, l2, sub, n=None, total=None):
    return page(w, h, '#0B0B0D', f'''<img class="a" src="{EYE}" style="left:50%;top:0;height:{h}px;transform:translateX(-50%);filter:brightness(.85)">
<div class="a" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.65),rgba(0,0,0,0) 40%,rgba(0,0,0,0) 60%,rgba(0,0,0,.75))"></div>
<div class="a" style="left:80px;top:90px;font-size:26px;letter-spacing:8px;color:#E9B48F">INVEJA · PALAVRAS</div>
{f'<div class="a" style="right:80px;top:90px;font-size:26px;color:{CR};opacity:.7">{n}/{total}</div>' if n else ''}
<div class="a h" style="left:70px;top:150px;font-size:{140 if w < 1080 or h < 1500 else 160}px"><span class="mc">{l1}</span><br><span class="mt">{l2}</span></div>
<div class="a" style="left:80px;right:80px;bottom:150px;font-size:42px;color:{CR}">{sub}</div>
<img class="a" src="{LOGO('osso')}" style="left:80px;bottom:70px;height:46px">''')

W, H = 1080, 1350
car = [
    capa_olho(W, H, 'INVEJA COMEÇA', 'NO OLHO.', 'Salva para lembrar. →', 1, 8),
    slide(W, H, 2, 8, 'A RAIZ', '<b>Inveja</b> ← latim <span class="lat">invidia</span> ← <span class="lat">invidere</span>: olhar de modo malévolo, lançar mau-olhado.', 'ORIGEM', 'Houaiss, via Ciberdúvidas da Língua Portuguesa'),
    slide(W, H, 3, 8, 'O OLHO ESCONDIDO', 'Dentro de <span class="lat">invidere</span> está <span class="lat">videre</span>:<br><span class="h" style="font-size:150px;color:#C46D45">VER.</span>', 'ORIGEM'),
    slide(W, H, 4, 8, '"INVEJA VEM DE NÃO VER." ✗', 'O <b>in-</b> aqui não nega: indica direção.<br>Olhar <b>SOBRE</b> alguém.', 'A LENDA', 'Houaiss, via Ciberdúvidas da Língua Portuguesa'),
    slide(W, H, 5, 8, 'NO PORTUGUÊS', 'Século XIII: a palavra aparece como <span class="lat">enveja</span>.<br>Hoje o olho continua nas expressões: <b>olho gordo</b>, <b>olho grande</b>, <b>botar olho</b>.', 'HISTÓRIA', 'Houaiss, via Ciberdúvidas'),
    slide(W, H, 6, 8, 'DOIS CAMINHOS', '<b>Inveja benigna</b> → "quero chegar lá".<br><b>Inveja maliciosa</b> → "também não é tudo isso".', 'PESQUISA', 'van de Ven, Zeelenberg e Pieters (2009), Emotion'),
    slide(W, H, 7, 8, 'O HOLANDÊS TEM DUAS PALAVRAS', '<span class="lat">benijden</span>: a que empurra.<br><span class="lat">afgunst</span>: a que puxa para baixo.<br>O português tem uma só.', 'PESQUISA', 'van de Ven, Zeelenberg e Pieters (2009), Emotion'),
    slide(W, H, 8, 8, 'A INVESTIGAÇÃO COMPLETA', 'Está no vídeo do canal <b>Palavras</b> e no blog.<br><br><span style="color:#C46D45">link na bio</span>', 'PALAVRAS.CO', '', bg=TI, escuro=True),
]
post = [page(W, H, CR, f'''{frag(W, H)}
<div class="a h" style="left:0;right:0;top:330px;text-align:center;font-size:230px">IN·<span style="color:{TE}">VIDERE</span></div>
<div class="a lat" style="left:0;right:0;top:580px;text-align:center;font-size:76px">olhar com maus olhos</div>
<div class="a" style="left:0;right:0;top:760px;text-align:center;font-size:38px;letter-spacing:4px">A INVEJA COMEÇA NO OLHO.</div>
<img class="a" src="{LOGO('grafite')}" style="left:50%;transform:translateX(-50%);bottom:200px;height:52px">''')]
SW, SH = 1080, 1920
def story(txt, sub='', enquete=None, escuro=True):
    eq = '' if True else f'''<div class="a" style="left:120px;right:120px;top:1130px;height:300px;border:4px dashed {CR};border-radius:30px;opacity:.6;
display:flex;align-items:center;justify-content:center;font-size:30px;color:{CR}">figurinha de enquete: {enquete}</div>'''
    return page(SW, SH, TI, f'''<img class="a" src="{EYE}" style="left:50%;top:0;height:1920px;transform:translateX(-50%);filter:brightness(.35) blur(2px)">
<div class="a" style="left:80px;top:240px;font-size:28px;letter-spacing:8px;color:#E9B48F">INVEJA · PALAVRAS</div>
<div class="a h" style="left:80px;right:80px;top:340px;font-size:130px;color:{CR}">{txt}</div>
<div class="a" style="left:80px;right:80px;top:820px;font-size:48px;line-height:1.35;color:{CR}">{sub}</div>{eq}
<img class="a" src="{LOGO('osso')}" style="left:80px;bottom:260px;height:48px">''')
stories = [story('INVEJA VEM DE "NÃO VER"?', '', 'SIM / NÃO'),
           story('NÃO!', 'Vem de <span class="lat">invidere</span>: olhar com maus olhos.<br>O <b>in-</b> aponta, não nega.'),
           story('SEU AMIGO É PROMOVIDO. VOCÊ…', '', 'CORRO ATRÁS / PROCURO DEFEITO'),
           story('OS DOIS SÃO INVEJA.', 'A pesquisa chama de <b>benigna</b> e <b>maliciosa</b>.'),
           story('A INVESTIGAÇÃO INTEIRA ESTÁ NO VÍDEO 👆', '', 'figurinha de link → vídeo no YouTube')]
destaque = [page(1080, 1080, TI, f'''<div class="a" style="left:240px;top:240px;width:600px;height:600px;border-radius:50%;overflow:hidden">
<img src="{EYE}" style="height:600px;margin-left:-260px;filter:saturate(.9)"></div>''')]
tik = [capa_olho(SW, SH, 'INVEJA NÃO VEM', 'DE "NÃO VER".', 'Arrasta →', 1, 6),
       slide(SW, SH, 2, 6, 'MUITA GENTE REPETE:', '<b>in</b> = não<br><span class="lat">videre</span> = ver', 'A LENDA'),
       slide(SW, SH, 3, 6, 'ERRADO.', '<span class="lat">Invidere</span> = olhar com maus olhos, lançar mau-olhado.', 'A ORIGEM', 'Houaiss, via Ciberdúvidas'),
       slide(SW, SH, 4, 6, 'O "IN" NÃO NEGA.', 'Ele aponta: olhar <b>SOBRE</b> alguém.', 'A ORIGEM'),
       slide(SW, SH, 5, 6, 'A INVEJA NÃO É QUEM NÃO VÊ.', '<span class="h" style="font-size:130px;color:#C46D45">É QUEM VÊ DEMAIS.</span>', ''),
       slide(SW, SH, 6, 6, 'FONTE: HOUAISS, VIA CIBERDÚVIDAS.', 'A investigação inteira está no canal <b>Palavras</b>.', 'PALAVRAS.CO', '', bg=TI, escuro=True)]
comunidade = [page(1080, 1080, CR, f'''{frag(1080, 1080)}
<div class="a" style="left:80px;top:90px;font-size:26px;letter-spacing:8px;color:{TE}">ENQUETE · INVEJA</div>
<div class="a h" style="left:76px;right:76px;top:200px;font-size:104px">SEU AMIGO É PROMOVIDO PARA A VAGA QUE VOCÊ QUERIA.</div>
<div class="a" style="left:80px;top:640px;font-size:48px">O que acontece primeiro?</div>
<img class="a" src="{LOGO('grafite')}" style="left:80px;bottom:200px;height:46px">''')]
grupos = {'instagram-carrossel': (car, W, H), 'instagram-post': (post, W, H), 'instagram-story': (stories, SW, SH),
          'instagram-destaque-capa': (destaque, 1080, 1080), 'tiktok-carrossel': (tik, SW, SH), 'youtube-comunidade': (comunidade, 1080, 1080)}
with sync_playwright() as p:
    b = p.chromium.launch()
    for nome, (pags, w, h) in grupos.items():
        pg = b.new_page(viewport={'width': w, 'height': h})
        for i, html in enumerate(pags, 1):
            pg.set_content(html); pg.wait_for_timeout(250)
            pg.screenshot(path=os.path.join(OUT, f'inveja-{nome}-{i:02d}.png'))
        pg.close()
    b.close()
print('ok')
