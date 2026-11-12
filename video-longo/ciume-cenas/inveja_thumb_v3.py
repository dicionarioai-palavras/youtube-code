from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, sys
B='/home/claude/s1329/BebasNeue.ttf'
OSSO=(251,233,194); TERRA=(196,109,69)
ICON=Image.open('_icone-osso.png').convert('RGBA').resize((64,64))
def shadowtext(im, fn, blur=14, forca=.85):
    L=Image.new('RGBA',im.size); fn(ImageDraw.Draw(L))
    sh=L.split()[3].filter(ImageFilter.GaussianBlur(blur)).point(lambda v:int(v*forca))
    b=im.convert('RGBA'); b.paste((0,0,0,255),(0,6),sh); return Image.alpha_composite(b,L)
im=Image.open('v3.png').convert('RGB').resize((1280,720),Image.LANCZOS)
a=np.asarray(im,np.float32); xx=np.arange(1280)[None,:,None]; g=np.clip(1-(xx-120)/560,0,1)*0.6
im=Image.fromarray((a*(1-g)).astype('uint8'))
S=int(sys.argv[1]) if len(sys.argv)>1 else 132
def c(d):
    f=ImageFont.truetype(B,S); x=52; lh=int(S*0.93)
    y0=250
    d.text((x,y0),'SE ALGUÉM',font=f,fill=OSSO+(255,),anchor='ls')
    d.text((x,y0+lh),'TE FALA ISSO,',font=f,fill=OSSO+(255,),anchor='ls')
    d.text((x,y0+2*lh),'É ',font=f,fill=OSSO+(255,),anchor='ls')
    xi=x+d.textlength('É ',font=f)+14
    w=d.textlength('INVEJA',font=f); yb=y0+2*lh
    d.rectangle((xi-10,yb-int(S*0.853),xi+w+12,yb+int(S*0.08)),fill=TERRA+(255,))
    d.text((xi,yb),'INVEJA',font=f,fill=OSSO+(255,),anchor='ls')
    print('largura max',x+d.textlength('TE FALA ISSO,',font=f))
r=shadowtext(im,c); r.alpha_composite(ICON,(28,28)); r.convert('RGB').save('INVEJA-v4-esq.jpg',quality=92)
