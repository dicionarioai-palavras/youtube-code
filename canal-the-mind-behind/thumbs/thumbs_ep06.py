# EP06 — título "He Passed the Lie Detector. He Was the Green River Killer." (PROMESSA.md, 08/11/2026)
from thumb_lib import *
from tinta import texto_tinta, faixa_tinta
SANGUE=(150,14,20); PAREDE=(240,234,220)
def sombra_esq(im, x0=420, x1=760, a=205):
    g=Image.new('L',(W,1)); [g.putpixel((x,0),int(a*max(0,min(1,(x1-x)/(x1-x0))))) for x in range(W)]
    im.paste(Image.new('RGB',(W,H),TINTA),(0,0),g.resize((W,H))); return im
def nitida(im): return im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
im=base('t1-thumb-calmo',zoom=1.18,cx=0.66,cy=0.42,bright=1.1,contrast=1.25,sat=1.15); im=nitida(im); im=sombra_esq(im,430,720,200)
im=texto_tinta(im,['THE CALM'],40,110,170,PAREDE,gap=0.9); im=faixa_tinta(im,'ONE.',40,330,200,SANGUE,PAREDE)
im.save('thumb-ep06-NOVA-A-USAR-the-calm-one.jpg',quality=95)
im=base('t2-thumb-grafico',zoom=1.05,cx=0.72,cy=0.5,bright=1.1,contrast=1.3,sat=1.1); im=nitida(im)
im=texto_tinta(im,['TRUTH?'],40,260,190,PAREDE,gap=0.9)
im.save('thumb-ep06-NOVA-B-testar-truth.jpg',quality=95)
