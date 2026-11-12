# EP08 — título "Five Innocent Teens Confessed to a Crime. Here's How Police Made Them." (PROMESSA.md, 08/11/2026)
from thumb_lib import *
from tinta import texto_tinta, faixa_tinta
SANGUE=(150,14,20); PAREDE=(240,234,220)
def nitida(im): return im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
im=base('t1-thumb-assina',zoom=1.35,cx=0.78,cy=0.4,bright=1.1,contrast=1.25,sat=1.1); im=nitida(im); im=grad(im,0,640,alpha=215)
im=texto_tinta(im,['SIGN.'],40,110,170,PAREDE,gap=0.9); im=faixa_tinta(im,'GO HOME.',40,330,150,SANGUE,PAREDE)
im.save('thumb-ep08-NOVA-A-USAR-sign-go-home.jpg',quality=95)
im=base('t2-thumb-fita',zoom=1.2,cx=0.75,cy=0.45,bright=1.1,contrast=1.25,sat=1.1); im=nitida(im)
im=texto_tinta(im,['THE TAPE','STARTED'],30,80,125,PAREDE,gap=0.9); im=faixa_tinta(im,'LATE.',30,370,150,SANGUE,PAREDE)
im.save('thumb-ep08-NOVA-B-testar-the-tape-started-late.jpg',quality=95)
