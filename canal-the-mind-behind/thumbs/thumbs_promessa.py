# Thumbs novas (estudo "Por que alguém clica", 07/11/2026): 1 figura, 1 elemento estranho, até 3 palavras que completam o título.
# Uso: TMB_IMAGENS=<pasta com os .jpg> python thumbs_promessa.py
from thumb_lib import *
from tinta import texto_tinta, faixa_tinta
SANGUE=(150,14,20); PAREDE=(240,234,220); TINTA_P=(20,18,16)
def sombra_esq(im, x0=420, x1=760, a=205):
    g=Image.new('L',(W,1)); [g.putpixel((x,0),int(a*max(0,min(1,(x1-x)/(x1-x0))))) for x in range(W)]
    im.paste(Image.new('RGB',(W,H),TINTA),(0,0),g.resize((W,H))); return im
def nitida(im): return im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
# EP03 — título "BTK Asked Police If a Floppy Disk Could Be Traced. They Said No."
im=base('t4-promessa-disquete',zoom=1.15,cx=0.72,cy=0.35,bright=1.08,contrast=1.25,sat=1.2); im=nitida(im); im=sombra_esq(im,380,640,190)
im=texto_tinta(im,['IT'],40,90,230,PAREDE,gap=0.9); im=faixa_tinta(im,'COULD.',40,330,190,SANGUE,PAREDE)
im.save('thumb-ep03-NOVA-A-USAR-it-could.jpg',quality=95)
im=base('t5-promessa-alarme',zoom=1.35,cx=0.95,cy=0.55,bright=1.15,contrast=1.25,sat=1.15); im=nitida(im); im=sombra_esq(im,420,700,200)
im=texto_tinta(im,['HE WIRED'],40,120,170,PAREDE,gap=0.9); im=faixa_tinta(im,'THEIR ALARMS',40,330,130,SANGUE,PAREDE)
im.save('thumb-ep03-NOVA-B-testar-he-wired-alarms.jpg',quality=95)
# EP04 — título "You'd Have Abandoned the Mary Celeste Too (Here's Why)"
im=base('t4-promessa-bote',zoom=1.1,cx=0.9,cy=0.5,bright=1.05,contrast=1.25,sat=1.1); im=nitida(im)
im=texto_tinta(im,["IT DIDN'T"],40,140,165,TINTA_P,gap=0.9); im=faixa_tinta(im,'SINK.',40,330,190,SANGUE,PAREDE)
im.save('thumb-ep04-NOVA-A-USAR-it-didnt-sink.jpg',quality=95)
# EP05 — título "You'd Defend Your Captor Too (It's Not Stockholm Syndrome)"
im=base('c01b-kristin',zoom=1.25,cx=0.3,cy=0.3,bright=1.1,contrast=1.2,sat=1.15); im=nitida(im); im=sombra_esq(im,480,760,200)
im=texto_tinta(im,['SHE FEARED'],40,110,160,PAREDE,gap=0.9); im=faixa_tinta(im,'THE POLICE',40,320,150,SANGUE,PAREDE)
im.save('thumb-ep05-NOVA-A-USAR-she-feared-the-police.jpg',quality=95)
im=base('c23-balanca',zoom=1.2,cx=0.55,cy=0.5,bright=1.15,contrast=1.3,sat=1.15); im=nitida(im); im=sombra_esq(im,360,600,215)
im=texto_tinta(im,["IT WASN'T"],40,130,160,PAREDE,gap=0.9); im=faixa_tinta(im,'LOVE.',40,330,190,SANGUE,PAREDE)
im.save('thumb-ep05-NOVA-B-testar-it-wasnt-love.jpg',quality=95)
