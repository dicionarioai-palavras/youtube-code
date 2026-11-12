# EP04 (Mary Celeste), thumbs pela receita 6c. Título: "What Really Happened to the Mary Celeste? (Not the Warm Tea)".
# Uso: TMB_IMAGENS=<pasta com os .jpg> python thumbs_ep04.py → thumb-ep04-a/b/c.jpg
from thumb_lib import *
from tinta import texto_tinta, faixa_tinta
SANGUE=(150,14,20); PAREDE=(240,234,220); TINTA_P=(20,18,16)
def sombra_esq(im, x0=420, x1=760, a=205):
    g=Image.new('L',(W,1)); [g.putpixel((x,0),int(a*max(0,min(1,(x1-x)/(x1-x0))))) for x in range(W)]
    im.paste(Image.new('RGB',(W,H),TINTA),(0,0),g.resize((W,H))); return im
def nitida(im): return im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
im=base('t1-thumb-xicara',zoom=1.1,cx=0.85,cy=0.55,bright=1.1,contrast=1.25,sat=1.15); im=nitida(im); im=sombra_esq(im)
im=texto_tinta(im,['THE WARM','TEA.'],34,40,170,PAREDE,gap=0.92); im=faixa_tinta(im,'WAS FAKE',40,390,120,SANGUE,PAREDE)
im.save('thumb-ep04-a.jpg',quality=95)
im=base('t2-thumb-navio',zoom=1.05,cx=0.8,cy=0.5,bright=1.12,contrast=1.3,sat=1.15); im=nitida(im); im=sombra_esq(im,460,800,215)
im=texto_tinta(im,['THE SHIP','SURVIVED.'],34,40,150,PAREDE,gap=0.92); im=faixa_tinta(im,"THEY DIDN'T",40,360,115,SANGUE,PAREDE)
im.save('thumb-ep04-b.jpg',quality=95)
im=base('c22',zoom=1.1,cx=0.6,cy=0.5,bright=1.15,contrast=1.3,sat=1.1); im=nitida(im); im=sombra_esq(im,430,780,215)
im=texto_tinta(im,['NO','LIFEBOAT.'],34,40,170,PAREDE,gap=0.92); im=faixa_tinta(im,'WHY?',40,390,150,SANGUE,PAREDE)
im.save('thumb-ep04-c.jpg',quality=95)
