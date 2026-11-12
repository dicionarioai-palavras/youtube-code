import numpy as np, random, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy import ndimage
FON='/home/claude/s1329'; BEB=f'{FON}/BebasNeue.ttf'
OSSO=(251,233,194); TERRA=(196,109,69); GRAF=(26,29,36)
src=Image.open('/home/claude/s1329/m/S27-1-celular-mesa.jpg').convert('RGB')
A=np.asarray(src).astype(np.float32)
# máscara da tela
c=A[950:1450,900:2000]; m=(c.mean(2)<22); lab,n=ndimage.label(m); s=ndimage.sum(m,lab,range(1,n+1)); mm=lab==(np.argmax(s)+1)
mm=ndimage.binary_fill_holes(ndimage.binary_opening(mm,iterations=3))
M=np.zeros(A.shape[:2],np.float32); M[950:1450,900:2000]=mm
M=np.asarray(Image.fromarray((M*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.5)),np.float32)/255
# mapa claro (retrato 600x1200) com alfinete terracota
w,h=700,1300; mp=Image.new('RGB',(w,h),(38,42,52)); d=ImageDraw.Draw(mp); random.seed(4)
for i in range(-3,16):
    y=i*95+random.randint(-20,20); d.line([(-50,y),(w+50,y+random.randint(-60,60))],fill=(78,84,98),width=random.choice([10,14,22]))
for i in range(-2,9):
    x=i*105+random.randint(-20,20); d.line([(x,-50),(x+random.randint(-80,80),h+50)],fill=(78,84,98),width=random.choice([10,14,22]))
d.line([(-50,300),(w+50,1000)],fill=(120,104,86),width=30)
d.polygon([(420,120),(640,90),(690,330),(470,360)],fill=(46,62,52))
px,py=w//2,h//2+40
for r in (260,180): d.ellipse([px-r,py-r*.5,px+r,py+r*.5],outline=TERRA,width=10)
S=1.9; d.ellipse([px-70*S,py-230*S,px+70*S,py-90*S],fill=TERRA); d.polygon([(px-62*S,py-140*S),(px+62*S,py-140*S),(px,py)],fill=TERRA); d.ellipse([px-28*S,py-188*S,px+28*S,py-132*S],fill=OSSO)
d.rounded_rectangle([40,40,w-40,140],40,fill=(60,64,74)); d.ellipse([70,70,110,110],fill=(120,120,130))
# perspectiva: cantos da tela no quadro (x,y) — topo do celular à esquerda
dst=[(1050,1115),(1380,1058),(1870,1245),(1530,1320)]  # TL,TR,BR,BL
srcpts=[(0,0),(w,0),(w,h),(0,h)]
# ordem para o celular deitado: topo do mapa = borda curta esquerda
dst=[(1380,1058),(1870,1245),(1530,1320),(1050,1115)]
def coeffs(pa,pb):
    mtx=[]
    for p1,p2 in zip(pa,pb):
        mtx.append([p1[0],p1[1],1,0,0,0,-p2[0]*p1[0],-p2[0]*p1[1]]); mtx.append([0,0,0,p1[0],p1[1],1,-p2[1]*p1[0],-p2[1]*p1[1]])
    return np.linalg.solve(np.array(mtx,float),np.array(pb,float).reshape(8))
cf=coeffs(dst,srcpts)
war=np.asarray(mp.transform(src.size,Image.PERSPECTIVE,tuple(cf),Image.BICUBIC),np.float32)
tela=np.clip(war*1.15,0,255)
out=A*(1-M[...,None])+tela*M[...,None]
# brilho da tela sobre a mesa
glow=np.asarray(Image.fromarray((M*255).astype('uint8')).filter(ImageFilter.GaussianBlur(90)),np.float32)[...,None]/255
out=out+np.array([210,220,235],np.float32)*glow*0.35
out=np.clip(out,0,255).astype('uint8'); im=Image.fromarray(out)
# enquadramento 16:9 em torno do celular, com espaço para texto à esquerda/topo
cx,cy,zw=1430,1090,1950; zh=zw*9/16
im=im.crop((int(cx-zw*0.62),int(cy-zh*0.55),int(cx+zw*0.38),int(cy+zh*0.45))).resize((1280,720),Image.LANCZOS)
a=np.asarray(im,np.float32)
yy,xx=np.mgrid[0:720,0:1280]; vin=np.clip(1.15-0.55*(((xx-760)/760)**2+((yy-430)/520)**2),0.45,1)[...,None]
im=Image.fromarray(np.clip(a*vin,0,255).astype('uint8'))
dr=ImageDraw.Draw(im)
f=ImageFont.truetype(BEB,190)
L=Image.new('RGBA',im.size); dl=ImageDraw.Draw(L)
dl.text((60,40),'SÓ',font=f,fill=OSSO+(255,)); dl.text((60,200),'CUIDADO…',font=f,fill=OSSO+(255,))
sh=L.split()[3].filter(ImageFilter.GaussianBlur(14)).point(lambda v:int(v*.7))
b=im.convert('RGBA'); b.paste((0,0,0,255),(0,6),sh); b=Image.alpha_composite(b,L)
ic=Image.open('_icone-osso.png').convert('RGBA').resize((64,64)); b.paste(ic,(1280-64-28,28),ic)
b.convert('RGB').save('CIUME-B1-controle.jpg',quality=92)
