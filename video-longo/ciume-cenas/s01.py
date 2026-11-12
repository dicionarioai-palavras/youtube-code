# Ciúme · S01 — "A frase que ninguém acredita" (0:00–0:11,5 da narração final) — v2 (Luiz, 11/11/2026)
# Foto desfocada ao fundo + frase na frente, palavra a palavra (fade fluido) → frase some enquanto a foto ganha
# nitidez → zoom contínuo até perto dos olhos. Vídeo MUDO (som fica no Premiere).
# Uso: python3 s01.py <pasta-ciume> <fonte-bebas.ttf> <pasta-saida>
import sys, os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
BASE, FONTE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
W, H, FPS, DUR = 1920, 1080, 30, 11.5
CREME, ESC = (251,233,194), (18,19,22)
PAL = [('NÃO',0.16),('É',0.56),('CIÚME,',0.76),('É',1.52),('CUIDADO.',1.72)]   # transcrição do Premiere
T_SAI, T_NITIDO = 2.90, 5.40      # frase some e a foto ganha nitidez (logo depois de "cuidado.")
BLUR_MAX, ESCURO_MAX = 38, 0.55
def sstep(x): x=max(0.0,min(1.0,x)); return x*x*(3-2*x)
def smoother(x): x=max(0.0,min(1.0,x)); return x*x*x*(x*(6*x-15)+10)

font = ImageFont.truetype(FONTE, 190); esp = font.getlength(' ')
larg = [font.getlength(p) for p,_ in PAL]; total = sum(larg)+esp*(len(PAL)-1)
asc, desc = font.getmetrics(); y0 = (H-(asc+desc))/2
xs=[]; x=(W-total)/2
for l in larg: xs.append(x); x+=l+esp
# camada de cada palavra (com sombra macia para ler sobre a foto)
camadas=[]
for i,(p,_) in enumerate(PAL):
    pad=60; lw=int(larg[i])+2*pad; lh=asc+desc+2*pad
    sombra=Image.new('L',(lw,lh),0); ImageDraw.Draw(sombra).text((pad,pad+6),p,font=font,fill=170)
    sombra=sombra.filter(ImageFilter.GaussianBlur(14))
    txt=Image.new('L',(lw,lh),0); ImageDraw.Draw(txt).text((pad,pad),p,font=font,fill=255)
    camadas.append((sombra,txt,pad))

foto = Image.open(os.path.join(BASE,'videos/imagens-e-videos/S1.jpg')).convert('RGB')
FOCO = (720, 640)   # entre os olhos
def quadro_foto(t):
    k = smoother(t/DUR); z = 1.0 + 0.55*k
    fw, fh = W/z, H/z
    cx = 960 + (FOCO[0]-960)*k; cy = 636 + (FOCO[1]-636)*k
    cx = min(max(cx,fw/2),foto.width-fw/2); cy = min(max(cy,fh/2),foto.height-fh/2)
    return foto.transform((W,H),Image.EXTENT,(cx-fw/2,cy-fh/2,cx+fw/2,cy+fh/2),Image.BICUBIC)

raw = os.path.join(OUT,'S01-ciume-v2.mp4')
p = subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
     '-an','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',raw], stdin=subprocess.PIPE)
for n in range(round(DUR*FPS)):
    t = n/FPS
    nit = smoother((t-T_SAI)/(T_NITIDO-T_SAI))          # 0 = desfocada, 1 = nítida
    im = quadro_foto(t)
    r = BLUR_MAX*(1-nit)
    if r > 0.3:
        peq = im.resize((W//2,H//2),Image.BILINEAR).filter(ImageFilter.GaussianBlur(r/2))
        im = peq.resize((W,H),Image.BICUBIC)
    esc = ESCURO_MAX*(1-nit)
    if esc > 0.005: im = Image.blend(im, Image.new('RGB',(W,H),ESC), esc)
    vis = 1-sstep((t-T_SAI)/((T_NITIDO-T_SAI)*0.75))       # frase some um pouco antes da nitidez total
    if vis > 0:
        for i,(pal,ti) in enumerate(PAL):
            a = smoother((t-(ti-0.08))/0.55)*vis              # fade longo e suave
            if a <= 0: continue
            sombra,txt,pad = camadas[i]
            bl = 7*(1-smoother((t-(ti-0.08))/0.45))           # entra levemente desfocada → nítida
            dy = 14*(1-smoother((t-(ti-0.08))/0.55))
            if vis < 1: bl += 6*(1-vis)
            tx = txt.filter(ImageFilter.GaussianBlur(bl)) if bl>0.3 else txt
            pos = (int(xs[i]-pad), int(y0-pad+dy))
            im.paste(Image.new('RGB',sombra.size,(0,0,0)), pos, sombra.point(lambda v: int(v*a)))
            im.paste(Image.new('RGB',tx.size,CREME), pos, tx.point(lambda v: int(v*a)))
    p.stdin.write(im.tobytes())
p.stdin.close(); p.wait(); print('ok', raw)
