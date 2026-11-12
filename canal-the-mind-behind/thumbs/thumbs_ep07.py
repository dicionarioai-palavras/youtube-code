# EP07 — título "The Dancing Plague of 1518: Why You Would Have Joined Them" (PROMESSA.md, 08/11/2026)
from thumb_lib import *
from tinta import texto_tinta, faixa_tinta
SANGUE=(150,14,20); PAREDE=(240,234,220)
def nitida(im): return im.filter(ImageFilter.UnsharpMask(radius=1.6,percent=120,threshold=3))
im=base('t1-thumb-musica',zoom=1.15,cx=0.7,cy=0.45,bright=1.08,contrast=1.25,sat=1.15); im=nitida(im)
im=texto_tinta(im,['THE CURE:'],40,100,120,PAREDE,gap=0.9); im=faixa_tinta(im,'MORE MUSIC',40,300,150,SANGUE,PAREDE)
im.save('thumb-ep07-NOVA-A-USAR-the-cure-more-music.jpg',quality=95)
im=base('t2-thumb-primeira',zoom=1.12,cx=0.68,cy=0.5,bright=1.08,contrast=1.25,sat=1.15); im=nitida(im)
im=texto_tinta(im,['SHE','DANCED'],30,70,120,PAREDE,gap=0.9); im=faixa_tinta(im,'FIRST.',30,360,150,SANGUE,PAREDE)
im.save('thumb-ep07-NOVA-B-testar-she-danced-first.jpg',quality=95)
