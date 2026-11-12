import numpy as np, wave
from scipy.signal import butter, sosfilt
SR=48000
rng=np.random.default_rng(11)
def bp(x,lo,hi,o=2): return sosfilt(butter(o,[lo,hi],btype='band',fs=SR,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,btype='high',fs=SR,output='sos'),x)
def lp(x,f,o=2): return sosfilt(butter(o,f,btype='low',fs=SR,output='sos'),x)
db=lambda d:10**(d/20)
def env(n,a,d):  # attack a s, exp decay constant d s
    t=np.arange(n)/SR; return np.minimum(t/max(a,1e-4),1)*np.exp(-t/d)
def click(g=1.0):
    n=int(.12*SR); x=hp(rng.standard_normal(n),1500)*env(n,.0005,.006)
    th=np.sin(2*np.pi*170*np.arange(n)/SR)*env(n,.0005,.012)*.5
    return (x*.9+th)*g
def click_pair(down=1.0,up=.45):
    out=np.zeros(int(.3*SR)); a=click(down); b=click(up)*.8
    out[:len(a)]+=a; o=int(.075*SR); out[o:o+len(b)]+=b[:len(out)-o]; return out
def tick(g=1.0):
    n=int(.05*SR); x=bp(rng.standard_normal(n),1800,5500)*env(n,.0004,.007)
    th=np.sin(2*np.pi*rng.uniform(190,260)*np.arange(n)/SR)*env(n,.0004,.008)*.35
    return (x+th)*g*rng.uniform(.6,1)
def pop(f0=620,g=1.0):
    n=int(.22*SR); t=np.arange(n)/SR; f=f0+280*(1-np.exp(-t/.03))
    ph=2*np.pi*np.cumsum(f)/SR; x=np.sin(ph)*env(n,.004,.05)+.25*np.sin(2*ph)*env(n,.004,.03)
    return lp(x,5000)*g
def impact(g=1.0):
    n=int(1.1*SR); t=np.arange(n)/SR; f=45+55*np.exp(-t/.08)
    ph=2*np.pi*np.cumsum(f)/SR; x=np.sin(ph)*env(n,.002,.28)
    tr=lp(rng.standard_normal(n),1800)*env(n,.0005,.03)*.35
    return (x+tr)*g
def tap(g=1.0):
    n=int(.25*SR); t=np.arange(n)/SR; f=120-40*(1-np.exp(-t/.03))
    ph=2*np.pi*np.cumsum(f)/SR; x=np.sin(ph)*env(n,.002,.05)
    tr=lp(rng.standard_normal(n),2500)*env(n,.001,.012)*.25
    return (x+tr)*g
def whoosh(dur=.55,rev=False,g=1.0):
    n=int(dur*SR); x=rng.standard_normal(n); out=np.zeros(n); k=24; seg=n//k
    for i in range(k):
        u=i/(k-1); c=450+2600*u if not rev else 3000-2400*u
        s=slice(i*seg,(i+1)*seg if i<k-1 else n)
        # filter whole & window blocks (simple overlapped crossfade)
        y=bp(x,c*.7,c*1.3,2)
        w=np.zeros(n); w[s]=1; w=np.convolve(w,np.hanning(seg*2+1)/np.hanning(seg*2+1).sum(),'same')
        out+=y*w
    u=np.linspace(0,1,n); e=np.sin(np.pi*u)**1.6
    return out*e*g
def roomtone(dur):
    n=int(dur*SR); x=lp(rng.standard_normal(n),700,2)+.4*lp(rng.standard_normal(n),200,2)
    return x
def put(buf,x,t,g_db=0):
    i=int(round(t*SR)); x=x*db(g_db); e=min(len(buf),i+len(x)); buf[i:e]+=x[:e-i]
def save(fn,buf,peak_db=-3):
    m=np.max(np.abs(buf)) or 1; buf=buf/m*db(peak_db)
    st=np.stack([buf,buf],1); pcm=(np.clip(st,-1,1)*32767).astype('<i2')
    with wave.open(fn,'wb') as w: w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())

DUR=75.07; N=int(DUR*SR)
# ---- S11 SFX ----
ref=np.max(np.abs(impact()))  # normalizadores relativos
sfx=np.zeros(N)
segs=[(50.9,5),(51.55,6),(52.3,6),(52.8,4),(53.2,7),(53.75,2),(54.9,5)]
for a,k in segs:
    for i in range(k): put(sfx,tick(),a+i*(.30/k),-26)
for t0 in (11.6,13.1,14.3): put(sfx,pop(),t0,-22)
put(sfx,impact(),20.0,-8)
put(sfx,tap(),40.7,-19)
