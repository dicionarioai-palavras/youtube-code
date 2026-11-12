# Texto e faixa com aspecto de tinta (entre tinta de parede e tinta digital): cor irregular, pinceladas, bordas levemente ásperas.
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
from thumb_lib import B, W, H
rng=np.random.default_rng(7)
def ruido(w,h,escala,blur):
    n=Image.fromarray((rng.random((h//escala+1,w//escala+1))*255).astype('uint8')).resize((w,h),Image.BICUBIC)
    return n.filter(ImageFilter.GaussianBlur(blur))
def pinceladas(w,h):
    n=Image.fromarray((rng.random((h,w))*255).astype('uint8'))
    n=n.resize((w//6,h)).resize((w,h),Image.BICUBIC)        # estica na horizontal = rastro de pincel
    return n.filter(ImageFilter.BoxBlur(2))
def textura_cor(w,h,cor,var=0.22):
    a=np.asarray(ruido(w,h,40,6),dtype=float)/255; b=np.asarray(pinceladas(w,h),dtype=float)/255
    m=1+(0.6*(a-0.5)+0.4*(b-0.5))*2*var
    c=np.clip(np.array(cor)[None,None,:]*m[...,None],0,255).astype('uint8')
    return Image.fromarray(c,'RGB')
def borda_aspera(mask,forca=2):
    r=ruido(mask.width,mask.height,6,1)
    m=np.asarray(mask,dtype=float)+ (np.asarray(r,dtype=float)-128)*0.9
    m=Image.fromarray(np.clip(m,0,255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.8))
    return m.point(lambda v:255 if v>140 else 0).filter(ImageFilter.GaussianBlur(0.6))
def pintar(im,mask,cor,var=0.22,sombra=True):
    mask=borda_aspera(mask)
    if sombra:
        sh=Image.new('RGBA',im.size,(0,0,0,0)); sh.putalpha(mask.filter(ImageFilter.GaussianBlur(7)).point(lambda v:int(v*0.8)))
        im.paste(Image.new('RGB',im.size,(0,0,0)),(6,8),sh.split()[3])
    im.paste(textura_cor(im.width,im.height,cor,var),(0,0),mask); return im
def texto_tinta(im,linhas,x,y,tam,cor,gap=0.9):
    f=ImageFont.truetype(B,tam); m=Image.new('L',im.size,0); d=ImageDraw.Draw(m)
    for t in linhas: d.text((x,y),t,font=f,fill=255); y+=int(tam*gap)
    return pintar(im,m,cor)
def faixa_tinta(im,txt,x,y,tam,cor_faixa,cor_txt,pad=18):
    f=ImageFont.truetype(B,tam); d0=ImageDraw.Draw(im); bb=d0.textbbox((0,0),txt,font=f)
    w=bb[2]-bb[0]+2*pad; h=bb[3]-bb[1]+2*pad+6
    m=Image.new('L',im.size,0); ImageDraw.Draw(m).rectangle((x,y,x+w,y+h),fill=255)
    im=pintar(im,m,cor_faixa,var=0.28)
    mt=Image.new('L',im.size,0); ImageDraw.Draw(mt).text((x+pad-bb[0],y+pad-bb[1]),txt,font=f,fill=255)
    return pintar(im,mt,cor_txt,var=0.12,sombra=False)
