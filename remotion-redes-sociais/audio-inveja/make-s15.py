import numpy as np, subprocess, wave, sys
sys.argv=['x']
import importlib.util
src=open('lib.py').read().split('DUR=75.07')[0]
exec(src)
U='/mnt/user-data/uploads/Redes-sociais/audios/'
FX=U+'youtube-e-freesound-all/01-youtube/efeitos/youtube_efeitos_01/audio/efeitos/'
DURS=157.705; N=int(DURS*SR)
def load(fn,ss=0,dur=None):
    cmd=['ffmpeg','-v','error','-ss',str(ss)]+(['-t',str(dur)] if dur else [])+['-i',fn,'-f','f32le','-ac','2','-ar',str(SR),'-']
    a=np.frombuffer(subprocess.run(cmd,capture_output=True).stdout,dtype='<f4').reshape(-1,2).astype(np.float64); return a
def rms_norm(a,target_db):
    r=np.sqrt(np.mean(a**2))+1e-9; return a*db(target_db)/r
def fade(n,t0,t1,t2,t3):
    t=np.arange(n)/SR; return np.interp(t,[t0,t1,t2,t3],[0,1,1,0],left=0,right=0)
def curve(pts):
    t=np.arange(N)/SR; return np.interp(t,[p[0] for p in pts],[db(p[1]) for p in pts])
mix=np.zeros((N,2))
def place(a,start,env_pts,rms=-22,end=None):
    a=rms_norm(a,rms); n=N-int(start*SR); a=a[:n] if len(a)>=n else np.vstack([a,np.zeros((n-len(a),2))])
    e=curve([(p[0]-start,p[1]) for p in env_pts]+[]) if False else None
    t=np.arange(len(a))/SR+start
    g=np.interp(t,[p[0] for p in env_pts],[db(p[1]) if p[1]>-200 else 0 for p in env_pts])
    g=np.where(np.interp(t,[p[0] for p in env_pts],[p[1] for p in env_pts])<=-200,0,g)
    mix[int(start*SR):int(start*SR)+len(a)]+=a*g[:,None]
# helper: envelope in dB points -> linear (−200 means silence)
def envdb(pts,t0=0,dur=None):
    pass
def music(fn,ss,start,length,pts,rms):
    a=load(fn,ss,length); a=rms_norm(a,rms)
    t=np.arange(len(a))/SR+start
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    gdb=np.interp(t,xs,ys); g=np.where(gdb<=-90,0,db(gdb))
    i0=int(start*SR); n=min(len(a),N-i0); mix[i0:i0+n]+=a[:n]*g[:n,None]
# ---- música ----
S=-90
music(U+'Carved From Stone - TrackTribe.mp3',20,0,41,[(0,S),(1.2,S),(5,-6),(15.2,-6),(16.2,-24),(18.3,-24),(19.6,-6),(38.4,-6),(40.0,S)],-24)
music(U+'On the Delta - John Patitucci.mp3',12,39.3,12.2,[(39.3,S),(39.75,-3),(49.4,-3),(51.5,S)],-23)
music(U+'On the Delta - John Patitucci.mp3',40,109.7,4.8,[(109.7,S),(110.4,-5),(113.2,-5),(114.5,S)],-25)
music(U+'Tiptoe - Nat Keefe.mp3',6,113.8,43.9,[(113.8,S),(115.6,-4),(154.2,-4),(157.7,-14)],-26)
# ---- ambiente (churrasco / convívio) ----
amb_k=load(FX+'Kids Playing.mp3',40,60); amb_b=load(FX+'Daytime Forest Bonfire.mp3',20,60)
def ambient(a,start,pts,rms,length):
    a=rms_norm(a[:int(length*SR)],rms); t=np.arange(len(a))/SR+start
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]; gdb=np.interp(t,xs,ys); g=np.where(gdb<=-90,0,db(gdb))
    i0=int(start*SR); n=min(len(a),N-i0); mix[i0:i0+n]+=a[:n]*g[:n,None]
ambient(amb_k,52.2,[(52.2,S),(54.6,0),(97.0,0),(100.6,-4),(104.8,-4),(105.6,S)],-36,54)
ambient(amb_b,52.2,[(52.2,S),(54.6,0),(97.0,0),(104.8,-2),(105.6,S)],-34,54)
# ---- efeitos (mono, centro) ----
sfx=np.zeros(N)
def pk(x): return x/(np.max(np.abs(x))+1e-9)
def P(x,t,g): put(sfx,pk(x),t,g)
def ding(f=1318,dur=1.2):
    n=int(dur*SR); t=np.arange(n)/SR; x=np.sin(2*np.pi*f*t)*np.exp(-t/.25)+.5*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/.09)+.3*np.sin(2*np.pi*f*.5*t)*np.exp(-t/.4)
    x[:int(.002*SR)]*=np.linspace(0,1,int(.002*SR)); return x
def buzz(): 
    n=int(.12*SR);t=np.arange(n)/SR; return np.sin(2*np.pi*85*t)*np.sin(np.pi*t/.12)
def crack():
    n=int(1.4*SR); x=hp(rng.standard_normal(n),2500)*env(n,.0004,.05)
    for tt,gg in [(.06,.7),(.13,.5),(.21,.6),(.34,.4),(.5,.3)]:
        m=int(.2*SR); y=hp(rng.standard_normal(m),3500)*env(m,.0003,.02)*gg; i=int(tt*SR); x[i:i+m]+=y
    tin=sum(np.sin(2*np.pi*f*np.arange(n)/SR)*np.exp(-np.arange(n)/SR/.3)*.08 for f in [2400,3300,4700])
    return x+tin
def boo():
    n=int(.7*SR); t=np.arange(n)/SR; f=320-190*(1-np.exp(-t/.25)); ph=2*np.pi*np.cumsum(f)/SR
    return lp((np.sin(ph)+.4*np.sin(2*ph)),1500)*env(n,.03,.22)
def swell(dur,g=1): 
    n=int(dur*SR); x=lp(rng.standard_normal(n),900)*np.linspace(0,1,n)**2*np.hanning(2*n)[n:][::-1]*0+lp(rng.standard_normal(n),900)*np.sin(np.pi*np.linspace(0,1,n)**1.5); return x
# tom ambiente do espelho
rt=roomtone(DURS); rt=lp(rt,500)*np.interp(np.arange(N)/SR,[0,2,20,22,40,41],[0,.0,.0,0,0,0])
# retrospecto S15
for t in [2.35,2.75,3.15,3.55,3.95,4.3]: P(click_pair(),t,-14); P(whoosh(.25,False),t-.05,-30)
for t in [33.2,34.45,35.85,37.5]: P(click_pair(),t,-17)
P(swell(2.6),4.7,-22); P(tap(),4.81,-18)
P(swell(2.2),16.0,-28)
P(crack(),18.5,-8); P(impact(),18.5,-16)
# notificação única
P(buzz(),24.3,-22); P(buzz(),24.5,-22); P(ding(),24.4,-14)
# varreduras
for tc,g in [(21.2,-16),(33.0,-18),(39.55,-15),(50.2,-18),(54.59,-18),(74.34,-20),(97.5,-17),(113.9,-17),(129.3,-16)]:
    P(whoosh(.6,False),tc-.3,g)
for tc in [52.4,58.8,60.9,68.95,89.4,100.57,105.05,109.86,117.65,121.5,135.7,141.4,146.6,148.9,154.1]: P(whoosh(.5,True),tc-.28,-27)
# defesa / banana
P(impact(),39.6,-18); P(whoosh(1.5,True),46.4,-26); P(tap(),48.95,-18); P(pop(900),47.0,-30)
# gauge
for t in [24.1,105.4,148.8]: P(tick(),t,-26)
# anel no primo, chave, corolla
P(pop(500),51.0,-26); P(tick(),52.5,-22); P(tick(),52.7,-24)
P(whoosh(1.0,False),59.0,-25); P(ding(2093,.9),59.5,-28)
# hipóteses
for t0,ts in [(67.06,70.9),(74.38,76.9),(78.8,84.0)]:
    P(pop(520),t0,-18); P(tap(),ts,-22); P(whoosh(.3,False),ts,-30)
P(impact(),84.64,-24); P(impact(),97.5,-14)
# fantasma (sem corneta): sopro + leve "boo"
P(whoosh(.9,True),102.75,-22); P(boo(),103.0,-20)
# linha de comparação
P(swell(3.2),106.5,-30); P(tick(),106.5,-24); P(swell(3.5),109.9,-26)
# S18
P(pop(420),130.3,-16); P(whoosh(1.2,False),130.4,-24)
P(pop(700),136.6,-24); P(pop(700),149.0,-24); P(swell(3.0),150.2,-30)
P(impact(),154.27,-20)
fx=sfx
# ---- master ----
mx=np.stack([fx,fx],1)+mix+np.stack([rt,rt],1)*0
mx=mx*1.0
pkv=np.max(np.abs(mx)); print('peak',20*np.log10(pkv))
mx=mx*min(1,db(-1.5)/pkv)
pcm=(np.clip(mx,-1,1)*32767).astype('<i2')
out='/mnt/user-data/outputs/inveja-s15-s18-audio.wav'
with wave.open(out,'wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
print('ok',len(mx)/SR)
