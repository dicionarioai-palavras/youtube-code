# EP05 (Norrmalmstorg), thumbs pela receita 6c. Título: "Why the Hostages Defended Their Captors (It Wasn't Stockholm Syndrome)".
# Uso: TMB_IMAGENS=<pasta com os .jpg> python thumbs_ep05.py → thumb-ep05-a/b/c.jpg
from thumb_lib import *
from tinta import texto_tinta, faixa_tinta
SANGUE=(150,14,20); PAREDE=(240,234,220)
def sombra_esq(im, x0=420, x1=760, a=205):
    g=Image.new('L',(W,1)); [g.putpixel((x,0),int(a*max(0,min(1,(x1-x)/(x1-x0))))) for x in range(W)]
    im.paste(Image.new('RGB',(W,H),TINTA),(0,0),g.resize((W,H))); return im
def nitida(im): return im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
im=base('t1-thumb-fone',zoom=1.08,cx=0.85,cy=0.45,bright=1.1,contrast=1.25,sat=1.15); im=nitida(im); im=sombra_esq(im)
im=texto_tinta(im,['AFRAID OF','THE POLICE'],34,40,150,PAREDE,gap=0.92); im=faixa_tinta(im,'NOT HIM',40,360,120,SANGUE,PAREDE)
im.save('thumb-ep05-a.jpg',quality=95)
im=base('t2-thumb-fichas',zoom=1.05,cx=0.85,cy=0.5,bright=1.12,contrast=1.3,sat=1.15); im=nitida(im); im=sombra_esq(im,460,800,215)
im=texto_tinta(im,['92%','NEVER GET IT'],34,40,160,PAREDE,gap=0.92); im=faixa_tinta(im,'THE MYTH',40,380,115,SANGUE,PAREDE)
im.save('thumb-ep05-b.jpg',quality=95)
im=base('t3-thumb-porta',zoom=1.05,cx=0.85,cy=0.5,bright=1.12,contrast=1.3,sat=1.15); im=nitida(im); im=sombra_esq(im,460,800,215)
im=texto_tinta(im,["IT WASN'T",'LOVE.'],34,40,170,PAREDE,gap=0.92); im=faixa_tinta(im,'6 DAYS',40,390,120,SANGUE,PAREDE)
im.save('thumb-ep05-c.jpg',quality=95)
