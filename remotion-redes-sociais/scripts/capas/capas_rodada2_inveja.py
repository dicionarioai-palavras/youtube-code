# CAPAS DA RODADA 2 DO TEMA INVEJA (18/10/2026). Mesmo molde de gerar_capas.py; regras em identidade-visual\compartilhado\guias\CAPAS-PRODUCAO-LEGADO.md
# Uso: python capas_rodada2_inveja.py <pasta-saida> <pasta-com-recortes rl_*.png e tela_*.png>
# Rosto: posicionado automaticamente pela máscara (cabeça ~560 px de largura, olhos ~y 870, centro da cabeça ~x 640).
# Capas sem rosto (gravação de tela): o recorte P&B da tela ocupa o lugar do rosto.
import base64, sys, os
import numpy as np
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps, ImageEnhance

F = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'fonts')
SRC = sys.argv[2]
def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
FONTS = f"""
@font-face{{font-family:Bebas;src:url(data:font/woff2;base64,{b64(F+'/BebasNeue.woff2')})}}
@font-face{{font-family:BarlowC;font-weight:800;src:url(data:font/woff2;base64,{b64(F+'/BarlowCondensed-800.woff2')})}}
"""
C = dict(creme='#FBE9C2', grafite='#1A1B20', osso='#F7F0E3', terracota='#C46D45', tf='#B4491B', ocre='#DB9B5B',
         ocreClaro='#EABD79', azul='#8F9DA3', verde='#4ADE80')
GRAO = '<svg class="abs" style="opacity:.08;mix-blend-mode:multiply" width="1080" height="1920"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>'
FRAG = f'''<svg class="abs" width="1080" height="1920" viewBox="0 0 1080 1920">
<polygon points="880,0 1080,0 1080,230" fill="{C['ocre']}" opacity=".9"/><polygon points="740,0 900,0 820,90" fill="{C['terracota']}" opacity=".9"/>
<polygon points="0,1920 0,1720 300,1800 380,1920" fill="{C['terracota']}" opacity=".93"/>
<polygon points="250,1920 380,1770 620,1920" fill="{C['azul']}" opacity=".85"/></svg>'''

def rosto(nome, cabeca=560, olhos=870, cx_alvo=640):
    """recorte rl_<nome>.png -> (data-uri, css) com a cabeça no lugar certo"""
    p = os.path.join(SRC, f'rl_{nome}.png')
    a = np.array(Image.open(p))[:, :, 3] > 128
    H, W = a.shape
    w = a[:int(H * .12)].sum(1); w = w[w > 0]
    hw = float(np.median(w[len(w) // 3:]))
    cx = float(np.mean(np.nonzero(a[:int(H * .1)])[1]))
    s = cabeca / hw
    css = f'height:{H*s:.0f}px;left:{cx_alvo - cx*s:.0f}px;top:{olhos - 0.65*cabeca:.0f}px'
    return 'data:image/png;base64,' + b64(p), css

def tela(nome, top=800, largura=1010, rot=-2):
    """recorte P&B da gravação de tela no lugar do rosto"""
    p = os.path.join(SRC, f'tela_{nome}.png')
    im = ImageEnhance.Contrast(ImageOps.grayscale(Image.open(p))).enhance(1.25)
    tmp = os.path.join(SRC, f'tela_{nome}_pb.png'); im.save(tmp)
    return (f'<img class="abs" src="data:image/png;base64,{b64(tmp)}" style="left:{(1080-largura)//2}px;top:{top}px;width:{largura}px;'
            f'transform:rotate({rot}deg);border:7px solid {C["osso"]};box-shadow:0 24px 60px rgba(0,0,0,.35);image-rendering:auto">')

def carimbo(txt, x, y, rot=-9, size=200):
    return (f'<div class="abs" style="left:{x}px;top:{y}px;transform:rotate({rot}deg);border:14px solid {C["tf"]};color:{C["tf"]};'
            f'font:400 {size}px/1 Bebas;padding:16px 40px 0;background:{C["osso"]}F0;letter-spacing:6px;box-shadow:0 14px 34px rgba(0,0,0,.3);white-space:nowrap">{txt}</div>')

def manchete(linhas, marca):
    return ''.join(f'<div class="ln"><span style="background:linear-gradient(transparent 18%,{marca} 18%,{marca} 88%,transparent 88%);padding:0 14px;'
                   f'box-decoration-break:clone">{l}</span></div>' for l in linhas)

def pagina(bg, frag, kicker, linhas, tam, marca, fundo_img, extra):
    k = f'<div class="kick">{kicker}</div><div class="fio"></div>' if kicker else ''
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>{FONTS}
*{{margin:0;padding:0;box-sizing:border-box}} body{{width:1080px;height:1920px;overflow:hidden;background:{bg};position:relative}}
.abs{{position:absolute}}
.rosto{{position:absolute;filter:drop-shadow(7px 0 0 {C['osso']}) drop-shadow(-7px 0 0 {C['osso']}) drop-shadow(0 7px 0 {C['osso']}) drop-shadow(0 -7px 0 {C['osso']})}}
.txt{{position:absolute;left:62px;top:250px;width:980px}}
.kick{{font:800 52px/1 BarlowC;color:{C['tf']};letter-spacing:1px;padding-left:14px}}
.fio{{width:240px;height:6px;background:{C['terracota']};margin:20px 0 10px 14px}}
.ln{{font:400 {tam}px/.9 Bebas;color:{C['grafite']};letter-spacing:2px;margin-bottom:6px;white-space:nowrap}}
</style></head><body>{GRAO}{frag}{fundo_img}{extra}
<div class="txt">{k}{manchete(linhas, marca)}</div></body></html>'''

def img_rosto(nome, **kw):
    uri, css = rosto(nome, **kw)
    return f'<img class="rosto" style="{css}" src="{uri}">'

# --- elementos de revelação parcial (um por capa)
CAMERA_DE_LADO = f'''<svg class="abs" style="left:30px;top:1260px;transform:rotate(-78deg)" width="360" height="300" viewBox="0 0 430 360">
<rect x="20" y="80" width="390" height="250" rx="34" fill="{C['grafite']}" stroke="{C['osso']}" stroke-width="12"/>
<rect x="120" y="40" width="130" height="60" rx="14" fill="{C['grafite']}" stroke="{C['osso']}" stroke-width="12"/>
<circle cx="215" cy="205" r="92" fill="{C['osso']}"/><circle cx="215" cy="205" r="66" fill="{C['grafite']}"/><circle cx="190" cy="180" r="18" fill="{C['osso']}" opacity=".8"/></svg>
<svg class="abs" style="left:250px;top:1240px" width="260" height="300" viewBox="0 0 260 300">
<path d="M40 40 C 200 20, 250 160, 150 250" fill="none" stroke="{C['tf']}" stroke-width="22" stroke-linecap="round"/>
<path d="M105 215 L150 262 L198 222" fill="none" stroke="{C['tf']}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/></svg>'''

def palavra_cortada(txt, marca, x=40, y=1430, rot=-5):
    return (f'<div class="abs" style="left:{x}px;top:{y}px;transform:rotate({rot}deg);font:400 230px/1 Bebas;color:{C["grafite"]};letter-spacing:4px">'
            f'<span style="background:linear-gradient(transparent 22%,{marca} 22%,{marca} 86%,transparent 86%);padding:0 18px">{txt}</span></div>')

LUPA = f'''<svg class="abs" style="left:640px;top:820px;transform:rotate(-12deg)" width="440" height="520" viewBox="0 0 440 520">
<circle cx="190" cy="190" r="150" fill="{C['osso']}" fill-opacity=".18" stroke="{C['grafite']}" stroke-width="30"/>
<circle cx="190" cy="190" r="150" fill="none" stroke="{C['osso']}" stroke-width="8"/>
<path d="M300 300 L410 490" stroke="{C['grafite']}" stroke-width="54" stroke-linecap="round"/></svg>'''

def troca(marca):
    caixa = lambda t, x, y: (f'<div class="abs" style="left:{x}px;top:{y}px;font:400 190px/1 Bebas;color:{C["grafite"]};background:{marca};'
                             f'padding:14px 34px 0;border:8px solid {C["grafite"]}">{t}</div>')
    return (caixa('ELE', 120, 1330) + caixa('MIM', 640, 1330) +
            f'''<svg class="abs" style="left:300px;top:1190px" width="480" height="420" viewBox="0 0 480 420">
<path d="M40 130 C 120 10, 360 10, 440 120" fill="none" stroke="{C['tf']}" stroke-width="20" stroke-linecap="round"/>
<path d="M395 80 L442 124 L388 150" fill="none" stroke="{C['tf']}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M440 330 C 360 410, 120 410, 40 320" fill="none" stroke="{C['tf']}" stroke-width="20" stroke-linecap="round"/>
<path d="M88 300 L40 318 L80 368" fill="none" stroke="{C['tf']}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/></svg>''')

L, P = C['ocre'], C['creme']
CAPAS = {
  # 1-2: P&B sem voz (a capa inteira vira P&B depois, como a botao-da-foto-pb)
  'aquecendo-a-voz-pb__luiz': pagina(L, '', 'BASTIDORES', ['ANTES DE', 'GRAVAR, EU…'], 240, C['creme'], img_rosto('aq_44'), carimbo('SEM SOM.', 30, 1440, -8, 190)),
  'cantando-sem-audio-pb__luiz': pagina(L, '', 'BASTIDORES', ['O ESTÚDIO', 'VIROU…'], 240, C['creme'], img_rosto('ca_8'), carimbo('MUTADO.', 30, 1440, -8, 190)),
  'aqui-e-bastidor__luiz': pagina(L, '', 'BASTIDORES', ['EU E ESSA', 'CÂMERA…'], 240, C['creme'], img_rosto('bs_100'), CAMERA_DE_LADO),
  'nao-conhecia-anafora__luiz': pagina(L, '', 'BASTIDORES', ['ESCREVO HÁ', 'ANOS E…'], 240, C['creme'], img_rosto('aq_38'), palavra_cortada('ANÁ…', C['creme'])),
  'nao-conhecia-anafora__palavras': pagina(P, FRAG, 'INVEJA', ['ESCREVO HÁ', 'ANOS E…'], 240, C['ocreClaro'], tela('anafora', 830), palavra_cortada('ANÁ…', C['ocreClaro'], 60, 1400)),
  'desejo-mesquinho__luiz': pagina(L, '', 'BASTIDORES', ['TOMARA QUE', 'O DELE…'], 240, C['creme'], img_rosto('de_43', olhos=450), carimbo('ME PEGUEI.', 30, 1500, -8, 190)),  # perfil de boné: cabeça subida para os olhos ficarem logo abaixo da manchete
  'ela-nao-fere-ela-localiza__palavras': pagina(P, FRAG, 'INVEJA', ['ELA NÃO FERE.', 'ELA…'], 200, C['ocreClaro'], tela('ela', 840), LUPA),
  'entre-ele-e-mim__palavras': pagina(P, FRAG, 'INVEJA', ['UMA ORDEM', 'DÓI MAIS…'], 240, C['ocreClaro'], tela('entre', 860), troca(C['ocreClaro'])),
}
PB = {'aquecendo-a-voz-pb__luiz', 'cantando-sem-audio-pb__luiz'}

out = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    for nome, h in CAPAS.items():
        pg.set_content(h); pg.wait_for_timeout(400); pg.screenshot(path=f'{out}/{nome}.png')
        if nome in PB:
            im = Image.open(f'{out}/{nome}.png').convert('RGB')
            ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1).convert('RGB').save(f'{out}/{nome}.png')
    b.close()
print('ok')
