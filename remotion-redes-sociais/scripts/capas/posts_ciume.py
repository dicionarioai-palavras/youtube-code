# Peças de texto do Palavras para Ciúme (07/11/2026): carrossel Instagram (4:5), post único (4:5), stories (9:16),
# carrossel TikTok (9:16), imagem do post da comunidade do YouTube (1:1) e a imagem tipográfica do artigo "ciúme ou ciúmes" (16:9).
# Mesmo molde visual de posts_inveja.py (creme, grafite, terracota, Bebas + Inter, fragmentos no rodapé, logo oficial).
# Uso: python posts_ciume.py <assets> <saida>   (assets: fontes .woff2, logos .svg e as fotos D.jpg/E.jpg do Runway)
import base64, os, sys
from playwright.sync_api import sync_playwright
A, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
F = ''.join(f"@font-face{{font-family:{n};{w}src:url(data:font/woff2;base64,{b64(os.path.join(A, f))})}}" for n, w, f in [
    ('Bebas', '', 'BebasNeue.woff2'), ('Inter', 'font-weight:500;', 'Inter-500.woff2')])
LOGO = lambda c: 'data:image/svg+xml;base64,' + b64(os.path.join(A, f'palavras-logo-{c}.svg'))
FOTO = lambda k: 'data:image/jpeg;base64,' + b64(os.path.join(A, f'{k}.jpg'))
CR, TI, TE, OC, AZ = '#F3E9D5', '#15161A', '#C46D45', '#DB9B5B', '#8F9DA3'

def page(w, h, bg, body):
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>{F}*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{w}px;height:{h}px;overflow:hidden;background:{bg};position:relative;font-family:Inter;color:{TI}}}.a{{position:absolute}}
.h{{font-family:Bebas;line-height:.95;letter-spacing:1px}} .mt{{background:{TE};color:{TI};padding:0 14px}} .mc{{background:{CR};color:{TI};padding:0 14px}}
.lat{{font-style:italic}} b{{font-weight:500;color:{TE}}}</style></head><body>{body}</body></html>'''

def frag(w):
    return f'''<svg class="a" style="left:0;bottom:0" width="{w}" height="160"><polygon points="0,160 0,70 240,120 330,160" fill="{TE}" opacity=".9"/>
<polygon points="250,160 420,60 560,160" fill="{OC}" opacity=".85"/><polygon points="{w},160 {w},40 {w-260},160" fill="{AZ}" opacity=".7"/></svg>'''

def persiana(w, h, op=.10):  # listras discretas de persiana (imagem-mãe do vídeo)
    return f'<div class="a" style="inset:0;opacity:{op};background:repeating-linear-gradient(180deg,rgba(0,0,0,0) 0 38px,{TI} 38px 52px)"></div>'

def slide(w, h, n, total, titulo, corpo='', rotulo='', fonte='', bg=CR, escuro=False, tam=None):
    cor = CR if escuro else TI
    ts = tam or (120 if len(titulo) < 40 else 96)
    return page(w, h, bg, f'''{'' if escuro else frag(w)}
<div class="a" style="left:80px;top:90px;font-size:26px;letter-spacing:8px;color:{TE}">{rotulo}</div>
<div class="a" style="right:80px;top:90px;font-size:26px;color:{cor};opacity:.6">{n}/{total}</div>
<div class="a h" style="left:76px;top:{int(h*.2)}px;right:76px;font-size:{ts}px;color:{cor}">{titulo}</div>
<div class="a" style="left:80px;right:90px;top:{int(h*.52)}px;font-size:44px;line-height:1.35;color:{cor}">{corpo}</div>
<div class="a" style="left:80px;right:80px;bottom:{190 if not escuro else 90}px;font-size:24px;color:{cor};opacity:.65">{fonte}</div>
<img class="a" src="{LOGO('osso' if escuro else 'grafite')}" style="left:80px;bottom:{110 if not escuro else 40}px;height:44px">''')

def capa_foto(w, h, k, l1, l2, sub, n=None, total=None, pos='50%'):
    return page(w, h, '#0B0B0D', f'''<img class="a" src="{FOTO(k)}" style="left:{pos};top:0;height:{h}px;transform:translateX(-50%);filter:brightness(.85)">
<div class="a" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.65),rgba(0,0,0,0) 40%,rgba(0,0,0,0) 60%,rgba(0,0,0,.75))"></div>
<div class="a" style="left:80px;top:90px;font-size:26px;letter-spacing:8px;color:#E9B48F">CIÚME · PALAVRAS</div>
{f'<div class="a" style="right:80px;top:90px;font-size:26px;color:{CR};opacity:.7">{n}/{total}</div>' if n else ''}
<div class="a h" style="left:70px;top:150px;font-size:{140 if h < 1500 else 160}px"><span class="mc">{l1}</span><br><span class="mt">{l2}</span></div>
<div class="a" style="left:80px;right:80px;bottom:150px;font-size:42px;color:{CR}">{sub}</div>
<img class="a" src="{LOGO('osso')}" style="left:80px;bottom:70px;height:46px">''')

INF = 'Infopédia (Porto Editora), verbetes zelo e zeloso'
CIB = 'Houaiss, via Ciberdúvidas · Infopédia'
ETY = 'Etymonline (Liddell & Scott; Buck)'
W, H = 1080, 1350
car = [
    capa_foto(W, H, 'D', 'CIÚME E ZELO', 'SÃO IRMÃOS.', 'Salva para lembrar. →', 1, 8, pos='38%'),
    slide(W, H, 2, 8, 'A RAIZ', '<b>Ciúme</b> ← latim <span class="lat">zelumen</span> ← <span class="lat">zelus</span>.<br><b>Zelo</b> vem do mesmo <span class="lat">zelus</span>.', 'ORIGEM', CIB),
    slide(W, H, 3, 8, 'O FOGO GREGO', 'Antes do latim, o grego <span class="lat">zēlos</span>: ardor, emulação.<br>Tinha quem chamasse de <b>paixão nobre</b>.', 'ORIGEM', ETY),
    slide(W, H, 4, 8, 'O MESMO FOGO, DOIS LADOS', '"Quero tocar tão bonito quanto você."<br>vira<br>"Tenho medo de você tocar bonito pra outra pessoa."', 'O VÍDEO'),
    slide(W, H, 5, 8, 'EM PORTUGAL, AINDA É ASSIM', '<b>"Zelos"</b>, no plural, quer dizer ciúme.<br><b>Zeloso</b>: cuidadoso, diligente… e ciumento.', 'HOJE', INF),
    slide(W, H, 6, 8, 'JALOUSIE', 'Em francês, a mesma palavra é <b>ciúme</b> e <b>persiana</b>: ver a rua inteira sem que a rua veja você.', 'OUTRAS LÍNGUAS', 'Etymonline, "jealousy" (persiana: 1766)'),
    slide(W, H, 7, 8, 'A PERSIANA AGORA VEM NO BOLSO', 'Visto por último.<br>Localização compartilhada.<br>Quem viu o seu story.', 'HOJE'),
    slide(W, H, 8, 8, 'A INVESTIGAÇÃO COMPLETA', 'Está no vídeo do canal <b>Palavras</b> e no blog.<br><br><span style="color:#C46D45">link na bio</span>', 'PALAVRAS.CO', '', bg=TI, escuro=True),
]
post = [page(W, H, CR, f'''{frag(W)}
<div class="a" style="left:80px;top:90px;font-size:26px;letter-spacing:8px;color:{TE}">DÚVIDA · CIÚME</div>
<div class="a h" style="left:0;right:0;top:300px;text-align:center;font-size:200px">CIÚME <span style="color:{TE}">OU</span><br>CIÚMES?</div>
<div class="a" style="left:0;right:0;top:760px;text-align:center;font-size:46px">As duas estão certas.</div>
<div class="a" style="left:120px;right:120px;top:850px;text-align:center;font-size:34px;line-height:1.4;opacity:.8">O plural soa mais leve.<br>O singular pesa: "o meu ciúme".</div>
<img class="a" src="{LOGO('grafite')}" style="left:50%;transform:translateX(-50%);bottom:200px;height:52px">''')]
SW, SH = 1080, 1920
def story(txt, sub=''):
    return page(SW, SH, TI, f'''<img class="a" src="{FOTO('E')}" style="left:58%;top:0;height:1920px;transform:translateX(-50%);filter:brightness(.33) blur(2px)">
<div class="a" style="left:80px;top:240px;font-size:28px;letter-spacing:8px;color:#E9B48F">CIÚME · PALAVRAS</div>
<div class="a h" style="left:80px;right:80px;top:340px;font-size:124px;color:{CR}">{txt}</div>
<div class="a" style="left:80px;right:80px;top:880px;font-size:48px;line-height:1.35;color:{CR}">{sub}</div>
<img class="a" src="{LOGO('osso')}" style="left:80px;bottom:260px;height:48px">''')
stories = [story('VOCÊ PASSARIA A LOCALIZAÇÃO?'),
           story('"ME PASSA TUA LOCALIZAÇÃO?"', 'Isso é…'),
           story('CUIDADO E CIÚME VÊM DA MESMA PALAVRA.', 'Latim <span class="lat">zelus</span>: deu <b>zelo</b> e <b>ciúme</b>.'),
           story('O ZELO QUER SABER SE VOCÊ TÁ BEM.', 'O ciúme quer saber se ainda é o centro do seu mundo.'),
           story('A INVESTIGAÇÃO INTEIRA ESTÁ NO VÍDEO 👆')]
tik = [capa_foto(SW, SH, 'D', 'ESCREVI "ZELOSO"', 'NO CURRÍCULO.', 'Arrasta →', 1, 5, pos='38%'),
       slide(SW, SH, 2, 5, 'EM PORTUGAL, ZELOSO É…', 'cuidadoso,<br>diligente…<br><b>e ciumento.</b>', 'O DICIONÁRIO', INF),
       slide(SW, SH, 3, 5, '"ZELOS", NO PLURAL…', '…ainda quer dizer <b>ciúme</b> por lá.', 'PORTUGAL', INF),
       slide(SW, SH, 4, 5, 'NÃO É COINCIDÊNCIA.', 'Zelo e ciúme vêm do mesmo latim: <span class="lat">zelus</span>.<br>O fogo é um só. Muda pra onde ele aponta.', 'A ORIGEM', CIB),
       slide(SW, SH, 5, 5, 'ÓTIMO FUNCIONÁRIO. PÉSSIMO NAMORADO.', 'A investigação inteira está no canal <b>Palavras</b>.', 'PALAVRAS.CO', '', bg=TI, escuro=True)]
comunidade = [page(1080, 1080, CR, f'''{frag(1080)}
<div class="a" style="left:80px;top:90px;font-size:26px;letter-spacing:8px;color:{TE}">ENQUETE · CIÚME</div>
<div class="a h" style="left:76px;right:76px;top:220px;font-size:150px">CIÚME É PROVA DE AMOR?</div>
<div class="a" style="left:80px;top:620px;font-size:46px">Responde com sinceridade.</div>
<img class="a" src="{LOGO('grafite')}" style="left:80px;bottom:200px;height:46px">''')]
artigo = [page(1920, 1080, CR, f'''{persiana(1920, 1080, .07)}
<div class="a h" style="left:0;right:0;top:250px;text-align:center;font-size:300px">CIÚME <span style="color:{TE};font-size:180px">OU</span> CIÚMES</div>
<div class="a" style="left:0;right:0;top:640px;text-align:center;font-size:56px">as duas estão certas · uma pesa mais</div>
<img class="a" src="{LOGO('grafite')}" style="left:50%;transform:translateX(-50%);bottom:110px;height:60px">''')]
grupos = {'instagram-carrossel': (car, W, H), 'instagram-post': (post, W, H), 'instagram-story': (stories, SW, SH),
          'tiktok-carrossel': (tik, SW, SH), 'youtube-comunidade': (comunidade, 1080, 1080), 'artigo-ciume-ou-ciumes': (artigo, 1920, 1080)}
EXE = os.environ.get('CHROME')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE) if EXE else p.chromium.launch()
    for nome, (pags, w, h) in grupos.items():
        pg = b.new_page(viewport={'width': w, 'height': h})
        for i, html in enumerate(pags, 1):
            pg.set_content(html); pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(OUT, f'ciume-{nome}-{i:02d}.png'))
        pg.close()
    b.close()
print('ok')
