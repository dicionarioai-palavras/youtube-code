# EP01, thumb v6 (06/11/2026): cena nova do Runway (mulher de casaco vermelho em primeiro plano à direita,
# silhueta do homem ao fundo sob o poste) + texto e faixa com aspecto de tinta, no alto, sem cobrir as duas figuras.
from thumb_lib import *
from tinta import texto_tinta, faixa_tinta
SANGUE=(150,14,20); PAREDE=(240,234,220)
def fundo(nome):
    im=base(nome,zoom=1.0,cx=0.5,cy=0.5,bright=1.15,contrast=1.3,sat=1.2)
    im=im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
    # sombra no alto (faixa do texto), em vez de à esquerda
    g=Image.new('L',(1,H)); [g.putpixel((0,y),int(215*max(0,min(1,(330-y)/150)))) for y in range(H)]
    im.paste(Image.new('RGB',(W,H),TINTA),(0,0),g.resize((W,H))); return im
for nome,l1,faixa in [('j','38 PEOPLE WATCHED.','NOBODY HELPED?'),('k','38 PEOPLE WATCHED?','IT WAS A MYTH.')]:
    im=fundo('t5-thumb-silhueta-poste'); im=texto_tinta(im,[l1],40,10,175,PAREDE); im=faixa_tinta(im,faixa,45,190,125,SANGUE,PAREDE)
    im.save(f'thumb-ep01-{nome}.jpg',quality=95)
