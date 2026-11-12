# Mix do lote 0: voz (EN ou PT) normalizada a -16 LUFS + trilha ~13 dB abaixo com ducking; final -14 LUFS / TP -1.
# PT: encaixe sem metalizar = encurta pausas longas (máx. MAXP s) e, se ainda faltar, Rubber Band com no máximo 3%.
import json, subprocess as sp, sys, re, numpy as np
from pathlib import Path
import os
B=Path(os.environ.get('LOTE','/home/claude/lote00'))  # pasta de trabalho: audio/, plano/lote00-shorts.json, mix/; S=json.load(open(B/'plano/lote00-shorts.json'))
TRILHA={'O1':('singularity',30),'O2':('singularity',95),'O3':('singularity',160),'O4':('rotator',20),'O5':('singularity',230),'O6':('rotator',90)}
CAP=1.03
def run(c): sp.run(c,shell=True,check=True)
def dur(f): return float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(f)]))
def ler(f):
    b=sp.run(['ffmpeg','-v','error','-i',str(f),'-ar','48000','-ac','1','-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(b,dtype=np.float32).copy()
def gravar(a,f): sp.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','48000','-ac','1','-i','-',str(f)],input=a.astype(np.float32).tobytes(),check=True)
def db(a,w=480):
    n=len(a)//w; e=np.sqrt(np.mean(a[:n*w].reshape(n,w)**2,axis=1))+1e-9; return 20*np.log10(e)
def aparar(a,th=-45):
    d=db(a); i=np.where(d>th)[0]; return a[max(0,i[0]*480-2400):min(len(a),(i[-1]+1)*480+4800)]
def pausas(a,maxp,th=-42):
    d=db(a)<th; out=[]; i=0; w=480; cut=0
    segs=[]; j=0
    while j<len(d):
        if d[j]:
            k=j
            while k<len(d) and d[k]: k+=1
            if (k-j)*w/48000>maxp: segs.append((j*w,k*w))
            j=k
        else: j+=1
    pos=0; res=[]
    for s,e in segs:
        keep=int(maxp*48000); m=(s+e)//2
        a1=s+keep//2; a2=e-keep//2
        res.append(a[pos:a1]); pos=a2
    res.append(a[pos:]); return np.concatenate(res)
def loud(src,dst,alvo,tp=-1.5,extra=''):
    o=sp.run(f'ffmpeg -hide_banner -i "{src}" -af loudnorm=I={alvo}:TP={tp}:LRA=11:print_format=json -f null -',shell=True,capture_output=True,text=True).stderr
    j=json.loads(o[o.rindex('{'):])
    run(f'ffmpeg -v error -y -i "{src}" -af "loudnorm=I={alvo}:TP={tp}:LRA=11:measured_I={j["input_i"]}:measured_TP={j["input_tp"]}:measured_LRA={j["input_lra"]}:measured_thresh={j["input_thresh"]}:offset={j["target_offset"]}:linear=true{extra}" -ar 48000 "{dst}"')
def lufs(f):
    o=sp.run(f'ffmpeg -hide_banner -i "{f}" -af loudnorm=print_format=json -f null -',shell=True,capture_output=True,text=True).stderr
    j=json.loads(o[o.rindex('{'):]); return float(j['input_i']),float(j['input_tp'])
def mix(voz,k,D,saida):
    tr,off=TRILHA[k]; t=B/'mix'/'tmp'; t.mkdir(exist_ok=True)
    loud(voz,t/f'{k}-voz.wav',-16)
    run(f'ffmpeg -v error -y -ss {off} -t {D} -i {B}/mix/{tr}.mp3 -ac 2 -ar 48000 {t}/{k}-tr.wav'); loud(t/f'{k}-tr.wav',t/f'{k}-tr16.wav',-16)
    fc=(f"[0:a]apad=whole_dur={D},aformat=channel_layouts=stereo,asplit=2[v][sc];"
        f"[1:a]volume=-13dB,afade=t=in:d=0.6,afade=t=out:st={D-1.6:.2f}:d=1.6[m];"
        f"[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500[md];"
        f"[v][md]amix=inputs=2:normalize=0:duration=first,atrim=0:{D}[o]")
    run(f'ffmpeg -v error -y -i {t}/{k}-voz.wav -i {t}/{k}-tr16.wav -filter_complex "{fc}" -map "[o]" -ar 48000 {t}/{k}-mix.wav')
    loud(t/f'{k}-mix.wav',saida,-14,-1.0)
if __name__=='__main__':
    modo=sys.argv[1]; ids=sys.argv[2:] or [s['id'] for s in S]
    rel=[]
    for s in S:
        k=s['id']
        if k not in ids: continue
        D=s['dur']
        if modo=='en':
            mix(B/f'audio/{k}.mp3',k,D,B/f'mix/{k}-en.wav'); i,tp=lufs(B/f'mix/{k}-en.wav'); print(k,'EN',D,'s',i,'LUFS',tp,'TP')
        else:
            a=aparar(ler(B/f'audio/pt-br/{k}.mp3')); L=len(a)/48000; T=D-1.0; maxp=None
            for mp in [0.7,0.6,0.5,0.45,0.4,0.35,0.3]:
                if len(a)/48000<=T*CAP: break
                a=pausas(a,mp); maxp=mp
            L2=len(a)/48000; r=max(1.0,L2/T)
            if r>CAP: raise SystemExit(f'{k}: precisaria acelerar {r:.3f}x (máx. {CAP}). Enxugar o texto PT.')
            t=B/'mix'/'tmp'; t.mkdir(exist_ok=True); gravar(a,t/f'{k}-pt-a.wav')
            if r>1.0005: run(f'ffmpeg -v error -y -i {t}/{k}-pt-a.wav -af rubberband=tempo={r:.4f} {t}/{k}-pt-b.wav')
            else: run(f'cp {t}/{k}-pt-a.wav {t}/{k}-pt-b.wav')
            mix(t/f'{k}-pt-b.wav',k,D,B/f'mix/{k}-pt.wav')
            run(f'ffmpeg -v error -y -i {B}/mix/{k}-pt.wav -t {D} -c:a libmp3lame -b:a 320k -ar 48000 {B}/mix/{k}-audio-pt-br.mp3')
            i,tp=lufs(B/f'mix/{k}-audio-pt-br.mp3')
            r_={'id':k,'dur_video':D,'fala_pt_bruta':round(L,2),'pausas_max':maxp,'fala_pt_apos_pausas':round(L2,2),'aceleracao':round(r,4),'fala_pt_final':round(dur(t/f'{k}-pt-b.wav'),2),'faixa':round(dur(B/f'mix/{k}-audio-pt-br.mp3'),3),'lufs':i,'tp':tp}
            print(r_); rel.append(r_)
    if rel: json.dump(rel,open(B/'mix/pt-br-relatorio.json','w'),indent=1)
