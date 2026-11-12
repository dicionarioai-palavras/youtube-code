# Ciúme · S02 — "Prova de amor que ninguém assina" (0:11,50–0:28,75 da narração final). Vídeo MUDO.
# A (S2.png): mesa do café, aproximação lenta que desliza para o celular em "mas quando é o nosso?";
#    luz de persiana viva + poeira no ar; a luz baixa em "Pouca gente admite".
# Transição: persiana fecha e abre (0:22,36). B (S2.1.png): currículo, aproximação até o círculo;
#    uma faixa de luz passa sobre o círculo em "currículo".
# Uso: python3 s02.py <pasta-ciume> <pasta-saida> [quadro_ini quadro_fim]  (em partes; depois juntar com ffmpeg concat)
import sys, os, subprocess, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
BASE, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
W,H,FPS = 1920,1080,30
T0, T_CORTE, T1 = 11.50, 22.36, 28.75
T_NOSSO, T_ADMITE, T_CURR = 16.08, 17.60, 25.68
def sm(x): x=max(0.0,min(1.0,x)); return x*x*x*(x*(6*x-15)+10)
IMG='videos/imagens-e-videos/'
A = Image.open(os.path.join(BASE,IMG,'S2.png')).convert('RGB')
B = Image.open(os.path.join(BASE,IMG,'S2.1.png')).convert('RGB')
IW,IH = A.size   # 2752x1536

def enquadra(img, z, cx, cy):
    fw = IW/z; fh = fw*H/W
    cx=min(max(cx,fw/2),IW-fw/2); cy=min(max(cy,fh/2),IH-fh/2)
    return np.asarray(img.transform((W,H),Image.EXTENT,(cx-fw/2,cy-fh/2,cx+fw/2,cy+fh/2),Image.BICUBIC),dtype=np.float32)

# luz de persiana: faixas diagonais macias, deslizando devagar
yy,xx = np.mgrid[0:H,0:W].astype(np.float32)
diag = (xx*0.42 + yy)          # inclinação das faixas
def persiana_luz(t, fase=0.0, periodo=230.0):
    return 0.5+0.5*np.sin(2*np.pi*(diag + 9.0*t + fase)/periodo)   # faixas largas e macias (luz e sombra)
LUZ = np.array([255,214,160],np.float32)

# poeira suspensa na luz
random.seed(7)
POE=[dict(x=random.uniform(0,W),y=random.uniform(0,H),r=random.uniform(1.2,3.6),vx=random.uniform(4,14),vy=random.uniform(-10,-2),
          f=random.uniform(0,6.28),a=random.uniform(0.25,0.7)) for _ in range(90)]
def poeira(t):
    L=Image.new('L',(W,H),0); d=ImageDraw.Draw(L)
    for p in POE:
        x=(p['x']+p['vx']*t)%W; y=(p['y']+p['vy']*t+6*math.sin(t*0.7+p['f']))%H
        a=p['a']*(0.6+0.4*math.sin(t*1.3+p['f']))
        d.ellipse([x-p['r'],y-p['r'],x+p['r'],y+p['r']],fill=int(255*a))
    return np.asarray(L.filter(ImageFilter.GaussianBlur(1.1)),np.float32)/255.0

rng=np.random.default_rng(3); GRAOS=[rng.normal(0,4.5,(H,W,1)).astype(np.float32) for _ in range(6)]
vin = np.clip(1.15-0.55*(((xx-W/2)/(W/2))**2+((yy-H/2)/(H/2))**2),0.55,1.0)[...,None]

def cena_A(t):
    k=sm((t-T0)/(T_CORTE-T0)); g=sm((t-T_NOSSO)/2.6)        # desliza para o celular
    z=1.05+0.22*k
    cx=IW/2+(1830-IW/2)*g; cy=IH/2+(860-IH/2)*g
    f=enquadra(A,z,cx,cy)
    luz=persiana_luz(t)[...,None]
    baixa=1-0.16*sm((t-T_ADMITE)/1.6)                      # a luz recolhe em "Pouca gente admite"
    f = f*(0.92+0.14*luz*baixa)
    f = f*baixa
    return f, 0.55*baixa
def cena_B(t):
    k=sm((t-T_CORTE)/(T1-T_CORTE)); z=1.04+0.30*k
    cx=IW/2+(1380-IW/2)*k; cy=IH/2+(820-IH/2)*k
    f=enquadra(B,z,cx,cy)
    f = f*(0.93+0.12*persiana_luz(t,fase=40)[...,None])
    # faixa de luz larga que atravessa o papel e passa sobre o círculo em "currículo"
    pos = (t-T_CURR)*900.0
    banda=np.exp(-((diag-0.42*W/2-H/2 - pos)/110.0)**2)[...,None]
    f = f + (LUZ-f)*0.22*banda
    return f, 0.45
def persiana_fecha(f, x):   # x: 0 aberta → 1 fechada
    if x<=0: return f
    per=54.0; m = ((yy % per) < per*sm(x)).astype(np.float32)[...,None]
    m = np.asarray(Image.fromarray((m[...,0]*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)),np.float32)[...,None]/255
    return f*(1-m) + np.array([16,14,13],np.float32)*m

N=round((T1-T0)*FPS)
QI,QF=(int(sys.argv[3]),int(sys.argv[4])) if len(sys.argv)>4 else (0,N)
raw=os.path.join(OUT,f'S02-parte-{QI:04d}.mp4') if len(sys.argv)>4 else os.path.join(OUT,'S02-ciume-v1.mp4')
p=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
   '-an','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',raw],stdin=subprocess.PIPE)
for n in range(QI,min(QF,N)):
    t=T0+n/FPS
    f,pa = cena_A(t) if t<T_CORTE else cena_B(t)
    pm=poeira(t)[...,None]
    f = f + (np.array([255,235,200],np.float32)-f)*pm*pa
    if T_CORTE-0.32 < t < T_CORTE: f=persiana_fecha(f,(t-(T_CORTE-0.32))/0.32)
    elif T_CORTE <= t < T_CORTE+0.34: f=persiana_fecha(f,1-(t-T_CORTE)/0.34)
    f = f*vin + GRAOS[n%6]
    p.stdin.write(np.clip(f,0,255).astype(np.uint8).tobytes())
p.stdin.close(); p.wait(); print('ok',N,'quadros',raw)
