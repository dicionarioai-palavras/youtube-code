import numpy as np, subprocess, wave
src=open('lib.py').read().split('DUR=75.07')[0]
exec(src)
U='/mnt/user-data/uploads/Redes-sociais/audios/'
FX='/mnt/user-data/uploads/Redes-sociais/audios/youtube-e-freesound-all/01-youtube/efeitos/youtube_efeitos_01/audio/efeitos/'
DURS=4786/24; N=int(DURS*SR)
def load(fn,ss=0,dur=None):
    cmd=['ffmpeg','-v','error','-ss',str(ss)]+(['-t',str(dur)] if dur else [])+['-i',fn,'-f','f32le','-ac','2','-ar',str(SR),'-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,dtype='<f4').reshape(-1,2).astype(np.float64)
def rms_norm(a,target_db): return a*db(target_db)/(np.sqrt(np.mean(a**2))+1e-9)
tt_=np.arange(N)/SR
def envdb(pts):
    g=np.interp(tt_,[p[0] for p in pts],[p[1] for p in pts]); return np.where(g<=-89,0,db(g))
def place(buf,a,t0):
    i=int(round(t0*SR)); e=min(len(buf),i+len(a)); buf[i:e]+=a[:e-i]

# ------------------------------------------------------------------ MÚSICA
CV=U+'Como Vamos_ - Casa Rosa.mp3'; OD=U+'On the Delta - John Patitucci.mp3'
cvlen=102.373878
music=np.zeros((N,2))
def seg(fn,clip0,clip1,tr0,lvl,pts):
    a=load(fn,tr0,clip1-clip0); a=rms_norm(a,lvl)
    full=np.zeros((N,2)); place(full,a,clip0)
    g=envdb(pts); music[:]+=full*g[:,None]
# Como Vamos? — volta discreta no S21 e recua em "só um carro"; some em "Sobra você"
seg(CV,0,81.0,0.0,-26,[(0,-90),(2.2,-3),(30,-3),(35.3,-6),(45,-6),(50.6,-4),(53.4,-17),(56,-21),(77,-21),(80.0,-34),(80.69,-90),(81.0,-90)])
# S23 — volta depois da conta; some antes de "sem resposta nenhuma"
seg(CV,97.5,120.6,28.0,-27,[(97.5,-90),(99.5,-13),(102.4,-13),(107,-9),(114,-11),(118.5,-14),(120.4,-90)])
# S24 — baixo depois da vergonha; quase silêncio no olhar e em "Videre. Ver."
seg(CV,126.0,158.0,46.0,-28,[(126,-90),(129,-15),(140,-13),(150,-13),(154.8,-30),(155.9,-90)])
# S24 final (calculadora em repouso) — sem crescendo; respiro antes do CTA
seg(CV,160.5,179.5,14.0,-28,[(160.5,-90),(164,-17),(176.5,-17),(178.4,-40),(179.4,-90)])
# S25 — saída natural da faixa: o final da música termina junto com o vídeo
tail=load(CV,cvlen-(DURS-179.85),None); tail=rms_norm(tail,-27)
full=np.zeros((N,2)); place(full,tail,179.85)
music+=full*envdb([(179.85,-90),(182.0,-3),(DURS-1.0,-3),(DURS-.05,-30),(DURS,-90)])[:,None]
# On the Delta — breve durante a conta
seg(OD,85.6,94.6,22.0,-27,[(85.6,-90),(87.4,-5),(91.6,-5),(93.6,-16),(94.5,-90)])

# ------------------------------------------------------------------ AMBIENTE
def mur(dur):
    n=int(dur*SR); x=np.zeros(n)
    for lo,hi,rate in [(220,900,2.3),(500,1800,3.1),(900,2600,4.3)]:
        c=bp(rng.standard_normal(n),lo,hi); m=np.abs(lp(rng.standard_normal(n),rate)); m=m/(m.max()+1e-9)
        x+=c*(.25+m)
    return lp(x,3200)
amb=np.zeros(N)
def mu(a,b,lvl=-40,fade=.8):
    m=mur(b-a); m=rms_norm(m[:,None],lvl)[:,0]; n=len(m)
    f=np.minimum(np.minimum(np.arange(n)/SR/fade,1),np.minimum((n-np.arange(n))/SR/fade,1)); put(amb,m*f,a,0)
mu(13.27,16.35,-44); mu(81.1,86.6,-38); mu(86.6,93.3,-46); mu(93.3,102.3,-48); mu(125.3,135.75,-46); mu(144.3,146.3,-48)
for tt in [82.1,83.4,84.7,85.6,96.8,98.7,127.0,130.9,133.4]: put(amb,tick()*.4,tt,-34)  # talheres ao longe
rtn=lp(roomtone(DURS),400)
rt=rtn*envdb([(0,-52),(120.0,-52),(120.6,-58),(124.9,-58),(125.4,-52),(155.0,-52),(155.9,-40),(158.4,-40),(158.8,-52),(DURS,-52)])*.3

# ------------------------------------------------------------------ EFEITOS
sfx=np.zeros(N)
def pk(x): return x/(np.max(np.abs(x))+1e-9)
def P(x,t,gd): put(sfx,pk(x),t,gd)
def swell(dur):
    n=int(dur*SR); return lp(rng.standard_normal(n),900)*np.sin(np.pi*np.linspace(0,1,n)**1.5)
def horn(f,dur=.17):
    n=int(dur*SR); t=np.arange(n)/SR; x=np.sign(np.sin(2*np.pi*f*t))*.5+np.sin(2*np.pi*f*t)
    return lp(x,1800)*env(n,.005,.12)*np.minimum(1,(dur-t)/.02)
def keyc(): return (tick()*.9+tap()[:int(.05*SR)].repeat(1)[:len(tick())]*.0)
# --- S21
P(whoosh(.4,True),3.3,-30)                                   # "o olho volta"
P(tick(),3.7,-30)
P(whoosh(.35,False),5.5,-30); P(pop(700),5.85,-28); P(pop(940),6.9,-31)   # post / curtida
for c in [8.87,10.32,11.77]:
    P(whoosh(.2,False),c+.02,-32); P(click_pair(),c+.15,-26)     # arquivo abre
    P(click(),c+.92,-28); P(tick(),c+1.2,-27)                    # arquivo fecha / bolinha
P(tick(),13.5,-30)                                           # SALÁRIO
P(whoosh(.5,False),21.45,-26); P(tick(),22.4,-30); P(pop(520),23.3,-30)   # cartões / 6 ANOS
P(tick(),26.2,-28); P(tap(),26.9,-28)                        # linha liga livro e arquivo
for k in range(6): P(tick(),29.1+k*.22,-31)                  # régua
P(tap(),31.4,-26)                                            # marcador na régua
# --- S22
P(whoosh(.5,False),44.95,-27)
for tt,f in [(46.5,520),(48.2,640),(49.9,780)]: P(pop(f),tt,-29); P(tick(),tt+1.6,-36)
P(tick(),51.6,-28)                                           # SÓ UM CARRO
P(whoosh(.45,False),53.15,-29); P(tick(),53.8,-32)
P(whoosh(.9,True),59.6,-36)                                  # desconhecido desfoca
P(whoosh(.4,False),62.55,-28)
P(pop(560),65.6,-28)                                         # rapaz de chapéu
P(horn(392),67.6,-27); P(horn(330),67.86,-27)                # kombi (brincadeira)
P(tick(),67.97,-30)
P(whoosh(.4,False),68.7,-30); P(whoosh(.4,False),71.9,-31)
# carro some (Car Drive By da Biblioteca do YouTube, baixo)
cd=load(FX+'Car Drive By.mp3',0,None); e=np.convolve(np.abs(cd).mean(1),np.ones(int(.5*SR))/int(.5*SR),'same'); pkt=int(np.argmax(e))/SR
w0=max(0,pkt-2.0); cd=load(FX+'Car Drive By.mp3',w0,4.2); cd=rms_norm(cd,-40)
n=len(cd); cd*=(np.sin(np.pi*np.linspace(0,1,n))**1.3)[:,None]; sfxcar=np.zeros((N,2)); place(sfxcar,cd,77.4)
# --- S23
for tt in [86.9,88.3,89.6]: P(pop(480),tt,-32)                # IDADE / CARGO / TEMPO DE CARREIRA
for tt in [90.6,91.12,91.64,92.16,92.68]: P(tick(),tt,-24); P(tap(),tt+.005,-34)  # digitando na calculadora
P(whoosh(.3,False),93.1,-31); P(whoosh(.35,False),95.4,-31)
P(whoosh(.4,False),102.05,-31); P(whoosh(1.0,False),102.7,-37)  # olhar sai
P(whoosh(.8,True),105.2,-31); P(tick(),105.95,-28)           # olhar volta
P(whoosh(.4,False),107.7,-31); P(whoosh(.4,False),114.3,-31)
P(whoosh(.5,True),119.9,-35)
# --- S24
P(whoosh(.5,False),125.0,-32); P(whoosh(.4,False),135.55,-29)
P(pop(300),136.95,-29); P(tick(),137.25,-31); P(tick(),137.95,-31)   # INVIDERE / sublinha / tradução
P(whoosh(.4,False),140.2,-31)
for tt in [144.4,146.4,148.3]: P(tick(),tt,-30); P(whoosh(.2,False),tt-.2,-34)
P(whoosh(.4,False),150.15,-31); P(whoosh(1.2,False),150.75,-37); P(whoosh(.9,True),155.0,-33)
P(whoosh(.35,False),158.1,-33)
P(pop(260),158.52,-30); P(pop(420),159.45,-29)               # VIDERE → VER
P(whoosh(.9,False),161.3,-36)                                # o quadro se abre
for tt in [163.4,164.44,165.48,166.52,167.56]: P(tick(),tt,-26); P(tap(),tt+.005,-35)
for k,tt in enumerate([172.5,173.2,173.9]): P(tick(),tt,-38-k*2)   # números deixam de ser sobre ele
# --- S25
P(whoosh(.5,False),179.55,-33)
for k in range(6): P(tick(),186.95+k*.2,-30)                 # digitando INVEJA
P(pop(500),188.65,-31); P(tick(),189.2,-32)                  # marca e endereço

mx=np.stack([sfx,sfx],1)+music+np.stack([amb,amb],1)+np.stack([rt,rt],1)+sfxcar
pkv=np.max(np.abs(mx)); print('peak',20*np.log10(pkv)); mx*=min(1,db(-1.5)/pkv)
pcm=(np.clip(mx,-1,1)*32767).astype('<i2')
import os; os.makedirs('/mnt/user-data/outputs/S21-S25',exist_ok=True)
with wave.open('/mnt/user-data/outputs/S21-S25/inveja-s21-s25-audio.wav','wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
print('dur',len(pcm)/SR)
for s_,e_ in [(2,35),(36,45),(46,52),(54,77),(78,81),(81,86),(87,94),(98,119),(120.5,125),(127,155),(156,158.4),(163,178),(180,199)]:
    x=mx[int(s_*SR):int(e_*SR)]; print(s_,e_,round(20*np.log10(np.sqrt((x**2).mean())+1e-9),1))
