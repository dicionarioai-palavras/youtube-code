# EP03 (BTK), thumbs pela receita 6c. Título: "BTK Hid for 30 Years. Then He Asked Police to Be Honest" → thumb complementa.
# Uso: TMB_IMAGENS=<pasta com os .jpg> python thumbs_ep03.py → thumb-ep03-a/b/c.jpg
from thumb_lib import *
from tinta import texto_tinta, faixa_tinta
SANGUE=(150,14,20); PAREDE=(240,234,220); TINTA_P=(20,18,16)
def sombra_esq(im, x0=420, x1=760, a=205):
    g=Image.new('L',(W,1)); [g.putpixel((x,0),int(a*max(0,min(1,(x1-x)/(x1-x0))))) for x in range(W)]
    im.paste(Image.new('RGB',(W,H),TINTA),(0,0),g.resize((W,H))); return im
def nitida(im): return im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
# (a) o disquete roxo gigante
im=base('t1-thumb-disquete',zoom=1.05,cx=0.8,cy=0.4,bright=1.12,contrast=1.3,sat=1.2); im=nitida(im); im=sombra_esq(im)
im=texto_tinta(im,['30 YEARS.','ONE DISK.'],34,40,150,PAREDE,gap=0.92); im=faixa_tinta(im,'HIS NAME',40,350,130,SANGUE,PAREDE)
im.save('thumb-ep03-a.jpg',quality=95)
# (b) o cartão sob a luminária
im=base('t2-thumb-cartao',zoom=1.1,cx=0.85,cy=0.45,bright=1.1,contrast=1.3,sat=1.15); im=nitida(im); im=sombra_esq(im,440,780,215)
im=texto_tinta(im,['"BE','HONEST."'],34,40,170,PAREDE,gap=0.92); im=faixa_tinta(im,'HIS MISTAKE',40,390,110,SANGUE,PAREDE)
im.save('thumb-ep03-b.jpg',quality=95)
# (c) fundo claro: o homem comum e a sombra
im=base('t3-thumb-homem',zoom=1.15,cx=0.8,cy=0.5,bright=1.05,contrast=1.2,sat=1.1); im=nitida(im)
im=texto_tinta(im,['HE WIRED','THEIR ALARMS'],34,40,140,TINTA_P,gap=0.92); im=faixa_tinta(im,'BTK',40,340,150,SANGUE,PAREDE)
im.save('thumb-ep03-c.jpg',quality=95)
