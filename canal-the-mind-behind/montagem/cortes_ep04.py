# EP04 · cortes S1–S4 (07/11/2026): abertura nova + trechos do áudio do longo (emendas em fim de frase) + CTA novo, em EN e PT-BR.
# Gera, por corte: <saida>/<id>-en.wav e <id>-pt.wav (mesma duração, -14 LUFS), e montagem/ep03-cortes.json (Remotion, ShortOriginal).
# Uso: python cortes_ep03.py <episodio> <pasta-de-som> <saida>
import json, re, sys, subprocess as sp
from pathlib import Path
EP=Path(sys.argv[1]); SOM=Path(sys.argv[2]); OUT=Path(sys.argv[3]); OUT.mkdir(parents=True,exist_ok=True)
TR=json.load(open(EP/'montagem'/'transcricao-palavras.json',encoding='utf-8'))
TC=json.load(open(EP/'montagem'/'transc-cortes.json',encoding='utf-8'))
CEN=json.load(open(EP/'imagens'/'cortes'/'cenas.json',encoding='utf-8'))
tmp=Path('/tmp/cortes4'); tmp.mkdir(exist_ok=True)
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
    return max(0,T[i][1]-(0.2 if a.startswith('McGregor') else 0.02)), T[j][2]+0.25, [(t[3],t[1],t[2]) for t in T[i:j+1]]
FIX={'McGregor':'MacGregor',"McGregor's":"MacGregor's","Jefferson's":"Jephson's",'Merry':'Mary'}
C={
'S1':dict(nome='S1-the-detail-invented-in-1883',gancho='THE WARM TEA WAS\u00a0FAKE',destaque='',trilha=('Stats - The Grey Room _ Density & Time.mp3',20),
  en=[('03-parte-2','in June','scarcely cold',0),('03-parte-2','The warm meal was born','after the fact',0),('03-parte-2','Then in January','Statement',0),('03-parte-2','The writer was','Conan Doyle',0),('03-parte-2','and he wrote that the boats','party found',0)],
  pt=[('pt-br/03-parte-2.mp3','em junho','mal tinha esfriado',0),('pt-br/03-parte-2.mp3','A refeição quente','década depois',0),('pt-br/03-parte-2.mp3','Aí em janeiro','companônimo',0),('pt-br/03-parte-2.mp3','O autor era','Conan Doyle',0),('pt-br/03-parte-2.mp3','e escreveu que os botes','abordagem encontrou',0)],
  cart=[('in June',[['LOS ANGELES TIMES'],['JUNE 1883']]),('The dinner',[['"SCARCELY COLD"']]),('The writer was',[['CONAN DOYLE, 24']]),('and he wrote',[['FICTION.','vermelho']])],
  sfx=[('in June',0,'impressora-jornal-s3406.mp3',-12,5),('His name was',1.2,'830184__silverillusionist__dramatic-sting-sudden-realization.wav',-6,6.5)],
  troca={}),
'S2':dict(nome='S2-they-left-a-floating-ship',gancho='WHY LEAVE A SHIP THAT\u00a0FLOATS?',destaque='',trilha=('Restless Heart - Jimena Contreras.mp3',0),
  en=[('02-parte-1','There was food',"ship's papers",0),('02-parte-1',"And the ship's only",'was missing',0),('05-parte-4',"McGregor's theory",'clogged the pumps',0),('05-parte-4',"If the pumps didn't work",'finally in sight',0),('05-parte-4','A sensible decision','bad information',0)],
  pt=[('pt-br/02-parte-1.mp3','Havia comida','tinham sumido',0),('pt-br/02-parte-1.mp3','E o único bote','estava lá',0),('pt-br/05-parte-4.mp3','A teoria de McGregor','bomba desmontada',0),('pt-br/05-parte-4.mp3','Sem bomba','estava a vista',0),('pt-br/05-parte-4.mp3','Uma decisão sensata','informação ruim',0)],
  cart=[('There was food',[['6 MONTHS OF FOOD']]),("And the ship's only",[['NO LIFEBOAT','vermelho']]),('theory is that coal',[['PUMPS CLOGGED?']]),('His wife',[['WIFE + DAUGHTER'],['ON BOARD']])],
  sfx=[("And the ship's only",0,'corda-grande-s3426.mp3',-12,4)],
  troca={}),
'S3':dict(nome='S3-false-facts-from-stories',gancho='FALSE FACTS FROM\u00a0STORIES',destaque='',trilha=('Rotator - The Grey Room _ Density & Time.mp3',30),
  en=[('04-parte-3','They gave people','from the stories',0),('04-parte-3','Reading the stories','made it worse',0),('04-parte-3','In 2006','barely helped',0),('07-parte-6','The picture stays','falls off',0)],
  pt=[('pt-br/04-parte-3.mp3','Eles deram contos','erros dos contos',0),('pt-br/04-parte-3.mp3','Ler de novo','piorou',0),('pt-br/04-parte-3.mp3','Em 2006','não ajudou',0),('pt-br/07-parte-6.mp3','A imagem fica','cai',0)],
  cart=[('They gave people',[['MARSH ET AL., 2003']]),('In 2006',[['WARNED.'],['STILL FOOLED.','vermelho']])],
  sfx=[('They gave people',0.5,'lapis-s0221.mp3',-16,3)],
  troca={}),
'S4':dict(nome='S4-the-ship-that-survived',gancho='THE SHIP\u00a0SURVIVED. THEY DIDN\'T.',destaque='',trilha=('Through The Gates Of Hell - Blue Deer Studio.mp3',0),
  en=[('05-parte-4',"And here's the part",'insurance fraud',0),('05-parte-4','The ship survived','seen again',0)],
  pt=[('pt-br/05-parte-4.mp3','E aqui está','fraude de seguro',0),('pt-br/05-parte-4.mp3','O navio sobreviveu','foram vistas',0)],
  cart=[('With nobody aboard',[['~400 MILES'],['NO CREW']]),('After the inquiry',[['13 MORE YEARS']]),('In 1885',[['HAITI, 1885']])],
  sfx=[('The ship they were afraid',0.5,'639307__silverillusionist__cinematic-hit-2.wav',-6,5.25),('With nobody aboard',0,'ondas-gaivotas-s0267.mp3',-16,10)],
  troca={}),
}
CTA_TELA=['FULL CASE.','TAP THE RELATED VIDEO']
FALAS_EN=dict(l.split('|',1) for l in '''S1-abertura|In 1883, a newspaper faked one detail of the Mary Celeste. You still believe it.
S1-cta|The real Mary Celeste is sadder than the legend. Do you still believe it? The full case is on the channel.
S2-abertura|You'd never abandon a floating ship with your family. In 1872, a captain did.
S2-cta|What happened next is the full case on the channel. Would you have left that floating ship?
S3-abertura|In 2003, three scientists proved you learn false facts from stories. You won't believe how.
S3-cta|That's how the Mary Celeste got its warm tea. The full case is on the channel. What false fact did you learn from stories?
S4-abertura|You won't believe what happened to the ship ten people abandoned in 1872.
S4-cta|Why ten people left a ship that floated is the full case on the channel.'''.split('\n'))
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
        if lim and p['w'] in ('T','K','T-K') and lim[-1]['w'] in ('BTK','B'): lim[-1]['e']=p['e']; lim[-1]['w']='BTK'; continue
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
    novo=[x for cc in lista for x in partir(cc)]
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
    res.append({'id':k,'nome':c['nome'],'gancho':c['gancho'],'destaque':c['destaque'],'dur':D,'pasta':'ep04-cortes','cenas':novo,'cartoes':car,'palavras':pal,'cta':CTA_TELA})
    print(k,c['nome'],'dur',D,'| PT trechos em',rel,'fim PT',round(fimpt,1),'| cenas',[(x['src'][-5:],round(x['fim']-x['ini'],1)) for x in novo])
json.dump(res,open(EP/'montagem'/'ep04-cortes.json','w',encoding='utf-8'),indent=1,ensure_ascii=False)
