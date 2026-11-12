# EP02, thumbs (06/11/2026) pela receita 6c: cena própria do Runway clara e contrastada, texto em tinta onde a cena deixa espaço.
# Título do vídeo: "Dyatlov Pass: Why 9 Hikers Ran Into −30°C Without Boots" → a thumb complementa (o corte por dentro).
# Uso: TMB_IMAGENS=<pasta com os .jpg> python thumbs_ep02.py   → thumb-ep02-a/b/c.jpg
from thumb_lib import *
from tinta import texto_tinta, faixa_tinta
import numpy as np
SANGUE=(150,14,20); PAREDE=(240,234,220); TINTA_P=(20,18,16)
def sombra_esq(im, x0=380, x1=720, a=200):
    g=Image.new('L',(W,1)); [g.putpixel((x,0),int(a*max(0,min(1,(x1-x)/(x1-x0))))) for x in range(W)]
    im.paste(Image.new('RGB',(W,H),TINTA),(0,0),g.resize((W,H))); return im
def nitida(im): return im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
# (a) barraca grande com o corte vermelho (cena própria), texto à esquerda
im=base('t1-thumb-barraca-corte',zoom=1.08,cx=0.0,cy=0.55,bright=1.12,contrast=1.3,sat=1.2); im=nitida(im); im=sombra_esq(im)
im=texto_tinta(im,['CUT FROM','THE INSIDE.'],34,40,150,PAREDE,gap=0.92); im=faixa_tinta(im,'WHY?',40,340,150,SANGUE,PAREDE)
im.save('thumb-ep02-a.jpg',quality=95)
# (b) a barraca achada pelas buscas (dia, meio enterrada, corte vermelho), outro texto
im=base('c16-barraca-achada',zoom=1.15,cx=0.85,cy=0.5,bright=1.1,contrast=1.3,sat=1.2); im=nitida(im); im=sombra_esq(im,420,760,215)
im=texto_tinta(im,['9 HIKERS.','NO BOOTS.'],34,40,160,PAREDE,gap=0.92); im=faixa_tinta(im,'WHY RUN?',40,350,130,SANGUE,PAREDE)
im.save('thumb-ep02-b.jpg',quality=95)
# (c) contraprova em fundo claro (estilo PsychToons): texto preto gigante, uma palavra em vermelho
im=base('t3-thumb-claro',zoom=1.32,cx=0.75,cy=0.0,bright=1.05,contrast=1.2,sat=1.1)  # recorte alto: tira o fio vermelho sob a lanterna (lia como sangue)
im=nitida(im)
im=texto_tinta(im,['CUT FROM','THE INSIDE.'],34,60,150,TINTA_P,gap=0.92); im=faixa_tinta(im,'WHY?',40,360,150,SANGUE,PAREDE)
im.save('thumb-ep02-c.jpg',quality=95)
