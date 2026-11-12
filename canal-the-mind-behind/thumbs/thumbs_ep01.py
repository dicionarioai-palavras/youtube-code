# Thumbs do EP01 (05/11/2026). Rodar nesta pasta: python thumbs_ep01.py
# Usa as imagens do Runway do episódio (TMB_IMAGENS) e thumb_lib.py. Saída: thumb-ep01-c/d/e.jpg (1280x720).
from thumb_lib import *
# C: fachada clarificada, texto enorme à esquerda
im=base('a1-fachada',zoom=1.15,cx=0.85,cy=0.45,bright=1.35,contrast=1.15,sat=1.15)
im=grad(im,330,640,235); im=texto(im,[('38 PEOPLE',PAPEL),('WATCHED.',PAPEL)],50,40,215); im=caixa(im,'NOBODY HELPED?',55,450,150)
im.save('thumb-ep01-c.jpg',quality=92)
# D: multidão em fundo claro (linha PsychToons), figura vermelha à direita
im=base('c26-multidao-olhares',zoom=1.6,cx=0.083,cy=0.5,bright=1.05,contrast=1.25)
im=grad(im,470,760,250,color=PAPEL)
im=texto(im,[('38 WATCHED.',TINTA)],45,50,200,sombra=False); im=texto(im,[('NOBODY',VERM),('HELPED?',VERM)],45,250,215,sombra=False)
im.save('thumb-ep01-d.jpg',quality=92)
# E: mesma base, duas palavras + virada
im=base('c26-multidao-olhares',zoom=1.6,cx=0.083,cy=0.5,bright=1.05,contrast=1.25)
im=grad(im,500,780,250,color=PAPEL)
im=texto(im,[('NOBODY',TINTA),('HELPED',TINTA)],45,40,250,sombra=False,gap=0.86)
im=caixa(im,'(OR DID THEY?)',50,500,120)
im.save('thumb-ep01-e.jpg',quality=92)
