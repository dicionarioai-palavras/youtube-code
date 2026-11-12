import numpy as np, subprocess, sys
SR=48000
def load(n):
    b=subprocess.run(['ffmpeg','-loglevel','error','-i',f'sfx/{n}.mp3','-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True,check=True).stdout
    return np.frombuffer(b,np.float32).reshape(-1,2).copy()
# (id, t_alvo, pico_dBFS, alinhar_no_transiente)
P=[]
def add(i,ts,pk,on=True):
    for t in (ts if isinstance(ts,list) else [ts]): P.append((i,t,pk,on))
add('sy01-whoosh',[265.2,267.3,269.8],-20); add('sy01-whoosh',[314.9,318.5],-24)
add('sy02-luz-sobe',285.8,-22,False); add('sy03-congela',292.4,-20,False); add('sy04-impacto',323.15,-14)
add('sy05-persiana-fecha',362.4,-16); add('sy06-rolagem',386.9,-21,False); add('sy07-coracao',388.6,-18)
add('sy08-risco',[399.3,715.7,717.3,775.9],-18); add('sy09-circulo',498.3,-20,False)
add('sy10-alarme',582.2,-24,False); add('sy11-obturador',[614.2,616.4,618.6],-18); add('sy12-carimbo',629.4,-14)
add('sy16-mensagem',[662.9,664.4,665.5],-20); add('sy16-mensagem',[669.4,670.2,671.5,672.6,673.4,674.6],-19)
add('sy16-mensagem',681.6,-18); add('sy16-mensagem',[800.9,802.4],-19)
add('sy13-paginas',709.0,-20,False); add('sy14-relogio',771.2,-24,False); add('sy15-projetor',776.9,-28,False)
add('sy17-clique',[825.0,825.75,826.95],-18); add('sy18-sino',826.35,-18); add('sy19-cadeado',827.6,-16)
PARTES=[('P1-S13-S19',256.68,409.28),('P2-S20-S22',409.28,565.88),('P3-S23-S25',565.88,722.56),('P4-S26-S29',722.56,861.42)]
cache={}; rel=[]
for nome,a,b in PARTES:
    n=round((b-a)*SR); buf=np.zeros((n,2),np.float32)
    for i,t,pk,on in P:
        if not (a<=t<b): continue
        if i not in cache: cache[i]=load(i)
        x=cache[i]*(10**(pk/20)/max(1e-6,np.abs(cache[i]).max()))
        off=int(np.argmax(np.abs(x).max(1)>0.1*np.abs(x).max())) if on else 0
        off=max(0,off-int(.01*SR))
        s=round((t-a)*SR)-off; x=x[max(0,-s):]; s=max(0,s); m=min(len(x),n-s)
        if m<=0: continue
        y=x[:m].copy(); f=min(m,int(.05*SR)); y[-f:]*=np.linspace(1,0,f)[:,None]
        buf[s:s+m]+=y
        rel.append((nome,i,t,t-a))
    peak=np.abs(buf).max(); print(nome, f'pico {20*np.log10(peak+1e-9):.1f} dBFS')
    subprocess.run(['ffmpeg','-loglevel','error','-y','-f','f32le','-ac','2','-ar',str(SR),'-i','-','-c:a','pcm_s24le',f'out/Ciume-{nome}-efeitos.wav'],input=buf.tobytes(),check=True)
def mm(t): m,s=divmod(t,60); return f'{int(m)}:{s:05.2f}'.replace('.',',')
with open('out/tempos-efeitos.md','w') as f:
    f.write('| Parte | Efeito | Timeline | No clipe |\n|---|---|---|---|\n')
    for nome,i,t,r in rel: f.write(f'| {nome} | {i} | {mm(t)} | {mm(r)} |\n')
