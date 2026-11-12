# EP02 · cortes S1–S4 (07/11/2026): áudio EN e faixa PT-BR de cada corte.
# EN: trecho do mix final do EP02 (audio/mix/EP02-mix-final.flac) entre t0 e t1 do ep02-cortes.json, entrada limpa (fade 0,12 s)
#     e cauda do CTA com a própria cama do episódio (audio/mix/trilha-cama.wav) no ganho do master; final -14 LUFS / TP -1.
# PT: recorte da narração PT-BR do EP02 (audio/pt-br/<bloco>.mp3, preparada igual ao faixa_pt_br.py), frase a frase,
#     cada grupo de frases posto no início da frase inglesa correspondente; mesma cama com ducking; -14 LUFS / TP -1.
#     Sem aceleração (só se faltar tempo: Rubber Band até 3%, regra do 07-VOZ seção 6).
# Uso: python cortes_ep02_mix.py <pasta-do-episodio> <pasta-saida> <pt-prep-palavras.json> [S1 S2 ...]
#   pt-prep-palavras.json: palavras com tempo da narração PT preparada (faster-whisper small, pt), em montagem/cortes-pt-palavras.json
import json, subprocess as sp, sys, re, numpy as np
from pathlib import Path
EP=Path(sys.argv[1]); OUT=Path(sys.argv[2]); OUT.mkdir(parents=True,exist_ok=True); PTW=json.load(open(sys.argv[3],encoding='utf-8'))
S=json.load(open(EP/'montagem'/'ep02-cortes.json',encoding='utf-8'))
TL=json.load(open(EP/'montagem'/'timeline.json',encoding='utf-8')); INI={b['id']:b['ini'] for b in TL['blocos']}
MIX=EP/'audio'/'mix'/'EP02-mix-final.flac'; CAMA=EP/'audio'/'mix'/'trilha-cama.wav'
G_MASTER=1.574  # ganho do master do EP02 sobre a cama (medido na vinheta 70–75 s, resíduo 1,5%)
CAP=1.03; SR=48000
TMP=OUT/'tmp'; TMP.mkdir(exist_ok=True)
def run(c): sp.run(c,shell=True,check=True)
def ler(f,a=None,d=None,ch=2):
    o=(f'-ss {a} ' if a is not None else '')+(f'-t {d} ' if d is not None else '')
    b=sp.run(f'ffmpeg -v error {o}-i "{f}" -ar {SR} -ac {ch} -f f32le -',shell=True,capture_output=True,check=True).stdout
    x=np.frombuffer(b,np.float32).copy(); return x.reshape(-1,ch) if ch>1 else x
def gravar(x,f,ch=2): sp.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac',str(ch),'-i','-',str(f)],input=x.astype(np.float32).tobytes(),check=True)
def loud(src,dst,alvo=-14,tp=-1.0):
    o=sp.run(f'ffmpeg -hide_banner -i "{src}" -af loudnorm=I={alvo}:TP={tp}:LRA=11:print_format=json -f null -',shell=True,capture_output=True,text=True).stderr
    j=json.loads(o[o.rindex('{'):])
    run(f'ffmpeg -v error -y -i "{src}" -af "loudnorm=I={alvo}:TP={tp}:LRA=11:measured_I={j["input_i"]}:measured_TP={j["input_tp"]}:measured_LRA={j["input_lra"]}:measured_thresh={j["input_thresh"]}:offset={j["target_offset"]}:linear=true" -ar {SR} "{dst}"')
def medir(f):
    o=sp.run(f'ffmpeg -hide_banner -i "{f}" -af loudnorm=print_format=json -f null -',shell=True,capture_output=True,text=True).stderr
    j=json.loads(o[o.rindex('{'):]); d=float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(f)]))
    return round(float(j['input_i']),1),round(float(j['input_tp']),1),round(d,2)
def rampa(n,a,b): return np.linspace(a,b,n,dtype=np.float32)[:,None]

def en(s):
    t0,t1,D=s['t0'],s['t1'],s['dur']; fala_fim=s['palavras'][-1]['e']+t0
    m=ler(MIX,t0,t1-t0); n=len(m)
    m[:int(0.12*SR)]*=rampa(int(0.12*SR),0,1)
    # ganho da cama no fim do trecho (ainda com ducking): mínimos quadrados entre o mix e a cama no silêncio depois da última palavra
    a=fala_fim+0.08; w=max(0.2,t1-a)
    mm=ler(MIX,a,w); cc=ler(CAMA,a,w); g0=float(np.sum(mm*cc)/max(1e-9,np.sum(cc*cc))); g0=min(max(g0,0.3),G_MASTER*1.2)
    X=int(0.1*SR); cauda=ler(CAMA,t1-0.1,D-(t1-t0)+0.1)
    gan=np.full(len(cauda),G_MASTER,np.float32); r=min(len(cauda),int(0.6*SR)); gan[:r]=np.linspace(g0,G_MASTER,r); cauda=cauda*gan[:,None]
    cauda[:X]*=rampa(X,0,1); m[n-X:]*=rampa(X,1,0)
    y=np.concatenate([m[:n-X],m[n-X:]+cauda[:X],cauda[X:]])[:int(round(D*SR))]
    f=int(1.2*SR); y[-f:]*=rampa(f,1,0)
    gravar(y,TMP/f"{s['id']}-en-pre.wav"); saida=OUT/f"{s['id']}-en.wav"; loud(TMP/f"{s['id']}-en-pre.wav",saida)
    return saida,round(g0,3)

# grupos PT ↔ EN (primeiras palavras de cada grupo de frases); bloco PT de cada corte
GRUPOS={
 'S1':('04-parte-3',[('imagine o barulho','Just imagine'),('Naquele mesmo ano','In 1959,'),('Sob emoção','When we feel'),('Fixamos','We lock on'),('Depois, pesquisadores','Later researchers'),
                     ('Numa barraca','Inside a dark'),('A entrada','The entrance'),('Botas,','Boots,'),('Não é burrice','That isn\'t')],'velocidade.'),
 'S2':('05-parte-4',[('Nas palavras','As Puzrin'),('Caso encerrado?','Is the case'),('Um cientista','One outside'),('Outro,','Another found'),('A Fundação','The Dyatlov Group'),
                     ('Em 2021,','Then, in 2021,'),('E em 2022,','And in early'),('O status','So here is'),('Tem a','It\'s backed'),('Não está','It is not'),('O próprio','Puzrin himself')],'noite.'),
 'S3':('06-parte-5',[('Em 2007,','In 2007,'),('Numas,','In some versions,'),('Quando a consequência','When the consequences'),('Chamaram','The researchers'),('Queremos','We expect'),
                     ('Nove jovens','Nine young'),('Isso pede','Surely')],'neve.'),
 'S4':('07-fecho',[('Por 60','For more'),('Talvez não.','Maybe that'),('A história','The most likely'),('9 jovens','Nine experienced'),('e passaram','and then spent'),
                   ('Yuri','Yuri Yudin,'),('se eu pudesse','If I had')],'noite?'),
}
def nrm(x): return re.sub(r"[^a-z0-9à-ú']","",x.lower())
def achar(ws,frase,depois=-1,chave='w'):
    q=[nrm(x) for x in frase.split()]
    for i in range(len(ws)-len(q)+1):
        if ws[i]['s']<=depois: continue
        if all(nrm(ws[i+k][chave])==q[k] for k in range(len(q))): return i
    raise SystemExit('nao achei: '+frase)
def db(v,w=480):
    n=len(v)//w; return 20*np.log10(np.sqrt(np.mean(v[:n*w].reshape(n,w)**2,axis=1))+1e-9)
def quieto(d,t,lo,hi,antes=True,th=-38):
    # ponto silencioso mais perto de t dentro de [t+lo, t+hi] (quadros de 10 ms)
    fr=[k for k in range(max(0,int((t+lo)*100)),min(len(d),int((t+hi)*100))) if d[k]<th]
    if not fr: return t
    k=max(fr) if antes else min(fr); return (k+0.5)/100

def pt(s):
    bloco,grupos,ultima=GRUPOS[s['id']]; D=s['dur']
    voz=ler(PREP[bloco],ch=1); d=db(voz)
    ws=[{'w':w,'s':a,'e':b} for w,a,b in PTW[bloco]]
    en_ws=s['palavras']
    idx=[]; dep=-1
    for p,e in grupos:
        i=achar(ws,p,dep); idx.append(i); dep=ws[i]['s']
    j_fim=max(k for k,w in enumerate(ws) if nrm(w['w'])==nrm(ultima) and k>idx[-1] and k<idx[-1]+40)
    pedacos=[]; pos_en=-1
    for g,(p,e) in enumerate(grupos):
        i=idx[g]; j=(idx[g+1]-1) if g<len(grupos)-1 else j_fim
        a=quieto(d,ws[i]['s'],-0.45,0.06,antes=True); b=quieto(d,ws[j]['e'],-0.04,0.6,antes=False)
        if g<len(grupos)-1: b=min(b,quieto(d,ws[idx[g+1]]['s'],-0.45,0.06,antes=True))
        alvo=en_ws[achar(en_ws,e,pos_en)]['s']; pos_en=alvo
        pedacos.append([voz[int(a*SR):int(b*SR)].copy(),alvo-0.05])
    # coloca cada grupo no início da frase inglesa; se sobrepor, empurra (pausa mínima 0,25 s)
    t=0; lim=D-1.3; pos=[]
    for v,alvo in pedacos:
        st=max(alvo,t+0.25 if pos else 0.0); pos.append(st); t=st+len(v)/SR
    r=1.0
    if t>lim:  # aperta as pausas entre grupos antes de pensar em acelerar
        tot=sum(len(v) for v,_ in pedacos)/SR+0.25*(len(pedacos)-1)
        r=max(1.0,tot/lim)
        if r>CAP: raise SystemExit(f"{s['id']}: PT precisaria de {r:.3f}x (máx. {CAP}). Enxugar o texto.")
        t=0; pos=[]
        for k,(v,alvo) in enumerate(pedacos):
            st=0.0 if k==0 else t+0.25; pos.append(st); t=st+len(v)/SR/r
    vz=np.zeros(int(round(D*SR)),np.float32)
    for (v,_),st in zip(pedacos,pos):
        if r>1.0005:
            gravar(v,TMP/'v.wav',1); run(f'ffmpeg -y -v error -i {TMP}/v.wav -af "rubberband=tempo={r:.4f}:pitchq=quality:formant=preserved:transients=smooth,aresample={SR}" -ac 1 {TMP}/v2.wav'); v=ler(TMP/'v2.wav',ch=1)
        i=int(st*SR); vz[i:i+len(v)]+=v[:len(vz)-i]
    gravar(vz,TMP/f"{s['id']}-pt-voz.wav",1)
    t0=s['t0']
    fc=(f'[1:a]aformat=channel_layouts=stereo,asplit[v][sc];[0:a][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=450[m];'
        f'[m][v]amix=inputs=2:normalize=0,atrim=0:{D},afade=t=in:d=0.15,afade=t=out:st={D-1.2:.2f}:d=1.2[o]')
    run(f'ffmpeg -y -v error -ss {t0} -t {D} -i "{CAMA}" -i {TMP}/{s["id"]}-pt-voz.wav -filter_complex "{fc}" -map "[o]" -ar {SR} -ac 2 {TMP}/{s["id"]}-pt-pre.wav')
    saida=OUT/f"{s['id']}-pt.wav"; loud(TMP/f"{s['id']}-pt-pre.wav",saida)
    rel={'grupos':[{'pt':p,'en':e,'inicio_s':round(st,2),'dur_s':round(len(v)/SR,2),'atraso_s':round(st-alvo,2)} for (p,e),(v,alvo),st in zip(grupos,pedacos,pos)],
         'fala_pt_fim_s':round(t,2),'fala_en_fim_s':s['palavras'][-1]['e'],'aceleracao':round(r,4)}
    return saida,rel

PREP={}
if __name__=='__main__':
    ids=sys.argv[4:] or [s['id'] for s in S]
    # narração PT preparada igual ao faixa_pt_br.py (pontas sem silêncio, -16 LUFS): mesmos tempos da faixa PT-BR do EP02
    for b in {GRUPOS[k][0] for k in ids}:
        f=TMP/f'{b}.prep.wav'
        if not f.exists(): run(f'ffmpeg -y -v error -i "{EP/"audio"/"pt-br"/(b+".mp3")}" -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11" -ar {SR} -ac 1 "{f}"')
        PREP[b]=f
    rel={}
    for s in S:
        if s['id'] not in ids: continue
        fe,g0=en(s); fp,r=pt(s)
        rel[s['id']]={'en':medir(fe),'pt':medir(fp),'ganho_cama_fim':g0,'pt_encaixe':r,'dur':s['dur']}
        print(s['id'],'EN',rel[s['id']]['en'],'PT',rel[s['id']]['pt'],'acel',r['aceleracao'],'fim PT',r['fala_pt_fim_s'],'fim EN',r['fala_en_fim_s'])
    json.dump(rel,open(OUT/'relatorio-audio.json','w'),indent=1,ensure_ascii=False)
