import numpy as np, subprocess, wave
src=open('lib.py').read().split('DUR=75.07')[0]
exec(src)
U='/mnt/user-data/uploads/Redes-sociais/audios/'
DURS=82.516; N=int(DURS*SR)
def load(fn,ss=0,dur=None):
    cmd=['ffmpeg','-v','error','-ss',str(ss)]+(['-t',str(dur)] if dur else [])+['-i',fn,'-f','f32le','-ac','2','-ar',str(SR),'-']
    return np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,dtype='<f4').reshape(-1,2).astype(np.float64)
def rms_norm(a,target_db): return a*db(target_db)/(np.sqrt(np.mean(a**2))+1e-9)
mix=np.zeros((N,2))
S=-90
# Tiptoe continua de onde o S18 parou (posição ~49,9 s da faixa)
a1=load(U+'Tiptoe - Nat Keefe.mp3',49.9,62.5)
a2=load(U+'Tiptoe - Nat Keefe.mp3',75,DURS-60+.5)
a1=rms_norm(a1,-26); a2=rms_norm(a2,-26)
a=np.zeros((N,2)); a[:len(a1)]+=a1*np.interp(np.arange(len(a1))/SR,[0,59.8,62],[1,1,0])[:,None]
i2=int(60*SR); n2=min(len(a2),N-i2); a[i2:i2+n2]+=a2[:n2]*np.interp(np.arange(n2)/SR,[0,2,100],[0,1,1])[:,None]
t=np.arange(len(a))/SR
pts=[(0,-4),(17.6,-4),(18.9,S),(25.2,S),(26.2,-4),(66,-4),(72,-9),(77.5,-12),(81.516,-12),(82.516,S)]
g=np.interp(t,[p[0] for p in pts],[p[1] for p in pts]); g=np.where(g<=-90,0,db(g))
# afinar densidade no fim (low-pass progressivo)
lo=lp(a[:,0],700,2),lp(a[:,1],700,2)
lo=np.stack(lo,1); mixk=np.clip((t-66)/10,0,1)[:,None]
a=a*(1-mixk)+lo*mixk
mix[:len(a)]+=a*g[:,None]
# efeitos
sfx=np.zeros(N)
def pk(x): return x/(np.max(np.abs(x))+1e-9)
def P(x,tt,gd): put(sfx,pk(x),tt,gd)
def swell(dur):
    n=int(dur*SR); return lp(rng.standard_normal(n),900)*np.sin(np.pi*np.linspace(0,1,n)**1.5)
P(whoosh(.5,False),.7,-24)                         # cartela entra
P(tick(),4.1,-26); P(tap(),9.97,-24); P(tap(),11.09,-24)  # destaque do nome; BENIGNA; MALICIOSA
P(whoosh(.5,False),16.2,-24); P(whoosh(.5,True),18.8,-27); P(swell(2.8),19.4,-30); P(pop(330),19.1,-30)  # anjo / demonio
P(whoosh(.35,False),23.2,-26)  # corte para o tornozelo
for tt,gg in [(23.96,-12)]:
    P(click_pair(),tt,gg); P(tap(),tt,-16); P(impact(),tt,-22); P(pop(260),tt+.03,-26)  # dedo na ferida
P(whoosh(.4,True),24.4,-30)
rt=roomtone(DURS); rt=lp(rt,400)*np.interp(np.arange(N)/SR,[17.5,19.2,24.6,26.0],[0,.012,.012,0])
for tc in [25.9,53.0,57.6,63.0]: P(whoosh(.55,False),tc-.3,-20)
P(pop(520),29.19,-20)                               # PARECE MERECIDO?
P(swell(2.4),31.0,-30); P(tap(),33.0,-22)           # puxar pra baixo
for k,tt in enumerate([36.6,37.4,38.2,39.0]): P(tick(),tt,-26)  # avanço
P(pop(480),41.7,-22); P(tick(),41.9,-26)           # DISTÂNCIA / régua
P(swell(3.0),44.0,-32)                              # admiração
P(whoosh(.5,False),48.25,-24); P(swell(3.5),48.6,-30)
for tt in [48.97,49.9]: P(pop(1100),tt,-28)         # silhuetas
P(tick(),55.1,-24); P(tick(),55.6,-24)              # dois passos
P(impact(),61.75,-22)                               # terça-feira
P(whoosh(.5,False),63.05,-26)                       # cartela volta
P(whoosh(1.0,False),67.2,-26); P(swell(3.5),67.0,-32)  # acelera
P(swell(3.5),72.2,-32)                              # distância cresce
P(impact(),78.9,-20)                                # volta ao ponto
mx=np.stack([sfx,sfx],1)+mix+np.stack([rt,rt],1)
pkv=np.max(np.abs(mx)); print('peak',20*np.log10(pkv)); mx*=min(1,db(-1.5)/pkv)
pcm=(np.clip(mx,-1,1)*32767).astype('<i2')
with wave.open('/mnt/user-data/outputs/inveja-s19-s20-audio.wav','wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
for s_,e_ in [(2,15),(19,25),(30,60),(70,77),(78,81.5),(81.6,82.5)]:
    x=mx[int(s_*SR):int(e_*SR)]; print(s_,e_,round(20*np.log10(np.sqrt((x**2).mean())+1e-9),1))
