# EP06 · cortes S1–S4 (08/11/2026; copiado do EP05, regra nova: até 30 s, gancho ≥ 80): abertura nova + trechos do áudio do longo (emendas em fim de frase) + CTA novo, em EN e PT-BR.
# Gera, por corte: <saida>/<id>-en.wav e <id>-pt.wav (mesma duração, -14 LUFS), e montagem/ep03-cortes.json (Remotion, ShortOriginal).
# Uso: python cortes_ep03.py <episodio> <pasta-de-som> <saida>
import json, re, sys, subprocess as sp
from pathlib import Path
EP=Path(sys.argv[1]); SOM=Path(sys.argv[2]); OUT=Path(sys.argv[3]); OUT.mkdir(parents=True,exist_ok=True)
TR=json.load(open(EP/'montagem'/'transcricao-palavras.json',encoding='utf-8'))
TC=json.load(open(EP/'montagem'/'transc-cortes.json',encoding='utf-8'))
CEN=json.load(open(EP/'imagens'/'cortes'/'cenas.json',encoding='utf-8'))
tmp=Path('/tmp/cortes6'); tmp.mkdir(exist_ok=True)
def run(c): sp.run(c,shell=True,check=True)
def dur(f): return float(sp.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(f)]))
def nrm(w): return re.sub(r"[^\w%']","",w.lower())
def toks(ws):
    out=[]
    for w,s,e in ws:
        for p in re.split(r'[\s\-–—]+',w):
            if nrm(p): out.append((nrm(p),s,e,p))
    return out
def seq(T,frase,depois=-1):
    q=[nrm(x) for x in re.split(r'[\s\-]+',frase) if nrm(x)]
    for i in range(len(T)-len(q)+1):
        if T[i][1]>depois and [t[0] for t in T[i:i+len(q)]]==q: return i,i+len(q)-1
    raise SystemExit(f'não achei: "{frase}"')
def trecho(ws,a,z):  # (início, fim, palavras) entre a frase a (início) e a frase z (fim)
    T=toks(ws); i,_=seq(T,a); _,j=seq(T,z,T[i][1]-0.01)
    return max(0,T[i][1]-0.02), T[j][2]+0.25, [(t[3],t[1],t[2]) for t in T[i:j+1]]
FIX={'Cofield':'Coffield','DiPaolo':'DePaulo','Himmick':'Himick','tick':'tic','Neighbours':'Neighbors','neighbour':'neighbor'}
C={
'S1':dict(nome='S1-the-killer-passed',gancho='THE KILLER\u00a0PASSED',destaque='',trilha=('Stake Out - Alex Jones _ Xander Jones.mp3',0),
  en=[('03-parte-2','He was given a polygraph','killing for years',0),('03-parte-2','The nervous innocent failed','killer passed',0)],
  pt=[('pt-br/03-parte-2.mp3','Ele também fez','matando por anos',0),('pt-br/03-parte-2.mp3','O inocente nervoso','assassino calmo passou',0)],
  cart=[('He was given a polygraph',[['MAY 1984']]),('The nervous innocent failed',[['THE KILLER · PASSED','vermelho']])],
  sfx=[('Lie detector',0.2,'lapis-2-s3233.mp3',-12,4),('He was given a polygraph',-0.3,'639307__silverillusionist__cinematic-hit-2.wav',-8,3)],
  troca={}),
'S2':dict(nome='S2-54-percent',gancho='YOU CAN\'T SPOT A\u00a0LIAR',destaque='',trilha=('Rotator - The Grey Room _ Density & Time.mp3',30),
  en=[('05-parte-4','The answer was','gets you 50',0),('05-parte-4','Foster loud nervous','relaxed',0)],
  pt=[('pt-br/05-parte-4.mp3','Resposta','dá 50%',0),('pt-br/05-parte-4.mp3','Foster barulhento','tranquilo',0)],
  cart=[('The answer was',[['24,483 JUDGES · 54%']]),('Foster',[['WHO SEEMS HONEST?','vermelho']])],
  sfx=[('54%',0,'moedas-s0193.mp3',-14,1.5)],
  troca={}),
'S3':dict(nome='S3-the-gauze-that-waited',gancho='14 YEARS IN A\u00a0FREEZER',destaque='',trilha=('Through The Gates Of Hell - Blue Deer Studio.mp3',0),
  en=[('06-parte-5','they had him chew','his saliva',0),('06-parte-5','so the sample went','it waited',0),('06-parte-5','compared DNA','It matched',0)],
  pt=[('pt-br/06-parte-5.mp3','pediram que ele','colher saliva',0),('pt-br/06-parte-5.mp3','A amostra foi','E esperou',0),('pt-br/06-parte-5.mp3','comparou o DNA','Bateu',0)],
  cart=[('they had him chew',[['APRIL 1987']]),('compared DNA',[['2001 · MATCH','vermelho']])],
  sfx=[('they had him chew',0.5,'freezer-fechando-s0446.mp3',-14,4),('compared DNA',0,'bips-teclado-s0758.mp3',-20,3)],
  troca={}),
'S4':dict(nome='S4-his-wife-never-suspected',gancho='NOBODY\u00a0SUSPECTED',destaque='',trilha=('Restless Heart - Jimena Contreras.mp3',40),
  en=[('05-parte-4','Neighbours described him','little odd',0),('05-parte-4','His third wife','suspected anything',0),('05-parte-4','He sometimes showed','harmless',0)],
  pt=[('pt-br/05-parte-4.mp3','Vizinhos o achavam','meio esquisito',0),('pt-br/05-parte-4.mp3','A terceira esposa','de nada',0),('pt-br/05-parte-4.mp3','Às vezes mostrava','inofensivo',0)],
  cart=[('He sometimes showed',[['A PHOTO OF HIS SON']])],
  sfx=[('He sometimes showed',0,'chuva-parabrisa-s1295.mp3',-20,8)],
  troca={}),
}
CTA_TELA=['FULL CASE.','TAP THE RELATED VIDEO']
FALAS_EN=dict(l.split('|',1) for l in '''S1-abertura|Lie detector, 1984. You'd trust it. The killer passed.
S1-cta|The innocent man failed. Full case on the channel.
S2-abertura|54%. You'd catch a liar that often. You'd barely beat a coin.
S2-cta|That's how he stayed free. Full case on the channel.
S3-abertura|1987. Police had his DNA. You'd arrest him. Nobody could.
S3-cta|14 years later. Full case on the channel.
S4-abertura|His wife never suspected. You wouldn't either. He killed 49 women.
S4-cta|He looked like someone you'd believe. Full case on the channel.'''.split('\n'))
def legenda(texto,ws,t0):  # palavras do texto aprovado com os tempos da transcrição (proporcional se a contagem não bate)
    tx=texto.split(); 
    if not ws: return []
    if len(tx)==len(ws): return [{'w':w,'s':round(t0+a[1],2),'e':round(t0+a[2],2)} for w,a in zip(tx,ws)]
    s0,s1=ws[0][1],ws[-1][2]; n=len(tx); L=[len(w)+2 for w in tx]; tot=sum(L); out=[]; c=s0
    for w,l in zip(tx,L): d=(s1-s0)*l/tot; out.append({'w':w,'s':round(t0+c,2),'e':round(t0+c+d,2)}); c+=d
    return out
def prep(src,ss,to,dst):
    run(f'ffmpeg -y -v error -ss {ss:.3f} -to {to:.3f} -i "{src}" -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.03,afade=t=out:st={max(0,to-ss-0.06):.3f}:d=0.06" -ar 48000 -ac 1 "{dst}"')
def soma(lista,D,saida,canais=1):
    ins=''.join(f' -i "{f}"' for f,_ in lista)
    fc=''.join(f'[{i}:a]adelay={int(s*1000)}|{int(s*1000)},apad[p{i}];' for i,(f,s) in enumerate(lista))
    fc+=''.join(f'[p{i}]' for i in range(len(lista)))+f'amix=inputs={len(lista)}:normalize=0,atrim=0:{D}[o]'
    run(f'ffmpeg -y -v error{ins} -filter_complex "{fc}" -map "[o]" -ar 48000 -ac {canais} "{saida}"')
def master(voz,cama,fx,saida,D):
    run(f'ffmpeg -y -v error -i "{cama}" -i "{fx}" -i "{voz}" -filter_complex "[2:a]aformat=channel_layouts=stereo,asplit[v][sc];[0:a][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=450[m];[m][1:a][v]amix=inputs=3:normalize=0,atrim=0:{D}[o]" -map "[o]" -ar 48000 -ac 2 {tmp}/pre.wav')
    m=sp.run(f'ffmpeg -hide_banner -i {tmp}/pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -',shell=True,capture_output=True,text=True).stderr
    j=json.loads(re.findall(r'\{[^{}]*\}',m)[-1])
    af=(f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    run(f'ffmpeg -y -v error -i {tmp}/pre.wav -af "{af},afade=t=out:st={D-0.8:.2f}:d=0.8" -ar 48000 -ac 2 "{saida}"')
res=[]
for k,c in C.items():
    # ---- EN ----
    ab=EP/'audio'/'cortes-en'/f'{k}-abertura.mp3'; cta=EP/'audio'/'cortes-en'/f'{k}-cta.mp3'
    wa=TC[f'cortes-en/{k}-abertura.mp3']['words']; wc=TC[f'cortes-en/{k}-cta.mp3']['words']
    t=0.15; partes=[]; pal=[]
    f=tmp/f'{k}-ab.wav'; prep(ab,0,dur(ab),f); da=dur(f); partes.append((f,t)); pal+=legenda(FALAS_EN[f'{k}-abertura'],wa,t); t+=wa[-1][2]+0.45
    seg_ini=[]
    for n,(b,a,z,pausa) in enumerate(c['en']):
        s0,s1,ws=trecho(TR[b]['words'],a,z); f=tmp/f'{k}-en{n}.wav'; prep(EP/'audio'/f'{b}.mp3',s0,s1,f)
        partes.append((f,t)); seg_ini.append(t)
        pal+=[{'w':(w.replace(w.strip('.,?!"'),FIX[w.strip('.,?!"')]) if w.strip('.,?!"') in FIX else w),'s':round(t+ss-s0,2),'e':round(t+ee-s0,2)} for w,ss,ee in ws]
        t+=s1-s0+0.32+pausa
    t+=0.25; t_cta=t; f=tmp/f'{k}-cta.wav'; prep(cta,0,dur(cta),f); partes.append((f,t)); pal+=legenda(FALAS_EN[f'{k}-cta'],wc,t)
    fim_fala=t+wc[-1][2]
    # ---- PT: abertura em 0, cada trecho no início do trecho inglês correspondente, CTA no início do CTA inglês ----
    abp=EP/'audio'/'cortes-pt'/f'{k}-abertura.mp3'; ctap=EP/'audio'/'cortes-pt'/f'{k}-cta.mp3'
    pp=[]; f=tmp/f'{k}-abp.wav'; prep(abp,0,dur(abp),f); pp.append((f,0.15)); pos=0.15+dur(f)+0.25
    rel=[]
    for n,(arq3,a,z,pausa) in enumerate(c['pt']):
        s0,s1,_=trecho(TC[arq3]['words'],a,z); f=tmp/f'{k}-pt{n}.wav'; prep(EP/'audio'/arq3,s0,s1,f)
        ini=max(seg_ini[n] if n<len(seg_ini) else pos, pos); pp.append((f,ini)); pos=ini+(s1-s0)+0.3+pausa; rel.append(round(ini,2))
    ini=max(t_cta,pos); f=tmp/f'{k}-ctap.wav'; prep(ctap,0,dur(ctap),f); pp.append((f,ini)); fimpt=ini+dur(f)
    D=round(max(fim_fala,fimpt)+1.9,2)
    # junta B-T-K
    lim=[]; 
    for p in pal:
        if lim and p['w'].startswith('%') and lim[-1]['w'].isdigit(): lim[-1]['e']=p['e']; lim[-1]['w']+=p['w']; continue
        lim.append(p)
    pal=lim
    soma(partes,D,tmp/f'{k}-voz-en.wav')
    # cama: trilha única do corte em -30 LUFS, sobe nos 1,5 s finais
    arq,desde=c['trilha']
    run(f'ffmpeg -y -v error -ss {desde} -i "{SOM/"musica"/arq}" -t {D} -af "aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I=-29:TP=-6:LRA=11,afade=t=in:d=0.6,volume=\'1+1.0*gte(t,{fim_fala+0.2:.2f})\':eval=frame" -ar 48000 {tmp}/{k}-cama.wav')
    def tw(fr):  # tempo de uma frase na legenda do corte
        q=[nrm(x) for x in fr.split() if nrm(x)]
        for i in range(len(pal)-len(q)+1):
            if [nrm(p['w']) for p in pal[i:i+len(q)]]==q: return pal[i]['s']
        raise SystemExit(f'{k}: frase da tela não achada: {fr}')
    fx=[]
    for n,(fr,off,arq2,db,mx) in enumerate(c['sfx']):
        f=tmp/f'{k}-fx{n}.wav'; L=min(mx,dur(SOM/'sfx'/arq2))
        run(f'ffmpeg -y -v error -i "{SOM/"sfx"/arq2}" -t {L:.2f} -af "aformat=sample_rates=48000:channel_layouts=stereo,loudnorm=I={-22+db}:TP=-3,afade=t=out:st={max(0,L-0.4):.2f}:d=0.4" -ar 48000 "{f}"')
        fx.append((f,max(0,tw(fr)+off)))
    if not fx: fx=[(tmp/f'{k}-cama.wav',D+1)]
    soma(fx,D,tmp/f'{k}-fx.wav',2)
    master(tmp/f'{k}-voz-en.wav',tmp/f'{k}-cama.wav',tmp/f'{k}-fx.wav',OUT/f'{k}-en.wav',D)
    soma(pp,D,tmp/f'{k}-voz-pt.wav')
    master(tmp/f'{k}-voz-pt.wav',tmp/f'{k}-cama.wav',tmp/f'{k}-fx.wav',OUT/f'{k}-pt.wav',D)
    # ---- cenas e cartões ----
    lista=[]
    for cc in CEN[k]:
        cc=dict(cc); cc['src']=c['troca'].get(cc['src'],cc['src']); fr=c['troca'].get(cc['frase'],cc['frase'])
        cc['ini']=0 if not lista else max(0,tw(fr)-0.12); lista.append(cc)
    for n in range(len(lista)): lista[n]['fim']=lista[n+1]['ini'] if n<len(lista)-1 else D
    def partir(cc):
        if cc['fim']-cc['ini']>5.2:
            meio=(cc['ini']+cc['fim'])/2; cand=[p['e'] for p in pal if cc['ini']+1.8<p['e']<cc['fim']-1.8]
            if cand:
                corte=min(cand,key=lambda e:abs(e-meio)); a=dict(cc); b=dict(cc); a['fim']=round(corte+0.05,2); b['ini']=a['fim']
                b.update(mov='parado',escala=[max(cc['escala']),max(cc['escala'])],corte=True); return partir(a)+partir(b)
        return [cc]
    novo=lista if c.get('uma_imagem') else [x for cc in lista for x in partir(cc)]
    for cc in novo: cc['escala']=[max(1.06,x) for x in cc['escala']]; cc.pop('frase',None)
    car=[]
    for fr,linhas in c['cart']:
        ini=tw(fr)-0.05; car.append({'ini':round(ini,2),'linhas':[{'t':l[0],'cor':(l[1] if len(l)>1 else 'papel')} for l in linhas]})
    if 'citacao' in c:
        fr,off,linhas=c['citacao']; ini=tw(fr)+off; car.append({'ini':round(ini,2),'fim':round(tw(fr)-0.1,2),'linhas':[{'t':l[0],'cor':(l[1] if len(l)>1 else 'papel')} for l in linhas]})
    car.sort(key=lambda x:x['ini'])
    for n,x in enumerate(car):
        nxt=car[n+1]['ini'] if n<len(car)-1 else t_cta
        x['fim']=round(min(x.get('fim',99),x['ini']+3.2,nxt),2)
    res.append({'id':k,'nome':c['nome'],'gancho':c['gancho'],'destaque':c['destaque'],'dur':D,'pasta':'ep06-cortes','cenas':novo,'cartoes':car,'palavras':pal,'cta':CTA_TELA})
    print(k,c['nome'],'dur',D,'| PT trechos em',rel,'fim PT',round(fimpt,1),'| cenas',[(x['src'][-5:],round(x['fim']-x['ini'],1)) for x in novo])
json.dump(res,open(EP/'montagem'/'ep06-cortes.json','w',encoding='utf-8'),indent=1,ensure_ascii=False)
