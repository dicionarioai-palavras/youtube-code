# MOLDE DAS CAPAS 9:16 (aprovado pelo Luiz em 18/10/2026). Regras: identidade-visual\compartilhado\guias\CAPAS-PRODUCAO-LEGADO.md
# Uso: python gerar_capas.py <pasta-saida> <pasta-com-recortes rl_*.png>. Edite o dicionario CAPAS (manchete, rosto, revelacao) a cada rodada.
# Recorte do rosto: rembg (u2net_human_seg) + maior componente + PB contraste 1.25 -> rl_<nome>.png
import base64, sys, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps

F = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'fonts')
def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
FONTS = f"""
@font-face{{font-family:Bebas;src:url(data:font/woff2;base64,{b64(F+'/BebasNeue.woff2')})}}
@font-face{{font-family:BarlowC;font-weight:800;src:url(data:font/woff2;base64,{b64(F+'/BarlowCondensed-800.woff2')})}}
"""
C = dict(creme='#FBE9C2', grafite='#1A1B20', osso='#F7F0E3', terracota='#C46D45', tf='#B4491B', ocre='#DB9B5B',
         ocreClaro='#EABD79', azul='#8F9DA3', verde='#4ADE80')
R = {t: 'data:image/png;base64,' + b64(os.path.join(sys.argv[2], f'rl_{t}.png')) for t in ('10.8', '6.8', '7.2')}
GRAO = '<svg class="abs" style="opacity:.08;mix-blend-mode:multiply" width="1080" height="1920"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>'
# poucos fragmentos: canto superior e base (leitura limpa no celular)
FRAG = f'''<svg class="abs" width="1080" height="1920" viewBox="0 0 1080 1920">
<polygon points="880,0 1080,0 1080,230" fill="{C['ocre']}" opacity=".9"/><polygon points="740,0 900,0 820,90" fill="{C['terracota']}" opacity=".9"/>
<polygon points="0,1920 0,1720 300,1800 380,1920" fill="{C['terracota']}" opacity=".93"/>
<polygon points="250,1920 380,1770 620,1920" fill="{C['azul']}" opacity=".85"/></svg>'''
# riscos de tensão ao lado do olhar
RISCOS = lambda x, y, cor: f'''<svg class="abs" style="left:{x}px;top:{y}px" width="140" height="160" viewBox="0 0 140 160">
<path d="M20 30 L60 70 M10 85 L62 92 M30 140 L70 110" stroke="{cor}" stroke-width="9" stroke-linecap="round"/></svg>'''

def carimbo(txt, x, y, rot=-9, size=200):
    return (f'<div class="abs" style="left:{x}px;top:{y}px;transform:rotate({rot}deg);border:14px solid {C["tf"]};color:{C["tf"]};'
            f'font:400 {size}px/1 Bebas;padding:16px 40px 0;background:{C["osso"]}F0;letter-spacing:6px;box-shadow:0 14px 34px rgba(0,0,0,.3);white-space:nowrap">{txt}</div>')

def manchete(linhas, tam, marca):
    return ''.join(f'<div class="ln"><span style="background:linear-gradient(transparent 18%,{marca} 18%,{marca} 88%,transparent 88%);padding:0 14px;'
                   f'box-decoration-break:clone">{l}</span></div>' for l in linhas)

def pagina(bg, frag, kicker, linhas, tam, marca, rosto, rosto_css, extra):
    k = f'<div class="kick">{kicker}</div><div class="fio"></div>' if kicker else ''
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>{FONTS}
*{{margin:0;padding:0;box-sizing:border-box}} body{{width:1080px;height:1920px;overflow:hidden;background:{bg};position:relative}}
.abs{{position:absolute}}
.rosto{{position:absolute;{rosto_css};filter:drop-shadow(7px 0 0 {C['osso']}) drop-shadow(-7px 0 0 {C['osso']}) drop-shadow(0 7px 0 {C['osso']}) drop-shadow(0 -7px 0 {C['osso']})}}
.txt{{position:absolute;left:62px;top:250px;width:980px}}
.kick{{font:800 52px/1 BarlowC;color:{C['tf']};letter-spacing:1px;padding-left:14px}}
.fio{{width:240px;height:6px;background:{C['terracota']};margin:20px 0 10px 14px}}
.ln{{font:400 {tam}px/.9 Bebas;color:{C['grafite']};letter-spacing:2px;margin-bottom:6px}}
</style></head><body>{GRAO}{frag}<img class="rosto" src="{rosto}">{extra}
<div class="txt">{k}{manchete(linhas, tam, marca)}</div></body></html>'''

CAMERA = f'''<svg class="abs" style="left:40px;top:1290px;transform:rotate(-10deg)" width="380" height="320" viewBox="0 0 430 360">
<rect x="20" y="80" width="390" height="250" rx="34" fill="{C['grafite']}" stroke="{C['osso']}" stroke-width="12"/>
<rect x="120" y="40" width="130" height="60" rx="14" fill="{C['grafite']}" stroke="{C['osso']}" stroke-width="12"/>
<circle cx="215" cy="205" r="92" fill="{C['osso']}"/><circle cx="215" cy="205" r="66" fill="{C['grafite']}"/><circle cx="190" cy="180" r="18" fill="{C['osso']}" opacity=".8"/></svg>
<div class="abs" style="left:250px;top:1220px;transform:rotate(9deg);font:800 74px/1 BarlowC;color:{C['tf']};background:{C['osso']};padding:10px 22px 6px;border:7px solid {C['tf']}">
<span style="display:inline-block;width:42px;height:42px;border-radius:50%;background:{C['tf']};margin-right:12px;vertical-align:4px"></span><s style="text-decoration-thickness:10px">REC</s></div>'''

CURSOR = f'''<svg class="abs" style="left:60px;top:1130px;transform:rotate(-14deg)" width="330" height="420" viewBox="0 0 33 42">
<path d="M2 2 L2 34 L10 27 L15.5 39 L21 36.6 L15.6 25 L26 25 Z" fill="{C['osso']}" stroke="{C['grafite']}" stroke-width="2" stroke-linejoin="round"/></svg>
<div class="abs" style="left:250px;top:1500px;font:800 72px/1 BarlowC;color:{C['grafite']};background:{C['verde']};padding:14px 28px 10px;transform:rotate(-4deg);box-shadow:0 10px 26px rgba(0,0,0,.3)">✓ ESCOLHI ESTA</div>'''

MONT_CSS = 'height:2500px;right:-260px;top:330px'
CAPAS = {
  'montagem-bastidores-inveja__palavras': pagina(C['creme'], FRAG, 'BASTIDORES', ['EU ACHEI', 'QUE SABIA…'], 240, C['ocreClaro'], R['10.8'], MONT_CSS,
      carimbo('ERROU FEIO.', 24, 1420, -8, 190) + RISCOS(150, 860, C['grafite'])),
  'montagem-bastidores-inveja__luiz': pagina(C['ocre'], '', 'BASTIDORES', ['EU ACHEI', 'QUE SABIA…'], 240, C['creme'], R['10.8'], MONT_CSS,
      carimbo('ERROU FEIO.', 24, 1420, -8, 190) + RISCOS(150, 860, C['grafite'])),
  'frase-escolhida__palavras': pagina(C['creme'], FRAG, 'BASTIDORES · INVEJA', ['A IA ME DEU', 'OPÇÕES…'], 240, C['ocreClaro'], R['7.2'],
      'height:2450px;right:-420px;top:470px', CURSOR),
  'botao-da-foto__luiz': pagina(C['ocre'], '', 'BASTIDOR', ['GRAVEI 10', 'MINUTOS E…'], 240, C['creme'], R['6.8'],
      'height:2450px;right:-420px;top:470px', CAMERA),
}

out = sys.argv[1]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    for nome, h in CAPAS.items():
        pg.set_content(h); pg.wait_for_timeout(500); pg.screenshot(path=f'{out}/{nome}.png')
    b.close()
im = Image.open(f'{out}/botao-da-foto__luiz.png').convert('RGB')
ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1).convert('RGB').save(f'{out}/botao-da-foto-pb__luiz.png')
print('ok')
