# EP01, thumb v5 (05/11/2026): fundo da F (mais contraste e nitidez) + texto e faixa com aspecto de tinta.
from thumb_lib import *
from tinta import texto_tinta, faixa_tinta
SANGUE=(150,14,20)        # vermelho profundo, de tinta, quase sangue
PAREDE=(240,234,220)      # branco de tinta de parede, levemente quente
def fundo():
    im=base('a1-fachada',zoom=1.15,cx=0.85,cy=0.45,bright=1.3,contrast=1.3,sat=1.2)
    im=im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
    return grad(im,330,640,235)
for nome,l2,faixa in [('h','WATCHED.','NOBODY HELPED?'),('i','WATCHED?','IT WAS A MYTH.')]:
    im=fundo(); im=texto_tinta(im,['38 PEOPLE',l2],50,40,215,PAREDE); im=faixa_tinta(im,faixa,55,450,150,SANGUE,PAREDE)
    im.save(f'thumb-ep01-{nome}.jpg',quality=95)
