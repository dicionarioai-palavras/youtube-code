from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import os
P=os.environ.get('TMB_IMAGENS','../../remotion-redes-sociais/public/ep01/'); B=os.path.join(os.path.dirname(__file__),'BebasNeue.ttf')
PAPEL=(236,228,211); TINTA=(15,14,13); VERM=(194,51,43)
W,H=1280,720
def base(nome, zoom=1.0, cx=0.5, cy=0.5, bright=1.0, contrast=1.0, sat=1.0):
    im=Image.open(P+nome+'.jpg').convert('RGB')
    w,h=im.size; s=max(W/w,H/h)*zoom; im=im.resize((int(w*s),int(h*s)),Image.LANCZOS)
    x=int((im.width-W)*cx); y=int((im.height-H)*cy); im=im.crop((x,y,x+W,y+H))
    im=ImageEnhance.Brightness(im).enhance(bright); im=ImageEnhance.Contrast(im).enhance(contrast); im=ImageEnhance.Color(im).enhance(sat)
    return im
def grad(im, x0, x1, alpha=230, color=TINTA, lado='esq'):
    g=Image.new('L',(W,1))
    for x in range(W):
        if lado=='esq': a=alpha if x<x0 else (0 if x>x1 else int(alpha*(x1-x)/(x1-x0)))
        else: a=alpha if x>x1 else (0 if x<x0 else int(alpha*(x-x0)/(x1-x0)))
        g.putpixel((x,0),a)
    g=g.resize((W,H)); im.paste(Image.new('RGB',(W,H),color),(0,0),g); return im
def texto(im, linhas, x, y, tam, sombra=True, gap=0.9):
    d=ImageDraw.Draw(im)
    for txt,cor in linhas:
        f=ImageFont.truetype(B,tam)
        if sombra:
            sh=Image.new('RGBA',(W,H),(0,0,0,0)); ds=ImageDraw.Draw(sh)
            ds.text((x+6,y+8),txt,font=f,fill=(0,0,0,200)); sh=sh.filter(ImageFilter.GaussianBlur(6)); im.paste(sh,(0,0),sh); d=ImageDraw.Draw(im)
        d.text((x,y),txt,font=f,fill=cor,stroke_width=3 if sombra else 0,stroke_fill=TINTA)
        y+=int(tam*gap)
    return im
def caixa(im, txt, x, y, tam, fundo=VERM, cor=PAPEL, pad=18):
    d=ImageDraw.Draw(im); f=ImageFont.truetype(B,tam); bb=d.textbbox((0,0),txt,font=f)
    d.rectangle((x,y,x+bb[2]-bb[0]+2*pad,y+bb[3]-bb[1]+2*pad+6),fill=fundo); d.text((x+pad-bb[0],y+pad-bb[1]),txt,font=f,fill=cor); return im

def acabamento(im, cor=1.3, contraste=1.12, nitidez=True):
    """Passo final obrigatório (05/11/2026): cores vivas e imagem nítida, sem aspecto fosco.
    No EP01, só esse ajuste levou a thumb de 82 para 84 no vidIQ."""
    im = ImageEnhance.Color(im).enhance(cor)
    im = ImageEnhance.Contrast(im).enhance(contraste)
    if nitidez:
        im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=140, threshold=2))
    return im
