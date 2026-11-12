# Thumb final do EP01 (05/11/2026): versão C com cores vivas, mais nítida e sombra mais leve atrás do texto.
from thumb_lib import *
im=base('a1-fachada',zoom=1.15,cx=0.85,cy=0.45,bright=1.4,contrast=1.2,sat=1.3)
im=grad(im,300,600,200)           # sombra mais curta e mais leve que na C (era 235 até 640): menos fosco
im=acabamento(im)
im=texto(im,[('38 PEOPLE',PAPEL),('WATCHED.',PAPEL)],50,40,215); im=caixa(im,'NOBODY HELPED?',55,450,150)
im.save('thumb-ep01-final.jpg',quality=95)
