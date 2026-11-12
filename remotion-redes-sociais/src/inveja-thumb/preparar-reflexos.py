# Inveja — thumb T-A: prepara os reflexos das lentes (prato e chave) a partir das imagens de Luiz.
# Uso: python preparar-reflexos.py <pasta com A2-prato-cheio.png e A3-chave-carro.png> <pasta de saída>
# Recorte, espelhamento, brilho/contraste e distorção de lente (barril) com máscara circular suave.
import sys
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
src_dir, out_dir = sys.argv[1], sys.argv[2]
def barrel(im, k=0.5):
    a=np.asarray(im).astype(np.float32); h,w=a.shape[:2]
    yy,xx=np.mgrid[0:h,0:w]; x=(xx-w/2)/(w/2); y=(yy-h/2)/(h/2); r=np.sqrt(x*x+y*y)
    f=(1+k)/(1+k*r*r)
    sx=np.clip(x/f*(w/2)+w/2,0,w-1).astype(int); sy=np.clip(y/f*(h/2)+h/2,0,h-1).astype(int)
    out=a[sy,sx]; mask=np.clip((1.02-r)/0.3,0,1)*255
    return Image.fromarray(np.dstack([out[...,:3],mask]).astype(np.uint8),'RGBA')
p=Image.open(f'{src_dir}/A2-prato-cheio.png').convert('RGB').crop((610,0,2130,1520)).resize((800,800),Image.LANCZOS).transpose(Image.FLIP_LEFT_RIGHT)
barrel(ImageEnhance.Contrast(p).enhance(1.12),0.5).save(f'{out_dir}/refl-prato.png')
src=Image.open(f'{src_dir}/A3-chave-carro.png').convert('RGB'); W,H=src.size
bg=src.resize((W//8,H//8)).filter(ImageFilter.GaussianBlur(4)).resize((W+1400,H+1400)); bg.paste(src,(700,700))
bg=bg.rotate(28,resample=Image.BICUBIC,center=(2300,1340))
k=bg.crop((2300-1180,1340-1180,2300+1180,1340+1180)).resize((800,800),Image.LANCZOS).transpose(Image.FLIP_LEFT_RIGHT)
k=ImageEnhance.Contrast(ImageEnhance.Brightness(k).enhance(1.8)).enhance(1.3)
barrel(k,0.45).save(f'{out_dir}/refl-chave.png')
